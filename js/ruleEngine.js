/**
 * PG ASTROLOGER - RULE APPLICABILITY ENGINE (ruleEngine.js)
 * 
 * 1. Database (rules.js / combinations.js / subhathuvam.js): Static rule definitions & templates.
 * 2. Rule Engine (ruleEngine.js): Evaluates ACTUAL horoscope planetary conditions & determines Rule Applicability.
 */

window.PGAstroRuleEngine = (function () {

  /**
   * Helper to compute Navamsa (D9) Sign ID from D1 Rasi ID and degree
   */
  function getNavamsaRasiId(rasiId, degree) {
    const totalLon = (rasiId - 1) * 30 + (parseFloat(degree) || 15.0);
    return (Math.floor(totalLon / (10 / 3)) % 12) + 1;
  }

  /**
   * Evaluate if a specific rule applies to the given horoscope chart context.
   * 
   * @param {Object} rule - Static rule object from rules database
   * @param {Object} context - Calculated horoscope context (D1, D9, Bhavas, Subhathuvam, Dasa-Bhukti, Transits)
   * @returns {Object} { isApplicable: boolean, matchScore: number, matchReasons: string[] }
   */
  function evaluateRuleApplicability(rule, context) {
    if (!rule || !context) return { isApplicable: false, matchScore: 0, matchReasons: [] };

    let matchScore = 0;
    const matchReasons = [];
    const conditions = rule.conditions || {};

    const placedPlanets = context.placedPlanets || [];
    const planetMap = {};
    placedPlanets.forEach(p => { planetMap[p.planet] = p; });

    const houseLords = context.houseLords || {}; // houseNo (1..12) -> planetName
    const subhaScores = context.subhathuvamScores || (context.subhathuvamResult?.scores) || {};
    const curDasa = context.currentDasa || (context.dashaResult?.currentBhukti) || {};
    const gender = (context.nativeGender || context.nativeInfo?.gender || 'male').toLowerCase();
    const lagnaId = context.lagnaRasiId || 1;

    // 1. Gender Requirement Check
    if (conditions.genderRequirement && conditions.genderRequirement !== 'any') {
      if (conditions.genderRequirement.toLowerCase() !== gender) {
        return { isApplicable: false, matchScore: 0, matchReasons: ["Gender mismatch"] };
      }
    }

    // 2. Planets in Specific Houses Check
    if (conditions.planetsInHouses && Array.isArray(conditions.planetsInHouses)) {
      let matchCount = 0;
      conditions.planetsInHouses.forEach(req => {
        const pl = planetMap[req.planet];
        if (pl && pl.house === req.house) {
          matchCount++;
          matchScore += 20;
          matchReasons.push(`${req.planet} ${req.house}-ஆம் பாவத்தில் அமர்ந்துள்ளது`);
        }
      });
      if (conditions.strictMatch && matchCount < conditions.planetsInHouses.length) {
        return { isApplicable: false, matchScore: 0, matchReasons: ["Strict planet-in-house requirement not met"] };
      }
    }

    // 3. House Lords in Target Houses Check
    if (conditions.houseLordsInHouses && Array.isArray(conditions.houseLordsInHouses)) {
      conditions.houseLordsInHouses.forEach(req => {
        const lordPlanet = houseLords[req.lordOfHouse];
        const pl = planetMap[lordPlanet];
        if (pl && pl.house === req.targetHouse) {
          matchScore += 25;
          matchReasons.push(`${req.lordOfHouse}-ஆம் பாவாதிபதி ${lordPlanet} ${req.targetHouse}-ஆம் பாவத்தில் அமர்ந்துள்ளது`);
        }
      });
    }

    // 4. Planet Conjunctions Check (சேர்க்கை)
    if (conditions.conjunctions && Array.isArray(conditions.conjunctions)) {
      conditions.conjunctions.forEach(req => {
        const p1 = planetMap[req.planetA];
        const p2 = planetMap[req.planetB];
        if (p1 && p2 && p1.rasiId === p2.rasiId) {
          matchScore += 25;
          matchReasons.push(`${req.planetA} + ${req.planetB} இணைவு (${p1.house}-ஆம் பாவம்)`);
        }
      });
    }

    // 5. Aspects Check (பார்வை)
    if (conditions.aspects && Array.isArray(conditions.aspects)) {
      conditions.aspects.forEach(req => {
        const p1 = planetMap[req.aspectingPlanet];
        const p2 = planetMap[req.targetPlanet];
        if (p1 && p2) {
          const dist = ((p2.rasiId - p1.rasiId + 12) % 12);
          // Standard 7th aspect, or special aspects for Saturn (3,7,10), Mars (4,7,8), Jupiter (5,7,9)
          let hasAspect = (dist === 6); // 7th house aspect
          if (p1.planet === "குரு" && (dist === 4 || dist === 8)) hasAspect = true; // 5th & 9th aspect
          if (p1.planet === "செவ்வாய்" && (dist === 3 || dist === 7)) hasAspect = true; // 4th & 8th aspect
          if (p1.planet === "சனி" && (dist === 2 || dist === 9)) hasAspect = true; // 3rd & 10th aspect

          if (hasAspect) {
            matchScore += 15;
            matchReasons.push(`${req.aspectingPlanet} பகவான் ${req.targetPlanet} மீது பார்வை செலுத்துகிறார்`);
          }
        }
      });
    }

    // 6. Subhathuvam Threshold Check (சுபத்துவ புள்ளிகள்)
    if (conditions.subhathuvamMin && Array.isArray(conditions.subhathuvamMin)) {
      conditions.subhathuvamMin.forEach(req => {
        const scObj = subhaScores[req.planet];
        const scVal = (scObj && scObj.netScore !== undefined) ? scObj.netScore : (typeof scObj === 'number' ? scObj : 0);
        if (scVal >= req.minScore) {
          matchScore += 15;
          matchReasons.push(`${req.planet} சுபத்துவ புள்ளிகள் (${scVal.toFixed(1)}) >= ${req.minScore}`);
        }
      });
    }

    // 7. D9 Navamsa & Vargottama Check (நவாம்சம் & வர்க்கோத்தமம்)
    if (conditions.d9Conditions && Array.isArray(conditions.d9Conditions)) {
      conditions.d9Conditions.forEach(req => {
        const pl = planetMap[req.planet];
        if (pl) {
          const navRasiId = getNavamsaRasiId(pl.rasiId, pl.degree);
          if (req.requireVargottama && navRasiId === pl.rasiId) {
            matchScore += 30;
            matchReasons.push(`${req.planet} வர்க்கோத்தம சுப பலம் பெற்றுள்ளது (D1=D9)`);
          }
          if (req.targetNavRasiId && navRasiId === req.targetNavRasiId) {
            matchScore += 15;
            matchReasons.push(`${req.planet} நவாம்சத்தில் ${navRasiId}-ல் அமர்ந்துள்ளது`);
          }
        }
      });
    }

    // 8. Active Dasa-Bhukti Synergy Check (நடப்பு தசா-புக்தி)
    if (conditions.dasaBhuktiConnection && Array.isArray(conditions.dasaBhuktiConnection)) {
      conditions.dasaBhuktiConnection.forEach(req => {
        const mahaLord = curDasa.mahaLord || curDasa.lord;
        const bhuktiLord = curDasa.bhuktiLord || curDasa.lord;
        if (mahaLord === req.planet || bhuktiLord === req.planet) {
          matchScore += 20;
          matchReasons.push(`நடப்பு தசா/புக்தி அதிபதியாக ${req.planet} இயங்குகிறது`);
        }
      });
    }

    // 9. Transit Saturn Aspect on 7th Lord Check (கோச்சார சனி 7-ஆம் அதிபதி மீதான சஞ்சாரம்/பார்வை)
    if (conditions.saturnTransitAspect7thLord || conditions.saturnTransitConnection) {
      const transitSaturnRasiId = context.transitSaturnRasiId || 11; // Default Aquarius (கும்பம்)
      const lord7Name = houseLords[7] || "புதன்";
      const lord7Planet = planetMap[lord7Name];
      if (lord7Planet) {
        const lord7RasiId = lord7Planet.rasiId;
        const dist = ((lord7RasiId - transitSaturnRasiId + 12) % 12);
        // dist 0: Conjunction (இணைவு - 1st)
        // dist 2: 3rd aspect (3-ஆம் பார்வை)
        // dist 6: 7th aspect (7-ஆம் பார்வை)
        // dist 9: 10th aspect (10-ஆம் பார்வை)
        if (dist === 0 || dist === 2 || dist === 6 || dist === 9) {
          const aspectName = dist === 0 ? "இணைவு (1st)" : (dist === 2 ? "3-ஆம் பார்வை" : (dist === 6 ? "7-ஆம் பார்வை" : "10-ஆம் பார்வை"));
          matchScore += 40;
          matchReasons.push(`கோச்சார சனி பகவான் 7-ஆம் அதிபதி ${lord7Name} மீது தனது ${aspectName} செலுத்துகிறார்`);
        }
      }
    }

    // 10. 3, 7, 11 Kama Trikona Dasa-Bhukti-Antharam Synergy Check (Rule 2)
    if (conditions.kamaTrikonaConnection || conditions.houses3_7_11_Connection) {
      const lord3 = houseLords[3];
      const lord7 = houseLords[7];
      const lord11 = houseLords[11];
      const mahaLord = curDasa.mahaLord || curDasa.lord;
      const bhuktiLord = curDasa.bhuktiLord || curDasa.lord;
      const antharamLord = curDasa.antharamLord || "சுக்கிரன்";

      const involvedLords = [mahaLord, bhuktiLord, antharamLord].filter(Boolean);
      const connects3 = involvedLords.some(p => p === lord3 || (planetMap[p] && planetMap[p].house === 3));
      const connects7 = involvedLords.some(p => p === lord7 || (planetMap[p] && planetMap[p].house === 7) || p === "சுக்கிரன்");
      const connects11 = involvedLords.some(p => p === lord11 || (planetMap[p] && planetMap[p].house === 11));

      if (connects3 || connects7 || connects11) {
        matchScore += 45;
        matchReasons.push(`தசா-புக்தி-அந்தரம் (${mahaLord || 'தசா'}-${bhuktiLord || 'புக்தி'}-${antharamLord || 'அந்தரம்'}) 3, 7, 11 காம திரிகோண பாவ தொடர்புகளைப் பெற்றுள்ளது`);
      }
    }

    // 11. Nadi Astrology Job Rule: Gocharam Rahu 2,6,10 Nadi Rule (1,5,9 Trikonam to 2,6,10 Bhavas or 2,6,10 Lords)
    if (conditions.nadiRahuJobRule || conditions.rahuTransit2_6_10_Connection) {
      const transitRahuRasiId = context.transitRahuRasiId || 12; // Default Pisces (மீனம்)
      const lord2Name = houseLords[2];
      const lord6Name = houseLords[6];
      const lord10Name = houseLords[10];

      const house2Rasi = ((lagnaId - 1 + 2 - 1) % 12) + 1;
      const house6Rasi = ((lagnaId - 1 + 6 - 1) % 12) + 1;
      const house10Rasi = ((lagnaId - 1 + 10 - 1) % 12) + 1;

      const targetBhavas = [
        { house: 2, rasi: house2Rasi, label: "2-ஆம் பாவம் (தனம்/வருமானம்)" },
        { house: 6, rasi: house6Rasi, label: "6-ஆம் பாவம் (உத்தியோகம்/வேலை)" },
        { house: 10, rasi: house10Rasi, label: "10-ஆம் பாவம் (ஜீவன/தொழில்)" }
      ];

      let rahuBhavaMatch = false;
      let rahuLordMatch = false;

      // Check Rahu transit in 1, 5, 9 Trikonam to 2, 6, 10 Bhavas
      targetBhavas.forEach(b => {
        const dist = ((transitRahuRasiId - b.rasi + 12) % 12);
        if (dist === 0 || dist === 4 || dist === 8) {
          rahuBhavaMatch = true;
          const trikLabel = dist === 0 ? "1-ஆம் பாவம் (நேரடி சஞ்சாரம்)" : (dist === 4 ? "5-ஆம் திரிகோணம்" : "9-ஆம் திரிகோணம்");
          matchScore += 25;
          matchReasons.push(`கோச்சார ராகு பகவான் ${b.label}-க்கு ${trikLabel} தொட்டு சஞ்சரிக்கிறார்`);
        }
      });

      // Check Rahu transit in 1, 5, 9 Trikonam over 2, 6, 10 Lords (Athipathi)
      [
        { house: 2, name: lord2Name },
        { house: 6, name: lord6Name },
        { house: 10, name: lord10Name }
      ].forEach(lordObj => {
        if (lordObj.name && planetMap[lordObj.name]) {
          const lordRasi = planetMap[lordObj.name].rasiId;
          const dist = ((transitRahuRasiId - lordRasi + 12) % 12);
          if (dist === 0 || dist === 4 || dist === 8) {
            rahuLordMatch = true;
            const trikLabel = dist === 0 ? "இணைவு (Direct Touch)" : (dist === 4 ? "5-ஆம் திரிகோண பார்வை" : "9-ஆம் திரிகோண பார்வை");
            matchScore += 25;
            matchReasons.push(`கோச்சார ராகு ${lordObj.house}-ஆம் அதிபதி ${lordObj.name} மீது ${trikLabel} சஞ்சாரம் செய்கிறார்`);
          }
        }
      });

      if (rahuBhavaMatch || rahuLordMatch) {
        matchScore += 20;
      }
    }

    // 12. Compassionate Ground Government Job Rule Check
    if (conditions.compassionateGroundRule) {
      const lord9 = houseLords[9];
      const lord10 = houseLords[10];
      const lord1 = houseLords[1];
      const sunPl = planetMap["சூரியன்"];
      const lord9Pl = planetMap[lord9];
      if ((sunPl && (sunPl.isExalted || sunPl.house === 5 || sunPl.house === 9 || sunPl.house === 10)) || (lord9Pl && lord9Pl.house === 5)) {
        matchScore += 45;
        matchReasons.push(`9-ஆம் அதிபதி/சூரியன் சுபத்துவம் பெற்று தந்தையின் அரசு பணி வாரிசு / கருணை பணி யோகம் கொண்டுள்ளது`);
      }
    }

    // 13. Saturn in 6th House Railway & PSU Job Rule Check
    if (conditions.saturnIn6thHouse) {
      const satPl = planetMap["சனி"];
      if (satPl && (satPl.house === 6 || (satPl.rasiId && ((satPl.rasiId - lagnaId + 12) % 12 + 1) === 6))) {
        matchScore += 50;
        matchReasons.push(`சனி பகவான் 6-ஆம் பாவகத்தில் அமர்ந்து உத்தியோக & ரயில்வே (Railways/PSU) பணி யோகம் தருகிறார்`);
      }
    }

    // 14. Rahu in 6th House Competitive Recruitment Rule Check
    if (conditions.rahuIn6thHouse) {
      const rahuPl = planetMap["ராகு"];
      if (rahuPl && (rahuPl.house === 6 || (rahuPl.rasiId && ((rahuPl.rasiId - lagnaId + 12) % 12 + 1) === 6))) {
        matchScore += 45;
        matchReasons.push(`ராகு பகவான் 6-ஆம் பாவகத்தில் அமர்ந்து போட்டித் தேர்வு வெற்றி & பணி தேர்ச்சி யோகம் தருகிறார்`);
      }
    }

    // 15. Second Marriage (2nd & 9th House) Rule Check
    if (conditions.secondMarriageRule) {
      const lord2 = houseLords[2];
      const lord9 = houseLords[9];
      const lord11 = houseLords[11];
      const mahaLord = curDasa.mahaLord || curDasa.lord;
      const bhuktiLord = curDasa.bhuktiLord || curDasa.lord;

      if (mahaLord === lord2 || mahaLord === lord9 || mahaLord === lord11 || bhuktiLord === lord2 || bhuktiLord === lord9 || bhuktiLord === lord11 || mahaLord === "சனி" || bhuktiLord === "சுக்கிரன்") {
        matchScore += 40;
        matchReasons.push(`2, 9, 11-ஆம் பாவக தசா-புக்தி தொடர்புகளால் இரண்டாம் திருமண சுப யோகம் கைகூடுகிறது`);
      }
    }

    // 16. 6th House Dispute & Legal Settlement Rule Check
    if (conditions.legalSettlementRule) {
      const lord6 = houseLords[6];
      const lord6Pl = planetMap[lord6];
      const venusPl = planetMap["சுக்கிரன்"];
      if ((lord6Pl && lord6Pl.house === 6) || (venusPl && venusPl.house === 6)) {
        matchScore += 40;
        matchReasons.push(`6-ஆம் அதிபதி 6-ல் ஆட்சி பெற்று சட்ட ரீதியான தீர்வு & காவல் துறை/நீதிமன்ற மீட்பு யோகம் தருகிறார்`);
      }
    }

    // 17. Primary Subhathuvam Profession Rule Check (முதன்மை சுபத்துவ கிரக தொழில்)
    if (conditions.primarySubhathuvamProfessionRule) {
      let maxScore = -99;
      let topSubhaPlanet = null;
      Object.keys(subhaScores).forEach(pName => {
        const scObj = subhaScores[pName];
        const scVal = (scObj && scObj.netScore !== undefined) ? scObj.netScore : (typeof scObj === 'number' ? scObj : 0);
        if (scVal > maxScore) {
          maxScore = scVal;
          topSubhaPlanet = pName;
        }
      });
      if (topSubhaPlanet && maxScore >= 1.0) {
        matchScore += 50;
        matchReasons.push(`ஜாதகத்தில் ${topSubhaPlanet} பகவான் முதன்மை சுபத்துவ பலம் (+${maxScore.toFixed(1)}) பெற்றுள்ளதால், ${topSubhaPlanet}-ன் தொழில் & கல்வியே உச்சபட்ச யோகத்தையும் தனலாபத்தையும் தரும்`);
      }
    }

    // 18. Speech Profession (2nd & 10th Connection) Check
    if (conditions.speechProfessionRule) {
      const lord10 = houseLords[10];
      const lord2 = houseLords[2];
      const lord10Pl = planetMap[lord10];
      const lord2Pl = planetMap[lord2];
      if ((lord10Pl && lord10Pl.house === 2) || (lord2Pl && lord2Pl.house === 10)) {
        matchScore += 45;
        matchReasons.push(`10-ஆம் அதிபதி ${lord10} 2-ஆம் பாவகத்துடனும், 2-ஆம் அதிபதி 10-ஆம் பாவகத்துடனும் தொடர்பு கொண்டு வாக்கினால் ஜீவிக்கும் (பேச்சுத் துறை) யோகம் தருகிறார்`);
      }
    }

    // 19. 6th Lord in 10th House Service & Leadership Rule Check
    if (conditions.lord6In10thRule) {
      const lord6 = houseLords[6];
      const lord6Pl = planetMap[lord6];
      if (lord6Pl && lord6Pl.house === 10) {
        matchScore += 45;
        matchReasons.push(`6-ஆம் அதிபதி ${lord6} 10-ஆம் பாவகத்தில் அமர்ந்து உத்தியோகச் சேர்க்கை & மேலாண்மை/தலைமைப் பதவி யோகம் தருகிறார்`);
      }
    }

    // 20. Rahu in 10th House Career Fluctuations Rule Check
    if (conditions.rahu10thHouseRule) {
      const rahuPl = planetMap["ராகு"];
      const lord10 = houseLords[10];
      const lord10Pl = planetMap[lord10];
      if ((rahuPl && rahuPl.house === 10) || (rahuPl && lord10Pl && rahuPl.rasiId === lord10Pl.rasiId)) {
        matchScore += 40;
        matchReasons.push(`ராகு பகவான் 10-ஆம் பாவகத்தில் அல்லது 10-ஆம் அதிபதி ${lord10}-னுடன் இணைந்து தொழில் மாற்ற சுழற்சி தந்தாலும், ராகு தசையில் IT/வெளிநாட்டு தொழில் வளர்ச்சி தருகிறார்`);
      }
    }

    // 21. Foreign Career (10-12 Parivarthana / 8-12 Connections) Check
    if (conditions.foreignCareerRule) {
      const lord10 = houseLords[10];
      const lord12 = houseLords[12];
      const lord8 = houseLords[8];
      const lord10Pl = planetMap[lord10];
      const lord12Pl = planetMap[lord12];
      const isParivarthana = (lord10Pl && lord10Pl.house === 12) && (lord12Pl && lord12Pl.house === 10);
      const curMaha = curDasa.mahaLord || curDasa.lord;
      if (isParivarthana || curMaha === "ராகு" || curMaha === "கேது" || curMaha === lord12 || curMaha === lord8) {
        matchScore += 45;
        matchReasons.push(`10, 12-ஆம் பாவக பரிவர்த்தனை / 8, 12-ஆம் பாவ தொடர்புகளால் நீண்டகால வெளிநாட்டு உத்தியோகம் & அயல்நாட்டு தனலாப யோகம் கைகூடுகிறது`);
      }
    }

    // 22. Stock Market & Trading Rule (6th lord in 11th, 11th lord in 10th with Lagna Lord)
    if (conditions.stockMarketTradingRule) {
      const lord6 = houseLords[6];
      const lord11 = houseLords[11];
      const lord1 = houseLords[1];
      const lord6Pl = planetMap[lord6];
      const lord11Pl = planetMap[lord11];
      const lord1Pl = planetMap[lord1];
      if ((lord6Pl && lord6Pl.house === 11) && (lord11Pl && lord11Pl.house === 10)) {
        matchScore += 50;
        matchReasons.push(`6-ஆம் அதிபதி 11-ல் அமர்ந்து 11-ஆம் அதிபதி 10-ல் அமர்வதால், பங்குச் சந்தை (Stock Market) & ஸ்பெகுலேஷன் வர்த்தகத்தில் பெரும் லாப யோகம் தருகிறார்`);
      }
    }

    // 23. Weak Lagna Lord & Salaried Job Rule Check
    if (conditions.weakLagnaStrong10thRule) {
      const lord1 = houseLords[1];
      const lord10 = houseLords[10];
      const lord1Pl = planetMap[lord1];
      const lord10Pl = planetMap[lord10];
      if (lord1Pl && (lord1Pl.isDebilitated || lord1Pl.house === 6 || lord1Pl.house === 8 || lord1Pl.house === 12)) {
        matchScore += 40;
        matchReasons.push(`லக்னாதிபதி மறைவு/பலவீனத்தால் சொந்த தொழில் தவிர்த்து, நிறுவனங்களில் உத்தியோகம் புரிந்து மாதச் சம்பளம் ஈட்டுவதே நிலைத்த யோகம் தரும்`);
      }
    }

    const minRequiredScore = rule.minApplicableScore || 15;
    const isApplicable = matchScore >= minRequiredScore;

    return {
      isApplicable,
      matchScore,
      matchReasons
    };
  }

  /**
   * Filter and return ONLY the rules that strictly apply to the given horoscope.
   * 
   * @param {Array} ruleDatabase - Array of rule definitions from rules database
   * @param {Object} context - Calculated horoscope context
   * @param {String} categoryFilter - Optional category filter (e.g. 'marriage', 'job')
   * @returns {Array} Array of matched rules with scores and reasons
   */
  function filterApplicableRules(ruleDatabase, context, categoryFilter = null) {
    if (!Array.isArray(ruleDatabase) || !context) return [];

    const applicableResults = [];

    ruleDatabase.forEach(rule => {
      if (categoryFilter && rule.category !== categoryFilter) return;

      const evalResult = evaluateRuleApplicability(rule, context);
      if (evalResult.isApplicable) {
        applicableResults.push({
          rule,
          matchScore: evalResult.matchScore,
          matchReasons: evalResult.matchReasons
        });
      }
    });

    // Sort by highest matchScore descending
    applicableResults.sort((a, b) => b.matchScore - a.matchScore);

    return applicableResults;
  }

  return {
    evaluateRuleApplicability,
    filterApplicableRules
  };
})();
