import DataSet from "../animations/DataSet";
import { safeAssign } from "../utils";
import EditCondition from "./EditCondition";
import EditDataSet from "./EditDataSet";
import { name, range, widget } from "./decorators";
import { ActionType } from "../profiles/ActionType";
import { ConditionTypeValues } from "../profiles/ConditionType";
import ConditionFaceCompare, {
  FaceCompareFlags,
} from "../profiles/ConditionFaceCompare";
import Condition from "../profiles/Condition";

export default class EditConditionFaceCompare extends EditCondition {
  get type(): ActionType {
    return ConditionTypeValues.FaceCompare;
  }

  @widget("bitfield")
  @name("Comparison")
  flags: FaceCompareFlags;

  @widget("faceIndex")
  @range(0, 19)
  @name("Than")
  faceIndex: number;

  constructor(flags: FaceCompareFlags = 0, faceIndex = 0) {
    super();
    this.flags = flags;
    this.faceIndex = faceIndex;
  }

  toCondition(editSet: EditDataSet, set: DataSet): Condition {
    return safeAssign(new ConditionFaceCompare(), {
      faceIndex: this.faceIndex,
      flags: this.flags,
    });
  }

  duplicate(): EditCondition {
    return new EditConditionFaceCompare(this.flags, this.faceIndex);
  }
}
