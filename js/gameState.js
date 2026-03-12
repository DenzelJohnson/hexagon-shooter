export class GameState {
  constructor() {
    this.personalBest = parseInt(localStorage.getItem('hexShooterBest') || '0');
    this._config      = null;
    this.targetRounds = 5;
    this.reset();
  }

  // Call before starting a level
  setLevel(config) {
    this._config      = config;
    this.targetRounds = config.roundsToWin;
    this.reset();
  }

  reset() {
    this.round        = 0;   // rounds successfully completed
    this.isWon        = false;
    this.meterPercent = this._config ? this._config.startingPower : 10;
  }

  nextRound() {
    this.round++;
    const cfg = this._config;
    this.meterPercent = cfg
      ? Math.min(100, cfg.startingPower + this.round * cfg.powerPerRound)
      : Math.min(100, 10 + this.round * 5);

    if (this.round >= this.targetRounds) this.isWon = true;

    if (this.round > this.personalBest) {
      this.personalBest = this.round;
      localStorage.setItem('hexShooterBest', this.personalBest.toString());
    }
  }

  get score()       { return this.round; }
  get launchSpeed() { return 10 + (this.meterPercent / 100) * 25; }
}
