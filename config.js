"use strict";

const goalCents = Number(process.env.CAMPAIGN_GOAL_CENTS || 50000);
const raisedCents = Number(process.env.CAMPAIGN_RAISED_CENTS || 12800);

module.exports = {
  port: Number(process.env.PORT || 3847),
  cashAppHandle: (process.env.CASHAPP_HANDLE || "eatinpaincakes").replace(/^\$/, ""),
  stripePublishableKey:
    process.env.STRIPE_PUBLISHABLE_KEY || "pk_test_REPLACE_ME",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  campaign: {
    goalCents: Number.isFinite(goalCents) ? goalCents : 50000,
    raisedCents: Number.isFinite(raisedCents) ? raisedCents : 12800,
    sample: !process.env.CAMPAIGN_RAISED_CENTS,
  },
  presetAmountsCents: [500, 1000, 2500, 5000, 10000],
  siteUrl: process.env.SITE_URL || "https://eatinpaincakes.com",
};
