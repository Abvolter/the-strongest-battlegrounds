let playerData = {};

fetch('stages.json')
  .then(res => res.json())
  .then(data => {
    playerData = data;
    showView('stages');
  });

function showView(view) {
  const content = document.getElementById('content');
  content.innerHTML = '';

  if (view === 'stages') {
    for (const [stage, players] of Object.entries(playerData)) {
      const col = document.createElement('div');
      col.className = 'stage-column';

      const title = document.createElement('div');
      title.className = 'stage-title';
      title.textContent = stage;
      col.appendChild(title);

      players.forEach(p => {
        const div = document.createElement('div');
        div.className = 'player';
        div.textContent = `${p.name} (${p.tag})`;
        col.appendChild(div);
      });

      content.appendChild(col);
    }
  } else if (view === 'overall') {
    const allPlayers = [];

    for (const [stage, players] of Object.entries(playerData)) {
      players.forEach(p => {
        const pts = calculatePoints(stage, p.tier);
        allPlayers.push({
          name: p.name,
          stage: stage,
          tier: p.tier || '',
          points: pts
        });
      });
    }

    // Sort players:
    allPlayers.sort((a, b) => {
      // Stage 0 first
      if (a.stage === 'Stage 0' && b.stage !== 'Stage 0') return -1;
      if (b.stage === 'Stage 0' && a.stage !== 'Stage 0') return 1;
      // Then by points descending
      return b.points - a.points;
    });

    allPlayers.forEach((p, i) => {
      const row = document.createElement('div');
      row.className = 'player-row';
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';
      row.style.alignItems = 'center';
      row.style.padding = '10px 20px';
      row.style.margin = '5px 0';
      row.style.border = '1px solid #ccc';
      row.style.borderRadius = '12px';
      row.style.background = getStageColor(p.stage);

      const name = document.createElement('div');
      name.innerHTML = `<strong>${i + 1}. ${p.name}</strong>`;

      const score = document.createElement('div');
      score.textContent = `${p.points} pts`;

      row.appendChild(name);
      row.appendChild(score);
      content.appendChild(row);
    });
  }
}

function calculatePoints(stage, tier = '') {
  if (stage === 'Stage 0') return 20;
  if (stage === 'Stage 2' || stage === 'Stage 3') return 0;

  const tierPoints = {
    'High Strong': 15,
    'High Solid': 14,
    'High Weak': 13,
    'Mid Strong': 12,
    'Mid Solid': 11,
    'Mid Weak': 10,
    'Low Strong': 9,
    'Low Solid': 8,
    'Low Weak': 7
  };

  return tierPoints[tier] || 0;
}

function getStageColor(stage) {
  switch (stage) {
    case 'Stage 0': return '#ffd6d6';
    case 'Stage 1': return '#d6eaff';
    case 'Stage 2': return '#d6ffd6';
    case 'Stage 3': return '#ffffd6';
    default: return '#f0f0f0';
  }
}
