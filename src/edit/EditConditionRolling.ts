import DataSet from "../animations/DataSet";
import { ActionType } from "../profiles/actions";
import {
  Condition,
  ConditionRolling,
  ConditionTypeValues,
} from "../profiles/conditions";
import { safeAssign } from "../utils";
import EditCondition from "./EditCondition";
import EditDataSet from "./EditDataSet";
import { range, units, widget } from "./decorators";

export default class EditConditionRolling extends EditCondition {
  get type(): ActionType {
    return ConditionTypeValues.Rolling;
  }

  @widget("slider")
  @range(0.5, 5, 0.1)
  @units("s")
  recheckAfter: number;

  constructor(recheckAfter = 1) {
    super();
    this.recheckAfter = recheckAfter;
  }

  toCondition(editSet: EditDataSet, set: DataSet): Condition {
    return safeAssign(new ConditionRolling(), {
      repeatPeriodMs: Math.round(this.recheckAfter * 1000),
    });
  }

  duplicate(): EditCondition {
    return new EditConditionRolling(this.recheckAfter);
  }
}
