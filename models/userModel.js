const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('myDemo.db');

/**
 * Retrieves user information from the database by username.
 */
const getUser = (username) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM users_demo WHERE username = ?", [username], (err, row) => {
            if (err) {
                reject(err);
            } else if (row) {
                resolve({
                    username: row.username,
                    document_id: row.document_id,
                    phone_number: row.phone_number,
                    active: row.active,
                    email: row.email,
                    brand: row.brand,
                    profile: row.profile,
                    full_name: row.full_name
                });
            } else {
                reject(new Error("Usuário não encontrado no banco de dados"));
            }
        });
    });
};

/**
 * Add a new user information to the database.
 */
const addUser = (username, document_id, phone_number, active, email, brand, profile, full_name) => {
    let cleanUsername = removeInvalidChar(username);
    let cleanDocumentId = removeInvalidChar(document_id);
    let cleanPhoneNumber = removeInvalidChar(phone_number);
    let cleanEmail = email;
    let cleanBrand = removeInvalidChar(brand);
    let cleanProfile = removeInvalidChar(profile);
    let cleanFullName = removeInvalidChar(full_name);

    return new Promise((resolve, reject) => {
        db.run(
            "INSERT INTO users_demo (username, document_id, phone_number, active, email, brand, profile, full_name) VALUES (?,?,?,?,?,?,?,?)",
            [cleanUsername, cleanDocumentId, cleanPhoneNumber, active, cleanEmail, cleanBrand, cleanProfile, cleanFullName],
            function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            }
        );
    });
};

/**
 * Cleans the username by removing all non-alphanumeric characters.
 * This ensures only valid characters remain for lookup in the database.
 */
function removeInvalidChar(unsafeString) {
  return unsafeString.toString().replace(/[^a-zA-Z0-9]+/g, "");
}

module.exports = {
    addUser,
    getUser
};