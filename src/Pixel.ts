import {
  MessageTypeValues,
  MessageType,
  MessageOrType,
  getMessageType,
  isMessage,
  getMessageName,
  serializeMessage,
  deserializeMessage,
  IAmADie,
  RollState,
  BatteryLevel,
  Rssi,
  Blink,
} from "./Messages";

import { exponentialBackOff, Mutex } from "./Utils";

/** Pixel dice service UUID. */
export const serviceUuid = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";

/** Pixel dice notify characteristic UUID. */
export const notifyCharacteristicUuid = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";

/** Pixel dice write characteristic UUID. */
export const writeCharacteristicUuid = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";

/**
 * Available dice types.
 * @enum
 */
export const DiceTypeValues = {
  D4: "d4",
  D6: "d6",
  D8: "d8",
  D10: "d10",
  D00: "d00",
  D12: "d12",
  D20: "d20",
} as const;

/** The "enum" type for  {@link DiceTypeValues}. */
export type DiceType = typeof DiceTypeValues[keyof typeof DiceTypeValues];

/**
 * Peripheral connection events.
 * @enum
 */
export const ConnectionEventValues = {
  /** Raised at the beginning of the connect sequence and is followed either by Connected or FailedToConnect. */
  Connecting: "connecting",

  /** Raised once the peripheral is connected, just before services are being discovered. */
  Connected: "connected",

  /** Raised when the peripheral fails to connect, the reason for the failure is also given. */
  FailedToConnect: "failedToConnect",

  /** Raised after a Connected event, once the required services have been discovered. */
  Ready: "ready",

  /** Raised at the beginning of a user initiated disconnect. */
  Disconnecting: "disconnecting",

  /** Raised when the peripheral is disconnected, the reason for the disconnection is also given. */
  Disconnected: "disconnected",
} as const;

/** The "enum" type for  {@link ConnectionEventValues}. */
export type ConnectionEvent = typeof ConnectionEventValues[keyof typeof ConnectionEventValues];

/**
 * Peripheral connection event reasons.
 * @enum
 */
export const ConnectionEventReasonValues = {
  /** Unused at the moment - The disconnect happened for an unknown reason. */
  Unknown: "unknown",

  /** The disconnect was initiated by user. */
  Success: "success",

  /** Unused at the moment - Connection attempt canceled by user. */
  Canceled: "canceled",

  /** Unused at the moment -  Peripheral doesn't have all required services. */
  NotSupported: "notSupported",

  /** Peripheral didn't responded in time. */
  Timeout: "timeout",

  /** Peripheral was disconnected while in "auto connect" mode. */
  LinkLoss: "linkLoss",

  /** Unused at the moment - The local device Bluetooth adapter is off. */
  AdapterOff: "adapterOff",

  /** Unused at the moment -  Disconnection was initiated by peripheral. */
  Peripheral: "peripheral",
} as const;

/** The "enum" type for {@link ConnectionEventReasonValues}. */
export type ConnectionEventReason =
  typeof ConnectionEventReasonValues[keyof typeof ConnectionEventReasonValues];

/** Type for "ConnectionEvent" events */
export interface ConnectionEventData {
  event: ConnectionEvent;
  reason: ConnectionEventReason;
}

/** Event map for {@link Pixel} class. */
export interface PixelEventMap {
  message: CustomEvent<MessageOrType>;
  connectionEvent: CustomEvent<ConnectionEventData>;
}

//TODO
interface PixelCustomEventMap {
  message: MessageOrType;
  connectionEvent: ConnectionEventData;
}

export interface Pixel extends EventTarget {
  addEventListener<K extends keyof PixelEventMap>(
    type: K,
    listener: (this: Pixel, ev: PixelEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: `message${keyof typeof MessageTypeValues}`,
    listener: (this: Pixel, ev: CustomEvent<MessageOrType>) => void,
    options?: boolean | AddEventListenerOptions
  ): void;
  // addEventListener(
  //   type: string,
  //   listener: EventListenerOrEventListenerObject,
  //   options?: boolean | AddEventListenerOptions
  // ): void;
  removeEventListener<K extends keyof PixelEventMap>(
    type: K,
    listener: (this: Pixel, ev: PixelEventMap[K]) => void,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: `message${keyof typeof MessageTypeValues}`,
    listener: (this: Pixel, ev: CustomEvent<MessageOrType>) => void,
    options?: boolean | AddEventListenerOptions
  ): void;
  // removeEventListener(
  //   type: string,
  //   listener: EventListenerOrEventListenerObject,
  //   options?: boolean | EventListenerOptions
  // ): void;
}

/**
 * Represents a Pixel die.
 * Most of its methods require that the instance is connected to the Pixel device.
 * Call the {@link connect} method to initiate a connection.
 */
export class Pixel extends EventTarget {
  // Store Pixel instances to avoid creating more than one for the same device
  static _pixels = new Map<BluetoothDevice, Pixel>();

  /**
   * Request user to select a Pixel to connect to.
   * Pixels instances are kept and returned if the same die is selected again.
   * @param connEv The connection event callback.
   * @returns A promise that resolves to a {@link Pixel} instance.
   */
  static async requestPixel(): Promise<Pixel> {
    if (!navigator?.bluetooth?.requestDevice) {
      throw {
        name: "NotSupportedError",
        message:
          "Bluetooth is not available, check that you're running in a secure environment " +
          "and that Web Bluetooth is enabled.",
      };
    }
    // Request user to select a Pixel
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [serviceUuid] }],
    });
    // Keep Pixel instances
    let pixel = Pixel._pixels.get(device);
    if (!pixel) {
      pixel = new Pixel(device);
      Pixel._pixels.set(device, pixel);
    }
    return pixel;
  }

  // Private members
  private readonly _device: BluetoothDevice;
  private readonly _name: string;
  private readonly _connMtx = new Mutex();
  private _connected = false;
  private _connecting = false;
  private _reconnect = false;
  private _session?: Session = undefined;
  private _info?: IAmADie = undefined;

  /** Gets the Pixel name. */
  get name(): string {
    return this._name;
  }

  /** Indicates whether the Pixel is connected. */
  get connected(): boolean {
    return this._connected && (this._device.gatt?.connected ?? false);
  }

  get initializing(): boolean {
    return this._connecting || (this.connected && !this.ready);
  }

  /** Indicates whether the Pixel is ready. */
  get ready(): boolean {
    return this.connected && this._info !== undefined;
  }

  /** Gets the Pixel information, or undefined if not connected. */
  get info(): IAmADie | undefined {
    return this._info;
  }

  get type(): DiceType | undefined {
    return this.info ? DiceTypeValues.D20 : undefined;
  }

  /**
   * Instantiates a Pixel from a Bluetooth device.
   * @param device The Bluetooth device to use.
   */
  constructor(device: BluetoothDevice) {
    super();
    this._device = device;
    if (!device.name) {
      throw {
        name: "NetworkError",
        message: "Bluetooth device has no name",
      };
    }

    // Store name and connection event handler
    this._name = device.name;

    // Subscribe to disconnect event
    device.addEventListener("gattserverdisconnected", (/*ev: Event*/) => {
      this.log("Disconnected!");

      let reason: ConnectionEventReason = ConnectionEventReasonValues.Success;
      if (this._connected) {
        // Disconnect not called by user code
        reason = this._reconnect
          ? ConnectionEventReasonValues.LinkLoss
          : ConnectionEventReasonValues.Timeout;
      }

      // Automatically reconnect?
      // We're still running the connection code if _info is undefined
      const reconnect = this._reconnect && this._info !== undefined;

      // Reset internal state
      this._connected = false;
      this._session = undefined; // Note: we shouldn't need to unsubscribe since we got disconnected anyways
      this._info = undefined;

      // Notify disconnection
      this.notifyConnEv(ConnectionEventValues.Disconnected, reason);

      if (reconnect) {
        // Schedule a reconnect
        // Note: it's probably best to avoid reconnecting directly from a disconnect event
        this.log("Auto-reconnecting");
        setTimeout(async () => {
          try {
            await this.reconnect();
          } catch {
            // Catch all errors, nothing we can do about them
          }
        });
      }
    });
  }

  /**
   * Asynchronously connects to the Pixel.
   * Throws a `NetworkError` or an `AbortError` on failure to connect,
   * other errors may be thrown on rare occasions.
   * @param autoReconnect Wether to automatically try to reconnect to the Pixel when the connection is lost.
   * @returns A promise resolving to this instance.
   */
  async connect(autoReconnect = false): Promise<Pixel> {
    this._reconnect = autoReconnect;
    await this.reconnect();
    return this;
  }

  // Internal connect method
  private async reconnect(): Promise<void> {
    // Our connect function
    const doConnect = async () => {
      const server = this._device.gatt;
      if (server) {
        if (!server.connected) {
          // Attempt to connect.
          this._connecting = true;
          try {
            this.log("Connecting");
            this.notifyConnEv(ConnectionEventValues.Connecting);
            await server.connect();
          } finally {
            this._connecting = false;
          }
          // Notify connected
          this._connected = true;
          this.notifyConnEv(ConnectionEventValues.Connected);
        }

        // Use a mutex to prevent creating multiple sessions
        let info: IAmADie | undefined = undefined;
        await this._connMtx.dispatch(async () => {
          if (!this._session) {
            // Create session
            this.log("Getting service and characteristics");
            const service = await server.getPrimaryService(serviceUuid);
            const notifyCharacteristic = await service.getCharacteristic(notifyCharacteristicUuid);
            const writeCharacteristic = await service.getCharacteristic(writeCharacteristicUuid);
            this._session = new Session(
              service,
              notifyCharacteristic,
              writeCharacteristic,
              this.log.bind(this)
            );

            this.log("Subscribing");
            await this._session.subscribe((dv: DataView) => this.onValueChanged(dv));

            // Identify Pixel
            this.log("Waiting on identification message");
            const response = await this.sendAndWaitForMsg(
              MessageTypeValues.WhoAreYou,
              MessageTypeValues.IAmADie
            );

            if (!this._session) {
              throw {
                name: "NetworkError",
                message: "Got disconnected while identifying",
              };
            }

            this._info = info = response as IAmADie;
          }
        });
        if (info && this._info === info) {
          // Notify ready
          this.log("Ready");
          this.notifyConnEv(ConnectionEventValues.Ready);
        }
      } else {
        throw {
          name: "NetworkError",
          message: "No GATT Server, check Bluetooth permissions",
        };
      }
    };

    // Attempt to connect multiple times when autoReconnect is true
    const autoReconnect = this._reconnect;
    // Prevent another automatic reconnection to happen while already doing it
    this._reconnect = false;
    await exponentialBackOff({
      retries: autoReconnect ? 4 : 0,
      delay: 2,
      executor: doConnect,
      resolved: () => {
        // Restore auto reconnect flag ony if successful
        this._reconnect = autoReconnect;
      },
      failed: (error) => {
        this.log(`Failed to ${autoReconnect ? "re" : ""}connect with error: ${error}`);
        this.notifyConnEv(
          ConnectionEventValues.FailedToConnect,
          ConnectionEventReasonValues.Timeout
        );
        throw error;
      },
    });
  }

  /** Immediately disconnects from the Pixel. */
  disconnect(): void {
    const server = this._device.gatt;
    if (server?.connected) {
      this.notifyConnEv(ConnectionEventValues.Disconnecting);
      this._connected = false;
      server.disconnect();
    }
  }

  /**
   * Register a listener to be invoked on receiving messages of a given type.
   * This helper method calls {@link addEventListener}.
   *
   * @param msgType The type of message to watch for.
   * @param listener The listener that will be invoked when a message of the given type is received.
   * @param options Usual event listener options.
   */
  addMessageListener(
    msgType: MessageType,
    listener: (this: Pixel, ev: CustomEvent<MessageOrType>) => void,
    options?: AddEventListenerOptions | boolean
  ): void {
    this.addEventListener(`message${getMessageName(msgType)}`, listener, options);
  }

  /**
   * Unregister a listener invoked on receiving messages of the same type and options.
   * This helper method calls {@link removeEventListener}.
   *
   * @param msgType The type of message to watch for.
   * @param listener The listener to unregister.
   * @param options Usual event listener options.
   */
  removeMessageListener(
    msgType: MessageType,
    listener: (this: Pixel, ev: CustomEvent) => void,
    options?: EventListenerOptions | boolean
  ): void {
    this.removeEventListener(`message${getMessageName(msgType)}`, listener, options);
  }

  /**
   * Asynchronously retrieves the roll state.
   * @returns A promise revolving to an object with the roll state information.
   */
  async getRollState(): Promise<RollState> {
    const response = await this.sendAndWaitForMsg(
      MessageTypeValues.RequestRollState,
      MessageTypeValues.RollState
    );
    return response as RollState;
  }

  /**
   * Asynchronously gets the battery level.
   * @returns A promise revolving to an object with the batter level information.
   */
  async getBatteryLevel(): Promise<BatteryLevel> {
    const response = await this.sendAndWaitForMsg(
      MessageTypeValues.RequestBatteryLevel,
      MessageTypeValues.BatteryLevel
    );
    return response as BatteryLevel;
  }

  /**
   * Asynchronously gets the RSSI.
   * @returns A promise revolving to the RSSI value, between 0 and 65535.
   */
  async getRssi(): Promise<number> {
    const response = await this.sendAndWaitForMsg(
      MessageTypeValues.RequestRssi,
      MessageTypeValues.Rssi
    );
    return (response as Rssi).rssi;
  }

  /**
   * Requests the Pixel to blink and wait for a confirmation.
   * @param color Blink color.
   * @param count Number of blinks.
   * @param duration Total duration in milliseconds.
   * @returns A promise.
   */
  async blink(color: number, count: number, duration = 3000): Promise<void> {
    await this.sendAndWaitForMsg(
      new Blink(count, color, duration),
      MessageTypeValues.BlinkFinished
    );
  }

  // Log the given message prepended with a timestamp and the Pixel name
  private log(msg: unknown): void {
    if (isMessage(msg)) {
      console.log(msg);
    } else {
      console.log(`[Pixel ${this._name}] ${msg}`);
    }
  }

  // Type-safe dispatch
  private dispatchCustomEv<K extends keyof PixelCustomEventMap>(
    type: K,
    data: PixelCustomEventMap[K]
  ): boolean {
    return super.dispatchEvent(new CustomEvent<PixelCustomEventMap[K]>(type, { detail: data }));
  }

  // Notify of connection event
  private notifyConnEv(
    connEv: ConnectionEvent,
    reason: ConnectionEventReason = ConnectionEventReasonValues.Success
  ): boolean {
    return this.dispatchCustomEv("connectionEvent", { event: connEv, reason: reason });
  }

  // Callback on notify characteristic value change
  private onValueChanged(dataView: DataView) {
    try {
      const msgOrType = deserializeMessage(dataView.buffer);
      if (msgOrType) {
        this.log(`Received message of type ${getMessageType(msgOrType)}`);
        if (typeof msgOrType !== "number") {
          // Log message contents
          this.log(msgOrType);
        }
        // Dispatch generic message event
        this.dispatchCustomEv("message", msgOrType);
        // Dispatch specific message event
        const name = `message${getMessageName(msgOrType)}`;
        this.dispatchEvent(new CustomEvent(name, { detail: msgOrType }));
      } else {
        this.log("Received invalid message!");
      }
    } catch (error) {
      this.log("ValueChanged error: " + error);
    }
  }

  // Helper method that waits for a message from Pixel
  private waitForMsg(expectedMsgType: MessageType, timeoutMs = 5000): Promise<MessageOrType> {
    return new Promise((resolve, reject) => {
      const onMessage = (evt: CustomEvent<MessageOrType>) => {
        resolve(evt.detail);
      };
      setTimeout(() => {
        this.removeMessageListener(expectedMsgType, onMessage);
        reject(new Error("Timeout waiting on message"));
      }, timeoutMs);
      this.addMessageListener(expectedMsgType, onMessage, { once: true });
    });
  }

  // Helper method that sends a message and wait for a reply
  private async sendAndWaitForMsg(
    msgOrTypeToSend: MessageOrType,
    expectedMsgType: MessageType,
    timeoutMs = 5000
  ): Promise<MessageOrType> {
    // Get the session object, throws an error if invalid
    const session = this._session;
    if (!session) {
      throw {
        name: "NetworkError",
        message: "Pixel not ready",
      };
    }
    const result = await Promise.all([
      this.waitForMsg(expectedMsgType, timeoutMs),
      session.send(msgOrTypeToSend),
    ]);
    return result[0];
  }
}

// A Bluetooth session with a Pixel die
class Session {
  private readonly _service: BluetoothRemoteGATTService;
  private readonly _notify: BluetoothRemoteGATTCharacteristic;
  private readonly _write: BluetoothRemoteGATTCharacteristic;
  private readonly log: (msg: unknown) => void;

  constructor(
    service: BluetoothRemoteGATTService,
    notifyCharacteristic: BluetoothRemoteGATTCharacteristic,
    writeCharacteristic: BluetoothRemoteGATTCharacteristic,
    logFunc: (msg: unknown) => void
  ) {
    this._service = service;
    this._notify = notifyCharacteristic;
    this._write = writeCharacteristic;
    this.log = logFunc;
  }

  // Subscribes to notify characteristic and returns unsubscribe function
  async subscribe(listener: (dataView: DataView) => void): Promise<() => void> {
    function internalListener(this: BluetoothRemoteGATTCharacteristic /*, ev: Event*/) {
      if (this.value?.buffer?.byteLength) {
        listener(this.value);
      }
    }
    this._notify.addEventListener("characteristicvaluechanged", internalListener);
    await this._notify.startNotifications();
    return () => {
      this._notify.removeEventListener("characteristicvaluechanged", internalListener);
    };
  }

  // Sends a message
  async send(msgOrType: MessageOrType, withoutResponse?: boolean) {
    this.log(`Sending message of type ${getMessageType(msgOrType)}`);
    const data = serializeMessage(msgOrType);
    const promise = withoutResponse
      ? this._write.writeValueWithoutResponse(data)
      : this._write.writeValueWithResponse(data);
    await promise;
  }
}