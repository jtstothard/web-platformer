import { BackgroundType } from './map';
import { Sprite } from './sprite';

export class Drawing {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  frame: number = 0;
  speed: number = 0.05;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  drawSprite(sprite: Sprite) {
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
    this.frame += this.speed;
  }

  drawBackground(background: HTMLImageElement, distance: number) {
    const width = this.canvas.width;
    const height = this.canvas.height;
    // make background static
    const x = 0;
    const y = 0;

    this.ctx.drawImage(background, x, y, width, height);
    this.ctx.drawImage(background, x - width, y, width, height);
  }

  public draw(sprites: Sprite[], backgrounds: BackgroundType[]) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    backgrounds.forEach(({ element, distance }) =>
      this.drawBackground(element, distance)
    );
    sprites.forEach(this.drawSprite.bind(this));
  }
}
