const common = require("../common/common");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("myDemo.db");

/**
 * Retrieves user information from the database by username.
 */
const getTransactions = (username) => {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM transactions WHERE username = ? ORDER BY transaction_date DESC",
      [common.removeInvalidChar(username)],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          rows.forEach((row) => {
            row.amount = row.amount;
            row.transaction_date = common.formatDate(row.transaction_date);
          });
          resolve(rows);
        }
      }
    );
  });
};

/**
 * Append a new transaction to the database.
 * 
 * @param {string} username
 * @param {decimal} amount
 * @param {string} transaction_type
 * @param {string} transaction_direction
 * @param {string} description
 * @returns {Promise}
 **/
const appendTransaction = (username, amount, transaction_type, transaction_direction, description) => {
    return new Promise((resolve, reject) => {
      db.run("INSERT INTO transactions (username, amount, transaction_type, transaction_direction, description) VALUES (?,?,?,?,?)", 
      [username, amount, transaction, transaction_direction, description],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }); 
}

module.exports = {
  getTransactions,
  appendTransaction
};
