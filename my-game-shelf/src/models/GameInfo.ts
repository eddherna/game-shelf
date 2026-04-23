export default class GameInfo {
  id: number;
  title: string;
  image: string;
  platform: string;
  genres: string[];
  finished: boolean;

  constructor(id: number, title: string, image: string, platform: string, genres: string[], finished: boolean) {
    this.id = id;
    this.title = title;
    this.image = image;
    this.platform = platform;
    this.genres = genres;
    this.finished = finished;
  }
}