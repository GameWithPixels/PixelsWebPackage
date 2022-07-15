import AnimationGradientPattern from "./AnimationGradientPattern";
import AnimationInstance from "./AnimationInstance";
import * as Constants from "./Constants";

export default class AnimationInstanceGradientPattern extends AnimationInstance {
  private _rgb = 0;

  get preset(): AnimationGradientPattern {
    return this.animationPreset as AnimationGradientPattern;
  }

  start(startTime: number, remapFace: number, loop: boolean): void {
    super.start(startTime, remapFace, loop);
    if (this.preset.overrideWithFace !== 0) {
      this._rgb = this.animationBits.getColor32(Constants.PaletteColorFromFace);
    }
  }

  /// <summary>
  /// Computes the list of LEDs that need to be on, and what their intensities should be
  /// based on the different tracks of this animation.
  /// </summary>
  updateLeds(ms: number, retIndices: number[], retColors32: number[]): number {
    const time = ms - this.startTime;
    const preset = this.preset;

    // Figure out the color from the gradient
    const gradient = this.animationBits.getRgbTrack(preset.gradientTrackOffset);

    let gradientColor = 0;
    if (preset.overrideWithFace !== 0) {
      gradientColor = this._rgb;
    } else {
      const gradientTime = (time * 1000) / preset.duration;
      gradientColor = gradient.evaluateColor(this.animationBits, gradientTime);
    }

    const trackTime = (time * 256) / preset.speedMultiplier256;

    // Each track will append its led indices and colors into the return array
    // The assumption is that led indices don't overlap between tracks of a single animation,
    // so there will always be enough room in the return arrays.
    let totalCount = 0;
    const indices: number[] = [];
    const colors32: number[] = [];
    for (let i = 0; i < preset.trackCount; ++i) {
      const track = this.animationBits.getTrack(preset.tracksOffset + i);
      const count = track.evaluate(
        this.animationBits,
        gradientColor,
        trackTime,
        indices,
        colors32
      );
      for (let j = 0; j < count; ++j) {
        retIndices[totalCount + j] = indices[j];
        retColors32[totalCount + j] = colors32[j];
      }
      totalCount += count;
    }
    return totalCount;
  }

  stop(retIndices: number[]): number {
    const preset = this.preset;
    // Each track will append its led indices and colors into the return array
    // The assumption is that led indices don't overlap between tracks of a single animation,
    // so there will always be enough room in the return arrays.
    let totalCount = 0;
    const indices: number[] = [];
    for (let i = 0; i < preset.trackCount; ++i) {
      const track = this.animationBits.getRgbTrack(preset.tracksOffset + i);
      const count = track.extractLEDIndices(indices);
      for (let j = 0; j < count; ++j) {
        retIndices[totalCount + j] = indices[j];
      }
      totalCount += count;
    }
    return totalCount;
  }
}
