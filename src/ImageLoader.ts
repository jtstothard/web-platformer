export class ImageLoader {
  public images: Promise<HTMLImageElement[]>;
  constructor(folder: string) {
    this.images = new Promise<HTMLImageElement[]>((res) => {
      const images = this.loadImages(folder);
      res(images);
    });
  }

  public async loadImages(folder: string) {
    // loop through all images in folder
    let isError = false;
    let i = 0;
    const promises: Promise<HTMLImageElement>[] = [];
    while (!isError) {
      try {
        const module = (await import(`./assets/${folder}/${i}.gif`)).default;
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
