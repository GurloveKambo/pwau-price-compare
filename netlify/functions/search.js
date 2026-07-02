/**
 * netlify/functions/search.js
 *
 * Production search endpoint. Reuses the exact same logic as the local
 * Express server via ../../backend/searchHandler.js so dev and prod
 * behave identically.
 */

const { handleSearch } = require("../../backend/searchHandler");

exports.handler = async (event) => {
  const { q, postcode } = event.queryStringParameters || {};

  try {
    const { status, body } = await handleSearch(q, postcode);
    return {
      statusCode: status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Unexpected server error.", message: error.message }),
    };
  }
};
