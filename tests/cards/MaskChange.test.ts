import CardLoader from "../../src/game/CardLoader";
import Duel from "../../src/game/Duel";
import Player from "../../src/game/Player";
import Monster from "../../src/game/cards/Monster";
import { BattlePosition, CardFace } from "../../src/enums";
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

test("Mask Change can be activated from hand", () => {
  const maskChange = CardLoader.load("Mask Change", player1);
  const bubbleman = CardLoader.load(
    "Elemental HERO Bubbleman",
    player1
  ) as Monster;
  const avian = CardLoader.load("Elemental HERO Avian", player1) as Monster;
  const maskedHEROAcid = CardLoader.load(
    "Masked HERO Acid",
    player1
  ) as Monster;

  player1.hand.push(maskChange);
  player1.field.monsterZones[0].card = bubbleman;
  bubbleman.setPosition(BattlePosition.Defence);
  player1.field.monsterZones[1].card = avian;
  avian.setPosition(BattlePosition.Attack);
  player1.extraDeck.push(maskedHEROAcid);

  const activationActions = duel.performAction();
  expect(activationActions.length).toEqual(3);

  const zoneSelectActions = duel.performAction(activationActions[1]);
  expect(zoneSelectActions.length).toEqual(5);

  const heroSelectActions = duel.performAction(zoneSelectActions[0]);
  expect(heroSelectActions.length).toEqual(1);

  const maskSelectActions = duel.performAction(heroSelectActions[0]);
  expect(maskSelectActions.length).toEqual(1);

  const maskZoneSelectActions = duel.performAction(maskSelectActions[0]);
  expect(maskZoneSelectActions.length).toEqual(4);

  const positionSelectActions = duel.performAction(maskZoneSelectActions[0]);
  expect(positionSelectActions.length).toEqual(2);

  duel.performAction(positionSelectActions[0]);
  expect(player1.field.monsterZones[0].card).toBe(maskedHEROAcid);
  expect(player1.hand).toHaveLength(0);
  expect(player1.field.spellTrapZones[0].card).toBeNull();
  expect(player1.graveyard).toContain(bubbleman);
  expect(player1.graveyard).toContain(maskChange);
  expect(player1.graveyard).toHaveLength(2);
  expect(player1.extraDeck).toHaveLength(0);
});

test("Mask Change can be activated during opponent's turn", () => {
  const maskChange = CardLoader.load("Mask Change", player1);
  const bubbleman = CardLoader.load(
    "Elemental HERO Bubbleman",
    player1
  ) as Monster;
  const maskedHEROAcid = CardLoader.load(
    "Masked HERO Acid",
    player1
  ) as Monster;
  const lusterDragon = CardLoader.load("Luster Dragon", player1);

  player1.hand.push(maskChange);
  player1.field.monsterZones[0].card = bubbleman;
  bubbleman.setPosition(BattlePosition.Defence);
  player1.extraDeck.push(maskedHEROAcid);
  player2.deck = new Deck([lusterDragon]);

  const setActions = duel.performAction();
  expect(setActions.length).toEqual(3);

  const zoneSelectActions = duel.performAction(setActions[0]);
  expect(zoneSelectActions.length).toEqual(5);

  const drawActions = duel.performAction(zoneSelectActions[0]);
  expect(drawActions.length).toEqual(1);
  expect(player1.field.spellTrapZones[0].card).toBe(maskChange);
  expect(maskChange.visibility).toBe(CardFace.Down);

  const activationActions = duel.performAction(drawActions[0]);
  expect(activationActions.length).toEqual(2);

  const heroSelectActions = duel.performAction(activationActions[0]);
  expect(heroSelectActions.length).toEqual(1);

  const maskSelectActions = duel.performAction(heroSelectActions[0]);
  expect(maskSelectActions.length).toEqual(1);

  const maskZoneSelectActions = duel.performAction(maskSelectActions[0]);
  expect(maskZoneSelectActions.length).toEqual(5);

  const positionSelectActions = duel.performAction(maskZoneSelectActions[0]);
  expect(positionSelectActions.length).toEqual(2);

  duel.performAction(positionSelectActions[0]);
  expect(player1.field.monsterZones[0].card).toBe(maskedHEROAcid);
  expect(player1.hand).toHaveLength(0);
  expect(player1.field.spellTrapZones[0].card).toBeNull();
  expect(player1.graveyard).toContain(bubbleman);
  expect(player1.graveyard).toContain(maskChange);
  expect(player1.graveyard).toHaveLength(2);
  expect(player1.extraDeck).toHaveLength(0);
});
