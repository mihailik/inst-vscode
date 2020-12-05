var fs = require('fs');
var path = require('path');

var renamed = [];
var totalCount = 0;

if (process.argv.indexOf('prepare')>=0 || ['prepare', 'prepublish', 'prepublishOnly'].indexOf(process.env.npm_lifecycle_event) >=0) {
  console.log('Pre-packing for ' + process.env.npm_lifecycle_event);
  renameAll(__dirname, true /*mangleNames*/);
  console.log('Adjusted ' + renamed.length + ': ' + renamed.join(',') + ' out of ' + totalCount + ' entries.');
}
else {
  console.log('Post-unpacking' + (process.env.npm_lifecycle_event ? ' for ' + process.env.npm_lifecycle_event : ''));
  renameAll(__dirname, false /* mangleNames */);
  console.log('Adjusted ' + renamed.length + ': ' + renamed.join(',') + ' out of ' + totalCount + ' entries.');
}

function renameAll(dir, mangleName) {
  try {
    var entries = fs.readdirSync(dir);
    for (var i = 0; i < entries.length; i++) {
      var fName = path.basename(entries[i]);
      // ignore .git directories completely
      if (fName === '.git') continue;

      var fPath = path.resolve(dir, fName);
      var fNameMangled =
        mangleName && fName === 'node_modules' ? 'mode_nodules' :
          !mangleName && fName === 'mode_nodules' ? 'node_modules' :
            null;

      if (fNameMangled) {
        var fPathMangled = path.resolve(dir, fNameMangled);
        fs.renameSync(fPath, fPathMangled);
        renamed.push(fPath.slice(__dirname.length) + '->' + fNameMangled);

        fName = fNameMangled;
        fPath = fPathMangled;
      }

      totalCount++;

      var stat = fs.statSync(fPath);
      if (stat.isDirectory()) {
        renameAll(fPath, mangleName);
      }
    }
  }
  catch (err) {}
}