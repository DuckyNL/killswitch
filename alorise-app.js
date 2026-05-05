(function () {
  "use strict";

  window.ALORISE_APP_INIT = function (config) {
    config = config || {};
    const assets = config.assets || {};

    function pad(value) {
      return String(value).padStart(2, "0");
    }

    function initCountdown(root) {
      if (!root || root.__aloriseCountdownStarted) return;
      root.__aloriseCountdownStarted = true;

      const dateValue = root.dataset.launchDate;
      const target = new Date(dateValue).getTime();

      const timer = root.querySelector("[data-countdown-timer]");
      const done = root.querySelector("[data-countdown-done]");
      const daysEl = root.querySelector("[data-days]");
      const hoursEl = root.querySelector("[data-hours]");
      const minutesEl = root.querySelector("[data-minutes]");
      const secondsEl = root.querySelector("[data-seconds]");

      if (!target || Number.isNaN(target)) {
        console.error("Invalid countdown date:", dateValue);
        return;
      }

      if (!timer || !done || !daysEl || !hoursEl || !minutesEl || !secondsEl) {
        console.error("Countdown markup is incomplete.");
        return;
      }

      let interval = null;

      function update() {
        const distance = target - Date.now();

        if (distance <= 0) {
          timer.hidden = true;
          done.hidden = false;

          if (interval) {
            clearInterval(interval);
          }

          return;
        }

        daysEl.textContent = pad(Math.floor(distance / (1000 * 60 * 60 * 24)));
        hoursEl.textContent = pad(Math.floor((distance / (1000 * 60 * 60)) % 24));
        minutesEl.textContent = pad(Math.floor((distance / (1000 * 60)) % 60));
        secondsEl.textContent = pad(Math.floor((distance / 1000) % 60));
      }

      update();
      interval = window.setInterval(update, 1000);
    }

    function startBlossoms(layer) {
      if (window.__ALORISE_BLOSSOMS_STARTED__) return;
      window.__ALORISE_BLOSSOMS_STARTED__ = true;

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reducedMotion) return;

      const requiredAssets = [
        "petal",
        "petalTwo",
        "petalBlurred",
        "flower",
        "flowerGlow"
      ];

      const missingAssets = requiredAssets.filter(function (key) {
        return !assets[key];
      });

      if (missingAssets.length) {
        console.error("Missing Alorise assets:", missingAssets.join(", "));
        return;
      }

      const isMobile = window.matchMedia("(max-width: 749px)").matches;

      const settings = {
        maxItems: isMobile ? 14 : 34,
        spawnEvery: isMobile ? 520 : 260,
        initialBurst: isMobile ? 9 : 22,
        flowerChance: 0.12,
        glowFlowerChance: 0.018,
        blurredChance: 0.16
      };

      let active = 0;
      let spawnInterval = null;

      function random(min, max) {
        return Math.random() * (max - min) + min;
      }

      function randomInt(min, max) {
        return Math.floor(random(min, max + 1));
      }

      function chooseAsset() {
        const roll = Math.random();

        if (roll < settings.glowFlowerChance) {
          return { src: assets.flowerGlow, type: "flowerGlow" };
        }

        if (roll < settings.flowerChance) {
          return { src: assets.flower, type: "flower" };
        }

        if (roll < settings.flowerChance + settings.blurredChance) {
          return { src: assets.petalBlurred, type: "blurred" };
        }

        return {
          src: Math.random() > 0.5 ? assets.petal : assets.petalTwo,
          type: "petal"
        };
      }

      function sizing(type) {
        if (type === "flowerGlow") {
          return {
            size: isMobile ? random(28, 46) : random(38, 72),
            opacity: random(0.28, 0.5),
            blur: random(0, 0.45),
            glow: random(0.18, 0.34),
            duration: random(13, 21)
          };
        }

        if (type === "flower") {
          return {
            size: isMobile ? random(22, 38) : random(28, 56),
            opacity: random(0.34, 0.62),
            blur: random(0, 0.6),
            glow: random(0.12, 0.25),
            duration: random(12, 19)
          };
        }

        if (type === "blurred") {
          return {
            size: isMobile ? random(15, 28) : random(18, 38),
            opacity: random(0.18, 0.38),
            blur: random(1.1, 2.5),
            glow: random(0.04, 0.12),
            duration: random(10, 17)
          };
        }

        return {
          size: isMobile ? random(13, 26) : random(15, 34),
          opacity: random(0.34, 0.76),
          blur: random(0, 0.75),
          glow: random(0.08, 0.18),
          duration: random(8, 15)
        };
      }

      function createBlossom() {
        if (!document.body.contains(layer)) {
          if (spawnInterval) {
            clearInterval(spawnInterval);
          }

          window.__ALORISE_BLOSSOMS_STARTED__ = false;
          return;
        }

        if (active >= settings.maxItems) return;

        const chosen = chooseAsset();
        const s = sizing(chosen.type);

        const item = document.createElement("div");
        const img = document.createElement("img");

        img.src = chosen.src;
        img.alt = "";
        img.loading = "lazy";
        img.decoding = "async";

        const startX = random(-80, window.innerWidth + 80);
        const direction = Math.random() > 0.5 ? 1 : -1;
        const wind = isMobile ? random(60, 150) : random(110, 300);

        item.className = "alorise-fall-item";
        item.style.setProperty("--size", s.size + "px");
        item.style.setProperty("--duration", s.duration + "s");
        item.style.setProperty("--delay", random(0, 0.18) + "s");
        item.style.setProperty("--start-x", startX + "px");
        item.style.setProperty("--opacity", s.opacity);
        item.style.setProperty("--blur", s.blur + "px");
        item.style.setProperty("--glow", s.glow);
        item.style.setProperty("--scale", random(0.72, 1.2));
        item.style.setProperty("--flutter", random(1.8, 4.6) + "s");

        item.style.setProperty("--x1", direction * random(30, wind) + "px");
        item.style.setProperty("--x2", direction * random(-40, wind * 1.15) + "px");
        item.style.setProperty("--x3", direction * random(50, wind * 1.35) + "px");
        item.style.setProperty("--x4", direction * random(80, wind * 1.6) + "px");

        item.style.setProperty("--r0", randomInt(-80, 80) + "deg");
        item.style.setProperty("--r1", randomInt(80, 180) + "deg");
        item.style.setProperty("--r2", randomInt(160, 340) + "deg");
        item.style.setProperty("--r3", randomInt(260, 520) + "deg");
        item.style.setProperty("--r4", randomInt(420, 780) + "deg");

        item.appendChild(img);
        layer.appendChild(item);
        active++;

        item.addEventListener("animationend", function () {
          item.remove();
          active--;
        }, { once: true });
      }

      function burst() {
        for (let i = 0; i < settings.initialBurst; i++) {
          window.setTimeout(createBlossom, i * random(45, 95));
        }
      }

      window.setTimeout(burst, 450);
      spawnInterval = window.setInterval(createBlossom, settings.spawnEvery);
    }

    function boot() {
      document.querySelectorAll(".alorise-hero-inner").forEach(initCountdown);

      const layer = document.getElementById("alorise-fall-layer");

      if (!layer) {
        return false;
      }

      startBlossoms(layer);
      return true;
    }

    if (window.__ALORISE_APP_STARTED__) {
      boot();
      return;
    }

    window.__ALORISE_APP_STARTED__ = true;

    if (boot()) return;

    let attempts = 0;
    const maxAttempts = 40;

    const retry = window.setInterval(function () {
      attempts++;

      if (boot() || attempts >= maxAttempts) {
        window.clearInterval(retry);

        if (attempts >= maxAttempts) {
          console.error("Alorise app could not find #alorise-fall-layer.");
        }
      }
    }, 100);
  };
})();
