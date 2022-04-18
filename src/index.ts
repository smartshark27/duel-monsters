import { Phase } from "./enums";
import Deck from "./modules/Deck";
import Duel from "./modules/Duel";
import Player from "./modules/Player";
import Util from "./util/Util";
import Input from "./util/Input";
import Action from "./modules/actions/Action";
import LoggerFactory from "./util/LoggerFactory";
import EndPhase from "./modules/actions/EndPhase";

const logger = LoggerFactory.getLogger("index");

const player1 = new Player("Tom");
const player2 = new Player("Thomas");

const deck1 = new Deck(player1, "dragon_rage");
const deck2 = new Deck(player2, "dragon_rage");

player1.setDeck(deck1);
player2.setDeck(deck2);

const duel = new Duel([player1, player2]);
global.DUEL = duel;

run(duel, Input.checkFlag("--step"));

async function run(duel: Duel, step = false) {
  let actions = duel.getActions();
  while (duel.running) {
    if (step) {
      logActions(actions);
      await Input.getUserInput("Proceed?");
    }
    const action = Util.getRandomItemFromArray(actions);
    duel.performAction(action);
    if (!duel.running) break;
    actions = duel.getActions();
  }
  duel.printResults();
}

function logActions(actions: Action[]): void {
  logger.info(`Actions are [${actions}]`);
}
