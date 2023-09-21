/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Tt = exports.IndentConsts = void 0;
    var IndentConsts;
    (function (IndentConsts) {
        IndentConsts[IndentConsts["INCREASE_MASK"] = 1] = "INCREASE_MASK";
        IndentConsts[IndentConsts["DECREASE_MASK"] = 2] = "DECREASE_MASK";
        IndentConsts[IndentConsts["INDENT_NEXTLINE_MASK"] = 4] = "INDENT_NEXTLINE_MASK";
        IndentConsts[IndentConsts["UNINDENT_MASK"] = 8] = "UNINDENT_MASK";
    })(IndentConsts || (exports.IndentConsts = IndentConsts = {}));
    function resetGlobalRegex(reg) {
        if (reg.global) {
            reg.lastIndex = 0;
        }
        return true;
    }
    class $Tt {
        constructor(indentationRules) {
            this.a = indentationRules;
        }
        shouldIncrease(text) {
            if (this.a) {
                if (this.a.increaseIndentPattern && resetGlobalRegex(this.a.increaseIndentPattern) && this.a.increaseIndentPattern.test(text)) {
                    return true;
                }
                // if (this._indentationRules.indentNextLinePattern && this._indentationRules.indentNextLinePattern.test(text)) {
                // 	return true;
                // }
            }
            return false;
        }
        shouldDecrease(text) {
            if (this.a && this.a.decreaseIndentPattern && resetGlobalRegex(this.a.decreaseIndentPattern) && this.a.decreaseIndentPattern.test(text)) {
                return true;
            }
            return false;
        }
        shouldIndentNextLine(text) {
            if (this.a && this.a.indentNextLinePattern && resetGlobalRegex(this.a.indentNextLinePattern) && this.a.indentNextLinePattern.test(text)) {
                return true;
            }
            return false;
        }
        shouldIgnore(text) {
            // the text matches `unIndentedLinePattern`
            if (this.a && this.a.unIndentedLinePattern && resetGlobalRegex(this.a.unIndentedLinePattern) && this.a.unIndentedLinePattern.test(text)) {
                return true;
            }
            return false;
        }
        getIndentMetadata(text) {
            let ret = 0;
            if (this.shouldIncrease(text)) {
                ret += 1 /* IndentConsts.INCREASE_MASK */;
            }
            if (this.shouldDecrease(text)) {
                ret += 2 /* IndentConsts.DECREASE_MASK */;
            }
            if (this.shouldIndentNextLine(text)) {
                ret += 4 /* IndentConsts.INDENT_NEXTLINE_MASK */;
            }
            if (this.shouldIgnore(text)) {
                ret += 8 /* IndentConsts.UNINDENT_MASK */;
            }
            return ret;
        }
    }
    exports.$Tt = $Tt;
});
//# sourceMappingURL=indentRules.js.map