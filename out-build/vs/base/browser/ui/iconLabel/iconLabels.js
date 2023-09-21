/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/themables"], function (require, exports, dom, themables_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$yQ = exports.$xQ = void 0;
    const labelWithIconsRegex = new RegExp(`(\\\\)?\\$\\((${themables_1.ThemeIcon.iconNameExpression}(?:${themables_1.ThemeIcon.iconModifierExpression})?)\\)`, 'g');
    function $xQ(text) {
        const elements = new Array();
        let match;
        let textStart = 0, textStop = 0;
        while ((match = labelWithIconsRegex.exec(text)) !== null) {
            textStop = match.index || 0;
            if (textStart < textStop) {
                elements.push(text.substring(textStart, textStop));
            }
            textStart = (match.index || 0) + match[0].length;
            const [, escaped, codicon] = match;
            elements.push(escaped ? `$(${codicon})` : $yQ({ id: codicon }));
        }
        if (textStart < text.length) {
            elements.push(text.substring(textStart));
        }
        return elements;
    }
    exports.$xQ = $xQ;
    function $yQ(icon) {
        const node = dom.$(`span`);
        node.classList.add(...themables_1.ThemeIcon.asClassNameArray(icon));
        return node;
    }
    exports.$yQ = $yQ;
});
//# sourceMappingURL=iconLabels.js.map