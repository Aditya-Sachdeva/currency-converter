import { logger } from './logger.js';

// Detailed Banknote Visual Metadata
const banknoteData = {
    USD: {
        country: "UNITED STATES OF AMERICA",
        title: "FEDERAL RESERVE NOTE",
        symbol: "$",
        denom: "$100",
        name: "United States Dollar",
        themeClass: "bg-note-usd",
        accentColor: "#34d399",
        badge: "BASE CURRENCY"
    },
    INR: {
        country: "RESERVE BANK OF INDIA",
        title: "GUARANTEED BY CENTRAL GOVERNMENT",
        symbol: "₹",
        denom: "₹500",
        name: "Indian Rupee",
        themeClass: "bg-note-inr",
        accentColor: "#fb923c",
        badge: "TARGET CURRENCY"
    },
    EUR: {
        country: "EUROPEAN CENTRAL BANK",
        title: "EUROSIG / BCN EZB EKT EKP 2026",
        symbol: "€",
        denom: "€100",
        name: "Euro",
        themeClass: "bg-note-eur",
        accentColor: "#60a5fa",
        badge: "EUROZONE"
    },
    GBP: {
        country: "BANK OF ENGLAND",
        title: "PROMISE TO PAY THE BEARER ON DEMAND",
        symbol: "£",
        denom: "£50",
        name: "British Pound Sterling",
        themeClass: "bg-note-gbp",
        accentColor: "#c084fc",
        badge: "STERLING"
    },
    JPY: {
        country: "BANK OF JAPAN",
        title: "NIPPON GINKO 10000 YEN",
        symbol: "¥",
        denom: "¥10000",
        name: "Japanese Yen",
        themeClass: "bg-note-jpy",
        accentColor: "#f87171",
        badge: "PACIFIC FX"
    },
    CAD: {
        country: "BANK OF CANADA / BANQUE DU CANADA",
        title: "UNOFFICIAL SPECIMEN NOTE",
        symbol: "C$",
        denom: "C$100",
        name: "Canadian Dollar",
        themeClass: "bg-note-cad",
        accentColor: "#ef4444",
        badge: "NORTH AMERICA"
    },
    AUD: {
        country: "RESERVE BANK OF AUSTRALIA",
        title: "AUSTRALIAN LEGAL TENDER",
        symbol: "A$",
        denom: "A$100",
        name: "Australian Dollar",
        themeClass: "bg-note-aud",
        accentColor: "#2dd4bf",
        badge: "OCEANIA"
    }
};

// In-Memory Rate Cache to guarantee instant response times
const rateCache = {};

// DOM Elements
const amountInput = document.getElementById('amount-input');
const amountSymbolPrefix = document.getElementById('amount-symbol-prefix');
const fromSelect = document.getElementById('from-currency');
const toSelect = document.getElementById('to-currency');
const form = document.getElementById('converter-form');
const resultText = document.getElementById('result-text');
const rateInfo = document.getElementById('rate-info');
const errorBox = document.getElementById('error-box');
const apiStatus = document.getElementById('api-status');
const swapBtn = document.getElementById('swap-btn');

// Banknote Card DOM Elements
const banknoteCard = document.getElementById('banknote-card');
const noteCountry = document.getElementById('note-country');
const noteTitle = document.getElementById('note-title');
const noteSymbolLarge = document.getElementById('note-symbol-large');
const noteWatermarkSymbol = document.getElementById('note-watermark-symbol');
const noteCurrencyName = document.getElementById('note-currency-name');
const noteBadge = document.getElementById('note-badge');
const noteGlare = document.getElementById('note-glare');

// 1. Interactive 3D Physics Canvas Particles (Floating Notes)
function initAmbientCanvas() {
    const container = document.getElementById('ambient-canvas-container');
    const symbols = ['$', '₹', '€', '£', '¥', 'C$', 'A$'];
    const particleCount = 22;

    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.className = 'floating-particle-note';
        p.innerText = symbols[Math.floor(Math.random() * symbols.length)];
        
        const size = Math.random() * 32 + 18;
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        const duration = Math.random() * 20 + 15;
        const delay = Math.random() * -20;

        p.style.fontSize = `${size}px`;
        p.style.left = `${startX}vw`;
        p.style.top = `${startY}vh`;
        p.style.color = ['#34d399', '#fb923c', '#60a5fa', '#c084fc'][Math.floor(Math.random() * 4)];

        // Smooth CSS keyframe physics drive
        p.animate([
            { transform: 'translate3d(0, 0, 0) rotate(0deg)', opacity: 0.1 },
            { transform: `translate3d(${Math.random() * 100 - 50}px, -40vh, 0) rotate(${Math.random() * 360}deg)`, opacity: 0.25 },
            { transform: `translate3d(${Math.random() * 100 - 50}px, -80vh, 0) rotate(${Math.random() * 720}deg)`, opacity: 0.0 }
        ], {
            duration: duration * 1000,
            iterations: Infinity,
            delay: delay * 1000,
            easing: 'linear'
        });

        container.appendChild(p);
    }
}

// 2. 3D Spatial Tilt Hover Physics on Banknote
banknoteCard.addEventListener('mousemove', (e) => {
    const rect = banknoteCard.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    banknoteCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    noteGlare.style.opacity = '1';
    noteGlare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.25) 0%, transparent 60%)`;
});

banknoteCard.addEventListener('mouseleave', () => {
    banknoteCard.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    noteGlare.style.opacity = '0';
});

// 3. Update Banknote Visual State with Transfer Animation
function updateBanknoteVisual(currencyCode) {
    const meta = banknoteData[currencyCode] || banknoteData.USD;

    // Trigger Transfer Glide Class
    banknoteCard.classList.remove('animate-note-transfer');
    void banknoteCard.offsetWidth; // Force Reflow
    banknoteCard.classList.add('animate-note-transfer');

    setTimeout(() => {
        // Reset classes
        banknoteCard.className = `note-3d-card w-full h-44 rounded-2xl p-5 shadow-2xl relative overflow-hidden border border-white/10 flex flex-col justify-between cursor-pointer select-none ${meta.themeClass}`;
        
        noteCountry.innerText = meta.country;
        noteTitle.innerText = meta.title;
        noteSymbolLarge.innerText = meta.denom;
        noteWatermarkSymbol.innerText = meta.symbol;
        noteCurrencyName.innerText = meta.name;
        noteBadge.innerText = meta.badge;
        noteBadge.style.color = meta.accentColor;
        amountSymbolPrefix.innerText = currencyCode;
    }, 200);
}

// 4. Fetch FX Exchange Rates with In-Memory Caching & Fallback
async function getExchangeRates(base) {
    if (rateCache[base]) {
        return rateCache[base];
    }

    logger.info(`Fetching live rates for base: ${base}`);
    try {
        const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=${base}`);
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        const data = await res.json();
        
        rateCache[base] = data.rates;
        
        apiStatus.innerHTML = `<span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span> LIVE API ACTIVE`;
        apiStatus.className = "text-[11px] font-mono px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-2 shadow-inner";
        
        return data.rates;
    } catch (err) {
        logger.warn("Live API request failed. Activating local rates.json fallback.", { message: err.message });

        apiStatus.innerHTML = `<span class="h-2 w-2 rounded-full bg-amber-400"></span> OFFLINE (RATES.JSON)`;
        apiStatus.className = "text-[11px] font-mono px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-2 shadow-inner";

        const fallbackRes = await fetch('src/rates.json');
        const fallbackData = await fallbackRes.json();
        return fallbackData.rates;
    }
}

// 5. Instant Conversion Calculator Execution
async function calculateConversion() {
    errorBox.classList.add('hidden');
    const amount = parseFloat(amountInput.value);
    const from = fromSelect.value;
    const to = toSelect.value;

    if (isNaN(amount) || amount <= 0) {
        errorBox.innerText = "CRITICAL ERROR: Please provide a valid positive numerical amount.";
        errorBox.classList.remove('hidden');
        logger.error("Invalid conversion amount entered", { rawInput: amountInput.value });
        return;
    }

    try {
        let rate = 1;
        if (from !== to) {
            const rates = await getExchangeRates(from);
            rate = rates[to] || 1;
        }

        const convertedVal = amount * rate;
        const targetMeta = banknoteData[to] || { symbol: '' };

        // Animated Number Counter Effect
        resultText.innerText = `${targetMeta.symbol}${convertedVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        rateInfo.innerText = `1 ${from} = ${rate.toFixed(4)} ${to}`;

        logger.info("Conversion calculated successfully", { amount, from, to, convertedVal, rate });
    } catch (err) {
        errorBox.innerText = "System fault during calculation. Please check your network connection.";
        errorBox.classList.remove('hidden');
        logger.error("Unhandled calculation failure", { error: err.message });
    }

    // Refresh Log Console Drawer
    const logContainer = document.getElementById('log-container');
    if (!logContainer.classList.contains('hidden')) {
        logContainer.innerText = logger.getLogs();
    }
}

// Event Listeners
fromSelect.addEventListener('change', (e) => {
    updateBanknoteVisual(e.target.value);
    calculateConversion();
});

toSelect.addEventListener('change', () => {
    calculateConversion();
});

amountInput.addEventListener('input', () => {
    calculateConversion();
});

swapBtn.addEventListener('click', () => {
    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;

    updateBanknoteVisual(fromSelect.value);
    calculateConversion();
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculateConversion();
});

document.getElementById('toggle-log-btn').addEventListener('click', () => {
    const logContainer = document.getElementById('log-container');
    logContainer.classList.toggle('hidden');
    logContainer.innerText = logger.getLogs();
});

// Initial Setup Execution
initAmbientCanvas();
updateBanknoteVisual(fromSelect.value);
calculateConversion();