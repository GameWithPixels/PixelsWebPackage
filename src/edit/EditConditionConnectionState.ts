import DataSet from "../animations/DataSet";
import { safeAssign } from "../utils";
import EditCondition from "./EditCondition";
import EditDataSet from "./EditDataSet";
import { name, widget } from "./decorators";
import { ActionType } from "../profiles/ActionType";
import { ConditionTypeValues } from "../profiles/ConditionType";
import {
  ConditionConnectionState,
  ConnectionStateFlags,
} from "../profiles/ConditionHelloGoodbye";
import Condition from "../profiles/Condition";

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
