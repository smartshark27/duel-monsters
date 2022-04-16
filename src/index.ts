import Deck from "./modules/Deck";
import Duel from "./modules/Duel";
import Player from "./modules/Player";

const player1 = new Player("Tom");
const player2 = new Player("Thomas");

const deck1 = new Deck(player1, "dragon_rage");
const deck2 = new Deck(player2, "dragon_rage");

player1.setDeck(deck1);
player2.setDeck(deck2);

global.DUEL = new Duel([player1, player2]);
global.DUEL.init();
global.DUEL.start();
