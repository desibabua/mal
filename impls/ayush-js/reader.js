const { List, Vector, nil, Str, MalSymbol, Keyword, Hashmap } = require("./types");

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

const parseString = (token) => {
  const str = token.replace(/\\(.)/g, (_, c) => c === "n" ? "\n" : c); 
  return new Str(str.slice(1, -1));
}

const read_atom = (reader) => {
  const token = reader.next();

  if(token === 'nil') return nil;
  if(token === 'true') return true;
  if(token === 'false') return false;
  if(token.match(/^-?[0-9]+$/)) return parseInt(token);
  if(token.match(/^-?[0-9][0-9.]*$/)) return parseFloat(token);
  if(token.match(/^"(?:\\.|[^\\"])*"$/)) return parseString(token);
  if(token.match(/^"/)) throw new Error(`unbalanced "`);
  if(token.startsWith(':')) return new Keyword(token.slice(1));

  return new MalSymbol(token);
}

const isComment = (token) => {
  return token.startsWith(';');
}

const read_seq = (reader, closingSymbol) => {
  const ast = [];
  reader.next();

  while(reader.peek() !== closingSymbol) {
    if(reader.peek() === undefined) {
      throw new Error(`unbalanced ${closingSymbol}`);
    }

    isComment(reader.peek()) ? reader.next() : ast.push(read_form(reader));
  }

  reader.next();

  return ast;
}

const read_list = (reader) => new List(read_seq(reader, ')'));
const read_vector = (reader) => new Vector(read_seq(reader, ']'));

const read_hashmap = (reader) => {
  const ast = read_seq(reader, '}');
  const hashmap = new Map();

  if(ast.length % 2 != 0) {
    throw new Error('Odd number of hashmap arguments');
  }

  for (let i = 0; i < ast.length; i+=2) {
    const key = ast[i];

    if(!(key instanceof Str || key instanceof Keyword)) {
      throw new Error('hashmap key is not a string');
    }
    
    hashmap.set(ast[i], ast[i+1]);
  }

  return new Hashmap(hashmap);
}

const read_form = (reader) => {
  const token = reader.peek();

  switch (token[0]) {
    case '(': return read_list(reader);
    case '[': return read_vector(reader);
    case '{': return read_hashmap(reader);
    case ';': return null;
    case ')': throw new Error('unbalanced  (');
    case ']': throw new Error('unbalanced  ]');
    case '}': throw new Error('unbalanced  }');
  }

  return read_atom(reader);
}

const read_str = (str) => {
  const tokens = tokenization(str);
  const reader = new Reader(tokens);
  return read_form(reader);
}

module.exports = { read_str };