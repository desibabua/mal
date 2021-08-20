const readline = require('readline');
const { read_str } = require('./reader');
const { pr_str, MalSymbol, List, Vector, Hashmap } = require('./types');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const env = {
  '+' : (...args) => args.reduce((a,b) => a + b, 0),
  '*' : (...args) => args.reduce((a,b) => a * b, 1),
  '-' : (a, b) => a - b,
  '/' : (a, b) => a / b,
  'pi': Math.PI
}

const eval_ast = (ast, env) => {

  if(ast instanceof MalSymbol) {
    const symbolValue = env[ast.value];
    if(symbolValue) {
      return symbolValue;
    } else {
      throw new Error(`'${ast.value}' symbol is not defined`);
    }
  }

  if(ast instanceof List) {
    return new List(ast.ast.map(x => EVAL(x, env)));
  }

  if(ast instanceof Vector) {
    return new Vector(ast.ast.map(x => EVAL(x, env)));
  }

  if(ast instanceof Hashmap) {
    return Hashmap.generate(ast.get_ast().map(x => EVAL(x, env)));
  }

  return ast;
}

const EVAL = (ast, env) => {

  if(!(ast instanceof List)) {
    return eval_ast(ast, env);
  }

  if(ast.isEmpty()) {
    return ast;
  }
  const [fn, ...args] = eval_ast(ast, env).ast;

  if(!(fn instanceof Function)) {
    throw new Error(`${fn} is not a function`);
  }

  return fn.apply(null, args);
}

const READ = (str) => read_str(str);
const PRINT = (str) => pr_str(str);

const rep = (str, env) => PRINT(EVAL(READ(str), env));

const main = function() {
  rl.question('user> ', (str) => {
    try {
      const result = rep(str, env);
      if(result != null) console.log(result);
    } catch (e) {
      console.log(e.message);
    } finally {
      main();
    }
  });
}

main();