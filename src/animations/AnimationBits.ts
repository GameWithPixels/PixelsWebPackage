import { align32bits, byteSizeOf, serialize } from "../Serializable";
import Color from "./Color";
import * as Color32Utils from "./Color32Utils";
import * as Constants from "./Constants";
import RgbKeyframe from "./RgbKeyframe";
import RgbTrack from "./RgbTrack";
import SimpleKeyframe from "./SimpleKeyframe";
import Track from "./Track";

export default class AnimationBits {
  readonly palette: Color[] = [];
  readonly rgbKeyframes: RgbKeyframe[] = [];
  readonly rgbTracks: RgbTrack[] = [];
  readonly keyframes: SimpleKeyframe[] = [];
  readonly tracks: Track[] = [];

  getColor32(colorIndex: number): number {
    return Color32Utils.toColor32(this.getColor(colorIndex));
  }

  getColor(colorIndex: number): Color {
    if (colorIndex === Constants.PaletteColorFromFace) {
      return Color.blue;
    } else if (colorIndex === Constants.PaletteColorFromRandom) {
      return Color.black;
    } else {
      return this.palette[colorIndex]; //TODO may return undefined
    }
  }

  getRgbKeyframe(keyFrameIndex: number): RgbKeyframe {
    return this.rgbKeyframes[Math.floor(keyFrameIndex)];
  }

  getKeyframe(keyFrameIndex: number): SimpleKeyframe {
    return this.keyframes[Math.floor(keyFrameIndex)];
  }

  getPaletteSize(): number {
    return this.palette.length * 3;
  }

  getRgbKeyframeCount(): number {
    return this.rgbKeyframes.length;
  }

  getRgbTrack(trackIndex: number): RgbTrack {
    return this.rgbTracks[Math.floor(trackIndex)];
  }

  getRgbTrackCount(): number {
    return this.rgbTracks.length;
  }

  getKeyframeCount(): number {
    return this.keyframes.length;
  }

  getTrack(trackIndex: number): Track {
    return this.tracks[Math.floor(trackIndex)];
  }

  getTrackCount(): number {
    return this.tracks.length;
  }

  computeDataSize(): number {
    return (
      align32bits(this.palette.length * 3) + // 3 bytes per color
      byteSizeOf(this.rgbKeyframes) +
      byteSizeOf(this.rgbTracks) +
      byteSizeOf(this.keyframes) +
      byteSizeOf(this.tracks)
    );
  }

  serialize(dataView: DataView, byteOffset = 0): [DataView, number] {
    // Copy palette
    this.palette.forEach((c) => {
      [dataView, byteOffset] = c.serialize(dataView, byteOffset);
    });

    // Round up to nearest multiple of 4
    byteOffset = align32bits(byteOffset);

    // Copy keyframes
    [dataView, byteOffset] = serialize(this.rgbKeyframes, {
      dataView,
      byteOffset,
    });

    // Copy rgb tracks
    [dataView, byteOffset] = serialize(this.rgbTracks, {
      dataView,
      byteOffset,
    });

    // Copy keyframes
    [dataView, byteOffset] = serialize(this.keyframes, {
      dataView,
      byteOffset,
    });

    // Copy tracks
    [dataView, byteOffset] = serialize(this.tracks, { dataView, byteOffset });

    return [dataView, byteOffset];
  }
}
