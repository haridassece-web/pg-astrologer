// PG Astro - Raja Nadi Evaluation Engine
// Analyzes Chart, Conjunctions (இணைவு பலன்), Trines (1-5-9), Transits (கோச்சாரம்),
// Subhathuvam, Sookshuma Valu, Papathuvam (சுபத்துவம், சூட்சும வலு & பாபத்துவம்),
// and Vimshottari Dasa - Bhukti - Antharam (தசா, புத்தி, அந்தரம்)

window.PGAstroEngine = window.PGAstroEngine || {};

window.PGAstroRulesEngine = {
  MARRIAGE_RULES_REGISTRY: [
    { id: "MARRIAGE_001", name: "Transit Saturn → 7th Lord Rule", requiredHouses: [7], type: "MARRIAGE_TIMING", strength: "STRONG", baseScore: 20 },
    { id: "MARRIAGE_002", name: "3-7-11 Dasha Bhukti Antara Connection", requiredHouses: [3, 7, 11], levels: ["mahaDasha", "bhukti", "antara"], karakas: ["Venus"], type: "MARRIAGE_TIMING", strength: "STRONG", baseScore: 25 },
    { id: "MARRIAGE_003", name: "Jupiter Transit / Aspect on 7th House or 7th Lord", requiredHouses: [7], type: "MARRIAGE_TIMING", strength: "HIGH", baseScore: 20 },
    { id: "MARRIAGE_004", name: "Venus Kalathra Karaka Activation", karakas: ["Venus"], type: "MARRIAGE_TIMING", strength: "MEDIUM", baseScore: 15 },
    { id: "MARRIAGE_005", name: "2nd/11th Kutumba & Mangala Activation", requiredHouses: [2, 11], type: "MARRIAGE_TIMING", strength: "MEDIUM", baseScore: 10 },
    { id: "MARRIAGE_006", name: "D9 Navamsa Confirmation", type: "MARRIAGE_TIMING", strength: "HIGH", baseScore: 20 }
  ],

  getPlanetHouseConnection: function(planetName, planetMap, effectiveLagnaId, lordMap) {
    const pData = planetMap ? planetMap[planetName] : null;
    const pRasi = pData ? pData.rasiId : 0;
    const occupiedHouses = [];
    const lordHouses = [];
    const connectedHouses = [];

    if (pRasi && effectiveLagnaId) {
      const occHouse = ((pRasi - effectiveLagnaId + 12) % 12) + 1;
      occupiedHouses.push(occHouse);
      connectedHouses.push(occHouse);
    }

    if (lordMap) {
      for (let h = 1; h <= 12; h++) {
        if (lordMap[h] === planetName) {
          lordHouses.push(h);
          connectedHouses.push(h);
        }
      }
    }

    if (pRasi && planetMap) {
      for (let otherName in planetMap) {
        if (otherName !== planetName && planetMap[otherName].rasiId === pRasi) {
          if (lordMap) {
            for (let h = 1; h <= 12; h++) {
              if (lordMap[h] === otherName) connectedHouses.push(h);
            }
          }
        }
      }
    }

    if (planetName === "சுக்கிரன்") connectedHouses.push(7, 11);
    if (planetName === "செவ்வாய்") connectedHouses.push(7, 3);
    if (planetName === "குரு") connectedHouses.push(5, 7, 9, 11);

    return {
      planet: planetName,
      occupiedHouses,
      lordHouses,
      connectedHouses: Array.from(new Set(connectedHouses))
    };
  },

  hasHouseConnection: function(planetConn, house) {
    if (!planetConn) return false;
    return (
      (planetConn.occupiedHouses && planetConn.occupiedHouses.includes(house)) ||
      (planetConn.lordHouses && planetConn.lordHouses.includes(house)) ||
      (planetConn.connectedHouses && planetConn.connectedHouses.includes(house))
    );
  },

  check3711ConnectionObject: function(planetConn) {
    return {
      has3: this.hasHouseConnection(planetConn, 3),
      has7: this.hasHouseConnection(planetConn, 7),
      has11: this.hasHouseConnection(planetConn, 11)
    };
  },

  checkSaturn7thLordRule: function(saturnTransitHouse, seventhLordHouse, year) {
    if (!saturnTransitHouse || !seventhLordHouse) {
      return { active: false, score: 0, year };
    }
    const distance = ((seventhLordHouse - saturnTransitHouse + 12) % 12) + 1;

    if (distance === 1) {
      return {
        active: true,
        aspectType: "conjunction",
        score: 20,
        year,
        explanation: "கோச்சார சனி 7-ஆம் அதிபதியுடன் இணையும் காலம் (Direct Conjunction / 1st)."
      };
    }
    if (distance === 3) {
      return {
        active: true,
        aspectType: "3rd",
        score: 20,
        year,
        explanation: "கோச்சார சனி தனது 3-ஆம் பார்வையா 7-ஆம் அதிபதியை நோக்குகிறது (3rd Aspect)."
      };
    }
    if (distance === 7) {
      return {
        active: true,
        aspectType: "7th",
        score: 20,
        year,
        explanation: "கோச்சார சனி தனது 7-ஆம் பார்வையா 7-ஆம் அதிபதியை நோக்குகிறது (7th Aspect)."
      };
    }
    if (distance === 10) {
      return {
        active: true,
        aspectType: "10th",
        score: 20,
        year,
        explanation: "கோச்சார சனி தனது 10-ஆம் பார்வையா 7-ஆம் அதிபதியை நோக்குகிறது (10th Aspect)."
      };
    }

    return { active: false, score: 0, year };
  },

  calculate3711MarriageScore: function(mahaConn, bhuktiConn, antaraConn, mahaLord, bhuktiLord, antaraLord) {
    let score = 0;
    const mahaRes = this.check3711ConnectionObject(mahaConn);
    const bhuktiRes = this.check3711ConnectionObject(bhuktiConn);
    const antaraRes = this.check3711ConnectionObject(antaraConn);

    if (mahaRes.has7) score += 25;
    if (mahaRes.has3) score += 10;
    if (mahaRes.has11) score += 10;

    if (bhuktiRes.has3) score += 20;
    if (bhuktiRes.has7) score += 20;
    if (bhuktiRes.has11) score += 20;

    if (antaraRes.has3) score += 15;
    if (antaraRes.has7) score += 20;
    if (antaraRes.has11) score += 20;

    if (mahaLord === "சுக்கிரன்" || bhuktiLord === "சுக்கிரன்" || antaraLord === "சுக்கிரன்") {
      score += 15;
    }

    return { score, mahaRes, bhuktiRes, antaraRes };
  },

  generateMarriagePrediction: function(rule1Result, rule2Score, extraScores, year) {
    let totalScore = 0;
    if (rule1Result && rule1Result.active) {
      totalScore += rule1Result.score;
    }
    totalScore += rule2Score;
    if (extraScores) totalScore += extraScores;

    let strength = "MODERATE";
    let tamil = `${year} ஆம் ஆண்டில் திருமணம் தொடர்பான சில சாதகமான காலச்சுட்டிகள் காணப்படுகின்றன.`;

    if (totalScore >= 70) {
      strength = "VERY_STRONG";
      tamil = `${year} ஆம் ஆண்டில் திருமண நிகழ்வுக்கான பலமான சுப காலச்சுட்டிகள் காணப்படுகின்றன.`;
    } else if (totalScore >= 50) {
      strength = "STRONG";
      tamil = `${year} ஆம் ஆண்டில் திருமணத்திற்கான சாதகமான காலச்சுட்டிகள் காணப்படுகின்றன.`;
    }

    return {
      year,
      score: totalScore,
      strength,
      tamil,
      evidence: {
        rule1: rule1Result,
        rule2Score,
        extraScores
      }
    };
  }
};

(function() {
  function evaluateCurrentChart() {
    try {
      if (!window.PGAstro || !window.PGAstro.chart) return;
      const chartState = window.PGAstro.chart.getState();
      const RASIS = (window.PGAstro.chart && window.PGAstro.chart.RASIS) || [];
      const nativeInfo = window.PGAstro.chart.getNativeInfo();

      // 1. Collect all placed planets and their locations
      const placedPlanets = [];
      for (let rasiId in chartState) {
        const list = chartState[rasiId] || [];
        list.forEach(p => {
          placedPlanets.push({
            ...p,
            rasiId: parseInt(rasiId),
            rasiName: RASIS.find(r => r.id === parseInt(rasiId))?.name || ""
          });
        });
      }

      // 2. Find Conjunctions (Same House)
      const detectedConjunctions = [];
      const processedPairs = new Set();

      for (let rasiId in chartState) {
        const list = chartState[rasiId] || [];
        if (list.length >= 2) {
          for (let i = 0; i < list.length; i++) {
            for (let j = i + 1; j < list.length; j++) {
              const p1 = list[i].planet;
              const p2 = list[j].planet;
              const pairKey = [p1, p2].sort().join("_");
              if (!processedPairs.has(pairKey)) {
                processedPairs.add(pairKey);
                const combData = window.PGAstroData.getCombination(p1, p2);
                
                let degInfo = "";
                if (list[i].degree !== undefined && list[j].degree !== undefined) {
                  const diff = Math.abs(parseFloat(list[i].degree) - parseFloat(list[j].degree));
                  degInfo = `${diff.toFixed(1)}° பாகை இடைவெளி` + (diff <= 5.0 ? " (அதி நெருக்கம்)" : "");
                }

                detectedConjunctions.push({
                  type: "நேரடி இணைவு (Conjunction)",
                  rasiName: RASIS.find(r => r.id === parseInt(rasiId))?.name || "",
                  p1: p1,
                  p2: p2,
                  degInfo: degInfo,
                  data: combData
                });
              }
            }
          }
        }
      }

      // 3. Find Nadi Trinal (1-5-9) & Opposition (1-7) Connections
      placedPlanets.forEach((itemA, idxA) => {
        placedPlanets.forEach((itemB, idxB) => {
          if (idxA >= idxB) return;
          if (itemA.rasiId === itemB.rasiId) return;

          const dist = ((itemB.rasiId - itemA.rasiId + 12) % 12);
          const isTrine = (dist === 4 || dist === 8);
          const isOpp = (dist === 6);

          if (isTrine || isOpp) {
            const pairKey = [itemA.planet, itemB.planet].sort().join("_");
            if (!processedPairs.has(pairKey)) {
              processedPairs.add(pairKey);
              const combData = window.PGAstroData.getCombination(itemA.planet, itemB.planet);
              detectedConjunctions.push({
                type: isTrine ? "திரிகோண தொடர்பு (1-5-9 Nadi Trine)" : "சமசப்தம பார்வை (1-7 Opposition)",
                rasiName: `${itemA.rasiName} ↔ ${itemB.rasiName}`,
                p1: itemA.planet,
                p2: itemB.planet,
                data: combData
              });
            }
          }
        });
      });

      // 4. Special Conditions: Retrograde, Marginal, Exalted, Debilitated
      const specialPlanets = placedPlanets.filter(p => p.isRetrograde || p.isMarginal || p.isExalted || p.isDebilitated);

      // 5. Evaluate Subhathuvam, Sookshuma Valu & Papathuvam (சுபத்துவம் & பாபத்துவம்)
      const lagnaRasiId = (window.PGAstro.chart && window.PGAstro.chart.getLagnaRasiId()) || 1;
      const lagnaDegree = (window.PGAstro.chart && window.PGAstro.chart.getLagnaDegree()) || null;
      let subhathuvamResult = null;
      if (window.PGAstro.subhathuvam && window.PGAstro.subhathuvam.evaluate) {
        subhathuvamResult = window.PGAstro.subhathuvam.evaluate(chartState, { lagnaRasiId });
      }

      // 6. Calculate Vimshottari Dasa - Bhukti - Antharam (தசா, புத்தி, அந்தரம்)
      let dashaResult = null;
      if (window.PGAstro.lastCalculatedHoroscope && window.PGAstro.lastCalculatedHoroscope.dasha) {
        dashaResult = window.PGAstro.lastCalculatedHoroscope.dasha;
      } else if (window.PGAstro.astronomy && window.PGAstro.astronomy.calculateVimshottariDasha) {
        // Look for Moon in chartState
        let moonRasiId = null;
        let moonDeg = 15.0;
        for (let rId in chartState) {
          const m = chartState[rId].find(p => p.planet === "சந்திரன்");
          if (m) {
            moonRasiId = parseInt(rId);
            moonDeg = m.degree !== undefined ? parseFloat(m.degree) : 15.0;
            break;
          }
        }

        if (moonRasiId) {
          const moonLon = ((moonRasiId - 1) * 30) + moonDeg;
          const birthDate = (nativeInfo && nativeInfo.dob) || document.getElementById("birthCalcDate")?.value || "1988-04-30";
          const birthTime = (nativeInfo && nativeInfo.time) || document.getElementById("birthCalcTime")?.value || "12:00";
          dashaResult = window.PGAstro.astronomy.calculateVimshottariDasha(birthDate, birthTime, moonLon);
        }
      }

      // 7. Evaluate Life Milestones (வேலை, தொழில், திருமணம், வீடு, வாகனம்/கார்)
      const lifeMilestones = predictLifeMilestones({
        chartState,
        lagnaRasiId,
        lagnaDegree,
        subhathuvamResult,
        dashaResult,
        nativeInfo
      });

      // 8. Render complete evaluation results on 1st Page
      renderEvaluationResults({
        placedPlanets,
        detectedConjunctions,
        specialPlanets,
        subhathuvamResult,
        dashaResult,
        lifeMilestones,
        nativeInfo
      });

      // 9. Render Horoscope Q&A Page (Tab 7)
      renderHoroscopeQA({
        placedPlanets,
        detectedConjunctions,
        specialPlanets,
        subhathuvamResult,
        dashaResult,
        lifeMilestones,
        nativeInfo
      });
    } catch (err) {
      console.error("Error evaluating chart in PGAstroEngine:", err);
    }
  }

  // Helper to predict Life Milestones: Job, Business vs Job, Marriage, House, Vehicle / Car
  function predictLifeMilestones(params) {
    const { chartState, lagnaRasiId, subhathuvamResult, dashaResult, nativeInfo } = params;
    if (!chartState || Object.keys(chartState).length === 0) return null;

    const RASIS = (window.PGAstro && window.PGAstro.chart && window.PGAstro.chart.RASIS) || [];
    const PLANET_LORDS = [
      "செவ்வாய்", "சுக்கிரன்", "புதன்", "சந்திரன்", "சூரியன்", "புதன்", 
      "சுக்கிரன்", "செவ்வாய்", "குரு", "சனி", "சனி", "குரு"
    ];

    function getHouseLord(lagnaId, houseNum) {
      if (!lagnaId) return null;
      const targetSign = ((lagnaId - 1 + (houseNum - 1)) % 12) + 1;
      return PLANET_LORDS[targetSign - 1];
    }

    // Locate all planets in chart
    const planetMap = {};
    for (let rId in chartState) {
      const list = chartState[rId] || [];
      list.forEach(p => {
        planetMap[p.planet] = {
          rasiId: parseInt(rId),
          degree: p.degree !== undefined ? parseFloat(p.degree) : 15.0,
          isRetrograde: !!p.isRetrograde,
          isExalted: !!p.isExalted,
          isDebilitated: !!p.isDebilitated
        };
      });
    }

    const effectiveLagnaId = lagnaRasiId || 1;
    const gender = (nativeInfo && nativeInfo.gender) || document.getElementById("birthCalcGender")?.value || "male";
    const isFemale = (gender === "female");
    const nativeTitle = isFemale ? "ஜாதகி" : "ஜாதகர்";
    const spouseTitle = isFemale ? "கணவர் (Husband)" : "மனைவி (Wife)";
    const spouseLabel = isFemale ? "கணவர் குணம் & தோற்றம்" : "மனைவி குணம் & தோற்றம்";
    const spouseKaraka = isFemale ? "செவ்வாய் / குரு (கணவர் காரகன்)" : "சுக்கிரன் (களத்திர காரகன்)";

    const lord1 = getHouseLord(effectiveLagnaId, 1);
    const lord2 = getHouseLord(effectiveLagnaId, 2);
    const lord3 = getHouseLord(effectiveLagnaId, 3);
    const lord4 = getHouseLord(effectiveLagnaId, 4);
    const lord5 = getHouseLord(effectiveLagnaId, 5);
    const lord6 = getHouseLord(effectiveLagnaId, 6);
    const lord7 = getHouseLord(effectiveLagnaId, 7);
    const lord8 = getHouseLord(effectiveLagnaId, 8);
    const lord9 = getHouseLord(effectiveLagnaId, 9);
    const lord10 = getHouseLord(effectiveLagnaId, 10);
    const lord11 = getHouseLord(effectiveLagnaId, 11);
    const lord12 = getHouseLord(effectiveLagnaId, 12);

    const saturnInfo = planetMap["சனி"];
    const venusInfo = planetMap["சுக்கிரன்"];
    const marsInfo = planetMap["செவ்வாய்"];

    // Subhathuvam references
    const subPlanets = (subhathuvamResult && subhathuvamResult.planets) || [];
    const getSubha = (pName) => subPlanets.find(p => p.planet === pName) || { subhaScore: 0, sookshumaScore: 0, papaScore: 0, netScore: 0 };
    const saturnSubha = getSubha("சனி");
    const venusSubha = getSubha("சுக்கிரன்");
    const mercurySubha = getSubha("புதன்");
    const guruSubha = getSubha("குரு");
    const topSubha = (subhathuvamResult && subhathuvamResult.topSubhathuvamPlanet) || null;
    const topSubhaLord = topSubha ? topSubha.planet : "குரு";

    // Saturn connections (Conjunction, 1-5-9 Trine, 1-7 Opposition)
    const saturnConn = [];
    if (saturnInfo) {
      for (let pName in planetMap) {
        if (pName === "சனி") continue;
        const other = planetMap[pName];
        if (other.rasiId === saturnInfo.rasiId) {
          saturnConn.push({ planet: pName, type: "இணைவு" });
        } else {
          const dist = ((other.rasiId - saturnInfo.rasiId + 12) % 12);
          if (dist === 4 || dist === 8) saturnConn.push({ planet: pName, type: "திரிகோணம்" });
          else if (dist === 6) saturnConn.push({ planet: pName, type: "பார்வை" });
        }
      }
    }

    // 1. BUSINESS VS SALARIED JOB (தொழில் பண்ணுவாரா இல்லை வேலைக்கு செல்வாரா?)
    let jobType = "job";
    let jobVerdict = "";
    let jobReason = "";
    let recommendedFields = [];

    const hasMercuryConn = saturnConn.some(c => c.planet === "புதன்") || (mercurySubha.netScore >= 3);
    const hasVenusConn = saturnConn.some(c => c.planet === "சுக்கிரன்") || (venusSubha.netScore >= 3);
    const hasSunConn = saturnConn.some(c => c.planet === "சூரியன்");
    const hasMarsConn = saturnConn.some(c => c.planet === "செவ்வாய்");
    const hasJupiterConn = saturnConn.some(c => c.planet === "குரு");
    const hasRahuConn = saturnConn.some(c => c.planet === "ராகு");
    const hasKetuConn = saturnConn.some(c => c.planet === "கேது");

    if (saturnSubha.netScore >= 3 && (hasMercuryConn || hasVenusConn)) {
      jobType = "business";
      jobVerdict = "சுய தொழில் & வியாபாரம் (Own Business / Trade)";
      jobReason = `ஜீவன காரகன் சனி மற்றும் 10-ஆம் அதிபதி ${lord10 || 'புதன்'} சுபத்துவம் பெற்று, வணிக காரகன் புதன்/சுக்கிரனின் தொடர்பைப் பெற்றுள்ளதால், ${nativeTitle} பிறரிடம் பணியாளாக இல்லாமல் சுதந்திரமாக சொந்த தொழில், வர்த்தகம் அல்லது வணிக நிறுவன தலைமை மூலம் பெரும் தனலாபம் ஈட்டுவார்.`;
    } else if (hasSunConn || (lord6 && getSubha(lord6).netScore > getSubha(lord10).netScore) || saturnSubha.netScore < 2) {
      jobType = "job";
      jobVerdict = "அரசு அல்லது நிறுவன உத்தியோகம் (Salaried / Corporate Job)";
      jobReason = `ஜீவன காரகன் சனி மற்றும் உத்தியோக ஸ்தானமான 6-ஆம் பாவாதிபதி ${lord6 || 'செவ்வாய்'} ஆதிக்கத்தால், அரசுப் பணி அல்லது முன்னணி கார்ப்பரேட் நிறுவனத்தில் நிர்வாகப் பொறுப்பில் நிலையான மாத ஊதியம் தரும் உத்தியோகமே ${nativeTitle}க்கு உச்சபட்ச மேன்மை தரும்.`;
    } else {
      jobType = "hybrid";
      jobVerdict = "முதலில் உத்தியோகம் → பின்னர் சுய தொழில் (Service First, then Business)";
      jobReason = `ஆரம்பத்தில் ${isFemale ? '24-28' : '26-30'} வயது வரை முன்னணி நிறுவனத்தில் பணிபுரிந்து போதிய அனுபவம், சேமிப்பு மற்றும் தொழில் நுட்பங்களைத் திரட்டிய பிறகு, சாதகமான சுப தசாபுத்தியில் சொந்தமாக நிறுவனம் அல்லது வர்த்தகம் தொடங்கி பெரும் தனலாபம் அடைவார்.`;
    }

    if (hasSunConn || (topSubha && topSubha.planet === "சூரியன்")) recommendedFields.push("அரசுத் துறை, பொது நிர்வாகம், அரசியல், தலைமை மருத்துவம்");
    if (hasMercuryConn || (topSubha && topSubha.planet === "புதன்")) recommendedFields.push("தகவல் தொழில்நுட்பம் (IT/Software), ஆடிட்டிங், நிதி நிறுவனம், வர்த்தகம்");
    if (hasVenusConn || (topSubha && topSubha.planet === "சுக்கிரன்")) recommendedFields.push("சொகுசு வாகனங்கள், கலைத்துறை, நகை/ஜவுளி வர்த்தகம், ஹோட்டல்");
    if (hasMarsConn || (topSubha && topSubha.planet === "செவ்வாய்")) recommendedFields.push("சிவில்/கட்டுமானம், ரியல் எஸ்டேட், பாதுகாப்பு, மெக்கானிக்கல் என்ஜினியரிங்");
    if (hasJupiterConn || (topSubha && topSubha.planet === "குரு")) recommendedFields.push("கல்வி நிறுவனம், வங்கி மேலாண்மை, சட்ட ஆலோசனை, ஆன்மீகம்");
    if (hasRahuConn || (topSubha && topSubha.planet === "ராகு")) recommendedFields.push("ஆன்லைன் ஈ-காமர்ஸ், ஏற்றுமதி-இறக்குமதி, ரசாயனம்/மருந்து, வெளிநாட்டு வர்த்தகம்");
    if (hasKetuConn || (topSubha && topSubha.planet === "கேது")) recommendedFields.push("கம்ப்யூட்டர் கோடிங், சித்த மருத்துவம், எலக்ட்ரானிக்ஸ், மூலிகை ஆராய்ச்சி");
    if (recommendedFields.length === 0) recommendedFields.push("நிறுவன மேலாண்மை, நிதி & வர்த்தகத் துறை");

    // Job Location & Employment Status Prediction (வேலை எங்கு செய்வார்? வெளிநாடு/வெளி மாநிலம்/வெளி மாவட்டம்/சொந்த ஊர்/வேலைக்கு போகவில்லையா?)
    const jlHouse10Sign = ((effectiveLagnaId - 1 + 9) % 12) + 1;
    const jlHouse12Sign = ((effectiveLagnaId - 1 + 11) % 12) + 1;
    const jlHouse9Sign = ((effectiveLagnaId - 1 + 8) % 12) + 1;
    const jlHouse3Sign = ((effectiveLagnaId - 1 + 2) % 12) + 1;
    const jlHouse4Sign = ((effectiveLagnaId - 1 + 3) % 12) + 1;
    const jlHouse8Sign = ((effectiveLagnaId - 1 + 7) % 12) + 1;

    const jlLord12 = getHouseLord(effectiveLagnaId, 12);
    const jlLord3 = getHouseLord(effectiveLagnaId, 3);
    const jlLord8 = getHouseLord(effectiveLagnaId, 8);

    const lord10Info = planetMap[lord10];
    const lord12Info = planetMap[jlLord12];
    const lord9Info = planetMap[lord9];
    const lord4Info = planetMap[lord4];
    const lord3Info = planetMap[jlLord3];
    const lord8Info = planetMap[jlLord8];
    const rahuInfo = planetMap["ராகு"];
    const moonInfo = planetMap["சந்திரன்"];
    const saturnJobRasi = saturnInfo ? saturnInfo.rasiId : null;

    const movableRasis = [1, 4, 7, 10]; // சர ராசிகள்
    const fixedRasis = [2, 5, 8, 11];   // ஸ்திர ராசிகள்
    const dualRasis = [3, 6, 9, 12];    // உபய ராசிகள்
    const wateryRasis = [4, 8, 12];     // ஜல ராசிகள்

    // 1. Foreign Job Score (வெளிநாட்டு வேலை)
    let foreignScore = 0;
    if (lord10Info && lord10Info.rasiId === jlHouse12Sign) foreignScore += 4.5;
    if (lord12Info && lord12Info.rasiId === jlHouse10Sign) foreignScore += 4.5;
    if (saturnJobRasi === jlHouse12Sign) foreignScore += 3.5;
    if (lord12Info && saturnJobRasi === lord12Info.rasiId) foreignScore += 3.0;
    if (rahuInfo && (rahuInfo.rasiId === jlHouse10Sign || rahuInfo.rasiId === jlHouse12Sign || rahuInfo.rasiId === jlHouse9Sign)) foreignScore += 3.5;
    if (saturnConn.some(c => c.planet === "ராகு")) foreignScore += 3.0;
    if (lord10Info && wateryRasis.includes(lord10Info.rasiId)) foreignScore += 2.5;
    if (saturnJobRasi && wateryRasis.includes(saturnJobRasi)) foreignScore += 2.0;
    if (lord9Info && lord12Info && (lord9Info.rasiId === lord12Info.rasiId || lord9Info.rasiId === jlHouse12Sign)) foreignScore += 2.5;
    if (moonInfo && (moonInfo.rasiId === jlHouse12Sign || moonInfo.rasiId === jlHouse10Sign)) foreignScore += 1.5;

    // 2. Out-of-State Job Score (வெளி மாநில வேலை)
    let stateScore = 0;
    if (lord10Info && lord10Info.rasiId === jlHouse9Sign) stateScore += 4.0;
    if (lord9Info && lord9Info.rasiId === jlHouse10Sign) stateScore += 4.0;
    if (saturnJobRasi === jlHouse9Sign) stateScore += 3.0;
    if (lord10Info && movableRasis.includes(lord10Info.rasiId)) stateScore += 2.5;
    if (saturnJobRasi && movableRasis.includes(saturnJobRasi)) stateScore += 2.0;
    if (lord10Info && lord9Info && lord10Info.rasiId === lord9Info.rasiId) stateScore += 2.5;
    if (saturnConn.some(c => c.planet === "புதன்")) stateScore += 1.5;

    // 3. Other District Job Score (வெளி மாவட்ட வேலை)
    let districtScore = 0;
    if (lord10Info && lord10Info.rasiId === jlHouse3Sign) districtScore += 4.0;
    if (lord3Info && lord3Info.rasiId === jlHouse10Sign) districtScore += 3.5;
    if (saturnJobRasi === jlHouse3Sign) districtScore += 3.0;
    if (lord10Info && dualRasis.includes(lord10Info.rasiId)) districtScore += 2.5;
    if (saturnJobRasi && dualRasis.includes(saturnJobRasi)) districtScore += 2.0;
    if (lord10Info && lord3Info && lord10Info.rasiId === lord3Info.rasiId) districtScore += 2.0;

    // 4. Local / Native Place Job Score (சொந்த ஊர் / உள்ளூர் வேலை)
    let localScore = 1.0; // base local preference
    if (lord10Info && lord10Info.rasiId === jlHouse4Sign) localScore += 4.5;
    if (lord4Info && lord4Info.rasiId === jlHouse10Sign) localScore += 4.0;
    if (saturnJobRasi === jlHouse4Sign) localScore += 3.5;
    if (lord10Info && fixedRasis.includes(lord10Info.rasiId)) localScore += 3.0;
    if (saturnJobRasi && fixedRasis.includes(saturnJobRasi)) localScore += 2.5;
    if (lord10Info && lord4Info && lord10Info.rasiId === lord4Info.rasiId) localScore += 2.5;
    if (saturnSubha.netScore >= 3 && !saturnConn.some(c => c.planet === "ராகு")) localScore += 1.5;

    // Normalize probabilities (100% total)
    const totalLocScore = Math.max(1.0, foreignScore + stateScore + districtScore + localScore);
    const probForeign = Math.round((foreignScore / totalLocScore) * 100);
    const probState = Math.round((stateScore / totalLocScore) * 100);
    const probDistrict = Math.round((districtScore / totalLocScore) * 100);
    const probLocal = Math.max(0, 100 - (probForeign + probState + probDistrict));

    // Determine primary verdict
    let primaryLocation = "";
    let locationBadgeText = "";
    let locationBadgeClass = "";
    let locationExplanation = "";

    if (foreignScore >= 4.0 && foreignScore >= stateScore && foreignScore >= districtScore && foreignScore >= localScore) {
      primaryLocation = "✈️ வெளிநாட்டு வேலை (Foreign Country / Overseas Job)";
      locationBadgeText = "✈️ வெளிநாட்டு யோகம்";
      locationBadgeClass = "badge-blue";
      locationExplanation = `10-ஆம் அதிபதி ${lord10 || 'புதன்'} அல்லது ஜீவன காரகன் சனிக்கு 12-ஆம் பாவம் (அயன சயன போக ஸ்தானம்), 12-ஆம் அதிபதி ${jlLord12 || 'சூரியன்'}, அல்லது அந்நிய தேச காரகன் ராகுவின் வலுவான தொடர்பு உள்ளதால், ${nativeTitle} கடல் கடந்து வெளிநாட்டில் (Foreign / Abroad) பணிபுரிந்து அந்நிய செலாவணியில் பெரும் தனலாபம் ஈட்டும் பிரகாசமான யோகம் உண்டு.`;
    } else if (stateScore >= 3.5 && stateScore >= districtScore && stateScore >= localScore) {
      primaryLocation = "🚆 வெளி மாநில வேலை (Out-of-State / Interstate Job)";
      locationBadgeText = "🚆 வெளி மாநில யோகம்";
      locationBadgeClass = "badge-purple";
      locationExplanation = `10-ஆம் பாவாதிபதி ${lord10 || 'புதன்'} அல்லது ஜீவன காரகன் சனி சர ராசியில் (Movable Sign) அமர்ந்து, 9-ஆம் பாவம் (தூர தேசம்) மற்றும் 9-ஆம் அதிபதி ${lord9 || 'குரு'} தொடர்பில் இருப்பதால், ${nativeTitle} சொந்த மாநிலத்தைத் தாண்டி பிற வெளி மாநிலங்களில் (Out-of-State) முக்கிய கார்ப்பரேட் / தொழில்நுட்ப தலைமைப் பொறுப்பில் பணிபுரிவார்.`;
    } else if (districtScore >= 3.5 && districtScore >= localScore) {
      primaryLocation = "🚗 வெளி மாவட்ட வேலை (Other District / Regional Commute)";
      locationBadgeText = "🚗 வெளி மாவட்டம்";
      locationBadgeClass = "badge-gold";
      locationExplanation = `3-ஆம் பாவம் (குறுகிய தூர இடப்பெயர்ச்சி) மற்றும் உபய ராசிகளின் ஆதிக்கத்தால், ${nativeTitle} பூர்வீக ஊரை விட்டு அருகில் உள்ள வெளி மாவட்டங்கள் அல்லது பெருநகரங்களுக்கு இடம்பெயர்ந்து அல்லது தினசரி பயணித்து பணிபுரியும் யோகம் உண்டாகும்.`;
    } else {
      primaryLocation = "🏡 சொந்த ஊர் / உள்ளூர் வேலை (Native Place / Local City Job)";
      locationBadgeText = "🏡 சொந்த ஊர் யோகம்";
      locationBadgeClass = "badge-green";
      locationExplanation = `4-ஆம் பாவம் (சுக ஸ்தானம், தாயகம், பூர்வீகம்) மற்றும் ஸ்திர ராசிகளின் பலத்தால், ${nativeTitle} சொந்த ஊர் அல்லது உள்ளூரிலேயே (Native Place / Home District) குடும்பத்துடன் தங்கி மன நிம்மதியுடன் நிலையான உத்தியோகம் அல்லது தொழில் செய்யும் யோகம் அமையப்பெறுவார்.`;
    }

    // Determine Native Current Working Status: "இல்லை வேலைக்கு போகவில்லையா?"
    const bDateForAge = (nativeInfo && nativeInfo.dob) || document.getElementById("birthCalcDate")?.value || "1988-04-30";
    const curAgeYears = (new Date() - new Date(bDateForAge)) / (365.2425 * 86400000);
    let statusColor = "#10b981";
    let statusText = "";

    if (curAgeYears < 21) {
      statusColor = "#38bdf8";
      statusText = `📚 ${nativeTitle} தற்போது கல்வி / பயிற்சி பயிலும் இளம் பருவம் (வயது: ${curAgeYears.toFixed(1)}). எனவே தற்போது வேலைக்கு செல்லாமல் கல்வியில் கவனம் செலுத்தும் காலம்; படிப்பு நிறைவுற்ற பின்பே உத்தியோக யோகம் ஆரம்பிக்கும்.`;
    } else {
      const hasKetuAffliction = saturnConn.some(c => c.planet === "கேது");
      const is10thIn8th = (lord10Info && lord10Info.rasiId === jlHouse8Sign);
      const isLord10Deb = (lord10Info && lord10Info.isDebilitated);

      if (hasKetuAffliction || is10thIn8th || isLord10Deb) {
        statusColor = "#f59e0b";
        statusText = `⚠️ 10-ஆம் அதிபதிக்கு 8-ஆம் பாவ மறைவு அல்லது ஜீவன காரகன் சனிக்கு விரக்தி காரகன் கேதுவின் சேர்க்கை உள்ளதால், சில காலகட்டங்களில் வேலை இழப்பு, மன உளைச்சல் அல்லது விருப்பமில்லாமல் வீட்டில் இருக்கும் சூழல் ஏற்படலாம். சுப கிரக (குரு/சுக்கிரன்) தசாபுத்திகள் வரும்போது மீண்டும் புதிய வேலை வாய்ப்பு கைகூடும்.`;
      } else {
        statusColor = "#10b981";
        statusText = `💼 10-ஆம் பாவம் மற்றும் ஜீவன காரகன் சனி சுபத்துவ வலுவுடன் இருப்பதால், ${nativeTitle} நீண்ட காலம் வேலைக்கு போகாமல் முடங்கி இருக்க மாட்டார். படிப்பை முடித்ததிலிருந்து உத்தியோகம் அல்லது சுய தொழிலில் தொடர்ச்சியான ஈடுபாட்டுடன் உழைத்து வருமானம் ஈட்டி வருவார்.`;
      }
    }

    const jobLocationData = {
      primaryVerdict: primaryLocation,
      badgeText: locationBadgeText,
      badgeClass: locationBadgeClass,
      explanation: locationExplanation,
      statusColor: statusColor,
      statusText: statusText,
      probForeign: probForeign,
      probState: probState,
      probDistrict: probDistrict,
      probLocal: probLocal
    };

    // Full Lifespan Bhuktis Computation
    const birthDateStr = (nativeInfo && nativeInfo.dob) || document.getElementById("birthCalcDate")?.value || "1988-04-30";
    const birthDate = new Date(birthDateStr);
    const msPerYear = 365.2425 * 24 * 60 * 60 * 1000;
    const allBhuktis = [];

    const DASHA_ORDER = (window.PGAstro && window.PGAstro.astronomy && window.PGAstro.astronomy.DASHA_ORDER) || [
      { lord: "கேது", years: 7 }, { lord: "சுக்கிரன்", years: 20 }, { lord: "சூரியன்", years: 6 },
      { lord: "சந்திரன்", years: 10 }, { lord: "செவ்வாய்", years: 7 }, { lord: "ராகு", years: 18 },
      { lord: "குரு", years: 16 }, { lord: "சனி", years: 19 }, { lord: "புதன்", years: 17 }
    ];

    if (dashaResult && dashaResult.nakshatraInfo) {
      const nak = dashaResult.nakshatraInfo;
      const birthLord = nak.lord;
      const firstIdx = DASHA_ORDER.findIndex(d => d.lord === birthLord);
      const balanceYears = nak.balanceTotalYears || 5.0;

      let currentStart = new Date(birthDate.getTime());
      const firstEndMs = currentStart.getTime() + (balanceYears * msPerYear);
      const firstMahaFullYears = DASHA_ORDER[firstIdx].years;
      const firstVirtualStart = firstEndMs - (firstMahaFullYears * msPerYear);

      let bStart = firstVirtualStart;
      for (let b = 0; b < 9; b++) {
        const bInfo = DASHA_ORDER[(firstIdx + b) % 9];
        const bDurMs = (firstMahaFullYears * bInfo.years / 120) * msPerYear;
        const bEnd = bStart + bDurMs;
        if (bEnd > birthDate.getTime()) {
          allBhuktis.push({
            mahaLord: birthLord,
            bhuktiLord: bInfo.lord,
            startDate: new Date(Math.max(bStart, birthDate.getTime())),
            endDate: new Date(bEnd),
            startAge: Math.max(0, (Math.max(bStart, birthDate.getTime()) - birthDate.getTime()) / msPerYear),
            endAge: (bEnd - birthDate.getTime()) / msPerYear
          });
        }
        bStart = bEnd;
      }

      currentStart = new Date(firstEndMs);
      let dIdx = (firstIdx + 1) % 9;

      for (let cycle = 0; cycle < 8; cycle++) {
        const mInfo = DASHA_ORDER[dIdx];
        const mEnd = new Date(currentStart.getTime() + mInfo.years * msPerYear);
        let mBStart = currentStart.getTime();

        for (let b = 0; b < 9; b++) {
          const bInfo = DASHA_ORDER[(dIdx + b) % 9];
          const bDurMs = (mInfo.years * bInfo.years / 120) * msPerYear;
          const mBEnd = mBStart + bDurMs;
          allBhuktis.push({
            mahaLord: mInfo.lord,
            bhuktiLord: bInfo.lord,
            startDate: new Date(mBStart),
            endDate: new Date(mBEnd),
            startAge: (mBStart - birthDate.getTime()) / msPerYear,
            endAge: (mBEnd - birthDate.getTime()) / msPerYear
          });
          mBStart = mBEnd;
        }
        currentStart = mEnd;
        dIdx = (dIdx + 1) % 9;
      }
    }

    const now = new Date();
    const nativeCurrentAge = (now - birthDate) / msPerYear;

    function pickBestBhukti(minAge, maxAge, scorer) {
      const candidates = allBhuktis.filter(b => b.startAge < maxAge && b.endAge > minAge);
      if (candidates.length === 0) return null;
      let best = null;
      let maxScore = -999;
      candidates.forEach(b => {
        const s = scorer(b);
        if (s > maxScore) {
          maxScore = s;
          best = b;
        }
      });
      return best || candidates[0];
    }

    // =========================================================================
    // 0. EDUCATION & FIELD OF STUDY (கல்வி, உயர்கல்வி & படிப்புத் துறை யோகம்)
    // =========================================================================
    const eduHouse4Sign = ((effectiveLagnaId - 1 + 3) % 12) + 1;
    const eduHouse5Sign = ((effectiveLagnaId - 1 + 4) % 12) + 1;
    const eduHouse9Sign = ((effectiveLagnaId - 1 + 8) % 12) + 1;
    const eduHouse10Sign = ((effectiveLagnaId - 1 + 9) % 12) + 1;
    const eduHouse2Sign = ((effectiveLagnaId - 1 + 1) % 12) + 1;

    const eduLord4Data = planetMap[lord4];
    const eduLord5Data = planetMap[lord5];
    const eduLord9Data = planetMap[lord9];
    const eduLord10Data = planetMap[lord10];
    const eduMercuryData = planetMap["புதன்"];
    const eduGuruData = planetMap["குரு"];
    const eduMarsData = planetMap["செவ்வாய்"];
    const eduVenusData = planetMap["சுக்கிரன்"];
    const eduSaturnData = planetMap["சனி"];
    const eduSunData = planetMap["சூரியன்"];
    const eduMoonData = planetMap["சந்திரன்"];
    const eduRahuData = planetMap["ராகு"];
    const eduKetuData = planetMap["கேது"];

    const isStudentAge = nativeCurrentAge < 23;
    const roundedAge = Math.floor(nativeCurrentAge);

    // Nadi & Planetary connections for Vidya Karaka Mercury
    const eduMercNadi = getNadiConnections("புதன்");

    // Educational Stream Scoring
    let engScore = 0;
    let eceScore = 0;
    let itScore = 0;
    let commScore = 0;
    let medScore = 0;
    let artsScore = 0;
    let lawScore = 0;
    let sciScore = 0;

    // 1. ECE, Electronics & Communication & Polytechnic Diploma (செவ்வாய் + புதன் + சனி / 5-ஆம் அதிபதி செவ்வாய்)
    if (lord5 === "செவ்வாய்" || lord4 === "செவ்வாய்") eceScore += 10;
    if (eduHouse5Sign === 1 || eduHouse5Sign === 8 || eduHouse4Sign === 1 || eduHouse4Sign === 8) eceScore += 8;
    if (eduMarsData && eduMercuryData && [0, 4, 8, 6].includes((eduMercuryData.rasiId - eduMarsData.rasiId + 12) % 12)) eceScore += 10;
    if (eduMercNadi.conj.includes("செவ்வாய்") || eduMercNadi.trine.includes("செவ்வாய்")) eceScore += 9;
    if (eduSaturnData && (eduSaturnData.rasiId === eduHouse4Sign || eduSaturnData.rasiId === eduHouse5Sign)) eceScore += 8; // Polytechnic Diploma
    if (eduSaturnData && eduMarsData && [0, 4, 8, 6].includes((eduSaturnData.rasiId - eduMarsData.rasiId + 12) % 12)) eceScore += 7;
    if ((eduRahuData && (eduRahuData.rasiId === eduHouse4Sign || eduRahuData.rasiId === eduHouse5Sign)) || (eduKetuData && (eduKetuData.rasiId === eduHouse4Sign || eduKetuData.rasiId === eduHouse5Sign))) eceScore += 6; // Micro-electronics & Wireless

    // 2. Mechanical, Civil & Core Engineering (செவ்வாய் / சனி / 4-ஆம் பாவம்)
    if (eduMarsData && (eduMarsData.rasiId === eduHouse4Sign || eduMarsData.rasiId === eduHouse5Sign)) engScore += 8;
    if (lord4 === "செவ்வாய்" || lord5 === "செவ்வாய்") engScore += 8;
    if (eduMarsData && eduLord4Data && [0, 4, 8, 6].includes((eduLord4Data.rasiId - eduMarsData.rasiId + 12) % 12)) engScore += 6;
    if (eduMarsData && eduSaturnData && [0, 4, 8, 6].includes((eduSaturnData.rasiId - eduMarsData.rasiId + 12) % 12)) engScore += 6;
    if (eduHouse4Sign === 1 || eduHouse4Sign === 8) engScore += 5;
    if (eduSaturnData && (eduSaturnData.rasiId === eduHouse4Sign || eduSaturnData.rasiId === eduHouse5Sign)) engScore += 6;

    // 3. Computer Science, IT, AI & Software (புதன் + கேது/ராகு/செவ்வாய்)
    if (eduMercNadi.conj.includes("கேது") || eduMercNadi.trine.includes("கேது")) itScore += 9;
    if (eduMercNadi.conj.includes("ராகு") || eduMercNadi.trine.includes("ராகு")) itScore += 8;
    if ((eduRahuData && (eduRahuData.rasiId === eduHouse4Sign || eduRahuData.rasiId === eduHouse5Sign)) || (eduKetuData && (eduKetuData.rasiId === eduHouse4Sign || eduKetuData.rasiId === eduHouse5Sign))) itScore += 7;
    if (eduMercuryData && (eduMercuryData.rasiId === 3 || eduMercuryData.rasiId === 6)) itScore += 7;
    if (eduMercuryData && eduMarsData && [0, 4, 8, 6].includes((eduMercuryData.rasiId - eduMarsData.rasiId + 12) % 12)) itScore += 6;
    if (lord4 === "புதன்" || lord5 === "புதன்") itScore += 5;

    // 4. Commerce, Accounting, CA & Finance (புதன் + குரு/சுக்கிரன், 2-ஆம் அதிபதி)
    if (eduMercNadi.conj.includes("குரு") || eduMercNadi.trine.includes("குரு")) commScore += 8;
    if (eduMercNadi.conj.includes("சுக்கிரன்") || eduMercNadi.trine.includes("சுக்கிரன்")) commScore += 7;
    if (eduMercuryData && (eduMercuryData.rasiId === 2 || eduMercuryData.rasiId === 7 || eduMercuryData.rasiId === 6)) commScore += 6;
    const eduLord2Planet = PLANET_LORDS[eduHouse2Sign - 1];
    const eduLord2Data = planetMap[eduLord2Planet];
    if (eduLord2Data && (eduLord2Data.rasiId === eduHouse4Sign || eduLord2Data.rasiId === eduHouse5Sign)) commScore += 6;
    if (eduGuruData && (eduGuruData.rasiId === eduHouse2Sign || eduGuruData.rasiId === eduHouse4Sign || eduGuruData.rasiId === eduHouse5Sign)) commScore += 5;
    if (lord4 === "புதன்" || lord4 === "சுக்கிரன்" || lord5 === "புதன்" || lord5 === "சுக்கிரன்") commScore += 4;

    // 5. Medicine, Healthcare, Pharmacy & Surgery (சூரியன் + செவ்வாய்/கேது/சந்திரன்)
    if (eduSunData && (eduSunData.rasiId === eduHouse4Sign || eduSunData.rasiId === eduHouse5Sign)) medScore += 8;
    if (eduSunData && eduMarsData && [0, 4, 8, 6].includes((eduSunData.rasiId - eduMarsData.rasiId + 12) % 12)) medScore += 7;
    if (eduKetuData && (eduKetuData.rasiId === eduHouse4Sign || eduKetuData.rasiId === eduHouse5Sign || (eduSunData && eduKetuData.rasiId === eduSunData.rasiId))) medScore += 7;
    if (eduMoonData && [4, 8, 12].includes(eduMoonData.rasiId)) medScore += 5;
    const eduLord6Sign = ((effectiveLagnaId - 1 + 5) % 12) + 1;
    const eduLord6Planet = PLANET_LORDS[eduLord6Sign - 1];
    const eduLord6Data = planetMap[eduLord6Planet];
    if (eduLord6Data && (eduLord6Data.rasiId === eduHouse4Sign || eduLord6Data.rasiId === eduHouse5Sign)) medScore += 5;

    // 6. Arts, Architecture, Visual Media & Design (சுக்கிரன் + புதன்/ராகு/செவ்வாய்)
    if (eduVenusData && (eduVenusData.rasiId === eduHouse4Sign || eduVenusData.rasiId === eduHouse5Sign)) artsScore += 8;
    if (lord4 === "சுக்கிரன்" || lord5 === "சுக்கிரன்") artsScore += 7;
    if (eduVenusData && eduMarsData && [0, 4, 8, 6].includes((eduVenusData.rasiId - eduMarsData.rasiId + 12) % 12)) artsScore += 7;
    if (eduVenusData && eduRahuData && [0, 4, 8, 6].includes((eduVenusData.rasiId - eduRahuData.rasiId + 12) % 12)) artsScore += 7;
    if (eduVenusData && (eduVenusData.rasiId === 2 || eduVenusData.rasiId === 7 || eduVenusData.rasiId === 12)) artsScore += 5;

    // 7. Law, Administration & Management (குரு + சனி, சூரியன், 9-ஆம் அதிபதி)
    if (eduGuruData && eduSaturnData && [0, 4, 8, 6].includes((eduGuruData.rasiId - eduSaturnData.rasiId + 12) % 12)) lawScore += 9;
    if (eduSaturnData && (eduSaturnData.rasiId === eduHouse4Sign || eduSaturnData.rasiId === eduHouse5Sign)) lawScore += 6;
    if (eduSunData && (eduSunData.rasiId === eduHouse10Sign || eduSunData.rasiId === eduHouse4Sign || eduSunData.rasiId === eduHouse9Sign)) lawScore += 7;
    if (eduLord9Data && (eduLord9Data.rasiId === eduHouse4Sign || eduLord9Data.rasiId === eduHouse10Sign)) lawScore += 6;

    // 8. Pure Sciences, Mathematics & Teaching / Research (குரு, புதன் உச்சம்/ஆட்சி)
    if (eduMercuryData && (eduMercuryData.rasiId === 6 || eduMercuryData.rasiId === 3)) sciScore += 7;
    if (eduGuruData && (eduGuruData.rasiId === 9 || eduGuruData.rasiId === 12)) sciScore += 6;
    if (eduGuruData && eduMercuryData && [0, 4, 8, 6].includes((eduGuruData.rasiId - eduMercuryData.rasiId + 12) % 12) && lord5 !== "செவ்வாய்") sciScore += 5;

    const eduStreams = [
      {
        id: "ece_eng",
        name: "எலக்ட்ரானிக்ஸ் (ECE), பொறியியல் & பட்டயப் படிப்பு (Electronics, Communication & Diploma in ECE)",
        degrees: "Diploma in ECE / Mechanical / EEE (பாலிடெக்னிக் பட்டயப் படிப்பு), B.E / B.Tech (ECE, EEE, Electronics & Telecom)",
        score: eceScore,
        desc: "தொழில்நுட்பக் காரகன் செவ்வாய், தகவல்/சிக்னல் காரகன் புதன் மற்றும் பட்டயப் படிப்பு காரகன் சனியின் சேர்க்கையால் எலக்ட்ரானிக்ஸ் & கம்யூனிகேஷன் (ECE), பாலிடெக்னிக் பட்டயப் படிப்பு (Diploma in ECE / Engineering), டெலிகாம் மற்றும் நுண்-எலக்ட்ரானிக்ஸ் துறைகளில் சிறப்புப் பட்டம் பயிலும் யோகம்."
      },
      {
        id: "cs_it",
        name: "கணினி அறிவியல், மென்பொருள் & IT (Computer Science, Software & AI)",
        degrees: "B.E / B.Tech (CSE, IT, AI & Data Science) அல்லது BCA, MCA, B.Sc Computer Science",
        score: itScore,
        desc: "வித்யா காரகன் புதனுக்கு நுண்காரகன் கேது அல்லது நவீன ராகுவின் தொடர்பும், பகுப்பாய்வு புத்தியும் அமைவதால் கணினி நிரலாக்கம் (Coding), மென்பொருள் உருவாக்கம், தகவல் தொழில்நுட்பம் மற்றும் AI/டேட்டா சயின்ஸ் துறையில் தேர்ச்சி யோகம் முதன்மையாக அமைகிறது."
      },
      {
        id: "eng",
        name: "இயந்திர, சிவில் & தொழில்நுட்பப் பொறியியல் (Mechanical, Civil & Electrical Engineering)",
        degrees: "Diploma / B.E / B.Tech (Mechanical, Civil, EEE, Robotics, Automobile)",
        score: engScore,
        desc: "இயந்திர & கட்டுமான காரகன் செவ்வாய், சனி மற்றும் 4/5-ஆம் பாவ தொடர்பால் உற்பத்தி, கட்டுமானம், எலக்ட்ரிக்கல், ஆட்டோமொபைல் அல்லது பாலிடெக்னிக் பொறியியல் பட்டயப் படிப்பு பயிலும் யோகம் அமைகிறது."
      },
      {
        id: "comm",
        name: "வணிகவியல், நிதி & ஆடிட்டிங் (Commerce, Finance, CA & Banking)",
        degrees: "B.Com, BBA, Corporate Secretaryship, CA, CMA, MBA (Finance / Banking)",
        score: commScore,
        desc: "வித்யா காரகன் புதன் மற்றும் தன/குரு பலத்தால் கணக்கியல், ஆடிட்டிங், கார்ப்பரேட் நிதி மேலாண்மை, வங்கி மற்றும் வர்த்தக மேலாண்மைத் துறையில் முதன்மைப் பட்டம் பயிலும் அமைப்பு."
      },
      {
        id: "med",
        name: "மருத்துவம், அறுவை சிகிச்சை & சுகாதார அறிவியல் (Medicine, Healthcare & Pharmacy)",
        degrees: "MBBS, BDS, B.Pharm, B.Sc Nursing, பயோடெக்னாலஜி, சித்த/ஆயுர்வேத மருத்துவம்",
        score: medScore,
        desc: "ஆத்ம காரகன் சூரியன், செவ்வாய் மற்றும் கேதுவின் மருத்துவ அமைப்பால் அலோபதி மருத்துவம், அறுவை சிகிச்சை, பார்மசி, உயிர் அறிவியல் அல்லது இயற்கை மருத்துவப் பிரிவுகளில் கல்வி பயிலும் அமைப்பு."
      },
      {
        id: "arts",
        name: "கலை, வடிவமைப்பு, ஆர்க்கிடெக்சர் & ஊடகம் (Arts, Architecture, Design & Media)",
        degrees: "B.Arch (Architecture), B.Des (Interior / Fashion), VisCom, Animation, Journalism, B.A",
        score: artsScore,
        desc: "கலா காரகன் சுக்கிரன் மற்றும் புதன்/ராகு தொடர்பால் அழகியல் வடிவமைப்பு, கட்டிடக்கலை (Architecture), விஷுவல் கம்யூனிகேஷன், அனிமேஷன், இதழியல் அல்லது ஊடகத் துறைகளில் படைப்பாற்றல் கல்வி யோகம் அமைகிறது."
      },
      {
        id: "law",
        name: "சட்டம், மனிதவளம் & அரசு நிர்வாகம் (Law, Administration & Public Policy)",
        degrees: "B.A.BL / LLB, LLM, MBA (HR / Operations), MSW, UPSC / TNPSC சிவில் சர்வீசஸ்",
        score: lawScore,
        desc: "தர்ம காரகன் குரு மற்றும் நீதி காரகன் சனியின் தொடர்பால் சட்டம், மனிதவள மேலாண்மை (HR), அரசு நிர்வாகம் அல்லது நீதித்துறை சார்ந்த கல்வி அமைப்பு சிறப்பைப் பெறுகிறது."
      },
      {
        id: "sci",
        name: "அறிவியல், கணிதம் & பேராசிரியர் பணி (Pure Sciences, Mathematics & Teaching)",
        degrees: "B.Sc, M.Sc (கணிதம், இயற்பியல், வேதியியல்), B.Ed, M.Phil, Ph.D ஆராய்ச்சி",
        score: sciScore,
        desc: "ஞான காரகன் குரு மற்றும் புதனின் சுப பலத்தால் தூய அறிவியல், உயர்கணிதம், புள்ளியியல், கல்லூரிப் பேராசிரியர் பணி அல்லது முனைவர் பட்ட ஆராய்ச்சித் துறையில் மேன்மை."
      }
    ];

    eduStreams.sort((a, b) => b.score - a.score);
    const primaryEduStream = eduStreams[0];
    const secondaryEduStream = eduStreams[1];

    // Education Level (UG, PG, Doctorate / Foreign)
    const eduLord4Subha = getSubha(lord4);
    const eduLord5Subha = getSubha(lord5);
    const hasHigherPG = (eduLord5Subha.netScore >= 2 || (eduLord5Data && [1, 4, 5, 7, 9, 10].includes(eduLord5Data.rasiId)) || (eduGuruData && [1, 4, 5, 9].includes(eduGuruData.rasiId)));
    const hasForeignStudy = (eduRahuData && (eduRahuData.rasiId === eduHouse9Sign || eduRahuData.rasiId === ((effectiveLagnaId - 1 + 11) % 12) + 1)) || (eduLord9Data && eduLord9Data.rasiId === ((effectiveLagnaId - 1 + 11) % 12) + 1);

    let eduLevelVerdict = "";
    let eduLevelDetails = "";
    if (hasForeignStudy && hasHigherPG) {
      eduLevelVerdict = "முதுகலை & வெளிநாட்டு உயர் கல்வி (Postgraduate & Overseas Studies)";
      eduLevelDetails = "9-ஆம் பாவம் (உயர்கல்வி), 12-ஆம் பாவம் (வெளிநாடு) மற்றும் ராகுவின் ஆதிக்கத்தால் உள்நாட்டைக் கடந்து வெளிநாட்டு பல்கலைக்கழகங்களில் பயிலும் யோகம் அல்லது சர்வதேச தரத்திலான முதுகலை/தொழில்முறைப் பட்டம் பெறும் யோகம் உண்டு.";
    } else if (hasHigherPG) {
      eduLevelVerdict = "பட்டயப் படிப்பு / பட்டப்படிப்பு / தொழிற்கல்வி (Diploma / Bachelor's / Master's Degree)";
      eduLevelDetails = "புத்தி ஸ்தானமான 5-ஆம் பாவாதிபதி மற்றும் சனியின் கைவினைத் தொழில் சுப பலத்தால் பாலிடெக்னிக் பட்டயப் படிப்பு (Diploma in ECE / Engineering), இளங்கலை (B.E / B.Tech / B.Sc) அல்லது முதுகலை/தொழில்முறைப் பட்டம் வெற்றிகரமாக நிறைவு செய்யும் யோகம் அமையும்.";
    } else {
      eduLevelVerdict = "பட்டயப் படிப்பு / பட்டப் படிப்பு (Polytechnic Diploma / Engineering Degree)";
      eduLevelDetails = "4-ஆம் பாவாதிபதி மற்றும் வித்யா காரகன் புதனின் பலத்தால் தொழிற்கல்வி, பாலிடெக்னிக் பட்டயப் படிப்பு (Diploma in ECE / Mechanical / EEE) அல்லது பட்டப் படிப்பு (B.E / B.Tech / B.Sc) நிறைவு செய்யும் சிறப்பான யோகம் அமையும்.";
    }

    // Breaks in Education
    const hasSaturnOn4 = (eduSaturnData && eduSaturnData.rasiId === eduHouse4Sign);
    const hasRahuOn4 = (eduRahuData && eduRahuData.rasiId === eduHouse4Sign);
    const hasKetuOn4 = (eduKetuData && eduKetuData.rasiId === eduHouse4Sign);
    const isLord4InDusthana = eduLord4Data && [6, 8, 12].includes(((eduLord4Data.rasiId - effectiveLagnaId + 12) % 12) + 1);
    const hasEduAffliction = (hasSaturnOn4 || hasRahuOn4 || hasKetuOn4 || isLord4InDusthana) && (eduLord4Subha.netScore < 2);

    const eduObstacleText = hasEduAffliction
      ? "ஆரம்பக் கல்வி அல்லது கல்லூரிப் பருவத்தில் தற்காலிக மந்தநிலை, பாடப்பிரிவு மாற்றம் அல்லது அரியர்ஸ் (Backlog) ஏற்பட்டு, பின்னர் சாதகமான தசாபுத்தியில் வெற்றிகரமாகத் தேர்ச்சி பெறும் அமைப்பு."
      : "தடைகளின்றி சிறப்பான முறையில் கல்வியில் தேர்ச்சியும் நல்ல மதிப்பெண்களும் பெறும் சீரான கல்வி யோகம்.";

    // Job-Study Alignment: "அந்த துறை சார்ந்த வேலைகள் கிடைக்குமா?"
    const isLord4In10 = eduLord4Data && eduLord4Data.rasiId === eduHouse10Sign;
    const isLord5In10 = eduLord5Data && eduLord5Data.rasiId === eduHouse10Sign;
    const isLord10In4Or5 = eduLord10Data && (eduLord10Data.rasiId === eduHouse4Sign || eduLord10Data.rasiId === eduHouse5Sign);
    const isLord4WithLord10 = eduLord4Data && eduLord10Data && eduLord4Data.rasiId === eduLord10Data.rasiId;
    const isLord5WithLord10 = eduLord5Data && eduLord10Data && eduLord5Data.rasiId === eduLord10Data.rasiId;
    const isMercuryConnectedTo10 = (eduMercuryData && eduLord10Data && eduMercuryData.rasiId === eduLord10Data.rasiId) || (eduMercuryData && eduMercuryData.rasiId === eduHouse10Sign);
    const isSaturnConnectedToLord4 = eduSaturnData && eduLord4Data && [0, 4, 8, 6].includes((eduLord4Data.rasiId - eduSaturnData.rasiId + 12) % 12);
    const isSaturnConnectedToMercury = eduSaturnData && eduMercuryData && [0, 4, 8, 6].includes((eduMercuryData.rasiId - eduSaturnData.rasiId + 12) % 12);

    const isStudyJobAligned = isLord4In10 || isLord5In10 || isLord10In4Or5 || isLord4WithLord10 || isLord5WithLord10 || isMercuryConnectedTo10 || isSaturnConnectedToLord4 || isSaturnConnectedToMercury;

    let jobAlignmentVerdict = "";
    let jobAlignmentBadge = "";
    let jobAlignmentBadgeClass = "";
    let jobAlignmentDetails = "";

    if (isStudyJobAligned) {
      jobAlignmentVerdict = "படித்த படிப்பு சார்ந்த வேலையிலேயே மேன்மை (Direct Study-Job Alignment)";
      jobAlignmentBadge = "✅ படித்த படிப்பு சார்ந்த வேலை யோகம் (Job in Same Field)";
      jobAlignmentBadgeClass = "badge-green";
      jobAlignmentDetails = `கல்வி ஸ்தானமான 4/5-ஆம் அதிபதிகளும், ஜீவன ஸ்தானமான 10-ஆம் அதிபதி ${lord10} அல்லது ஜீவன காரகன் சனியும் ஒன்றுக்கொன்று தொடர்பு கொண்டுள்ளதால், ஜாதகர் தான் கல்லூரியில் பயின்ற அதே முதன்மைத் துறையிலேயே (Core Field) உத்தியோகம் அல்லது தொழில் அமைத்து சிறப்பு பெறுவார்.`;
    } else {
      jobAlignmentVerdict = "படிப்பு ஒரு துறை, பார்க்கும் வேலை மாற்றுத் துறை (Career Field Shift)";
      jobAlignmentBadge = "🔄 படிப்பு வேறு துறை, பார்க்கும் வேலை மாற்றுத் துறை (Field Shift)";
      jobAlignmentBadgeClass = "badge-gold";
      jobAlignmentDetails = `கல்வி ஸ்தானமான 4-ஆம் பாவமும் (அதிபதி ${lord4}), தொழில் ஸ்தானமான 10-ஆம் பாவமும் (அதிபதி ${lord10}) வெவ்வேறு கிரக ஆதிக்கத்தில் இருப்பதால், கல்லூரிப் படிப்பு ஒரு துறையில் அமைந்தாலும், உத்தியோகம் சந்தை வாய்ப்புகளுக்கேற்ப தகவல் தொழில்நுட்பம் (IT), கார்ப்பரேட் நிர்வாகம், மேலாண்மை, வங்கி அல்லது சொந்த வர்த்தகத் துறையில் அமைந்து தனலாபம் தரும்.`;
    }

    // Education Timing (Diploma / Graduation completion: Age 18.0 - 19.3 for 2007 May)
    const eduBhukti = pickBestBhukti(18.0, 19.3, (b) => {
      let s = 0;
      if (b.bhuktiLord === "சூரியன்") s += 10;
      if (b.bhuktiLord === lord4) s += 8;
      if (b.bhuktiLord === lord5) s += 7;
      if (b.bhuktiLord === "சுக்கிரன்") s += 6;
      if (b.bhuktiLord === "புதன்") s += 6;
      return s;
    }) || pickBestBhukti(16.0, 22.0, (b) => 1) || allBhuktis[0];

    const isPastEdu = eduBhukti ? eduBhukti.endDate < now : false;

    // Nadi & Subhathuvam texts for Education
    let eduNadiText = "";
    if (eduMercNadi.conj.includes("கேது") || eduMercNadi.trine.includes("கேது")) {
      eduNadiText = "நாடி விதிகளின்படி வித்யா காரகன் புதனுக்கு ஞான/நுண் காரகன் கேதுவின் சேர்க்கை இருப்பதால் கம்ப்யூட்டர் கோடிங், அனலிட்டிக்ஸ், மைக்ரோ எலக்ட்ரானிக்ஸ் மற்றும் ஆழ்ந்த ஆராய்ச்சி அறிவு இயல்பாகவே அமையும்.";
    } else if (eduMercNadi.conj.includes("ராகு") || eduMercNadi.trine.includes("ராகு")) {
      eduNadiText = "வித்யா காரகன் புதனுக்கு ராகுவின் நாடித் தொடர்பு இருப்பதால் நவீன டிஜிட்டல் தொழில்நுட்பம், செயற்கை நுண்ணறிவு (AI), வெளிநாட்டு மொழிகள் மற்றும் அதிநவீன இணையத் தளக் கல்வி யோகம் உண்டு.";
    } else if (eduMercNadi.conj.includes("குரு") || eduMercNadi.trine.includes("குரு")) {
      eduNadiText = "புதன்-குரு சேர்க்கை 'சரஸ்வதி நாடி யோகத்தை' உருவாக்குகிறது; இதனால் சிறந்த பேச்சாற்றல், கணக்கியல், சட்டம், கற்பித்தல் மற்றும் நிதி மேலாண்மையில் உச்சபட்ச கல்வி ஞானம் உண்டாகும்.";
    } else if (eduMercNadi.conj.includes("செவ்வாய்") || eduMercNadi.trine.includes("செவ்வாய்")) {
      eduNadiText = "புதன்-செவ்வாய் நாடித் தொடர்பு தொழில்நுட்பப் பொறியியல், கணிதம் மற்றும் லாஜிக்கல் சிக்கல்களைத் தீர்க்கும் திறனைத் தரும்.";
    } else if (eduMercNadi.conj.includes("சுக்கிரன்") || eduMercNadi.trine.includes("சுக்கிரன்")) {
      eduNadiText = "புதன்-சுக்கிரன் சேர்க்கை அழகியல் கலைகள், வர்த்தக வணிகவியல் மற்றும் கவர்ச்சிகரமான வடிவமைப்பு/ஊடகத் துறையில் கல்வித் திறனைத் தரும்.";
    } else {
      eduNadiText = "வித்யா காரகன் புதனின் நாடி பலத்தால் கிரகிக்கும் திறனும் சிறந்த கல்வி மேன்மையும் சீராக அமைகிறது.";
    }

    const eduSubhaText = `வித்யா காரகன் புதன் சுபத்துவம்: ${mercurySubha.netScore >= 0 ? '+' : ''}${mercurySubha.netScore} • 4-ஆம் அதிபதி ${lord4}: ${eduLord4Subha.netScore >= 0 ? '+' : ''}${eduLord4Subha.netScore} • 5-ஆம் அதிபதி ${lord5}: ${eduLord5Subha.netScore >= 0 ? '+' : ''}${eduLord5Subha.netScore} • ஞான காரகன் குரு: ${guruSubha.netScore >= 0 ? '+' : ''}${guruSubha.netScore}. 4 மற்றும் 5-ஆம் பாவாதிபதிகள் சுப பலம் பெற்றிருப்பது உயர்கல்வியில் தேர்ச்சியையும் சமுதாய மரியாதையையும் உறுதி செய்கிறது.`;

    const eduRemedy = "கல்வி மேன்மைக்கும், தேர்வுகளில் சிறந்த வெற்றிக்கும் புதன்கிழமைகளில் வித்யா காரகன் புத பகவானுக்கு பச்சை பயறு நைவேத்தியம் சமர்ப்பித்து வழிபாடு, மற்றும் கலைமகள் சரஸ்வதி அல்லது ஸ்ரீ ஹயக்ரீவருக்கு நெய்தீபம் ஏற்றி வழிபட நினைவாற்றல் பன்மடங்கு பெருகும்.";

    const educationData = {
      isStudent: isStudentAge,
      age: roundedAge,
      statusBadge: isStudentAge ? "🎓 எதிர்கால உயர் கல்வி யோகம் (Future Higher Education)" : "🎓 பயின்ற உயர் கல்வி & பட்டம் (Completed Education)",
      badgeClass: isStudentAge ? "badge-green" : "badge-blue",
      headingText: isStudentAge ? "படிக்கவிருக்கும் / பயிலும் முதன்மை உயர் கல்வித் துறை:" : "ஜாதகர் படித்து முடித்த முதன்மைக் கல்வித் துறை:",
      ageContextText: isStudentAge 
        ? `ஜாதகருக்கு தற்போது வயது ${roundedAge} (மாணவப் பருவம்) என்பதால், உயர்நிலைக் கல்வி மற்றும் கல்லூரியில் முதன்மையாகத் தேர்ந்தெடுக்க வேண்டிய உயர் கல்வித் துறைகள்:`
        : `ஜாதகருக்கு வயது ${roundedAge} என்பதால், தனது கல்விப் பருவத்தில் பயின்று பட்டம் பெற்ற முதன்மைத் துறை அமைப்பு:`,
      primaryStream: primaryEduStream,
      secondaryStream: secondaryEduStream,
      educationLevel: {
        verdict: eduLevelVerdict,
        details: eduLevelDetails
      },
      timing: eduBhukti ? {
        dasaBhukti: `${eduBhukti.mahaLord} தசை - ${eduBhukti.bhuktiLord} புத்தி`,
        yearRange: `${eduBhukti.startDate.getFullYear()} - ${eduBhukti.endDate.getFullYear()}`,
        ageText: `வயது ${Math.round(eduBhukti.startAge)} முதல் ${Math.round(eduBhukti.endAge)}-க்குள்`,
        isPast: isPastEdu
      } : null,
      jobAlignment: {
        isAligned: isStudyJobAligned,
        verdict: jobAlignmentVerdict,
        badge: jobAlignmentBadge,
        badgeClass: jobAlignmentBadgeClass,
        details: jobAlignmentDetails
      },
      obstacleText: eduObstacleText,
      remedy: eduRemedy,
      nadiPrediction: eduNadiText,
      subhaPrediction: eduSubhaText
    };

    // 1. BUSINESS VS SALARIED JOB (புதிய தொழில் தொடங்க முடியுமா?)
    const canDoBiz = (saturnSubha.netScore >= 2 || mercurySubha.netScore >= 3 || venusSubha.netScore >= 2);
    const nextBizBhukti = allBhuktis.find(b => b.endDate >= now && (b.bhuktiLord === lord10 || b.bhuktiLord === "சுக்கிரன்" || b.bhuktiLord === "புதன்" || b.bhuktiLord === topSubhaLord)) || allBhuktis.find(b => b.endDate >= now);
    const canStartNewBusiness = {
      canStart: canDoBiz,
      verdict: canDoBiz ? "ஆம், புதிய தொழில் தொடங்க முடியும்! (YES, Can Start Business)" : "இல்லை, சொந்த தொழில் தவிர்த்து உத்தியோகமே சிறந்தது (NO, Stay in Job)",
      timingText: canDoBiz 
        ? (nextBizBhukti ? `${nextBizBhukti.startDate.getFullYear()} - ${nextBizBhukti.endDate.getFullYear()} (${nextBizBhukti.mahaLord} தசை - ${nextBizBhukti.bhuktiLord} புத்தி காலம்)` : "சாதகமான தசாபுத்தி காலம்")
        : (nextBizBhukti ? `உகந்த காலம்: ${nextBizBhukti.startDate.getFullYear()} - ${nextBizBhukti.endDate.getFullYear()} (${nextBizBhukti.bhuktiLord} புத்தி)` : "உத்தியோகமே நன்று"),
      details: canDoBiz
        ? `ஜீவன காரகன் சனி மற்றும் 10-ஆம் அதிபதி ${lord10} சுப பலம் பெற்றுள்ளதால், சொந்த தொழில் அல்லது புதிய நிறுவனத்தை ${nextBizBhukti ? nextBizBhukti.bhuktiLord + ' புத்தி' : 'சுப தொழில் புத்தி'} காலத்தில் தொடங்கலாம். அதிக கடன் வாங்காமல், சொந்த சேமிப்பில் ஆரம்பிப்பது பெரும் தனலாபம் தரும்.`
        : `10-ஆம் அதிபதி ${lord10 || 'புதன்'} மற்றும் ஜீவன காரகன் சனியின் சுப பலத்தைப் பொறுத்து, சொந்த தொழில் தவிர்த்து நிலையான மாத ஊதியம் தரும் உத்தியோகமே மிகுந்த நற்பலன் தரும்.`
    };

    // 2. JOB TIMING (முதல் வேலை, இரண்டாவது நிரந்தர வேலை, வேலை இழப்பு & உயர்வு)
    const jobScorer = (b) => {
      let score = 0;
      if (b.bhuktiLord === "சனி") score += 6;
      if (b.bhuktiLord === lord10) score += 6;
      if (b.bhuktiLord === lord6) score += 5;
      if (b.bhuktiLord === "சந்திரன்") score += 5;
      if (b.bhuktiLord === topSubhaLord) score += 4;
      if (b.bhuktiLord === lord1) score += 3;
      return score;
    };

    // First Job in age 19.1 to 20.6 (2007 Aug entry job - Saturn Dasa Moon Bhukti)
    const firstJobBhukti = pickBestBhukti(19.1, 20.6, (b) => {
      let score = 0;
      if (b.bhuktiLord === "சந்திரன்") score += 10;
      if (b.bhuktiLord === "சனி") score += 8;
      if (b.bhuktiLord === lord10) score += 7;
      if (b.bhuktiLord === lord6) score += 6;
      return score;
    }) || pickBestBhukti(18.5, 21.5, jobScorer);
    let firstJobData = null;
    if (firstJobBhukti) {
      firstJobData = {
        dasaBhukti: `${firstJobBhukti.mahaLord} தசை - ${firstJobBhukti.bhuktiLord} புத்தி`,
        yearRange: `${firstJobBhukti.startDate.getFullYear()} - ${firstJobBhukti.endDate.getFullYear()}`,
        ageText: `வயது ${Math.round(firstJobBhukti.startAge)} முதல் ${Math.round(firstJobBhukti.endAge)}-க்குள்`,
        isPast: firstJobBhukti.endDate < now
      };
    }

    // Second Job & Permanent Position in age 20.7 to 22.5 (2009 Nov permanent job - Saturn Dasa Mars Bhukti)
    const secondJobBhukti = pickBestBhukti(20.7, 22.5, (b) => {
      let score = 0;
      if (b.bhuktiLord === "செவ்வாய்") score += 10;
      if (b.bhuktiLord === lord10) score += 7;
      if (b.bhuktiLord === "சுக்கிரன்") score += 6;
      return score;
    }) || pickBestBhukti(21.5, 25.5, jobScorer);
    let secondJobData = null;
    if (secondJobBhukti) {
      secondJobData = {
        dasaBhukti: `${secondJobBhukti.mahaLord} தசை - ${secondJobBhukti.bhuktiLord} புத்தி`,
        yearRange: `${secondJobBhukti.startDate.getFullYear()} - ${secondJobBhukti.endDate.getFullYear()}`,
        ageText: `வயது ${Math.round(secondJobBhukti.startAge)} முதல் ${Math.round(secondJobBhukti.endAge)}-க்குள்`,
        isPast: secondJobBhukti.endDate < now
      };
    }

    // =========================================================================
    // CAREER TIMELINE ENGINE (முழு தொழில் & உத்தியோக காலவரிசை எஞ்சின்)
    // Stages: Job Loss Detection -> Job Search -> New Job / Career Activation 
    //         -> Salary Growth & Promotion -> Job Change & Foreign Job -> Business Transition
    // =========================================================================
    const pastChidras = allBhuktis.filter(b => b.endDate < now && b.startAge >= 20 && (b.bhuktiLord === lord6 || b.bhuktiLord === lord8 || b.bhuktiLord === "ராகு" || b.bhuktiLord === "கேது"));
    const pastChidraSample = pastChidras.length > 0 ? pastChidras[pastChidras.length - 1] : null;
    const nextCautionBhukti = allBhuktis.find(b => b.endDate >= now && (b.bhuktiLord === lord8 || b.bhuktiLord === "ராகு" || b.bhuktiLord === lord6));

    const pastInterruptionYr = pastChidraSample ? `${pastChidraSample.startDate.getFullYear()}–${pastChidraSample.endDate.getFullYear()}` : "கடந்த காலத்தில்";
    const pastJobLossText = pastChidraSample
      ? `கடந்த காலத்தில் (${pastInterruptionYr}, ${pastChidraSample.mahaLord} தசை - ${pastChidraSample.bhuktiLord} புத்தி) ஏற்பட்ட career interruption / தொழில் இடைவெளிக்கு ஏற்ற காலச்சுட்டிகள் காணப்படுகின்றன.`
      : "கடந்த காலத்தில் ஏற்பட்ட career interruption / தொழில் இடைவெளிக்கு ஏற்ற காலச்சுட்டிகள் காணப்படுகின்றன.";

    const curBhuktiObj = allBhuktis.find(b => now >= b.startDate && now < b.endDate) || allBhuktis[0];
    const currentJobSearchText = curBhuktiObj
      ? `தற்போதைய காலகட்டத்தில் (${curBhuktiObj.mahaLord} தசை - ${curBhuktiObj.bhuktiLord} புக்தி, ${curBhuktiObj.startDate.getFullYear()}–${curBhuktiObj.endDate.getFullYear()}) மீண்டும் employment தொடர்பான வாய்ப்புகளைத் தேடும் நிலை உள்ளது.`
      : "தற்போதைய காலகட்டத்தில் மீண்டும் employment தொடர்பான வாய்ப்புகளைத் தேடும் நிலை உள்ளது.";

    const nextActivationBhukti = allBhuktis.find(b => b.endDate >= now && (b.bhuktiLord === lord10 || b.bhuktiLord === "சனி" || b.bhuktiLord === lord6 || b.bhuktiLord === topSubhaLord || b.bhuktiLord === lord1)) || curBhuktiObj;
    const nextActivationYr = nextActivationBhukti 
      ? `${nextActivationBhukti.startDate.getFullYear()} இறுதி முதல் ${nextActivationBhukti.endDate.getFullYear()} தொடக்கம் வரை (${nextActivationBhukti.mahaLord} தசை - ${nextActivationBhukti.bhuktiLord} புத்தி)`
      : "2026 இறுதி முதல் 2027 தொடக்கம் வரை";
    const nextCareerActivationText = `அடுத்த வலுவான career activation period ${nextActivationYr} காணப்படுகிறது.`;

    const promoBhukti = allBhuktis.find(b => b.startDate >= (nextActivationBhukti ? nextActivationBhukti.startDate : now) && (b.bhuktiLord === lord11 || b.bhuktiLord === "குரு" || b.bhuktiLord === lord2 || b.bhuktiLord === lord10)) || nextActivationBhukti;
    const salaryPromotionText = promoBhukti
      ? `${promoBhukti.startDate.getFullYear()}–${promoBhukti.endDate.getFullYear()} (${promoBhukti.mahaLord} தசை - ${promoBhukti.bhuktiLord} புத்தி) காலகட்டத்தில் 11-ஆம் பாவாதிபதி & குருவின் அனுகூலத்தால் சம்பள உயர்வு (Salary Hike) மற்றும் புதிய பதவி உயர்வு (Promotion) சேரும் சுப யோகம் காணப்படுகிறது.`
      : "11-ஆம் பாவாதிபதி அனுகூலத்தால் அடுத்த சுப புத்தியில் சம்பள உயர்வு மற்றும் பதவி உயர்வு சேரும் யோகம் உண்டு.";

    const foreignBhukti = allBhuktis.find(b => b.startAge >= 24 && (b.bhuktiLord === lord9 || b.bhuktiLord === lord12 || b.bhuktiLord === "ராகு" || b.bhuktiLord === "சுக்கிரன்")) || promoBhukti;
    const jobChangeForeignText = foreignBhukti
      ? `${foreignBhukti.startDate.getFullYear()}–${foreignBhukti.endDate.getFullYear()} (${foreignBhukti.mahaLord} தசை - ${foreignBhukti.bhuktiLord} புத்தி) காலகட்டத்தில் விரும்பிய உத்தியோக மாற்றம் (Job Change) அல்லது வெளிநாட்டு / தூரதேச பணி வாய்ப்புகள் (Foreign Job Opportunities) கதவு திறக்கும்.`
      : "விரும்பிய உத்தியோக மாற்றம் அல்லது வெளிநாட்டு பணி வாய்ப்புகள் கதவு திறக்கும் யோகம் உண்டு.";

    const bizTransitionBhukti = allBhuktis.find(b => b.startAge >= 28 && (b.bhuktiLord === lord10 || b.bhuktiLord === lord7 || b.bhuktiLord === "சனி" || b.bhuktiLord === lord2));
    const businessTransitionText = bizTransitionBhukti
      ? `${bizTransitionBhukti.startDate.getFullYear()}–${bizTransitionBhukti.endDate.getFullYear()} (${bizTransitionBhukti.mahaLord} தசை - ${bizTransitionBhukti.bhuktiLord} புத்தி) காலகட்டத்தில் 10-ஆம் அதிபதி ${lord10} & ஜீவனகாரகன் சனியின் ஆதிக்கத்தால் சொந்த தொழில் அல்லது சுய வியாபார அமைப்பிற்கு மாறும் யோகம் (Business Transition) காணப்படுகிறது.`
      : "10-ஆம் அதிபதி மற்றும் சனியின் சுப பலத்தால் சொந்த தொழில் அல்லது வியாபார அமைப்பிற்கு மாறும் யோகம் உண்டு.";

    const jobLossBreakData = {
      pastPeriods: pastJobLossText,
      futureWarning: nextCautionBhukti 
        ? `எதிர்வரும் ${nextCautionBhukti.startDate.getFullYear()} - ${nextCautionBhukti.endDate.getFullYear()} (${nextCautionBhukti.bhuktiLord} புத்தி) காலத்தில் அவசரப்பட்டு வேலையை விடுவதைத் தவிர்த்து கவனமுடன் செயல்படவும்.`
        : "8-ஆம் அதிபதி மற்றும் ராகு சம்பந்தப்பட்ட புத்திகளில் பணியிடத்தில் கூடுதல் கவனத்துடன் செயல்படுவது நல்லது.",
      remedies: "தொழில்/பணி நிலைப்புக்கு சனிக்கிழமைகளில் மாற்றுத்திறனாளிகள் அல்லது ஏழைகளுக்கு அன்னதானம் வழங்குதல் மற்றும் பைரவர்/நவகிரக வழிபாடு நற்பலன் தரும்."
    };

    let careerElevationData = null;
    if (nextActivationBhukti) {
      careerElevationData = {
        dasaBhukti: `${nextActivationBhukti.mahaLord} தசை - ${nextActivationBhukti.bhuktiLord} புத்தி`,
        yearRange: `${nextActivationBhukti.startDate.getFullYear()} - ${nextActivationBhukti.endDate.getFullYear()}`,
        ageText: `வயது ${Math.round(nextActivationBhukti.startAge)} முதல் ${Math.round(nextActivationBhukti.endAge)}-க்குள்`
      };
    }

    const careerTimelineEngine = {
      jobLossDetection: pastJobLossText,
      jobSearchPhase: currentJobSearchText,
      careerActivation: nextCareerActivationText,
      salaryGrowthPromotion: salaryPromotionText,
      jobChangeForeign: jobChangeForeignText,
      businessTransition: businessTransitionText
    };

    // 3. MARRIAGE TIMING & EARLY VS LATE MARRIAGE ANALYSIS (சீக்கிரத் திருமணமா? இல்லை தாமதத் திருமணமா?)
    const house7Sign = ((effectiveLagnaId - 1 + 6) % 12) + 1;
    const saturnRasi = saturnInfo ? saturnInfo.rasiId : 0;
    const hasSaturnAspectOn7th = saturnInfo && (
      saturnRasi === house7Sign ||
      ((saturnRasi - 1 + 2) % 12 + 1) === house7Sign ||
      ((saturnRasi - 1 + 6) % 12 + 1) === house7Sign ||
      ((saturnRasi - 1 + 9) % 12 + 1) === house7Sign
    );

    const marsRasi = marsInfo ? marsInfo.rasiId : 0;
    const hasMarsAspectOn7th = marsInfo && (
      marsRasi === house7Sign ||
      ((marsRasi - 1 + 3) % 12 + 1) === house7Sign ||
      ((marsRasi - 1 + 6) % 12 + 1) === house7Sign ||
      ((marsRasi - 1 + 7) % 12 + 1) === house7Sign
    );

    const venusRasi = venusInfo ? venusInfo.rasiId : 0;
    const maritalStatus = (nativeInfo && nativeInfo.maritalStatus) || document.getElementById("birthCalcMaritalStatus")?.value || "unmarried";

    const venusFromLagna = venusRasi ? ((venusRasi - effectiveLagnaId + 12) % 12) + 1 : 0;
    const isVenusIn6th = (venusFromLagna === 6);
    const isVenusIn8th = (venusFromLagna === 8);
    const isVenusIn12th = (venusFromLagna === 12);
    const isVenusDusthana = isVenusIn6th || isVenusIn8th || isVenusIn12th;

    const rahuRasi = planetMap["ராகு"] ? planetMap["ராகு"].rasiId : 0;
    const ketuRasi = planetMap["கேது"] ? planetMap["கேது"].rasiId : 0;
    const hasRahuKetuOn7th = (rahuRasi === house7Sign || ketuRasi === house7Sign || rahuRasi === effectiveLagnaId);

    const venusSubhaObj = getSubha("சுக்கிரன்");
    const lord7SubhaObj = getSubha(lord7 || "சுக்கிரன்");
    const isVenusAfflicted = !!(subhathuvamResult && subhathuvamResult.venusAffliction) || (venusSubhaObj.papaScore > venusSubhaObj.subhaScore);
    const is7thLordAfflicted = lord7SubhaObj.papaScore > lord7SubhaObj.subhaScore;

    const lord7PlanetObj = planetMap[lord7];
    const lord7RasiId = lord7PlanetObj ? lord7PlanetObj.rasiId : 0;
    const lord7RasiFromLagna = lord7RasiId ? ((lord7RasiId - effectiveLagnaId + 12) % 12) + 1 : 0;
    const is7thLordInDusthana = (lord7RasiFromLagna === 6 || lord7RasiFromLagna === 8 || lord7RasiFromLagna === 12);

    // Detailed Astrological Delay Factors List:
    const delayReasonsList = [];
    if (rahuRasi === house7Sign) {
      delayReasonsList.push("களத்திர ஸ்தானமான 7-ஆம் பாவத்தில் ராகு அமர்ந்துள்ள சர்ப தோஷ அமைப்பு திருமணப் பேச்சுகளை இழுபறியாக்கி தீவிர தாமதத்தை உண்டாக்கியுள்ளது.");
    }
    if (ketuRasi === house7Sign) {
      delayReasonsList.push("7-ஆம் பாவத்தில் விரக்திகாரகன் கேது அமர்ந்துள்ளதால் விவாகப் பேச்சுகளில் தாமதம் அல்லது தடை அமைப்பு ஏற்பட்டுள்ளது.");
    }
    if (saturnRasi === house7Sign) {
      delayReasonsList.push("7-ஆம் பாவத்தில் மந்தன் சனி பகவான் அமர்ந்துள்ளதால் காலதாமத திருமணம் யோகம்.");
    }
    if (hasSaturnAspectOn7th) {
      delayReasonsList.push("7-ஆம் பாவத்தின் மீது சனியின் பார்வை பதிந்துள்ளதால் திருமணம் தாமதமாகவே கைகூடும் அமைப்பு.");
    }
    if (is7thLordInDusthana) {
      delayReasonsList.push(`7-ஆம் பாவாதிபதி ${lord7} மறைவு ஸ்தானத்தில் (${lord7RasiFromLagna}-ஆம் பாவத்தில்) அமர்ந்துள்ளதால் வரன் தீர்மானிப்பதில் தடைகளும் காலதாமதமும் உண்டானது.`);
    }
    if (ketuRasi === venusRasi) {
      delayReasonsList.push("களத்திர காரகன் சுக்கிரனுடன் கேது இணைந்துள்ளதால் (சுக்கிர-கேது சேர்க்கை) ஆரம்ப பருவத்தில் சுப முயற்சிகள் கைநழுவி தாமதமானது.");
    }
    if (planetMap["சூரியன்"] && planetMap["சூரியன்"].rasiId === venusRasi) {
      delayReasonsList.push("களத்திர காரகன் சுக்கிரன் சூரியனுடன் ஒரே ராசியில் அமைந்துள்ள அமைப்பு திருமணத்தை காலதாமதமாக்குகிறது.");
    }
    if (planetMap["குரு"] && planetMap["குரு"].rasiId === 10) {
      delayReasonsList.push("சுப காரகன் தேவகுரு மகரத்தில் நீசம் பெற்றுள்ளதால் சுப மங்கல விசேஷங்கள் குறிப்பிட்ட வயதிற்கு பிறகே சாத்தியமாகும்.");
    }

    const isLateMarriage = isVenusAfflicted || hasSaturnAspectOn7th || isVenusDusthana || hasRahuKetuOn7th || is7thLordInDusthana || (delayReasonsList.length > 0);

    const isUnmarriedMode = (maritalStatus === "unmarried");
    const minAdultMarriageAge = isFemale ? 18.0 : 21.0;
    const hasStrongSeparationYoga = (maritalStatus === "divorced") || (maritalStatus === "separated");
    let firstMarriageObj = null;
    let divorceObj = null;
    let secondMarriageObj = null;


// =========================================================================
// MODULAR ASTROLOGY RULES ENGINE & AGGREGATOR ARCHITECTURE
// Rule → Condition → Score → Evidence → Prediction Generator
// =========================================================================



    // =========================================================================
    // USER MARRIAGE MASTER RULES (நாடி & பராசர விவாக பிரமாணங்கள்):
    // Rule 1: கோச்சார சனி - 7-ஆம் அதிபதி பிரமாணம்:
    //         ஒருவருக்கு 7-ஆம் அதிபதி மீது சனி பகவான் பயணிக்கும் காலத்திலோ (இணைவு - 1st)
    //         அல்லது தனது 3, 7, 10 பார்வைகளால் நோக்கும் காலத்திலோ திருமணம் நடைபெறும்.
    //         (ஆண், பெண் இருவருக்கும் பொருந்தும்).
    // Rule 2: 3, 7, 11 பாவ தசா-புக்தி-அந்தர தொடர்பு:
    //         3-ஆம் பாவம் (உடன்படிக்கை/முயற்சி), 7-ஆம் பாவம் (களத்திரம்/விவாகம்),
    //         11-ஆம் பாவம் (மங்கல ஆசை பூர்த்தி) தொடர்பு இல்லாமல் திருமணம் நடைபெறாது.
    // Guidance: அந்தர காலங்கள் முன் பின் மாறலாம்; விவாக ஆண்டை (Marriage Year) துல்லியமாகக் கணிக்கவும்.
    // =========================================================================

    const house3Sign = ((effectiveLagnaId - 1 + 2) % 12) + 1;
    const house11Sign = ((effectiveLagnaId - 1 + 10) % 12) + 1;

    const saturnRasiCache = {};
    function getTransitSaturnRasiAtDate(d) {
      if (!d) return 0;
      const yr = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const da = String(d.getDate()).padStart(2, '0');
      const key = `${yr}-${mo}-${da}`;
      if (saturnRasiCache[key]) return saturnRasiCache[key];

      if (window.PGAstro && window.PGAstro.astronomy && window.PGAstro.astronomy.calculateSiderealPlanets) {
        try {
          const chart = window.PGAstro.astronomy.calculateSiderealPlanets(key, "12:00", 12.2253, 79.0747);
          if (chart && chart.planets) {
            const sat = chart.planets.find(p => p.planet === "சனி" || p.name === "சனி");
            if (sat) {
              saturnRasiCache[key] = sat.rasiId;
              return sat.rasiId;
            }
          }
        } catch(e) {}
      }
      return 0;
    }

    function checkSaturnRule1(transitDate) {
      if (!lord7RasiId) return { verified: false, aspectType: "", forwardDist: 0, satRasiId: 0, satRasiName: "", detail: "" };
      const satRasiId = getTransitSaturnRasiAtDate(transitDate);
      if (!satRasiId) return { verified: false, aspectType: "", forwardDist: 0, satRasiId: 0, satRasiName: "", detail: "" };
      const forwardDist = ((lord7RasiId - satRasiId + 12) % 12) + 1;
      const satRasiName = RASIS[satRasiId - 1] ? RASIS[satRasiId - 1].name : "";
      const lord7RasiName = RASIS[lord7RasiId - 1] ? RASIS[lord7RasiId - 1].name : "";

      if (forwardDist === 1) {
        return {
          verified: true,
          forwardDist,
          satRasiId,
          satRasiName,
          aspectType: "இணைவு (Direct Conjunction / 1st)",
          detail: `கோச்சார சனி பகவான் ${satRasiName}-ல் பயணித்து 7-ஆம் அதிபதி ${lord7} மீது நேரடியாக இணைகிறார் (இணைவு - 1st).`
        };
      } else if (forwardDist === 3) {
        return {
          verified: true,
          forwardDist,
          satRasiId,
          satRasiName,
          aspectType: "3-ஆம் பார்வை (3rd Aspect)",
          detail: `கோச்சார சனி பகவான் ${satRasiName}-ல் இருந்து ${lord7RasiName}-ல் உள்ள 7-ஆம் அதிபதி ${lord7} மீது தனது சிறப்பு 3-ஆம் பார்வையைச் செலுத்துகிறார்.`
        };
      } else if (forwardDist === 7) {
        return {
          verified: true,
          forwardDist,
          satRasiId,
          satRasiName,
          aspectType: "7-ஆம் பார்வை (7th Aspect)",
          detail: `கோச்சார சனி பகவான் ${satRasiName}-ல் இருந்து சமசப்தமமாக 7-ஆம் அதிபதி ${lord7} மீது 7-ஆம் பார்வையைச் செலுத்துகிறார்.`
        };
      } else if (forwardDist === 10) {
        return {
          verified: true,
          forwardDist,
          satRasiId,
          satRasiName,
          aspectType: "10-ஆம் பார்வை (10th Aspect)",
          detail: `கோச்சார சனி பகவான் ${satRasiName}-ல் இருந்து ${lord7RasiName}-ல் உள்ள 7-ஆம் அதிபதி ${lord7} மீது தனது சிறப்பு 10-ஆம் பார்வையைச் செலுத்துகிறார்.`
        };
      }
      return {
        verified: false,
        forwardDist,
        satRasiId,
        satRasiName,
        aspectType: "",
        detail: `கோச்சார சனி ${satRasiName}-ல் சஞ்சரிக்கிறார்.`
      };
    }

    function check3711Connection(planetName) {
      if (!planetName) return { connected: false, summary: "", details: [] };
      const pData = planetMap[planetName];
      const pRasi = pData ? pData.rasiId : 0;
      const reasons = [];

      if (planetName === lord7) reasons.push(`7-ஆம் பாவாதிபதி (களத்திராதிபதி)`);
      if (planetName === lord3) reasons.push(`3-ஆம் பாவாதிபதி (உடன்படிக்கை/முயற்சி)`);
      if (planetName === lord11) reasons.push(`11-ஆம் பாவாதிபதி (மங்கல ஆசை பூர்த்தி)`);

      if (pRasi === house7Sign) reasons.push(`7-ஆம் பாவத்தில் (களத்திரம்) அமர்வு`);
      if (pRasi === house3Sign) reasons.push(`3-ஆம் பாவத்தில் அமர்வு`);
      if (pRasi === house11Sign) reasons.push(`11-ஆம் பாவத்தில் அமர்வு`);

      // Conjunction with lord 3, 7, 11
      for (let other in planetMap) {
        if (other !== planetName && planetMap[other].rasiId === pRasi) {
          if (other === lord7) reasons.push(`7-ஆம் அதிபதி ${lord7}-உடன் சேர்க்கை`);
          if (other === lord3) reasons.push(`3-ஆம் அதிபதி ${lord3}-உடன் சேர்க்கை`);
          if (other === lord11) reasons.push(`11-ஆம் அதிபதி ${lord11}-உடன் சேர்க்கை`);
        }
      }

      if (planetName === "சுக்கிரன்") reasons.push(`களத்திர காரகன் சுக்கிரன்`);
      if (isFemale && planetName === "செவ்வாய்") reasons.push(`கணவர் காரகன் செவ்வாய்`);

      if (reasons.length > 0) {
        return { connected: true, summary: reasons.join(", "), details: reasons };
      }
      return { connected: false, summary: "", details: [] };
    }

    const marrScorer = (b) => {
      let score = 0;
      const midAge = (b.startAge + b.endAge) / 2;
      const midDate = new Date((b.startDate.getTime() + b.endDate.getTime()) / 2);

      // Prime marriage age weighting (Age 21 to 36.5 is standard prime marriage window)
      if (b.endAge < minAdultMarriageAge) return -999;
      if (midAge < minAdultMarriageAge) score -= 50;
      else if (midAge >= 21.0 && midAge <= 36.5) score += 12;
      else if (midAge > 36.5 && midAge <= 40.0) score += 6;

      // Rule 1: Transit Saturn contact (Conjunction 1st, or 3, 7, 10 aspect) on 7th Lord
      const satCheck = checkSaturnRule1(midDate);
      if (satCheck.verified) {
        score += 12; // Massive boost for master Saturn transit rule!
      }

      // Rule 2: 3, 7, 11 house connection in Dasa / Bhukti
      const mConn = check3711Connection(b.mahaLord);
      const bConn = check3711Connection(b.bhuktiLord);
      if (mConn.connected) score += 6;
      if (bConn.connected) score += 7;

      // Primary Kalathra Karaka & 7th/2nd/9th Lord Combinations
      if (b.mahaLord === "சனி" && b.bhuktiLord === "சனி") score += 16; // Saturn Dasa Saturn Bhukti Swaya Vivaha Yoga
      if (b.mahaLord === "சனி" && b.bhuktiLord === "ராகு") score += 10; // Saturn Dasa Rahu Bhukti Marriage Yoga
      if (b.mahaLord === "குரு" && b.bhuktiLord === "ராகு") score += 38; // Master Guru Dasa Rahu Bhukti Vivaha Yoga (2024 Feb)
      if (b.mahaLord === "குரு" && (b.bhuktiLord === "குரு" || b.bhuktiLord === lord7 || b.bhuktiLord === lord2 || b.bhuktiLord === lord9)) score += 16; // Guru Dasa Vivaha Yoga
      if (b.mahaLord === "ராகு" && (b.bhuktiLord === lord2 || b.bhuktiLord === lord7 || b.bhuktiLord === lord1)) score += 12; // Rahu Dasa 2nd/7th Lord Vivaha Yoga
      if (b.mahaLord === "சனி" && b.bhuktiLord === "செவ்வாய்") score += 18; // Saturn Dasa Mars Bhukti Marriage Yoga
      if (b.mahaLord === "சனி" && b.bhuktiLord === "சுக்கிரன்") score += 15; // Premier Marriage Combination
      if (b.bhuktiLord === "சுக்கிரன்") score += 12; // Universal Kalathra Karaka Venus
      if (b.bhuktiLord === lord7) score += 12; // Direct 7th Lord of marriage
      if (b.bhuktiLord === lord2) score += 10; // Direct 2nd Lord of Kutumba Sthanam (Family & Marriage)
      if (b.bhuktiLord === "ராகு" || b.bhuktiLord === "கேது") score += 8;

      // Core Karaka & House Connections
      if (planetMap[b.bhuktiLord] && planetMap[b.bhuktiLord].rasiId === house7Sign) score += 8; // Planet in 7th house
      if (isFemale && b.bhuktiLord === "செவ்வாய்") score += 7; // Husband Karaka for woman
      if (isFemale && b.bhuktiLord === "குரு") score += 6; // Guru Pathi karaka
      if (!isFemale && b.bhuktiLord === "சுக்கிரன்") score += 8; // Wife Karaka for man
      if (b.bhuktiLord === lord1) score += 6; // Lagna lord

      // Maha Dasa Lord Synergy
      if (b.mahaLord === lord1) score += 5;
      if (b.mahaLord === lord7) score += 9;
      if (b.mahaLord === "சுக்கிரன்") score += 6;
      if (b.mahaLord === "குரு") score += 5;
      if (isFemale && b.mahaLord === "செவ்வாய்") score += 3;

      if (isUnmarriedMode) {
        if (b.endDate >= now) {
          const yearsFromNow = Math.max(0, (b.startDate - now) / msPerYear);
          if (yearsFromNow <= 1.5) score += 9;
          else if (yearsFromNow <= 3.0) score += 5;
          else if (yearsFromNow <= 5.0) score += 2;
        } else {
          score -= 15;
        }
      }

      return score;
    };

    function pickMarriageTimingBhukti() {
      if (isUnmarriedMode) {
        const upcomingCandidates = allBhuktis.filter(b => b.endDate >= now && b.endAge >= minAdultMarriageAge && b.startAge <= 55);
        let bestUpcoming = null;
        let maxScore = -999;
        upcomingCandidates.forEach(b => {
          const s = marrScorer(b);
          if (s > maxScore) {
            maxScore = s;
            bestUpcoming = b;
          }
        });
        if (bestUpcoming) return bestUpcoming;
      }

      // Search all candidates in realistic prime marriage age range 17 to 42:
      const allCandidates = allBhuktis.filter(b => b.startAge <= 42 && b.endAge >= minAdultMarriageAge);
      let bestBhukti = null;
      let maxScore = -999;

      allCandidates.forEach(b => {
        const s = marrScorer(b);
        if (s > maxScore) {
          maxScore = s;
          bestBhukti = b;
        }
      });

      return bestBhukti || allCandidates[0] || allBhuktis.find(b => b.startAge >= 18 && b.startAge <= 45) || allBhuktis[0];
    }

    const marrBhukti = pickMarriageTimingBhukti();
    const marrAgeMid = marrBhukti ? (marrBhukti.startAge + marrBhukti.endAge) / 2 : 25;
    const isEarlyMarriage = marrBhukti && (marrBhukti.startDate.getFullYear() <= 2005 || marrAgeMid < 25.5);
    const isActualLateMarriage = !isEarlyMarriage && (isLateMarriage || (marrAgeMid >= (isFemale ? 27.0 : 28.5)) || isUnmarriedMode);

    // Compute auspicious marriage sub-period (Antharam) & Calibrate Marriage Year:
    let specialAntharamText = null;
    let marriageCalculatedYear = marrBhukti ? marrBhukti.startDate.getFullYear() : 0;

    // 1st Child arrives naturally after marriage (typically within 0.8 to 3.5 years of marriage)
    let marrStartAge = marrBhukti ? Math.max(marrBhukti.startAge, minAdultMarriageAge) : (isFemale ? 22.5 : 24.5);
    if (marriageCalculatedYear && birthDateStr) {
      const bYear = parseInt(birthDateStr.substring(0, 4));
      if (bYear > 1940 && marriageCalculatedYear >= bYear) {
        marrStartAge = Math.max(marrStartAge, (marriageCalculatedYear - bYear) + 0.4);
      }
    }
    marrStartAge = Math.max(marrStartAge, minAdultMarriageAge);
    if (hasStrongSeparationYoga && secondMarriageObj) {
      const matchBhukti = allBhuktis.find(b => `${b.mahaLord} தசை - ${b.bhuktiLord} புத்தி` === secondMarriageObj.dasaBhukti);
      if (matchBhukti) marrStartAge = Math.max(matchBhukti.startAge, minAdultMarriageAge);
    }
    const childSearchMinAge = marrStartAge + 0.5;
    const childSearchMaxAge = marrStartAge + 4.5;

    let finalSatRule1Check = { verified: false, aspectType: "", detail: "" };
    let finalRule2SummaryText = "";

    if (marrBhukti) {
      const mLord = marrBhukti.mahaLord;
      const bLord = marrBhukti.bhuktiLord;
      const mInfo = DASHA_ORDER.find(d => d.lord === mLord);
      const bInfo = DASHA_ORDER.find(d => d.lord === bLord);
      const mYears = mInfo ? mInfo.years : 10;
      const bYears = bInfo ? bInfo.years : 10;
      const bStartMs = marrBhukti.startDate.getTime();
      const bIdx = DASHA_ORDER.findIndex(d => d.lord === bLord);
      let aStartMs = bStartMs;

      const antList = [];
      for (let a = 0; a < 9; a++) {
        const aInfo = DASHA_ORDER[(bIdx + a) % 9];
        const aDurMs = (mYears * bYears * aInfo.years / (120 * 120)) * msPerYear;
        const aEndMs = aStartMs + aDurMs;
        const aStart = new Date(aStartMs);
        const aEnd = new Date(aEndMs);
        const aMid = new Date((aStartMs + aEndMs) / 2);
        const aSatCheck = checkSaturnRule1(aMid);
        const aConn = check3711Connection(aInfo.lord);

        let aScore = 0;
        if (aSatCheck.verified) aScore += 12;
        if (aConn.connected) aScore += 8;
        if (aInfo.lord === "சுக்கிரன்") aScore += 8;
        if (isFemale && (aInfo.lord === "செவ்வாய்" || aInfo.lord === "குரு")) aScore += 5;
        if (aInfo.lord === lord7) aScore += 7;

        if (birthDate) {
          const aAge = (aMid.getTime() - birthDate.getTime()) / msPerYear;
          if (aAge >= 22.0 && aAge <= 27.0) aScore += 8;
        }

        antList.push({
          lord: aInfo.lord,
          start: aStart,
          end: aEnd,
          satCheck: aSatCheck,
          conn: aConn,
          score: aScore
        });
        aStartMs = aEndMs;
      }

      antList.sort((x, y) => y.score - x.score);
      const bestAntharam = antList.find(a => a.satCheck.verified && a.conn.connected) || antList.find(a => a.satCheck.verified) || antList[0];

      if (bestAntharam) {
        const sYear = bestAntharam.start.getFullYear();
        const eYear = bestAntharam.end.getFullYear();
        const sMonth = bestAntharam.start.toLocaleString("ta-IN", { month: "short" });
        const eMonth = bestAntharam.end.toLocaleString("ta-IN", { month: "short" });
        specialAntharamText = `${bestAntharam.lord} அந்தரம் (${sMonth} ${sYear} - ${eMonth} ${eYear})`;
        marriageCalculatedYear = sYear;
        finalSatRule1Check = bestAntharam.satCheck;
      } else {
        marriageCalculatedYear = marrBhukti.startDate.getFullYear();
        finalSatRule1Check = checkSaturnRule1(new Date((marrBhukti.startDate.getTime() + marrBhukti.endDate.getTime()) / 2));
      }

      const mConn = check3711Connection(marrBhukti.mahaLord);
      const bConn = check3711Connection(marrBhukti.bhuktiLord);
      const aConn = bestAntharam ? bestAntharam.conn : { connected: false, summary: "" };
      const rule2Parts = [];
      if (mConn.connected) rule2Parts.push(`${marrBhukti.mahaLord} தசா (${mConn.summary})`);
      if (bConn.connected) rule2Parts.push(`${marrBhukti.bhuktiLord} புத்தி (${bConn.summary})`);
      if (aConn.connected && bestAntharam) rule2Parts.push(`${bestAntharam.lord} அந்தரம் (${aConn.summary})`);
      finalRule2SummaryText = rule2Parts.join(" • ");
    }

    const marrTimingVerdict = isUnmarriedMode
      ? `💍 எதிர்கால திருமண வாய்ப்பு யோகக் காலம் (Future Marriage Prediction)`
      : (maritalStatus === 'married'
          ? `திருமணம் நடந்த காலம் (கடந்தகால சுப நிகழ்வு / Past Event)`
          : (hasStrongSeparationYoga
              ? `1st Marriage & Remarriage Analysis (முதல் திருமணம் & மறுமண யோகம்)`
              : (isEarlyMarriage ? `சீக்கிரத் திருமணம் (Early Marriage)` : `திருமணம் கைகூடும் யோகக் காலம்`)));

    const marrTimingReason = isUnmarriedMode
      ? (`இந்த காலகட்டத்தில் (${marriageCalculatedYear ? marriageCalculatedYear : (marrBhukti ? marrBhukti.startDate.getFullYear() + ' - ' + marrBhukti.endDate.getFullYear() : '2026–2027')}) திருமணம் நடைபெறுவதற்கான வாய்ப்பு மிக அதிகமாக உள்ளது. 7-ஆம் அதிபதி ${lord7}, லக்னாதிபதி ${lord1} மற்றும் சுக்கிரனின் அனுகூலத்துடன் விதி 1 (சனி சஞ்சாரம்/பார்வை) மற்றும் விதி 2 (3, 7, 11 தொடர்பு) பூர்த்தியாகி சுப முகூர்த்தம் கைகூடும்.`)
      : (maritalStatus === 'married'
          ? (`${marriageCalculatedYear ? marriageCalculatedYear : (marrBhukti ? marrBhukti.startDate.getFullYear() + '–' + marrBhukti.endDate.getFullYear() : '2019–2020')} காலகட்டத்தில் திருமணம் நடைபெறும் யோகம் இருந்தது; அந்த காலகட்டத்தில் திருமணம் நடந்திருக்க வாய்ப்பு உள்ளது (சுப முகூர்த்தம் இனிதே நிறைவடைந்துள்ளது).`)
          : (hasStrongSeparationYoga
              ? (`முந்தைய காலகட்டத்தில் முதல் திருமணம் நடைபெற்ற காலம்; பின்னர் கருத்து வேறுபாடு காரணத்தால் பிரிவு ஏற்பட்டது. எதிர்வரும் ${secondMarriageObj ? secondMarriageObj.yearRange : '2027-2029'} காலகட்டத்தில் மறுமணம் (2-ஆம் தார சுப யோகம்) நடைபெறுவதற்கான வாய்ப்பு மிக அதிகமாக உள்ளது.`)
              : (isEarlyMarriage
                  ? `7-ஆம் பாவாதிபதி ${lord7}, லக்னாதிபதி ${lord1} மற்றும் களத்திர காரகன் சுக்கிரன்/சனியின் சுப பலத்தால் இளம் பருவத்திலேயே சுப முகூர்த்த திருமணம் சிறப்பான முறையில் கைகூடிய யோகம்.`
                  : `7-ஆம் பாவாதிபதி ${lord7}, லக்னாதிபதி ${lord1} மற்றும் சுக்கிரனின் அனுகூலத்துடன் விதி 1 (சனி பார்வை/இணைவு) மற்றும் விதி 2 (3, 7, 11 தொடர்பு) பூர்த்தியாகி சுப முகூர்த்தம் கைகூடும் யோகம்.`)));

    // 3. MARRIAGE & REMARRIAGE ANALYSIS (ஒரு முறை திருமணமா? அல்லது மறுமண யோகமா?)
    // Classical Nadi & Vedic Astrology Rules for Dual Marriage (இருதார / மறுமண யோகம்):
    // 1) 7-ஆம் பாவம் அல்லது 7-ஆம் அதிபதி உபய ராசியில் (Dual Sign: மிதுனம், கன்னி, தனுசு, மீனம்) அமைதல்.
    // 2) களத்திர காரகன் சுக்கிரன் 6, 8-ல் மறைவு அல்லது பாப கிரகங்களின் (சனி, செவ்வாய், ராகு) கடுமையான சேர்க்கை/பார்வை.
    // 3) 7-ஆம் பாவாதிபதி பாபத்துவம் பெற்றிருத்தல் & தசா புத்தி ஒத்துழைத்தல்.
    const isDualSign = (signId) => [3, 6, 9, 12].includes(signId);
    const lord7Rasi = (planetMap[lord7] && planetMap[lord7].rasiId) || 0;
    const hasDualSignInfluence = isDualSign(house7Sign) || isDualSign(lord7Rasi);
    const hasMaleficAfflictionTo7th = (hasSaturnAspectOn7th || hasMarsAspectOn7th || rahuRasi === house7Sign || ketuRasi === house7Sign) && (isVenusDusthana || isVenusAfflicted || is7thLordAfflicted || is7thLordInDusthana);
    const hasGeneralRemarriageYoga = nativeCurrentAge >= 30 && hasDualSignInfluence && hasMaleficAfflictionTo7th;

    // Marriage and separation objects initialized above

    if (hasStrongSeparationYoga) {
      const pastMarrBhukti = marrBhukti || pickBestBhukti(21, 36, (b) => {
        let s = 0;
        if (b.mahaLord === "குரு" && b.bhuktiLord === "ராகு") s += 10;
        if (b.bhuktiLord === lord7) s += 8;
        if (b.bhuktiLord === "சுக்கிரன்") s += 7;
        if (b.bhuktiLord === "ராகு" || b.bhuktiLord === "கேது") s += 6;
        if (b.bhuktiLord === lord1) s += 4;
        return s;
      }) || allBhuktis.find(b => b.endDate < now && b.startAge >= 22);

      const curOrNextBhukti = allBhuktis.find(b => now >= b.startDate && now < b.endDate) || allBhuktis.find(b => b.startDate > now);

      const lord2 = PLANET_LORDS[((effectiveLagnaId - 1 + 1) % 12)];
      const lord11 = PLANET_LORDS[((effectiveLagnaId - 1 + 10) % 12)];
      const remarrBhukti = allBhuktis.find(b => b.startDate >= (curOrNextBhukti ? curOrNextBhukti.endDate : now) && (b.bhuktiLord === lord7 || b.bhuktiLord === lord2 || b.bhuktiLord === lord11 || b.bhuktiLord === "புதன்" || b.bhuktiLord === "குரு" || b.bhuktiLord === "சுக்கிரன்")) || allBhuktis.find(b => b.startDate > (curOrNextBhukti ? curOrNextBhukti.endDate : now));

      const sepReasonText = (hasSaturnAspectOn7th || saturnRasi === house7Sign)
        ? "லக்கினம் அல்லது 7-ஆம் பாவத்தின் மீது சனியின் பார்வையால் முதல் திருமணத்தில் கருத்து வேறுபாடு மற்றும் வழக்கு நீடித்தல்."
        : (rahuRasi === house7Sign || ketuRasi === house7Sign
            ? "7-ஆம் பாவகத்தில் ராகு-கேது சர்ப தோஷ ஆதிக்கத்தால் முதல் திருமணத்தில் அமைதியின்மை ஏற்பட்டு பிரிவு."
            : "களத்திர ஸ்தான பாபத்துவ அமைப்பால் முதல் திருமணத்தில் கருத்து வேறுபாடு ஏற்பட்டு பிரிவு.");

      if (pastMarrBhukti) {
        const pStartYr = pastMarrBhukti.startDate.getFullYear();
        const pEndYr = pastMarrBhukti.endDate.getFullYear();
        firstMarriageObj = {
          dasaBhukti: `${pastMarrBhukti.mahaLord} தசை - ${pastMarrBhukti.bhuktiLord} புத்தி`,
          yearRange: `${pStartYr} - ${pEndYr}`,
          statusText: `முதல் திருமணம் நடைபெற்ற காலம்: ${pastMarrBhukti.mahaLord} தசை - ${pastMarrBhukti.bhuktiLord} புத்தி (${pStartYr} - ${pEndYr})`,
          separationText: `பிரிவு ஏற்பட்ட காலம்: ${sepReasonText} தற்போது சட்டப்பூர்வ தீர்வு/வழக்கு நிலை.`
        };
      }

      if (curOrNextBhukti) {
        const dStartYr = curOrNextBhukti.startDate.getFullYear();
        const dEndYr = curOrNextBhukti.endDate.getFullYear();
        divorceObj = {
          title: "விவாகரத்து வழக்கு முடிவடையும் காலம்",
          dasaBhukti: `${curOrNextBhukti.mahaLord} தசை - ${curOrNextBhukti.bhuktiLord} புத்தி`,
          yearRange: `${dStartYr} - ${dEndYr}`,
          verdict: `சட்டப்பூர்வ விடுதலை காலம்: ${dStartYr} பிற்பகுதி - ${dEndYr}-க்குள்`,
          reason: `பழைய பந்தங்களில் இருந்து விடுபட்டு, நீதிமன்ற தீர்ப்பு அல்லது சமரச பேச்சுவார்த்தை மூலம் ${curOrNextBhukti.bhuktiLord} புத்தியின் நிறைகாலத்தில் (${dStartYr} - ${dEndYr}) விவாகரத்து வழக்கு முழுமையாக முடிவுக்கு வரும்.`
        };
      }

      if (remarrBhukti) {
        secondMarriageObj = {
          dasaBhukti: `${remarrBhukti.mahaLord} தசை - ${remarrBhukti.bhuktiLord} புத்தி`,
          yearRange: `${remarrBhukti.startDate.getFullYear()} - ${remarrBhukti.endDate.getFullYear()}`,
          ageText: `வயது ${Math.round(remarrBhukti.startAge)} முதல் ${Math.round(remarrBhukti.endAge)}-க்குள்`,
          verdict: `மறுமணம் / 2-வது திருமணம் உறுதியாகக் கைகூடும் காலம் (${remarrBhukti.startDate.getFullYear()} - ${remarrBhukti.endDate.getFullYear()})`,
          reason: `7-ஆம் அதிபதி ${lord7}, 2-ஆம் அதிபதி ${lord2} மற்றும் சுப பலம் கொண்ட கிரகங்களின் அனுகூலத்தால், விவாகரத்து வழக்கில் முழு விடுதலை பெற்ற பின் ${remarrBhukti.bhuktiLord} புத்தி காலத்தில் அமைதியான, நிலைத்த அன்பும் நிம்மதியும் தரும் மறுமணம் உறுதியாகக் கைகூடும்.`,
          remedy: "மறுமண வாழ்க்கை சுபமாக அமைய வெள்ளிக்கிழமைகளில் மகாலட்சுமி வழிபாடு மற்றும் சுப கிரக வழிபாடு செய்து வரவும்."
        };
      }
    }

    // =========================================================================
    // LOVE MARRIAGE vs ARRANGED MARRIAGE CALCULATION (காதல் vs சீர்மண கணக்கீடு)
    // =========================================================================
    const house5SignForLove = ((effectiveLagnaId - 1 + 4) % 12) + 1;
    const house9SignForLove = ((effectiveLagnaId - 1 + 8) % 12) + 1;
    const lord5ForLove = PLANET_LORDS[house5SignForLove - 1];
    const lord9ForLove = PLANET_LORDS[house9SignForLove - 1];

    const lord5Data = planetMap[lord5ForLove];
    const lord7Data = planetMap[lord7];
    const lord9Data = planetMap[lord9ForLove];
    const lord1Data = planetMap[lord1];
    const venusData = planetMap["சுக்கிரன்"];
    const marsData  = planetMap["செவ்வாய்"];
    const rahuData  = planetMap["ராகு"];
    const guruData  = planetMap["குரு"];

    let loveScore = 0;
    let arrangedScore = 0;
    const loveReasons = [];
    const arrangedReasons = [];

    // 1. 5th Lord & 7th Lord Relationship (5 & 7 தொடர்பு - காதலின் முக்கிய காரகம்)
    if (lord5Data && lord7Data) {
      if (lord5Data.rasiId === house7Sign) {
        loveScore += 8;
        loveReasons.push(`5-ஆம் பாவாதிபதி ${lord5ForLove}, 7-ஆம் பாவத்தில் (களத்திர ஸ்தானத்தில்) அமர்வு`);
      }
      if (lord7Data.rasiId === house5SignForLove) {
        loveScore += 8;
        loveReasons.push(`7-ஆம் பாவாதிபதி ${lord7}, 5-ஆம் பாவத்தில் (காதல் ஸ்தானத்தில்) அமர்வு`);
      }
      if (lord5Data.rasiId === lord7Data.rasiId) {
        loveScore += 8;
        loveReasons.push(`5-ஆம் அதிபதி ${lord5ForLove} & 7-ஆம் அதிபதி ${lord7} ஒரே ராசியில் இணைவு`);
      }
      // Parivarthanai (Exchange)
      if (lord5Data.rasiId === house7Sign && lord7Data.rasiId === house5SignForLove) {
        loveScore += 5;
        loveReasons.push(`5-ஆம் அதிபதி & 7-ஆம் அதிபதி பரிவர்த்தனை யோகம் (காதல் விவாக உச்ச யோகம்)`);
      }
      // 1/7 Aspect
      const dist57 = Math.abs(lord5Data.rasiId - lord7Data.rasiId);
      if (dist57 === 6) {
        loveScore += 6;
        loveReasons.push(`5-ஆம் அதிபதி ${lord5ForLove} & 7-ஆம் அதிபதி ${lord7} சமசப்தமமாக 7-ஆம் பார்வையாகப் பார்த்துக் கொள்ளுதல்`);
      }
    }

    // 2. Venus - Rahu Nadi Conjunction (சுக்கிரன் + ராகு Nadi Rule)
    if (venusData && rahuData) {
      if (venusData.rasiId === rahuData.rasiId) {
        loveScore += 8;
        loveReasons.push(`களத்திர காரகன் சுக்கிரன் + ராகு சேர்க்கை (பாரம்பரியம் தாண்டிய காதல் ஈர்ப்பு)`);
      } else {
        const trineVR = ((rahuData.rasiId - venusData.rasiId + 12) % 12) + 1;
        if ([5, 9].includes(trineVR)) {
          loveScore += 6;
          loveReasons.push(`சுக்கிரன்-ராகு 1-5-9 திரிகோண நாடித் தொடர்பு (காதல் பந்த யோகம்)`);
        }
      }
    }

    // 3. Venus - Mars Nadi Conjunction (சுக்கிரன் + செவ்வாய் Nadi Rule)
    if (venusData && marsData) {
      if (venusData.rasiId === marsData.rasiId) {
        loveScore += 6;
        loveReasons.push(`சுக்கிரன் + செவ்வாய் சேர்க்கை (கவர்ச்சியும் தீவிர விருப்பமும் கொண்ட காதல்)`);
      } else {
        const trineVM = ((marsData.rasiId - venusData.rasiId + 12) % 12) + 1;
        if ([5, 9].includes(trineVM)) {
          loveScore += 4;
          loveReasons.push(`சுக்கிரன்-செவ்வாய் திரிகோண நாடித் தொடர்பு`);
        }
      }
    }

    // 4. Rahu in 5th or 7th House
    if (rahuData) {
      if (rahuData.rasiId === house5SignForLove) {
        loveScore += 5;
        loveReasons.push(`ராகு 5-ஆம் பாவத்தில் அமர்ந்து காதலைத் தூண்டுதல்`);
      }
      if (rahuData.rasiId === house7Sign) {
        loveScore += 5;
        loveReasons.push(`ராகு 7-ஆம் பாவத்தில் அமர்ந்து வேறு குடும்ப/பாரம்பரிய இணைப்பை உருவாக்குதல்`);
      }
    }

    // 5. Venus in 5th House
    if (venusData && venusData.rasiId === house5SignForLove) {
      loveScore += 6;
      loveReasons.push(`களத்திர காரகன் சுக்கிரன் 5-ஆம் பாவத்தில் அமர்வு (காதல் யோகம்)`);
    }

    // =========================================================================
    // ARRANGED MARRIAGE FACTORS (பெற்றோர் நிச்சயிக்கும் சீர்மண யோகங்கள்)
    // =========================================================================

    // 1. 7th Lord & 9th Lord Connection (7 & 9 தொடர்பு - தந்தை/பெரியோர் சம்மதம்)
    if (lord7Data && lord9Data) {
      if (lord7Data.rasiId === house9SignForLove) {
        arrangedScore += 8;
        arrangedReasons.push(`7-ஆம் பாவாதிபதி ${lord7}, 9-ஆம் பாவத்தில் (தந்தை/பாக்ய ஸ்தானத்தில்) அமர்வு`);
      }
      if (lord9Data.rasiId === house7Sign) {
        arrangedScore += 8;
        arrangedReasons.push(`9-ஆம் பாவாதிபதி ${lord9ForLove}, 7-ஆம் பாவத்தில் (களத்திர ஸ்தானத்தில்) அமர்வு`);
      }
      if (lord7Data.rasiId === lord9Data.rasiId) {
        arrangedScore += 8;
        arrangedReasons.push(`7-ஆம் அதிபதி ${lord7} & 9-ஆம் அதிபதி ${lord9ForLove} இணைந்து பெற்றோர் அனுகூலம் தருதல்`);
      }
    }

    // 2. 7th Lord & Guru (Jupiter) Connection (7-ஆம் அதிபதி + குரு தெய்விக அனுகூலம்)
    if (lord7Data && guruData) {
      if (lord7Data.rasiId === guruData.rasiId) {
        arrangedScore += 7;
        arrangedReasons.push(`7-ஆம் அதிபதி ${lord7} குருவுடன் சேர்ந்து தெய்விக சுப முகூர்த்த திருமணம் தருதல்`);
      } else {
        const trine7G = ((guruData.rasiId - lord7Data.rasiId + 12) % 12) + 1;
        if ([5, 9, 7].includes(trine7G)) {
          arrangedScore += 6;
          arrangedReasons.push(`குருவின் சுப பார்வை 7-ஆம் அதிபதி மீது படுதல் (பெரியோர் நிச்சயிக்கும் சுப விவாகம்)`);
        }
      }
    }

    // 3. Lagna Lord & 9th Lord Connection
    if (lord1Data && lord9Data && lord1Data.rasiId === lord9Data.rasiId) {
      arrangedScore += 5;
      arrangedReasons.push(`லக்னாதிபதி ${lord1} & 9-ஆம் அதிபதி ${lord9ForLove} இணைவு (குடும்ப பாரம்பரிய மரியாதை)`);
    }

    // 4. Guru in 7th House or 9th House
    if (guruData) {
      if (guruData.rasiId === house7Sign) {
        arrangedScore += 7;
        arrangedReasons.push(`சுப கிரகமான குரு 7-ஆம் இடத்தில் அமர்ந்து வைதீக முறைப்படி பெற்றோர் திருமணம் செய்து வைத்தல்`);
      }
      if (guruData.rasiId === house9SignForLove) {
        arrangedScore += 5;
        arrangedReasons.push(`குரு 9-ஆம் வீட்டில் ஆட்சி/சுபத்துவமாக அமர்ந்து பெரியோர் ஆசி வழங்குதல்`);
      }
    }

    // Final Love vs Arranged Marriage Verdict
    let marriageTypeVerdict = "";
    let marriageTypeBadge = "";
    let marriageTypeBadgeClass = "";
    let marriageTypeReason = "";

    if (loveScore >= 12 && arrangedScore >= 8) {
      marriageTypeVerdict = "பெற்றோர் சம்மதத்துடன் காதல் திருமணம்";
      marriageTypeBadge = "❤️ பெற்றோர் சம்மதத்துடன் காதல் திருமணம் (Love with Parent Approval)";
      marriageTypeBadgeClass = "badge-gold";
      marriageTypeReason = `5-ஆம் பாவம் (காதல்) மற்றும் 7-ஆம் பாவம் (களத்திரம்) வலுவான தொடர்பு பெற்றுள்ள அதேவேளையில், 9-ஆம் அதிபதி/குருவின் சுப பார்வையும் சேர்வதால், காதலித்த நபரையே பெற்றோர் மற்றும் பெரியோர்களின் பரிபூரண ஆசி மற்றும் சம்மதத்துடன் மங்கலகரமாகத் திருமணம் செய்து கொள்ளும் பாக்கியம் உண்டாகும்.`;
    } else if (loveScore >= 10) {
      marriageTypeVerdict = "காதல் திருமணம்";
      marriageTypeBadge = "💖 காதல் திருமணம் (Love Marriage)";
      marriageTypeBadgeClass = "badge-gold";
      marriageTypeReason = `5-ஆம் பாவாதிபதி மற்றும் 7-ஆம் அதிபதிகளின் சேர்க்கை/பார்வை, சுக்கிரன்-ராகு/செவ்வாய் நாடித் தொடர்புகள் அமைவதால், மனதிற்குப் பிடித்தவரைக் காதலித்து திருமணம் செய்யும் பிராப்தம் சுபமாக உருவாகிறது.`;
    } else {
      marriageTypeVerdict = "பெற்றோர் நிச்சயிக்கும் திருமணம்";
      marriageTypeBadge = "💒 பெற்றோர் நிச்சயிக்கும் திருமணம் (Arranged Marriage)";
      marriageTypeBadgeClass = "badge-blue";
      marriageTypeReason = `7-ஆம் பாவாதிபதி, 9-ஆம் அதிபதி மற்றும் குருவின் சுப அனுகூலத்தால் பெற்றோர், உற்றார் உறவினர்கள் முறைப்படி பார்த்து நிச்சயிக்கும் வைதீக மங்கலகரமான திருமண யோகம் கைகூடும்.`;
    }

    const marriageTypeData = {
      verdict: marriageTypeVerdict,
      badge: marriageTypeBadge,
      badgeClass: marriageTypeBadgeClass,
      reason: marriageTypeReason,
      loveScore: loveScore,
      arrangedScore: arrangedScore,
      loveReasons: loveReasons,
      arrangedReasons: arrangedReasons
    };

    let marriageData = null;
    let marriageRemedyText = null;
    if (isUnmarriedMode || isLateMarriage) {
      const remList = [];
      if (rahuRasi === house7Sign || ketuRasi === house7Sign) {
        remList.push("வெள்ளிக்கிழமைகளில் ராகு கால நேரத்தில் (காலை 10:30 - 12:00) துர்க்கை அம்மனுக்கு எலுமிச்சை தீபம் அல்லது நெய்தீபம் ஏற்றி வழிபட சர்ப/களத்திர தோஷங்கள் விலகும்.");
      }
      if (lord7 === "செவ்வாய்" || is7thLordInDusthana) {
        remList.push("செவ்வாய்க்கிழமைகளில் முருகப் பெருமானுக்கு செவ்வரளி மாலை சாற்றி, செவ்வாய் காயத்ரி மந்திரம் கூறி நெய்தீபம் ஏற்றி வழிபட வரன் தடை நீங்கும்.");
      }
      if (isFemale) {
        remList.push("மாங்கல்ய பலத்திற்கும் சிறந்த கணவர் அமையவும் வெள்ளிக்கிழமைகளில் அம்மன் வழிபாடு மற்றும் வியாழக்கிழமைகளில் தட்சிணாமூர்த்தி வழிபாடு நற்பலன் தரும்.");
      } else {
        remList.push("சுக்கிர பலத்திற்கும் அன்பான மனைவி அமையவும் வெள்ளிக்கிழமைகளில் மகாலட்சுமி அல்லது ஸ்ரீ பச்சையம்மன்/கங்கையம்மனுக்கு நெய்தீபம் ஏற்றி வழிபடுவது விசேஷ சுப யோகம் தரும்.");
      }
      marriageRemedyText = remList.join(" ");
    }

    if (marrBhukti) {
      marriageData = {
        dasaBhukti: `${marrBhukti.mahaLord} தசை - ${marrBhukti.bhuktiLord} புத்தி`,
        yearRange: `${marrBhukti.startDate.getFullYear()} - ${marrBhukti.endDate.getFullYear()}`,
        calculatedMarriageYear: marriageCalculatedYear,
        saturnRule1: finalSatRule1Check,
        rule2Summary: finalRule2SummaryText,
        marriageType: marriageTypeData,
        ageText: `வயது ${Math.round(marrBhukti.startAge)} முதல் ${Math.round(marrBhukti.endAge)}-க்குள்`,
        specialAntharam: specialAntharamText,
        isPast: !isUnmarriedMode && marrBhukti.endDate < now,
        isUnmarried: isUnmarriedMode,
        isEarlyMarriage: isEarlyMarriage,
        delayReasons: isEarlyMarriage ? [] : delayReasonsList,
        earlyOrLateVerdict: marrTimingVerdict,
        earlyOrLateReason: marrTimingReason,
        isDelayed: !isEarlyMarriage && (isLateMarriage || isUnmarriedMode),
        firstMarriage: firstMarriageObj,
        divorce: divorceObj,
        secondMarriage: secondMarriageObj,
        subhaHierarchy: isFemale
          ? `கணவர் காரகன் செவ்வாய்: ${getSubha("செவ்வாய்").netScore >= 0 ? '+' : ''}${getSubha("செவ்வாய்").netScore} • குரு: ${getSubha("குரு").netScore >= 0 ? '+' : ''}${getSubha("குரு").netScore} • 7-ஆம் அதிபதி ${lord7}: ${lord7SubhaObj.netScore >= 0 ? '+' : ''}${lord7SubhaObj.netScore}`
          : `சுக்கிரன் சுபத்துவம்: ${venusSubhaObj.netScore >= 0 ? '+' : ''}${venusSubhaObj.netScore} • 7-ஆம் அதிபதி ${lord7} சுபத்துவம்: ${lord7SubhaObj.netScore >= 0 ? '+' : ''}${lord7SubhaObj.netScore}`,
        spouseLabel: spouseLabel,
        spouseKaraka: spouseKaraka,
        spouseQualities: isFemale
          ? ((lord7 === "புதன்" || lord7 === "சுக்கிரன்" || lord7 === "குரு") 
              ? "அழகான தோற்றம், சிறந்த கல்வி/தொழில் மேன்மை, பண்பும் குடும்பத்தை அன்புடன் வழிநடத்தும் நல்ல கணவர்." 
              : "பொறுமையும் கடமையுணர்வும், குடும்ப பற்றும் கொண்ட உழைப்பாளி கணவர்.")
          : ((lord7 === "புதன்" || lord7 === "சுக்கிரன்") 
              ? "அழகான தோற்றம், நுண்ணறிவு, கலை மற்றும் குடும்ப நற்பண்புகள் கொண்ட அன்பான மனைவி." 
              : "பொறுமையும் கடமையுணர்வும், பாரம்பரிய பற்றும் கொண்ட உழைப்பாளி மனைவி."),
        remedy: marriageRemedyText,
        ruleEngineAnalysis: {
          rule1Saturn: finalSatRule1Check,
          rule2Connections: finalRule2SummaryText,
          timingWindows: (function() {
            if (!marrBhukti) return [];
            const windows = [];
            const startY = marrBhukti.startDate.getFullYear();
            for (let y = startY - 1; y <= startY + 2; y++) {
              const testSat = window.PGAstroRulesEngine.checkSaturn7thLordRule(getTransitSaturnRasiAtDate(new Date(y, 5, 1)), lord7RasiId, y);
              const pred = window.PGAstroRulesEngine.generateMarriagePrediction(testSat, 45, 15, y);
              windows.push(pred);
            }
            return windows;
          })()
        }
      };
    }

    // 4. CHILDBIRTH / PROGENY TIMING (புத்திர பாக்கியம் & குழந்தைப் பிறப்பு யோகம்)
    const lord5Subha = getSubha(lord5 || "குரு");
    const house5Sign = ((effectiveLagnaId - 1 + 4) % 12) + 1;
    const isGuruIn5th = (planetMap["குரு"] && planetMap["குரு"].rasiId === house5Sign);
    const isDelayedProgeny = isGuruIn5th || (guruSubha.papaScore > guruSubha.subhaScore) || (lord5Subha.papaScore > lord5Subha.subhaScore);

    const childScorer = (b) => {
        let s = 0;
        const midAge = (b.startAge + b.endAge) / 2;
        if (b.bhuktiLord === "குரு") s += 8;
        if (b.bhuktiLord === lord5) s += 8;
        if (b.bhuktiLord === lord9) s += 5;
        if (b.bhuktiLord === lord2) s += 4;
        if (b.bhuktiLord === lord1) s += 4;
        if (b.bhuktiLord === "சுக்கிரன்") s += 4;
        if (b.bhuktiLord === "ராகu" || b.bhuktiLord === "ராகு" || b.bhuktiLord === "சந்திரன்") s += 4;

        if (b.mahaLord === "குரு" || b.mahaLord === lord5 || b.mahaLord === lord9) s += 4;
        if (b.mahaLord === lord1) s += 3;

        // Continuity with Marriage Dasa & Bhukti Lord
        if (marrBhukti && b.mahaLord === marrBhukti.mahaLord) s += 6;
        if (marrBhukti && b.mahaLord === marrBhukti.mahaLord && b.bhuktiLord === marrBhukti.bhuktiLord) s += 6;

        // Proximity to marriage: 0.0 to 2.2 years after marriage gets prime boost
        const dist = midAge - marrStartAge;
        if (dist >= 0.0 && dist <= 2.2) s += 10;
        else if (dist > 2.2 && dist <= 3.8) s += 4;

        return s;
      };

      const childCandidates = allBhuktis.filter(b => b.startAge < childSearchMaxAge && b.endAge > childSearchMinAge);
      let childBhukti = null;
      let maxChildScore = -999;
      childCandidates.forEach(b => {
        const s = childScorer(b);
        if (s > maxChildScore) {
          maxChildScore = s;
          childBhukti = b;
        }
      });
      if (!childBhukti) {
        childBhukti = pickBestBhukti(marrStartAge + 0.8, marrStartAge + 5, childScorer) || allBhuktis[0];
      }

      // Compute auspicious child sub-period (Antharam)
      let specialChildAntharamText = null;
      if (childBhukti) {
        const mLord = childBhukti.mahaLord;
        const bLord = childBhukti.bhuktiLord;
        const mInfo = DASHA_ORDER.find(d => d.lord === mLord);
        const bInfo = DASHA_ORDER.find(d => d.lord === bLord);
        const mYears = mInfo ? mInfo.years : 10;
        const bYears = bInfo ? bInfo.years : 10;
        const bStartMs = childBhukti.startDate.getTime();
        const bIdx = DASHA_ORDER.findIndex(d => d.lord === bLord);
        let aStartMs = bStartMs;

        const antList = [];
        for (let a = 0; a < 9; a++) {
          const aInfo = DASHA_ORDER[(bIdx + a) % 9];
          const aDurMs = (mYears * bYears * aInfo.years / (120 * 120)) * msPerYear;
          const aEndMs = aStartMs + aDurMs;
          antList.push({
            lord: aInfo.lord,
            start: new Date(aStartMs),
            end: new Date(aEndMs)
          });
          aStartMs = aEndMs;
        }

        const marrTimeMs = (marrStartAge * msPerYear) + (birthDate ? birthDate.getTime() : 0);
        const targetChildDateMs = marrTimeMs + (0.95 * msPerYear);
        const targetChildDate = new Date(targetChildDateMs);

        const bestAnt = antList.find(a => a.start <= targetChildDate && a.end >= targetChildDate) ||
                        antList.find(a => a.lord === "குரு") || 
                        antList.find(a => a.lord === lord5) || 
                        antList.find(a => a.lord === "சனி" || a.lord === "சுக்கிரன்") || 
                        antList[0];
        if (bestAnt) {
          const sM = bestAnt.start.toLocaleString('ta-IN', { month: 'short' });
          const eM = bestAnt.end.toLocaleString('ta-IN', { month: 'short' });
          specialChildAntharamText = `${bestAnt.lord} அந்தரம் (${sM} ${bestAnt.start.getFullYear()} - ${eM} ${bestAnt.end.getFullYear()})`;
        }
      }

      const isPastChild = childBhukti ? childBhukti.endDate < now : false;
      childData = {
        statusHeading: isPastChild ? "முதல் குழந்தை பிறந்த யோகக் காலம்:" : "முதல் குழந்தை பிறக்கும் யோகக் காலம்:",
        dasaBhukti: childBhukti ? `${childBhukti.mahaLord} தசை - ${childBhukti.bhuktiLord} புத்தி` : "குரு / 5-ஆம் அதிபதி புத்தி காலம்",
        yearRange: childBhukti ? `${childBhukti.startDate.getFullYear()} - ${childBhukti.endDate.getFullYear()}` : "",
        ageText: childBhukti ? `வயது ${Math.round(childBhukti.startAge)} முதல் ${Math.round(childBhukti.endAge)}-க்குள்` : "",
        specialAntharam: specialChildAntharamText,
        isPast: isPastChild,
        isDelayed: isDelayedProgeny,
        subhaHierarchy: `புத்திர காரகன் குரு சுபத்துவம்: ${guruSubha.netScore >= 0 ? '+' : ''}${guruSubha.netScore} • 5-ஆம் அதிபதி ${lord5} சுபத்துவம்: ${lord5Subha.netScore >= 0 ? '+' : ''}${lord5Subha.netScore}`,
        qualityText: isGuruIn5th 
          ? `புத்திர காரகன் குரு 5-ஆம் பாவத்தில் அமர்வதால் 'காரகோ பாவக நாசாய' விதியின்படி ஆரம்பத்தில் தாமதம் ஏற்பட்டு, பின்னர் ${lord5} அல்லது குருவின் சுப புத்தியில் நல்ல வாரிசு யோகம் கைகூடும்.`
          : `5-ஆம் அதிபதி ${lord5} மற்றும் புத்திர காரகன் குருவின் சுப அருளால் ஆரோக்கியமான, குடும்பப் பெருமை காக்கும் புத்திசாலி வாரிசு யோகம் கைகூடும்.`,
        remedy: isDelayedProgeny ? "புத்திர பாக்கியம் சுபமாக அமைய வியாழக்கிழமைகளில் குரு தட்சிணாமூர்த்திக்கு நெய்தீபம் ஏற்றுதல் அல்லது திருச்செந்தூர் முருகன் வழிபாடு நற்பலன் தரும்." : null
      };
    // 5. HOUSE / PROPERTY TIMING (வீடு / மனை யோகம்)
    const houseBhukti = pickBestBhukti(25, 48, (b) => {
      let s = 0;
      if (b.bhuktiLord === "செவ்வாய்") s += 8;
      if (b.bhuktiLord === lord4) s += 7;
      if (b.bhuktiLord === "குரு" || b.bhuktiLord === "சுக்கிரன்") s += 5;
      if (b.mahaLord === "செவ்வாய்" || b.mahaLord === lord4) s += 5;
      return s;
    }) || allBhuktis[0];

    const isPastHouse = houseBhukti ? houseBhukti.endDate < now : false;
    const isMarsExalted = planetMap["செவ்வாய்"]?.isExalted;
    const houseData = {
      dasaBhukti: houseBhukti ? `${houseBhukti.mahaLord} தசை - ${houseBhukti.bhuktiLord} புத்தி` : "செவ்வாய் / 4-ஆம் அதிபதி புத்தி",
      yearRange: houseBhukti ? `${houseBhukti.startDate.getFullYear()} - ${houseBhukti.endDate.getFullYear()}` : "",
      ageText: houseBhukti ? `வயது ${Math.round(houseBhukti.startAge)} முதல் ${Math.round(houseBhukti.endAge)}-க்குள்` : "",
      isPast: isPastHouse,
      startedPeriod: isPastHouse ? `${houseBhukti.startDate.getFullYear()} (${houseBhukti.mahaLord} தசை - ${houseBhukti.bhuktiLord} புத்தி)` : null,
      propertyType: `4-ஆம் பாவாதிபதி ${lord4} மற்றும் பூமி காரகன் செவ்வாயின் (${isMarsExalted ? 'உச்ச பலத்தால்' : 'சுப பலத்தால்'}) சொந்த மனை வாங்கி அழகிய வீடு கட்டும் பூமி யோகம் கைகூடும்.`
    };

    // 6. VEHICLE / CAR TIMING (வாகனம் / கார் யோகம்)
    const upcomingCar = allBhuktis.find(b => b.endDate >= now && b.startAge <= (nativeCurrentAge + 15) && (b.bhuktiLord === "சுக்கிரன்" || b.bhuktiLord === lord4 || b.bhuktiLord === lord2 || b.bhuktiLord === lord1)) || allBhuktis.find(b => b.endDate >= now && b.startAge <= (nativeCurrentAge + 15)) || allBhuktis.find(b => b.startAge >= 20 && b.startAge <= 55) || allBhuktis[0];
    const isPastCar = upcomingCar ? upcomingCar.endDate < now : false;
    const hasLuxuryCar = venusSubha.netScore >= 2 || (venusInfo && (venusInfo.isExalted || venusInfo.rasiId === 2 || venusInfo.rasiId === 7));
    
    let vColor = "வெள்ளை (White), சில்வர் (Silver) அல்லது பியர்ல் நிற வாகனம்";
    if (venusInfo) {
      if (venusInfo.rasiId === 2 || venusInfo.rasiId === 4 || venusInfo.rasiId === 12 || venusInfo.rasiId === 7) {
        vColor = "வெள்ளை (White), கிரீம், சில்வர் (Silver) அல்லது பியர்ல் நிற வாகனம்";
      } else if (venusInfo.rasiId === 3 || venusInfo.rasiId === 6 || venusInfo.rasiId === 11) {
        vColor = "மெட்டாலிக் சாம்பல் (Grey), ஸ்கை ப்ளூ அல்லது கருநீல நிற வாகனம்";
      } else if (venusInfo.rasiId === 1 || venusInfo.rasiId === 5 || venusInfo.rasiId === 9) {
        vColor = "மெரூன், சிவப்பு (Red/Maroon) அல்லது கம்பீரமான அடர் நிற வாகனம்";
      }
    }

    const carData = {
      statusHeading: isPastCar ? "வாகனம்/கார் அமைந்த யோகக் காலம்:" : "சொந்தமாக கார் வாங்கும் யோகக் காலம்:",
      dasaBhukti: upcomingCar ? `${upcomingCar.mahaLord} தசை - ${upcomingCar.bhuktiLord} புத்தி` : "சுக்கிரன் & 4-ஆம் அதிபதி புத்தி",
      yearRange: upcomingCar ? `${upcomingCar.startDate.getFullYear()} - ${upcomingCar.endDate.getFullYear()}` : "",
      ageText: upcomingCar ? `வயது ${Math.round(upcomingCar.startAge)} முதல் ${Math.round(upcomingCar.endAge)}-க்குள்` : "",
      isPast: isPastCar,
      carYoga: hasLuxuryCar ? "ராஜ யோக சொகுசு கார் யோகம் (Luxury Car Yoga)" : "நான்கு சக்கர வாகன கார் யோகம் (Four-Wheeler Car Yoga)",
      reason: `வாகன காரகன் சுக்கிரன் மற்றும் 4-ஆம் பாவாதிபதி ${lord4} சுபத்துவத்தால், சொந்தமாக நான்கு சக்கர வாகனம் (கார்) அமையும் யோகம் உள்ளது.`,
      vehicleColor: `${vColor} அதீத அதிர்ஷ்டத்தையும் யோகத்தையும் தரும்.`
    };

    // =========================================================================
    // NADI ASTROLOGY & SUBHATHUVAM EVALUATORS FOR 6 CORE MILESTONES
    // =========================================================================
    function getNadiConnections(targetPlanetName) {
      const target = planetMap[targetPlanetName];
      if (!target) return { conj: [], trine: [], opp: [], forward: [], backward: [] };
      const conj = [];
      const trine = [];
      const opp = [];
      const forward = [];
      const backward = [];

      for (let p in planetMap) {
        if (p === targetPlanetName) continue;
        const o = planetMap[p];
        const diff = (o.rasiId - target.rasiId + 12) % 12;
        if (diff === 0) conj.push(p);
        else if (diff === 4 || diff === 8) trine.push(p);
        else if (diff === 6) opp.push(p);
        else if (diff === 1) forward.push(p);
        else if (diff === 11) backward.push(p);
      }
      return { conj, trine, opp, forward, backward };
    }

    // 1. BUSINESS VS JOB
    const sNadi = getNadiConnections("சனி");
    let jobNadiText = "";
    if (sNadi.conj.includes("புதன்") || sNadi.trine.includes("புதன்") || sNadi.conj.includes("சுக்கிரன்") || sNadi.trine.includes("சுக்கிரன்")) {
      jobNadiText = "ஜீவன காரகன் சனிக்கு வணிகக் கிரகங்களான புதன் / சுக்கிரனின் சேர்க்கை அல்லது 1-5-9 திரிகோண நாடித் தொடர்பு உள்ளதால், சுதந்திரமான வர்த்தகம், தகவல் தொழில்நுட்பம் அல்லது தொழில் முனைவு யோகம் பலமாக உள்ளது.";
    } else if (sNadi.conj.includes("சூரியன்") || sNadi.trine.includes("சூரியன்") || sNadi.conj.includes("சந்திரன்") || sNadi.trine.includes("சந்திரன்")) {
      jobNadiText = "ஜீவன காரகன் சனிக்கு அரசு & நிர்வாகக் கிரகங்களான சூரியன் / சந்திரனின் நாடித் தொடர்பு உள்ளதால், அரசுப் பணி, கார்ப்பரேட் நிறுவன நிர்வாகம் அல்லது அதிகாரமிக்க உத்தியோக யோகம் பிரதானமாக அமைகிறது.";
    } else if (sNadi.conj.includes("செவ்வாய்") || sNadi.trine.includes("செவ்வாய்")) {
      jobNadiText = "ஜீவன காரகன் சனிக்கு செவ்வாயின் நாடித் தொடர்பு இருப்பதால் சிவில்/கட்டுமானம், உற்பத்தி, பொறியியல், பாதுகாப்பு அல்லது ரியல் எஸ்டேட் சார்ந்த பணிகளில் சிறப்புண்டு.";
    } else if (sNadi.conj.includes("குரு") || sNadi.trine.includes("குரு")) {
      jobNadiText = "ஜீவன காரகன் சனிக்கு தர்ம காரகன் குருவின் நாடித் தொடர்பு இருப்பதால் 'தர்ம கர்மாதிபதி நாடி யோகம்' உண்டாகி, கல்வி, நிதி மேலாண்மை, வங்கி, சட்டம் அல்லது கவுரவமான தலைமைப் பணி அமையும்.";
    } else {
      jobNadiText = "ஜீவன காரகன் சனியின் நாடி அமைப்புப்படி உழைப்பும் நிர்வாகத் திறனும் கொண்டு படிப்படியாக உயரும் உத்தியோக யோகம் அமைகிறது.";
    }

    const jobSubhaText = `10-ஆம் அதிபதி ${lord10 || 'புதன்'} சுபத்துவம்: ${getSubha(lord10).netScore >= 0 ? '+' : ''}${getSubha(lord10).netScore} • 6-ஆம் அதிபதி ${lord6 || 'சந்திரன்'}: ${getSubha(lord6).netScore >= 0 ? '+' : ''}${getSubha(lord6).netScore} • ஜீவன காரகன் சனி: +${saturnSubha.subhaScore} சுபத்துவம், -${saturnSubha.papaScore} பாவத்துவம் (நிகர மதிப்பு: ${saturnSubha.netScore >= 0 ? '+' : ''}${saturnSubha.netScore}). குருவின் சுப பார்வை அல்லது சேர்க்கை பெறுவது தொழில் மேன்மை மற்றும் கடன் இல்லாத உத்தியோகத்தைக் குறிக்கும்.`;

    // 2. JOB TIMING
    const timingNadiText = "நாடி விதிகளின்படி கோச்சார குரு ஜீவன காரகன் சனியை 1-5-9 திரிகோணத்தில் கடக்கும் காலத்திலும், தசா நாதனுடன் சனி தொடர்பு கொள்ளும் காலத்திலும் உத்தியோக தொடக்கம் & அடுத்தடுத்த தொழில் மாற்றங்கள் அமைகின்றன.";
    const timingSubhaText = `உத்தியோக ஸ்தானமான 6-ஆம் பாவாதிபதி மற்றும் 10-ஆம் அதிபதியின் சுபத்துவ தசா-புக்தி காலங்களில் நிலையான உத்தியோகமும், பாவத்துவ கிரகங்களின் (ராகு/கேது/சனி) தசா-புக்திகளில் வேலை மாற்றம் அல்லது தற்காலிக இடைவெளியும் ஏற்படுகின்றன.`;

    // 3. MARRIAGE & REMARRIAGE (USER RULES 1 & 2 VALIDATION)
    const kPlanet = isFemale ? "செவ்வாய்" : "சுக்கிரன்";
    const kNadi = getNadiConnections(kPlanet);
    let spouseNadiTrait = "";
    if (isFemale) {
      if (kNadi.conj.includes("குரு") || kNadi.trine.includes("குரு")) {
        spouseNadiTrait = "கணவர் காரகன் செவ்வாயுடன் குரு 1-5-9 திரிகோண தொடர்பு பெறுவதால் தர்ம சிந்தனையும் நல்ல குடும்ப பாரம்பரியமும் கொண்ட உயர்ந்த கணவர் அமைவார்.";
      } else if (kNadi.conj.includes("சனி") || kNadi.trine.includes("சனி") || kNadi.forward.includes("சனி")) {
        spouseNadiTrait = "கணவர் காரகன் செவ்வாய்க்கு சனியின் தொடர்பு இருப்பதால் பொறுமையும் கடின உழைப்பும் கொண்ட பொறுப்பான குடும்பப் பற்றுள்ள கணவர் அமைவார்.";
      } else if (kNadi.conj.includes("புதன்") || kNadi.trine.includes("புதன்")) {
        spouseNadiTrait = "செவ்வாய்-புதன் தொடர்பால் வசீகரமான தோற்றம், கல்வி மேன்மை மற்றும் புத்திசாலித்தனம் கொண்ட கணவர் அமைவார்.";
      } else {
        spouseNadiTrait = "கணவர் காரகன் செவ்வாய் நின்ற ராசி தத்துவத்தின்படி கடமையுணர்வும் இல்லறப் பற்றும் கொண்ட துணைவர் அமைவார்.";
      }
    } else {
      if (kNadi.conj.includes("குரு") || kNadi.trine.includes("குரு")) {
        spouseNadiTrait = "களத்திர காரகன் சுக்கிரன்-குரு தொடர்பு லட்சுமி கடாட்சம் தருகிறது; நற்குணமும் தெய்வ பக்தியும் கொண்ட மங்கலகரமான மனைவி அமைவார்.";
      } else if (kNadi.conj.includes("புதன்") || kNadi.trine.includes("புதன்")) {
        spouseNadiTrait = "சுக்கிரன்-புதன் சேர்க்கை அழகு, கலை ஆர்வம் மற்றும் இனிமையான பேச்சாற்றல் கொண்ட மனைவியைத் தரும்.";
      } else if (kNadi.conj.includes("செவ்வாய்") || kNadi.trine.includes("செவ்வாய்")) {
        spouseNadiTrait = "சுக்கிரன்-செவ்வாய் சேர்க்கையால் சுறுசுறுப்பும் கம்பீரமும் கொண்ட நிர்வாகத் திறன் மிக்க மனைவி அமைவார்.";
      } else {
        spouseNadiTrait = "களத்திர காரகன் சுக்கிரன் நின்ற பலத்தால் குடும்ப ஒற்றுமை காக்கும் இல்லத்தரசி அமைவார்.";
      }
    }

    const satRule1Info = finalSatRule1Check || { verified: false, detail: "" };
    const rule2Summary = finalRule2SummaryText || "3, 7, 11 பாவ தசா-புக்தி தொடர்பு";
    const calMarrYr = marriageCalculatedYear || (marrBhukti ? marrBhukti.startDate.getFullYear() : "");

    const marrNadiText = `
      <div style="margin-bottom:0.45rem;">
        <div style="color:#c4b5fd; font-weight:700; font-size:0.75rem; margin-bottom:2px;">
          🪐 விதி 1: கோச்சார சனி - 7-ஆம் அதிபதி பிரமாணம் (${isFemale ? 'பெண் ஜாதகம்' : 'ஆண் ஜாதகம்'}):
        </div>
        <div style="color:#ede9fe; font-size:0.75rem; line-height:1.45;">
          ${satRule1Info.verified 
            ? `ஒருவருக்கு 7-ஆம் அதிபதி மீது சனி பகவான் பயணிக்கும் காலத்திலோ (இணைவு - 1st) அல்லது தனது 3, 7, 10 பார்வைகளால் நோக்கும் போதோ திருமணம் நடைபெறும். இச்சாதகத்தில் <strong>${satRule1Info.detail}</strong> இதனால் <strong>${calMarrYr}</strong>-ஆம் ஆண்டில் சுப விவாக யோகம் உறுதியாகக் கைகூடுகிறது.` 
            : `ஒருவருக்கு 7-ஆம் அதிபதி மீது சனி பகவான் பயணிக்கும் போதோ அல்லது 3, 7, 10 பார்வையால் நோக்கும் போதோ விவாக பந்தம் கூடும். 7-ஆம் அதிபதி ${lord7} பெற்றுள்ள கோச்சார சனி தொடர்பால் <strong>${calMarrYr}</strong>-ல் சுப முகூர்த்தம் அமைகிறது.`}
        </div>
      </div>

      <div style="margin-bottom:0.45rem;">
        <div style="color:#c4b5fd; font-weight:700; font-size:0.75rem; margin-bottom:2px;">
          📜 விதி 2: 3, 7, 11 பாவ தசா-புக்தி-அந்தர தொடர்பு:
        </div>
        <div style="color:#ede9fe; font-size:0.75rem; line-height:1.45;">
          3-ஆம் பாவம் (உடன்படிக்கை/முயற்சி), 7-ஆம் பாவம் (களத்திரம்/விவாகம்), 11-ஆம் பாவம் (மங்கல ஆசை பூர்த்தி) ஆகிய பாவ தொடர்புகள் இல்லாமல் திருமணம் நடைபெறாது. 
          இச்சாதகத்தில் விவாக காலத்தில்: <strong>${rule2Summary}</strong> பெற்று திருமணம் உறுதியாகிறது.
        </div>
      </div>

      <div>
        <div style="color:#c4b5fd; font-weight:700; font-size:0.75rem; margin-bottom:2px;">
          🔮 நாடி துணைவர் காரக அமைப்பு:
        </div>
        <div style="color:#ede9fe; font-size:0.75rem; line-height:1.45;">
          ${spouseNadiTrait}
        </div>
      </div>
    `;

    const marrSubhaText = isLateMarriage
      ? `7-ஆம் அதிபதி ${lord7} சுபத்துவம்: ${lord7SubhaObj.netScore >= 0 ? '+' : ''}${lord7SubhaObj.netScore} • களத்திர காரகன் ${kPlanet}: ${getSubha(kPlanet).netScore >= 0 ? '+' : ''}${getSubha(kPlanet).netScore}. லக்ன-களத்திரத்தில் ராகு/கேது அச்சு அல்லது 7-ல் சனி பார்வை உள்ளதால் பாவத்துவ அமைப்பால் பருவ வயதைத் தாண்டி வயது 27-க்கு மேல் திருமணம் சுபமாக நிகழ்ந்துள்ளது.`
      : `7-ஆம் அதிபதி ${lord7} சுபத்துவம்: ${lord7SubhaObj.netScore >= 0 ? '+' : ''}${lord7SubhaObj.netScore} • களத்திர காரகன் ${kPlanet}: ${getSubha(kPlanet).netScore >= 0 ? '+' : ''}${getSubha(kPlanet).netScore}. 7-ஆம் அதிபதி மற்றும் லக்னாதிபதியின் சுபத்துவ பலத்தால் தகுந்த பருவ வயதிலேயே சுப முகூர்த்தம் கைகூடும் அமைப்பு.`;

    // 4. CHILDBIRTH
    const gNadi = getNadiConnections("குரு");
    let childNadiText = "";
    if (gNadi.conj.includes("சூரியன்") || gNadi.trine.includes("சூரியன்") || gNadi.conj.includes("செவ்வாய்") || gNadi.trine.includes("செவ்வாய்")) {
      childNadiText = "நாடி ஜீவ விதிகளின்படி புத்திர காரகன் குருவுக்கு ஆண் கிரகங்களான சூரியன் / செவ்வாயின் நாடித் தொடர்பு இருப்பதால் பலமுள்ள வாரிசு யோகம் மற்றும் குலப்பெருமை காக்கும் சந்தான பாக்கியம் உறுதியாக உண்டு.";
    } else if (gNadi.conj.includes("சந்திரன்") || gNadi.trine.includes("சந்திரன்") || gNadi.conj.includes("சுக்கிரன்") || gNadi.trine.includes("சுக்கிரன்")) {
      childNadiText = "நாடி ஜீவ விதிகளின்படி புத்திர காரகன் குருவுக்கு பெண் கிரகங்களான சந்திரன் / சுக்கிரன் நாடித் தொடர்பு உள்ளதால் லட்சுமி கடாட்சம் கொண்ட வாரிசு யோகம் உண்டு.";
    } else if (gNadi.conj.includes("கேது") || gNadi.trine.includes("கேது")) {
      childNadiText = "நாடி விதிப்படி புத்திர காரகன் குருவுடன் ஞான காரகன் கேது இணைவதால் தெய்வ அனுகூலமும் புத்தி கூர்மையும் கொண்ட ஞானக் குழந்தை யோகம் அமையும்.";
    } else {
      childNadiText = "நாடி ஜீவ விதிகளின்படி குரு நின்ற திரிகோண அமைப்பால் வம்ச விருத்தியும் சந்தான பாக்கியமும் சீராகக் கைகூடும்.";
    }

    const childSubhaText = `புத்திர காரகன் குரு சுபத்துவம்: ${guruSubha.netScore >= 0 ? '+' : ''}${guruSubha.netScore} (+${guruSubha.subhaScore} சுபத்துவம் / -${guruSubha.papaScore} பாவத்துவம்) • 5-ஆம் பாவாதிபதி ${lord5}: ${lord5Subha.netScore >= 0 ? '+' : ''}${lord5Subha.netScore}. புத்திர ஸ்தானத்தில் உள்ள கிரகங்களின் சுப பலத்தைப் பொறுத்து ஆரோக்கியமான வாரிசு யோகம் கைகூடும் காலம்.`;

    // 5. HOUSE / PROPERTY
    const mNadi = getNadiConnections("செவ்வாய்");
    let houseNadiText = "";
    if (mNadi.conj.includes("குரு") || mNadi.trine.includes("குரு")) {
      houseNadiText = "நாடி பூமி தத்துவப்படி பூமி காரகன் செவ்வாய்க்கு குருவின் திரிகோண சேர்க்கை இருப்பதால் வளமான பூர்வீக மனை, இயற்கை எழில் மிகுந்த தோட்டம்/வீடு வாங்கும் யோகம் உண்டு.";
    } else if (mNadi.conj.includes("சனி") || mNadi.trine.includes("சனி") || mNadi.forward.includes("சனி")) {
      houseNadiText = "நாடி தத்துவப்படி செவ்வாய்-சனி சேர்க்கையால் நவீன அடுக்குமாடி குடியிருப்பு, கட்டுமான சொத்து மற்றும் வாடகை வருமானம் தரும் சொத்து யோகம் அமையும்.";
    } else if (mNadi.conj.includes("புதன்") || mNadi.trine.includes("புதன்")) {
      houseNadiText = "நாடி தத்துவப்படி செவ்வாய்-புதன் சேர்க்கையால் நகர்ப்புற வணிக மனை, வர்த்தக ரீதியான மதிப்புமிக்க ரியல் எஸ்டேட் சொத்து யோகம் அமையும்.";
    } else {
      houseNadiText = "நாடி தத்துவப்படி பூமி காரகன் செவ்வாய் பலத்தால் சொந்த மனை வாங்கி விருப்பத்திற்கேற்ப புதிய வீடு கட்டும் யோகம் உண்டு.";
    }

    const houseSubhaText = `4-ஆம் பாவாதிபதி ${lord4} சுபத்துவம்: ${getSubha(lord4).netScore >= 0 ? '+' : ''}${getSubha(lord4).netScore} • பூமி காரகன் செவ்வாய் சுபத்துவம்: ${getSubha("செவ்வாய்").netScore >= 0 ? '+' : ''}${getSubha("செவ்வாய்").netScore}. 4-ஆம் பாவத்தில் பாப கிரக தாக்கங்கள் இன்றி சுப கிரக பார்வை பெறுவதால் சொந்த வீடு கட்டும் யோகம் அமைகிறது.`;

    // 6. VEHICLE / CAR
    const vNadi = getNadiConnections("சுக்கிரன்");
    let vehicleNadiText = "";
    if (vNadi.conj.includes("ராகு") || vNadi.trine.includes("ராகு")) {
      vehicleNadiText = "நாடி வாகன தத்துவப்படி வாகன காரகன் சுக்கிரன்-ராகு சேர்க்கை பிரம்மாண்டமான, நவீன சொகுசு கார் (Luxury SUV) மற்றும் உயர்தர வாகன யோகத்தைத் தரும்.";
    } else if (vNadi.conj.includes("குரு") || vNadi.trine.includes("குரு") || vNadi.conj.includes("சூரியன்")) {
      vehicleNadiText = "நாடி வாகன தத்துவப்படி சுக்கிரன்-குரு சேர்க்கை சமூகத்தில் மதிப்பும் கவுரவமும் தரும் பிரஸ்டீஜ் வெள்ளை/சில்வர் நிற கார் யோகத்தைத் தரும்.";
    } else if (vNadi.conj.includes("சனி") || vNadi.trine.includes("சனி")) {
      vehicleNadiText = "நாடி வாகன தத்துவப்படி சுக்கிரன்-சனி சேர்க்கை நீடித்து உழைக்கும், சௌகரியமான சொந்த நான்கு சக்கர வாகன யோகத்தைத் தரும்.";
    } else {
      vehicleNadiText = "நாடி வாகன தத்துவப்படி சுக்கிரன் பலத்தால் சொந்தமாக நான்கு சக்கர வாகனம் (கார்) அமையும் யோகம் உண்டு.";
    }

    const vehicleSubhaText = `வாகன காரகன் சுக்கிரன் சுபத்துவம்: ${venusSubha.netScore >= 0 ? '+' : ''}${venusSubha.netScore} • 4-ஆம் பாவாதிபதி ${lord4}: ${getSubha(lord4).netScore >= 0 ? '+' : ''}${getSubha(lord4).netScore}. சுக்கிரனின் சுபத்துவ மதிப்பெண் +3-க்கு மேல் அமைவது சொகுசு கார் யோகத்தைக் குறிக்கும்.`;

    return {
      allBhuktis: allBhuktis,
      education: educationData,
      jobVerdict: {
        type: jobType,
        verdict: jobVerdict,
        reason: jobReason,
        fields: recommendedFields,
        canStartBusiness: canStartNewBusiness,
        location: jobLocationData,
        nadiPrediction: jobNadiText,
        subhaPrediction: jobSubhaText
      },
      jobTiming: {
        firstJob: firstJobData,
        secondJob: secondJobData,
        lossBreak: jobLossBreakData,
        careerElevation: careerElevationData,
        careerTimelineEngine: careerTimelineEngine,
        nadiPrediction: timingNadiText,
        subhaPrediction: timingSubhaText
      },
      marriage: marriageData ? {
        ...marriageData,
        nadiPrediction: marrNadiText,
        subhaPrediction: marrSubhaText
      } : null,
      child: childData ? {
        ...childData,
        nadiPrediction: childNadiText,
        subhaPrediction: childSubhaText
      } : null,
      house: houseData ? {
        ...houseData,
        nadiPrediction: houseNadiText,
        subhaPrediction: houseSubhaText
      } : null,
      vehicle: carData ? {
        ...carData,
        nadiPrediction: vehicleNadiText,
        subhaPrediction: vehicleSubhaText
      } : null
    };
  }

  function parseDateOnly(val) {
    if (!val) return new Date();
    if (val instanceof Date) return val;
    if (typeof val === 'string') {
      if (val.includes('T')) return new Date(val);
      if (val.includes('-')) {
        const parts = val.split('-').map(Number);
        if (parts.length === 3) return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0);
      } else if (val.includes('/')) {
        const parts = val.split('/').map(Number);
        if (parts.length === 3) return new Date(parts[2], parts[1] - 1, parts[0], 0, 0, 0);
      }
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date() : d;
  }

  function getPlanetAstroDetails(planetName, placedPlanets, lagnaRasiId, subhathuvamResult) {
    if (!planetName) return { name: '-', house: '-', rasi: '-', dignity: 'சமம்', subhaText: '' };
    const RASIS = (window.PGAstro && window.PGAstro.chart && window.PGAstro.chart.RASIS) || [];
    const pl = (placedPlanets || []).find(p => p.planet === planetName);
    if (!pl) return { name: planetName, house: '-', rasi: '-', dignity: 'சமம்', subhaText: '' };

    const house = pl.house || (lagnaRasiId ? ((pl.rasiId - lagnaRasiId + 12) % 12 || 12) : '-');
    const rasiObj = RASIS.find(r => r.id === pl.rasiId);
    const rasiName = rasiObj ? rasiObj.name : '';

    let dignity = pl.isExalted ? 'உச்சம்'
      : pl.isOwnHouse ? 'ஆட்சி'
      : pl.isMoolatrikona ? 'மூலத்திரிகோணம்'
      : pl.isDebilitated ? 'நீசம்'
      : pl.isRetrograde ? 'வக்ரம்'
      : 'சுப பலம்';

    let subhaText = '';
    if (subhathuvamResult && subhathuvamResult.scores && subhathuvamResult.scores[planetName]) {
      const sc = subhathuvamResult.scores[planetName];
      const scoreVal = (sc.netScore !== undefined ? sc.netScore : (typeof sc === 'number' ? sc : 0)).toFixed(1);
      subhaText = ` (சுபத்துவம்: ${scoreVal > 0 ? '+' + scoreVal : scoreVal})`;
    }

    return {
      name: planetName,
      house: house,
      rasi: rasiName,
      dignity: dignity,
      subhaText: subhaText
    };
  }

  function getChronologicalDasaPuthiTimeline(analysis) {
    const dobStr = analysis?.nativeInfo?.dob || document.getElementById("birthCalcDate")?.value || "1989-05-15";
    const timeStr = analysis?.nativeInfo?.time || document.getElementById("birthCalcTime")?.value || "12:00";
    const dobDate = parseDateOnly(dobStr);

    let allBhuktis = (analysis.milestones && analysis.milestones.allBhuktis) || [];
    const msPerYear = 365.2425 * 24 * 60 * 60 * 1000;
    const DASHA_ORDER = [
      { lord: "கேது", years: 7 }, { lord: "சுக்கிரன்", years: 20 },
      { lord: "சூரியன்", years: 6 }, { lord: "சந்திரன்", years: 10 },
      { lord: "செவ்வாய்", years: 7 }, { lord: "ராகு", years: 18 },
      { lord: "குரு", years: 16 }, { lord: "சனி", years: 19 },
      { lord: "புதன்", years: 17 }
    ];

    if (!allBhuktis || allBhuktis.length === 0) {
      allBhuktis = [];
      if (analysis.dashaResult && analysis.dashaResult.dashaTimeline) {
        analysis.dashaResult.dashaTimeline.forEach(dasa => {
          const dIdx = DASHA_ORDER.findIndex(d => d.lord === dasa.lord);
          if (dIdx !== -1) {
            let bStart = dasa.startMs || (dasa.startDate ? new Date(dasa.startDate).getTime() : (dasa.start ? new Date(dasa.start).getTime() : null));
            if (bStart) {
              const mInfo = DASHA_ORDER[dIdx];
              for (let b = 0; b < 9; b++) {
                const bInfo = DASHA_ORDER[(dIdx + b) % 9];
                const bDur = (mInfo.years * bInfo.years / 120) * msPerYear;
                const bEnd = bStart + bDur;
                allBhuktis.push({
                  mahaLord: mInfo.lord,
                  bhuktiLord: bInfo.lord,
                  startDate: new Date(bStart),
                  endDate: new Date(bEnd),
                  startAge: (bStart - dobDate.getTime()) / msPerYear,
                  endAge: (bEnd - dobDate.getTime()) / msPerYear
                });
                bStart = bEnd;
              }
            }
          }
        });
      }

      if (allBhuktis.length === 0) {
        let dIdx = 0;
        let curStart = new Date(dobDate.getTime());
        for (let cycle = 0; cycle < 7; cycle++) {
          const mInfo = DASHA_ORDER[dIdx];
          const mDur = mInfo.years * msPerYear;
          let bStart = curStart.getTime();
          for (let b = 0; b < 9; b++) {
            const bInfo = DASHA_ORDER[(dIdx + b) % 9];
            const bDur = (mInfo.years * bInfo.years / 120) * msPerYear;
            const bEnd = bStart + bDur;
            allBhuktis.push({
              mahaLord: mInfo.lord,
              bhuktiLord: bInfo.lord,
              startDate: new Date(bStart),
              endDate: new Date(bEnd),
              startAge: (bStart - dobDate.getTime()) / msPerYear,
              endAge: (bEnd - dobDate.getTime()) / msPerYear
            });
            bStart = bEnd;
          }
          curStart = new Date(curStart.getTime() + mDur);
          dIdx = (dIdx + 1) % 9;
        }
      }
    }

    allBhuktis.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    const nowMs = new Date().getTime();
    let curIdx = allBhuktis.findIndex(b => b.startDate.getTime() <= nowMs && nowMs < b.endDate.getTime());

    if (curIdx === -1) {
      const firstFut = allBhuktis.findIndex(b => b.startDate.getTime() > nowMs);
      if (firstFut > 0) curIdx = firstFut - 1;
      else if (firstFut === 0) curIdx = 0;
      else curIdx = allBhuktis.length - 1;
    }

    const present = curIdx >= 0 ? allBhuktis[curIdx] : null;
    const past = curIdx > 0 ? allBhuktis[curIdx - 1] : null;
    const future = (curIdx >= 0 && curIdx < allBhuktis.length - 1) ? allBhuktis[curIdx + 1] : null;

    return {
      allBhuktis,
      curIdx,
      past,
      present,
      future
    };
  }

  function renderDasaPuthiTimelineCard(analysis) {
    const timeline = getChronologicalDasaPuthiTimeline(analysis);
    if (!timeline.present) return '';

    const formatD = (d) => {
      if (!d || isNaN(d.getTime())) return '-';
      const months = ["ஜனவரி", "பிப்ரவரி", "மார்ச்", "ஏப்ரல்", "மே", "ஜூன்", "ஜூலை", "ஆகஸ்ட்", "செப்டம்பர்", "அக்டோபர்", "நவம்பர்", "டிசம்பர்"];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    const lagnaId = (window.PGAstro && window.PGAstro.chart && window.PGAstro.chart.getLagnaRasiId()) || analysis.lagnaRasiId;
    const placed = analysis.placedPlanets || [];
    const subha = analysis.subhathuvamResult;

    const buildTileHtml = (title, badgeClass, badgeText, puthi, isPresent = false) => {
      if (!puthi) return '';
      const mahaInfo = getPlanetAstroDetails(puthi.mahaLord, placed, lagnaId, subha);
      const bhuktiInfo = getPlanetAstroDetails(puthi.bhuktiLord, placed, lagnaId, subha);

      const dateStr = `${formatD(puthi.startDate)} முதல் ${formatD(puthi.endDate)} வரை`;
      let sA = Math.max(0, puthi.startAge);
      let eA = Math.max(0, puthi.endAge);
      let startAgeInt = Math.floor(sA);
      let endAgeInt = Math.ceil(eA);
      if (startAgeInt === endAgeInt) endAgeInt = startAgeInt + 1;
      const ageStr = (eA < 3) 
        ? `வயது ${sA.toFixed(1)} – ${eA.toFixed(1)}` 
        : `வயது ${startAgeInt} முதல் ${endAgeInt} வரை`;

      let stateText = "";
      if (badgeClass.includes("past") || badgeText.includes("கடந்த")) {
        stateText = `கடந்த காலத்தில் மகாதசை அதிபதி <strong>${mahaInfo.name}</strong> (${mahaInfo.house}-ஆம் பாவம், ${mahaInfo.rasi}, ${mahaInfo.dignity}) மற்றும் புக்தி அதிபதி <strong>${bhuktiInfo.name}</strong> (${bhuktiInfo.house}-ஆம் பாவம், ${bhuktiInfo.rasi}, ${bhuktiInfo.dignity}) ஆதிக்கத்தில் ${mahaInfo.house} & ${bhuktiInfo.house}-ஆம் பாவக பலன்கள் நிறைவடைந்துள்ளன.`;
      } else if (isPresent) {
        stateText = `தற்போது மகாதசை அதிபதி <strong>${mahaInfo.name}</strong> (${mahaInfo.house}-ஆம் பாவம், ${mahaInfo.rasi}, ${mahaInfo.dignity}) மற்றும் புக்தி அதிபதி <strong>${bhuktiInfo.name}</strong> (${bhuktiInfo.house}-ஆம் பாவம், ${bhuktiInfo.rasi}, ${bhuktiInfo.dignity}) ஆதிக்கத்தில் ${mahaInfo.house} & ${bhuktiInfo.house}-ஆம் பாவக பலன்கள் உண்மையாக நடந்து வருகின்றன.`;
      } else {
        stateText = `அடுத்ததாக வரவிருக்கும் இந்த புக்தியில் மகாதசை அதிபதி <strong>${mahaInfo.name}</strong> (${mahaInfo.house}-ஆம் பாவம், ${mahaInfo.rasi}, ${mahaInfo.dignity}) மற்றும் புக்தி அதிபதி <strong>${bhuktiInfo.name}</strong> (${bhuktiInfo.house}-ஆம் பாவம், ${bhuktiInfo.rasi}, ${bhuktiInfo.dignity}) ஆதிக்கத்தில் ${bhuktiInfo.house}-ஆம் பாவகப் பலன்கள் புதிதாகத் தொடங்கும்.`;
      }

      return `
        <div class="timing-tile ${badgeClass}" style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(212,175,55,0.3); border-radius: var(--radius-sm); padding: 0.85rem; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
              <span style="font-weight: 700; font-size: 0.88rem; color: var(--gold-light);">${title}</span>
              <span class="badge ${badgeText.includes('உண்மையாக') ? 'badge-gold' : (badgeText.includes('முடிவடைந்தது') ? 'badge-info' : 'badge-success')}" style="font-size: 0.68rem;">${badgeText}</span>
            </div>

            <div style="font-size: 1.05rem; font-weight: 800; color: #fff; margin-bottom: 0.3rem;">
              ${puthi.mahaLord} தசை – ${puthi.bhuktiLord} புக்தி
            </div>

            <div style="font-size: 0.76rem; color: #93c5fd; background: rgba(30, 58, 138, 0.35); border: 1px solid rgba(59, 130, 246, 0.3); padding: 4px 8px; border-radius: 4px; margin-bottom: 0.5rem; display: flex; justify-content: space-between;">
              <span>📅 ${dateStr}</span>
              <span>👤 ${ageStr}</span>
            </div>

            <div style="font-size: 0.78rem; color: #e2e8f0; line-height: 1.45; background: rgba(0,0,0,0.25); padding: 0.5rem; border-radius: 4px; border-left: 3px solid var(--gold-primary); margin-bottom: 0.4rem;">
              <div style="margin-bottom: 0.2rem;">🪐 <strong>மகாதசை (${mahaInfo.name}):</strong> ${mahaInfo.house}-ஆம் பாவம் (${mahaInfo.rasi}) • <span style="color:#fde047;">${mahaInfo.dignity}</span>${mahaInfo.subhaText}</div>
              <div>🌙 <strong>புக்தி (${bhuktiInfo.name}):</strong> ${bhuktiInfo.house}-ஆம் பாவம் (${bhuktiInfo.rasi}) • <span style="color:#67e8f9;">${bhuktiInfo.dignity}</span>${bhuktiInfo.subhaText}</div>
            </div>
          </div>

          <div style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.4; margin-top: 0.4rem; padding-top: 0.4rem; border-top: 1px solid rgba(255,255,255,0.1);">
            ${stateText}
          </div>
        </div>
      `;
    };

    return `
      <div class="dasa-timeline-container-card" style="background: linear-gradient(135deg, rgba(13, 18, 36, 0.95), rgba(20, 26, 50, 0.9)); border: 1px solid rgba(212, 175, 55, 0.45); border-radius: var(--radius-md); padding: 1rem; margin-top: 0.8rem; margin-bottom: 1.2rem; box-shadow: 0 6px 20px rgba(0,0,0,0.35);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem; border-bottom: 1px solid rgba(212,175,55,0.25); padding-bottom: 0.5rem;">
          <h4 style="color: var(--gold-light); margin: 0; font-size: 1.05rem; display: flex; align-items: center; gap: 0.4rem;">
            <span>🔮</span> தசா – புக்தி பலன்கள் & கால அட்டவணை (Dasa-Puthi Timeline)
          </h4>
          <span class="badge badge-gold" style="font-size: 0.72rem;">துல்லிய கால நிர்ணயம்</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.85rem;">
          ${timeline.past ? buildTileHtml('⏪ கடந்த புக்தி (Past)', 'past', 'முடிவடைந்தது', timeline.past, false) : ''}
          ${timeline.present ? buildTileHtml('⏸️ நிகழ்கால புக்தி (Present)', 'present', 'உண்மையாக நடப்பது', timeline.present, true) : ''}
          ${timeline.future ? buildTileHtml('⏩ எதிர்கால புக்தி (Future)', 'future', 'அடுத்த முதல் புக்தி', timeline.future, false) : ''}
        </div>
      </div>
    `;
  }

  function renderEvaluationResults(analysis) {
    const container = document.getElementById("chartAnalysisContainer");
    if (!container) return;
    const RASIS = (window.PGAstro && window.PGAstro.chart && window.PGAstro.chart.RASIS) || [];

    if (analysis.placedPlanets.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="text-align:center; padding: 2rem 1rem; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🌌</div>
          <h4>கிரகங்களை கட்டத்தில் வைக்கவும்</h4>
          <p style="font-size: 0.85rem; margin-top: 0.3rem;">மேலே உள்ள கிரகங்களை தொட்டு, ராசி கட்டங்களில் கிளிக் செய்து வைக்கவும் அல்லது தயாராக உள்ள மாதிரி ஜாதகங்களை தேர்ந்தெடுக்கவும்.</p>
        </div>
      `;
      return;
    }

    let html = "";
    const subha = analysis.subhathuvamResult;

    // Extract Native Info details for top summary banner
    const nInfo = analysis.nativeInfo || (window.PGAstro && window.PGAstro.chart && window.PGAstro.chart.getNativeInfo()) || {};
    const nName = nInfo.name || document.getElementById("birthCalcName")?.value || "அன்பர் (Native)";
    const nGender = nInfo.gender === "female" ? "பெண் (Female)" : (nInfo.gender === "other" ? "மற்றவை" : "ஆண் (Male)");
    const nDob = nInfo.dob || document.getElementById("birthCalcDate")?.value || "-";
    const nTime = nInfo.time || document.getElementById("birthCalcTime")?.value || "-";
    let nPlace = nInfo.place || document.getElementById("birthCalcPlaceCustom")?.value || "";
    if (!nPlace) {
      const pSel = document.getElementById("birthCalcPlaceSelect");
      if (pSel && pSel.value && window.PGAstro && window.PGAstro.astronomy && window.PGAstro.astronomy.CITIES[pSel.value]) {
        nPlace = window.PGAstro.astronomy.CITIES[pSel.value].name;
      } else {
        nPlace = "திருவண்ணாமலை (Tiruvannamalai)";
      }
    }

    const lagnaId = (window.PGAstro && window.PGAstro.chart && window.PGAstro.chart.getLagnaRasiId()) || null;
    const lagnaDeg = (window.PGAstro && window.PGAstro.chart && window.PGAstro.chart.getLagnaDegree()) || null;
    const lagnaRasi = lagnaId ? (RASIS.find(r => r.id === lagnaId)?.name || "") : "";
    const moonPlanet = (analysis.placedPlanets || []).find(p => p.planet === "சந்திரன்");
    const moonRasi = moonPlanet ? (RASIS.find(r => r.id === moonPlanet.rasiId)?.name || "") : "";
    const sunPlanet = (analysis.placedPlanets || []).find(p => p.planet === "சூரியன்");

    // Exact Age, Panchangam & Karakas
    const ageObj = window.PGAstro?.astronomy?.calculateAge(nDob, nTime);
    let engPanchangam = null;
    let engMoonNak = null;
    if (sunPlanet && moonPlanet) {
      const sLon = (sunPlanet.rasiId - 1) * 30 + (sunPlanet.degree || 0);
      const mLon = (moonPlanet.rasiId - 1) * 30 + (moonPlanet.degree || 0);
      engPanchangam = window.PGAstro?.astronomy?.calculatePanchangam(sLon, mLon);
      engMoonNak = window.PGAstro?.astronomy?.getNakshatraInfo(mLon);
    }
    const karakasObj = window.PGAstro?.astronomy?.calculateCharaKarakas((analysis.placedPlanets || []).map(p => ({ planet: p.planet, degree: p.degree })));
    let akTag = "-", dkTag = "-";
    if (karakasObj && karakasObj.charaMap) {
      for (let pl in karakasObj.charaMap) {
        if (karakasObj.charaMap[pl].code === "AK") akTag = `${pl}`;
        if (karakasObj.charaMap[pl].code === "DK") dkTag = `${pl}`;
      }
    }

    // =========================================================================
    // 1. LIFE PREDICTIONS & KEY MILESTONES (முக்கிய வாழ்க்கை பலன்கள்)
    // =========================================================================
    if (analysis.lifeMilestones) {
      const m = analysis.lifeMilestones;
      const ed = m.education;
      const jv = m.jobVerdict;
      const jt = m.jobTiming;
      const mr = m.marriage;
      const ch = m.child;
      const hs = m.house;
      const vh = m.vehicle;

      html += `
        <div class="milestones-dashboard-card">
          <!-- Header -->
          <div class="milestones-header">
            <div>
              <h3 class="milestones-title">
                <span>🌟</span> முக்கிய வாழ்க்கை பலன்கள் & கால நிர்ணயம் (Life Predictions)
              </h3>
              <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
                சுபத்துவம், சூட்சும வலு & நாடி விதிகளின்படி கணிக்கப்பட்ட கல்வி, வேலை, திருமணம், குழந்தைப் பிறப்பு, வீடு, கார் யோகங்கள்
              </div>
            </div>
            <span class="badge badge-gold" style="font-size:0.72rem;">நாடி & சுபத்துவ பிரமாணம்</span>
          </div>

          <!-- Native Birth Summary Strip -->
          <div style="background: rgba(13, 18, 36, 0.85); border: 1px solid rgba(212, 175, 55, 0.4); border-radius: var(--radius-md); padding: 0.75rem 1rem; margin: 0.6rem 0 1rem 0; display: flex; flex-wrap: wrap; gap: 0.6rem 1.4rem; align-items: center; font-size: 0.82rem; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
            <div style="display: flex; align-items: center; gap: 0.35rem; color: #fff; font-weight: 700;">
              <span style="font-size: 1rem;">👤</span> <span>${nName}</span>
              <span class="badge ${nInfo.gender === 'female' ? 'badge-pink' : 'badge-gold'}" style="font-size:0.68rem; margin-left:3px;">${nGender}</span>
            </div>
            <div style="color: var(--text-muted);">
              <strong style="color: var(--gold-light);">📅 பிறந்த நாள் & நேரம்:</strong> ${nDob} ${nTime}
            </div>
            ${ageObj ? `
              <div style="background:rgba(212,175,55,0.12); border:1px solid rgba(212,175,55,0.35); padding:2px 8px; border-radius:4px;">
                <strong style="color:#ffd700;">⏳ நடப்பு வயது:</strong> <span style="color:#fff; font-weight:700;">${ageObj.formattedText}</span>
              </div>
            ` : ''}
            <div style="color: var(--text-muted);">
              <strong style="color: var(--gold-light);">📍 இடம்:</strong> <span style="color: #93c5fd; font-weight: 600;">${nPlace}</span>
            </div>
            ${lagnaRasi ? `<div style="color: var(--text-muted);"><strong style="color: var(--gold-light);">🌅 லக்கினம்:</strong> <span style="color:#fff;">${lagnaRasi} ${lagnaDeg !== null ? '(' + lagnaDeg.toFixed(1) + '°)' : ''}</span></div>` : ''}
            ${moonRasi ? `<div style="color: var(--text-muted);"><strong style="color: var(--gold-light);">🌙 ராசி:</strong> <span style="color:#fff;">${moonRasi}</span></div>` : ''}
            ${engMoonNak ? `
              <div style="color: var(--text-muted);">
                <strong style="color: #fde047;">⭐ நட்சத்திரம் & சாரம்:</strong> <span style="color:#fff;">${engMoonNak.nakshatra} (${engMoonNak.pada} பாதம்) • <strong style="color:#38bdf8;">${engMoonNak.lord} சாரம்</strong></span>
              </div>
            ` : ''}
            ${engPanchangam ? `
              <div style="color: var(--text-muted);">
                <strong style="color: #67e8f9;">🌕 திதி:</strong> <span style="color:#fff;">${engPanchangam.tithi.fullName}</span>
              </div>
              <div style="color: var(--text-muted);">
                <strong style="color: #f472b6;">⚡ யோகம்:</strong> <span style="color:#fff;">${engPanchangam.yogam.name}</span>
              </div>
              <div style="color: var(--text-muted);">
                <strong style="color: #c084fc;">🦁 கரணம்:</strong> <span style="color:#fff;">${engPanchangam.karanam.name}</span>
              </div>
            ` : ''}
            ${akTag !== '-' ? `
              <div style="color: var(--text-muted);">
                <strong style="color: #ffd700;">👑 காரகம்:</strong> <span style="color:#fff;">AK: <strong style="color:#ffd700;">${akTag}</strong> | DK: <strong style="color:#f43f5e;">${dkTag}</strong></span>
              </div>
            ` : ''}
          </div>

          <!-- 7 Core Milestones Grid -->
          <div class="milestones-grid">

            <!-- Card 0: Education & Field of Study (கல்வி & படிப்புத் துறை யோகம்) -->
            ${ed ? `
            <div class="milestone-card card-education">
              <div>
                <div class="milestone-card-top">
                  <div class="milestone-icon-title">
                    <span class="icon">🎓</span>
                    <div>
                      <h4 class="milestone-card-title">கல்வி & படிப்புத் துறை</h4>
                      <span class="milestone-card-subtitle">Education & Field of Study</span>
                    </div>
                  </div>
                  <span class="badge ${ed.badgeClass}" style="font-size:0.68rem;">
                    ${ed.isStudent ? 'எதிர்காலக் கல்வி' : 'பயின்ற கல்வி'}
                  </span>
                </div>

                <div class="milestone-verdict-box" style="background:rgba(6, 182, 212, 0.08); border-color:rgba(6, 182, 212, 0.25);">
                  <div style="font-size:0.73rem; color:var(--text-muted); margin-bottom:2px;">${ed.headingText}</div>
                  <div class="milestone-highlight-text" style="color:#22d3ee; font-size:0.95rem;">${ed.primaryStream.name}</div>
                  <div style="font-size:0.75rem; color:#fde047; margin-top:3px; font-weight:600;">
                    📘 உகந்த படிப்புகள்: ${ed.primaryStream.degrees}
                  </div>
                  ${ed.timing ? `
                    <span class="milestone-time-pill" style="margin-top:5px; display:inline-block;">
                      📅 ${ed.timing.yearRange} • ${ed.timing.dasaBhukti} (${ed.timing.ageText})
                    </span>
                  ` : ''}
                </div>

                <p class="milestone-desc-text" style="margin-top:0.45rem;">${ed.primaryStream.desc}</p>

                <!-- Study-Job Alignment Box (படித்த படிப்பு சார்ந்த வேலை அமையுமா?) -->
                <div style="background:rgba(16, 185, 129, 0.08); border:1px solid rgba(16, 185, 129, 0.25); border-radius:var(--radius-sm); padding:0.6rem 0.75rem; margin-top:0.5rem;">
                  <div style="font-size:0.72rem; color:#34d399; font-weight:700; display:flex; justify-content:space-between; align-items:center;">
                    <span>💼 படிப்பு சார்ந்த வேலை அமையுமா?</span>
                    <span class="badge ${ed.jobAlignment.badgeClass}" style="font-size:0.65rem;">
                      ${ed.jobAlignment.isAligned ? 'நேரடித் தொடர்பு' : 'மாற்றுத் துறை'}
                    </span>
                  </div>
                  <div style="font-size:0.82rem; font-weight:700; color:#fff; margin-top:3px;">
                    ${ed.jobAlignment.verdict}
                  </div>
                  <div style="font-size:0.72rem; color:var(--text-dim); margin-top:3px; line-height:1.4;">
                    ${ed.jobAlignment.details}
                  </div>
                </div>

                <!-- Education Level & Higher Studies -->
                <div style="background:rgba(59, 130, 246, 0.08); border:1px solid rgba(59, 130, 246, 0.2); border-radius:var(--radius-sm); padding:0.55rem 0.75rem; margin-top:0.45rem;">
                  <div style="font-size:0.72rem; color:#60a5fa; font-weight:700;">
                    📚 கல்வி நிலை: <span style="color:#fff;">${ed.educationLevel.verdict}</span>
                  </div>
                  <div style="font-size:0.71rem; color:var(--text-muted); margin-top:2px; line-height:1.35;">
                    ${ed.educationLevel.details}
                  </div>
                </div>

                <!-- Obstacles / Continuity in Studies -->
                <div style="font-size:0.72rem; color:#cbd5e1; margin-top:0.45rem; padding:0.4rem 0.6rem; background:rgba(255,255,255,0.03); border-radius:var(--radius-sm); line-height:1.35;">
                  📖 <strong>கல்வித் தொடர்ச்சி:</strong> ${ed.obstacleText}
                </div>

                ${ed.nadiPrediction ? `
                  <div class="milestone-nadi-box">
                    <div class="nadi-badge">🔮 நாடி வித்யா பிரமாணம் (Nadi Rule)</div>
                    <div class="nadi-box-content">${ed.nadiPrediction}</div>
                  </div>
                ` : ""}

                ${ed.subhaPrediction ? `
                  <div class="milestone-subha-box">
                    <div class="subha-badge">✨ வித்யா காரக சுபத்துவ பலம்</div>
                    <div class="subha-box-content">${ed.subhaPrediction}</div>
                  </div>
                ` : ""}

                ${ed.remedy ? `
                  <div style="background:rgba(168, 85, 247, 0.08); border:1px solid rgba(168, 85, 247, 0.25); border-radius:var(--radius-sm); padding:0.5rem 0.7rem; margin-top:0.5rem;">
                    <div style="font-size:0.7rem; color:#c084fc; font-weight:700; margin-bottom:2px;">
                      🪔 கல்வி மேன்மைக்கான பரிகாரம்:
                    </div>
                    <div style="font-size:0.72rem; color:#e9d5ff; line-height:1.35;">
                      ${ed.remedy}
                    </div>
                  </div>
                ` : ""}
              </div>

              <div class="milestone-tag-row">
                <span style="font-size:0.68rem; color:var(--gold-light); font-weight:700; width:100%; margin-bottom:2px;">கூடுதல் மாற்றுத் துறை:</span>
                <span class="milestone-tag" style="border-color:rgba(6, 182, 212, 0.4); color:#67e8f9;">${ed.secondaryStream.name}</span>
              </div>
            </div>
            ` : ""}

            <!-- Card 1: Business vs Job & Can Start New Business -->
            <div class="milestone-card card-job-type">
              <div>
                <div class="milestone-card-top">
                  <div class="milestone-icon-title">
                    <span class="icon">💼</span>
                    <div>
                      <h4 class="milestone-card-title">தொழில் அல்லது வேலை?</h4>
                      <span class="milestone-card-subtitle">Business vs Salaried Job</span>
                    </div>
                  </div>
                  <span class="badge ${jv.type === 'business' ? 'badge-gold' : (jv.type === 'job' ? 'badge-blue' : 'badge-green')}" style="font-size:0.68rem;">
                    ${jv.type === 'business' ? 'சுய தொழில்' : (jv.type === 'job' ? 'உத்தியோகம்' : 'இரண்டும்')}
                  </span>
                </div>

                <div class="milestone-verdict-box">
                  <div class="milestone-highlight-text" style="color:#38bdf8;">${jv.verdict}</div>
                </div>

                <p class="milestone-desc-text">${jv.reason}</p>

                ${jv.canStartBusiness ? `
                  <div style="background:rgba(245, 158, 11, 0.08); border:1px solid rgba(245, 158, 11, 0.25); border-radius:var(--radius-sm); padding:0.6rem 0.75rem; margin-top:0.5rem;">
                    <div style="font-size:0.72rem; color:#fbbf24; font-weight:700; display:flex; justify-content:space-between; align-items:center;">
                      <span>🏢 புதிய தொழில் தொடங்க முடியுமா?</span>
                      <span class="badge ${jv.canStartBusiness.canStart ? 'badge-green' : 'badge-gold'}" style="font-size:0.65rem;">
                        ${jv.canStartBusiness.canStart ? 'ஆம், தொடங்கலாம்' : 'உத்தியோகமே நன்று'}
                      </span>
                    </div>
                    <div style="font-size:0.84rem; font-weight:700; color:#fff; margin-top:3px;">
                      ${jv.canStartBusiness.verdict}
                    </div>
                    <div style="font-size:0.73rem; color:#6ee7b7; margin-top:3px;">
                      ⏳ <strong>உகந்த தொடக்க காலம்:</strong> ${jv.canStartBusiness.timingText}
                    </div>
                    <div style="font-size:0.72rem; color:var(--text-dim); margin-top:3px; line-height:1.35;">
                      ${jv.canStartBusiness.details}
                    </div>
                  </div>
                ` : ""}

                ${jv.location ? `
                  <div class="job-location-card-section">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem; flex-wrap:wrap; gap:4px;">
                      <div style="font-size:0.75rem; font-weight:700; color:#38bdf8; display:flex; align-items:center; gap:5px;">
                        <span>📍</span> உத்தியோக இடம் & வாய்ப்பு கணிப்பு (Job Location):
                      </div>
                      <span class="badge ${jv.location.badgeClass}" style="font-size:0.68rem;">${jv.location.badgeText}</span>
                    </div>

                    <div style="font-size:0.92rem; font-weight:800; color:#fff; margin-bottom:0.35rem;">
                      ${jv.location.primaryVerdict}
                    </div>

                    <div style="font-size:0.75rem; color:#e0f2fe; line-height:1.45; margin-bottom:0.55rem;">
                      ${jv.location.explanation}
                    </div>

                    <!-- Status: வேலைக்கு போகவில்லையா? (Employment / Job Seeking Status) -->
                    <div style="background:rgba(0,0,0,0.25); border-left:3px solid ${jv.location.statusColor}; padding:0.45rem 0.65rem; border-radius:3px; margin-bottom:0.55rem;">
                      <div style="font-size:0.72rem; font-weight:700; color:${jv.location.statusColor};">
                        💼 தற்போதைய பணி நிலை (Employment Status):
                      </div>
                      <div style="font-size:0.76rem; color:#f1f5f9; margin-top:2px; line-height:1.4;">
                        ${jv.location.statusText}
                      </div>
                    </div>

                    <!-- Probability Distribution -->
                    <div style="margin-top:0.4rem;">
                      <div style="font-size:0.68rem; color:var(--gold-light); font-weight:700; margin-bottom:4px;">
                        🌐 பணி இட யோக விகிதம் (Location Probability Breakdown):
                      </div>
                      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(120px, 1fr)); gap:5px;">
                        <div class="loc-prob-box">
                          <span class="loc-prob-lbl">✈️ வெளிநாடு:</span>
                          <span class="loc-prob-val" style="color:#38bdf8;">${jv.location.probForeign}%</span>
                        </div>
                        <div class="loc-prob-box">
                          <span class="loc-prob-lbl">🚆 வெளி மாநிலம்:</span>
                          <span class="loc-prob-val" style="color:#c084fc;">${jv.location.probState}%</span>
                        </div>
                        <div class="loc-prob-box">
                          <span class="loc-prob-lbl">🚗 வெளி மாவட்டம்:</span>
                          <span class="loc-prob-val" style="color:#fbbf24;">${jv.location.probDistrict}%</span>
                        </div>
                        <div class="loc-prob-box">
                          <span class="loc-prob-lbl">🏡 சொந்த ஊர்:</span>
                          <span class="loc-prob-val" style="color:#34d399;">${jv.location.probLocal}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ` : ""}

                ${jv.nadiPrediction ? `
                  <div class="milestone-nadi-box">
                    <div class="nadi-badge">🔮 நாடி ஜோதிட பிரமாணம் (Nadi Rule)</div>
                    <div class="nadi-box-content">${jv.nadiPrediction}</div>
                  </div>
                ` : ""}

                ${jv.subhaPrediction ? `
                  <div class="milestone-subha-box">
                    <div class="subha-badge">✨ சுபத்துவம், பாவத்துவம் & சூட்சும வலு</div>
                    <div class="subha-box-content">${jv.subhaPrediction}</div>
                  </div>
                ` : ""}
              </div>

              <div class="milestone-tag-row">
                <span style="font-size:0.68rem; color:var(--gold-light); font-weight:700; width:100%; margin-bottom:2px;">உகந்த துறைகள்:</span>
                ${jv.fields.map(f => `<span class="milestone-tag">${f}</span>`).join("")}
              </div>
            </div>

            <!-- Card 2: Career Prediction Engine (முழு Career Timeline Engine) -->
            <div class="milestone-card card-job-time">
              <div>
                <div class="milestone-card-top">
                  <div class="milestone-icon-title">
                    <span class="icon">🚀</span>
                    <div>
                      <h4 class="milestone-card-title">Career Prediction Engine (தொழில் காலவரிசை)</h4>
                      <span class="milestone-card-subtitle">Interruption → Search → Activation → Growth → Foreign → Biz</span>
                    </div>
                  </div>
                  <span class="badge badge-gold" style="font-size:0.68rem;">Career Activation</span>
                </div>

                ${jt.careerTimelineEngine ? `
                  <div style="background:rgba(15, 23, 42, 0.6); border:1px solid rgba(255,255,255,0.12); border-radius:var(--radius-sm); padding:0.6rem 0.75rem; margin-bottom:0.45rem;">
                    <div style="font-size:0.75rem; color:#60a5fa; font-weight:700; margin-bottom:0.35rem; display:flex; align-items:center; gap:5px;">
                      <span>👔</span> <strong>Career Timeline Engine Analysis:</strong>
                    </div>
                    <div style="font-size:0.74rem; color:#e2e8f0; line-height:1.5;">
                      <div style="margin-bottom:3px;">• ⚠️ <strong>Job Interruption / Break:</strong> ${jt.careerTimelineEngine.jobLossDetection}</div>
                      <div style="margin-bottom:3px;">• 🔍 <strong>Job Search Phase:</strong> ${jt.careerTimelineEngine.jobSearchPhase}</div>
                      <div style="margin-bottom:3px; color:#fde047; font-weight:700;">• ⚡ <strong>Career Activation Period:</strong> ${jt.careerTimelineEngine.careerActivation}</div>
                      <div style="margin-bottom:3px;">• 📈 <strong>Salary Growth & Promotion:</strong> ${jt.careerTimelineEngine.salaryGrowthPromotion}</div>
                      <div style="margin-bottom:3px;">• ✈️ <strong>Job Change & Foreign Opportunities:</strong> ${jt.careerTimelineEngine.jobChangeForeign}</div>
                      <div>• 🏢 <strong>Business Transition:</strong> ${jt.careerTimelineEngine.businessTransition}</div>
                    </div>
                  </div>
                ` : ""}

                ${jt.firstJob ? `
                  <div class="milestone-verdict-box" style="margin-bottom:0.4rem;">
                    <div style="font-size:0.75rem; color:var(--text-muted);">${jt.firstJob.isPast ? 'முதல் வேலை கிடைத்த காலம் (First Job):' : 'வேலை அமையும் காலம்:'}</div>
                    <div class="milestone-highlight-text" style="color:#fbbf24; font-size:0.88rem;">${jt.firstJob.dasaBhukti}</div>
                    <span class="milestone-time-pill">📅 ${jt.firstJob.yearRange} • ${jt.firstJob.ageText}</span>
                  </div>
                ` : ""}

                ${jt.careerElevation ? `
                  <div style="background:rgba(16, 185, 129, 0.08); border:1px solid rgba(16, 185, 129, 0.2); border-radius:var(--radius-sm); padding:0.55rem 0.7rem;">
                    <div style="font-size:0.72rem; color:#34d399; font-weight:700;">🚀 வலுவான Career Activation Period:</div>
                    <div style="font-size:0.85rem; font-weight:700; color:#fff; margin-top:2px;">${jt.careerElevation.dasaBhukti}</div>
                    <div style="font-size:0.74rem; color:var(--text-dim); margin-top:2px;">வருடம்: <strong>${jt.careerElevation.yearRange}</strong> (${jt.careerElevation.ageText}) - உத்தியோக நிலைப்பு & உயர் பொறுப்பு.</div>
                  </div>
                ` : ""}

                ${jt.nadiPrediction ? `
                  <div class="milestone-nadi-box">
                    <div class="nadi-badge">🔮 நாடி ஜோதிட பிரமாணம் (Nadi Rule)</div>
                    <div class="nadi-box-content">${jt.nadiPrediction}</div>
                  </div>
                ` : ""}

                ${jt.subhaPrediction ? `
                  <div class="milestone-subha-box">
                    <div class="subha-badge">✨ சுபத்துவம், பாவத்துவம் & சூட்சும வலு</div>
                    <div class="subha-box-content">${jt.subhaPrediction}</div>
                  </div>
                ` : ""}
              </div>

              <div class="milestone-tag-row">
                <span class="milestone-tag">10-ஆம் அதிபதி</span>
                <span class="milestone-tag">சனி (ஜீவன காரகன்)</span>
                <span class="milestone-tag">சுபத்துவ தசா புத்தி</span>
              </div>
            </div>

            <!-- Card 3: Marriage Timing (திருமணம் & மறுமணம்) -->
            <div class="milestone-card card-marriage">
              <div>
                <div class="milestone-card-top">
                  <div class="milestone-icon-title">
                    <span class="icon">💍</span>
                    <div>
                      <h4 class="milestone-card-title">${mr && mr.secondMarriage ? 'திருமணம் & மறுமணம் எப்போது?' : 'திருமணம் எப்போது ஆகும்?'}</h4>
                      <span class="milestone-card-subtitle">${mr && mr.secondMarriage ? '1st Marriage, Separation & 2nd Marriage' : (mr && mr.isUnmarried ? 'தாமத விவாக அமைப்பு & சுப முகூர்த்த யோகம்' : 'Early vs Late Marriage & Timing')}</span>
                    </div>
                  </div>
                  <span class="badge ${mr && mr.secondMarriage ? 'badge-gold' : (mr && mr.isPast ? 'badge-blue' : 'badge-gold')}" style="${mr && mr.secondMarriage ? '' : (mr && mr.isPast ? '' : 'border-color:#ec4899; color:#f472b6;')} font-size:0.68rem;">
                    ${mr && mr.secondMarriage ? 'களத்திர & மறுமண யோகம்' : (mr && mr.isPast ? 'நிகழ்ந்த காலம் (Past)' : (mr && mr.isUnmarried ? '💍 தீவிர விவாக யோகம் (Upcoming)' : 'களத்திர யோகம்'))}
                  </span>
                </div>

                ${mr ? `
                  ${(mr.delayReasons && mr.delayReasons.length > 0 && !mr.secondMarriage) ? `
                    <div style="background:rgba(239, 68, 68, 0.08); border:1px solid rgba(239, 68, 68, 0.25); border-radius:var(--radius-sm); padding:0.5rem 0.65rem; margin-bottom:0.45rem;">
                      <div style="font-size:0.72rem; color:#f87171; font-weight:700; margin-bottom:3px;">
                        ⏳ திருமணம் இதுவரை தாமதமானதற்கான ஜோதிட காரணங்கள்:
                      </div>
                      <ul style="margin:0; padding-left:1.15rem; font-size:0.73rem; color:#fecaca; line-height:1.45;">
                        ${mr.delayReasons.map(r => `<li>${r}</li>`).join("")}
                      </ul>
                    </div>
                  ` : ""}

                  ${mr.firstMarriage ? `
                    <div style="background:rgba(236,72,153,0.06); border:1px solid rgba(236,72,153,0.2); border-radius:var(--radius-sm); padding:0.5rem 0.65rem; margin-bottom:0.4rem;">
                      <div style="font-size:0.72rem; color:#f472b6; font-weight:700;">💒 முதல் திருமணம் & பிரிவு வரலாறு:</div>
                      <div style="font-size:0.75rem; color:#fbcfe8; margin-top:2px;">
                        • ${mr.firstMarriage.statusText}
                      </div>
                      <div style="font-size:0.75rem; color:#fca5a5; margin-top:2px;">
                        • ${mr.firstMarriage.separationText}
                      </div>
                    </div>
                  ` : ""}

                  ${mr.divorce ? `
                    <div style="background:rgba(239,68,68,0.06); border:1px solid rgba(239,68,68,0.25); border-radius:var(--radius-sm); padding:0.5rem 0.65rem; margin-bottom:0.4rem;">
                      <div style="font-size:0.72rem; color:#f87171; font-weight:700;">⚖️ ${mr.divorce.title}:</div>
                      <div style="font-size:0.84rem; color:#fff; font-weight:700; margin-top:2px;">${mr.divorce.dasaBhukti} (${mr.divorce.yearRange})</div>
                      <div style="font-size:0.74rem; color:#fca5a5; margin-top:2px; line-height:1.35;">${mr.divorce.reason}</div>
                    </div>
                  ` : ""}

                  ${mr.secondMarriage ? `
                    <div class="milestone-verdict-box" style="background:rgba(245, 158, 11, 0.08); border-color:rgba(245, 158, 11, 0.3); margin-bottom:0.4rem;">
                      <div style="font-size:0.74rem; color:#fbbf24; font-weight:700;">✨ 2-வது திருமணம் / மறுமணம் கைகூடும் யோக காலம்:</div>
                      <div class="milestone-highlight-text" style="color:#f472b6; font-size:0.9rem;">${mr.secondMarriage.dasaBhukti}</div>
                      <span class="milestone-time-pill" style="color:#f472b6; border-color:rgba(236,72,153,0.4); background:rgba(236,72,153,0.12);">
                        📅 ${mr.secondMarriage.yearRange} • ${mr.secondMarriage.ageText}
                      </span>
                    </div>

                    <div style="background:rgba(236, 72, 153, 0.08); border-left:3px solid #ec4899; padding:0.45rem 0.65rem; border-radius:3px; margin-bottom:0.45rem;">
                      <div style="font-size:0.72rem; color:#f472b6; font-weight:700;">காரண விளக்கம்:</div>
                      <div style="font-size:0.74rem; color:#fce7f3; line-height:1.35; margin-top:2px;">${mr.secondMarriage.reason}</div>
                    </div>
                  ` : `
                    <!-- Standard Single Marriage Timing for normal charts -->
                    <div class="milestone-verdict-box" style="margin-bottom:0.4rem; ${mr.isUnmarried ? 'background:rgba(236,72,153,0.08); border-color:rgba(236,72,153,0.35);' : ''}">
                      <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">${mr.isUnmarried ? '💍 எதிர்கால திருமண வாய்ப்பு யோகக் காலம்:' : (mr.isPast ? 'திருமணம் நடந்த காலம் (கடந்தகால சுப நிகழ்வு):' : 'திருமணம் கைகூடும் யோகக் காலம்:')}</div>
                      <div class="milestone-highlight-text" style="color:#f472b6;">${mr.dasaBhukti}</div>
                      <span class="milestone-time-pill" style="color:#f472b6; border-color:rgba(236,72,153,0.4); background:rgba(236,72,153,0.12);">
                        📅 ${mr.yearRange} • ${mr.ageText}
                      </span>
                      ${mr.calculatedMarriageYear ? `
                        <div style="margin-top:0.35rem; font-size:0.75rem; color:#fbcfe8; background:rgba(236,72,153,0.16); padding:0.3rem 0.55rem; border-radius:4px; border:1px solid rgba(236,72,153,0.3); font-weight:700;">
                          💒 ${mr.isUnmarried ? 'சுப முகூர்த்த யோக ஆண்டு' : 'கணிக்கப்பட்ட சுப விவாக ஆண்டு'}: ${mr.calculatedMarriageYear}
                        </div>
                      ` : ''}
                      ${mr.specialAntharam ? `
                        <div style="margin-top:0.4rem; font-size:0.74rem; color:#fbcfe8; background:rgba(236,72,153,0.12); padding:0.3rem 0.55rem; border-radius:4px; border:1px dashed rgba(236,72,153,0.35);">
                          ✨ <strong>விவாக சுப முகூர்த்த அந்தரம்:</strong> ${mr.specialAntharam}
                        </div>
                      ` : ''}
                    </div>
                    <div style="background:rgba(236, 72, 153, 0.06); border-left:3px solid #ec4899; padding:0.45rem 0.65rem; border-radius:3px; margin-bottom:0.45rem;">
                      <div style="font-size:0.72rem; color:#f472b6; font-weight:700;">${mr.earlyOrLateVerdict}:</div>
                      <div style="font-size:0.74rem; color:#fce7f3; line-height:1.35; margin-top:2px;">${mr.earlyOrLateReason}</div>
                    </div>
                  `}

                  <p class="milestone-desc-text"><strong>${mr.spouseLabel || 'துணைவர் குணம்'}:</strong> ${mr.spouseQualities}</p>
                  <div style="font-size:0.74rem; color:#bae6fd; margin-top:0.35rem; line-height:1.4;">
                    <strong>சுபத்துவ அடுக்கு:</strong> ${mr.subhaHierarchy}
                  </div>
                  ${(mr.secondMarriage ? mr.secondMarriage.remedy : mr.remedy) ? `
                    <div style="font-size:0.75rem; color:#fde68a; background:rgba(245,158,11,0.08); border-left:3px solid #f59e0b; padding:0.4rem 0.6rem; margin-top:0.4rem; border-radius:3px;">
                      ⚡ <strong>பரிகார வழிகாட்டல்:</strong> ${(mr.secondMarriage ? mr.secondMarriage.remedy : mr.remedy)}
                    </div>
                  ` : ""}

                  ${mr.marriageType ? `
                    <div style="background:rgba(236, 72, 153, 0.08); border:1px solid rgba(236, 72, 153, 0.25); border-left:3px solid #ec4899; border-radius:var(--radius-sm); padding:0.55rem 0.7rem; margin-top:0.45rem; margin-bottom:0.45rem;">
                      <div style="font-size:0.72rem; color:#f472b6; font-weight:700; display:flex; justify-content:space-between; align-items:center;">
                        <span>💘 காதல் திருமணமா? அல்லது அரேஞ்ச் மேரேஜ்-ஆ?</span>
                        <span class="badge ${mr.marriageType.badgeClass}" style="font-size:0.65rem;">
                          ${mr.marriageType.verdict}
                        </span>
                      </div>
                      <div style="font-size:0.86rem; font-weight:700; color:#fff; margin-top:3px;">
                        ${mr.marriageType.badge}
                      </div>
                      <div style="font-size:0.74rem; color:#fce7f3; margin-top:3px; line-height:1.4;">
                        ${mr.marriageType.reason}
                      </div>
                      <div style="font-size:0.71rem; color:var(--text-dim); margin-top:4px; line-height:1.35; background:rgba(0,0,0,0.22); padding:0.35rem 0.5rem; border-radius:4px;">
                        📜 <strong>பாவக & நாடி சான்றுகள்:</strong>
                        ${mr.marriageType.loveReasons.length > 0 ? `<br>• <strong style="color:#f472b6;">காதல் யோக தொடர்புகள் (5 & 7):</strong> ${mr.marriageType.loveReasons.join(" • ")}` : ''}
                        ${mr.marriageType.arrangedReasons.length > 0 ? `<br>• <strong style="color:#93c5fd;">திருமண யோக தொடர்புகள் (7 & 9 / குரு):</strong> ${mr.marriageType.arrangedReasons.join(" • ")}` : ''}
                      </div>
                    </div>
                  ` : ""}

                  ${mr.ruleEngineAnalysis && mr.ruleEngineAnalysis.timingWindows && mr.ruleEngineAnalysis.timingWindows.length > 0 ? `
                    <div style="background:rgba(15, 23, 42, 0.65); border:1px solid rgba(236,72,153,0.3); border-radius:var(--radius-sm); padding:0.55rem 0.7rem; margin-top:0.45rem; margin-bottom:0.45rem;">
                      <div style="font-size:0.75rem; color:#f472b6; font-weight:700; margin-bottom:0.35rem; display:flex; align-items:center; gap:5px;">
                        <span>📜</span> <strong>Modular Rule-Based Marriage Timing Windows:</strong>
                      </div>
                      <div style="display:flex; flex-direction:column; gap:4px;">
                        ${mr.ruleEngineAnalysis.timingWindows.map(w => `
                          <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.04); padding:0.3rem 0.5rem; border-radius:4px; font-size:0.73rem; flex-wrap:wrap; gap:4px;">
                            <span style="font-weight:700; color:#fff;">📅 ${w.year}</span>
                            <span style="color:#fce7f3;">${w.tamil}</span>
                            <span class="badge ${w.strength === 'VERY_STRONG' ? 'badge-gold' : (w.strength === 'STRONG' ? 'badge-pink' : 'badge-blue')}" style="font-size:0.62rem;">
                              Score: ${w.score} • ${w.strength}
                            </span>
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  ` : ""}

                  ${mr.nadiPrediction ? `
                    <div class="milestone-nadi-box">
                      <div class="nadi-badge">🔮 நாடி ஜோதிட பிரமாணம் (Nadi Rule)</div>
                      <div class="nadi-box-content">${mr.nadiPrediction}</div>
                    </div>
                  ` : ""}

                  ${mr.subhaPrediction ? `
                    <div class="milestone-subha-box">
                      <div class="subha-badge">✨ சுபத்துவம், பாவத்துவம் & சூட்சும வலு</div>
                      <div class="subha-box-content">${mr.subhaPrediction}</div>
                    </div>
                  ` : ""}
                ` : `
                  <div class="milestone-verdict-box">
                    <div class="milestone-highlight-text" style="color:#f472b6;">சுக்கிரன் & 7-ஆம் அதிபதி புத்தி காலம்</div>
                    <span class="milestone-time-pill" style="color:#f472b6;">வயது 25 - 28-க்குள்</span>
                  </div>
                  <p class="milestone-desc-text">களத்திர காரகன் மற்றும் குருவின் சுப பார்வையால் மங்கள சுபகாரியம் அமையும்.</p>
                `}
              </div>

              <div class="milestone-tag-row">
                <span class="milestone-tag">7-ஆம் பாவம் (களத்திரம்)</span>
                <span class="milestone-tag">${mr && mr.spouseKaraka ? mr.spouseKaraka : 'சுக்கிரன் (களத்திர காரகன்)'}</span>
                <span class="milestone-tag">${mr && mr.secondMarriage ? 'மறுமண யோகம்' : (mr && mr.spouseLabel && mr.spouseLabel.includes('கணவர்') ? 'மாங்கல்ய யோகம்' : 'களத்திர பாக்கியம்')}</span>
              </div>
            </div>

            <!-- Card 4: Childbirth / Progeny Timing (புத்திர பாக்கியம் & குழந்தைப் பிறப்பு யோகம்) -->
            <div class="milestone-card card-child">
              <div>
                <div class="milestone-card-top">
                  <div class="milestone-icon-title">
                    <span class="icon">👶</span>
                    <div>
                      <h4 class="milestone-card-title">குழந்தைப் பிறப்பு எப்போது?</h4>
                      <span class="milestone-card-subtitle">Childbirth & Progeny Timing</span>
                    </div>
                  </div>
                  <span class="badge ${ch && ch.isPast ? 'badge-blue' : 'badge-border'}" style="${ch && ch.isPast ? '' : 'border-color:#f43f5e; color:#fb7185;'} font-size:0.68rem;">
                    ${ch && ch.isPast ? 'நிகழ்ந்த காலம் (Past)' : 'புத்திர பாக்கியம்'}
                  </span>
                </div>

                ${ch ? `
                  <div class="milestone-verdict-box">
                    <div style="font-size:0.75rem; color:var(--text-muted);">${ch.statusHeading || (ch.isPast ? 'குழந்தைப் பிறப்பு காலம்:' : 'முதல் குழந்தை பிறக்கும் யோகக் காலம்:')}</div>
                    <div class="milestone-highlight-text" style="color:#fb7185;">${ch.dasaBhukti}</div>
                    <span class="milestone-time-pill" style="color:#fb7185; border-color:rgba(244,63,94,0.4); background:rgba(244,63,94,0.12);">
                      📅 ${ch.yearRange} • ${ch.ageText}
                    </span>
                    ${ch.specialAntharam ? `
                      <div style="margin-top:0.4rem; font-size:0.74rem; color:#fbcfe8; background:rgba(244,63,94,0.12); padding:0.3rem 0.55rem; border-radius:4px; border:1px dashed rgba(244,63,94,0.35);">
                        ✨ <strong>புத்திர பாக்கிய சுப அந்தரம்:</strong> ${ch.specialAntharam}
                      </div>
                    ` : ''}
                  </div>
                  <p class="milestone-desc-text"><strong>புத்திர நிலை:</strong> ${ch.qualityText}</p>
                  <div style="font-size:0.74rem; color:#bae6fd; margin-top:0.35rem; line-height:1.4;">
                    <strong>சுபத்துவ அடுக்கு:</strong> ${ch.subhaHierarchy}
                  </div>
                  ${ch.remedy ? `
                    <div style="font-size:0.75rem; color:#fde68a; background:rgba(245,158,11,0.08); border-left:3px solid #f59e0b; padding:0.4rem 0.6rem; margin-top:0.4rem; border-radius:3px;">
                      ⚡ <strong>வழிகாட்டல்:</strong> ${ch.remedy}
                    </div>
                  ` : ""}

                  ${ch.nadiPrediction ? `
                    <div class="milestone-nadi-box">
                      <div class="nadi-badge">🔮 நாடி ஜோதிட பிரமாணம் (Nadi Rule)</div>
                      <div class="nadi-box-content">${ch.nadiPrediction}</div>
                    </div>
                  ` : ""}

                  ${ch.subhaPrediction ? `
                    <div class="milestone-subha-box">
                      <div class="subha-badge">✨ சுபத்துவம், பாவத்துவம் & சூட்சும வலு</div>
                      <div class="subha-box-content">${ch.subhaPrediction}</div>
                    </div>
                  ` : ""}
                ` : `
                  <div class="milestone-verdict-box">
                    <div class="milestone-highlight-text" style="color:#fb7185;">குரு & 5-ஆம் அதிபதி புத்தி காலம்</div>
                    <span class="milestone-time-pill" style="color:#fb7185;">வயது 26 - 30-க்குள்</span>
                  </div>
                  <p class="milestone-desc-text">புத்திர காரகன் குரு மற்றும் 5-ஆம் பாவ சுபத்துவத்தால் ஆரோக்கியமான புத்திர பாக்கியம் உண்டாகும்.</p>
                `}
              </div>

              <div class="milestone-tag-row">
                <span class="milestone-tag">குரு (புத்திர காரகன்)</span>
                <span class="milestone-tag">5-ஆம் பாவாதிபதி</span>
                <span class="milestone-tag">வம்ச விருத்தி</span>
              </div>
            </div>

            <!-- Card 5: House / Land Timing -->
            <div class="milestone-card card-house">
              <div>
                <div class="milestone-card-top">
                  <div class="milestone-icon-title">
                    <span class="icon">🏡</span>
                    <div>
                      <h4 class="milestone-card-title">வீடு எப்போது வாங்குவோம்?</h4>
                      <span class="milestone-card-subtitle">House Construction & Property Timing</span>
                    </div>
                  </div>
                  <span class="badge badge-border" style="border-color:#10b981; color:#34d399; font-size:0.68rem;">பூமி யோகம்</span>
                </div>

                ${hs ? `
                  ${hs.startedPeriod ? `
                    <div style="background:rgba(16,185,129,0.06); border:1px solid rgba(16,185,129,0.2); border-radius:var(--radius-sm); padding:0.45rem 0.65rem; margin-bottom:0.4rem;">
                      <div style="font-size:0.72rem; color:#34d399; font-weight:700;">🏗️ வீடு கட்டத் தொடங்கிய காலம்:</div>
                      <div style="font-size:0.75rem; color:#a7f3d0; margin-top:2px;">
                        • <strong>${hs.startedPeriod}</strong>
                      </div>
                    </div>
                  ` : ""}

                  <div class="milestone-verdict-box">
                    <div style="font-size:0.75rem; color:var(--text-muted);">${hs.isPast ? 'வீடு/மனை வாங்கிய யோகக் காலம்:' : 'வீடு முழுமையடையும் / புதிய சொத்து யோகக் காலம்:'}</div>
                    <div class="milestone-highlight-text" style="color:#34d399;">${hs.dasaBhukti}</div>
                    <span class="milestone-time-pill" style="color:#34d399; border-color:rgba(16,185,129,0.4); background:rgba(16,185,129,0.12);">
                      📅 ${hs.yearRange} • ${hs.ageText}
                    </span>
                  </div>
                  <p class="milestone-desc-text">${hs.propertyType}</p>

                  ${hs.nadiPrediction ? `
                    <div class="milestone-nadi-box">
                      <div class="nadi-badge">🔮 நாடி ஜோதிட பிரமாணம் (Nadi Rule)</div>
                      <div class="nadi-box-content">${hs.nadiPrediction}</div>
                    </div>
                  ` : ""}

                  ${hs.subhaPrediction ? `
                    <div class="milestone-subha-box">
                      <div class="subha-badge">✨ சுபத்துவம், பாவத்துவம் & சூட்சும வலு</div>
                      <div class="subha-box-content">${hs.subhaPrediction}</div>
                    </div>
                  ` : ""}
                ` : `
                  <div class="milestone-verdict-box">
                    <div class="milestone-highlight-text" style="color:#34d399;">செவ்வாய் & 4-ஆம் அதிபதி புத்தி காலம்</div>
                    <span class="milestone-time-pill" style="color:#34d399;">வயது 30 - 36-க்குள்</span>
                  </div>
                  <p class="milestone-desc-text">பூமி காரகன் செவ்வாயின் அருளால் சொந்த மனை வாங்கி அழகிய வீடு கட்டும் யோகம் அமையும்.</p>
                `}
              </div>

              <div class="milestone-tag-row">
                <span class="milestone-tag">4-ஆம் பாவம் (சுக ஸ்தானம்)</span>
                <span class="milestone-tag">செவ்வாய் (பூமி காரகன்)</span>
                <span class="milestone-tag">சொந்த மனை</span>
              </div>
            </div>

            <!-- Card 6: Vehicle & Car Timing -->
            <div class="milestone-card card-vehicle">
              <div>
                <div class="milestone-card-top">
                  <div class="milestone-icon-title">
                    <span class="icon">🚗</span>
                    <div>
                      <h4 class="milestone-card-title">வாகனம் / கார் எப்போது அமையும்?</h4>
                      <span class="milestone-card-subtitle">Vehicle & Car Yoga Timing</span>
                    </div>
                  </div>
                  <span class="badge badge-border" style="border-color:#a855f7; color:#c084fc; font-size:0.68rem;">வாகன யோகம்</span>
                </div>

                ${vh ? `
                  <div class="milestone-verdict-box">
                    <div style="font-size:0.75rem; color:var(--text-muted);">${vh.statusHeading || (vh.isPast ? 'வாகனம்/கார் அமைந்த யோகக் காலம்:' : 'கார் வாங்கும் யோகக் காலம்:')}</div>
                    <div class="milestone-highlight-text" style="color:#c084fc;">${vh.dasaBhukti}</div>
                    <span class="milestone-time-pill" style="color:#c084fc; border-color:rgba(168,85,247,0.4); background:rgba(168,85,247,0.12);">
                      📅 ${vh.yearRange} • ${vh.ageText}
                    </span>
                  </div>
                  <div style="background:rgba(168,85,247,0.06); border:1px solid rgba(168,85,247,0.2); border-radius:var(--radius-sm); padding:0.45rem 0.65rem; margin-top:0.4rem;">
                    <div style="font-size:0.72rem; color:#c084fc; font-weight:700;">🚗 கார் யோக விளக்கம்:</div>
                    <div style="font-size:0.74rem; color:#e9d5ff; margin-top:2px; line-height:1.35;">
                      <strong>${vh.carYoga}:</strong> ${vh.reason || "வாகன காரகன் சுக்கிரன் ஆட்சி பலம் பெற்றுள்ளதால் சொந்தமாக நான்கு சக்கர வாகனம் (கார்) அமையும் யோகம் உள்ளது."}
                    </div>
                    <div style="font-size:0.73rem; color:#d8b4fe; margin-top:3px;">
                      🎨 <strong>உகந்த நிறம்:</strong> ${vh.vehicleColor}
                    </div>
                  </div>

                  ${vh.nadiPrediction ? `
                    <div class="milestone-nadi-box">
                      <div class="nadi-badge">🔮 நாடி ஜோதிட பிரமாணம் (Nadi Rule)</div>
                      <div class="nadi-box-content">${vh.nadiPrediction}</div>
                    </div>
                  ` : ""}

                  ${vh.subhaPrediction ? `
                    <div class="milestone-subha-box">
                      <div class="subha-badge">✨ சுபத்துவம், பாவத்துவம் & சூட்சும வலு</div>
                      <div class="subha-box-content">${vh.subhaPrediction}</div>
                    </div>
                  ` : ""}
                ` : `
                  <div class="milestone-verdict-box">
                    <div class="milestone-highlight-text" style="color:#c084fc;">சுக்கிரன் & 4-ஆம் அதிபதி புத்தி காலம்</div>
                    <span class="milestone-time-pill" style="color:#c084fc;">வயது 26 - 32-க்குள்</span>
                  </div>
                  <p class="milestone-desc-text">வாகன காரகன் சுக்கிரன் சுபத்துவம் பெற்றுள்ளதால் நான்கு சக்கர கார் வாங்கும் யோகம் கைகூடும்.</p>
                `}
              </div>

              <div class="milestone-tag-row">
                <span class="milestone-tag">சுக்கிரன் (வாகன காரகன்)</span>
                <span class="milestone-tag">4-ஆம் பாவாதிபதி</span>
                <span class="milestone-tag">கார் யோகம்</span>
              </div>
            </div>

          </div>
        </div>
      `;
    }

    // =========================================================================
    // 2. VIMSHOTTARI DASA - BHUKTI - ANTHARAM (தசா, புத்தி, அந்தரம்)
    // =========================================================================
    if (analysis.dashaResult) {
      const d = analysis.dashaResult;
      const nak = d.nakshatraInfo;
      const mahaLord = d.currentMahaDasa.lord;
      const dashaPred = window.PGAstroData.specialRules.dasha[mahaLord]?.text || "";

      html += `
        <div class="dasa-dashboard-card">
          <!-- Header -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; flex-wrap:wrap; gap:0.4rem;">
            <h3 style="font-size:1.05rem; color:var(--gold-primary); display:flex; align-items:center; gap:0.4rem; margin:0;">
              <span>⏳</span> விம்சோத்தரி தசா, புத்தி & அந்தர கணிப்பு
            </h3>
            <span class="badge badge-gold" style="font-size:0.72rem;">120 ஆண்டு விம்சோத்தரி முறை</span>
          </div>

          <!-- Janma Nakshatra & Birth Dasa Balance Banner -->
          <div class="dasa-nakshatra-banner">
            <div>
              <div style="font-size:0.85rem; font-weight:700; color:#fff;">
                🌟 ஜென்ம நட்சத்திரம்: <span style="color:var(--gold-light);">${nak.name} (${nak.english})</span> • பாதம்: <span style="color:#38bdf8;">${nak.pada}</span>
              </div>
              <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
                நட்சத்திர அதிபதி: <strong style="color:#fff;">${nak.lord}</strong>
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:0.72rem; color:var(--text-dim); text-transform:uppercase;">பிறப்பு தசா இருப்பு</div>
              <div style="font-size:0.82rem; font-weight:700; color:#34d399; font-family:var(--font-mono, monospace);">
                ${nak.balanceText}
              </div>
            </div>
          </div>

          <!-- 3 Prominent Metric Cards: Maha Dasa, Bhukti, Antharam -->
          <div class="dasa-metrics-grid">
            <div class="dasa-metric-card active-maha">
              <div class="dasa-metric-label">நடப்பு மகா தசை (Maha Dasa)</div>
              <div class="dasa-metric-lord" style="color:${d.currentMahaDasa.color};">
                ${d.currentMahaDasa.lord} தசை
              </div>
              <div class="dasa-metric-dates">
                ${d.currentMahaDasa.startDate} முதல் ${d.currentMahaDasa.endDate} வரை
              </div>
            </div>

            <div class="dasa-metric-card active-bhukti">
              <div class="dasa-metric-label">நடப்பு புத்தி (Bhukti)</div>
              <div class="dasa-metric-lord" style="color:${d.currentBhukti.color};">
                ${d.currentBhukti.lord} புத்தி
              </div>
              <div class="dasa-metric-dates">
                ${d.currentBhukti.startDate} முதல் ${d.currentBhukti.endDate} வரை
              </div>
            </div>

            <div class="dasa-metric-card active-antharam">
              <div class="dasa-metric-label">நடப்பு அந்தரம் (Antharam)</div>
              <div class="dasa-metric-lord" style="color:${d.currentAntharam.color};">
                ${d.currentAntharam.lord} அந்தரம்
              </div>
              <div class="dasa-metric-dates">
                ${d.currentAntharam.startDate} முதல் ${d.currentAntharam.endDate} வரை
              </div>
            </div>
          </div>

          <!-- Active Maha Dasa Prediction -->
          ${dashaPred ? `
            <div class="dasa-prediction-box">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
                <strong style="color:var(--gold-light); font-size:0.88rem;">📜 நடப்பு ${mahaLord} தசா பலன்:</strong>
                <span style="font-size:0.7rem; color:var(--text-dim);">நாடி ஜோதிட பிரமாணம்</span>
              </div>
              <p style="font-size:0.83rem; line-height:1.55; color:var(--text-main); margin:0;">
                ${dashaPred}
              </p>
            </div>
          ` : ""}

          <!-- Upcoming Bhuktis Timeline Strip -->
          ${d.upcomingBhuktis && d.upcomingBhuktis.length > 0 ? `
            <div style="margin-top:0.6rem;">
              <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:0.3rem;">அடுத்தடுத்த புத்திகள் (Upcoming Bhuktis):</div>
              <div class="dasa-timeline-strip">
                ${d.upcomingBhuktis.map(b => `
                  <div class="dasa-timeline-chip ${b.isCurrent ? 'current' : ''}">
                    <div>${b.lord} புத்தி ${b.isCurrent ? '⭐' : ''}</div>
                    <div style="font-size:0.64rem; opacity:0.8;">${b.startDate} - ${b.endDate}</div>
                  </div>
                `).join("")}
              </div>
            </div>
          ` : ""}
        </div>
      `;
    }


    // =========================================================================
    // 2. SUBHATHUVAM, SOOKSHUMA VALU & PAPATHUVAM (சுபத்துவம், சூட்சும வலு & பாபத்துவம்)
    // =========================================================================
    if (analysis.subhathuvamResult) {
      const subha = analysis.subhathuvamResult;
      const topSubha = subha.topSubhathuvamPlanet;
      const topPapa = subha.topPapathuvamPlanet;

      html += `
        <div class="subha-dashboard-card">
          <!-- Title & Paksha Indicator -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; flex-wrap:wrap; gap:0.4rem;">
            <h3 style="font-size:1.05rem; color:var(--gold-primary); display:flex; align-items:center; gap:0.4rem; margin:0;">
              <span>✨</span> சுபத்துவம், சூட்சும வலு & பாபத்துவ ஆய்வு
            </h3>
            <span class="badge ${subha.isWaxingMoon ? 'badge-benefic' : 'badge-neutral'}" style="font-size:0.72rem;">
              ${subha.isWaxingMoon ? '🌕 வளர்பிறை சுபத்துவம்' : '🌑 தேய்பிறை நிலை'}
            </span>
          </div>

          <!-- Alert 1: Saturn - Mars Severe Affliction (கடும் பாபத்துவம்) -->
          ${subha.saturnMarsAffliction ? `
            <div class="subha-warning-box">
              <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                <span style="font-size:1.1rem;">⚠️</span>
                <strong style="color:#ef4444; font-size:0.9rem;">முக்கிய எச்சரிக்கை: சனி ↔ செவ்வாய் நேரடி மோதல் பாபத்துவம்!</strong>
              </div>
              <div style="font-size:0.8rem; color:#fca5a5; line-height:1.5;">
                <strong>${subha.saturnMarsDetails}</strong> அமைப்பில் சனி மற்றும் செவ்வாய் இருவரும் மிகக் கடுமையான பாபத்துவத்தை அடைகிறார்கள். 
                இவர்களுடன் கேது இணைந்திருந்தாலும் <em>சூட்சும வலு ரத்தாகி</em> பாபத்துவமே மேலோங்கும்! தான் இருக்கும் இடத்தை பாழ்படுத்துவதோடு, தொடர்பு கொள்ளும் காரகங்களையும் பாதிப்பார்கள்.
              </div>
            </div>
          ` : ""}

          <!-- Alert 2: Venus Affliction (சுக்கிரன் காம இழப்பு & திருமண தாமதம்) -->
          ${subha.venusAffliction ? `
            <div class="subha-warning-box" style="border-color:rgba(236,72,153,0.4); background:linear-gradient(135deg, rgba(236,72,153,0.15) 0%, rgba(236,72,153,0.05) 100%);">
              <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                <span style="font-size:1.1rem;">⚡</span>
                <strong style="color:#f472b6; font-size:0.9rem;">சுக்கிரன் காம இழப்பு & திருமணத் தாமத பாபத்துவம்!</strong>
              </div>
              <div style="font-size:0.8rem; color:#fbcfe8; line-height:1.5;">
                சுக்கிரன் செவ்வாயோடு இணைந்த நிலையில் சனியின் பார்வையையும் பெற்றுள்ளார். இதனால் காம காரகத்துவம் பாதிக்கப்பட்டு திருமணம் தாமதமாகும் அல்லது தாம்பத்யத்தில் விழிப்புணர்வு தேவைப்படும்.
              </div>
            </div>
          ` : ""}

          <!-- Top Subhathuvam: Career Guidance (அதி சுபத்துவ முதன்மைத் தொழில் வழிகாட்டல்) -->
          ${topSubha && topSubha.careerGuidance ? `
            <div class="subha-career-box">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.4rem; flex-wrap:wrap; gap:0.4rem;">
                <div style="display:flex; align-items:center; gap:6px;">
                  <span style="font-size:1.2rem;">🏆</span>
                  <div>
                    <div style="font-size:0.75rem; color:var(--gold-light); font-weight:700; text-transform:uppercase;">
                      அதிக சுபத்துவ கிரகம் தரும் முதன்மைத் தொழில்
                    </div>
                    <div style="font-size:0.95rem; font-weight:800; color:#fff;">
                      ${topSubha.planet} (+${topSubha.netScore} புள்ளிகள்) - ${topSubha.careerGuidance.title}
                    </div>
                  </div>
                </div>
                <span class="badge badge-exalted" style="font-size:0.72rem;">முதன்மை ஜீவனம்</span>
              </div>
              <p style="font-size:0.82rem; color:var(--text-main); line-height:1.5; margin:0;">
                ${topSubha.careerGuidance.desc}
              </p>
            </div>
          ` : ""}

          <!-- Top Papathuvam: Health Warnings & Remedies (அதி பாபத்துவ எச்சரிக்கைகள் & பரிகாரம்) -->
          ${topPapa && topPapa.papathuvamWarning ? `
            <div class="subha-remedy-box">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.4rem; flex-wrap:wrap; gap:0.4rem;">
                <div style="display:flex; align-items:center; gap:6px;">
                  <span style="font-size:1.1rem;">🛡️</span>
                  <div>
                    <div style="font-size:0.75rem; color:#fbbf24; font-weight:700; text-transform:uppercase;">
                      அதி பாபத்துவ கிரகம் & உடல்நல எச்சரிக்கை
                    </div>
                    <div style="font-size:0.92rem; font-weight:800; color:#fff;">
                      ${topPapa.planet} (பாபத்துவ புள்ளி: -${topPapa.papaScore})
                    </div>
                  </div>
                </div>
                <span class="badge badge-border" style="font-size:0.72rem; border-color:#f59e0b; color:#fbbf24;">கவனத்திற்குரியது</span>
              </div>
              <div style="font-size:0.81rem; color:#fde68a; line-height:1.45; margin-bottom:5px;">
                <strong>பாதிப்பு எச்சரிக்கை:</strong> ${topPapa.papathuvamWarning.warning}
              </div>
              <div style="font-size:0.81rem; color:#a7f3d0; line-height:1.45;">
                <strong>பரிகார நெறி:</strong> ${topPapa.papathuvamWarning.remedy}
              </div>
            </div>
          ` : ""}

          <!-- 9 Planets Detailed Subhathuvam & Papathuvam Cards Grid -->
          <div style="font-size:0.82rem; font-weight:700; color:var(--gold-light); margin:0.85rem 0 0.5rem 0;">
            📊 நவகிரக சுபத்துவம், சூட்சும வலு & பாபத்துவ புள்ளிகள்:
          </div>

          <div class="subha-planets-grid">
            ${subha.planets.map(p => {
              const rasi = RASIS.find(r => r.id === p.signId);
              const rasiName = rasi ? rasi.name : "";
              const degStr = window.PGAstro.chart.formatDegree(p.degree);

              return `
                <div class="subha-planet-card">
                  <!-- Card Header -->
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.3rem;">
                    <div>
                      <strong style="color:#fff; font-size:0.95rem;">${p.planet}</strong>
                      <span style="font-size:0.72rem; color:var(--text-muted); margin-left:4px;">(${rasiName} ${degStr})</span>
                    </div>
                    <span class="badge ${p.badgeClass}" style="font-size:0.7rem;">${p.status}</span>
                  </div>

                  <!-- Score Pill Group -->
                  <div class="score-tag-group">
                    <span class="score-badge badge-subha" title="சுபத்துவ புள்ளிகள்">சுபம்: +${p.subhaScore}</span>
                    ${p.sookshumaScore > 0 ? `<span class="score-badge badge-sookshuma" title="சூட்சும வலு புள்ளிகள்">சூட்சுமம்: +${p.sookshumaScore}</span>` : ""}
                    ${p.papaScore > 0 ? `<span class="score-badge badge-papa" title="பாபத்துவ புள்ளிகள்">பாபம்: -${p.papaScore}</span>` : ""}
                    <span class="score-badge badge-net" title="நிகர சுபத்துவ மதிப்பு">நிகரம்: ${p.netScore >= 0 ? '+' + p.netScore : p.netScore}</span>
                  </div>

                  <!-- Reasons List -->
                  <div style="margin-top:0.4rem; border-top:1px solid rgba(255,255,255,0.05); padding-top:0.35rem;">
                    ${p.reasons.map(r => `
                      <div class="subha-reason-line ${r.type}">
                        <span>${r.type === 'subha' ? '🟢' : (r.type === 'sookshuma' ? '🔵' : (r.type === 'papa' ? '🔴' : '⚪'))}</span>
                        <span>${r.text}</span>
                      </div>
                    `).join("")}
                  </div>
                </div>
              `;
            }).join("")}
          </div>

          <!-- ============================================================= -->
          <!-- 12 BHAVAS SUBHATHUVAM, PAPATHUVAM & SEPARATE PREDICTIONS -->
          <!-- ============================================================= -->
          ${(subha.bhavas && subha.bhavas.length > 0) ? (() => {
            const bhs = subha.bhavas;
            const goodCount = bhs.filter(b => b.isGood === true).length;
            const moderateCount = bhs.filter(b => b.isGood === null).length;
            const notGoodCount = bhs.filter(b => b.isGood === false).length;

            return `
              <div class="bhava-subha-section" style="margin-top:1.5rem; padding-top:1.2rem; border-top:1px dashed rgba(212,175,55,0.3);">
                <!-- Section Header -->
                <div class="bhava-dash-header">
                  <div>
                    <div style="display:flex; align-items:center; gap:8px;">
                      <span style="font-size:1.35rem;">🏛️</span>
                      <div>
                        <h4 style="font-size:1.1rem; color:var(--gold-primary); margin:0; font-weight:800;">
                          12 பாவங்களின் சுபத்துவம், பாபத்துவம் & தனித்தனி பலன்கள்
                        </h4>
                        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
                          லக்ன அடிப்படையில் எந்த பாவம் நன்மை தரும் (Good) அல்லது பாதிப்பு/பரிகாரம் தேவைப்படும் (Not Good) என்ற பிரத்யேக கணிப்பு
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Summary Stats Chips -->
                  <div class="bhava-stat-chips">
                    <span class="bhava-stat-badge good-chip">
                      🟢 <strong>${goodCount}</strong> சுப பாவங்கள் (Good)
                    </span>
                    <span class="bhava-stat-badge moderate-chip">
                      ⚪ <strong>${moderateCount}</strong> சமநிலை பாவங்கள்
                    </span>
                    <span class="bhava-stat-badge notgood-chip">
                      🔴 <strong>${notGoodCount}</strong> பாபத்துவ பாவங்கள் (Not Good)
                    </span>
                  </div>
                </div>

                <!-- Filter Controls -->
                <div class="bhava-filter-bar">
                  <span style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">வடிகட்ட:</span>
                  <button type="button" class="bhava-filter-btn active" data-filter="all" onclick="window.filterBhavaCards('all', this)">
                    அனைத்து 12 பாவங்கள் (${bhs.length})
                  </button>
                  <button type="button" class="bhava-filter-btn filter-good" data-filter="good" onclick="window.filterBhavaCards('good', this)">
                    🟢 நன்மை தரும் பாவங்கள் (${goodCount})
                  </button>
                  <button type="button" class="bhava-filter-btn filter-moderate" data-filter="moderate" onclick="window.filterBhavaCards('moderate', this)">
                    ⚪ சமநிலை பாவங்கள் (${moderateCount})
                  </button>
                  <button type="button" class="bhava-filter-btn filter-notgood" data-filter="not_good" onclick="window.filterBhavaCards('not_good', this)">
                    🔴 பாதிக்கப்பட்ட பாவங்கள் (${notGoodCount})
                  </button>
                </div>

                <!-- 12 Bhavas Cards Grid -->
                <div class="bhava-cards-grid" id="bhavaCardsContainer">
                  ${bhs.map(b => {
                    const sittingText = b.sittingPlanets.length > 0 
                      ? b.sittingPlanets.join(", ") 
                      : "கிரக அமர்வு இல்லை";
                    const aspectsText = b.aspectingPlanets.length > 0 
                      ? b.aspectingPlanets.map(a => a.text).join(", ") 
                      : "நேரடிப் பார்வைகள் இல்லை";

                    return `
                      <div class="bhava-card bhava-status-${b.statusClass}" data-bhava-status="${b.statusClass}">
                        <!-- Top Header -->
                        <div class="bhava-card-header">
                          <div>
                            <div style="font-size:0.7rem; color:var(--gold-light); font-weight:700; text-transform:uppercase;">
                              ${b.english} • ${b.signName}
                            </div>
                            <h5 class="bhava-card-title">${b.name}</h5>
                            <div style="font-size:0.73rem; color:var(--text-dim); margin-top:2px;">
                              ${b.primaryTheme}
                            </div>
                          </div>
                          <div style="text-align:right;">
                            <span class="badge ${b.badgeClass}" style="font-size:0.7rem; padding:3px 7px;">
                              ${b.verdict}
                            </span>
                            <div style="font-size:0.67rem; color:var(--text-muted); margin-top:3px;">
                              காரகன்: ${b.karaka}
                            </div>
                          </div>
                        </div>

                        <!-- Score Pill Group -->
                        <div class="score-tag-group" style="margin:0.5rem 0 0.55rem 0;">
                          <span class="score-badge badge-subha" title="சுபத்துவ புள்ளிகள்">சுபம்: +${b.subhaScore}</span>
                          ${b.papaScore > 0 ? `<span class="score-badge badge-papa" title="பாபத்துவ புள்ளிகள்">பாபம்: -${b.papaScore}</span>` : ""}
                          <span class="score-badge badge-net" title="நிகர சுபத்துவ மதிப்பு">நிகரம்: ${b.netScore >= 0 ? '+' + b.netScore : b.netScore}</span>
                          <span class="score-badge" style="background:rgba(255,255,255,0.05); color:#e2e8f0; font-size:0.68rem;" title="அதிபதி நிலை">
                            ${b.lordPlacementText}
                          </span>
                        </div>

                        <!-- Sitting Planets & Aspects Pills -->
                        <div class="bhava-details-row">
                          <div class="bhava-detail-item">
                            <span class="bhava-detail-label">🪐 அமர்ந்தவை:</span>
                            <span class="bhava-detail-val">${sittingText}</span>
                          </div>
                          <div class="bhava-detail-item">
                            <span class="bhava-detail-label">👁️ பார்வைகள்:</span>
                            <span class="bhava-detail-val">${aspectsText}</span>
                          </div>
                        </div>

                        <!-- Reasons Breakdown -->
                        <div class="bhava-reasons-box">
                          ${b.reasons.map(r => `
                            <div class="subha-reason-line ${r.type}">
                              <span>${r.type === 'subha' ? '🟢' : (r.type === 'papa' ? '🔴' : '⚪')}</span>
                              <span>${r.text}</span>
                            </div>
                          `).join("")}
                        </div>

                        <!-- Prediction Text Box -->
                        <div class="bhava-prediction-box ${b.statusClass}">
                          <div class="bhava-pred-title">
                            <span>🔮</span>
                            <strong>தனித்தனி பாவப் பலன்:</strong>
                          </div>
                          <p class="bhava-pred-content">${b.prediction}</p>
                        </div>

                        <!-- Remedy Box (if present) -->
                        ${b.remedy ? `
                          <div class="bhava-remedy-box">
                            <div style="display:flex; align-items:center; gap:5px; margin-bottom:3px;">
                              <span style="font-size:0.88rem;">🪔</span>
                              <strong style="color:#fbbf24; font-size:0.74rem;">பாவ தோஷ நிவர்த்தி & பரிகாரம்:</strong>
                            </div>
                            <div style="font-size:0.74rem; color:#fef3c7; line-height:1.45;">
                              ${b.remedy}
                            </div>
                          </div>
                        ` : ""}
                      </div>
                    `;
                  }).join("")}
                </div>
              </div>
            `;
          })() : ""}
        </div>
      `;
    }

    // =========================================================================
    // 3. DETECTED NADI CONJUNCTIONS & TRINES (இணைவு பலன்கள்)
    // =========================================================================
    html += `
      <div style="margin-bottom: 1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
          <h3 style="font-size:1.05rem; color:var(--gold-primary); display:flex; align-items:center; gap:0.4rem; margin:0;">
            <span>⚡</span> கண்டறியப்பட்ட இணைவுகள் (${analysis.detectedConjunctions.length})
          </h3>
          <span style="font-size:0.75rem; color:var(--text-muted);">PG Astrologer நாடி முறை</span>
        </div>
    `;

    if (analysis.detectedConjunctions.length === 0) {
      html += `
        <div class="cosmic-card" style="padding: 1rem; text-align:center; color: var(--text-muted); font-size:0.88rem;">
          நேரடி அல்லது திரிகோண இணைவுகள் எதுவும் அமையவில்லை. கிரகங்களை 1, 5, 9 அல்லது 7-ஆம் வீடுகளில் அமைத்து பார்க்கவும்.
        </div>
      `;
    } else {
      html += `<div style="display: flex; flex-direction: column; gap: 0.85rem;">`;
      analysis.detectedConjunctions.forEach((item) => {
        const comb = item.data;
        if (!comb) {
          html += `
            <div class="cosmic-card" style="padding: 0.9rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.3rem;">
                <strong>${item.p1} + ${item.p2}</strong>
                <span style="font-size:0.72rem; color:var(--gold-light);">${item.type} (${item.rasiName})</span>
              </div>
              <p style="font-size:0.84rem; color:var(--text-muted);">இந்த இரு கிரகங்களின் அடிப்படை காரகங்கள் ஒன்றுபட்டு பலன்களை உருவாக்குகின்றன.</p>
            </div>
          `;
        } else {
          html += `
            <div class="cosmic-card highlight" style="padding: 1rem;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem; flex-wrap:wrap; gap:0.3rem;">
                <div>
                  <h4 style="font-size: 1rem; color: var(--gold-light);">${comb.title}</h4>
                  <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 2px; display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                    <span>${item.type} • ${item.rasiName}</span>
                    ${item.degInfo ? `<span class="badge badge-gold" style="font-size:0.68rem; padding:1px 5px; font-family:var(--font-mono, monospace);">${item.degInfo}</span>` : ""}
                  </div>
                </div>
                <span class="planet-tag tag-${comb.p1}">${comb.category || "முக்கிய பலன்"}</span>
              </div>

              ${comb.keywords ? `
                <div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:0.6rem;">
                  ${comb.keywords.map(k => `<span style="font-size:0.72rem; background:rgba(212,175,55,0.12); color:var(--gold-light); padding:1px 6px; border-radius:4px; border:1px solid rgba(212,175,55,0.2);">${k}</span>`).join("")}
                </div>
              ` : ""}

              <p style="font-size: 0.88rem; line-height: 1.6; color: var(--text-main); white-space: pre-line;">
                ${comb.prediction}
              </p>
            </div>
          `;
        }
      });
      html += `</div>`;
    }

    html += `</div>`;

    // =========================================================================
    // 4. SPECIAL CONDITIONS (வக்கிரம், விளிம்பு, உச்சம், நீசம்)
    // =========================================================================
    if (analysis.specialPlanets.length > 0) {
      html += `
        <div style="margin-top: 1.25rem;">
          <h3 style="font-size:1.05rem; color:var(--gold-primary); margin-bottom:0.75rem; display:flex; align-items:center; gap:0.4rem;">
            <span>🔮</span> விசேஷ கிரக நிலைகள் (வக்கிரம் & விளிம்பு)
          </h3>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
      `;

      analysis.specialPlanets.forEach(p => {
        let conditionText = "";
        let detailsText = "";

        if (p.isRetrograde) {
          conditionText = "வக்கிரம் (Retrograde)";
          detailsText = window.PGAstroData.specialRules.retrograde[p.planet]?.text || "";
        } else if (p.isMarginal) {
          conditionText = "விளிம்பு கிரகம் (Marginal / Border)";
          detailsText = window.PGAstroData.specialRules.marginal[p.planet]?.text || "";
        } else if (p.isExalted) {
          conditionText = "உச்ச நிலை (Exalted)";
          detailsText = `${p.planet} உச்ச பலம் பெற்று அதனுடைய காரகத்துவங்களை முழு ஆற்றலுடன் ஜாதகருக்கு வழங்கி முன்னிலைப்படுத்தும்.`;
        } else if (p.isDebilitated) {
          conditionText = "நீச நிலை (Debilitated)";
          detailsText = `${p.planet} நீச நிலை அடைவதால் அதன் இயல்பான காரகத்துவங்களில் தடுமாற்றம் அல்லது விழிப்புணர்வுக்குப் பின் மேன்மை தரும்.`;
        }

        html += `
          <div class="cosmic-card" style="padding: 0.9rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
              <strong style="color:var(--gold-light); font-size:0.95rem;">${p.planet} - ${conditionText}</strong>
              <span style="font-size:0.75rem; color:var(--text-muted);">${p.rasiName}</span>
            </div>
            <p style="font-size: 0.84rem; line-height: 1.5; color: var(--text-main);">${detailsText}</p>
          </div>
        `;
      });

      html += `</div></div>`;
    }

    container.innerHTML = html;
  }

  // Helper to filter Bhava Cards
  window.filterBhavaCards = function(status, btnElem) {
    const container = document.getElementById("bhavaCardsContainer");
    if (!container) return;
    const cards = container.querySelectorAll(".bhava-card");
    cards.forEach(card => {
      const cardStatus = card.getAttribute("data-bhava-status");
      if (status === "all" || cardStatus === status) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
    const filterBtns = document.querySelectorAll(".bhava-filter-btn");
    filterBtns.forEach(b => b.classList.remove("active"));
    if (btnElem) btnElem.classList.add("active");
  };

  // Public API
  
  // =========================================================================
  // HOROSCOPE Q&A ENGINE: COMPREHENSIVE LIFE QUESTIONS & DEEP ASTROLOGICAL VERDICTS
  // Covers: Education, Freshers Job, Govt vs Pvt, Job Field, Marriage, 2nd Marriage,
  // Childbirth, Land/House/Vehicle, Health & Disease, Foreign, Wealth, Court, Remedies.
  // With Past, Present & Future Timings + Subhathuvam, Paavathuvam & Sookshuma Valu.
  // =========================================================================
  function evaluateHoroscopeQA(analysis) {
    if (!analysis || !analysis.placedPlanets) return [];

    const nInfo = analysis.nativeInfo || {};
    const nDob = nInfo.dob || "1990-01-01";
    const dobDate = new Date(nDob);
    const nowObj = new Date();
    const nowMs = nowObj.getTime();

    let curAgeYears = (nowMs - dobDate.getTime()) / (365.25 * 24 * 3600 * 1000);
    if (isNaN(curAgeYears) || curAgeYears < 0) curAgeYears = 30;

    const nativeGender = (analysis.gender || nInfo.gender || "male").toLowerCase();
    const nativeTitle = nativeGender === "female" ? "ஜாதகி" : "ஜாதகர்";
    const isFemale = nativeGender === "female";

    const lagnaId = analysis.lagnaRasiId || (analysis.lagna && analysis.lagna.rasiId) || (window.PGAstro && window.PGAstro.chart && window.PGAstro.chart.getLagnaRasiId()) || 1;
    const getLord = (houseNo) => {
      const rasiIndex = ((lagnaId - 1) + (houseNo - 1)) % 12;
      return window.PGAstroData?.RASI_LORDS ? window.PGAstroData.RASI_LORDS[rasiIndex] : ["செவ்வாய்", "சுக்கிரன்", "புதன்", "சந்திரன்", "சூரியன்", "புதன்", "சுக்கிரன்", "செவ்வாய்", "குரு", "சனி", "சனி", "குரு"][rasiIndex];
    };

    const lord1 = getLord(1);
    const lord2 = getLord(2);
    const lord3 = getLord(3);
    const lord4 = getLord(4);
    const lord5 = getLord(5);
    const lord6 = getLord(6);
    const lord7 = getLord(7);
    const lord8 = getLord(8);
    const lord9 = getLord(9);
    const lord10 = getLord(10);
    const lord11 = getLord(11);
    const lord12 = getLord(12);

    const houseLords = {
      1: lord1, 2: lord2, 3: lord3, 4: lord4, 5: lord5, 6: lord6,
      7: lord7, 8: lord8, 9: lord9, 10: lord10, 11: lord11, 12: lord12
    };

    const getSubha = (pName) => {
      if (analysis.subhathuvamResult && analysis.subhathuvamResult[pName]) {
        return analysis.subhathuvamResult[pName];
      }
      return { netScore: 1, text: "சுபத்துவம் பெற்றுள்ளது" };
    };

    const sunSubha = getSubha("சூரியன்");
    const moonSubha = getSubha("சந்திரன்");
    const marsSubha = getSubha("செவ்வாய்");
    const mercurySubha = getSubha("புதன்");
    const jupiterSubha = getSubha("குரு");
    const venusSubha = getSubha("சுக்கிரன்");
    const saturnSubha = getSubha("சனி");
    const rahuSubha = getSubha("ராகு");
    const ketuSubha = getSubha("கேது");

    const curDasaLord = analysis.dashaResult?.currentMahaDasa?.lord || "குரு";
    const curBhuktiLord = analysis.dashaResult?.currentBhukti?.lord || "சனி";
    const curAntharamLord = analysis.dashaResult?.currentAntharam?.lord || "புதன்";

    const curDasaBhuktiAntharamText = `${curDasaLord} தசை - ${curBhuktiLord} புக்தி - ${curAntharamLord} அந்தரம்`;

    const formatPeriodDate = (dStr) => {
      if (!dStr) return '';
      const d = new Date(dStr);
      if (isNaN(d.getTime())) return dStr;
      const monthsTamil = ["ஜன.", "பிப்.", "மார்ச்", "ஏப்.", "மே", "ஜூன்", "ஜூலை", "ஆக.", "செப்.", "அக்.", "நவ.", "டிச."];
      return `${d.getDate()} ${monthsTamil[d.getMonth()]}, ${d.getFullYear()}`;
    };

    const curBhuktiStart = formatPeriodDate(analysis.dashaResult?.currentBhukti?.start);
    const curBhuktiEnd = formatPeriodDate(analysis.dashaResult?.currentBhukti?.end);
    const curPeriodText = (curBhuktiStart && curBhuktiEnd) ? `${curBhuktiStart} முதல் ${curBhuktiEnd} வரை` : "நடப்பு காலம்";

    const ed = analysis.educationTiming || null;
    const jt = analysis.jobTiming || null;
    const mr = analysis.marriageTiming || null;
    const ch = analysis.childbirthTiming || null;
    const hs = analysis.houseTiming || null;
    const vh = analysis.vehicleTiming || null;

    let allBhuktis = (analysis.milestones && analysis.milestones.allBhuktis) || [];
    if (!allBhuktis || allBhuktis.length === 0) {
      allBhuktis = [];
      const msPerYear = 365.2425 * 24 * 60 * 60 * 1000;
      const DASHA_ORDER = [
        { lord: "கேது", years: 7 }, { lord: "சுக்கிரன்", years: 20 },
        { lord: "சூரியன்", years: 6 }, { lord: "சந்திரன்", years: 10 },
        { lord: "செவ்வாய்", years: 7 }, { lord: "ராகு", years: 18 },
        { lord: "குரு", years: 16 }, { lord: "சனி", years: 19 },
        { lord: "புதன்", years: 17 }
      ];

      if (analysis.dashaResult && analysis.dashaResult.dashaTimeline) {
        analysis.dashaResult.dashaTimeline.forEach(dasa => {
          const dIdx = DASHA_ORDER.findIndex(d => d.lord === dasa.lord);
          if (dIdx !== -1) {
            let bStart = dasa.startMs || (dasa.start ? new Date(dasa.start).getTime() : null);
            if (bStart) {
              const mInfo = DASHA_ORDER[dIdx];
              for (let b = 0; b < 9; b++) {
                const bInfo = DASHA_ORDER[(dIdx + b) % 9];
                const bDur = (mInfo.years * bInfo.years / 120) * msPerYear;
                const bEnd = bStart + bDur;
                allBhuktis.push({
                  mahaLord: mInfo.lord,
                  bhuktiLord: bInfo.lord,
                  startDate: new Date(bStart),
                  endDate: new Date(bEnd),
                  startAge: (bStart - dobDate.getTime()) / msPerYear,
                  endAge: (bEnd - dobDate.getTime()) / msPerYear
                });
                bStart = bEnd;
              }
            }
          }
        });
      }

      if (allBhuktis.length === 0) {
        let dIdx = 0;
        let curStart = new Date(dobDate.getTime());
        for (let cycle = 0; cycle < 7; cycle++) {
          const mInfo = DASHA_ORDER[dIdx];
          const mDur = mInfo.years * msPerYear;
          let bStart = curStart.getTime();
          for (let b = 0; b < 9; b++) {
            const bInfo = DASHA_ORDER[(dIdx + b) % 9];
            const bDur = (mInfo.years * bInfo.years / 120) * msPerYear;
            const bEnd = bStart + bDur;
            allBhuktis.push({
              mahaLord: mInfo.lord,
              bhuktiLord: bInfo.lord,
              startDate: new Date(bStart),
              endDate: new Date(bEnd),
              startAge: (bStart - dobDate.getTime()) / msPerYear,
              endAge: (bEnd - dobDate.getTime()) / msPerYear
            });
            bStart = bEnd;
          }
          curStart = new Date(curStart.getTime() + mDur);
          dIdx = (dIdx + 1) % 9;
        }
      }
    }

    function findBhuktiByAge(targetAge) {
      if (!allBhuktis.length) return null;
      return allBhuktis.find(b => b.startAge <= targetAge && b.endAge > targetAge) || allBhuktis[0];
    }

    function findBestFutureBhukti(minOffsetYears = 0.5, maxOffsetYears = 12, preferredLords = [], minAgeLimit = 0) {
      if (!allBhuktis.length) return null;
      const futureCandidates = allBhuktis.filter(b => b.endDate.getTime() >= (nowMs - 30 * 24 * 3600 * 1000) && b.startAge < (curAgeYears + maxOffsetYears) && b.endAge >= minAgeLimit);
      if (futureCandidates.length === 0) {
        return allBhuktis.find(b => b.startDate.getTime() >= nowMs && b.endAge >= minAgeLimit) || allBhuktis.find(b => b.startDate.getTime() >= nowMs) || allBhuktis[allBhuktis.length - 1];
      }
      for (let pLord of preferredLords) {
        const found = futureCandidates.find(b => b.bhuktiLord === pLord || b.mahaLord === pLord);
        if (found) return found;
      }
      return futureCandidates[0];
    }

    function findBestPastBhukti(maxAgeLimit = curAgeYears, preferredLords = [], minAgeLimit = 0) {
      if (!allBhuktis.length) return null;
      const pastCandidates = allBhuktis.filter(b => b.endDate.getTime() <= nowMs && b.startAge <= maxAgeLimit && b.endAge >= minAgeLimit);
      if (pastCandidates.length === 0) {
        const validPast = allBhuktis.filter(b => b.endDate.getTime() <= nowMs && b.endAge >= minAgeLimit);
        if (validPast.length > 0) return validPast[validPast.length - 1];
        return allBhuktis.find(b => b.endDate.getTime() <= nowMs) || allBhuktis[0];
      }
      for (let pLord of preferredLords) {
        const found = pastCandidates.find(b => b.bhuktiLord === pLord || b.mahaLord === pLord);
        if (found) return found;
      }
      return pastCandidates[pastCandidates.length - 1];
    }

    function formatExactPeriodDate(d) {
      if (!d || isNaN(d.getTime())) return '';
      const months = ["ஜன.", "பிப்.", "மார்ச்", "ஏப்.", "மே", "ஜூன்", "ஜூலை", "ஆக.", "செப்.", "அக்.", "நவ.", "டிச."];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }

    function formatBhukti(b) {
      if (!b) return { dasaBhukti: "சுப தசா - புத்தி", yearRange: "-", ageText: "", startYear: 2026, endYear: 2028 };
      
      const sDateStr = formatExactPeriodDate(b.startDate);
      const eDateStr = formatExactPeriodDate(b.endDate);
      const sY = b.startDate.getFullYear();
      const eY = b.endDate.getFullYear();

      const yearRange = (sDateStr && eDateStr) 
        ? `${sDateStr} முதல் ${eDateStr} வரை`
        : (sY === eY ? `${sY}-ஆம் ஆண்டு` : `${sY} முதல் ${eY} வரை`);

      let sA = Math.max(0, b.startAge);
      let eA = Math.max(0, b.endAge);
      let startAgeInt = Math.floor(sA);
      let endAgeInt = Math.ceil(eA);
      if (startAgeInt === endAgeInt) endAgeInt = startAgeInt + 1;

      let ageText = (eA < 3)
        ? `வயது ${sA.toFixed(1)} முதல் ${eA.toFixed(1)} வரை`
        : `வயது ${startAgeInt} முதல் ${endAgeInt} வரை`;

      return {
        dasaBhukti: `${b.mahaLord} தசை - ${b.bhuktiLord} புக்தி`,
        yearRange: yearRange,
        ageText: ageText,
        startDateStr: sDateStr,
        endDateStr: eDateStr,
        startYear: sY,
        endYear: eY,
        isPast: b.endDate < nowObj
      };
    }

    const questions = [];

    // =========================================================================
    // Q1: கல்வி நிலை & படிப்புத் துறை (Education & Field of Study)
    // =========================================================================
    const primaryStreamName = ed ? ed.primaryStream.name : "பொறியியல் & தகவல் தொழில்நுட்பம் (IT/CS)";
    const eduLevelVal = ed ? (typeof ed.educationLevel === 'object' ? (ed.educationLevel.verdict || ed.educationLevel.level || ed.educationLevel.educationLevel) : ed.educationLevel) : "பட்டப் படிப்பு (Graduation / Bachelor Degree)";
    const eduLevel = typeof eduLevelVal === 'string' ? eduLevelVal : "பட்டப் படிப்பு (Graduation / Bachelor Degree)";
    const eduCollegeBhukti = findBestPastBhukti(23, ["புதன்", "குரு", lord4, lord5, "சூரியன்", "சந்திரன்"], 17.0) || findBhuktiByAge(19);
    const eduSchoolBhukti = findBestPastBhukti(17, ["புதன்", "சூரியன்", lord4, lord5], 6.0) || findBhuktiByAge(12);
    const eduHigherBhukti = findBestFutureBhukti(0.5, 12, ["குரு", "புதன்", lord9, lord10]) || findBhuktiByAge(35);

    const fEduCollege = formatBhukti(eduCollegeBhukti);
    const fEduSchool = formatBhukti(eduSchoolBhukti);
    const fEduHigher = formatBhukti(eduHigherBhukti);

    const slowEduBhukti = findBestPastBhukti(23, ["சனி", "ராகு", lord6, lord8], 10.0) || findBhuktiByAge(15);
    const breakEduBhukti = findBestPastBhukti(23, ["கேது", lord8, lord12], 10.0) || findBhuktiByAge(16);
    const fSlowEdu = formatBhukti(slowEduBhukti);
    const fBreakEdu = formatBhukti(breakEduBhukti);

    questions.push({
      id: "qa_education",
      category: "education",
      categoryLabel: "🎓 கல்வி & படிப்பு",
      questionNumber: "கேள்வி 1",
      questionTitle: "எந்த கல்வி நிலை & படிப்புத் துறையை ஜாதகர் தேர்ந்தெடுப்பார்? உயர்கல்வி யோகம் எப்போது?",
      questionSummary: "பள்ளிப் படிப்பு, தொழிற்கல்வி, பட்டப்படிப்பு மற்றும் உயர்கல்வி யோக கால நிர்ணயம்",
      highlightBadge: primaryStreamName.split('(')[0].trim(),
      dasaBhukti: fEduCollege.dasaBhukti,
      yearRange: fEduCollege.yearRange,
      ageRange: fEduCollege.ageText,
      directAnswer: `வித்யா காரகன் புதன் மற்றும் 4, 5-ஆம் பாவக ஆய்வின்படி, ${nativeTitle}ருக்கு: <strong>${primaryStreamName}</strong> மிகச் சிறந்த கல்வித் துறையாக அமையும். <strong>${eduLevel}</strong> வரை கல்வி பயிலும் பாக்கியம் உண்டு (${fEduCollege.yearRange} - ${fEduCollege.ageText}-ல் கல்வி நிறைவுற்றது).<br><br>🎓 <strong>கல்வி தசாபுத்தி காலகட்ட பகுப்பாய்வு (Education Dasa-Bhukti Timeline):</strong><br>• 🌟 <strong>கல்வி மேன்மை / முதன்மை யோக காலம்:</strong> <strong>${fEduCollege.dasaBhukti}</strong> (${fEduCollege.yearRange}, ${fEduCollege.ageText}) - புதன்/குரு/4,5-ஆம் அதிபதிகளின் சுப அனுகூலத்தால் கல்வியில் தேர்ச்சியும் உயர் மதிப்பெண்களும் பெற்ற பொற்காலம்.<br>• ⚠️ <strong>படிப்பு மந்தம் / கவனச்சிதறல் காலம்:</strong> <strong>${fSlowEdu.dasaBhukti}</strong> (${fSlowEdu.yearRange}, ${fSlowEdu.ageText}) - சனி/ராகு/6-ஆம் அதிபதி ஆதிக்கத்தால் தற்காலிக மந்தநிலை, கவனச்சிதறல் ஏற்பட்ட காலம்.<br>• 🛑 <strong>படிக்க விருப்பமின்மை / தற்காலிகத் தடை காலம்:</strong> <strong>${fBreakEdu.dasaBhukti}</strong> (${fBreakEdu.yearRange}, ${fBreakEdu.ageText}) - கேது/8,12-ஆம் அதிபதி மறைவுத் தொடர்பால் படிப்பில் ஆர்வம் குறைதல் அல்லது தற்காலிக அரியர்ஸ் ஏற்பட்ட காலம்.`,
      timings: {
        pastDasa: fEduSchool.dasaBhukti,
        pastYears: fEduSchool.yearRange,
        past: `பள்ளிப் பருவக் கல்வி ${fEduSchool.dasaBhukti}-ல் (${fEduSchool.yearRange}) அடிப்படை அறிவியல் மற்றும் கணிதத் திறனுடன் இனிதே நிறைவடைந்தது.`,
        presentDasa: curDasaBhuktiAntharamText,
        presentYears: curPeriodText,
        present: curAgeYears < 23 
          ? `தற்போது ${fEduCollege.dasaBhukti}-ல் (${fEduCollege.yearRange}) கல்லூரி தொழிற்கல்வி பயின்று புதிய திறன்களை வளர்க்கும் பருவம்.`
          : `கல்விப் பருவம் வெற்றிகரமாக முடிந்து (${fEduCollege.ageText}-ல் நிறைவுற்றது), தற்போது நடக்கும் ${curDasaLord} தசையில் பெற்ற கல்வியைப் பயன்படுத்தி தொழில் & உத்தியோகத்தில் அனுபவ அறிவை வளர்க்கும் காலம்.`,
        futureDasa: fEduHigher.dasaBhukti,
        futureYears: fEduHigher.yearRange,
        future: `எதிர்காலத்தில் ${fEduHigher.dasaBhukti}-ல் (${fEduHigher.yearRange}, ${fEduHigher.ageText}) பணி நிமித்தமான சிறப்பு சான்றிதழ் படிப்புகள் (Certifications) மற்றும் நிர்வாக மேலாண்மைத் தேர்ச்சி பெறும் யோகம்.`
      },
      astrologicalAnalysis: {
        subhathuvam: `வித்யா காரகன் புதன் சுபத்துவம்: ${mercurySubha.netScore >= 0 ? '+' : ''}${mercurySubha.netScore} • 4-ஆம் பாவாதிபதி ${lord4}: ${getSubha(lord4).netScore >= 0 ? '+' : ''}${getSubha(lord4).netScore} • 5-ஆம் பாவாதிபதி ${lord5}: ${getSubha(lord5).netScore >= 0 ? '+' : ''}${getSubha(lord5).netScore}. புதன் குரு சேர்க்கை அல்லது சுப பார்வை உயர் தொழில்நுட்ப ஞானத்தையும் கூரிய கணித அறிவையும் நல்கும்.`,
        paavathuvam: `4-ல் ராகு/கேது அல்லது தேய்பிறை சந்திரன் தொடர்பால் பள்ளிப் பருவத்தில் படிப்பில் சிறு கவனச் சிதறல் வந்து விலகியிருக்கும்; எனினும் சுப புதனின் பலம் தடையின்றி பட்டப் படிப்பை முடித்துக் கொடுத்தது.`,
        sookshumaValu: `புதன் நவாம்சத்தில் பலம் பெறுவதால் கல்வி சார்ந்த ஞானமும், மற்றவர்களுக்கு வழிகாட்டும் ஆசிரியர் மற்றும் ஆலோசகர் ஆளுமையும் இயல்பாகவே அமையும்.`
      },
      remedies: "புதன்கிழமைகளில் ஹயக்ரீவர் சன்னதியில் ஏலக்காய் மாலை சாற்றி, 'ஓம் ஸ்ரீ ஹயக்ரீவாய நமஹ' 108 முறை ஜபித்து வர கல்வி மற்றும் தேர்வுகளில் முதலிடம் கிட்டும்."
    });

    // =========================================================================
    // Q2: புதியவர்களுக்கான முதல் வேலை & வயது (First Job for Freshers)
    // =========================================================================
    const pastJobBhukti = findBestPastBhukti(27, ["செவ்வாய்", "சனி", lord10, lord6, lord2], 18.0) || findBhuktiByAge(22);
    const fJob = (jt && jt.firstJob) ? {
      dasaBhukti: jt.firstJob.dasaBhukti,
      yearRange: jt.firstJob.yearRange,
      ageText: jt.firstJob.ageText,
      isPast: jt.firstJob.isPast
    } : formatBhukti(pastJobBhukti);

    const elevJobBhukti = findBestFutureBhukti(0.5, 12, ["குரு", "சூரியன்", lord10, lord11]) || findBhuktiByAge(curAgeYears + 3);
    const elevJob = formatBhukti(elevJobBhukti);

    const jobChangeBhukti = findBestFutureBhukti(0.5, 6, [lord3, lord10, lord12, "சனி"]) || findBhuktiByAge(curAgeYears + 2);
    const jobLossBhukti = findBestFutureBhukti(0.5, 10, [lord8, lord6, "கேது", "ராகு"]) || findBhuktiByAge(curAgeYears + 4);
    const fJobChange = formatBhukti(jobChangeBhukti);
    const fJobLoss = formatBhukti(jobLossBhukti);

    // Evaluate Applicable Job Rules via Rule Engine (including Nadi Gocharam Rahu 2,6,10 Rule)
    const jobRuleContext = {
      placedPlanets: analysis.placedPlanets || [],
      houseLords: houseLords,
      subhathuvamScores: analysis.subhathuvamScores || {},
      currentDasa: {
        mahaLord: curDasaLord,
        bhuktiLord: curBhuktiLord,
        antharamLord: "சுக்கிரன்"
      },
      nativeGender: isFemale ? 'female' : 'male',
      lagnaRasiId: lagnaId,
      transitSaturnRasiId: 11,
      transitRahuRasiId: 12
    };

    let matchedJobRulesText = "";
    if (typeof window !== "undefined" && window.PGAstroRuleEngine && window.ASTRO_RULES) {
      const matchedJobRules = window.PGAstroRuleEngine.filterApplicableRules(window.ASTRO_RULES, jobRuleContext, 'job');
      if (matchedJobRules && matchedJobRules.length > 0) {
        matchedJobRulesText = "<br><br>📜 <strong>விசேஷ உத்தியோக/நாடி ஜோதிட விதிகள் (Applied Job Rules):</strong><br>" +
          matchedJobRules.map((m, idx) => `• <strong>விதி ${idx + 1}:</strong> ${m.rule.verdictTamil}`).join("<br>");
      }
    }

    questions.push({
      id: "qa_fresher_job",
      category: "job",
      categoryLabel: "💼 முதல் வேலை",
      questionNumber: "கேள்வி 2",
      questionTitle: "புதியவர்களுக்கு (Freshers) முதல் வேலை எப்போது கிடைக்கும்? எந்த வயதில் பணி நியமனம் நடக்கும்?",
      questionSummary: "படிப்பு முடித்தவுடன் முதல் வேலை அமையும் வயது & தசாபுத்தி கால நிர்ணயம்",
      highlightBadge: fJob.ageText || "வயது 20-22",
      dasaBhukti: fJob.dasaBhukti,
      yearRange: fJob.yearRange,
      ageRange: fJob.ageText,
      directAnswer: `உத்தியோக ஸ்தானமான 6-ஆம் பாவம், ஜீவன ஸ்தானமான 10-ஆம் பாவம் மற்றும் தசாபுத்தி அமைப்பின்படி: ${nativeTitle}ருக்கு <strong>${fJob.dasaBhukti}</strong> காலகட்டத்தில் <strong>${fJob.yearRange} (${fJob.ageText})</strong> முதல் உத்தியோகம் அமைந்தது.<br><br>⏳ <strong>1. தற்போது வேலை இல்லாமல் இருக்கக் காரணம் என்ன? (Current Situation Analysis):</strong><br>• <strong>தசா சந்தி & தசை ஆரம்ப சுழற்சி:</strong> ஜாதகர் முந்தைய சுப தசை முடிவடைந்து, 19 வருட <strong>${curDasaLord} மகா தசைக்கு</strong> மாறியுள்ளார். 2/3-ஆம் அதிபதியான ${curDasaLord} லக்னத்தில் வக்கிரம் பெற்று அமைவதால், புதிய தசை ஆரம்பிக்கும் போது பழைய உத்தியோகத்தில் மாற்றத்தையும், தற்காலிக இடைவெளியையும் (Career Break) தந்துள்ளது.<br>• <strong>கோச்சார நிலை:</strong> தற்போது கோச்சார சனி 4-ஆம் இடத்திலும் (கண்டச்சனி), கோச்சார ராகு 3-ஆம் இடத்திலும் பயணிப்பதால் மன அழுத்தம் மற்றும் உத்தியோகத் தேடலில் தற்காலிகத் தாமதம் ஏற்பட்டுள்ளது.<br><br>🎯 <strong>2. புதிய வேலை எப்போது கிடைக்கும்? (New Job Timing & Nadi Rule):</strong><br>• <strong>நாடி ஜோதிட கோச்சார ராகு விதிப்படி:</strong> உத்தியோக ஸ்தான அதிபதி ${lord6} 6-ல் ஆட்சி பெற்று பலமாக உள்ளதால், கோச்சார ராகு 6-ஆம் அதிபதி ${lord6} மற்றும் 10-ஆம் அதிபதி ${lord10}-ன் 1, 5, 9 திரிகோண வீடுகளில் சஞ்சரிக்கும் <strong>${fJobChange.dasaBhukti} (${fJobChange.yearRange})</strong> காலகட்டத்தில் புதிய வேலை வாய்ப்பு ஆணை (Appointment Order) நிச்சயமாகக் கைக்கு வரும்.<br>• 🏆 <strong>உச்சபட்ச பணி நியமன யோக காலம் (Peak Offer Window):</strong> <strong>${fJobChange.yearRange}</strong> காலகட்டத்தில் நல்ல சம்பளத்தில் புதிய உத்தியோகத்தில் அமரும் யோகம் உறுதியாகிறது.<br><br>💼 <strong>3. வேலையா? அல்லது சொந்த தொழிலா? (Job vs Business Guidance):</strong><br>• <strong>உத்தியோகம் / வேலை (Job):</strong> 100% முதன்மைப் பரிந்துரை! 6-ஆம் அதிபதி ${lord6} 6-ல் ஆட்சி பெற்றுள்ளதால், நிறுவனங்களில் பணிபுரிந்து மாதச் சம்பளம் பெறுவதே நிலையான தனலாபத்தையும் பொருளாதார பாதுகாப்பையும் தரும்.<br>• <strong>சொந்த தொழில் (Business):</strong> தற்போது வேண்டாம் (Avoid Heavy Capital Business). 7-ஆம் பாவக அமைப்பால் இப்போது அதிக முதலீடு செய்து சொந்த வர்த்தகம் தொடங்கினால் சிரமங்கள் வரலாம்.<br>• 💡 <strong>சேவை சார்ந்த தொழில் (Consultancy/Service):</strong> 10-ஆம் அதிபதி ${lord10} + 9-ஆம் அதிபதி உச்ச சூரியன் + லக்னாதிபதி குரு 5-ல் இணைந்து தர்ம கர்மாதிபதி யோகம் தருவதால், <strong>${elevJob.yearRange}-க்குப் பிறகு (${elevJob.dasaBhukti})</strong> பகுதி நேர ஆலோசனை / சேவை சார்ந்த தொழில் (Freelance/Consultancy) செய்யலாம்.` + matchedJobRulesText,
      timings: {
        pastDasa: fJob.dasaBhukti,
        pastYears: fJob.yearRange,
        past: `முந்தைய ${fJob.dasaBhukti}-ல் (${fJob.yearRange}, ${fJob.ageText}) கல்லூரி முடித்த கையோடு முதல் பணியில் சேர்ந்த அனுபவம்.`,
        presentDasa: curDasaBhuktiAntharamText,
        presentYears: curPeriodText,
        present: `தற்போது நடக்கும் ${curDasaLord} தசை - ${curBhuktiLord} புக்தியில் பணியில் முழு ஈடுபாட்டுடன் திறமையை வெளிப்படுத்தி நிர்வாகத்தின் பாராட்டைப் பெறும் காலம்.`,
        futureDasa: elevJob.dasaBhukti,
        futureYears: elevJob.yearRange,
        future: `எதிர்காலத்தில் ${elevJob.dasaBhukti}-ல் (${elevJob.yearRange}, ${elevJob.ageText}) உயர் தொழில்நுட்ப மேலாளர் அந்தஸ்து மற்றும் ஊதியத்தில் பெரும் உயர்வு (Promotion & Appraisal) பெறும் யோகம்.`
      },
      astrologicalAnalysis: {
        subhathuvam: `6-ஆம் பாவாதிபதி ${lord6} சுபத்துவம்: ${getSubha(lord6).netScore >= 0 ? '+' : ''}${getSubha(lord6).netScore} • 10-ஆம் பாவாதிபதி ${lord10}: ${getSubha(lord10).netScore >= 0 ? '+' : ''}${getSubha(lord10).netScore} • ஜீவனகாரகன் சனி: ${saturnSubha.netScore >= 0 ? '+' : ''}${saturnSubha.netScore}. தசாநாதன் 6 அல்லது 10-ஆம் பாவகத்தை சுபத்துவமாக தொடும் போது உடனடியாக முதல் வேலை வாய்ப்பு கதவைத் தட்டுகிறது.`,
        paavathuvam: `சனி 6-ஆம் இடத்தில் அமர்ந்தால் ஆரம்பத்தில் சில மாதங்கள் கடுமையான உழைப்பும் கூடுதல் பணிச்சுமையும் இருக்கும்; ஆனால் அதுவே எதிர்கால வளர்ச்சிக்கு வலுவான அஸ்திவாரமாக மாறும்.`,
        sookshumaValu: `செவ்வாய் சுபத்துவ பலம் பெற்றிருப்பதால் தொழில்நுட்பத் துறையில் உடனடி வேலைவாய்ப்பு (Quick Placement) கிட்டும்.`
      },
      remedies: "செவ்வாய்க்கிழமைகளில் விநாயகருக்கு அருகம்புல் சாற்றி, அனுமன் சாலிசா பாராயணம் செய்ய வேலை வாய்ப்புகள் தடையின்றி அமையும்."
    });

    // =========================================================================
    // Q3: அரசு வேலையா? தனியார் வேலையா? (Govt vs Private Job)
    // =========================================================================
    const isGovtEligible = (sunSubha.netScore >= 2 || (marsSubha.netScore >= 2 && getSubha(lord10).netScore >= 1));
    const govtVerdict = isGovtEligible ? "அரசு வேலை / பொதுத்துறை அதிகார யோகம் (Government / PSU Job)" : "பன்னாட்டு கார்ப்பரேட் தனியார் உத்தியோகம் (Top MNC Corporate Job)";
    const govtReason = isGovtEligible
      ? "அரசு காரகன் சூரியன் மற்றும் அதிகார காரகன் செவ்வாய் உச்ச சுபத்துவம் பெற்றுள்ளதால், போட்டித் தேர்வுகளில் (UPSC, TNPSC, Banking, SSC, Police, Judiciary) வெற்றி பெற்று அரசு முத்திரையுடன் கூடிய அதிகாரப் பதவி வகிப்பார்."
      : "வணிக காரகன் புதன் மற்றும் சொகுசு காரகன் சுக்கிரனின் ஆதிக்கம் மேலோங்கி உள்ளதால், அரசுப் பணியை விட பன்னாட்டு கார்ப்பரேட் நிறுவனங்களில் லட்சங்களில் மாத வருமானம் ஈட்டும் தனியார் உயர் பதவியே ஜாதகருக்கு உச்சபட்ச செல்வச் செழிப்பைத் தரும்.";

    const govtTargetBhukti = findBestFutureBhukti(0.5, 8, isGovtEligible ? ["சூரியன்", "செவ்வாய்", lord10, "குரு"] : ["புதன்", "சுக்கிரன்", "ராகு", lord10]) || findBhuktiByAge(curAgeYears + 2);
    const pastGovtJobBhukti = findBestPastBhukti(curAgeYears, ["செவ்வாய்", "சனி", lord10]) || findBhuktiByAge(curAgeYears - 5);
    const fGovtTarget = formatBhukti(govtTargetBhukti);
    const fPastGovtJob = formatBhukti(pastGovtJobBhukti);

    questions.push({
      id: "qa_govt_vs_pvt",
      category: "job",
      categoryLabel: "💼 அரசு / தனியார்",
      questionNumber: "கேள்வி 3",
      questionTitle: "அரசு உத்தியோகம் அமையுமா? அல்லது தனியார் கார்ப்பரேட் நிறுவன வேலையா? எது உச்சபட்ச யோகம் தரும்?",
      questionSummary: "அரசுப் பணி யோகம் vs முன்னணி பன்னாட்டு தனியார் நிறுவன வேலை பகுப்பாய்வு",
      highlightBadge: isGovtEligible ? "அரசு வேலை யோகம்" : "தனியார் MNC உச்ச வருமானம்",
      dasaBhukti: fGovtTarget.dasaBhukti,
      yearRange: fGovtTarget.yearRange,
      ageRange: fGovtTarget.ageText,
      directAnswer: `${nativeTitle}ரின் ஜாதக பிரமாணப்படி: <strong>${govtVerdict}</strong> அமையும். ${govtReason}`,
      timings: {
        pastDasa: fPastGovtJob.dasaBhukti,
        pastYears: fPastGovtJob.yearRange,
        past: `முந்தைய ${fPastGovtJob.dasaBhukti}-ல் (${fPastGovtJob.yearRange}) போட்டித் தேர்வுகள் அல்லது கார்ப்பரேட் நிறுவனங்களில் நுழைவதற்கான முயற்சிகளில் ஈடுபட்ட அனுபவம்.`,
        presentDasa: curDasaBhuktiAntharamText,
        presentYears: curPeriodText,
        present: `தற்போது நடக்கும் ${curDasaLord} தசை - ${curBhuktiLord} புக்தியில் தொழில் விவகாரங்களில் ஸ்திரத்தன்மையை நோக்கி நகர்த்தும் காலம்.`,
        futureDasa: fGovtTarget.dasaBhukti,
        futureYears: fGovtTarget.yearRange,
        future: isGovtEligible
          ? `சாதகமான ${fGovtTarget.dasaBhukti}-ல் (${fGovtTarget.yearRange}, ${fGovtTarget.ageText}) போட்டித் தேர்வுகளில் வெற்றி பெற்று அரசு பணி நியமன ஆணை (Appointment Order) பெறும் சுப காலம்.`
          : `தனியார் முன்னணி கார்ப்பரேட் நிறுவனத்தில் ${fGovtTarget.dasaBhukti}-ல் (${fGovtTarget.yearRange}, ${fGovtTarget.ageText}) அடுத்த கட்ட சீனியர் மேலாளர் / துறைத் தலைவர் பதவி உயர்வு பெற்று அதிக சம்பள தொகுப்பு (CTC) எட்டும் காலம்.`
      },
      astrologicalAnalysis: {
        subhathuvam: `சூரியன் சுபத்துவம்: ${sunSubha.netScore >= 0 ? '+' : ''}${sunSubha.netScore} • செவ்வாய் சுபத்துவம்: ${marsSubha.netScore >= 0 ? '+' : ''}${marsSubha.netScore} • 10-ஆம் அதிபதி ${lord10}: ${getSubha(lord10).netScore >= 0 ? '+' : ''}${getSubha(lord10).netScore}. சூரியன் 1, 5, 9, 10-ஆம் பாவங்களுடன் தொடர்பு பெற்று குருவின் சுப பார்வை பெற்றால் அரசு வேலை யோகம் நூறு சதவீதம் உறுதிப்படுகிறது.`,
        paavathuvam: `சூரியன் ராகுவால் கிரகணம் அடைந்தாலோ அல்லது 6/8/12-ல் மறைந்து பலவீனமானாலோ அரசு வேலைக்காக பல ஆண்டுகள் காத்திருந்து காலத்தை வீணடிக்காமல் தனியார் நிறுவனத்தில் நுழைவதே நற்பலன் தரும்.`,
        sookshumaValu: `சூரியன் வக்கிரம் பெற்ற கிரகங்களின் வீடுகளில் அமரும் போது, நேரடியாக அரசாங்கத்தில் இல்லாவிட்டாலும் அரசுக்கு ஆலோசனை வழங்கும் உயர்மட்ட ஆலோசகர் அல்லது அரசு ஒப்பந்ததாரராக பெரும் தனலாபம் அடைவார்.`
      },
      remedies: isGovtEligible 
        ? "ஞாயிற்றுக்கிழமை காலை சூரிய உதயத்தில் ஆதித்ய ஹிருதய ஸ்தோத்திரம் படித்து செம்பு பாத்திரத்தில் நீர் சமர்ப்பிக்கவும்." 
        : "வியாழக்கிழமை குரு தட்சிணாமூர்த்திக்கு மஞ்சள் வஸ்திரம் சாற்றி வழிபட கார்ப்பரேட் வளர்ச்சி விரைவுபடும்."
    });

    // =========================================================================
    // Q4: எந்த துறையில் பணி & தொழில் அமையும்? (Job Industry & Career Field)
    // =========================================================================
    const jobFields = jt && jt.recommendedFields ? jt.recommendedFields.join(" • ") : "தகவல் தொழில்நுட்பம் (IT), வங்கி & நிதி நிர்வாகம், பொறியியல்";
    const jobPeakBhukti = findBestFutureBhukti(0.5, 8, [lord10, "சனி", "குரு", "புதன்"]) || findBhuktiByAge(curAgeYears + 3);
    const pastJobPeakBhukti = findBestPastBhukti(curAgeYears, ["செவ்வாய்", "சனி", lord10]) || findBhuktiByAge(curAgeYears - 5);
    const fJobPeak = formatBhukti(jobPeakBhukti);
    const fPastJobPeak = formatBhukti(pastJobPeakBhukti);

    questions.push({
      id: "qa_job_field",
      category: "job",
      categoryLabel: "💼 தொழில் துறை",
      questionNumber: "கேள்வி 4",
      questionTitle: "எந்த துறையில் உத்தியோகம் அல்லது தொழில் அமையும்? பதவி உயர்வு எப்போது உச்சம் தொடும்?",
      questionSummary: "தொழில் துறை, பணிப் பொறுப்பு, பதவி & ஜீவன அமைப்பு",
      highlightBadge: jobFields.split('•')[0].trim(),
      dasaBhukti: fJobPeak.dasaBhukti,
      yearRange: fJobPeak.yearRange,
      ageRange: fJobPeak.ageText,
      directAnswer: `10-ஆம் அதிபதி ${lord10} மற்றும் ஜீவனகாரகன் சனி பெற்றுள்ள சுபத்துவ இணைவுகளின்படி, ${nativeTitle}ருக்கு உச்சபட்ச தனலாபம் மற்றும் அதிகாரத்தை தரும் முதன்மைத் துறைகள்: <strong>${jobFields}</strong> ஆகும். இத்துறைகளில் நிர்வாகப் பொறுப்பு, தொழில்நுட்ப தலைமை அல்லது வர்த்தக மேலாண்மைப் பதவிகளில் ஜாதகர் சிறப்புடன் பணியாற்றுவார்.<br><br>🏡 <strong>ரியல் எஸ்டேட், நில வர்த்தகம் & சுய தொழில் பகுப்பாய்வு (Real Estate & Property Business):</strong><br>• <strong>ரியல் எஸ்டேட் & நில வர்த்தக யோகம்:</strong> 4-ஆம் அதிபதி <strong>${lord4}</strong> மற்றும் பூமி காரகன் <strong>செவ்வாய்</strong> பெற்றுள்ள அமைப்பின்படி, நிலம் விற்பனை, லேண்ட் பிரமோஷன், புரோக்கரேஜ், கட்டட ஒப்பந்தம் மற்றும் சொத்து கமிஷன் தொழிலில் 100% பிரகாசமான யோகமும் பெரிய தனலாபமும் உண்டு.<br>• <strong>சுய தொழில் ஆதிக்கம்:</strong> லக்னாதிபதி <strong>${lord1}</strong> மற்றும் 7-ஆம் அதிபதி <strong>${lord7}</strong> தொடர்பால் பிறரிடம் பணிபுரியாமல் <strong>சுய தொழில் / வர்த்தகம் (Independent Business)</strong> செய்வதே ஜாதகருக்கு உச்சபட்ச தனலாபத்தையும் கௌரவத்தையும் தரும்.`,
      timings: {
        pastDasa: fPastJobPeak.dasaBhukti,
        pastYears: fPastJobPeak.yearRange,
        past: `முந்தைய ${fPastJobPeak.dasaBhukti}-ல் (${fPastJobPeak.yearRange}) பல்வேறு துறை சார்ந்த அனுபவங்களைத் திரட்டி, தொழில் நுணுக்கங்களை கற்றுக் கொண்ட ஆரம்ப காலகட்டம்.`,
        presentDasa: curDasaBhuktiAntharamText,
        presentYears: curPeriodText,
        present: `தற்போது நடக்கும் ${curDasaLord} தசை - ${curBhuktiLord} புக்தியில் தனக்கான நிரந்தர துறை அடையாளத்தை உருவாக்கி நிலைநிறுத்தும் பருவம்.`,
        futureDasa: fJobPeak.dasaBhukti,
        futureYears: fJobPeak.yearRange,
        future: `சாதகமான ${fJobPeak.dasaBhukti}-ல் (${fJobPeak.yearRange}, ${fJobPeak.ageText}) துறை சார்ந்த உயர் தொழில்நுட்பத் தலைவர், திட்ட இயக்குநர் அல்லது சொந்த வர்த்தக நிறுவனத் தலைமை ஏற்கும் பிரகாசமான பொற்காலம்.`
      },
      astrologicalAnalysis: {
        subhathuvam: `ஜீவனகாரகன் சனி சுபத்துவம்: ${saturnSubha.netScore >= 0 ? '+' : ''}${saturnSubha.netScore} • 10-ஆம் அதிபதி ${lord10} சுபத்துவம்: ${getSubha(lord10).netScore >= 0 ? '+' : ''}${getSubha(lord10).netScore}. சனி புதன் சுக்கிரன் தொடர்பு பெற்றால் IT, சாப்ட்வேர், ஆடிட்டிங், மீடியா துறையும்; செவ்வாய் தொடர்பு பெற்றால் சிவில், பாதுகாப்பு, மெக்கானிக்கல் துறையும் அமையும்.`,
        paavathuvam: `10-ல் மாந்தி அல்லது பலவீனமான பாவர்கள் தொடர்பு பணியிடத்தில் தேவையற்ற மேலதிகாரி கருத்து வேறுபாடுகளைத் தரும். தசாநாதன் சுபத்துவம் பெற்றால் அவை எளிதில் தீரும்.`,
        sookshumaValu: `10-ஆம் அதிபதி நவாம்சத்தில் ஆட்சி அல்லது வர்கோத்தமம் பெறுவதால், எந்தத் துறையில் இருந்தாலும் தலைமைப் பொறுப்பை வகிக்கும் சூட்சும ஆளுமை வாய்க்கும்.`
      },
      remedies: "தினமும் நெற்றியில் திருநீறு அல்லது சந்தனம் அணிந்து, பணிக்கு செல்லும் முன் குலதெய்வத்தை பிரார்த்தனை செய்ய பணியிட செல்வாக்கு கூடும்."
    });

    // =========================================================================
    // Q5: திருமண யோக காலம் & அமையும் துணைவர் (Marriage Timing & Spouse Details)
    // =========================================================================
    const marrAgeStr = mr ? mr.ageText : "வயது 24 முதல் 28-க்குள்";
    const spouseDir = (mr && mr.spouseDirection) || "தெற்கு அல்லது கிழக்கு திசை";
    const spouseNature = (mr && (mr.spouseTraits || mr.spouseQualities)) || "அன்பான குணம், கௌரவமான குடும்பப் பின்னணி, குடும்பப் பொறுப்புணர்வு கொண்டவர்";
    const mStatus = nInfo.maritalStatus || nInfo.marriageStatus || (typeof document !== "undefined" && document.getElementById("birthCalcMaritalStatus")?.value) || "unmarried";
    const minAdultMarriageAge = isFemale ? 18.0 : 21.0;
    const rawFutureMarrBhukti = findBestFutureBhukti(0.1, 10, ["சுக்கிரன்", lord7, "குரு", lord2], minAdultMarriageAge);
    const rawPastMarrBhukti = findBestPastBhukti(curAgeYears, ["சுக்கிரன்", lord7, "குரு"], minAdultMarriageAge);

    const futureMarrBhukti = formatBhukti(rawFutureMarrBhukti);
    const pastMarrBhukti = formatBhukti(rawPastMarrBhukti);

    const isUnmarriedStatus = (mStatus === 'unmarried');
    const isMarriedStatus = (mStatus === 'married');
    const isSeparatedStatus = (mStatus === 'divorced' || mStatus === 'separated');

    const activeMarrBhukti = isMarriedStatus ? pastMarrBhukti : futureMarrBhukti;
    const rawActiveMarrBhukti = isMarriedStatus ? rawPastMarrBhukti : rawFutureMarrBhukti;

    let marriageTimelineText = '';
    if (isSeparatedStatus) {
      marriageTimelineText = `💍 <strong>திருமண & மறுமண தசாபுத்தி காலகட்ட பகுப்பாய்வு (Marriage & Remarriage Timeline):</strong><br>• ⚠️ <strong>முதல் திருமணம் & பிரிவு நிலை (1st Marriage & Separation):</strong> முந்தைய காலகட்டத்தில் (${pastMarrBhukti.yearRange}) முதல் திருமணம் நடைபெற்ற காலம்; பின்னர் 7-ஆம் பாவக பாபத்துவ அமைப்பால் கருத்து வேறுபாடு ஏற்பட்டு பிரிவு நிலை உருவானது.<br>• ❤️ <strong>மறுமணம் / 2-ஆம் தார சுப யோக காலம் (Remarriage Timeline):</strong> எதிர்வரும் <strong>${futureMarrBhukti.dasaBhukti}</strong> (${futureMarrBhukti.yearRange}) காலகட்டத்தில் மறுமணம் (2-ஆம் தார சுப யோகம்) நடைபெறுவதற்கான வாய்ப்பு மிக அதிகமாக உள்ளது.`;
    } else if (isMarriedStatus) {
      marriageTimelineText = `💍 <strong>திருமண தசாபுத்தி காலகட்ட பகுப்பாய்வு (Marriage History):</strong><br>• 💒 <strong>திருமண சுப முகூர்த்த காலம் (Past Event):</strong> <strong>${pastMarrBhukti.dasaBhukti}</strong> (${pastMarrBhukti.yearRange}) காலகட்டத்தில் திருமணம் நடைபெறும் யோகம் இருந்தது; அந்த காலகட்டத்தில் திருமணம் சுபமாக நிறைவடைந்துள்ளது.`;
    } else {
      marriageTimelineText = `💍 <strong>திருமண தசாபுத்தி காலகட்ட பகுப்பாய்வு (Future Marriage Prediction):</strong><br>• 💒 <strong>எதிர்கால திருமண வாய்ப்பு யோக காலம்:</strong> <strong>${futureMarrBhukti.dasaBhukti}</strong> (${futureMarrBhukti.yearRange}, ${futureMarrBhukti.ageText}) காலகட்டத்தில் திருமணம் நடைபெறுவதற்கான வாய்ப்பு மிக அதிகமாக உள்ளது.`;
    }

    let q5DirectAnswerText = '';
    if (isMarriedStatus) {
      q5DirectAnswerText = `களத்திர ஸ்தானமான 7-ஆம் பாவாதிபதி ${lord7} மற்றும் சுக்கிரனின் அமைப்பின்படி: <strong>${pastMarrBhukti.dasaBhukti} (${pastMarrBhukti.yearRange})</strong> காலகட்டத்தில் திருமணம் சுபமாக நிறைவடைந்தது. வரன் அமைந்த திசை: <strong>${spouseDir}</strong>. துணைவர்: <strong>${spouseNature}</strong>.<br><br>${marriageTimelineText}`;
    } else if (isSeparatedStatus) {
      q5DirectAnswerText = `முந்தைய காலகட்டத்தில் முதல் திருமணம் நடைபெற்றது; பின்னர் கருத்து வேறுபாடு காரணமாக பிரிவு ஏற்பட்டது. எதிர்வரும் <strong>${futureMarrBhukti.dasaBhukti} (${futureMarrBhukti.yearRange})</strong> காலகட்டத்தில் மறுமணம் (2-ஆம் தார சுப யோகம்) நடைபெறுவதற்கான வாய்ப்பு மிக அதிகமாக உள்ளது. வரன் அமையும் திசை: <strong>${spouseDir}</strong>.<br><br>${marriageTimelineText}`;
    } else {
      q5DirectAnswerText = `களத்திர ஸ்தானமான 7-ஆம் பாவாதிபதி ${lord7} மற்றும் சுக்கிரனின் அமைப்பின்படி: இந்த <strong>${futureMarrBhukti.dasaBhukti} (${futureMarrBhukti.yearRange})</strong> காலகட்டத்தில் திருமணம் நடைபெறுவதற்கான வாய்ப்பு மிக அதிகமாக உள்ளது. வரன் அமையும் திசை: <strong>${spouseDir}</strong>. துணைவர்: <strong>${spouseNature}</strong>.<br><br>${marriageTimelineText}`;
    }

    // Evaluate Applicable Marriage Rules via Rule Engine
    const ruleContext = {
      placedPlanets: analysis.placedPlanets || [],
      houseLords: houseLords,
      subhathuvamScores: analysis.subhathuvamScores || {},
      currentDasa: {
        mahaLord: (rawActiveMarrBhukti && rawActiveMarrBhukti.mahaLord) || curDasaLord,
        bhuktiLord: (rawActiveMarrBhukti && rawActiveMarrBhukti.bhuktiLord) || curBhuktiLord,
        antharamLord: "சுக்கிரன்"
      },
      nativeGender: isFemale ? 'female' : 'male',
      lagnaRasiId: lagnaId,
      transitSaturnRasiId: 11
    };

    let matchedMarriageRulesText = "";
    if (typeof window !== "undefined" && window.PGAstroRuleEngine && window.ASTRO_RULES) {
      const matchedMarriageRules = window.PGAstroRuleEngine.filterApplicableRules(window.ASTRO_RULES, ruleContext, 'marriage');
      if (matchedMarriageRules && matchedMarriageRules.length > 0) {
        matchedMarriageRulesText = "<br><br>📜 <strong>விசேஷ திருமண ஜோதிட விதிகள் (Applied Marriage Rules):</strong><br>" +
          matchedMarriageRules.map((m, idx) => `• <strong>விதி ${idx + 1}:</strong> ${m.rule.verdictTamil}`).join("<br>");
      }
    }

    questions.push({
      id: "qa_marriage_timing",
      category: "marriage",
      categoryLabel: "💍 திருமணம்",
      questionNumber: "கேள்வி 5",
      questionTitle: "திருமணம் எப்போது நடக்கும்? எந்த வயதில் திருமணம் கைகூடும்? அமையும் வாழ்க்கைத்துணை யார்?",
      questionSummary: "திருமண வயது, சுப முகூர்த்த கால நிர்ணயம், திசை & துணைவரின் குணநலன்கள்",
      highlightBadge: isMarriedStatus ? "திருமணம் நடந்த காலம்" : (isSeparatedStatus ? "மறுமண யோக ஆய்வு" : marrAgeStr),
      dasaBhukti: activeMarrBhukti.dasaBhukti,
      yearRange: activeMarrBhukti.yearRange,
      ageRange: activeMarrBhukti.ageText,
      directAnswer: q5DirectAnswerText + matchedMarriageRulesText,
      timings: {
        pastDasa: pastMarrBhukti.dasaBhukti,
        pastYears: pastMarrBhukti.yearRange,
        past: isMarriedStatus
          ? `${pastMarrBhukti.yearRange} காலகட்டத்தில் திருமணம் நடைபெறும் யோகம் இருந்தது; அந்த காலகட்டத்தில் திருமணம் சுபமாக நடந்தது.`
          : (isSeparatedStatus
              ? `முந்தைய ${pastMarrBhukti.yearRange} காலகட்டத்தில் முதல் திருமணம் நடைபெற்றது; பின்னர் பிரிவு உருவானது.`
              : `கடந்த ${pastMarrBhukti.yearRange} காலகட்டத்தில் வரன் பேச்சுகள் தசாபுத்திகள் காரணமாக தள்ளிப் போன பருவம்.`),
        presentDasa: curDasaBhuktiAntharamText,
        presentYears: curPeriodText,
        present: isMarriedStatus
          ? `தற்போது குடும்ப வாழ்க்கையில் கணவன்-மனைவி பரஸ்பர புரிதலுடன் குடும்ப பொறுப்புகளை முன்னெடுக்கும் காலம்.`
          : `தற்போது நடக்கும் ${curDasaLord} தசை - ${curBhuktiLord} புக்தி களத்திர ஸ்தானத்தை செயல்படுத்துவதால் தீவிர வரன் தேடல் மற்றும் நிச்சயதார்த்த சூழல் உருவாகும் காலம்.`,
        futureDasa: futureMarrBhukti.dasaBhukti,
        futureYears: futureMarrBhukti.yearRange,
        future: isMarriedStatus
          ? `எதிர்காலத்தில் தம்பதியர் ஒற்றுமையுடன் மங்கல சுபகாரியங்களை நடத்தி, குடும்பத்தில் பெருமகிழ்ச்சி அடையும் சுப காலம்.`
          : (isSeparatedStatus
              ? `எதிர்வரும் ${futureMarrBhukti.yearRange} காலகட்டத்தில் மறுமணம் (2-ஆம் தார சுப யோகம்) நடைபெறுவதற்கான வாய்ப்பு மிக அதிகமாக உள்ளது.`
              : `இந்த காலகட்டத்தில் (${futureMarrBhukti.yearRange}) திருமணம் நடைபெறுவதற்கான வாய்ப்பு மிக அதிகமாக உள்ளது. சுப முகூர்த்த அந்தரத்தில் கெட்டிமேளம் கொட்டி திருமணம் இனிதே அரங்கேறும்.`)
      },
      astrologicalAnalysis: {
        subhathuvam: `7-ஆம் அதிபதி ${lord7} சுபத்துவம்: ${getSubha(lord7).netScore >= 0 ? '+' : ''}${getSubha(lord7).netScore} • களத்திரகாரகன் சுக்கிரன் சுபத்துவம்: ${venusSubha.netScore >= 0 ? '+' : ''}${venusSubha.netScore}. 7-ஆம் அதிபதி சுப கிரகங்களான குரு, சுக்கிரன், சுப சந்திரனின் பார்வை சேர்க்கை பெற்றால் குடும்ப வாழ்க்கை அமைதியும் ஆனந்தமும் நிறைந்ததாக அமையும்.`,
        paavathuvam: `7-ல் சனி, ராகு/கேது பார்வை அல்லது சேர்க்கை இருந்தால் திருமணப் பேச்சுவார்த்தையில் சிறு காலதாமதம் அல்லது ஜாதகப் பொருத்தம் பார்ப்பதில் கூடுதல் நிதானம் தேவைப்படும்.`,
        sookshumaValu: `7-ஆம் அதிபதி நவாம்சத்தில் (D9) ஆட்சி, உச்சம் அல்லது குருவின் சுப வர்க்கம் பெற்றிருப்பதால் திருமணத்திற்குப் பின் ஜாதகரின் அதிர்ஷ்டமும் அந்தஸ்தும் இருமடங்கு பெருகும்.`
      },
      remedies: "வெள்ளிக்கிழமை தோறும் அம்மன் கோயிலில் நெய் தீபம் ஏற்றி லலிதா சகஸ்ரநாமம் கேட்கவும்; துளசி மாலை சாற்றி வழிபட களத்திர தோஷங்கள் விலகும்."
    });

    // =========================================================================
    // Q6: 2வது அல்லது 3வது திருமண வாய்ப்பு & விவாகரத்து ஆய்வு (Remarriage Analysis)
    // =========================================================================
    const hasDualSign7 = [3, 6, 9, 12].includes(((lagnaId - 1 + 6) % 12) + 1);
    const hasRahuKetuAxis17 = analysis.placedPlanets.some(p => (p.planet === "ராகு" || p.planet === "கேது") && (p.rasiId === lagnaId || p.rasiId === (((lagnaId - 1 + 6) % 12) + 1)));
    const lord7Sub = getSubha(lord7).netScore;
    const isRemarriageRisk = (hasDualSign7 && lord7Sub < 1) || (hasRahuKetuAxis17 && venusSubha.netScore < 1);

    const remarrVerdict = isRemarriageRisk
      ? "ஜாதகத்தில் உபய ராசி / ராகு-கேது அச்சு களத்திர ஸ்தானத்தில் உள்ளதால், முதல் திருமணத்தில் கருத்து வேறுபாடுகள் அல்லது தற்காலிக பிரிவு வரக்கூடிய சாத்தியக்கூறுகள் உண்டு. எனினும் சுப தசாபுத்தியில் மறுமணம் (2-ஆம் தார யோகம்) அமைதியான வாழ்வைத் தரும் அல்லது முதல் துணையுடன் சமரசம் ஏற்படும்."
      : "ஜாதகத்தில் 7-ஆம் வீடு மற்றும் களத்திரகாரகன் பலமாக இருப்பதால், திருமண பந்தம் மிக உறுதியானது. கருத்து வேறுபாடுகள் வந்தாலும் பெரியோர்கள் தலையீட்டால் உடனே தீர்ந்துவிடும்; 2-வது அல்லது 3-வது திருமணத்திற்கான சாத்தியக்கூறுகள் இல்லை; முதல் திருமணமே தீர்க்கமாக நிலைக்கும்.";

    const remarrBhukti = findBestFutureBhukti(0.5, 7, [lord11, "குரு", lord2, "சுக்கிரன்"], minAdultMarriageAge) || findBhuktiByAge(Math.max(minAdultMarriageAge + 2, curAgeYears + 2));
    const pastRemarrBhukti = findBestPastBhukti(curAgeYears, ["சுக்கிரன்", lord7], minAdultMarriageAge) || findBhuktiByAge(Math.max(minAdultMarriageAge, curAgeYears - 5));
    const fRemarr = formatBhukti(remarrBhukti);
    const fPastRemarr = formatBhukti(pastRemarrBhukti);

    questions.push({
      id: "qa_remarriage",
      category: "marriage",
      categoryLabel: "💍 மறுமண ஆய்வு",
      questionNumber: "கேள்வி 6",
      questionTitle: "இரண்டாம் திருமணம் அல்லது மறுமண வாய்ப்பு உள்ளதா? விவாகரத்து, பிரிவு யோகம் உள்ளதா?",
      questionSummary: "களத்திர தோஷ ஆய்வு, தம்பதியர் பிரிவு அபாயம் & 2-ஆம் தார யோக கால நிர்ணயம்",
      highlightBadge: isRemarriageRisk ? "மறுமண ஆய்வு யோகம்" : "ஒரே திருமணம் தீர்க்கம்",
      dasaBhukti: fRemarr.dasaBhukti,
      yearRange: fRemarr.yearRange,
      ageRange: fRemarr.ageText,
      directAnswer: `களத்திர பாவக ஆய்வு: <strong>${remarrVerdict}</strong> 2-ஆம் பாவம் (குடும்பம்), 7-ஆம் பாவம் (களத்திரம்) மற்றும் 11-ஆம் பாவம் (மறுமணம்/2-ஆம் தாரம்) நிலைகளை ஆராயும் போது, சுபத்துவ பலம் மேலோங்கி இருப்பதால் அச்சப்படத் தேவையில்லை.`,
      timings: {
        pastDasa: fPastRemarr.dasaBhukti,
        pastYears: fPastRemarr.yearRange,
        past: `முந்தைய ${fPastRemarr.dasaBhukti}-ல் (${fPastRemarr.yearRange}) குடும்ப உறவினர்களின் தலையீடு அல்லது ஈகோ காரணமாக ஏற்பட்ட மனக்கசப்பு காலகட்டம்.`,
        presentDasa: curDasaBhuktiAntharamText,
        presentYears: curPeriodText,
        present: `தற்போது நடக்கும் ${curDasaLord} தசை - ${curBhuktiLord} புக்தியில் பரஸ்பர விட்டுக்கொடுத்தலுடன் குடும்ப ஒற்றுமையைக் காக்க வேண்டிய முக்கிய பருவம்.`,
        futureDasa: fRemarr.dasaBhukti,
        futureYears: fRemarr.yearRange,
        future: isRemarriageRisk
          ? `சாதகமான ${fRemarr.dasaBhukti}-ல் (${fRemarr.yearRange}, ${fRemarr.ageText}) குடும்பத்தில் சமாதானம் அல்லது அமைதியான புதிய இல்லற வாழ்வு மலரும் சுப காலம்.`
          : `எதிர்காலத்தில் ${fRemarr.dasaBhukti}-ல் (${fRemarr.yearRange}, ${fRemarr.ageText}) தம்பதியரிடையே அன்யோன்யம் அதிகரித்து, சமுதாயத்தில் முன்மாதிரியாக வாழும் உன்னத யோகம்.`
      },
      astrologicalAnalysis: {
        subhathuvam: `11-ஆம் அதிபதி ${lord11} சுபத்துவம்: ${getSubha(lord11).netScore >= 0 ? '+' : ''}${getSubha(lord11).netScore} • 2-ஆம் அதிபதி ${lord2}: ${getSubha(lord2).netScore >= 0 ? '+' : ''}${getSubha(lord2).netScore}. குருவின் பார்வை 7-ஆம் வீட்டிற்கு இருக்கும் வரை எந்த தம்பதியரையும் சட்டம் பிரிக்க முடியாது; அது தெய்வீகக் கவசமாக செயல்படும்.`,
        paavathuvam: `7-ல் சுக்கிரனுடன் கேது அல்லது செவ்வாய் பாபத்துவமாக இணைந்தால் தாம்பத்தியத்தில் அதிருப்தி மற்றும் தேவையற்ற சந்தேகம் எழலாம்; உரிய பரிகாரத்தால் இது நிவர்த்தியாகும்.`,
        sookshumaValu: `7-ஆம் அதிபதி வக்கிரம் பெற்றால் துணைவர் வழக்கத்திற்கு மாறான முற்போக்கு சிந்தனை கொண்டவராக இருப்பார்; அவரைப் புரிந்து கொண்டால் வாழ்க்கை சொர்க்கமாகும்.`
      },
      remedies: "திருநாகேஸ்வரம் சென்று ராகு கால அர்ச்சனை செய்வது, வீட்டில் வெள்ளிக்கிழமை சுக்ர காயத்ரி மந்திரம் 108 முறை சொல்வது தாம்பத்திய ஒற்றுமையை பலப்படுத்தும்."
    });

    // =========================================================================
    // Q7: குழந்தைப் பாக்கியம் - 1வது & 2வது குழந்தை (Childbirth - 1st & 2nd Child)
    // =========================================================================
    const futureChild1Bhukti = findBestFutureBhukti(0.5, 7, ["குரு", lord5, "சுக்கிரன்", "சந்திரன்"]) || findBhuktiByAge(curAgeYears + 2);
    const pastChildBhukti = findBestPastBhukti(curAgeYears, ["குரு", lord5, "சுக்கிரன்"]) || findBhuktiByAge(curAgeYears - 5);
    const child1Bhukti = formatBhukti(futureChild1Bhukti);
    const fPastChild = formatBhukti(pastChildBhukti);

    const child2Bhukti = findBestFutureBhukti(2.5, 9, [lord5, lord9, "குரு"]) || findBhuktiByAge(curAgeYears + 4);
    const fChild2 = formatBhukti(child2Bhukti);

    questions.push({
      id: "qa_childbirth",
      category: "child",
      categoryLabel: "👶 குழந்தை யோகம்",
      questionNumber: "கேள்வி 7",
      questionTitle: "குழந்தைப் பாக்கியம் எப்போது கிடைக்கும்? 1வது & 2வது குழந்தை பிறக்கும் காலம் எது? புத்திர தோஷம் உள்ளதா?",
      questionSummary: "1வது மற்றும் 2வது குழந்தை பிறக்கும் கால நிர்ணயம், சுகப்பிரசவம் & புத்திர யோகம்",
      highlightBadge: child1Bhukti.ageText || "வயது 26-29",
      dasaBhukti: child1Bhukti.dasaBhukti,
      yearRange: child1Bhukti.yearRange,
      ageRange: child1Bhukti.ageText,
      directAnswer: `புத்திர ஸ்தானமான 5-ஆம் பாவம் மற்றும் புத்திரகாரகன் குருவின் அருளால் ${nativeTitle}ருக்கு தீர்க்கமான புத்திர பாக்கியம் உண்டு. <strong>முதல் குழந்தை: ${child1Bhukti.dasaBhukti}-ல் (${child1Bhukti.yearRange}, ${child1Bhukti.ageText})</strong> சுபமாக பிறக்கும். <strong>இரண்டாம் குழந்தை: ${fChild2.dasaBhukti}-ல் (${fChild2.yearRange}, ${fChild2.ageText})</strong> யோகமாக ஜனனமாகும். பிறக்கும் குழந்தைகள் கல்வி மற்றும் ஒழுக்கத்தில் சிறந்து விளங்கி பெற்றோருக்கு பெருமை சேர்ப்பர்.`,
      timings: {
        pastDasa: fPastChild.dasaBhukti,
        pastYears: fPastChild.yearRange,
        past: `முந்தைய ${fPastChild.dasaBhukti}-ல் (${fPastChild.yearRange}) திருமணம் மற்றும் குழந்தை பிறப்பிற்கான பூர்வாங்க பிரார்த்தனைகள் மேற்கொண்ட காலம்.`,
        presentDasa: curDasaBhuktiAntharamText,
        presentYears: curPeriodText,
        present: `தற்போது நடக்கும் ${curDasaLord} தசை - ${curBhuktiLord} புக்தியில் கருத்தரித்தல் மற்றும் புத்திர யோகம் பலப்படும் சூழல்.`,
        futureDasa: child1Bhukti.dasaBhukti,
        futureYears: child1Bhukti.yearRange,
        future: `சாதகமான ${child1Bhukti.dasaBhukti}-ல் (${child1Bhukti.yearRange}, ${child1Bhukti.ageText}) இல்லத்தில் மழலைச் சத்தம் கேட்டு தொட்டில் கட்டும் மங்களகரமான காலம்.`
      },
      astrologicalAnalysis: {
        subhathuvam: `5-ஆம் அதிபதி ${lord5} சுபத்துவம்: ${getSubha(lord5).netScore >= 0 ? '+' : ''}${getSubha(lord5).netScore} • புத்திரகாரகன் குரு சுபத்துவம்: ${jupiterSubha.netScore >= 0 ? '+' : ''}${jupiterSubha.netScore}. 5-ல் சுப கிரகங்கள் அமர்வது புத்திர பாக்கியத்தை விரைவுபடுத்தும்.`,
        paavathuvam: `5-ல் ராகு அல்லது கேது இருந்தால் 'நாக தோஷம்' அல்லது 'புத்திர தோஷம்' ஏற்பட்டு ஆரம்பத்தில் கருத்தரிப்பில் சிறு தாமதம் அல்லது மருத்துவ சிகிச்சை தேவைப்படலாம்.`,
        sookshumaValu: `குரு பகவான் 5-ஆம் வீட்டைப் பார்த்தால் கோடி புண்ணியம்; எப்பேர்ப்பட்ட தோஷமாக இருந்தாலும் விலகி அழகான வாரிசு ஜனனமாகும்.`
      },
      remedies: "திருச்செந்தூர் முருகன் கோயிலில் பாலபிஷேகம் செய்து, வியாழக்கிழமைகளில் ஏழை குழந்தைகளுக்கு இனிப்பு மற்றும் நோட்டுப் புத்தகங்கள் தானம் செய்வது புத்திர யோகத்தை துரிதப்படுத்தும்."
    });

    // =========================================================================
    // Q8: சொந்த வீடு, பூமி, நிலம் & வாகன யோகம் (Land, House & Vehicle)
    // =========================================================================
    const pastPropBhukti = findBestPastBhukti(curAgeYears, ["செவ்வாய்", "ராகு", lord4]);
    const futurePropBhukti = findBestFutureBhukti(0.5, 8, ["செவ்வாய்", lord4, "சனி", "சுக்கிரன்", "குரு"]);
    const fPastProp = formatBhukti(pastPropBhukti);
    const fFutureProp = formatBhukti(futurePropBhukti);

    const houseBhukti = (hs && hs.dasaBhukti && !hs.isPast && hs.startYear >= 2026) ? {
      dasaBhukti: hs.dasaBhukti,
      yearRange: hs.yearRange,
      ageText: hs.ageText
    } : fFutureProp;

    const carBhukti = (vh && vh.dasaBhukti && !vh.isPast && vh.startYear >= 2026) ? {
      dasaBhukti: vh.dasaBhukti,
      yearRange: vh.yearRange,
      ageText: vh.ageText
    } : formatBhukti(findBestFutureBhukti(0.5, 6, ["சுக்கிரன்", "ராகு", lord4]));

    questions.push({
      id: "qa_property_vehicle",
      category: "property",
      categoryLabel: "🏡 வீடு & சொத்து",
      questionNumber: "கேள்வி 8",
      questionTitle: "எப்போது சொந்தமாக இடம் வாங்கி வீடு கட்டுவார்? நிலம் வாங்கும் காலம் எது? புதிய கார் யோகம் எப்போது?",
      questionSummary: "நிலம் பத்திரப்பதிவு, வீடு கட்டுதல், கிரகப்பிரவேசம் & சொகுசு வாகன யோகம்",
      highlightBadge: houseBhukti.ageText || "வயது 32-35",
      dasaBhukti: houseBhukti.dasaBhukti,
      yearRange: houseBhukti.yearRange,
      ageRange: houseBhukti.ageText,
      directAnswer: `மாத்ரு/சுக/கிருக ஸ்தானமான 4-ஆம் பாவம் மற்றும் பூமி காரகன் செவ்வாய், வாகன காரகன் சுக்கிரன் அமைப்பால்: <strong>${houseBhukti.dasaBhukti}</strong> காலகட்டத்தில் <strong>${houseBhukti.yearRange} (${houseBhukti.ageText})</strong> சொந்த நிலம் வாங்கி பிரம்மாண்டமாக வீடு கட்டும் யோகம் கைகூடும். புதிய சொகுசு கார் (Car / SUV) வாங்கும் யோகம் <strong>${carBhukti.dasaBhukti}</strong> காலத்தில் (${carBhukti.yearRange}) சுபமாக அமையும்.`,
      timings: {
        pastDasa: fPastProp.dasaBhukti,
        pastYears: fPastProp.yearRange,
        past: `முந்தைய ${fPastProp.dasaBhukti}-ல் (${fPastProp.yearRange}) சொந்த வாகனம் மற்றும் வீட்டு மனை வாங்குவதற்கான நிதி சேமிப்பு முயற்சிகளைத் தொடங்கிய பருவம்.`,
        presentDasa: curDasaBhuktiAntharamText,
        presentYears: curPeriodText,
        present: `தற்போது நிலம் அல்லது வீட்டு மனை வாங்குவதற்கான வங்கி கடன் ஆலோசனைகள் மற்றும் சொத்துத் தேடலில் ஆர்வம் காட்டும் காலம்.`,
        futureDasa: fFutureProp.dasaBhukti,
        futureYears: fFutureProp.yearRange,
        future: `சாதகமான ${fFutureProp.dasaBhukti}-ல் (${fFutureProp.yearRange}, ${fFutureProp.ageText}) அடிக்கல் நாட்டி, பிரம்மாண்டமாக சொந்த வீடு கட்டி கிரகப்பிரவேசம் செய்யும் பொற்காலம்.`
      },
      astrologicalAnalysis: {
        subhathuvam: `4-ஆம் அதிபதி ${lord4} சுபத்துவம்: ${getSubha(lord4).netScore >= 0 ? '+' : ''}${getSubha(lord4).netScore} • பூமி காரகன் செவ்வாய்: ${marsSubha.netScore >= 0 ? '+' : ''}${marsSubha.netScore} • வாகன காரகன் சுக்கிரன்: ${venusSubha.netScore >= 0 ? '+' : ''}${venusSubha.netScore}. 4-ஆம் வீட்டில் சுப கிரகங்கள் அமர்வது அல்லது பார்வை பெறுவது சொந்த வீட்டு யோகத்தை அசைக்க முடியாததாக மாற்றும்.`,
        paavathuvam: `4-ல் சனி அமர்ந்தால் பழைய வீட்டை வாங்கி புதுப்பித்தல் அல்லது வீடு கட்டி முடிப்பதில் கூடுதல் கால விரயம் ஆகும்; ஆனால் கட்டி முடித்த பின் நிலைத்து நிற்கும்.`,
        sookshumaValu: `செவ்வாய் அல்லது 4-ஆம் அதிபதி வக்கிரம் பெற்றால் பரம்பரை சொத்துக்கள் வழியாக அல்லது திடீர் அதிர்ஷ்டம் மூலம் எதிர்பாராத பிரம்மாண்ட வீட்டு மனை அமையும்.`
      },
      remedies: "செவ்வாய்க்கிழமைகளில் வராக மூர்த்தி அல்லது முருகப் பெருமானை நெய் தீபமேற்றி வழிபட பூமி சம்பந்தப்பட்ட காரியங்கள் தடையின்றி நடக்கும்."
    });

    // =========================================================================
    // Q9: ஆரோக்கியம், நோய் தாக்கம் & மீளும் காலம் (Health, Diseases & Cure)
    // =========================================================================
    const healthOrgans = "இதயம், வயிறு/செரிமானம், எலும்பு மச்சை, கால் நரம்புகள்";
    const healthVulnerableBhukti = findBestPastBhukti(curAgeYears, [lord6, lord8, "ராகு", "சனி"]) || findBhuktiByAge(curAgeYears - 4);
    const healthCureBhukti = findBestFutureBhukti(0.5, 8, [lord1, "குரு", "சூரியன்", lord5]) || findBhuktiByAge(curAgeYears + 2);

    const fHealthVul = formatBhukti(healthVulnerableBhukti);
    const fHealthCure = formatBhukti(healthCureBhukti);

    questions.push({
      id: "qa_health_disease",
      category: "health",
      categoryLabel: "🩺 ஆரோக்கியம்",
      questionNumber: "கேள்வி 9",
      questionTitle: "ஆரோக்கிய குறைபாடு எப்போது வரும்? எந்த உறுப்புகளில் நோய் தாக்கம் ஏற்படலாம்? எப்போது முழு குணம் கிடைக்கும்?",
      questionSummary: "எச்சரிக்கையாக இருக்க வேண்டிய உடல் உறுப்புகள், நோய் தாக்க காலம் & நிவாரண கால நிர்ணயம்",
      highlightBadge: "தீர்க்காயுள் & நிவாரணம்",
      dasaBhukti: fHealthCure.dasaBhukti,
      yearRange: fHealthCure.yearRange,
      ageRange: fHealthCure.ageText,
      directAnswer: `ரோக ஸ்தானமான 6-ஆம் பாவம் மற்றும் 8-ஆம் பாவ அமைப்பின்படி, ${nativeTitle}ர் கவனமாகப் பராமரிக்க வேண்டிய உறுப்புகள்: <strong>${healthOrgans}</strong> ஆகும். பாபத்துவ தசா அந்தரங்களில் உணவுப் பழக்கம் மற்றும் உடற்பயிற்சியில் விழிப்புடன் இருக்க வேண்டும்; <strong>${fHealthCure.dasaBhukti} (${fHealthCure.yearRange})</strong> காலத்தில் நோயின் தாக்கம் முற்றிலுமாக அகன்று பூரண குணம் கிட்டும். பெரிய ஆபத்துகள் எதுவுமின்றி தீர்க்காயுளுடன் வாழும் அமைப்பு உண்டு.`,
      timings: {
        pastDasa: fHealthVul.dasaBhukti,
        pastYears: fHealthVul.yearRange,
        past: `முந்தைய ${fHealthVul.dasaBhukti}-ல் (${fHealthVul.yearRange}) உஷ்ண உபாதைகள், செரிமானக் கோளாறு அல்லது சிறு உடல்நலக் குறைவால் மருத்துவ சிகிச்சை பெற்ற பருவம்.`,
        presentDasa: curDasaBhuktiAntharamText,
        presentYears: curPeriodText,
        present: `தற்போது வழக்கமான உடல் பரிசோதனைகள் மற்றும் சீரான உணவு முறையைக் கடைப்பிடித்து உடலை நலம் பேண வேண்டிய காலம்.`,
        futureDasa: fHealthCure.dasaBhukti,
        futureYears: fHealthCure.yearRange,
        future: `சாதகமான ${fHealthCure.dasaBhukti}-ல் (${fHealthCure.yearRange}, ${fHealthCure.ageText}) உடல் புத்துணர்ச்சி பெற்று, நோயற்ற வாழ்வே குறைவற்ற செல்வம் என்ற ஆரோக்கிய நிலையை எட்டும் உன்னத காலம்.`
      },
      astrologicalAnalysis: {
        subhathuvam: `லக்னாதிபதி ${lord1} சுபத்துவம்: ${getSubha(lord1).netScore >= 0 ? '+' : ''}${getSubha(lord1).netScore} • 6-ஆம் அதிபதி ${lord6}: ${getSubha(lord6).netScore >= 0 ? '+' : ''}${getSubha(lord6).netScore}. லக்னாதிபதி பலம் பெற்றிருப்பதால் நோயெதிர்ப்பு சக்தி (Immunity Power) இயல்பாகவே மிக அதிகமாக இருக்கும்.`,
        paavathuvam: `6 மற்றும் 8-ஆம் அதிபதிகள் இணைவு பெற்றால் அவ்வப்போது மருத்துவ செலவுகள் வந்து போகும்; எனினும் ஆயுள்காரகன் சனி சுபத்துவம் பெற்றிருப்பதால் நீண்ட ஆயுள் உறுதி.`,
        sookshumaValu: `மருத்துவ காரகன் செவ்வாய்/சூரியன் சுபத்துவம் பெற்றிருப்பதால், உரிய மருத்துவ ஆலோசனையும் சரியான மருந்துகளும் உரிய நேரத்தில் கிடைத்து நிவாரணம் தரும்.`
      },
      remedies: "வைத்தீஸ்வரன் கோயில் சென்று தன்வந்திரி பகவானுக்கு அர்ச்சனை செய்வதும், தன்வந்திரி காயத்ரி மந்திரம் தினமும் 11 முறை ஜபிப்பதும் பூரண நலம் தரும்."
    });

    // =========================================================================
    // Q10: வெளிநாட்டு வேலை, பயணம் & குடியுரிமை (Foreign Travel & Settlement)
    // =========================================================================
    const isForeignHigh = (rahuSubha.netScore >= 1 || moonSubha.netScore >= 2 || getSubha(lord9).netScore >= 2 || getSubha(lord12).netScore >= 2);
    const foreignBhukti = findBestFutureBhukti(0.5, 7, ["ராகு", lord12, lord9, "சந்திரன்"]) || findBhuktiByAge(curAgeYears + 2);
    const pastForeignBhukti = findBestPastBhukti(curAgeYears, ["ராகு", lord12, lord9]) || findBhuktiByAge(curAgeYears - 5);
    const fForeign = formatBhukti(foreignBhukti);
    const fPastForeign = formatBhukti(pastForeignBhukti);

    questions.push({
      id: "qa_foreign_travel",
      category: "foreign",
      categoryLabel: "✈️ வெளிநாட்டு யோகம்",
      questionNumber: "கேள்வி 10",
      questionTitle: "வெளிநாட்டு வேலை, தூர தேச பயணம் & நிரந்தர குடியுரிமை (PR) யோகம் உள்ளதா? எப்போது வெளிநாடு செல்வார்?",
      questionSummary: "ஆன்சைட் வெளிநாட்டுப் பணி, அயல்நாட்டு வாசம் & விசா பெறும் கால நிர்ணயம்",
      highlightBadge: isForeignHigh ? "வெளிநாட்டு யோகம் மிக அதிகம்" : "பன்னாட்டு கார்ப்பரேட் பணி",
      dasaBhukti: fForeign.dasaBhukti,
      yearRange: fForeign.yearRange,
      ageRange: fForeign.ageText,
      directAnswer: `9-ஆம் பாவம் (தூர தேசப் பயணம்), 12-ஆம் பாவம் (அயல்நாட்டு வாசம்) மற்றும் வெளிநாட்டு காரகன் ராகுவின் அமைப்பின்படி: ${nativeTitle}ருக்கு <strong>${fForeign.dasaBhukti}</strong> காலகட்டத்தில் <strong>${fForeign.yearRange} (${fForeign.ageText})</strong> ${isForeignHigh ? "வெளிநாட்டு வேலை மற்றும் அயல்நாட்டு வாசம் நூறு சதவீதம் சாத்தியமாகும் யோகம் உண்டு" : "உள்நாட்டிலேயே பன்னாட்டு நிறுவன உயர் பொறுப்பு அல்லது குறுகிய கால வெளிநாட்டு தொழில் பயண யோகம் உண்டு"}. விசா தடைகள் விலகி சுபமாக பயணம் மேற்கொள்வார்.`,
      timings: {
        pastDasa: fPastForeign.dasaBhukti,
        pastYears: fPastForeign.yearRange,
        past: `முந்தைய ${fPastForeign.dasaBhukti}-ல் (${fPastForeign.yearRange}) பாஸ்போர்ட் பெறுதல் அல்லது வெளிநாட்டு நிறுவனங்களுடன் தகவல் தொடர்பு ஏற்பட்ட அனுபவம்.`,
        presentDasa: curDasaBhuktiAntharamText,
        presentYears: curPeriodText,
        present: `தற்போது வெளிநாட்டு திட்டங்கள் அல்லது அயல்நாட்டு வேலை வாய்ப்புகளுக்கான தகுதிகளை மேம்படுத்தும் காலம்.`,
        futureDasa: fForeign.dasaBhukti,
        futureYears: fForeign.yearRange,
        future: `சாதகமான ${fForeign.dasaBhukti}-ல் (${fForeign.yearRange}, ${fForeign.ageText}) விசா அங்கீகாரம் பெற்று அயல்நாடு சென்று கைநிறைய வருமானம் ஈட்டும் உன்னதமான காலம்.`
      },
      astrologicalAnalysis: {
        subhathuvam: `9-ஆம் அதிபதி ${lord9} சுபத்துவம்: ${getSubha(lord9).netScore >= 0 ? '+' : ''}${getSubha(lord9).netScore} • 12-ஆம் அதிபதி ${lord12}: ${getSubha(lord12).netScore >= 0 ? '+' : ''}${getSubha(lord12).netScore} • ராகு சுபத்துவம்: ${rahuSubha.netScore >= 0 ? '+' : ''}${rahuSubha.netScore}. ராகு சுப தொடர்புடன் 12-ல் அல்லது 9-ல் அமையும் போது கடல்கடந்து சென்று டாலர்களில் சம்பாதிக்கும் யோகம் உண்டாகிறது.`,
        paavathuvam: `4-ஆம் இடம் தாய்நாட்டை குறிக்கும்; 4-ஆம் இடத்தில் பாவர்கள் அமர்ந்து சுபத்துவம் குறைந்தால் சொந்த ஊரை விட வெளிநாட்டில் வசிப்பதே நிம்மதியையும் செல்வத்தையும் தரும்.`,
        sookshumaValu: `சலன ராசிகளில் சந்திரன் நின்றால் அடிக்கடி வெளிநாட்டுப் பயணங்கள் வாய்க்கும்; ஸ்திர ராசியில் 12-ஆம் அதிபதி நின்றால் அங்கேயே நிரந்தர குடியுரிமை (PR) கிட்டும்.`
      },
      remedies: "புதன்கிழமைகளில் பைரவருக்கு மிளகு தீபம் ஏற்றி வழிபட வெளிநாட்டு விசா தடைகள் தவிடு பொடியாகும்."
    });

    // =========================================================================
    // Q11: தன யோகம், கடன் நிவாரணம் & சேமிப்பு (Wealth & Debt Relief)
    // =========================================================================
    const wealthBhukti = findBestFutureBhukti(0.5, 8, [lord11, lord2, "குரு", "சுக்கிரன்"]) || findBhuktiByAge(curAgeYears + 3);
    const pastWealthBhukti = findBestPastBhukti(curAgeYears, [lord6, lord8, "சனி"]) || findBhuktiByAge(curAgeYears - 5);
    const fWealth = formatBhukti(wealthBhukti);
    const fPastWealth = formatBhukti(pastWealthBhukti);

    questions.push({
      id: "qa_wealth_debt",
      category: "wealth",
      categoryLabel: "💰 தன யோகம்",
      questionNumber: "கேள்வி 11",
      questionTitle: "கடன் சுமை எப்போது முழுமையாக அடையும்? பெரும் தனலாபம், கோடீஸ்வர யோகம் எப்போது வரும்?",
      questionSummary: "கடன் தீரும் காலம், பொருளாதார சுதந்திரம் & கோடீஸ்வர தன யோகம்",
      highlightBadge: "கடன் நிவர்த்தி & தன விருத்தி",
      dasaBhukti: fWealth.dasaBhukti,
      yearRange: fWealth.yearRange,
      ageRange: fWealth.ageText,
      directAnswer: `தன ஸ்தானமான 2-ஆம் பாவாதிபதி <strong>${lord2}</strong>, 6-ஆம் அதிபதி <strong>${lord6}</strong> மற்றும் 11-ஆம் அதிபதி <strong>${lord11}</strong> அமைப்பின்படி பகுப்பாய்வு:<br><br>💡 <strong>1. கடனை அடைக்கும் வழி & நிதி ஆதாரம் (Source of Debt Settlement):</strong><br>• <strong>வெளியாள் உதவி தேவையின்றி சுய தனலாபம்:</strong> 6-ஆம் அதிபதி <strong>${lord6}</strong> ஆட்சி பெற்ற அமைப்பால் ஜாதகருக்கு 'சத்ரு ருண ஜெய யோகம்' உண்டு. ஜாதகர் கடனை அடைக்க வெளியார் நிதியுதவியோ, புதிய கடன்களோ தேவையில்லை! 4-ஆம் அதிபதி <strong>${lord4}</strong> மற்றும் 11-ல் உச்ச சுக்கிரனின் பலத்தால் <strong>ரியல் எஸ்டேட் சொத்து வர்த்தகம் & பெரிய நில கமிஷன் லாபம் (Real Estate Commission Profits)</strong> மூலமாகவே பெரிய தொகையை ஈட்டி கடன்களை அடைப்பார்.<br><br>🎯 <strong>2. கடன் சுமை குறையத் தொடங்கும் காலம் (Initial Debt Relief Phase):</strong><br>• <strong>${fJobChange.dasaBhukti} (${fJobChange.yearRange})</strong> காலகட்டத்தில் சொத்து முன்பணங்கள் மற்றும் வர்த்தக கமிஷன்கள் கைக்கு வந்து அவசர கடன்களும் வட்டிப் பாரமும் வெகுவாகக் குறையத் தொடங்கும்.<br><br>🏆 <strong>3. கடன்கள் 100% முழுமையாக அடையும் பொற்காலம் (100% Full Debt Settlement Window):</strong><br>• <strong>${fWealth.dasaBhukti} (${fWealth.yearRange})</strong> காலகட்டத்தில் 11-ல் உச்ச சுக்கிரன் மற்றும் 4-ஆம் அதிபதியின் சுபத்துவத்தால் பெரிய ரியல் எஸ்டேட் வர்த்தகம் முடிவுக்கு வந்து ஒரே தவணையில் <strong>அனைத்துக் கடன்களும் 100% முழுமையாக அடைபட்டு (100% Debt Free Status)</strong> பொருளாதார சுதந்திரமும் தன யோகமும் பொங்கி வழியும்.`,
      timings: {
        pastDasa: fPastWealth.dasaBhukti,
        pastYears: fPastWealth.yearRange,
        past: `முந்தைய ${fPastWealth.dasaBhukti}-ல் (${fPastWealth.yearRange}) தொழில் அல்லது சொத்து வாங்குவதற்காக வாங்கிய கடன்கள் காரணமாக நிதி நெருக்கடி இருந்த காலகட்டம்.`,
        presentDasa: curDasaBhuktiAntharamText,
        presentYears: curPeriodText,
        present: `தற்போது வருமான வழிகள் விரிவடைந்து, சிறுகச் சிறுக அசையாச் சொத்துக்களை சேர்க்கும் காலம்.`,
        futureDasa: fWealth.dasaBhukti,
        futureYears: fWealth.yearRange,
        future: `சாதகமான ${fWealth.dasaBhukti}-ல் (${fWealth.yearRange}, ${fWealth.ageText}) அனைத்து கடன்களும் சுபமாக அடைபட்டு, முழுமையான தன யோகம் பொங்கி வழியும் பொற்காலம்.`
      },
      astrologicalAnalysis: {
        subhathuvam: `2-ஆம் அதிபதி ${lord2} சுபத்துவம்: ${getSubha(lord2).netScore >= 0 ? '+' : ''}${getSubha(lord2).netScore} • 11-ஆம் அதிபதி ${lord11}: ${getSubha(lord11).netScore >= 0 ? '+' : ''}${getSubha(lord11).netScore} • தனகாரகன் குரு: ${jupiterSubha.netScore >= 0 ? '+' : ''}${jupiterSubha.netScore}. 2 மற்றும் 11-ஆம் அதிபதிகள் பரிவர்த்தனை அல்லது கேந்திர திரிகோணங்களில் இணைவது 'மகா தன யோகம்' ஆகும்.`,
        paavathuvam: `6-ஆம் அதிபதி தொடர்பு காரணமாக கடன் வாங்க நேர்ந்தாலும், அது 'சுபக் கடன்' ஆக அதாவது சொத்து வாங்குவதற்கே பயன்படும்; விரயமாகாது.`,
        sookshumaValu: `குரு-சந்திர யோகம் அல்லது குரு-சுக்கிர சுபத்துவ சேர்க்கை ஜாதகருக்கு எக்காலத்திலும் பணத் தட்டுப்பாடு வராமல் பாதுகாக்கும் அரணாக இருக்கும்.`
      },
      remedies: "வெள்ளிக்கிழமைகளில் மகாலட்சுமிக்கு நெய் தீபமேற்றி கனகதாரா ஸ்தோத்திரம் படிக்கவும்; ஆதரவற்ற முதியோருக்கு அன்னதானம் செய்ய கடன் தொல்லைகள் மாயமாகும்."
    });

    // =========================================================================
    // Q12: எதிர்ப்புகள், கோர்ட் வழக்கு & வெற்றி (Litigation, Court Cases & Victory)
    // =========================================================================
    const courtBhukti = findBestFutureBhukti(0.5, 8, [lord6, "செவ்வாய்", "சூரியன்", lord1]) || findBhuktiByAge(curAgeYears + 2);
    const pastCourtBhukti = findBestPastBhukti(curAgeYears, [lord6, lord8, "சனி"]) || findBhuktiByAge(curAgeYears - 5);
    const fCourt = formatBhukti(courtBhukti);
    const fPastCourt = formatBhukti(pastCourtBhukti);

    questions.push({
      id: "qa_court_litigation",
      category: "court",
      categoryLabel: "⚖️ வழக்கு & எதிர்ப்புகள்",
      questionNumber: "கேள்வி 12",
      questionTitle: "எதிர்ப்புகள், பொறாமை, கோர்ட் வழக்கு விவகாரங்கள் உள்ளதா? சட்டப் போராட்டங்களில் எப்போது வெற்றி கிடைக்கும்?",
      questionSummary: "சத்ரு ஜெயம், எதிரிகள் பணிதல் & சட்ட ரீதியான சாதகமான தீர்ப்பு கால நிர்ணயம்",
      highlightBadge: "சத்ரு ஜெய யோகம்",
      dasaBhukti: fCourt.dasaBhukti,
      yearRange: fCourt.yearRange,
      ageRange: fCourt.ageText,
      directAnswer: `சத்ரு ஸ்தானமான 6-ஆம் பாவாதிபதி ${lord6} மற்றும் தைரியகாரகன் செவ்வாய் அமைப்பின்படி, ${nativeTitle}ருக்கு 'சத்ரு ஜெய யோகம்' உண்டு. <strong>${fCourt.dasaBhukti}</strong> காலகட்டத்தில் <strong>${fCourt.yearRange} (${fCourt.ageText})</strong> கோர்ட் வழக்குகள் மற்றும் பூர்வீக சொத்து விவகாரங்களில் ${nativeTitle}ருக்கே சாதகமான இறுதி வெற்றித் தீர்ப்பு கிட்டும்; எதிரிகள் பணிவர்.`,
      timings: {
        pastDasa: fPastCourt.dasaBhukti,
        pastYears: fPastCourt.yearRange,
        past: `முந்தைய ${fPastCourt.dasaBhukti}-ல் (${fPastCourt.yearRange}) தேவையற்ற பகைகள், பங்காளி தகராறு அல்லது பணியிடத்தில் பொறாமைக்காரர்களால் ஏற்பட்ட மனக்கசப்பு காலம்.`,
        presentDasa: curDasaBhuktiAntharamText,
        presentYears: curPeriodText,
        present: `தற்போது விவேகத்துடனும் சட்ட ஆலோசனையுடனும் காரியங்களை கையாண்டு சாதகமான முகாமை உருவாக்கும் காலம்.`,
        futureDasa: fCourt.dasaBhukti,
        futureYears: fCourt.yearRange,
        future: `சுப செவ்வாய் மற்றும் ${fCourt.dasaBhukti}-ல் (${fCourt.yearRange}, ${fCourt.ageText}) கோர்ட் வழக்குகள் சுமூகமாக முடிந்து வெற்றிக்கான தீர்ப்பு வெளிவரும் காலம்.`
      },
      astrologicalAnalysis: {
        subhathuvam: `6-ஆம் அதிபதி ${lord6} சுபத்துவம்: ${getSubha(lord6).netScore >= 0 ? '+' : ''}${getSubha(lord6).netScore} • தைரிய காரகன் செவ்வாய்: ${marsSubha.netScore >= 0 ? '+' : ''}${marsSubha.netScore}. லக்னாதிபதி 6-ஆம் அதிபதியை விட பலமாக இருந்தால் எதிரிகள் எக்காலத்திலும் வெல்ல முடியாது.`,
        paavathuvam: `8-ஆம் அதிபதி சம்பந்தப்பட்டால் வழக்குகள் சில காலம் தவணை தள்ளிப் போகும்; ஆனால் தீர்ப்பு சாதகமாகவே வரும்.`,
        sookshumaValu: `செவ்வாய் சுபத்துவ பலம் பெற்றிருப்பதால் நியாயமான வாதங்கள் மூலம் வழக்கை சாதகமாக முடிக்கும் சூட்சும திறமை உண்டாகும்.`
      },
      remedies: "செவ்வாய்க்கிழமைகளில் நரசிம்மர் அல்லது காலபைரவருக்கு சிகப்பு வஸ்திரம் சாற்றி வழிபட எதிர்ப்புகள் சுக்குநூறாகும்."
    });

    // =========================================================================
    // Q13: குலதெய்வ அருள் & பரிகாரங்கள் (Family Deity & Remedies)
    // =========================================================================
    const remedyBhukti = findBestFutureBhukti(0.5, 6, [lord5, lord9, "குரு", "கேது"]) || findBhuktiByAge(curAgeYears + 1);
    const pastRemedyBhukti = findBestPastBhukti(curAgeYears, [lord5, lord9, "குரு"]) || findBhuktiByAge(curAgeYears - 5);
    const fRemedy = formatBhukti(remedyBhukti);
    const fPastRemedy = formatBhukti(pastRemedyBhukti);

    questions.push({
      id: "qa_kula_deivam_remedy",
      category: "remedy",
      categoryLabel: "🕉️ குலதெய்வம் & பரிகாரம்",
      questionNumber: "கேள்வி 13",
      questionTitle: "குலதெய்வ அருள் எவ்வாறு உள்ளது? முன்னோர்கள் ஆசி கிட்டுகிறதா? எந்த பரிகாரங்கள் வாழ்வில் திருப்புமுனை தரும்?",
      questionSummary: "குலதெய்வ வழிபாட்டு பிரமாணம், பித்ரு தோஷ நிவர்த்தி & வாழ்வில் வளம் சேர்க்கும் பரிகாரங்கள்",
      highlightBadge: "குலதெய்வ பரிபூரண அருள்",
      dasaBhukti: fRemedy.dasaBhukti,
      yearRange: fRemedy.yearRange,
      ageRange: fRemedy.ageText,
      directAnswer: `5-ஆம் பாவம் (குலதெய்வம்) மற்றும் 9-ஆம் பாவம் (தந்தை/முன்னோர்கள்) நிலைகளின்படி: <strong>${fRemedy.dasaBhukti}</strong> காலகட்டத்தில் <strong>${fRemedy.yearRange} (${fRemedy.ageText})</strong> குடும்பத்துடன் குலதெய்வ சன்னதிக்கு சென்று பொங்கலிட்டு, மாவிளக்கு ஏற்றி வழிபட குடும்பத்தில் தடைபட்ட அனைத்து மங்கல காரியங்களும் மின்னல் வேகத்தில் நடக்கும்; பித்ருக்களின் ஆசியால் சந்ததி செழிக்கும்.`,
      timings: {
        pastDasa: fPastRemedy.dasaBhukti,
        pastYears: fPastRemedy.yearRange,
        past: `முந்தைய ${fPastRemedy.dasaBhukti}-ல் (${fPastRemedy.yearRange}) குலதெய்வத்திற்கு செய்ய வேண்டிய நேர்த்திக்கடன்கள் அல்லது வழிபாடுகளில் ஏற்பட்ட காலதாமதம்.`,
        presentDasa: curDasaBhuktiAntharamText,
        presentYears: curPeriodText,
        present: `தற்போது ஆன்மீக நாட்டம் மற்றும் குலதெய்வ தரிசனத்திற்கான உந்துதல் மேலோங்கும் காலம்.`,
        futureDasa: fRemedy.dasaBhukti,
        futureYears: fRemedy.yearRange,
        future: `சாதகமான ${fRemedy.dasaBhukti}-ல் (${fRemedy.yearRange}, ${fRemedy.ageText}) பௌர்ணமி சுப காலத்தில் குலதெய்வம் சென்று வழிபட்டு பரிபூரண மன நிம்மதியும் திருப்புமுனையும் அடையும் காலம்.`
      },
      astrologicalAnalysis: {
        subhathuvam: `5-ஆம் அதிபதி ${lord5} சுபத்துவம்: ${getSubha(lord5).netScore >= 0 ? '+' : ''}${getSubha(lord5).netScore} • 9-ஆம் அதிபதி ${lord9}: ${getSubha(lord9).netScore >= 0 ? '+' : ''}${getSubha(lord9).netScore}. 5 மற்றும் 9-ல் சுப கிரகங்கள் தொடர்பு குலதெய்வக் காவல் எப்போதும் ஜாதகரைச் சுற்றி இருப்பதை உறுதி செய்கிறது.`,
        paavathuvam: `9-ல் ராகு/கேது இருந்தால் அமாவாசை தோறும் முன்னோர்களுக்கு எள் தர்ப்பணம் கொடுத்து வர பித்ரு சாபம் விலகி பல தலைமுறைக்கு வளம் சேரும்.`,
        sookshumaValu: `ஞானகாரகன் கேது சுபத்துவ தொடர்பு ஆன்மீக முதிர்ச்சியையும், இறைவனின் நேரடி ஆசியையும் பெற்றுக் கொடுக்கும்.`
      },
      remedies: "குலதெய்வத்திற்கு வஸ்திரம் சாற்றுதல், திருச்செந்தூர் சுப்பிரமணிய சுவாமி தரிசனம் மற்றும் திருவண்ணாமலை கிரிவலம் வாழ்வில் சகல ஐஸ்வர்யங்களையும் வழங்கும்."
    });

        // =========================================================================
    // Q14: குடும்ப ஒற்றுமை & வாழ்க்கைத்துணை புரிதல் (Family Harmony & Understanding)
    // =========================================================================
    const familyBhukti = findBestFutureBhukti(0.5, 6, [lord2, lord4, lord7, lord11, "சுக்கிரன்", "குரு"]) || findBhuktiByAge(curAgeYears + 1);
    const pastFamilyBhukti = findBestPastBhukti(curAgeYears, [lord2, lord4, lord7]) || findBhuktiByAge(curAgeYears - 4);
    const fFamily = formatBhukti(familyBhukti);
    const fPastFamily = formatBhukti(pastFamilyBhukti);

    const spouseKarakaName = isFemale ? "குரு" : "சுக்கிரன்";
    const spouseTitle = isFemale ? "கணவர்" : "மனைவி";
    const karakaSubhaScore = getSubha(spouseKarakaName).netScore;

    questions.push({
      id: "qa_family_understanding",
      category: "marriage",
      categoryLabel: "👨‍👩‍👧‍👦 குடும்ப புரிதல்",
      questionNumber: "கேள்வி 14",
      questionTitle: "குடும்ப ஒற்றுமை, வாழ்க்கைத்துணை புரிதல் & மனஅமைதி யோகம் எவ்வாறு அமையும்?",
      questionSummary: "2-ஆம் பாவம் (குடும்பம்), 7-ஆம் அதிபதி சேர்க்கை & குடும்பத்தில் மனஅமைதி காலகட்டம்",
      highlightBadge: "குடும்ப ஒற்றுமை பகுப்பாய்வு",
      dasaBhukti: fFamily.dasaBhukti,
      yearRange: fFamily.yearRange,
      ageRange: fFamily.ageText,
      directAnswer: `குடும்ப ஸ்தானமான 2-ஆம் பாவாதிபதி <strong>${lord2}</strong>, சுக ஸ்தான அதிபதி <strong>${lord4}</strong>, களத்திர ஸ்தான அதிபதி <strong>${lord7}</strong> மற்றும் ${spouseTitle} காரகனான <strong>${spouseKarakaName}</strong> அமைப்பின்படி பகுப்பாய்வு:<br><br>👨‍👩‍👧‍👦 <strong>1. குடும்ப பிணைப்பு & பேச்சு ஆளுமை (2-ஆம் பாவம்):</strong> 2-ஆம் அதிபதி <strong>${lord2}</strong> பெற்றுள்ள சுபத்துவ அமைப்பால் குடும்பப் பொறுப்புணர்வு உண்டு. பேசுவதில் அமைதியைக் கடைப்பிடிப்பதன் மூலம் குடும்ப உறுப்பினர்களிடம் தேவையற்ற கருத்து வேறுபாடுகளைத் தவிர்க்கலாம்.<br><br>❤️ <strong>2. ${spouseTitle} அன்பு & அன்யோன்ய யோகம் (7-ஆம் பாவம் & 4-ஆம் பாவம்):</strong> ${spouseTitle} காரகன் <strong>${spouseKarakaName}</strong> (சுபத்துவம்: ${karakaSubhaScore >= 0 ? '+' : ''}${karakaSubhaScore.toFixed(1)}) மற்றும் 7-ஆம் அதிபதி <strong>${lord7}</strong> தொடர்பால் ${spouseTitle} அன்புடையவர். தற்காலிக வேலைப் பளு அல்லது கோச்சார கிரக அமைப்பால் இடையே பேச்சுவார்த்தை முடக்கம் (Communication Gap) வந்தாலும், <strong>${fFamily.dasaBhukti} (${fFamily.yearRange})</strong> காலகட்டத்தில் ${spouseTitle}ரின் முழுமையான அன்பும் அன்யோன்யமும் மீண்டும் மலரும்.<br><br>🛡️ <strong>3. தர்ம நெறி & ஒழுக்க நிலை (Fidelity & Moral Character Analysis):</strong> 5-ஆம் அதிபதி <strong>${lord5}</strong> மற்றும் 9-ஆம் அதிபதி <strong>${lord9}</strong> சுபத்துவ பிரமாணப்படி ஜாதகருக்கு உயர் தர்ம சிந்தனையும், குடும்ப நெறியும் உண்டு. தம்பதியரிடையே எவ்விதத் தவறான தொடர்புகளோ (No Illegal Affairs) ஒழுக்கக் குறைபாடோ இன்றி பரஸ்பர நம்பிக்கையுடன் வாழும் சுப யோகம் உண்டு.<br><br>🌸 <strong>4. குடும்ப சுப நிகழ்வு & நிம்மதி யோக காலம்:</strong> 11-ஆம் அதிபதி <strong>${lord11}</strong> மற்றும் சுக்கிரனின் சுபத்துவ பலத்தால் <strong>${fFamily.yearRange}</strong> காலகட்டத்தில் குடும்பத்தில் சுப காரியங்கள் நிறைவேறுவதுடன் முழுமையான மனஅமைதி நிலைபெறும்.`,
      timings: {
        pastDasa: fPastFamily.dasaBhukti,
        pastYears: fPastFamily.yearRange,
        past: `முந்தைய ${fPastFamily.dasaBhukti}-ல் (${fPastFamily.yearRange}) நிதி சுமை மற்றும் வேலை அழுத்தத்தால் குடும்ப உறுப்பினர்களிடையே தற்காலிக புரிதலின்மை ஏற்பட்ட காலகட்டம்.`,
        presentDasa: curDasaBhuktiAntharamText,
        presentYears: curPeriodText,
        present: `தற்போது நடக்கும் ${curDasaLord} தசையில் குடும்பப் பொறுப்புகளை உணர்ந்து சுமுகமான அமைதியை உருவாக்கும் முயற்சி.`,
        futureDasa: fFamily.dasaBhukti,
        futureYears: fFamily.yearRange,
        future: `சாதகமான ${fFamily.dasaBhukti}-ல் (${fFamily.yearRange}, ${fFamily.ageText}) குடும்பத்தில் பொருளாதார பலத்துடன் கணவன்-மனைவி மற்றும் பிள்ளைகளிடையே பரிபூரண அன்பும் சந்தோஷமும் நிலைபெறும் காலம்.`
      },
      astrologicalAnalysis: {
        subhathuvam: `2-ஆம் அதிபதி ${lord2} சுபத்துவம்: ${getSubha(lord2).netScore >= 0 ? '+' : ''}${getSubha(lord2).netScore} • 7-ஆம் அதிபதி ${lord7}: ${getSubha(lord7).netScore >= 0 ? '+' : ''}${getSubha(lord7).netScore} • 4-ஆம் அதிபதி ${lord4}: ${getSubha(lord4).netScore >= 0 ? '+' : ''}${getSubha(lord4).netScore}. 2 மற்றும் 4-ல் சுப கிரகங்களின் பார்வை குடும்ப அமைதியைக் காக்கும்.`,
        paavathuvam: `4-ல் கேது அல்லது 7-ல் ராகு தொடர்புகள் இருந்தால் குடும்ப உறுப்பினர்களிடம் வீண் வாக்குவாதங்களைத் தவிர்த்து சுமுகமாகச் செல்வது அமைதி தரும்.`,
        sookshumaValu: `சுக்கிரன் மற்றும் குருவின் சுப பார்வை குடும்பத்தில் சுப காரியங்களையும் மன நிம்மதியையும் தரும்.`
      },
      remedies: "வெள்ளிக்கிழமைகளில் ஸ்ரீ லலிதா சகஸ்ரநாமம் பாராயணம் செய்தல் மற்றும் வியாழக்கிழமைகளில் தட்சிணாமூர்த்திக்கு நெய் தீபம் ஏற்றி வழிபடுதல் குடும்ப ஒற்றுமையைப் பெருக்கும்."
    });

    return questions;
  }  // Render Horoscope Q&A Container
  function renderHoroscopeQA(analysis) {
    const targets = ["horoscopeQAContainer", "tab1HoroscopeQAContainer"];
    const containers = targets.map(id => document.getElementById(id)).filter(Boolean);
    if (containers.length === 0) return;

    const questions = evaluateHoroscopeQA(analysis);
    if (!questions || questions.length === 0) {
      containers.forEach(c => {
        c.innerHTML = `
          <div style="text-align:center; padding:2rem; color:var(--text-muted);">
            <div style="font-size:2rem; margin-bottom:0.5rem;">🌌</div>
            <p>ஜாதகக் கட்டத்தில் கிரகங்களை அமைத்தவுடன் கேள்வி-பதில் பகுப்பாய்வு உடனே வெளியாகும்.</p>
          </div>
        `;
      });
      return;
    }

    let html = `
      <!-- Q&A Stats & Summary Header -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:0.75rem; margin-bottom:1rem;">
        <div class="cosmic-card" style="padding:0.75rem 1rem; border-color:rgba(212,175,55,0.4);">
          <div style="font-size:0.7rem; color:var(--text-muted);">மொத்த கேள்விகள் (Total Q&A)</div>
          <div style="font-size:1.2rem; font-weight:800; color:var(--gold-primary);">${questions.length} விரிவான பதில்கள்</div>
        </div>
        <div class="cosmic-card" style="padding:0.75rem 1rem; border-color:rgba(56,189,248,0.4);">
          <div style="font-size:0.7rem; color:var(--text-muted);">நடப்பு தசா - புக்தி - அந்தரம்</div>
          <div style="font-size:0.95rem; font-weight:700; color:#38bdf8;">
            ${analysis.dashaResult?.currentMahaDasa?.lord || 'குரு'} தசை • ${analysis.dashaResult?.currentBhukti?.lord || 'சனி'} புக்தி • ${analysis.dashaResult?.currentAntharam?.lord || 'புதன்'} அந்தரம்
          </div>
        </div>
        <div class="cosmic-card" style="padding:0.75rem 1rem; border-color:rgba(74,222,128,0.4);">
          <div style="font-size:0.7rem; color:var(--text-muted);">பகுப்பாய்வு முறை (Evaluation Mode)</div>
          <div style="font-size:0.95rem; font-weight:700; color:#4ade80;">சுபத்துவம் • பாவத்துவம் • சூட்சும வலு</div>
        </div>
      </div>

      <!-- Accordion Questions List -->
      <div class="qa-items-wrapper" style="display:flex; flex-direction:column; gap:0.85rem;">
    `;

    questions.forEach((q, idx) => {
      const isExpanded = (idx === 0 || q.category === 'job');
      html += `
        <div class="qa-item-card ${isExpanded ? 'expanded' : ''}" data-category="${q.category}" id="${q.id}">
          <div class="qa-header" onclick="this.parentElement.classList.toggle('expanded')">
            <div class="qa-header-left">
              <span class="qa-category-badge">${q.categoryLabel}</span>
              <h3 class="qa-title">${q.questionTitle}</h3>
            </div>
            <div class="qa-header-right">
              <span class="qa-highlight-badge">${q.highlightBadge}</span>
              <span class="qa-toggle-icon">▼</span>
            </div>
          </div>

          <div class="qa-body">
            <!-- Dasa - Bhukti & From Year to Year Period Banner -->
            <div class="qa-dasa-period-banner" style="background: linear-gradient(135deg, rgba(212,175,55,0.14), rgba(56,189,248,0.1)); border: 1px solid rgba(212,175,55,0.4); border-radius: var(--radius-md); padding: 0.75rem 1rem; margin-top: 1rem; display: flex; flex-wrap: wrap; gap: 0.75rem 1.4rem; align-items: center; font-size: 0.84rem; box-shadow: 0 4px 14px rgba(0,0,0,0.25);">
              <div style="display: flex; align-items: center; gap: 0.4rem; color: #fff;">
                <span style="color: var(--gold-light); font-size: 1.05rem;">🪐</span>
                <span style="color: var(--gold-light); font-weight: 700;">சுப தசா - புத்தி:</span>
                <span class="badge badge-gold" style="font-size: 0.78rem; letter-spacing: 0.3px;">${q.dasaBhukti}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 0.4rem; color: #fff;">
                <span style="color: #38bdf8; font-size: 1.05rem;">📅</span>
                <span style="color: #38bdf8; font-weight: 700;">ஆண்டு நிர்ணயம் (Period):</span>
                <span class="badge" style="background: rgba(56,189,248,0.2); color: #38bdf8; border: 1px solid rgba(56,189,248,0.4); font-size: 0.78rem;">${q.yearRange}</span>
              </div>
              ${q.ageRange ? `
                <div style="color: var(--text-muted); font-size: 0.78rem; display: flex; align-items: center; gap: 0.35rem;">
                  <span>👤</span> <strong>${q.ageRange}</strong>
                </div>
              ` : ''}
            </div>

            <!-- Direct Verdict Answer -->
            <div class="qa-verdict-box">
              <div class="verdict-tag">🎯 நேரடி பலன் &amp; கணிப்பு (Direct Answer)</div>
              <div class="verdict-content">${q.directAnswer}</div>
            </div>

            <!-- Past, Present, Future Timings Grid with Dasa-Bhukti and Year Range -->
            <div class="qa-timings-grid">
              <div class="timing-tile past">
                <div class="timing-header"><span>⏪</span> கடந்த காலம் (Past Events)</div>
                <div style="background: rgba(129,140,248,0.15); border: 1px solid rgba(129,140,248,0.35); padding: 3px 8px; border-radius: 4px; font-size: 0.72rem; color: #c7d2fe; margin-bottom: 6px; font-weight: 700; font-family: var(--font-tamil);">
                  ⏳ ${q.timings.pastDasa} • ${q.timings.pastYears}
                </div>
                <div class="timing-text">${q.timings.past}</div>
              </div>
              <div class="timing-tile present">
                <div class="timing-header"><span>⏸️</span> நிகழ்காலம் (Current Situation)</div>
                <div style="background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.35); padding: 3px 8px; border-radius: 4px; font-size: 0.72rem; color: #fde68a; margin-bottom: 6px; font-weight: 700; font-family: var(--font-tamil);">
                  ⏳ ${q.timings.presentDasa} • ${q.timings.presentYears}
                </div>
                <div class="timing-text">${q.timings.present}</div>
              </div>
              <div class="timing-tile future">
                <div class="timing-header"><span>⏩</span> எதிர்காலம் (Future Timings)</div>
                <div style="background: rgba(74,222,128,0.15); border: 1px solid rgba(74,222,128,0.35); padding: 3px 8px; border-radius: 4px; font-size: 0.72rem; color: #86efac; margin-bottom: 6px; font-weight: 700; font-family: var(--font-tamil);">
                  ⏳ ${q.timings.futureDasa} • ${q.timings.futureYears}
                </div>
                <div class="timing-text">${q.timings.future}</div>
              </div>
            </div>

            <!-- Astrological Rules & Reasonings: Subhathuvam, Paavathuvam, Sookshuma Valu -->
            <div class="qa-astro-logic-box">
              <div class="logic-header">🔬 ஜோதிட பிரமாணங்கள் &amp; துல்லிய காரணங்கள் (Astrological Rules)</div>
              <div class="logic-columns">
                <div class="logic-col subhathuvam">
                  <div class="logic-col-title">🌟 சுபத்துவம் (Subhathuvam)</div>
                  <div class="logic-col-text">${q.astrologicalAnalysis.subhathuvam}</div>
                </div>
                <div class="logic-col paavathuvam">
                  <div class="logic-col-title">⚡ பாவத்துவம் (Paavathuvam)</div>
                  <div class="logic-col-text">${q.astrologicalAnalysis.paavathuvam}</div>
                </div>
                <div class="logic-col sookshuma">
                  <div class="logic-col-title">💎 சூட்சும வலு (Sookshuma Valu)</div>
                  <div class="logic-col-text">${q.astrologicalAnalysis.sookshumaValu}</div>
                </div>
              </div>
            </div>

            <!-- Auspicious Guidance & Remedies -->
            ${q.remedies ? `
              <div class="qa-remedy-box">
                <span class="remedy-icon">🕉️</span>
                <div>
                  <strong>பரிகாரம் &amp; வழிகாட்டல்:</strong> ${q.remedies}
                </div>
              </div>
            ` : ''}

            <!-- Action Buttons: Share to WhatsApp -->
            <div class="qa-card-footer">
              <button class="btn btn-xs btn-outline-gold" onclick="window.PGAstroUI.sharePrediction('${q.questionTitle.replace(/'/g, "\\'")}', '${q.directAnswer.replace(/<[^>]*>/g, '').replace(/'/g, "\\'")}')">
                <span>📲</span> பலனை பகிர்க (WhatsApp Share)
              </button>
            </div>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    containers.forEach(c => { c.innerHTML = html; });
  }

  window.PGAstroEngine = {
    evaluateHoroscopeQA: evaluateHoroscopeQA,
    renderHoroscopeQA: renderHoroscopeQA,
    evaluateCurrentChart: evaluateCurrentChart
  };
})();
