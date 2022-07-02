import { CardFace } from "../../src/enums";
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

test("Call of the Haunted can be activated from set position", () => {
  const callOfTheHaunted = CardLoader.load("Call of the Haunted", player1);
  const blueEyesWhiteDragon = CardLoader.load(
    "Blue-Eyes White Dragon",
    player1
  );

  player1.graveyard.push(blueEyesWhiteDragon);
  blueEyesWhiteDragon.visibility = CardFace.Up;

  player1.field.spellTrapZones[0].card = callOfTheHaunted;
  callOfTheHaunted.set();
  duel.turn++;

  const openActions = duel.performAction();
  expect(openActions.length).toEqual(2);

  const monsterSelectActions = duel.performAction(openActions[0]);
  expect(monsterSelectActions.length).toEqual(1);
  expect(callOfTheHaunted.visibility).toEqual(CardFace.Up);

  const zoneSelectActions = duel.performAction(monsterSelectActions[0]);
  expect(zoneSelectActions.length).toEqual(5);
  
  duel.performAction(zoneSelectActions[0]);
  expect(player1.field.monsterZones[0].card).toEqual(blueEyesWhiteDragon);
  expect(player1.field.spellTrapZones[0].card).toEqual(callOfTheHaunted);
  expect(player1.graveyard.length).toEqual(0);
});
