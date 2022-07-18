import DataSet from "../animations/DataSet";
import EditAnimation from "./EditAnimation";
import EditDataSet from "./EditDataSet";
import Editable from "./Editable";
import { ActionType } from "../profiles/ActionType";
import Action from "../profiles/Action";

export default abstract class EditAction extends Editable {
  abstract get type(): ActionType;
  abstract toAction(editSet: EditDataSet, set: DataSet): Action;
  abstract duplicate(): EditAction;

  replaceAnimation(
    _oldAnimation: EditAnimation,
    _newAnimation: EditAnimation
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ): void {}

  requiresAnimation(_animation: EditAnimation): boolean {
    return false;
  }

  collectAnimations(): EditAnimation[] {
    return [];
  }
}
