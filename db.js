const mysql = require("mysql2");
const path = require("path");

const config = {
  host: "localhost",
  user: "root",
  password: "password",
  database: "surveyappdb",
  port: 3036,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(config);
const promisePool = pool.promise();

function connect() {
  return promisePool
    .query("SELECT 1")
    .then(() => {
      console.log("MySQL Connected");
      return pool;
    })
    .catch((err) => {
      console.error("MySQL connection failed:", err.message || err);
      throw err;
    });
}

function query(sql, params, cb) {
  // Support both callback and promise styles
  if (typeof cb === "function") {
    return pool.query(sql, params, cb);
  }
  return promisePool.query(sql, params);
}

module.exports = { pool, promisePool, connect, query };

/*
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;
*/