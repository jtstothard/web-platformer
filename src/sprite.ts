import { DirectionType } from './controls';
import { SurfaceType } from './game';
import { Movement } from './movement';

export type Coordinates = {
  x: number;
  y: number;
};

const states = ['idle', 'run', 'jump'] as const;

export type StateType = typeof states[number];

export class Sprite {
  public coordinates: Coordinates = { x: 0, y: 0 };
  public previousCoordinates: Coordinates = { x: 0, y: 0 };
  public width: number;
  public height: number;
  public color: string;
  public acceleration: Coordinates = { x: 0, y: 0 };
  public velocity: Coordinates = { x: 0, y: 0 };
  public state: StateType = 'idle';
  public direction: 'left' | 'right' = 'right';
  public sprites?: { [key in StateType]: HTMLImageElement[] };
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
    weight = 0,
    sprites?: { [key in StateType]: HTMLImageElement[] }
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
    if (sprites) {
      this.sprites = sprites;
    }
  }

  resetState(surfaces: { sprite: Sprite; surface: SurfaceType }[]) {
    const isTouchingFloor = this.movement.isTouchingFloor;

    const willBeTouchingFloor = surfaces.some(
      ({ surface }) => surface === 'top'
    );

    if (!isTouchingFloor && willBeTouchingFloor) {
      if (
        this.movement.velocity.x === 0 ||
        this.movement.acceleration.x === 0
      ) {
        this.state = 'idle';
      } else {
        this.state = 'run';
      }
    }
  }

  public updateSurfacesCollided(
    surfaces: { sprite: Sprite; surface: SurfaceType }[]
  ) {
    this.resetState(surfaces);
    this.movement.updateSurfacesCollided(surfaces);
  }

  public updateSurfacesTouched(
    surfaces: { sprite: Sprite; surface: SurfaceType }[]
  ) {
    this.resetState(surfaces);
    this.movement.updateSurfacesTouched(surfaces);
  }

  public update(direction: DirectionType) {
    this.movement.update(direction);
    if (direction === 'left') {
      this.state = 'run';
      this.direction = 'left';
    }
    if (direction === 'right') {
      this.state = 'run';
      this.direction = 'right';
    }
    if (direction === 'up') {
      this.state = 'jump';
    }
    if (direction === 'stop') {
      this.state = 'idle';
    }
  }

  public move() {
    this.movement.move();
  }
}
