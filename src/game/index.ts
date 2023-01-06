export const surfaceValues = ['top', 'bottom', 'left', 'right'] as const;
export type SurfaceType = typeof surfaceValues[number];

import { Controls } from './controls';
import { Drawing } from './draw';
import { Sprite, StateType } from './sprite';
import { Map } from './map';

import { ImageLoader } from './ImageLoader';
import { Tile } from './tile';

import groundTile from '../assets/tiles/ground.png';

export class Game {
  private player?: Sprite;
  private maxWidth: number;
  private maxHeight: number;
  drawing: Drawing;
  map: Map;

  constructor(canvas: HTMLCanvasElement) {
    const dimensions = canvas.getBoundingClientRect();
    this.maxWidth = dimensions.width * 12;
    this.maxHeight = dimensions.height;
    this.map = new Map(this.maxWidth, this.maxHeight);
    this.drawing = new Drawing(canvas, this.map.width, this.map.height);

    this.init();
  }

  public async init() {
    const idleLoader = new ImageLoader('sprites/player/idle/');
    const runLoader = new ImageLoader('sprites/player/run/');
    const jumpLoader = new ImageLoader('sprites/player/jump/');
    const backgroundLoader = new ImageLoader('background/', 'png');

    const sprites: { [key in StateType]: HTMLImageElement[] } = {
      idle: await idleLoader.images,
      run: await runLoader.images,
      jump: await jumpLoader.images,
    };

    const height = 100;
    const spritesWidth = sprites.idle[0].width;
    const spritesHeight = sprites.idle[0].height;
    const aspectRatio = (spritesWidth || 1) / (spritesHeight || 1);
    const width = height * aspectRatio;

    this.player = new Sprite(
      this.drawing.canvas.width / 2,
      this.maxHeight / 2,
      width,
      height,
      'red',
      0.5,
      1,
      sprites,
      this.maxWidth,
      this.maxHeight
    );

    const groundImage = new Image();
    groundImage.src = groundTile;

    // create ground tile
    const ground = new Tile(
      0,
      this.maxHeight - 50,
      this.maxWidth,
      50,
      groundImage
    );

    new Controls(this.player.update.bind(this.player));

    this.map.addTile(ground);
    this.map.addSprite(this.player);

    (await backgroundLoader.images).forEach((image, i) => {
      this.map.addBackground(image, i);
    });
  }

  public start() {
    if (this.player)
      this.drawing.draw(
        this.map.sprites,
        this.map.tiles,
        this.map.backgrounds,
        this.player.coordinates
      );
    requestAnimationFrame(() => this.update());
  }

  // add continuous movement
  public move() {
    this.player?.move();
  }

  // find the surface that the player is touching
  public whichSurfaceTouchingWith(sprite: Sprite, tile: Tile) {
    if (
      sprite.coordinates.x < tile.coordinates.x + tile.width &&
      sprite.coordinates.x + sprite.width > tile.coordinates.x
    ) {
      if (sprite.coordinates.y === tile.coordinates.y + tile.height)
        return 'bottom';
      if (sprite.coordinates.y + sprite.height === tile.coordinates.y)
        return 'top';
    }

    if (
      sprite.coordinates.y < tile.coordinates.y + tile.height &&
      sprite.coordinates.y + sprite.height > tile.coordinates.y
    ) {
      if (sprite.coordinates.x === tile.coordinates.x + tile.width)
        return 'right';
      if (sprite.coordinates.x + sprite.width === tile.coordinates.x)
        return 'left';
    }

    return null;
  }

  public whichSurfaceCollidingWith(sprite: Sprite, tile: Tile) {
    const aTop = sprite.coordinates.y;
    const aBottom = sprite.coordinates.y + sprite.height;
    const aLeft = sprite.coordinates.x;
    const aRight = sprite.coordinates.x + sprite.width;

    const a2Top = sprite.previousCoordinates.y;
    const a2Bottom = sprite.previousCoordinates.y + sprite.height;
    const a2Left = sprite.previousCoordinates.x;
    const a2Right = sprite.previousCoordinates.x + sprite.width;

    const bTop = tile.coordinates.y;
    const bBottom = tile.coordinates.y + tile.height;
    const bLeft = tile.coordinates.x;
    const bRight = tile.coordinates.x + tile.width;

    const isColliding =
      aBottom > bTop && aTop < bBottom && aRight > bLeft && aLeft < bRight;

    if (isColliding) {
      let timeToCollisionList: { surface: SurfaceType; time: number }[] = [];
      // Assuming a is the player and b is the surface
      // based on the player's previous coordinates and the velocity, we can determine which side of the player is touching the surface
      if (sprite.velocity.x >= 0) {
        // player is moving right
        const timeToCollision = (bLeft - a2Right) / sprite.velocity.x || 0;
        timeToCollisionList.push({ surface: 'left', time: timeToCollision });
      } else if (sprite.velocity.x <= 0) {
        // player is moving left
        const timeToCollision = (a2Left - bRight) / sprite.velocity.x || 0;
        timeToCollisionList.push({ surface: 'right', time: timeToCollision });
      }

      if (sprite.velocity.y >= 0) {
        // player is moving down
        const timeToCollision = (bTop - a2Bottom) / sprite.velocity.y || 0;
        timeToCollisionList.push({ surface: 'top', time: timeToCollision });
      } else if (sprite.velocity.y <= 0) {
        // player is moving up
        const timeToCollision = (a2Top - bBottom) / sprite.velocity.y || 0;
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
    if (this.player) {
      this.move();
      this.drawing.draw(
        this.map.sprites,
        this.map.tiles,
        this.map.backgrounds,
        this.player.coordinates
      );

      // check if player is touching a surface
      const surfacesTouched = this.map.tiles.reduce((acc, surface) => {
        const colliding = this.whichSurfaceTouchingWith(
          this.player as Sprite,
          surface
        );
        if (colliding) {
          acc.push({ sprite: surface, surface: colliding });
        }
        return acc;
      }, [] as { sprite: Tile; surface: SurfaceType }[]);

      this.player.updateSurfacesTouched(surfacesTouched);

      // check if player is colliding with a surface
      const surfacesCollided = this.map.tiles.reduce((acc, surface) => {
        const colliding = this.whichSurfaceCollidingWith(
          this.player as Sprite,
          surface
        );
        if (colliding) {
          acc.push({ sprite: surface, surface: colliding });
        }
        return acc;
      }, [] as { sprite: Tile; surface: SurfaceType }[]);

      this.player.updateSurfacesCollided(surfacesCollided);
    }
  }
}
