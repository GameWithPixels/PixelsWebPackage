import DataSet from "../animations/DataSet";
import { ActionType } from "../profiles/actions";
import { Condition } from "../profiles/conditions";
import EditDataSet from "./EditDataSet";
import Editable from "./Editable";

export default abstract class EditCondition extends Editable {
  abstract get type(): ActionType;
  abstract toCondition(editSet: EditDataSet, set: DataSet): Condition;
  abstract duplicate(): EditCondition;
}
