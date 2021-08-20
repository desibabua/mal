const pr_str = (value, printReadably = false) => {
  if(value instanceof MalValue) return value.to_str(printReadably);
  return value;
}

class MalValue {
  to_str(printReadably = false) {
    return 'Default MalValue';
  }
}

class NilValue extends MalValue{
  to_str(printReadably = false) {
    return 'nil';
  }
}

const nil = new NilValue();

class List extends MalValue{
  constructor(ast) {
    super();
    this.ast = ast;
  }

  to_str(printReadably = false) {
    return '(' + this.ast.map(x => pr_str(x, printReadably)).join(' ') + ')';
  }
}

class Vector extends MalValue{
  constructor(ast) {
    super();
    this.ast = ast;
  }

  to_str(printReadably = false) {
    return '[' + this.ast.map(x => pr_str(x, printReadably)).join(' ') + ']';
  }
}

class Str extends MalValue{
  constructor(value) {
    super();
    this.value = value;
  }

  to_str(printReadably = false) {
    if(printReadably) {
      return '"' + this.value
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n")
       + '"';
    }
    return '"' + this.value + '"';
  }
}

class MalSymbol extends MalValue{
  constructor(value) {
    super();
    this.value = value;
  }

  to_str(printReadably = false) {
    return this.value;
  }
}

class Keyword extends MalValue{
  constructor(value) {
    super();
    this.value = value;
  }

  to_str(printReadably = false) {
    return ':' + this.value;
  }
}

class Hashmap extends MalValue{
  constructor(value) {
    super();
    this.value = value;
  }

  to_str(printReadably = false) {
    let str = [];

    for(let [key, value] of this.value.entries()) {
      str.push(pr_str(key) + ' ' + pr_str(value))
    }

    return '{' + str.join(' ') + '}';
  }
}

module.exports = { pr_str, nil, MalValue, List, Vector, Str, MalSymbol, Keyword, Hashmap };