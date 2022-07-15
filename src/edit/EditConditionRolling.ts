import DataSet from "../animations/DataSet";
import { safeAssign } from "../utils";
import EditCondition from "./EditCondition";
import EditDataSet from "./EditDataSet";
import { range, units, widget } from "./decorators";
import { ActionType } from "../profiles/ActionType";
import { ConditionTypeValues } from "../profiles/ConditionType";
import Condition from "../profiles/Condition";
import ConditionRolling from "../profiles/ConditionRolling";

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
