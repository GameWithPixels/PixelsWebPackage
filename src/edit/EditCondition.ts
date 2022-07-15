import DataSet from "../animations/DataSet";
import EditDataSet from "./EditDataSet";
import Editable from "./Editable";
import { ActionType } from "../profiles/ActionType";
import Condition from "../profiles/Condition";

export default abstract class EditCondition extends Editable {
  abstract get type(): ActionType;
  abstract toCondition(editSet: EditDataSet, set: DataSet): Condition;
  abstract duplicate(): EditCondition;
}
