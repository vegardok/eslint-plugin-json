/**
 * @fileoverview Lint JSON files
 * @author Azeem Bande-Ali
 * @copyright 2015 Azeem Bande-Ali. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

var includes = require('lodash.includes');
var JS_PREAMBLE = '/* global: fakeObject */\n' +
        'fakeObject = ';

function tryToParseJSON(context) {
    return function (node) {
        var json = context.getSourceCode().text.split(JS_PREAMBLE)[1];
        try {
            JSON.parse(json);
        } catch (e) {
            context.report({
                node: node,
                message: e.message
            });
        }
    };
}

module.exports = {
    processors: {
        '.json': {
            /*
             * Rewrite JSON to valid javascript by assigning it to a fake global
             * variable. The "javascript" will be validated with whatever rules are
             * set up in .eslintrc
             */
            preprocess: function(text) {
                var js = JS_PREAMBLE + text;
                return [js];
            },
            postprocess: function(messages) {
                return messages.reduce(function (out, message) {
                    return out.concat(message);
                }, []);
            }
        }
    },
    rules: {
        'parsable-json': {
            create: function (context) {
                return {
                    Program: tryToParseJSON(context)
                };
            }
        },
        'ensure-fields': {
            create: function (context) {
                var requiredFields = context.options[0].requiredFields || [];
                return {
                    Program: function (ast) {
                        var ObjectExpression = ast
                            .body[0].expression.right;

                        var keys = ObjectExpression.properties.map(function (property) {
                            return property.key.value;
                        });
                        var missingKeys = requiredFields.filter(function (requiredKey) {
                            return !includes(keys, requiredKey);
                        });
                        if (missingKeys.length > 0) {
                            context.report({
                                node: ast,
                                message: 'Missing required keys: ' + missingKeys.join(', ')
                            });
                        }
                    }
                };
            }
        },
        'disallow-enum-type-combination': {
            create: function (context) {
                return {
                    ObjectExpression: function (ast) {
                        var keys = ast.properties.map(function (property) {
                            return property.key.value;
                        });
                        if (includes(keys, 'enum') && includes(keys, 'type')) {
                            context.report({
                                node: ast,
                                message: '`enum` and `type` should not be combined'
                            });
                        }
                    }
                };
            }
        }
    }
};
