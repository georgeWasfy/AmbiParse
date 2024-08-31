type entry = { continuations: any[]; results: any[] };

const isEqual = (a: any, b: any): any => {
  if (a === b) return true;
  if (a instanceof Date && b instanceof Date)
    return a.getTime() === b.getTime();
  if (!a || !b || (typeof a !== "object" && typeof b !== "object"))
    return a === b;
  if (a === null || a === undefined || b === null || b === undefined)
    return false;
  if (a.prototype !== b.prototype) return false;
  let keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  return keys.every((k) => isEqual(a[k], b[k]));
};

export class Tramp {
  private stack: { fn: Function; args: any[] }[] = [];
  public cache = new Map<string, Map<string, entry>>();

  constructor() {}

  public hasNext(): boolean {
    return !!this.stack.length;
  }

  public pushStack(fn: Function, ...fnArgs: any[]) {
    this.stack.push({ fn, args: fnArgs });
  }

  public step() {
    const step = this.stack.pop();
    step?.fn(...step.args);
  }
  public run() {
    while (this.hasNext()) {
      this.step();
    }
  }

  public push(fn: Function, str: string, cont: Function) {
    const table = this.cache;
    function hashCode(str: string) {
      let hash = 0;
      for (let i = 0, len = str.length; i < len; i++) {
          let chr = str.charCodeAt(i);
          hash = (hash << 5) - hash + chr;
          hash |= 0; // Convert to 32bit integer
      }
      return hash.toString();
  }
    const resultSubsumed = (entry: entry, result: any) => {
      // result = { ...result, rest: result.rest.trim() };
      // console.log("🚀 ~ Tramp ~ resultSubsumed ~ result:", result);
      // console.log("🚀 ~ Tramp ~ resultSubsumed ~ entry:", entry);
      // console.log(
      //   "🚀 ~ Tramp ~ resultSubsumed ~ entry.results.includes(result):",
      //   entry.results.some(r => isEqual(r, result))
      // );
      // console.log("====================================================");
      return entry.results.some((r) => isEqual(r, result));
    };
    function makeEntry() {
      return {
        continuations: [],
        results: [],
      };
    }
    function tableRef(fn: Function, str: string) {
      const memoRecord = table.get(fn.toString());
      if (memoRecord) {
        const entry = memoRecord.get(str);
        if (entry) {
          return entry;
        } else {
          const newEntry = makeEntry();
          memoRecord.set(str, newEntry);
          return newEntry;
        }
      } else {
        const newEntry = makeEntry();
        table.set(hashCode(fn.toString()), new Map([[str, newEntry]]));
        return newEntry;
      }
    }
    let entry = tableRef(fn, str);
    if (entry.continuations.length === 0 && entry.results.length === 0) {
      entry = this.pushCont(entry, cont);
      this.pushStack(fn, str, this, (result: any) => {
        if (!resultSubsumed(entry, result)) {
          this.pushResult(entry, result);
          for (let index = 0; index < entry.continuations.length; index++) {
            const innerCont = entry.continuations[index];
            innerCont(result);
          }
        }
      });
    } else {
      entry = this.pushCont(entry, cont);
      for (let index = 0; index < entry.results.length; index++) {
        const innerResult = entry.results[index];
        cont(innerResult);
      }
    }
    this.cache = table;
  }

  private pushCont(entry: entry, cont: Function) {
    entry.continuations.push(cont);
    return entry;
  }
  private pushResult(entry: entry, result: any) {
    entry.results.push(result);
    return entry;
  }
}
