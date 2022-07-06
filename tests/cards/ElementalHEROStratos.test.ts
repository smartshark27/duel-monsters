import { BattlePosition } from "../../src/enums";
import CardLoader from "../../src/game/CardLoader";
import Monster from "../../src/game/cards/Monster";
import Deck from "../../src/game/Deck";
import Duel from "../../src/game/Duel";
import Player from "../../src/game/Player";

let player1: Player;
let player2: Player;
let duel: Duel;

beforeEach(() => {
  player1 = new Player("1");
  player2 = new Player("2");
  duel = new Duel([player1, player2]);
  global.DUEL = duel;
});

test("Elemental HERO Stratos can destroy spell and traps", () => {
  const elementalHeroStratos = CardLoader.load(
    "Elemental HERO Stratos",
    player1
  );
  const elementalHeroAvian = CardLoader.load(
    "Elemental HERO Avian",
    player1
  ) as Monster;
  const elementalHeroBurstinatrix = CardLoader.load(
    "Elemental HERO Burstinatrix",
    player1
  ) as Monster;
  const elementalHeroClayman = CardLoader.load(
    "Elemental HERO Clayman",
    player1
  );
  const monsterReborn = CardLoader.load("Monster Reborn", player2);
  const mirrorForce = CardLoader.load("Mirror Force", player2);

  player1.hand.push(elementalHeroStratos);
  player1.field.monsterZones[0].card = elementalHeroAvian;
  elementalHeroAvian.setPosition(BattlePosition.Attack);
  player1.field.monsterZones[1].card = elementalHeroBurstinatrix;
  elementalHeroBurstinatrix.setPosition(BattlePosition.Defence);
  player1.deck = new Deck([elementalHeroClayman]);
  player1.normalSummonsRemaining = 1;
  player2.field.spellTrapZones[0].card = monsterReborn;
  monsterReborn.set();
  player2.field.spellTrapZones[1].card = mirrorForce;
  mirrorForce.set();

  const summonActions = duel.performAction();
  expect(summonActions).toHaveLength(2);

  const positionSelectActions = duel.performAction(summonActions[0]);
  expect(positionSelectActions).toHaveLength(2);

  const zoneSelectActions = duel.performAction(positionSelectActions[0]);
  expect(zoneSelectActions).toHaveLength(3);

  const activationActions = duel.performAction(zoneSelectActions[0]);
  expect(activationActions).toHaveLength(3);
  expect(player1.field.monsterZones[2].card).toBe(elementalHeroStratos);
  expect(player1.hand).toHaveLength(0);

  const target1SelectActions = duel.performAction(activationActions[0]);
  expect(target1SelectActions).toHaveLength(2);

  const target2SelectActions = duel.performAction(target1SelectActions[0]);
  expect(target2SelectActions).toHaveLength(1);

  duel.performAction(target2SelectActions[0]);
  expect(player2.field.spellTrapZones[0].card).toBeNull();
  expect(player2.field.spellTrapZones[1].card).toBeNull();
  expect(player2.graveyard).toContain(monsterReborn);
  expect(player2.graveyard).toContain(mirrorForce);
});

test("Elemental HERO Stratos can add HERO monster to hand when summoned", () => {
  const elementalHeroStratos = CardLoader.load(
    "Elemental HERO Stratos",
    player1
  );
  const elementalHeroAvian = CardLoader.load(
    "Elemental HERO Avian",
    player1
  ) as Monster;
  const elementalHeroBurstinatrix = CardLoader.load(
    "Elemental HERO Burstinatrix",
    player1
  ) as Monster;

  player1.hand.push(elementalHeroStratos);
  player1.deck = new Deck([elementalHeroAvian, elementalHeroBurstinatrix]);
  player1.normalSummonsRemaining = 1;

  const summonActions = duel.performAction();
  expect(summonActions).toHaveLength(2);

  const positionSelectActions = duel.performAction(summonActions[0]);
  expect(positionSelectActions).toHaveLength(2);

  const zoneSelectActions = duel.performAction(positionSelectActions[0]);
  expect(zoneSelectActions).toHaveLength(5);

  const activationActions = duel.performAction(zoneSelectActions[0]);
  expect(activationActions).toHaveLength(2);
  expect(player1.field.monsterZones[0].card).toBe(elementalHeroStratos);
  expect(player1.hand).toHaveLength(0);

  const targetSelectActions = duel.performAction(activationActions[0]);
  expect(targetSelectActions).toHaveLength(2);

  duel.performAction(targetSelectActions[0]);
  expect(player1.hand).toEqual([elementalHeroAvian]);
  expect(player1.deck.cards).toEqual([elementalHeroBurstinatrix])
});
