import { Sprite } from './sprite';

type Tile = Sprite;

export class Map {
  public width: number;
  public height: number;
  public tiles: Tile[] = [];
  public sprites: Sprite[] = [];

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
}
