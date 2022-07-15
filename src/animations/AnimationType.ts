import { enumValue } from "../utils";
//import { displayOrder, name, skipEnum } from "../edit/decorators";

export const AnimationTypeValues = {
  //@skipEnum
  Unknown: enumValue(0),
  //@name("Simple Flashes") @displayOrder(0)
  Simple: enumValue(),
  //@name("Colorful Rainbow") @displayOrder(1)
  Rainbow: enumValue(),
  //@name("Color LED Pattern") @displayOrder(3)
  Keyframed: enumValue(),
  //@name("Gradient LED Pattern") @displayOrder(4)
  GradientPattern: enumValue(),
  //@name("Simple Gradient") @displayOrder(2)
  Gradient: enumValue(),
} as const;

/** The "enum" type for {@link AnimationTypeValues}. */
export type AnimationType =
  typeof AnimationTypeValues[keyof typeof AnimationTypeValues];
