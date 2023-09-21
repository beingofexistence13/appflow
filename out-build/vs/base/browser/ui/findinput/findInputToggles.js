/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/toggle/toggle", "vs/base/common/codicons", "vs/nls!vs/base/browser/ui/findinput/findInputToggles"], function (require, exports, toggle_1, codicons_1, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$GR = exports.$FR = exports.$ER = void 0;
    const NLS_CASE_SENSITIVE_TOGGLE_LABEL = nls.localize(0, null);
    const NLS_WHOLE_WORD_TOGGLE_LABEL = nls.localize(1, null);
    const NLS_REGEX_TOGGLE_LABEL = nls.localize(2, null);
    class $ER extends toggle_1.$KQ {
        constructor(opts) {
            super({
                icon: codicons_1.$Pj.caseSensitive,
                title: NLS_CASE_SENSITIVE_TOGGLE_LABEL + opts.appendTitle,
                isChecked: opts.isChecked,
                inputActiveOptionBorder: opts.inputActiveOptionBorder,
                inputActiveOptionForeground: opts.inputActiveOptionForeground,
                inputActiveOptionBackground: opts.inputActiveOptionBackground
            });
        }
    }
    exports.$ER = $ER;
    class $FR extends toggle_1.$KQ {
        constructor(opts) {
            super({
                icon: codicons_1.$Pj.wholeWord,
                title: NLS_WHOLE_WORD_TOGGLE_LABEL + opts.appendTitle,
                isChecked: opts.isChecked,
                inputActiveOptionBorder: opts.inputActiveOptionBorder,
                inputActiveOptionForeground: opts.inputActiveOptionForeground,
                inputActiveOptionBackground: opts.inputActiveOptionBackground
            });
        }
    }
    exports.$FR = $FR;
    class $GR extends toggle_1.$KQ {
        constructor(opts) {
            super({
                icon: codicons_1.$Pj.regex,
                title: NLS_REGEX_TOGGLE_LABEL + opts.appendTitle,
                isChecked: opts.isChecked,
                inputActiveOptionBorder: opts.inputActiveOptionBorder,
                inputActiveOptionForeground: opts.inputActiveOptionForeground,
                inputActiveOptionBackground: opts.inputActiveOptionBackground
            });
        }
    }
    exports.$GR = $GR;
});
//# sourceMappingURL=findInputToggles.js.map