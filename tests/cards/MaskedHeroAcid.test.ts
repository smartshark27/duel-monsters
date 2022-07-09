import CardLoader from "../../src/game/CardLoader";
import Duel from "../../src/game/Duel";
import Player from "../../src/game/Player";
import Monster from "../../src/game/cards/Monster";
import { BattlePosition } from "../../src/enums";

let player1: Player;
let player2: Player;
let duel: Duel;

beforeEach(() => {
  player1 = new Player("1");
  player2 = new Player("2");
  duel = new Duel([player1, player2]);
  global.DUEL = duel;
});

test("Masked Hero Acid can be special summoned and activates", () => {
  const maskedHEROAcid = CardLoader.load(
    "Masked HERO Acid",
    player1
  ) as Monster;
  const maskChange = CardLoader.load("Mask Change", player1);
  const bubbleman = CardLoader.load(
    "Elemental HERO Bubbleman",
    player1
  ) as Monster;
  const lusterDragon = CardLoader.load("Luster Dragon", player1) as Monster;
  const monsterReborn = CardLoader.load("Monster Reborn", player2) as Monster;
  const mirrorForce = CardLoader.load("Mirror Force", player2) as Monster;

  player1.extraDeck.push(maskedHEROAcid);
  player1.hand.push(maskChange);
  player1.field.monsterZones[0].card = bubbleman;
  bubbleman.setPosition(BattlePosition.Attack);
  player2.field.monsterZones[0].card = lusterDragon;
  lusterDragon.setPosition(BattlePosition.Attack);
  player2.field.spellTrapZones[0].card = monsterReborn;
  monsterReborn.set();
  player2.field.spellTrapZones[1].card = mirrorForce;
  mirrorForce.set();

  const maskChangeActivationActions = duel.performAction();
  expect(maskChangeActivationActions.length).toEqual(3);

  const zoneSelectActions = duel.performAction(maskChangeActivationActions[1]);
  expect(zoneSelectActions.length).toEqual(5);

  const heroSelectActions = duel.performAction(zoneSelectActions[0]);
  expect(heroSelectActions.length).toEqual(1);

  const maskSelectActions = duel.performAction(heroSelectActions[0]);
  expect(maskSelectActions.length).toEqual(1);

  const maskZoneSelectActions = duel.performAction(maskSelectActions[0]);
  expect(maskZoneSelectActions.length).toEqual(5);

  const positionSelectActions = duel.performAction(maskZoneSelectActions[0]);
  expect(positionSelectActions.length).toEqual(2);

  const activationActions = duel.performAction(positionSelectActions[0]);
  expect(positionSelectActions.length).toEqual(2);
  expect(player1.field.monsterZones[0].card).toBe(maskedHEROAcid);
  expect(player1.hand).toHaveLength(0);
  expect(player1.field.spellTrapZones[0].card).toBeNull();
  expect(player1.graveyard).toContain(bubbleman);
  expect(player1.graveyard).toContain(maskChange);
  expect(player1.graveyard).toHaveLength(2);
  expect(player1.extraDeck).toHaveLength(0);

  duel.performAction(activationActions[0]);
  expect(player2.field.getFreeSpellTrapZones()).toHaveLength(5);
  expect(player2.graveyard).toContain(monsterReborn);
  expect(player2.graveyard).toContain(mirrorForce);
  expect(player2.graveyard).toHaveLength(2);
  expect(lusterDragon.attackPoints).toEqual(1600);
});
