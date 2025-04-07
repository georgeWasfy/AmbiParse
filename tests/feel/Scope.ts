export class ScopeManager {
  // A scope is a map with string key and any value
  private scopes: Map<string, any>[] = [];

  // Push a new scope
  pushScope() {
    this.scopes.push(new Map());
  }

  // Pop the current scope
  popScope() {
    this.scopes.pop();
  }

  // Define a variable in the current scope
  defineVariable(name: string, value: any) {
    if (this.scopes.length === 0) {
      throw new Error("No active scope");
    }
    const currentScope = this.scopes[this.scopes.length - 1];
    if (currentScope) currentScope.set(name, value);
  }

  // Resolve a variable from the nearest scope
  resolveVariable(name: string): any {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i]?.has(name)) {
        return this.scopes[i]?.get(name);
      }
    }
    throw new Error(`Variable ${name} not found in scope`);
  }
}
