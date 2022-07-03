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

test("Drowning Mirror Force can be activated and shuffles attack position monsters into deck", () => {
  const drowningMirrorForce = CardLoader.load("Drowning Mirror Force", player1);
  const elementalHeroAvian = CardLoader.load(
    "Elemental HERO Avian",
    player1
  ) as Monster;
  const blueEyesWhiteDragon = CardLoader.load(
    "Blue-Eyes White Dragon",
    player2
  ) as Monster;
  const redEyesBlackDragon = CardLoader.load(
    "Red-Eyes Black Dragon",
    player2
  ) as Monster;
  const lusterDragon = CardLoader.load("Luster Dragon", player2);

  player1.hand.push(drowningMirrorForce);
  player2.deck = new Deck([lusterDragon]);
  player2.field.monsterZones[0].card = blueEyesWhiteDragon;
  blueEyesWhiteDragon.setPosition(BattlePosition.Attack);
  player2.field.monsterZones[1].card = redEyesBlackDragon;
  redEyesBlackDragon.setPosition(BattlePosition.Defence);

  const setActions = duel.performAction();
  expect(setActions.length).toEqual(2);

  const zoneSelectActions = duel.performAction(setActions[0]);
  expect(zoneSelectActions.length).toEqual(5);

  const drawActions = duel.performAction(zoneSelectActions[0]);
  expect(drawActions.length).toEqual(1);

  const summonActions = duel.performAction(drawActions[0]);
  expect(summonActions.length).toEqual(4);

  const positionSelectActions = duel.performAction(summonActions[0]);
  expect(positionSelectActions.length).toEqual(2);

  const monsterZoneSelectActions = duel.performAction(positionSelectActions[0]);
  expect(monsterZoneSelectActions.length).toEqual(3);

  const passActions = duel.performAction(monsterZoneSelectActions[0]);
  expect(passActions.length).toEqual(3);

  player1.field.monsterZones[0].card = elementalHeroAvian;
  elementalHeroAvian.setPosition(BattlePosition.Set);

  const attackActions = duel.performAction(passActions[2]);
  expect(attackActions.length).toEqual(3);

  const attackTargetActions = duel.performAction(attackActions[0]);
  expect(attackTargetActions.length).toEqual(1);

  const directAttackActions = duel.performAction(attackTargetActions[0]);
  expect(directAttackActions.length).toEqual(2);

  const directAttackTargetActions = duel.performAction(directAttackActions[0]);
  expect(directAttackTargetActions.length).toEqual(1);

  const activationActions = duel.performAction(directAttackTargetActions[0]);
  expect(activationActions.length).toEqual(2);

  duel.performAction(activationActions[0]);
  expect(player2.field.monsterZones[0].card).toBeNull();
  expect(player2.field.monsterZones[1].card).toEqual(redEyesBlackDragon);
  expect(player2.field.monsterZones[2].card).toBeNull();
  expect(player2.deck.cards).toContain(blueEyesWhiteDragon);
  expect(player2.deck.cards).toContain(lusterDragon);
  expect(player1.field.spellTrapZones[0].card).toBeNull();
  expect(player1.graveyard).toContain(drowningMirrorForce);
});
