import EditAnimation from "./edit/EditAnimation";
import EditAudioClip from "./edit/EditAudioClip";
import EditDataSet from "./edit/EditDataSet";
import EditPattern from "./edit/EditPattern";
import EditProfile from "./edit/EditProfile";
import EditRule from "./edit/EditRule";

export default class AppDataSet {
  readonly _patterns: EditPattern[];
  readonly _animations: EditAnimation[];
  readonly _audioClips: EditAudioClip[];
  readonly _profiles: EditProfile[];
  readonly _defaultProfile: EditProfile;

  get patterns(): EditPattern[] {
    return this._patterns;
  }

  get animations(): EditAnimation[] {
    return this._animations;
  }

  get audioClips(): EditAudioClip[] {
    return this._audioClips;
  }

  get profiles(): EditProfile[] {
    return this._profiles;
  }

  get defaultProfile(): EditProfile {
    return this._defaultProfile;
  }

  constructor(options?: {
    patterns?: EditPattern[];
    animations?: EditAnimation[];
    audioClips?: EditAudioClip[];
    profiles?: EditProfile[];
    defaultProfile?: EditProfile;
  }) {
    this._patterns = options?.patterns ?? [];
    this._animations = options?.animations ?? [];
    this._audioClips = options?.audioClips ?? [];
    this._profiles = options?.profiles ?? [];
    this._defaultProfile = options?.defaultProfile ?? new EditProfile();
  }

  extractForAnimation(animation: EditAnimation): EditDataSet {
    const dataSet = new EditDataSet();
    dataSet.animations.push(animation);
    this._patterns.forEach((pattern) => {
      const required = animation.requiresPattern(pattern);
      if (required) {
        if (required.asRgb) {
          dataSet.rgbPatterns.push(pattern);
        } else {
          dataSet.patterns.push(pattern);
        }
      }
    });
    return dataSet;
  }

  extractForProfile(profile: EditProfile): EditDataSet {
    if (!this._profiles.includes(profile)) {
      throw new Error("Profile not in AppDataSet");
    }

    // Generate the data to be uploaded
    const editSet = new EditDataSet({
      profile: profile.duplicate(),
    });

    // And add the animations that the given profile uses
    const animations = editSet.profile.collectAnimations();

    // Add default rules and animations to profile / set
    if (this._defaultProfile) {
      // Rules that are in fact copied over
      const copiedRules: EditRule[] = [];

      this._defaultProfile.rules.forEach((rule) => {
        const cond = rule.condition;
        if (
          cond &&
          !editSet.profile.rules.find((r) => r.condition?.type === cond.type)
        ) {
          const ruleCopy = rule.duplicate();
          copiedRules.push(ruleCopy);
          editSet.profile.rules.push(ruleCopy);
        }
      });

      // Copied animations
      const copiedAnims: Map<EditAnimation, EditAnimation> = new Map();

      // Add animations used by default rules
      this._defaultProfile.collectAnimations().forEach((editAnim) => {
        copiedRules.forEach((copiedRule) => {
          if (copiedRule.requiresAnimation(editAnim)) {
            let copiedAnim = copiedAnims.get(editAnim);
            if (!copiedAnim) {
              copiedAnim = editAnim.duplicate();
              animations.push(copiedAnim);
              copiedAnims.set(editAnim, copiedAnim);
            }
            copiedRule.replaceAnimation(editAnim, copiedAnim);
          }
        });
      });
    }

    editSet.animations.push(...animations);

    this._patterns.forEach((pattern) => {
      let asRgb = false;
      if (
        animations.find((anim) => {
          const required = anim.requiresPattern(pattern);
          asRgb = required?.asRgb ?? false;
          return !!required;
        })
      ) {
        if (asRgb) {
          editSet.rgbPatterns.push(pattern);
        } else {
          editSet.patterns.push(pattern);
        }
      }
    });

    return editSet;
  }
}
