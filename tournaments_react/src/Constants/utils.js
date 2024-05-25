
export const BYE = '$BYE$'

export function getSwissRounds(numPlayers) {
    if (numPlayers >= 4 && numPlayers <= 8) {
        return 3;
    } else if (numPlayers >= 9 && numPlayers <= 12) {
        return 4;
    } else if (numPlayers >= 13 && numPlayers <= 20) {
        return 5;
    } else if (numPlayers >= 21 && numPlayers <= 32) {
        return 5;
    } else if (numPlayers >= 33 && numPlayers <= 64) {
        return 6;
    } else if (numPlayers >= 65 && numPlayers <= 128) {
        return 7;
    } else if (numPlayers >= 129 && numPlayers <= 226) {
        return 8;
    } else if (numPlayers >= 227 && numPlayers <= 409) {
        return 9;
    } else {
        return 10; // For 410+ players
    }
}