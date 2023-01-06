import { Sprite } from './sprite';

export class Drawing {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  drawSprite(sprite: Sprite) {
    this.ctx.fillStyle = sprite.color;
    this.ctx.fillRect(
      sprite.coordinates.x,
      sprite.coordinates.y,
      sprite.width,
      sprite.height
    );
  }

  public draw(sprites: Sprite[]) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    sprites.forEach(this.drawSprite.bind(this));
  }
}
