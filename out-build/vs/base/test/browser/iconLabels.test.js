/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/browser/ui/iconLabel/iconLabels"], function (require, exports, assert, iconLabels_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('renderLabelWithIcons', () => {
        test('no icons', () => {
            const result = (0, iconLabels_1.$xQ)(' hello World .');
            assert.strictEqual(elementsToString(result), ' hello World .');
        });
        test('icons only', () => {
            const result = (0, iconLabels_1.$xQ)('$(alert)');
            assert.strictEqual(elementsToString(result), '<span class="codicon codicon-alert"></span>');
        });
        test('icon and non-icon strings', () => {
            const result = (0, iconLabels_1.$xQ)(` $(alert) Unresponsive`);
            assert.strictEqual(elementsToString(result), ' <span class="codicon codicon-alert"></span> Unresponsive');
        });
        test('multiple icons', () => {
            const result = (0, iconLabels_1.$xQ)('$(check)$(error)');
            assert.strictEqual(elementsToString(result), '<span class="codicon codicon-check"></span><span class="codicon codicon-error"></span>');
        });
        test('escaped icons', () => {
            const result = (0, iconLabels_1.$xQ)('\\$(escaped)');
            assert.strictEqual(elementsToString(result), '$(escaped)');
        });
        test('icon with animation', () => {
            const result = (0, iconLabels_1.$xQ)('$(zip~anim)');
            assert.strictEqual(elementsToString(result), '<span class="codicon codicon-zip codicon-modifier-anim"></span>');
        });
        const elementsToString = (elements) => {
            return elements
                .map(elem => elem instanceof HTMLElement ? elem.outerHTML : elem)
                .reduce((a, b) => a + b, '');
        };
    });
});
//# sourceMappingURL=iconLabels.test.js.map