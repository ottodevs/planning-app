/*global module*/

/**
 * @fileoverview Entry Point of That Planning Suite Ethlint Config
 * @author Autark LLC <autark.xyz>
 */

module.exports = {
  rules: {
    'arg-overflow': ['error', 8],
    'array-declarations': 'error',
    'blank-lines': 'error',
    camelcase: 'error',
    'comma-whitespace': 'error',
    'conditionals-whitespace': 'error',
    constructor: 'error',
    'deprecated-suicide': 'error',
    emit: 'error',
    'error-reason': 'error',
    'function-order': 'error',
    'function-whitespace': 'error',
    'imports-on-top': 'error',
    indentation: 'error',
    lbrace: 'error',
    'linebreak-style': 'error',
    'max-len': 'error',
    mixedcase: 'error',
    'no-constant': 'error',
    'no-empty-blocks': 'error',
    'no-experimental': 'error',
    'no-unused-vars': 'error',
    'operator-whitespace': 'error',
    'pragma-on-top': 'error',
    quotes: 'error',
    'semicolon-whitespace': 'error',
    uppercase: 'error',
    'value-in-payable': 'error',
    'variable-declarations': 'error',
    'visibility-first': 'error',
    whitespace: 'error',

    // Security rules
    'security/enforce-explicit-visibility': ['error'],
    'security/no-inline-assembly': 'error',
    'security/no-low-level-calls': 'error',

    // Disable deprecated rules
    'double-quotes': 'off',
    'no-with': 'off',
  },
}
