/**
 * აგენერირებს/ანახლებს API_Client/client-ს backend-ის (online-shop-nest) swagger.json-იდან.
 * გამოიყენება ხელით ("yarn generate:api") და ავტომატურადაც watcher-იდან ("yarn watch:api").
 *
 * backend-ის მხარეს src/main.ts ყოველ სტარტზე თავად წერს/ანახლებს ../online-shop-nest/swagger.json-ს,
 * ასე რომ აქ საკმარისია ის ფაილი წავიკითხოთ და კლიენტი გადმოვაგენერიროთ.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const SPEC_PATH = path.resolve(__dirname, '../../online-shop-nest/swagger.json');
const OUT_DIR = path.resolve(__dirname, '../API_Client/client');
const TMP_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'api-client-gen-'));

// ჩვენთვის საჭირო ფაილები/საქაღალდეები openapi-generator-ის output-იდან.
// docs/, README.md, git_push.sh, .npmignore, .openapi-generator/, .gitignore -
// ეს არის დამხმარე ფაილები, რომლებიც კლიენტისთვის საჭირო არაა.
const KEEP = ['api.ts', 'apis', 'base.ts', 'common.ts', 'configuration.ts', 'index.ts', 'models'];

function main() {
  if (!fs.existsSync(SPEC_PATH)) {
    console.error(`❌ ვერ ვიპოვე swagger.json: ${SPEC_PATH}`);
    console.error('   ჯერ გაუშვი backend (online-shop-nest), რომ ეს ფაილი დაგენერირდეს.');
    process.exit(1);
  }

  console.log('🔄 API კლიენტის გენერაცია swagger.json-იდან...');

  execSync(
    [
      'npx openapi-generator-cli generate',
      `-i "${SPEC_PATH}"`,
      '-g typescript-axios',
      `-o "${TMP_DIR}"`,
      '--additional-properties=withSeparateModelsAndApi=true,modelPackage=models,apiPackage=apis',
      '--skip-validate-spec',
    ].join(' '),
    { stdio: 'inherit' },
  );

  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const name of KEEP) {
    const from = path.join(TMP_DIR, name);
    const to = path.join(OUT_DIR, name);
    if (fs.existsSync(from)) {
      fs.cpSync(from, to, { recursive: true });
    }
  }

  fs.rmSync(TMP_DIR, { recursive: true, force: true });

  console.log(`✅ API კლიენტი განახლდა: ${path.relative(process.cwd(), OUT_DIR)}`);
}

main();
