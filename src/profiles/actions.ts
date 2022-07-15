import { serializable } from "../Serializable";
import { enumValue } from "../utils";

/// <summary>
/// Defines the supported types of actions.
/// </summary>
export const ActionTypeValues = {
  //TODO [SkipEnumValue]
  Unknown: enumValue(0),
  //TODO [Name("Trigger Pattern")]
  PlayAnimation: enumValue(),
  //TODO [Name("Play Audio Clip")]
  PlayAudioClip: enumValue(),
} as const;

/** The "enum" type for {@link ActionTypeValues}. */
export type ActionType = typeof ActionTypeValues[keyof typeof ActionTypeValues];

/// <summary>
/// Base interface for Actions. Stores the actual type so that we can cast the data
/// to the proper derived type and access the parameters.
/// </summary>
export interface Action {
  type: ActionType;
}

/// <summary>
/// Action to play an animation.
/// </summary>
export class ActionPlayAnimation implements Action {
  @serializable(1)
  type: ActionType = ActionTypeValues.PlayAnimation;

  @serializable(1)
  animIndex = 0;

  @serializable(1)
  faceIndex = 0;

  @serializable(1)
  loopCount = 0;
}

/// <summary>
/// Action to play a sound!
/// </summary>
export class ActionPlayAudioClip implements Action {
  @serializable(1, { padding: 1 })
  type: ActionType = ActionTypeValues.PlayAudioClip;

  @serializable(2)
  clipId = 0;
}
