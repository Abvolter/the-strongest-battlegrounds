/* ============================================================
   MCTiers – Rankings Script
   Features:
   • Admin Panel (password locked)
   • Add / Edit players
   • LocalStorage saving
   • Tier → Points system
   • Auto titles (Grandmaster, Master, etc.)
   • Mode-based leaderboards
   • Player modal with NameMC + skin
   • Search bar
   ============================================================ */

const ADMIN_PASSWORD = "tsbadmin"; // change this if you want

const TIER_POINTS = {
  "NONE": 0,
  "HT1": 60, "LT1": 45,
  "HT2": 30, "LT2": 20,
  "HT3": 10, "LT3": 6,
  "HT4": 4,  "LT4": 3,
  "HT5": 2,  "LT5": 1
};

const MODES = [
  "vanilla", "uhc", "pot", "nethop",
  "smp", "sword", "axe", "mace", "ltms"
];

const STORAGE_KEY = "mctiers_players_v1";

let players = loadPlayers();
let currentMode = "overall";

/* ---------- Load / Save ---------- */

function loadPlayers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to load players", e);
    return [];
  }
}

function savePlayers() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
  renderLeaderboard();
}

/* ---------- Points + Titles ---------- */

function computePointsForTier(tier) {
  return TIER_POINTS[tier] ?? 0;
}

function computeTitle(total) {
  if (total >= 400) return "Combat Grandmaster";
  if (total >= 250) return "Combat Master";
  if (total >= 100) return "Combat Ace";
  if (total >= 50)  return "Combat Specialist";
  if (total >= 20)  return "Combat Cadet";
  if (total >= 10)  return "Combat Novice";
  return "Rookie";
}

/* ---------- Skins / NameMC ---------- */

function avatarUrl(username) {
  return `https://mc-heads.net/avatar/${encodeURIComponent(username)}/64`;
}

function namemcUrl(username) {
  return `https://namemc.com/profile/${encodeURIComponent(username)}`;
}

/* ---------- Helpers ---------- */

function modeLabel(mode) {
  switch (mode) {
    case "vanilla": return "Van";
    case "uhc":     return "UHC";
    case "pot":     return "Pot";
    case "nethop":  return "Neth";
    case "smp":     return "SMP";
    case "sword":   return "Sword";
    case "axe":     return "Axe";
    case "mace":    return "Mace";
    case "ltms":    return "LTM";
    default:        return "";
  }
}

function regionClass(region) {
  if (region === "NA") return "region-na";
  if (region === "EU") return "region-eu";
  return "region-other";
}

function titleClass(title) {
  if (title === "Combat Grandmaster") return "title-grandmaster";
  if (title === "Combat Master")      return "title-master";
  if (title === "Combat Ace")         return "title-ace";
  return "";
}

/* ---------- Sorting ---------- */

function sortPlayersForMode(mode) {
  if (mode === "overall") {
    return [...players].sort((a, b) => b.totalPoints - a.totalPoints);
  }

  return [...players].sort((a, b) => {
    const ta = computePointsForTier(a.modes[mode] || "NONE");
    const tb = computePointsForTier(b.modes[mode] || "NONE");
    if (tb !== ta) return tb - ta;
    return b.totalPoints - a.totalPoints;
  });
}

/* ---------- Leaderboard Rendering ---------- */

function renderLeaderboard() {
  const lb = document.getElementById("leaderboard");
  const emptyRow = document.getElementById("lbEmpty");

  // remove old rows
  lb.querySelectorAll(".lb-row").forEach(r => r.remove());

  const sorted = sortPlayersForMode(currentMode);

  if (!sorted.length) {
    emptyRow.style.display = "block";
    return;
  } else {
    emptyRow.style.display = "none";
  }

  sorted.forEach((p, index) => {
    const place = index + 1;

    const row = document.createElement("div");
    row.className = "lb-row";
    row.dataset.username = p.username;

    // position cell
    const posCell = document.createElement("div");
    posCell.className = "lb-pos";
    const badge = document.createElement("div");
    badge.classList.add("lb-pos-badge");

    if (place === 1) badge.classList.add("lb-pos-1");
    else if (place === 2) badge.classList.add("lb-pos-2");
    else if (place === 3) badge.classList.add("lb-pos-3");
    else badge.classList.add("lb-pos-default");

    badge.textContent = place;
    posCell.appendChild(badge);
    row.appendChild(posCell);

    // player cell
    const playerCell = document.createElement("div");
    playerCell.className = "lb-player";

    const skin = document.createElement("div");
    skin.className = "player-skin";
    skin.style.backgroundImage = `url('${avatarUrl(p.username)}')`;

    const meta = document.createElement("div");
    meta.className = "player-meta";

    const name = document.createElement("div");
    name.className = "player-name";
    name.textContent = p.username;

    const titleLine = document.createElement("div");
    titleLine.className = "player-title";

    const titleBadge = document.createElement("div");
    titleBadge.className = "title-badge " + titleClass(p.title);

    if (p.title === "Combat Grandmaster") {
      const gif = document.createElement("div");
      gif.className = "title-small-gif"; // this uses grandmaster.gif in CSS
      titleBadge.appendChild(gif);
    }

    const titleText = document.createElement("span");
    titleText.textContent = p.title;
    titleBadge.appendChild(titleText);

    const ptsText = document.createElement("span");
    ptsText.textContent = `${p.totalPoints} pts`;

    titleLine.appendChild(titleBadge);
    titleLine.appendChild(ptsText);

    meta.appendChild(name);
    meta.appendChild(titleLine);

    playerCell.appendChild(skin);
    playerCell.appendChild(meta);
    row.appendChild(playerCell);

    // region cell
    const regionCell = document.createElement("div");
    regionCell.className = "lb-region";
    const regionPill = document.createElement("div");
    regionPill.className = "region-pill " + regionClass(p.region);
    regionPill.textContent = p.region;
    regionCell.appendChild(regionPill);
    row.appendChild(regionCell);

    // tiers cell
    const tiersCell = document.createElement("div");
    tiersCell.className = "lb-tiers";

    MODES.forEach(mode => {
      const tier = p.modes[mode] || "NONE";
      if (tier === "NONE") return;

      if (currentMode !== "overall" && mode !== currentMode) return;

      const chip = document.createElement("div");
      if (tier.startsWith("HT")) {
        const num = tier[2]; // HT1, HT2, ...
        chip.className = "tier-chip ht" + num;
      } else {
        chip.className = "tier-chip";
      }

      const dot = document.createElement("div");
      dot.className = "tier-dot";

      const label = document.createElement("span");
      label.textContent = `${modeLabel(mode)} ${tier}`;

      chip.appendChild(dot);
      chip.appendChild(label);
      tiersCell.appendChild(chip);
    });

    row.appendChild(tiersCell);

    row.addEventListener("click", () => {
      const overallSorted = sortPlayersForMode("overall");
      const posOverall = overallSorted.findIndex(pp =>
        pp.username.toLowerCase() === p.username.toLowerCase()
      ) + 1;
      openPlayerModal(p, posOverall || place);
    });

    lb.appendChild(row);
  });
}

/* ---------- Player Modal ---------- */

function openPlayerModal(player, position) {
  const modalBackdrop = document.getElementById("playerModalBackdrop");
  const modalSkin = document.getElementById("modalSkin");
  const modalName = document.getElementById("modalName");
  const modalTitle = document.getElementById("modalTitle");
  const modalRegion = document.getElementById("modalRegion");
  const modalNameMC = document.getElementById("modalNameMC");
  const modalPosition = document.getElementById("modalPosition");
  const modalTiers = document.getElementById("modalTiers");

  modalSkin.style.backgroundImage = `url('${avatarUrl(player.username)}')`;
  modalName.textContent = player.username;

  // title pill
  modalTitle.innerHTML = "";
  const badge = document.createElement("div");
  badge.className = "title-badge " + titleClass(player.title);

  if (player.title === "Combat Grandmaster") {
    const gif = document.createElement("div");
    gif.className = "title-small-gif";
    badge.appendChild(gif);
  }

  const titleText = document.createElement("span");
  titleText.textContent = player.title;
  badge.appendChild(titleText);
  modalTitle.appendChild(badge);

  modalRegion.textContent = player.region;
  modalNameMC.onclick = () => window.open(namemcUrl(player.username), "_blank");

  modalPosition.textContent = `#${position} • ${player.totalPoints} points overall`;

  modalTiers.innerHTML = "";
  MODES.forEach(mode => {
    const tier = player.modes[mode] || "NONE";
    if (tier === "NONE") return;

    const chip = document.createElement("div");
    if (tier.startsWith("HT")) {
      const num = tier[2];
      chip.className = "tier-chip ht" + num;
    } else {
      chip.className = "tier-chip";
    }

    const dot = document.createElement("div");
    dot.className = "tier-dot";

    const label = document.createElement("span");
    label.textContent = `${modeLabel(mode)} – ${tier}`;

    chip.appendChild(dot);
    chip.appendChild(label);
    modalTiers.appendChild(chip);
  });

  modalBackdrop.style.display = "flex";
}

function closePlayerModal() {
  document.getElementById("playerModalBackdrop").style.display = "none";
}

/* ---------- Admin Panel ---------- */

function openAdminPanel() {
  document.getElementById("adminBackdrop").style.display = "flex";
}

function closeAdminPanel() {
  document.getElementById("adminBackdrop").style.display = "none";
}

function initTierSelects() {
  const selects = document.querySelectorAll(".tier-select");
  const values = ["NONE","HT1","LT1","HT2","LT2","HT3","LT3","HT4","LT4","HT5","LT5"];

  selects.forEach(sel => {
    sel.innerHTML = "";
    values.forEach(v => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      sel.appendChild(opt);
    });
    sel.value = "NONE";
  });
}

function handleSavePlayer() {
  const usernameInput = document.getElementById("pUsername");
  const regionSelect = document.getElementById("pRegion");

  const username = usernameInput.value.trim();
  const region = regionSelect.value;

  if (!username) {
    alert("Username required.");
    return;
  }

  const modes = {};
  document.querySelectorAll(".tier-select").forEach(sel => {
    const mode = sel.dataset.mode;
    modes[mode] = sel.value;
  });

  let total = 0;
  MODES.forEach(mode => {
    total += computePointsForTier(modes[mode] || "NONE");
  });

  const title = computeTitle(total);

  const existingIndex = players.findIndex(
    p => p.username.toLowerCase() === username.toLowerCase()
  );

  const playerObj = {
    username,
    region,
    modes,
    totalPoints: total,
    title
  };

  if (existingIndex >= 0) {
    players[existingIndex] = playerObj;
  } else {
    players.push(playerObj);
  }

  savePlayers();
  alert(`Player saved. Total points: ${total} (${title})`);
}

/* ---------- JSON Import / Export ---------- */

function exportJson() {
  const area = document.getElementById("jsonArea");
  area.value = JSON.stringify(players, null, 2);
}

function importJson() {
  const area = document.getElementById("jsonArea");
  const raw = area.value.trim();
  if (!raw) {
    alert("Paste JSON first.");
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Not an array");
    players = parsed;
    savePlayers();
    alert("JSON imported. Players: " + players.length);
  } catch (e) {
    alert("Invalid JSON.");
  }
}

/* ---------- Mode Switching ---------- */

function switchMode(mode) {
  currentMode = mode;

  document.querySelectorAll(".mode-tab").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });

  const titleEl = document.getElementById("leaderboardTitle");
  if (mode === "overall") {
    titleEl.textContent = "Overall Rankings";
  } else {
    titleEl.textContent = mode.toUpperCase() + " Leaderboard";
  }

  renderLeaderboard();
}

/* ---------- Search ---------- */

function searchPlayer(name) {
  if (!name) return;
  const target = players.find(
    p => p.username.toLowerCase() === name.toLowerCase()
  );
  if (!target) {
    alert("Player not found.");
    return;
  }

  const sortedOverall = sortPlayersForMode("overall");
  const position = sortedOverall.findIndex(
    p => p.username.toLowerCase() === target.username.toLowerCase()
  ) + 1;

  openPlayerModal(target, position || "?");
}

/* ---------- Init / Event Listeners ---------- */

document.addEventListener("DOMContentLoaded", () => {
  initTierSelects();
  renderLeaderboard();

  // Player modal
  document.getElementById("playerModalClose").onclick = closePlayerModal;
  document.getElementById("playerModalBackdrop").addEventListener("click", (e) => {
    if (e.target.id === "playerModalBackdrop") closePlayerModal();
  });

  // Admin panel open/close
  document.getElementById("openAdmin").onclick = openAdminPanel;
  document.getElementById("adminClose").onclick = closeAdminPanel;
  document.getElementById("adminBackdrop").addEventListener("click", (e) => {
    if (e.target.id === "adminBackdrop") closeAdminPanel();
  });

  // Admin auth
  const unlockBtn = document.getElementById("adminUnlock");
  const passInput = document.getElementById("adminPasswordInput");
  const errorEl = document.getElementById("adminError");
  const authSection = document.getElementById("adminAuthSection");
  const adminContent = document.getElementById("adminContent");

  unlockBtn.onclick = () => {
    const val = passInput.value;
    if (val === ADMIN_PASSWORD) {
      authSection.style.display = "none";
      adminContent.style.display = "block";
      errorEl.style.display = "none";
    } else {
      errorEl.style.display = "block";
    }
  };

  // Admin actions
  document.getElementById("savePlayer").onclick = handleSavePlayer;
  document.getElementById("exportJson").onclick = exportJson;
  document.getElementById("importJson").onclick = importJson;

  // Mode tabs
  document.querySelectorAll(".mode-tab").forEach(btn => {
    btn.addEventListener("click", () => switchMode(btn.dataset.mode));
  });

  // Search input
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const val = searchInput.value.trim();
      if (val) searchPlayer(val);
    }
  });

  // "/" shortcut to focus search
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
  });
});
