module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-styled-components',
    'stylelint-order',
    'stylelint-prettier/recommended',
  ],
  processors: ['stylelint-processor-styled-components'],
  rules: {
    'at-rule-no-vendor-prefix': true,
    'comment-empty-line-before': null,
    'declaration-colon-newline-after': null,
    'media-feature-name-no-vendor-prefix': true,
    'property-no-vendor-prefix': true,
    'rule-empty-line-before': null,
    'selector-no-vendor-prefix': true,
    'value-no-vendor-prefix': true,
  },
}
