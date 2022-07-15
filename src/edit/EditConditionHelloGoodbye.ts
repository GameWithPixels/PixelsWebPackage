import DataSet from "../animations/DataSet";
import { safeAssign } from "../utils";
import EditCondition from "./EditCondition";
import EditDataSet from "./EditDataSet";
import { name, widget } from "./decorators";
import { ActionType } from "../profiles/ActionType";
import { ConditionTypeValues } from "../profiles/ConditionType";
import ConditionHelloGoodbye, {
  HelloGoodbyeFlags,
} from "../profiles/ConditionHelloGoodbye";
import Condition from "../profiles/Condition";

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
