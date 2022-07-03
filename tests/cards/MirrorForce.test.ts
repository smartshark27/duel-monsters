import CardLoader from "../../src/game/CardLoader";
import Duel from "../../src/game/Duel";
import Monster from "../../src/game/cards/Monster";
import Player from "../../src/game/Player";
import { BattlePosition } from "../../src/enums";
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

test("Mirror Force can be activated and destroys attack position monsters", () => {
  const mirrorForce = CardLoader.load("Mirror Force", player1);
  const redEyesBlackDragon = CardLoader.load(
    "Red-Eyes Black Dragon",
    player2
  ) as Monster;
  const lusterDragon = CardLoader.load("Luster Dragon", player2);

  player1.hand.push(mirrorForce);
  player2.deck = new Deck([lusterDragon]);
  player2.field.monsterZones[0].card = redEyesBlackDragon;
  redEyesBlackDragon.setPosition(BattlePosition.Defence);

  const setActions = duel.performAction();
  expect(setActions.length).toEqual(2);

  const zoneSelectActions = duel.performAction(setActions[0]);
  expect(zoneSelectActions.length).toEqual(5);

  const drawActions = duel.performAction(zoneSelectActions[0]);
  expect(drawActions.length).toEqual(1);

  const summonActions = duel.performAction(drawActions[0]);
  expect(summonActions.length).toEqual(3);

  const positionSelectActions = duel.performAction(summonActions[0]);
  expect(positionSelectActions.length).toEqual(2);

  const monsterZoneSelectActions = duel.performAction(positionSelectActions[0]);
  expect(monsterZoneSelectActions.length).toEqual(4);

  const passActions = duel.performAction(monsterZoneSelectActions[0]);
  expect(passActions.length).toEqual(2);

  const attackActions = duel.performAction(passActions[1]);
  expect(attackActions.length).toEqual(2);

  const attackTargetActions = duel.performAction(attackActions[0]);
  expect(attackTargetActions.length).toEqual(1);

  const activationActions = duel.performAction(attackTargetActions[0]);
  expect(activationActions.length).toEqual(2);

  duel.performAction(activationActions[0]);
  expect(player2.field.monsterZones[0].card).toEqual(redEyesBlackDragon);
  expect(player2.field.monsterZones[1].card).toBeNull();
  expect(player2.graveyard).toContain(lusterDragon);
  expect(player1.field.spellTrapZones[0].card).toBeNull();
  expect(player1.graveyard).toContain(mirrorForce);
});
