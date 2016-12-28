/**
 * @fileoverview Lint JSON files
 * @author Azeem Bande-Ali
 * @copyright 2015 Azeem Bande-Ali. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";

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

module.exports ={
    processors: {
        ".json": {
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
        "parsable-json": {
            create: function (context) {
                return {
                    Program: tryToParseJSON(context)
                };
            }
        }
    }
};
