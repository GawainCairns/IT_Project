const mysql = require("mysql2");
require("dotenv").config();

const config = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "surveyappdb",
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: Number(process.env.DB_QUEUE_LIMIT) || 0
};

const pool = mysql.createPool(config);
const promisePool = pool.promise();

async function connect() {
  try {
    const conn = await promisePool.getConnection();
    conn.release();
    console.log("MySQL Connected");
    return pool;
  } catch (err) {
    console.error("MySQL connection failed:", err.message || err);
    throw err;
  }
}

function query(sql, params, cb) {
  if (typeof params === "function") {
    cb = params;
    params = undefined;
  }
  if (typeof cb === "function") {
    return pool.query(sql, params, cb);
  }
  return promisePool.query(sql, params);
}

function close() {
  return pool.end();
}

module.exports = { pool, promisePool, connect, query, close };