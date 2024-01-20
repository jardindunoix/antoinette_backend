const { Pool } = require( 'pg');

exports.pool_pg = new Pool({
   user: process.env.DB_USER_PG,
   host: process.env.DB_HOST_PG,
   password: process.env.DB_PASSWORD_PG,
   database: process.env.DB_NAME_PG,
});

