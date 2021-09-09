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


const quasiquote = (ast) => {
  if(ast instanceof List && ast.beginsWith('unquote')) {
    return ast.ast[1];
  };

   if(ast instanceof List) {
    let result = new List([]);
    for (let i = ast.ast.length-1; i >=0; i--) {
      const elt = ast.ast[i];
      if((elt instanceof List) && elt.beginsWith('splice-unquote')) {
        result = new List([new MalSymbol('concat'), elt.ast[1], result]);
      } else {
        result = new List([new MalSymbol('cons'), quasiquote(elt), result]);
      }
    }

    return result;
  };

  if(ast instanceof Vector) {
    let result = new List([]);
    for (let i = ast.ast.length-1; i >=0; i--) {
      const elt = ast.ast[i];
      if((elt instanceof List) && elt.beginsWith('splice-unquote')) {
        result = new List([new MalSymbol('concat'), elt.ast[1], result]);
      } else {
        result = new List([new MalSymbol('cons'), quasiquote(elt), result]);
      }
    }

    return new List([new MalSymbol('vec'), result]);
  };

  if((ast instanceof Hashmap) || (ast instanceof MalSymbol)) {
    return new List([new MalSymbol("quote"), ast]);
  }

  return ast;
}

const is_macro_call = (ast, env) => {
  if(!(ast instanceof List)) return false;

  const elt = ast.ast[0];
  return (elt instanceof MalSymbol) && env.find(elt) && (env.get(elt) instanceof Fn) && env.get(elt).isMacro;
}

const macro_expand = (ast, env) => {
  while(is_macro_call(ast, env)) {
    const macro = env.get(ast.ast[0]);
    ast = macro.apply(ast.ast.slice(1));
  }
  return ast;
}

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
    ast = macro_expand(ast, env);
    if (!(ast instanceof List)) {
      return eval_ast(ast, env);
    }

    if (ast.isEmpty()) {
      return ast;
    }

    const first = ast.ast[0].value;

    if (first === "quote") {
      if (ast.ast.length !== 2)
        throw new Error("wrong number of arguments to quote");
      return ast.ast[1];
    }

    if (first === "quasiquote") {
      if (ast.ast.length !== 2)
        throw new Error("wrong number of arguments to quasiquote");
      ast = quasiquote(ast.ast[1]);
      continue;
    }

    if (first === "quasiquoteexpand") {
      if (ast.ast.length !== 2)
        throw new Error("wrong number of arguments to quasiquoteexpand");
      return quasiquote(ast.ast[1]);
    }

    if (first === "defmacro!") {
      if (ast.ast.length !== 3)
        throw new Error("wrong number of arguments to defmacro");
      const val = EVAL(ast.ast[2], env);
      val.isMacro = true;
      return env.set(ast.ast[1], val);
    }

    if (first === "macroexpand") {
      return macro_expand(EVAL(ast.ast[1], env), env);
    }

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
      const fnClosure = (...params) => {
        const newEnv = Env.create(env, ast.ast[1].ast, params);
        return EVAL(ast.ast[2], newEnv);
      }
      return new Fn(env, ast.ast[1].ast, ast.ast[2], fnClosure);
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
rep('(def! load-file (fn* (fileName) (eval (read-string (str "(do " (slurp fileName) "\nnil)")))))', env);
rep(`(load-file "${process.cwd()}/core_2.mal")`, env);

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