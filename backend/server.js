/**
 * server.js
 *
 * Local development backend (Express). For production deployment this
 * logic is mirrored in netlify/functions/ — see searchHandler.js which
 * both share.
 */

const express = require("express");
const cors = require("cors");
const retailersConfig = require("./retailers.json");
const { handleSearch } = require("./searchHandler");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/retailers", (req, res) => {
  res.json(retailersConfig.map(({ id, name, enabled }) => ({ id, name, enabled })));
});

app.get("/api/search", async (req, res) => {
  const { q, postcode } = req.query;
  try {
    const { status, body } = await handleSearch(q, postcode);
    res.status(status).json(body);
  } catch (error) {
    // Belt-and-braces: even an unexpected error here must not crash the
    // process, and must still return something usable to the frontend.
    res.status(500).json({
      error: "Unexpected server error.",
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`PWAU Price Compare backend running at http://localhost:${PORT}`);
});
