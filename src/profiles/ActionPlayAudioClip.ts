import { serializable } from "../Serializable";
import Action from "./Action";
import { ActionType, ActionTypeValues } from "./ActionType";

/// <summary>
/// Action to play a sound!
/// </summary>
export default class ActionPlayAudioClip implements Action {
  @serializable(1, { padding: 1 })
  type: ActionType = ActionTypeValues.PlayAudioClip;

  @serializable(2)
  clipId = 0;
}
