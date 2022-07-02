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

test("E - Emergency Call can be activated from hand", () => {
  const eEmergencyCall = CardLoader.load("E - Emergency Call", player1);
  const elementalHeroAvian = CardLoader.load("Elemental HERO Avian", player1);
  player1.setDeck(new Deck([elementalHeroAvian]));
  player1.hand = [eEmergencyCall];

  const openActions = duel.performAction();
  expect(openActions.length).toEqual(3);

  const zoneSelectActions = duel.performAction(openActions[1]);
  expect(zoneSelectActions.length).toEqual(5);

  const heroSelectActions = duel.performAction(zoneSelectActions[0]);
  expect(heroSelectActions.length).toEqual(1);
  expect(eEmergencyCall.visibility).toEqual(CardFace.Up);
  expect(eEmergencyCall.isOnField()).toEqual(true);
  expect(player1.hand.length).toEqual(0);
  expect(player1.field.spellTrapZones[0].card).toEqual(eEmergencyCall);

  duel.performAction(heroSelectActions[0]);
  expect(player1.hand).toEqual([elementalHeroAvian]);
  expect(player1.deck?.cards.length).toEqual(0);
  expect(player1.field.spellTrapZones[0].card).toBeNull();
  expect(player1.graveyard).toEqual([eEmergencyCall]);
});

test("E - Emergency Call can be activated from set position", () => {
  const eEmergencyCall = CardLoader.load("E - Emergency Call", player1);
  const elementalHeroAvian = CardLoader.load("Elemental HERO Avian", player1);
  player1.setDeck(new Deck([elementalHeroAvian]));

  player1.field.spellTrapZones[0].card = eEmergencyCall;
  eEmergencyCall.set();
  duel.turn++;

  const openActions = duel.performAction();
  expect(openActions.length).toEqual(2);

  const heroSelectActions = duel.performAction(openActions[0]);
  expect(heroSelectActions.length).toEqual(1);
  expect(eEmergencyCall.visibility).toEqual(CardFace.Up);

  duel.performAction(heroSelectActions[0]);
  expect(player1.hand).toEqual([elementalHeroAvian]);
  expect(player1.deck?.cards.length).toEqual(0);
  expect(player1.field.spellTrapZones[0].card).toBeNull();
  expect(player1.graveyard).toEqual([eEmergencyCall]);
});
