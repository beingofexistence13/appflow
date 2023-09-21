/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/browser/dom", "vs/base/browser/ui/menu/menu", "vs/base/browser/ui/menu/menubar"], function (require, exports, assert, dom_1, menu_1, menubar_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function getButtonElementByAriaLabel(menubarElement, ariaLabel) {
        let i;
        for (i = 0; i < menubarElement.childElementCount; i++) {
            if (menubarElement.children[i].getAttribute('aria-label') === ariaLabel) {
                return menubarElement.children[i];
            }
        }
        return null;
    }
    function getTitleDivFromButtonDiv(menuButtonElement) {
        let i;
        for (i = 0; i < menuButtonElement.childElementCount; i++) {
            if (menuButtonElement.children[i].classList.contains('menubar-menu-title')) {
                return menuButtonElement.children[i];
            }
        }
        return null;
    }
    function getMnemonicFromTitleDiv(menuTitleDiv) {
        let i;
        for (i = 0; i < menuTitleDiv.childElementCount; i++) {
            if (menuTitleDiv.children[i].tagName.toLocaleLowerCase() === 'mnemonic') {
                return menuTitleDiv.children[i].textContent;
            }
        }
        return null;
    }
    function validateMenuBarItem(menubar, menubarContainer, label, readableLabel, mnemonic) {
        menubar.push([
            {
                actions: [],
                label: label
            }
        ]);
        const buttonElement = getButtonElementByAriaLabel(menubarContainer, readableLabel);
        assert(buttonElement !== null, `Button element not found for ${readableLabel} button.`);
        const titleDiv = getTitleDivFromButtonDiv(buttonElement);
        assert(titleDiv !== null, `Title div not found for ${readableLabel} button.`);
        const mnem = getMnemonicFromTitleDiv(titleDiv);
        assert.strictEqual(mnem, mnemonic, 'Mnemonic not correct');
    }
    suite('Menubar', () => {
        const container = (0, dom_1.$)('.container');
        const menubar = new menubar_1.$VR(container, {
            enableMnemonics: true,
            visibility: 'visible'
        }, menu_1.$xR);
        test('English File menu renders mnemonics', function () {
            validateMenuBarItem(menubar, container, '&File', 'File', 'F');
        });
        test('Russian File menu renders mnemonics', function () {
            validateMenuBarItem(menubar, container, '&Файл', 'Файл', 'Ф');
        });
        test('Chinese File menu renders mnemonics', function () {
            validateMenuBarItem(menubar, container, '文件(&F)', '文件', 'F');
        });
    });
});
//# sourceMappingURL=menubar.test.js.map