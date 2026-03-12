export class UI {
  constructor() {
    // ── HUD ──
    this.hudEl         = document.getElementById('hud');
    this.roundEl       = document.getElementById('round-display');
    this.levelNameEl   = document.getElementById('level-name-display');
    this.meterFill     = document.getElementById('meter-bar-fill');
    this.meterPctEl    = document.getElementById('meter-percent');
    this.aimHint       = document.getElementById('aim-hint');
    this.shootBtn      = document.getElementById('shoot-btn');

    // ── Countdown ──
    this.countdownWrap = document.getElementById('countdown-wrap');
    this.countdownFill = document.getElementById('countdown-fill');
    this.countdownText = document.getElementById('countdown-text');

    // ── Home ──
    this.homeScreen = document.getElementById('home-screen');
    this.playBtn    = document.getElementById('play-btn');

    // ── Level Select ──
    this.levelSelectEl = document.getElementById('level-select');
    this.levelGrid     = document.getElementById('level-grid');
    this.backBtn       = document.getElementById('back-btn');

    // ── Win ──
    this.winScreen    = document.getElementById('win-screen');
    this.winLevelEl   = document.getElementById('win-level-name');
    this.winRoundsEl  = document.getElementById('win-rounds');
    this.nextLevelBtn = document.getElementById('next-level-btn');
    this.levelsWinBtn = document.getElementById('levels-win-btn');

    // ── Game Over ──
    this.gameOverEl      = document.getElementById('game-over');
    this.finalScoreEl    = document.getElementById('final-score');
    this.finalBestEl     = document.getElementById('final-best');
    this.retryBtn        = document.getElementById('retry-btn');
    this.levelsGOBtn     = document.getElementById('levels-go-btn');
  }

  // ── Screen management ──────────────────────────────────────────────────────

  showHome() {
    this.homeScreen.classList.remove('hidden');
    this.levelSelectEl.classList.add('hidden');
    this.hudEl.classList.add('hidden');
    this.winScreen.classList.add('hidden');
    this.gameOverEl.classList.add('hidden');
  }

  showLevelSelect() {
    this.homeScreen.classList.add('hidden');
    this.levelSelectEl.classList.remove('hidden');
    this.hudEl.classList.add('hidden');
    this.winScreen.classList.add('hidden');
    this.gameOverEl.classList.add('hidden');
  }

  showGame() {
    this.homeScreen.classList.add('hidden');
    this.levelSelectEl.classList.add('hidden');
    this.hudEl.classList.remove('hidden');
    this.winScreen.classList.add('hidden');
    this.gameOverEl.classList.add('hidden');
    this.countdownWrap.classList.add('hidden');
  }

  showWin(levelName, roundsCompleted, hasNext) {
    this.winLevelEl.textContent  = levelName;
    this.winRoundsEl.textContent = `${roundsCompleted} / ${roundsCompleted} rounds complete`;
    this.nextLevelBtn.classList.toggle('hidden', !hasNext);
    this.winScreen.classList.remove('hidden');
  }

  showGameOver(round, target, best) {
    this.finalScoreEl.textContent = `Round ${round} / ${target}`;
    this.finalBestEl.textContent  = `Personal Best: ${best}`;
    this.gameOverEl.classList.remove('hidden');
  }

  hideGameOver() { this.gameOverEl.classList.add('hidden'); }

  // ── HUD updates ────────────────────────────────────────────────────────────

  updateRound(round, target) {
    this.roundEl.textContent = `${round} / ${target}`;
  }

  updateLevelName(name) {
    this.levelNameEl.textContent = name;
  }

  updateMeter(pct) {
    this.meterFill.style.width  = `${pct}%`;
    this.meterPctEl.textContent = `${Math.round(pct)}%`;
  }

  setShootEnabled(enabled) {
    this.shootBtn.disabled      = !enabled;
    this.aimHint.style.opacity  = enabled ? '1' : '0';
  }

  // ── Countdown bar (timed tiles) ────────────────────────────────────────────

  showCountdown(fraction, secondsLeft) {
    this.countdownWrap.classList.remove('hidden');
    const pct = Math.max(0, fraction) * 100;
    this.countdownFill.style.width = `${pct}%`;

    // Colour shifts green → yellow → red as time runs out
    const r = Math.round(80  + 175 * (1 - fraction));
    const g = Math.round(220 * fraction);
    this.countdownFill.style.background = `rgb(${r}, ${g}, 20)`;

    const secs = Math.ceil(Math.max(0, secondsLeft));
    this.countdownText.textContent = `SHOOT! ${secs}s`;
  }

  hideCountdown() {
    this.countdownWrap.classList.add('hidden');
  }

  // ── Level grid builder ─────────────────────────────────────────────────────

  buildLevelGrid(levels, onSelect) {
    this.levelGrid.innerHTML = '';
    const diffColors = {
      EASY:      '#00ff88',
      NORMAL:    '#00ccff',
      MEDIUM:    '#ffcc00',
      HARD:      '#ff8800',
      EXPERT:    '#ff3333',
      BRUTAL:    '#ff6600',
      NIGHTMARE: '#ff0044',
      LEGEND:    '#ff00cc',
    };
    levels.forEach(level => {
      const card = document.createElement('div');
      card.className = 'level-card';
      const color = diffColors[level.difficulty] || '#ffffff';
      card.innerHTML = `
        <div class="lc-num">${String(level.id).padStart(2, '0')}</div>
        <div class="lc-name">${level.name}</div>
        <div class="lc-desc">${level.description}</div>
        <div class="lc-diff" style="color:${color};border-color:${color}40">${level.difficulty}</div>
        <div class="lc-meta">${level.roundsToWin} rounds to win</div>
      `;
      card.addEventListener('click', () => onSelect(level.id));
      this.levelGrid.appendChild(card);
    });
  }

  // ── Event wiring ───────────────────────────────────────────────────────────

  onPlayCampaign(cb) { this.playBtn.onclick    = cb; }
  onBack(cb)         { this.backBtn.onclick     = cb; }
  onShoot(cb)        { this.shootBtn.onclick    = cb; }
  onRetry(cb)        { this.retryBtn.onclick    = cb; }
  onNextLevel(cb)    { this.nextLevelBtn.onclick = cb; }
  onLevelsWin(cb)    { this.levelsWinBtn.onclick = cb; }
  onLevelsGO(cb)     { this.levelsGOBtn.onclick  = cb; }
}
