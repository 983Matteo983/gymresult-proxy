const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

app.get("/live", async (req, res) => {
  const { gara, categoria="*", attrezzo="*", turno="*" } = req.query;
  if (!gara) return res.status(400).json({ error: "Parametro gara obbligatorio" });
  try {
    const body = new URLSearchParams({ sezione:"AF", fase:"", regione:"", gara, attrezzo, categoria, turno }).toString();
    const response = await fetch("https://www.gymresult.it/live.gr.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": "https://www.gymresult.it/live/",
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/143.0.0.0 Safari/537.36",
        "Origin": "https://www.gymresult.it"
      },
      body
    });
    if (!response.ok) return res.status(502).json({ error: `GymResult ${response.status}` });
    const data = await response.json();
    const html = data.cat || data.spe || "";
    res.json({ titolo: data.int || "", gara, timestamp: new Date().toISOString(), html_length: html.length, _raw_keys: Object.keys(data) });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/raw", async (req, res) => {
  const { gara="28831" } = req.query;
  const body = new URLSearchParams({ sezione:"AF", fase:"", regione:"", gara, attrezzo:"*", categoria:"*", turno:"*" }).toString();
  try {
    const response = await fetch("https://www.gymresult.it/live.gr.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": "https://www.gymresult.it/live/",
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/143.0.0.0 Safari/537.36",
        "Origin": "https://www.gymresult.it"
      },
      body
    });
    const text = await response.text();
    try { res.json(JSON.parse(text)); } catch { res.type("text").send(text); }
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "GymResult Proxy GAF 2026" });
});

app.listen(PORT, () => console.log(`Proxy in ascolto su porta ${PORT}`));
