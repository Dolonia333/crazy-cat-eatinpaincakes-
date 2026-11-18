"use strict";

const path = require("path");
const express = require("express");

const app = express();
const publicDir = path.join(__dirname, "public");
const port = Number(process.env.PORT || 3847);

// Demo hub: only ship the public front-end. Server source stays off the web.
app.use(
  express.static(publicDir, {
    index: "index.html",
    fallthrough: true,
    dotfiles: "deny",
  })
);

app.get("*", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`eatinpaincakes demo hub on http://127.0.0.1:${port}`);
});
