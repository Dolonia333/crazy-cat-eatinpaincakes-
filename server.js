"use strict";

require("dotenv").config();

const path = require("path");
const express = require("express");
const config = require("./config");

const app = express();
const root = __dirname;

app.use(express.json({ limit: "32kb" }));
app.use(express.static(root, { extensions: ["html"] }));

app.get("/api/campaign", (_req, res) => {
  const { goalCents, raisedCents, sample } = config.campaign;
  const pct = goalCents > 0 ? Math.min(100, (raisedCents / goalCents) * 100) : 0;
  res.json({
    goalCents,
    raisedCents,
    percent: Number(pct.toFixed(1)),
    sample,
    cashAppHandle: config.cashAppHandle,
    stripePublishableKey: config.stripePublishableKey,
    stripeConfigured: Boolean(config.stripeSecretKey),
    presetsCents: config.presetAmountsCents,
  });
});

app.post("/api/checkout", async (req, res) => {
  if (!config.stripeSecretKey) {
    return res.status(503).json({
      error:
        "Stripe is not configured yet. Add STRIPE_SECRET_KEY (and STRIPE_PUBLISHABLE_KEY) in Cursor app secrets, or tip via Cash App meanwhile.",
      demo: true,
    });
  }

  const amountCents = Number(req.body && req.body.amountCents);
  if (!Number.isFinite(amountCents) || amountCents < 100 || amountCents > 1000000) {
    return res.status(400).json({ error: "Pick an amount between $1 and $10,000." });
  }

  try {
    const Stripe = require("stripe");
    const stripe = new Stripe(config.stripeSecretKey);
    const origin =
      (req.get("origin") || req.get("referer") || config.siteUrl || "").replace(/\/$/, "") ||
      config.siteUrl;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      automatic_payment_methods: { enabled: true },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(amountCents),
            product_data: {
              name: "eatinpaincakes tip",
              description: "Keep the pancakes flipping",
            },
          },
        },
      ],
      success_url: `${origin}/?donated=1#donate`,
      cancel_url: `${origin}/#donate`,
    });

    return res.json({ url: session.url, id: session.id });
  } catch (err) {
    console.error("checkout_error", err && err.message ? err.message : err);
    return res.status(500).json({ error: "Could not start Stripe Checkout. Try again or use Cash App." });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(root, "index.html"));
});

app.listen(config.port, "0.0.0.0", () => {
  console.log(`eatinpaincakes hub listening on http://127.0.0.1:${config.port}`);
});
