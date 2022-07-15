import DataSet from "../animations/DataSet";
import { ActionType } from "../profiles/actions";
import {
  Condition,
  ConditionConnectionState,
  ConditionTypeValues,
  ConnectionStateFlags,
} from "../profiles/conditions";
import { safeAssign } from "../utils";
import EditCondition from "./EditCondition";
import EditDataSet from "./EditDataSet";
import { name, widget } from "./decorators";

export default class EditConditionConnectionState extends EditCondition {
  get type(): ActionType {
    return ConditionTypeValues.ConnectionState;
  }

  @widget("bitfield")
  @name("Connection Event")
  flags: ConnectionStateFlags;

  constructor(flags: ConnectionStateFlags = 0) {
    super();
    this.flags = flags;
  }

  toCondition(editSet: EditDataSet, set: DataSet): Condition {
    return safeAssign(new ConditionConnectionState(), {
      flags: this.flags,
    });
  }

  duplicate(): EditCondition {
    return new EditConditionConnectionState(this.flags);
  }
}
