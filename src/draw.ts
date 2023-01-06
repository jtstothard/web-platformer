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

  drawSprite(sprite: Sprite) {
    const speed = 0.02;
    if (sprite.sprites) {
      const frames = sprite.sprites[sprite.state];
      const frame = Math.floor(this.frame) % frames.length;
      const image = frames[frame];

      // change direction if needed
      if (sprite.direction === 'left') {
        this.ctx.translate(
          sprite.coordinates.x + sprite.width,
          sprite.coordinates.y
        );
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(image, 0, 0, sprite.width, sprite.height);
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      } else {
        this.ctx.drawImage(
          image,
          sprite.coordinates.x,
          sprite.coordinates.y,
          sprite.width,
          sprite.height
        );
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

  drawBackground(background: HTMLImageElement, distance: number, x: number) {
    const canvasHeight = this.canvas.height;
    const canvasWidth = this.canvas.width;

    const parallaxEffect = 0.1;

    // make background move based on how far away it is from the camera (distance) and the map width
    const x1 = (x * distance * parallaxEffect) % canvasWidth;

    // draw background and repeat it to fill the canvas
    this.ctx.drawImage(background, x1, 0, canvasWidth, canvasHeight);
    this.ctx.drawImage(
      background,
      x1 - canvasWidth,
      0,
      canvasWidth,
      canvasHeight
    );
  }

  public draw(
    sprites: Sprite[],
    backgrounds: BackgroundType[],
    coordinates: Coordinates
  ) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    backgrounds.forEach(({ element, distance }) =>
      this.drawBackground(element, distance, coordinates.x)
    );
    sprites.forEach(this.drawSprite.bind(this));
  }
}
