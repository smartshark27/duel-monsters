import { CardFace } from "../../src/enums";
import CardLoader from "../../src/game/CardLoader";
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

test("Call of the Haunted can be activated and is destroyed when monster is destroyed", () => {
  const callOfTheHaunted = CardLoader.load("Call of the Haunted", player1);
  const blueEyesWhiteDragon = CardLoader.load(
    "Blue-Eyes White Dragon",
    player1
  );
  const mirrorForce = CardLoader.load("Mirror Force", player2);

  player1.graveyard.push(blueEyesWhiteDragon);
  blueEyesWhiteDragon.visibility = CardFace.Up;

  player1.field.spellTrapZones[0].card = callOfTheHaunted;
  callOfTheHaunted.set();
  duel.turn++;

  const activationActions = duel.performAction();
  expect(activationActions.length).toEqual(2);

  const monsterSelectActions = duel.performAction(activationActions[0]);
  expect(monsterSelectActions.length).toEqual(1);
  expect(callOfTheHaunted.visibility).toEqual(CardFace.Up);

  const zoneSelectActions = duel.performAction(monsterSelectActions[0]);
  expect(zoneSelectActions.length).toEqual(5);

  const attackActions = duel.performAction(zoneSelectActions[0]);
  expect(attackActions.length).toEqual(2);
  expect(player1.field.monsterZones[0].card).toEqual(blueEyesWhiteDragon);
  expect(player1.field.spellTrapZones[0].card).toEqual(callOfTheHaunted);
  expect(player1.graveyard.length).toEqual(0);

  const attackTargetActions = duel.performAction(attackActions[0]);
  expect(attackTargetActions.length).toEqual(1);

  player2.field.spellTrapZones[0].card = mirrorForce;
  mirrorForce.set();
  duel.turn++;

  const mirrorForceActivationActions = duel.performAction(
    attackTargetActions[0]
  );
  expect(mirrorForceActivationActions.length).toEqual(2);

  duel.performAction(mirrorForceActivationActions[0]);
  expect(player1.field.monsterZones[0].card).toBeNull();
  expect(player1.field.spellTrapZones[0].card).toBeNull();
});

test("Call of the Haunted can be activated and monster is destroyed when it is destroyed", () => {
  const callOfTheHaunted = CardLoader.load("Call of the Haunted", player1);
  const blueEyesWhiteDragon = CardLoader.load(
    "Blue-Eyes White Dragon",
    player1
  );
  const harpiesFeatherDuster = CardLoader.load(
    "Harpie's Feather Duster",
    player2
  );

  player1.graveyard.push(blueEyesWhiteDragon);
  blueEyesWhiteDragon.visibility = CardFace.Up;

  player1.field.spellTrapZones[0].card = callOfTheHaunted;
  callOfTheHaunted.set();
  duel.turn++;

  const activationActions = duel.performAction();
  expect(activationActions.length).toEqual(2);

  const monsterSelectActions = duel.performAction(activationActions[0]);
  expect(monsterSelectActions.length).toEqual(1);
  expect(callOfTheHaunted.visibility).toEqual(CardFace.Up);

  const zoneSelectActions = duel.performAction(monsterSelectActions[0]);
  expect(zoneSelectActions.length).toEqual(5);

  const attackActions = duel.performAction(zoneSelectActions[0]);
  expect(attackActions.length).toEqual(2);
  expect(player1.field.monsterZones[0].card).toEqual(blueEyesWhiteDragon);
  expect(player1.field.spellTrapZones[0].card).toEqual(callOfTheHaunted);
  expect(player1.graveyard.length).toEqual(0);

  player2.setDeck(new Deck([harpiesFeatherDuster]));

  const drawActions = duel.performAction(attackActions[1]);
  expect(drawActions.length).toEqual(1);

  const destroyActions = duel.performAction(drawActions[0]);
  expect(destroyActions.length).toEqual(3);

  const destroyZoneSelectActions = duel.performAction(destroyActions[1]);
  expect(destroyZoneSelectActions.length).toEqual(5);

  duel.performAction(destroyZoneSelectActions[0]);
  expect(player1.field.monsterZones[0].card).toBeNull();
  expect(player1.field.spellTrapZones[0].card).toBeNull();
});
