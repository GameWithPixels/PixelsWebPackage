import { serializable } from "../Serializable";
import AnimationBits from "./AnimationBits";

export default class RgbKeyframe {
  @serializable(2)
  timeAndColor = 0;

  // Time in ms
  time(): number {
    // Unpack
    const time50th = (this.timeAndColor & 0b1111111110000000) >> 7;
    return time50th * 20;
  }

  colorIndex(): number {
    // Unpack
    return this.timeAndColor & 0b01111111;
  }

  color(bits: AnimationBits): number {
    return bits.getColor32(this.colorIndex());
  }

  setTimeAndColorIndex(time: number, colorIndex: number): void {
    //TODO check colorIndex < 128
    const time50th = Math.round(Math.max(0, time) * 1000) / 20;
    colorIndex = Math.max(0, colorIndex);
    this.timeAndColor =
      ((time50th & 0b111111111) << 7) | (colorIndex & 0b1111111);
  }

  equals(other: RgbKeyframe): boolean {
    return this.timeAndColor === other.timeAndColor;
  }
}
