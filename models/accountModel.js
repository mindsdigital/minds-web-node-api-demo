const common = require("../common/common");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("myDemo.db");

/**
 * Retrieves user information from the database by username.
 */
const getTransactions = (username) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM transactions WHERE username = ? ORDER BY transaction_date DESC LIMIT 15",
      [common.removeInvalidChar(username)],
      (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve({
            ...row,
            amount: common.formatCurrency(row.amount),
            transaction_date: common.formatDate(row.transaction_date),
          });
        } else {
          reject(new Error("Sem transações para esse usuário"));
        }
      }
    );
  });
};

module.exports = {
  getTransactions,
};
