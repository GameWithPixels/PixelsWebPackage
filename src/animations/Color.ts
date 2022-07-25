export default class Color {
  r = 0; // Normalized floating point value
  g = 0; // Normalized floating point value
  b = 0; // Normalized floating point value

  get rByte(): number {
    return Color.componentToByte(this.r);
  }

  get gByte(): number {
    return Color.componentToByte(this.g);
  }

  get bByte(): number {
    return Color.componentToByte(this.b);
  }

  constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  equals(other: Color): boolean {
    return this.r === other.r && this.g === other.g && this.b === other.b;
  }

  duplicate(): Color {
    return new Color(this.r, this.g, this.b);
  }

  desaturate(): number {
    return (
      (Math.min(this.r, Math.min(this.g, this.b)) +
        Math.max(this.r, Math.max(this.g, this.b))) *
      0.5
    );
  }

  serialize(dataView: DataView, byteOffset = 0): [DataView, number] {
    dataView.setUint8(byteOffset++, this.rByte);
    dataView.setUint8(byteOffset++, this.gByte);
    dataView.setUint8(byteOffset++, this.bByte);
    return [dataView, byteOffset];
  }

  static fromBytes(rByte: number, gByte: number, bByte: number): Color {
    return new Color(rByte / 255, gByte / 255, bByte / 255);
  }

  static componentToByte(c: number): number {
    return Math.round(255 * Math.min(1, Math.max(0, c)));
  }

  static red = new Color(1, 0, 0);
  static green = new Color(0, 1, 0);
  static blue = new Color(0, 0, 1);
  static white = new Color(1, 1, 1);
  static black = new Color(0, 0, 0);
  static cyan = new Color(0, 1, 1);
  static magenta = new Color(1, 0, 1);
  static yellow = new Color(1, 0.922, 0.016);
  static orange = new Color(1, 0.647, 0);
  static brightGreen = new Color(0.667, 1, 0);
  static darkRed = new Color(0.35, 0, 0);
  static darkGreen = new Color(0, 0.35, 0);
  static darkBlue = new Color(0, 0, 0.35);
  static darkWhite = new Color(0.35, 0.35, 0.35);
  static darkBlack = new Color(0, 0, 0);
  static darkYellow = new Color(0.35, 0.3, 0.005);
  static darkCyan = new Color(0, 0.35, 0.35);
  static darkMagenta = new Color(0.35, 0, 0.35);
  static lightGray = new Color(0.75, 0.75, 0.75);
  static gray = new Color(0.5, 0.5, 0.5);
  static darkGray = new Color(0.25, 0.25, 0.25);
}
