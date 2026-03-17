export class SpeciesName {
  private readonly _value: string;

  constructor(raw: string) {
    const trimmed = raw.trim();
    if (trimmed.length === 0) {
      throw new Error('Species name cannot be empty');
    }
    if (trimmed.length > 200) {
      throw new Error('Species name must be 200 characters or fewer');
    }
    this._value = trimmed;
  }

  get value(): string {
    return this._value;
  }
}
