export class Game {
  private ctx: CanvasRenderingContext2D;
  private player: Player;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.player = new Player(0, 0, 100, 100, 'red');
  }

  public drawSprite(sprite: Sprite) {
    this.ctx.fillStyle = sprite.color;
    this.ctx.fillRect(sprite.x, sprite.y, sprite.width, sprite.height);
  }

  public draw() {
    this.ctx.clearRect(0, 0, 800, 600);
    this.drawSprite(this.player);
  }

  public start() {
    this.addEventListener();
    this.draw();
  }

  // add event listener to the window
  public addEventListener() {
    window.addEventListener('keydown', (event) => {
      this.handleKeyDown(event);
    });
  }

  // handle key down event
  private handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.player.update('up');
        break;
      case 'ArrowDown':
        this.player.update('down');
        break;
      case 'ArrowLeft':
        this.player.update('left');
        break;
      case 'ArrowRight':
        this.player.update('right');
        break;
    }
    this.draw();
  }
}

class Sprite {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public color: string;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }
}

class Player extends Sprite {
  public update(direction: string) {
    switch (direction) {
      case 'up':
        this.y -= 10;
        break;
      case 'down':
        this.y += 10;
        break;
      case 'left':
        this.x -= 10;
        break;
      case 'right':
        this.x += 10;
        break;
    }

    if (this.x > 800) {
      this.x = 0;
    }
    if (this.y > 600) {
      this.y = 0;
    }
    if (this.x < 0) {
      this.x = 800;
    }
    if (this.y < 0) {
      this.y = 600;
    }
  }
}
