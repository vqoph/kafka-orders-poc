/** @type {import('@rtk-query/codegen-openapi').ConfigFile} */
module.exports = {
  schemaFile: './openapi.json',
  apiFile: './src/api/emptyApi.ts',
  apiImport: 'emptySplitApi',
  outputFile: './src/api/generatedApi.ts',
  exportName: 'generatedApi',
  hooks: true,
};
