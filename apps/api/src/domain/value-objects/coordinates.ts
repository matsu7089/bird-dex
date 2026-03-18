export class Coordinates {
  readonly lat: number;
  readonly lng: number;

  constructor(lat: number, lng: number) {
    if (lat < -90 || lat > 90) throw new Error("Latitude must be between -90 and 90");
    if (lng < -180 || lng > 180) throw new Error("Longitude must be between -180 and 180");
    this.lat = lat;
    this.lng = lng;
  }
}
