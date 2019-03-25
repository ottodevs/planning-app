/* global module */
module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-order',
    // TODO: false positive with: styled(Component)
    // 'stylelint-prettier/recommended',
    'stylelint-config-styled-components',
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
