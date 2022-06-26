export const enum Phase {
  Draw = "draw",
  Standby = "standby",
  Main1 = "main 1",
  Battle = "battle",
  Main2 = "main 2",
  End = "end",
}

export const enum BattlePhaseStep {
  None = "none",
  Start = "start",
  Battle = "battle",
  Damage = "damage",
  End = "end",
}

export const enum DamageStepTiming {
  None = "none",
  Start = "start",
  BeforeDamageCalculation = "before damage calculation",
  DuringDamageCalculation = "during damage calculation",
  AfterDamageCalculation = "after damage calculation",
  End = "end",
}

export const enum State {
  Open = "open",
  TurnPlayerMandatoryTrigger = "turn player mandatory trigger",
  OpponentMandatoryTrigger = "opponent mandatory trigger",
  TurnPlayerOptionalTrigger = "turn player optional trigger",
  OpponentOptionalTrigger = "opponent optional trigger",
  TurnPlayerResponse = "turn player response",
  OpponentResponse = "opponent response",
  ChainBuild = "chain build",
  ChainResolve = "chain resolve",
  PassResponse = "pass response",
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

export const enum MonsterAttribute {
  Light = "LIGHT",
  Dark = "DARK",
  Earth = "EARTH",
  Wind = "WIND",
  Fire = "FIRE",
  Water = "WATER",
}

export const enum MonsterType {
  Normal = "normal",
  Effect = "effect",
  Fusion = "fusion",
  Tuner = "tuner",
  Dragon = "dragon",
  Warrior = "warrior",
}

export const enum BattlePosition {
  Attack = "attack",
  Defence = "defence",
  Set = "set",
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

export const enum Place {
  Hand = "hand",
  Field = "field",
  Deck = "deck",
  ExtraDeck = "extra deck",
  Graveyard = "graveyard",
}

export const enum MoveMethod {
  Added = "added",
  Drawn = "drawn",
  DestroyedByBattle = "destroyed by battle",
  DestroyedByEffect = "destroyed by effect",
  Discarded = "discarded",
  Returned = "returned",
  Sent = "sent",
  Tributed = "tributed",
  Activated = "activated",
  NormalSummoned = "normal summoned",
  Set = "set",
  TributeSummoned = "tribute summoned",
  TributeSet = "tribute set",
  SpecialSummoned = "special summoned",
}

export const enum TargetMethod {
  Attack = "attack",
  Effect = "effect",
}

export const enum LifePointsChangeMethod {
  Battle = "battle",
  Effect = "effect",
}

export const enum BattlePositionChangeMethod {
  Normal = "normal",
  Effect = "effect",
}
