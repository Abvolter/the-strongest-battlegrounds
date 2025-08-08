<script>
        let players = [
            { name: 'Marlowww', points: 405, region: 'NA', swordTier: 'HT1', position: 1 },
            { name: 'ItzRealMe', points: 330, region: 'NA', swordTier: 'HT1', position: 2 },
            { name: 'Swight', points: 260, region: 'NA', swordTier: 'LT1', position: 3 },
            { name: 'coldified', points: 228, region: 'EU', swordTier: 'LT2', position: 4 },
            { name: 'Kylaz', points: 222, region: 'NA', swordTier: 'HT1', position: 5 },
            { name: 'BlvckWlf', points: 206, region: 'EU', swordTier: 'HT3', position: 6 },
            { name: 'Lurrn', points: 186, region: 'EU', swordTier: 'LT3', position: 7 },
            { name: 'SwordMaster', points: 165, region: 'NA', swordTier: 'HT2', position: 8 },
            { name: 'PvPKing', points: 142, region: 'EU', swordTier: 'LT2', position: 9 },
            { name: 'BladeRunner', points: 118, region: 'NA', swordTier: 'HT4', position: 10 }
        ];

        let currentMode = 'overall';

        function renderLeaderboard() {
            const leaderboard = document.getElementById('leaderboard');
            leaderboard.innerHTML = '';

            // Sort players by points
            players.sort((a, b) => b.points - a.points);
            
            // Update positions
            players.forEach((player, index) => {
                player.position = index + 1;
            });

            players.forEach(player => {
                const playerRow = createPlayerRow(player);
                leaderboard.appendChild(playerRow);
            });
        }

        function createPlayerRow(player) {
            const row = document.createElement('div');
            row.className = 'player-row';
            row.onclick = () => openPlayerModal(player);

            const isTop3 = player.position <= 3;
            let rankClass = 'rank-other';
            if (player.position === 1) rankClass = 'rank-1';
            else if (player.position === 2) rankClass = 'rank-2';
            else if (player.position === 3) rankClass = 'rank-3';

            const nameClass = isTop3 ? 'rgb-name' : '';
            const titleDisplay = isTop3 ? `<div class="player-title"><span class="title-badge">Combat ${player.position === 1 ? 'Grandmaster' : 'Master'}</span> <span class="points-text">(${player.points} points)</span></div>` : 
                                          `<div class="player-title"><span class="points-text">(${player.points} points)</span></div>`;

            row.innerHTML = `
                <div class="rank-number ${rankClass}">${player.position}</div>
                <div class="player-info">
                    <div class="player-avatar"></div>
                    <div class="player-details">
                        <div class="player-name ${nameClass}">${player.name}</div>
                        ${titleDisplay}
                    </div>
                </div>
                <div class="region-badge region-${player.region.toLowerCase()}">${player.region}</div>
                <div class="tiers-display">
                    <div class="tier-icon tier-sword">⚔️</div>
                    <div class="tier-icon tier-${player.swordTier.toLowerCase()}">${player.swordTier}</div>
                </div>
            `;

            return row;
        }

        function openPlayerModal(player) {
            const modal = document.getElementById('playerModal');
            const isTop3 = player.position <= 3;
            
            document.getElementById('modalName').textContent = player.name;
            document.getElementById('modalName').className = isTop3 ? 'profile-name rgb-name' : 'profile-name';
            
            const titleText = isTop3 ? `Combat ${player.position === 1 ? 'Grandmaster' : 'Master'}` : 'Combat Ace';
            document.getElementById('modalTitle').textContent = titleText;
            document.getElementById('modalTitle').style.display = isTop3 ? 'inline-block' : 'none';
            
            document.getElementById('modalPoints').textContent = player.points;
            document.getElementById('modalPosition').textContent = `#${player.position}`;
            
            // Render tier badges
            const tiersContainer = document.getElementById('modalTiers');
            tiersContainer.innerHTML = `
                <div class="tier-icon tier-sword" style="width: 32px; height: 32px; font-size: 1rem;">⚔️</div>
                <div class="tier-icon tier-${player.swordTier.toLowerCase()}" style="width: 32px; height: 32px;">${player.swordTier}</div>
            `;
            
            modal.style.display = 'block';
        }

        function closeModal() {
            document.getElementById('playerModal').style.display = 'none';
        }

        function toggleAdmin() {
            const panel = document.getElementById('adminPanel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }

        function addPlayer() {
            const name = document.getElementById('playerName').value.trim();
            const points = parseInt(document.getElementById('playerPoints').value) || 0;
            const region = document.getElementById('playerRegion').value;
            const swordTier = document.getElementById('swordTier').value;

            if (!name) {
                alert('Please enter a player name');
                return;
            }

            // Check if player exists
            const existingPlayerIndex = players.findIndex(p => p.name.toLowerCase() === name.toLowerCase());
            
            if (existingPlayerIndex >= 0) {
                // Update existing player
                players[existingPlayerIndex].points = points;
                players[existingPlayerIndex].region = region;
                players[existingPlayerIndex].swordTier = swordTier;
            } else {
                // Add new player
                players.push({ name, points, region, swordTier, position: 0 });
            }

            // Clear form
            document.getElementById('playerName').value = '';
            document.getElementById('playerPoints').value = '';
            
            renderLeaderboard();
            toggleAdmin();
        }

        function searchPlayer(searchTerm) {
            const playerRows = document.querySelectorAll('.player-row');
            
            playerRows.forEach(row => {
                const playerName = row.querySelector('.player-name').textContent.toLowerCase();
                const matches = playerName.includes(searchTerm.toLowerCase());
                row.style.display = matches || searchTerm === '' ? 'grid' : 'none';
            });
        }

        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentMode = tab.dataset.mode;
                
                if (currentMode === 'sword') {
                    // Show only sword-specific data
                    renderLeaderboard();
                } else {
                    // Show overall rankings
                    renderLeaderboard();
                }
            });
        });

        // Close modal when clicking outside
        window.onclick = function(event) {
            const modal = document.getElementById('playerModal');
            const adminPanel = document.getElementById('adminPanel');
            
            if (event.target === modal) {
                closeModal();
            }
            if (event.target === adminPanel) {
                toggleAdmin();
            }
        }

        // Initialize
        renderLeaderboard();
