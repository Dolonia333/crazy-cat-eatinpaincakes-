(() => {
  const money = (cents) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
    }).format(cents / 100);

  const campaign = {
    raisedCents: 12800,
    goalCents: 50000,
    cashAppHandle: "eatinpaincakes",
  };

  const moods = {
    building: "Mood: building — pancakes in the prompt oven.",
    breaking: "Mood: breaking — oops, cute crash. Try again ♡",
    learning: "Mood: learning — sticky notes & soft chaos.",
  };

  const meows = [
    "nya~ build break learn ♡",
    "mew! more pancakes please",
    "purr… AI crumbs everywhere",
    "mrrp — don’t get OVERCLOCKED",
  ];

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
  const petCat = document.getElementById("pet-cat");
  const catSpeech = document.getElementById("cat-speech");
  const burstLayer = document.getElementById("burst-layer");
  const moodLine = document.getElementById("mood-line");
  const moodChips = Array.from(document.querySelectorAll(".mood-chip"));
  const soonCards = Array.from(document.querySelectorAll(".soon-card"));
  const hintToast = document.getElementById("hint-toast");
  const motifButtons = Array.from(document.querySelectorAll(".motif-btn"));

  let selectedCents = 1000;
  let meowIndex = 0;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    btn.addEventListener("click", () => {
      selectPreset(Number(btn.dataset.cents));
      spawnBurst(btn, "♡");
    });
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
        `Demo mode — Stripe isn’t live yet. You’re previewing ${money(selectedCents)} for Paincakes. Use Cash App below, or come back when payments are wired.`
      );
      if (thanksLine) thanksLine.hidden = false;
      spawnBurst(stripeBtn, "♡");
      spawnBurst(stripeBtn, "✨");
    });
  }

  function spawnBurst(anchor, glyph) {
    if (!burstLayer || reduceMotion) return;
    const rect = anchor.getBoundingClientRect();
    const bit = document.createElement("span");
    bit.className = "burst-bit";
    bit.textContent = glyph;
    bit.style.left = `${rect.left + rect.width / 2 + (Math.random() * 40 - 20)}px`;
    bit.style.top = `${rect.top + rect.height / 2}px`;
    burstLayer.appendChild(bit);
    window.setTimeout(() => bit.remove(), 950);
  }

  if (petCat) {
    petCat.addEventListener("click", () => {
      petCat.classList.remove("is-pet");
      // restart animation
      void petCat.offsetWidth;
      petCat.classList.add("is-pet");
      if (catSpeech) {
        catSpeech.hidden = false;
        catSpeech.textContent = meows[meowIndex % meows.length];
        meowIndex += 1;
        window.setTimeout(() => {
          catSpeech.hidden = true;
        }, 1600);
      }
      spawnBurst(petCat, "♡");
      spawnBurst(petCat, "✨");
    });
  }

  moodChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      moodChips.forEach((c) => c.classList.remove("is-on"));
      chip.classList.add("is-on");
      const mood = chip.dataset.mood || "building";
      if (moodLine) moodLine.textContent = moods[mood] || moods.building;
      spawnBurst(chip, mood === "breaking" ? "💥" : mood === "learning" ? "✨" : "🥞");
    });
  });

  soonCards.forEach((card) => {
    card.addEventListener("click", () => {
      const hint = card.dataset.hint || "Secret hint loading…";
      if (hintToast) {
        hintToast.hidden = false;
        hintToast.textContent = `Secret hint: ${hint}`;
      }
      spawnBurst(card, "✨");
    });
  });

  motifButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const kind = btn.dataset.burst || "heart";
      const glyph = kind === "star" ? "✦" : kind === "pancake" ? "🥞" : "♡";
      spawnBurst(btn, glyph);
    });
  });

  // Soft scroll reveals
  const reveals = Array.from(document.querySelectorAll(".reveal"));
  if (reduceMotion) {
    reveals.forEach((el) => el.classList.add("is-in"));
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  if (new URLSearchParams(window.location.search).get("donated") === "1" && thanksLine) {
    thanksLine.hidden = false;
  }

  syncGiving();
})();
