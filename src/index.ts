import Deck from "./game/Deck";
import Duel from "./game/Duel";
import File from "./utils/File";
import Player from "./game/Player";
import Input from "./utils/Input";
import Utils from "./utils/Utils";
import CardLoader from "./game/CardLoader";

const DECK_1_NAME = "elemental_hero";
const DECK_2_NAME = "dragon_rage";

const player1 = new Player("Top");
const player2 = new Player("Bottom");

const cardNames1 = File.read(`./decks/${DECK_1_NAME}.txt`)
  .split("\n")
  .map((name) => CardLoader.load(name, player1));
const cardNames2 = File.read(`./decks/${DECK_2_NAME}.txt`)
  .split("\n")
  .map((name) => CardLoader.load(name, player2));
const deck1 = new Deck(cardNames1);
const deck2 = new Deck(cardNames2);
player1.setDeck(deck1);
player2.setDeck(deck2);

const duel = new Duel([player1, player2]);
global.DUEL = duel;

run(duel, Input.checkFlag("auto"));

async function run(duel: Duel, auto: boolean) {
  duel.start();
  let actions = duel.performAction();

  while (actions.length > 0) {
    if (auto) {
      const action = Utils.getRandomItemFromArray(actions);
      actions = duel.performAction(action);
    } else {
      await Input.getUserInput("Select an action: ", (input) => {
        const index: number = parseInt(input);

        const action =
          index >= 1 && index <= actions.length
            ? actions[index - 1]
            : Utils.getRandomItemFromArray(actions);

        actions = duel.performAction(action);
      });
    }
  }
}
