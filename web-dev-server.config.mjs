const hmr = process.argv.includes('--hmr');

export default /** @type {import('@web/dev-server').DevServerConfig} */ ({
  open: '/',
  watch: !hmr,
  nodeResolve: { exportConditions: ['browser', 'development'] }
});
