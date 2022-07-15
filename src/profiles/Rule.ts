import { serializable } from "../Serializable";

export default class Rule {
  @serializable(2)
  condition = 0;

  @serializable(2)
  actionOffset = 0;

  @serializable(2)
  actionCount = 0;

  @serializable(2)
  actionCountPadding = 0;
}
