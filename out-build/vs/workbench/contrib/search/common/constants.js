/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/contextkey/common/contextkey"], function (require, exports, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$COb = exports.$BOb = exports.$AOb = exports.$zOb = exports.$yOb = exports.$xOb = exports.$wOb = exports.$vOb = exports.$uOb = exports.$tOb = exports.$sOb = exports.$rOb = exports.$qOb = exports.$pOb = exports.$oOb = exports.$nOb = exports.$mOb = exports.$lOb = exports.$kOb = exports.$jOb = exports.$iOb = exports.$hOb = exports.$gOb = exports.$fOb = exports.$eOb = exports.$dOb = exports.$cOb = exports.$bOb = exports.$aOb = exports.$_Nb = exports.$$Nb = exports.$0Nb = exports.$9Nb = exports.$8Nb = exports.$7Nb = exports.$6Nb = exports.$5Nb = exports.$4Nb = exports.$3Nb = exports.$2Nb = exports.$1Nb = exports.$ZNb = exports.$YNb = exports.$XNb = exports.$WNb = exports.$VNb = exports.$UNb = exports.$TNb = exports.$SNb = exports.$RNb = exports.$QNb = exports.$PNb = exports.$ONb = exports.$NNb = exports.$MNb = exports.$LNb = exports.$KNb = exports.$JNb = exports.$INb = exports.$HNb = exports.$GNb = exports.$FNb = exports.$ENb = exports.$DNb = exports.$CNb = void 0;
    exports.$CNb = 'workbench.action.findInFiles';
    exports.$DNb = 'search.action.focusActiveEditor';
    exports.$ENb = 'search.action.focusSearchFromResults';
    exports.$FNb = 'search.action.openResult';
    exports.$GNb = 'search.action.openResultToSide';
    exports.$HNb = 'search.action.remove';
    exports.$INb = 'search.action.copyPath';
    exports.$JNb = 'search.action.copyMatch';
    exports.$KNb = 'search.action.copyAll';
    exports.$LNb = 'search.action.openInEditor';
    exports.$MNb = 'search.action.clearHistory';
    exports.$NNb = 'search.action.focusSearchList';
    exports.$ONb = 'search.action.replace';
    exports.$PNb = 'search.action.replaceAllInFile';
    exports.$QNb = 'search.action.replaceAllInFolder';
    exports.$RNb = 'closeReplaceInFilesWidget';
    exports.$SNb = 'toggleSearchCaseSensitive';
    exports.$TNb = 'toggleSearchWholeWord';
    exports.$UNb = 'toggleSearchRegex';
    exports.$VNb = 'toggleSearchPreserveCase';
    exports.$WNb = 'addCursorsAtSearchResults';
    exports.$XNb = 'search.action.revealInSideBar';
    exports.$YNb = 'workbench.action.replaceInFiles';
    exports.$ZNb = 'workbench.action.showAllSymbols';
    exports.$1Nb = 'workbench.action.experimental.quickTextSearch';
    exports.$2Nb = 'search.action.cancel';
    exports.$3Nb = 'search.action.refreshSearchResults';
    exports.$4Nb = 'search.action.focusNextSearchResult';
    exports.$5Nb = 'search.action.focusPreviousSearchResult';
    exports.$6Nb = 'workbench.action.toggleSearchOnType';
    exports.$7Nb = 'search.action.collapseSearchResults';
    exports.$8Nb = 'search.action.expandSearchResults';
    exports.$9Nb = 'search.action.clearSearchResults';
    exports.$0Nb = 'search.action.viewAsTree';
    exports.$$Nb = 'search.action.viewAsList';
    exports.$_Nb = 'workbench.action.search.toggleQueryDetails';
    exports.$aOb = 'search.action.excludeFromSearch';
    exports.$bOb = 'search.focus.nextInputBox';
    exports.$cOb = 'search.focus.previousInputBox';
    exports.$dOb = 'search.action.restrictSearchToFolder';
    exports.$eOb = 'filesExplorer.findInFolder';
    exports.$fOb = 'filesExplorer.findInWorkspace';
    exports.$gOb = new contextkey_1.$2i('searchViewletVisible', true);
    exports.$hOb = new contextkey_1.$2i('searchViewletFocus', false);
    exports.$iOb = new contextkey_1.$2i('inputBoxFocus', false);
    exports.$jOb = new contextkey_1.$2i('searchInputBoxFocus', false);
    exports.$kOb = new contextkey_1.$2i('replaceInputBoxFocus', false);
    exports.$lOb = new contextkey_1.$2i('patternIncludesInputBoxFocus', false);
    exports.$mOb = new contextkey_1.$2i('patternExcludesInputBoxFocus', false);
    exports.$nOb = new contextkey_1.$2i('replaceActive', false);
    exports.$oOb = new contextkey_1.$2i('hasSearchResult', false);
    exports.$pOb = new contextkey_1.$2i('firstMatchFocus', false);
    exports.$qOb = new contextkey_1.$2i('fileMatchOrMatchFocus', false); // This is actually, Match or File or Folder
    exports.$rOb = new contextkey_1.$2i('fileMatchOrFolderMatchFocus', false);
    exports.$sOb = new contextkey_1.$2i('fileMatchOrFolderMatchWithResourceFocus', false); // Excludes "Other files"
    exports.$tOb = new contextkey_1.$2i('fileMatchFocus', false);
    exports.$uOb = new contextkey_1.$2i('folderMatchFocus', false);
    exports.$vOb = new contextkey_1.$2i('folderMatchWithResourceFocus', false);
    exports.$wOb = new contextkey_1.$2i('isEditableItem', true);
    exports.$xOb = new contextkey_1.$2i('matchFocus', false);
    exports.$yOb = new contextkey_1.$2i('viewHasSearchPattern', false);
    exports.$zOb = new contextkey_1.$2i('viewHasReplacePattern', false);
    exports.$AOb = new contextkey_1.$2i('viewHasFilePattern', false);
    exports.$BOb = new contextkey_1.$2i('viewHasSomeCollapsibleResult', false);
    exports.$COb = new contextkey_1.$2i('inTreeView', false);
});
//# sourceMappingURL=constants.js.map