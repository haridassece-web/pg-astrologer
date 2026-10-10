// PG Astro - Planetary & Lagna Astrological Calculation Engine
// Sidereal (Nirayana) / Lahiri Ayanamsa Calculations from Birth Details

window.PGAstro = window.PGAstro || {};

(function() {
  // Cities coordinates (Latitude, Longitude, Group)
  const CITIES = {
    // -------------------------------------------------------------
    // 1. TAMIL NADU - ALL 38 DISTRICTS & MAJOR TOWNS
    // -------------------------------------------------------------
    "ariyalur": { name: "அரியலூர் (Ariyalur)", lat: 11.1401, lon: 79.0786, group: "tn" },
    "chengalpattu": { name: "செங்கல்பட்டு (Chengalpattu)", lat: 12.6841, lon: 79.9836, group: "tn" },
    "chennai": { name: "சென்னை (Chennai)", lat: 13.0827, lon: 80.2707, group: "tn" },
    "coimbatore": { name: "கோயம்புத்தூர் (Coimbatore)", lat: 11.0168, lon: 76.9558, group: "tn" },
    "cuddalore": { name: "கடலூர் (Cuddalore)", lat: 11.7480, lon: 79.7714, group: "tn" },
    "dharmapuri": { name: "தருமபுரி (Dharmapuri)", lat: 12.1211, lon: 78.1582, group: "tn" },
    "dindigul": { name: "திண்டுக்கல் (Dindigul)", lat: 10.3673, lon: 77.9803, group: "tn" },
    "erode": { name: "ஈரோடு (Erode)", lat: 11.3410, lon: 77.7172, group: "tn" },
    "kallakurichi": { name: "கள்ளக்குறிச்சி (Kallakurichi)", lat: 11.7384, lon: 78.9639, group: "tn" },
    "kanchipuram": { name: "காஞ்சிபுரம் (Kanchipuram)", lat: 12.8342, lon: 79.7036, group: "tn" },
    "kanyakumari": { name: "கன்னியாகுமரி / நாகர்கோவில் (Kanyakumari / Nagercoil)", lat: 8.1833, lon: 77.4119, group: "tn" },
    "karur": { name: "கரூர் (Karur)", lat: 10.9601, lon: 78.0766, group: "tn" },
    "krishnagiri": { name: "கிருஷ்ணகிரி (Krishnagiri)", lat: 12.5186, lon: 78.2137, group: "tn" },
    "madurai": { name: "மதுரை (Madurai)", lat: 9.9252, lon: 78.1198, group: "tn" },
    "mayiladuthurai": { name: "மயிலாடுதுறை (Mayiladuthurai)", lat: 11.1018, lon: 79.6522, group: "tn" },
    "nagapattinam": { name: "நாகப்பட்டினம் (Nagapattinam)", lat: 10.7672, lon: 79.8449, group: "tn" },
    "namakkal": { name: "நாமக்கல் (Namakkal)", lat: 11.2189, lon: 78.1674, group: "tn" },
    "nilgiris": { name: "நீலகிரி / ஊட்டி (Nilgiris / Ooty)", lat: 11.4102, lon: 76.6950, group: "tn" },
    "perambalur": { name: "பெரம்பலூர் (Perambalur)", lat: 11.2342, lon: 78.8820, group: "tn" },
    "pudukkottai": { name: "புதுக்கோட்டை (Pudukkottai)", lat: 10.3797, lon: 78.8202, group: "tn" },
    "ramanathapuram": { name: "இராமநாதபுரம் (Ramanathapuram)", lat: 9.3639, lon: 78.8395, group: "tn" },
    "ranipet": { name: "இராணிப்பேட்டை (Ranipet)", lat: 12.9299, lon: 79.3326, group: "tn" },
    "salem": { name: "சேலம் (Salem)", lat: 11.6643, lon: 78.1460, group: "tn" },
    "sivaganga": { name: "சிவகங்கை (Sivaganga)", lat: 9.8478, lon: 78.4820, group: "tn" },
    "tenkasi": { name: "தென்காசி (Tenkasi)", lat: 8.9594, lon: 77.3150, group: "tn" },
    "thanjavur": { name: "தஞ்சாவூர் (Thanjavur)", lat: 10.7870, lon: 79.1378, group: "tn" },
    "theni": { name: "தேனி (Theni)", lat: 10.0104, lon: 77.4768, group: "tn" },
    "thoothukudi": { name: "தூத்துக்குடி (Thoothukudi / Tuticorin)", lat: 8.7642, lon: 78.1348, group: "tn" },
    "trichy": { name: "திருச்சி (Tiruchirappalli / Trichy)", lat: 10.7905, lon: 78.7047, group: "tn" },
    "tirunelveli": { name: "திருநெல்வேலி (Tirunelveli)", lat: 8.7139, lon: 77.7567, group: "tn" },
    "tirupathur": { name: "திருப்பத்தூர் (Tirupathur)", lat: 12.4927, lon: 78.5684, group: "tn" },
    "tiruppur": { name: "திருப்பூர் (Tiruppur)", lat: 11.1085, lon: 77.3411, group: "tn" },
    "tiruvallur": { name: "திருவள்ளூர் (Tiruvallur)", lat: 13.1432, lon: 79.9087, group: "tn" },
    "tiruvannamalai": { name: "திருவண்ணாமலை (Tiruvannamalai)", lat: 12.2253, lon: 79.0747, group: "tn" },
    "tiruvarur": { name: "திருவாரூர் (Tiruvarur)", lat: 10.7708, lon: 79.6366, group: "tn" },
    "vellore": { name: "வேலூர் (Vellore)", lat: 12.9165, lon: 79.1325, group: "tn" },
    "viluppuram": { name: "விழுப்புரம் (Viluppuram)", lat: 11.9401, lon: 79.4861, group: "tn" },
    "virudhunagar": { name: "விருதுநகர் (Virudhunagar)", lat: 9.5872, lon: 77.9514, group: "tn" },
    "ambur": { name: "ஆம்பூர் (Ambur)", lat: 12.7906, lon: 78.7160, group: "tn" },
    "arakkonam": { name: "அரக்கோணம் (Arakkonam)", lat: 13.0784, lon: 79.6713, group: "tn" },
    "arani": { name: "ஆரணி (Arani)", lat: 12.6687, lon: 79.2847, group: "tn" },
    "chidambaram": { name: "சிதம்பரம் (Chidambaram)", lat: 11.3992, lon: 79.6936, group: "tn" },
    "hosur": { name: "ஓசூர் (Hosur)", lat: 12.7409, lon: 77.8253, group: "tn" },
    "karaikudi": { name: "காரைக்குடி (Karaikudi)", lat: 10.0735, lon: 78.7732, group: "tn" },
    "kodaikanal": { name: "கொடைக்கானல் (Kodaikanal)", lat: 10.2381, lon: 77.4892, group: "tn" },
    "kumbakonam": { name: "கும்பகோணம் (Kumbakonam)", lat: 10.9602, lon: 79.3845, group: "tn" },
    "palani": { name: "பழனி (Palani)", lat: 10.4504, lon: 77.5204, group: "tn" },
    "pollachi": { name: "பொள்ளாச்சி (Pollachi)", lat: 10.6609, lon: 77.0048, group: "tn" },
    "rajapalayam": { name: "ராஜபாளையம் (Rajapalayam)", lat: 9.4533, lon: 77.5540, group: "tn" },
    "rameswaram": { name: "இராமேஸ்வரம் (Rameswaram)", lat: 9.2876, lon: 79.3129, group: "tn" },
    "sivakasi": { name: "சிவகாசி (Sivakasi)", lat: 9.4533, lon: 77.7971, group: "tn" },
    "srirangam": { name: "ஸ்ரீரங்கம் (Srirangam)", lat: 10.8623, lon: 78.6908, group: "tn" },
    "tiruchendur": { name: "திருச்செந்தூர் (Tiruchendur)", lat: 8.4947, lon: 78.1226, group: "tn" },
    "tiruttani": { name: "திருத்தணி (Tiruttani)", lat: 13.1802, lon: 79.6080, group: "tn" },
    "vandavasi": { name: "வந்தவாசி (Vandavasi)", lat: 12.5029, lon: 79.6081, group: "tn" },

    // -------------------------------------------------------------
    // 2. PUDUCHERRY & SOUTH INDIA MAJOR CITIES
    // -------------------------------------------------------------
    "pondicherry": { name: "புதுச்சேரி (Puducherry / Pondicherry)", lat: 11.9416, lon: 79.8083, group: "south" },
    "karaikal": { name: "காரைக்கால் (Karaikal)", lat: 10.9254, lon: 79.8380, group: "south" },
    "bengaluru": { name: "பெங்களூரு (Bengaluru)", lat: 12.9716, lon: 77.5946, group: "south" },
    "mysuru": { name: "மைசூரு (Mysuru / Mysore)", lat: 12.2958, lon: 76.6394, group: "south" },
    "mangaluru": { name: "மங்களூரு (Mangaluru)", lat: 12.9141, lon: 74.8560, group: "south" },
    "hyderabad": { name: "ஹைதராபாத் (Hyderabad)", lat: 17.3850, lon: 78.4867, group: "south" },
    "visakhapatnam": { name: "விசாகப்பட்டினம் (Visakhapatnam)", lat: 17.6868, lon: 83.2185, group: "south" },
    "vijayawada": { name: "விஜயவாடா (Vijayawada)", lat: 16.5062, lon: 80.6480, group: "south" },
    "tirupati": { name: "திருப்பதி (Tirupati)", lat: 13.6288, lon: 79.4192, group: "south" },
    "chittoor": { name: "சித்தூர் (Chittoor)", lat: 13.2172, lon: 79.1003, group: "south" },
    "thiruvananthapuram": { name: "திருவனந்தபுரம் (Thiruvananthapuram / Trivandrum)", lat: 8.5241, lon: 76.9366, group: "south" },
    "kochi": { name: "கொச்சி (Kochi / Cochin)", lat: 9.9312, lon: 76.2673, group: "south" },
    "kozhikode": { name: "கோழிக்கோடு (Kozhikode / Calicut)", lat: 11.2588, lon: 75.7804, group: "south" },
    "thrissur": { name: "திருச்சூர் (Thrissur)", lat: 10.5276, lon: 76.2144, group: "south" },
    "palakkad": { name: "பாலக்காடு (Palakkad)", lat: 10.7867, lon: 76.6548, group: "south" },

    // -------------------------------------------------------------
    // 3. OTHER INDIAN STATES & MAJOR CITIES
    // -------------------------------------------------------------
    "mumbai": { name: "மும்பை (Mumbai)", lat: 19.0760, lon: 72.8777, group: "india" },
    "pune": { name: "பூனே (Pune)", lat: 18.5204, lon: 73.8567, group: "india" },
    "nagpur": { name: "நாக்பூர் (Nagpur)", lat: 21.1458, lon: 79.0882, group: "india" },
    "delhi": { name: "டெல்லி / புது டெல்லி (Delhi / New Delhi)", lat: 28.6139, lon: 77.2090, group: "india" },
    "noida": { name: "நொய்டா (Noida)", lat: 28.5355, lon: 77.3910, group: "india" },
    "gurgaon": { name: "குருகிராம் (Gurugram / Gurgaon)", lat: 28.4595, lon: 77.0266, group: "india" },
    "kolkata": { name: "கொல்கத்தா (Kolkata)", lat: 22.5726, lon: 88.3639, group: "india" },
    "ahmedabad": { name: "அகமதாபாத் (Ahmedabad)", lat: 23.0225, lon: 72.5714, group: "india" },
    "surat": { name: "சூரத் (Surat)", lat: 21.1702, lon: 72.8311, group: "india" },
    "jaipur": { name: "ஜெய்ப்பூர் (Jaipur)", lat: 26.9124, lon: 75.7873, group: "india" },
    "lucknow": { name: "லக்னோ (Lucknow)", lat: 26.8467, lon: 80.9462, group: "india" },
    "varanasi": { name: "வாரணாசி (Varanasi / Kashi)", lat: 25.3176, lon: 82.9739, group: "india" },
    "patna": { name: "பாட்னா (Patna)", lat: 25.5941, lon: 85.1376, group: "india" },
    "bhopal": { name: "போபால் (Bhopal)", lat: 23.2599, lon: 77.4126, group: "india" },
    "indore": { name: "இந்தூர் (Indore)", lat: 22.7196, lon: 75.8577, group: "india" },
    "bhubaneswar": { name: "புபனேஷ்வர் (Bhubaneswar)", lat: 20.2961, lon: 85.8245, group: "india" },
    "chandigarh": { name: "சண்டிகர் (Chandigarh)", lat: 30.7333, lon: 76.7794, group: "india" },
    "amritsar": { name: "அமிர்தசரஸ் (Amritsar)", lat: 31.6340, lon: 74.8723, group: "india" },
    "guwahati": { name: "கௌஹாத்தி (Guwahati)", lat: 26.1445, lon: 91.7362, group: "india" },
    "shimla": { name: "சிம்லா (Shimla)", lat: 31.1048, lon: 77.1734, group: "india" },
    "dehradun": { name: "தேராடூன் (Dehradun)", lat: 30.3165, lon: 78.0322, group: "india" },
    "haridwar": { name: "ஹரித்வார் (Haridwar)", lat: 29.9457, lon: 78.1642, group: "india" },
    "srinagar": { name: "ஸ்ரீநகர் (Srinagar)", lat: 34.0837, lon: 74.7973, group: "india" },
    "ranchi": { name: "ராஞ்சி (Ranchi)", lat: 23.3441, lon: 85.3096, group: "india" },
    "raipur": { name: "ராய்பூர் (Raipur)", lat: 21.2514, lon: 81.6296, group: "india" },
    "goa": { name: "கோவா / பனாஜி (Goa / Panaji)", lat: 15.4909, lon: 73.8278, group: "india" },

    // -------------------------------------------------------------
    // 4. MAJOR WORLD CITIES & TAMIL DIASPORA HUBS
    // -------------------------------------------------------------
    "colombo": { name: "இலங்கை - கொழும்பு (Sri Lanka - Colombo)", lat: 6.9271, lon: 79.8612, group: "global_cities" },
    "jaffna": { name: "இலங்கை - யாழ்ப்பாணம் (Sri Lanka - Jaffna)", lat: 9.6615, lon: 80.0255, group: "global_cities" },
    "kandy": { name: "இலங்கை - கண்டி (Sri Lanka - Kandy)", lat: 7.2906, lon: 80.6337, group: "global_cities" },
    "trincomalee": { name: "இலங்கை - திருகோணமலை (Sri Lanka - Trincomalee)", lat: 8.5874, lon: 81.2152, group: "global_cities" },
    "singapore": { name: "சிங்கப்பூர் (Singapore)", lat: 1.3521, lon: 103.8198, group: "global_cities" },
    "kualalumpur": { name: "மலேசியா - கோலாலம்பூர் (Malaysia - Kuala Lumpur)", lat: 3.1390, lon: 101.6869, group: "global_cities" },
    "penang": { name: "மலேசியா - பினாங்கு (Malaysia - Penang)", lat: 5.4164, lon: 100.3327, group: "global_cities" },
    "dubai": { name: "துபாய் (UAE - Dubai)", lat: 25.2048, lon: 55.2708, group: "global_cities" },
    "abudhabi": { name: "அபுதாபி (UAE - Abu Dhabi)", lat: 24.4539, lon: 54.3773, group: "global_cities" },
    "doha": { name: "கத்தார் - தோஹா (Qatar - Doha)", lat: 25.2854, lon: 51.5310, group: "global_cities" },
    "kuwaitcity": { name: "குவைத் நகரம் (Kuwait City)", lat: 29.3759, lon: 47.9774, group: "global_cities" },
    "riyadh": { name: "சவூதி அரேபியா - ரியாத் (Saudi Arabia - Riyadh)", lat: 24.7136, lon: 46.6753, group: "global_cities" },
    "muscat": { name: "ஓமான் - மஸ்கட் (Oman - Muscat)", lat: 23.5880, lon: 58.3829, group: "global_cities" },
    "london": { name: "இங்கிலாந்து - லண்டன் (UK - London)", lat: 51.5074, lon: -0.1278, group: "global_cities" },
    "newyork": { name: "அமெரிக்கா - நியூயார்க் (USA - New York)", lat: 40.7128, lon: -74.0060, group: "global_cities" },
    "losangeles": { name: "அமெரிக்கா - லாஸ் ஏஞ்சலஸ் (USA - Los Angeles)", lat: 34.0522, lon: -118.2437, group: "global_cities" },
    "chicago": { name: "அமெரிக்கா - சிகாகோ (USA - Chicago)", lat: 41.8781, lon: -87.6298, group: "global_cities" },
    "sanfrancisco": { name: "அமெரிக்கா - சான் பிரான்சிஸ்கோ (USA - San Francisco)", lat: 37.7749, lon: -122.4194, group: "global_cities" },
    "toronto": { name: "கனடா - டொராண்டோ (Canada - Toronto)", lat: 43.6532, lon: -79.3832, group: "global_cities" },
    "vancouver": { name: "கனடா - வான்கூவர் (Canada - Vancouver)", lat: 49.2827, lon: -123.1207, group: "global_cities" },
    "sydney": { name: "ஆஸ்திரேலியா - சிட்னி (Australia - Sydney)", lat: -33.8688, lon: 151.2093, group: "global_cities" },
    "melbourne": { name: "ஆஸ்திரேலியா - மெல்பேர்ன் (Australia - Melbourne)", lat: -37.8136, lon: 144.9631, group: "global_cities" },
    "auckland": { name: "நியூசிலாந்து - ஆக்லாந்து (New Zealand - Auckland)", lat: -36.8485, lon: 174.7633, group: "global_cities" },
    "paris": { name: "பிரான்ஸ் - பாரிஸ் (France - Paris)", lat: 48.8566, lon: 2.3522, group: "global_cities" },
    "frankfurt": { name: "ஜெர்மனி - பிராங்பேர்ட் (Germany - Frankfurt)", lat: 50.1109, lon: 8.6821, group: "global_cities" },
    "tokyo": { name: "ஜப்பான் - டோக்கியோ (Japan - Tokyo)", lat: 35.6762, lon: 139.6503, group: "global_cities" },

    // -------------------------------------------------------------
    // 5. ALL WORLD COUNTRIES (உலக நாடுகள் அனைத்தும்)
    // -------------------------------------------------------------
    "country_afghanistan": { name: "ஆஃப்கானிஸ்தான் (Afghanistan)", lat: 34.5553, lon: 69.2075, group: "world_countries" },
    "country_albania": { name: "அல்பேனியா (Albania)", lat: 41.3275, lon: 19.8187, group: "world_countries" },
    "country_algeria": { name: "அல்ஜீரியா (Algeria)", lat: 36.7538, lon: 3.0588, group: "world_countries" },
    "country_andorra": { name: "அன்டோரா (Andorra)", lat: 42.5063, lon: 1.5218, group: "world_countries" },
    "country_angola": { name: "அங்கோலா (Angola)", lat: -8.8390, lon: 13.2894, group: "world_countries" },
    "country_argentina": { name: "அர்ஜென்டினா (Argentina)", lat: -34.6037, lon: -58.3816, group: "world_countries" },
    "country_armenia": { name: "அர்மீனியா (Armenia)", lat: 40.1792, lon: 44.4991, group: "world_countries" },
    "country_australia": { name: "ஆஸ்திரேலியா (Australia)", lat: -35.2809, lon: 149.1300, group: "world_countries" },
    "country_austria": { name: "ஆஸ்திரியா (Austria)", lat: 48.2082, lon: 16.3738, group: "world_countries" },
    "country_azerbaijan": { name: "அஜர்பைஜான் (Azerbaijan)", lat: 40.4093, lon: 49.8671, group: "world_countries" },
    "country_bahamas": { name: "பஹாமாஸ் (Bahamas)", lat: 25.0343, lon: -77.3963, group: "world_countries" },
    "country_bahrain": { name: "பஹ்ரைன் (Bahrain)", lat: 26.2285, lon: 50.5860, group: "world_countries" },
    "country_bangladesh": { name: "வங்காளதேசம் (Bangladesh)", lat: 23.8103, lon: 90.4125, group: "world_countries" },
    "country_barbados": { name: "பார்படோஸ் (Barbados)", lat: 13.1939, lon: -59.5432, group: "world_countries" },
    "country_belarus": { name: "பெலாரஸ் (Belarus)", lat: 53.9006, lon: 27.5590, group: "world_countries" },
    "country_belgium": { name: "பெல்ஜியம் (Belgium)", lat: 50.8503, lon: 4.3517, group: "world_countries" },
    "country_belize": { name: "பெலிஸ் (Belize)", lat: 17.2510, lon: -88.7590, group: "world_countries" },
    "country_benin": { name: "பெனின் (Benin)", lat: 6.4969, lon: 2.6288, group: "world_countries" },
    "country_bhutan": { name: "பூடான் (Bhutan)", lat: 27.4728, lon: 89.6393, group: "world_countries" },
    "country_bolivia": { name: "பொலிவியா (Bolivia)", lat: -16.4897, lon: -68.1193, group: "world_countries" },
    "country_bosnia": { name: "போஸ்னியா (Bosnia & Herzegovina)", lat: 43.8563, lon: 18.4131, group: "world_countries" },
    "country_botswana": { name: "போட்ஸ்வானா (Botswana)", lat: -24.6282, lon: 25.9231, group: "world_countries" },
    "country_brazil": { name: "பிரேசில் (Brazil)", lat: -15.7975, lon: -47.8919, group: "world_countries" },
    "country_brunei": { name: "புருனை (Brunei)", lat: 4.9031, lon: 114.9398, group: "world_countries" },
    "country_bulgaria": { name: "பல்கேரியா (Bulgaria)", lat: 42.6977, lon: 23.3219, group: "world_countries" },
    "country_burkina": { name: "பர்கினா பாசோ (Burkina Faso)", lat: 12.3714, lon: -1.5197, group: "world_countries" },
    "country_burundi": { name: "புருண்டி (Burundi)", lat: -3.3822, lon: 29.9312, group: "world_countries" },
    "country_cambodia": { name: "கம்போடியா (Cambodia)", lat: 11.5564, lon: 104.9282, group: "world_countries" },
    "country_cameroon": { name: "கேமரூன் (Cameroon)", lat: 3.8480, lon: 11.5021, group: "world_countries" },
    "country_canada": { name: "கனடா (Canada)", lat: 45.4215, lon: -75.6972, group: "world_countries" },
    "country_chile": { name: "சிலி (Chile)", lat: -33.4489, lon: -70.6693, group: "world_countries" },
    "country_china": { name: "சீனா (China)", lat: 39.9042, lon: 116.4074, group: "world_countries" },
    "country_colombia": { name: "கொலம்பியா (Colombia)", lat: 4.7110, lon: -74.0721, group: "world_countries" },
    "country_congo": { name: "காங்கோ (Congo)", lat: -4.2634, lon: 15.2429, group: "world_countries" },
    "country_costarica": { name: "கோஸ்டா ரிகா (Costa Rica)", lat: 9.9281, lon: -84.0907, group: "world_countries" },
    "country_croatia": { name: "குரோஷியா (Croatia)", lat: 45.8150, lon: 15.9819, group: "world_countries" },
    "country_cuba": { name: "கியூபா (Cuba)", lat: 23.1136, lon: -82.3666, group: "world_countries" },
    "country_cyprus": { name: "சைப்ரஸ் (Cyprus)", lat: 35.1856, lon: 33.3823, group: "world_countries" },
    "country_czech": { name: "செக் குடியரசு (Czech Republic)", lat: 50.0755, lon: 14.4378, group: "world_countries" },
    "country_denmark": { name: "டென்மார்க் (Denmark)", lat: 55.6761, lon: 12.5683, group: "world_countries" },
    "country_djibouti": { name: "ஜிபூட்டி (Djibouti)", lat: 11.5721, lon: 43.1456, group: "world_countries" },
    "country_dominica": { name: "டொமினிக்கா (Dominica)", lat: 15.3092, lon: -61.3794, group: "world_countries" },
    "country_ecuador": { name: "ஈக்வடார் (Ecuador)", lat: -0.1807, lon: -78.4678, group: "world_countries" },
    "country_egypt": { name: "எகிப்து (Egypt)", lat: 30.0444, lon: 31.2357, group: "world_countries" },
    "country_elsalvador": { name: "எல் சால்வடார் (El Salvador)", lat: 13.6929, lon: -89.2182, group: "world_countries" },
    "country_estonia": { name: "எஸ்டோனியா (Estonia)", lat: 59.4370, lon: 24.7536, group: "world_countries" },
    "country_ethiopia": { name: "எதியோப்பியா (Ethiopia)", lat: 9.0300, lon: 38.7400, group: "world_countries" },
    "country_fiji": { name: "பிஜி (Fiji)", lat: -18.1416, lon: 178.4419, group: "world_countries" },
    "country_finland": { name: "பின்லாந்து (Finland)", lat: 60.1699, lon: 24.9384, group: "world_countries" },
    "country_france": { name: "பிரான்ஸ் (France)", lat: 48.8566, lon: 2.3522, group: "world_countries" },
    "country_gabon": { name: "காபோன் (Gabon)", lat: 0.4162, lon: 9.4673, group: "world_countries" },
    "country_gambia": { name: "காம்பியா (Gambia)", lat: 13.4549, lon: -16.5790, group: "world_countries" },
    "country_georgia": { name: "ஜார்ஜியா (Georgia)", lat: 41.7151, lon: 44.8271, group: "world_countries" },
    "country_germany": { name: "ஜெர்மனி (Germany)", lat: 52.5200, lon: 13.4050, group: "world_countries" },
    "country_ghana": { name: "கானா (Ghana)", lat: 5.6037, lon: -0.1870, group: "world_countries" },
    "country_greece": { name: "கிரேக்கம் / கிரீஸ் (Greece)", lat: 37.9838, lon: 23.7275, group: "world_countries" },
    "country_grenada": { name: "கிரெனடா (Grenada)", lat: 12.0561, lon: -61.7485, group: "world_countries" },
    "country_guatemala": { name: "குவாத்தமாலா (Guatemala)", lat: 14.6349, lon: -90.5069, group: "world_countries" },
    "country_guinea": { name: "கினியா (Guinea)", lat: 9.6412, lon: -13.5784, group: "world_countries" },
    "country_guyana": { name: "கயானா (Guyana)", lat: 6.8013, lon: -58.1551, group: "world_countries" },
    "country_haiti": { name: "ஹைட்டி (Haiti)", lat: 18.5944, lon: -72.3074, group: "world_countries" },
    "country_honduras": { name: "ஹோண்டுராஸ் (Honduras)", lat: 14.0723, lon: -87.1921, group: "world_countries" },
    "country_hungary": { name: "ஹங்கேரி (Hungary)", lat: 47.4979, lon: 19.0402, group: "world_countries" },
    "country_iceland": { name: "ஐஸ்லாந்து (Iceland)", lat: 64.1466, lon: -21.9426, group: "world_countries" },
    "country_india": { name: "இந்தியா (India)", lat: 28.6139, lon: 77.2090, group: "world_countries" },
    "country_indonesia": { name: "இந்தோனேசியா (Indonesia)", lat: -6.2088, lon: 106.8456, group: "world_countries" },
    "country_iran": { name: "ஈரான் (Iran)", lat: 35.6892, lon: 51.3890, group: "world_countries" },
    "country_iraq": { name: "ஈராக் (Iraq)", lat: 33.3152, lon: 44.3661, group: "world_countries" },
    "country_ireland": { name: "அயர்லாந்து (Ireland)", lat: 53.3498, lon: -6.2603, group: "world_countries" },
    "country_israel": { name: "இஸ்ரேல் (Israel)", lat: 31.7683, lon: 35.2137, group: "world_countries" },
    "country_italy": { name: "இத்தாலி (Italy)", lat: 41.9028, lon: 12.4964, group: "world_countries" },
    "country_ivorycoast": { name: "ஐவரி கோஸ்ட் (Ivory Coast)", lat: 6.8276, lon: -5.2767, group: "world_countries" },
    "country_jamaica": { name: "ஜமைக்கா (Jamaica)", lat: 17.9712, lon: -76.7936, group: "world_countries" },
    "country_japan": { name: "ஜப்பான் (Japan)", lat: 35.6762, lon: 139.6503, group: "world_countries" },
    "country_jordan": { name: "ஜோர்டான் (Jordan)", lat: 31.9454, lon: 35.9284, group: "world_countries" },
    "country_kazakhstan": { name: "கஜகஸ்தான் (Kazakhstan)", lat: 51.1694, lon: 71.4491, group: "world_countries" },
    "country_kenya": { name: "கென்யா (Kenya)", lat: -1.2921, lon: 36.8219, group: "world_countries" },
    "country_kuwait": { name: "குவைத் (Kuwait)", lat: 29.3759, lon: 47.9774, group: "world_countries" },
    "country_kyrgyzstan": { name: "கிர்கிஸ்தான் (Kyrgyzstan)", lat: 42.8746, lon: 74.5698, group: "world_countries" },
    "country_laos": { name: "லாஓஸ் (Laos)", lat: 17.9757, lon: 102.6331, group: "world_countries" },
    "country_latvia": { name: "லாட்வியா (Latvia)", lat: 56.9496, lon: 24.1052, group: "world_countries" },
    "country_lebanon": { name: "லெபனான் (Lebanon)", lat: 33.8938, lon: 35.5018, group: "world_countries" },
    "country_liberia": { name: "லைபீரியா (Liberia)", lat: 6.3156, lon: -10.8074, group: "world_countries" },
    "country_libya": { name: "லிபியா (Libya)", lat: 32.8872, lon: 13.1913, group: "world_countries" },
    "country_liechtenstein": { name: "லீக்டன்ஸ்டைன் (Liechtenstein)", lat: 47.1410, lon: 9.5209, group: "world_countries" },
    "country_lithuania": { name: "லிதுவேனியா (Lithuania)", lat: 54.6872, lon: 25.2797, group: "world_countries" },
    "country_luxembourg": { name: "லக்ஸம்பர்க் (Luxembourg)", lat: 49.6116, lon: 6.1319, group: "world_countries" },
    "country_madagascar": { name: "மடகாஸ்கர் (Madagascar)", lat: -18.8792, lon: 47.5079, group: "world_countries" },
    "country_malawi": { name: "மலாவி (Malawi)", lat: -13.9631, lon: 33.7741, group: "world_countries" },
    "country_malaysia": { name: "மலேசியா (Malaysia)", lat: 3.1390, lon: 101.6869, group: "world_countries" },
    "country_maldives": { name: "மாலத்தீவு (Maldives)", lat: 4.1755, lon: 73.5093, group: "world_countries" },
    "country_mali": { name: "மாலி (Mali)", lat: 12.6392, lon: -8.0029, group: "world_countries" },
    "country_malta": { name: "மால்டா (Malta)", lat: 35.8997, lon: 14.5147, group: "world_countries" },
    "country_mauritius": { name: "மொரிஷியஸ் (Mauritius)", lat: -20.1609, lon: 57.5012, group: "world_countries" },
    "country_mexico": { name: "மெக்சிகோ (Mexico)", lat: 19.4326, lon: -99.1332, group: "world_countries" },
    "country_moldova": { name: "மால்டோவா (Moldova)", lat: 47.0105, lon: 28.8638, group: "world_countries" },
    "country_monaco": { name: "மொனாக்கோ (Monaco)", lat: 43.7384, lon: 7.4246, group: "world_countries" },
    "country_mongolia": { name: "மங்கோலியா (Mongolia)", lat: 47.8864, lon: 106.9057, group: "world_countries" },
    "country_montenegro": { name: "மாண்டினீக்ரோ (Montenegro)", lat: 42.4304, lon: 19.2594, group: "world_countries" },
    "country_morocco": { name: "மொராக்கோ (Morocco)", lat: 34.0209, lon: -6.8416, group: "world_countries" },
    "country_mozambique": { name: "மொசாம்பிக் (Mozambique)", lat: -25.9692, lon: 32.5732, group: "world_countries" },
    "country_myanmar": { name: "மியான்மர் (Myanmar)", lat: 16.8661, lon: 96.1561, group: "world_countries" },
    "country_namibia": { name: "நமீபியா (Namibia)", lat: -22.5609, lon: 17.0658, group: "world_countries" },
    "country_nepal": { name: "நேபாளம் (Nepal)", lat: 27.7172, lon: 85.3240, group: "world_countries" },
    "country_netherlands": { name: "நெதர்லாந்து (Netherlands)", lat: 52.3676, lon: 4.9041, group: "world_countries" },
    "country_newzealand": { name: "நியூசிலாந்து (New Zealand)", lat: -41.2865, lon: 174.7762, group: "world_countries" },
    "country_nicaragua": { name: "நிகராகுவா (Nicaragua)", lat: 12.1149, lon: -86.2362, group: "world_countries" },
    "country_niger": { name: "நைஜர் (Niger)", lat: 13.5116, lon: 2.1254, group: "world_countries" },
    "country_nigeria": { name: "நைஜீரியா (Nigeria)", lat: 9.0765, lon: 7.3986, group: "world_countries" },
    "country_northkorea": { name: "வட கொரியா (North Korea)", lat: 39.0392, lon: 125.7625, group: "world_countries" },
    "country_northmacedonia": { name: "வட மாசிடோனியா (North Macedonia)", lat: 41.9981, lon: 21.4254, group: "world_countries" },
    "country_norway": { name: "நார்வே (Norway)", lat: 59.9139, lon: 10.7522, group: "world_countries" },
    "country_oman": { name: "ஓமான் (Oman)", lat: 23.5880, lon: 58.3829, group: "world_countries" },
    "country_pakistan": { name: "பாகிஸ்தான் (Pakistan)", lat: 33.6844, lon: 73.0479, group: "world_countries" },
    "country_palestine": { name: "பாலஸ்தீனம் (Palestine)", lat: 31.9038, lon: 35.2034, group: "world_countries" },
    "country_panama": { name: "பனாமா (Panama)", lat: 8.9824, lon: -79.5199, group: "world_countries" },
    "country_papuanewguinea": { name: "பப்புவா நியூ கினியா (Papua New Guinea)", lat: -9.4438, lon: 147.1803, group: "world_countries" },
    "country_paraguay": { name: "பராகுவே (Paraguay)", lat: -25.2637, lon: -57.5759, group: "world_countries" },
    "country_peru": { name: "பெரு (Peru)", lat: -12.0464, lon: -77.0428, group: "world_countries" },
    "country_philippines": { name: "பிலிப்பைன்ஸ் (Philippines)", lat: 14.5995, lon: 120.9842, group: "world_countries" },
    "country_poland": { name: "போலந்து (Poland)", lat: 52.2297, lon: 21.0122, group: "world_countries" },
    "country_portugal": { name: "போர்ச்சுகல் (Portugal)", lat: 38.7223, lon: -9.1393, group: "world_countries" },
    "country_qatar": { name: "கத்தார் (Qatar)", lat: 25.2854, lon: 51.5310, group: "world_countries" },
    "country_romania": { name: "ருமேனியா (Romania)", lat: 44.4268, lon: 26.1025, group: "world_countries" },
    "country_russia": { name: "ரஷ்யா (Russia)", lat: 55.7558, lon: 37.6173, group: "world_countries" },
    "country_rwanda": { name: "ருவாண்டா (Rwanda)", lat: -1.9441, lon: 30.0619, group: "world_countries" },
    "country_saudiarabia": { name: "சவூதி அரேபியா (Saudi Arabia)", lat: 24.7136, lon: 46.6753, group: "world_countries" },
    "country_senegal": { name: "செனகல் (Senegal)", lat: 14.7167, lon: -17.4677, group: "world_countries" },
    "country_serbia": { name: "செர்பியா (Serbia)", lat: 44.7866, lon: 20.4489, group: "world_countries" },
    "country_seychelles": { name: "சீஷெல்ஸ் (Seychelles)", lat: -4.6796, lon: 55.4920, group: "world_countries" },
    "country_singapore": { name: "சிங்கப்பூர் (Singapore)", lat: 1.3521, lon: 103.8198, group: "world_countries" },
    "country_slovakia": { name: "ஸ்லோவாக்கியா (Slovakia)", lat: 48.1486, lon: 17.1077, group: "world_countries" },
    "country_slovenia": { name: "ஸ்லோவேனியா (Slovenia)", lat: 46.0569, lon: 14.5058, group: "world_countries" },
    "country_somalia": { name: "சோமாலியா (Somalia)", lat: 2.0469, lon: 45.3182, group: "world_countries" },
    "country_southafrica": { name: "தென் ஆப்பிரிக்கா (South Africa)", lat: -25.7479, lon: 28.2293, group: "world_countries" },
    "country_southkorea": { name: "தென் கொரியா (South Korea)", lat: 37.5665, lon: 126.9780, group: "world_countries" },
    "country_southsudan": { name: "தெற்கு சூடான் (South Sudan)", lat: 4.8594, lon: 31.5713, group: "world_countries" },
    "country_spain": { name: "ஸ்பெயின் (Spain)", lat: 40.4168, lon: -3.7038, group: "world_countries" },
    "country_srilanka": { name: "இலங்கை (Sri Lanka)", lat: 6.9271, lon: 79.8612, group: "world_countries" },
    "country_sudan": { name: "சூடான் (Sudan)", lat: 15.5007, lon: 32.5599, group: "world_countries" },
    "country_suriname": { name: "சூரினாம் (Suriname)", lat: 5.8520, lon: -55.2038, group: "world_countries" },
    "country_sweden": { name: "ஸ்வீடன் (Sweden)", lat: 59.3293, lon: 18.0686, group: "world_countries" },
    "country_switzerland": { name: "சுவிட்சர்லாந்து (Switzerland)", lat: 46.9480, lon: 7.4474, group: "world_countries" },
    "country_syria": { name: "சிரியா (Syria)", lat: 33.5138, lon: 36.2765, group: "world_countries" },
    "country_taiwan": { name: "தைவான் (Taiwan)", lat: 25.0330, lon: 121.5654, group: "world_countries" },
    "country_tajikistan": { name: "தாஜிகிஸ்தான் (Tajikistan)", lat: 38.5598, lon: 68.7870, group: "world_countries" },
    "country_tanzania": { name: "தான்சானியா (Tanzania)", lat: -6.1630, lon: 35.7516, group: "world_countries" },
    "country_thailand": { name: "தாய்லாந்து (Thailand)", lat: 13.7563, lon: 100.5018, group: "world_countries" },
    "country_timorleste": { name: "கிழக்கு திமோர் (Timor-Leste)", lat: -8.5569, lon: 125.5603, group: "world_countries" },
    "country_togo": { name: "டோகோ (Togo)", lat: 6.1375, lon: 1.2125, group: "world_countries" },
    "country_trinidad": { name: "டிரினிடாட் & டொபாகோ (Trinidad & Tobago)", lat: 10.6549, lon: -61.5019, group: "world_countries" },
    "country_tunisia": { name: "துனிசியா (Tunisia)", lat: 36.8065, lon: 10.1815, group: "world_countries" },
    "country_turkey": { name: "துருக்கி (Turkey)", lat: 39.9334, lon: 32.8597, group: "world_countries" },
    "country_turkmenistan": { name: "துர்க்மெனிஸ்தான் (Turkmenistan)", lat: 37.9601, lon: 58.3261, group: "world_countries" },
    "country_uganda": { name: "உகாண்டா (Uganda)", lat: 0.3476, lon: 32.5825, group: "world_countries" },
    "country_ukraine": { name: "உக்ரைன் (Ukraine)", lat: 50.4501, lon: 30.5234, group: "world_countries" },
    "country_uae": { name: "ஐக்கிய அரபு எமிரேட்ஸ் (United Arab Emirates)", lat: 24.4539, lon: 54.3773, group: "world_countries" },
    "country_uk": { name: "இங்கிலாந்து (United Kingdom)", lat: 51.5074, lon: -0.1278, group: "world_countries" },
    "country_usa": { name: "அமெரிக்கா (United States)", lat: 38.9072, lon: -77.0369, group: "world_countries" },
    "country_uruguay": { name: "உருகுவே (Uruguay)", lat: -34.9011, lon: -56.1645, group: "world_countries" },
    "country_uzbekistan": { name: "உஸ்பெகிஸ்தான் (Uzbekistan)", lat: 41.2995, lon: 69.2401, group: "world_countries" },
    "country_vatican": { name: "வாடிகன் நகரம் (Vatican City)", lat: 41.9029, lon: 12.4534, group: "world_countries" },
    "country_venezuela": { name: "வெனிசுலா (Venezuela)", lat: 10.4806, lon: -66.9036, group: "world_countries" },
    "country_vietnam": { name: "வியட்நாம் (Vietnam)", lat: 21.0285, lon: 105.8542, group: "world_countries" },
    "country_yemen": { name: "ஏமன் (Yemen)", lat: 15.3694, lon: 44.1910, group: "world_countries" },
    "country_zambia": { name: "ஜாம்பியா (Zambia)", lat: -15.3875, lon: 28.3228, group: "world_countries" },
    "country_zimbabwe": { name: "ஜிம்பாப்வே (Zimbabwe)", lat: -17.8252, lon: 31.0335, group: "world_countries" }
  };

  // Degrees to Radians and vice versa
  const deg2rad = d => d * (Math.PI / 180);
  const rad2deg = r => r * (180 / Math.PI);
  const norm360 = d => ((d % 360) + 360) % 360;

  // Solve Kepler's Equation M = E - e*sin(E) using Newton-Raphson
  function solveKepler(M, e) {
    let E = M + e * Math.sin(deg2rad(M)) * (1.0 + e * Math.cos(deg2rad(M)));
    for (let iter = 0; iter < 15; iter++) {
      const dE = (E - e * rad2deg(Math.sin(deg2rad(E))) - M) / (1.0 - e * Math.cos(deg2rad(E)));
      E -= dE;
      if (Math.abs(dE) < 1e-7) break;
    }
    return E;
  }

  // Calculate Julian Day Number
  function getJulianDay(year, month, day, hour = 0, minute = 0) {
    if (month <= 2) {
      year -= 1;
      month += 12;
    }
    const A = Math.floor(year / 100);
    const B = 2 - A + Math.floor(A / 4);
    const dayFraction = (hour + minute / 60) / 24;
    return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + dayFraction + B - 1524.5;
  }

  // Compute instantaneous planetary longitudes at a specific Julian Day
  function getPlanetsAtJD(jd, lat, lon) {
    const d = jd - 2451543.5;
    const T = (jd - 2451545.0) / 36525.0;

    // Lahiri Ayanamsa: exactly 23° 51' 11" at J2000 (23.85305556°)
    // Precession rate: 50.290966" per Julian year
    const ayanamsa = 23.85305556 - (2451545.0 - jd) * (50.290966 / (3600 * 365.25));

    // 1. Sun
    const w_sun = norm360(282.9404 + 4.70935e-5 * d);
    const e_sun = 0.016709 - 1.151e-9 * d;
    const M_sun = norm360(356.0470 + 0.9856002585 * d);
    const E_sun = solveKepler(M_sun, e_sun);
    const xv_sun = Math.cos(deg2rad(E_sun)) - e_sun;
    const yv_sun = Math.sqrt(1.0 - e_sun * e_sun) * Math.sin(deg2rad(E_sun));
    const v_sun = rad2deg(Math.atan2(yv_sun, xv_sun));
    const r_sun = Math.sqrt(xv_sun * xv_sun + yv_sun * yv_sun);
    const lonsun = norm360(v_sun + w_sun);
    const xs = r_sun * Math.cos(deg2rad(lonsun));
    const ys = r_sun * Math.sin(deg2rad(lonsun));

    // 2. Moon
    const N_moon = norm360(125.1228 - 0.0529538083 * d);
    const i_moon = 5.1454;
    const w_moon = norm360(318.0634 + 0.1643573223 * d);
    const a_moon = 60.2666;
    const e_moon = 0.054900;
    const M_moon = norm360(115.3654 + 13.0649929509 * d);
    const E_moon = solveKepler(M_moon, e_moon);
    const xv_moon = a_moon * (Math.cos(deg2rad(E_moon)) - e_moon);
    const yv_moon = a_moon * (Math.sqrt(1.0 - e_moon * e_moon) * Math.sin(deg2rad(E_moon)));
    const v_moon = rad2deg(Math.atan2(yv_moon, xv_moon));
    const r_moon = Math.sqrt(xv_moon * xv_moon + yv_moon * yv_moon);

    const xh_m = r_moon * (Math.cos(deg2rad(N_moon)) * Math.cos(deg2rad(v_moon + w_moon)) - Math.sin(deg2rad(N_moon)) * Math.sin(deg2rad(v_moon + w_moon)) * Math.cos(deg2rad(i_moon)));
    const yh_m = r_moon * (Math.sin(deg2rad(N_moon)) * Math.cos(deg2rad(v_moon + w_moon)) + Math.cos(deg2rad(N_moon)) * Math.sin(deg2rad(v_moon + w_moon)) * Math.cos(deg2rad(i_moon)));
    const zh_m = r_moon * (Math.sin(deg2rad(v_moon + w_moon)) * Math.sin(deg2rad(i_moon)));
    let moonLon = rad2deg(Math.atan2(yh_m, xh_m));

    // Lunar Perturbations (Evection, Variation, Yearly Equation & Major Harmonics)
    const Ls = norm360(M_sun + w_sun);
    const Lm = norm360(M_moon + w_moon + N_moon);
    const D = norm360(Lm - Ls);
    const moonPert = -1.274 * Math.sin(deg2rad(M_moon - 2 * D))
                     + 0.658 * Math.sin(deg2rad(2 * D))
                     - 0.186 * Math.sin(deg2rad(M_sun))
                     - 0.059 * Math.sin(deg2rad(2 * M_moon - 2 * D))
                     - 0.057 * Math.sin(deg2rad(M_moon - 2 * D + M_sun))
                     + 0.053 * Math.sin(deg2rad(M_moon + 2 * D))
                     + 0.046 * Math.sin(deg2rad(2 * D - M_sun))
                     + 0.041 * Math.sin(deg2rad(M_moon - M_sun))
                     - 0.035 * Math.sin(deg2rad(D))
                     - 0.031 * Math.sin(deg2rad(M_moon + M_sun));
    moonLon = norm360(moonLon + moonPert);

    // 3. Orbital Elements for Mercury, Venus, Mars, Jupiter, Saturn
    const PLANET_ELEMENTS = {
      "புதன்": {
        N: d => norm360(48.3313 + 3.24587e-5 * d),
        i: d => 7.0047 + 5.00e-8 * d,
        w: d => norm360(29.1241 + 1.01444e-5 * d),
        a: d => 0.387098,
        e: d => 0.205635 + 5.59e-10 * d,
        M: d => norm360(168.6562 + 4.0923344368 * d)
      },
      "சுக்கிரன்": {
        N: d => norm360(76.6799 + 2.46590e-5 * d),
        i: d => 3.3946 + 2.75e-8 * d,
        w: d => norm360(54.8910 + 1.38374e-5 * d),
        a: d => 0.723330,
        e: d => 0.006773 - 1.302e-9 * d,
        M: d => norm360(48.0052 + 1.6021302244 * d)
      },
      "செவ்வாய்": {
        N: d => norm360(49.5574 + 2.11081e-5 * d),
        i: d => 1.8497 - 1.78e-8 * d,
        w: d => norm360(286.5016 + 2.92961e-5 * d),
        a: d => 1.523688,
        e: d => 0.093405 + 2.516e-9 * d,
        M: d => norm360(18.6021 + 0.5240207766 * d)
      },
      "குரு": {
        N: d => norm360(100.4542 + 2.76854e-5 * d),
        i: d => 1.3030 - 1.557e-7 * d,
        w: d => norm360(273.8777 + 1.64505e-5 * d),
        a: d => 5.20256,
        e: d => 0.048498 + 4.469e-9 * d,
        M: d => norm360(19.8950 + 0.0830853001 * d)
      },
      "சனி": {
        N: d => norm360(113.6634 + 2.38980e-5 * d),
        i: d => 2.4886 - 1.081e-7 * d,
        w: d => norm360(339.3939 + 2.97661e-5 * d),
        a: d => 9.55475,
        e: d => 0.055546 - 9.499e-9 * d,
        M: d => norm360(316.9670 + 0.0334442282 * d)
      }
    };

    const results = {};
    results["சூரியன்"] = norm360(lonsun - ayanamsa);
    results["சந்திரன்"] = norm360(moonLon - ayanamsa);

    // Rahu / Ketu (Mean North Node)
    const rahuLon = norm360(125.044522 - 1934.136261 * T);
    results["ராகு"] = norm360(rahuLon - ayanamsa);
    results["கேது"] = norm360(results["ராகு"] + 180);

    const Mj = PLANET_ELEMENTS["குரு"].M(d);
    const Ms = PLANET_ELEMENTS["சனி"].M(d);

    for (let p in PLANET_ELEMENTS) {
      const el = PLANET_ELEMENTS[p];
      const N = el.N(d);
      const i = el.i(d);
      const w = el.w(d);
      const a = el.a(d);
      const e = el.e(d);
      let M = el.M(d);

      // Major Perturbations of Jupiter & Saturn
      if (p === "குரு") {
        M += -0.332 * Math.sin(deg2rad(2 * Mj - 5 * Ms - 67.6))
             - 0.056 * Math.sin(deg2rad(2 * Mj - 2 * Ms + 21))
             + 0.042 * Math.sin(deg2rad(3 * Mj - 5 * Ms + 21));
      } else if (p === "சனி") {
        M += 0.812 * Math.sin(deg2rad(2 * Mj - 5 * Ms - 67.6))
             - 0.229 * Math.cos(deg2rad(2 * Mj - 5 * Ms - 67.6))
             + 0.119 * Math.sin(deg2rad(Mj - 2 * Ms - 17.8));
      }

      const E = solveKepler(M, e);
      const xv = a * (Math.cos(deg2rad(E)) - e);
      const yv = a * (Math.sqrt(1.0 - e * e) * Math.sin(deg2rad(E)));
      const v = rad2deg(Math.atan2(yv, xv));
      const r = Math.sqrt(xv * xv + yv * yv);

      // Heliocentric coordinates
      const xh = r * (Math.cos(deg2rad(N)) * Math.cos(deg2rad(v + w)) - Math.sin(deg2rad(N)) * Math.sin(deg2rad(v + w)) * Math.cos(deg2rad(i)));
      const yh = r * (Math.sin(deg2rad(N)) * Math.cos(deg2rad(v + w)) + Math.cos(deg2rad(N)) * Math.sin(deg2rad(v + w)) * Math.cos(deg2rad(i)));
      const zh = r * (Math.sin(deg2rad(v + w)) * Math.sin(deg2rad(i)));

      // Geocentric coordinates (Sun is at xs, ys)
      const xg = xh + xs;
      const yg = yh + ys;
      const zg = zh;

      const lonecl = rad2deg(Math.atan2(yg, xg));
      results[p] = norm360(lonecl - ayanamsa);
    }

    // Lagna (Ascendant) Calculation
    const oblecl = 23.4393 - 3.563e-7 * d;
    const GMST0 = norm360(280.46061837 + 360.98564736629 * (jd - 2451545.0));
    const LST = norm360(GMST0 + lon);
    const ramcRad = deg2rad(LST);
    const epsRad = deg2rad(oblecl);
    const latRad = deg2rad(lat);
    const yAsc = Math.cos(ramcRad);
    const xAsc = -Math.sin(ramcRad) * Math.cos(epsRad) - Math.tan(latRad) * Math.sin(epsRad);
    let ascTrop = norm360(rad2deg(Math.atan2(yAsc, xAsc)));
    results["லக்கினம்"] = norm360(ascTrop - ayanamsa);

    return {
      ayanamsa: ayanamsa,
      results: results
    };
  }

  // Calculate planetary sidereal longitudes with exact retrograde detection
  function calculateSiderealPlanets(birthDate, birthTime, lat = 13.0827, lon = 80.2707) {
    const [year, month, day] = birthDate.split("-").map(Number);
    const [hour, minute] = birthTime.split(":").map(Number);

    // Convert IST (UTC+5:30) to UTC
    let utcHour = hour - 5.5 + minute / 60;
    let utcDay = day;
    let utcMonth = month;
    let utcYear = year;

    if (utcHour < 0) {
      utcHour += 24;
      utcDay -= 1;
      if (utcDay < 1) {
        utcMonth -= 1;
        if (utcMonth < 1) {
          utcMonth = 12;
          utcYear -= 1;
        }
        utcDay = 28;
      }
    }

    const jd = getJulianDay(utcYear, utcMonth, utcDay, Math.floor(utcHour), (utcHour % 1) * 60);
    const cur = getPlanetsAtJD(jd, lat, lon);
    const next = getPlanetsAtJD(jd + 0.1, lat, lon);

    const PLANET_NAMES = ["சூரியன்", "சந்திரன்", "செவ்வாய்", "புதன்", "குரு", "சுக்கிரன்", "சனி", "ராகு", "கேது"];

    // Map longitude (0-360) to Rasi ID (1 to 12) and degree within sign
    const toRasi = (lonDeg) => {
      const rasiIndex = Math.floor(lonDeg / 30); // 0 to 11
      const rasiId = rasiIndex + 1; // 1 = மேஷம் ... 12 = மீனம்
      const degInSign = lonDeg % 30;
      return { rasiId, degInSign, totalLon: lonDeg };
    };

    // Determine special conditions
    const checkExaltation = (planet, rasiId) => {
      const exaltMap = { "சூரியன்": 1, "சந்திரன்": 2, "செவ்வாய்": 10, "புதன்": 6, "குரு": 4, "சுக்கிரன்": 12, "சனி": 7, "ராகு": 2, "கேது": 8 };
      return exaltMap[planet] === rasiId;
    };

    const checkDebilitation = (planet, rasiId) => {
      const debilMap = { "சூரியன்": 7, "சந்திரன்": 8, "செவ்வாய்": 4, "புதன்": 12, "குரு": 10, "சுக்கிரன்": 6, "சனி": 1, "ராகு": 8, "கேது": 2 };
      return debilMap[planet] === rasiId;
    };

    // In Nadi, planets within 0°-2.5° or 27.5°-30° of a rasi are Marginal / விளிம்பு கிரகங்கள்!
    const checkMarginal = (degInSign) => {
      return (degInSign <= 2.5 || degInSign >= 27.5);
    };

    const sunSid = cur.results["சூரியன்"];
    const moonSid = cur.results["சந்திரன்"];

    // Sun-Moon elongation for Paksha (திதி)
    const moonElongation = norm360(moonSid - sunSid);
    const isWaxing = moonElongation >= 0 && moonElongation < 180; // வளர்பிறை
    const pakshaName = isWaxing ? "வளர்பிறை (சுக்கில பக்ஷம்)" : "தேய்பிறை (கிருஷ்ண பக்ஷம்)";

    // Combustion (அஸ்தமனம்) thresholds from Sun
    const checkCombustion = (planet, lon) => {
      if (planet === "சூரியன்" || planet === "ராகு" || planet === "கேது") return false;
      const diff = Math.abs(norm360(lon - sunSid));
      const minDiff = Math.min(diff, 360 - diff);
      const thresholds = {
        "சந்திரன்": 12.0,
        "செவ்வாய்": 17.0,
        "புதன்": 14.0,
        "குரு": 11.0,
        "சுக்கிரன்": 10.0,
        "சனி": 15.0
      };
      return minDiff <= (thresholds[planet] || 10.0);
    };

    const computedList = PLANET_NAMES.map(p => {
      const lon1 = cur.results[p];
      const lon2 = next.results[p];
      let diff = lon2 - lon1;
      if (diff < -180) diff += 360;
      if (diff > 180) diff -= 360;

      let isRetro = (diff < 0);
      if (p === "ராகு" || p === "கேது") isRetro = true;
      if (p === "சூரியன்" || p === "சந்திரன்") isRetro = false;

      const r = toRasi(lon1);
      return {
        planet: p,
        totalLon: lon1,
        rasiId: r.rasiId,
        degInSign: r.degInSign,
        isRetrograde: isRetro,
        isCombust: checkCombustion(p, lon1),
        isExalted: checkExaltation(p, r.rasiId),
        isDebilitated: checkDebilitation(p, r.rasiId),
        isMarginal: checkMarginal(r.degInSign)
      };
    });

    const lagnaLon = cur.results["லக்கினம்"];
    const lagnaInfo = toRasi(lagnaLon);

    // Dasa Bhukti Antharam Calculation from Moon's Longitude
    const dashaResult = calculateVimshottariDasha(birthDate, birthTime, moonSid);

    // Panchangam (Thithi, Yogam, Karanam, Nakshatram) and Age
    const panchangam = calculatePanchangam(sunSid, moonSid);
    const ageInfo = calculateAge(birthDate, birthTime);

    return {
      ayanamsa: cur.ayanamsa.toFixed(2),
      isWaxingMoon: isWaxing,
      paksha: pakshaName,
      sunLongitude: sunSid,
      moonLongitude: moonSid,
      lagna: {
        rasiId: lagnaInfo.rasiId,
        degInSign: lagnaInfo.degInSign.toFixed(2),
        totalLon: lagnaLon
      },
      planets: computedList,
      dasha: dashaResult,
      panchangam: panchangam,
      age: ageInfo
    };
  }

  // 27 Nakshatras & Vimshottari Lords
  const NAKSHATRAS = [
    { id: 1, name: "அஸ்வினி", english: "Ashwini", lord: "கேது" },
    { id: 2, name: "பரணி", english: "Bharani", lord: "சுக்கிரன்" },
    { id: 3, name: "கார்த்திகை", english: "Krittika", lord: "சூரியன்" },
    { id: 4, name: "ரோகிணி", english: "Rohini", lord: "சந்திரன்" },
    { id: 5, name: "மிருகசீரிஷம்", english: "Mrigashira", lord: "செவ்வாய்" },
    { id: 6, name: "திருவாதிரை", english: "Ardra", lord: "ராகு" },
    { id: 7, name: "புனர்பூசம்", english: "Punarvasu", lord: "குரு" },
    { id: 8, name: "பூசம்", english: "Pushya", lord: "சனி" },
    { id: 9, name: "ஆயில்யம்", english: "Ashlesha", lord: "புதன்" },
    { id: 10, name: "மகம்", english: "Magha", lord: "கேது" },
    { id: 11, name: "பூரம்", english: "Purva Phalguni", lord: "சுக்கிரன்" },
    { id: 12, name: "உத்திரம்", english: "Uttara Phalguni", lord: "சூரியன்" },
    { id: 13, name: "அஸ்தம்", english: "Hasta", lord: "சந்திரன்" },
    { id: 14, name: "சித்திரை", english: "Chitra", lord: "செவ்வாய்" },
    { id: 15, name: "சுவாதி", english: "Swati", lord: "ராகு" },
    { id: 16, name: "விசாகம்", english: "Vishakha", lord: "குரு" },
    { id: 17, name: "அனுஷம்", english: "Anuradha", lord: "சனி" },
    { id: 18, name: "கேட்டை", english: "Jyeshtha", lord: "புதன்" },
    { id: 19, name: "மூலம்", english: "Mula", lord: "கேது" },
    { id: 20, name: "பூராடம்", english: "Purva Ashadha", lord: "சுக்கிரன்" },
    { id: 21, name: "உத்திராடம்", english: "Uttara Ashadha", lord: "சூரியன்" },
    { id: 22, name: "திருவோணம்", english: "Shravana", lord: "சந்திரன்" },
    { id: 23, name: "அவிட்டம்", english: "Dhanishta", lord: "செவ்வாய்" },
    { id: 24, name: "சதயம்", english: "Shatabhisha", lord: "ராகு" },
    { id: 25, name: "பூரட்டாதி", english: "Purva Bhadrapada", lord: "குரு" },
    { id: 26, name: "உத்திரட்டாதி", english: "Uttara Bhadrapada", lord: "சனி" },
    { id: 27, name: "ரேவதி", english: "Revati", lord: "புதன்" }
  ];

  // 27 Nitya Yogas
  const NITYA_YOGAS = [
    { id: 1, name: "விஷ்கம்பம்", english: "Vishkambha", nature: "அசுபம்" },
    { id: 2, name: "பிரீதி", english: "Priti", nature: "சுபம்" },
    { id: 3, name: "ஆயுஷ்மான்", english: "Ayushman", nature: "சுபம்" },
    { id: 4, name: "சௌபாக்யம்", english: "Saubhagya", nature: "சுபம்" },
    { id: 5, name: "சோபனம்", english: "Shobhana", nature: "சுபம்" },
    { id: 6, name: "அதிகண்டம்", english: "Atiganda", nature: "அசுபம்" },
    { id: 7, name: "சுகர்மம்", english: "Sukarma", nature: "சுபம்" },
    { id: 8, name: "திருதி", english: "Dhriti", nature: "சுபம்" },
    { id: 9, name: "சூலம்", english: "Shula", nature: "அசுபம்" },
    { id: 10, name: "கண்டம்", english: "Ganda", nature: "அசுபம்" },
    { id: 11, name: "விருத்தி", english: "Vriddhi", nature: "சுபம்" },
    { id: 12, name: "துருவம்", english: "Dhruva", nature: "சுபம்" },
    { id: 13, name: "வியாகாதம்", english: "Vyaghata", nature: "அசுபம்" },
    { id: 14, name: "ஹர்ஷணம்", english: "Harshana", nature: "சுபம்" },
    { id: 15, name: "வஜ்ரம்", english: "Vajra", nature: "அசுபம்" },
    { id: 16, name: "சித்தி", english: "Siddhi", nature: "சுபம்" },
    { id: 17, name: "வியதிபாதம்", english: "Vyatipata", nature: "அசுபம்" },
    { id: 18, name: "வரீயான்", english: "Variyan", nature: "சுபம்" },
    { id: 19, name: "பரிகம்", english: "Parigha", nature: "அசுபம்" },
    { id: 20, name: "சிவம்", english: "Shiva", nature: "சுபம்" },
    { id: 21, name: "சித்தம்", english: "Siddha", nature: "சுபம்" },
    { id: 22, name: "சாத்தியம்", english: "Sadhya", nature: "சுபம்" },
    { id: 23, name: "சுபம்", english: "Shubha", nature: "சுபம்" },
    { id: 24, name: "சுப்பிரம்", english: "Shukla", nature: "சுபம்" },
    { id: 25, name: "பிரம்மம்", english: "Brahma", nature: "சுபம்" },
    { id: 26, name: "ஐந்திரம்", english: "Indra", nature: "சுபம்" },
    { id: 27, name: "வைதிருதி", english: "Vaidhriti", nature: "அசுபம்" }
  ];

  const TITHI_NAMES = [
    "பிரதமை (Prathama)",
    "துவிதியை (Dvitiya)",
    "திருதியை (Tritiya)",
    "சதுர்த்தி (Chaturthi)",
    "பஞ்சமி (Panchami)",
    "சஷ்டி (Shashti)",
    "சப்தமி (Saptami)",
    "அஷ்டமி (Ashtami)",
    "நவமி (Navami)",
    "தசமி (Dashami)",
    "ஏகாதசி (Ekadashi)",
    "துவாதசி (Dvadashi)",
    "திரயோதசி (Trayodashi)",
    "சதுர்தசி (Chaturdashi)"
  ];

  const MOVABLE_KARANAS = [
    { name: "பவம் (Bava)", lord: "சூரியன்", animal: "சிங்கம்" },
    { name: "பாலவம் (Balava)", lord: "சந்திரன்", animal: "புலி" },
    { name: "கௌலவம் (Kaulava)", lord: "செவ்வாய்", animal: "பன்றி" },
    { name: "தைதுலை (Taitila)", lord: "புதன்", animal: "கழுதை" },
    { name: "கரசை (Garaja)", lord: "குரு", animal: "யானை" },
    { name: "வணிசை (Vanija)", lord: "சுக்கிரன்", animal: "பசு" },
    { name: "பத்திரை (Bhadra / Vishti)", lord: "சனி", animal: "நாய்" }
  ];

  // Jaimini Chara Karakas: 7 Karakas based on descending degrees within sign (0°-30°)
  const CHARA_KARAKA_TITLES = [
    { code: "AK", name: "ஆத்மகாரகன்", desc: "தலைமை, ஆன்மா, ஆளுமை", color: "#ffd700" },
    { code: "AmK", name: "அமாத்தியகாரகன்", desc: "அறிவு, தொழில், செயல்", color: "#38bdf8" },
    { code: "BK", name: "பிராத்ருகாரகன்", desc: "சகோதரன், வழிகாட்டி", color: "#a855f7" },
    { code: "MK", name: "மாத்ருகாரகன்", desc: "தாய், கல்வி, சுகம்", color: "#ec4899" },
    { code: "PK", name: "புத்ரகாரகன்", desc: "பிள்ளைகள், ஞானம்", color: "#34d399" },
    { code: "GK", name: "ஞாதிகாரகன்", desc: "போராட்டம், பங்காளி, தடை", color: "#f97316" },
    { code: "DK", name: "தாரகாரகன்", desc: "களத்திரம், துணைவர்", color: "#f43f5e" }
  ];

  // Classical Nadi & Sthira Karakatvas
  const STHIRA_KARAKAS = {
    "சூரியன்": { title: "பித்ருகாரகன்", details: "தந்தை, ஆத்மா, அரசு, நிர்வாகம்" },
    "சந்திரன்": { title: "மாத்ருகாரகன்", details: "தாய், மனம், நீர், மாற்றம்" },
    "செவ்வாய்": { title: "சகோதர / கணவன் காரகன்", details: "சகோதரன், கணவன், நிலம், வீரம்" },
    "புதன்": { title: "வித்யாகாரகன்", details: "கல்வி, புத்தி, மாமன், வர்த்தகம்" },
    "குரு": { title: "ஜீவகாரகன் / புத்திரகாரகன்", details: "ஜாதகர் (ஜீவன்), ஞானம், குழந்தைகள்" },
    "சுக்கிரன்": { title: "களத்திர / சுககாரகன்", details: "மனைவி, சொகுசு, வாகனம், செல்வம்" },
    "சனி": { title: "கர்ம / ஆயுள்காரகன்", details: "தொழில், வேலை, ஆயுள், உழைப்பு" },
    "ராகு": { title: "போக / பாட்டன் காரகன்", details: "தந்தைவழி பாட்டன், மாயை, வெளிநாடு" },
    "கேது": { title: "மோக்ஷ / ஞானகாரகன்", details: "தாய்வழி பாட்டன், ஞானம், முக்தி, ஆன்மீகம்" },
    "லக்கினம்": { title: "தேககாரகம்", details: "உடல், உயிர், சுய கௌரவம், ஆயுள்" }
  };

  // Calculate Panchangam (Thithi, Yogam, Karanam, Nakshatram)
  function calculatePanchangam(sunLon, moonLon) {
    if (sunLon === undefined || moonLon === undefined) return null;
    const diff = norm360(moonLon - sunSidSafe(sunLon));
    
    // 1. Thithi
    const tithiIdx = Math.floor(diff / 12); // 0 to 29
    const isWaxing = tithiIdx < 15;
    const paksha = isWaxing ? "சுக்கில பக்ஷம் (வளர்பிறை)" : "கிருஷ்ண பக்ஷம் (தேய்பிறை)";
    const pakshaShort = isWaxing ? "வளர்பிறை" : "தேய்பிறை";
    
    let tithiName = "";
    const indexInPaksha = tithiIdx % 15;
    if (indexInPaksha < 14) {
      tithiName = TITHI_NAMES[indexInPaksha];
    } else {
      tithiName = isWaxing ? "பௌர்ணமி (Purnima)" : "அமாவாசை (Amavasya)";
    }
    
    const degInTithi = diff % 12;
    const tithiFractionElapsed = degInTithi / 12;
    const tithiPct = Math.round(tithiFractionElapsed * 100);

    // 2. Yogam (Nitya Yoga)
    const sumLon = norm360(sunLon + moonLon);
    const yogaSpan = 360 / 27; // 13.333333333333334
    const yogaIdx = Math.min(26, Math.floor(sumLon / yogaSpan));
    const yoga = NITYA_YOGAS[yogaIdx] || NITYA_YOGAS[0];
    const degInYoga = sumLon % yogaSpan;
    const yogaPct = Math.round((degInYoga / yogaSpan) * 100);

    // 3. Karanam (11 Karanas across 60 half-tithis)
    const karanaIdx = Math.floor(diff / 6); // 0 to 59
    let karanaName = "";
    let karanaType = "Movable";
    if (karanaIdx === 0) {
      karanaName = "கிம்துக்கினம் (Kimstughna)";
      karanaType = "Fixed (ஸ்திரம்)";
    } else if (karanaIdx === 57) {
      karanaName = "சகுனி (Shakuni)";
      karanaType = "Fixed (ஸ்திரம்)";
    } else if (karanaIdx === 58) {
      karanaName = "சதுஷ்பாதம் (Chatushpada)";
      karanaType = "Fixed (ஸ்திரம்)";
    } else if (karanaIdx === 59) {
      karanaName = "நாகவம் (Nagava)";
      karanaType = "Fixed (ஸ்திரம்)";
    } else {
      const mIdx = (karanaIdx - 1) % 7;
      karanaName = MOVABLE_KARANAS[mIdx].name;
      karanaType = "Movable (சரம்)";
    }
    const degInKarana = diff % 6;
    const karanaPct = Math.round((degInKarana / 6) * 100);

    // 4. Moon Nakshatra, Pada, and Saram
    const moonNak = getNakshatraInfo(moonLon);

    return {
      tithi: {
        index: tithiIdx + 1,
        name: tithiName,
        fullName: `${pakshaShort} ${tithiName}`,
        paksha: paksha,
        pakshaShort: pakshaShort,
        isWaxing: isWaxing,
        percentElapsed: tithiPct,
        degInTithi: degInTithi.toFixed(2)
      },
      yogam: {
        index: yogaIdx + 1,
        name: yoga.name,
        english: yoga.english,
        nature: yoga.nature,
        percentElapsed: yogaPct
      },
      karanam: {
        index: karanaIdx + 1,
        name: karanaName,
        type: karanaType,
        percentElapsed: karanaPct
      },
      nakshatra: {
        name: moonNak.nakshatra,
        english: moonNak.english,
        pada: moonNak.pada,
        saram: `${moonNak.lord} சாரம்`,
        lord: moonNak.lord,
        balanceText: moonNak.balanceText
      }
    };
  }

  function sunSidSafe(s) {
    return s || 0;
  }

  // Calculate Nakshatra, Pada, and Saram for any longitude
  function getNakshatraPadaSaram(totalLon) {
    const norm = norm360(totalLon);
    const nakSpan = 360 / 27;
    const nakIndex = Math.min(26, Math.max(0, Math.floor(norm / nakSpan)));
    const degInNak = norm % nakSpan;
    const pada = Math.min(4, Math.floor(degInNak / (nakSpan / 4)) + 1);
    const nak = NAKSHATRAS[nakIndex] || NAKSHATRAS[0];
    return {
      nakshatra: nak.name,
      english: nak.english,
      pada: pada,
      lord: nak.lord,
      saram: `${nak.lord} சாரம்`,
      degInNak: degInNak
    };
  }

  // Calculate exact Age based on Date of Birth and Time
  function calculateAge(dobStr, timeStr = "12:00", targetDate = new Date()) {
    if (!dobStr) return null;
    const parts = dobStr.split("-").map(Number);
    if (parts.length < 3) return null;
    const [by, bm, bd] = parts;
    const timeParts = (timeStr || "12:00").split(":").map(Number);
    const bh = timeParts[0] || 0;
    const bmin = timeParts[1] || 0;

    const birth = new Date(by, bm - 1, bd, bh, bmin, 0);
    const now = targetDate instanceof Date ? targetDate : new Date(targetDate);

    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonthLastDate = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      days += prevMonthLastDate;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    const runningYear = years + 1;
    const totalDecimalYears = (now.getTime() - birth.getTime()) / (365.2425 * 86400000);

    return {
      years: Math.max(0, years),
      months: Math.max(0, months),
      days: Math.max(0, days),
      runningYear: Math.max(1, runningYear),
      totalDecimalYears: Math.max(0, totalDecimalYears),
      formattedText: `${years} ஆண்டுகள், ${months} மாதங்கள், ${days} நாட்கள் (${runningYear}-வது வயது நடக்கிறது)`,
      shortText: `${years} வயது (${years}Y ${months}M ${days}D)`
    };
  }

  // Calculate Jaimini Chara Karakas (AK, AmK, BK, MK, PK, GK, DK) and Sthira/Nadi Karakas
  function calculateCharaKarakas(planetsList) {
    const SEVEN_PLANETS = ["சூரியன்", "சந்திரன்", "செவ்வாய்", "புதன்", "குரு", "சுக்கிரன்", "சனி"];
    const eligible = [];
    (planetsList || []).forEach(p => {
      if (SEVEN_PLANETS.includes(p.planet) && p.degree !== undefined && p.degree !== null) {
        eligible.push({
          planet: p.planet,
          degree: parseFloat(p.degree)
        });
      }
    });

    eligible.sort((a, b) => b.degree - a.degree);

    const charaMap = {};
    eligible.forEach((item, idx) => {
      if (idx < CHARA_KARAKA_TITLES.length) {
        charaMap[item.planet] = {
          code: CHARA_KARAKA_TITLES[idx].code,
          name: CHARA_KARAKA_TITLES[idx].name,
          desc: CHARA_KARAKA_TITLES[idx].desc,
          color: CHARA_KARAKA_TITLES[idx].color,
          rank: idx + 1
        };
      }
    });

    return {
      charaMap: charaMap,
      sthiraMap: STHIRA_KARAKAS
    };
  }

  const DASHA_ORDER = [
    { lord: "கேது", years: 7, color: "#d97706" },
    { lord: "சுக்கிரன்", years: 20, color: "#ec4899" },
    { lord: "சூரியன்", years: 6, color: "#ef4444" },
    { lord: "சந்திரன்", years: 10, color: "#94a3b8" },
    { lord: "செவ்வாய்", years: 7, color: "#dc2626" },
    { lord: "ராகு", years: 18, color: "#64748b" },
    { lord: "குரு", years: 16, color: "#f5c518" },
    { lord: "சனி", years: 19, color: "#818cf8" },
    { lord: "புதன்", years: 17, color: "#10b981" }
  ];

  // Calculate Janma Nakshatra and Birth Dasa Balance
  function getNakshatraInfo(moonLon) {
    const norm = norm360(moonLon);
    const nakSpan = 360 / 27; // 13.333333333333334 degrees = 13° 20'
    const nakIndex = Math.min(26, Math.max(0, Math.floor(norm / nakSpan)));
    const degInNak = norm % nakSpan;
    const fractionElapsed = degInNak / nakSpan;
    const fractionRemaining = 1 - fractionElapsed;
    const pada = Math.min(4, Math.floor(degInNak / (nakSpan / 4)) + 1);

    const nak = NAKSHATRAS[nakIndex] || NAKSHATRAS[0];
    const dashaInfo = DASHA_ORDER.find(d => d.lord === nak.lord);
    const totalYears = dashaInfo ? dashaInfo.years : 7;
    const balanceTotalYears = fractionRemaining * totalYears;

    const bYears = Math.floor(balanceTotalYears);
    const remMonths = (balanceTotalYears - bYears) * 12;
    const bMonths = Math.floor(remMonths);
    const bDays = Math.round((remMonths - bMonths) * 30);

    return {
      nakshatra: nak.name,
      english: nak.english,
      lord: nak.lord,
      pada: pada,
      nakIndex: nakIndex,
      degInNak: degInNak,
      fractionElapsed: fractionElapsed,
      fractionRemaining: fractionRemaining,
      birthDashaLord: nak.lord,
      balanceYears: bYears,
      balanceMonths: bMonths,
      balanceDays: bDays,
      balanceTotalYears: balanceTotalYears,
      balanceText: `${nak.lord} மகா தசை இருப்பு: ${bYears} வருடங்கள், ${bMonths} மாதங்கள், ${bDays} நாட்கள்`
    };
  }

  // Calculate Vimshottari Current Dasa, Bhukti, and Antharam
  function calculateVimshottariDasha(birthDateStr, birthTimeStr, moonLon, targetDateObj = new Date()) {
    const nakInfo = getNakshatraInfo(moonLon);
    const [by, bm, bd] = birthDateStr.split("-").map(Number);
    const [bh, bmin] = (birthTimeStr || "12:00").split(":").map(Number);

    const birthDate = new Date(by, bm - 1, bd, bh, bmin, 0);
    const targetDate = targetDateObj instanceof Date ? targetDateObj : new Date(targetDateObj);

    let dashaIdx = DASHA_ORDER.findIndex(d => d.lord === nakInfo.birthDashaLord);
    if (dashaIdx === -1) dashaIdx = 0;

    const msPerYear = 365.2425 * 24 * 60 * 60 * 1000;
    const dashaTimeline = [];
    let currentStartDate = new Date(birthDate.getTime());

    // 1st Dasa ends at birthDate + balanceTotalYears
    const firstEndMs = currentStartDate.getTime() + (nakInfo.balanceTotalYears * msPerYear);
    const firstEndDate = new Date(firstEndMs);

    dashaTimeline.push({
      lord: DASHA_ORDER[dashaIdx].lord,
      years: DASHA_ORDER[dashaIdx].years,
      startDate: new Date(currentStartDate),
      endDate: new Date(firstEndDate),
      isBirthDasha: true,
      color: DASHA_ORDER[dashaIdx].color
    });

    currentStartDate = new Date(firstEndDate);
    dashaIdx = (dashaIdx + 1) % 9;

    // Generate subsequent Dashas
    for (let cycle = 0; cycle < 9; cycle++) {
      const d = DASHA_ORDER[dashaIdx];
      const endMs = currentStartDate.getTime() + (d.years * msPerYear);
      const nextEndDate = new Date(endMs);
      dashaTimeline.push({
        lord: d.lord,
        years: d.years,
        startDate: new Date(currentStartDate),
        endDate: new Date(nextEndDate),
        isBirthDasha: false,
        color: d.color
      });
      currentStartDate = new Date(nextEndDate);
      dashaIdx = (dashaIdx + 1) % 9;
    }

    // Find current active Maha Dasa
    const nowMs = targetDate.getTime();
    let activeDasa = dashaTimeline.find(d => nowMs >= d.startDate.getTime() && nowMs < d.endDate.getTime());
    if (!activeDasa) {
      activeDasa = dashaTimeline[dashaTimeline.length - 1];
    }

    // Divide active Maha Dasa into 9 Bhuktis
    const dasaLordIdx = DASHA_ORDER.findIndex(d => d.lord === activeDasa.lord);
    const mahaTotalYears = activeDasa.years;
    const fullMahaStartMs = activeDasa.endDate.getTime() - (mahaTotalYears * msPerYear);
    let bhuktiStartMs = fullMahaStartMs;
    const bhuktis = [];

    for (let b = 0; b < 9; b++) {
      const bLordInfo = DASHA_ORDER[(dasaLordIdx + b) % 9];
      const bDurationYears = (mahaTotalYears * bLordInfo.years) / 120;
      const bDurationMs = bDurationYears * msPerYear;
      const bEndMs = bhuktiStartMs + bDurationMs;

      bhuktis.push({
        lord: bLordInfo.lord,
        mahaLord: activeDasa.lord,
        years: bDurationYears,
        startDate: new Date(bhuktiStartMs),
        endDate: new Date(bEndMs),
        color: bLordInfo.color
      });
      bhuktiStartMs = bEndMs;
    }

    let activeBhukti = bhuktis.find(b => nowMs >= b.startDate.getTime() && nowMs < b.endDate.getTime());
    if (!activeBhukti) {
      activeBhukti = bhuktis[bhuktis.length - 1];
    }

    // Divide active Bhukti into 9 Antharams
    const bhuktiLordIdx = DASHA_ORDER.findIndex(d => d.lord === activeBhukti.lord);
    const antharams = [];
    let antharamStartMs = activeBhukti.startDate.getTime();
    const bhuktiTotalYears = activeBhukti.years;

    for (let a = 0; a < 9; a++) {
      const aLordInfo = DASHA_ORDER[(bhuktiLordIdx + a) % 9];
      const aDurationYears = (bhuktiTotalYears * aLordInfo.years) / 120;
      const aDurationMs = aDurationYears * msPerYear;
      const aEndMs = antharamStartMs + aDurationMs;

      antharams.push({
        lord: aLordInfo.lord,
        bhuktiLord: activeBhukti.lord,
        mahaLord: activeDasa.lord,
        startDate: new Date(antharamStartMs),
        endDate: new Date(aEndMs),
        color: aLordInfo.color
      });
      antharamStartMs = aEndMs;
    }

    let activeAntharam = antharams.find(a => nowMs >= a.startDate.getTime() && nowMs < a.endDate.getTime());
    if (!activeAntharam) {
      activeAntharam = antharams[antharams.length - 1];
    }

    // Divide active Antharam into 9 Sookshmams (சூட்சுமம்)
    const antharamLordIdx = DASHA_ORDER.findIndex(d => d.lord === activeAntharam.lord);
    const antharamTotalYears = (activeBhukti.years * DASHA_ORDER.find(d => d.lord === activeAntharam.lord).years) / 120;
    const sookshmams = [];
    let sookshmamStartMs = activeAntharam.startDate.getTime();

    for (let s = 0; s < 9; s++) {
      const sLordInfo = DASHA_ORDER[(antharamLordIdx + s) % 9];
      const sDurationYears = (antharamTotalYears * sLordInfo.years) / 120;
      const sDurationMs = sDurationYears * msPerYear;
      const sEndMs = sookshmamStartMs + sDurationMs;

      sookshmams.push({
        lord: sLordInfo.lord,
        antharamLord: activeAntharam.lord,
        bhuktiLord: activeBhukti.lord,
        mahaLord: activeDasa.lord,
        startDate: new Date(sookshmamStartMs),
        endDate: new Date(sEndMs),
        color: sLordInfo.color
      });
      sookshmamStartMs = sEndMs;
    }

    let activeSookshmam = sookshmams.find(s => nowMs >= s.startDate.getTime() && nowMs < s.endDate.getTime());
    if (!activeSookshmam) {
      activeSookshmam = sookshmams[sookshmams.length - 1];
    }

    const formatDate = (d) => {
      try {
        return d.toLocaleDateString("ta-IN", { year: 'numeric', month: 'short', day: 'numeric' });
      } catch(e) {
        return d.toISOString().split("T")[0];
      }
    };

    // Calculate progress percentages & remaining days
    const calcProgress = (startMs, endMs) => {
      const total = endMs - startMs;
      const elapsed = Math.max(0, Math.min(total, nowMs - startMs));
      const pct = Math.round((elapsed / total) * 100);
      const remMs = Math.max(0, endMs - nowMs);
      const remDays = Math.ceil(remMs / (24 * 60 * 60 * 1000));
      return { pct, remDays };
    };

    const mahaProg = calcProgress(activeDasa.startDate.getTime(), activeDasa.endDate.getTime());
    const bhuktiProg = calcProgress(activeBhukti.startDate.getTime(), activeBhukti.endDate.getTime());
    const antharamProg = calcProgress(activeAntharam.startDate.getTime(), activeAntharam.endDate.getTime());
    const sookshmamProg = calcProgress(activeSookshmam.startDate.getTime(), activeSookshmam.endDate.getTime());

    // Helper to calculate Antharams for any Bhukti
    function calculateAntharamsForBhukti(bLord, bStartMs, bDurationYears) {
      const bLordIdx = DASHA_ORDER.findIndex(d => d.lord === bLord);
      const res = [];
      let curMs = bStartMs;
      for (let i = 0; i < 9; i++) {
        const aLord = DASHA_ORDER[(bLordIdx + i) % 9];
        const aDurYears = (bDurationYears * aLord.years) / 120;
        const aDurMs = aDurYears * msPerYear;
        const aEndMs = curMs + aDurMs;
        const isCur = nowMs >= curMs && nowMs < aEndMs;
        const durDays = Math.round(aDurMs / (24 * 60 * 60 * 1000));
        res.push({
          lord: aLord.lord,
          years: aDurYears,
          durationDays: durDays,
          durationText: durDays >= 30 ? `${Math.floor(durDays / 30)} மாதங்கள் ${durDays % 30} நாட்கள்` : `${durDays} நாட்கள்`,
          startDate: formatDate(new Date(curMs)),
          endDate: formatDate(new Date(aEndMs)),
          startMs: curMs,
          endMs: aEndMs,
          isCurrent: isCur,
          color: aLord.color
        });
        curMs = aEndMs;
      }
      return res;
    }

    // Helper to calculate Sookshmams for any Antharam
    function calculateSookshmamsForAntharam(aLord, aStartMs, aDurationYears) {
      const aLordIdx = DASHA_ORDER.findIndex(d => d.lord === aLord);
      const res = [];
      let curMs = aStartMs;
      for (let i = 0; i < 9; i++) {
        const sLord = DASHA_ORDER[(aLordIdx + i) % 9];
        const sDurYears = (aDurationYears * sLord.years) / 120;
        const sDurMs = sDurYears * msPerYear;
        const sEndMs = curMs + sDurMs;
        const isCur = nowMs >= curMs && nowMs < sEndMs;
        const durDays = Math.round(sDurMs / (24 * 60 * 60 * 1000));
        res.push({
          lord: sLord.lord,
          years: sDurYears,
          durationDays: durDays,
          durationText: durDays >= 30 ? `${Math.floor(durDays / 30)} மாதங்கள் ${durDays % 30} நாட்கள்` : `${durDays} நாட்கள்`,
          startDate: formatDate(new Date(curMs)),
          endDate: formatDate(new Date(sEndMs)),
          startMs: curMs,
          endMs: sEndMs,
          isCurrent: isCur,
          color: sLord.color
        });
        curMs = sEndMs;
      }
      return res;
    }

    const currentAntharamsList = calculateAntharamsForBhukti(activeBhukti.lord, activeBhukti.startDate.getTime(), activeBhukti.years);
    const currentSookshmamsList = calculateSookshmamsForAntharam(activeAntharam.lord, activeAntharam.startDate.getTime(), antharamTotalYears);

    return {
      nakshatraInfo: nakInfo,
      currentMahaDasa: {
        lord: activeDasa.lord,
        startDate: formatDate(activeDasa.startDate),
        endDate: formatDate(activeDasa.endDate),
        color: activeDasa.color,
        percentElapsed: mahaProg.pct,
        remainingDays: mahaProg.remDays
      },
      currentBhukti: {
        lord: activeBhukti.lord,
        startDate: formatDate(activeBhukti.startDate),
        endDate: formatDate(activeBhukti.endDate),
        color: activeBhukti.color,
        percentElapsed: bhuktiProg.pct,
        remainingDays: bhuktiProg.remDays
      },
      currentAntharam: {
        lord: activeAntharam.lord,
        startDate: formatDate(activeAntharam.startDate),
        endDate: formatDate(activeAntharam.endDate),
        color: activeAntharam.color,
        percentElapsed: antharamProg.pct,
        remainingDays: antharamProg.remDays
      },
      currentSookshmam: {
        lord: activeSookshmam.lord,
        startDate: formatDate(activeSookshmam.startDate),
        endDate: formatDate(activeSookshmam.endDate),
        color: activeSookshmam.color,
        percentElapsed: sookshmamProg.pct,
        remainingDays: sookshmamProg.remDays
      },
      currentAntharamsList: currentAntharamsList,
      currentSookshmamsList: currentSookshmamsList,
      dashaTimeline: dashaTimeline.map(d => ({
        lord: d.lord,
        years: d.years,
        startDate: formatDate(d.startDate),
        endDate: formatDate(d.endDate),
        startMs: d.startDate.getTime(),
        endMs: d.endDate.getTime(),
        isCurrent: (d.lord === activeDasa.lord)
      })),
      upcomingBhuktis: bhuktis.map(b => ({
        lord: b.lord,
        years: b.years,
        startDate: formatDate(b.startDate),
        endDate: formatDate(b.endDate),
        startMs: b.startDate.getTime(),
        endMs: b.endDate.getTime(),
        isCurrent: (b.lord === activeBhukti.lord)
      }))
    };
  }

  // Calculate Antharams for any Bhukti on demand
  function calculateAntharamsOnDemand(bhuktiLord, bhuktiStartDate, bhuktiDurationYears) {
    const bLordIdx = DASHA_ORDER.findIndex(d => d.lord === bhuktiLord);
    const msPerYear = 365.2425 * 24 * 60 * 60 * 1000;
    const res = [];
    const nowMs = Date.now();
    let curMs = (bhuktiStartDate instanceof Date ? bhuktiStartDate : new Date(bhuktiStartDate)).getTime();
    
    for (let i = 0; i < 9; i++) {
      const aLord = DASHA_ORDER[(bLordIdx + i) % 9];
      const aDurYears = (bhuktiDurationYears * aLord.years) / 120;
      const aDurMs = aDurYears * msPerYear;
      const aEndMs = curMs + aDurMs;
      const isCur = nowMs >= curMs && nowMs < aEndMs;
      const durDays = Math.round(aDurMs / (24 * 60 * 60 * 1000));
      const formatDate = (d) => {
        try {
          return d.toLocaleDateString("ta-IN", { year: 'numeric', month: 'short', day: 'numeric' });
        } catch(e) {
          return d.toISOString().split("T")[0];
        }
      };

      res.push({
        lord: aLord.lord,
        years: aDurYears,
        durationDays: durDays,
        durationText: durDays >= 30 ? `${Math.floor(durDays / 30)} மாதங்கள் ${durDays % 30} நாட்கள்` : `${durDays} நாட்கள்`,
        startDate: formatDate(new Date(curMs)),
        endDate: formatDate(new Date(aEndMs)),
        isCurrent: isCur,
        color: aLord.color
      });
      curMs = aEndMs;
    }
    return res;
  }

  // Calculate Sookshmams for any Antharam on demand
  function calculateSookshmamsOnDemand(antharamLord, antharamStartDate, antharamDurationYears) {
    const aLordIdx = DASHA_ORDER.findIndex(d => d.lord === antharamLord);
    const msPerYear = 365.2425 * 24 * 60 * 60 * 1000;
    const res = [];
    const nowMs = Date.now();
    let curMs = (antharamStartDate instanceof Date ? antharamStartDate : new Date(antharamStartDate)).getTime();
    
    for (let i = 0; i < 9; i++) {
      const sLord = DASHA_ORDER[(aLordIdx + i) % 9];
      const sDurYears = (antharamDurationYears * sLord.years) / 120;
      const sDurMs = sDurYears * msPerYear;
      const sEndMs = curMs + sDurMs;
      const isCur = nowMs >= curMs && nowMs < sEndMs;
      const durDays = Math.round(sDurMs / (24 * 60 * 60 * 1000));
      const formatDate = (d) => {
        try {
          return d.toLocaleDateString("ta-IN", { year: 'numeric', month: 'short', day: 'numeric' });
        } catch(e) {
          return d.toISOString().split("T")[0];
        }
      };

      res.push({
        lord: sLord.lord,
        years: sDurYears,
        durationDays: durDays,
        durationText: durDays >= 30 ? `${Math.floor(durDays / 30)} மாதங்கள் ${durDays % 30} நாட்கள்` : `${durDays} நாட்கள்`,
        startDate: formatDate(new Date(curMs)),
        endDate: formatDate(new Date(sEndMs)),
        isCurrent: isCur,
        color: sLord.color
      });
      curMs = sEndMs;
    }
    return res;
  }

  // Public API
  window.PGAstro.astronomy = {
    calculateSiderealPlanets: calculateSiderealPlanets,
    calculateVimshottariDasha: calculateVimshottariDasha,
    calculateAntharamsOnDemand: calculateAntharamsOnDemand,
    calculateSookshmamsOnDemand: calculateSookshmamsOnDemand,
    calculatePanchangam: calculatePanchangam,
    calculateAge: calculateAge,
    calculateCharaKarakas: calculateCharaKarakas,
    getNakshatraPadaSaram: getNakshatraPadaSaram,
    getNakshatraInfo: getNakshatraInfo,
    NAKSHATRAS: NAKSHATRAS,
    NITYA_YOGAS: NITYA_YOGAS,
    TITHI_NAMES: TITHI_NAMES,
    MOVABLE_KARANAS: MOVABLE_KARANAS,
    CHARA_KARAKA_TITLES: CHARA_KARAKA_TITLES,
    STHIRA_KARAKAS: STHIRA_KARAKAS,
    DASHA_ORDER: DASHA_ORDER,
    CITIES: CITIES
  };
})();
