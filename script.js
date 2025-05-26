<script>
        let players = [];

        function toggleAdmin() {
            const panel = document.getElementById('adminPanel');
            panel.classList.toggle('active');
        }

        function updateStageOptions() {
            const stage = document.getElementById('playerStage').value;
            const stage1Options = document.getElementById('stage1Options');
            
            if (stage === 'stage-1') {
                stage1Options.style.display = 'block';
                document.getElementById('stage1Sub').required = true;
            } else {
                stage1Options.style.display = 'none';
                document.getElementById('stage1Sub').required = false;
                document.getElementById('stage1Sub').value = '';
            }
        }

        function addPlayer(event) {
            event.preventDefault();
            
            const name = document.getElementById('playerName').value.trim();
            const stage = document.getElementById('playerStage').value;
            const stage1Sub = document.getElementById('stage1Sub').value;
            const tab = document.getElementById('playerTab').value;

            if (!name || !stage || !tab) {
                alert('Please fill in all required fields');
                return;
            }

            if (stage === 'stage-1' && !stage1Sub) {
                alert('Please select a Stage 1 subdivision');
                return;
            }

            // Check if player already exists
            if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
                alert('Player already exists!');
                return;
            }

            const player = {
                id: Date.now(),
                name: name,
                stage: stage,
                stage1Sub: stage1Sub,
                tab: tab,
                fullStage: getFullStageText(stage, stage1Sub)
            };

            players.push(player);
            updatePlayerList();
            updateLeaderboards();
            clearForm();
            
            alert('Player added successfully!');
        }

        function getFullStageText(stage, stage1Sub) {
            if (stage === 'stage-0') return 'Stage 0';
            if (stage === 'stage-1') {
                const subText = stage1Sub.replace('-', ' ');
                return `Stage 1 ${subText.charAt(0).toUpperCase() + subText.slice(1)}`;
            }
            if (stage === 'stage-2') return 'Stage 2';
            if (stage === 'stage-3') return 'Stage 3';
            return 'Unknown';
        }

        function getStageClass(stage, stage1Sub) {
            if (stage === 'stage-0') return 'stage-0';
            if (stage === 'stage-1') return `stage-1-${stage1Sub}`;
            if (stage === 'stage-2') return 'stage-2';
            if (stage === 'stage-3') return 'stage-3';
            return '';
        }

        function getStageRank(stage, stage1Sub) {
            const rankings = {
                'stage-0': 1,
                'stage-1-high-strong': 2,
                'stage-1-high-solid': 3,
                'stage-1-high-weak': 4,
                'stage-1-mid-strong': 5,
                'stage-1-mid-solid': 6,
                'stage-1-mid-weak': 7,
                'stage-1-low-strong': 8,
                'stage-1-low-solid': 9,
                'stage-1-low-weak': 10,
                'stage-2': 11,
                'stage-3': 12
            };
            
            if (stage === 'stage-1') {
                return rankings[`${stage}-${stage1Sub}`] || 999;
            }
            return rankings[stage] || 999;
        }

        function deletePlayer(id) {
            if (confirm('Are you sure you want to delete this player?')) {
                players = players.filter(p => p.id !== id);
                updatePlayerList();
                updateLeaderboards();
            }
        }

        function updatePlayerList() {
            const list = document.getElementById('playerList');
            
            if (players.length === 0) {
                list.innerHTML = '<div style="text-align: center; color: #666; padding: 2rem;">No players added yet</div>';
                return;
            }

            list.innerHTML = players.map(player => `
                <div class="player-item">
                    <div class="player-info-admin">
                        <div class="player-name-admin">${player.name}</div>
                        <div class="player-stage-admin">${player.fullStage} - ${player.tab}</div>
                    </div>
                    <button class="btn btn-danger" onclick="deletePlayer(${player.id})">Delete</button>
                </div>
            `).join('');
        }

        function updateLeaderboards() {
            updateOverallTab();
            updateTSBGTab();
        }

        function updateOverallTab() {
            const overallPlayers = players.filter(p => p.tab === 'overall' || p.tab === 'both');
            const sorted = overallPlayers.sort((a, b) => getStageRank(a.stage, a.stage1Sub) - getStageRank(b.stage, b.stage1Sub));
            
            const container = document.querySelector('#overall .leaderboard');
            const header = container.querySelector('.leaderboard-header');
            
            if (sorted.length === 0) {
                container.innerHTML = `
                    ${header.outerHTML}
                    <div class="player-row">
                        <div class="rank other">-</div>
                        <div class="player-info">
                            <div class="player-avatar">?</div>
                            <div class="player-details">
                                <h3>Add your clan members here</h3>
                            </div>
                        </div>
                        <div class="stage-info">
                            <span class="stage-badge stage-0">Use Admin Panel</span>
                        </div>
                    </div>
                `;
                return;
            }

            const playersHTML = sorted.map((player, index) => {
                const rankClass = index === 0 ? 'top1' : index === 1 ? 'top2' : index === 2 ? 'top3' : 'other';
                const initials = player.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                
                return `
                    <div class="player-row">
                        <div class="rank ${rankClass}">${index + 1}</div>
                        <div class="player-info">
                            <div class="player-avatar">${initials}</div>
                            <div class="player-details">
                                <h3>${player.name}</h3>
                            </div>
                        </div>
                        <div class="stage-info">
                            <span class="stage-badge ${getStageClass(player.stage, player.stage1Sub)}">${player.fullStage}</span>
                        </div>
                    </div>
                `;
            }).join('');

            container.innerHTML = header.outerHTML + playersHTML;
        }

        function updateTSBGTab() {
            const tsbgPlayers = players.filter(p => p.tab === 'tsbg' || p.tab === 'both');
            
            // Clear all columns
            ['stage-0', 'stage-1', 'stage-2', 'stage-3'].forEach(stageName => {
                const column = document.querySelector(`.${stageName}-header`).parentElement;
                const playersContainer = column.querySelector('.tier-players');
                playersContainer.innerHTML = '<div class="empty-tier">No players yet</div>';
            });

            // Add players to appropriate columns
            tsbgPlayers.forEach(player => {
                const columnClass = `${player.stage}-header`;
                const column = document.querySelector(`.${columnClass}`).parentElement;
                const playersContainer = column.querySelector('.tier-players');
                
                if (playersContainer.querySelector('.empty-tier')) {
                    playersContainer.innerHTML = '';
                }

                const initials = player.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                
                const playerHTML = `
                    <div class="tier-player">
                        <div class="tier-avatar">${initials}</div>
                        <div class="tier-player-name">${player.name}</div>
                    </div>
                `;
                
                playersContainer.innerHTML += playerHTML;
            });
        }

        function clearForm() {
            document.getElementById('playerForm').reset();
            document.getElementById('stage1Options').style.display = 'none';
            document.getElementById('stage1Sub').required = false;
        }

        function switchTab(tabName) {
            // Hide all tab contents
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => {
                content.classList.remove('active');
            });

            // Remove active class from all tabs
            const tabs = document.querySelectorAll('.tab');
            tabs.forEach(tab => {
                tab.classList.remove('active');
            });

            // Show selected tab content
            document.getElementById(tabName).classList.add('active');

            // Add active class to clicked tab
            event.target.classList.add('active');
        }

        // Add some interactive effects
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('.player-row').forEach(row => {
                row.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateX(10px) scale(1.02)';
                });

                row.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateX(0) scale(1)';
                });
            });
        });
    </script>
</body>
</html>
