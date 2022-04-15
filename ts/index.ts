import Deck from "./modules/Deck";
import Duel from "./modules/Duel";

const deck1 = new Deck("dragon_rage");
const deck2 = new Deck("dragon_rage");

new Duel(deck1, deck2);
