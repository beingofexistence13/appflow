/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/contextkey/common/contextkey"], function (require, exports, nls, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NEW_FILE_COMMAND_ID = exports.NEW_UNTITLED_FILE_LABEL = exports.NEW_UNTITLED_FILE_COMMAND_ID = exports.LAST_COMPRESSED_FOLDER = exports.FIRST_COMPRESSED_FOLDER = exports.NEXT_COMPRESSED_FOLDER = exports.PREVIOUS_COMPRESSED_FOLDER = exports.REMOVE_ROOT_FOLDER_LABEL = exports.REMOVE_ROOT_FOLDER_COMMAND_ID = exports.ResourceSelectedForCompareContext = exports.OpenEditorsReadonlyEditorContext = exports.OpenEditorsDirtyEditorContext = exports.OpenEditorsGroupContext = exports.SAVE_FILES_COMMAND_ID = exports.SAVE_ALL_IN_GROUP_COMMAND_ID = exports.SAVE_ALL_LABEL = exports.SAVE_ALL_COMMAND_ID = exports.SAVE_FILE_WITHOUT_FORMATTING_LABEL = exports.SAVE_FILE_WITHOUT_FORMATTING_COMMAND_ID = exports.SAVE_FILE_LABEL = exports.SAVE_FILE_COMMAND_ID = exports.SAVE_FILE_AS_LABEL = exports.SAVE_FILE_AS_COMMAND_ID = exports.COPY_RELATIVE_PATH_COMMAND_ID = exports.COPY_PATH_COMMAND_ID = exports.COMPARE_WITH_SAVED_COMMAND_ID = exports.COMPARE_RESOURCE_COMMAND_ID = exports.COMPARE_SELECTED_COMMAND_ID = exports.SELECT_FOR_COMPARE_COMMAND_ID = exports.OPEN_WITH_EXPLORER_COMMAND_ID = exports.OPEN_TO_SIDE_COMMAND_ID = exports.REVERT_FILE_COMMAND_ID = exports.REVEAL_IN_EXPLORER_COMMAND_ID = void 0;
    exports.REVEAL_IN_EXPLORER_COMMAND_ID = 'revealInExplorer';
    exports.REVERT_FILE_COMMAND_ID = 'workbench.action.files.revert';
    exports.OPEN_TO_SIDE_COMMAND_ID = 'explorer.openToSide';
    exports.OPEN_WITH_EXPLORER_COMMAND_ID = 'explorer.openWith';
    exports.SELECT_FOR_COMPARE_COMMAND_ID = 'selectForCompare';
    exports.COMPARE_SELECTED_COMMAND_ID = 'compareSelected';
    exports.COMPARE_RESOURCE_COMMAND_ID = 'compareFiles';
    exports.COMPARE_WITH_SAVED_COMMAND_ID = 'workbench.files.action.compareWithSaved';
    exports.COPY_PATH_COMMAND_ID = 'copyFilePath';
    exports.COPY_RELATIVE_PATH_COMMAND_ID = 'copyRelativeFilePath';
    exports.SAVE_FILE_AS_COMMAND_ID = 'workbench.action.files.saveAs';
    exports.SAVE_FILE_AS_LABEL = nls.localize('saveAs', "Save As...");
    exports.SAVE_FILE_COMMAND_ID = 'workbench.action.files.save';
    exports.SAVE_FILE_LABEL = nls.localize('save', "Save");
    exports.SAVE_FILE_WITHOUT_FORMATTING_COMMAND_ID = 'workbench.action.files.saveWithoutFormatting';
    exports.SAVE_FILE_WITHOUT_FORMATTING_LABEL = nls.localize('saveWithoutFormatting', "Save without Formatting");
    exports.SAVE_ALL_COMMAND_ID = 'saveAll';
    exports.SAVE_ALL_LABEL = nls.localize('saveAll', "Save All");
    exports.SAVE_ALL_IN_GROUP_COMMAND_ID = 'workbench.files.action.saveAllInGroup';
    exports.SAVE_FILES_COMMAND_ID = 'workbench.action.files.saveFiles';
    exports.OpenEditorsGroupContext = new contextkey_1.RawContextKey('groupFocusedInOpenEditors', false);
    exports.OpenEditorsDirtyEditorContext = new contextkey_1.RawContextKey('dirtyEditorFocusedInOpenEditors', false);
    exports.OpenEditorsReadonlyEditorContext = new contextkey_1.RawContextKey('readonlyEditorFocusedInOpenEditors', false);
    exports.ResourceSelectedForCompareContext = new contextkey_1.RawContextKey('resourceSelectedForCompare', false);
    exports.REMOVE_ROOT_FOLDER_COMMAND_ID = 'removeRootFolder';
    exports.REMOVE_ROOT_FOLDER_LABEL = nls.localize('removeFolderFromWorkspace', "Remove Folder from Workspace");
    exports.PREVIOUS_COMPRESSED_FOLDER = 'previousCompressedFolder';
    exports.NEXT_COMPRESSED_FOLDER = 'nextCompressedFolder';
    exports.FIRST_COMPRESSED_FOLDER = 'firstCompressedFolder';
    exports.LAST_COMPRESSED_FOLDER = 'lastCompressedFolder';
    exports.NEW_UNTITLED_FILE_COMMAND_ID = 'workbench.action.files.newUntitledFile';
    exports.NEW_UNTITLED_FILE_LABEL = nls.localize('newUntitledFile', "New Untitled Text File");
    exports.NEW_FILE_COMMAND_ID = 'workbench.action.files.newFile';
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZUNvbnN0YW50cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2ZpbGVzL2Jyb3dzZXIvZmlsZUNvbnN0YW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFLbkYsUUFBQSw2QkFBNkIsR0FBRyxrQkFBa0IsQ0FBQztJQUNuRCxRQUFBLHNCQUFzQixHQUFHLCtCQUErQixDQUFDO0lBQ3pELFFBQUEsdUJBQXVCLEdBQUcscUJBQXFCLENBQUM7SUFDaEQsUUFBQSw2QkFBNkIsR0FBRyxtQkFBbUIsQ0FBQztJQUNwRCxRQUFBLDZCQUE2QixHQUFHLGtCQUFrQixDQUFDO0lBRW5ELFFBQUEsMkJBQTJCLEdBQUcsaUJBQWlCLENBQUM7SUFDaEQsUUFBQSwyQkFBMkIsR0FBRyxjQUFjLENBQUM7SUFDN0MsUUFBQSw2QkFBNkIsR0FBRyx5Q0FBeUMsQ0FBQztJQUMxRSxRQUFBLG9CQUFvQixHQUFHLGNBQWMsQ0FBQztJQUN0QyxRQUFBLDZCQUE2QixHQUFHLHNCQUFzQixDQUFDO0lBRXZELFFBQUEsdUJBQXVCLEdBQUcsK0JBQStCLENBQUM7SUFDMUQsUUFBQSxrQkFBa0IsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztJQUMxRCxRQUFBLG9CQUFvQixHQUFHLDZCQUE2QixDQUFDO0lBQ3JELFFBQUEsZUFBZSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQy9DLFFBQUEsdUNBQXVDLEdBQUcsOENBQThDLENBQUM7SUFDekYsUUFBQSxrQ0FBa0MsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLHVCQUF1QixFQUFFLHlCQUF5QixDQUFDLENBQUM7SUFFdEcsUUFBQSxtQkFBbUIsR0FBRyxTQUFTLENBQUM7SUFDaEMsUUFBQSxjQUFjLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFFckQsUUFBQSw0QkFBNEIsR0FBRyx1Q0FBdUMsQ0FBQztJQUV2RSxRQUFBLHFCQUFxQixHQUFHLGtDQUFrQyxDQUFDO0lBRTNELFFBQUEsdUJBQXVCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLDJCQUEyQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3pGLFFBQUEsNkJBQTZCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLGlDQUFpQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3JHLFFBQUEsZ0NBQWdDLEdBQUcsSUFBSSwwQkFBYSxDQUFVLG9DQUFvQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzNHLFFBQUEsaUNBQWlDLEdBQUcsSUFBSSwwQkFBYSxDQUFVLDRCQUE0QixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBRXBHLFFBQUEsNkJBQTZCLEdBQUcsa0JBQWtCLENBQUM7SUFDbkQsUUFBQSx3QkFBd0IsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLDJCQUEyQixFQUFFLDhCQUE4QixDQUFDLENBQUM7SUFFckcsUUFBQSwwQkFBMEIsR0FBRywwQkFBMEIsQ0FBQztJQUN4RCxRQUFBLHNCQUFzQixHQUFHLHNCQUFzQixDQUFDO0lBQ2hELFFBQUEsdUJBQXVCLEdBQUcsdUJBQXVCLENBQUM7SUFDbEQsUUFBQSxzQkFBc0IsR0FBRyxzQkFBc0IsQ0FBQztJQUNoRCxRQUFBLDRCQUE0QixHQUFHLHdDQUF3QyxDQUFDO0lBQ3hFLFFBQUEsdUJBQXVCLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO0lBQ3BGLFFBQUEsbUJBQW1CLEdBQUcsZ0NBQWdDLENBQUMifQ==