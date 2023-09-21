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
        const menubar = new menubar_1.MenuBar(container, {
            enableMnemonics: true,
            visibility: 'visible'
        }, menu_1.unthemedMenuStyles);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudWJhci50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS90ZXN0L2Jyb3dzZXIvdWkvbWVudS9tZW51YmFyLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFPaEcsU0FBUywyQkFBMkIsQ0FBQyxjQUEyQixFQUFFLFNBQWlCO1FBQ2xGLElBQUksQ0FBQyxDQUFDO1FBQ04sS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxjQUFjLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFFdEQsSUFBSSxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsS0FBSyxTQUFTLEVBQUU7Z0JBQ3hFLE9BQU8sY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQWdCLENBQUM7YUFDakQ7U0FDRDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVELFNBQVMsd0JBQXdCLENBQUMsaUJBQThCO1FBQy9ELElBQUksQ0FBQyxDQUFDO1FBQ04sS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxpQkFBaUIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN6RCxJQUFJLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDLEVBQUU7Z0JBQzNFLE9BQU8saUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBZ0IsQ0FBQzthQUNwRDtTQUNEO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQsU0FBUyx1QkFBdUIsQ0FBQyxZQUF5QjtRQUN6RCxJQUFJLENBQUMsQ0FBQztRQUNOLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsWUFBWSxDQUFDLGlCQUFpQixFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3BELElBQUksWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsS0FBSyxVQUFVLEVBQUU7Z0JBQ3hFLE9BQU8sWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUM7YUFDNUM7U0FDRDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVELFNBQVMsbUJBQW1CLENBQUMsT0FBZ0IsRUFBRSxnQkFBNkIsRUFBRSxLQUFhLEVBQUUsYUFBcUIsRUFBRSxRQUFnQjtRQUNuSSxPQUFPLENBQUMsSUFBSSxDQUFDO1lBQ1o7Z0JBQ0MsT0FBTyxFQUFFLEVBQUU7Z0JBQ1gsS0FBSyxFQUFFLEtBQUs7YUFDWjtTQUNELENBQUMsQ0FBQztRQUVILE1BQU0sYUFBYSxHQUFHLDJCQUEyQixDQUFDLGdCQUFnQixFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ25GLE1BQU0sQ0FBQyxhQUFhLEtBQUssSUFBSSxFQUFFLGdDQUFnQyxhQUFhLFVBQVUsQ0FBQyxDQUFDO1FBRXhGLE1BQU0sUUFBUSxHQUFHLHdCQUF3QixDQUFDLGFBQWMsQ0FBQyxDQUFDO1FBQzFELE1BQU0sQ0FBQyxRQUFRLEtBQUssSUFBSSxFQUFFLDJCQUEyQixhQUFhLFVBQVUsQ0FBQyxDQUFDO1FBRTlFLE1BQU0sSUFBSSxHQUFHLHVCQUF1QixDQUFDLFFBQVMsQ0FBQyxDQUFDO1FBQ2hELE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRTtRQUNyQixNQUFNLFNBQVMsR0FBRyxJQUFBLE9BQUMsRUFBQyxZQUFZLENBQUMsQ0FBQztRQUVsQyxNQUFNLE9BQU8sR0FBRyxJQUFJLGlCQUFPLENBQUMsU0FBUyxFQUFFO1lBQ3RDLGVBQWUsRUFBRSxJQUFJO1lBQ3JCLFVBQVUsRUFBRSxTQUFTO1NBQ3JCLEVBQUUseUJBQWtCLENBQUMsQ0FBQztRQUV2QixJQUFJLENBQUMscUNBQXFDLEVBQUU7WUFDM0MsbUJBQW1CLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQy9ELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHFDQUFxQyxFQUFFO1lBQzNDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMvRCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxxQ0FBcUMsRUFBRTtZQUMzQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDOUQsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyJ9