/**
 * Formats a number as currency by removing non-digit characters,
 * padding with zeros, inserting decimal point, and formatting
 * with Intl.NumberFormat to display as currency.
 */
const mascaraReais = (event) => {
  const onlyDigits = event.target.value
    .split("")
    .filter((s) => /\d/.test(s))
    .join("")
    .padStart(3, "0");
  const digitsFloat = onlyDigits.slice(0, -2) + "." + onlyDigits.slice(-2);
  event.target.value = maskCurrency(digitsFloat);
};

/**
 * Formats a number as currency using Intl.NumberFormat.
 * @param {number} valor - The number to format.
 * @param {string} [locale='pt-BR'] - The locale to use.
 * @param {string} [currency='BRL'] - The currency to use.
 * @returns {string} The formatted currency string.
 */
const maskCurrency = (valor, locale = "pt-BR", currency = "BRL") => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(valor);
};
