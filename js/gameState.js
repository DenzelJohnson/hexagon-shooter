export class GameState {
  constructor() {
    this.personalBest = parseInt(localStorage.getItem('hexShooterBest') || '0');
    this.reset();
  }

  reset() {
    this.round = 0;        // rounds successfully completed
    this.meterPercent = 10; // power for current shot
  }

  nextRound() {
    this.round += 1;
    this.meterPercent = Math.min(100, 10 + this.round * 5);
  }

  get score() {
    return this.round;
  }

  // Launch speed in units/sec based on current meter
  get launchSpeed() {
    const MIN = 10;
    const MAX = 35;
    return MIN + (this.meterPercent / 100) * (MAX - MIN);
  }

  savePersonalBest() {
    if (this.score > this.personalBest) {
      this.personalBest = this.score;
      localStorage.setItem('hexShooterBest', this.personalBest.toString());
    }
  }
}
