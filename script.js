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
    const allPlayers = Object.values(playerData).flat();
    allPlayers.forEach(p => {
      const div = document.createElement('div');
      div.className = 'player';
      div.textContent = `${p.name} - ${p.tag}`;
      content.appendChild(div);
    });
  }
}
