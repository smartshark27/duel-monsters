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

test("Harpie's Feather Duster can be activated from hand", () => {
  const harpiesFeatherDuster = CardLoader.load(
    "Harpie's Feather Duster",
    player1
  );
  const mirrorForce = CardLoader.load("Mirror Force", player2);
  const monsterReborn = CardLoader.load("Monster Reborn", player2);

  player1.hand = [harpiesFeatherDuster];
  player2.field.spellTrapZones[0].card = mirrorForce;
  mirrorForce.set();
  player2.field.spellTrapZones[1].card = monsterReborn;
  monsterReborn.set();

  const activationActions = duel.performAction();
  expect(activationActions.length).toEqual(3);

  const zoneSelectActions = duel.performAction(activationActions[1]);
  expect(zoneSelectActions.length).toEqual(5);

  duel.performAction(zoneSelectActions[0]);
  expect(player2.field.getFreeSpellTrapZones().length).toEqual(5);
  expect(player2.graveyard.length).toEqual(2);
  expect(player2.graveyard).toContain(mirrorForce);
  expect(player2.graveyard).toContain(monsterReborn);
  expect(player1.graveyard.length).toEqual(1);
  expect(player1.field.spellTrapZones[0].card).toBeNull();
  expect(player1.graveyard).toEqual([harpiesFeatherDuster]);
});

test("Harpie's Feather Duster can be activated from set position", () => {
  const harpiesFeatherDuster = CardLoader.load(
    "Harpie's Feather Duster",
    player1
  );
  const mirrorForce = CardLoader.load("Mirror Force", player2);
  const monsterReborn = CardLoader.load("Monster Reborn", player2);

  player1.field.spellTrapZones[0].card = harpiesFeatherDuster;
  harpiesFeatherDuster.set();
  duel.turn++;
  player2.field.spellTrapZones[0].card = mirrorForce;
  mirrorForce.set();
  player2.field.spellTrapZones[1].card = monsterReborn;
  monsterReborn.set();

  const activationActions = duel.performAction();
  expect(activationActions.length).toEqual(2);

  duel.performAction(activationActions[0]);
  expect(player2.field.getFreeMonsterZones().length).toEqual(5);
  expect(player2.graveyard.length).toEqual(2);
  expect(player2.graveyard).toContain(mirrorForce);
  expect(player2.graveyard).toContain(monsterReborn);
  expect(player1.graveyard.length).toEqual(1);
  expect(player1.field.spellTrapZones[0].card).toBeNull();
  expect(player1.graveyard).toEqual([harpiesFeatherDuster]);
});
