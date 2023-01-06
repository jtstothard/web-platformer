import { DirectionType } from './controls';
import { SurfaceType } from './';
import { Movement } from './movement';
import { Tile } from './tile';

export type Coordinates = {
  x: number;
  y: number;
};

const states = ['idle', 'run', 'jump'] as const;

export type StateType = typeof states[number];

export class Sprite {
  public coordinates: Coordinates;
  public previousCoordinates: Coordinates;
  public width: number;
  public height: number;
  public acceleration: Coordinates;
  public velocity: Coordinates;
  public state: StateType = 'idle';
  public previousState: StateType = 'idle';
  public direction: 'left' | 'right' = 'right';
  public sprites?: { [key in StateType]: HTMLImageElement[] };
  surfacesCollided: { sprite: Tile; surface: SurfaceType }[] = [];
  surfacesTouched: { sprite: Tile; surface: SurfaceType }[] = [];
  movement: Movement;
  maxWidth = 0;
  maxHeight = 0;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    dex = 0,
    weight = 0,
    sprites?: { [key in StateType]: HTMLImageElement[] },
    maxWidth = 0,
    maxHeight = 0
  ) {
    this.maxWidth = maxWidth;
    this.maxHeight = maxHeight;
    this.movement = new Movement(
      x,
      y,
      width,
      height,
      dex,
      weight,
      maxWidth,
      maxHeight
    );

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

  resetState(surfaces: { sprite: Tile; surface: SurfaceType }[]) {
    this.previousState = this.state;
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
    surfaces: { sprite: Tile; surface: SurfaceType }[]
  ) {
    this.resetState(surfaces);
    this.movement.updateSurfacesCollided(surfaces);
  }

  public updateSurfacesTouched(
    surfaces: { sprite: Tile; surface: SurfaceType }[]
  ) {
    this.resetState(surfaces);
    this.movement.updateSurfacesTouched(surfaces);
  }

  public update(direction: DirectionType) {
    this.previousState = this.state;
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
    this.coordinates = this.movement.coordinates;
    this.previousCoordinates = this.movement.previousCoordinates;
    this.velocity = this.movement.velocity;
    this.acceleration = this.movement.acceleration;
  }
}
