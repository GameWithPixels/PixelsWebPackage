import AnimationBits from "../animations/AnimationBits";
import Color from "../animations/Color";
import RgbKeyframe from "../animations/RgbKeyframe";
import SimpleKeyframe from "../animations/SimpleKeyframe";
import EditColor from "./EditColor";
import EditDataSet from "./EditDataSet";
import Editable from "./Editable";

export default class EditRgbKeyframe extends Editable {
  // Float
  time: number;
  color: Color;

  constructor(time = 0, color = Color.black) {
    super();
    this.time = time;
    this.color = color;
  }

  toRgbKeyframe(editSet: EditDataSet, bits: AnimationBits): RgbKeyframe {
    const kf = new RgbKeyframe();
    // Add the color to the palette if not already there, otherwise grab the color index
    const colorIndex = EditColor.toColorIndex(bits.palette, this.color);
    kf.setTimeAndColorIndex(this.time, colorIndex);
    return kf;
  }

  toKeyframe(editSet: EditDataSet, bits: AnimationBits): SimpleKeyframe {
    const kf = new SimpleKeyframe();
    // Get the intensity from the color and scale
    kf.setTimeAndIntensity(this.time, this.color.desaturate() * 255);
    return kf;
  }

  duplicate(): EditRgbKeyframe {
    return new EditRgbKeyframe(this.time, this.color.duplicate());
  }
}
