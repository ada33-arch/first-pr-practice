// post: runs after the job's last step, even if earlier steps failed.
// State written by the pre step arrives as STATE_<name>; absent for local
// `uses: ./...` references, where pre is skipped.
const started = Number(process.env.STATE_started);

if (started) {
  console.log(`post: ${Date.now() - started} ms since pre ran`);
} else {
  console.log('post: cleanup ran (no pre state — expected for local actions)');
}
