import { serializable } from "../Serializable";
import { enumValue, enumFlag } from "../utils";

export const ConditionTypeValues = {
  //TODO [SkipEnumValue]
  Unknown: enumValue(0),
  //TODO [Name("Pixel wakes up / sleeps")]
  HelloGoodbye: enumValue(),
  //TODO [Name("Pixel is picked up")]
  Handling: enumValue(),
  //TODO [Name("Pixel is rolling")]
  Rolling: enumValue(),
  //TODO [Name("Pixel roll is...")]
  FaceCompare: enumValue(),
  //TODO [Name("Pixel is crooked")]
  Crooked: enumValue(),
  //TODO [Name("Bluetooth Event...")]
  ConnectionState: enumValue(),
  //TODO [Name("Battery Event...")]
  BatteryState: enumValue(),
  //TODO [Name("Pixel is idle for...")]
  Idle: enumValue(),
} as const;

/** The "enum" type for {@link ConditionTypeValues}. */
export type ConditionType =
  typeof ConditionTypeValues[keyof typeof ConditionTypeValues];

/// <summary>
/// The base struct for all conditions, stores a type identifier so we can tell the actual
/// type of the condition and fetch the condition parameters correctly.
/// </summary>
export interface Condition {
  type: ConditionType;
}

/// <summary>
/// Condition that triggers when the Pixel is being handled
/// </summary>
export class ConditionIdle implements Condition {
  @serializable(1, { padding: 1 })
  type: ConditionType = ConditionTypeValues.Idle;

  @serializable(2)
  repeatPeriodMs = 0;
}

/// <summary>
/// Condition that triggers when the Pixel is being handled
/// </summary>
export class ConditionHandling implements Condition {
  @serializable(1, { padding: 3 })
  type: ConditionType = ConditionTypeValues.Handling;
}

/// <summary>
/// Condition that triggers when the Pixel is being rolled
/// </summary>
export class ConditionRolling implements Condition {
  @serializable(1, { padding: 1 })
  type: ConditionType = ConditionTypeValues.Rolling;

  @serializable(2)
  repeatPeriodMs = 0; // 0 means do NOT repeat
}

/// <summary>
/// Condition that triggers when the Pixel has landed by is crooked
/// </summary>
export class ConditionCrooked implements Condition {
  @serializable(1, { padding: 3 })
  type: ConditionType = ConditionTypeValues.Crooked;
}

/// <summary>
/// Flags used to indicate how we treat the face, whether we want to trigger if the
/// value is greater than the parameter, less, or equal, or any combination
/// </summary>
export const FaceCompareFlagsValues = {
  Less: enumFlag(0),
  Equal: enumFlag(),
  Greater: enumFlag(),
} as const;

/** The "enum" type for {@link FaceCompareFlagsValues}. */
export type FaceCompareFlags =
  typeof FaceCompareFlagsValues[keyof typeof FaceCompareFlagsValues];

/// <summary>
/// Condition that triggers when the Pixel has landed on a face
/// </summary>
export class ConditionFaceCompare implements Condition {
  @serializable(1)
  type: ConditionType = ConditionTypeValues.FaceCompare;

  @serializable(1)
  faceIndex = 0;

  @serializable(1, { padding: 1 })
  flags: FaceCompareFlags = 0;
}

/// <summary>
/// Indicate whether the condition should trigger on Hello, Goodbye or both
/// </summary>
export const HelloGoodbyeFlagsValues = {
  Hello: enumFlag(0),
  Goodbye: enumFlag(),
} as const;

/** The "enum" type for {@link HelloGoodbyeFlagsValues}. */
export type HelloGoodbyeFlags =
  typeof HelloGoodbyeFlagsValues[keyof typeof HelloGoodbyeFlagsValues];

/// <summary>
/// Condition that triggers on a life state event
/// </summary>
export class ConditionHelloGoodbye implements Condition {
  @serializable(1)
  type: ConditionType = ConditionTypeValues.HelloGoodbye;

  @serializable(1, { padding: 2 })
  flags: HelloGoodbyeFlags = 0;
}

/// <summary>
/// Indicates when the condition should trigger, connected!, disconnected! or both
/// </summary>
export const ConnectionStateFlagsValues = {
  Connected: enumFlag(0),
  Disconnected: enumFlag(),
};

/** The "enum" type for {@link ConnectionStateFlagsValues}. */
export type ConnectionStateFlags =
  typeof ConnectionStateFlagsValues[keyof typeof ConnectionStateFlagsValues];

/// <summary>
/// Condition that triggers on connection events
/// </summary>
export class ConditionConnectionState implements Condition {
  @serializable(1)
  type: ConditionType = ConditionTypeValues.ConnectionState;

  @serializable(1, { padding: 2 })
  flags: ConnectionStateFlags = 0;
}

/// <summary>
/// Indicates which battery event the condition should trigger on
/// </summary>
export const BatteryStateFlagsValues = {
  Ok: enumFlag(0),
  Low: enumFlag(),
  Charging: enumFlag(),
  Done: enumFlag(),
} as const;

/** The "enum" type for {@link BatteryStateFlagsValues}. */
export type BatteryStateFlags =
  typeof BatteryStateFlagsValues[keyof typeof BatteryStateFlagsValues];

/// <summary>
/// Condition that triggers on battery state events
/// </summary>
export class ConditionBatteryState implements Condition {
  @serializable(1)
  type: ConditionType = ConditionTypeValues.BatteryState;

  @serializable(1)
  flags: BatteryStateFlags = 0;

  @serializable(2)
  repeatPeriodMs = 0;
}
