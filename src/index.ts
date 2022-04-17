import { Phase } from "./enums";
import Deck from "./modules/Deck";
import Duel from "./modules/Duel";
import Player from "./modules/Player";
import Util from "./util/Util";

const player1 = new Player("Tom");
const player2 = new Player("Thomas");

const deck1 = new Deck(player1, "dragon_rage");
const deck2 = new Deck(player2, "dragon_rage");

player1.setDeck(deck1);
player2.setDeck(deck2);

const duel = new Duel([player1, player2]);
global.DUEL = duel

autoRun(duel);
duel.printResults();

function autoRun(duel: Duel) {
  let actions = duel.getActions();
  while (duel.running) {
    while (actions.length > 0) {
      const action = Util.getRandomItemFromArray(actions);
      duel.performAction(action);
      if (!duel.running) break;
      actions = duel.getActions();
    }
    if (!duel.running) break;
    if (duel.phase === Phase.End) duel.switchTurns();
    duel.startNextPhase();
    actions = duel.getActivePlayer().getActions();
  }
}