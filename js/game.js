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
        shadowScholar: 0,
        boneCartographer: 0,
        echoBinder: 0,
        veilSurgeon: 0,
        dreamingLibrarian: 0,
        hollowArchivist: 0
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
        kps: 0.1,
        requiredDescent: 0
    },
    {
        id: "dustReader",
        name: "Dust Reader",
        description: "Reads meaning from ashes and forgotten dust.",
        baseCost: 75,
        kps: 0.5,
        requiredDescent: 0
    },
    {
        id: "shadowScholar",
        name: "Shadow Scholar",
        description: "A scholar who works in the dark between worlds.",
        baseCost: 500,
        kps: 3,
        requiredDescent: 0
    },
    {
        id: "boneCartographer",
        name: "Bone Cartographer",
        description: "Maps the archive's forbidden wings in brittle script.",
        baseCost: 3000,
        kps: 10,
        requiredDescent: 1
    },
    {
        id: "echoBinder",
        name: "Echo Binder",
        description: "Binds whispers into solid text before they fade.",
        baseCost: 15000,
        kps: 40,
        requiredDescent: 2
    },
    {
        id: "veilSurgeon",
        name: "Veil Surgeon",
        description: "Cuts through reality to retrieve pages lost between worlds.",
        baseCost: 100000,
        kps: 150,
        requiredDescent: 3
    },
    {
        id: "dreamingLibrarian",
        name: "Dreaming Librarian",
        description: "Reads while the archive sleeps, stealing knowledge from its dreams.",
        baseCost: 750000,
        kps: 500,
        requiredDescent: 4
    },
    {
        id: "hollowArchivist",
        name: "The Hollow Archivist",
        description: "Has become part of the archive itself. It no longer remembers its name.",
        baseCost: 5000000,
        kps: 1500,
        requiredDescent: 5
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
    const kps = state.knowledgePerSecond * (state.prestige.bonus || 1);
    fpsEl.textContent = isNaN(kps) ? "0.0" : kps.toFixed(1);
    renderUpgrades();
    renderPrestige();
}

// --- UPGRADE COST CALCULATOR ---
function getUpgradeCost(def) {
    const owned = state.upgrades[def.id] || 0;
    return Math.floor(def.baseCost * Math.pow(1.15, owned));
}

// --- UPGRADE AVAILABILITY CHECK ---
function isUpgradeUnlocked(def) {
    return state.prestige.count >= def.requiredDescent;
}

// --- UPGRADE PURCHASE ---
function buyUpgrade(defId) {
    const def = upgradeDefs.find(d => d.id === defId);
    if (!isUpgradeUnlocked(def)) return;
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
        if (isUpgradeUnlocked(def)) {
            total += def.kps * (state.upgrades[def.id] || 0);
        }
    });
    state.knowledgePerSecond = total;
}

// --- UPGRADE RENDERER ---
let upgradesBuilt = false;

function renderUpgrades() {
    let container = document.getElementById("upgrade-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "upgrade-container";
        document.getElementById("game-container").appendChild(container);
    }

    const unlockedCount = upgradeDefs.filter(isUpgradeUnlocked).length;
    const currentCount = container.querySelectorAll(".upgrade-btn").length;

    if (!upgradesBuilt || unlockedCount !== currentCount) {
        container.innerHTML = "";
        upgradeDefs.forEach(def => {
            if (!isUpgradeUnlocked(def)) return;
            const btn = document.createElement("button");
            btn.className = "upgrade-btn";
            btn.id = `upgrade-${def.id}`;
            btn.onclick = () => buyUpgrade(def.id);
            container.appendChild(btn);
        });
        upgradesBuilt = true;
    }

    upgradeDefs.forEach(def => {
        if (!isUpgradeUnlocked(def)) return;
        const cost = getUpgradeCost(def);
        const owned = state.upgrades[def.id] || 0;
        const canAfford = state.knowledge >= cost;

        const btn = document.getElementById(`upgrade-${def.id}`);
        if (!btn) return;

        btn.className = "upgrade-btn" + (canAfford ? " affordable" : "");
        btn.innerHTML = `
            <strong>${def.name}</strong> (owned: ${owned})<br/>
            <small>${def.description}</small><br/>
            Cost: ${cost} knowledge
        `;
    });
}

// --- MILESTONE CHECKER ---
const milestonesReached = new Set();
const milestones = [10, 50, 100, 500, 1000, 5000, 10000, 50000, 100000, 500000, 1000000];

function checkMilestones() {
    milestones.forEach(m => {
        if (state.totalEarned >= m && !milestonesReached.has(m)) {
            milestonesReached.add(m);
            triggerLoreEvent(m);
        }
    });
}

// --- LORE PANEL DISPLAY ---
function showLore(title, text) {
    let panel = document.getElementById("lore-panel");
    if (!panel) {
        panel = document.createElement("div");
        panel.id = "lore-panel";
        panel.innerHTML = `<div id="lore-title"></div><div id="lore-text"></div>`;
        
        // Insert lore panel before the upgrade container so it appears
        // in the middle of the game rather than at the bottom.
        const upgradeContainer = document.getElementById("upgrade-container");
        if (upgradeContainer) {
            document.getElementById("game-container").insertBefore(panel, upgradeContainer);
        } else {
            document.getElementById("game-container").appendChild(panel);
        }
    }

    const cleanText = text
        .replace(/#{1,6}\s*/g, "")
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/\n+/g, " ")
        .trim();

    const cleanTitle = title
        .replace(/#{1,6}\s*/g, "")
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .trim();

    document.getElementById("lore-title").textContent = cleanTitle;
    document.getElementById("lore-text").textContent = cleanText;

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
        showLore(data.title || "Whisper from the Dark", data.lore);
    } catch (err) {
        console.log("Lore generation failed:", err);
    }
}

// --- PRESTIGE RENDERER ---
let prestigeBuilt = false;

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
    const nextUnlock = upgradeDefs.find(d => d.requiredDescent === count + 1);

    if (!prestigeBuilt) {
        container.innerHTML = `
            <div id="prestige-info">
                Descent level: <span id="descent-level">${count}</span> &nbsp;|&nbsp;
                Knowledge multiplier: <span id="knowledge-multiplier">${bonus.toFixed(1)}x</span>
            </div>
            <div id="next-unlock-info"></div>
            <div id="action-buttons">
                <button id="save-btn">✦ Save Progress</button>
                <button id="kofi-btn">Support the Archive</button>
            </div>
            <div id="save-indicator"></div>
            <button id="prestige-btn" style="display:none;">Descend Deeper</button>
            <button id="reset-btn">Reset all progress</button>
        `;

        document.getElementById("save-btn").onclick = saveGame;
        document.getElementById("reset-btn").onclick = confirmReset;
        document.getElementById("prestige-btn").onclick = doPrestige;
        document.getElementById("kofi-btn").onclick = showSupportOverlay;
        prestigeBuilt = true;
    }

    document.getElementById("descent-level").textContent = count;
    document.getElementById("knowledge-multiplier").textContent = bonus.toFixed(1) + "x";

    const unlockInfo = document.getElementById("next-unlock-info");
    if (nextUnlock) {
        unlockInfo.textContent = `Next descent unlocks: ${nextUnlock.name}`;
        unlockInfo.style.display = "block";
    } else {
        unlockInfo.style.display = "none";
    }

    const prestigeBtn = document.getElementById("prestige-btn");
    prestigeBtn.textContent = `Descend Deeper (next bonus: ${nextBonus}%)`;
    prestigeBtn.style.display = canPrestige ? "inline-block" : "none";
}

// --- PRESTIGE ACTION ---
function doPrestige() {
    state.prestige.count++;
    state.prestige.bonus += 0.5;
    state.prestige.threshold = Math.floor(state.prestige.threshold * 2.5);

    state.knowledge = 0;
    state.knowledgePerClick = 1;
    state.knowledgePerSecond = 0;
    state.totalEarned = 0;

    Object.keys(state.upgrades).forEach(key => {
        state.upgrades[key] = 0;
    });

    milestonesReached.clear();
    upgradesBuilt = false;

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
        showLore(data.title || "Whisper from the Dark", data.lore);
    } catch (err) {
        console.log("Prestige lore generation failed:", err);
    }
}

// --- SUPPORT OVERLAY ---
// Shows an atmospheric message before sending the player to Ko-fi.
function showSupportOverlay() {
    let overlay = document.getElementById("support-overlay");
    if (overlay) {
        overlay.classList.add("visible");
        return;
    }

    overlay = document.createElement("div");
    overlay.id = "support-overlay";
    overlay.innerHTML = `
        <div id="support-overlay-box">
            <div id="support-overlay-title">The Archive Endures</div>
            <div id="support-overlay-text">
                Every fragment you have recovered, every scholar summoned, every descent into the dark —
                thank you for being here.<br><br>
                This game was made freely and will stay that way. No paywalls, no locked content, no pressure.
                If the archive has given you something — a moment of wonder, a chill, a reason to return —
                a small offering is always welcome, but never expected.<br><br>
                <em>The Archivist remembers those who gave. And those who simply stayed.</em>
            </div>
            <div id="support-overlay-buttons">
                <a id="support-proceed-btn" href="https://ko-fi.com/thearchivistgame" target="_blank">
                    Leave an Offering
                </a>
                <button id="support-dismiss-btn">Return to the Archive</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            overlay.classList.add("visible");
        });
    });

    document.getElementById("support-dismiss-btn").onclick = () => {
        overlay.classList.remove("visible");
    };
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
        state.prestige = saved.prestige || state.prestige;

        if (saved.upgrades) {
            Object.keys(state.upgrades).forEach(key => {
                state.upgrades[key] = saved.upgrades[key] || 0;
            });
        }

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
    indicator.style.color = "";
    indicator.onclick = null;
    setTimeout(() => indicator.classList.remove("visible"), 2000);
}

// --- RESET SAVE ---
function confirmReset() {
    const indicator = document.getElementById("save-indicator");
    if (!indicator) return;

    indicator.textContent = "Are you sure? Click again to erase everything.";
    indicator.classList.add("visible");
    indicator.style.color = "#e87a7a";

    indicator.onclick = () => {
        localStorage.removeItem("archivist_save");
        localStorage.removeItem("htp_dismissed");
        location.reload();
    };

    setTimeout(() => {
        indicator.classList.remove("visible");
        indicator.style.color = "";
        indicator.onclick = null;
    }, 5000);
}

// --- AUTOSAVE ---
setInterval(saveGame, 30000);

// --- HOW TO PLAY TOGGLE ---
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
