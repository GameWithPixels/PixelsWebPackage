import DataSet from "../animations/DataSet";
import { ActionType } from "../profiles/actions";
import {
  BatteryStateFlags,
  Condition,
  ConditionBatteryState,
  ConditionTypeValues,
} from "../profiles/conditions";
import { safeAssign } from "../utils";
import EditCondition from "./EditCondition";
import EditDataSet from "./EditDataSet";
import { name, widget, range, units } from "./decorators";

export default class EditConditionBatteryState extends EditCondition {
  get type(): ActionType {
    return ConditionTypeValues.BatteryState;
  }

  @widget("bitfield")
  @name("Battery State")
  flags: BatteryStateFlags;

  @widget("slider")
  @range(5, 60)
  @units("s")
  recheckAfter: number;

  constructor(flags: BatteryStateFlags = 0, recheckAfter = 1) {
    super();
    this.flags = flags;
    this.recheckAfter = recheckAfter;
  }

  toCondition(editSet: EditDataSet, set: DataSet): Condition {
    return safeAssign(new ConditionBatteryState(), {
      flags: this.flags,
      repeatPeriodMs: Math.round(this.recheckAfter * 1000),
    });
  }

  duplicate(): EditCondition {
    return new EditConditionBatteryState(this.flags, this.recheckAfter);
  }
}
