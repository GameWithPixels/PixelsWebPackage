import DataSet from "../animations/DataSet";
import { ActionType } from "../profiles/actions";
import {
  Condition,
  ConditionFaceCompare,
  ConditionTypeValues,
  FaceCompareFlags,
} from "../profiles/conditions";
import { safeAssign } from "../utils";
import EditCondition from "./EditCondition";
import EditDataSet from "./EditDataSet";
import { name, range, widget } from "./decorators";

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
