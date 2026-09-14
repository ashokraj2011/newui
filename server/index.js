const path = require('path');
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { pool, initDb } = require('./db');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 65421;

app.use(cors());
app.use(express.json());

// Initialize database connection and schemas
initDb();

// 1. Generate Rule Name using LLM (Gemini) with descriptive offline fallback
app.post('/api/generate-name', async (req, res) => {
  const { terms, operator } = req.body;

  if (!terms || !Array.isArray(terms)) {
    return res.status(400).json({ error: 'Terms array is required.' });
  }

  // Define offline fallback summary builder
  const buildOfflineSummary = (termsList, op) => {
    if (termsList.length === 0) return 'New Rule Draft';
    const summaries = termsList.map(t => {
      if (t.field && t.operator && t.value) {
        return `${t.field} ${t.operator} ${t.value}`;
      } else if (t.conditions && Array.isArray(t.conditions)) {
        return `(${t.conditions.map(c => `${c.field} ${c.operator} ${c.value}`).join(` ${t.type || 'AND'} `)})`;
      }
      return 'condition';
    });
    const connector = ` ${op || 'AND'} `;
    let finalSummary = summaries.join(connector);
    if (finalSummary.length > 50) {
      finalSummary = finalSummary.slice(0, 47) + '...';
    }
    return finalSummary;
  };

  const offlineName = buildOfflineSummary(terms, operator);

  const prompt = `You are an expert AI copywriter for Apple. Generate a concise, clear, and professional title (maximum 6 words, e.g. "High Spend US Transactions" or "VIP Loyalty Discount") summarizing the logical rule conditions provided below. Avoid formatting, markdown, quotes or symbols. Just return the pure text.

Conditions:
Operator: ${operator || 'AND'}
Terms:
${JSON.stringify(terms, null, 2)}`;

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    console.log('Gemini API Key placeholder detected. Using offline name generator fallback.');
    return res.json({ name: offlineName });
  }

  try {
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const cleanName = response.text().trim().replace(/['"]/g, '');
    res.json({ name: cleanName || offlineName });
  } catch (err) {
    console.error('LLM name generation failed, falling back to offline generator:', err.message);
    res.json({ name: offlineName });
  }
});

// 2. Rules CRUD Operations
app.get('/api/rules', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rules ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching rules:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rules', async (req, res) => {
  const { rule_id, name, description, team, terms, is_active } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO rules (rule_id, name, description, team, terms, is_active, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
       ON CONFLICT (rule_id) 
       DO UPDATE SET name = $2, description = $3, team = $4, terms = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [rule_id, name, description, team, JSON.stringify(terms), is_active !== false]
    );

    // Automatically upsert saved rule as a "rulemetadata" source attribute in the glossary
    try {
      await pool.query(
        `INSERT INTO glossary (name, type, entity, description, datasource, business_key)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (name, entity) 
         DO UPDATE SET description = $4, datasource = $5
         RETURNING *`,
        [rule_id, 'bool', 'rulemetadata', `Rule reference to evaluate sub-rule logic: ${name}.`, 'rulemetadata', null]
      );
    } catch (gErr) {
      console.error('Failed to automatically register rule inside glossary:', gErr.message);
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error inserting rule:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/rules/:rule_id', async (req, res) => {
  const { rule_id } = req.params;
  const { name, description, team, terms, is_active } = req.body;
  try {
    const result = await pool.query(
      `UPDATE rules 
       SET name = $1, description = $2, team = $3, terms = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP
       WHERE rule_id = $6
       RETURNING *`,
      [name, description, team, JSON.stringify(terms), is_active !== false, rule_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rule not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating rule:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/rules/:rule_id', async (req, res) => {
  const { rule_id } = req.params;
  try {
    const result = await pool.query('DELETE FROM rules WHERE rule_id = $1 RETURNING *', [rule_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rule not found' });
    }
    res.json({ message: 'Rule deleted successfully', deletedRule: result.rows[0] });
  } catch (err) {
    console.error('Error deleting rule:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 3. Glossary CRUD Operations
app.get('/api/glossary', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM glossary ORDER BY entity ASC, name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching glossary:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/glossary', async (req, res) => {
  const { name, type, entity, description, datasource, business_key } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO glossary (name, type, entity, description, datasource, business_key)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (name, entity) 
       DO UPDATE SET type = $2, description = $4, datasource = $5, business_key = $6
       RETURNING *`,
      [name, type, entity, description, datasource, business_key || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error inserting glossary field:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/glossary/:entity/:name', async (req, res) => {
  const { entity, name } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM glossary WHERE entity = $1 AND name = $2 RETURNING *',
      [entity, name]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Glossary entry not found' });
    }
    res.json({ message: 'Glossary entry deleted successfully', deletedEntry: result.rows[0] });
  } catch (err) {
    console.error('Error deleting glossary entry:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Root check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

app.listen(PORT, () => {
  console.log(`Express API Server listening on port ${PORT}`);
});
