module.exports = {
  default: {
    paths: ["features/**/*.feature"],
    require: ["features/step_definitions/**/*.ts", "features/support/**/*.ts"],
    requireModule: ["ts-node/register"],
    format: ["@cucumber/pretty-formatter", "html:cucumber-report.html"],
    parallel: 2,
  },
};
