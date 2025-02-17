const { readFileSync } = require("fs");

const Env = require("./env");
const { read_str } = require("./reader");
const { MalSymbol, pr_str, nil, List, MalValue, Str, Atom, Vector, NilValue, Seq } = require("./types");

const equal = (a, b) => (a instanceof MalValue ? a.isEqual(b) : a === b);
const lessThan = (a, b) => a < b;
const lessThanEqualTo = (a, b) => a <= b;
const greaterThan = (a, b) => a > b;
const greaterThanEqualTo = (a, b) => a >= b;

const add = (...args) => args.reduce((a, b) => a + b, 0);
const mul = (...args) => args.reduce((a, b) => a * b, 1);
const sub = (...args) => {
  if (args.length === 1) args.unshift(0);
  return args.reduce((a, b) => a - b);
};
const divide = (...args) => {
  if (args.length === 1) args.unshift(1);
  return args.reduce((a, b) => a / b);
};

const print = (exprs) => {
  console.log(pr_str(exprs, true));
  return nil;
};
const createList = (...args) => {
  return new List(args);
};
const countList = (arg1, ...others) => {
  if (arg1 === nil) return 0;
  if (arg1 instanceof List) return arg1.count();
  throw new Error("argument is not a list");
};

const isList = (arg1, ...others) => arg1 instanceof List;
const isEmpty = (arg1, ...others) => arg1 instanceof Seq && arg1.isEmpty();

const prStr = (...strArgs) => {
  return new Str(strArgs.map((str) => pr_str(str, true)).join(" "));
};

const str = (...strArgs) => {
  return new Str(strArgs.map((str) => pr_str(str, false)).join(""));
}

const prn = (...strArgs) => {
  console.log(strArgs.map((str) => pr_str(str, true)).join(" "));
  return nil;
};

const println = (...strArgs) => {
  console.log(strArgs.map((str) => pr_str(str, false)).join(" "));
  return nil;
};

const readString = (str) => read_str(str.value);
const slurpFile = (str) => new Str(readFileSync(str.value,'utf-8'));

const atom = (value) => new Atom(value);
const isAtom = (value) => value instanceof Atom;
const dereferenceAtom = (value) => {
  if(!(value instanceof Atom)) throw new Error(`${value} is not a atom`);
  return value.dereference();
}

const resetAtom = (atom, value) => {
  if (!(atom instanceof Atom)) throw new Error(`${atom} is not a atom`);
  return atom.set(value);
};

const nameSpace = {
  "=": equal,
  "<": lessThan,
  "<=": lessThanEqualTo,
  ">": greaterThan,
  ">=": greaterThanEqualTo,

  "+": add,
  "-": sub,
  "*": mul,
  "/": divide,
  "mod":(num1, num2) => num1 % num2,
  "zero?" : (num) => num === 0,

  prn: print,
  list: createList,
  count: countList,

  "list?": isList,
  "empty?": isEmpty,
  nth: (seq, index) => seq.getNth(index),
  first: (seq) => (seq instanceof NilValue ? nil : seq.getFirst()),
  rest: (seq) => (seq instanceof NilValue ? new List([]) : seq.rest()),

  "pr-str": prStr,
  str: str,
  prn: prn,
  println: println,

  "read-string": readString,
  slurp: slurpFile,

  atom: atom,
  "atom?": isAtom,
  deref: dereferenceAtom,
  "reset!": resetAtom,

  "*ARGV*": new List([]),

  cons: (value, seq) => seq.cons(value),
  push: (value, seq) => seq.push(value),
  concat: (...lists) => lists.reduce((l1, l2) => l1.concat(l2), new List([])),

  vec: (list) => new Vector([...list.ast]),
};

const generateCoreEnv = () => {
  const env = new Env();
  for (const key in nameSpace) {
    env.set(new MalSymbol(key), nameSpace[key]);
  }
  return env;
};

const setInEnv = (env, key, value) => {
  env.set(new MalSymbol(key), value);
};

module.exports = { generateCoreEnv, setInEnv };
