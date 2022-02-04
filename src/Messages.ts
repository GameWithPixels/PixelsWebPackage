import { enumVal } from "./Utils";

/**
 * Lists all the Pixel dice message types.
 * The value is used for the first byte of data in a Pixel message to identify it's type.
 * These message identifiers have to match up with the ones on the firmware.
 * @enum
 */
export const MessageTypeValues = {
  None: enumVal(0),
  WhoAreYou: enumVal(),
  IAmADie: enumVal(),
  RollState: enumVal(),
  Telemetry: enumVal(),
  BulkSetup: enumVal(),
  BulkSetupAck: enumVal(),
  BulkData: enumVal(),
  BulkDataAck: enumVal(),
  TransferAnimationSet: enumVal(),
  TransferAnimationSetAck: enumVal(),
  TransferAnimationSetFinished: enumVal(),
  TransferSettings: enumVal(),
  TransferSettingsAck: enumVal(),
  TransferSettingsFinished: enumVal(),
  TransferTestAnimationSet: enumVal(),
  TransferTestAnimationSetAck: enumVal(),
  TransferTestAnimationSetFinished: enumVal(),
  DebugLog: enumVal(),
  PlayAnimation: enumVal(),
  PlayAnimationEvent: enumVal(),
  StopAnimation: enumVal(),
  PlaySound: enumVal(),
  RequestRollState: enumVal(),
  RequestAnimationSet: enumVal(),
  RequestSettings: enumVal(),
  RequestTelemetry: enumVal(),
  ProgramDefaultAnimationSet: enumVal(),
  ProgramDefaultAnimationSetFinished: enumVal(),
  Blink: enumVal(),
  BlinkFinished: enumVal(),
  RequestDefaultAnimationSetColor: enumVal(),
  DefaultAnimationSetColor: enumVal(),
  RequestBatteryLevel: enumVal(),
  BatteryLevel: enumVal(),
  RequestRssi: enumVal(),
  Rssi: enumVal(),
  Calibrate: enumVal(),
  CalibrateFace: enumVal(),
  NotifyUser: enumVal(),
  NotifyUserAck: enumVal(),
  TestHardware: enumVal(),
  SetStandardState: enumVal(),
  SetLEDAnimationState: enumVal(),
  SetBattleState: enumVal(),
  ProgramDefaultParameters: enumVal(),
  ProgramDefaultParametersFinished: enumVal(),
  SetDesignAndColor: enumVal(),
  SetDesignAndColorAck: enumVal(),
  SetCurrentBehavior: enumVal(),
  SetCurrentBehaviorAck: enumVal(),
  SetName: enumVal(),
  SetNameAck: enumVal(),

  // Testing
  TestBulkSend: enumVal(),
  TestBulkReceive: enumVal(),
  SetAllLEDsToColor: enumVal(),
  AttractMode: enumVal(),
  PrintNormals: enumVal(),
  PrintA2DReadings: enumVal(),
  LightUpFace: enumVal(),
  SetLEDToColor: enumVal(),
  DebugAnimationController: enumVal(),
} as const;

/** The "enum" type for {@link MessageTypeValues}. */
export type MessageType = typeof MessageTypeValues[keyof typeof MessageTypeValues];

/**
 * Base type for all Pixels messages.
 * Note: messages that have no specific data don't require a class,
 * a {@link MessageTypeValue} is used instead.
 */
export interface Message {
  /** Type of the message. */
  readonly type: MessageType;
}

/**
 * Union type of {@link Message} and {@link MessageType} types.
 * Messages without parameter have no {@link Message} class to represent them,
 * instead they are represent by the corresponding {@link MessageTypeValue}.
 */
export type MessageOrType = Message | MessageType;

/**
 * Gets the message type of the given message or message type value.
 * @param msgOrType A message or a message type value.
 * @returns The message type.
 */
export function getMessageType(msgOrType: MessageOrType): MessageType {
  return typeof msgOrType === "number" ? msgOrType : msgOrType.type;
}

/**
 * Type predicate for {@link Message} class.
 * @param obj Any object.
 * @returns Whether the given object is a {@link Message}.
 */
export function isMessage(obj: unknown): obj is Message {
  return (obj as Message).type !== undefined;
}

/**
 * Get the message name (as listed in {@link MessageTypeValues}).
 * @param msgOrType A message or a message type value.
 * @returns The message name.
 */
export function getMessageName(msgOrType: MessageOrType): keyof typeof MessageTypeValues {
  const msgType = getMessageType(msgOrType);
  for (const [key, value] of Object.entries(MessageTypeValues)) {
    if (value === msgType) {
      return key as keyof typeof MessageTypeValues;
    }
  }
  throw Error(`${msgType} is not a value in ${MessageTypeValues}`);
}

/**
 * Serialize the given Pixel message.
 * @param msgOrType A message or a message type value.
 * @returns The serialized data.
 */
export function serializeMessage(msgOrType: MessageOrType): Uint8Array {
  if (typeof msgOrType === "number") {
    return Uint8Array.of(msgOrType);
  } else {
    const msg = msgOrType as Blink;
    const dataView = new DataView(new ArrayBuffer(8));
    dataView.setUint8(0, msg.type);
    dataView.setUint8(1, msg.flashCount);
    dataView.setUint32(2, msg.color, true);
    dataView.setUint16(6, msg.duration, true);
    return new Uint8Array(dataView.buffer);
  }
}

/**
 * Attempts to deserialize the data of the given buffer into a Pixel message.
 * @param buffer The data to deserialize the message from.
 * @returns The deserialized message or just its type value (for messages with no class).
 */
export function deserializeMessage(buffer: ArrayBuffer): MessageOrType {
  if (!buffer?.byteLength) {
    throw new Error("Empty buffer");
  }

  // Get the data view
  const dataView = new DataView(buffer);

  // Helpers to read the data sequentially
  let index = 0;
  function incAndRet<T>(v: T, inc: number) {
    index += inc;
    return v;
  }
  // Note: serialization needs to have little endianness
  const readU8 = () => incAndRet(dataView.getUint8(index), 1);
  const readU16 = () => incAndRet(dataView.getUint16(index, true), 2);
  const readU32 = () => incAndRet(dataView.getUint32(index, true), 4);
  const readFloat = () => incAndRet(dataView.getFloat32(index, true), 4);
  // Can only be called last as it reads through the end of the buffer
  function readString() {
    const str = new TextDecoder().decode(dataView.buffer.slice(index));
    const c = str.indexOf("\0"); // We might have trailing null characters
    return c >= 0 ? str.substring(0, c) : str;
  }

  // First byte is message type
  const msgType = readU8();
  switch (msgType) {
    case MessageTypeValues.IAmADie:
      const diceType = readU8();
      const designAndColor = readU8();
      index += 1;
      const dataSetHash = readU32();
      const deviceId = readU32();
      const flashSize = readU16();
      const version = readString();
      return new IAmADie(diceType, designAndColor, dataSetHash, deviceId, flashSize, version);

    case MessageTypeValues.RollState:
      const state = readU8();
      const face = readU8() + 1;
      return new RollState(state, face);

    case MessageTypeValues.PlaySound:
      const clipId = readU16();
      return new PlaySound(clipId);

    case MessageTypeValues.BatteryLevel:
      const level = readFloat();
      const voltage = readFloat();
      const charging = readU8() != 0;
      return new BatteryLevel(level, voltage, charging);

    case MessageTypeValues.Rssi:
      const value = readU16();
      return new Rssi(value);

    default:
      // Any other message
      return msgType;
  }
}

/**
 * Available combinations of Pixel designs and colors.
 * @enum
 */
export const PixelDesignAndColorValues = {
  Unknown: enumVal(0),
  Generic: enumVal(),
  V3_Orange: enumVal(),
  V4_BlackClear: enumVal(),
  V4_WhiteClear: enumVal(),
  V5_Grey: enumVal(),
  V5_White: enumVal(),
  V5_Black: enumVal(),
  V5_Gold: enumVal(),
  Onyx_Back: enumVal(),
  Hematite_Grey: enumVal(),
  Midnight_Galaxy: enumVal(),
  Aurora_Sky: enumVal(),
} as const;

/** The "enum" type for {@link PixelDesignAndColorValues}. */
export type PixelDesignAndColor =
  typeof PixelDesignAndColorValues[keyof typeof PixelDesignAndColorValues];

/** Message send by a Pixel after receiving a "WhoAmI". */
export class IAmADie implements Message {
  readonly type: MessageType = MessageTypeValues.IAmADie;

  readonly diceType: number;
  readonly designAndColor: PixelDesignAndColor;
  readonly dataSetHash: number;
  readonly pixelId: number;
  readonly flashSize: number;
  readonly version: string;

  constructor(
    diceType: number,
    designAndColor: PixelDesignAndColor,
    dataSetHash: number,
    pixelId: number,
    flashSize: number,
    version: string
  ) {
    this.diceType = diceType;
    this.designAndColor = designAndColor;
    this.dataSetHash = dataSetHash;
    this.pixelId = pixelId;
    this.flashSize = flashSize;
    this.version = version;
  }
}

/**
 * Pixel roll states.
 * @enum
 */
export const PixelRollStateValues = {
  // The Pixel roll state could not be determined.
  Unknown: enumVal(0),

  // The Pixel is resting in a position with a face up.
  OnFace: enumVal(),

  // The Pixel is being handled.
  Handling: enumVal(),

  // The Pixel is rolling.
  Rolling: enumVal(),

  // The Pixel is resting in a crooked position.
  Crooked: enumVal(),
} as const;

/** The "enum" type for {@link PixelRollStateValues}. */
export type PixelRollState = typeof PixelRollStateValues[keyof typeof PixelRollStateValues];

/** Message send by a Pixel to notify of its rolling state. */
export class RollState implements Message {
  readonly type: MessageType = MessageTypeValues.RollState;

  /** Current roll state. */
  readonly state: PixelRollState;

  /** Face number (if applicable), starts at 1. */
  readonly face: number;

  /** Instantiates a roll state message from a {@link PixelRollStateValues} and face number. */
  constructor(state: PixelRollState, face: number) {
    this.state = state;
    this.face = face;
  }
}

/** Message send by a Pixel to request playing a specific sound clip. */
export class PlaySound implements Message {
  readonly type: MessageType = MessageTypeValues.PlaySound;

  /** The id for the clip. */
  readonly clipId: number;

  /** Instantiates a play sound message from a clip id. */
  constructor(clipId: number) {
    this.clipId = clipId;
  }
}

/** Message send to a Pixel to have it blink its LEDs. */
export class Blink implements Message {
  readonly type: MessageType = MessageTypeValues.Blink;

  /** Number of flashes. */
  readonly flashCount: number;

  /** Color to blink. */
  readonly color: number;

  /** Total duration in milliseconds. */
  readonly duration: number;

  /** Instantiates a blink message from a flash count, color and total duration in milliseconds. */
  constructor(flashCount: number, color: number, duration: number) {
    this.flashCount = flashCount;
    this.color = color;
    this.duration = duration;
  }
}

/** Message send by a Pixel to notify of its battery level and state. */
export class BatteryLevel implements Message {
  readonly type: MessageType = MessageTypeValues.BatteryLevel;

  /** The battery charge level, floating value between 0 and 1. */
  readonly level: number;

  /** The battery measured voltage. */
  readonly voltage: number;

  /** Whether the battery is charging. */
  readonly charging: boolean;

  /** Instantiates a battery level message from a battery level, voltage and charging state. */
  constructor(level: number, voltage: number, charging: boolean) {
    this.level = level;
    this.voltage = voltage;
    this.charging = charging;
  }
}

/** Message send by a Pixel to notify of its measured RSSI. */
export class Rssi implements Message {
  readonly type: MessageType = MessageTypeValues.Rssi;

  /** The RSSI value, between 0 and 65535. */
  readonly rssi: number;

  /** Instantiates a rssi message from a RSSI value. */
  constructor(rssi: number) {
    this.rssi = rssi;
  }
}
