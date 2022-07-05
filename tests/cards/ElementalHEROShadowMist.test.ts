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

test("Elemental HERO Shadow Mist can add change card to hand when special summoned", () => {
  const elementalHeroShadowMist = CardLoader.load(
    "Elemental HERO Shadow Mist",
    player1
  );
  const maskChange = CardLoader.load("Mask Change", player1);
  const monsterReborn = CardLoader.load("Monster Reborn", player1);
  const raigeki = CardLoader.load("Raigeki", player1);

  player1.graveyard.push(elementalHeroShadowMist);
  player1.deck = new Deck([maskChange, raigeki]);
  player1.hand.push(monsterReborn);

  const spellActivationActions = duel.performAction();
  expect(spellActivationActions.length).toEqual(3);

  const spellActivationZoneSelectActions = duel.performAction(
    spellActivationActions[1]
  );
  expect(spellActivationZoneSelectActions.length).toEqual(5);

  const monsterSelectActions = duel.performAction(
    spellActivationZoneSelectActions[0]
  );
  expect(monsterSelectActions.length).toEqual(1);

  const monsterZoneSelectActions = duel.performAction(monsterSelectActions[0]);
  expect(monsterZoneSelectActions.length).toEqual(5);

  const positionSelectActions = duel.performAction(monsterZoneSelectActions[0]);
  expect(positionSelectActions.length).toEqual(2);

  const activationActions = duel.performAction(positionSelectActions[1]);
  expect(activationActions.length).toEqual(2);
  expect(player1.field.monsterZones[0].card).toEqual(elementalHeroShadowMist);

  const changeTargetActions = duel.performAction(activationActions[0]);
  expect(changeTargetActions.length).toEqual(1);

  duel.performAction(changeTargetActions[0]);
  expect(player1.field.monsterZones[0].card).toEqual(elementalHeroShadowMist);
  expect(player1.hand).toEqual([maskChange]);
});

test("Elemental HERO Shadow Mist can add HERO monster to hand after sent to graveyard", () => {
  const elementalHeroShadowMist = CardLoader.load(
    "Elemental HERO Shadow Mist",
    player1
  ) as Monster;
  const elementalHeroAvian = CardLoader.load("Elemental HERO Avian", player1);
  const mirrorForce = CardLoader.load("Mirror Force", player2);

  player1.hand.push(elementalHeroShadowMist);
  player1.deck = new Deck([elementalHeroAvian]);
  player1.normalSummonsRemaining = 1;
  player2.field.spellTrapZones[0].card = mirrorForce;
  mirrorForce.set();
  duel.turn++;

  const normalSummonActions = duel.performAction();
  expect(normalSummonActions.length).toEqual(2);

  const positionSelectActions = duel.performAction(
    normalSummonActions[0]
  );
  expect(positionSelectActions.length).toEqual(2);

  const zoneSelectActions = duel.performAction(
    positionSelectActions[0]
  );
  expect(zoneSelectActions.length).toEqual(5);

  const attackActions = duel.performAction(zoneSelectActions[0]);
  expect(attackActions.length).toEqual(2);
  expect(player1.field.monsterZones[0].card).toEqual(elementalHeroShadowMist);

  const attackTargetActions = duel.performAction(attackActions[0]);
  expect(attackTargetActions.length).toEqual(1);

  const trapActivationActions = duel.performAction(attackTargetActions[0]);
  expect(trapActivationActions.length).toEqual(2);

  const activationActions = duel.performAction(trapActivationActions[0]);
  expect(activationActions.length).toEqual(2);
  expect(player1.field.monsterZones[0].card).toBeNull();
  expect(player1.graveyard).toEqual([elementalHeroShadowMist]);

  const chooseTargetActions = duel.performAction(activationActions[0]);
  expect(chooseTargetActions.length).toEqual(1);

  duel.performAction(chooseTargetActions[0]);
  expect(player1.hand).toEqual([elementalHeroAvian]);
});
