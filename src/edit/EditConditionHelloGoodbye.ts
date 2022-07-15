import DataSet from "../animations/DataSet";
import { ActionType } from "../profiles/actions";
import {
  Condition,
  ConditionHelloGoodbye,
  ConditionTypeValues,
  HelloGoodbyeFlags,
} from "../profiles/conditions";
import { safeAssign } from "../utils";
import EditCondition from "./EditCondition";
import EditDataSet from "./EditDataSet";
import { name, widget } from "./decorators";

export default class EditConditionHelloGoodbye extends EditCondition {
  get type(): ActionType {
    return ConditionTypeValues.HelloGoodbye;
  }

  @widget("bitfield")
  @name("Hello / Goodbye")
  flags: HelloGoodbyeFlags;

  constructor(flags: HelloGoodbyeFlags = 0) {
    super();
    this.flags = flags;
  }

  toCondition(editSet: EditDataSet, set: DataSet): Condition {
    return safeAssign(new ConditionHelloGoodbye(), {
      flags: this.flags,
    });
  }

  duplicate(): EditCondition {
    return new EditConditionHelloGoodbye(this.flags);
  }
}
