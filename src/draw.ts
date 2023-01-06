import { BackgroundType } from './map';
import { Coordinates, Sprite } from './sprite';

export class Drawing {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  frame: number = 0;
  mapWidth: number;
  mapHeight: number;

  constructor(canvas: HTMLCanvasElement, mapWidth: number, mapHeight: number) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
  }

  getSpriteLocationOnCanvas(sprite: Sprite, camera: Coordinates) {
    const { x, y } = camera;
    const spriteX = sprite.coordinates.x - x;
    const spriteY = sprite.coordinates.y - y;

    return { x: spriteX, y: spriteY };
  }

  drawSprite(sprite: Sprite, camera: Coordinates) {
    const { x, y } = this.getSpriteLocationOnCanvas(sprite, camera);
    const speed = 0.02;
    if (sprite.sprites) {
      const frames = sprite.sprites[sprite.state];
      const frame = Math.floor(this.frame) % frames.length;
      const image = frames[frame];

      // change direction if needed
      if (sprite.direction === 'left') {
        this.ctx.save();
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(
          image,
          -x - sprite.width,
          y,
          sprite.width,
          sprite.height
        );
        this.ctx.restore();
      } else {
        this.ctx.drawImage(image, x, y, sprite.width, sprite.height);
      }

      return;
    }

    this.ctx.fillStyle = sprite.color;
    this.ctx.fillRect(
      sprite.coordinates.x,
      sprite.coordinates.y,
      sprite.width,
      sprite.height
    );

    // update frame
    this.frame += speed;
  }

  drawBackground(
    background: HTMLImageElement,
    distance: number,
    coordinates: Coordinates
  ) {
    const { x, y } = coordinates;
    const canvasHeight = this.canvas.height;
    const canvasWidth = this.canvas.width;

    const parallaxEffect = 0.1;

    // make background move based on how far away it is from the camera (distance) and the map width
    const x1 = (x * distance * parallaxEffect) % canvasWidth;
    // draw background and repeat it to fill the canvas
    this.ctx.drawImage(background, x1, y, canvasWidth, canvasHeight);
    this.ctx.drawImage(
      background,
      x1 - canvasWidth,
      y,
      canvasWidth,
      canvasHeight
    );
  }

  getCameraCoordinates(playerCoordinates: Coordinates) {
    const { x, y } = playerCoordinates;
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;

    // Camera coordinates are the coordinates of the top left corner of the canvas
    // so we need to subtract half the canvas width and height to get the coordinates
    // of the top left corner of the canvas
    // camera should not go outside the map

    // if player is in the middle of the map, camera should be in the middle of the canvas
    // if player is at the edge of the map, camera should be at the edge of the canvas

    // if player is at the edge of the map, camera should not go outside the map
    // if player is in the middle of the map, camera should be in the middle of the canvas

    const cameraX = Math.max(
      0,
      Math.min(x - canvasWidth / 2, this.mapWidth - canvasWidth)
    );
    const cameraY = Math.max(
      0,
      Math.min(y - canvasHeight / 2, this.mapHeight - canvasHeight)
    );

    return { x: cameraX, y: cameraY };
  }

  public draw(
    sprites: Sprite[],
    backgrounds: BackgroundType[],
    playerCoordinates: Coordinates
  ) {
    const camera = this.getCameraCoordinates(playerCoordinates);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    backgrounds.forEach(({ element, distance }) =>
      this.drawBackground(element, distance, camera)
    );
    sprites.forEach((sprite) => this.drawSprite(sprite, camera));
  }
}
