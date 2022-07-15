import { serializable } from "../Serializable";
import Condition from "./Condition";
import { ConditionType, ConditionTypeValues } from "./ConditionType";

/// <summary>
/// Condition that triggers when the Pixel has landed by is crooked
/// </summary>
export default class ConditionCrooked implements Condition {
  @serializable(1, { padding: 3 })
  type: ConditionType = ConditionTypeValues.Crooked;
}
