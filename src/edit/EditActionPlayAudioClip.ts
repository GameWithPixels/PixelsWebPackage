import DataSet from "../animations/DataSet";
import { safeAssign } from "../utils";
import EditAction from "./EditAction";
import EditAudioClip from "./EditAudioClip";
import EditDataSet from "./EditDataSet";
import { name } from "./decorators";
import { ActionType, ActionTypeValues } from "../profiles/ActionType";
import Action from "../profiles/Action";
import ActionPlayAudioClip from "../profiles/ActionPlayAudioClip";

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
