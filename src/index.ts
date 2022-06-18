import Deck from "./game/Deck";
import Duel from "./game/Duel";
import Player from "./game/Player";
import Input from "./utils/Input";
import Utils from "./utils/Utils";

const player1 = new Player("Top");
const player2 = new Player("Bottom");

const deck1 = new Deck(player1, "elemental_hero");
const deck2 = new Deck(player2, "dragon_rage");

player1.setDeck(deck1);
player2.setDeck(deck2);

const duel = new Duel([player1, player2]);
global.DUEL = duel;

run(duel, Input.checkFlag("auto"));

async function run(duel: Duel, auto: boolean) {
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
