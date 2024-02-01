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
            row.amount = common.formatCurrency(row.amount);
            row.transaction_date = common.formatDate(row.transaction_date);
          });
          resolve(rows);
        }
      }
    );
  });
};

module.exports = {
  getTransactions,
};
