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

test("Elemental HERO Bubbleman can be special summoned from hand", () => {
  const elementalHeroBubbleman = CardLoader.load(
    "Elemental HERO Bubbleman",
    player1
  );
  const elementalHeroAvian = CardLoader.load("Elemental HERO Avian", player1);

  player1.hand = [elementalHeroAvian, elementalHeroBubbleman];
  player1.normalSummonsRemaining = 1;

  const avianNormalSummonActions = duel.performAction();
  expect(avianNormalSummonActions.length).toEqual(3);

  const avianPositionSelectActions = duel.performAction(
    avianNormalSummonActions[0]
  );
  expect(avianPositionSelectActions.length).toEqual(2);

  const avianZoneSelectActions = duel.performAction(
    avianPositionSelectActions[0]
  );
  expect(avianZoneSelectActions.length).toEqual(5);

  const specialSummonActions = duel.performAction(avianZoneSelectActions[0]);
  expect(specialSummonActions.length).toEqual(2);
  expect(player1.field.monsterZones[0].card).toEqual(elementalHeroAvian);
  expect(player1.hand.length).toEqual(1);

  const bubblemanPositionSelectActions = duel.performAction(
    specialSummonActions[0]
  );
  expect(bubblemanPositionSelectActions.length).toEqual(2);

  const bubblemanZoneSelectActions = duel.performAction(
    bubblemanPositionSelectActions[1]
  );
  expect(bubblemanZoneSelectActions.length).toEqual(4);

  duel.performAction(bubblemanZoneSelectActions[0]);
  expect(player1.field.monsterZones[1].card).toEqual(elementalHeroBubbleman);
  expect(player1.hand.length).toEqual(0);
});

test("Elemental HERO Bubbleman allows player to draw 2 cards when summoned as the only card", () => {
  const elementalHeroBubbleman = CardLoader.load(
    "Elemental HERO Bubbleman",
    player1
  );
  const elementalHeroAvian = CardLoader.load("Elemental HERO Avian", player1);
  const elementalHeroBurstinatrix = CardLoader.load(
    "Elemental HERO Burstinatrix",
    player1
  );

  player1.hand.push(elementalHeroBubbleman);
  player1.normalSummonsRemaining = 1;
  player1.deck = new Deck([elementalHeroAvian, elementalHeroBurstinatrix]);

  const normalSummonActions = duel.performAction();
  expect(normalSummonActions.length).toEqual(3);

  const positionSelectActions = duel.performAction(normalSummonActions[0]);
  expect(positionSelectActions.length).toEqual(2);

  const zoneSelectActions = duel.performAction(positionSelectActions[0]);
  expect(zoneSelectActions.length).toEqual(5);

  const activationActions = duel.performAction(zoneSelectActions[0]);
  expect(activationActions.length).toEqual(2);
  expect(player1.field.monsterZones[0].card).toEqual(elementalHeroBubbleman);
  expect(player1.hand.length).toEqual(0);

  duel.performAction(activationActions[0]);
  expect(player1.field.monsterZones[0].card).toEqual(elementalHeroBubbleman);
  expect(player1.hand.length).toEqual(2);
  expect(player1.hand).toContain(elementalHeroAvian);
  expect(player1.hand).toContain(elementalHeroBurstinatrix);
});
