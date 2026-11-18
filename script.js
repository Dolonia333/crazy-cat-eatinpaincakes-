(() => {
  const money = (cents) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
    }).format(cents / 100);

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const raisedLabel = document.getElementById("raised-label");
  const goalLabel = document.getElementById("goal-label");
  const progressFill = document.getElementById("progress-fill");
  const progressBar = document.getElementById("progress-bar");
  const progressNote = document.getElementById("progress-note");
  const givingLabel = document.getElementById("giving-label");
  const customAmount = document.getElementById("custom-amount");
  const amountButtons = Array.from(document.querySelectorAll(".amount-btn"));
  const stripeBtn = document.getElementById("stripe-donate");
  const cashAppLink = document.getElementById("cashapp-link");
  const statusLine = document.getElementById("donate-status");
  const thanksLine = document.getElementById("thanks-line");

  let selectedCents = 1000;
  let stripeConfigured = false;

  const setStatus = (msg) => {
    if (statusLine) statusLine.textContent = msg || "";
  };

  const syncGiving = () => {
    if (givingLabel) givingLabel.textContent = money(selectedCents);
  };

  const selectPreset = (cents) => {
    selectedCents = cents;
    amountButtons.forEach((btn) => {
      btn.classList.toggle("is-selected", Number(btn.dataset.cents) === cents);
    });
    if (customAmount) customAmount.value = "";
    syncGiving();
  };

  amountButtons.forEach((btn) => {
    btn.addEventListener("click", () => selectPreset(Number(btn.dataset.cents)));
  });

  if (customAmount) {
    customAmount.addEventListener("input", () => {
      const dollars = Number(customAmount.value);
      if (!Number.isFinite(dollars) || dollars <= 0) return;
      selectedCents = Math.round(dollars * 100);
      amountButtons.forEach((btn) => btn.classList.remove("is-selected"));
      syncGiving();
    });
  }

  const applyCampaign = (data) => {
    const raised = Number(data.raisedCents) || 0;
    const goal = Number(data.goalCents) || 50000;
    const pct = Number(data.percent);
    const safePct = Number.isFinite(pct) ? pct : goal ? (raised / goal) * 100 : 0;

    if (raisedLabel) raisedLabel.textContent = money(raised);
    if (goalLabel) goalLabel.textContent = money(goal);
    if (progressFill) progressFill.style.width = `${Math.min(100, safePct)}%`;
    if (progressBar) progressBar.setAttribute("aria-valuenow", String(Math.round(safePct)));
    if (progressNote) {
      progressNote.textContent = data.sample
        ? `${safePct.toFixed(1)}% funded — sample totals until you wire live numbers`
        : `${safePct.toFixed(1)}% funded`;
    }

    const handle = (data.cashAppHandle || "eatinpaincakes").replace(/^\$/, "");
    if (cashAppLink) {
      cashAppLink.href = `https://cash.app/$${handle}`;
      cashAppLink.textContent = `Pay with Cash App $${handle}`;
    }

    stripeConfigured = Boolean(data.stripeConfigured);
  };

  const loadCampaign = async () => {
    try {
      const res = await fetch("/api/campaign", { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("campaign_failed");
      applyCampaign(await res.json());
    } catch {
      applyCampaign({
        raisedCents: 12800,
        goalCents: 50000,
        percent: 25.6,
        sample: true,
        cashAppHandle: "eatinpaincakes",
        stripeConfigured: false,
      });
    }
  };

  if (stripeBtn) {
    stripeBtn.addEventListener("click", async () => {
      if (!selectedCents || selectedCents < 100) {
        setStatus("Pick at least $1.");
        return;
      }

      stripeBtn.disabled = true;
      setStatus(stripeConfigured ? "Opening Stripe Checkout…" : "Checking Stripe…");

      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ amountCents: selectedCents }),
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setStatus(data.error || "Checkout unavailable right now.");
          return;
        }

        if (data.url) {
          window.location.href = data.url;
          return;
        }

        setStatus("Checkout session missing a URL.");
      } catch {
        setStatus("Could not reach checkout. Try Cash App instead.");
      } finally {
        stripeBtn.disabled = false;
      }
    });
  }

  if (new URLSearchParams(window.location.search).get("donated") === "1" && thanksLine) {
    thanksLine.hidden = false;
  }

  syncGiving();
  loadCampaign();
})();
