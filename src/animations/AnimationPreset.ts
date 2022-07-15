import AnimationBits from "./AnimationBits";
import AnimationInstance from "./AnimationInstance";
import { AnimationType } from "./AnimationType";

export default interface AnimationPreset {
  readonly type: AnimationType;
  duration: number; // ms

  createInstance(bits: AnimationBits): AnimationInstance;
}
