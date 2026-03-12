export class UI {
  constructor() {
    this.roundEl      = document.getElementById('round-display');
    this.meterFill    = document.getElementById('meter-bar-fill');
    this.meterPctEl   = document.getElementById('meter-percent');
    this.bestEl       = document.getElementById('best-display');
    this.aimHint      = document.getElementById('aim-hint');
    this.shootBtn     = document.getElementById('shoot-btn');
    this.gameOverEl   = document.getElementById('game-over');
    this.finalScoreEl = document.getElementById('final-score');
    this.finalBestEl  = document.getElementById('final-best');
    this.restartBtn   = document.getElementById('restart-btn');
  }

  updateHUD(displayRound, meterPct, personalBest) {
    this.roundEl.textContent    = `Round: ${displayRound}`;
    this.meterFill.style.width  = `${meterPct}%`;
    this.meterPctEl.textContent = `${meterPct}%`;
    this.bestEl.textContent     = `Best: ${personalBest}`;
  }

  setShootEnabled(enabled) {
    this.shootBtn.disabled    = !enabled;
    this.aimHint.style.opacity = enabled ? '1' : '0';
  }

  showGameOver(score, best) {
    this.finalScoreEl.textContent = `Score: ${score}`;
    this.finalBestEl.textContent  = `Personal Best: ${best}`;
    this.gameOverEl.classList.remove('hidden');
  }

  hideGameOver() {
    this.gameOverEl.classList.add('hidden');
  }

  onShoot(callback) {
    this.shootBtn.onclick = callback;
  }

  onRestart(callback) {
    this.restartBtn.onclick = callback;
  }
}
