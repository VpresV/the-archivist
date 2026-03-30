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
        count: 0,
        bonus: 1.0,
        threshold: 10000
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
        kps: 0.1
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
const knowledgeCountEl = document.getElementById("knowledge-count");
const fpsEl = document.getElementById("fps");
const clickBtn = document.getElementById("click-btn");

// --- CLICK HANDLER ---
clickBtn.addEventListener("click", () => {
    const gained = state.knowledgePerClick * state.prestige.bonus;
    state.knowledge += gained;
    state.totalEarned += gained;
    updateDisplay();
    checkMilestones();
});

// --- PASSIVE INCOME LOOP ---
// Runs every second and adds knowledge based on knowledgePerSecond.
setInterval(() => {
    if (state.knowledgePerSecond > 0) {
        const gained = state.knowledgePerSecond * state.prestige.bonus;
        state.knowledge += gained;
        state.totalEarned += gained;
        updateDisplay();
        checkMilestones();
    }
}, 1000);

// --- DISPLAY UPDATE ---
// Updates all visible numbers on the page to match the current state.
function updateDisplay() {
    knowledgeCountEl.textContent = Math.floor(state.knowledge);
    fpsEl.textContent = (state.knowledgePerSecond * state.prestige.bonus).toFixed(1);
    renderUpgrades();
    renderPrestige();
}

// --- UPGRADE COST CALCULATOR ---
// Cost increases by 15% per level owned — standard clicker scaling formula.
function getUpgradeCost(def) {
    return Math.floor(def.baseCost * Math.pow(1.15, state.upgrades[def.id]));
}

// --- UPGRADE PURCHASE ---
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
function recalculateKps() {
    let total = 0;
    upgradeDefs.forEach(def => {
        total += def.kps * state.upgrades[def.id];
    });
    state.knowledgePerSecond = total;
}

// --- UPGRADE RENDERER ---
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

// --- LORE PANEL DISPLAY ---
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

    // Double requestAnimationFrame ensures fade-in transition works correctly.
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            panel.classList.add("visible");
        });
    });

    // Hide after 12 seconds.
    setTimeout(() => panel.classList.remove("visible"), 12000);
}

// --- LORE EVENT TRIGGER ---
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
        console.log("Lore generation failed:", err);
    }
}

// --- PRESTIGE RENDERER ---
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
function doPrestige() {
    state.prestige.count++;
    state.prestige.bonus += 0.5;
    state.prestige.threshold = Math.floor(state.prestige.threshold * 2);

    state.knowledge = 0;
    state.knowledgePerClick = 1;
    state.knowledgePerSecond = 0;
    state.totalEarned = 0;
    state.upgrades.quillScribe = 0;
    state.upgrades.dustReader = 0;
    state.upgrades.shadowScholar = 0;

    milestonesReached.clear();

    triggerPrestigeLore(state.prestige.count);

    // Save immediately after prestige so the descent level is never lost.
    saveGame();

    updateDisplay();
}

// --- PRESTIGE LORE ---
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

        if (saved.milestonesReached) {
            saved.milestonesReached.forEach(m => milestonesReached.add(m));
        }

        recalculateKps();

    } catch (err) {
        console.log("Save data corrupted, starting fresh:", err);
        localStorage.removeItem("archivist_save");
    }
}

// --- SAVE INDICATOR ---
function showSaveIndicator() {
    let indicator = document.getElementById("save-indicator");
    if (!indicator) {
        indicator = document.createElement("div");
        indicator.id = "save-indicator";
        document.getElementById("game-container").appendChild(indicator);
    }
    indicator.textContent = "✦ Progress saved ✦";
    indicator.classList.add("visible");
    setTimeout(() => indicator.classList.remove("visible"), 2000);
}

// --- AUTOSAVE ---
// Saves automatically every 30 seconds.
setInterval(saveGame, 30000);

// --- INIT ---
// Load any existing save, then render the initial state.
loadGame();
updateDisplay();
