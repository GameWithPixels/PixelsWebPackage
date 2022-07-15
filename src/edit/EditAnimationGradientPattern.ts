import AnimationBits from "../animations/AnimationBits";
import AnimationGradientPattern from "../animations/AnimationGradientPattern";
import AnimationPreset from "../animations/AnimationPreset";
import {
  AnimationType,
  AnimationTypeValues,
} from "../animations/AnimationType";
import { safeAssign } from "../utils";
import EditAnimation from "./EditAnimation";
import EditDataSet from "./EditDataSet";
import EditPattern from "./EditPattern";
import EditRgbGradient from "./EditRgbGradient";
import EditRgbTrack from "./EditRgbTrack";
import { widget, range, units, name } from "./decorators";

export default class EditAnimationGradientPattern extends EditAnimation {
  private _speedMultiplier: number;

  get type(): AnimationType {
    return AnimationTypeValues.GradientPattern;
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

  @widget("grayscalePattern")
  @name("LED Pattern")
  pattern?: EditPattern;

  @widget("gradient")
  @name("RGB Gradient")
  gradient?: EditRgbGradient;

  @name("Override color based on face")
  overrideWithFace: boolean;

  constructor(options?: {
    name?: string;
    speedMultiplier?: number;
    pattern?: EditPattern;
    gradient?: EditRgbGradient;
    overrideWithFace?: boolean;
  }) {
    super(options?.name);
    this._speedMultiplier = options?.speedMultiplier ?? 1;
    this.pattern = options?.pattern;
    this.gradient = options?.gradient;
    this.overrideWithFace = options?.overrideWithFace ?? false;
  }

  toAnimation(editSet: EditDataSet, bits: AnimationBits): AnimationPreset {
    const gradientTrackOffset = bits.rgbTracks.length;
    // Add gradient
    if (this.gradient) {
      bits.rgbTracks.push(
        new EditRgbTrack(this.gradient).toTrack(editSet, bits)
      );
    }

    return safeAssign(new AnimationGradientPattern(), {
      duration: this.duration * 1000, // stored in milliseconds
      speedMultiplier256: this._speedMultiplier * 256,
      tracksOffset: this.pattern
        ? editSet.getPatternTrackOffset(this.pattern)
        : 0,
      trackCount: this.pattern?.gradients.length ?? 0,
      gradientTrackOffset,
      overrideWithFace: this.overrideWithFace ? 1 : 0,
    });
  }

  duplicate(): EditAnimation {
    return new EditAnimationGradientPattern({
      name: this.name,
      speedMultiplier: this._speedMultiplier,
      pattern: this.pattern,
      gradient: this.gradient?.duplicate(),
      overrideWithFace: this.overrideWithFace,
    });
  }

  requiresPattern(pattern: EditPattern): { asRgb: boolean } | undefined {
    if (this.pattern === pattern) {
      return { asRgb: false };
    }
  }
}
