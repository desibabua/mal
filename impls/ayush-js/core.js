const Env = require("./env");
const { MalSymbol, pr_str, nil, List, MalValue } = require("./types");

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
const isEmpty = (arg1, ...others) => arg1 instanceof List && arg1.isEmpty();

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

  prn: print,
  list: createList,
  count: countList,

  "list?": isList,
  "empty?": isEmpty,
};

const generateCoreEnv = () => {
  const env = new Env();
  for (const key in nameSpace) {
    env.set(new MalSymbol(key), nameSpace[key]);
  }
  return env;
};

module.exports = generateCoreEnv;
