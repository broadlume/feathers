export class DOMDataset {
  public dataset: DOMStringMap;

  constructor(public itemprop: string) {
    this.itemprop = itemprop;

    const metaElement = document.querySelector<HTMLMetaElement>(
      `meta[itemprop=${this.itemprop}]`
    );

    if (!metaElement) {
      throw new Error(
        `Could not find meta (<meta itemprop="${this.itemprop}"/>)`
      );
    }
    this.dataset = metaElement.dataset;
  }
}
