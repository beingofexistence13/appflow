/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/welcomeWalkthrough/browser/walkThroughPart", "vs/editor/common/editorContextKeys", "vs/platform/contextkey/common/contextkey"], function (require, exports, editorService_1, walkThroughPart_1, editorContextKeys_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$8Yb = exports.$7Yb = exports.$6Yb = exports.$5Yb = void 0;
    exports.$5Yb = {
        id: 'workbench.action.interactivePlayground.arrowUp',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.$Ii.and(walkThroughPart_1.$3Yb, editorContextKeys_1.EditorContextKeys.editorTextFocus.toNegated()),
        primary: 16 /* KeyCode.UpArrow */,
        handler: accessor => {
            const editorService = accessor.get(editorService_1.$9C);
            const activeEditorPane = editorService.activeEditorPane;
            if (activeEditorPane instanceof walkThroughPart_1.$4Yb) {
                activeEditorPane.arrowUp();
            }
        }
    };
    exports.$6Yb = {
        id: 'workbench.action.interactivePlayground.arrowDown',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.$Ii.and(walkThroughPart_1.$3Yb, editorContextKeys_1.EditorContextKeys.editorTextFocus.toNegated()),
        primary: 18 /* KeyCode.DownArrow */,
        handler: accessor => {
            const editorService = accessor.get(editorService_1.$9C);
            const activeEditorPane = editorService.activeEditorPane;
            if (activeEditorPane instanceof walkThroughPart_1.$4Yb) {
                activeEditorPane.arrowDown();
            }
        }
    };
    exports.$7Yb = {
        id: 'workbench.action.interactivePlayground.pageUp',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.$Ii.and(walkThroughPart_1.$3Yb, editorContextKeys_1.EditorContextKeys.editorTextFocus.toNegated()),
        primary: 11 /* KeyCode.PageUp */,
        handler: accessor => {
            const editorService = accessor.get(editorService_1.$9C);
            const activeEditorPane = editorService.activeEditorPane;
            if (activeEditorPane instanceof walkThroughPart_1.$4Yb) {
                activeEditorPane.pageUp();
            }
        }
    };
    exports.$8Yb = {
        id: 'workbench.action.interactivePlayground.pageDown',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.$Ii.and(walkThroughPart_1.$3Yb, editorContextKeys_1.EditorContextKeys.editorTextFocus.toNegated()),
        primary: 12 /* KeyCode.PageDown */,
        handler: accessor => {
            const editorService = accessor.get(editorService_1.$9C);
            const activeEditorPane = editorService.activeEditorPane;
            if (activeEditorPane instanceof walkThroughPart_1.$4Yb) {
                activeEditorPane.pageDown();
            }
        }
    };
});
//# sourceMappingURL=walkThroughActions.js.map