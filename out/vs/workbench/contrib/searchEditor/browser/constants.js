/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/contextkey/common/contextkey"], function (require, exports, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SearchEditorInputTypeId = exports.ToggleSearchEditorContextLinesCommandId = exports.OpenEditorCommandId = exports.OpenNewEditorCommandId = exports.SearchEditorID = exports.SearchEditorFindMatchClass = exports.SearchEditorWorkingCopyTypeId = exports.SearchEditorScheme = exports.InSearchEditor = void 0;
    exports.InSearchEditor = new contextkey_1.RawContextKey('inSearchEditor', false);
    exports.SearchEditorScheme = 'search-editor';
    exports.SearchEditorWorkingCopyTypeId = 'search/editor';
    exports.SearchEditorFindMatchClass = 'searchEditorFindMatch';
    exports.SearchEditorID = 'workbench.editor.searchEditor';
    exports.OpenNewEditorCommandId = 'search.action.openNewEditor';
    exports.OpenEditorCommandId = 'search.action.openEditor';
    exports.ToggleSearchEditorContextLinesCommandId = 'toggleSearchEditorContextLines';
    exports.SearchEditorInputTypeId = 'workbench.editorinputs.searchEditorInput';
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc2VhcmNoRWRpdG9yL2Jyb3dzZXIvY29uc3RhbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUluRixRQUFBLGNBQWMsR0FBRyxJQUFJLDBCQUFhLENBQVUsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFFckUsUUFBQSxrQkFBa0IsR0FBRyxlQUFlLENBQUM7SUFFckMsUUFBQSw2QkFBNkIsR0FBRyxlQUFlLENBQUM7SUFFaEQsUUFBQSwwQkFBMEIsR0FBRyx1QkFBdUIsQ0FBQztJQUVyRCxRQUFBLGNBQWMsR0FBRywrQkFBK0IsQ0FBQztJQUVqRCxRQUFBLHNCQUFzQixHQUFHLDZCQUE2QixDQUFDO0lBQ3ZELFFBQUEsbUJBQW1CLEdBQUcsMEJBQTBCLENBQUM7SUFDakQsUUFBQSx1Q0FBdUMsR0FBRyxnQ0FBZ0MsQ0FBQztJQUUzRSxRQUFBLHVCQUF1QixHQUFHLDBDQUEwQyxDQUFDIn0=