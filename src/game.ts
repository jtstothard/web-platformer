export const surfaceValues = ['top', 'bottom', 'left', 'right'] as const;
export type SurfaceType = typeof surfaceValues[number];

import { Controls } from './controls';
import { Drawing } from './draw';
import { Sprite } from './sprite';
import { Map } from './map';

export class Game {
  private player: Sprite;
  drawing: Drawing;
  map: Map;

  constructor(canvas: HTMLCanvasElement) {
    const dimensions = canvas.getBoundingClientRect();
    const maxWidth = dimensions.width;
    const maxHeight = dimensions.height;
    // create player sprite in the middle of the screen
    this.player = new Sprite(
      maxWidth / 2,
      maxHeight / 2,
      50,
      50,
      'red',
      0.5,
      1
    );

    // create ground sprite
    const ground = new Sprite(0, maxHeight - 50, maxWidth, 50, 'green');

    // create platform stairs sprite
    const platforms = [];
    for (let i = 0; i < 10; i++) {
      platforms.push(
        new Sprite(100 + i * 50, maxHeight - 100 - i * 50, 50, 50, 'blue')
      );
    }

    new Controls(this.player.update.bind(this.player));

    this.drawing = new Drawing(canvas);
    this.map = new Map(maxWidth, maxHeight);

    this.map.addTile(ground);
    this.map.addSprite(this.player);

    platforms.forEach((platform) => {
      this.map.addTile(platform);
    });
  }

  public start() {
    this.drawing.draw([...this.map.tiles, ...this.map.sprites]);
    requestAnimationFrame(() => this.update());
  }

  // add continuous movement
  public move() {
    this.player.move();
  }

  // find the surface that the player is touching
  public whichSurfaceTouchingWith(a: Sprite, b: Sprite) {
    if (
      a.coordinates.x < b.coordinates.x + b.width &&
      a.coordinates.x + a.width > b.coordinates.x
    ) {
      if (a.coordinates.y === b.coordinates.y + b.height) return 'bottom';
      if (a.coordinates.y + a.height === b.coordinates.y) return 'top';
    }

    if (
      a.coordinates.y < b.coordinates.y + b.height &&
      a.coordinates.y + a.height > b.coordinates.y
    ) {
      if (a.coordinates.x === b.coordinates.x + b.width) return 'right';
      if (a.coordinates.x + a.width === b.coordinates.x) return 'left';
    }

    return null;
  }

  public whichSurfaceCollidingWith(a: Sprite, b: Sprite) {
    const aTop = a.coordinates.y;
    const aBottom = a.coordinates.y + a.height;
    const aLeft = a.coordinates.x;
    const aRight = a.coordinates.x + a.width;

    const a2Top = a.previousCoordinates.y;
    const a2Bottom = a.previousCoordinates.y + a.height;
    const a2Left = a.previousCoordinates.x;
    const a2Right = a.previousCoordinates.x + a.width;

    const bTop = b.coordinates.y;
    const bBottom = b.coordinates.y + b.height;
    const bLeft = b.coordinates.x;
    const bRight = b.coordinates.x + b.width;

    const isColliding =
      aBottom > bTop && aTop < bBottom && aRight > bLeft && aLeft < bRight;

    if (isColliding) {
      let timeToCollisionList: { surface: SurfaceType; time: number }[] = [];
      // Assuming a is the player and b is the surface
      // based on the player's previous coordinates and the velocity, we can determine which side of the player is touching the surface
      if (a.velocity.x >= 0) {
        // player is moving right
        const timeToCollision = (bLeft - a2Right) / a.velocity.x || 0;
        timeToCollisionList.push({ surface: 'left', time: timeToCollision });
      } else if (a.velocity.x <= 0) {
        // player is moving left
        const timeToCollision = (a2Left - bRight) / a.velocity.x || 0;
        timeToCollisionList.push({ surface: 'right', time: timeToCollision });
      }

      if (a.velocity.y >= 0) {
        // player is moving down
        const timeToCollision = (bTop - a2Bottom) / a.velocity.y || 0;
        timeToCollisionList.push({ surface: 'top', time: timeToCollision });
      } else if (a.velocity.y <= 0) {
        // player is moving up
        const timeToCollision = (a2Top - bBottom) / a.velocity.y || 0;
        timeToCollisionList.push({ surface: 'bottom', time: timeToCollision });
      }

      // return the surface with the smallest time to collision (only positive values less than infinity)
      const res = timeToCollisionList
        .filter((t) => t.time >= 0 && t.time < Infinity)
        .sort((a, b) => a.time - b.time)[0];

      return res?.surface || null;
    }
    return null;
  }

  public update() {
    requestAnimationFrame(() => this.update());
    this.move();
    this.drawing.draw([...this.map.tiles, ...this.map.sprites]);

    // check if player is touching a surface
    const surfacesTouched = this.map.tiles.reduce((acc, surface) => {
      const colliding = this.whichSurfaceTouchingWith(this.player, surface);
      if (colliding) {
        acc.push({ sprite: surface, surface: colliding });
      }
      return acc;
    }, [] as { sprite: Sprite; surface: SurfaceType }[]);

    this.player.updateSurfacesTouched(surfacesTouched);

    // check if player is colliding with a surface
    const surfacesCollided = this.map.tiles.reduce((acc, surface) => {
      const colliding = this.whichSurfaceCollidingWith(this.player, surface);
      if (colliding) {
        acc.push({ sprite: surface, surface: colliding });
      }
      return acc;
    }, [] as { sprite: Sprite; surface: SurfaceType }[]);

    this.player.updateSurfacesCollided(surfacesCollided);
  }
}
