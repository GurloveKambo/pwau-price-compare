const retailersConfig = require("../../backend/retailers.json");

exports.handler = async () => {
  const summary = retailersConfig.map(({ id, name, enabled }) => ({ id, name, enabled }));
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(summary),
  };
};
