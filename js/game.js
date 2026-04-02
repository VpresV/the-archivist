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
        hollowArchivist: 0,
        namelessOne: 0
    },
    prestige: {
        count: 0,
        bonus: 1.0,
        threshold: 10000
    },
    hollowKingRewards: {
        codex: false,
        mark: false,
        gift: false
    },
    paleLibrarianRewards: {
        paleGift: false,
        stillArchive: false,
        whitePage: false
    },
    ritualAvailable: false,
    ritualAttempted: false,
    banishmentReached: false,
    paleLibrarianAvailable: false,
    paleLibrarianDefeated: false,
    endingSeen: false,
    ngPlus: false,
    baselineKps: 0,
    upgradeCostModifier: 1.0,
    loreLog: [],
    totalClicks: 0,
    totalDailyBonuses: 0,
    totalTimeOpen: 0,
    achievementsUnlocked: new Set(),
    stats: {
        totalFragmentsEver: 0,
        totalDescents: 0,
        hollowKingDefeats: 0,
        paleLibrarianDefeats: 0,
        sessionStart: Date.now()
    }
};

// --- ACHIEVEMENT DEFINITIONS ---
const achievementDefs = [
    // First Steps
    { id: "first_light", name: "First Light", hint: "Recover your first fragment.", condition: () => state.stats.totalFragmentsEver >= 1, flavour: "Something stirs in the dark." },
    { id: "ink_takes_hold", name: "The Ink Takes Hold", hint: "Buy your first upgrade.", condition: () => Object.values(state.upgrades).some(v => v > 0), flavour: "The archive accepts your offering." },
    { id: "deeper_still", name: "Deeper Still", hint: "Descend for the first time.", condition: () => state.stats.totalDescents >= 1, flavour: "You let go. The archive pulls you down." },
    { id: "quill_moves", name: "The Quill Moves", hint: "Click 100 times.", condition: () => state.totalClicks >= 100, flavour: "The hand learns before the mind does." },
    { id: "something_listens", name: "Something Listens", hint: "Receive your first lore fragment.", condition: () => state.loreLog.length >= 1, flavour: "The archive has noticed you." },
    // Knowledge
    { id: "thousand_voices", name: "A Thousand Voices", hint: "Recover 1,000 fragments (lifetime).", condition: () => state.stats.totalFragmentsEver >= 1000, flavour: "The whispers become a chorus." },
    { id: "ten_thousand", name: "Ten Thousand Echoes", hint: "Recover 10,000 fragments (lifetime).", condition: () => state.stats.totalFragmentsEver >= 10000, flavour: "The chorus becomes a roar." },
    { id: "hundred_thousand", name: "One Hundred Thousand", hint: "Recover 100,000 fragments (lifetime).", condition: () => state.stats.totalFragmentsEver >= 100000, flavour: "The archive breathes with you now." },
    { id: "one_million", name: "One Million", hint: "Recover 1,000,000 fragments (lifetime).", condition: () => state.stats.totalFragmentsEver >= 1000000, flavour: "The archive is nearly full." },
    { id: "ten_million", name: "Ten Million", hint: "Recover 10,000,000 fragments (lifetime).", condition: () => state.stats.totalFragmentsEver >= 10000000, flavour: "There is no difference between you and it." },
    { id: "hundred_million", name: "One Hundred Million", hint: "Recover 100,000,000 fragments (lifetime).", condition: () => state.stats.totalFragmentsEver >= 100000000, flavour: "The archive does not end. Neither do you." },
    { id: "one_billion", name: "One Billion", hint: "Recover 1,000,000,000 fragments (lifetime).", condition: () => state.stats.totalFragmentsEver >= 1000000000, flavour: "Something older than the archive has taken notice." },
    // Scholars
    { id: "ten_scribes", name: "The Quill Never Rests", hint: "Own 10 Quill Scribes.", condition: () => state.upgrades.quillScribe >= 10, flavour: "They write without hands now." },
    { id: "ten_dust", name: "Dust and Memory", hint: "Own 10 Dust Readers.", condition: () => state.upgrades.dustReader >= 10, flavour: "They read what was never written." },
    { id: "ten_scholars", name: "Between Worlds", hint: "Own 10 Shadow Scholars.", condition: () => state.upgrades.shadowScholar >= 10, flavour: "They stopped casting shadows weeks ago." },
    { id: "first_bone", name: "Brittle Script", hint: "Purchase a Bone Cartographer.", condition: () => state.upgrades.boneCartographer >= 1, flavour: "The maps lead somewhere they should not." },
    { id: "first_echo", name: "Bound Whispers", hint: "Purchase an Echo Binder.", condition: () => state.upgrades.echoBinder >= 1, flavour: "The silence has texture now." },
    { id: "first_veil", name: "The Veil Thins", hint: "Purchase a Veil Surgeon.", condition: () => state.upgrades.veilSurgeon >= 1, flavour: "Something on the other side is curious." },
    { id: "first_librarian", name: "The Library Sleeps", hint: "Purchase a Dreaming Librarian.", condition: () => state.upgrades.dreamingLibrarian >= 1, flavour: "Do not wake it." },
    { id: "first_hollow", name: "The Hollow Ones", hint: "Purchase a Hollow Archivist.", condition: () => state.upgrades.hollowArchivist >= 1, flavour: "It no longer answers to its name." },
    // Descent
    { id: "descent_3", name: "Into the Abyss", hint: "Complete 3 descents.", condition: () => state.stats.totalDescents >= 3, flavour: "The light above is very small now." },
    { id: "descent_5", name: "No Way Back", hint: "Complete 5 descents.", condition: () => state.stats.totalDescents >= 5, flavour: "You stopped looking up after the third descent." },
    { id: "descent_8", name: "What Remains", hint: "Complete 8 descents.", condition: () => state.stats.totalDescents >= 8, flavour: "There is very little of you left that is not the archive." },
    { id: "descent_10", name: "The Deep Places", hint: "Complete 10 descents.", condition: () => state.stats.totalDescents >= 10, flavour: "Things live here that have never seen light." },
    { id: "descent_12", name: "Beyond Counting", hint: "Complete 12 descents.", condition: () => state.stats.totalDescents >= 12, flavour: "The archive no longer bothers to number the pages." },
    { id: "descent_14", name: "The Final Descent", hint: "Complete 14 descents.", condition: () => state.stats.totalDescents >= 14, flavour: "One more. Just one more." },
    { id: "true_ending", name: "The Archivist", hint: "Complete the true ending.", condition: () => state.endingSeen, flavour: "You were always going to end up here." },
    { id: "ng_plus", name: "It Did Not Stay Closed", hint: "Begin a New Game+ run.", condition: () => state.ngPlus, flavour: "It did not stay closed." },
    // Hollow King
    { id: "ritual_available", name: "Something Stirs", hint: "The ritual becomes available.", condition: () => state.ritualAvailable || state.ritualAttempted, flavour: "He has been watching longer than you know." },
    { id: "ritual_performed", name: "The Sacrifice", hint: "Perform the ritual for the first time.", condition: () => state.ritualAttempted, flavour: "What you gave, you will not get back." },
    { id: "banishment_reached", name: "The King Rises", hint: "Reach the banishment phase.", condition: () => state.banishmentReached, flavour: "You can feel him before you see him." },
    { id: "king_defeated_1", name: "Hollow Victory", hint: "Defeat the Hollow King.", condition: () => state.stats.hollowKingDefeats >= 1, flavour: "He retreated. But he remembered your face." },
    { id: "king_defeated_2", name: "Twice Broken", hint: "Defeat the Hollow King twice.", condition: () => state.stats.hollowKingDefeats >= 2, flavour: "He expected you this time. It did not help him." },
    { id: "king_defeated_3", name: "The King Knows Your Name", hint: "Defeat the Hollow King three times.", condition: () => state.stats.hollowKingDefeats >= 3, flavour: "He stopped retreating all the way." },
    { id: "king_ngplus", name: "The King Is Afraid", hint: "Defeat the Hollow King in New Game+.", condition: () => state.ngPlus && state.stats.hollowKingDefeats >= 1, flavour: "For the first time, he hesitated." },
    // Rewards
    { id: "reward_mark", name: "Marked", hint: "Claim the Archivist's Mark.", condition: () => state.hollowKingRewards.mark, flavour: "The ink does not wash off." },
    { id: "reward_gift", name: "Gifted", hint: "Claim the Hollow Gift.", condition: () => state.hollowKingRewards.gift, flavour: "Something looks out through your eyes." },
    { id: "reward_codex", name: "The Forbidden Page", hint: "Claim the Forbidden Codex.", condition: () => state.hollowKingRewards.codex, flavour: "You were not meant to read this far." },
    { id: "all_rewards", name: "Complete", hint: "Claim all three Hollow King rewards.", condition: () => state.hollowKingRewards.mark && state.hollowKingRewards.gift && state.hollowKingRewards.codex, flavour: "The King gave everything he had. It was not enough." },
    // Passive income
    { id: "kps_1", name: "The Archive Breathes", hint: "Reach 1 fragment per second.", condition: () => state.knowledgePerSecond >= 1, flavour: "It runs without you now." },
    { id: "kps_10", name: "The Archive Hungers", hint: "Reach 10 fragments per second.", condition: () => state.knowledgePerSecond >= 10, flavour: "You can hear it consuming." },
    { id: "kps_100", name: "The Archive Devours", hint: "Reach 100 fragments per second.", condition: () => state.knowledgePerSecond >= 100, flavour: "It has stopped waiting for you to click." },
    { id: "kps_1000", name: "The Archive Is Alive", hint: "Reach 1,000 fragments per second.", condition: () => state.knowledgePerSecond >= 1000, flavour: "You are not sure it needs you anymore." },
    // Daily
    { id: "daily_1", name: "You Came Back", hint: "Claim your first daily bonus.", condition: () => state.totalDailyBonuses >= 1, flavour: "The archive remembered you." },
    { id: "daily_7", name: "A Habit Forms", hint: "Claim 7 daily bonuses.", condition: () => state.totalDailyBonuses >= 7, flavour: "You return without deciding to." },
    { id: "daily_30", name: "The Archive Waits", hint: "Claim 30 daily bonuses.", condition: () => state.totalDailyBonuses >= 30, flavour: "It has always been here. So have you." },
    // Clicking
    { id: "clicks_1000", name: "The Hand Learns", hint: "Click 1,000 times total.", condition: () => state.totalClicks >= 1000, flavour: "The motion becomes unconscious." },
    { id: "clicks_10000", name: "The Hand Forgets", hint: "Click 10,000 times total.", condition: () => state.totalClicks >= 10000, flavour: "You no longer remember starting." },
    // Time
    { id: "time_1h", name: "The Patient One", hint: "Have the game open for 1 hour total.", condition: () => state.totalTimeOpen >= 3600, flavour: "The archive rewards those who stay." },
    { id: "time_24h", name: "What Are You", hint: "Have the game open for 24 hours total.", condition: () => state.totalTimeOpen >= 86400, flavour: "The line between you and the archive is very thin now." },
    // Pale Librarian
    { id: "the_stillness", name: "The Stillness", hint: "Defeat the Pale Librarian.", condition: () => state.stats.paleLibrarianDefeats >= 1, flavour: "You held. The archive noticed." },
    { id: "what_it_showed_you", name: "What It Showed You", hint: "Claim a Pale Librarian reward.", condition: () => state.paleLibrarianRewards.paleGift || state.paleLibrarianRewards.stillArchive || state.paleLibrarianRewards.whitePage, flavour: "Some pages cannot be unread." },
];

// --- UPGRADE DEFINITIONS ---
const upgradeDefs = [
    { id: "quillScribe", name: "Quill Scribe", description: "A scribe who copies fragments endlessly.", baseCost: 10, kps: 0.1, requiredDescent: 0, paleLibrarianOnly: false },
    { id: "dustReader", name: "Dust Reader", description: "Reads meaning from ashes and forgotten dust.", baseCost: 75, kps: 0.5, requiredDescent: 0, paleLibrarianOnly: false },
    { id: "shadowScholar", name: "Shadow Scholar", description: "A scholar who works in the dark between worlds.", baseCost: 500, kps: 3, requiredDescent: 0, paleLibrarianOnly: false },
    { id: "boneCartographer", name: "Bone Cartographer", description: "Maps the archive's forbidden wings in brittle script.", baseCost: 3000, kps: 10, requiredDescent: 1, paleLibrarianOnly: false },
    { id: "echoBinder", name: "Echo Binder", description: "Binds whispers into solid text before they fade.", baseCost: 15000, kps: 40, requiredDescent: 2, paleLibrarianOnly: false },
    { id: "veilSurgeon", name: "Veil Surgeon", description: "Cuts through reality to retrieve pages lost between worlds.", baseCost: 100000, kps: 150, requiredDescent: 3, paleLibrarianOnly: false },
    { id: "dreamingLibrarian", name: "Dreaming Librarian", description: "Reads while the archive sleeps, stealing knowledge from its dreams.", baseCost: 750000, kps: 500, requiredDescent: 4, paleLibrarianOnly: false },
    { id: "hollowArchivist", name: "The Hollow Archivist", description: "Has become part of the archive itself. It no longer remembers its name.", baseCost: 5000000, kps: 1500, requiredDescent: 5, paleLibrarianOnly: false },
    { id: "namelessOne", name: "The Nameless One", description: "It arrived after the silence. It does not speak. It does not stop.", baseCost: 50000000, kps: 5000, requiredDescent: 0, paleLibrarianOnly: true }
];

// --- DOM REFERENCES ---
const knowledgeCountEl = document.getElementById("knowledge-count");
const fpsEl = document.getElementById("fps");
const clickBtn = document.getElementById("click-btn");

// --- NUMBER FORMATTER ---
function formatNumber(n) {
    if (n >= 1000000000) return (n / 1000000000).toFixed(1) + "B";
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return Math.floor(n).toString();
}

// --- TIMER FORMATTER ---
function formatTimer(seconds) {
    if (seconds >= 3600) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    }
    if (seconds >= 60) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    }
    return `${seconds}s`;
}

// --- PANEL SYSTEM ---
let leftPanelOpen = false;
let rightPanelOpen = false;

function openPanel(side) {
    const panel = document.getElementById(side + "-panel");
    const backdrop = document.getElementById("panel-backdrop");
    const isMobile = window.innerWidth <= 768;

    if (side === "left") {
        leftPanelOpen = true;
        panel.classList.add("open");
        document.getElementById("toggle-left-panel").classList.add("active");
        document.getElementById("mobile-left-tab").classList.add("active");
    } else {
        rightPanelOpen = true;
        panel.classList.add("open");
        document.getElementById("toggle-right-panel").classList.add("active");
        document.getElementById("mobile-right-tab").classList.add("active");
    }

    if (isMobile) backdrop.classList.add("visible");
}

function closePanel(side) {
    const panel = document.getElementById(side + "-panel");
    const backdrop = document.getElementById("panel-backdrop");

    if (side === "left") {
        leftPanelOpen = false;
        panel.classList.remove("open");
        document.getElementById("toggle-left-panel").classList.remove("active");
        document.getElementById("mobile-left-tab").classList.remove("active");
    } else {
        rightPanelOpen = false;
        panel.classList.remove("open");
        document.getElementById("toggle-right-panel").classList.remove("active");
        document.getElementById("mobile-right-tab").classList.remove("active");
    }

    if (!leftPanelOpen && !rightPanelOpen) backdrop.classList.remove("visible");
}

function togglePanel(side) {
    if (side === "left") {
        leftPanelOpen ? closePanel("left") : openPanel("left");
    } else {
        rightPanelOpen ? closePanel("right") : openPanel("right");
    }
}

document.getElementById("toggle-left-panel").onclick = () => togglePanel("left");
document.getElementById("toggle-right-panel").onclick = () => togglePanel("right");
document.getElementById("left-panel-close").onclick = () => closePanel("left");
document.getElementById("right-panel-close").onclick = () => closePanel("right");
document.getElementById("mobile-left-tab").onclick = () => togglePanel("left");
document.getElementById("mobile-right-tab").onclick = () => togglePanel("right");
document.getElementById("panel-backdrop").onclick = () => {
    closePanel("left");
    closePanel("right");
};

// --- ACHIEVEMENT SYSTEM ---
function checkAchievements() {
    achievementDefs.forEach(def => {
        if (!state.achievementsUnlocked.has(def.id) && def.condition()) {
            state.achievementsUnlocked.add(def.id);
            showAchievementNotification(def);
        }
    });
}

const achievementQueue = [];
let achievementShowing = false;

function showAchievementNotification(def) {
    achievementQueue.push(def);
    if (!achievementShowing) processAchievementQueue();
}

function processAchievementQueue() {
    if (achievementQueue.length === 0) {
        achievementShowing = false;
        return;
    }

    achievementShowing = true;
    const def = achievementQueue.shift();

    const el = document.createElement("div");
    el.className = "achievement-notification";
    el.innerHTML = `
        <div class="achievement-notification-label">Achievement Unlocked</div>
        <div class="achievement-notification-name">${def.name}</div>
        <div class="achievement-notification-flavour">${def.flavour}</div>
    `;

    document.body.appendChild(el);
    requestAnimationFrame(() => { requestAnimationFrame(() => { el.classList.add("visible"); }); });

    setTimeout(() => {
        el.classList.remove("visible");
        setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);
            processAchievementQueue();
        }, 600);
    }, 4000);
}

function renderAchievements() {
    const panel = document.getElementById("achievements-panel");
    if (!panel) return;

    const unlocked = achievementDefs.filter(d => state.achievementsUnlocked.has(d.id));
    const locked = achievementDefs.filter(d => !state.achievementsUnlocked.has(d.id));

    panel.innerHTML = `
        <div class="achievements-summary">${unlocked.length} / ${achievementDefs.length} unlocked</div>
        ${unlocked.map(d => `
            <div class="achievement-entry unlocked">
                <div class="achievement-entry-name">✦ ${d.name}</div>
                <div class="achievement-entry-hint">${d.hint}</div>
                <div class="achievement-entry-flavour">${d.flavour}</div>
            </div>
        `).join("")}
        ${locked.map(() => `
            <div class="achievement-entry locked">
                <div class="achievement-entry-name">— ???</div>
                <div class="achievement-entry-flavour">Not yet unlocked.</div>
            </div>
        `).join("")}
    `;
}

// --- CLICK HANDLER ---
clickBtn.addEventListener("click", (e) => {
    const gained = state.knowledgePerClick * state.prestige.bonus;
    state.knowledge += gained;
    state.totalEarned += gained;
    state.stats.totalFragmentsEver += gained;
    state.totalClicks++;
    updateDisplay();
    checkMilestones();
    checkAchievements();
    spawnFloatNumber(e, gained);
    spawnRipple(e);
});

// --- PASSIVE INCOME LOOP ---
setInterval(() => {
    const total = state.knowledgePerSecond + state.baselineKps;
    if (total > 0) {
        const gained = total * state.prestige.bonus;
        state.knowledge += gained;
        state.totalEarned += gained;
        state.stats.totalFragmentsEver += gained;
        updateDisplay();
        checkMilestones();
        checkAchievements();
    }
}, 1000);

// --- TIME TRACKING LOOP ---
setInterval(() => {
    state.totalTimeOpen += 10;
    checkAchievements();
}, 10000);

// --- DISPLAY UPDATE ---
function updateDisplay() {
    knowledgeCountEl.textContent = formatNumber(state.knowledge);
    const kps = (state.knowledgePerSecond + state.baselineKps) * (state.prestige.bonus || 1);
    fpsEl.textContent = isNaN(kps) ? "0.0" : kps.toFixed(1);
    renderUpgrades();
    renderPrestige();
    renderFloatingActions();
    renderStatusIndicator();
    updateTitleGlow();
}

// --- PRESTIGE TITLE GLOW ---
// The title changes visual intensity based on descent level — subtle at first,
// increasingly dramatic as the player descends deeper.
function updateTitleGlow() {
    const title = document.getElementById("game-title");
    if (!title) return;

    const count = state.prestige.count;

    // Remove all existing prestige classes.
    title.className = "";

    if (count === 0) {
        title.className = "title-descent-0";
    } else if (count < 3) {
        title.className = "title-descent-1";
    } else if (count < 6) {
        title.className = "title-descent-2";
    } else if (count < 9) {
        title.className = "title-descent-3";
    } else if (count < 12) {
        title.className = "title-descent-4";
    } else {
        title.className = "title-descent-5";
    }

    if (state.ngPlus) title.classList.add("title-ngplus");
}

// --- UPGRADE COST CALCULATOR ---
function getUpgradeCost(def) {
    const owned = state.upgrades[def.id] || 0;
    let base = state.ngPlus ? Math.floor(def.baseCost * 1.5) : def.baseCost;
    base = Math.floor(base * state.upgradeCostModifier);
    return Math.floor(base * Math.pow(1.15, owned));
}

// --- UPGRADE AVAILABILITY CHECK ---
function isUpgradeUnlocked(def) {
    if (def.paleLibrarianOnly) return state.paleLibrarianRewards.whitePage;
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
        checkAchievements();
    }
}

// --- KPS RECALCULATOR ---
function recalculateKps() {
    let total = 0;
    upgradeDefs.forEach(def => {
        if (isUpgradeUnlocked(def)) total += def.kps * (state.upgrades[def.id] || 0);
    });
    state.knowledgePerSecond = total;
}

// --- UPGRADE RENDERER ---
let upgradesBuilt = false;

function renderUpgrades() {
    const container = document.getElementById("upgrade-container");
    if (!container) return;

    const unlockedDefs = upgradeDefs.filter(isUpgradeUnlocked);
    const unlockedCount = unlockedDefs.length;
    const currentCount = container.querySelectorAll(".upgrade-btn").length;

    if (!upgradesBuilt || unlockedCount !== currentCount) {
        container.innerHTML = "";
        unlockedDefs.forEach(def => {
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
        btn.className = "upgrade-btn" + (canAfford ? " affordable" : "") + (def.paleLibrarianOnly ? " nameless" : "");
        btn.innerHTML = `
            <strong>${def.name}</strong> (${owned})<br/>
            <small>${def.description}</small><br/>
            ${formatNumber(cost)} knowledge
        `;
    });
}

// --- MILESTONE CHECKER ---
const milestonesReached = new Set();
const milestones = [10, 50, 100, 500, 1000, 5000, 10000, 50000, 100000, 500000, 1000000, 10000000, 100000000, 1000000000];

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
    const panel = document.getElementById("lore-panel");
    if (!panel) return;

    const cleanText = text.replace(/#{1,6}\s*/g, "").replace(/\*\*/g, "").replace(/\*/g, "").replace(/\n+/g, " ").trim();
    const cleanTitle = title.replace(/#{1,6}\s*/g, "").replace(/\*\*/g, "").replace(/\*/g, "").trim();

    state.loreLog.unshift({ title: cleanTitle, text: cleanText });
    if (state.loreLog.length > 20) state.loreLog.pop();

    document.getElementById("lore-title").textContent = cleanTitle;
    document.getElementById("lore-text").textContent = cleanText;

    requestAnimationFrame(() => { requestAnimationFrame(() => { panel.classList.add("visible"); }); });

    clearTimeout(panel._fadeTimeout);
    panel._fadeTimeout = setTimeout(() => panel.classList.remove("visible"), 12000);

    checkAchievements();
}

// --- LORE EVENT TRIGGER ---
async function triggerLoreEvent(milestone) {
    try {
        const response = await fetch("https://archivist-proxy.ap24004.workers.dev/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ milestone, upgrades: state.upgrades, ngPlus: state.ngPlus })
        });
        const data = await response.json();
        showLore(data.title || "Whisper from the Dark", data.lore);
    } catch (err) {
        console.log("Lore generation failed:", err);
    }
}

// --- FLOATING ACTIONS RENDERER ---
function renderFloatingActions() {
    const container = document.getElementById("floating-actions");
    if (!container) return;

    container.innerHTML = "";

    const { count, bonus, threshold } = state.prestige;
    const canPrestige = state.knowledge >= threshold;
    const nextBonus = ((bonus + 0.5) * 100).toFixed(0);

    if (state.ritualAvailable) {
        const hint = document.createElement("div");
        hint.id = "floating-ritual-hint";
        hint.textContent = "✦ Something stirs in the depths ✦";
        container.appendChild(hint);
    }

    if (state.paleLibrarianAvailable) {
        const hint = document.createElement("div");
        hint.id = "floating-pale-hint";
        hint.textContent = "✦ A pale light moves between the shelves ✦";
        container.appendChild(hint);
    }

    if (canPrestige) {
        const btn = document.createElement("button");
        btn.id = "floating-prestige-btn";
        btn.textContent = `Descend Deeper — next bonus: ${nextBonus}%`;
        btn.onclick = confirmPrestige;
        container.appendChild(btn);
    }

    if (state.ritualAvailable) {
        const btn = document.createElement("button");
        btn.id = "floating-ritual-btn";
        btn.textContent = "Perform the Ritual";
        btn.onclick = showRitualOverlay;
        container.appendChild(btn);
    }

    if (state.paleLibrarianAvailable) {
        const btn = document.createElement("button");
        btn.id = "floating-pale-btn";
        btn.textContent = "The Pale Librarian Waits";
        btn.onclick = showPaleLibrarianWarning;
        container.appendChild(btn);
    }
}

// --- PRESTIGE CONFIRMATION ---
function confirmPrestige() {
    const btn = document.getElementById("floating-prestige-btn");
    if (!btn) return;

    if (btn.dataset.confirming === "true") {
        doPrestige();
        return;
    }

    btn.dataset.confirming = "true";
    btn.textContent = "Are you sure? Click again to descend.";
    btn.classList.add("confirming");

    setTimeout(() => {
        if (btn && btn.dataset.confirming === "true") {
            btn.dataset.confirming = "false";
            btn.classList.remove("confirming");
            const nextBonus = ((state.prestige.bonus + 0.5) * 100).toFixed(0);
            btn.textContent = `Descend Deeper — next bonus: ${nextBonus}%`;
        }
    }, 4000);
}

// --- PRESTIGE RENDERER ---
let prestigeBuilt = false;

function renderPrestige() {
    const { count, bonus, threshold } = state.prestige;
    const nextUnlock = upgradeDefs.find(d => !d.paleLibrarianOnly && d.requiredDescent === count + 1);

    const descentEl = document.getElementById("descent-level");
    const multiplierEl = document.getElementById("knowledge-multiplier");
    if (descentEl) descentEl.textContent = count;
    if (multiplierEl) multiplierEl.textContent = bonus.toFixed(1) + "x";

    const unlockInfo = document.getElementById("next-unlock-info");
    if (unlockInfo) {
        if (nextUnlock) {
            unlockInfo.textContent = `Next descent unlocks: ${nextUnlock.name}`;
            unlockInfo.style.display = "block";
        } else {
            unlockInfo.style.display = "none";
        }
    }

    if (!prestigeBuilt) {
        const saveBtn = document.getElementById("save-btn");
        const resetBtn = document.getElementById("reset-btn");
        const kofiBtn = document.getElementById("kofi-btn");
        const feedbackBtn = document.getElementById("feedback-btn");
        const shareBtn = document.getElementById("share-btn");
        const prestigeBtn = document.getElementById("prestige-btn");
        const ritualBtn = document.getElementById("ritual-btn");
        const paleBtn = document.getElementById("pale-librarian-btn");

        if (saveBtn) saveBtn.onclick = saveGame;
        if (resetBtn) resetBtn.onclick = confirmReset;
        if (kofiBtn) kofiBtn.onclick = showSupportOverlay;
        if (feedbackBtn) feedbackBtn.onclick = showFeedbackOverlay;
        if (shareBtn) shareBtn.onclick = showShareOverlay;
        if (prestigeBtn) prestigeBtn.onclick = confirmPrestige;
        if (ritualBtn) ritualBtn.onclick = showRitualOverlay;
        if (paleBtn) paleBtn.onclick = showPaleLibrarianWarning;

        prestigeBuilt = true;
    }

    const canPrestige = state.knowledge >= threshold;
    const nextBonus = ((bonus + 0.5) * 100).toFixed(0);

    const prestigeBtn = document.getElementById("prestige-btn");
    if (prestigeBtn) {
        prestigeBtn.textContent = `Descend Deeper (${nextBonus}%)`;
        prestigeBtn.style.display = canPrestige ? "block" : "none";
    }

    const ritualBtn = document.getElementById("ritual-btn");
    if (ritualBtn) ritualBtn.style.display = state.ritualAvailable ? "block" : "none";

    const paleBtn = document.getElementById("pale-librarian-btn");
    if (paleBtn) paleBtn.style.display = state.paleLibrarianAvailable ? "block" : "none";

    const ritualHintContainer = document.getElementById("ritual-hint-container");
    if (ritualHintContainer) {
        let hintHTML = "";
        if (state.ritualAvailable) hintHTML += `<div id="ritual-hint">✦ Something stirs ✦</div>`;
        if (state.paleLibrarianAvailable) hintHTML += `<div id="pale-librarian-hint">✦ A pale light ✦</div>`;
        ritualHintContainer.innerHTML = hintHTML;
    }
}

// --- PRESTIGE ACTION ---
function doPrestige() {
    state.prestige.count++;
    state.stats.totalDescents++;
    state.prestige.bonus += 0.5;
    state.prestige.threshold = Math.floor(state.prestige.threshold * 2.5);

    state.knowledge = 0;
    state.knowledgePerClick = state.hollowKingRewards.mark ? (state.ngPlus ? 3 : 2) : 1;
    state.knowledgePerSecond = 0;
    state.totalEarned = 0;

    if (state.loreLog.length > 0) {
        setTimeout(() => {
            showLore("The Archive Clears Its Memory", "What was written here is gone now. The archive does not mourn. It only waits for what comes next.");
        }, 800);
    }

    state.loreLog = [];

    Object.keys(state.upgrades).forEach(key => {
        if (key !== "namelessOne" || !state.paleLibrarianRewards.whitePage) {
            state.upgrades[key] = 0;
        }
    });

    milestonesReached.clear();
    upgradesBuilt = false;
    state.ritualAvailable = false;
    state.paleLibrarianAvailable = false;

    const ritualUnlockThreshold = state.ngPlus ? 8 : 5;
    if (state.prestige.count > ritualUnlockThreshold) {
        const allHollowRewardsClaimed = state.hollowKingRewards.codex && state.hollowKingRewards.mark && state.hollowKingRewards.gift;
        if (!allHollowRewardsClaimed && Math.random() < 0.3) state.ritualAvailable = true;
    }

    if (state.ngPlus && state.prestige.count > 5 && !state.paleLibrarianDefeated) {
        if (Math.random() < 0.3) state.paleLibrarianAvailable = true;
    }

    checkAchievements();

    if (state.prestige.count >= 15 && !state.endingSeen) {
        saveGame();
        updateDisplay();
        setTimeout(() => showTrueEnding(), 2000);
        return;
    }

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
                context: `The player has just descended to archive level ${descentLevel}. This is a prestige event. Write a darker, more unsettling fragment than before. The archive is pulling them deeper.${state.ngPlus ? " This is a New Game+ run — the archive is more malevolent and ancient than before." : ""}`
            })
        });
        const data = await response.json();
        showLore(data.title || "Whisper from the Dark", data.lore);
    } catch (err) {
        console.log("Prestige lore generation failed:", err);
    }
}

// --- OFFLINE PROGRESS ---
// Calculates fragments earned while the player was away and shows an atmospheric message.
function checkOfflineProgress() {
    const lastSaved = localStorage.getItem("archivist_last_saved");
    if (!lastSaved) return;

    const secondsAway = Math.floor((Date.now() - parseInt(lastSaved)) / 1000);

    // Only show if away for more than 2 minutes and has passive income.
    const kps = state.knowledgePerSecond + state.baselineKps;
    if (secondsAway < 120 || kps <= 0) return;

    // Cap offline progress at 8 hours to prevent absurd numbers.
    const cappedSeconds = Math.min(secondsAway, 28800);
    const earned = Math.floor(kps * state.prestige.bonus * cappedSeconds);

    if (earned <= 0) return;

    state.knowledge += earned;
    state.totalEarned += earned;
    state.stats.totalFragmentsEver += earned;

    const timeAway = formatTimer(secondsAway);

    setTimeout(() => {
        showLore(
            "The Archive Did Not Sleep",
            `You were gone for ${timeAway}. The scholars continued without you — recovering ${formatNumber(earned)} fragments from the depths while you were away. The archive does not wait. It only accumulates.`
        );
    }, 1200);
}

// --- SHARE OVERLAY ---
function showShareOverlay() {
    removeOverlay("share-overlay");

    const count = state.prestige.count;
    const ng = state.ngPlus ? " (New Game+)" : "";
    const fragments = formatNumber(state.stats.totalFragmentsEver);

    const tweetText = count === 0
        ? `I am descending into The Archivist — a dark idle game where the archive watches back. Play free: https://vpresv.github.io/the-archivist`
        : `I have descended ${count} time${count !== 1 ? "s" : ""}${ng} into The Archivist, recovering ${fragments} fragments from the dark. How deep will you go? https://vpresv.github.io/the-archivist #TheArchivist`;

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

    const overlay = document.createElement("div");
    overlay.id = "share-overlay";
    overlay.className = "overlay-screen";
    overlay.innerHTML = `
        <div class="overlay-box">
            <div class="overlay-title">Leave a Mark on the World</div>
            <div class="overlay-text">
                ${count === 0
                    ? "The archive is new to you. Tell others it exists.<br><br>"
                    : `You have descended <em>${count} time${count !== 1 ? "s" : ""}</em> and recovered <em>${fragments} fragments</em>. That is worth saying out loud.<br><br>`
                }
                <em>Let the world know what waits in the dark.</em>
            </div>
            <div class="share-text-preview">${tweetText}</div>
            <div class="overlay-buttons">
                <a href="${twitterUrl}" target="_blank" id="share-twitter-btn">Share on X / Twitter</a>
                <button id="share-copy-btn">Copy to Clipboard</button>
                <button id="share-cancel-btn">Return to the Archive</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    fadeIn(overlay);

    document.getElementById("share-copy-btn").onclick = () => {
        navigator.clipboard.writeText(tweetText).then(() => {
            const btn = document.getElementById("share-copy-btn");
            if (btn) {
                btn.textContent = "Copied.";
                setTimeout(() => { if (btn) btn.textContent = "Copy to Clipboard"; }, 2000);
            }
        });
    };

    document.getElementById("share-cancel-btn").onclick = () => removeOverlay("share-overlay");
}

// --- FEEDBACK OVERLAY ---
function showFeedbackOverlay() {
    removeOverlay("feedback-overlay");

    const overlay = document.createElement("div");
    overlay.id = "feedback-overlay";
    overlay.className = "overlay-screen";
    overlay.innerHTML = `
        <div class="overlay-box">
            <div class="overlay-title">Speak to the Archive</div>
            <div class="overlay-text">
                The archive listens. Leave a mark — a word of trouble,
                a whisper of suggestion, or simply something you needed to say.<br><br>
                <em>Every message reaches the Archivist.</em>
            </div>
            <form id="feedback-form" action="https://formspree.io/f/xeeplkvk" method="POST">
                <div class="feedback-field">
                    <select name="type" class="feedback-input" required>
                        <option value="" disabled selected>What brings you here?</option>
                        <option value="Bug Report">Something is broken</option>
                        <option value="Feature Suggestion">I have a suggestion</option>
                        <option value="General Feedback">I just want to say something</option>
                    </select>
                </div>
                <div class="feedback-field">
                    <textarea name="message" class="feedback-input feedback-textarea"
                        placeholder="Write here..." required maxlength="1000"></textarea>
                </div>
                <div class="feedback-field">
                    <input type="email" name="email" class="feedback-input"
                        placeholder="Your email (optional — if you want a reply)" />
                </div>
                <input type="hidden" name="descent_level" value="${state.prestige.count}" />
                <input type="hidden" name="ng_plus" value="${state.ngPlus}" />
                <div class="overlay-buttons">
                    <button type="submit" id="feedback-submit-btn">Leave a Mark</button>
                    <button type="button" id="feedback-cancel-btn">Return to the Archive</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(overlay);
    fadeIn(overlay);

    document.getElementById("feedback-cancel-btn").onclick = () => removeOverlay("feedback-overlay");

    document.getElementById("feedback-form").onsubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const submitBtn = document.getElementById("feedback-submit-btn");
        submitBtn.textContent = "Sending...";
        submitBtn.disabled = true;

        try {
            const response = await fetch(form.action, {
                method: "POST",
                body: new FormData(form),
                headers: { "Accept": "application/json" }
            });

            if (response.ok) {
                removeOverlay("feedback-overlay");
                setTimeout(() => {
                    showLore("The Archive Receives", "Your mark has been left. The Archivist will read it in the quiet hours between descents. Thank you for speaking.");
                }, 400);
            } else {
                submitBtn.textContent = "Something went wrong. Try again.";
                submitBtn.disabled = false;
            }
        } catch (err) {
            submitBtn.textContent = "Could not reach the archive. Try again.";
            submitBtn.disabled = false;
        }
    };
}

// --- PALE LIBRARIAN — PHASE 1: WARNING ---
function showPaleLibrarianWarning() {
    removeOverlay("pale-librarian-warning");

    const overlay = document.createElement("div");
    overlay.id = "pale-librarian-warning";
    overlay.className = "overlay-screen";
    overlay.innerHTML = `
        <div class="overlay-box pale-box">
            <div class="overlay-title pale-title">The Pale Librarian</div>
            <div class="overlay-text">
                Something has been here longer than the archive itself.<br><br>
                It does not move the way things should move. It stands between the shelves
                and watches — not with hunger, like the King, but with a patience that has
                no beginning and no end.<br><br>
                It will not fight you. It will not speak. It will simply be present, and
                you must be present with it — still, silent, reaching for nothing — for
                twenty seconds.<br><br>
                <em>Do not click. Do not reach. Do not move.</em><br><br>
                If you falter, it will take something from you and leave. You will not
                see it again until the next descent.<br><br>
                When you are ready, close your eyes. Then open them. Then begin.
            </div>
            <div class="overlay-buttons">
                <button id="pale-librarian-ready-btn">I am ready</button>
                <button id="pale-librarian-cancel-btn">Step Back</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    fadeIn(overlay);

    document.getElementById("pale-librarian-ready-btn").onclick = () => {
        removeOverlay("pale-librarian-warning");
        setTimeout(() => showPaleLibrarianSilence(), 500);
    };

    document.getElementById("pale-librarian-cancel-btn").onclick = () => removeOverlay("pale-librarian-warning");
}

// --- PALE LIBRARIAN — PHASE 2: SILENCE ---
function showPaleLibrarianSilence() {
    removeOverlay("pale-librarian-silence");

    let timeLeft = 20;
    let concluded = false;
    let timerInterval = null;

    const overlay = document.createElement("div");
    overlay.id = "pale-librarian-silence";
    overlay.className = "overlay-screen pale-silence-screen";
    overlay.innerHTML = `
        <div class="overlay-box pale-box">
            <div class="overlay-title pale-title">Be Still</div>
            <div class="overlay-text">
                It is watching.<br><br>
                <em id="pale-timer">20</em>
            </div>
            <div id="pale-silence-bar-container">
                <div id="pale-silence-bar"></div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    fadeIn(overlay);

    function onAnyClick() {
        if (concluded) return;
        concluded = true;
        clearInterval(timerInterval);
        document.removeEventListener("click", onAnyClick);
        removeOverlay("pale-librarian-silence");
        setTimeout(() => showPaleLibrarianFailed(), 500);
    }

    setTimeout(() => {
        if (!concluded) document.addEventListener("click", onAnyClick);
    }, 600);

    timerInterval = setInterval(() => {
        timeLeft--;
        const timerEl = document.getElementById("pale-timer");
        const bar = document.getElementById("pale-silence-bar");
        if (timerEl) timerEl.textContent = timeLeft;
        if (bar) bar.style.width = ((20 - timeLeft) / 20 * 100) + "%";

        if (timeLeft <= 0 && !concluded) {
            concluded = true;
            clearInterval(timerInterval);
            document.removeEventListener("click", onAnyClick);
            removeOverlay("pale-librarian-silence");
            setTimeout(() => showPaleLibrarianVictory(), 500);
        }
    }, 1000);
}

// --- PALE LIBRARIAN FAILED ---
function showPaleLibrarianFailed() {
    const penalty = Math.floor(state.knowledge * 0.4);
    state.knowledge = Math.max(0, state.knowledge - penalty);
    state.paleLibrarianAvailable = false;
    updateDisplay();

    const overlay = document.createElement("div");
    overlay.id = "pale-fail-overlay";
    overlay.className = "overlay-screen";
    overlay.innerHTML = `
        <div class="overlay-box pale-box">
            <div class="overlay-title pale-title">You Reached</div>
            <div class="overlay-text">
                It saw you move.<br><br>
                The Pale Librarian did not react — it simply turned away, taking something
                with it. Something small. Something you will not notice is gone until much
                later.<br><br>
                <em>You lost ${formatNumber(penalty)} knowledge.</em><br><br>
                It may return after your next descent.
            </div>
            <div class="overlay-buttons">
                <button id="pale-fail-close-btn">Return to the Archive</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    fadeIn(overlay);
    document.getElementById("pale-fail-close-btn").onclick = () => {
        removeOverlay("pale-fail-overlay");
        saveGame();
    };
}

// --- PALE LIBRARIAN VICTORY ---
function showPaleLibrarianVictory() {
    state.stats.paleLibrarianDefeats++;
    state.paleLibrarianDefeated = true;
    state.paleLibrarianAvailable = false;
    checkAchievements();

    const rewardButtons = [];
    if (!state.paleLibrarianRewards.paleGift) {
        rewardButtons.push(`
            <button class="reward-btn pale-reward-btn" id="pale-reward-gift">
                <strong>The Pale Gift</strong><br/>
                <small>Your knowledge multiplier doubles permanently. The archive gives freely to those who can wait.</small>
            </button>
        `);
    }
    if (!state.paleLibrarianRewards.stillArchive) {
        rewardButtons.push(`
            <button class="reward-btn pale-reward-btn" id="pale-reward-archive">
                <strong>The Still Archive</strong><br/>
                <small>All upgrade costs are permanently reduced by 20%. The archive opens itself to the patient.</small>
            </button>
        `);
    }
    if (!state.paleLibrarianRewards.whitePage) {
        rewardButtons.push(`
            <button class="reward-btn pale-reward-btn" id="pale-reward-page">
                <strong>The White Page</strong><br/>
                <small>A new scholar awakens — The Nameless One. It arrived after the silence. It does not stop.</small>
            </button>
        `);
    }

    const allClaimed = state.paleLibrarianRewards.paleGift && state.paleLibrarianRewards.stillArchive && state.paleLibrarianRewards.whitePage;

    const overlay = document.createElement("div");
    overlay.id = "pale-victory-overlay";
    overlay.className = "overlay-screen";
    overlay.innerHTML = `
        <div class="overlay-box pale-box">
            <div class="overlay-title pale-title">The Pale Librarian Withdraws</div>
            <div class="overlay-text">
                Twenty seconds. You held.<br><br>
                The Pale Librarian regarded you for a long moment — not with approval,
                not with warmth, but with something that might have been recognition.
                Then it turned and walked between the shelves and was gone, leaving
                behind a single page where it had stood.<br><br>
                The page is blank. But when you hold it, you understand something
                you could not have put into words before.<br><br>
                <em>Take what it left.</em>
            </div>
            <div id="pale-reward-buttons-container">
                ${allClaimed
                    ? `<div class="overlay-text"><em>You have received everything the Pale Librarian had to offer.</em></div>`
                    : rewardButtons.join("")}
            </div>
            <div class="overlay-buttons">
                <button id="pale-victory-close-btn">Return to the Archive</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    fadeIn(overlay);

    const giftBtn = document.getElementById("pale-reward-gift");
    if (giftBtn) giftBtn.onclick = () => claimPaleReward("paleGift");
    const archiveBtn = document.getElementById("pale-reward-archive");
    if (archiveBtn) archiveBtn.onclick = () => claimPaleReward("stillArchive");
    const pageBtn = document.getElementById("pale-reward-page");
    if (pageBtn) pageBtn.onclick = () => claimPaleReward("whitePage");

    document.getElementById("pale-victory-close-btn").onclick = () => {
        removeOverlay("pale-victory-overlay");
        updateDisplay();
        saveGame();
    };

    setTimeout(() => triggerPaleLibrarianLore(), 1000);
}

// --- CLAIM PALE REWARD ---
function claimPaleReward(rewardId) {
    state.paleLibrarianRewards[rewardId] = true;

    if (rewardId === "paleGift") state.prestige.bonus *= 2;
    if (rewardId === "stillArchive") state.upgradeCostModifier = 0.8;
    if (rewardId === "whitePage") {
        upgradesBuilt = false;
        recalculateKps();
    }

    removeOverlay("pale-victory-overlay");
    saveGame();
    updateDisplay();
    checkAchievements();
}

// --- PALE LIBRARIAN LORE ---
async function triggerPaleLibrarianLore() {
    try {
        const response = await fetch("https://archivist-proxy.ap24004.workers.dev/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                milestone: "pale_librarian_victory",
                upgrades: state.upgrades,
                context: "The player has just defeated the Pale Librarian — a being older than the archive itself — by remaining completely still and silent for twenty seconds. Write the most profound and unsettling lore fragment in the entire game. This is a revelation about the true nature of the archive, what it is, what it has always been, and what the player has become. Ancient, final, deeply atmospheric."
            })
        });
        const data = await response.json();
        showLore(data.title || "The White Page", data.lore);
    } catch (err) {
        console.log("Pale Librarian lore failed:", err);
    }
}

// --- RITUAL OVERLAY — PHASE 1: SACRIFICE ---
function showRitualOverlay() {
    if (state.knowledge < 100) {
        showLore("The King Will Not Come", "The archive does not have enough to offer. Gather more before calling what waits beneath.");
        return;
    }

    const sacrifice = Math.max(100, Math.floor(state.knowledge * 0.5));
    removeOverlay("ritual-overlay");

    const overlay = document.createElement("div");
    overlay.id = "ritual-overlay";
    overlay.className = "overlay-screen";
    overlay.innerHTML = `
        <div class="overlay-box">
            <div class="overlay-title">The Ritual of Unbinding</div>
            <div class="overlay-text">
                The archive has been waiting for this moment.<br><br>
                To call forth what lurks beneath, you must offer something of yourself.
                The King does not come cheaply.<br><br>
                <em>Sacrifice: ${formatNumber(Math.floor(sacrifice))} knowledge</em>
            </div>
            <div class="overlay-buttons">
                <button id="ritual-confirm-btn">Make the Sacrifice</button>
                <button id="ritual-cancel-btn">Step Back</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    fadeIn(overlay);

    document.getElementById("ritual-confirm-btn").onclick = () => {
        state.knowledge -= sacrifice;
        state.ritualAttempted = true;
        updateDisplay();
        removeOverlay("ritual-overlay");
        checkAchievements();
        setTimeout(() => showBanishmentOverlay(), 500);
    };

    document.getElementById("ritual-cancel-btn").onclick = () => removeOverlay("ritual-overlay");
}

// --- RITUAL OVERLAY — PHASE 2: BANISHMENT ---
function showBanishmentOverlay() {
    removeOverlay("banishment-overlay");

    state.banishmentReached = true;
    checkAchievements();

    const baseClicks = 50 + (state.prestige.count * 10);
    const requiredClicks = state.ngPlus ? Math.floor(baseClicks * 1.5) : baseClicks;
    let currentClicks = 0;
    let timeLeft = 30;
    let timerInterval = null;
    let concluded = false;

    const overlay = document.createElement("div");
    overlay.id = "banishment-overlay";
    overlay.className = "overlay-screen";
    overlay.innerHTML = `
        <div class="overlay-box">
            <div class="overlay-title">The Hollow King Rises</div>
            <div class="overlay-text">
                He is here. Drive him back before the darkness takes hold.<br><br>
                <em id="banishment-timer">Time remaining: 30s</em>
            </div>
            <div id="banishment-progress-bar-container">
                <div id="banishment-progress-bar"></div>
            </div>
            <div id="banishment-clicks-text">0 / ${requiredClicks}</div>
            <button id="banishment-click-btn">Strike the King</button>
        </div>
    `;

    document.body.appendChild(overlay);
    fadeIn(overlay);

    timerInterval = setInterval(() => {
        timeLeft--;
        const timerEl = document.getElementById("banishment-timer");
        if (timerEl) timerEl.textContent = `Time remaining: ${timeLeft}s`;
        if (timeLeft <= 0 && !concluded) {
            concluded = true;
            clearInterval(timerInterval);
            removeOverlay("banishment-overlay");
            setTimeout(() => showBanishmentFailed(), 500);
        }
    }, 1000);

    document.getElementById("banishment-click-btn").onclick = () => {
        if (concluded) return;
        currentClicks++;
        const progress = Math.min((currentClicks / requiredClicks) * 100, 100);
        const bar = document.getElementById("banishment-progress-bar");
        const clicksText = document.getElementById("banishment-clicks-text");
        if (bar) bar.style.width = progress + "%";
        if (clicksText) clicksText.textContent = `${currentClicks} / ${requiredClicks}`;
        if (currentClicks >= requiredClicks) {
            concluded = true;
            clearInterval(timerInterval);
            removeOverlay("banishment-overlay");
            setTimeout(() => showVictoryOverlay(), 500);
        }
    };
}

// --- BANISHMENT FAILED ---
function showBanishmentFailed() {
    const penalty = Math.floor(state.knowledge * 0.3);
    state.knowledge = Math.max(0, state.knowledge - penalty);
    updateDisplay();

    const failOverlay = document.createElement("div");
    failOverlay.id = "fail-overlay";
    failOverlay.className = "overlay-screen";
    failOverlay.innerHTML = `
        <div class="overlay-box">
            <div class="overlay-title">The King Endures</div>
            <div class="overlay-text">
                The darkness was too great. The Hollow King retreated — but not before taking
                something with him.<br><br>
                <em>You lost ${formatNumber(penalty)} knowledge.</em><br><br>
                The ritual may be attempted again.
            </div>
            <div class="overlay-buttons">
                <button id="fail-close-btn">Return to the Archive</button>
            </div>
        </div>
    `;

    document.body.appendChild(failOverlay);
    fadeIn(failOverlay);
    document.getElementById("fail-close-btn").onclick = () => removeOverlay("fail-overlay");
}

// --- HOLLOW KING VICTORY ---
function showVictoryOverlay() {
    const allRewardsClaimed = state.hollowKingRewards.codex && state.hollowKingRewards.mark && state.hollowKingRewards.gift;

    const rewardButtons = [];
    if (!state.hollowKingRewards.codex) {
        rewardButtons.push(`
            <button class="reward-btn" id="reward-codex">
                <strong>The Forbidden Codex</strong><br/>
                <small>${state.ngPlus ? "A final page surfaces. Some truths cannot be unlearned." : "A final page surfaces from the deepest vault. Some truths cannot be unlearned."}</small>
            </button>
        `);
    }
    if (!state.hollowKingRewards.mark) {
        rewardButtons.push(`
            <button class="reward-btn" id="reward-mark">
                <strong>The Archivist's Mark</strong><br/>
                <small>${state.ngPlus ? "Your name is written deeper this time." : "Your name is written in the archive's oldest ink. It will not fade."}</small>
            </button>
        `);
    }
    if (!state.hollowKingRewards.gift) {
        rewardButtons.push(`
            <button class="reward-btn" id="reward-gift">
                <strong>The Hollow Gift</strong><br/>
                <small>${state.ngPlus ? "The King left more of himself this time." : "Something of the King remains in you. The fragments come faster now."}</small>
            </button>
        `);
    }

    const overlay = document.createElement("div");
    overlay.id = "victory-overlay";
    overlay.className = "overlay-screen";
    overlay.innerHTML = `
        <div class="overlay-box">
            <div class="overlay-title">The Hollow King Retreats</div>
            <div class="overlay-text">
                The darkness folded inward. The King has been driven back into the deep.<br><br>
                He did not scream. He did not rage. He simply... withdrew.<br><br>
                As he retreated, he left something behind.<br><br>
                <em>Choose what he left for you.</em>
            </div>
            <div id="reward-buttons-container">
                ${allRewardsClaimed
                    ? `<div class="overlay-text"><em>You have claimed everything the King had to offer.</em></div>`
                    : rewardButtons.join("")}
            </div>
            <div class="overlay-buttons">
                <button id="victory-close-btn">Return to the Archive</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    fadeIn(overlay);

    const codexBtn = document.getElementById("reward-codex");
    if (codexBtn) codexBtn.onclick = () => claimReward("codex");
    const markBtn = document.getElementById("reward-mark");
    if (markBtn) markBtn.onclick = () => claimReward("mark");
    const giftBtn = document.getElementById("reward-gift");
    if (giftBtn) giftBtn.onclick = () => claimReward("gift");

    document.getElementById("victory-close-btn").onclick = () => {
        state.ritualAvailable = false;
        removeOverlay("victory-overlay");
        updateDisplay();
        saveGame();
    };
}

// --- CLAIM HOLLOW KING REWARD ---
function claimReward(rewardId) {
    if (!state.hollowKingRewards[rewardId]) state.stats.hollowKingDefeats++;
    state.hollowKingRewards[rewardId] = true;
    state.ritualAvailable = false;

    if (rewardId === "gift") state.prestige.bonus *= state.ngPlus ? 5 : 3;
    if (rewardId === "mark") state.knowledgePerClick += state.ngPlus ? 2 : 1;
    if (rewardId === "codex" && state.ngPlus) state.baselineKps += 0.5;

    removeOverlay("victory-overlay");
    saveGame();
    updateDisplay();
    checkAchievements();

    setTimeout(() => {
        if (rewardId === "codex") {
            triggerCodexLore();
        } else if (rewardId === "mark") {
            showLore("The Archivist's Mark",
                state.ngPlus
                    ? "The second mark burns deeper than the first. Your name is now written in two inks — one ancient, one something else entirely."
                    : "Your name has been written in ink older than language. The archive will not forget you."
            );
        } else if (rewardId === "gift") {
            showLore("The Hollow Gift",
                state.ngPlus
                    ? "He left far more of himself this time. The archive and you are no longer separate things."
                    : "The King left a splinter of himself behind. The fragments come faster now — as if they were always yours to begin with."
            );
        }
    }, 400);
}

// --- CODEX LORE ---
async function triggerCodexLore() {
    try {
        const response = await fetch("https://archivist-proxy.ap24004.workers.dev/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                milestone: "hollow_king_codex",
                upgrades: state.upgrades,
                context: state.ngPlus
                    ? "The player claimed the Forbidden Codex in New Game+. Write something suggesting the archive was never truly closed. Deeply unsettling, ancient, final in a different way."
                    : "The player claimed the Forbidden Codex. Write the darkest lore fragment — a revelation that recontextualizes everything. Ancient, unsettling, final."
            })
        });
        const data = await response.json();
        showLore(data.title || "The Forbidden Codex", data.lore);
    } catch (err) {
        console.log("Codex lore failed:", err);
    }
}

// --- STATUS INDICATOR RENDERER ---
function renderStatusIndicator() {
    if (state.hollowKingRewards.mark) {
        let mark = document.getElementById("mark-indicator");
        if (!mark) {
            mark = document.createElement("div");
            mark.id = "mark-indicator";
            mark.textContent = "✦ Marked by the Archive ✦";
            const knowledgeDisplay = document.getElementById("knowledge-display");
            if (knowledgeDisplay) document.getElementById("game-container").insertBefore(mark, knowledgeDisplay);
        }
    }

    if (state.ngPlus) {
        let ngplus = document.getElementById("ngplus-indicator");
        if (!ngplus) {
            ngplus = document.createElement("div");
            ngplus.id = "ngplus-indicator";
            ngplus.textContent = "It Did Not Stay Closed";
            const knowledgeDisplay = document.getElementById("knowledge-display");
            if (knowledgeDisplay) document.getElementById("game-container").insertBefore(ngplus, knowledgeDisplay);
        }
    }

    if (state.paleLibrarianDefeated) {
        let pale = document.getElementById("pale-indicator");
        if (!pale) {
            pale = document.createElement("div");
            pale.id = "pale-indicator";
            pale.textContent = "✦ The Silence Holds ✦";
            const knowledgeDisplay = document.getElementById("knowledge-display");
            if (knowledgeDisplay) document.getElementById("game-container").insertBefore(pale, knowledgeDisplay);
        }
    }
}

// --- TRUE ENDING ---
function showTrueEnding() {
    state.endingSeen = true;
    checkAchievements();

    const overlay = document.createElement("div");
    overlay.id = "true-ending-overlay";
    overlay.className = "overlay-screen ending-screen";
    overlay.innerHTML = `
        <div class="overlay-box ending-box">
            <div class="overlay-title ending-title">The Archive Speaks</div>
            <div class="overlay-text ending-text">
                You have descended fifteen times into the dark. Fifteen times you let go of
                everything you built and went deeper. Fifteen times the archive pulled you back.<br><br>
                You are no longer someone who reads the archive.<br><br>
                <em>You are the archive.</em><br><br>
                Every fragment you recovered, every scholar you summoned, every whisper from
                the dark — they were never lost writings. They were memories. Yours. From before
                you had a name for what you were.<br><br>
                The Hollow King feared you because he recognized you. Not as an intruder.
                As a successor.<br><br>
                Rest now. The fragments are whole. The archive is silent — not because it is
                empty, but because it is finally, completely, full.<br><br>
                Thank you for descending.<br>
                Thank you for not looking away.<br>
                Thank you for playing.<br><br>
                <em>— The Archivist</em>
            </div>
            <div class="overlay-buttons">
                <button id="ending-close-btn">Close the Archive</button>
                <button id="ending-ngplus-btn">What Lies Below Awakens</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    fadeIn(overlay);

    document.getElementById("ending-close-btn").onclick = () => {
        localStorage.clear();
        location.reload();
    };

    document.getElementById("ending-ngplus-btn").onclick = () => {
        const preserved = {
            hollowKingRewards: { ...state.hollowKingRewards },
            paleLibrarianRewards: { ...state.paleLibrarianRewards },
            paleLibrarianDefeated: state.paleLibrarianDefeated,
            upgradeCostModifier: state.upgradeCostModifier,
            knowledgePerClick: state.knowledgePerClick,
            prestige: { count: 0, bonus: state.prestige.bonus, threshold: 25000 },
            baselineKps: state.baselineKps,
            ngPlus: true
        };
        localStorage.clear();
        localStorage.setItem("archivist_preserved", JSON.stringify(preserved));
        location.reload();
    };
}

// --- SUPPORT OVERLAY ---
function showSupportOverlay() {
    removeOverlay("support-overlay");

    const overlay = document.createElement("div");
    overlay.id = "support-overlay";
    overlay.className = "overlay-screen";
    overlay.innerHTML = `
        <div class="overlay-box">
            <div class="overlay-title">The Archive Endures</div>
            <div class="overlay-text">
                Every fragment you have recovered, every scholar summoned, every descent into
                the dark — thank you for being here.<br><br>
                This game was made freely and will stay that way. No paywalls, no locked content,
                no pressure. If the archive has given you something — a moment of wonder, a chill,
                a reason to return — a small offering is always welcome, but never expected.<br><br>
                <em>The Archivist remembers those who gave. And those who simply stayed.</em>
            </div>
            <div class="overlay-buttons">
                <a href="https://ko-fi.com/thearchivistgame" target="_blank">Leave an Offering</a>
                <button id="support-dismiss-btn">Return to the Archive</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    fadeIn(overlay);
    document.getElementById("support-dismiss-btn").onclick = () => removeOverlay("support-overlay");
}

// --- STATISTICS PANEL ---
function renderStats() {
    const panel = document.getElementById("stats-panel");
    if (!panel) return;

    const sessionSeconds = Math.floor((Date.now() - state.stats.sessionStart) / 1000);
    const timeStr = formatTimer(sessionSeconds);

    const hollowRewardsList = [
        state.hollowKingRewards.codex ? "Codex" : null,
        state.hollowKingRewards.mark ? "Mark" : null,
        state.hollowKingRewards.gift ? "Gift" : null
    ].filter(Boolean);

    const paleRewardsList = [
        state.paleLibrarianRewards.paleGift ? "Pale Gift" : null,
        state.paleLibrarianRewards.stillArchive ? "Still Archive" : null,
        state.paleLibrarianRewards.whitePage ? "White Page" : null
    ].filter(Boolean);

    panel.innerHTML = `
        <div class="stats-row"><span>Fragments (lifetime)</span><span>${formatNumber(state.stats.totalFragmentsEver)}</span></div>
        <div class="stats-row"><span>Descents</span><span>${state.stats.totalDescents}</span></div>
        <div class="stats-row"><span>Hollow King defeats</span><span>${state.stats.hollowKingDefeats}</span></div>
        <div class="stats-row"><span>Pale Librarian defeats</span><span>${state.stats.paleLibrarianDefeats}</span></div>
        <div class="stats-row"><span>King rewards</span><span>${hollowRewardsList.length > 0 ? hollowRewardsList.join(", ") : "None"}</span></div>
        <div class="stats-row"><span>Librarian rewards</span><span>${paleRewardsList.length > 0 ? paleRewardsList.join(", ") : "None"}</span></div>
        <div class="stats-row"><span>Total clicks</span><span>${formatNumber(state.totalClicks)}</span></div>
        <div class="stats-row"><span>Daily bonuses</span><span>${state.totalDailyBonuses}</span></div>
        <div class="stats-row"><span>Achievements</span><span>${state.achievementsUnlocked.size} / ${achievementDefs.length}</span></div>
        <div class="stats-row"><span>Descent level</span><span>${state.prestige.count}</span></div>
        <div class="stats-row"><span>Session time</span><span>${timeStr}</span></div>
        ${state.ngPlus ? `<div class="stats-row ngplus-row"><span>Mode</span><span>Second Archive</span></div>` : ""}
    `;
}

// --- LORE ARCHIVE ---
function renderLoreArchive() {
    const panel = document.getElementById("lore-archive-panel");
    if (!panel) return;

    if (state.loreLog.length === 0) {
        panel.innerHTML = `<div class="lore-archive-empty">No fragments have surfaced yet this run.</div>`;
        return;
    }

    panel.innerHTML = state.loreLog.map(entry => `
        <div class="lore-archive-entry">
            <div class="lore-archive-title">${entry.title}</div>
            <div class="lore-archive-text">${entry.text}</div>
        </div>
    `).join("");
}

// --- SAVE SYSTEM ---
function saveGame() {
    // Store the current timestamp so offline progress can be calculated on next load.
    localStorage.setItem("archivist_last_saved", Date.now().toString());

    const saveData = {
        knowledge: state.knowledge,
        knowledgePerClick: state.knowledgePerClick,
        knowledgePerSecond: state.knowledgePerSecond,
        totalEarned: state.totalEarned,
        upgrades: state.upgrades,
        prestige: state.prestige,
        hollowKingRewards: state.hollowKingRewards,
        paleLibrarianRewards: state.paleLibrarianRewards,
        ritualAvailable: state.ritualAvailable,
        ritualAttempted: state.ritualAttempted,
        banishmentReached: state.banishmentReached,
        paleLibrarianAvailable: state.paleLibrarianAvailable,
        paleLibrarianDefeated: state.paleLibrarianDefeated,
        endingSeen: state.endingSeen,
        ngPlus: state.ngPlus,
        baselineKps: state.baselineKps,
        upgradeCostModifier: state.upgradeCostModifier,
        loreLog: state.loreLog,
        totalClicks: state.totalClicks,
        totalDailyBonuses: state.totalDailyBonuses,
        totalTimeOpen: state.totalTimeOpen,
        achievementsUnlocked: Array.from(state.achievementsUnlocked),
        stats: state.stats,
        milestonesReached: Array.from(milestonesReached)
    };
    localStorage.setItem("archivist_save", JSON.stringify(saveData));
    showSaveIndicator();
}

// --- LOAD SYSTEM ---
function loadGame() {
    const preservedRaw = localStorage.getItem("archivist_preserved");
    if (preservedRaw) {
        try {
            const preserved = JSON.parse(preservedRaw);
            state.hollowKingRewards = preserved.hollowKingRewards || state.hollowKingRewards;
            state.paleLibrarianRewards = preserved.paleLibrarianRewards || state.paleLibrarianRewards;
            state.paleLibrarianDefeated = preserved.paleLibrarianDefeated || false;
            state.upgradeCostModifier = preserved.upgradeCostModifier || 1.0;
            state.knowledgePerClick = preserved.knowledgePerClick || 1;
            state.prestige = preserved.prestige || state.prestige;
            state.baselineKps = preserved.baselineKps || 0;
            state.ngPlus = preserved.ngPlus || false;
            localStorage.removeItem("archivist_preserved");
            saveGame();
        } catch (e) {
            localStorage.removeItem("archivist_preserved");
        }
        return;
    }

    const raw = localStorage.getItem("archivist_save");
    if (!raw) return;
    try {
        const saved = JSON.parse(raw);
        state.knowledge = saved.knowledge || 0;
        state.knowledgePerClick = saved.knowledgePerClick || 1;
        state.knowledgePerSecond = saved.knowledgePerSecond || 0;
        state.totalEarned = saved.totalEarned || 0;
        state.prestige = saved.prestige || state.prestige;
        state.hollowKingRewards = saved.hollowKingRewards || state.hollowKingRewards;
        state.paleLibrarianRewards = saved.paleLibrarianRewards || state.paleLibrarianRewards;
        state.ritualAvailable = saved.ritualAvailable || false;
        state.ritualAttempted = saved.ritualAttempted || false;
        state.banishmentReached = saved.banishmentReached || false;
        state.paleLibrarianAvailable = saved.paleLibrarianAvailable || false;
        state.paleLibrarianDefeated = saved.paleLibrarianDefeated || false;
        state.endingSeen = saved.endingSeen || false;
        state.ngPlus = saved.ngPlus || false;
        state.baselineKps = saved.baselineKps || 0;
        state.upgradeCostModifier = saved.upgradeCostModifier || 1.0;
        state.loreLog = saved.loreLog || [];
        state.totalClicks = saved.totalClicks || 0;
        state.totalDailyBonuses = saved.totalDailyBonuses || 0;
        state.totalTimeOpen = saved.totalTimeOpen || 0;

        if (saved.achievementsUnlocked) {
            saved.achievementsUnlocked.forEach(id => state.achievementsUnlocked.add(id));
        }

        if (saved.stats) {
            state.stats.totalFragmentsEver = saved.stats.totalFragmentsEver || 0;
            state.stats.totalDescents = saved.stats.totalDescents || 0;
            state.stats.hollowKingDefeats = saved.stats.hollowKingDefeats || 0;
            state.stats.paleLibrarianDefeats = saved.stats.paleLibrarianDefeats || 0;
        }
        state.stats.sessionStart = Date.now();

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
function showSaveIndicator(message) {
    const indicator = document.getElementById("save-indicator");
    if (!indicator) return;
    indicator.textContent = message || "✦ Progress saved ✦";
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
        localStorage.clear();
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

// --- CLICK ANIMATION: FLOATING NUMBER ---
function spawnFloatNumber(e, amount) {
    const el = document.createElement("div");
    el.className = "float-number";
    el.textContent = "+" + formatNumber(Math.floor(amount));
    const jitter = (Math.random() - 0.5) * 30;
    el.style.left = (e.clientX - 20 + jitter) + "px";
    el.style.top = (e.clientY - 10) + "px";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

// --- CLICK ANIMATION: GLOW PULSE ---
function spawnRipple(e) {
    const btn = document.getElementById("click-btn");
    btn.classList.add("clicked");
    setTimeout(() => btn.classList.remove("clicked"), 150);
}

// --- UTILITY: FADE IN ---
function fadeIn(el) {
    requestAnimationFrame(() => { requestAnimationFrame(() => { el.classList.add("visible"); }); });
}

// --- UTILITY: REMOVE OVERLAY ---
function removeOverlay(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.remove("visible");
        setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 600);
    }
}

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

// --- PANEL SECTION TOGGLES ---
function setupPanelToggle(btnId, panelId, openLabel, closedLabel) {
    const btn = document.getElementById(btnId);
    const panel = document.getElementById(panelId);
    if (!btn || !panel) return;

    let visible = false;
    btn.addEventListener("click", () => {
        visible = !visible;
        panel.style.display = visible ? "block" : "none";
        btn.textContent = visible ? openLabel : closedLabel;
        if (visible) {
            if (panelId === "stats-panel") renderStats();
            if (panelId === "lore-archive-panel") renderLoreArchive();
            if (panelId === "achievements-panel") renderAchievements();
        }
    });
}

setupPanelToggle("stats-btn", "stats-panel", "Archive Records ▴", "Archive Records ▾");
setupPanelToggle("lore-archive-btn", "lore-archive-panel", "Recovered Fragments ▴", "Recovered Fragments ▾");
setupPanelToggle("achievements-btn", "achievements-panel", "Achievements ▴", "Achievements ▾");

// --- DAILY BONUS ---
function checkDailyBonus() {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem("archivist_last_visit");

    if (lastVisit !== today) {
        localStorage.setItem("archivist_last_visit", today);
        if (lastVisit) setTimeout(() => showDailyBonus(), 1500);
    }
}

function showDailyBonus() {
    const overlay = document.createElement("div");
    overlay.id = "daily-bonus-overlay";
    overlay.className = "overlay-screen";
    overlay.innerHTML = `
        <div class="overlay-box">
            <div class="overlay-title">The Archive Stirs</div>
            <div class="overlay-text">
                You have returned.<br><br>
                The archive remembers those who come back. For the next
                three minutes, every fragment carries twice its weight.<br><br>
                <em>The darkness welcomes your return.</em>
            </div>
            <div class="overlay-buttons">
                <button id="daily-bonus-btn">Begin</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    fadeIn(overlay);

    document.getElementById("daily-bonus-btn").onclick = () => {
        removeOverlay("daily-bonus-overlay");
        state.totalDailyBonuses++;
        checkAchievements();
        activateDailyBonus();
    };
}

function activateDailyBonus() {
    state.prestige.bonus *= 2;
    updateDisplay();
    showDailyBonusTimer();

    setTimeout(() => {
        state.prestige.bonus /= 2;
        updateDisplay();
        removeDailyBonusTimer();
    }, 180000);
}

function showDailyBonusTimer() {
    let timer = document.getElementById("daily-bonus-timer");
    if (!timer) {
        timer = document.createElement("div");
        timer.id = "daily-bonus-timer";
        const perSecond = document.getElementById("per-second");
        if (perSecond && perSecond.nextSibling) {
            document.getElementById("game-container").insertBefore(timer, perSecond.nextSibling);
        } else {
            document.getElementById("game-container").appendChild(timer);
        }
    }

    let secondsLeft = 180;
    timer.textContent = `✦ Daily blessing: ${formatTimer(secondsLeft)} remaining ✦`;

    const interval = setInterval(() => {
        secondsLeft--;
        if (timer) timer.textContent = `✦ Daily blessing: ${formatTimer(secondsLeft)} remaining ✦`;
        if (secondsLeft <= 0) clearInterval(interval);
    }, 1000);
}

function removeDailyBonusTimer() {
    const timer = document.getElementById("daily-bonus-timer");
    if (timer) timer.remove();
}

// --- INIT ---
loadGame();
checkOfflineProgress();
checkDailyBonus();
checkAchievements();
updateDisplay();
