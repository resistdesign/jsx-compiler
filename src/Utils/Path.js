const Path = require('path');

const CWD = process.cwd();

module.exports = {
  CWD,
  getFullTargetPath: (path = '') => Path.join(CWD, path),
  getRelativePath: (path = '', fromPath = CWD) => Path.relative(fromPath, path)
};
