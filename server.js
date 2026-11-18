"use strict";

const path = require("path");
const express = require("express");

const app = express();
const publicDir = path.join(__dirname, "public");
const port = Number(process.env.PORT || 3847);

app.get("/", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// Demo hub: only files under public/ are web-accessible.
app.use(
  express.static(publicDir, {
    index: false,
    fallthrough: false,
    dotfiles: "deny",
  })
);

app.use((_req, res) => {
  res.status(404).type("text/plain").send("Not found");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Paincakes demo hub on http://127.0.0.1:${port}`);
});
