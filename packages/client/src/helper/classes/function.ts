export class FunctionHelper {
  /**
   * Apply function with given thisArg and arguments
   * @param fn - Function to apply
   * @param thisArg - Value to use as this when calling fn
   * @param args - Arguments to pass to fn
   * @returns Result of calling fn with thisArg and args
   */
  apply<TThis, TArgs extends unknown[], TReturn>(
    fn: (this: TThis, ...args: TArgs) => TReturn,
    thisArg: TThis,
    args: TArgs,
  ): TReturn {
    return fn.apply(thisArg, args);
  }

  /**
   * Call function with given thisArg and arguments
   * @param fn - Function to call
   * @param thisArg - Value to use as this when calling fn
   * @param args - Arguments to pass to fn
   * @returns Result of calling fn with thisArg and args
   */
  call<TThis, TArgs extends unknown[], TReturn>(
    fn: (this: TThis, ...args: TArgs) => TReturn,
    thisArg: TThis,
    ...args: TArgs
  ): TReturn {
    return fn.call(thisArg, ...args);
  }
}
