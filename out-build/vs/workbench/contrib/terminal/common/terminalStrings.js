/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/terminal/common/terminalStrings"], function (require, exports, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$pVb = void 0;
    /**
     * An object holding strings shared by multiple parts of the terminal
     */
    exports.$pVb = {
        terminal: (0, nls_1.localize)(0, null),
        new: (0, nls_1.localize)(1, null),
        doNotShowAgain: (0, nls_1.localize)(2, null),
        currentSessionCategory: (0, nls_1.localize)(3, null),
        previousSessionCategory: (0, nls_1.localize)(4, null),
        actionCategory: {
            value: (0, nls_1.localize)(5, null),
            original: 'Terminal'
        },
        focus: {
            value: (0, nls_1.localize)(6, null),
            original: 'Focus Terminal'
        },
        focusAndHideAccessibleBuffer: {
            value: (0, nls_1.localize)(7, null),
            original: 'Focus Terminal and Hide Accessible Buffer'
        },
        kill: {
            value: (0, nls_1.localize)(8, null),
            original: 'Kill Terminal',
            short: (0, nls_1.localize)(9, null),
        },
        moveToEditor: {
            value: (0, nls_1.localize)(10, null),
            original: 'Move Terminal into Editor Area',
        },
        moveToTerminalPanel: {
            value: (0, nls_1.localize)(11, null),
            original: 'Move Terminal into Panel'
        },
        changeIcon: {
            value: (0, nls_1.localize)(12, null),
            original: 'Change Icon...'
        },
        changeColor: {
            value: (0, nls_1.localize)(13, null),
            original: 'Change Color...'
        },
        split: {
            value: (0, nls_1.localize)(14, null),
            original: 'Split Terminal',
            short: (0, nls_1.localize)(15, null),
        },
        unsplit: {
            value: (0, nls_1.localize)(16, null),
            original: 'Unsplit Terminal'
        },
        rename: {
            value: (0, nls_1.localize)(17, null),
            original: 'Rename...'
        },
        toggleSizeToContentWidth: {
            value: (0, nls_1.localize)(18, null),
            original: 'Toggle Size to Content Width'
        },
        focusHover: {
            value: (0, nls_1.localize)(19, null),
            original: 'Focus Hover'
        },
        sendSequence: {
            value: (0, nls_1.localize)(20, null),
            original: 'Send Custom Sequence To Terminal'
        },
        newWithCwd: {
            value: (0, nls_1.localize)(21, null),
            original: 'Create New Terminal Starting in a Custom Working Directory'
        },
        renameWithArgs: {
            value: (0, nls_1.localize)(22, null),
            original: 'Rename the Currently Active Terminal'
        }
    };
});
//# sourceMappingURL=terminalStrings.js.map