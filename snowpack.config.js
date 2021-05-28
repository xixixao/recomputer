export default {
  exclude: ["**/node_modules/**/*", "**/.git/**/*", "**/docs/**"],
  optimize: {
    bundle: true,
    minify: true,
    sourcemap: false,
    treeshake: true,
    target: "es2020",
  },
};
