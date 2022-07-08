import CardLoader from "../../src/game/CardLoader";
import Duel from "../../src/game/Duel";
import Player from "../../src/game/Player";
import Deck from "../../src/game/Deck";

let player1: Player;
let player2: Player;
let duel: Duel;

beforeEach(() => {
  player1 = new Player("1");
  player2 = new Player("2");
  duel = new Duel([player1, player2]);
  global.DUEL = duel;
});

test("Forced Back can return monster back to hand", () => {
  const forcedBack = CardLoader.load("Forced Back", player1);
  const lusterDragon = CardLoader.load("Luster Dragon", player2);

  player1.hand.push(forcedBack);
  player2.deck = new Deck([lusterDragon]);

  const setActions = duel.performAction();
  expect(setActions.length).toEqual(2);

  const zoneSelectActions = duel.performAction(setActions[0]);
  expect(zoneSelectActions.length).toEqual(5);

  const drawActions = duel.performAction(zoneSelectActions[0]);
  expect(drawActions.length).toEqual(1);

  const summonActions = duel.performAction(drawActions[0]);
  expect(summonActions.length).toEqual(2);

  const positionSelectActions = duel.performAction(summonActions[0]);
  expect(positionSelectActions.length).toEqual(2);

  const monsterZoneSelectActions = duel.performAction(positionSelectActions[0]);
  expect(monsterZoneSelectActions.length).toEqual(5);

  const activationActions = duel.performAction(monsterZoneSelectActions[0]);
  expect(activationActions.length).toEqual(2);

  duel.performAction(activationActions[0]);
  expect(player2.field.monsterZones[0].card).toBeNull();
  expect(player2.hand).toContain(lusterDragon);
  expect(player1.field.spellTrapZones[0].card).toBeNull();
  expect(player1.graveyard).toContain(forcedBack);
});
