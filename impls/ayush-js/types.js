const pr_str = (value) => {
  if(value instanceof MalValue) return value.to_str();
  return value;
}

class MalValue {
  to_str() {
    return 'Default MalValue';
  }
}

class NilValue extends MalValue{
  to_str() {
    return 'nil';
  }
}

const nil = new NilValue();

class List extends MalValue{
  constructor(ast) {
    super();
    this.ast = ast;
  }

  to_str() {
    return '(' + this.ast.map(x => pr_str(x)).join(' ') + ')';
  }
}

class Vector extends MalValue{
  constructor(ast) {
    super();
    this.ast = ast;
  }

  to_str() {
    return '[' + this.ast.map(x => pr_str(x)).join(' ') + ']';
  }
}

class Str extends MalValue{
  constructor(value) {
    super();
    this.value = value;
  }

  to_str() {
    return '"' + this.value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
     + '"';
  }
}

class MalSymbol extends MalValue{
  constructor(value) {
    super();
    this.value = value;
  }

  to_str() {
    return this.value;
  }
}

class Keyword extends MalValue{
  constructor(value) {
    super();
    this.value = value;
  }

  to_str() {
    return ':' + this.value;
  }
}

class Hashmap extends MalValue{
  constructor(value) {
    super();
    this.value = value;
  }

  to_str() {
    let str = [];

    for(let [key, value] of this.value.entries()) {
      str.push(pr_str(key) + ' ' + pr_str(value))
    }

    return '{' + str.join(' ') + '}';
  }
}

module.exports = { pr_str, nil, MalValue, List, Vector, Str, MalSymbol, Keyword, Hashmap };