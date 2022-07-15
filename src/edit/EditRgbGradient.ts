import EditRgbKeyframe from "./EditRgbKeyframe";
import Editable from "./Editable";

export default class EditRgbGradient extends Editable {
  readonly keyframes: EditRgbKeyframe[];

  get empty() {
    return !this.keyframes.length;
  }

  get duration() {
    return this.keyframes.length
      ? Math.max(...this.keyframes.map((k) => k.time))
      : 0;
  }

  get firstTime() {
    return this.keyframes.length ? this.keyframes[0].time : 0;
  }

  get lastTime() {
    return this.keyframes.length
      ? this.keyframes[this.keyframes.length - 1].time
      : 0;
  }

  constructor(keyframes: EditRgbKeyframe[] = []) {
    super();
    this.keyframes = keyframes;
  }

  duplicate(): EditRgbGradient {
    const track = new EditRgbGradient();
    if (this.keyframes != null) {
      this.keyframes.forEach((keyframe) => {
        track.keyframes.push(keyframe.duplicate());
      });
    }
    return track;
  }
}
