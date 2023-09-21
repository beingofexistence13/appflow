/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/strings", "vs/editor/common/languages/languageConfiguration"], function (require, exports, errors_1, strings, languageConfiguration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ut = void 0;
    class $Ut {
        constructor(opts) {
            opts = opts || {};
            opts.brackets = opts.brackets || [
                ['(', ')'],
                ['{', '}'],
                ['[', ']']
            ];
            this.a = [];
            opts.brackets.forEach((bracket) => {
                const openRegExp = $Ut.c(bracket[0]);
                const closeRegExp = $Ut.d(bracket[1]);
                if (openRegExp && closeRegExp) {
                    this.a.push({
                        open: bracket[0],
                        openRegExp: openRegExp,
                        close: bracket[1],
                        closeRegExp: closeRegExp,
                    });
                }
            });
            this.b = opts.onEnterRules || [];
        }
        onEnter(autoIndent, previousLineText, beforeEnterText, afterEnterText) {
            // (1): `regExpRules`
            if (autoIndent >= 3 /* EditorAutoIndentStrategy.Advanced */) {
                for (let i = 0, len = this.b.length; i < len; i++) {
                    const rule = this.b[i];
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
                    for (let i = 0, len = this.a.length; i < len; i++) {
                        const bracket = this.a[i];
                        if (bracket.openRegExp.test(beforeEnterText) && bracket.closeRegExp.test(afterEnterText)) {
                            return { indentAction: languageConfiguration_1.IndentAction.IndentOutdent };
                        }
                    }
                }
            }
            // (4): Open bracket based logic
            if (autoIndent >= 2 /* EditorAutoIndentStrategy.Brackets */) {
                if (beforeEnterText.length > 0) {
                    for (let i = 0, len = this.a.length; i < len; i++) {
                        const bracket = this.a[i];
                        if (bracket.openRegExp.test(beforeEnterText)) {
                            return { indentAction: languageConfiguration_1.IndentAction.Indent };
                        }
                    }
                }
            }
            return null;
        }
        static c(bracket) {
            let str = strings.$qe(bracket);
            if (!/\B/.test(str.charAt(0))) {
                str = '\\b' + str;
            }
            str += '\\s*$';
            return $Ut.e(str);
        }
        static d(bracket) {
            let str = strings.$qe(bracket);
            if (!/\B/.test(str.charAt(str.length - 1))) {
                str = str + '\\b';
            }
            str = '^\\s*' + str;
            return $Ut.e(str);
        }
        static e(def) {
            try {
                return new RegExp(def);
            }
            catch (err) {
                (0, errors_1.$Y)(err);
                return null;
            }
        }
    }
    exports.$Ut = $Ut;
});
//# sourceMappingURL=onEnter.js.map