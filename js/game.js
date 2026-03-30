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
    },
    hollowKingRewards: {
        codex: false,
        mark: false,
        gift: false
    },
    ritualAvailable: false,
    ritualAttempted: false,
    banishmentReached: false,
    endingSeen: false,
    ngPlus: false,
    baselineKps: 0,
    loreLog: [],
    totalClicks: 0,
    totalDailyBonuses: 0,
    totalTimeOpen: 0,
    achievementsUnlocked: new Set(),
    stats: {
        totalFragmentsEver: 0,
        totalDescents: 0,
        hollowKingDefeats: 0,
        sessionStart: Date.now()
    }
};

// --- ACHIEVEMENT DEFINITIONS ---
const achievementDefs = [
    // First Steps
    { id: "first_light", name: "First Light", condition: () => state.stats.totalFragmentsEver >= 1, flavour: "Something stirs in the dark." },
    { id: "ink_takes_hold", name: "The Ink Takes Hold", condition: () => Object.values(state.upgrades).some(v => v > 0), flavour: "The archive accepts your offering." },
    { id: "deeper_still", name: "Deeper Still", condition: () => state.stats.totalDescents >= 1, flavour: "You let go. The archive pulls you down." },
    { id: "quill_moves", name: "The Quill Moves", condition: () => state.totalClicks >= 100, flavour: "The hand learns before the mind does." },
    { id: "something_listens", name: "Something Listens", condition: () => state.loreLog.length >= 1, flavour: "The archive has noticed you." },
    // Knowledge
    { id: "thousand_voices", name: "A Thousand Voices", condition: () => state.stats.totalFragmentsEver >= 1000, flavour: "The whispers become a chorus." },
    { id: "ten_thousand", name: "Ten Thousand Echoes", condition: () => state.stats.totalFragmentsEver >= 10000, flavour: "The chorus becomes a roar." },
    { id: "hundred_thousand", name: "One Hundred Thousand", condition: () => state.stats.totalFragmentsEver >= 100000, flavour: "The archive breathes with you now." },
    { id: "one_million", name: "One Million", condition: () => state.stats.totalFragmentsEver >= 1000000, flavour: "The archive is nearly full." },
    { id: "ten_million", name: "Ten Million", condition: () => state.stats.totalFragmentsEver >= 10000000, flavour: "There is no difference between you and it." },
    { id: "hundred_million", name: "One Hundred Million", condition: () => state.stats.totalFragmentsEver >= 100000000, flavour: "The archive does not end. Neither do you." },
    { id: "one_billion", name: "One Billion", condition: () => state.stats.totalFragmentsEver >= 1000000000, flavour: "Something older than the archive has taken notice." },
    // Scholars
    { id: "ten_scribes", name: "The Quill Never Rests", condition: () => state.upgrades.quillScribe >= 10, flavour: "They write without hands now." },
    { id: "ten_dust", name: "Dust and Memory", condition: () => state.upgrades.dustReader >= 10, flavour: "They read what was never written." },
    { id: "ten_scholars", name: "Between Worlds", condition: () => state.upgrades.shadowScholar >= 10, flavour: "They stopped casting shadows weeks ago." },
    { id: "first_bone", name: "Brittle Script", condition: () => state.upgrades.boneCartographer >= 1, flavour: "The maps lead somewhere they should not." },
    { id: "first_echo", name: "Bound Whispers", condition: () => state.upgrades.echoBinder >= 1, flavour: "The silence has texture now." },
    { id: "first_veil", name: "The Veil Thins", condition: () => state.upgrades.veilSurgeon >= 1, flavour: "Something on the other side is curious." },
    { id: "first_librarian", name: "The Library Sleeps", condition: () => state.upgrades.dreamingLibrarian >= 1, flavour: "Do not wake it." },
    { id: "first_hollow", name: "The Hollow Ones", condition: () => state.upgrades.hollowArchivist >= 1, flavour: "It no longer answers to its name." },
    // Descent
    { id: "descent_3", name: "Into the Abyss", condition: () => state.stats.totalDescents >= 3, flavour: "The light above is very small now." },
    { id: "descent_5", name: "No Way Back", condition: () => state.stats.totalDescents >= 5, flavour: "You stopped looking up after the third descent." },
    { id: "descent_8", name: "What Remains", condition: () => state.stats.totalDescents >= 8, flavour: "There is very little of you left that is not the archive." },
    { id: "descent_10", name: "The Deep Places", condition: () => state.stats.totalDescents >= 10, flavour: "Things live here that have never seen light." },
    { id: "descent_12", name: "Beyond Counting", condition: () => state.stats.totalDescents >= 12, flavour: "The archive no longer bothers to number the pages." },
    { id: "descent_14", name: "The Final Descent", condition: () => state.stats.totalDescents >= 14, flavour: "One more. Just one more." },
    { id: "true_ending", name: "The Archivist", condition: () => state.endingSeen, flavour: "You were always going to end up here." },
    { id: "ng_plus", name: "It Did Not Stay Closed", condition: () => state.ngPlus, flavour: "It did not stay closed." },
    // Hollow King
    { id: "ritual_available", name: "Something Stirs", condition: () => state.ritualAvailable || state.ritualAttempted, flavour: "He has been watching longer than you know." },
    { id: "ritual_performed", name: "The Sacrifice", condition: () => state.ritualAttempted, flavour: "What you gave, you will not get back." },
    { id: "banishment_reached", name: "The King Rises", condition: () => state.banishmentReached, flavour: "You can feel him before you see him." },
    { id: "king_defeated_1", name: "Hollow Victory", condition: () => state.stats.hollowKingDefeats >= 1, flavour: "He retreated. But he remembered your face." },
    { id: "king_defeated_2", name: "Twice Broken", condition: () => state.stats.hollowKingDefeats >= 2, flavour: "He expected you this time. It did not help him." },
    { id: "king_defeated_3", name: "The King Knows Your Name", condition: () => state.stats.hollowKingDefeats >= 3, flavour: "He stopped retreating all the way." },
    { id: "king_ngplus", name: "The King Is Afraid", condition: () => state.ngPlus && state.stats.hollowKingDefeats >= 1, flavour: "For the first time, he hesitated." },
    // Rewards
    { id: "reward_mark", name: "Marked", condition: () => state.hollowKingRewards.mark, flavour: "The ink does not wash off." },
    { id: "reward_gift", name: "Gifted", condition: () => state.hollowKingRewards.gift, flavour: "Something looks out through your eyes." },
    { id: "reward_codex", name: "The Forbidden Page", condition: () => state.hollowKingRewards.codex, flavour: "You were not meant to read this far." },
    { id: "all_rewards", name: "Complete", condition: () => state.hollowKingRewards.mark && state.hollowKingRewards.gift && state.hollowKingRewards.codex, flavour: "The King gave everything he had. It was not enough." },
    // Passive income
    { id: "kps_1", name: "The Archive Breathes", condition: () => state.knowledgePerSecond >= 1, flavour: "It runs without you now." },
    { id: "kps_10", name: "The Archive Hungers", condition: () => state.knowledgePerSecond >= 10, flavour: "You can hear it consuming." },
    { id: "kps_100", name: "The Archive Devours", condition: () => state.knowledgePerSecond >= 100, flavour: "It has stopped waiting for you to click." },
    { id: "kps_1000", name: "The Archive Is Alive", condition: () => state.knowledgePerSecond >= 1000, flavour: "You are not sure it needs you anymore." },
    // Daily
    { id: "daily_1", name: "You Came Back", condition: () => state.totalDailyBonuses >= 1, flavour: "The archive remembered you." },
    { id: "daily_7", name: "A Habit Forms", condition: () => state.totalDailyBonuses >= 7, flavour: "You return without deciding to." },
    { id: "daily_30", name: "The Archive Waits", condition: () => state.totalDailyBonuses >= 30, flavour: "It has always been here. So have you." },
    // Clicking
    { id: "clicks_1000", name: "The Hand Learns", condition: () => state.totalClicks >= 1000, flavour: "The motion becomes unconscious." },
    { id: "clicks_10000", name: "The Hand Forgets", condition: () => state.totalClicks >= 10000, flavour: "You no longer remember starting." },
    // Time
    { id: "time_1h", name: "The Patient One", condition: () => state.totalTimeOpen >= 3600, flavour: "The archive rewards those who stay." },
    { id: "time_24h", name: "What Are You", condition: () => state.totalTimeOpen >= 86400, flavour: "The line between you and the archive is very thin now." },
];

// --- UPGRADE DEFINITIONS ---
const upgradeDefs = [
    { id: "quillScribe", name: "Quill Scribe", description: "A scribe who copies fragments endlessly.", baseCost: 10, kps: 0.1, requiredDescent: 0 },
    { id: "dustReader", name: "Dust Reader", description: "Reads meaning from ashes and forgotten dust.", baseCost: 75, kps: 0.5, requiredDescent: 0 },
    { id: "shadowScholar", name: "Shadow Scholar", description: "A scholar who works in the dark between worlds.", baseCost: 500, kps: 3, requiredDescent: 0 },
    { id: "boneCartographer", name: "Bone Cartographer", description: "Maps the archive's forbidden wings in brittle script.", baseCost: 3000, kps: 10, requiredDescent: 1 },
    { id: "echoBinder", name: "Echo Binder", description: "Binds whispers into solid text before they fade.", baseCost: 15000, kps: 40, requiredDescent: 2 },
    { id: "veilSurgeon", name: "Veil Surgeon", description: "Cuts through reality to retrieve pages lost between worlds.", baseCost: 100000, kps: 150, requiredDescent: 3 },
    { id: "dreamingLibrarian", name: "Dreaming Librarian", description: "Reads while the archive sleeps, stealing knowledge from its dreams.", baseCost: 750000, kps: 500, requiredDescent: 4 },
    { id: "hollowArchivist", name: "The Hollow Archivist", description: "Has become part of the archive itself. It no longer remembers its name.", baseCost: 5000000, kps: 1500, requiredDescent: 5 }
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

// --- SOUND SYSTEM ---
let audioCtx = null;
let soundEnabled = false;

function getAudioContext() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
}

function playLoreSound() {
    if (!soundEnabled) return;
    try {
        const ctx = getAudioContext();
        const bufferSize = ctx.sampleRate * 0.6;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = buffer;
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = "bandpass";
        noiseFilter.frequency.value = 800;
        noiseFilter.Q.value = 0.4;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.001, ctx.currentTime);
        noiseGain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.15);
        noiseGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.35);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        const resonator = ctx.createOscillator();
        const resGain = ctx.createGain();
        resonator.type = "sine";
        resonator.frequency.setValueAtTime(65, ctx.currentTime);
        resonator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.8);
        resGain.gain.setValueAtTime(0.001, ctx.currentTime);
        resGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.2);
        resGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        resonator.connect(resGain);
        resGain.connect(ctx.destination);
        noiseSource.start(ctx.currentTime);
        noiseSource.stop(ctx.currentTime + 0.6);
        resonator.start(ctx.currentTime);
        resonator.stop(ctx.currentTime + 0.8);
    } catch (e) {}
}

function playPrestigeSound() {
    if (!soundEnabled) return;
    try {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 1.8);
        gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 1.8);
    } catch (e) {}
}

// --- ACHIEVEMENT SYSTEM ---
function checkAchievements() {
    achievementDefs.forEach(def => {
        if (!state.achievementsUnlocked.has(def.id) && def.condition()) {
            state.achievementsUnlocked.add(def.id);
            showAchievementNotification(def);
        }
    });
}

// Queue system so multiple achievements don't stack on top of each other.
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

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            el.classList.add("visible");
        });
    });

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
// Updates total time open every 10 seconds and checks time achievements.
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
    renderStatusIndicator();
}

// --- UPGRADE COST CALCULATOR ---
function getUpgradeCost(def) {
    const owned = state.upgrades[def.id] || 0;
    const base = state.ngPlus ? Math.floor(def.baseCost * 1.5) : def.baseCost;
    return Math.floor(base * Math.pow(1.15, owned));
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
            Cost: ${formatNumber(cost)} knowledge
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
        const upgradeContainer = document.getElementById("upgrade-container");
        if (upgradeContainer) {
            document.getElementById("game-container").insertBefore(panel, upgradeContainer);
        } else {
            document.getElementById("game-container").appendChild(panel);
        }
    }

    const cleanText = text.replace(/#{1,6}\s*/g, "").replace(/\*\*/g, "").replace(/\*/g, "").replace(/\n+/g, " ").trim();
    const cleanTitle = title.replace(/#{1,6}\s*/g, "").replace(/\*\*/g, "").replace(/\*/g, "").trim();

    state.loreLog.unshift({ title: cleanTitle, text: cleanText });
    if (state.loreLog.length > 20) state.loreLog.pop();

    document.getElementById("lore-title").textContent = cleanTitle;
    document.getElementById("lore-text").textContent = cleanText;

    playLoreSound();

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            panel.classList.add("visible");
        });
    });

    setTimeout(() => panel.classList.remove("visible"), 12000);
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
            <div id="ritual-hint-container"></div>
            <div id="action-buttons">
                <button id="save-btn">✦ Save Progress</button>
                <button id="kofi-btn">Support the Archive</button>
                <button id="sound-btn">Sound: Off</button>
            </div>
            <div id="save-indicator"></div>
            <button id="prestige-btn" style="display:none;">Descend Deeper</button>
            <button id="ritual-btn" style="display:none;">Perform the Ritual</button>
            <button id="reset-btn">Reset all progress</button>
        `;

        document.getElementById("save-btn").onclick = saveGame;
        document.getElementById("reset-btn").onclick = confirmReset;
        document.getElementById("prestige-btn").onclick = doPrestige;
        document.getElementById("kofi-btn").onclick = showSupportOverlay;
        document.getElementById("ritual-btn").onclick = showRitualOverlay;
        document.getElementById("sound-btn").onclick = toggleSound;
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

    const ritualHintContainer = document.getElementById("ritual-hint-container");
    ritualHintContainer.innerHTML = state.ritualAvailable
        ? `<div id="ritual-hint">✦ Something stirs in the depths ✦</div>` : "";

    const prestigeBtn = document.getElementById("prestige-btn");
    prestigeBtn.textContent = `Descend Deeper (next bonus: ${nextBonus}%)`;
    prestigeBtn.style.display = canPrestige ? "inline-block" : "none";

    const ritualBtn = document.getElementById("ritual-btn");
    ritualBtn.style.display = state.ritualAvailable ? "inline-block" : "none";

    const soundBtn = document.getElementById("sound-btn");
    if (soundBtn) soundBtn.textContent = soundEnabled ? "Sound: On" : "Sound: Off";
}

// --- PRESTIGE ACTION ---
function doPrestige() {
    playPrestigeSound();
    state.prestige.count++;
    state.stats.totalDescents++;
    state.prestige.bonus += 0.5;
    state.prestige.threshold = Math.floor(state.prestige.threshold * 2.5);

    state.knowledge = 0;
    state.knowledgePerClick = state.hollowKingRewards.mark ? (state.ngPlus ? 3 : 2) : 1;
    state.knowledgePerSecond = 0;
    state.totalEarned = 0;
    state.loreLog = [];

    Object.keys(state.upgrades).forEach(key => { state.upgrades[key] = 0; });

    milestonesReached.clear();
    upgradesBuilt = false;
    state.ritualAvailable = false;

    const ritualUnlockThreshold = state.ngPlus ? 8 : 5;

    if (state.prestige.count > ritualUnlockThreshold) {
        const allRewardsClaimed = state.hollowKingRewards.codex && state.hollowKingRewards.mark && state.hollowKingRewards.gift;
        if (!allRewardsClaimed && Math.random() < 0.3) {
            state.ritualAvailable = true;
        }
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

// --- RITUAL OVERLAY — PHASE 1: SACRIFICE ---
function showRitualOverlay() {
    const sacrifice = Math.floor(state.knowledge * 0.5);
    if (sacrifice <= 0) return;

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

    document.getElementById("ritual-cancel-btn").onclick = () => {
        removeOverlay("ritual-overlay");
    };
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
        <div class="overlay-box" id="banishment-box">
            <div class="overlay-title" id="banishment-title">The Hollow King Rises</div>
            <div class="overlay-text" id="banishment-text">
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
                <small>${state.ngPlus ? "A final page surfaces. Some truths cannot be unlearned. The archive whispers constantly now." : "A final page surfaces from the deepest vault. Some truths cannot be unlearned."}</small>
            </button>
        `);
    }
    if (!state.hollowKingRewards.mark) {
        rewardButtons.push(`
            <button class="reward-btn" id="reward-mark">
                <strong>The Archivist's Mark</strong><br/>
                <small>${state.ngPlus ? "Your name is written deeper this time. Each fragment carries twice the weight." : "Your name is written in the archive's oldest ink. It will not fade. Each fragment you recover carries more weight."}</small>
            </button>
        `);
    }
    if (!state.hollowKingRewards.gift) {
        rewardButtons.push(`
            <button class="reward-btn" id="reward-gift">
                <strong>The Hollow Gift</strong><br/>
                <small>${state.ngPlus ? "The King left more of himself this time. Far more. The fragments come faster than they should." : "Something of the King remains in you. The fragments come faster now."}</small>
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
                The darkness folded inward. The King — that vast, hollow thing that had watched
                from beneath every page, behind every word you ever recovered — has been driven
                back into the deep.<br><br>
                He did not scream. He did not rage. He simply... withdrew. As if he had been
                waiting for someone strong enough to push back.<br><br>
                As he retreated, he left something behind. A gift. Or a payment. Perhaps both.<br><br>
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

// --- CLAIM REWARD ---
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
                    ? "The second mark burns deeper than the first. Your name is now written in two inks — one ancient, one something else entirely. The fragments feel heavier now. More real."
                    : "Your name has been written in ink older than language. The archive will not forget you. Something in the dark nods slowly, as if satisfied."
            );
        } else if (rewardId === "gift") {
            showLore("The Hollow Gift",
                state.ngPlus
                    ? "He left far more of himself this time. It doesn't settle behind your eyes — it settles everywhere. The archive and you are no longer separate things."
                    : "The King left a splinter of himself behind. It settled somewhere behind your eyes. The fragments come faster now — as if they were always yours to begin with."
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
                    ? "The player has defeated the Hollow King in New Game+ and claimed the Forbidden Codex for the second time. Write something that suggests the archive was never truly closed — that the first ending was itself a page in a larger book. Deeply unsettling, ancient, final in a different way."
                    : "The player has just defeated the Hollow King and claimed the Forbidden Codex. Write the darkest, most profound lore fragment in the entire game. This is a revelation — something that recontextualizes everything that came before. Ancient, unsettling, final."
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
                <a id="support-proceed-btn" href="https://ko-fi.com/thearchivistgame" target="_blank">Leave an Offering</a>
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
    const sessionMinutes = Math.floor(sessionSeconds / 60);
    const sessionHours = Math.floor(sessionMinutes / 60);
    const timeStr = sessionHours > 0
        ? `${sessionHours}h ${sessionMinutes % 60}m`
        : sessionMinutes > 0 ? `${sessionMinutes}m ${sessionSeconds % 60}s` : `${sessionSeconds}s`;

    const rewardsList = [
        state.hollowKingRewards.codex ? "The Forbidden Codex" : null,
        state.hollowKingRewards.mark ? "The Archivist's Mark" : null,
        state.hollowKingRewards.gift ? "The Hollow Gift" : null
    ].filter(Boolean);

    panel.innerHTML = `
        <div class="stats-row"><span>Fragments recovered (lifetime)</span><span>${formatNumber(state.stats.totalFragmentsEver)}</span></div>
        <div class="stats-row"><span>Descents completed</span><span>${state.stats.totalDescents}</span></div>
        <div class="stats-row"><span>Hollow King defeats</span><span>${state.stats.hollowKingDefeats}</span></div>
        <div class="stats-row"><span>Rewards claimed</span><span>${rewardsList.length > 0 ? rewardsList.join(", ") : "None"}</span></div>
        <div class="stats-row"><span>Total clicks</span><span>${formatNumber(state.totalClicks)}</span></div>
        <div class="stats-row"><span>Daily bonuses claimed</span><span>${state.totalDailyBonuses}</span></div>
        <div class="stats-row"><span>Achievements</span><span>${state.achievementsUnlocked.size} / ${achievementDefs.length}</span></div>
        <div class="stats-row"><span>Current descent level</span><span>${state.prestige.count}</span></div>
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
    const saveData = {
        knowledge: state.knowledge,
        knowledgePerClick: state.knowledgePerClick,
        knowledgePerSecond: state.knowledgePerSecond,
        totalEarned: state.totalEarned,
        upgrades: state.upgrades,
        prestige: state.prestige,
        hollowKingRewards: state.hollowKingRewards,
        ritualAvailable: state.ritualAvailable,
        ritualAttempted: state.ritualAttempted,
        banishmentReached: state.banishmentReached,
        endingSeen: state.endingSeen,
        ngPlus: state.ngPlus,
        baselineKps: state.baselineKps,
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
        state.ritualAvailable = saved.ritualAvailable || false;
        state.ritualAttempted = saved.ritualAttempted || false;
        state.banishmentReached = saved.banishmentReached || false;
        state.endingSeen = saved.endingSeen || false;
        state.ngPlus = saved.ngPlus || false;
        state.baselineKps = saved.baselineKps || 0;
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

        soundEnabled = localStorage.getItem("archivist_sound") === "1";
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

// --- SOUND TOGGLE ---
function toggleSound() {
    soundEnabled = !soundEnabled;
    const btn = document.getElementById("sound-btn");
    if (btn) btn.textContent = soundEnabled ? "Sound: On" : "Sound: Off";
    if (soundEnabled && audioCtx && audioCtx.state === "suspended") audioCtx.resume();
    localStorage.setItem("archivist_sound", soundEnabled ? "1" : "0");
}

// --- AUTOSAVE ---
setInterval(saveGame, 30000);

// --- CLICK ANIMATION: FLOATING NUMBER ---
function spawnFloatNumber(e, amount) {
    const el = document.createElement("div");
    el.className = "float-number";
    el.textContent = "+" + formatNumber(Math.floor(amount));
    el.style.left = (e.clientX - 20) + "px";
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
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            el.classList.add("visible");
        });
    });
}

// --- UTILITY: REMOVE OVERLAY ---
function removeOverlay(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.remove("visible");
        setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, 600);
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

// --- STATS SECTION TOGGLE ---
const statsBtn = document.getElementById("stats-btn");
const statsPanelEl = document.getElementById("stats-panel");
let statsVisible = false;

if (statsBtn) {
    statsBtn.addEventListener("click", () => {
        statsVisible = !statsVisible;
        statsPanelEl.style.display = statsVisible ? "block" : "none";
        statsBtn.textContent = statsVisible ? "View Archive Records ▴" : "View Archive Records ▾";
        if (statsVisible) renderStats();
    });
}

// --- LORE ARCHIVE TOGGLE ---
const loreArchiveBtn = document.getElementById("lore-archive-btn");
const loreArchivePanelEl = document.getElementById("lore-archive-panel");
let loreArchiveVisible = false;

if (loreArchiveBtn) {
    loreArchiveBtn.addEventListener("click", () => {
        loreArchiveVisible = !loreArchiveVisible;
        loreArchivePanelEl.style.display = loreArchiveVisible ? "block" : "none";
        loreArchiveBtn.textContent = loreArchiveVisible ? "View Recovered Fragments ▴" : "View Recovered Fragments ▾";
        if (loreArchiveVisible) renderLoreArchive();
    });
}

// --- ACHIEVEMENTS TOGGLE ---
const achievementsBtn = document.getElementById("achievements-btn");
const achievementsPanelEl = document.getElementById("achievements-panel");
let achievementsVisible = false;

if (achievementsBtn) {
    achievementsBtn.addEventListener("click", () => {
        achievementsVisible = !achievementsVisible;
        achievementsPanelEl.style.display = achievementsVisible ? "block" : "none";
        achievementsBtn.textContent = achievementsVisible ? "View Achievements ▴" : "View Achievements ▾";
        if (achievementsVisible) renderAchievements();
    });
}

// --- DAILY BONUS ---
function checkDailyBonus() {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem("archivist_last_visit");

    if (lastVisit !== today) {
        localStorage.setItem("archivist_last_visit", today);
        if (lastVisit) {
            setTimeout(() => showDailyBonus(), 1500);
        }
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
        const knowledgeDisplay = document.getElementById("knowledge-display");
        if (knowledgeDisplay && knowledgeDisplay.nextSibling) {
            document.getElementById("game-container").insertBefore(timer, knowledgeDisplay.nextSibling);
        }
    }

    let secondsLeft = 180;
    timer.textContent = `✦ Daily blessing: ${secondsLeft}s remaining ✦`;

    const interval = setInterval(() => {
        secondsLeft--;
        if (timer) timer.textContent = `✦ Daily blessing: ${secondsLeft}s remaining ✦`;
        if (secondsLeft <= 0) clearInterval(interval);
    }, 1000);
}

function removeDailyBonusTimer() {
    const timer = document.getElementById("daily-bonus-timer");
    if (timer) timer.remove();
}

// --- INIT ---
loadGame();
checkDailyBonus();
checkAchievements();
updateDisplay();
