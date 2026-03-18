export class BlobKey {
  readonly value: string;

  constructor(sightingId: string, uuid: string, ext: string) {
    this.value = `${sightingId}/${uuid}.${ext}`;
  }

  thumbnailKey(): string {
    return this.value.replace(/(\.[^.]+)$/, "_thumb$1");
  }
}
