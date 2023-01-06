import { Coordinates } from './sprite';

export class Tile {
  public coordinates: Coordinates = { x: 0, y: 0 };
  public width: number;
  public height: number;
  public image: HTMLImageElement;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    image: HTMLImageElement
  ) {
    this.coordinates.x = x;
    this.coordinates.y = y;
    this.width = width;
    this.height = height;
    this.image = image;
  }
}
