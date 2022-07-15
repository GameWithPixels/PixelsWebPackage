import DataSet from "../animations/DataSet";
import {
  Action,
  ActionPlayAudioClip,
  ActionType,
  ActionTypeValues,
} from "../profiles/actions";
import { safeAssign } from "../utils";
import EditAction from "./EditAction";
import EditAudioClip from "./EditAudioClip";
import EditDataSet from "./EditDataSet";
import { name } from "./decorators";

export default class EditActionPlayAudioClip extends EditAction {
  @name("Audio Clip")
  clip?: EditAudioClip;

  constructor(clip?: EditAudioClip) {
    super();
    this.clip = clip;
  }

  get type(): ActionType {
    return ActionTypeValues.PlayAnimation;
  }

  toAction(editSet: EditDataSet, set: DataSet): Action {
    return safeAssign(new ActionPlayAudioClip(), {
      clipId: this.clip?.id ?? 0,
    });
  }

  duplicate(): EditAction {
    return new EditActionPlayAudioClip(this.clip);
  }
}
