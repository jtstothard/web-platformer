import { BackgroundType } from './map';
import { Coordinates, Sprite } from './sprite';
import { Tile } from './tile';

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

  getLocationOnCanvas(coordinates: Coordinates, camera: Coordinates) {
    return {
      x: coordinates.x - camera.x,
      y: coordinates.y - camera.y,
    };
  }

  drawSprite(sprite: Sprite, camera: Coordinates) {
    const { x, y } = this.getLocationOnCanvas(sprite.coordinates, camera);
    const speed = 0.2;
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
    }

    // update frame
    this.frame += speed;
  }

  drawTile(tile: Tile, camera: Coordinates) {
    const { x, y } = this.getLocationOnCanvas(tile.coordinates, camera);
    const x2 = x + tile.width;
    const y2 = y + tile.height;
    const imageWidth = tile.image.width;
    const imageHeight = tile.image.height;
    const aspectRatio = imageWidth / imageHeight;
    const height = tile.height;
    const width = height * aspectRatio;
    // draw image and repeat it to fill the tile that is on canvas
    // if image is smaller than tile, it will be cropped

    const maxDrawWidth = Math.min(this.canvas.width, x2);
    const maxDrawHeight = Math.min(this.canvas.height, y2);
    let x1 = x;
    while (x1 < maxDrawWidth) {
      let y1 = y;
      while (y1 < maxDrawHeight) {
        this.ctx.drawImage(
          tile.image,
          0,
          0,
          imageWidth,
          imageHeight,
          x1,
          y1,
          width,
          height
        );
        y1 += height;
      }
      x1 += width;
    }
  }

  drawBackground(
    background: HTMLImageElement,
    distance: number,
    coordinates: Coordinates
  ) {
    const { x, y } = coordinates;
    const canvasHeight = this.canvas.height;
    const canvasWidth = this.canvas.width;

    const parallaxEffect = -0.1;

    // make background move based on how far away it is from the camera (distance) and the map width
    const x1 = (x * distance * parallaxEffect) % canvasWidth;
    // draw background and repeat it to fill the canvas
    this.ctx.drawImage(background, x1, y, canvasWidth, canvasHeight);
    this.ctx.drawImage(
      background,
      x1 + canvasWidth,
      y,
      canvasWidth,
      canvasHeight
    );
  }

  getCameraCoordinates(playerCoordinates: Coordinates) {
    const { x, y } = playerCoordinates;
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;

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
    tiles: Tile[],
    backgrounds: BackgroundType[],
    playerCoordinates: Coordinates
  ) {
    const camera = this.getCameraCoordinates(playerCoordinates);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    backgrounds.forEach(({ element, distance }) =>
      this.drawBackground(element, distance, camera)
    );
    sprites.forEach((sprite) => this.drawSprite(sprite, camera));
    tiles.forEach((tile) => this.drawTile(tile, camera));
  }
}
