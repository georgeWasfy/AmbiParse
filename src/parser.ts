export class Parser {
  private parserFn: Function;
  constructor(parserFn: Function) {
    this.parserFn = parserFn;
  }
  run(str: string, cont: Function) {
    return this.parserFn(str, cont);
  }
}

// terminal parsers
function success(val: any) {
  return memoizeCPS((input: string, cont: Function) => {
    return cont({
      rest: input,
      value: val,
    });
  });
}

export function match(pattern: string) {
  return new Parser(
    memoizeCPS((str: string, cont: Function) => {
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
    })
  );
}

export function matchPattern(pattern: string) {
  return new Parser(
    memoizeCPS((str: string, cont: Function) => {
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
    })
  );
}

export function alt(...args: Parser[]) {
  return new Parser(
    memoizeCPS((str: string, cont: Function) => {
      for (let index = 0; index < args.length; index++) {
        const arg = args[index];
        arg?.run(str, cont);
      }
    })
  );
}

export function apply(p: Parser, fn: Function) {
  return new Parser(
    memoizeCPS(
      bind(p, (x: any) => {
        return success(fn(x));
      })
    )
  );
}

export function seq(...args: Parser[]) {
  const seq2 = (a: Parser, b: Parser) => {
    return bind(a, (x: any) => {
      return bind(b, (y: any) => {
        const curr = Array.isArray(x) ? x : [x];
        const nxt = Array.isArray(y) ? y : [y];
        return success([...curr, ...nxt]);
      });
    });
  };

  return new Parser(
    memoizeCPS(
      // @ts-ignore
      args.reduce((acc, parser) => {
        return seq2(acc, parser);
      })
    )
  );
}

export function optional(p: Parser) {
  return new Parser(
    memoizeCPS(
      optionalBind(p, (v: any) => {
        return success(v ?? []);
      })
    )
  );
}

export function optionalBind(p: Parser | Function, fn: Function) {
  return (str: string, cont: Function) => {
    if (p instanceof Parser) {
      return p.run(str, (result: any) => {
        if (result.hasOwnProperty("value")) {
          return fn(result.value)(result.rest, cont);
        } else {
          return fn()(result.rest, cont);
        }
      });
    }
    return p(str, (result: any) => {
      if (result.hasOwnProperty("value")) {
        return fn(result.value)(result.rest, cont);
      } else {
        return fn()(result.rest, cont);
      }
    });
  };
}

export function bind(p: Parser | Function, fn: Function) {
  return (str: string, cont: Function) => {
    if (p instanceof Parser) {
      return p.run(str, (result: any) => {
        if (result.hasOwnProperty("value")) {
          return fn(result.value)(result.rest, cont);
        } else {
          return cont(result);
        }
      });
    }
    return p(str, (result: any) => {
      if (result.hasOwnProperty("value")) {
        return fn(result.value)(result.rest, cont);
      } else {
        return cont(result);
      }
    });
  };
}

function run(p: Parser, str: string) {
  let results: any = [];
  p.run(str, (result: any) => {
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

export function lazy(p: () => Parser) {
  return new Parser(
    memoizeCPS((str: string, cont: Function) => {
      p().run(str, cont);
    })
  );
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
  
  