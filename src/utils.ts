let _enumValue = 0;

/**
 * Number generator for enums.
 *
 * A note about enums:
 * Typescript documentation recommends using "as const" over "enum".
 * See https://www.typescriptlang.org/docs/handbook/enums.html#objects-vs-enums
 */
export function enumValue(initialValue?: number): number {
  if (initialValue !== undefined) {
    _enumValue = initialValue;
  }
  return _enumValue++;
}

let _enumFlag = 0;

/**
 * Number generator for enum flags.
 *
 * A note about enums:
 * Typescript documentation recommends using "as const" over "enum".
 * See https://www.typescriptlang.org/docs/handbook/enums.html#objects-vs-enums
 */
export function enumFlag(initialValue?: number): number {
  if (initialValue !== undefined) {
    _enumFlag = initialValue;
  }
  const flag = 1 << _enumFlag;
  _enumFlag += 1;
  return flag;
}

/**
 * Return the name corresponding to a given Pixel enum value.
 */
export function getPixelEnumName<EnumType>(
  value: EnumType,
  enumValues: { [s: string]: EnumType }
): string | undefined {
  for (const [key, val] of Object.entries(enumValues)) {
    if (val === value) {
      return key;
    }
  }
}

/** Parameters for {@link exponentialBackOff}. */
export type ExponentialBackOffParams = {
  retries: number;
  delay: number;
  executor: () => Promise<unknown>;
  resolved?: (result: unknown) => void;
  failed?: (error: unknown) => void;
};

/**
 * This function keeps calling the executor until the promise it returns has resolved
 * or it has reached the maximum number or retries.
 * A retry is attempted after getting an exception from the executor and once past the given
 * delay (starting at the time of the exception).
 *
 * See auto-reconnect code from Google:
 * https://googlechrome.github.io/samples/web-bluetooth/automatic-reconnect-async-await.html
 *
 * @param retries Maximum number of retries.
 * @param delay Delay in seconds between getting an exception and attempting a retry.
 * @param executor The function to run. It should return a promise and raise an exception
 *                 if there unsuccessful.
 * @param resolved Called with the value returned by the resolved promise.
 * @param failed Called all retries have failed.
 */
export async function exponentialBackOff({
  retries,
  delay,
  executor,
  resolved = undefined,
  failed = undefined,
}: ExponentialBackOffParams): Promise<void> {
  try {
    const result = await executor();
    if (resolved) {
      resolved(result);
    }
  } catch (error) {
    if (retries !== 0) {
      //console.log(`Retrying in ${delay}s... (${retries} tries left)`);
      const delay_ = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));
      await delay_(delay * 1000);
      await exponentialBackOff({
        retries: retries - 1,
        delay: delay * 2,
        executor,
        resolved,
        failed,
      });
    } else if (failed) {
      //console.log(`Got error ${error}`);
      failed(error);
    }
  }
}

/**
 * A Mutex class using Promises.
 *
 * See https://spin.atomicobject.com/2018/09/10/javascript-concurrency/
 */
export class Mutex {
  private mutex = Promise.resolve();

  // Lock the mutex and return the function to unlock it
  lock(): Promise<() => void> {
    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    let executor = (_resolve: () => void) => {};

    // Update the mutex (note: the fulfillment handler will be called asynchronously)
    this.mutex = this.mutex.then(() => {
      // This is called asynchronously, once the promise below has run
      // so "executor" has already been updated to the resolution handler
      // of the promised returned by lock()
      // This promise will resolve only once the function returned by the lock()
      // promise is run
      return new Promise(executor);
    });

    // The returned promise set the above mutex promise executor to it's resolution function,
    // meaning that the result of this promise will be the mutex promise's own resolution function
    return new Promise((resolve) => {
      executor = resolve;
    });
  }

  // Call the given function or promise while holding the mutex' lock
  async dispatch<T>(fn: (() => T) | (() => PromiseLike<T>)): Promise<T> {
    const unlock = await this.lock();
    try {
      return await Promise.resolve(fn());
    } finally {
      unlock();
    }
  }
}

/**
 * Base class for throwing assertion errors.
 */
export class AssertionError extends Error {}

/**
 * A typical assert function with an optional message.
 */
export function assert(condition: unknown, msg?: string): asserts condition {
  if (!condition) {
    throw new AssertionError(msg ?? "Assert failed");
  }
}

/**
 * Reads the data sequentially using a data view.
 */
export class SequentialDataReader {
  private _dataView: DataView;
  private _index = 0;

  constructor(dataView: DataView) {
    this._dataView = dataView;
  }

  readU8(): number {
    return this.incAndRet(this._dataView.getUint8(this._index), 1);
  }

  readU16(): number {
    // Note: serialization needs to have little endianness
    return this.incAndRet(this._dataView.getUint16(this._index, true), 2);
  }

  readU32(): number {
    return this.incAndRet(this._dataView.getUint32(this._index, true), 4);
  }

  readFloat(): number {
    return this.incAndRet(this._dataView.getFloat32(this._index, true), 4);
  }

  skip(numBytes = 1): void {
    this._index += Math.max(0, numBytes);
  }

  private incAndRet<T>(v: T, inc: number): T {
    this._index += inc;
    return v;
  }
}

// Remove undefined properties from given object
function prune<T>(obj: Partial<T>): Partial<T> {
  Object.keys(obj).forEach(
    (key) => obj[key as keyof T] === undefined && delete obj[key as keyof T]
  );
  return obj;
}

/**
 * Initializes the members of a object with a set of values, in a type safe way.
 * Properties that are undefined in "values" are skipped.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function safeAssign<T extends object>(obj: T, values: Partial<T>): T {
  return Object.assign(obj, prune(values));
}

/**
 * Takes a byte array and interpret it as a UTF8 string.
 * Copied from https://gist.github.com/pascaldekloe/62546103a1576803dade9269ccf76330
 * @param bytes Byte array with UTF8 string data.
 * @returns The decoded string.
 */
export function decodeUtf8(bytes: Uint8Array): string {
  let i = 0,
    s = "";
  while (i < bytes.length) {
    let c = bytes[i++];
    if (c > 127) {
      if (c > 191 && c < 224) {
        if (i >= bytes.length)
          throw new Error("UTF-8 decode: incomplete 2-byte sequence");
        c = ((c & 31) << 6) | (bytes[i++] & 63);
      } else if (c > 223 && c < 240) {
        if (i + 1 >= bytes.length)
          throw new Error("UTF-8 decode: incomplete 3-byte sequence");
        c = ((c & 15) << 12) | ((bytes[i++] & 63) << 6) | (bytes[i++] & 63);
      } else if (c > 239 && c < 248) {
        if (i + 2 >= bytes.length)
          throw new Error("UTF-8 decode: incomplete 4-byte sequence");
        c =
          ((c & 7) << 18) |
          ((bytes[i++] & 63) << 12) |
          ((bytes[i++] & 63) << 6) |
          (bytes[i++] & 63);
      } else
        throw new Error(
          "UTF-8 decode: unknown multibyte start 0x" +
            c.toString(16) +
            " at index " +
            (i - 1)
        );
    }
    if (c <= 0xffff) s += String.fromCharCode(c);
    else if (c <= 0x10ffff) {
      c -= 0x10000;
      s += String.fromCharCode((c >> 10) | 0xd800);
      s += String.fromCharCode((c & 0x3ff) | 0xdc00);
    } else
      throw new Error(
        "UTF-8 decode: code point 0x" + c.toString(16) + " exceeds UTF-16 reach"
      );
  }
  return s;
}

/**
 * Async delay.
 * @param ms Number of milliseconds to wait.
 * @returns A promise.
 */
export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Actively evaluate the given condition until it returns true
 * or we're passed the timeout.
 * @param condition Condition to evaluate.
 * @param timeout Timeout before giving up, in milliseconds.
 * @param pollingPeriod Polling period in milliseconds.
 * @returns A promise that resolves to a boolean with the last value of the condition.
 */
export async function waitUntil(
  condition: () => boolean,
  timeout: number,
  pollingPeriod = 10
): Promise<boolean> {
  const stopTime = Date.now() + timeout;
  while (true) {
    if (condition()) {
      return true;
    }
    if (Date.now() >= stopTime) {
      return false;
    }
    await delay(pollingPeriod);
  }
}
