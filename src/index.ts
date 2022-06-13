import Deck from "./game/Deck";
import Duel from "./game/Duel";
import Player from "./game/Player";
import Utils from "./utils/Utils";
import Input from "./utils/Input";

const player1 = new Player("Top");
const player2 = new Player("Bottom");

const deck1 = new Deck(player1, "elemental_hero");
const deck2 = new Deck(player2, "dragon_rage");

player1.setDeck(deck1);
player2.setDeck(deck2);

const duel = new Duel([player1, player2]);
global.DUEL = duel;

run(duel, Input.checkFlag("step"));

async function run(duel: Duel, step = false) {
  let actions = duel.performAction();
  while (actions.length > 0) {
    if (step) {
      await Input.getUserInput("Proceed?");
    }
    const action = Utils.getRandomItemFromArray(actions);
    actions = duel.performAction(action);
  }
}
