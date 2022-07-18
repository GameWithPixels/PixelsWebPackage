import DataSet from "../animations/DataSet";
import { ActionType } from "../profiles/ActionType";
import Condition from "../profiles/Condition";
import ConditionCrooked from "../profiles/ConditionCrooked";
import { ConditionTypeValues } from "../profiles/ConditionType";
import EditCondition from "./EditCondition";
import EditDataSet from "./EditDataSet";

export default class EditConditionCrooked extends EditCondition {
  get type(): ActionType {
    return ConditionTypeValues.Crooked;
  }

  toCondition(_editSet: EditDataSet, _set: DataSet): Condition {
    return new ConditionCrooked();
  }

  duplicate(): EditCondition {
    return new EditConditionCrooked();
  }
}
