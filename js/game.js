// The Archivist - Game Logic

// --- STATE ---
// This object holds the entire game state at any moment.
// All numbers the player sees come from here.
const state = {
    knowledge: 0,           // current knowledge points
    knowledgePerClick: 1,   // how much each click gives
    knowledgePerSecond: 0,  // passive generation rate
    totalEarned: 0,         // lifetime total (used for milestones)
    upgrades: {
        quillScribe: 0,     // first passive upgrade
        dustReader: 0,      // second passive upgrade
        shadowScholar: 0    // third passive upgrade
    }
};

// --- UPGRADE DEFINITIONS ---
// Each upgrade has a name, description, base cost, and how much
// knowledge per second it contributes per level owned.
const upgradeDefs = [
    {
        id: "quillScribe",
        name: "Quill Scribe",
        description: "A scribe who copies fragments endlessly.",
        baseCost: 10,
        kps: 0.1        // knowledge per second per level
    },
    {
        id: "dustReader",
        name: "Dust Reader",
        description: "Reads meaning from ashes and forgotten dust.",
        baseCost: 75,
        kps: 0.5
    },
    {
        id: "shadowScholar",
        name: "Shadow Scholar",
        description: "A scholar who works in the dark between worlds.",
        baseCost: 500,
        kps: 3
    }
];

// --- DOM REFERENCES ---
// We grab references to the HTML elements once and reuse them.
// This is faster than searching the DOM every frame.
const knowledgeCountEl = document.getElementById("knowledge-count");
const fpsEl = document.getElementById("fps");
const clickBtn = document.getElementById("click-btn");

// --- CLICK HANDLER ---
// Called every time the player clicks the main button.
clickBtn.addEventListener("click", () => {
    state.knowledge += state.knowledgePerClick;
    state.totalEarned += state.knowledgePerClick;
    updateDisplay();
    checkMilestones();
});

// --- PASSIVE INCOME LOOP ---
// Runs every second and adds knowledge based on knowledgePerSecond.
// setInterval calls a function repeatedly at a fixed interval (in ms).
setInterval(() => {
    if (state.knowledgePerSecond > 0) {
        state.knowledge += state.knowledgePerSecond;
        state.totalEarned += state.knowledgePerSecond;
        updateDisplay();
        checkMilestones();
    }
}, 1000);

// --- DISPLAY UPDATE ---
// Updates all visible numbers on the page to match the current state.
function updateDisplay() {
    knowledgeCountEl.textContent = Math.floor(state.knowledge);
    fpsEl.textContent = state.knowledgePerSecond.toFixed(1);
    renderUpgrades();
}

// --- UPGRADE COST CALCULATOR ---
// The cost of each upgrade increases by 15% per level owned.
// This is the standard "scaling cost" formula used in most clicker games.
// It ensures the game stays challenging as you progress.
function getUpgradeCost(def) {
    return Math.floor(def.baseCost * Math.pow(1.15, state.upgrades[def.id]));
}

// --- UPGRADE PURCHASE ---
// Called when the player clicks an upgrade button.
// Deducts cost, increments level, recalculates passive income.
function buyUpgrade(defId) {
    const def = upgradeDefs.find(d => d.id === defId);
    const cost = getUpgradeCost(def);

    if (state.knowledge >= cost) {
        state.knowledge -= cost;
        state.upgrades[def.id]++;
        recalculateKps();
        updateDisplay();
    }
}

// --- KPS RECALCULATOR ---
// Recalculates total knowledge per second from all owned upgrades.
// Called every time an upgrade is purchased.
function recalculateKps() {
    let total = 0;
    upgradeDefs.forEach(def => {
        total += def.kps * state.upgrades[def.id];
    });
    state.knowledgePerSecond = total;
}

// --- UPGRADE RENDERER ---
// Dynamically builds the upgrade shop from upgradeDefs.
// This means adding a new upgrade only requires adding to upgradeDefs.
function renderUpgrades() {
    let container = document.getElementById("upgrade-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "upgrade-container";
        document.getElementById("game-container").appendChild(container);
    }

    container.innerHTML = "";

    upgradeDefs.forEach(def => {
        const cost = getUpgradeCost(def);
        const owned = state.upgrades[def.id];
        const canAfford = state.knowledge >= cost;

        const btn = document.createElement("button");
        btn.className = "upgrade-btn" + (canAfford ? " affordable" : "");
        btn.innerHTML = `
            <strong>${def.name}</strong> (owned: ${owned})<br/>
            <small>${def.description}</small><br/>
            Cost: ${cost} knowledge
        `;
        btn.onclick = () => buyUpgrade(def.id);
        container.appendChild(btn);
    });
}

// --- MILESTONE CHECKER ---
// Checks if the player has reached a knowledge threshold.
// This is where we will later trigger AI-generated lore events.
const milestonesReached = new Set();
const milestones = [10, 50, 100, 500, 1000, 5000, 10000];

function checkMilestones() {
    milestones.forEach(m => {
        if (state.totalEarned >= m && !milestonesReached.has(m)) {
            milestonesReached.add(m);
            triggerLoreEvent(m);
        }
    });
}

// --- LORE EVENT TRIGGER ---
// Placeholder for now. Later this will call the Cloudflare Worker
// to get an AI-generated lore fragment from the Anthropic API.
function triggerLoreEvent(milestone) {
    console.log(`Milestone reached: ${milestone} knowledge`);
    // Phase 4: AI lore generation will be added here
}

// --- INIT ---
// Starts the game by rendering the initial state.
updateDisplay();
