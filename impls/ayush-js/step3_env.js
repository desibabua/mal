const readline = require('readline');
const Env = require('./env');
const { read_str } = require('./reader');
const { pr_str, MalSymbol, List, Vector, Hashmap } = require('./types');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const env = new Env();

env.set(new MalSymbol('+'), (...args) => args.reduce((a,b) => a + b, 0));
env.set(new MalSymbol('*'), (...args) => args.reduce((a,b) => a * b, 1));

env.set(new MalSymbol('-'), (...args) => {
  if(args.length === 1) args.unshift(0);
  return args.reduce((a,b) => a - b)
});

env.set(new MalSymbol('/'), (...args) => {
  if(args.length === 1) args.unshift(1);
  return args.reduce((a,b) => a / b)
});

const eval_ast = (ast, env) => {

  if(ast instanceof MalSymbol) {
    return env.get(ast);
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

  const first = ast.ast[0].value;

  if(first === 'def!') {
    if(ast.ast.length !== 3) throw new Error('wrong number of arguments to def!');
    return env.set(ast.ast[1], EVAL(ast.ast[2], env));
  }

  if(first === 'let*') {
    if(ast.ast.length !== 3) throw new Error('wrong number of arguments to let*');
    const newEnv = new Env(env);
    const bindings = ast.ast[1].ast;
    for (let i = 0; i < bindings.length; i+=2) {
      newEnv.set(bindings[i], EVAL(bindings[i+1], newEnv));
    }
    return EVAL(ast.ast[2], newEnv);
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