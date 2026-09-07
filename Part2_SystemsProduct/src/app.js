import { logger } from './logger.js';

// Currency Note Configurations
const currencyMeta = {
    USD: { symbol: "$", name: "United States Dollar", bg: "from-emerald-600 to-teal-800" },
    INR: { symbol: "₹", name: "Indian Rupee", bg: "from-orange-600 to-amber-700" },
    EUR: { symbol: "€", name: "Euro", bg: "from-blue-600 to-indigo-800" },
    GBP: { symbol: "£", name: "British Pound Sterling", bg: "from-purple-600 to-pink-800" },
    JPY: { symbol: "¥", name: "Japanese Yen", bg: "from-red-600 to-rose-800" },
    CAD: { symbol: "C$", name: "Canadian Dollar", bg: "from-red-700 to-amber-800" },
    AUD: { symbol: "A$", name: "Australian Dollar", bg: "from-cyan-600 to-blue-800" }
};

// DOM Elements
const amountInput = document.getElementById('amount-input');
const fromSelect = document.getElementById('from-currency');
const toSelect = document.getElementById('to-currency');
const form = document.getElementById('converter-form');
const resultText = document.getElementById('result-text');
const rateInfo = document.getElementById('rate-info');
const errorBox = document.getElementById('error-box');
const apiStatus = document.getElementById('api-status');

// Note Display Elements
const noteCard = document.getElementById('currency-note-display');
const noteSymbol = document.getElementById('note-symbol');
const noteCode = document.getElementById('note-code');
const noteName = document.getElementById('note-name');
const noteWatermark = document.getElementById('note-watermark');

// Initialize Floating Notes Animation Background
function initFloatingBackground() {
    const bgContainer = document.getElementById('floating-bg');
    const symbols = ['$', '₹', '€', '£', '¥', 'C$', 'A$'];
    
    for (let i = 0; i < 20; i++) {
        const note = document.createElement('div');
        note.className = 'floating-note';
        note.innerText = symbols[Math.floor(Math.random() * symbols.length)];
        note.style.left = `${Math.random() * 100}%`;
        note.style.fontSize = `${Math.random() * 24 + 18}px`;
        note.style.animationDuration = `${Math.random() * 15 + 10}s`;
        note.style.animationDelay = `${Math.random() * 5}s`;
        bgContainer.appendChild(note);
    }
}

// Fetch Live Rates with Graceful Resilient Fallback to rates.json
async function fetchExchangeRates(baseCurrency) {
    logger.info(`Requesting exchange rates for Base: ${baseCurrency}`);
    try {
        const response = await fetch(`https://api.frankfurter.dev/v1/latest?base=${baseCurrency}`);
        if (!response.ok) throw new Error(`API Returned status ${response.status}`);
        
        const data = await response.json();
        logger.info("Successfully fetched live exchange rates from API.");
        
        apiStatus.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Live API Connected`;
        apiStatus.className = "text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-2";
        
        return data.rates;
    } catch (err) {
        logger.warn("Live API unavailable. Falling back to local rates.json", { error: err.message });
        
        apiStatus.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400"></span> Offline Mode (rates.json)`;
        apiStatus.className = "text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-2";

        // Fallback to local config file
        const fallbackRes = await fetch('src/rates.json');
        const fallbackData = await fallbackRes.json();
        return fallbackData.rates;
    }
}

// Dynamic Update for Active Selected Banknote Visual
function updateActiveNoteCard(currencyCode) {
    const meta = currencyMeta[currencyCode] || { symbol: currencyCode, name: currencyCode, bg: "from-slate-700 to-slate-900" };
    
    noteSymbol.innerText = meta.symbol;
    noteCode.innerText = currencyCode;
    noteName.innerText = meta.name;
    noteWatermark.innerText = meta.symbol;
    
    // Smooth Note Card Transition
    noteCard.className = `w-full h-28 mb-6 rounded-2xl bg-gradient-to-r ${meta.bg} p-4 flex flex-col justify-between shadow-lg relative overflow-hidden transition-all duration-500 transform hover:scale-[1.02]`;
}

// Convert Currency Action
async function handleConversion(e) {
    if (e) e.preventDefault();
    errorBox.classList.add('hidden');

    const amount = parseFloat(amountInput.value);
    const fromCurr = fromSelect.value;
    const toCurr = toSelect.value;

    // Resilient Input Validation
    if (isNaN(amount) || amount <= 0) {
        const msg = "Please enter a valid positive numerical amount.";
        errorBox.innerText = msg;
        errorBox.classList.remove('hidden');
        logger.error("Conversion failed due to invalid user input", { amount: amountInput.value });
        return;
    }

    try {
        let convertedValue = amount;
        let rate = 1;

        if (fromCurr !== toCurr) {
            const rates = await fetchExchangeRates(fromCurr);
            rate = rates[toCurr];

            if (!rate) {
                throw new Error(`Rate unavailable for ${toCurr}`);
            }
            convertedValue = amount * rate;
        }

        const symbol = currencyMeta[toCurr]?.symbol || '';
        resultText.innerText = `${symbol}${convertedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        rateInfo.innerText = `1 ${fromCurr} = ${rate.toFixed(4)} ${toCurr}`;

        logger.info("Conversion calculated successfully", { amount, fromCurr, toCurr, convertedValue });
    } catch (err) {
        errorBox.innerText = "Error executing conversion. Please try again.";
        errorBox.classList.remove('hidden');
        logger.error("Unhandled error during conversion processing", { error: err.message });
    }
    
    // Refresh log panel if visible
    document.getElementById('log-container').innerText = logger.getLogs();
}

// Event Listeners
fromSelect.addEventListener('change', (e) => {
    updateActiveNoteCard(e.target.value);
    handleConversion();
});

form.addEventListener('submit', handleConversion);

document.getElementById('toggle-log-btn').addEventListener('click', () => {
    const container = document.getElementById('log-container');
    container.classList.toggle('hidden');
    container.innerText = logger.getLogs();
});

// Initialize on page load
initFloatingBackground();
updateActiveNoteCard(fromSelect.value);
handleConversion();