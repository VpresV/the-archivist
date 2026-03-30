// The Archivist - Game Logic

// --- STATE ---
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
function updateDisplay() {
    knowledgeCountEl.textContent = Math.floor(state.knowledge);
    fpsEl.textContent = (state.knowledgePerSecond * state.prestige.bonus).toFixed(1);
    renderUpgrades();
    renderPrestige();
}

// --- UPGRADE COST CALCULATOR ---
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

    const clean = text
        .replace(/#{1,6}\s*/g, "")
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/\n+/g, " ")
        .trim();

    document.getElementById("lore-text").textContent = clean;

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            panel.classList.add("visible");
        });
    });

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
// Only rebuilds the DOM when prestige state actually changes,
// preventing hover flicker caused by constant re-rendering.
let lastPrestigeSnapshot = "";

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

    // Build a snapshot string of the values that affect the UI.
    // If nothing has changed since last render, skip rebuilding the DOM.
    const snapshot = `${count}-${bonus}-${canPrestige}`;
    if (snapshot === lastPrestigeSnapshot) return;
    lastPrestigeSnapshot = snapshot;

    container.innerHTML = `
        <div id="prestige-info">
            Descent level: <span>${count}</span> &nbsp;|&nbsp;
            Knowledge multiplier: <span>${bonus.toFixed(1)}x</span>
        </div>
        <div id="action-buttons">
            <button id="save-btn">✦ Save Progress</button>
            <a id="kofi-btn" href="https://ko-fi.com/thearchivistgame" target="_blank">
                Support the Archive
            </a>
        </div>
        <div id="save-indicator"></div>
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
    const indicator = document.getElementById("save-indicator");
    if (!indicator) return;
    indicator.textContent = "✦ Progress saved ✦";
    indicator.classList.add("visible");
    setTimeout(() => indicator.classList.remove("visible"), 2000);
}

// --- AUTOSAVE ---
setInterval(saveGame, 30000);

// --- HOW TO PLAY TOGGLE ---
// Collapses and expands the how to play section.
// Hidden by default after first visit using localStorage.
const htpContent = document.getElementById("htp-content");
const htpToggle = document.getElementById("htp-toggle");

if (localStorage.getItem("htp_dismissed")) {
    htpContent.style.display = "none";
    htpToggle.textContent = "How to Play ▸";
}

htpToggle.addEventListener("click", () => {
    const isVisible = htpContent.style.display !== "none";
    if (isVisible) {
        htpContent.style.display = "none";
        htpToggle.textContent = "How to Play ▸";
        localStorage.setItem("htp_dismissed", "1");
    } else {
        htpContent.style.display = "block";
        htpToggle.textContent = "How to Play ▾";
        localStorage.removeItem("htp_dismissed");
    }
});

// --- INIT ---
loadGame();
updateDisplay();
