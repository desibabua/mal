const readline = require('readline');
const { read_str } = require('./reader');
const { pr_str } = require('./types');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const READ = (str) => read_str(str);
const EVAL = (str) => str;
const PRINT = (str) => pr_str(str, true);

const rep = (str) => PRINT(EVAL(READ(str)));

const main = function() {
  rl.question('user> ', (str) => {
    try {
      const result = rep(str);
      if(result != null) console.log(result);
    } catch (e) {
      console.log(e.message);
    } finally {
      main();
    }
  });
}

main();