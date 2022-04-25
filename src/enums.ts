export const enum CardType {
  Monster = "monster",
  Spell = "spell",
  Trap = "trap",
}

export const enum CardFace {
  Up = "up",
  Down = "down",
}

export const enum MonsterPosition {
  Attack = "attack",
  Defence = "defence",
}

export const enum Phase {
  Draw = 0,
  Main1,
  Battle,
  Main2,
  End,
}
export const PHASE_ENUM_LENGTH = 5;

export const enum SpellType {
  Normal = "normal",
  Continuous = "continuous",
  QuickPlay = "quick-play",
}

export const enum TrapType {
  Normal = "normal",
  Continuous = "continuous",
}
