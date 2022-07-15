import { serializable } from "../Serializable";

export default class Profile {
  @serializable(2)
  rulesOffset = 0;

  @serializable(2)
  rulesCount = 0;
}
