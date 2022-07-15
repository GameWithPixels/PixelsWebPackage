import DataSet from "../animations/DataSet";
import { ActionType } from "../profiles/actions";
import {
  Condition,
  ConditionHandling,
  ConditionTypeValues,
} from "../profiles/conditions";
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
