# Pixels Web Package

This is the Pixels web package for front end web developers.
It enables communications between Pixels dice and a web browser
using Bluetooth Low Energy.

This package relies on the
[*Web Bluetooth API*](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)
for accessing Bluetooth.
At the time of writing, only Chrome, Edge and Opera browsers have
support for these APIs.

Currently all testing is done with the latest Chrome on Windows 10.

If you're on Linux, you may need to first set this flag to enable the Web
Bluetooth API:
`chrome://flags/#enable-experimental-web-platform-features`.
However be careful as it would be risky to browse the web with this flag turned on
as it enables many other experimental web platform features.

Starting with Chrome version 100, there will be a safer flag to use:
`chrome://flags/#enable-web-bluetooth`.

Please open a [ticket](https://github.com/GameWithPixels/PixelsWebPackage/issues)
in GitHub if you're having any issue.

This package is based on https://github.com/tomchen/example-typescript-package.

## Getting Started

To install the package:
```
npm i pixels-library
```

Start by calling the `requestPixel` function to request the user to
select a Pixel die to connect to.

This function returns a `Pixel` object.
Call the `connect` asynchronous method to initiate a Bluetooth
connection with the die.

The `Pixel` class has a number of methods to retrieve information about the die state.
It also let you add a listener for any Pixel message (as defined in `MessageTypeValues`).

Here is simple code example:

```TypeScript
// Ask user to select a Pixel
const pixel = await requestPixel();
log("Connecting...");
await pixel.connect();

// Get some info
const rollState = await pixel.getRollState();
log(`=> roll state: ${rollState.state}, face ${rollState.face}`);
const battery = await pixel.getBatteryLevel();
log(`=> battery: ${battery.level}, ${battery.voltage}v`);
const rssi = await pixel.getRssi();

// Add listener to get notified when the Pixel roll state changes
pixel.addEventListener("messageRollState", (ev: CustomEvent<MessageOrType>) => {
// Or: pixel.addMessageListener(MessageTypeValues.RollState, (ev: CustomEvent<MessageOrType>) => {
    const msg = ev.detail as RollState;
    log(`=> roll state: ${msg.state}, face ${msg.face}`);
}
```

## Module documentation

See the module's export documentation
[here](https://gamewithpixels.github.io/PixelsWebPackage/modules.html).

Documentation is generated with [TypeDoc](https://typedoc.org/).
