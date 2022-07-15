import AnimationBits from "../animations/AnimationBits";
import AnimationKeyframed from "../animations/AnimationKeyframed";
import AnimationPreset from "../animations/AnimationPreset";
import {
  AnimationType,
  AnimationTypeValues,
} from "../animations/AnimationType";
import { safeAssign } from "../utils";
import EditAnimation from "./EditAnimation";
import EditDataSet from "./EditDataSet";
import EditPattern from "./EditPattern";
import { widget, range, units, name } from "./decorators";

export default class EditAnimationKeyframed extends EditAnimation {
  private _speedMultiplier: number;

  get type(): AnimationType {
    return AnimationTypeValues.Keyframed;
  }

  @widget("slider")
  @range(0.1, 30, 0.1)
  @units("s")
  @name("Duration")
  get duration(): number {
    return (this.pattern?.duration ?? 0) * this._speedMultiplier;
  }
  set duration(value: number) {
    if (this.pattern && this.pattern.duration > 0) {
      this._speedMultiplier = value / this.pattern.duration;
    }
  }

  @widget("rgbPattern")
  @name("LED Pattern")
  pattern?: EditPattern;

  @name("Traveling Order")
  flowOrder: boolean;

  constructor(options?: {
    name?: string;
    speedMultiplier?: number;
    pattern?: EditPattern;
    flowOrder?: boolean;
  }) {
    super(options?.name);
    this._speedMultiplier = options?.speedMultiplier ?? 1;
    this.pattern = options?.pattern;
    this.flowOrder = options?.flowOrder ?? false;
  }

  toAnimation(editSet: EditDataSet, bits: AnimationBits): AnimationPreset {
    return safeAssign(new AnimationKeyframed(), {
      duration: this.duration * 1000, // stored in milliseconds
      speedMultiplier256: this._speedMultiplier * 256,
      tracksOffset: editSet.getPatternRGBTrackOffset(this.pattern),
      trackCount: this.pattern?.gradients.length ?? 0,
      flowOrder: this.flowOrder ? 1 : 0,
    });
  }

  duplicate(): EditAnimation {
    return new EditAnimationKeyframed({
      name: this.name,
      speedMultiplier: this._speedMultiplier,
      pattern: this.pattern,
      flowOrder: this.flowOrder,
    });
  }

  requiresPattern(pattern: EditPattern): { asRgb: boolean } | undefined {
    if (this.pattern === pattern) {
      return { asRgb: true };
    }
  }
}
