/**
 * PG ASTROLOGER - ASHTAKAVARGA & SHODHYA PINDAM ENGINE (js/ashtakavargaEngine.js)
 * Implements:
 * 1. Classical Parashara Bhinna Ashtakavarga (BAV) for all 7 Planets (Total: 337 bindus)
 * 2. Trikona Shodhana (Trinal Reduction) - Board (Thanikasalam/MUMTI) & Classical Parashara
 * 3. Ekadhipatya Shodhana (Single Lordship Reduction) - Board & Classical
 * 4. Rasi Pindam (Sign Contribution) using fixed Rasi Gunakaras
 * 5. Graha Pindam (Planetary Contribution) using fixed Graha Gunakaras
 * 6. Shodhya Pindam (Purified Unit = Rasi Pindam + Graha Pindam)
 * 7. Sarvashtakavarga (SAV 337 Points) Master Grid & Transit Timing
 * 8. 3x South Indian Interactive Charts rendering
 * 
 * Supports the exact classroom example from whiteboard:
 * Native: 3-4-1977 07:27 AM Karur -> Mars Ashtakavarga:
 * Aadhi Paral (39) -> Trikona (27) -> Ekadhipatya (24) -> Rasi Pinda (322) + Graha Pinda (90) = Shodhya Pinda (412)
 */

window.PGAstro = window.PGAstro || {};

(function() {
  // 1. Classical Parashara BAV Favorable House Rules
  const BAV_RULES = {
    Sun: {
      Sun: [1, 2, 4, 7, 8, 9, 10, 11],
      Moon: [3, 6, 10, 11],
      Mars: [1, 2, 4, 7, 8, 9, 10, 11],
      Mercury: [3, 5, 6, 9, 10, 11, 12],
      Jupiter: [5, 6, 9, 11],
      Venus: [6, 7, 12],
      Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
      Lagna: [3, 4, 6, 10, 11, 12]
    },
    Moon: {
      Sun: [3, 6, 7, 8, 10, 11],
      Moon: [1, 3, 6, 7, 10, 11],
      Mars: [2, 3, 5, 6, 9, 10, 11],
      Mercury: [1, 3, 4, 5, 7, 8, 10, 11],
      Jupiter: [1, 4, 7, 8, 10, 11, 12],
      Venus: [3, 4, 5, 7, 9, 10, 11],
      Saturn: [3, 5, 6, 11],
      Lagna: [3, 6, 10, 11]
    },
    Mars: {
      Sun: [3, 5, 6, 10, 11],
      Moon: [3, 6, 11],
      Mars: [1, 2, 4, 7, 8, 10, 11],
      Mercury: [3, 5, 6, 11],
      Jupiter: [6, 10, 11, 12],
      Venus: [6, 8, 11, 12],
      Saturn: [1, 4, 7, 8, 9, 10, 11],
      Lagna: [1, 3, 6, 10, 11]
    },
    Mercury: {
      Sun: [5, 6, 9, 11, 12],
      Moon: [2, 4, 6, 8, 10, 11],
      Mars: [1, 2, 4, 7, 8, 9, 10, 11],
      Mercury: [1, 3, 5, 6, 9, 10, 11, 12],
      Jupiter: [6, 8, 11, 12],
      Venus: [1, 2, 3, 4, 5, 8, 9, 11],
      Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
      Lagna: [1, 2, 4, 6, 8, 10, 11]
    },
    Jupiter: {
      Sun: [1, 2, 3, 4, 7, 8, 9, 10, 11],
      Moon: [2, 5, 7, 9, 11],
      Mars: [1, 2, 4, 7, 8, 10, 11],
      Mercury: [1, 2, 4, 5, 6, 9, 10, 11],
      Jupiter: [1, 2, 3, 4, 7, 8, 10, 11],
      Venus: [2, 5, 6, 9, 10, 11],
      Saturn: [3, 5, 6, 12],
      Lagna: [1, 2, 4, 5, 6, 7, 9, 10, 11]
    },
    Venus: {
      Sun: [8, 11, 12],
      Moon: [1, 2, 3, 4, 5, 8, 9, 11, 12],
      Mars: [3, 5, 6, 9, 11, 12],
      Mercury: [3, 5, 6, 9, 11],
      Jupiter: [5, 8, 9, 10, 11],
      Venus: [1, 2, 3, 4, 5, 8, 9, 10, 11],
      Saturn: [3, 4, 5, 8, 9, 10, 11],
      Lagna: [1, 2, 3, 4, 5, 8, 9, 11]
    },
    Saturn: {
      Sun: [1, 2, 4, 7, 8, 10, 11],
      Moon: [3, 6, 11],
      Mars: [3, 5, 6, 10, 11, 12],
      Mercury: [6, 8, 9, 10, 11, 12],
      Jupiter: [5, 6, 11, 12],
      Venus: [6, 11, 12],
      Saturn: [3, 5, 6, 11],
      Lagna: [1, 3, 4, 6, 10, 11]
    }
  };

  // Fixed Multipliers (பெருக்கல் எண்கள்)
  const RASI_GUNAKARAS = {
    1: 7,   // Mesha (மேஷம்)
    2: 10,  // Vrishabha (ரிஷபம்)
    3: 8,   // Mithuna (மிதுனம்)
    4: 4,   // Kataka (கடகம்)
    5: 10,  // Simha (சிம்மம்)
    6: 5,   // Kanya (கன்னி)
    7: 7,   // Tula (துலாம்)
    8: 8,   // Vrischika (விருச்சிகம்)
    9: 9,   // Dhanu (தனுசு)
    10: 5,  // Makara (மகரம்)
    11: 11, // Kumbha (கும்பம்)
    12: 12  // Meena (மீனம்)
  };

  const GRAHA_GUNAKARAS = {
    Sun: 5,
    Moon: 5,
    Mars: 8,
    Mercury: 5,
    Jupiter: 10,
    Venus: 7,
    Saturn: 5
  };

  const PLANET_KEYS = ["Mars", "Sun", "Moon", "Mercury", "Jupiter", "Venus", "Saturn"];

  const PLANET_META = {
    Sun: { tamil: "சூரியன்", english: "Sun", icon: "☀️", pts: 48, short: "சூ" },
    Moon: { tamil: "சந்திரன்", english: "Moon", icon: "🌙", pts: 49, short: "சந்" },
    Mars: { tamil: "செவ்வாய்", english: "Mars", icon: "♂", pts: 39, short: "செவ்" },
    Mercury: { tamil: "புதன்", english: "Mercury", icon: "☿", pts: 54, short: "புத" },
    Jupiter: { tamil: "குரு", english: "Jupiter", icon: "♃", pts: 56, short: "குரு" },
    Venus: { tamil: "சுக்கிரன்", english: "Venus", icon: "♀", pts: 52, short: "சுக்" },
    Saturn: { tamil: "சனி", english: "Saturn", icon: "♄", pts: 39, short: "சனி" }
  };

  const RASI_NAMES_TAMIL = {
    1: "மேஷம்", 2: "ரிஷபம்", 3: "மிதுனம்", 4: "கடகம்",
    5: "சிம்மம்", 6: "கன்னி", 7: "துலாம்", 8: "விருச்சிகம்",
    9: "தனுசு", 10: "மகரம்", 11: "கும்பம்", 12: "மீனம்"
  };

  const RASI_LORDS = {
    1: "செவ்வாய்", 2: "சுக்கிரன்", 3: "புதன்", 4: "சந்திரன்",
    5: "சூரியன்", 6: "புதன்", 7: "சுக்கிரன்", 8: "செவ்வாய்",
    9: "குரு", 10: "சனி", 11: "சனி", 12: "குரு"
  };

  // South Indian Grid CSS Areas
  const SOUTH_AREAS = {
    12: "grid-area: 1 / 1 / 2 / 2;", // மீனம்
    1:  "grid-area: 1 / 2 / 2 / 3;", // மேஷம்
    2:  "grid-area: 1 / 3 / 2 / 4;", // ரிஷபம்
    3:  "grid-area: 1 / 4 / 2 / 5;", // மிதுனம்
    4:  "grid-area: 2 / 4 / 3 / 5;", // கடகம்
    5:  "grid-area: 3 / 4 / 4 / 5;", // சிம்மம்
    6:  "grid-area: 4 / 4 / 5 / 5;", // கன்னி
    7:  "grid-area: 4 / 3 / 5 / 4;", // துலாம்
    8:  "grid-area: 4 / 2 / 5 / 3;", // விருச்சிகம்
    9:  "grid-area: 4 / 1 / 5 / 2;", // தனுசு
    10: "grid-area: 3 / 1 / 4 / 2;", // மகரம்
    11: "grid-area: 2 / 1 / 3 / 2;"  // கும்பம்
  };

  // 27 Nakshatras with Vimshottari Lord and Trinal Groups (1 to 9)
  const NAKSHATRA_DATA = [
    { id: 1, name: "அசுவினி", english: "Ashwini", lord: "கேது", rasis: "மேஷம் (4 பாதங்கள்)", rasiIds: [1] },
    { id: 2, name: "பரணி", english: "Bharani", lord: "சுக்கிரன்", rasis: "மேஷம் (4 பாதங்கள்)", rasiIds: [1] },
    { id: 3, name: "கார்த்திகை", english: "Krittika", lord: "சூரியன்", rasis: "மேஷம் (1 பாதம்), ரிஷபம் (2,3,4 பாதங்கள்)", rasiIds: [1, 2] },
    { id: 4, name: "ரோகிணி", english: "Rohini", lord: "சந்திரன்", rasis: "ரிஷபம் (4 பாதங்கள்)", rasiIds: [2] },
    { id: 5, name: "மிருகசீரிஷம்", english: "Mrigashira", lord: "செவ்வாய்", rasis: "ரிஷபம் (1,2 பாதங்கள்), மிதுனம் (3,4 பாதங்கள்)", rasiIds: [2, 3] },
    { id: 6, name: "திருவாதிரை", english: "Ardra", lord: "ராகு", rasis: "மிதுனம் (4 பாதங்கள்)", rasiIds: [3] },
    { id: 7, name: "புனர்பூசம்", english: "Punarvasu", lord: "குரு", rasis: "மிதுனம் (1,2,3 பாதங்கள்), கடகம் (4 பாதம்)", rasiIds: [3, 4] },
    { id: 8, name: "பூசம்", english: "Pushya", lord: "சனி", rasis: "கடகம் (4 பாதங்கள்)", rasiIds: [4] },
    { id: 9, name: "ஆயில்யம்", english: "Ashlesha", lord: "புதன்", rasis: "கடகம் (4 பாதங்கள்)", rasiIds: [4] },
    { id: 10, name: "மகம்", english: "Magha", lord: "கேது", rasis: "சிம்மம் (4 பாதங்கள்)", rasiIds: [5] },
    { id: 11, name: "பூரம்", english: "Purva Phalguni", lord: "சுக்கிரன்", rasis: "சிம்மம் (4 பாதங்கள்)", rasiIds: [5] },
    { id: 12, name: "உத்திரம்", english: "Uttara Phalguni", lord: "சூரியன்", rasis: "சிம்மம் (1 பாதம்), கன்னி (2,3,4 பாதங்கள்)", rasiIds: [5, 6] },
    { id: 13, name: "அஸ்தம்", english: "Hasta", lord: "சந்திரன்", rasis: "கன்னி (4 பாதங்கள்)", rasiIds: [6] },
    { id: 14, name: "சித்திரை", english: "Chitra", lord: "செவ்வாய்", rasis: "கன்னி (1,2 பாதங்கள்), துலாம் (3,4 பாதங்கள்)", rasiIds: [6, 7] },
    { id: 15, name: "சுவாதி", english: "Swati", lord: "ராகு", rasis: "துலாம் (4 பாதங்கள்)", rasiIds: [7] },
    { id: 16, name: "விசாகம்", english: "Vishakha", lord: "குரு", rasis: "துலாம் (1,2,3 பாதங்கள்), விருச்சிகம் (4 பாதம்)", rasiIds: [7, 8] },
    { id: 17, name: "அனுஷம்", english: "Anuradha", lord: "சனி", rasis: "விருச்சிகம் (4 பாதங்கள்)", rasiIds: [8] },
    { id: 18, name: "கேட்டை", english: "Jyeshtha", lord: "புதன்", rasis: "விருச்சிகம் (4 பாதங்கள்)", rasiIds: [8] },
    { id: 19, name: "மூலம்", english: "Mula", lord: "கேது", rasis: "தனுசு (4 பாதங்கள்)", rasiIds: [9] },
    { id: 20, name: "பூராடம்", english: "Purva Ashadha", lord: "சுக்கிரன்", rasis: "தனுசு (4 பாதங்கள்)", rasiIds: [9] },
    { id: 21, name: "உத்திராடம்", english: "Uttara Ashadha", lord: "சூரியன்", rasis: "தனுசு (1 பாதம்), மகரம் (2,3,4 பாதங்கள்)", rasiIds: [9, 10] },
    { id: 22, name: "திருவோணம்", english: "Shravana", lord: "சந்திரன்", rasis: "மகரம் (4 பாதங்கள்)", rasiIds: [10] },
    { id: 23, name: "அவிட்டம்", english: "Dhanishta", lord: "செவ்வாய்", rasis: "மகரம் (1,2 பாதங்கள்), கும்பம் (3,4 பாதங்கள்)", rasiIds: [10, 11] },
    { id: 24, name: "சதயம்", english: "Shatabhisha", lord: "ராகு", rasis: "கும்பம் (4 பாதங்கள்)", rasiIds: [11] },
    { id: 25, name: "பூரட்டாதி", english: "Purva Bhadrapada", lord: "குரு", rasis: "கும்பம் (1,2,3 பாதங்கள்), மீனம் (4 பாதம்)", rasiIds: [11, 12] },
    { id: 26, name: "உத்திரட்டாதி", english: "Uttara Bhadrapada", lord: "சனி", rasis: "மீனம் (4 பாதங்கள்)", rasiIds: [12] },
    { id: 27, name: "ரேவதி", english: "Revati", lord: "புதன்", rasis: "மீனம் (4 பாதங்கள்)", rasiIds: [12] }
  ];

  // Gochara Guru 12-Year Transit Cycle
  const JUPITER_TRANSITS_CYCLE = [
    { rasiId: 1, startYear: 2023, endYear: 2024, period: "மே 2023 – மே 2024", rasiName: "மேஷம்" },
    { rasiId: 2, startYear: 2024, endYear: 2025, period: "மே 2024 – மே 2025", rasiName: "ரிஷபம்" },
    { rasiId: 3, startYear: 2025, endYear: 2026, period: "மே 2025 – ஜூன் 2026", rasiName: "மிதுனம்" },
    { rasiId: 4, startYear: 2026, endYear: 2027, period: "ஜூன் 2026 – ஜூன் 2027", rasiName: "கடகம்", isCurrent: true, note: "உச்ச குரு" },
    { rasiId: 5, startYear: 2027, endYear: 2028, period: "ஜூன் 2027 – ஜூலை 2028", rasiName: "சிம்மம்" },
    { rasiId: 6, startYear: 2028, endYear: 2029, period: "ஜூலை 2028 – ஆக 2029", rasiName: "கன்னி" },
    { rasiId: 7, startYear: 2029, endYear: 2030, period: "ஆக 2029 – அக் 2030", rasiName: "துலாம்" },
    { rasiId: 8, startYear: 2030, endYear: 2031, period: "அக் 2030 – நவ 2031", rasiName: "விருச்சிகம்" },
    { rasiId: 9, startYear: 2031, endYear: 2032, period: "நவ 2031 – டிச 2032", rasiName: "தனுசு" },
    { rasiId: 10, startYear: 2032, endYear: 2033, period: "டிச 2032 – டிச 2033", rasiName: "மகரம்" },
    { rasiId: 11, startYear: 2033, endYear: 2034, period: "டிச 2033 – நவ 2034", rasiName: "கும்பம்" },
    { rasiId: 12, startYear: 2034, endYear: 2035, period: "நவ 2034 – நவ 2035", rasiName: "மீனம்" },
    { rasiId: 1, startYear: 2035, endYear: 2036, period: "நவ 2035 – நவ 2036", rasiName: "மேஷம்" },
    { rasiId: 2, startYear: 2036, endYear: 2037, period: "நவ 2036 – அக் 2037", rasiName: "ரிஷபம்" }
  ];

  // Saturn 2.5-Year Gochara Transit Cycle (கோச்சார சனி சஞ்சார கால அட்டவணை)
  const SATURN_TRANSITS_CYCLE = [
    { rasiId: 11, startYear: 2023, endYear: 2025, period: "ஜன 2023 – மார்ச் 2025", rasiName: "கும்பம்", note: "ஆட்சி சனி" },
    { rasiId: 12, startYear: 2025, endYear: 2027, period: "மார்ச் 2025 – ஜூன் 2027", rasiName: "மீனம்", isCurrent: true },
    { rasiId: 1, startYear: 2027, endYear: 2030, period: "ஜூன் 2027 – பிப் 2030", rasiName: "மேஷம்", note: "நீச்ச சனி" },
    { rasiId: 2, startYear: 2030, endYear: 2032, period: "பிப் 2030 – மே 2032", rasiName: "ரிஷபம்" },
    { rasiId: 3, startYear: 2032, endYear: 2034, period: "மே 2032 – ஜூலை 2034", rasiName: "மிதுனம்" },
    { rasiId: 4, startYear: 2034, endYear: 2037, period: "ஜூலை 2034 – ஆக 2036", rasiName: "கடகம்" }
  ];

  // 6 Classical Ashtakavarga Shodhya Pinda Life Event Timing Rules
  const SHODHYA_EVENT_CONFIGS = {
    marriage: {
      id: "marriage",
      icon: "💍",
      title: "திருமண கால நிர்ணயம் (Marriage Timing)",
      shortLabel: "💍 திருமணம் (சுக்கிரன் ➔ 7)",
      planetKey: "Venus",
      planetTamil: "சுக்கிரன்",
      houseOffset: 7,
      houseName: "களத்திர ஸ்தானம் (7-ஆம் வீடு)",
      transitFocus: "Jupiter",
      shastraRule: "சுக்கிரனின் 7-ஆம் வீட்டு ஆதிப்பரல் × சுக்கிரனின் சோத்திய பிண்டம் ÷ 27 ➔ மீதி நட்சத்திரம் & கோச்சார குரு சஞ்சார சுப காலம்.",
      resultNote: "கோச்சார குரு பகவான் இந்நடசத்திரங்கள் வழியே அல்லது களத்திர ஸ்தானத்தில் சஞ்சரிக்கும் போது விவாக சுப முகூர்த்தம் கைகூடும்!",
      defaultClassroom: { planetRasi: 2, houseParal: 4, shodhyaPindam: 174, paksha: "valarpirai" }
    },
    status: {
      id: "status",
      icon: "👑",
      title: "பதவி மற்றும் பட்டம் (Position, Rank & Honor)",
      shortLabel: "👑 பதவி & பட்டம் (சூரியன் ➔ 10)",
      planetKey: "Sun",
      planetTamil: "சூரியன்",
      houseOffset: 10,
      houseName: "கௌரவ/அரசு ஸ்தானம் (10-ஆம் வீடு)",
      transitFocus: "Jupiter",
      shastraRule: "சூரியனின் 10-ஆம் வீட்டு ஆதிப்பரல் × சூரியனின் சோத்திய பிண்டம் ÷ 27 ➔ மீதி நட்சத்திரம் & கோச்சார குரு/சூரிய சஞ்சார காலம்.",
      resultNote: "கோச்சார குரு இந்நடசத்திரங்கள் வழியே அல்லது 10-ஆம் வீட்டில் சஞ்சரிக்கும் போது அரசு அனுகூலம், பதவி உயர்வு, பட்டம் & உயரிய கௌரவம் கிட்டும்!",
      defaultClassroom: { planetRasi: 12, houseParal: 3, shodhyaPindam: 485, paksha: "valarpirai" }
    },
    business: {
      id: "business",
      icon: "💼",
      title: "தொழில் & வியாபாரம் (Business & Commerce)",
      shortLabel: "💼 தொழில் & வியாபாரம் (சனி ➔ 10)",
      planetKey: "Saturn",
      planetTamil: "சனி",
      houseOffset: 10,
      houseName: "ஜீவன/தொழில் ஸ்தானம் (10-ஆம் வீடு)",
      transitFocus: "Jupiter",
      shastraRule: "சனிக்கு 10-ஆம் வீட்டு ஆதிப்பரல் × சனியின் சோத்திய பிண்டம் ÷ 27 ➔ மீதி நட்சத்திரம் & தொழில் விஸ்தரிப்பு காலம்.",
      resultNote: "கோச்சார குரு இந்நடசத்திரங்கள் வழியே சஞ்சரிக்கும் போது புதிய தொழில் ஆரம்பம், நிறுவன விரிவாக்கம், பெரும் வியாபார லாபம் கைகூடும்!",
      defaultClassroom: { planetRasi: 4, houseParal: 4, shodhyaPindam: 351, paksha: "valarpirai" }
    },
    education_job: {
      id: "education_job",
      icon: "📚",
      title: "கல்வி மற்றும் வேலை (Education & Job)",
      shortLabel: "📚 கல்வி & வேலை (புதன் ➔ 2)",
      planetKey: "Mercury",
      planetTamil: "புதன்",
      houseOffset: 2,
      houseName: "வித்யா & தன ஸ்தானம் (2-ஆம் வீடு)",
      transitFocus: "Jupiter",
      shastraRule: "புதனுக்கு 2-ஆம் வீட்டு ஆதிப்பரல் × புதனின் சோத்திய பிண்டம் ÷ 27 ➔ மீதி நட்சத்திரம் & கல்வி/வேலை வாய்ப்பு சுப காலம்.",
      resultNote: "கோச்சார குரு இந்நடசத்திரங்கள் வழியே அல்லது புதனுக்கு 2-ஆம் வீட்டில் சஞ்சரிக்கும் போது உயர்கல்வித் தேர்ச்சி, போட்டித் தேர்வு வெற்றி, உத்தியோக நியமனம் கிட்டும்!",
      defaultClassroom: { planetRasi: 1, houseParal: 4, shodhyaPindam: 592, paksha: "valarpirai" }
    },
    child: {
      id: "child",
      icon: "👶",
      title: "புத்திர பாக்கியம் / குழந்தை (Childbirth)",
      shortLabel: "👶 புத்திர பாக்கியம் (குரு ➔ 5)",
      planetKey: "Jupiter",
      planetTamil: "குரு",
      houseOffset: 5,
      houseName: "புத்திர ஸ்தானம் (5-ஆம் வீடு)",
      transitFocus: "Jupiter",
      shastraRule: "குருவுக்கு 5-ஆம் வீட்டு ஆதிப்பரல் × குருவின் சோத்திய பிண்டம் ÷ 27 ➔ மீதி நட்சத்திரம் & மழலைச் செல்வம் கைகூடும் காலம்.",
      resultNote: "கோச்சார குரு இந்நடசத்திரங்கள் வழியே அல்லது குருவுக்கு 5-ஆம் வீட்டில் சஞ்சரிக்கும் அல்லது பார்க்கும் போது புத்திர பாக்கியம், மழலை பிறக்கும் நற்பலன் உண்டாகும்!",
      defaultClassroom: { planetRasi: 2, houseParal: 5, shodhyaPindam: 605, paksha: "valarpirai" }
    },
    debt: {
      id: "debt",
      icon: "💸",
      title: "கடன் மற்றும் ருணம் (Debts & Liabilities)",
      shortLabel: "💸 கடன் & ருணம் (சனி ➔ 6)",
      planetKey: "Saturn",
      planetTamil: "சனி",
      houseOffset: 6,
      houseName: "ருண/கடன் ஸ்தானம் (6-ஆம் வீடு)",
      transitFocus: "Both",
      shastraRule: "சனிக்கு 6-ஆம் வீட்டு ஆதிப்பரல் × சனியின் சோத்திய பிண்டம் ÷ 27 ➔ மீதி நட்சத்திரம் & கடன் தாக்கம்/நிவர்த்தி காலம்.",
      resultNote: "கோச்சார சனி இந்நடசத்திரங்கள் வழியே சஞ்சரிக்கும் போது கடன் சுமை, எச்சரிக்கை தேவை; அதே நேரம் கோச்சார குரு சஞ்சரிக்கும் போது கடன்கள் முழுமையாகத் தீரும் விமோசன காலம்!",
      defaultClassroom: { planetRasi: 4, houseParal: 4, shodhyaPindam: 351, paksha: "valarpirai" }
    }
  };

  // Engine Active State
  let activePlanet = "Mars"; // Defaults to Mars as in user whiteboard
  let activeMethod = "board"; // 'board' (Hari Method) vs 'classical' (Parashara)
  let customNativePositions = null;
  let isBirthFormOpen = true; // Birth Chart Calculator card visible by default

  // Ashtakavarga Life Events Timing System State
  let activeShodhyaEvent = "marriage"; // 'marriage' | 'status' | 'business' | 'education_job' | 'child' | 'debt'
  let shodhyaEventMode = "current";    // 'current' | 'classroom' | 'custom'
  let customEventParams = {
    marriage: { planetRasi: 2, houseParal: 4, shodhyaPindam: 174, paksha: "valarpirai" },
    status: { planetRasi: 12, houseParal: 3, shodhyaPindam: 485, paksha: "valarpirai" },
    business: { planetRasi: 4, houseParal: 4, shodhyaPindam: 351, paksha: "valarpirai" },
    education_job: { planetRasi: 1, houseParal: 4, shodhyaPindam: 592, paksha: "valarpirai" },
    child: { planetRasi: 2, houseParal: 5, shodhyaPindam: 605, paksha: "valarpirai" },
    debt: { planetRasi: 4, houseParal: 4, shodhyaPindam: 351, paksha: "valarpirai" }
  };
  let isEventCustomOpen = false;

  // Backward compatibility aliases
  let sukraMarriageMode = "current";
  let customSukraParams = customEventParams.marriage;
  let isSukraCustomOpen = false;

  // Default initial planetary positions (Aligned with Wealth & Fortune Preset: Leo Lagna, Saturn+Venus in Meena)
  const DEFAULT_CHART = {
    nativeInfo: {
      name: "அன்பர் (Native)",
      gender: "male",
      dob: "1988-04-30",
      time: "22:10",
      place: "திருவண்ணாமலை (Tiruvannamalai)"
    },
    positions: {
      Sun: 5,       // சிம்மம்
      Moon: 2,      // ரிஷபம் (உச்சம்)
      Mars: 1,      // மேஷம் (ஆட்சி)
      Mercury: 5,   // சிம்மம்
      Jupiter: 4,   // கடகம் (உச்சம்)
      Venus: 12,    // மீனம் (உச்சம்)
      Saturn: 12,   // மீனம்
      Lagna: 5,     // சிம்மம்
      Rahu: 3,      // மிதுனம்
      Ketu: 9       // தனுசு
    }
  };

  /**
   * Resolves current chart planetary positions from PGAstro.chart or PGAstro.lastCalculatedHoroscope
   */
  function getCurrentPositions() {
    if (customNativePositions) {
      return customNativePositions;
    }

    const pos = {};
    const chartState = window.PGAstro && window.PGAstro.chart && window.PGAstro.chart.getState();
    const lagnaId = window.PGAstro && window.PGAstro.chart && window.PGAstro.chart.getLagnaRasiId();
    pos.Lagna = lagnaId || 1;

    // Mapping from Tamil planet names to English keys
    const tamilToKey = {
      "சூரியன்": "Sun",
      "சந்திரன்": "Moon",
      "செவ்வாய்": "Mars",
      "புதன்": "Mercury",
      "குரு": "Jupiter",
      "சுக்கிரன்": "Venus",
      "சனி": "Saturn",
      "ராகு": "Rahu",
      "கேது": "Ketu"
    };

    if (chartState) {
      for (let rId = 1; rId <= 12; rId++) {
        const planetsInRasi = chartState[rId] || [];
        planetsInRasi.forEach(p => {
          const k = tamilToKey[p.planet];
          if (k) pos[k] = rId;
        });
      }
    }

    // Ensure all 7 planets are assigned, fallback to whiteboard chart if empty
    let missingCount = 0;
    ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"].forEach(k => {
      if (!pos[k]) missingCount++;
    });

    if (missingCount >= 4) {
      return DEFAULT_CHART.positions;
    }

    return pos;
  }

  /**
   * Calculates Bhinna Ashtakavarga (BAV) for a given planet
   */
  function calculateBAV(planetKey, positions) {
    const rules = BAV_RULES[planetKey];
    if (!rules) return null;

    const bindus = {};
    for (let r = 1; r <= 12; r++) bindus[r] = 0;
    const matrix = {}; // source -> 12 rasis (1 or 0)

    const sources = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Lagna"];
    sources.forEach(src => {
      const srcRasi = positions[src] || 1;
      const houses = rules[src] || [];
      matrix[src] = {};
      for (let r = 1; r <= 12; r++) matrix[src][r] = 0;
      houses.forEach(h => {
        const targetRasi = ((srcRasi - 1 + (h - 1)) % 12) + 1;
        bindus[targetRasi]++;
        matrix[src][targetRasi] = 1;
      });
    });

    const total = Object.values(bindus).reduce((a, b) => a + b, 0);
    return { bindus, matrix, total };
  }

  /**
   * Calculates Sarvashtakavarga (SAV - 337 points total)
   */
  function calculateSAV(positions) {
    const sav = {};
    for (let r = 1; r <= 12; r++) sav[r] = 0;
    const allBAV = {};

    PLANET_KEYS.forEach(pk => {
      const res = calculateBAV(pk, positions);
      allBAV[pk] = res;
      for (let r = 1; r <= 12; r++) {
        sav[r] += res.bindus[r];
      }
    });

    const total = Object.values(sav).reduce((a, b) => a + b, 0);
    return { sav, allBAV, total };
  }

  /**
   * Trikona Shodhana (Trinal Reduction)
   * Method 'board': As taught on the whiteboard, each trine is reduced to the minimum of that trine.
   * Method 'classical': Standard Parashara subtraction reduction.
   */
  function applyTrikonaShodhana(bindus, method = "board") {
    const res = { ...bindus };
    const trines = [
      [1, 5, 9],   // Fire: Mesha, Simha, Dhanu
      [2, 6, 10],  // Earth: Vrishabha, Kanya, Makara
      [3, 7, 11],  // Air: Mithuna, Tula, Kumbha
      [4, 8, 12]   // Water: Kataka, Vrischika, Meena
    ];

    if (method === "board") {
      trines.forEach(trine => {
        const minVal = Math.min(res[trine[0]], res[trine[1]], res[trine[2]]);
        res[trine[0]] = minVal;
        res[trine[1]] = minVal;
        res[trine[2]] = minVal;
      });
    } else {
      // Classical Parashara
      trines.forEach(trine => {
        const vals = [res[trine[0]], res[trine[1]], res[trine[2]]];
        if (vals.includes(0)) return; // Zero rule: no reduction if any is 0
        const minVal = Math.min(...vals);
        res[trine[0]] -= minVal;
        res[trine[1]] -= minVal;
        res[trine[2]] -= minVal;
      });
    }

    const total = Object.values(res).reduce((a, b) => a + b, 0);
    return { bindus: res, total };
  }

  /**
   * Ekadhipatya Shodhana (Single Lordship Reduction)
   * Method 'board': Balances dual-ownership sign pairs to the minimum of the pair.
   * Method 'classical': Standard Parashara dual ownership with occupancy checks.
   */
  function applyEkadhipatyaShodhana(trikonaBindus, positions, method = "board") {
    const res = { ...trikonaBindus };
    const pairs = [
      [1, 8],   // Mars: Mesha & Vrischika
      [2, 7],   // Venus: Vrishabha & Tula
      [3, 6],   // Mercury: Mithuna & Kanya
      [9, 12],  // Jupiter: Dhanu & Meena
      [10, 11]  // Saturn: Makara & Kumbha
    ];

    if (method === "board") {
      pairs.forEach(([r1, r2]) => {
        const minVal = Math.min(res[r1], res[r2]);
        res[r1] = minVal;
        res[r2] = minVal;
      });
      // Cancer (4) and Leo (5) remain unchanged
    } else {
      // Classical Parashara
      const isOccupied = (r) => {
        return Object.values(positions).includes(r);
      };

      pairs.forEach(([r1, r2]) => {
        const v1 = res[r1];
        const v2 = res[r2];
        if (v1 === 0 || v2 === 0) return;

        const occ1 = isOccupied(r1);
        const occ2 = isOccupied(r2);

        if (!occ1 && !occ2) {
          if (v1 === v2) {
            res[r1] = 0;
            res[r2] = 0;
          } else {
            const minV = Math.min(v1, v2);
            res[r1] = minV;
            res[r2] = minV;
          }
        } else if (occ1 && occ2) {
          // both occupied: no reduction
        } else if (occ1 && !occ2) {
          // r1 occupied, r2 vacant
          if (v2 > v1) res[r2] = v2 - v1;
          else res[r2] = 0;
        } else if (!occ1 && occ2) {
          // r1 vacant, r2 occupied
          if (v1 > v2) res[r1] = v1 - v2;
          else res[r1] = 0;
        }
      });
    }

    const total = Object.values(res).reduce((a, b) => a + b, 0);
    return { bindus: res, total };
  }

  /**
   * Rasi Pindam Calculation
   * Multiplies each sign's Rasi Gunakara by its bindus and sums up.
   * On the whiteboard, Aadhi Paral is multiplied (ஆதிப்பரலில் உள்ள பரல் x பெருக்கல் எண்).
   */
  function calculateRasiPindam(bindus) {
    let total = 0;
    const details = [];
    for (let r = 1; r <= 12; r++) {
      const gunakara = RASI_GUNAKARAS[r];
      const pts = bindus[r];
      const prod = gunakara * pts;
      total += prod;
      details.push({
        rasiId: r,
        name: RASI_NAMES_TAMIL[r],
        gunakara,
        bindus: pts,
        product: prod
      });
    }
    return { total, details };
  }

  /**
   * Graha Pindam Calculation
   * Multiplies each planet's Graha Gunakara by the bindu of the house where the planet sits from Ekadhipatya Shodhana.
   */
  function calculateGrahaPindam(ekadhipatyaBindus, positions) {
    let total = 0;
    const details = [];
    const planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

    planets.forEach(p => {
      const pRasi = positions[p] || 1;
      const gunakara = GRAHA_GUNAKARAS[p];
      const pts = ekadhipatyaBindus[pRasi] !== undefined ? ekadhipatyaBindus[pRasi] : 0;
      const prod = gunakara * pts;
      total += prod;
      details.push({
        planet: p,
        name: PLANET_META[p].tamil,
        icon: PLANET_META[p].icon,
        rasiId: pRasi,
        rasiName: RASI_NAMES_TAMIL[pRasi],
        gunakara,
        bindus: pts,
        product: prod
      });
    });

    return { total, details };
  }

  /**
   * Full Shodhya Pindam Suite
   */
  function calculateFullSuite(planetKey, positions, method = "board") {
    const bav = calculateBAV(planetKey, positions);
    const trikona = applyTrikonaShodhana(bav.bindus, method);
    const ekadhipatya = applyEkadhipatyaShodhana(trikona.bindus, positions, method);

    // Board uses Aadhi Paral for Rasi Pindam as written on whiteboard;
    // Classical uses Ekadhipatya Shodhita bindus.
    const rasiBindusSource = method === "board" ? bav.bindus : ekadhipatya.bindus;
    const rasiPindam = calculateRasiPindam(rasiBindusSource);
    const grahaPindam = calculateGrahaPindam(ekadhipatya.bindus, positions);
    const shodhyaPindam = rasiPindam.total + grahaPindam.total;

    return {
      planetKey,
      positions,
      method,
      bav,
      trikona,
      ekadhipatya,
      rasiPindam,
      grahaPindam,
      shodhyaPindam
    };
  }

  /**
   * Astrological Predictions & Interpretations based on Shodhya Pindam
   */
  function getPredictions(suite) {
    const sp = suite.shodhyaPindam;
    const pMeta = PLANET_META[suite.planetKey] || { tamil: suite.planetKey };

    // Nakshatrayu Longevity factor: (Shodhya Pinda * 7) / 27
    const longevityNum = ((sp * 7) / 27).toFixed(1);
    const remainderNak = Math.floor((sp * 7) % 27) + 1;

    // Auspicious Trinal Transit Rasis for Jupiter:
    // When transit Jupiter passes through the rasi whose number equals (Shodhya Pinda % 12) or its trines
    let pindaRasiId = sp % 12;
    if (pindaRasiId === 0) pindaRasiId = 12;
    const trine1 = ((pindaRasiId - 1 + 4) % 12) + 1;
    const trine2 = ((pindaRasiId - 1 + 8) % 12) + 1;

    // Caution Transit Rasis for Saturn: 7th & 8th from Pinda Rasi
    const caution1 = ((pindaRasiId - 1 + 6) % 12) + 1;
    const caution2 = ((pindaRasiId - 1 + 7) % 12) + 1;

    return {
      longevityYears: longevityNum,
      targetNakshatraId: remainderNak,
      pindaRasi: RASI_NAMES_TAMIL[pindaRasiId],
      pindaRasiId,
      trineRasis: [RASI_NAMES_TAMIL[pindaRasiId], RASI_NAMES_TAMIL[trine1], RASI_NAMES_TAMIL[trine2]],
      cautionRasis: [RASI_NAMES_TAMIL[caution1], RASI_NAMES_TAMIL[caution2]],
      planetName: pMeta.tamil
    };
  }

  /**
   * 6 Classical Ashtakavarga Shodhya Pinda Life Event Timing Rules
   * (அஷ்டகவர்க்க சோத்திய பிண்ட முக்கிய வாழ்க்கை நிகழ்வுகள் & கால நிர்ணய விதிகள்)
   *
   * 1. திருமணம் (Marriage): சுக்கிரன் -> 7-ஆம் வீடு ஆதிப்பரல் × சுக்கிர சோத்திய பிண்டம்
   * 2. பதவி & பட்டம் (Status & Honor): சூரியன் -> 10-ஆம் வீடு ஆதிப்பரல் × சூரிய சோத்திய பிண்டம்
   * 3. தொழில் & வியாபாரம் (Business): சனி -> 10-ஆம் வீடு ஆதிப்பரல் × சனி சோத்திய பிண்டம்
   * 4. கல்வி & வேலை (Education & Job): புதன் -> 2-ஆம் வீடு ஆதிப்பரல் × புதன் சோத்திய பிண்டம்
   * 5. புத்திர பாக்கியம் (Childbirth): குரு -> 5-ஆம் வீடு ஆதிப்பரல் × குரு சோத்திய பிண்டம்
   * 6. கடன் & ருணம் (Debts): சனி -> 6-ஆம் வீடு ஆதிப்பரல் × சனி சோத்திய பிண்டம்
   *
   * Formula: (Planet Relative House Paral * Shodhya Pindam) % 27
   * Paksha Logic:
   *   - Valarpirai (வளர்பிறை / Shukla Paksha): Count forward from Ashwini (1) -> Target Nakshatra
   *   - Theipirai (தேய்பிறை / Krishna Paksha): Count forward from Avittam (23) -> Target Nakshatra
   */
  function calculateShodhyaEventTimingRule(positions, method = "board", eventKey = "marriage", override = null) {
    const eventCfg = SHODHYA_EVENT_CONFIGS[eventKey] || SHODHYA_EVENT_CONFIGS.marriage;
    let planetRasi = 1;
    let targetHouse = 1;
    let houseParal = 4;
    let shodhyaPindam = 150;
    let paksha = "valarpirai";
    let isCurrentChart = false;

    const savedParams = customEventParams[eventKey] || eventCfg.defaultClassroom;

    if (override && override.mode === "classroom") {
      const cls = eventCfg.defaultClassroom;
      planetRasi = cls.planetRasi;
      targetHouse = ((planetRasi - 1 + (eventCfg.houseOffset - 1)) % 12) + 1;
      houseParal = cls.houseParal;
      shodhyaPindam = cls.shodhyaPindam;
      paksha = override.paksha || savedParams.paksha || cls.paksha || "valarpirai";
    } else if (override && override.mode === "custom") {
      planetRasi = parseInt(override.planetRasi) || savedParams.planetRasi || eventCfg.defaultClassroom.planetRasi;
      targetHouse = ((planetRasi - 1 + (eventCfg.houseOffset - 1)) % 12) + 1;
      houseParal = override.houseParal !== undefined ? parseInt(override.houseParal) : (savedParams.houseParal !== undefined ? savedParams.houseParal : eventCfg.defaultClassroom.houseParal);
      shodhyaPindam = parseInt(override.shodhyaPindam) || savedParams.shodhyaPindam || eventCfg.defaultClassroom.shodhyaPindam;
      paksha = override.paksha || savedParams.paksha || "valarpirai";
    } else {
      isCurrentChart = true;
      planetRasi = positions[eventCfg.planetKey] || 1;
      targetHouse = ((planetRasi - 1 + (eventCfg.houseOffset - 1)) % 12) + 1;

      const bav = calculateBAV(eventCfg.planetKey, positions);
      houseParal = (bav && bav.bindus && bav.bindus[targetHouse] !== undefined)
        ? bav.bindus[targetHouse]
        : 4;

      const suite = calculateFullSuite(eventCfg.planetKey, positions, method);
      shodhyaPindam = suite.shodhyaPindam || 150;

      if (override && override.paksha) {
        paksha = override.paksha;
      } else if (savedParams && savedParams.paksha) {
        paksha = savedParams.paksha;
      } else if (window.PGAstro?.lastCalculatedHoroscope?.isWaxingMoon !== undefined) {
        paksha = window.PGAstro.lastCalculatedHoroscope.isWaxingMoon ? "valarpirai" : "theipirai";
      } else if (positions.Moon && positions.Sun) {
        const dist = ((positions.Moon - positions.Sun + 12) % 12);
        paksha = (dist >= 0 && dist <= 6) ? "valarpirai" : "theipirai";
      } else {
        paksha = "valarpirai";
      }
    }

    const product = shodhyaPindam * houseParal;
    const quotient = Math.floor(product / 27);
    let remainder = product % 27;
    if (remainder === 0) remainder = 27;

    // Paksha count:
    // Valarpirai (Shukla Paksha): Count forward from Ashwini (1) -> targetNakId = remainder
    // Theipirai (Krishna Paksha): Count forward from Avittam (23) -> targetNakId = ((23 - 1 + remainder - 1) % 27) + 1
    let targetNakId = (paksha === "valarpirai")
      ? remainder
      : (((23 - 1 + remainder - 1) % 27) + 1);
    if (targetNakId < 1) targetNakId = 1;
    if (targetNakId > 27) targetNakId = 27;

    const targetNak = NAKSHATRA_DATA[targetNakId - 1];
    const trineBase = ((targetNakId - 1) % 9) + 1;
    const trineNakshatras = [
      NAKSHATRA_DATA[trineBase - 1],
      NAKSHATRA_DATA[trineBase + 9 - 1],
      NAKSHATRA_DATA[trineBase + 18 - 1]
    ];

    const rasiSet = new Set();
    trineNakshatras.forEach(t => {
      t.rasiIds.forEach(rid => rasiSet.add(rid));
    });
    const trineRasiIds = Array.from(rasiSet);
    const trineRasiNames = trineRasiIds.map(rid => RASI_NAMES_TAMIL[rid]);

    const targetHouseTrines = [
      targetHouse,
      ((targetHouse - 1 + 4) % 12) + 1,
      ((targetHouse - 1 + 8) % 12) + 1
    ];
    const targetHouseTrineNames = targetHouseTrines.map(rid => RASI_NAMES_TAMIL[rid]);

    return {
      eventKey,
      eventCfg,
      planetRasi,
      planetRasiName: RASI_NAMES_TAMIL[planetRasi],
      targetHouse,
      targetHouseName: RASI_NAMES_TAMIL[targetHouse],
      houseParal,
      shodhyaPindam,
      product,
      quotient,
      remainder,
      paksha,
      targetNakId,
      targetNak,
      trineNakshatras,
      trineLord: targetNak.lord,
      trineRasiIds,
      trineRasiNames,
      targetHouseTrines,
      targetHouseTrineNames,
      isCurrentChart
    };
  }

  // Backward compatibility alias for Sukra marriage rule
  function calculateSukraMarriageRule(positions, method = "board", override = null) {
    const res = calculateShodhyaEventTimingRule(positions, method, "marriage", override);
    return {
      ...res,
      venusRasi: res.planetRasi,
      venusRasiName: res.planetRasiName,
      seventhHouse: res.targetHouse,
      seventhHouseName: res.targetHouseName,
      seventhParal: res.houseParal,
      seventhTrines: res.targetHouseTrines,
      seventhTrineNames: res.targetHouseTrineNames
    };
  }

  /**
   * Renders the 6 Ashtakavarga Shodhya Pinda Life Event Timing Rules Component
   */
  function renderShodhyaEventsCard(positions, method) {
    const curEventKey = activeShodhyaEvent || "marriage";
    const eventCfg = SHODHYA_EVENT_CONFIGS[curEventKey] || SHODHYA_EVENT_CONFIGS.marriage;
    const curParams = customEventParams[curEventKey] || eventCfg.defaultClassroom;

    const override = (shodhyaEventMode === "classroom")
      ? { mode: "classroom", paksha: curParams.paksha }
      : (shodhyaEventMode === "custom"
         ? { mode: "custom", ...curParams }
         : { mode: "current", paksha: curParams.paksha });

    const sm = calculateShodhyaEventTimingRule(positions, method, curEventKey, override);

    // Matching Jupiter Transits
    const matchingJupiterTransits = JUPITER_TRANSITS_CYCLE.map(jt => {
      let type = null;
      let badge = "";
      if (sm.trineRasiIds.includes(jt.rasiId)) {
        type = "direct_star";
        badge = `<span class="ashta-transit-badge-direct">⭐ திரிகோண நட்சத்திர சஞ்சாரம்</span>`;
      } else if (jt.rasiId === sm.targetHouse) {
        type = "target_house";
        badge = `<span class="ashta-transit-badge-seventh">🏛️ ${sm.targetHouseName} நேரடி சஞ்சாரம்</span>`;
      } else {
        const aspects = [
          ((jt.rasiId - 1 + 4) % 12) + 1,
          ((jt.rasiId - 1 + 6) % 12) + 1,
          ((jt.rasiId - 1 + 8) % 12) + 1
        ];
        if (aspects.includes(sm.targetHouse)) {
          type = "aspect";
          badge = `<span class="ashta-transit-badge-aspect">👁️ ${sm.targetHouseName} மீது குரு பார்வை</span>`;
        }
      }
      return type ? { ...jt, badge, type } : null;
    }).filter(Boolean);

    // Matching Saturn Transits (for debts / business)
    const matchingSaturnTransits = SATURN_TRANSITS_CYCLE.map(st => {
      let type = null;
      let badge = "";
      if (sm.trineRasiIds.includes(st.rasiId)) {
        type = "direct_star";
        badge = `<span class="ashta-transit-badge-saturn">⚠️ திரிகோண நட்சத்திரத்தில் சனி (கடன்/தொழில் அழுத்தம்)</span>`;
      } else if (st.rasiId === sm.targetHouse) {
        type = "target_house";
        badge = `<span class="ashta-transit-badge-saturn">🚨 ${sm.targetHouseName} சனி சஞ்சாரம்</span>`;
      }
      return type ? { ...st, badge, type } : null;
    }).filter(Boolean);

    return `
      <div class="ashta-marriage-card" id="ashtaShodhyaEventsCard">
        <!-- Header -->
        <div class="ashta-marriage-header">
          <div class="ashta-marriage-title-group">
            <div class="ashta-marriage-icon">${eventCfg.icon}</div>
            <div>
              <h3 class="ashta-marriage-title-text">${eventCfg.title}</h3>
              <div class="ashta-marriage-subtitle">
                ${eventCfg.shastraRule}
              </div>
            </div>
          </div>

          <!-- Mode Selector Pills -->
          <div class="ashta-marriage-mode-pills">
            <button class="ashta-marriage-mode-btn ${shodhyaEventMode === 'classroom' ? 'active' : ''}" id="btnEventModeClassroom">
              <span>🎯</span>
              <span>வகுப்பு மாதிரி (${sm.eventCfg.planetTamil}: ${sm.shodhyaPindam} × ${sm.houseParal} = ${sm.product})</span>
            </button>
            <button class="ashta-marriage-mode-btn ${shodhyaEventMode === 'current' ? 'active' : ''}" id="btnEventModeCurrent">
              <span>🌟</span>
              <span>தற்போதைய ஜாதகக் கணிதம்</span>
            </button>
            <button class="ashta-marriage-mode-btn ${shodhyaEventMode === 'custom' ? 'active' : ''}" id="btnEventModeCustom">
              <span>✏️</span>
              <span>சுய கணித உள்ளீடு</span>
            </button>
          </div>
        </div>

        <!-- 6 Event Selection Tabs Bar -->
        <div class="ashta-event-tabs-bar">
          ${Object.keys(SHODHYA_EVENT_CONFIGS).map(k => {
            const cfg = SHODHYA_EVENT_CONFIGS[k];
            const isActive = curEventKey === k;
            return `
              <button class="ashta-event-tab-btn ${isActive ? 'active' : ''}" data-event="${k}">
                <span class="ashta-event-tab-icon">${cfg.icon}</span>
                <span class="ashta-event-tab-label">${cfg.shortLabel}</span>
              </button>
            `;
          }).join('')}
        </div>

        <!-- Custom Input Bar -->
        <div id="ashtaEventCustomPanel" style="${(shodhyaEventMode === 'custom' || isEventCustomOpen) ? '' : 'display:none;'} margin-bottom: 1rem; padding: 0.85rem 1rem; background: rgba(14, 20, 42, 0.95); border: 1px solid rgba(244, 114, 182, 0.35); border-radius: 8px;">
          <div style="font-size:0.8rem; font-weight:700; color:#ffd700; margin-bottom:0.6rem;">
            ✏️ ${eventCfg.title} - சுய மதிப்பு உள்ளீடு (Custom Input):
          </div>
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.65rem; align-items:flex-end;">
            <div>
              <label style="font-size:0.72rem; color:#ffd700; display:block; margin-bottom:3px; font-weight:600;">${eventCfg.planetTamil} நின்ற ராசி:</label>
              <select id="inputEventPlanetRasi" style="background:#090d1c; border:1px solid rgba(255,255,255,0.2); padding:0.4rem; border-radius:4px; color:#fff; width:100%; font-size:0.8rem;">
                ${[1,2,3,4,5,6,7,8,9,10,11,12].map(r => `
                  <option value="${r}" ${r === sm.planetRasi ? 'selected' : ''}>${r}. ${RASI_NAMES_TAMIL[r]}</option>
                `).join('')}
              </select>
            </div>
            <div>
              <label style="font-size:0.72rem; color:#ffd700; display:block; margin-bottom:3px; font-weight:600;">${eventCfg.houseName} ஆதிப்பரல்:</label>
              <input type="number" id="inputEventHouseParal" min="0" max="8" value="${sm.houseParal}" style="background:#090d1c; border:1px solid rgba(255,255,255,0.2); padding:0.4rem; border-radius:4px; color:#fff; width:100%; font-size:0.8rem;">
            </div>
            <div>
              <label style="font-size:0.72rem; color:#ffd700; display:block; margin-bottom:3px; font-weight:600;">${eventCfg.planetTamil} சோத்திய பிண்டம்:</label>
              <input type="number" id="inputEventShodhyaPindam" min="1" max="999" value="${sm.shodhyaPindam}" style="background:#090d1c; border:1px solid rgba(255,255,255,0.2); padding:0.4rem; border-radius:4px; color:#fff; width:100%; font-size:0.8rem;">
            </div>
            <div>
              <label style="font-size:0.72rem; color:#ffd700; display:block; margin-bottom:3px; font-weight:600;">பட்ச நிலை:</label>
              <select id="inputEventPaksha" style="background:#090d1c; border:1px solid rgba(255,255,255,0.2); padding:0.4rem; border-radius:4px; color:#fff; width:100%; font-size:0.8rem;">
                <option value="valarpirai" ${sm.paksha === 'valarpirai' ? 'selected' : ''}>வளர்பிறை (அசுவினி முதல்)</option>
                <option value="theipirai" ${sm.paksha === 'theipirai' ? 'selected' : ''}>தேய்பிறை (அவிட்டம் முதல்)</option>
              </select>
            </div>
            <div>
              <button class="btn btn-gold btn-sm" id="btnEventApplyCustom" style="width:100%; padding:0.45rem; font-weight:700;">
                ⚡ கணிக்க (Calculate)
              </button>
            </div>
          </div>
        </div>

        <!-- 5-Box Mathematical Breakdown Display -->
        <div class="ashta-marriage-equation">
          <!-- Box 1: Planet & Target House -->
          <div class="ashta-m-box">
            <div class="ashta-m-label">${eventCfg.planetTamil} ➔ ${eventCfg.houseOffset}-ஆம் வீடு</div>
            <div class="ashta-m-val" style="color:#ffd700; font-size:0.95rem;">
              ${sm.planetRasiName} ➔ <span style="color:#f472b6;">${sm.targetHouseName}</span>
            </div>
            <div style="font-size:0.65rem; color:#94a3b8; margin-top:2px;">${eventCfg.houseName}</div>
          </div>

          <div class="ashta-m-sign">×</div>

          <!-- Box 2: Target House Paral -->
          <div class="ashta-m-box">
            <div class="ashta-m-label">${eventCfg.houseOffset}-ஆம் வீட்டு ஆதிப்பரல்</div>
            <div class="ashta-m-val" style="color:#38bdf8;">${sm.houseParal}</div>
            <div style="font-size:0.65rem; color:#94a3b8; margin-top:2px;">${eventCfg.planetTamil} அஷ்டகவர்க்க பரல்</div>
          </div>

          <div class="ashta-m-sign">×</div>

          <!-- Box 3: Shodhya Pindam -->
          <div class="ashta-m-box">
            <div class="ashta-m-label">${eventCfg.planetTamil} சோத்திய பிண்டம்</div>
            <div class="ashta-m-val" style="color:#ec4899;">${sm.shodhyaPindam}</div>
            <div style="font-size:0.65rem; color:#94a3b8; margin-top:2px;">சுத்த பிண்ட அளவு</div>
          </div>

          <div class="ashta-m-sign">=</div>

          <!-- Box 4: Product -->
          <div class="ashta-m-box">
            <div class="ashta-m-label">பெருக்கல் பலன்</div>
            <div class="ashta-m-val" style="color:#a78bfa;">${sm.product}</div>
            <div style="font-size:0.65rem; color:#94a3b8; margin-top:2px;">${sm.shodhyaPindam} × ${sm.houseParal}</div>
          </div>

          <div class="ashta-m-sign">÷ 27 ➔</div>

          <!-- Box 5: Modulo 27 & Remainder (Highlighted) -->
          <div class="ashta-m-box final">
            <div class="ashta-m-label" style="color:#ffd700; font-weight:800;">மீதி (Remainder)</div>
            <div class="ashta-m-val" style="color:#ffd700; font-size:1.45rem;">${sm.remainder}</div>
            <div style="font-size:0.68rem; color:#38bdf8; font-weight:700; margin-top:2px;">(ஈவு: ${sm.quotient})</div>
          </div>
        </div>

        <!-- Target Nakshatra Hero Banner -->
        <div class="ashta-target-star-banner">
          <div class="ashta-star-hero">
            <div class="ashta-star-number-badge">${sm.targetNakId}</div>
            <div>
              <div style="font-size:0.75rem; color:#94a3b8; font-weight:600;">நிகழ்வு இலக்கு நட்சத்திரம் (Target Nakshatra):</div>
              <div class="ashta-star-name-tamil">🌟 ${sm.targetNak.name} (${sm.targetNak.english})</div>
              <div class="ashta-star-lord-text">👑 நட்சத்திர அதிபதி: <strong>${sm.targetNak.lord}</strong> | ராசிகள்: <strong>${sm.targetNak.rasis}</strong></div>
            </div>
          </div>

          <!-- Paksha Toggle Switch -->
          <div class="ashta-paksha-toggle-group">
            <button class="ashta-paksha-btn ${sm.paksha === 'valarpirai' ? 'active' : ''}" id="btnTogglePakshaValarpirai">
              🌓 வளர்பிறை (அசுவினி முதல்)
            </button>
            <button class="ashta-paksha-btn ${sm.paksha === 'theipirai' ? 'active' : ''}" id="btnTogglePakshaTheipirai">
              🌘 தேய்பிறை (அவிட்டம் முதல்)
            </button>
          </div>
        </div>

        <div style="font-size:0.78rem; color:#cbd5e1; margin-bottom:1rem; line-height:1.5;">
          ${sm.paksha === 'valarpirai'
            ? `💡 <strong>கணித முறை விளக்கம்:</strong> வளர்பிறை (சுக்கில பக்ஷம்) என்பதால் <strong>அசுவினி நட்சத்திரம் முதல் நேராக</strong> ${sm.remainder}-வது நட்சத்திரமாகிய <strong>${sm.targetNak.name}</strong> (${sm.targetNak.english}) பெறப்படுகிறது.`
            : `💡 <strong>கணித முறை விளக்கம்:</strong> தேய்பிறை (கிருஷ்ண பக்ஷம்) என்பதால் சாஸ்திர விதிப்படி <strong>அவிட்டம் நட்சத்திரம் முதல் நேராக</strong> ${sm.remainder}-வது நட்சத்திரமாகிய <strong>${sm.targetNak.name}</strong> (${sm.targetNak.english}) பெறப்படுகிறது.`
          }
          இந்த நட்சத்திரத்தின் அதிபதி <strong>${sm.trineLord}</strong> ஆவார். ஆகவே <strong>${sm.trineLord}</strong>-ன் ஆதிக்கத்திற்குட்பட்ட 3 திரிகோண நட்சத்திரங்களும் (<strong>${sm.trineNakshatras.map(t=>t.name).join(', ')}</strong>) <strong>${eventCfg.title}</strong> சுப காலத்தை நிர்ணயிக்கின்றன.
        </div>

        <!-- 3 Trinal Nakshatras Showcase (3 திரிகோண நட்சத்திரங்கள்) -->
        <div style="font-size:0.85rem; font-weight:700; color:#ffd700; margin-bottom:0.5rem; display:flex; align-items:center; gap:6px;">
          <span>☸️</span>
          <span>${sm.trineLord}-ன் 3 திரிகோண நட்சத்திரங்கள் (Trinal Nakshatras of ${sm.trineLord}):</span>
        </div>

        <div class="ashta-trine-stars-grid">
          ${sm.trineNakshatras.map((t, idx) => `
            <div class="ashta-trine-star-card" style="${t.id === sm.targetNakId ? 'border-color:#ffd700; background:rgba(212,175,55,0.12);' : ''}">
              <div class="ashta-trine-card-header">
                <div class="ashta-trine-star-title">
                  <span>${idx === 0 ? '1️⃣' : idx === 1 ? '2️⃣' : '3️⃣'}</span>
                  <span>${t.name}</span>
                  <span style="font-size:0.72rem; color:#94a3b8;">(${t.english})</span>
                  ${t.id === sm.targetNakId ? '<span style="font-size:0.65rem; background:#ffd700; color:#000; padding:1px 5px; border-radius:3px; font-weight:800; margin-left:4px;">இலக்கு</span>' : ''}
                </div>
                <span class="ashta-trine-star-num">நட்சத்திர எண்: ${t.id}</span>
              </div>
              <div class="ashta-trine-star-body">
                <div>👑 அதிபதி: <strong style="color:#ffd700;">${t.lord}</strong></div>
                <div>📍 ராசி மண்டலம்:</div>
                <span class="ashta-trine-rasis-tag">${t.rasis}</span>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Gochara Transit Timeline Box -->
        <div class="ashta-guru-transit-box">
          <div class="ashta-guru-transit-header">
            <div class="ashta-guru-transit-title">
              <span>🌟</span>
              <span>கோச்சார குரு சஞ்சாரக் காலம் ➔ ${eventCfg.title} கால நிர்ணயம் (Transit Jupiter Windows)</span>
            </div>
            <span style="font-size:0.72rem; color:#38bdf8;">கோச்சார குரு 12 ராசி சுழற்சி கால அட்டவணை</span>
          </div>

          <div style="overflow-x:auto;">
            <table class="ashta-guru-table">
              <thead>
                <tr>
                  <th>காலகட்டம் (Period)</th>
                  <th>குரு சஞ்சரிக்கும் ராசி</th>
                  <th>சுப பலன் சுட்டிகள் (Astrological Indication)</th>
                </tr>
              </thead>
              <tbody>
                ${matchingJupiterTransits.map(mt => `
                  <tr class="ashta-guru-row ${mt.isCurrent ? 'current-transit' : ''} ${mt.type === 'direct_star' ? 'direct-transit' : ''}">
                    <td style="font-weight:700; font-family:monospace; color:${mt.isCurrent ? '#34d399' : '#fff'};">
                      ${mt.isCurrent ? '🟢 ' : ''}${mt.period}
                      ${mt.isCurrent ? '<span style="font-size:0.68rem; color:#34d399; margin-left:4px;">(தற்போதைய கோச்சாரம்)</span>' : ''}
                    </td>
                    <td style="font-weight:800; color:#ffd700;">${mt.rasiName} ${mt.note ? `(${mt.note})` : ''}</td>
                    <td>${mt.badge}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          ${eventCfg.transitFocus === "Both" ? `
            <!-- Dual Transit for Debts: Saturn Transit Timeline -->
            <div style="margin-top:1.2rem; border-top:1px solid rgba(255,255,255,0.1); padding-top:0.8rem;">
              <div class="ashta-guru-transit-header">
                <div class="ashta-guru-transit-title" style="color:#f87171;">
                  <span>🪐</span>
                  <span>கோச்சார சனி சஞ்சாரக் காலம் ➔ கடன் சுமை & எச்சரிக்கை காலம் (Transit Saturn Impact)</span>
                </div>
                <span style="font-size:0.72rem; color:#f87171;">சனி சஞ்சார அட்டவணை</span>
              </div>
              <div style="overflow-x:auto;">
                <table class="ashta-guru-table">
                  <thead>
                    <tr>
                      <th>காலகட்டம் (Period)</th>
                      <th>சனி சஞ்சரிக்கும் ராசி</th>
                      <th>கடன் தாக்கம் / எச்சரிக்கை (Saturn Indication)</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${matchingSaturnTransits.map(st => `
                      <tr class="ashta-guru-row ${st.isCurrent ? 'current-transit' : ''}">
                        <td style="font-weight:700; font-family:monospace; color:${st.isCurrent ? '#34d399' : '#fff'};">
                          ${st.isCurrent ? '🟢 ' : ''}${st.period}
                        </td>
                        <td style="font-weight:800; color:#ffd700;">${st.rasiName} ${st.note ? `(${st.note})` : ''}</td>
                        <td>${st.badge}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          ` : ''}

          <div style="margin-top:0.85rem; padding:0.65rem 0.85rem; background:rgba(0,0,0,0.35); border-left:3px solid #f472b6; border-radius:4px; font-size:0.76rem; color:#e2e8f0; line-height:1.55;">
            📖 <strong>அஷ்டகவர்க்க சாஸ்திர விதி:</strong> ${eventCfg.planetTamil}-ன் ${eventCfg.houseOffset}-ஆம் வீட்டு ஆதிப்பரலையும் (${sm.houseParal}) சோத்திய பிண்டத்தையும் (${sm.shodhyaPindam}) பெருக்கி 27-ஆல் வகுத்து வரும் மீதி நட்சத்திரமான <strong>${sm.targetNak.name}</strong> மற்றும் அதன் திரிகோண நட்சத்திரங்களான <strong>${sm.trineNakshatras.map(t=>t.name).join(', ')}</strong> ஆகியவற்றின் வழியே கோச்சார குரு பகவான் சஞ்சரிக்கும் காலகட்டத்திலோ, அல்லது ${eventCfg.planetTamil}-க்கு ${eventCfg.houseOffset}-ஆம் வீடான <strong>${sm.targetHouseName}</strong> ராசியிலோ கோச்சார குரு சஞ்சரிக்கும் போது அல்லது பார்வை செய்யும் போது ஜாதகருக்கு <strong>${eventCfg.resultNote}</strong>!
          </div>
        </div>

      </div>
    `;
  }

  // Backward compatibility alias for renderSukraMarriageCard
  function renderSukraMarriageCard(positions, method) {
    return renderShodhyaEventsCard(positions, method);
  }

  // ==========================================
  // UI RENDERING ENGINE
  // ==========================================

  function render(containerId = "tab_ashtakavarga") {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Access Control: Paid User & Admin Only
    if (window.PGAstroAuth && !window.PGAstroAuth.hasAccess("ashtakavarga")) {
      container.innerHTML = `
        <div class="ashta-container">
          <div class="pane-lock-overlay cosmic-card highlight" style="margin: 1.5rem 0; padding: 2.2rem 1.5rem; text-align: center; border: 2px dashed rgba(212,175,55,0.45); border-radius: var(--radius-lg); background: rgba(11,15,29,0.92);">
            <div style="font-size: 2.8rem; margin-bottom: 0.6rem;">🔒</div>
            <h2 style="color: var(--gold-primary); font-size: 1.35rem; margin-bottom: 0.6rem; font-family: var(--font-heading);">
              அஷ்டகவர்க்கம் &amp; சோத்திய பிண்டம் - Paid User &amp; Admin Only
            </h2>
            <p style="color: var(--text-muted); max-width: 620px; margin: 0 auto 1.5rem; font-size: 0.92rem; line-height: 1.6;">
              ஆதிப்பரல், திரிகோண/ஏகாதிபத்திய சோதனை, இராசி/கிரக பிண்டம், சர்வாஷ்டகவர்க்கம் (SAV 337) மற்றும் <strong>6 வாழ்க்கை நிகழ்வுகளுக்கான சோத்திய பிண்ட கால நிர்ணய விதிகள் (திருமணம், பதவி, தொழில், கல்வி, புத்திர பாக்கியம், கடன்)</strong> ஆகியவற்றை அணுக <strong>Paid User</strong> அல்லது <strong>Admin</strong> கணக்கு அவசியமாகும்.
            </p>
            <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; align-items: center;">
              <button class="btn btn-gold" onclick="window.PGAstroAuth.showAccessModal('ashtakavarga')">
                <span>🔑</span> அணுகல் குறியீடு / லாக் இன்
              </button>
              <button class="btn btn-secondary" onclick="window.PGAstroAuth.quickSwitchRole('paid')">
                <span>⭐</span> Paid User ஆக மாற்று
              </button>
              <button class="btn btn-secondary" onclick="window.PGAstroAuth.quickSwitchRole('admin')">
                <span>👑</span> Admin (Full Access) மாற்று
              </button>
            </div>
          </div>
        </div>
      `;
      return;
    }

    const positions = getCurrentPositions();

    if (activePlanet === "SAV") {
      renderSAVView(container, positions);
      return;
    }

    const suite = calculateFullSuite(activePlanet, positions, activeMethod);
    const pred = getPredictions(suite);
    const currentNative = getCurrentNativeInfo();

    let html = `
      <div class="ashta-container">

        <!-- 1. Toolbar Card -->
        <div class="ashta-toolbar-card">
          <div class="ashta-toolbar-header">
            <div class="ashta-title-group">
              <div class="ashta-title-icon">🔢</div>
              <div>
                <h2 class="ashta-title-text">அஷ்டகவர்க்கம் &amp; சோத்திய பிண்டம் (Ashtakavarga &amp; Shodhya Pindam)</h2>
                <div class="ashta-subtitle">ஆதிப்பரல் • திரிகோண சோதனை • ஏகாதிபத்திய சோதனை • இராசி பிண்டம் • கிரக பிண்டம்</div>
              </div>
            </div>

            <!-- Birth Chart Calculator Toggle Button -->
            <button class="btn btn-sm btn-gold" id="btnToggleAshtaBirthForm" style="display:flex; align-items:center; gap:6px; font-weight:700;">
              <span>🎂</span>
              <span>பிறந்த விவரங்கள் மூலம் ஜாதகம் கணிக்க (Birth Chart Calculator)</span>
              <span id="ashtaBirthChevron" style="font-size:0.75rem; margin-left:2px;">${isBirthFormOpen ? '▲' : '▼'}</span>
            </button>
          </div>

          <!-- Birth Details Calculation Card (பிறந்த விவரங்கள் மூலம் ஜாதகம் கணிக்க) -->
          ${renderBirthCalculatorCard(currentNative)}

          <!-- Planet Selector Pills -->
          <div class="ashta-planet-pills">
            ${PLANET_KEYS.map(pk => {
              const m = PLANET_META[pk];
              const isActive = activePlanet === pk;
              return `
                <button class="ashta-planet-btn ${isActive ? 'active' : ''}" data-planet="${pk}">
                  <span>${m.icon}</span>
                  <span>${m.tamil}</span>
                  <span class="badge-pill-pts">${m.pts}</span>
                </button>
              `;
            }).join('')}
            <button class="ashta-planet-btn ${activePlanet === 'SAV' ? 'active' : ''}" data-planet="SAV">
              <span>👑</span>
              <span>சர்வாஷ்டகவர்க்கம் (SAV)</span>
              <span class="badge-pill-pts">337</span>
            </button>
          </div>

          <!-- Method Switcher & Active Native Strip -->
          <div class="ashta-controls-row">
            <div style="display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap;">
              <span style="font-size:0.78rem; color:var(--gold-light); font-weight:600;">சோதனை முறை (Method):</span>
              <div class="ashta-method-switch">
                <button class="ashta-method-btn ${activeMethod === 'board' ? 'active' : ''}" data-method="board">
                  🏫 ஹரி முறை (Hari)
                </button>
                <button class="ashta-method-btn ${activeMethod === 'classical' ? 'active' : ''}" data-method="classical">
                  📜 பராசரர் முறை (Classical)
                </button>
              </div>
            </div>

            <!-- Active Chart Indicator -->
            <div style="font-size:0.76rem; color:#94a3b8; display:flex; align-items:center; gap:6px;">
              <span>📍 தற்போதைய லக்கினம்:</span>
              <strong style="color:#ffd700;">${RASI_NAMES_TAMIL[positions.Lagna || 1]}</strong>
              <span>| லக்னாதிபதி:</span>
              <strong style="color:#38bdf8;">${RASI_LORDS[positions.Lagna || 1]}</strong>
            </div>
          </div>
        </div>

        <!-- 2. The 3 South Indian Grids Side-by-Side (Trio) -->
        <div class="ashta-charts-trio">

          <!-- Chart 1: Aadhi Paral (Initial Bindus) -->
          <div class="ashta-chart-card">
            <div class="ashta-chart-card-header">
              <div class="ashta-chart-title">
                <span>1️⃣</span>
                <span>ஆதிப்பரல் கட்டம்</span>
              </div>
              <span class="ashta-chart-badge badge-gold">மொத்தம்: ${suite.bav.total}</span>
            </div>
            ${renderMiniSouthGrid(suite.bav.bindus, {
              hubTitle: "ஆதிப்பரல்",
              hubTotal: suite.bav.total,
              hubDesc: "சுத்த புள்ளிகள்",
              positions: null
            })}
          </div>

          <!-- Chart 2: Trikona Shodhana (Trinal Reduction) -->
          <div class="ashta-chart-card">
            <div class="ashta-chart-card-header">
              <div class="ashta-chart-title">
                <span>2️⃣</span>
                <span>திரிகோண சோதனை</span>
              </div>
              <span class="ashta-chart-badge badge-cyan" style="background:rgba(6,182,212,0.25); color:#22d3ee; border:1px solid rgba(6,182,212,0.4);">
                குறைப்பு: ${suite.trikona.total}
              </span>
            </div>
            ${renderMiniSouthGrid(suite.trikona.bindus, {
              hubTitle: "திரிகோண",
              hubTotal: suite.trikona.total,
              hubDesc: activeMethod === 'board' ? "குறைந்தபட்ச சமன்பாடு" : "கழித்தல் முறை",
              positions: null
            })}
          </div>

          <!-- Chart 3: Ekadhipatya Shodhana (Single Lordship) with Occupied Planets -->
          <div class="ashta-chart-card">
            <div class="ashta-chart-card-header">
              <div class="ashta-chart-title">
                <span>3️⃣</span>
                <span>ஏகாதிபத்திய சோதனை</span>
              </div>
              <span class="ashta-chart-badge" style="background:rgba(236,72,153,0.2); color:#f472b6; border:1px solid rgba(236,72,153,0.4);">
                இறுதி: ${suite.ekadhipatya.total}
              </span>
            </div>
            ${renderMiniSouthGrid(suite.ekadhipatya.bindus, {
              hubTitle: "ஏகாதிபத்திய",
              hubTotal: suite.ekadhipatya.total,
              hubDesc: "இருராசி சமன்பாடு",
              positions: positions
            })}
          </div>

        </div>

        <!-- 3. Grand Shodhya Pinda Total Scorecard -->
        <div class="ashta-grand-result-card">
          <div style="font-size: 0.88rem; color: #ffd700; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
            🌟 ${PLANET_META[activePlanet].tamil} சோத்திய பிண்டக் கணிதம் (Shodhya Pinda Summary)
          </div>

          <div class="ashta-grand-equation">
            <div class="ashta-eq-box">
              <div class="ashta-eq-label">இராசி பிண்டம் (Rasi Pinda)</div>
              <div class="ashta-eq-val" style="color: #38bdf8;">${suite.rasiPindam.total}</div>
              <div style="font-size:0.68rem; color:#94a3b8; margin-top:2px;">12 ராசி பெருக்கல் கூட்டு</div>
            </div>

            <div class="ashta-eq-sign">+</div>

            <div class="ashta-eq-box">
              <div class="ashta-eq-label">கிரக பிண்டம் (Graha Pinda)</div>
              <div class="ashta-eq-val" style="color: #ec4899;">${suite.grahaPindam.total}</div>
              <div style="font-size:0.68rem; color:#94a3b8; margin-top:2px;">7 கிரக அமர்வு கூட்டு</div>
            </div>

            <div class="ashta-eq-sign">=</div>

            <div class="ashta-eq-box final-box">
              <div class="ashta-eq-label" style="color: #ffd700;">சோத்திய பிண்டம் (Shodhya Pinda)</div>
              <div class="ashta-eq-val">${suite.shodhyaPindam}</div>
              <div style="font-size:0.72rem; color:#ffd700; font-weight:700; margin-top:2px;">சுத்த பலன் அளவு</div>
            </div>
          </div>

          <p style="font-size:0.8rem; color:#94a3b8; max-width:680px; margin:0 auto; line-height:1.5;">
            ${activeMethod === 'board'
              ? `ஹரி முறைப்படி: <strong>ஆதிப்பரல்</strong> பெருக்கல் மூலம் இராசி பிண்டம் (<strong>${suite.rasiPindam.total}</strong>) மற்றும் <strong>ஏகாதிபத்திய சோதனை பரல்</strong> மூலம் கிரக பிண்டம் (<strong>${suite.grahaPindam.total}</strong>) கூட்டப்பட்டு சோத்திய பிண்டம் <strong>${suite.shodhyaPindam}</strong> ஆகப் பெறப்படுகிறது.`
              : `பாரம்பரிய பராசரர் முறைப்படி: திரிகோண & ஏகாதிபத்திய சோதனைகளுக்குப் பின் எஞ்சிய பரல்களைக் கொண்டு இராசி பிண்டம் (${suite.rasiPindam.total}) மற்றும் கிரக பிண்டம் (${suite.grahaPindam.total}) கணிக்கப்பட்டு சோத்திய பிண்டம் ${suite.shodhyaPindam} ஆகப் பெறப்படுகிறது.`
            }
          </p>
        </div>

        <!-- 3B. Sukra Ashtakavarga Marriage Timing Rule (சுக்கிரன் திருமண கால நிர்ணயக் கார்டு) -->
        ${renderSukraMarriageCard(positions, activeMethod)}

        <!-- 4. Detailed Math Breakdown Tables Side-by-Side -->
        <div class="ashta-math-grid">

          <!-- Table 1: Rasi Pinda Multiplication -->
          <div class="ashta-table-card">
            <div class="ashta-table-title">
              <span>🏛️ இராசி பிண்டக் கணக்கீடு (Rasi Pinda)</span>
              <span style="font-size:0.75rem; color:#38bdf8;">மொத்தம்: ${suite.rasiPindam.total}</span>
            </div>
            <div style="overflow-x:auto;">
              <table class="ashta-styled-table">
                <thead>
                  <tr>
                    <th>ராசி</th>
                    <th>பெருக்கல் எண்</th>
                    <th>${activeMethod === 'board' ? 'ஆதிப்பரல்' : 'சோதித பரல்'}</th>
                    <th>பெருக்கல் பலன்</th>
                  </tr>
                </thead>
                <tbody>
                  ${suite.rasiPindam.details.map(d => `
                    <tr>
                      <td style="font-weight:600; text-align:left; color:#ffd700;">${d.name}</td>
                      <td>${d.gunakara}</td>
                      <td style="font-family:monospace; font-weight:700;">${d.bindus}</td>
                      <td style="color:#38bdf8; font-weight:700; font-family:monospace;">${d.gunakara} × ${d.bindus} = ${d.product}</td>
                    </tr>
                  `).join('')}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="text-align:right;">இராசி பிண்டம் கூட்டுத் தொகை:</td>
                    <td style="color:#ffd700; font-family:monospace;">${suite.rasiPindam.total}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Table 2: Graha Pinda Multiplication -->
          <div class="ashta-table-card">
            <div class="ashta-table-title">
              <span>🪐 கிரக பிண்டக் கணக்கீடு (Graha Pinda)</span>
              <span style="font-size:0.75rem; color:#ec4899;">மொத்தம்: ${suite.grahaPindam.total}</span>
            </div>
            <div style="overflow-x:auto;">
              <table class="ashta-styled-table">
                <thead>
                  <tr>
                    <th>கிரகம்</th>
                    <th>அமர்ந்த ராசி</th>
                    <th>பெருக்கல் எண்</th>
                    <th>பரல்</th>
                    <th>பெருக்கல் பலன்</th>
                  </tr>
                </thead>
                <tbody>
                  ${suite.grahaPindam.details.map(d => `
                    <tr>
                      <td style="font-weight:700; text-align:left; color:#fff;">
                        <span>${d.icon}</span> ${d.name}
                      </td>
                      <td style="color:#ffd700;">${d.rasiName}</td>
                      <td>${d.gunakara}</td>
                      <td style="font-family:monospace; font-weight:700;">${d.bindus}</td>
                      <td style="color:#ec4899; font-weight:700; font-family:monospace;">${d.gunakara} × ${d.bindus} = ${d.product}</td>
                    </tr>
                  `).join('')}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="4" style="text-align:right;">கிரக பிண்டம் கூட்டுத் தொகை:</td>
                    <td style="color:#ffd700; font-family:monospace;">${suite.grahaPindam.total}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

        </div>

        <!-- 5. 8x12 BAV Matrix Grid (அஷ்டகவர்க்க பரல் விரிவு அட்டவணை) -->
        <div class="ashta-matrix-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; flex-wrap:wrap; gap:6px;">
            <div style="font-size:0.95rem; font-weight:700; color:var(--gold-light);">
              📊 ${PLANET_META[activePlanet].tamil} அஷ்டகவர்க்க பரல் அட்டவணை (8 Contributors × 12 Rasis Matrix)
            </div>
            <span class="badge badge-gold" style="font-size:0.72rem;">மொத்தப் புள்ளிகள்: ${suite.bav.total}</span>
          </div>

          <div style="overflow-x:auto;">
            <table class="ashta-matrix-table">
              <thead>
                <tr>
                  <th style="text-align:left;">மூலம் (Source)</th>
                  ${[1,2,3,4,5,6,7,8,9,10,11,12].map(r => `<th>${RASI_NAMES_TAMIL[r].substring(0, 3)}</th>`).join('')}
                  <th>கூட்டு</th>
                </tr>
              </thead>
              <tbody>
                ${["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Lagna"].map(src => {
                  const sName = src === "Lagna" ? "லக்கினம்" : PLANET_META[src].tamil;
                  const sIcon = src === "Lagna" ? "🌅" : PLANET_META[src].icon;
                  let rowSum = 0;
                  const cells = [1,2,3,4,5,6,7,8,9,10,11,12].map(r => {
                    const pt = suite.bav.matrix[src][r] || 0;
                    rowSum += pt;
                    return `<td class="${pt === 1 ? 'point-one' : 'point-zero'}">${pt}</td>`;
                  }).join('');

                  return `
                    <tr>
                      <td style="text-align:left; font-weight:600; color:#cbd5e1;">${sIcon} ${sName}</td>
                      ${cells}
                      <td style="font-weight:700; color:#ffd700;">${rowSum}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td style="text-align:left;">ஆதிப்பரல் மொத்தம்</td>
                  ${[1,2,3,4,5,6,7,8,9,10,11,12].map(r => `<td>${suite.bav.bindus[r]}</td>`).join('')}
                  <td>${suite.bav.total}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- 6. Astrological Predictions & Timing Cards -->
        <div class="ashta-predict-grid">

          <!-- Card 1: Longevity & Nakshatrayu -->
          <div class="ashta-predict-card card-longevity">
            <div class="ashta-predict-header">
              <span style="font-size:1.1rem;">⏳</span>
              <span>ஆயுள் &amp; பிண்டப் புள்ளி கணிதம்</span>
            </div>
            <div class="ashta-predict-body">
              சோத்திய பிண்டம் (<strong>${suite.shodhyaPindam}</strong>) × 7 ÷ 27 முறையில் கணக்கிடப்படும் பிண்டப் புள்ளி: 
              <div style="font-size:1.25rem; font-weight:800; color:#38bdf8; margin:6px 0;">
                ${pred.longevityYears} ஆண்டுகள்
              </div>
              நட்சத்திர மீதி எண்: <strong>${pred.targetNakshatraId}</strong>. நக்ஷத்ராயு முறையில் இது ஆயுள் பலம் மற்றும் திசா தர்பண பலன்களைத் தீர்மானிக்கிறது.
            </div>
          </div>

          <!-- Card 2: Jupiter Transit Window -->
          <div class="ashta-predict-card card-auspicious">
            <div class="ashta-predict-header">
              <span style="font-size:1.1rem;">🌟</span>
              <span>குரு பெயர்ச்சி சுப காலம் (Jupiter Timing)</span>
            </div>
            <div class="ashta-predict-body">
              ${pred.planetName} சோத்திய பிண்ட ராசியான <strong>${pred.pindaRasi}</strong> அல்லது அதன் திரிகோண ராசிகளான:
              <div style="margin:6px 0; display:flex; gap:6px; flex-wrap:wrap;">
                ${pred.trineRasis.map(r => `<span class="ashta-badge-tag" style="background:rgba(16,185,129,0.25); color:#34d399; border:1px solid rgba(16,185,129,0.4);">${r}</span>`).join('')}
              </div>
              கோச்சார குரு பகவான் இந்நகர்வுகளைத் தொடும் போது ஜாதகருக்கு காரக சுப பலன்கள் (திருமணம், வேலை, யோகம், சொத்து லாபம்) கைகூடும்.
            </div>
          </div>

          <!-- Card 3: Saturn Transit Caution -->
          <div class="ashta-predict-card card-caution">
            <div class="ashta-predict-header">
              <span style="font-size:1.1rem;">⚠️</span>
              <span>சனி பெயர்ச்சி விழிப்புணர்வு காலம்</span>
            </div>
            <div class="ashta-predict-body">
              பிண்ட ராசியிலிருந்து 7 அல்லது 8-ஆம் வீடுகளான:
              <div style="margin:6px 0; display:flex; gap:6px; flex-wrap:wrap;">
                ${pred.cautionRasis.map(r => `<span class="ashta-badge-tag" style="background:rgba(239,68,68,0.25); color:#fca5a5; border:1px solid rgba(239,68,68,0.4);">${r}</span>`).join('')}
              </div>
              இந்ராசிகளில் கோச்சார சனி சஞ்சரிக்கும் காலத்தில் உடல் ஆரோக்கியம், தொழில் முதலீடுகள் மற்றும் பயணங்களில் விழிப்புணர்வுடன் இருத்தல் நலம்.
            </div>
          </div>

        </div>

      </div>
    `;

    container.innerHTML = html;
    attachEventHandlers(container);
  }

  /**
   * Renders Sarvashtakavarga (SAV - 337 points) Master View
   */
  function renderSAVView(container, positions) {
    const savData = calculateSAV(positions);
    const sav = savData.sav;
    const currentNative = getCurrentNativeInfo();

    let html = `
      <div class="ashta-container">
        <!-- Toolbar Card -->
        <div class="ashta-toolbar-card">
          <div class="ashta-toolbar-header">
            <div class="ashta-title-group">
              <div class="ashta-title-icon">👑</div>
              <div>
                <h2 class="ashta-title-text">சர்வாஷ்டகவர்க்கம் (Sarvashtakavarga Master - 337 புள்ளிகள்)</h2>
                <div class="ashta-subtitle">7 கிரகங்களின் மொத்த பலம் • 12 ராசிகளின் சுபத்துவ யோக அளவு</div>
              </div>
            </div>

            <button class="btn btn-sm btn-gold" id="btnToggleAshtaBirthForm" style="display:flex; align-items:center; gap:6px; font-weight:700;">
              <span>🎂</span>
              <span>பிறந்த விவரங்கள் மூலம் ஜாதகம் கணிக்க (Birth Chart Calculator)</span>
              <span id="ashtaBirthChevron" style="font-size:0.75rem; margin-left:2px;">${isBirthFormOpen ? '▲' : '▼'}</span>
            </button>
          </div>

          <!-- Birth Details Calculation Card (பிறந்த விவரங்கள் மூலம் ஜாதகம் கணிக்க) -->
          ${renderBirthCalculatorCard(currentNative)}

          <!-- Planet Selector Pills -->
          <div class="ashta-planet-pills">
            ${PLANET_KEYS.map(pk => {
              const m = PLANET_META[pk];
              return `
                <button class="ashta-planet-btn" data-planet="${pk}">
                  <span>${m.icon}</span>
                  <span>${m.tamil}</span>
                  <span class="badge-pill-pts">${m.pts}</span>
                </button>
              `;
            }).join('')}
            <button class="ashta-planet-btn active" data-planet="SAV">
              <span>👑</span>
              <span>சர்வாஷ்டகவர்க்கம் (SAV)</span>
              <span class="badge-pill-pts">337</span>
            </button>
          </div>
        </div>

        <!-- Master SAV South Indian Chart -->
        <div style="max-width:500px; margin:0 auto; width:100%;">
          <div class="ashta-chart-card">
            <div class="ashta-chart-card-header">
              <div class="ashta-chart-title">
                <span>☸️</span>
                <span>சர்வாஷ்டகவர்க்க சக்கரம் (SAV 337 Grid)</span>
              </div>
              <span class="ashta-chart-badge badge-gold">மொத்தம்: 337</span>
            </div>
            ${renderMiniSouthGrid(sav, {
              hubTitle: "சர்வாஷ்டக",
              hubTotal: "337",
              hubDesc: "12 ராசி பலம்",
              positions: positions
            })}
          </div>
        </div>

        <!-- Sukra Ashtakavarga Marriage Timing Rule (சுக்கிரன் திருமண கால நிர்ணயக் கார்டு) -->
        ${renderSukraMarriageCard(positions, "board")}

        <!-- Master SAV Table -->
        <div class="ashta-table-card">
          <div class="ashta-table-title">
            <span>📊 7 கிரகங்களின் அஷ்டகவர்க்கப் பங்கீடு (SAV Master Table)</span>
            <span style="color:#ffd700; font-family:monospace;">மொத்தம்: 337 / 337</span>
          </div>

          <div style="overflow-x:auto;">
            <table class="ashta-matrix-table">
              <thead>
                <tr>
                  <th style="text-align:left;">கிரகம் (Planet)</th>
                  ${[1,2,3,4,5,6,7,8,9,10,11,12].map(r => `<th>${RASI_NAMES_TAMIL[r].substring(0, 3)}</th>`).join('')}
                  <th>மொத்தம்</th>
                </tr>
              </thead>
              <tbody>
                ${PLANET_KEYS.map(pk => {
                  const m = PLANET_META[pk];
                  const bavRes = savData.allBAV[pk];
                  return `
                    <tr>
                      <td style="text-align:left; font-weight:700; color:#fff;">${m.icon} ${m.tamil}</td>
                      ${[1,2,3,4,5,6,7,8,9,10,11,12].map(r => `<td>${bavRes.bindus[r]}</td>`).join('')}
                      <td style="font-weight:700; color:#ffd700;">${m.pts}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td style="text-align:left; font-weight:800;">சர்வாஷ்டக கூட்டு (SAV)</td>
                  ${[1,2,3,4,5,6,7,8,9,10,11,12].map(r => {
                    const pts = sav[r];
                    let col = "#fff";
                    if (pts >= 30) col = "#34d399";
                    else if (pts < 25) col = "#f87171";
                    else col = "#ffd700";
                    return `<td style="color:${col}; font-weight:800; font-size:0.9rem;">${pts}</td>`;
                  }).join('')}
                  <td style="color:#ffd700; font-size:1rem;">337</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style="margin-top:1rem; display:flex; gap:1rem; flex-wrap:wrap; font-size:0.75rem; color:#94a3b8;">
            <div style="display:flex; align-items:center; gap:5px;">
              <span style="display:inline-block; width:10px; height:10px; background:#34d399; border-radius:2px;"></span>
              <span><strong>30+ புள்ளிகள்:</strong> அதி உன்னத சுப ஸ்தானம் (வலுவான யோகம்)</span>
            </div>
            <div style="display:flex; align-items:center; gap:5px;">
              <span style="display:inline-block; width:10px; height:10px; background:#ffd700; border-radius:2px;"></span>
              <span><strong>28 - 29 புள்ளிகள்:</strong> நடுத்தர சுப பலம்</span>
            </div>
            <div style="display:flex; align-items:center; gap:5px;">
              <span style="display:inline-block; width:10px; height:10px; background:#f87171; border-radius:2px;"></span>
              <span><strong>25-க்கும் கீழ்:</strong> பலவீன ஸ்தானம் (கவனமுடன் செயல்படவும்)</span>
            </div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
    attachEventHandlers(container);
  }

  /**
   * Helper to render a 4x4 South Indian Mini Chart Grid
   */
  function renderMiniSouthGrid(bindusMap, opts) {
    const rasiOrder = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    let cellsHtml = "";
    rasiOrder.forEach(rId => {
      const pts = bindusMap[rId] !== undefined ? bindusMap[rId] : 0;
      let ptsClass = "";
      if (pts >= 5) ptsClass = "high-pts";
      else if (pts <= 1) ptsClass = "low-pts";

      // Render occupied planets if positions are passed
      let planetsHtml = "";
      if (opts.positions) {
        const occupied = [];
        for (const [pKey, occRasi] of Object.entries(opts.positions)) {
          if (occRasi === rId) {
            let label = pKey;
            let cls = "";
            if (pKey === "Lagna") { label = "லக்"; cls = "pchip-guru"; }
            else if (pKey === "Sun") { label = "சூரி"; cls = "pchip-surya"; }
            else if (pKey === "Moon") { label = "சந்"; cls = "pchip-surya"; }
            else if (pKey === "Mars") { label = "செவ்"; cls = "pchip-sevvai"; }
            else if (pKey === "Mercury") { label = "புத"; cls = "pchip-guru"; }
            else if (pKey === "Jupiter") { label = "குரு"; cls = "pchip-guru"; }
            else if (pKey === "Venus") { label = "சுக்"; cls = "pchip-guru"; }
            else if (pKey === "Saturn") { label = "சனி"; cls = "pchip-sani"; }
            else if (pKey === "Rahu") { label = "ரா"; cls = "pchip-sani"; }
            else if (pKey === "Ketu") { label = "கே"; cls = "pchip-sani"; }
            occupied.push(`<span class="ashta-pchip ${cls}">${label}</span>`);
          }
        }
        if (occupied.length > 0) {
          planetsHtml = `<div class="ashta-cell-planets">${occupied.join('')}</div>`;
        }
      }

      cellsHtml += `
        <div class="ashta-grid-cell" style="${SOUTH_AREAS[rId]}">
          <div class="ashta-cell-header">
            <span class="ashta-cell-rasi">${RASI_NAMES_TAMIL[rId]}</span>
            <span style="font-size:0.55rem; opacity:0.6;">${rId}</span>
          </div>
          <div class="ashta-cell-bindu ${ptsClass}">${pts}</div>
          ${planetsHtml}
        </div>
      `;
    });

    // Center Hub
    const hubHtml = `
      <div class="ashta-center-hub">
        <div class="ashta-hub-title">${opts.hubTitle}</div>
        <div class="ashta-hub-total">${opts.hubTotal}</div>
        <div class="ashta-hub-desc">${opts.hubDesc}</div>
      </div>
    `;

    return `
      <div class="ashta-south-grid">
        ${cellsHtml}
        ${hubHtml}
      </div>
    `;
  }

  /**
   * Helper to retrieve current native info from chart or input fields
   */
  function getCurrentNativeInfo() {
    const fromChart = window.PGAstro && window.PGAstro.chart && window.PGAstro.chart.getNativeInfo();
    const dInput = document.getElementById("birthCalcDate");
    const tInput = document.getElementById("birthCalcTime");
    const nInput = document.getElementById("birthCalcName");
    const gInput = document.getElementById("birthCalcGender");
    const pSel = document.getElementById("birthCalcPlaceSelect");
    const pCust = document.getElementById("birthCalcPlaceCustom");

    let dob = fromChart?.dob || dInput?.value;
    let time = fromChart?.time || tInput?.value;
    let name = fromChart?.name || nInput?.value;
    let gender = fromChart?.gender || gInput?.value;
    let placeKey = pSel?.value;
    let customPlace = pCust?.value || fromChart?.place;

    if (!dob) dob = "1988-04-30";
    if (!time) time = "12:00";
    if (!name) name = "";
    if (!gender) gender = "male";
    if (!placeKey) placeKey = "tiruvannamalai";

    return { name, gender, dob, time, placeKey, customPlace };
  }

  /**
   * Helper to render city options for place selector
   */
  function renderCityOptions(selectedKey) {
    const cities = window.PGAstro?.astronomy?.CITIES || {
      "tiruvannamalai": { name: "திருவண்ணாமலை (Tiruvannamalai)" },
      "chennai": { name: "சென்னை (Chennai)" },
      "madurai": { name: "மதுரை (Madurai)" },
      "coimbatore": { name: "கோயம்புத்தூர் (Coimbatore)" },
      "trichy": { name: "திருச்சி (Tiruchirappalli)" },
      "salem": { name: "சேலம் (Salem)" },
      "tiruppur": { name: "திருப்பூர் (Tiruppur)" },
      "erode": { name: "ஈரோடு (Erode)" },
      "karur": { name: "கரூர் (Karur)" }
    };

    let html = `<option value="">-- பிறந்த இடம் தேர்வு செய்யவும் (Select Place) --</option>`;
    for (let k in cities) {
      const c = cities[k];
      const isSel = (k === selectedKey || (!selectedKey && k === "tiruvannamalai")) ? "selected" : "";
      html += `<option value="${k}" ${isSel}>${c.name}</option>`;
    }
    return html;
  }

  /**
   * Render Birth Chart Calculator Card inside Ashtakavarga
   */
  function renderBirthCalculatorCard(n) {
    return `
      <div class="cosmic-card highlight ashta-birth-card" id="ashtaBirthCard" style="${isBirthFormOpen ? '' : 'display:none;'} margin: 0.85rem 0 1rem 0; border: 1px solid rgba(212, 175, 55, 0.45); background: radial-gradient(circle at top left, #141c36 0%, #0a0e1c 100%); padding: 0.9rem 1rem;">
        <div class="card-header" style="margin-bottom: 0.65rem; padding-bottom: 0.45rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div class="card-title-group" style="display:flex; align-items:center; gap:0.5rem;">
            <div class="card-title-icon" style="font-size: 1.15rem;">🎂</div>
            <div>
              <h3 class="card-title" style="font-size: 1rem; margin: 0; color: var(--gold-primary);">பிறந்த விவரங்கள் மூலம் ஜாதகம் கணிக்க (Birth Chart Calculator)</h3>
              <div class="card-subtitle" style="font-size: 0.73rem; color: var(--text-muted);">பெயர், பிறந்த தேதி, நேரம் மற்றும் இடத்தை உள்ளிட்டு துல்லியமாக அஷ்டகவர்க்கம் &amp; சோத்திய பிண்டத்தை கணிக்கவும்</div>
            </div>
          </div>
          <span class="badge badge-gold" style="font-size: 0.7rem;">துல்லிய கணிதம்</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.75rem; margin-bottom: 0.85rem;">
          <div>
            <label style="font-size: 0.76rem; color: var(--gold-light); display: block; margin-bottom: 3px; font-weight: 600;">ஜாதகர் பெயர் (Name):</label>
            <input type="text" id="ashtaBirthName" value="${n.name}" placeholder="எ.கா: சுந்தர் / பிரியா" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); padding: 0.45rem 0.65rem; border-radius: var(--radius-md, 6px); color: #fff; width: 100%; font-size: 0.82rem;">
          </div>
          <div>
            <label style="font-size: 0.76rem; color: var(--gold-light); display: block; margin-bottom: 3px; font-weight: 600;">பாலினம் (Gender):</label>
            <select id="ashtaBirthGender" style="background: #0d1224; border: 1px solid rgba(255,255,255,0.15); padding: 0.45rem 0.65rem; border-radius: var(--radius-md, 6px); color: #fff; width: 100%; font-size: 0.82rem;">
              <option value="male" ${n.gender === 'male' ? 'selected' : ''}>ஆண் (Male)</option>
              <option value="female" ${n.gender === 'female' ? 'selected' : ''}>பெண் (Female)</option>
              <option value="other" ${n.gender === 'other' ? 'selected' : ''}>மற்றவை (Other)</option>
            </select>
          </div>
          <div>
            <label style="font-size: 0.76rem; color: var(--gold-light); display: block; margin-bottom: 3px; font-weight: 600;">பிறந்த தேதி (Date of Birth) *:</label>
            <input type="date" id="ashtaBirthDate" value="${n.dob}" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); padding: 0.4rem 0.65rem; border-radius: var(--radius-md, 6px); color: #fff; width: 100%; font-size: 0.82rem;">
          </div>
          <div>
            <label style="font-size: 0.76rem; color: var(--gold-light); display: block; margin-bottom: 3px; font-weight: 600;">பிறந்த நேரம் (Time of Birth):</label>
            <input type="time" id="ashtaBirthTime" value="${n.time}" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); padding: 0.4rem 0.65rem; border-radius: var(--radius-md, 6px); color: #fff; width: 100%; font-size: 0.82rem;">
          </div>
          <div>
            <label style="font-size: 0.76rem; color: var(--gold-light); display: block; margin-bottom: 3px; font-weight: 600;">பிறந்த இடம் (Place of Birth):</label>
            <select id="ashtaBirthPlaceSelect" style="background: #0d1224; border: 1px solid rgba(255,255,255,0.15); padding: 0.45rem 0.65rem; border-radius: var(--radius-md, 6px); color: #fff; width: 100%; margin-bottom: 4px; font-size: 0.82rem;">
              ${renderCityOptions(n.placeKey)}
            </select>
            <input type="text" id="ashtaBirthPlaceCustom" list="citiesDatalist" value="${n.customPlace || ''}" placeholder="அல்லது நகரம் தட்டச்சு செய்க 🔍" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); padding: 0.3rem 0.55rem; border-radius: var(--radius-sm, 4px); color: #fff; width: 100%; font-size: 0.76rem;">
          </div>
        </div>

        <div style="display: flex; gap: 0.6rem; flex-wrap: wrap;">
          <button class="btn btn-gold" id="btnAshtaCalculateHoroscope" style="flex: 1; min-width: 200px; font-weight: 700; font-size: 0.82rem;">
            <span>🌟</span> ஜாதகம் கணிக்க (Calculate Horoscope)
          </button>
          <button class="btn btn-outline-gold" id="btnAshtaSetCurrentNow" style="font-size: 0.8rem;">
            <span>⏱️</span> தற்போதைய நேரம் (Current Now)
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Execute Horoscope Calculation from Birth Chart Calculator
   */
  function executeAshtaBirthCalculation() {
    const container = document.getElementById("tab_ashtakavarga");
    const name = container?.querySelector("#ashtaBirthName")?.value.trim() || "அன்பர் (Native)";
    const gender = container?.querySelector("#ashtaBirthGender")?.value || "male";
    const date = container?.querySelector("#ashtaBirthDate")?.value || "1977-04-03";
    const time = container?.querySelector("#ashtaBirthTime")?.value || "07:27";
    const placeSel = container?.querySelector("#ashtaBirthPlaceSelect")?.value;
    const placeCust = container?.querySelector("#ashtaBirthPlaceCustom")?.value.trim();

    let lat = 10.9601; // default Karur
    let lon = 78.0766;
    let placeName = "கரூர் (Karur)";

    const cities = window.PGAstro?.astronomy?.CITIES || {};
    if (placeCust) {
      placeName = placeCust;
      const rawLower = placeCust.toLowerCase();
      for (let k in cities) {
        if (cities[k].name && cities[k].name.toLowerCase().includes(rawLower)) {
          lat = cities[k].lat;
          lon = cities[k].lon;
          break;
        }
      }
    } else if (placeSel && cities[placeSel]) {
      lat = cities[placeSel].lat;
      lon = cities[placeSel].lon;
      placeName = cities[placeSel].name;
    }

    // Sync back to Tab 1 form inputs if present
    const t1Name = document.getElementById("birthCalcName");
    const t1Gender = document.getElementById("birthCalcGender");
    const t1Date = document.getElementById("birthCalcDate");
    const t1Time = document.getElementById("birthCalcTime");
    const t1PlaceSel = document.getElementById("birthCalcPlaceSelect");
    const t1PlaceCust = document.getElementById("birthCalcPlaceCustom");
    if (t1Name) t1Name.value = name;
    if (t1Gender) t1Gender.value = gender;
    if (t1Date) t1Date.value = date;
    if (t1Time) t1Time.value = time;
    if (t1PlaceSel && placeSel) t1PlaceSel.value = placeSel;
    if (t1PlaceCust) t1PlaceCust.value = placeCust || "";

    const nativeInfo = {
      name: name,
      gender: gender,
      dob: date,
      time: time,
      place: placeName
    };

    if (window.PGAstro?.astronomy && window.PGAstro?.chart) {
      const computed = window.PGAstro.astronomy.calculateSiderealPlanets(date, time, lat, lon);
      window.PGAstro.chart.setBirthHoroscope(computed, nativeInfo);
    }

    customNativePositions = null; // Use newly calculated chart
    render();

    if (window.PGAstroUI && window.PGAstroUI.showToast) {
      window.PGAstroUI.showToast(`🌟 ${name} அவர்களின் பிறந்த நாள் ஜாதகம் & அஷ்டகவர்க்கம் துல்லியமாக கணிக்கப்பட்டது!`);
    }
  }

  /**
   * Attach Interactive Event Listeners (Planet tabs, Method switch, Birth Chart Calculator)
   */
  function attachEventHandlers(container) {
    // Planet buttons
    container.querySelectorAll(".ashta-planet-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const p = btn.dataset.planet;
        if (p) {
          activePlanet = p;
          render();
        }
      });
    });

    // Method switcher buttons
    container.querySelectorAll(".ashta-method-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const m = btn.dataset.method;
        if (m) {
          activeMethod = m;
          render();
        }
      });
    });

    // Toggle Birth Form Button
    container.querySelectorAll("#btnToggleAshtaBirthForm").forEach(btn => {
      btn.addEventListener("click", () => {
        isBirthFormOpen = !isBirthFormOpen;
        const formCard = container.querySelector("#ashtaBirthCard");
        const chevron = container.querySelector("#ashtaBirthChevron");
        if (formCard) formCard.style.display = isBirthFormOpen ? "" : "none";
        if (chevron) chevron.textContent = isBirthFormOpen ? "▲" : "▼";
      });
    });

    // Calculate Horoscope from Birth Form
    const calcBtn = container.querySelector("#btnAshtaCalculateHoroscope");
    if (calcBtn) {
      calcBtn.addEventListener("click", () => {
        executeAshtaBirthCalculation();
      });
    }

    // Set Current Now
    const nowBtn = container.querySelector("#btnAshtaSetCurrentNow");
    if (nowBtn) {
      nowBtn.addEventListener("click", () => {
        const dInput = container.querySelector("#ashtaBirthDate");
        const tInput = container.querySelector("#ashtaBirthTime");
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, "0");
        const d = String(now.getDate()).padStart(2, "0");
        const hh = String(now.getHours()).padStart(2, "0");
        const mm = String(now.getMinutes()).padStart(2, "0");
        if (dInput) dInput.value = `${y}-${m}-${d}`;
        if (tInput) tInput.value = `${hh}:${mm}`;
        executeAshtaBirthCalculation();
      });
    }


    // 6 Shodhya Life Event Selection Tabs
    container.querySelectorAll(".ashta-event-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const ev = btn.dataset.event;
        if (ev && SHODHYA_EVENT_CONFIGS[ev]) {
          activeShodhyaEvent = ev;
          isEventCustomOpen = false;
          render();
          const cfg = SHODHYA_EVENT_CONFIGS[ev];
          if (window.PGAstroUI && window.PGAstroUI.showToast) {
            window.PGAstroUI.showToast(`${cfg.icon} ${cfg.title} கணக்கீடு திரைக்கு கொண்டுவரப்பட்டது!`);
          }
        }
      });
    });

    // Event Mode Buttons (Classroom, Current, Custom)
    const btnEventClassroom = container.querySelector("#btnEventModeClassroom") || container.querySelector("#btnSukraModeClassroom");
    if (btnEventClassroom) {
      btnEventClassroom.addEventListener("click", () => {
        shodhyaEventMode = "classroom";
        const cfg = SHODHYA_EVENT_CONFIGS[activeShodhyaEvent];
        customEventParams[activeShodhyaEvent] = { ...cfg.defaultClassroom };
        isEventCustomOpen = false;
        render();
        if (window.PGAstroUI && window.PGAstroUI.showToast) {
          window.PGAstroUI.showToast(`🎯 வகுப்பு மாதிரி: ${cfg.title} (${cfg.defaultClassroom.shodhyaPindam} × ${cfg.defaultClassroom.houseParal}) ஏற்றப்பட்டது!`);
        }
      });
    }

    const btnEventCurrent = container.querySelector("#btnEventModeCurrent") || container.querySelector("#btnSukraModeCurrent");
    if (btnEventCurrent) {
      btnEventCurrent.addEventListener("click", () => {
        shodhyaEventMode = "current";
        isEventCustomOpen = false;
        render();
        const cfg = SHODHYA_EVENT_CONFIGS[activeShodhyaEvent];
        if (window.PGAstroUI && window.PGAstroUI.showToast) {
          window.PGAstroUI.showToast(`🌟 தற்போதைய ஜாதகத்தின் ${cfg.title} கணிதம் புதுப்பிக்கப்பட்டது!`);
        }
      });
    }

    const btnEventCustom = container.querySelector("#btnEventModeCustom") || container.querySelector("#btnSukraModeCustom");
    if (btnEventCustom) {
      btnEventCustom.addEventListener("click", () => {
        shodhyaEventMode = "custom";
        isEventCustomOpen = !isEventCustomOpen;
        const panel = container.querySelector("#ashtaEventCustomPanel") || container.querySelector("#ashtaSukraCustomPanel");
        if (panel) panel.style.display = isEventCustomOpen ? "" : "none";
      });
    }

    // Paksha Toggle Buttons in Hero Banner
    const btnPakshaValar = container.querySelector("#btnTogglePakshaValarpirai");
    if (btnPakshaValar) {
      btnPakshaValar.addEventListener("click", () => {
        if (!customEventParams[activeShodhyaEvent]) {
          customEventParams[activeShodhyaEvent] = { ...SHODHYA_EVENT_CONFIGS[activeShodhyaEvent].defaultClassroom };
        }
        customEventParams[activeShodhyaEvent].paksha = "valarpirai";
        render();
        if (window.PGAstroUI && window.PGAstroUI.showToast) {
          window.PGAstroUI.showToast("🌓 வளர்பிறை: அசுவினி முதல் நேராக கணிக்கப்படுகிறது!");
        }
      });
    }

    const btnPakshaThei = container.querySelector("#btnTogglePakshaTheipirai");
    if (btnPakshaThei) {
      btnPakshaThei.addEventListener("click", () => {
        if (!customEventParams[activeShodhyaEvent]) {
          customEventParams[activeShodhyaEvent] = { ...SHODHYA_EVENT_CONFIGS[activeShodhyaEvent].defaultClassroom };
        }
        customEventParams[activeShodhyaEvent].paksha = "theipirai";
        render();
        if (window.PGAstroUI && window.PGAstroUI.showToast) {
          window.PGAstroUI.showToast("🌘 தேய்பிறை: அவிட்டம் முதல் நேராக கணிக்கப்படுகிறது!");
        }
      });
    }

    // Apply Custom Values Button
    const btnApplyCustom = container.querySelector("#btnEventApplyCustom") || container.querySelector("#btnSukraApplyCustom");
    if (btnApplyCustom) {
      btnApplyCustom.addEventListener("click", () => {
        const rasiVal = (container.querySelector("#inputEventPlanetRasi") || container.querySelector("#inputSukraRasi"))?.value;
        const paralVal = (container.querySelector("#inputEventHouseParal") || container.querySelector("#inputSukraSeventhParal"))?.value;
        const pindamVal = (container.querySelector("#inputEventShodhyaPindam") || container.querySelector("#inputSukraShodhyaPindam"))?.value;
        const pakshaVal = (container.querySelector("#inputEventPaksha") || container.querySelector("#inputSukraPaksha"))?.value;
        const cfg = SHODHYA_EVENT_CONFIGS[activeShodhyaEvent];

        shodhyaEventMode = "custom";
        customEventParams[activeShodhyaEvent] = {
          planetRasi: parseInt(rasiVal) || cfg.defaultClassroom.planetRasi,
          houseParal: paralVal !== undefined ? parseInt(paralVal) : cfg.defaultClassroom.houseParal,
          shodhyaPindam: parseInt(pindamVal) || cfg.defaultClassroom.shodhyaPindam,
          paksha: pakshaVal || "valarpirai"
        };
        render();
        if (window.PGAstroUI && window.PGAstroUI.showToast) {
          window.PGAstroUI.showToast(`⚡ ${cfg.title} சுய கணிதப் பலன் புதுப்பிக்கப்பட்டது!`);
        }
      });
    }
  }

  /**
   * Resets Ashtakavarga to live current chart
   */
  function loadWhiteboardSample() {
    activePlanet = "Mars";
    activeMethod = "board";
    customNativePositions = null;
    render();
  }

  // Public API
  window.PGAstroAshtakavarga = {
    render: render,
    calculateBAV: calculateBAV,
    calculateSAV: calculateSAV,
    calculateFullSuite: calculateFullSuite,
    calculateShodhyaEventTimingRule: calculateShodhyaEventTimingRule,
    calculateSukraMarriageRule: calculateSukraMarriageRule,
    renderShodhyaEventsCard: renderShodhyaEventsCard,
    loadWhiteboardSample: loadWhiteboardSample,
    setPlanet: (p) => { activePlanet = p; render(); },
    setMethod: (m) => { activeMethod = m; render(); },
    setShodhyaEvent: (e) => { activeShodhyaEvent = e; render(); },
    onHoroscopeUpdated: () => {
      customNativePositions = null; // Use new live chart
      render();
    },
    BAV_RULES,
    RASI_GUNAKARAS,
    GRAHA_GUNAKARAS,
    NAKSHATRA_DATA,
    SHODHYA_EVENT_CONFIGS,
    SATURN_TRANSITS_CYCLE,
    DEFAULT_CHART
  };

})();
