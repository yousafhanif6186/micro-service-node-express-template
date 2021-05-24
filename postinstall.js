const fs = require('fs');
const resolve = require('path').resolve;
const join = require('path').join;
const cp = require('child_process').spawn;
const os = require('os');

const lib = resolve(__dirname);

fs.readdirSync(lib)
  .forEach(function (mod) {
    const modPath = join(lib, mod);

    // ensure path has package.json
    if (!fs.existsSync(join(modPath, 'package.json'))) return;

    // npm binary based on OS
    const npmCmd = os.platform().startsWith('win') ? 'npm.cmd' : 'npm';

    // install folder
    cp(npmCmd, ['i'], { env: process.env, cwd: modPath, stdio: 'inherit' });
  });
