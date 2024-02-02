const jwt = require('jsonwebtoken');

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR").format(date);
};


const formatCurrency = (amount) => {
    const formattedAmount = amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    return formattedAmount;
}

const isAuthenticated = (req, res, next) => {
  const token = req.cookies && req.cookies.jwt;

  if (token) {
      try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          req.user = decoded;
          next();
      } catch (error) {
          res.redirect('/login?error=invalid_token');
      }
  } else {
      res.redirect('/login?error=missing_token');
  }
}

/**
 * Cleans the username by removing all non-alphanumeric characters.
 * This ensures only valid characters remain for lookup in the database.
 */
const removeInvalidChar = (unsafeString) => {
    return unsafeString.toString().replace(/[^a-zA-Z0-9]+/g, "");
  }

module.exports = {
    formatDate,
    formatCurrency, 
    removeInvalidChar, 
    isAuthenticated
};