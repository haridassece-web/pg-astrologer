// PG Astro - South Indian Rasi Chart Controller
// Interactive 12-Rasi Grid, Touch & Mobile Friendly

window.PGAstro = window.PGAstro || {};

(function() {
  // 12 Rasis in South Indian layout order
  const RASIS = [
    { id: 1, name: "மேஷம்", english: "Aries", lord: "செவ்வாய்", cellClass: "cell-aries" },
    { id: 2, name: "ரிஷபம்", english: "Taurus", lord: "சுக்கிரன்", cellClass: "cell-taurus" },
    { id: 3, name: "மிதுனம்", english: "Gemini", lord: "புதன்", cellClass: "cell-gemini" },
    { id: 4, name: "கடகம்", english: "Cancer", lord: "சந்திரன்", cellClass: "cell-cancer" },
    { id: 5, name: "சிம்மம்", english: "Leo", lord: "சூரியன்", cellClass: "cell-leo" },
    { id: 6, name: "கன்னி", english: "Virgo", lord: "புதன்", cellClass: "cell-virgo" },
    { id: 7, name: "துலாம்", english: "Libra", lord: "சுக்கிரன்", cellClass: "cell-libra" },
    { id: 8, name: "விருச்சிகம்", english: "Scorpio", lord: "செவ்வாய்", cellClass: "cell-scorpio" },
    { id: 9, name: "தனுசு", english: "Sagittarius", lord: "குரு", cellClass: "cell-sagittarius" },
    { id: 10, name: "மகரம்", english: "Capricorn", lord: "சனி", cellClass: "cell-capricorn" },
    { id: 11, name: "கும்பம்", english: "Aquarius", lord: "சனி", cellClass: "cell-aquarius" },
    { id: 12, name: "மீனம்", english: "Pisces", lord: "குரு", cellClass: "cell-pisces" }
  ];

  // 9 Navagrahas
  const PLANETS = [
    { name: "சூரியன்", english: "Sun", icon: "☀️", color: "#ef4444" },
    { name: "சந்திரன்", english: "Moon", icon: "🌙", color: "#f8fafc" },
    { name: "செவ்வாய்", english: "Mars", icon: "♂", color: "#dc2626" },
    { name: "புதன்", english: "Mercury", icon: "☿", color: "#10b981" },
    { name: "குரு", english: "Jupiter", icon: "♃", color: "#f5c518" },
    { name: "சுக்கிரன்", english: "Venus", icon: "♀", color: "#ec4899" },
    { name: "சனி", english: "Saturn", icon: "♄", color: "#818cf8" },
    { name: "ராகு", english: "Rahu", icon: "☊", color: "#94a3b8" },
    { name: "கேது", english: "Ketu", icon: "☋", color: "#d97706" }
  ];

  // Chart State: houseId -> array of { planet, degree, isRetrograde, isExalted, isDebilitated, isMarginal }
  let chartState = {};
  RASIS.forEach(r => { chartState[r.id] = []; });
  let lagnaRasiId = null;
  let lagnaDegree = null;
  let showDegrees = true;
  let showGochara = true;
  let todayGocharaData = null;
  let nativeInfo = null;

  // Format decimal degree to standard astrological DMS (Degrees & Minutes)
  function formatDegree(deg, compact = false) {
    if (deg === undefined || deg === null || isNaN(deg)) return "";
    const num = parseFloat(deg);
    const d = Math.floor(num);
    const m = Math.round((num - d) * 60);
    const mPadded = m < 10 ? "0" + m : m;
    if (compact) {
      return `${d}°${m > 0 ? mPadded + "'" : ""}`;
    }
    return `${d}° ${mPadded}'`;
  }

  // Currently selected placement options
  let selectedPlanet = null;
  let activeModifiers = {
    vakkiram: false, // வக்கிரம்
    ucham: false,    // உச்சம்
    neesam: false,   // நீசம்
    vilimbu: false   // விளிம்பு
  };

  const PLANET_SHORT = {
    "சூரியன்": "சூ",
    "சந்திரன்": "சந்",
    "செவ்வாய்": "செவ்",
    "புதன்": "புத",
    "குரு": "குரு",
    "சுக்கிரன்": "சுக்",
    "சனி": "சனி",
    "ராகு": "ராகு",
    "கேது": "கேது"
  };

  function initChart() {
    renderChartGrid();
    renderNavamsaGrid();
    renderPlanetPalette();
    initGocharaEvents();
    loadPreset("preset_wealth"); // load sample wealth preset by default
  }

  function renderChartGrid() {
    const grid = document.getElementById("rasiChartGrid");
    if (!grid) return;
    grid.innerHTML = "";

    // Render cells according to class names
    RASIS.forEach(rasi => {
      const cell = document.createElement("div");
      cell.className = `rasi-cell ${rasi.cellClass}`;
      cell.id = `rasiCell_${rasi.id}`;
      cell.dataset.rasiId = rasi.id;

      cell.innerHTML = `
        <div class="rasi-cell-header">
          <span class="rasi-name">${rasi.name}</span>
          <span class="rasi-lord">${rasi.lord}</span>
        </div>
        <div class="cell-planets" id="cellPlanets_${rasi.id}"></div>
        <div class="cell-gochara" id="cellGochara_${rasi.id}"></div>
      `;

      // Tap to place planet
      cell.addEventListener("click", () => handleCellClick(rasi.id));
      grid.appendChild(cell);
    });

    // Add Central Hub
    const hub = document.createElement("div");
    hub.className = "cell-center-hub";
    hub.innerHTML = `
      <div class="center-title">PG Astrologer</div>
      <div class="center-subtitle" id="centerHubSubtitle">நாடி ஜோதிட மென்பொருள்</div>
      <div class="center-active-stats" id="centerStatsText">கிரகங்கள்: 0/9</div>
      <div class="center-quick-actions">
        <button class="btn btn-sm btn-outline-gold" id="btnAnalyzeChart">பலன் காண்க</button>
        <button class="btn btn-sm btn-secondary" id="btnClearChart">அழி</button>
      </div>
    `;
    grid.appendChild(hub);

    document.getElementById("btnAnalyzeChart")?.addEventListener("click", (e) => {
      e.stopPropagation();
      window.PGAstroEngine && window.PGAstroEngine.evaluateCurrentChart();
    });

    document.getElementById("btnClearChart")?.addEventListener("click", (e) => {
      e.stopPropagation();
      clearChart();
    });
  }

  // Render Compact 4x4 Navamsa Chart Grid
  function renderNavamsaGrid() {
    const grid = document.getElementById("navamsaChartGrid");
    if (!grid) return;
    grid.innerHTML = "";

    RASIS.forEach(rasi => {
      const cell = document.createElement("div");
      cell.className = `navamsa-cell ${rasi.cellClass}`;
      cell.id = `navamsaCell_${rasi.id}`;
      cell.dataset.rasiId = rasi.id;

      cell.innerHTML = `
        <div class="navamsa-cell-header">
          <span class="navamsa-rasi-name">${rasi.name}</span>
          <span class="navamsa-rasi-lord">${rasi.lord}</span>
        </div>
        <div class="navamsa-cell-planets" id="navamsaPlanets_${rasi.id}"></div>
      `;
      grid.appendChild(cell);
    });

    const hub = document.createElement("div");
    hub.className = "navamsa-center-hub";
    hub.innerHTML = `
      <div class="navamsa-hub-title">நவாம்சம்</div>
      <div class="navamsa-hub-sub">D-9 சக்கரம்</div>
    `;
    grid.appendChild(hub);
  }

  // Calculate Navamsa (D9) Positions for Lagna and all placed planets
  // Classical formula: 3°20' (3.333333°) per navamsa sign
  function calculateNavamsaPositions() {
    const navamsaMap = {};
    for (let i = 1; i <= 12; i++) navamsaMap[i] = [];
    let navLagnaId = null;

    if (lagnaRasiId && lagnaDegree !== null) {
      const totalLon = (lagnaRasiId - 1) * 30 + parseFloat(lagnaDegree);
      navLagnaId = (Math.floor(totalLon / (10 / 3)) % 12) + 1;
    }

    for (let rid in chartState) {
      const list = chartState[rid] || [];
      const rNum = parseInt(rid);
      list.forEach(item => {
        const deg = (item.degree !== undefined && item.degree !== null) ? parseFloat(item.degree) : 15.0;
        const totalLon = (rNum - 1) * 30 + deg;
        const navSignId = (Math.floor(totalLon / (10 / 3)) % 12) + 1;
        navamsaMap[navSignId].push({
          planet: item.planet,
          isRetrograde: !!item.isRetrograde,
          isExalted: !!item.isExalted,
          isDebilitated: !!item.isDebilitated,
          isMarginal: !!item.isMarginal
        });
      });
    }

    return { navamsaMap, navLagnaId };
  }

  function updateNavamsaCells() {
    const { navamsaMap, navLagnaId } = calculateNavamsaPositions();
    RASIS.forEach(r => {
      const container = document.getElementById(`navamsaPlanets_${r.id}`);
      if (!container) return;
      container.innerHTML = "";

      if (navLagnaId === r.id) {
        const lChip = document.createElement("span");
        lChip.className = "navamsa-chip chip-lagna";
        lChip.textContent = "ல";
        lChip.title = "நவாம்ச லக்கினம் (D9 Lagna)";
        container.appendChild(lChip);
      }

      const pList = navamsaMap[r.id] || [];
      pList.forEach(p => {
        const pChip = document.createElement("span");
        pChip.className = `navamsa-chip tag-${p.planet}`;
        const short = PLANET_SHORT[p.planet] || p.planet;
        pChip.textContent = `${short}${p.isRetrograde ? '(வ)' : ''}`;
        pChip.title = `${p.planet}${p.isRetrograde ? ' (வக்கிரம்)' : ''} - நவாம்சத்தில்`;
        container.appendChild(pChip);
      });
    });
  }

  // Today's Gochara calculation & display
  function getTodayGochara() {
    if (todayGocharaData) return todayGocharaData;
    try {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const todayStr = `${y}-${m}-${d}`;
      if (window.PGAstro && window.PGAstro.astronomy && window.PGAstro.astronomy.calculateSiderealPlanets) {
        const transits = window.PGAstro.astronomy.calculateSiderealPlanets(todayStr, "12:00");
        if (transits && transits.planets) {
          const byRasi = {};
          for (let i = 1; i <= 12; i++) byRasi[i] = [];
          transits.planets.forEach(p => {
            if (byRasi[p.rasiId]) {
              byRasi[p.rasiId].push({
                planet: p.planet,
                degInSign: p.degInSign,
                isRetrograde: p.isRetrograde
              });
            }
          });
          todayGocharaData = { todayStr, byRasi, planets: transits.planets };
        }
      }
    } catch (err) {
      console.error("Gochara calculation error:", err);
    }
    return todayGocharaData;
  }

  function updateCellGochara(rasiId) {
    const container = document.getElementById(`cellGochara_${rasiId}`);
    if (!container) return;
    container.innerHTML = "";
    if (!showGochara) return;

    const gData = getTodayGochara();
    if (!gData || !gData.byRasi[rasiId] || gData.byRasi[rasiId].length === 0) return;

    const planetsInSign = gData.byRasi[rasiId];
    const strip = document.createElement("div");
    strip.className = "gochara-cell-strip";
    strip.title = `இன்றைய கோச்சாரம் (${gData.todayStr}) - ${planetsInSign.map(p => p.planet + (p.isRetrograde ? ' (வ)' : '')).join(', ')}`;

    const tag = document.createElement("span");
    tag.className = "gochara-pill-tag";
    tag.textContent = "கோ:";
    strip.appendChild(tag);

    planetsInSign.forEach(p => {
      const pSpan = document.createElement("span");
      pSpan.className = "gochara-planet-item";
      const abbr = PLANET_SHORT[p.planet] || p.planet;
      pSpan.textContent = `${abbr}${p.isRetrograde ? '(வ)' : ''}`;
      strip.appendChild(pSpan);
    });

    container.appendChild(strip);
  }

  function initGocharaEvents() {
    const gocharaToggle = document.getElementById("toggleShowGocharaInChart");
    gocharaToggle?.addEventListener("change", (e) => {
      showGochara = e.target.checked;
      RASIS.forEach(r => updateCellGochara(r.id));
    });
  }

  function renderPlanetPalette() {
    const container = document.getElementById("planetChipsGrid");
    if (!container) return;
    container.innerHTML = "";

    PLANETS.forEach(p => {
      const btn = document.createElement("button");
      btn.className = "planet-source-btn";
      btn.dataset.planet = p.name;
      btn.innerHTML = `
        <span class="p-icon" style="color: ${p.color}">${p.icon}</span>
        <span>${p.name}</span>
      `;

      btn.addEventListener("click", () => {
        // Toggle selection
        if (selectedPlanet === p.name) {
          selectedPlanet = null;
          btn.classList.remove("selected");
        } else {
          document.querySelectorAll(".planet-source-btn").forEach(b => b.classList.remove("selected"));
          selectedPlanet = p.name;
          btn.classList.add("selected");
        }
      });

      container.appendChild(btn);
    });

    // Modifiers toggles
    document.querySelectorAll(".mod-toggle-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const mod = btn.dataset.mod;
        activeModifiers[mod] = !activeModifiers[mod];
        btn.classList.toggle("active", activeModifiers[mod]);
      });
    });

    // Degree slider and input sync
    const degSlider = document.getElementById("planetDegreeSlider");
    const degInput = document.getElementById("planetDegreeInput");
    const degDisplay = document.getElementById("activeDegreeDisplay");

    function updateDegUI(val) {
      const num = Math.min(29.99, Math.max(0, parseFloat(val) || 0));
      if (degSlider && parseFloat(degSlider.value) !== num) degSlider.value = num;
      if (degInput && parseFloat(degInput.value) !== num) degInput.value = num.toFixed(1);
      if (degDisplay) degDisplay.textContent = formatDegree(num);

      // Auto-toggle marginal button if near boundary (0°-2.5° or 27.5°-30°)
      const isEdge = (num <= 2.5 || num >= 27.5);
      const vilimbuBtn = document.querySelector(".mod-toggle-btn[data-mod='vilimbu']");
      if (vilimbuBtn && !activeModifiers.vilimbu && isEdge) {
        vilimbuBtn.classList.add("active");
      } else if (vilimbuBtn && !activeModifiers.vilimbu && !isEdge) {
        vilimbuBtn.classList.remove("active");
      }
    }

    degSlider?.addEventListener("input", (e) => updateDegUI(e.target.value));
    degInput?.addEventListener("input", (e) => updateDegUI(e.target.value));

    // Quick degree preset buttons
    document.querySelectorAll(".btn-deg-quick").forEach(btn => {
      btn.addEventListener("click", () => {
        const d = btn.dataset.deg;
        if (d !== undefined) updateDegUI(d);
      });
    });

    // Toggle degree visibility in chart
    const degToggle = document.getElementById("toggleShowDegreesInChart");
    degToggle?.addEventListener("change", (e) => {
      showDegrees = e.target.checked;
      updateAllCells();
    });
  }

  function handleCellClick(rasiId) {
    if (!selectedPlanet) {
      // If no planet selected, highlight trines & oppositions of this house
      highlightTrinesAndOppositions(rasiId);
      return;
    }

    // Check if planet is already in some house, remove it first (1 planet exists in 1 house)
    for (let id in chartState) {
      chartState[id] = chartState[id].filter(item => item.planet !== selectedPlanet);
    }

    // Read current degree from UI (default 15.0°)
    let degVal = 15.0;
    const degInput = document.getElementById("planetDegreeInput");
    if (degInput && degInput.value !== "") {
      degVal = Math.min(29.99, Math.max(0, parseFloat(degInput.value)));
    }

    // Auto-detect marginal (விளிம்பு) if <= 2.5° or >= 27.5°
    const isMarginal = activeModifiers.vilimbu || (degVal <= 2.5 || degVal >= 27.5);

    // Add planet to target house
    chartState[rasiId].push({
      planet: selectedPlanet,
      degree: degVal,
      isRetrograde: activeModifiers.vakkiram,
      isExalted: activeModifiers.ucham,
      isDebilitated: activeModifiers.neesam,
      isMarginal: isMarginal
    });

    // Re-render
    updateCellPlanetsDisplay(rasiId);
    updateAllCells();
    updateCenterStats();

    // Trigger auto-analysis
    if (window.PGAstroEngine) {
      window.PGAstroEngine.evaluateCurrentChart();
    }
  }

  function updateCellPlanetsDisplay(rasiId) {
    const container = document.getElementById(`cellPlanets_${rasiId}`);
    if (!container) return;
    container.innerHTML = "";

    // If Lagna is in this rasi, show Lagna badge first with degree
    if (lagnaRasiId === rasiId) {
      const lagnaChip = document.createElement("span");
      lagnaChip.className = "chart-planet-chip chip-lagna";
      lagnaChip.style.background = "linear-gradient(135deg, #ffd700 0%, #d4af37 100%)";
      lagnaChip.style.color = "#0b0f1d";
      lagnaChip.style.fontWeight = "800";
      
      const degHtml = (showDegrees && lagnaDegree !== null) 
        ? `<span class="chip-degree">${formatDegree(lagnaDegree, true)}</span>` 
        : "";

      lagnaChip.title = `லக்கினம் (Ascendant)${lagnaDegree !== null ? ': ' + formatDegree(lagnaDegree) : ''}`;
      lagnaChip.innerHTML = `<span>ல</span> ${degHtml}`;
      container.appendChild(lagnaChip);
    }

    const list = chartState[rasiId] || [];
    list.forEach(item => {
      const chip = document.createElement("span");
      chip.className = `chart-planet-chip tag-${item.planet}`;
      
      let badgesHtml = "";
      if (item.isRetrograde) badgesHtml += `<span class="chip-status-badge badge-vakkiram" title="வக்கிரம்">வ</span>`;
      if (item.isExalted) badgesHtml += `<span class="chip-status-badge badge-ucham" title="உச்சம்">உ</span>`;
      if (item.isDebilitated) badgesHtml += `<span class="chip-status-badge badge-neesam" title="நீசம்">நீ</span>`;
      if (item.isMarginal) badgesHtml += `<span class="chip-status-badge badge-vilimbu" title="விளிம்பு">வி</span>`;

      const degHtml = (showDegrees && item.degree !== undefined && item.degree !== null)
        ? `<span class="chip-degree">${formatDegree(item.degree, true)}</span>`
        : "";

      chip.title = `${item.planet}${item.degree !== undefined ? ': ' + formatDegree(item.degree) : ''} (நீக்க கிளிக் செய்க)`;
      chip.innerHTML = `<span class="chip-pname">${item.planet}</span> ${degHtml} ${badgesHtml}`;

      // Clicking placed chip removes it or allows edit
      chip.addEventListener("click", (e) => {
        e.stopPropagation();
        removePlanetFromChart(item.planet);
      });

      container.appendChild(chip);
    });
  }

  function updateAllCells() {
    RASIS.forEach(r => {
      updateCellPlanetsDisplay(r.id);
      updateCellGochara(r.id);
    });
    renderDegreesTable();
    renderPanchangamOverviewCard();
    updateNavamsaCells();
  }

  function removePlanetFromChart(planetName) {
    for (let id in chartState) {
      chartState[id] = chartState[id].filter(item => item.planet !== planetName);
    }
    updateAllCells();
    updateCenterStats();
    if (window.PGAstroEngine) {
      window.PGAstroEngine.evaluateCurrentChart();
    }
  }

  function clearChart() {
    RASIS.forEach(r => { chartState[r.id] = []; });
    lagnaRasiId = null;
    lagnaDegree = null;
    nativeInfo = null;
    window.PGAstro.lastCalculatedHoroscope = null;
    updateAllCells();
    updateCenterStats();
    clearHighlights();
    if (window.PGAstroEngine) {
      window.PGAstroEngine.evaluateCurrentChart();
    }
  }

  function updateCenterStats() {
    let count = 0;
    for (let id in chartState) {
      count += chartState[id].length;
    }
    const statEl = document.getElementById("centerStatsText");
    if (!statEl) return;

    const lagnaRasi = RASIS.find(r => r.id === lagnaRasiId)?.name || "";
    const lagnaStr = lagnaRasi ? `<div style="font-size:0.68rem; color:#93c5fd; margin-top:2px;">லக்கினம்: <strong>${lagnaRasi} ${lagnaDegree !== null ? formatDegree(lagnaDegree) : ''}</strong></div>` : "";

    if (nativeInfo && nativeInfo.name) {
      statEl.innerHTML = `
        <div style="font-weight:700; color:#fff; font-size:0.84rem;">${nativeInfo.name}</div>
        <div style="font-size:0.68rem; color:var(--gold-light); margin-top:1px;">
          ${nativeInfo.dob} | ${nativeInfo.time || ""} • ${nativeInfo.place || ""}
        </div>
        ${lagnaStr}
      `;
    } else {
      statEl.innerHTML = `
        <div>கிரகங்கள்: ${count}/9</div>
        ${lagnaStr}
      `;
    }
  }

  function highlightTrinesAndOppositions(rasiId) {
    clearHighlights();
    // 1-5-9 trines: (id), (id+4), (id+8) modulo 12
    const trine1 = rasiId;
    const trine2 = ((rasiId - 1 + 4) % 12) + 1;
    const trine3 = ((rasiId - 1 + 8) % 12) + 1;
    // 1-7 opposition: (id+6) modulo 12
    const opp = ((rasiId - 1 + 6) % 12) + 1;

    [trine1, trine2, trine3].forEach(id => {
      document.getElementById(`rasiCell_${id}`)?.classList.add("trine-highlight");
    });
    document.getElementById(`rasiCell_${opp}`)?.classList.add("active-selected");
  }

  function clearHighlights() {
    document.querySelectorAll(".rasi-cell").forEach(c => {
      c.classList.remove("trine-highlight", "active-selected");
    });
  }

  function highlightRasi(rasiId) {
    if (!rasiId) return;
    clearHighlights();
    const el = document.getElementById(`rasiCell_${rasiId}`);
    if (el) {
      el.classList.add("active-selected");
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  // Auspicious Birth Panchangam & Age Overview Renderer (1st Page Master Profile)
  function renderPanchangamOverviewCard() {
    const container = document.getElementById("panchangamOverviewCard");
    if (!container) return;

    // 1. Native Info
    const nInfo = nativeInfo || {};
    const nName = nInfo.name || document.getElementById("birthCalcName")?.value.trim() || "அன்பர் (Native)";
    const nGenderVal = nInfo.gender || document.getElementById("birthCalcGender")?.value || "male";
    const nGender = nGenderVal === "female" ? "பெண்" : (nGenderVal === "other" ? "மற்றவை" : "ஆண்");
    const nDob = nInfo.dob || document.getElementById("birthCalcDate")?.value || "1988-04-30";
    const nTime = nInfo.time || document.getElementById("birthCalcTime")?.value || "22:10";
    let nPlace = nInfo.place || document.getElementById("birthCalcPlaceCustom")?.value.trim() || "";
    if (!nPlace) {
      const pSel = document.getElementById("birthCalcPlaceSelect");
      if (pSel && pSel.value && window.PGAstro?.astronomy?.CITIES[pSel.value]) {
        nPlace = window.PGAstro.astronomy.CITIES[pSel.value].name;
      } else {
        nPlace = "திருவண்ணாமலை (Tiruvannamalai)";
      }
    }

    // 2. Exact Age based on Date of Birth
    const ageInfo = window.PGAstro?.astronomy?.calculateAge(nDob, nTime) || {
      years: 0,
      months: 0,
      days: 0,
      runningYear: 1,
      formattedText: "கணிக்கப்படவில்லை"
    };

    // 3. Find placed Sun, Moon, Lagna and other planets in chartState
    let sunPlaced = null, sunRasiId = null;
    let moonPlaced = null, moonRasiId = null;
    const placedPlanetsForKarakas = [];

    for (let rid in chartState) {
      const list = chartState[rid];
      list.forEach(item => {
        if (item.planet === "சூரியன்") { sunPlaced = item; sunRasiId = parseInt(rid); }
        if (item.planet === "சந்திரன்") { moonPlaced = item; moonRasiId = parseInt(rid); }
        placedPlanetsForKarakas.push({ planet: item.planet, degree: item.degree });
      });
    }

    // 4. Calculate Panchangam
    let panchangam = null;
    let moonNak = null;
    let sunLon = null, moonLon = null;

    if (sunPlaced && moonPlaced) {
      sunLon = (sunRasiId - 1) * 30 + (sunPlaced.degree || 0);
      moonLon = (moonRasiId - 1) * 30 + (moonPlaced.degree || 0);
      panchangam = window.PGAstro?.astronomy?.calculatePanchangam(sunLon, moonLon);
    } else if (window.PGAstro?.lastCalculatedHoroscope?.panchangam) {
      panchangam = window.PGAstro.lastCalculatedHoroscope.panchangam;
    }

    if (moonPlaced) {
      moonLon = (moonRasiId - 1) * 30 + (moonPlaced.degree || 0);
      moonNak = window.PGAstro?.astronomy?.getNakshatraInfo(moonLon);
    } else if (window.PGAstro?.lastCalculatedHoroscope?.dasha?.nakshatraInfo) {
      moonNak = window.PGAstro.lastCalculatedHoroscope.dasha.nakshatraInfo;
    }

    // 5. Chara Karakas (AK, AmK, DK)
    const karakas = window.PGAstro?.astronomy?.calculateCharaKarakas(placedPlanetsForKarakas) || { charaMap: {}, sthiraMap: {} };
    let akPlanet = "-", dkPlanet = "-", amkPlanet = "-";
    for (let p in karakas.charaMap) {
      if (karakas.charaMap[p].code === "AK") akPlanet = `${p} (AK)`;
      if (karakas.charaMap[p].code === "AmK") amkPlanet = `${p} (AmK)`;
      if (karakas.charaMap[p].code === "DK") dkPlanet = `${p} (DK)`;
    }

    // 6. Lagna & Rasi Names
    const lagnaRasi = lagnaRasiId ? RASIS.find(r => r.id === lagnaRasiId)?.name : "";
    const moonRasi = moonRasiId ? RASIS.find(r => r.id === moonRasiId)?.name : "";

    // 7. Dasha text & Current Dasha Info
    let currentDasaInfo = window.PGAstro?.lastCalculatedHoroscope?.dasha;
    if (moonLon !== null && window.PGAstro?.astronomy?.calculateVimshottariDasha) {
      const nDob = nInfo.dob || document.getElementById("birthCalcDate")?.value || "1988-04-30";
      const nTime = nInfo.time || document.getElementById("birthCalcTime")?.value || "12:00";
      currentDasaInfo = window.PGAstro.astronomy.calculateVimshottariDasha(nDob, nTime, moonLon);
    }
    const dashaText = currentDasaInfo?.nakshatraInfo?.balanceText || currentDasaInfo?.balanceText || (moonNak ? moonNak.balanceText : null) || "தசா இருப்பு கணிக்கப்பட்டது";
    const cDasaLord = currentDasaInfo?.currentMahaDasa?.lord || currentDasaInfo?.currentDasa?.lord || currentDasaInfo?.currentDasa || "குரு";
    const cBhuktiLord = currentDasaInfo?.currentBhukti?.lord || (currentDasaInfo?.upcomingBhuktis && currentDasaInfo.upcomingBhuktis.find(b => b.isCurrent)?.lord) || (currentDasaInfo?.upcomingBhuktis && currentDasaInfo.upcomingBhuktis[0]?.lord) || "சனி";
    const cAntharamLord = currentDasaInfo?.currentAntharam?.lord || (currentDasaInfo?.currentSookshmamsList && currentDasaInfo.currentSookshmamsList.find(s => s.isCurrent)?.lord) || "புதன்";
    const curDasaStr = currentDasaInfo ? `${cDasaLord} தசை • ${cBhuktiLord} புக்தி • ${cAntharamLord} அந்தரம்` : "";

    // Build HTML
    container.innerHTML = `
      <div class="card-header" style="padding-bottom: 0.5rem; margin-bottom: 0.75rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <div class="card-title-group">
          <div class="card-title-icon" style="font-size:1.15rem;">📜</div>
          <div>
            <h3 class="card-title" style="font-size:1.02rem; margin:0; display:flex; align-items:center; gap:6px;">
              <span>பஞ்சாங்க விவரங்கள், சாதக அஷ்டாங்கம் &amp; நடப்பு வயது</span>
            </h3>
            <div class="card-subtitle" style="font-size:0.75rem; color:var(--text-muted);">பிறந்த நாள் அடிப்படையிலான துல்லியமான பஞ்சாங்கம், நட்சத்திர சாரம், திதி, யோகம், கரணம் &amp; காரகங்கள்</div>
          </div>
        </div>
        <div class="panchangam-age-badge" title="பிறந்த தேதியின்படி துல்லியமாக கணிக்கப்பட்ட நடப்பு வயது">
          <span style="font-size:1.2rem;">⏳</span>
          <div>
            <div style="font-size:0.65rem; color:var(--gold-light); text-transform:uppercase; letter-spacing:0.5px; font-weight:700;">நடப்பு வயது (Exact Age)</div>
            <div style="font-size:0.92rem; font-weight:800; color:#fff;">${ageInfo.formattedText}</div>
          </div>
        </div>
      </div>

      <!-- Native Profile Summary Strip -->
      <div class="panchangam-native-strip">
        <div class="panchangam-pill">
          <span class="icon">👤</span>
          <span class="label">ஜாதகர்:</span>
          <strong>${nName}</strong>
          <span class="badge ${nGenderVal === 'female' ? 'badge-pink' : 'badge-gold'}" style="font-size:0.66rem; margin-left:3px;">${nGender}</span>
        </div>
        <div class="panchangam-pill">
          <span class="icon">📅</span>
          <span class="label">பிறந்த நாள் &amp; நேரம்:</span>
          <strong>${nDob} ${nTime}</strong>
        </div>
        <div class="panchangam-pill">
          <span class="icon">📍</span>
          <span class="label">பிறந்த இடம்:</span>
          <strong style="color:#93c5fd;">${nPlace}</strong>
        </div>
        ${lagnaRasi ? `
          <div class="panchangam-pill">
            <span class="icon">🌅</span>
            <span class="label">லக்கினம்:</span>
            <strong style="color:var(--gold-light);">${lagnaRasi} ${lagnaDegree !== null ? '(' + formatDegree(lagnaDegree, true) + ')' : ''}</strong>
          </div>
        ` : ''}
        ${moonRasi ? `
          <div class="panchangam-pill">
            <span class="icon">🌙</span>
            <span class="label">ராசி:</span>
            <strong style="color:#38bdf8;">${moonRasi}</strong>
          </div>
        ` : ''}
      </div>

      <!-- 6 Panchangam & Karaka Feature Tiles -->
      <div class="panchangam-tiles-grid">
        
        <!-- Tile 1: Nakshatra, Pada & Saram -->
        <div class="panchangam-tile">
          <div class="tile-header">
            <span class="tile-icon">⭐</span>
            <span class="tile-title">ஜன்ம நட்சத்திரம், பாதம் &amp; சாரம்</span>
          </div>
          <div class="tile-body">
            <div class="tile-primary-text" style="color:#fcd34d;">
              ${moonNak ? `${moonNak.nakshatra} - ${moonNak.pada}-ஆம் பாதம்` : '<span style="color:var(--text-muted); font-size:0.8rem;">சந்திரன் வைக்கப்படவில்லை</span>'}
            </div>
            <div class="tile-sub-text" style="color:#38bdf8; font-weight:700; margin-top:2px;">
              ${moonNak ? `🌟 சாரம்: ${moonNak.lord} சாரம்` : '-'}
            </div>
          </div>
        </div>

        <!-- Tile 2: Thithi & Paksham -->
        <div class="panchangam-tile">
          <div class="tile-header">
            <span class="tile-icon">🌕</span>
            <span class="tile-title">திதி (Thithi) &amp; பக்ஷம்</span>
          </div>
          <div class="tile-body">
            <div class="tile-primary-text" style="color:#67e8f9;">
              ${panchangam ? panchangam.tithi.fullName : '<span style="color:var(--text-muted); font-size:0.8rem;">சூரியன்-சந்திரன் தேவை</span>'}
            </div>
            <div class="tile-sub-text" style="color:var(--text-muted); margin-top:2px;">
              ${panchangam ? `${panchangam.tithi.paksha} (${panchangam.tithi.percentElapsed}% நிறைவு)` : '-'}
            </div>
          </div>
        </div>

        <!-- Tile 3: Nitya Yogam -->
        <div class="panchangam-tile">
          <div class="tile-header">
            <span class="tile-icon">⚡</span>
            <span class="tile-title">நித்ய யோகம் (Yogam)</span>
          </div>
          <div class="tile-body">
            <div class="tile-primary-text" style="color:#f472b6;">
              ${panchangam ? `${panchangam.yogam.name} யோகம்` : '<span style="color:var(--text-muted); font-size:0.8rem;">சூரியன்-சந்திரன் தேவை</span>'}
            </div>
            <div class="tile-sub-text" style="color:${panchangam?.yogam.nature === 'சுபம்' ? '#4ade80' : '#f87171'}; font-weight:700; margin-top:2px;">
              ${panchangam ? `${panchangam.yogam.nature} • 27 யோகங்களில் ${panchangam.yogam.index}-வது` : '-'}
            </div>
          </div>
        </div>

        <!-- Tile 4: Karanam -->
        <div class="panchangam-tile">
          <div class="tile-header">
            <span class="tile-icon">🦁</span>
            <span class="tile-title">கரணம் (Karanam)</span>
          </div>
          <div class="tile-body">
            <div class="tile-primary-text" style="color:#c084fc;">
              ${panchangam ? panchangam.karanam.name : '<span style="color:var(--text-muted); font-size:0.8rem;">சூரியன்-சந்திரன் தேவை</span>'}
            </div>
            <div class="tile-sub-text" style="color:var(--text-muted); margin-top:2px;">
              ${panchangam ? `${panchangam.karanam.type} (60-ல் ${panchangam.karanam.index}-வது)` : '-'}
            </div>
          </div>
        </div>

        <!-- Tile 5: Primary Karakas (AK, AmK, DK) -->
        <div class="panchangam-tile">
          <div class="tile-header">
            <span class="tile-icon">👑</span>
            <span class="tile-title">முக்கிய காரகங்கள் (Karakas)</span>
          </div>
          <div class="tile-body">
            <div style="display:flex; flex-direction:column; gap:2px; font-size:0.75rem;">
              <div><strong style="color:#ffd700;">ஆத்மகாரகன் (AK):</strong> <span style="color:#fff;">${akPlanet}</span></div>
              <div><strong style="color:#f43f5e;">தாரகாரகன் (DK):</strong> <span style="color:#fff;">${dkPlanet}</span></div>
              <div><strong style="color:#38bdf8;">அமாத்தியகாரகன் (AmK):</strong> <span style="color:#fff;">${amkPlanet}</span></div>
            </div>
          </div>
        </div>

        <!-- Tile 6: Dasha Balance & Current Dasha -->
        <div class="panchangam-tile">
          <div class="tile-header">
            <span class="tile-icon">⏳</span>
            <span class="tile-title">தசா இருப்பு &amp; நடப்பு தசை</span>
          </div>
          <div class="tile-body">
            <div class="tile-primary-text" style="font-size:0.75rem; color:#fde047; line-height:1.3;">
              ${dashaText}
            </div>
            ${curDasaStr ? `
              <div class="tile-sub-text" style="color:#a78bfa; font-weight:700; margin-top:3px; font-size:0.72rem;">
                🔮 நடப்பு: ${curDasaStr}
              </div>
            ` : ''}
          </div>
        </div>

      </div>
    `;
  }

  // Planetary Degrees, Nakshatra, Pada, Saram & Karakas Table Renderer
  function renderDegreesTable() {
    const container = document.getElementById("planetaryDegreesTableContainer");
    if (!container) return;

    // Collect all placed planets for Chara Karakas calculation
    const placedPlanetsList = [];
    PLANETS.forEach(p => {
      for (let rid in chartState) {
        const found = chartState[rid].find(item => item.planet === p.name);
        if (found) {
          placedPlanetsList.push({ planet: p.name, degree: found.degree });
          break;
        }
      }
    });

    const karakaData = window.PGAstro?.astronomy?.calculateCharaKarakas(placedPlanetsList) || { charaMap: {}, sthiraMap: {} };

    const rows = [];
    if (lagnaRasiId) {
      const rasi = RASIS.find(r => r.id === lagnaRasiId);
      const lagnaTotalLon = (lagnaRasiId - 1) * 30 + (lagnaDegree || 0);
      const lagnaNak = window.PGAstro?.astronomy?.getNakshatraPadaSaram(lagnaTotalLon);

      rows.push({
        isLagna: true,
        name: "லக்கினம் (Lagna)",
        icon: "🌅",
        color: "#ffd700",
        rasiId: lagnaRasiId,
        rasiName: rasi ? rasi.name : "-",
        lord: rasi ? rasi.lord : "-",
        degree: lagnaDegree,
        nakshatra: lagnaNak ? lagnaNak.nakshatra : "-",
        pada: lagnaNak ? `${lagnaNak.pada}-ஆம் பாதம்` : "-",
        saram: lagnaNak ? `${lagnaNak.lord} சாரம்` : "-",
        saramColor: lagnaNak ? (PLANETS.find(p => p.name === lagnaNak.lord)?.color || "var(--gold-light)") : "var(--gold-light)",
        charaKaraka: `<span class="badge badge-gold" style="font-size:0.68rem;">உதய லக்கினம்</span>`,
        sthiraKaraka: "தேககாரகம் (உடல், உயிர்)",
        statusHtml: `<span class="badge badge-gold">லக்கினம்</span>`
      });
    }

    PLANETS.forEach(p => {
      let placed = null;
      let placedRasiId = null;
      for (let rid in chartState) {
        const found = chartState[rid].find(item => item.planet === p.name);
        if (found) {
          placed = found;
          placedRasiId = parseInt(rid);
          break;
        }
      }

      const rasi = placedRasiId ? RASIS.find(r => r.id === placedRasiId) : null;
      let statusBadges = [];
      let nakInfo = null;

      if (placed && placedRasiId) {
        if (placed.isRetrograde) statusBadges.push(`<span class="badge badge-red" style="font-size:0.68rem;">வக்கிரம்</span>`);
        if (placed.isExalted) statusBadges.push(`<span class="badge badge-green" style="font-size:0.68rem;">உச்சம்</span>`);
        if (placed.isDebilitated) statusBadges.push(`<span class="badge" style="background:#4b5563; color:#fff; font-size:0.68rem;">நீசம்</span>`);
        if (placed.isMarginal) statusBadges.push(`<span class="badge badge-gold" style="font-size:0.68rem;">விளிம்பு</span>`);

        const totalLon = (placedRasiId - 1) * 30 + (placed.degree || 0);
        nakInfo = window.PGAstro?.astronomy?.getNakshatraPadaSaram(totalLon);
      }

      // Karakas
      const chara = karakaData.charaMap[p.name];
      const sthira = karakaData.sthiraMap[p.name];

      let charaHtml = "-";
      if (chara) {
        charaHtml = `<span class="badge-chara" style="background:${chara.color}22; border:1px solid ${chara.color}; color:${chara.color}; font-size:0.68rem; padding:2px 6px; border-radius:4px; font-weight:700;" title="${chara.desc}">${chara.code}: ${chara.name}</span>`;
      }

      rows.push({
        isLagna: false,
        name: p.name,
        icon: p.icon,
        color: p.color,
        rasiId: placedRasiId,
        rasiName: rasi ? rasi.name : "<span style='color:var(--text-muted);'>அமைக்கப்படவில்லை</span>",
        lord: rasi ? rasi.lord : "-",
        degree: placed ? placed.degree : null,
        nakshatra: nakInfo ? nakInfo.nakshatra : "-",
        pada: nakInfo ? `${nakInfo.pada}-ஆம் பாதம்` : "-",
        saram: nakInfo ? `${nakInfo.lord} சாரம்` : "-",
        saramColor: nakInfo ? (PLANETS.find(pl => pl.name === nakInfo.lord)?.color || "#38bdf8") : "#38bdf8",
        charaKaraka: charaHtml,
        sthiraKaraka: sthira ? sthira.title : "-",
        statusHtml: statusBadges.join(" ") || (placed ? "<span style='color:var(--text-muted); font-size:0.75rem;'>இயல்பு</span>" : "-")
      });
    });

    let html = `
      <div style="overflow-x:auto;">
        <table class="degrees-table" style="width:100%; border-collapse:collapse; font-size:0.78rem; text-align:left; min-width:720px;">
          <thead>
            <tr style="border-bottom:1px solid rgba(212,175,55,0.25); color:var(--gold-light); font-size:0.73rem;">
              <th style="padding:6px 8px;">கிரகம் / லக்கினம்</th>
              <th style="padding:6px 8px;">ராசி &amp; பாகை (Degree)</th>
              <th style="padding:6px 8px;">நட்சத்திரம் (Nakshatra)</th>
              <th style="padding:6px 8px;">பாதம் (Pada)</th>
              <th style="padding:6px 8px;">சாரம் (Star Lord)</th>
              <th style="padding:6px 8px;">காரகம் (Karakam)</th>
              <th style="padding:6px 8px;">வீட்டு அதிபதி</th>
              <th style="padding:6px 8px;">நிலை</th>
            </tr>
          </thead>
          <tbody>
    `;

    rows.forEach(r => {
      const degStr = (r.degree !== null && r.degree !== undefined) ? `<strong>${formatDegree(r.degree)}</strong>` : "";
      const rowStyle = r.isLagna ? "background:rgba(212,175,55,0.08); font-weight:bold;" : "border-bottom:1px solid rgba(255,255,255,0.04);";
      const clickAction = r.rasiId ? `onclick="window.PGAstro.chart.highlightRasi(${r.rasiId})"` : "";

      html += `
        <tr style="${rowStyle} ${r.rasiId ? 'cursor:pointer;' : ''}" ${clickAction} title="${r.rasiId ? 'கட்டத்தில் ராசியை காண கிளிக் செய்க' : ''}">
          <td style="padding:6px 8px; color:${r.color}; display:flex; align-items:center; gap:5px; font-weight:600;">
            <span style="font-size:0.95rem;">${r.icon}</span> <span>${r.name}</span>
          </td>
          <td style="padding:6px 8px; color:var(--text-main);">
            <div style="font-weight:600;">${r.rasiName}</div>
            ${degStr ? `<div style="color:var(--gold-primary); font-family:var(--font-mono, monospace); font-size:0.74rem;">${degStr}</div>` : ''}
          </td>
          <td style="padding:6px 8px; color:#fde047; font-weight:600;">${r.nakshatra}</td>
          <td style="padding:6px 8px; color:#a78bfa; font-weight:600;">${r.pada}</td>
          <td style="padding:6px 8px;">
            <span style="color:${r.saramColor}; font-weight:700; background:rgba(255,255,255,0.04); padding:2px 6px; border-radius:4px; border:1px solid rgba(255,255,255,0.1);">
              ${r.saram}
            </span>
          </td>
          <td style="padding:6px 8px;">
            <div style="margin-bottom:2px;">${r.charaKaraka}</div>
            <div style="font-size:0.68rem; color:var(--text-muted);">${r.sthiraKaraka}</div>
          </td>
          <td style="padding:6px 8px; color:var(--text-muted);">${r.lord}</td>
          <td style="padding:6px 8px;">${r.statusHtml}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;
  }

  // Presets with accurate astrological degrees & Lagnas
  const PRESETS = {
    preset_wealth: {
      name: "தொழில் & செல்வ யோகம் (Saturn + Venus)",
      lagna: { rasiId: 5, degree: 12.4 }, // Leo Lagna
      placements: [
        { rasiId: 12, planet: "சனி", degree: 18.4, isExalted: false, isRetrograde: false }, // Pisces
        { rasiId: 12, planet: "சுக்கிரன்", degree: 21.2, isExalted: true, isRetrograde: false }, // Exalted Pisces
        { rasiId: 4, planet: "குரு", degree: 5.0, isExalted: true, isRetrograde: false },   // Cancer (Deep Exalted 5°)
        { rasiId: 5, planet: "சூரியன்", degree: 14.5, isExalted: false, isRetrograde: false },// Leo
        { rasiId: 5, planet: "புதன்", degree: 19.8, isExalted: false, isRetrograde: false },
        { rasiId: 1, planet: "செவ்வாய்", degree: 12.0, isExalted: false, isRetrograde: false },// Aries
        { rasiId: 2, planet: "சந்திரன்", degree: 3.0, isExalted: true, isRetrograde: false }, // Taurus (Exalted 3°)
        { rasiId: 3, planet: "ராகு", degree: 16.5, isExalted: false, isRetrograde: false },
        { rasiId: 9, planet: "கேது", degree: 16.5, isExalted: false, isRetrograde: false }
      ]
    },
    preset_leadership: {
      name: "அரசு & நிர்வாக அதிகாரம் (Sun + Mars Exalted)",
      lagna: { rasiId: 1, degree: 8.2 }, // Aries Lagna
      placements: [
        { rasiId: 1, planet: "சூரியன்", degree: 10.0, isExalted: true, isRetrograde: false }, // Aries (Deep Exalted 10°)
        { rasiId: 1, planet: "செவ்வாய்", degree: 15.3, isExalted: false, isRetrograde: false },
        { rasiId: 9, planet: "குரு", degree: 16.0, isExalted: false, isRetrograde: false },    // Sagittarius (Trine)
        { rasiId: 7, planet: "சனி", degree: 20.0, isExalted: true, isRetrograde: false },     // Libra (Exalted 20°)
        { rasiId: 6, planet: "புதன்", degree: 15.0, isExalted: true, isRetrograde: false },   // Virgo (Exalted 15°)
        { rasiId: 12, planet: "சுக்கிரன்", degree: 27.0, isExalted: true, isRetrograde: false, isMarginal: true }, // Exalted 27°
        { rasiId: 4, planet: "சந்திரன்", degree: 12.4, isExalted: false, isRetrograde: false },
        { rasiId: 11, planet: "ராகு", degree: 24.1, isExalted: false, isRetrograde: false },
        { rasiId: 5, planet: "கேது", degree: 24.1, isExalted: false, isRetrograde: false }
      ]
    },
    preset_spirituality: {
      name: "ஞான யோகம் & ஆன்மீகம் (Guru + Ketu)",
      lagna: { rasiId: 8, degree: 14.0 }, // Scorpio Lagna
      placements: [
        { rasiId: 8, planet: "குரு", degree: 11.2, isExalted: false, isRetrograde: false },  // Scorpio
        { rasiId: 8, planet: "கேது", degree: 13.5, isExalted: false, isRetrograde: false },
        { rasiId: 10, planet: "சனி", degree: 22.0, isExalted: false, isRetrograde: false }, // Capricorn
        { rasiId: 2, planet: "ராகு", degree: 13.5, isExalted: false, isRetrograde: false },
        { rasiId: 4, planet: "சந்திரன்", degree: 18.2, isExalted: false, isRetrograde: false },
        { rasiId: 5, planet: "சூரியன்", degree: 6.4, isExalted: false, isRetrograde: false },
        { rasiId: 6, planet: "புதன்", degree: 24.0, isExalted: false, isRetrograde: false },
        { rasiId: 7, planet: "சுக்கிரன்", degree: 14.8, isExalted: false, isRetrograde: false },
        { rasiId: 1, planet: "செவ்வாய்", degree: 9.3, isExalted: false, isRetrograde: false }
      ]
    },
    preset_retrograde: {
      name: "வக்கிரம் & விளிம்பு ஆய்வு (Retrograde & Edge)",
      lagna: { rasiId: 11, degree: 17.5 }, // Aquarius Lagna
      placements: [
        { rasiId: 3, planet: "புதன்", degree: 1.5, isExalted: false, isRetrograde: true, isMarginal: true }, // Edge 1.5°
        { rasiId: 11, planet: "சனி", degree: 14.0, isExalted: false, isRetrograde: true },
        { rasiId: 10, planet: "செவ்வாய்", degree: 28.5, isExalted: true, isRetrograde: false, isMarginal: true }, // Edge 28.5°
        { rasiId: 1, planet: "சூரியன்", degree: 18.0, isExalted: true, isRetrograde: false },
        { rasiId: 4, planet: "சந்திரன்", degree: 22.1, isExalted: false, isRetrograde: false },
        { rasiId: 9, planet: "குரு", degree: 19.5, isExalted: false, isRetrograde: true },
        { rasiId: 12, planet: "சுக்கிரன்", degree: 16.2, isExalted: false, isRetrograde: true },
        { rasiId: 2, planet: "ராகு", degree: 8.4, isExalted: false, isRetrograde: false },
        { rasiId: 8, planet: "கேது", degree: 8.4, isExalted: false, isRetrograde: false }
      ]
    }
  };

  function loadPreset(key) {
    const preset = PRESETS[key];
    if (!preset) return;
    clearChart();
    if (preset.lagna) {
      lagnaRasiId = preset.lagna.rasiId;
      lagnaDegree = preset.lagna.degree;
    }
    preset.placements.forEach(p => {
      chartState[p.rasiId].push({
        planet: p.planet,
        degree: p.degree !== undefined ? p.degree : 15.0,
        isRetrograde: !!p.isRetrograde,
        isExalted: !!p.isExalted,
        isDebilitated: !!p.isDebilitated,
        isMarginal: !!p.isMarginal
      });
    });
    updateAllCells();
    updateCenterStats();
    if (window.PGAstroEngine) {
      window.PGAstroEngine.evaluateCurrentChart();
    }
  }

  function setBirthHoroscope(computedData, info) {
    clearChart();
    nativeInfo = info;
    window.PGAstro.lastCalculatedHoroscope = computedData;
    if (computedData.lagna && computedData.lagna.rasiId) {
      lagnaRasiId = computedData.lagna.rasiId;
      lagnaDegree = parseFloat(computedData.lagna.degInSign);
    }
    if (computedData.planets) {
      computedData.planets.forEach(p => {
        const deg = p.degInSign !== undefined ? parseFloat(p.degInSign) : 15.0;
        chartState[p.rasiId].push({
          planet: p.planet,
          degree: deg,
          isRetrograde: !!p.isRetrograde,
          isExalted: !!p.isExalted,
          isDebilitated: !!p.isDebilitated,
          isMarginal: !!p.isMarginal
        });
      });
    }
    updateAllCells();
    updateCenterStats();
    if (window.PGAstroEngine) {
      window.PGAstroEngine.evaluateCurrentChart();
    }
  }

  // Public API
  window.PGAstro.chart = {
    init: initChart,
    getState: () => chartState,
    getNativeInfo: () => nativeInfo,
    getLagnaRasiId: () => lagnaRasiId,
    getLagnaDegree: () => lagnaDegree,
    formatDegree: formatDegree,
    setShowDegrees: (val) => { showDegrees = val; updateAllCells(); },
    getShowDegrees: () => showDegrees,
    setShowGochara: (val) => { showGochara = val; updateAllCells(); },
    getShowGochara: () => showGochara,
    getTodayGochara: getTodayGochara,
    calculateNavamsaPositions: calculateNavamsaPositions,
    renderNavamsaChart: updateNavamsaCells,
    highlightRasi: highlightRasi,
    renderDegreesTable: renderDegreesTable,
    renderPanchangamOverviewCard: renderPanchangamOverviewCard,
    setBirthHoroscope: setBirthHoroscope,
    loadPreset: loadPreset,
    clear: clearChart,
    removePlanet: removePlanetFromChart,
    RASIS: RASIS,
    PLANETS: PLANETS
  };
})();
