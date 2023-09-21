/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls"], function (require, exports, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.terminalStrings = void 0;
    /**
     * An object holding strings shared by multiple parts of the terminal
     */
    exports.terminalStrings = {
        terminal: (0, nls_1.localize)('terminal', "Terminal"),
        new: (0, nls_1.localize)('terminal.new', "New Terminal"),
        doNotShowAgain: (0, nls_1.localize)('doNotShowAgain', 'Do Not Show Again'),
        currentSessionCategory: (0, nls_1.localize)('currentSessionCategory', 'current session'),
        previousSessionCategory: (0, nls_1.localize)('previousSessionCategory', 'previous session'),
        actionCategory: {
            value: (0, nls_1.localize)('terminalCategory', "Terminal"),
            original: 'Terminal'
        },
        focus: {
            value: (0, nls_1.localize)('workbench.action.terminal.focus', "Focus Terminal"),
            original: 'Focus Terminal'
        },
        focusAndHideAccessibleBuffer: {
            value: (0, nls_1.localize)('workbench.action.terminal.focusAndHideAccessibleBuffer', "Focus Terminal and Hide Accessible Buffer"),
            original: 'Focus Terminal and Hide Accessible Buffer'
        },
        kill: {
            value: (0, nls_1.localize)('killTerminal', "Kill Terminal"),
            original: 'Kill Terminal',
            short: (0, nls_1.localize)('killTerminal.short', "Kill"),
        },
        moveToEditor: {
            value: (0, nls_1.localize)('moveToEditor', "Move Terminal into Editor Area"),
            original: 'Move Terminal into Editor Area',
        },
        moveToTerminalPanel: {
            value: (0, nls_1.localize)('workbench.action.terminal.moveToTerminalPanel', "Move Terminal into Panel"),
            original: 'Move Terminal into Panel'
        },
        changeIcon: {
            value: (0, nls_1.localize)('workbench.action.terminal.changeIcon', "Change Icon..."),
            original: 'Change Icon...'
        },
        changeColor: {
            value: (0, nls_1.localize)('workbench.action.terminal.changeColor', "Change Color..."),
            original: 'Change Color...'
        },
        split: {
            value: (0, nls_1.localize)('splitTerminal', "Split Terminal"),
            original: 'Split Terminal',
            short: (0, nls_1.localize)('splitTerminal.short', "Split"),
        },
        unsplit: {
            value: (0, nls_1.localize)('unsplitTerminal', "Unsplit Terminal"),
            original: 'Unsplit Terminal'
        },
        rename: {
            value: (0, nls_1.localize)('workbench.action.terminal.rename', "Rename..."),
            original: 'Rename...'
        },
        toggleSizeToContentWidth: {
            value: (0, nls_1.localize)('workbench.action.terminal.sizeToContentWidthInstance', "Toggle Size to Content Width"),
            original: 'Toggle Size to Content Width'
        },
        focusHover: {
            value: (0, nls_1.localize)('workbench.action.terminal.focusHover', "Focus Hover"),
            original: 'Focus Hover'
        },
        sendSequence: {
            value: (0, nls_1.localize)('workbench.action.terminal.sendSequence', "Send Custom Sequence To Terminal"),
            original: 'Send Custom Sequence To Terminal'
        },
        newWithCwd: {
            value: (0, nls_1.localize)('workbench.action.terminal.newWithCwd', "Create New Terminal Starting in a Custom Working Directory"),
            original: 'Create New Terminal Starting in a Custom Working Directory'
        },
        renameWithArgs: {
            value: (0, nls_1.localize)('workbench.action.terminal.renameWithArg', "Rename the Currently Active Terminal"),
            original: 'Rename the Currently Active Terminal'
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxTdHJpbmdzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvY29tbW9uL3Rlcm1pbmFsU3RyaW5ncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFJaEc7O09BRUc7SUFDVSxRQUFBLGVBQWUsR0FBRztRQUM5QixRQUFRLEVBQUUsSUFBQSxjQUFRLEVBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQztRQUMxQyxHQUFHLEVBQUUsSUFBQSxjQUFRLEVBQUMsY0FBYyxFQUFFLGNBQWMsQ0FBQztRQUM3QyxjQUFjLEVBQUUsSUFBQSxjQUFRLEVBQUMsZ0JBQWdCLEVBQUUsbUJBQW1CLENBQUM7UUFDL0Qsc0JBQXNCLEVBQUUsSUFBQSxjQUFRLEVBQUMsd0JBQXdCLEVBQUUsaUJBQWlCLENBQUM7UUFDN0UsdUJBQXVCLEVBQUUsSUFBQSxjQUFRLEVBQUMseUJBQXlCLEVBQUUsa0JBQWtCLENBQUM7UUFDaEYsY0FBYyxFQUFFO1lBQ2YsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGtCQUFrQixFQUFFLFVBQVUsQ0FBQztZQUMvQyxRQUFRLEVBQUUsVUFBVTtTQUNwQjtRQUNELEtBQUssRUFBRTtZQUNOLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxpQ0FBaUMsRUFBRSxnQkFBZ0IsQ0FBQztZQUNwRSxRQUFRLEVBQUUsZ0JBQWdCO1NBQzFCO1FBQ0QsNEJBQTRCLEVBQUU7WUFDN0IsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLHdEQUF3RCxFQUFFLDJDQUEyQyxDQUFDO1lBQ3RILFFBQVEsRUFBRSwyQ0FBMkM7U0FDckQ7UUFDRCxJQUFJLEVBQUU7WUFDTCxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsY0FBYyxFQUFFLGVBQWUsQ0FBQztZQUNoRCxRQUFRLEVBQUUsZUFBZTtZQUN6QixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsb0JBQW9CLEVBQUUsTUFBTSxDQUFDO1NBQzdDO1FBQ0QsWUFBWSxFQUFFO1lBQ2IsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGNBQWMsRUFBRSxnQ0FBZ0MsQ0FBQztZQUNqRSxRQUFRLEVBQUUsZ0NBQWdDO1NBQzFDO1FBQ0QsbUJBQW1CLEVBQUU7WUFDcEIsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLCtDQUErQyxFQUFFLDBCQUEwQixDQUFDO1lBQzVGLFFBQVEsRUFBRSwwQkFBMEI7U0FDcEM7UUFDRCxVQUFVLEVBQUU7WUFDWCxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsc0NBQXNDLEVBQUUsZ0JBQWdCLENBQUM7WUFDekUsUUFBUSxFQUFFLGdCQUFnQjtTQUMxQjtRQUNELFdBQVcsRUFBRTtZQUNaLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyx1Q0FBdUMsRUFBRSxpQkFBaUIsQ0FBQztZQUMzRSxRQUFRLEVBQUUsaUJBQWlCO1NBQzNCO1FBQ0QsS0FBSyxFQUFFO1lBQ04sS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGVBQWUsRUFBRSxnQkFBZ0IsQ0FBQztZQUNsRCxRQUFRLEVBQUUsZ0JBQWdCO1lBQzFCLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxxQkFBcUIsRUFBRSxPQUFPLENBQUM7U0FDL0M7UUFDRCxPQUFPLEVBQUU7WUFDUixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsaUJBQWlCLEVBQUUsa0JBQWtCLENBQUM7WUFDdEQsUUFBUSxFQUFFLGtCQUFrQjtTQUM1QjtRQUNELE1BQU0sRUFBRTtZQUNQLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxrQ0FBa0MsRUFBRSxXQUFXLENBQUM7WUFDaEUsUUFBUSxFQUFFLFdBQVc7U0FDckI7UUFDRCx3QkFBd0IsRUFBRTtZQUN6QixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsc0RBQXNELEVBQUUsOEJBQThCLENBQUM7WUFDdkcsUUFBUSxFQUFFLDhCQUE4QjtTQUN4QztRQUNELFVBQVUsRUFBRTtZQUNYLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxzQ0FBc0MsRUFBRSxhQUFhLENBQUM7WUFDdEUsUUFBUSxFQUFFLGFBQWE7U0FDdkI7UUFDRCxZQUFZLEVBQUU7WUFDYixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsd0NBQXdDLEVBQUUsa0NBQWtDLENBQUM7WUFDN0YsUUFBUSxFQUFFLGtDQUFrQztTQUM1QztRQUNELFVBQVUsRUFBRTtZQUNYLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxzQ0FBc0MsRUFBRSw0REFBNEQsQ0FBQztZQUNySCxRQUFRLEVBQUUsNERBQTREO1NBQ3RFO1FBQ0QsY0FBYyxFQUFFO1lBQ2YsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLHlDQUF5QyxFQUFFLHNDQUFzQyxDQUFDO1lBQ2xHLFFBQVEsRUFBRSxzQ0FBc0M7U0FDaEQ7S0FDRCxDQUFDIn0=