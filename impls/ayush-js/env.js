const { MalSymbol, List } = require("./types");

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

  static create(outer = null, binds, exprs) {
    const env = new Env(outer);

    for (let i = 0; i < binds.length; i++) {
      if(binds[i].value !== '&') {
        env.set(binds[i], exprs[i]);
        continue;
      }
      if(binds[i+2] !== undefined) {
        throw new Error('unexpected parameter');
      }
      if(binds[i+1] === undefined) continue;

      env.set(binds[i+1], new List(exprs.slice(i)));
      break;
    }

    return env;
  }
}

module.exports = Env;