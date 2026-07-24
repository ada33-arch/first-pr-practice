// main: inputs arrive as INPUT_<NAME> environment variables; outputs are
// written to the GITHUB_OUTPUT file. No @actions/core needed, so nothing
// to bundle or commit under node_modules.
const fs = require('fs');

const who = process.env.INPUT_WHO || 'world';
const greeting = `hello, ${who}!`;

console.log(`main: ${greeting}`);
fs.appendFileSync(process.env.GITHUB_OUTPUT, `greeting=${greeting}\n`);
