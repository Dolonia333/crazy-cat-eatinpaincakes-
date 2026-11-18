(() => {
  const money = (cents) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
    }).format(cents / 100);

  // Demo campaign totals — sample only until live payments are wired later.
  const campaign = {
    raisedCents: 12800,
    goalCents: 50000,
    cashAppHandle: "eatinpaincakes",
  };

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

  const pct =
    campaign.goalCents > 0
      ? Math.min(100, (campaign.raisedCents / campaign.goalCents) * 100)
      : 0;

  if (raisedLabel) raisedLabel.textContent = money(campaign.raisedCents);
  if (goalLabel) goalLabel.textContent = money(campaign.goalCents);
  if (progressFill) progressFill.style.width = `${pct}%`;
  if (progressBar) progressBar.setAttribute("aria-valuenow", String(Math.round(pct)));
  if (progressNote) {
    progressNote.textContent = `${pct.toFixed(1)}% funded — demo sample totals`;
  }

  const handle = campaign.cashAppHandle.replace(/^\$/, "");
  if (cashAppLink) {
    cashAppLink.href = `https://cash.app/$${handle}`;
    cashAppLink.textContent = `Pay with Cash App $${handle}`;
  }

  if (stripeBtn) {
    stripeBtn.addEventListener("click", () => {
      if (!selectedCents || selectedCents < 100) {
        setStatus("Pick at least $1.");
        return;
      }
      setStatus(
        `Demo mode — Stripe isn’t live yet. You’re previewing ${money(selectedCents)}. Use Cash App below, or come back when payments are wired.`
      );
      if (thanksLine) thanksLine.hidden = false;
    });
  }

  if (new URLSearchParams(window.location.search).get("donated") === "1" && thanksLine) {
    thanksLine.hidden = false;
  }

  syncGiving();
})();
