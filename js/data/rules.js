/**
 * PG ASTROLOGER - ASTRO RULES DATABASE (rules.js)
 * 
 * Static AstroRule definitions across categories:
 * - Marriage (திருமணம் & தாம்பத்திய யோகம்)
 * - Education (கல்வி & படிப்பு)
 * - Job / Career (தொழில் & உத்தியோகம்)
 * - Child (புத்திர பாக்கியம்)
 * - Wealth & Property (தனம் & சொத்து யோகம்)
 * - Health (ஆரோக்கியம்)
 */

window.ASTRO_RULES = [
  // =========================================================================
  // MARRIAGE RULES (திருமண விதிகள்)
  // =========================================================================
  {
    id: "rule_saturn_transit_7th_lord",
    category: "marriage",
    name: "கோச்சார சனி பகவான் சஞ்சாரம் / பார்வை மூலம் திருமண யோகம் (Rule 1: Saturn Transit over/aspecting 7th Lord)",
    conditions: {
      saturnTransitAspect7thLord: true
    },
    weight: 95,
    minApplicableScore: 15,
    verdictTamil: "ஒருவருக்கு 7-ஆம் அதிபதி மீது சனி பகவான் பயணிக்கும் காலத்திலோ (இணைவு - 1st) அல்லது தனது 3, 7, 10 பார்வைகளால் நோக்கும் போதோ திருமணம் நடைபெறும். கோச்சார சனி பகவான் 7-ஆம் அதிபதி மீது சஞ்சாரம் / பார்வையைச் செலுத்துவதால் சுப விவாக யோகம் உறுதியாகக் கைகூடுகிறது."
  },
  {
    id: "rule_kama_trikona_3_7_11_dasa_bhukti",
    category: "marriage",
    name: "3, 7, 11 பாவ தசா-புக்தி-அந்தர தொடர்பு திருமண யோகம் (Rule 2: Kama Trikona Connection)",
    conditions: {
      kamaTrikonaConnection: true
    },
    weight: 95,
    minApplicableScore: 15,
    verdictTamil: "3, 7, 11 பாவ தசா-புக்தி-அந்தர தொடர்பு: 3-ஆம் பாவம் (உடன்படிக்கை/முயற்சி), 7-ஆம் பாவம் (களத்திரம்/விவாகம்), 11-ஆம் பாவம் (மங்கல ஆசை பூர்த்தி) ஆகிய பாவ தொடர்புகள் இல்லாமல் திருமணம் நடைபெறாது. தசா-புக்தி-அந்தரத்தில் 3, 7, 11 பாவ தொடர்புகள் கைகூடி விவாக யோகம் உறுதியாகிறது."
  },

  // =========================================================================
  // EDUCATION RULES (கல்வி விதிகள்)
  // =========================================================================
  {
    id: "rule_education_higher_mercury_jupiter",
    category: "education",
    name: "புதன்-குரு சுபத்துவம் + 4, 5-ஆம் அதிபதிகள் பலம்",
    conditions: {
      subhathuvamMin: [{ planet: "புதன்", minScore: 1.5 }, { planet: "குரு", minScore: 1.0 }],
      houseLordsInHouses: [{ lordOfHouse: 4, targetHouse: 5 }, { lordOfHouse: 5, targetHouse: 4 }]
    },
    weight: 85,
    minApplicableScore: 15,
    verdictTamil: "வித்யா காரகன் புதன் மற்றும் குருவின் சுப பலத்தால் பட்டப்படிப்பு மற்றும் உயர்கல்வி சாதனை யோகம் உண்டாகும்."
  },

  // =========================================================================
  // JOB / CAREER RULES (உத்தியோக விதிகள்)
  // =========================================================================
  {
    id: "rule_job_10th_lord_saturn",
    category: "job",
    name: "10-ஆம் பாவாதிபதி + சனி சுபத்துவம்",
    conditions: {
      subhathuvamMin: [{ planet: "சனி", minScore: 1.0 }],
      houseLordsInHouses: [{ lordOfHouse: 10, targetHouse: 10 }, { lordOfHouse: 10, targetHouse: 6 }]
    },
    weight: 85,
    minApplicableScore: 15,
    verdictTamil: "10-ஆம் அதிபதி மற்றும் ஜீவனகாரகன் சனியின் சுபத்துவத்தால் நிலையான வேலை வாய்ப்பு மற்றும் தொழில் அபிவிருத்தி உண்டாகும்."
  },
  {
    id: "rule_job_nadi_gocharam_rahu_2_6_10",
    category: "job",
    name: "நாடி ஜோதிட கோச்சார ராகு 2,6,10 ஜீவன யோக விதி (Nadi Gocharam Rahu 2,6,10 Rule)",
    conditions: {
      nadiRahuJobRule: true
    },
    weight: 95,
    minApplicableScore: 15,
    verdictTamil: "நாடி ஜோதிட முறைப்படி: கோச்சார ராகு பகவான் ஜீவன/தன/உத்தியோக ஸ்தானங்களான 2, 6, 10-ஆம் திரிகோண பாவங்கள் (1, 5, 9 திரிகோணம்) அல்லது 2, 6, 10-ஆம் பாவாதிபதிகள் (அதிபதிகள்) மீது சஞ்சரிக்கும் காலகட்டத்தில் புதிய வேலை வாய்ப்பு (Job Arrival) நிச்சயமாகக் கைகூடும்."
  }
];
