import DataSet from "../animations/DataSet";
import { ActionType } from "../profiles/actions";
import {
  Condition,
  ConditionCrooked,
  ConditionTypeValues,
} from "../profiles/conditions";
import EditCondition from "./EditCondition";
import EditDataSet from "./EditDataSet";

export default class EditConditionCrooked extends EditCondition {
  get type(): ActionType {
    return ConditionTypeValues.Crooked;
  }

  toCondition(editSet: EditDataSet, set: DataSet): Condition {
    return new ConditionCrooked();
  }

  duplicate(): EditCondition {
    return new EditConditionCrooked();
  }
}
