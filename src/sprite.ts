import { DirectionType } from './controls';
import { SurfaceType } from './game';
import { Movement } from './movement';

export type Coordinates = {
  x: number;
  y: number;
};

export class Sprite {
  public coordinates: Coordinates = { x: 0, y: 0 };
  public previousCoordinates: Coordinates = { x: 0, y: 0 };
  public width: number;
  public height: number;
  public color: string;
  public acceleration: Coordinates = { x: 0, y: 0 };
  public velocity: Coordinates = { x: 0, y: 0 };
  surfacesCollided: { sprite: Sprite; surface: SurfaceType }[] = [];
  surfacesTouched: { sprite: Sprite; surface: SurfaceType }[] = [];
  movement: Movement;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    dex = 0,
    weight = 0
  ) {
    this.color = color;
    this.movement = new Movement(x, y, width, height, dex, weight);

    this.coordinates = this.movement.coordinates;
    this.previousCoordinates = this.movement.previousCoordinates;
    this.width = this.movement.width;
    this.height = this.movement.height;
    this.acceleration = this.movement.acceleration;
    this.velocity = this.movement.velocity;
    this.surfacesCollided = this.movement.surfacesCollided;
    this.surfacesTouched = this.movement.surfacesTouched;
  }

  public updateSurfacesCollided(
    surfaces: { sprite: Sprite; surface: SurfaceType }[]
  ) {
    this.movement.updateSurfacesCollided(surfaces);
  }

  public updateSurfacesTouched(
    surfaces: { sprite: Sprite; surface: SurfaceType }[]
  ) {
    this.movement.updateSurfacesTouched(surfaces);
  }

  public update(direction: DirectionType) {
    this.movement.update(direction);
  }

  public move() {
    this.movement.move();
  }
}
