/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/contextkey/common/contextkey"], function (require, exports, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InTreeViewKey = exports.ViewHasSomeCollapsibleKey = exports.ViewHasFilePatternKey = exports.ViewHasReplacePatternKey = exports.ViewHasSearchPatternKey = exports.MatchFocusKey = exports.IsEditableItemKey = exports.ResourceFolderFocusKey = exports.FolderFocusKey = exports.FileFocusKey = exports.FileMatchOrFolderMatchWithResourceFocusKey = exports.FileMatchOrFolderMatchFocusKey = exports.FileMatchOrMatchFocusKey = exports.FirstMatchFocusKey = exports.HasSearchResults = exports.ReplaceActiveKey = exports.PatternExcludesFocusedKey = exports.PatternIncludesFocusedKey = exports.ReplaceInputBoxFocusedKey = exports.SearchInputBoxFocusedKey = exports.InputBoxFocusedKey = exports.SearchViewFocusedKey = exports.SearchViewVisibleKey = exports.FindInWorkspaceId = exports.FindInFolderId = exports.RestrictSearchToFolderId = exports.FocusPreviousInputActionId = exports.FocusNextInputActionId = exports.ExcludeFolderFromSearchId = exports.ToggleQueryDetailsActionId = exports.ViewAsListActionId = exports.ViewAsTreeActionId = exports.ClearSearchResultsActionId = exports.ExpandSearchResultsActionId = exports.CollapseSearchResultsActionId = exports.ToggleSearchOnTypeActionId = exports.FocusPreviousSearchResultActionId = exports.FocusNextSearchResultActionId = exports.RefreshSearchResultsActionId = exports.CancelSearchActionId = exports.QuickTextSearchActionId = exports.ShowAllSymbolsActionId = exports.ReplaceInFilesActionId = exports.RevealInSideBarForSearchResults = exports.AddCursorsAtSearchResults = exports.TogglePreserveCaseId = exports.ToggleRegexCommandId = exports.ToggleWholeWordCommandId = exports.ToggleCaseSensitiveCommandId = exports.CloseReplaceWidgetActionId = exports.ReplaceAllInFolderActionId = exports.ReplaceAllInFileActionId = exports.ReplaceActionId = exports.FocusSearchListCommandID = exports.ClearSearchHistoryCommandId = exports.OpenInEditorCommandId = exports.CopyAllCommandId = exports.CopyMatchCommandId = exports.CopyPathCommandId = exports.RemoveActionId = exports.OpenMatchToSide = exports.OpenMatch = exports.FocusSearchFromResults = exports.FocusActiveEditorCommandId = exports.FindInFilesActionId = void 0;
    exports.FindInFilesActionId = 'workbench.action.findInFiles';
    exports.FocusActiveEditorCommandId = 'search.action.focusActiveEditor';
    exports.FocusSearchFromResults = 'search.action.focusSearchFromResults';
    exports.OpenMatch = 'search.action.openResult';
    exports.OpenMatchToSide = 'search.action.openResultToSide';
    exports.RemoveActionId = 'search.action.remove';
    exports.CopyPathCommandId = 'search.action.copyPath';
    exports.CopyMatchCommandId = 'search.action.copyMatch';
    exports.CopyAllCommandId = 'search.action.copyAll';
    exports.OpenInEditorCommandId = 'search.action.openInEditor';
    exports.ClearSearchHistoryCommandId = 'search.action.clearHistory';
    exports.FocusSearchListCommandID = 'search.action.focusSearchList';
    exports.ReplaceActionId = 'search.action.replace';
    exports.ReplaceAllInFileActionId = 'search.action.replaceAllInFile';
    exports.ReplaceAllInFolderActionId = 'search.action.replaceAllInFolder';
    exports.CloseReplaceWidgetActionId = 'closeReplaceInFilesWidget';
    exports.ToggleCaseSensitiveCommandId = 'toggleSearchCaseSensitive';
    exports.ToggleWholeWordCommandId = 'toggleSearchWholeWord';
    exports.ToggleRegexCommandId = 'toggleSearchRegex';
    exports.TogglePreserveCaseId = 'toggleSearchPreserveCase';
    exports.AddCursorsAtSearchResults = 'addCursorsAtSearchResults';
    exports.RevealInSideBarForSearchResults = 'search.action.revealInSideBar';
    exports.ReplaceInFilesActionId = 'workbench.action.replaceInFiles';
    exports.ShowAllSymbolsActionId = 'workbench.action.showAllSymbols';
    exports.QuickTextSearchActionId = 'workbench.action.experimental.quickTextSearch';
    exports.CancelSearchActionId = 'search.action.cancel';
    exports.RefreshSearchResultsActionId = 'search.action.refreshSearchResults';
    exports.FocusNextSearchResultActionId = 'search.action.focusNextSearchResult';
    exports.FocusPreviousSearchResultActionId = 'search.action.focusPreviousSearchResult';
    exports.ToggleSearchOnTypeActionId = 'workbench.action.toggleSearchOnType';
    exports.CollapseSearchResultsActionId = 'search.action.collapseSearchResults';
    exports.ExpandSearchResultsActionId = 'search.action.expandSearchResults';
    exports.ClearSearchResultsActionId = 'search.action.clearSearchResults';
    exports.ViewAsTreeActionId = 'search.action.viewAsTree';
    exports.ViewAsListActionId = 'search.action.viewAsList';
    exports.ToggleQueryDetailsActionId = 'workbench.action.search.toggleQueryDetails';
    exports.ExcludeFolderFromSearchId = 'search.action.excludeFromSearch';
    exports.FocusNextInputActionId = 'search.focus.nextInputBox';
    exports.FocusPreviousInputActionId = 'search.focus.previousInputBox';
    exports.RestrictSearchToFolderId = 'search.action.restrictSearchToFolder';
    exports.FindInFolderId = 'filesExplorer.findInFolder';
    exports.FindInWorkspaceId = 'filesExplorer.findInWorkspace';
    exports.SearchViewVisibleKey = new contextkey_1.RawContextKey('searchViewletVisible', true);
    exports.SearchViewFocusedKey = new contextkey_1.RawContextKey('searchViewletFocus', false);
    exports.InputBoxFocusedKey = new contextkey_1.RawContextKey('inputBoxFocus', false);
    exports.SearchInputBoxFocusedKey = new contextkey_1.RawContextKey('searchInputBoxFocus', false);
    exports.ReplaceInputBoxFocusedKey = new contextkey_1.RawContextKey('replaceInputBoxFocus', false);
    exports.PatternIncludesFocusedKey = new contextkey_1.RawContextKey('patternIncludesInputBoxFocus', false);
    exports.PatternExcludesFocusedKey = new contextkey_1.RawContextKey('patternExcludesInputBoxFocus', false);
    exports.ReplaceActiveKey = new contextkey_1.RawContextKey('replaceActive', false);
    exports.HasSearchResults = new contextkey_1.RawContextKey('hasSearchResult', false);
    exports.FirstMatchFocusKey = new contextkey_1.RawContextKey('firstMatchFocus', false);
    exports.FileMatchOrMatchFocusKey = new contextkey_1.RawContextKey('fileMatchOrMatchFocus', false); // This is actually, Match or File or Folder
    exports.FileMatchOrFolderMatchFocusKey = new contextkey_1.RawContextKey('fileMatchOrFolderMatchFocus', false);
    exports.FileMatchOrFolderMatchWithResourceFocusKey = new contextkey_1.RawContextKey('fileMatchOrFolderMatchWithResourceFocus', false); // Excludes "Other files"
    exports.FileFocusKey = new contextkey_1.RawContextKey('fileMatchFocus', false);
    exports.FolderFocusKey = new contextkey_1.RawContextKey('folderMatchFocus', false);
    exports.ResourceFolderFocusKey = new contextkey_1.RawContextKey('folderMatchWithResourceFocus', false);
    exports.IsEditableItemKey = new contextkey_1.RawContextKey('isEditableItem', true);
    exports.MatchFocusKey = new contextkey_1.RawContextKey('matchFocus', false);
    exports.ViewHasSearchPatternKey = new contextkey_1.RawContextKey('viewHasSearchPattern', false);
    exports.ViewHasReplacePatternKey = new contextkey_1.RawContextKey('viewHasReplacePattern', false);
    exports.ViewHasFilePatternKey = new contextkey_1.RawContextKey('viewHasFilePattern', false);
    exports.ViewHasSomeCollapsibleKey = new contextkey_1.RawContextKey('viewHasSomeCollapsibleResult', false);
    exports.InTreeViewKey = new contextkey_1.RawContextKey('inTreeView', false);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc2VhcmNoL2NvbW1vbi9jb25zdGFudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBSW5GLFFBQUEsbUJBQW1CLEdBQUcsOEJBQThCLENBQUM7SUFDckQsUUFBQSwwQkFBMEIsR0FBRyxpQ0FBaUMsQ0FBQztJQUUvRCxRQUFBLHNCQUFzQixHQUFHLHNDQUFzQyxDQUFDO0lBQ2hFLFFBQUEsU0FBUyxHQUFHLDBCQUEwQixDQUFDO0lBQ3ZDLFFBQUEsZUFBZSxHQUFHLGdDQUFnQyxDQUFDO0lBQ25ELFFBQUEsY0FBYyxHQUFHLHNCQUFzQixDQUFDO0lBQ3hDLFFBQUEsaUJBQWlCLEdBQUcsd0JBQXdCLENBQUM7SUFDN0MsUUFBQSxrQkFBa0IsR0FBRyx5QkFBeUIsQ0FBQztJQUMvQyxRQUFBLGdCQUFnQixHQUFHLHVCQUF1QixDQUFDO0lBQzNDLFFBQUEscUJBQXFCLEdBQUcsNEJBQTRCLENBQUM7SUFDckQsUUFBQSwyQkFBMkIsR0FBRyw0QkFBNEIsQ0FBQztJQUMzRCxRQUFBLHdCQUF3QixHQUFHLCtCQUErQixDQUFDO0lBQzNELFFBQUEsZUFBZSxHQUFHLHVCQUF1QixDQUFDO0lBQzFDLFFBQUEsd0JBQXdCLEdBQUcsZ0NBQWdDLENBQUM7SUFDNUQsUUFBQSwwQkFBMEIsR0FBRyxrQ0FBa0MsQ0FBQztJQUNoRSxRQUFBLDBCQUEwQixHQUFHLDJCQUEyQixDQUFDO0lBQ3pELFFBQUEsNEJBQTRCLEdBQUcsMkJBQTJCLENBQUM7SUFDM0QsUUFBQSx3QkFBd0IsR0FBRyx1QkFBdUIsQ0FBQztJQUNuRCxRQUFBLG9CQUFvQixHQUFHLG1CQUFtQixDQUFDO0lBQzNDLFFBQUEsb0JBQW9CLEdBQUcsMEJBQTBCLENBQUM7SUFDbEQsUUFBQSx5QkFBeUIsR0FBRywy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