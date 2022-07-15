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
