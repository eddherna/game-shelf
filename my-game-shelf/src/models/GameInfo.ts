export default interface GameInfo {
  id: number;
  title: string;
  image: string;
  platform: string;
  genres: string[];
  finished: boolean;
}

export function createGameInfo(
  id: number,
  title: string,
  image: string,
  platform: string,
  genres: string[],
  finished: boolean
): GameInfo {
  return { id, title, image, platform, genres, finished } as GameInfo;
}