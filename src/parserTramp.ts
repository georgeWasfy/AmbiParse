import { Tramp } from "./tramp";

// terminal parsers
export function succeed() {
  return memoize((val: any) => {
    return (input: string, tramp: Tramp, cont: Function) => {
      return cont({
        rest: input,
        value: val,
      });
    };
  });
}
export function failure() {
  return (input: string) => {
    return {
      rest: input,
    };
  };
}
const replacer = (key: any, value: any): any => {
  if (typeof value === "function") {
    return value.toString(); // Convert function to string
  }
  if (value instanceof Map) {
    return Array.from(value.entries()); // Convert Map to array of entries
  }
  return value; // Return other values as is
};
export function match() {
  return memoize((pattern: string) => {
    return (str: string, tramp: Tramp, cont: Function) => {
      if (pattern.length > str.length) {
        return cont({
          rest: str,
        });
      }
      str = str.trim();
      const testString = str.slice(0, pattern.length);
      if (testString === pattern) {
        return cont({
          rest: str.slice(pattern.length, str.length),
          value: pattern,
        });
      } else {
        // console.log("🚀 ~ return ~ tramp:", JSON.stringify([...tramp.cache.entries()], replacer, 2));
        return cont({
          rest: str,
        });
      }
    };
  });
}

export function matchPattern() {
  return memoize((pattern: RegExp) => {
    return (str: string, tramp: Tramp, cont: Function) => {
      const startIdx = 0;
      let endIdx = 0;
      str = str.trim();
      let stringCopy = str;
      const regexPattern = new RegExp(pattern, "i");
      const matchFound = regexPattern.exec(stringCopy);
      if (matchFound) endIdx += matchFound[0].length;
      if (endIdx > 0) {
        return cont({
          rest: str.slice(endIdx, str.length),
          value: str.slice(startIdx, endIdx),
        });
      } else {
        return cont({
          rest: str,
        });
      }
    };
  });
}

export function alt() {
  return memoize((...args: any) => {
    return (str: string, tramp: Tramp, cont: Function) => {
      for (let index = 0; index < args.length; index++) {
        const arg = args[index];
        tramp.push(arg(), str, cont);
        // arg()(str, cont);
      }
    };
  });
}

export function optional() {
  const success = succeed();
  return memoize((p: any) => {
    return optionalBind(p(), (v: any) => {
      return success(v ?? []);
    });
  });
}

export function optionalBind(p: any, fn: Function) {
  return (str: string, tramp: Tramp, cont: Function) => {
    return p(str, tramp, (result: any) => {
      if (result.hasOwnProperty("value")) {
        return fn(result.value)(result.rest, tramp, cont);
      } else {
          return fn()(result.rest, tramp, cont);
      }
    });
  };
}

// export function apply() {
//   const success = succeed();
//   return memoize((p: any, fn: Function) => {
//     return memoizeCPS(
//       bind(p(), (x: any) => {
//         return success(fn(x));
//       })
//     );
//   });
// }
export function seq() {
  const success = succeed();
  return memoize((...args: any[]) => {
    const processArgs = (index: number, acc: any[]): any => {
      // Base case: if we've processed all args, return success with an empty string
      if (index >= args.length) {
        return success([]);
      }
      return bind(args[index](), (currentResult: any) => {
        return bind(processArgs(index + 1, [...acc]), (nextResult: any) => {
          const curr = Array.isArray(currentResult)
            ? currentResult
            : [currentResult];
          const nxt = Array.isArray(nextResult) ? nextResult : [nextResult];
          return success([...acc, ...curr, ...nxt]);
        });
      });
    };
    return processArgs(0, []);
  });
}

export function bind(p: any, fn: Function) {
    return (str: string, tramp: Tramp, cont: Function) => {
    return p(str, tramp, (result: any) => {
      if (result.hasOwnProperty("value")) {
        return fn(result.value)(result.rest, tramp, cont);
      } else {
        return cont(result);
      }
    });
  };
}

export function run(p: any, str: string) {
  let results: any = [];
  p(str, (result: any) => {
    if (result?.value && result.rest === "") {
      results.push(result);
    } else if (result?.value === undefined) {
      // TODO: Handle failure if needed (optional)
    }
  });
  return results;
}

export function parse(parser: any) {
  return (str: string, cont?: Function) => {
    if (cont) {
      return parser(str, cont);
    } else {
      return run(parser, str);
    }
  };
}

function memoize(fn: Function) {
  const cache = new Map<string, any>();
  return function (...args: any[]) {

    if (cache.has(args.filter(Boolean).toString())) {
      return cache.get(args.filter(Boolean).toString());
    }
    //@ts-ignore
    const result = fn.call(this, ...args);
    cache.set(args.filter(Boolean).toString(), result);
    return result;
  };
}
