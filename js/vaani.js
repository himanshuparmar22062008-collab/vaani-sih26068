(function () {
  const PLACES = window.VAANI_PLACES || [];
  const DEV = /[\u0900-\u097F]/;
  const CLIMATE = {
    Bhopal: { sepMean: 26.8, jjas: 980, station: "Bhopal / Bairagarh class" },
    "IISER Bhopal": { sepMean: 26.8, jjas: 980, station: "Bhopal / Bairagarh class" },
    Sehore: { sepMean: 26.6, jjas: 960, station: "Sehore district series" },
    Delhi: { sepMean: 29.4, jjas: 640, station: "Safdarjung class" }
  };

  function byName(q) {
    const t = (q || "").toLowerCase();
    return PLACES.find((p) => p.name.toLowerCase() === t || p.nameHi === q) || null;
  }
  function detectPlace(text) {
    if (/iiser|आईआईएसईआर|bhauri|भौरी|campus|कैम्पस/i.test(text)) return byName("IISER Bhopal");
    const sorted = [...PLACES].sort((a, b) => b.name.length - a.name.length);
    for (const p of sorted) {
      if (text.includes(p.nameHi)) return p;
      if (new RegExp("\\b" + p.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i").test(text)) return p;
    }
    return byName("IISER Bhopal");
  }
  function slots(text, langHint) {
    const language = langHint === "auto" ? (DEV.test(text) ? "hi" : "en") : langHint;
    const t = text.toLowerCase();
    let timeWindow = "next48";
    if (/next two days|दो दिन|48/.test(t)) timeWindow = "next48";
    else if (/tomorrow|कल\b/.test(t)) timeWindow = "tomorrow";
    else if (/week|हफ्ते|सप्ताह/.test(t)) timeWindow = "week";
    else if (/today|आज|अभी/.test(t)) timeWindow = "today";
    let variable = "general";
    if (/climate|जलवायु|सामान्य से|normal/.test(t)) variable = "climate";
    else if (/cyclone|तूफान|चक्रवात/.test(t)) variable = "storm";
    else if (/rain|बारिश|वर्षा/.test(t)) variable = "rain";
    else if (/heat|गर्मी|temp|तापमान|लू/.test(t)) variable = "temp";
    const intent = variable === "climate" ? "climate" : /warning|चेतावनी|cyclone/.test(t) ? "warning" : /spray|छिड़काव|should i|क्या मैं/.test(t) ? "advisory" : "forecast";
    return { place: detectPlace(text), timeWindow, variable, language, intent };
  }

  function rainClass(mm) {
    if (mm >= 204.5) return { key: "extreme", en: "extremely heavy rain", hi: "अत्यंत भारी वर्षा" };
    if (mm >= 115.6) return { key: "very-heavy", en: "very heavy rain", hi: "बहुत भारी वर्षा" };
    if (mm >= 64.5) return { key: "heavy", en: "heavy rain", hi: "भारी वर्षा" };
    if (mm >= 15.6) return { key: "mod", en: "moderate rain", hi: "मध्यम वर्षा" };
    if (mm >= 2.5) return { key: "light", en: "light rain", hi: "हल्की वर्षा" };
    return { key: "dry", en: "little or no rain", hi: "नगण्य वर्षा" };
  }

  function packOpenMeteo(raw) {
    const daily = (raw.daily?.time || []).map((date, i) => ({
      date,
      tMax: raw.daily.temperature_2m_max[i],
      tMin: raw.daily.temperature_2m_min[i],
      precip: raw.daily.precipitation_sum[i],
      windMax: raw.daily.wind_speed_10m_max[i],
      code: raw.daily.weather_code[i]
    }));
    return {
      current: {
        temp: raw.current?.temperature_2m ?? 0,
        humidity: raw.current?.relative_humidity_2m ?? 0,
        precip: raw.current?.precipitation ?? 0,
        wind: raw.current?.wind_speed_10m ?? 0,
        code: raw.current?.weather_code ?? 2
      },
      daily,
      model: "Open-Meteo best_match (ECMWF / DWD / GFS blend)",
      issuedAt: raw.current?.time || new Date().toISOString()
    };
  }

  function packMetNorway(raw) {
    const series = raw.properties?.timeseries || [];
    const now = series[0]?.data?.instant?.details || {};
    const byDay = {};
    series.forEach((row) => {
      const date = row.time.slice(0, 10);
      const d = row.data?.instant?.details || {};
      const rain = (row.data?.next_6_hours?.details?.precipitation_amount) || 0;
      if (!byDay[date]) byDay[date] = { date, tMax: d.air_temperature, tMin: d.air_temperature, precip: 0, windMax: d.wind_speed * 3.6, code: 2 };
      byDay[date].tMax = Math.max(byDay[date].tMax, d.air_temperature);
      byDay[date].tMin = Math.min(byDay[date].tMin, d.air_temperature);
      byDay[date].precip += rain;
      byDay[date].windMax = Math.max(byDay[date].windMax, (d.wind_speed || 0) * 3.6);
    });
    return {
      current: {
        temp: now.air_temperature ?? 0,
        humidity: now.relative_humidity ?? 0,
        precip: 0,
        wind: (now.wind_speed || 0) * 3.6,
        code: 2
      },
      daily: Object.values(byDay).slice(0, 7),
      model: "MET Norway locationforecast (fallback)",
      issuedAt: series[0]?.time || new Date().toISOString()
    };
  }

  async function forecast(place) {
    const om = new URL("https://api.open-meteo.com/v1/forecast");
    om.searchParams.set("latitude", place.lat);
    om.searchParams.set("longitude", place.lon);
    om.searchParams.set("current", "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m");
    om.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max");
    om.searchParams.set("timezone", "Asia/Kolkata");
    om.searchParams.set("forecast_days", "7");
    om.searchParams.set("wind_speed_unit", "kmh");
    try {
      const res = await fetch(om);
      if (res.ok) return packOpenMeteo(await res.json());
    } catch (_) { /* fall through */ }
    const met = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${place.lat}&lon=${place.lon}`;
    const res2 = await fetch(met, { headers: { "Accept": "application/json" } });
    if (!res2.ok) throw new Error("Forecast feed unreachable");
    return packMetNorway(await res2.json());
  }

  function climateOf(place) {
    return CLIMATE[place.name] || CLIMATE.Bhopal;
  }

  function demoWarning(place) {
    const issued = new Date().toLocaleString("en-GB", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
    return {
      demo: true,
      title: "Cyclone watch — Bay of Bengal (judge demo)",
      titleHi: "चक्रवात निगरानी — बंगाल की खाड़ी (डेमो)",
      verbatim: `IMD-STYLE CYCLONE WARNING (JUDGE DEMO OVERLAY — NOT A LIVE BULLETIN)\nDated: ${issued} IST\nThe well-marked low over east-central Bay of Bengal is very likely to intensify into a Depression during the next 24 hours. Fishermen are advised not to venture into the east-central Bay of Bengal. District disaster management authorities of ${place.name.toUpperCase()} to keep control rooms active.\n\nVAANI never paraphrases this text. The routine forecast is held below the warning.`,
      verbatimHi: `IMD-शैली चक्रवात चेतावनी (जज डेमो — यह जीवित बुलेटिन नहीं है)\nदिनांक: ${issued} IST\nपूर्वी-मध्य बंगाल की खाड़ी पर बना सघन निम्न दबाव अगले 24 घंटों में डिप्रेशन में बदल सकता है। मछुआरा समुद्र में न जाएँ। ${place.nameHi} जिला आपदा नियंत्रण कक्ष सक्रिय रखे।\n\nVAANI इस पाठ का सारांश नहीं बदलती।`
    };
  }

  function deriveWarning(place, daily) {
    const next = daily.slice(0, 3);
    const heavy = next.find((d) => {
      const k = rainClass(d.precip).key;
      return k === "heavy" || k === "very-heavy" || k === "extreme";
    });
    if (!heavy) return null;
    const cls = rainClass(heavy.precip);
    return {
      demo: false,
      title: cls.en + " — " + place.name,
      titleHi: cls.hi + " — " + place.nameHi,
      verbatim: `RAINFALL WARNING · ${place.name.toUpperCase()} · ${heavy.precip.toFixed(0)} mm on ${heavy.date} (${cls.en} under IMD classes). Verify at mausam.imd.gov.in. This is derived from open NWP, not a substitute for the IMD bulletin.`,
      verbatimHi: `वर्षा चेतावनी · ${place.nameHi} · ${heavy.date} को लगभग ${heavy.precip.toFixed(0)} मिमी (${cls.hi})। IMD जिला बुलेटिन से सत्यापित करें।`
    };
  }

  function compose(place, sl, bundle, warning, role) {
    const days = sl.timeWindow === "tomorrow" ? bundle.daily.slice(1, 2) : sl.timeWindow === "week" ? bundle.daily : sl.timeWindow === "today" ? bundle.daily.slice(0, 1) : bundle.daily.slice(0, 2);
    const rain = days.reduce((s, d) => s + (d.precip || 0), 0);
    const tMax = Math.max(...days.map((d) => d.tMax), bundle.current.temp);
    const tMin = Math.min(...days.map((d) => d.tMin), bundle.current.temp);
    const cls = rainClass(rain);
    const issued = String(bundle.issuedAt).replace("T", " ");
    const when = { now: "right now", today: "today", tomorrow: "tomorrow", next48: "the next two days", week: "the coming week" }[sl.timeWindow];
    const whenHi = { now: "अभी", today: "आज", tomorrow: "कल", next48: "अगले दो दिन", week: "आने वाले सप्ताह" }[sl.timeWindow];
    const cli = climateOf(place);
    let answer;
    if (sl.intent === "climate") {
      answer = sl.language === "hi"
        ? `${place.nameHi} का सितंबर जलवायु सामान्य लगभग ${cli.sepMean} °C है (${cli.station}, 1991–2020 शैली)। अभी का तापमान ${Math.round(bundle.current.temp)} °C। यह संदर्भ है, पूर्वानुमान नहीं।`
        : `${place.name} September climate normal is about ${cli.sepMean} °C (${cli.station}, 1991–2020-style). Right now ${Math.round(bundle.current.temp)} °C. This is context, not a forecast. JJAS monsoon normal ~${cli.jjas} mm.`;
    } else if (sl.language === "hi") {
      answer = `${place.nameHi} (${place.state}) में ${whenHi} संभावित वर्षा ${rain.toFixed(1)} मिमी — ${cls.hi}। अधिकतम/न्यूनतम लगभग ${Math.round(tMax)}/${Math.round(tMin)} °C। पूर्वानुमान जारी: ${issued} IST। स्रोत: ${bundle.model}। IMD जिला बुलेटिन से मिलाएँ।`;
      if (warning) answer = "चेतावनी पहले। VAANI चेतावनी का सारांश नहीं बदलती — मूल पाठ उपर है।\n\n" + answer;
    } else {
      answer = `${place.name}, ${place.state}: about ${rain.toFixed(1)} mm through ${when} — ${cls.en}. Temperatures around ${Math.round(tMax)} / ${Math.round(tMin)} °C. Issued ${issued} IST from ${bundle.model} on a ~0.25° grid. Cross-check the IMD district bulletin.`;
      if (warning) answer = "A warning is active and is shown verbatim above. VAANI will not soften it. The routine forecast follows.\n\n" + answer;
    }
    let advisory = null;
    if (role === "farmer") {
      advisory = sl.language === "hi"
        ? (rain >= 10 ? "अगले दो दिन छिड़काव स्थगित करें, सिंचाई रोकें।" : "छिड़काव के लिए सुबह का समय बेहतर है।")
        : (rain >= 10 ? "Hold pesticide spraying and irrigation for 48 hours." : "Morning spray window is usable.");
    } else if (role === "officer") {
      advisory = sl.language === "hi"
        ? "नियंत्रण कक्ष अपडेट करें। VAANI आधिकारिक आदेश नहीं है।"
        : "Control room: refresh shelter lists. VAANI is not an official order.";
    } else if (role === "fisher" || place.kind === "coast") {
      advisory = sl.language === "hi"
        ? "समुद्र में निकलने से पहले IMD समुद्री बुलेटिन पढ़ें।"
        : "Read the IMD sea-area bulletin before leaving harbour.";
    }
    return { answer, advisory };
  }

  window.VAANI = { byName, slots, forecast, demoWarning, deriveWarning, compose, rainClass, climateOf };
})();
