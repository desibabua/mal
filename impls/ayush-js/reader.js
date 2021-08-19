const { List, Vector, nil, Str } = require("./types");

class Reader {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
  }

  peek() {
    return this.tokens[this.position];
  }

  next() {
    const token = this.peek();

    if(this.position < this.tokens.length) {     
      this.position++;
    }

    return token;
  }
}

const tokenization = (str) => {
  const regEx = /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g;
  const tokens = [...str.matchAll(regEx)];
  return tokens.map(x => x[1]).slice(0, -1);
}

const read_atom = (reader) => {
  const token = reader.next();

  if(token === 'nil') return nil;
  if(token === 'true') return true;
  if(token === 'false') return false;
  if(token.match(/^-?[0-9]+$/)) return parseInt(token);
  if(token.match(/^-?[0-9][0-9.]*$/)) return parseFloat(token);
  if(token.match(/^"(?:\\.|[^\\"])*"$/)) return new Str(token.slice(1, -1));

  return token;
}

const read_seq = (reader, closingSymbol) => {
  const ast = [];
  reader.next();

  while(reader.peek() !== closingSymbol) {
    if(reader.peek() === undefined) {
      throw new Error(`(EOF|end of input|unbalanced) --> ${closingSymbol}`);
    }
    ast.push(read_form(reader));
  }
  reader.next();

  return ast;
}

const read_list = (reader) => new List(read_seq(reader, ')'));
const read_vector = (reader) => new Vector(read_seq(reader, ']'));

const read_form = (reader) => {
  const token = reader.peek();

  switch (token[0]) {
    case '(': return read_list(reader);
    case '[': return read_vector(reader);
    case ')': throw new Error('(EOF|end of input|unbalanced) --> (');
    case ']': throw new Error('(EOF|end of input|unbalanced) --> ]');
  }

  return read_atom(reader);
}

const read_str = (str) => {
  const tokens = tokenization(str);
  const reader = new Reader(tokens);
  return read_form(reader);
}

module.exports = { read_str };