const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Load root .env file

const pool = new Pool({
  user: process.env.DB_USER || 'ashokraj',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'rule_engine_db',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Setup database tables if not existing
const initDb = async () => {
  const client = await pool.connect();
  try {
    console.log('PostgreSQL connection pool initialized.');

    // Rules table
    await client.query(`
      CREATE TABLE IF NOT EXISTS rules (
        id SERIAL PRIMARY KEY,
        rule_id VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        team VARCHAR(255),
        terms JSONB,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Glossary table
    await client.query(`
      CREATE TABLE IF NOT EXISTS glossary (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        entity VARCHAR(255) NOT NULL,
        description TEXT,
        datasource VARCHAR(100) NOT NULL,
        business_key VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (name, entity)
      );
    `);

    // Seed default glossary if empty
    const countRes = await client.query('SELECT COUNT(*) FROM glossary');
    if (parseInt(countRes.rows[0].count) === 0) {
      console.log('Seeding default glossary parameters...');
      
      const seeds = [
        // Session source parameters
        ['device_id', 'str', 'session', 'Unique identifier of user device', 'session', null],
        ['ip_address', 'str', 'session', 'Request IP address', 'session', null],
        ['channel', 'str', 'session', 'Interaction channel (WEB, MOBILE)', 'session', null],
        ['authenticated', 'bool', 'session', 'True if user authentication succeeded', 'session', null],
        
        // Database source parameters
        ['age', 'int', 'customer', 'Customer age in years', 'database', 'customerID'],
        ['country', 'str', 'customer', 'Country of residence', 'database', 'customerID'],
        ['tier', 'str', 'customer', 'Customer loyalty tier (GOLD, VIP)', 'database', 'customerID'],
        ['balance', 'num', 'account', 'Active ledger account balance', 'database', 'accountID'],
        
        // API source parameters
        ['verification_status', 'str', 'kyc_service', 'KYC compliance verification status', 'api', null],
        ['risk_score', 'num', 'fraud_check', 'External credit score result', 'api', null],

        // Rule Metadata (rules that can be used in other rules)
        ['rule_fraud_prevention_alpha', 'bool', 'rulemetadata', 'Sub-rule checking high-risk flags', 'rulemetadata', null],
        ['rule_vip_loyalty_eligibility', 'bool', 'rulemetadata', 'Sub-rule checking VIP qualification', 'rulemetadata', null]
      ];

      for (const s of seeds) {
        await client.query(
          `INSERT INTO glossary (name, type, entity, description, datasource, business_key)
           VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING`,
          s
        );
      }
      console.log('Successfully seeded default glossary.');
    }

    console.log('PostgreSQL schema migration completed successfully.');
  } catch (err) {
    console.error('Error migrating PostgreSQL schema:', err.message);
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  initDb
};
