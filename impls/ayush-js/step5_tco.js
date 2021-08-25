const readline = require("readline");
const generateCoreEnv = require("./core");
const Env = require("./env");
const { read_str } = require("./reader");
const { pr_str, MalSymbol, List, Vector, Hashmap, nil, Fn } = require("./types");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const env = generateCoreEnv();

const eval_ast = (ast, env) => {
  if (ast instanceof MalSymbol) {
    return env.get(ast);
  }

  if (ast instanceof List) {
    return new List(ast.ast.map((x) => EVAL(x, env)));
  }

  if (ast instanceof Vector) {
    return new Vector(ast.ast.map((x) => EVAL(x, env)));
  }

  if (ast instanceof Hashmap) {
    return Hashmap.generate(ast.get_ast().map((x) => EVAL(x, env)));
  }

  return ast;
};

const EVAL = (ast, env) => {
  while (true) {
    if (!(ast instanceof List)) {
      return eval_ast(ast, env);
    }

    if (ast.isEmpty()) {
      return ast;
    }

    const first = ast.ast[0].value;

    if (first === "def!") {
      if (ast.ast.length !== 3)
        throw new Error("wrong number of arguments to def!");
      return env.set(ast.ast[1], EVAL(ast.ast[2], env));
    }

    if (first === "let*") {
      if (ast.ast.length !== 3)
        throw new Error("wrong number of arguments to let*");
      const newEnv = new Env(env);
      const bindings = ast.ast[1].ast;
      for (let i = 0; i < bindings.length; i += 2) {
        newEnv.set(bindings[i], EVAL(bindings[i + 1], newEnv));
      }
      env = newEnv;
      ast = ast.ast[2];
      continue;
    }

    if (first === "if") {
      if (ast.ast.length < 3)
        throw new Error("wrong number of arguments to if");
      const condition = EVAL(ast.ast[1], env);
      if (condition === nil || condition === false) {
        ast = ast.ast[3];
      } else {
        ast = ast.ast[2];
      }
      continue;
    }

    if (first === "do") {
      if (ast.ast.length < 2) {
        throw new Error("wrong number of arguments to do");
      }
      ast.ast.slice(1, -1).forEach((form) => EVAL(form, env));
      ast = ast.ast[ast.ast.length - 1];
      continue;
    }

    if (first === "fn*") {
      return new Fn(env, ast.ast[1].ast, ast.ast[2]);
    }

    const [fn, ...args] = eval_ast(ast, env).ast;

    if (fn instanceof Fn) {
      env = Env.create(fn.env, fn.binds, args);
      ast = fn.fnBody;
      continue;
    }

    if (fn instanceof Function) {
      return fn.apply(null, args);
    }
    
    throw new Error(`${fn} is not a function`);
  }
};

const READ = (str) => read_str(str);
const PRINT = (str) => pr_str(str);

const rep = (str, env) => PRINT(EVAL(READ(str), env));
rep("(def! not (fn* (a) (if a false true)))", env);

const main = function () {
  rl.question("user> ", (str) => {
    try {
      const result = rep(str, env);
      if (result != null) console.log(result);
    } catch (e) {
      console.log(e);
    } finally {
      main();
    }
  });
};

main();
