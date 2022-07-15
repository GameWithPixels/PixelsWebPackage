/**
 * Various utilities functions and classes.
 */

let _enumValue = 0;

/**
 * Number generator for enums.
 *
 * A note about enums:
 * Typescript documentation recommends using "as const" over "enum".
 * See https://www.typescriptlang.org/docs/handbook/enums.html#objects-vs-enums
 */
export function enumVal(initialValue?: number): number {
  if (initialValue !== undefined) {
    _enumValue = initialValue;
  }
  return _enumValue++;
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
      const delay_ = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
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
