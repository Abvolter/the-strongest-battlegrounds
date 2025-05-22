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

    Object.keys(playerData)
      .sort((a, b) => parseInt(a.replace("Stage ", "")) - parseInt(b.replace("Stage ", "")))
      .forEach(stage => {
        playerData[stage].forEach((p, i) => {
          allPlayers.push({ ...p, stage, userId: p.userId || (100 + i) }); // placeholder IDs
        });
      });

    allPlayers.forEach(p => {
      const row = document.createElement('div');
      row.className = 'player-row';
      row.style.background = getStageColor(p.stage);
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.padding = '10px';
      row.style.borderRadius = '8px';
      row.style.margin = '5px 0';

      const avatar = document.createElement('img');
      avatar.src = `https://www.roblox.com/headshot-thumbnail/image?userId=${p.userId}&width=100&height=100&format=png`;
      avatar.alt = `${p.name}'s avatar`;
      avatar.style.width = '50px';
      avatar.style.height = '50px';
      avatar.style.borderRadius = '50%';
      avatar.style.marginRight = '10px';

      const info = document.createElement('div');
      info.innerHTML = `<strong>${p.name}</strong><br>Stage: ${p.stage}`;

      row.appendChild(avatar);
      row.appendChild(info);
      content.appendChild(row);
    });
  }
}

function getStageColor(stage) {
  switch (stage) {
    case 'Stage 0': return '#ffb3ba'; // soft red
    case 'Stage 1': return '#bae1ff'; // soft blue
    case 'Stage 2': return '#baffc9'; // soft green
    case 'Stage 3': return '#ffffba'; // soft yellow
    default: return '#eeeeee';
  }
}
