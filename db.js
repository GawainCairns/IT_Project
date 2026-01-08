const mysql = require("mysql2");
const path = require("path");

const config = {
  host: "localhost",
  user: "root",
  password: "password",
  database: "SurveyAppDB",
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
 my sql connection metadata (for reference)
 {
  "server": "localhost",
  "port": 3306,
  "username": "root",
  "password": "password",
  "database": "SurveyAppDB"
 }
*/