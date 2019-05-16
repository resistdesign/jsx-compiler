const DEFAULT_NODE_ENV = 'production';

process.env = !!process.env ? process.env : {};
process.env.NODE_ENV = !!process.env.NODE_ENV ? process.env.NODE_ENV : DEFAULT_NODE_ENV;

if (process.env.NODE_ENV) {
}

module.exports = {
  DEFAULT_NODE_ENV,
  ENV: process.env
};
