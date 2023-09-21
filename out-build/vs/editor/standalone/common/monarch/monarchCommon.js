/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$C8b = exports.$B8b = exports.$A8b = exports.$z8b = exports.log = exports.$x8b = exports.$w8b = exports.$v8b = exports.$u8b = exports.$t8b = exports.$s8b = exports.$r8b = exports.MonarchBracket = void 0;
    /*
     * This module exports common types and functionality shared between
     * the Monarch compiler that compiles JSON to ILexer, and the Monarch
     * Tokenizer (that highlights at runtime)
     */
    /*
     * Type definitions to be used internally to Monarch.
     * Inside monarch we use fully typed definitions and compiled versions of the more abstract JSON descriptions.
     */
    var MonarchBracket;
    (function (MonarchBracket) {
        MonarchBracket[MonarchBracket["None"] = 0] = "None";
        MonarchBracket[MonarchBracket["Open"] = 1] = "Open";
        MonarchBracket[MonarchBracket["Close"] = -1] = "Close";
    })(MonarchBracket || (exports.MonarchBracket = MonarchBracket = {}));
    function $r8b(what) {
        return (Array.isArray(what));
    }
    exports.$r8b = $r8b;
    function $s8b(what) {
        return !$r8b(what);
    }
    exports.$s8b = $s8b;
    function $t8b(what) {
        return (typeof what === 'string');
    }
    exports.$t8b = $t8b;
    function $u8b(what) {
        return !$t8b(what);
    }
    exports.$u8b = $u8b;
    // Small helper functions
    /**
     * Is a string null, undefined, or empty?
     */
    function $v8b(s) {
        return (s ? false : true);
    }
    exports.$v8b = $v8b;
    /**
     * Puts a string to lower case if 'ignoreCase' is set.
     */
    function $w8b(lexer, str) {
        return (lexer.ignoreCase && str ? str.toLowerCase() : str);
    }
    exports.$w8b = $w8b;
    /**
     * Ensures there are no bad characters in a CSS token class.
     */
    function $x8b(s) {
        return s.replace(/[&<>'"_]/g, '-'); // used on all output token CSS classes
    }
    exports.$x8b = $x8b;
    // Logging
    /**
     * Logs a message.
     */
    function log(lexer, msg) {
        console.log(`${lexer.languageId}: ${msg}`);
    }
    exports.log = log;
    // Throwing errors
    function $z8b(lexer, msg) {
        return new Error(`${lexer.languageId}: ${msg}`);
    }
    exports.$z8b = $z8b;
    // Helper functions for rule finding and substitution
    /**
     * substituteMatches is used on lexer strings and can substitutes predefined patterns:
     * 		$$  => $
     * 		$#  => id
     * 		$n  => matched entry n
     * 		@attr => contents of lexer[attr]
     *
     * See documentation for more info
     */
    function $A8b(lexer, str, id, matches, state) {
        const re = /\$((\$)|(#)|(\d\d?)|[sS](\d\d?)|@(\w+))/g;
        let stateMatches = null;
        return str.replace(re, function (full, sub, dollar, hash, n, s, attr, ofs, total) {
            if (!$v8b(dollar)) {
                return '$'; // $$
            }
            if (!$v8b(hash)) {
                return $w8b(lexer, id); // default $#
            }
            if (!$v8b(n) && n < matches.length) {
                return $w8b(lexer, matches[n]); // $n
            }
            if (!$v8b(attr) && lexer && typeof (lexer[attr]) === 'string') {
                return lexer[attr]; //@attribute
            }
            if (stateMatches === null) { // split state on demand
                stateMatches = state.split('.');
                stateMatches.unshift(state);
            }
            if (!$v8b(s) && s < stateMatches.length) {
                return $w8b(lexer, stateMatches[s]); //$Sn
            }
            return '';
        });
    }
    exports.$A8b = $A8b;
    /**
     * Find the tokenizer rules for a specific state (i.e. next action)
     */
    function $B8b(lexer, inState) {
        let state = inState;
        while (state && state.length > 0) {
            const rules = lexer.tokenizer[state];
            if (rules) {
                return rules;
            }
            const idx = state.lastIndexOf('.');
            if (idx < 0) {
                state = null; // no further parent
            }
            else {
                state = state.substr(0, idx);
            }
        }
        return null;
    }
    exports.$B8b = $B8b;
    /**
     * Is a certain state defined? In contrast to 'findRules' this works on a ILexerMin.
     * This is used during compilation where we may know the defined states
     * but not yet whether the corresponding rules are correct.
     */
    function $C8b(lexer, inState) {
        let state = inState;
        while (state && state.length > 0) {
            const exist = lexer.stateNames[state];
            if (exist) {
                return true;
            }
            const idx = state.lastIndexOf('.');
            if (idx < 0) {
                state = null; // no further parent
            }
            else {
                state = state.substr(0, idx);
            }
        }
        return false;
    }
    exports.$C8b = $C8b;
});
//# sourceMappingURL=monarchCommon.js.map