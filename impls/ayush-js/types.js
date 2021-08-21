const pr_str = (value, printReadably = false) => {
  if (value == null) return null;
  if (value instanceof MalValue) return value.to_str(printReadably);
  return value.toString();
};

class MalValue {
  to_str(printReadably = false) {
    return "Default MalValue";
  }
  isEqual(value) {
    return value instanceof MalValue;
  }
}

class NilValue extends MalValue {
  to_str(printReadably = false) {
    return "nil";
  }

  isEqual(nil) {
    return nil instanceof NilValue;
  }
}

const nil = new NilValue();

class List extends MalValue {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  to_str(printReadably = false) {
    return "(" + this.ast.map((x) => pr_str(x, printReadably)).join(" ") + ")";
  }

  isEmpty() {
    return this.ast.length == 0;
  }

  count() {
    return this.ast.length;
  }

  isEqual(list) {
    if(!(list instanceof List)) return false;
    if(list.count() !== this.count()) return false;

    for (let i = 0; i < this.count; i++) {
      if(list.ast[i] !== this.ast[i]) return false;
    }

    return true;
  }
}

class Vector extends MalValue {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  to_str(printReadably = false) {
    return "[" + this.ast.map((x) => pr_str(x, printReadably)).join(" ") + "]";
  }

  isEqual(vector) {
    if(!(vector instanceof Vector)) return false;
    if(vector.ast.length !== this.ast.length) return false;

    for (let i = 0; i < this.count; i++) {
      if(vector.ast[i] !== this.ast[i]) return false;
    }

    return true;
  }
}

class Str extends MalValue {
  constructor(value) {
    super();
    this.value = value;
  }

  to_str(printReadably = false) {
    if (printReadably) {
      return (
        '"' +
        this.value
          .replace(/\\/g, "\\\\")
          .replace(/"/g, '\\"')
          .replace(/\n/g, "\\n") +
        '"'
      );
    }
    return '"' + this.value + '"';
  }

  isEqual(str) {
    if(!(str instanceof Str)) return false;
    return str.value === this.value;
  }
}

class MalSymbol extends MalValue {
  constructor(value) {
    super();
    this.value = value;
  }

  to_str(printReadably = false) {
    return this.value;
  }

  isEqual(symbol) {
    if(!(symbol instanceof MalSymbol)) return false;
    return symbol.value === this.value;
  }
}

class Keyword extends MalValue {
  constructor(value) {
    super();
    this.value = value;
  }

  to_str(printReadably = false) {
    return ":" + this.value;
  }

  isEqual(symbol) {
    if(!(symbol instanceof Keyword)) return false;
    return symbol.value === this.value;
  }
}

class Hashmap extends MalValue {
  constructor(value) {
    super();
    this.value = value;
  }

  get_ast() {
    return [...this.value.entries()].reduce((a, b) => a.concat(b), []);
  }

  to_str(printReadably = false) {
    let str = [];

    for (let [key, value] of this.value.entries()) {
      str.push(pr_str(key) + " " + pr_str(value));
    }

    return "{" + str.join(" ") + "}";
  }

  static generate(ast) {
    const hashmap = new Map();

    if (ast.length % 2 != 0) {
      throw new Error("Odd number of hashmap arguments");
    }

    for (let i = 0; i < ast.length; i += 2) {
      const key = ast[i];

      if (!(key instanceof Str || key instanceof Keyword)) {
        throw new Error("hashmap key is not a string");
      }

      hashmap.set(ast[i], ast[i + 1]);
    }

    return new Hashmap(hashmap);
  }

  isEqual(hashMap) {
    return hashMap instanceof Hashmap;
  }
}

module.exports = {
  pr_str,
  nil,
  MalValue,
  List,
  Vector,
  Str,
  MalSymbol,
  Keyword,
  Hashmap,
};
