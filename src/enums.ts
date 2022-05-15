export const enum Phase {
  Draw = 0,
  Standby,
  Main1,
  Battle,
  Main2,
  End,
}
export const PHASE_ENUM_LENGTH = 6;

export const enum Step {
  None,
  Start,
  Battle,
  Damage,
  End,
}

export const enum Timing {
  None,
  StartDamageStep,
  BeforeDamageCalculation,
  DuringDamageCalculation,
  AfterDamageCalculation,
  EndDamageStep,
}

export const enum State {
  Open,
  Trigger,
  TurnPlayerResponse,
  OpponentResponse,
  Chain,
  PassResponse,
}

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

export const enum SpellType {
  Normal = "normal",
  Continuous = "continuous",
  QuickPlay = "quick-play",
}

export const enum TrapType {
  Normal = "normal",
  Continuous = "continuous",
}
