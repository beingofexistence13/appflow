/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IndentRulesSupport = exports.IndentConsts = void 0;
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
    class IndentRulesSupport {
        constructor(indentationRules) {
            this._indentationRules = indentationRules;
        }
        shouldIncrease(text) {
            if (this._indentationRules) {
                if (this._indentationRules.increaseIndentPattern && resetGlobalRegex(this._indentationRules.increaseIndentPattern) && this._indentationRules.increaseIndentPattern.test(text)) {
                    return true;
                }
                // if (this._indentationRules.indentNextLinePattern && this._indentationRules.indentNextLinePattern.test(text)) {
                // 	return true;
                // }
            }
            return false;
        }
        shouldDecrease(text) {
            if (this._indentationRules && this._indentationRules.decreaseIndentPattern && resetGlobalRegex(this._indentationRules.decreaseIndentPattern) && this._indentationRules.decreaseIndentPattern.test(text)) {
                return true;
            }
            return false;
        }
        shouldIndentNextLine(text) {
            if (this._indentationRules && this._indentationRules.indentNextLinePattern && resetGlobalRegex(this._indentationRules.indentNextLinePattern) && this._indentationRules.indentNextLinePattern.test(text)) {
                return true;
            }
            return false;
        }
        shouldIgnore(text) {
            // the text matches `unIndentedLinePattern`
            if (this._indentationRules && this._indentationRules.unIndentedLinePattern && resetGlobalRegex(this._indentationRules.unIndentedLinePattern) && this._indentationRules.unIndentedLinePattern.test(text)) {
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
    exports.IndentRulesSupport = IndentRulesSupport;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZW50UnVsZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL2xhbmd1YWdlcy9zdXBwb3J0cy9pbmRlbnRSdWxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFJaEcsSUFBa0IsWUFLakI7SUFMRCxXQUFrQixZQUFZO1FBQzdCLGlFQUEwQixDQUFBO1FBQzFCLGlFQUEwQixDQUFBO1FBQzFCLCtFQUFpQyxDQUFBO1FBQ2pDLGlFQUEwQixDQUFBO0lBQzNCLENBQUMsRUFMaUIsWUFBWSw0QkFBWixZQUFZLFFBSzdCO0lBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxHQUFXO1FBQ3BDLElBQUksR0FBRyxDQUFDLE1BQU0sRUFBRTtZQUNmLEdBQUcsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO1NBQ2xCO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQsTUFBYSxrQkFBa0I7UUFJOUIsWUFBWSxnQkFBaUM7WUFDNUMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGdCQUFnQixDQUFDO1FBQzNDLENBQUM7UUFFTSxjQUFjLENBQUMsSUFBWTtZQUNqQyxJQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtnQkFDM0IsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMscUJBQXFCLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLHFCQUFxQixDQUFDLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDOUssT0FBTyxJQUFJLENBQUM7aUJBQ1o7Z0JBQ0QsaUhBQWlIO2dCQUNqSCxnQkFBZ0I7Z0JBQ2hCLElBQUk7YUFDSjtZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVNLGNBQWMsQ0FBQyxJQUFZO1lBQ2pDLElBQUksSUFBSSxDQUFDLGlCQUFpQixJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxxQkFBcUIsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMscUJBQXFCLENBQUMsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUN4TSxPQUFPLElBQUksQ0FBQzthQUNaO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRU0sb0JBQW9CLENBQUMsSUFBWTtZQUN2QyxJQUFJLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMscUJBQXFCLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLHFCQUFxQixDQUFDLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDeE0sT0FBTyxJQUFJLENBQUM7YUFDWjtZQUVELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVNLFlBQVksQ0FBQyxJQUFZO1lBQy9CLDJDQUEyQztZQUMzQyxJQUFJLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMscUJBQXFCLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLHFCQUFxQixDQUFDLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDeE0sT0FBTyxJQUFJLENBQUM7YUFDWjtZQUVELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVNLGlCQUFpQixDQUFDLElBQVk7WUFDcEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQ1osSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUM5QixHQUFHLHNDQUE4QixDQUFDO2FBQ2xDO1lBQ0QsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUM5QixHQUFHLHNDQUE4QixDQUFDO2FBQ2xDO1lBQ0QsSUFBSSxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3BDLEdBQUcsNkNBQXFDLENBQUM7YUFDekM7WUFDRCxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzVCLEdBQUcsc0NBQThCLENBQUM7YUFDbEM7WUFDRCxPQUFPLEdBQUcsQ0FBQztRQUNaLENBQUM7S0FDRDtJQTVERCxnREE0REMifQ==