// terminal parsers
export function succeed() {
  return memoize((val: any) => {
    return memoizeCPS((input: string, cont: Function) => {
      return cont({
        rest: input,
        value: val,
      });
    });
  });
}
export function failure() {
  return (input: string) => {
    return {
      rest: input,
    };
  };
}

export function match() {
  return memoize((pattern: string) => {
    return memoizeCPS((str: string, cont: Function) => {
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
        return cont({
          rest: str,
        });
      }
    });
  });
}

export function matchPattern() {
  return memoize((pattern: RegExp) => {
    return memoizeCPS((str: string, cont: Function) => {
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
    });

  });
}

export function alt() {
  return memoize((...args: any) => {
    return memoizeCPS((str: string, cont: Function) => {
      for (let index = 0; index < args.length; index++) {
        const arg = args[index];
        arg()(str, cont);
      }
    });
  });
}

export function apply() {
  const success = succeed();
  return memoize((p: any, fn: Function) => {
    return memoizeCPS(
      bind(p(), (x: any) => {
        return success(fn(x));
      })
    );
  });
}

export function seq() {
  const success = succeed();
  return memoize((...args: any[]) => {
    // Recursive helper function to process args
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
    return memoizeCPS(processArgs(0, []));
  });
}

export function bind(p: any, fn: Function) {
  return (str: string, cont: Function) => {
    return p(str, (result: any) => {
      if (result.hasOwnProperty("value")) {
        return fn(result.value)(result.rest, cont);
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
    if (cache.has(args.toString())) {
      return cache.get(args.toString());
    }
    //@ts-ignore
    const result = fn.call(this, ...args);
    cache.set(args.toString(), result);
    return result;
  };
}

type entry = { continuations: any[]; results: any[] };
function memoizeCPS(fn: Function) {
  const cache = new Map<string, entry>();
  const pushCont = (entry: entry, cont: Function) => {
    entry.continuations.push(cont);
    return entry;
  };
  const pushResult = (entry: entry, result: any) => {
    entry.results.push(result);
    return entry;
  };
  const resultSubsumed = (entry: entry, result: any) => {
    return entry.results.includes(result);
  };
  function makeEntry() {
    return {
      continuations: [],
      results: [],
    };
  }
  function tableRef(str: string) {
    const entry = cache.get(str);
    if (entry) {
      return entry;
    } else {
      const newEntry = makeEntry();
      cache.set(str, newEntry);
      return newEntry;
    }
  }
  return function (args: string, cont: Function) {
    let entry = tableRef(args);
    // first time memoized procedure has been called with str
    if (entry.continuations.length === 0 && entry.results.length === 0) {
      entry = pushCont(entry, cont);
      fn(args, (result: any) => {
        if (!resultSubsumed(entry, result)) {
          pushResult(entry, result);
          for (let index = 0; index < entry.continuations.length; index++) {
            const innerCont = entry.continuations[index];
            innerCont(result);
          }
        }
      });
    } else {
      // second time memoized procedure has been called with str
      entry = pushCont(entry, cont);
      for (let index = 0; index < entry.results.length; index++) {
        const innerResult = entry.results[index];
        cont(innerResult);
      }
    }
  };
}
  
  