import DataSet from "../animations/DataSet";
import { ActionType } from "../profiles/ActionType";
import Condition from "../profiles/Condition";
import ConditionHandling from "../profiles/ConditionHandling";
import { ConditionTypeValues } from "../profiles/ConditionType";
import EditCondition from "./EditCondition";
import EditDataSet from "./EditDataSet";

export default class EditConditionHandling extends EditCondition {
  get type(): ActionType {
    return ConditionTypeValues.Handling;
  }

  toCondition(editSet: EditDataSet, set: DataSet): Condition {
    return new ConditionHandling();
  }

  duplicate(): EditCondition {
    return new EditConditionHandling();
  }
}
