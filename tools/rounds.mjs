// Prints the check report for stored rounds: every option's result and quality,
// the best and obvious options, and each check. Use it while hand-making a round.
//
//   npm run rounds                 every round
//   npm run rounds -- chests       rounds whose id or type contains "chests"
//   npm run rounds -- --failing    only rounds that fail a check
import { createServer } from 'vite';

const args = process.argv.slice(2);
const failingOnly = args.includes('--failing');
const filter = args.find((a) => !a.startsWith('--')) ?? '';

const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' });
try {
  const { ROUND_FILES } = await server.ssrLoadModule('/src/engine/content.ts');
  const { checkRound, formatReport, passed } = await server.ssrLoadModule('/src/engine/checks.ts');
  const files = Object.values(ROUND_FILES).filter((f) => f.id.includes(filter) || f.type.includes(filter));
  let fails = 0;
  let readyFails = 0;
  for (const f of files) {
    const r = checkRound(f);
    const ok = passed(r);
    if (!ok) fails++;
    if (!ok && f.status === "ready") readyFails++;
    if (failingOnly && ok) continue;
    console.log(formatReport(r) + '\n');
  }
  console.log(`${files.length} round(s), ${files.length - fails} pass, ${fails} fail.`);
  // Fail the command only when a round marked ready fails; drafts may still be rough.
  process.exitCode = readyFails ? 1 : 0;
} finally {
  await server.close();
}
