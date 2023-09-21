/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/strings", "vs/editor/common/languages/languageConfiguration"], function (require, exports, errors_1, strings, languageConfiguration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OnEnterSupport = void 0;
    class OnEnterSupport {
        constructor(opts) {
            opts = opts || {};
            opts.brackets = opts.brackets || [
                ['(', ')'],
                ['{', '}'],
                ['[', ']']
            ];
            this._brackets = [];
            opts.brackets.forEach((bracket) => {
                const openRegExp = OnEnterSupport._createOpenBracketRegExp(bracket[0]);
                const closeRegExp = OnEnterSupport._createCloseBracketRegExp(bracket[1]);
                if (openRegExp && closeRegExp) {
                    this._brackets.push({
                        open: bracket[0],
                        openRegExp: openRegExp,
                        close: bracket[1],
                        closeRegExp: closeRegExp,
                    });
                }
            });
            this._regExpRules = opts.onEnterRules || [];
        }
        onEnter(autoIndent, previousLineText, beforeEnterText, afterEnterText) {
            // (1): `regExpRules`
            if (autoIndent >= 3 /* EditorAutoIndentStrategy.Advanced */) {
                for (let i = 0, len = this._regExpRules.length; i < len; i++) {
                    const rule = this._regExpRules[i];
                    const regResult = [{
                            reg: rule.beforeText,
                            text: beforeEnterText
                        }, {
                            reg: rule.afterText,
                            text: afterEnterText
                        }, {
                            reg: rule.previousLineText,
                            text: previousLineText
                        }].every((obj) => {
                        if (!obj.reg) {
                            return true;
                        }
                        obj.reg.lastIndex = 0; // To disable the effect of the "g" flag.
                        return obj.reg.test(obj.text);
                    });
                    if (regResult) {
                        return rule.action;
                    }
                }
            }
            // (2): Special indent-outdent
            if (autoIndent >= 2 /* EditorAutoIndentStrategy.Brackets */) {
                if (beforeEnterText.length > 0 && afterEnterText.length > 0) {
                    for (let i = 0, len = this._brackets.length; i < len; i++) {
                        const bracket = this._brackets[i];
                        if (bracket.openRegExp.test(beforeEnterText) && bracket.closeRegExp.test(afterEnterText)) {
                            return { indentAction: languageConfiguration_1.IndentAction.IndentOutdent };
                        }
                    }
                }
            }
            // (4): Open bracket based logic
            if (autoIndent >= 2 /* EditorAutoIndentStrategy.Brackets */) {
                if (beforeEnterText.length > 0) {
                    for (let i = 0, len = this._brackets.length; i < len; i++) {
                        const bracket = this._brackets[i];
                        if (bracket.openRegExp.test(beforeEnterText)) {
                            return { indentAction: languageConfiguration_1.IndentAction.Indent };
                        }
                    }
                }
            }
            return null;
        }
        static _createOpenBracketRegExp(bracket) {
            let str = strings.escapeRegExpCharacters(bracket);
            if (!/\B/.test(str.charAt(0))) {
                str = '\\b' + str;
            }
            str += '\\s*$';
            return OnEnterSupport._safeRegExp(str);
        }
        static _createCloseBracketRegExp(bracket) {
            let str = strings.escapeRegExpCharacters(bracket);
            if (!/\B/.test(str.charAt(str.length - 1))) {
                str = str + '\\b';
            }
            str = '^\\s*' + str;
            return OnEnterSupport._safeRegExp(str);
        }
        static _safeRegExp(def) {
            try {
                return new RegExp(def);
            }
            catch (err) {
                (0, errors_1.onUnexpectedError)(err);
                return null;
            }
        }
    }
    exports.OnEnterSupport = OnEnterSupport;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib25FbnRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vbGFuZ3VhZ2VzL3N1cHBvcnRzL29uRW50ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBbUJoRyxNQUFhLGNBQWM7UUFLMUIsWUFBWSxJQUE0QjtZQUN2QyxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUNsQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLElBQUk7Z0JBQ2hDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztnQkFDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Z0JBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO2FBQ1YsQ0FBQztZQUVGLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ2pDLE1BQU0sVUFBVSxHQUFHLGNBQWMsQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkUsTUFBTSxXQUFXLEdBQUcsY0FBYyxDQUFDLHlCQUF5QixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN6RSxJQUFJLFVBQVUsSUFBSSxXQUFXLEVBQUU7b0JBQzlCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO3dCQUNuQixJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQzt3QkFDaEIsVUFBVSxFQUFFLFVBQVU7d0JBQ3RCLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO3dCQUNqQixXQUFXLEVBQUUsV0FBVztxQkFDeEIsQ0FBQyxDQUFDO2lCQUNIO1lBQ0YsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUks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