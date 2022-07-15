import CardLoader from "../../src/game/CardLoader";
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

test("Mystical Space Typhoon can be activated from hand", () => {
  const mysticalSpaceTyphoon = CardLoader.load(
    "Mystical Space Typhoon",
    player1
  );
  const mirrorForce = CardLoader.load("Mirror Force", player2);
  const monsterReborn = CardLoader.load("Monster Reborn", player2);

  player1.hand = [mysticalSpaceTyphoon];
  player2.field.spellTrapZones[0].card = mirrorForce;
  mirrorForce.set();
  player2.field.spellTrapZones[1].card = monsterReborn;
  monsterReborn.set();

  const activationActions = duel.performAction();
  expect(activationActions.length).toEqual(3);

  const zoneSelectActions = duel.performAction(activationActions[1]);
  expect(zoneSelectActions.length).toEqual(5);

  const targetActions = duel.performAction(zoneSelectActions[0]);
  expect(targetActions.length).toEqual(2);
  expect(player1.hand).toHaveLength(0);

  duel.performAction(targetActions[0]);
  expect(player1.field.spellTrapZones[0].card).toBeNull();
  expect(player1.graveyard).toEqual([mysticalSpaceTyphoon]);
  expect(player2.graveyard).toEqual([mirrorForce]);
  expect(player2.field.spellTrapZones[0].card).toBeNull();
  expect(player2.field.spellTrapZones[1].card).toBe(monsterReborn);
});

test("Mystical Space Typhoon can be activated from set position", () => {
  const mysticalSpaceTyphoon = CardLoader.load(
    "Mystical Space Typhoon",
    player1
  );
  const mirrorForce = CardLoader.load("Mirror Force", player2);
  const monsterReborn = CardLoader.load("Monster Reborn", player2);

  player1.field.spellTrapZones[0].card = mysticalSpaceTyphoon;
  mysticalSpaceTyphoon.set();
  duel.turn++;
  player2.field.spellTrapZones[0].card = mirrorForce;
  mirrorForce.set();
  player2.field.spellTrapZones[1].card = monsterReborn;
  monsterReborn.set();

  const activationActions = duel.performAction();
  expect(activationActions.length).toEqual(2);

  const targetActions = duel.performAction(activationActions[0]);
  expect(targetActions.length).toEqual(2);

  duel.performAction(targetActions[0]);
  expect(player1.field.spellTrapZones[0].card).toBeNull();
  expect(player1.graveyard).toEqual([mysticalSpaceTyphoon]);
  expect(player2.graveyard).toEqual([mirrorForce]);
  expect(player2.field.spellTrapZones[0].card).toBeNull();
  expect(player2.field.spellTrapZones[1].card).toBe(monsterReborn);
});
