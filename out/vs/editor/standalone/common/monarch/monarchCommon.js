/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.stateExists = exports.findRules = exports.substituteMatches = exports.createError = exports.log = exports.sanitize = exports.fixCase = exports.empty = exports.isIAction = exports.isString = exports.isFuzzyAction = exports.isFuzzyActionArr = exports.MonarchBracket = void 0;
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
    function isFuzzyActionArr(what) {
        return (Array.isArray(what));
    }
    exports.isFuzzyActionArr = isFuzzyActionArr;
    function isFuzzyAction(what) {
        return !isFuzzyActionArr(what);
    }
    exports.isFuzzyAction = isFuzzyAction;
    function isString(what) {
        return (typeof what === 'string');
    }
    exports.isString = isString;
    function isIAction(what) {
        return !isString(what);
    }
    exports.isIAction = isIAction;
    // Small helper functions
    /**
     * Is a string null, undefined, or empty?
     */
    function empty(s) {
        return (s ? false : true);
    }
    exports.empty = empty;
    /**
     * Puts a string to lower case if 'ignoreCase' is set.
     */
    function fixCase(lexer, str) {
        return (lexer.ignoreCase && str ? str.toLowerCase() : str);
    }
    exports.fixCase = fixCase;
    /**
     * Ensures there are no bad characters in a CSS token class.
     */
    function sanitize(s) {
        return s.replace(/[&<>'"_]/g, '-'); // used on all output token CSS classes
    }
    exports.sanitize = sanitize;
    // Logging
    /**
     * Logs a message.
     */
    function log(lexer, msg) {
        console.log(`${lexer.languageId}: ${msg}`);
    }
    exports.log = log;
    // Throwing errors
    function createError(lexer, msg) {
        return new Error(`${lexer.languageId}: ${msg}`);
    }
    exports.createError = createError;
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
    function substituteMatches(lexer, str, id, matches, state) {
        const re = /\$((\$)|(#)|(\d\d?)|[sS](\d\d?)|@(\w+))/g;
        let stateMatches = null;
        return str.replace(re, function (full, sub, dollar, hash, n, s, attr, ofs, total) {
            if (!empty(dollar)) {
                return '$'; // $$
            }
            if (!empty(hash)) {
                return fixCase(lexer, id); // default $#
            }
            if (!empty(n) && n < matches.length) {
                return fixCase(lexer, matches[n]); // $n
            }
            if (!empty(attr) && lexer && typeof (lexer[attr]) === 'string') {
                return lexer[attr]; //@attribute
            }
            if (stateMatches === null) { // split state on demand
                stateMatches = state.split('.');
                stateMatches.unshift(state);
            }
            if (!empty(s) && s < stateMatches.length) {
                return fixCase(lexer, stateMatches[s]); //$Sn
            }
            return '';
        });
    }
    exports.substituteMatches = substituteMatches;
    /**
     * Find the tokenizer rules for a specific state (i.e. next action)
     */
    function findRules(lexer, inState) {
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
    exports.findRules = findRules;
    /**
     * Is a certain state defined? In contrast to 'findRules' this works on a ILexerMin.
     * This is used during compilation where we may know the defined states
     * but not yet whether the corresponding rules are correct.
     */
    function stateExists(lexer, inState) {
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
    exports.stateExists = stateExists;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9uYXJjaENvbW1vbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9zdGFuZGFsb25lL2NvbW1vbi9tb25hcmNoL21vbmFyY2hDb21tb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBRWhHOzs7O09BSUc7SUFFSDs7O09BR0c7SUFFSCxJQUFrQixjQUlqQjtJQUpELFdBQWtCLGNBQWM7UUFDL0IsbURBQVEsQ0FBQTtRQUNSLG1EQUFRLENBQUE7UUFDUixzREFBVSxDQUFBO0lBQ1gsQ0FBQyxFQUppQixjQUFjLDhCQUFkLGNBQWMsUUFJL0I7SUFpQ0QsU0FBZ0IsZ0JBQWdCLENBQUMsSUFBaUM7UUFDakUsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRkQsNENBRUM7SUFFRCxTQUFnQixhQUFhLENBQUMsSUFBaUM7UUFDOUQsT0FBTyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFGRCxzQ0FFQztJQUVELFNBQWdCLFFBQVEsQ0FBQyxJQUFpQjtRQUN6QyxPQUFPLENBQUMsT0FBTyxJQUFJLEtBQUssUUFBUSxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUZELDRCQUVDO0lBRUQsU0FBZ0IsU0FBUyxDQUFDLElBQWlCO1FBQzFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUZELDhCQUVDO0lBa0NELHlCQUF5QjtJQUV6Qjs7T0FFRztJQUNILFNBQWdCLEtBQUssQ0FBQyxDQUFTO1FBQzlCLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUZELHNCQUVDO0lBRUQ7O09BRUc7SUFDSCxTQUFnQixPQUFPLENBQUMs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