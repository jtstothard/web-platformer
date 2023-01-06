export class ImageLoader {
  public images: Promise<HTMLImageElement[]>;
  extension: string;
  constructor(prefix: string, extension: 'gif' | 'png' = 'gif') {
    this.extension = extension;
    this.images = new Promise<HTMLImageElement[]>((res) => {
      const images = this.loadImages(prefix);
      res(images);
    });
  }

  async moduleFromExtension(prefix: string, i: string, extension: string) {
    // explicitly state all extensions for MIME type checking
    if (extension === 'gif') {
      const path = `${prefix}${i}`;
      const module = (await import(`../assets/${path}.gif`)).default;
      return module;
    }
    if (extension === 'png') {
      const path = `${prefix}${i}`;
      const module = (await import(`../assets/${path}.png`)).default;
      return module;
    }
  }

  public async loadImages(prefix: string) {
    // loop through all images in folder
    let isError = false;
    let i = 0;
    const promises: Promise<HTMLImageElement>[] = [];
    while (!isError) {
      try {
        const module = await this.moduleFromExtension(
          prefix,
          i.toString(),
          this.extension
        );
        const img = new Image();
        img.src = module;
        const promise = new Promise<HTMLImageElement>((resolve) => {
          img.onload = () => {
            resolve(img);
          };
        });
        promises.push(promise);
        i++;
      } catch (e) {
        isError = true;
      }
    }
    return Promise.all(promises);
  }
}
