require("dotenv").config();

const { neon } = require("@neondatabase/serverless");

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

const sql = neon(
    "postgresql://neondb_owner:D5Co6WEdhUjQ@ep-lively-dust-a54ge8jq.us-east-2.aws.neon.tech/neondb?sslmode=require"
);

async function getPgVersion() {
    const result = await sql`SELECT version()`;
    console.log(result[0]);
}

getPgVersion();
