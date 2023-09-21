/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/platform/workspace/common/workspace", "vs/workbench/common/editor", "vs/workbench/services/editor/common/editorService", "vs/base/common/cancellation", "vs/platform/files/common/files", "vs/editor/common/core/range", "vs/base/common/types", "vs/platform/contextkey/common/contextkey", "vs/base/common/strings", "vs/base/common/arrays"], function (require, exports, errors_1, workspace_1, editor_1, editorService_1, cancellation_1, files_1, range_1, types_1, contextkey_1, strings_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SearchStateKey = exports.SearchUIState = exports.extractRangeFromFilter = exports.getOutOfWorkspaceEditorResources = exports.getWorkspaceSymbols = exports.WorkspaceSymbolItem = exports.WorkspaceSymbolProviderRegistry = void 0;
    var WorkspaceSymbolProviderRegistry;
    (function (WorkspaceSymbolProviderRegistry) {
        const _supports = [];
        function register(provider) {
            let support = provider;
            if (support) {
                _supports.push(support);
            }
            return {
                dispose() {
                    if (support) {
                        const idx = _supports.indexOf(support);
                        if (idx >= 0) {
                            _supports.splice(idx, 1);
                            support = undefined;
                        }
                    }
                }
            };
        }
        WorkspaceSymbolProviderRegistry.register = register;
        function all() {
            return _supports.slice(0);
        }
        WorkspaceSymbolProviderRegistry.all = all;
    })(WorkspaceSymbolProviderRegistry || (exports.WorkspaceSymbolProviderRegistry = WorkspaceSymbolProviderRegistry = {}));
    class WorkspaceSymbolItem {
        constructor(symbol, provider) {
            this.symbol = symbol;
            this.provider = provider;
        }
    }
    exports.WorkspaceSymbolItem = WorkspaceSymbolItem;
    async function getWorkspaceSymbols(query, token = cancellation_1.CancellationToken.None) {
        const all = [];
        const promises = WorkspaceSymbolProviderRegistry.all().map(async (provider) => {
            try {
                const value = await provider.provideWorkspaceSymbols(query, token);
                if (!value) {
                    return;
                }
                for (const symbol of value) {
                    all.push(new WorkspaceSymbolItem(symbol, provider));
                }
            }
            catch (err) {
                (0, errors_1.onUnexpectedExternalError)(err);
            }
        });
        await Promise.all(promises);
        if (token.isCancellationRequested) {
            return [];
        }
        // de-duplicate entries
        function compareItems(a, b) {
            let res = (0, strings_1.compare)(a.symbol.name, b.symbol.name);
            if (res === 0) {
                res = a.symbol.kind - b.symbol.kind;
            }
            if (res === 0) {
                res = (0, strings_1.compare)(a.symbol.location.uri.toString(), b.symbol.location.uri.toString());
            }
            if (res === 0) {
                if (a.symbol.location.range && b.symbol.location.range) {
                    if (!range_1.Range.areIntersecting(a.symbol.location.range, b.symbol.location.range)) {
                        res = range_1.Range.compareRangesUsingStarts(a.symbol.location.range, b.symbol.location.range);
                    }
                }
                else if (a.provider.resolveWorkspaceSymbol && !b.provider.resolveWorkspaceSymbol) {
                    res = -1;
                }
                else if (!a.provider.resolveWorkspaceSymbol && b.provider.resolveWorkspaceSymbol) {
                    res = 1;
                }
            }
            if (res === 0) {
                res = (0, strings_1.compare)(a.symbol.containerName ?? '', b.symbol.containerName ?? '');
            }
            return res;
        }
        return (0, arrays_1.groupBy)(all, compareItems).map(group => group[0]).flat();
    }
    exports.getWorkspaceSymbols = getWorkspaceSymbols;
    /**
     * Helper to return all opened editors with resources not belonging to the currently opened workspace.
     */
    function getOutOfWorkspaceEditorResources(accessor) {
        const editorService = accessor.get(editorService_1.IEditorService);
        const contextService = accessor.get(workspace_1.IWorkspaceContextService);
        const fileService = accessor.get(files_1.IFileService);
        const resources = editorService.editors
            .map(editor => editor_1.EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY }))
            .filter(resource => !!resource && !contextService.isInsideWorkspace(resource) && fileService.hasProvider(resource));
        return resources;
    }
    exports.getOutOfWorkspaceEditorResources = getOutOfWorkspaceEditorResources;
    // Supports patterns of <path><#|:|(><line><#|:|,><col?><:?>
    const LINE_COLON_PATTERN = /\s?[#:\(](?:line )?(\d*)(?:[#:,](\d*))?\)?:?\s*$/;
    function extractRangeFromFilter(filter, unless) {
        // Ignore when the unless character not the first character or is before the line colon pattern
        if (!filter || unless?.some(value => {
            const unlessCharPos = filter.indexOf(value);
            return unlessCharPos === 0 || unlessCharPos > 0 && !LINE_COLON_PATTERN.test(filter.substring(unlessCharPos + 1));
        })) {
            return undefined;
        }
        let range = undefined;
        // Find Line/Column number from search value using RegExp
        const patternMatch = LINE_COLON_PATTERN.exec(filter);
        if (patternMatch) {
            const startLineNumber = parseInt(patternMatch[1] ?? '', 10);
            // Line Number
            if ((0, types_1.isNumber)(startLineNumber)) {
                range = {
                    startLineNumber: startLineNumber,
                    startColumn: 1,
                    endLineNumber: startLineNumber,
                    endColumn: 1
                };
                // Column Number
                const startColumn = parseInt(patternMatch[2] ?? '', 10);
                if ((0, types_1.isNumber)(startColumn)) {
                    range = {
                        startLineNumber: range.startLineNumber,
                        startColumn: startColumn,
                        endLineNumber: range.endLineNumber,
                        endColumn: startColumn
                    };
                }
            }
            // User has typed "something:" or "something#" without a line number, in this case treat as start of file
            else if (patternMatch[1] === '') {
                range = {
                    startLineNumber: 1,
                    startColumn: 1,
                    endLineNumber: 1,
                    endColumn: 1
                };
            }
        }
        if (patternMatch && range) {
            return {
                filter: filter.substr(0, patternMatch.index),
                range
            };
        }
        return undefined;
    }
    exports.extractRangeFromFilter = extractRangeFromFilter;
    var SearchUIState;
    (function (SearchUIState) {
        SearchUIState[SearchUIState["Idle"] = 0] = "Idle";
        SearchUIState[SearchUIState["Searching"] = 1] = "Searching";
        SearchUIState[SearchUIState["SlowSearch"] = 2] = "SlowSearch";
    })(SearchUIState || (exports.SearchUIState = SearchUIState = {}));
    exports.SearchStateKey = new contextkey_1.RawContextKey('searchState', SearchUIState.Idle);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc2VhcmNoL2NvbW1vbi9zZWFyY2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZ0NoRyxJQUFpQiwrQkFBK0IsQ0EwQi9DO0lBMUJELFdBQWlCLCtCQUErQjtRQUUvQyxNQUFNLFNBQVMsR0FBK0IsRUFBRSxDQUFDO1FBRWpELFNBQWdCLFFBQVEsQ0FBQyxRQUFrQztZQUMxRCxJQUFJLE9BQU8sR0FBeUMsUUFBUSxDQUFDO1lBQzdELElBQUksT0FBTyxFQUFFO2dCQUNaLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDeEI7WUFFRCxPQUFPO2dCQUNOLE9BQU87b0JBQ04sSUFBSSxPQUFPLEVBQUU7d0JBQ1osTUFBTSxHQUFHLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDdkMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFOzRCQUNiLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDOzRCQUN6QixPQUFPLEdBQUcsU0FBUyxDQUFDO3lCQUNwQjtxQkFDRDtnQkFDRixDQUFDO2FBQ0QsQ0FBQztRQUNILENBQUM7UUFqQmUsd0NBQVEsV0FpQnZCLENBQUE7UUFFRCxTQUFnQixHQUFHO1lBQ2xCLE9BQU8sU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzQixDQUFDO1FBRmUsbUNBQUcsTUFFbEIsQ0FBQTtJQUNGLENBQUMsRUExQmdCLCtCQUErQiwrQ0FBL0IsK0JBQStCLFFBMEIvQztJQUVELE1BQWEsbUJBQW1CO1FBQy9CLFlBQXFCLE1BQXdCLEVBQVcsUUFBa0M7WUFBckUsV0FBTSxHQUFOLE1BQU0sQ0FBa0I7WUFBVyxhQUFRLEdBQVIsUUFBUSxDQUEwQjtR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