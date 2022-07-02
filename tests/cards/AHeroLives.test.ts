import { BattlePosition, CardFace } from "../../src/enums";
import CardLoader from "../../src/game/CardLoader";
import Monster from "../../src/game/cards/Monster";
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

test("A Hero Lives can be activated from hand", () => {
  const aHeroLives = CardLoader.load("A Hero Lives", player1);
  const elementalHeroAvian = CardLoader.load(
    "Elemental HERO Avian",
    player1
  ) as Monster;
  player1.setDeck(new Deck([elementalHeroAvian]));
  player1.hand = [aHeroLives];

  const activationActions = duel.performAction();
  expect(activationActions.length).toEqual(3);

  const zoneSelectActions = duel.performAction(activationActions[1]);
  expect(zoneSelectActions.length).toEqual(5);

  const heroSelectActions = duel.performAction(zoneSelectActions[0]);
  expect(heroSelectActions.length).toEqual(1);
  expect(aHeroLives.visibility).toEqual(CardFace.Up);
  expect(aHeroLives.isOnField()).toEqual(true);
  expect(player1.hand.length).toEqual(0);
  expect(player1.field.spellTrapZones[0].card).toEqual(aHeroLives);

  const heroZoneSelectActions = duel.performAction(heroSelectActions[0]);
  expect(heroZoneSelectActions.length).toEqual(5);

  const heroPositionSelectActions = duel.performAction(
    heroZoneSelectActions[0]
  );
  expect(heroPositionSelectActions.length).toEqual(2);

  duel.performAction(heroPositionSelectActions[0]);
  expect(player1.field.monsterZones[0].card).toEqual(elementalHeroAvian);
  expect(elementalHeroAvian.visibility).toEqual(CardFace.Up);
  expect(elementalHeroAvian.position).toEqual(BattlePosition.Attack);
  expect(player1.deck?.cards.length).toEqual(0);
  expect(player1.field.spellTrapZones[0].card).toBeNull();
  expect(player1.graveyard).toEqual([aHeroLives]);
});

test("A Hero Lives can be activated from set position", () => {
  const aHeroLives = CardLoader.load("A Hero Lives", player1);
  const elementalHeroAvian = CardLoader.load(
    "Elemental HERO Avian",
    player1
  ) as Monster;
  player1.setDeck(new Deck([elementalHeroAvian]));

  player1.field.spellTrapZones[0].card = aHeroLives;
  aHeroLives.set();
  duel.turn++;

  const activationActions = duel.performAction();
  expect(activationActions.length).toEqual(2);

  const heroSelectActions = duel.performAction(activationActions[0]);
  expect(heroSelectActions.length).toEqual(1);
  expect(aHeroLives.visibility).toEqual(CardFace.Up);

  const heroZoneSelectActions = duel.performAction(heroSelectActions[0]);
  expect(heroZoneSelectActions.length).toEqual(5);

  const heroPositionSelectActions = duel.performAction(
    heroZoneSelectActions[0]
  );
  expect(heroPositionSelectActions.length).toEqual(2);

  duel.performAction(heroPositionSelectActions[0]);
  expect(player1.field.monsterZones[0].card).toEqual(elementalHeroAvian);
  expect(elementalHeroAvian.visibility).toEqual(CardFace.Up);
  expect(elementalHeroAvian.position).toEqual(BattlePosition.Attack);
  expect(player1.deck?.cards.length).toEqual(0);
  expect(player1.field.spellTrapZones[0].card).toBeNull();
  expect(player1.graveyard).toEqual([aHeroLives]);
});
