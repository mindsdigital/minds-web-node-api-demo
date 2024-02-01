const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR").format(date);
};


const formatCurrency = (amount) => {
    const formattedAmount = amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    return formattedAmount;
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
    removeInvalidChar
};