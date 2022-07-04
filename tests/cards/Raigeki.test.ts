import { BattlePosition } from "../../src/enums";
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

test("Raigeki can be activated from hand", () => {
  const raigeki = CardLoader.load("Raigeki", player1);
  const blueEyesWhiteDragon = CardLoader.load(
    "Blue-Eyes White Dragon",
    player2
  ) as Monster;
  const redEyesBlackDragon = CardLoader.load(
    "Red-Eyes Black Dragon",
    player2
  ) as Monster;

  player1.hand = [raigeki];
  player2.field.monsterZones[0].card = blueEyesWhiteDragon;
  blueEyesWhiteDragon.setPosition(BattlePosition.Attack);
  player2.field.monsterZones[1].card = redEyesBlackDragon;
  redEyesBlackDragon.setPosition(BattlePosition.Set);

  const activationActions = duel.performAction();
  expect(activationActions.length).toEqual(3);

  const zoneSelectActions = duel.performAction(activationActions[1]);
  expect(zoneSelectActions.length).toEqual(5);

  duel.performAction(zoneSelectActions[0]);
  expect(player2.field.getFreeMonsterZones().length).toEqual(5);
  expect(player2.graveyard.length).toEqual(2);
  expect(player2.graveyard).toContain(blueEyesWhiteDragon);
  expect(player2.graveyard).toContain(redEyesBlackDragon);
  expect(player1.graveyard.length).toEqual(1);
  expect(player1.field.spellTrapZones[0].card).toBeNull();
  expect(player1.graveyard).toEqual([raigeki]);
});

test("Raigeki can be activated from set position", () => {
  const raigeki = CardLoader.load("Raigeki", player1);
  const blueEyesWhiteDragon = CardLoader.load(
    "Blue-Eyes White Dragon",
    player2
  ) as Monster;
  const redEyesBlackDragon = CardLoader.load(
    "Red-Eyes Black Dragon",
    player2
  ) as Monster;

  player1.field.spellTrapZones[0].card = raigeki;
  raigeki.set();
  duel.turn++;
  player2.field.monsterZones[0].card = blueEyesWhiteDragon;
  blueEyesWhiteDragon.setPosition(BattlePosition.Attack);
  player2.field.monsterZones[1].card = redEyesBlackDragon;
  redEyesBlackDragon.setPosition(BattlePosition.Set);

  const activationActions = duel.performAction();
  expect(activationActions.length).toEqual(2);

  duel.performAction(activationActions[0]);
  expect(player2.field.getFreeMonsterZones().length).toEqual(5);
  expect(player2.graveyard.length).toEqual(2);
  expect(player2.graveyard).toContain(blueEyesWhiteDragon);
  expect(player2.graveyard).toContain(redEyesBlackDragon);
  expect(player1.graveyard.length).toEqual(1);
  expect(player1.field.spellTrapZones[0].card).toBeNull();
  expect(player1.graveyard).toEqual([raigeki]);
});
