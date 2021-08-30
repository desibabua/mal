const readline = require("readline");
const { generateCoreEnv, setInEnv } = require("./core");
const Env = require("./env");
const { read_str } = require("./reader");
const { pr_str, MalSymbol, List, Vector, Hashmap, nil, Fn, Atom } = require("./types");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const env = generateCoreEnv();
const eval = (ast) => {
  return EVAL(ast, env);
}
const swapAtom = (atom, func, ...addArgs) => {
  if (!(atom instanceof Atom)) throw new Error(`${atom} is not a atom`);
  if(func instanceof Fn) {
    const newEnv = Env.create(func.env, func.binds, [atom.MalValue, ...addArgs ]);
    atom.MalValue = EVAL(func.fnBody, newEnv);
    return atom.MalValue;
  }
  atom.MalValue = func.apply(null, [atom.MalValue, ...addArgs]);
  return atom.MalValue;
};
setInEnv(env,'eval', eval);
setInEnv(env,'swap!', swapAtom);

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
const PRINT = (str) => pr_str(str, true);

const rep = (str, env) => PRINT(EVAL(READ(str), env));
rep("(def! not (fn* (a) (if a false true)))", env);
rep('(def! load-file (fn* (fileName) (eval (read-string (str "(do " (slurp fileName) "\nnil)")))))', env);

const printResult = (result) => {
  if (result != null) console.log(result);
}

const runFile = function() {
  const [fileName, ...args] = process.argv.slice(2);
  if(fileName) {
    setInEnv(env, "*ARGV*", new List(args));
    rep(`(load-file "${fileName}")`, env);
    process.exit(0);
  }
}

const main = function () {
  runFile();
  rl.question("user> ", (str) => {
    try {
      printResult(rep(str, env));
    } catch (e) {
      console.log(e);
    } finally {
      main();
    }
  });
};

main();

module.exports = { EVAL, env };