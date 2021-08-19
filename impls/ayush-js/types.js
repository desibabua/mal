const pr_str = (value) => {
  if(value instanceof MalValue) return value.to_str();
  return value.toString();
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
    return '"' + this.value + '"';
  }
}

module.exports = { pr_str, nil, MalValue, List, Vector, Str };