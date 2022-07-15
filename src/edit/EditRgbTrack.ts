import AnimationBits from "../animations/AnimationBits";
import RgbTrack from "../animations/RgbTrack";
import { safeAssign } from "../utils";
import EditDataSet from "./EditDataSet";
import EditRgbGradient from "./EditRgbGradient";
import Editable from "./Editable";

export default class EditRgbTrack extends Editable {
  readonly ledIndices: number[] = [];
  readonly gradient: EditRgbGradient;

  get empty() {
    return this.gradient.empty;
  }

  get duration() {
    return this.gradient.duration;
  }
  get firstTime() {
    return this.gradient.firstTime;
  }
  get lastTime() {
    return this.gradient.lastTime;
  }

  constructor(gradient: EditRgbGradient = new EditRgbGradient()) {
    super();
    this.gradient = gradient;
  }

  toTrack(editSet: EditDataSet, bits: AnimationBits): RgbTrack {
    // Add the keyframes
    const keyframesOffset = bits.rgbKeyframes.length;
    this.gradient.keyframes.forEach((editKeyframe) =>
      bits.rgbKeyframes.push(editKeyframe.toRgbKeyframe(editSet, bits))
    );
    return safeAssign(new RgbTrack(), {
      //TODO remove safeAssign
      keyframesOffset,
      keyFrameCount: this.gradient.keyframes.length,
      ledMask: this.ledIndices.reduce((acc, index) => acc | (1 << index), 0),
    });
  }
}
