// pre: runs before the job's first step (published-action references only).
// Persist state for the post step via the GITHUB_STATE file; it comes back
// in cleanup.js as a STATE_<name> environment variable.
const fs = require('fs');

fs.appendFileSync(process.env.GITHUB_STATE, `started=${Date.now()}\n`);
console.log('pre: recorded start time');
