export type Language = "en" | "hi" | "te";

export interface TranslationDict {
  heroTitle: string;
  heroSubtitle: string;
  heroDesc: string;
  reportBtn: string;
  exploreBtn: string;
  quickSpeak: string;
  quickPhoto: string;
  quickChat: string;
  quickCategories: string;
  viewAllCategories: string;
  showLessCategories: string;
  listenAloud: string;
  speaking: string;
  stopAudio: string;
  confirmProceed: string;
  yesSubmit: string;
  editSummary: string;
  aiGreeting: string;
  reporterConfidential: string;
  reporterName: string;
  reporterPhone: string;
  reporterEmail: string;
  reportPublished: string;
  viewDetails: string;
}

export const TRANSLATIONS: Record<Language, TranslationDict> = {
  en: {
    heroTitle: "Good morning, Ananya.",
    heroSubtitle: "Let's fix something today.",
    heroDesc: "Spot a pothole, broken streetlight or overflowing garbage? Report it in 30 seconds with voice or photo and track until resolved.",
    reportBtn: "Report an issue",
    exploreBtn: "Explore city map",
    quickSpeak: "Speak in Any Language",
    quickPhoto: "Snap Photo Evidence",
    quickChat: "AI Chat Triage",
    quickCategories: "What is your problem? Select to report",
    viewAllCategories: "View all 12 categories",
    showLessCategories: "Show less (6 categories)",
    listenAloud: "🔊 Listen to Summary (Audio)",
    speaking: "Playing audio summary in English...",
    stopAudio: "Stop audio",
    confirmProceed: "Confirm & Proceed",
    yesSubmit: "👍 Yes, Submit Report",
    editSummary: "Edit before confirming",
    aiGreeting: "Hello! I am your NagarMitra AI reporting assistant for {city}. Speak in any language, snap a photo (optional), or type below.",
    reporterConfidential: "🔒 Private metadata: Name, Phone, and Email are confidential and visible only to NagarMitra Platform Admins.",
    reporterName: "Full Name *",
    reporterPhone: "Phone Number *",
    reporterEmail: "Email Address *",
    reportPublished: "Report Published",
    viewDetails: "View Report Details ➔",
  },
  hi: {
    heroTitle: "नमस्ते, अनन्य।",
    heroSubtitle: "आइए आज अपने शहर को बेहतर बनाएं।",
    heroDesc: "सड़क पर गड्ढा, टूटी स्ट्रीटलाइट या कचरे का ढेर दिखा? बोलकर या फोटो खींचकर 30 सेकंड में शिकायत दर्ज करें।",
    reportBtn: "समस्या रिपोर्ट करें",
    exploreBtn: "शहर का नक्शा देखें",
    quickSpeak: "बोलकर शिकायत करें",
    quickPhoto: "फोटो खींचकर भेजें",
    quickChat: "AI सहायक से चैट करें",
    quickCategories: "आपकी समस्या क्या है? चुनने के लिए टैप करें",
    viewAllCategories: "सभी 12 श्रेणियां देखें",
    showLessCategories: "कम देखें (6 श्रेणियां)",
    listenAloud: "🔊 बोलकर सुनें (ऑडियो)",
    speaking: "ऑडियो सुनाया जा रहा है (हिंदी)...",
    stopAudio: "ऑडियो रोकें",
    confirmProceed: "पुष्टि करें और आगे बढ़ें",
    yesSubmit: "👍 हाँ, शिकायत दर्ज करें",
    editSummary: "बदलने के लिए यहां टैप करें",
    aiGreeting: "नमस्ते! मैं {city} के लिए आपका नगरमित्र AI सहायक हूँ। अपनी भाषा में बोलें, फोटो भेजें या नीचे लिखें।",
    reporterConfidential: "🔒 व्यक्तिगत गोपनीयता: आपका नाम, फोन और ईमेल सुरक्षित है और केवल एडमिन को दिखेगा।",
    reporterName: "पूरा नाम *",
    reporterPhone: "मोबाइल नंबर *",
    reporterEmail: "ईमेल पता *",
    reportPublished: "शिकायत सफलतापूर्वक दर्ज हुई",
    viewDetails: "शिकायत की स्थिति देखें ➔",
  },
  te: {
    heroTitle: "నమస్కారం, అనన్య.",
    heroSubtitle: "ఈరోజు మన నగరాన్ని బాగుచేద్దాం.",
    heroDesc: "రోడ్డు గుంత, పగిలిన వీధిదీపం లేదా చెత్త కుప్ప కనిపిస్తే? మాట్లాడి లేదా ఫోటో తీసి 30 సెకన్లలో ఫిర్యాదు చేయండి.",
    reportBtn: "సమస్యను నివేదించండి",
    exploreBtn: "నగర పటం చూడండి",
    quickSpeak: "మీ భాషలో మాట్లాడండి",
    quickPhoto: "ఫోటో తీసి పంపండి",
    quickChat: "AI చాట్ సహాయం",
    quickCategories: "మీ సమస్య ఏమిటి? ఎంచుకోండి",
    viewAllCategories: "అన్ని 12 వర్గాలు చూడండి",
    showLessCategories: "తక్కువ చూడండి (6 వర్గాలు)",
    listenAloud: "🔊 వినిపించండి (ఆడియో)",
    speaking: "ఆడియో ప్లే అవుతోంది (తెలుగు)...",
    stopAudio: "ఆడియో ఆపండి",
    confirmProceed: "నిర్ధారించి ముందుకు వెళ్లండి",
    yesSubmit: "👍 అవును, సమర్పించండి",
    editSummary: "సవరించడానికి ఇక్కడ నొక్కండి",
    aiGreeting: "నమస్కారం! నేను {city} కోసం మీ నగరమిత్ర AI సహాయకుడిని. మాట్లాడండి లేదా ఫోటో పంపండి.",
    reporterConfidential: "🔒 వ్యక్తిగత గోప్యత: మీ పేరు, ఫోన్ మరియు ఈమెయిల్ కేవలం అడ్మిన్లకు మాత్రమే కనిపిస్తాయి.",
    reporterName: "పూర్తి పేరు *",
    reporterPhone: "ఫోన్ నంబర్ *",
    reporterEmail: "ఈమెయిల్ చిరునామా *",
    reportPublished: "ఫిర్యాదు విజయవంతంగా నమోదైంది",
    viewDetails: "ఫిర్యాదు వివరాలు చూడండి ➔",
  },
};

export const CATEGORY_LABELS: Record<Language, Record<string, string>> = {
  en: {
    roads: "Roads & Potholes",
    waste: "Garbage & Waste",
    garbage: "Garbage & Waste",
    water: "Water Supply",
    drainage: "Drainage & Floods",
    electricity: "Streetlights & Power",
    streetlights: "Streetlights & Power",
    infrastructure: "Public Infrastructure",
    environment: "Parks & Greenery",
    health: "Public Health",
    safety: "Safety & Hazards",
    gov_services: "Civic Services",
    corruption: "Anti-Corruption",
    education: "Public Schools",
    other: "Other Issues",
  },
  hi: {
    roads: "सड़क और गड्ढे",
    waste: "कचरा और सफाई",
    garbage: "कचरा और सफाई",
    water: "पानी की आपूर्ति",
    drainage: "नाले और जलभराव",
    electricity: "बिजली व स्ट्रीटलाइट",
    streetlights: "बिजली व स्ट्रीटलाइट",
    infrastructure: "सार्वजनिक निर्माण",
    environment: "पर्यावरण व पार्क",
    health: "स्वास्थ्य व अस्पताल",
    safety: "सुरक्षा व खतरे",
    gov_services: "नगर पालिका सेवाएं",
    corruption: "भ्रष्टाचार निवारण",
    education: "स्कूल व शिक्षा",
    other: "अन्य समस्याएं",
  },
  te: {
    roads: "రోడ్లు మరియు గుంతలు",
    waste: "చెత్త మరియు పారిశుధ్యం",
    garbage: "చెత్త మరియు పారిశుధ్యం",
    water: "తాగునీటి సరఫరా",
    drainage: "మురుగునీరు & వరదలు",
    electricity: "వీధిదీపాలు & విద్యుత్",
    streetlights: "వీధిదీపాలు & విద్యుత్",
    infrastructure: "ప్రజా నిర్మాణాలు",
    environment: "పార్కులు & పచ్చదనం",
    health: "ప్రజారోగ్యం",
    safety: "భద్రత & ప్రమాదాలు",
    gov_services: "మున్సిపల్ సేవలు",
    corruption: "అవినీతి నిరోధం",
    education: "పాఠశాలలు & విద్య",
    other: "ఇతర సమస్యలు",
  },
};
