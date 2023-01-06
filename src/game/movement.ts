import { DirectionType } from './controls';
import { SurfaceType } from './';
import { Coordinates } from './sprite';
import { Tile } from './tile';

export class Movement {
  public coordinates: Coordinates = { x: 0, y: 0 };
  public previousCoordinates: Coordinates = { x: 0, y: 0 };
  public width: number;
  public height: number;
  public acceleration: Coordinates = { x: 0, y: 0 };
  public velocity: Coordinates = { x: 0, y: 0 };
  public dex: number;
  public weight: number;
  surfacesCollided: { sprite: Tile; surface: SurfaceType }[] = [];
  surfacesTouched: { sprite: Tile; surface: SurfaceType }[] = [];
  isTouchingFloor = false;
  maxWidth = 0;
  maxHeight = 0;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    dex = 0,
    weight = 0,
    maxWidth = 0,
    maxHeight = 0
  ) {
    this.coordinates.x = x;
    this.coordinates.y = y;
    this.width = width;
    this.height = height;
    this.dex = dex;
    this.weight = weight;
    this.maxWidth = maxWidth;
    this.maxHeight = maxHeight;
  }

  public updateSurfacesCollided(
    surfaces: { sprite: Tile; surface: SurfaceType }[]
  ) {
    this.surfacesCollided = surfaces;
  }

  public updateSurfacesTouched(
    surfaces: { sprite: Tile; surface: SurfaceType }[]
  ) {
    this.surfacesTouched = surfaces;
  }

  public update(direction: DirectionType) {
    switch (direction) {
      case 'up':
        // only jump if sprite is on a surface
        if (this.isTouchingFloor) {
          this.acceleration.y = -this.dex * 20;
        }
        break;
      case 'left':
        this.acceleration.x = -this.dex * 2;
        break;
      case 'right':
        this.acceleration.x = this.dex * 2;
        break;
      case 'stop':
        this.acceleration.x = 0;
        break;
      default:
        break;
    }
  }

  public move() {
    this.previousCoordinates = { ...this.coordinates };

    this.isTouchingFloor = this.checkIfTouchingFloor();

    const maxVelocity = this.dex * 10;

    // apply velocity
    this.velocity.x += this.acceleration.x;
    this.velocity.y += this.acceleration.y;

    // max velocity
    if (this.velocity.x > maxVelocity) {
      this.velocity.x = maxVelocity;
    }
    if (this.velocity.x < -maxVelocity) {
      this.velocity.x = -maxVelocity;
    }
    if (this.velocity.y > this.weight * 10) {
      this.velocity.y = this.weight * 10;
    }
    if (this.velocity.y < -this.weight * 10) {
      this.velocity.y = -this.weight * 10;
    }
    // apply velocity to coordinates if not touching a surface in that direction and deal with collisions
    if (
      !this.surfacesTouched.some((s) => s.surface === 'left') &&
      this.velocity.x > 0
    ) {
      this.coordinates.x += this.velocity.x;
    }
    if (
      !this.surfacesTouched.some((s) => s.surface === 'top') &&
      this.velocity.y > 0
    ) {
      this.coordinates.y += this.velocity.y;
    }
    if (
      !this.surfacesTouched.some((s) => s.surface === 'right') &&
      this.velocity.x < 0
    ) {
      this.coordinates.x += this.velocity.x;
    }
    if (
      !this.surfacesTouched.some((s) => s.surface === 'bottom') &&
      this.velocity.y < 0
    ) {
      this.coordinates.y += this.velocity.y;
    }
    // calculate friction and air resistance
    const friction = 0.9;
    const airResistance = 0.99;
    if (this.isTouchingFloor) {
      this.velocity.x *= friction;
    }
    this.velocity.x *= airResistance;

    const gravity = this.weight * 0.5;
    // apply gravity
    if (!this.isTouchingFloor) {
      this.acceleration.y = gravity;
    }

    // handle collisions and translations
    this.surfacesCollided.forEach(({ sprite, surface }) => {
      switch (surface) {
        case 'top':
          this.previousCoordinates.y = sprite.coordinates.y - this.height;
          this.coordinates.y = sprite.coordinates.y - this.height;
          this.velocity.y = 0;
          this.acceleration.y = 0;
          break;
        case 'bottom':
          this.coordinates.y = sprite.coordinates.y + sprite.height;
          this.velocity.y = 0;
          this.acceleration.y = 0;
          break;
        case 'left':
          this.coordinates.x = sprite.coordinates.x - this.width;
          this.velocity.x = 0;
          this.acceleration.x = 0;
          break;
        case 'right':
          this.coordinates.x = sprite.coordinates.x + sprite.width;
          this.velocity.x = 0;
          this.acceleration.x = 0;
          break;
        default:
          break;
      }
    });

    // check if sprite is on the left wall
    if (this.coordinates.x <= 0) {
      this.coordinates.x = 0;
      this.velocity.x = 0;
    }

    // check if sprite is on the right wall
    if (this.coordinates.x + this.width >= this.maxWidth) {
      this.coordinates.x = this.maxWidth - this.width;
      this.velocity.x = 0;
    }

    // check if sprite is on the top wall
    if (this.coordinates.y <= 0) {
      this.coordinates.y = 0;
      this.velocity.y = 0;
    }

    // check if sprite is on the bottom wall
    if (this.coordinates.y + this.height >= this.maxHeight) {
      this.coordinates.y = this.maxHeight - this.height;
      this.velocity.y = 0;
    }
  }

  checkIfTouchingFloor() {
    return (
      this.surfacesTouched.filter(({ surface }) => {
        return surface === 'top';
      }).length > 0 ||
      this.surfacesCollided.filter(({ surface }) => {
        return surface === 'top';
      }).length > 0
    );
  }
}
