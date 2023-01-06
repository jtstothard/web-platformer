import { Sprite } from './sprite';
import { Tile } from './tile';

export type BackgroundType = {
  element: HTMLImageElement;
  distance: number;
};

export class Map {
  public width: number;
  public height: number;
  public tiles: Tile[] = [];
  public sprites: Sprite[] = [];
  public backgrounds: BackgroundType[] = [];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public addTile(tile: Tile) {
    this.tiles.push(tile);
  }

  public addSprite(sprite: Sprite) {
    this.sprites.push(sprite);
  }

  public addBackground(background: HTMLImageElement, distance: number) {
    this.backgrounds.push({ element: background, distance });
    this.backgrounds.sort((a, b) => a.distance - b.distance);
  }
}
