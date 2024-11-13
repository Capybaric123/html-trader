// Game state variables
let balance = 10000;  // Starting balance
let holdings = 0;     // Number of assets owned
let currentPrice = 0; // Current asset price
let priceHistory = []; // Store price history for graph
let transactions = []; // Store transaction history

// DOM elements
const balanceEl = document.getElementById('balance');
const holdingsEl = document.getElementById('holdings');
const priceEl = document.getElementById('currentPrice');
const buyBtn = document.getElementById('buyBtn');
const sellBtn = document.getElementById('sellBtn');
const priceGraph = document.getElementById('priceGraph');
const transactionList = document.getElementById('transaction-list');

// Initialize canvas for graph
const ctx = priceGraph.getContext('2d');
priceGraph.width = 500;
priceGraph.height = 300;

// Load saved game state from localStorage
function loadState() {
    const savedState = JSON.parse(localStorage.getItem('tradingGameState'));
    if (savedState) {
        balance = savedState.balance;
        holdings = savedState.holdings;
        priceHistory = savedState.priceHistory || [];
        currentPrice = savedState.currentPrice || 100;
        transactions = savedState.transactions || [];
    }
    updateUI();
}

// Save game state to localStorage
function saveState() {
    const gameState = {
        balance,
        holdings,
        priceHistory,
        currentPrice,
        transactions
    };
    localStorage.setItem('tradingGameState', JSON.stringify(gameState));
}

// Update the UI
function updateUI() {
    balanceEl.innerText = `Balance: $${balance.toFixed(2)}`;
    holdingsEl.innerText = `Your Holdings: ${holdings}`;
    priceEl.innerText = currentPrice.toFixed(2);
    updateTransactionHistory();
    drawGraph();
}

// Update the transaction history list
function updateTransactionHistory() {
    transactionList.innerHTML = '';
    transactions.forEach((transaction, index) => {
        const transactionEl = document.createElement('div');
        transactionEl.innerText = `${transaction.type} - ${transaction.amount} units @ $${transaction.price.toFixed(2)} (Total: $${transaction.total.toFixed(2)})`;
        transactionList.appendChild(transactionEl);
    });
}

// Draw the price history graph
function drawGraph() {
    ctx.clearRect(0, 0, priceGraph.width, priceGraph.height);
    ctx.beginPath();
    ctx.moveTo(0, priceGraph.height - priceHistory[0] * 2);
    for (let i = 1; i < priceHistory.length; i++) {
        ctx.lineTo(i * (priceGraph.width / priceHistory.length), priceGraph.height - priceHistory[i] * 2);
    }
    ctx.strokeStyle = '#00ff00';
    ctx.stroke();
    // Scroll the canvas to follow the latest point
    priceGraph.scrollLeft = priceGraph.scrollWidth;
}

// Generate random price fluctuation
function generatePrice() {
    const fluctuation = (Math.random() - 0.5) * 10; // Random fluctuation between -5 and +5
    currentPrice = Math.max(10, currentPrice + fluctuation); // Ensure the price doesn't go below $10
    priceHistory.push(currentPrice);
    if (priceHistory.length > priceGraph.width / 2) {
        priceHistory.shift(); // Remove old prices to keep the graph size constant
    }
    updateUI();
}

// Handle buy action
function handleBuy() {
    if (balance >= currentPrice) {
        balance -= currentPrice;
        holdings += 1;
        transactions.push({
            type: 'Buy',
            amount: 1,
            price: currentPrice,
            total: currentPrice
        });
        saveState();
    } else {
        alert("Not enough balance to buy.");
    }
}

// Handle sell action
function handleSell() {
    if (holdings > 0) {
        balance += currentPrice;
        holdings -= 1;
        transactions.push({
            type: 'Sell',
            amount: 1,
            price: currentPrice,
            total: currentPrice
        });
        saveState();
    } else {
        alert("No assets to sell.");
    }
}

// Game loop: Update price every 2 seconds
setInterval(() => {
    generatePrice();
}, 2000);

// Initialize game state and set event listeners
loadState();
buyBtn.addEventListener('click', handleBuy);
sellBtn.addEventListener('click', handleSell);
