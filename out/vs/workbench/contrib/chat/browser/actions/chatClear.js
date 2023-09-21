/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/chat/browser/chatEditorInput", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService"], function (require, exports, chatEditorInput_1, editorGroupsService_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.clearChatEditor = void 0;
    async function clearChatEditor(accessor) {
        const editorService = accessor.get(editorService_1.IEditorService);
        const editorGroupsService = accessor.get(editorGroupsService_1.IEditorGroupsService);
        const chatEditorInput = editorService.activeEditor;
        if (chatEditorInput instanceof chatEditorInput_1.ChatEditorInput && chatEditorInput.providerId) {
            await editorService.replaceEditors([{
                    editor: chatEditorInput,
                    replacement: { resource: chatEditorInput_1.ChatEditorInput.getNewEditorUri(), options: { target: { providerId: chatEditorInput.providerId, pinned: true } } }
                }], editorGroupsService.activeGroup);
        }
    }
    exports.clearChatEditor = clearChatEditor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdENsZWFyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY2hhdC9icm93c2VyL2FjdGlvbnMvY2hhdENsZWFyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVF6RixLQUFLLFVBQVUsZUFBZSxDQUFDLFFBQTBCO1FBQy9ELE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsOEJBQWMsQ0FBQyxDQUFDO1FBQ25ELE1BQU0sbUJBQW1CLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywwQ0FBb0IsQ0FBQyxDQUFDO1FBRS9ELE1BQU0sZUFBZSxHQUFHLGFBQWEsQ0FBQyxZQUFZLENBQUM7UUFDbkQsSUFBSSxlQUFlLFlBQVksaUNBQWUsSUFBSSxlQUFlLENBQUMsVUFBVSxFQUFFO1lBQzdFLE1BQU0sYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUNuQyxNQUFNLEVBQUUsZUFBZTtvQkFDdkIsV0FBVyxFQUFFLEVBQUUsUUFBUSxFQUFFLGlDQUFlLENBQUMsZUFBZSxFQUFFLEVBQUUsT0FBTyxFQUFzQixFQUFFLE1BQU0sRUFBRSxFQUFFLFVBQVUsRUFBRSxlQUFlLENBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFO2lCQUMvSixDQUFDLEVBQUUsbUJBQW1CLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDckM7SUFDRixDQUFDO0lBWEQsMENBV0MifQ==