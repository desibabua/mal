const readline = require('readline');
const { read_str } = require('./reader');
const { pr_str } = require('./types');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const READ = (str) => read_str(str);
const EVAL = (str) => str;
const PRINT = (str) => pr_str(str);

const rep = (str) => PRINT(EVAL(READ(str)));

const main = function() {
  rl.question('user> ', (str) => {
    try {
      console.log(rep(str));
    } catch (e) {
      console.log(e.message);
    } finally {
      main();
    }
  });
}

main();