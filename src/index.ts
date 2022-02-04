// Package based on https://github.com/tomchen/example-typescript-package

// npm install -g typescript
// In %APPDATA%/npm remove or rename tsc.ps1
// npm install --save @types/web-bluetooth
// npm install color
// npm install --save @types/color

// Chrome: chrome://flags/#enable-experimental-web-platform-features
// /!\ This flag might need to be set multiple time depending on how your run chrome
// (normally v.s. from a debug session with VS Code for example)

import {
  serviceUuid,
  notifyCharacteristicUuid,
  writeCharacteristicUuid,
  Pixel,
  ConnectionEventValues,
  ConnectionEvent,
  ConnectionEventReasonValues,
  ConnectionEventReason,
  ConnectionEventData,
} from "./Pixel";

export {
  serviceUuid,
  notifyCharacteristicUuid,
  writeCharacteristicUuid,
  Pixel,
  ConnectionEventValues,
  ConnectionEvent,
  ConnectionEventReasonValues,
  ConnectionEventReason,
  ConnectionEventData,
};

import {
  MessageTypeValues,
  MessageType,
  Message,
  MessageOrType,
  getMessageName,
  serializeMessage,
  deserializeMessage,
  PixelDesignAndColorValues,
  PixelDesignAndColor,
  IAmADie,
  PixelRollStateValues,
  PixelRollState,
  RollState,
  PlaySound,
  Blink,
  BatteryLevel,
  Rssi,
} from "./Messages";

export {
  MessageTypeValues,
  MessageType,
  Message,
  MessageOrType,
  getMessageName,
  serializeMessage,
  deserializeMessage,
  PixelDesignAndColorValues,
  PixelDesignAndColor,
  IAmADie,
  PixelRollStateValues,
  PixelRollState,
  RollState,
  PlaySound,
  Blink,
  BatteryLevel,
  Rssi,
};
