// ─── Level Definitions ─────────────────────────────────────────────────────────
// Difficulty: L1 (EASY) → L10 (LEGEND)
//
// Special tile types:
//   moving  – green/teal,  oscillates back and forth
//   timed   – orange,      countdown on landing; game over if you don't shoot in time
//   ghost   – purple,      fades in/out; invisible tiles can't be landed on
//   shrink  – gold/yellow, slowly shrinks from spawn; smaller target each round

export const LEVELS = [
  // ── Levels 1–5 (original) ──────────────────────────────────────────────────
  {
    id: 1, name: 'First Steps',
    description: 'Get used to the controls. Lots of room to land.',
    difficulty: 'EASY',
    hexCount: 50, hexRadius: 2.2, hexMinSpacingExtra: 0.5,
    startingPower: 10, powerPerRound: 3, roundsToWin: 5,
    movingTileCount: 0, timedTileCount: 0, timedTileDuration: 4,
    ghostTileCount: 0, shrinkTileCount: 0, shrinkTileDuration: 15,
  },
  {
    id: 2, name: 'Open Field',
    description: 'Fewer tiles spread across the whole platform.',
    difficulty: 'NORMAL',
    hexCount: 35, hexRadius: 2.0, hexMinSpacingExtra: 0.8,
    startingPower: 15, powerPerRound: 4, roundsToWin: 8,
    movingTileCount: 0, timedTileCount: 0, timedTileDuration: 4,
    ghostTileCount: 0, shrinkTileCount: 0, shrinkTileDuration: 15,
  },
  {
    id: 3, name: 'Moving Targets',
    description: 'Some tiles refuse to stay still. Track them carefully.',
    difficulty: 'MEDIUM',
    hexCount: 28, hexRadius: 2.0, hexMinSpacingExtra: 0.9,
    startingPower: 20, powerPerRound: 5, roundsToWin: 10,
    movingTileCount: 4, timedTileCount: 0, timedTileDuration: 4,
    ghostTileCount: 0, shrinkTileCount: 0, shrinkTileDuration: 15,
  },
  {
    id: 4, name: 'Hot Seat',
    description: 'Orange tiles crack after 4 seconds. Land and shoot fast.',
    difficulty: 'HARD',
    hexCount: 22, hexRadius: 1.9, hexMinSpacingExtra: 1.0,
    startingPower: 25, powerPerRound: 6, roundsToWin: 12,
    movingTileCount: 4, timedTileCount: 3, timedTileDuration: 4,
    ghostTileCount: 0, shrinkTileCount: 0, shrinkTileDuration: 15,
  },
  {
    id: 5, name: 'Expert Circuit',
    description: 'Few tiles. Fast tiles. Ticking tiles. Good luck.',
    difficulty: 'EXPERT',
    hexCount: 22, hexRadius: 1.8, hexMinSpacingExtra: 1.2,
    startingPower: 30, powerPerRound: 7, roundsToWin: 15,
    movingTileCount: 6, timedTileCount: 4, timedTileDuration: 3,
    ghostTileCount: 0, shrinkTileCount: 0, shrinkTileDuration: 15,
  },

  // ── Levels 6–10 (new) ──────────────────────────────────────────────────────
  {
    id: 6, name: 'Unstable Ground',
    description: 'Introduces ghost tiles — purple tiles flicker in and out of existence.',
    difficulty: 'BRUTAL',
    hexCount: 24, hexRadius: 1.8, hexMinSpacingExtra: 1.1,
    startingPower: 32, powerPerRound: 7, roundsToWin: 14,
    movingTileCount: 5, timedTileCount: 4, timedTileDuration: 3.5,
    ghostTileCount: 3, shrinkTileCount: 0, shrinkTileDuration: 15,
  },
  {
    id: 7, name: 'Now You See Me',
    description: 'Ghost tiles dominate. Only land when the tile is visible.',
    difficulty: 'BRUTAL',
    hexCount: 24, hexRadius: 1.8, hexMinSpacingExtra: 1.1,
    startingPower: 35, powerPerRound: 7, roundsToWin: 14,
    movingTileCount: 5, timedTileCount: 3, timedTileDuration: 3.5,
    ghostTileCount: 7, shrinkTileCount: 0, shrinkTileDuration: 15,
  },
  {
    id: 8, name: 'Shrinking World',
    description: 'Gold tiles shrink every second. The board gets smaller. Move fast.',
    difficulty: 'NIGHTMARE',
    hexCount: 24, hexRadius: 1.85, hexMinSpacingExtra: 1.0,
    startingPower: 36, powerPerRound: 8, roundsToWin: 14,
    movingTileCount: 4, timedTileCount: 3, timedTileDuration: 3,
    ghostTileCount: 2, shrinkTileCount: 7, shrinkTileDuration: 14,
  },
  {
    id: 9, name: 'Everything Falls Apart',
    description: 'Every mechanic at once. Tiles move, tick, flicker, and vanish.',
    difficulty: 'NIGHTMARE',
    hexCount: 24, hexRadius: 1.75, hexMinSpacingExtra: 1.2,
    startingPower: 38, powerPerRound: 8, roundsToWin: 15,
    movingTileCount: 5, timedTileCount: 3, timedTileDuration: 3,
    ghostTileCount: 5, shrinkTileCount: 5, shrinkTileDuration: 12,
  },
  {
    id: 10, name: 'The Final Test',
    description: 'No mercy. Fewer targets each second. Only legends finish this.',
    difficulty: 'LEGEND',
    hexCount: 26, hexRadius: 1.7, hexMinSpacingExtra: 1.3,
    startingPower: 40, powerPerRound: 10, roundsToWin: 15,
    movingTileCount: 6, timedTileCount: 4, timedTileDuration: 2.5,
    ghostTileCount: 6, shrinkTileCount: 5, shrinkTileDuration: 10,
  },
];
