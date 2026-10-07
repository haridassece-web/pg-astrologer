// PG Astro - Main Application Bootstrap
// Invocation: பச்சையம்மன் துணை • கங்கையம்மன் துணை

document.addEventListener("DOMContentLoaded", () => {
  console.log("🌟 PG Astro - Raja Nadi Astrology Portal Initializing...");

  // 0. Initialize Auth & Access Control
  if (window.PGAstroAuth) {
    window.PGAstroAuth.init();
  }

  // 1. Initialize Rasi Chart
  if (window.PGAstro && window.PGAstro.chart) {
    window.PGAstro.chart.init();
  }

  // 2. Initialize UI & Event Handlers
  if (window.PGAstroUI) {
    window.PGAstroUI.init();
  }

  // 3. Preset Buttons Click Handlers
  document.querySelectorAll(".preset-pill-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const presetKey = btn.dataset.preset;
      if (presetKey && window.PGAstro && window.PGAstro.chart) {
        window.PGAstro.chart.loadPreset(presetKey);
        window.PGAstroUI.showToast(`மாதிரி ஜாதகம் ஏற்றப்பட்டது: ${btn.textContent}`);
      }
    });
  });

  // 4. Evaluate initial chart
  if (window.PGAstroEngine) {
    window.PGAstroEngine.evaluateCurrentChart();
  }
});
