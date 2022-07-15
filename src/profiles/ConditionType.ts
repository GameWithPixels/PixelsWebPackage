import { enumValue } from "../utils";

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
