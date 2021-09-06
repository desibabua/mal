const pr_str = (value, printReadably = false) => {
  if (value === null || value === undefined) return nil.to_str(printReadably);
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

class Seq extends MalValue {
  isEmpty() {
    return this.ast.length == 0;
  }

  count() {
    return this.ast.length;
  }

  getNth(index) {
    if (index >= this.count()) {
      throw new Error("index out of bound");
    }
    return this.ast[index];
  }

  getFirst() {
    if (this.isEmpty()) return nil;
    return this.ast[0];
  }

  rest() {
    if (this.isEmpty()) return new List([]);
    return new List(this.ast.slice(1));
  }

  isEqual(seq) {
    if (!(seq instanceof Seq)) return false;
    if (seq.count() !== this.count()) return false;

    for (let i = 0; i < this.count; i++) {
      if (seq.ast[i] !== this.seq[i]) return false;
    }

    return true;
  }

  cons(value) {
    return new List([value, ...this.ast]);
  }

  concat(seq) {
    return new List([...this.ast, ...seq.ast]);
  }

  beginsWith(symbol) {
    return !this.isEmpty() && this.ast[0].value === symbol;
  }
}

class List extends Seq {
  constructor(ast = []) {
    super();
    this.ast = ast;
  }

  to_str(printReadably = false) {
    return "(" + this.ast.map((x) => pr_str(x, printReadably)).join(" ") + ")";
  }
}

class Vector extends Seq {
  constructor(ast = []) {
    super();
    this.ast = ast;
  }

  to_str(printReadably = false) {
    return "[" + this.ast.map((x) => pr_str(x, printReadably)).join(" ") + "]";
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
    return this.value;
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
    if(printReadably) return ":" + this.value;
    return this.value;
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
      str.push(pr_str(key, printReadably) + " " + pr_str(value, printReadably));
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

class Fn extends MalValue {
  constructor(env, binds = [], fnBody, fn = () => {}, isMacro = false) {
    super();
    this.env = env;
    this.binds = binds;
    this.fnBody = fnBody;
    this.fn = fn;
    this.isMacro = isMacro;
  }

  to_str(printReadably = false) {
    return "#<function>";
  }

  apply(args) {
    return this.fn.apply(null, args);
  }
}

class Atom extends MalValue {
  constructor(MalValue) {
    super();
    this.MalValue = MalValue;
  }

  to_str(printReadably = false) {
    return "(atom " + pr_str(this.MalValue, printReadably) + ")";
  }

  dereference() {
    return this.MalValue;
  }

  set(value) {
    this.MalValue = value;
    return this.MalValue;
  }
}

module.exports = {
  pr_str,
  nil,
  NilValue,
  MalValue,
  List,
  Vector,
  Str,
  MalSymbol,
  Keyword,
  Hashmap,
  Fn,
  Atom,
};
