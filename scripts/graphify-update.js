/**
 * ანახლებს graphify-ს knowledge graph-ს (graphify-out/) პროექტის dev სერვერის ყოველ სტარტზე
 * ("predev"/"predev:test"/"predev:preprod"/"predev:prod" hook-იდან yarn-ის pre-script კონვენციით).
 *
 * graphify გლობალურ PATH-ში არაა (uv tool install-ით დაყენებულია მომხმარებლის პროფილში),
 * ამიტომ აქ რამდენიმე ცნობილ ადგილას ვცდით მის მოძებნას. თუ ვერ ვიპოვეთ ან თავად
 * ბრძანება ჩავარდა — dev-ს არ ვაჩერებთ, უბრალოდ ვაფრთხილებთ და ვაგრძელებთ.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const BIN_NAME = process.platform === 'win32' ? 'graphify.exe' : 'graphify';

const CANDIDATE_DIRS = [
  path.join(os.homedir(), '.local', 'bin'),
  path.join(os.homedir(), 'AppData', 'Roaming', 'uv', 'tools', 'graphifyy', 'Scripts'),
  path.join(os.homedir(), '.cargo', 'bin'),
];

function resolveGraphifyBin() {
  for (const dir of CANDIDATE_DIRS) {
    const candidate = path.join(dir, BIN_NAME);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  // PATH-ში თუ არსებობს, დავანებოთ shell-ს პოვნა (execSync გაუშვებს PATH lookup-ით).
  return 'graphify';
}

function main() {
  const bin = resolveGraphifyBin();

  try {
    execSync(`"${bin}" update .`, { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });
    console.log('✅ graphify graph განახლდა');
  } catch (err) {
    console.warn('⚠️  graphify-ს განახლება ჩავარდა (dev სერვერს ეს არ აჩერებს):', err.message);
  }
}

main();
