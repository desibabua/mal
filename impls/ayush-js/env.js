const { MalSymbol } = require("./types");

class Env {
  constructor(outer = null) {
    this.data = new Map();
    this.outer = outer;
  }

  set(key, value) {
    if(!(key instanceof MalSymbol)) {
      throw new Error(`${key} is not a Symbol`);
    }

    this.data.set(key.value, value);
    return value;
  }

  find(key) {
    if(this.data.has(key.value)) {
      return this;
    }

    return this.outer && this.outer.find(key);
  }

  get(key) {
    if(!(key instanceof MalSymbol)) throw new Error(`${key.value} is not a Symbol`);

    const env = this.find(key);

    if(env === null) throw new Error(`'${key.value}' not found.`);
    return env.data.get(key.value);
  }
}

module.exports = Env;