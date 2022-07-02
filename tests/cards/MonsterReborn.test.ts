import { BattlePosition, CardFace } from "../../src/enums";
import CardLoader from "../../src/game/CardLoader";
import Monster from "../../src/game/cards/Monster";
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

test("Monster Reborn can be activated from hand", () => {
  const monsterReborn = CardLoader.load("Monster Reborn", player1);
  const redEyesBlackDragon = CardLoader.load(
    "Red-Eyes Black Dragon",
    player1
  ) as Monster;
  player1.graveyard.push(redEyesBlackDragon);
  player1.hand = [monsterReborn];

  const activationActions = duel.performAction();
  expect(activationActions.length).toEqual(3);

  const zoneSelectActions = duel.performAction(activationActions[1]);
  expect(zoneSelectActions.length).toEqual(5);

  const monsterSelectActions = duel.performAction(zoneSelectActions[0]);
  expect(monsterSelectActions.length).toEqual(1);
  expect(monsterReborn.visibility).toEqual(CardFace.Up);
  expect(monsterReborn.isOnField()).toEqual(true);
  expect(player1.hand.length).toEqual(0);
  expect(player1.field.spellTrapZones[0].card).toEqual(monsterReborn);

  const monsterZoneSelectActions = duel.performAction(monsterSelectActions[0]);
  expect(monsterZoneSelectActions.length).toEqual(5);

  const positionSelectActions = duel.performAction(monsterZoneSelectActions[0]);
  expect(positionSelectActions.length).toEqual(2);

  duel.performAction(positionSelectActions[0]);
  expect(player1.field.monsterZones[0].card).toEqual(redEyesBlackDragon);
  expect(redEyesBlackDragon.visibility).toEqual(CardFace.Up);
  expect(redEyesBlackDragon.position).toEqual(BattlePosition.Attack);
  expect(player1.graveyard.length).toEqual(1);
  expect(player1.field.spellTrapZones[0].card).toBeNull();
  expect(player1.graveyard).toEqual([monsterReborn]);
});

test("Monster Reborn can be activated from set position and summon opponent's monster", () => {
  const monsterReborn = CardLoader.load("Monster Reborn", player1);
  const redEyesBlackDragon = CardLoader.load(
    "Red-Eyes Black Dragon",
    player2
  ) as Monster;
  player2.graveyard.push(redEyesBlackDragon);

  player1.field.spellTrapZones[0].card = monsterReborn;
  monsterReborn.set();
  duel.turn++;

  const activationActions = duel.performAction();
  expect(activationActions.length).toEqual(2);

  const monsterSelectActions = duel.performAction(activationActions[0]);
  expect(monsterSelectActions.length).toEqual(1);
  expect(monsterReborn.visibility).toEqual(CardFace.Up);

  const zoneSelectActions = duel.performAction(monsterSelectActions[0]);
  expect(zoneSelectActions.length).toEqual(5);

  const positionSelectActions = duel.performAction(zoneSelectActions[0]);
  expect(positionSelectActions.length).toEqual(2);

  duel.performAction(positionSelectActions[1]);
  expect(player1.field.monsterZones[0].card).toEqual(redEyesBlackDragon);
  expect(redEyesBlackDragon.visibility).toEqual(CardFace.Up);
  expect(redEyesBlackDragon.position).toEqual(BattlePosition.Defence);
  expect(redEyesBlackDragon.controller).toEqual(player1);
  expect(player2.graveyard.length).toEqual(0);
  expect(player1.field.spellTrapZones[0].card).toBeNull();
  expect(player1.graveyard).toEqual([monsterReborn]);
});
