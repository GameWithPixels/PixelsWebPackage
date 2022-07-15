import { serializable } from "../Serializable";

export default class SimpleKeyframe {
  @serializable(2)
  timeAndIntensity = 0;

  time(): number {
    // Unpack
    const time50th = (this.timeAndIntensity & 0b1111111110000000) >> 7;
    return time50th * 20;
  }

  intensity(): number {
    // Unpack
    return (this.timeAndIntensity & 0b01111111) * 2; // Scale it to 0 -> 255
  }

  setTimeAndIntensity(time: number, intensity: number): void {
    const time50th = Math.round(Math.max(0, time) * 1000) / 20;
    this.timeAndIntensity =
      ((time50th & 0b111111111) << 7) | (Math.floor(intensity / 2) & 0b1111111);
  }

  equals(other: SimpleKeyframe): boolean {
    return this.timeAndIntensity === other.timeAndIntensity;
  }
}
