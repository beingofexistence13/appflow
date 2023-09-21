/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/chat/browser/chatEditorInput", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService"], function (require, exports, chatEditorInput_1, editorGroupsService_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$BIb = void 0;
    async function $BIb(accessor) {
        const editorService = accessor.get(editorService_1.$9C);
        const editorGroupsService = accessor.get(editorGroupsService_1.$5C);
        const chatEditorInput = editorService.activeEditor;
        if (chatEditorInput instanceof chatEditorInput_1.$yGb && chatEditorInput.providerId) {
            await editorService.replaceEditors([{
                    editor: chatEditorInput,
                    replacement: { resource: chatEditorInput_1.$yGb.getNewEditorUri(), options: { target: { providerId: chatEditorInput.providerId, pinned: true } } }
                }], editorGroupsService.activeGroup);
        }
    }
    exports.$BIb = $BIb;
});
//# sourceMappingURL=chatClear.js.map