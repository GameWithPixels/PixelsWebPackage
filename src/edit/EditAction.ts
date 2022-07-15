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
    oldAnimation: EditAnimation,
    newAnimation: EditAnimation
  ): void {}

  requiresAnimation(animation: EditAnimation): boolean {
    return false;
  }

  collectAnimations(): EditAnimation[] {
    return [];
  }
}
