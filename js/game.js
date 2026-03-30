// The Archivist - Game Logic

// --- STATE ---
// This object holds the entire game state at any moment.
// All numbers the player sees come from here.
const state = {
    knowledge: 0,
    knowledgePerClick: 1,
    knowledgePerSecond: 0,
    totalEarned: 0,
    upgrades: {
        quillScribe: 0,
        dustReader: 0,
        shadowScholar: 0
    },
    prestige: {
        count: 0,           // how many times the player has prestiged
        bonus: 1.0,         // multiplier applied to all knowledge gain
        threshold: 10000    // knowledge needed to prestige
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
    const gained = state.knowledgePerClick * state.prestige.bonus;
    state.knowledge += gained;
    state.totalEarned += gained;
    updateDisplay();
    checkMilestones();
});

// --- PASSIVE INCOME LOOP ---
// Runs every second and adds knowledge based on knowledgePerSecond.
// setInterval calls a function repeatedly at a fixed interval (in ms).
setInterval(() => {
    if (state.knowledgePerSecond > 0) {
        const gained = state.knowledgePerSecond * state.prestige.bonus;
        state.knowledge += gained;
        state.totalEarned += gained;
        updateDisplay();
        checkMilestones();
    }
}, 1000);;

// --- DISPLAY UPDATE ---
// Updates all visible numbers on the page to match the current state.
function updateDisplay() {
    knowledgeCountEl.textContent = Math.floor(state.knowledge);
    fpsEl.textContent = (state.knowledgePerSecond * state.prestige.bonus).toFixed(1);
    renderUpgrades();
    renderPrestige();
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
// --- LORE PANEL DISPLAY ---
// Shows the lore panel and populates it with AI-generated text.
function showLore(text) {
    let panel = document.getElementById("lore-panel");
    if (!panel) {
        panel = document.createElement("div");
        panel.id = "lore-panel";
        panel.innerHTML = `<div id="lore-title">Fragment Recovered</div><div id="lore-text"></div>`;
        document.getElementById("game-container").appendChild(panel);
    }

    // Strip markdown symbols so the text renders cleanly.
    const clean = text
        .replace(/#{1,6}\s*/g, "")
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/\n+/g, " ")
        .trim();

    document.getElementById("lore-text").textContent = clean;
    // A minimal timeout forces the browser to register the opacity: 0 state
// before adding the visible class, enabling the fade-in transition.
requestAnimationFrame(() => {
    requestAnimationFrame(() => {
        panel.classList.add("visible");
    });
});

    // Hide the panel after 12 seconds so it doesn't clutter the screen.
    setTimeout(() => panel.classList.remove("visible"), 12000);
}

// --- LORE EVENT TRIGGER ---
// Calls the Cloudflare Worker which calls Anthropic and returns a lore fragment.
// Using async/await to handle the asynchronous API call cleanly.
async function triggerLoreEvent(milestone) {
    try {
        const response = await fetch("https://archivist-proxy.ap24004.workers.dev/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                milestone: milestone,
                upgrades: state.upgrades
            })
        });

        const data = await response.json();
        showLore(data.lore);

    } catch (err) {
        // Fail silently - if the API call fails, the game continues normally.
        console.log("Lore generation failed:", err);
    }
}
// --- PRESTIGE RENDERER ---
// Shows the prestige button when the player has enough knowledge.
// Displays current prestige count and next bonus.
function renderPrestige() {
    let container = document.getElementById("prestige-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "prestige-container";
        document.getElementById("game-container").appendChild(container);
    }

    const { count, bonus, threshold } = state.prestige;
    const canPrestige = state.knowledge >= threshold;
    const nextBonus = ((bonus + 0.5) * 100).toFixed(0);

    const canPrestige = state.knowledge >= threshold;
    const nextBonus = ((bonus + 0.5) * 100).toFixed(0);

    container.innerHTML = `
        <div id="prestige-info">
            Descent level: <span>${count}</span> &nbsp;|&nbsp;
            Knowledge multiplier: <span>${bonus.toFixed(1)}x</span>
        </div>
        <button id="save-btn">Save Progress</button>
        ${canPrestige ? `<button id="prestige-btn">Descend Deeper (next bonus: ${nextBonus}%)</button>` : ""}
    `;

    document.getElementById("save-btn").onclick = saveGame;

    if (canPrestige) {
        document.getElementById("prestige-btn").onclick = doPrestige;
    }
}

// --- PRESTIGE ACTION ---
// Resets the run but preserves and increases the bonus multiplier.
// Triggers a special AI lore event themed around the new descent level.
function doPrestige() {
    state.prestige.count++;
    state.prestige.bonus += 0.5;
    state.prestige.threshold = Math.floor(state.prestige.threshold * 2);

    // Reset run state
    state.knowledge = 0;
    state.knowledgePerClick = 1;
    state.knowledgePerSecond = 0;
    state.totalEarned = 0;
    state.upgrades.quillScribe = 0;
    state.upgrades.dustReader = 0;
    state.upgrades.shadowScholar = 0;

    // Reset milestones so lore fires again on the new run
    milestonesReached.clear();

    // Trigger a special prestige lore event
    triggerPrestigeLore(state.prestige.count);

    updateDisplay();
    
    // Save immediately after prestige so the descent level is never lost.
    saveGame();
}

// --- PRESTIGE LORE ---
// Calls the Worker with prestige context for a darker, deeper lore fragment.
async function triggerPrestigeLore(descentLevel) {
    try {
        const response = await fetch("https://archivist-proxy.ap24004.workers.dev/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                milestone: `prestige_${descentLevel}`,
                upgrades: state.upgrades,
                context: `The player has just descended to archive level ${descentLevel}. This is a prestige event. Write a darker, more unsettling fragment than before. The archive is pulling them deeper.`
            })
        });

        const data = await response.json();
        showLore(data.lore);

    } catch (err) {
        console.log("Prestige lore generation failed:", err);
    }
}

// --- SAVE SYSTEM ---
// Saves the entire game state to localStorage as a JSON string.
// localStorage can only store strings, so we serialize with JSON.stringify.
function saveGame() {
    const saveData = {
        knowledge: state.knowledge,
        knowledgePerClick: state.knowledgePerClick,
        knowledgePerSecond: state.knowledgePerSecond,
        totalEarned: state.totalEarned,
        upgrades: state.upgrades,
        prestige: state.prestige,
        milestonesReached: Array.from(milestonesReached)
    };
    localStorage.setItem("archivist_save", JSON.stringify(saveData));
    showSaveIndicator();
}

// --- LOAD SYSTEM ---
// Loads saved data from localStorage on startup.
// If no save exists, the game starts fresh.
function loadGame() {
    const raw = localStorage.getItem("archivist_save");
    if (!raw) return;

    try {
        const saved = JSON.parse(raw);

        state.knowledge = saved.knowledge || 0;
        state.knowledgePerClick = saved.knowledgePerClick || 1;
        state.knowledgePerSecond = saved.knowledgePerSecond || 0;
        state.totalEarned = saved.totalEarned || 0;
        state.upgrades = saved.upgrades || state.upgrades;
        state.prestige = saved.prestige || state.prestige;

        // Restore milestones so lore doesn't fire again for already-seen ones.
        if (saved.milestonesReached) {
            saved.milestonesReached.forEach(m =
// --- INIT ---
// Starts the game by rendering the initial state.
// Load any existing save, then render the initial state.
loadGame();
updateDisplay();
