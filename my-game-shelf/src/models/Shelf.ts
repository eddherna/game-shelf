import type GameInfo from "./GameInfo.ts";

export default interface Shelf {
    gamesInfo: GameInfo[]
    genres: Set<string>
}