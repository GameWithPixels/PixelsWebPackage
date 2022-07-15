import { serializable } from "../Serializable";
import { enumFlag } from "../utils";
import Condition from "./Condition";
import { ConditionType, ConditionTypeValues } from "./ConditionType";

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
export default class ConditionHelloGoodbye implements Condition {
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
