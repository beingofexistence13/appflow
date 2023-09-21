/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/editor/browser/editorBrowser", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/platform/telemetry/common/telemetry", "vs/platform/workspace/common/workspace", "vs/workbench/common/views", "vs/workbench/contrib/search/browser/searchActionsBase", "vs/workbench/contrib/searchEditor/browser/searchEditorInput", "vs/workbench/contrib/searchEditor/browser/searchEditorSerialization", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/history/common/history", "vs/css!./media/searchEditor"], function (require, exports, network_1, editorBrowser_1, configuration_1, instantiation_1, label_1, telemetry_1, workspace_1, views_1, searchActionsBase_1, searchEditorInput_1, searchEditorSerialization_1, configurationResolver_1, editorGroupsService_1, editorService_1, history_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createEditorFromSearchResult = exports.openNewSearchEditor = exports.openSearchEditor = exports.selectAllSearchEditorMatchesCommand = exports.modifySearchEditorContextLinesCommand = exports.toggleSearchEditorContextLinesCommand = exports.toggleSearchEditorRegexCommand = exports.toggleSearchEditorWholeWordCommand = exports.toggleSearchEditorCaseSensitiveCommand = void 0;
    const toggleSearchEditorCaseSensitiveCommand = (accessor) => {
        const editorService = accessor.get(editorService_1.IEditorService);
        const input = editorService.activeEditor;
        if (input instanceof searchEditorInput_1.SearchEditorInput) {
            editorService.activeEditorPane.toggleCaseSensitive();
        }
    };
    exports.toggleSearchEditorCaseSensitiveCommand = toggleSearchEditorCaseSensitiveCommand;
    const toggleSearchEditorWholeWordCommand = (accessor) => {
        const editorService = accessor.get(editorService_1.IEditorService);
        const input = editorService.activeEditor;
        if (input instanceof searchEditorInput_1.SearchEditorInput) {
            editorService.activeEditorPane.toggleWholeWords();
        }
    };
    exports.toggleSearchEditorWholeWordCommand = toggleSearchEditorWholeWordCommand;
    const toggleSearchEditorRegexCommand = (accessor) => {
        const editorService = accessor.get(editorService_1.IEditorService);
        const input = editorService.activeEditor;
        if (input instanceof searchEditorInput_1.SearchEditorInput) {
            editorService.activeEditorPane.toggleRegex();
        }
    };
    exports.toggleSearchEditorRegexCommand = toggleSearchEditorRegexCommand;
    const toggleSearchEditorContextLinesCommand = (accessor) => {
        const editorService = accessor.get(editorService_1.IEditorService);
        const input = editorService.activeEditor;
        if (input instanceof searchEditorInput_1.SearchEditorInput) {
            editorService.activeEditorPane.toggleContextLines();
        }
    };
    exports.toggleSearchEditorContextLinesCommand = toggleSearchEditorContextLinesCommand;
    const modifySearchEditorContextLinesCommand = (accessor, increase) => {
        const editorService = accessor.get(editorService_1.IEditorService);
        const input = editorService.activeEditor;
        if (input instanceof searchEditorInput_1.SearchEditorInput) {
            editorService.activeEditorPane.modifyContextLines(increase);
        }
    };
    exports.modifySearchEditorContextLinesCommand = modifySearchEditorContextLinesCommand;
    const selectAllSearchEditorMatchesCommand = (accessor) => {
        const editorService = accessor.get(editorService_1.IEditorService);
        const input = editorService.activeEditor;
        if (input instanceof searchEditorInput_1.SearchEditorInput) {
            editorService.activeEditorPane.focusAllResults();
        }
    };
    exports.selectAllSearchEditorMatchesCommand = selectAllSearchEditorMatchesCommand;
    async function openSearchEditor(accessor) {
        const viewsService = accessor.get(views_1.IViewsService);
        const instantiationService = accessor.get(instantiation_1.IInstantiationService);
        const searchView = (0, searchActionsBase_1.getSearchView)(viewsService);
        if (searchView) {
            await instantiationService.invokeFunction(exports.openNewSearchEditor, {
                filesToInclude: searchView.searchIncludePattern.getValue(),
                onlyOpenEditors: searchView.searchIncludePattern.onlySearchInOpenEditors(),
                filesToExclude: searchView.searchExcludePattern.getValue(),
                isRegexp: searchView.searchAndReplaceWidget.searchInput?.getRegex(),
                isCaseSensitive: searchView.searchAndReplaceWidget.searchInput?.getCaseSensitive(),
                matchWholeWord: searchView.searchAndReplaceWidget.searchInput?.getWholeWords(),
                useExcludeSettingsAndIgnoreFiles: searchView.searchExcludePattern.useExcludesAndIgnoreFiles(),
                showIncludesExcludes: !!(searchView.searchIncludePattern.getValue() || searchView.searchExcludePattern.getValue() || !searchView.searchExcludePattern.useExcludesAndIgnoreFiles())
            });
        }
        else {
            await instantiationService.invokeFunction(exports.openNewSearchEditor);
        }
    }
    exports.openSearchEditor = openSearchEditor;
    const openNewSearchEditor = async (accessor, _args = {}, toSide = false) => {
        const editorService = accessor.get(editorService_1.IEditorService);
        const editorGroupsService = accessor.get(editorGroupsService_1.IEditorGroupsService);
        const telemetryService = accessor.get(telemetry_1.ITelemetryService);
        const instantiationService = accessor.get(instantiation_1.IInstantiationService);
        const configurationService = accessor.get(configuration_1.IConfigurationService);
        const configurationResolverService = accessor.get(configurationResolver_1.IConfigurationResolverService);
        const workspaceContextService = accessor.get(workspace_1.IWorkspaceContextService);
        const historyService = accessor.get(history_1.IHistoryService);
        const activeWorkspaceRootUri = historyService.getLastActiveWorkspaceRoot(network_1.Schemas.file);
        const lastActiveWorkspaceRoot = activeWorkspaceRootUri ? workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? undefined : undefined;
        const activeEditorControl = editorService.activeTextEditorControl;
        let activeModel;
        let selected = '';
        if (activeEditorControl) {
            if ((0, editorBrowser_1.isDiffEditor)(activeEditorControl)) {
                if (activeEditorControl.getOriginalEditor().hasTextFocus()) {
                    activeModel = activeEditorControl.getOriginalEditor();
                }
                else {
                    activeModel = activeEditorControl.getModifiedEditor();
                }
            }
            else {
                activeModel = activeEditorControl;
            }
            const selection = activeModel?.getSelection();
            selected = (selection && activeModel?.getModel()?.getValueInRange(selection)) ?? '';
            if (selection?.isEmpty() && configurationService.getValue('search').seedWithNearestWord) {
                const wordAtPosition = activeModel.getModel()?.getWordAtPosition(selection.getStartPosition());
                if (wordAtPosition) {
                    selected = wordAtPosition.word;
                }
            }
        }
        else {
            if (editorService.activeEditor instanceof searchEditorInput_1.SearchEditorInput) {
                const active = editorService.activeEditorPane;
                selected = active.getSelected();
            }
        }
        telemetryService.publicLog2('searchEditor/openNewSearchEditor');
        const seedSearchStringFromSelection = _args.location === 'new' || configurationService.getValue('editor').find.seedSearchStringFromSelection;
        const args = { query: seedSearchStringFromSelection ? selected : undefined };
        for (const entry of Object.entries(_args)) {
            const name = entry[0];
            const value = entry[1];
            if (value !== undefined) {
                args[name] = (typeof value === 'string') ? await configurationResolverService.resolveAsync(lastActiveWorkspaceRoot, value) : value;
            }
        }
        const existing = editorService.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */).find(id => id.editor.typeId === searchEditorInput_1.SearchEditorInput.ID);
        let editor;
        if (existing && args.location === 'reuse') {
            const group = editorGroupsService.getGroup(existing.groupId);
            if (!group) {
                throw new Error('Invalid group id for search editor');
            }
            const input = existing.editor;
            editor = (await group.openEditor(input));
            if (selected) {
                editor.setQuery(selected);
            }
            else {
                editor.selectQuery();
            }
            editor.setSearchConfig(args);
        }
        else {
            const input = instantiationService.invokeFunction(searchEditorInput_1.getOrMakeSearchEditorInput, { config: args, resultsContents: '', from: 'rawData' });
            // TODO @roblourens make this use the editor resolver service if possible
            editor = await editorService.openEditor(input, { pinned: true }, toSide ? editorService_1.SIDE_GROUP : editorService_1.ACTIVE_GROUP);
        }
        const searchOnType = configurationService.getValue('search').searchOnType;
        if (args.triggerSearch === true ||
            args.triggerSearch !== false && searchOnType && args.query) {
            editor.triggerSearch({ focusResults: args.focusResults });
        }
        if (!args.focusResults) {
            editor.focusSearchInput();
        }
    };
    exports.openNewSearchEditor = openNewSearchEditor;
    const createEditorFromSearchResult = async (accessor, searchResult, rawIncludePattern, rawExcludePattern, onlySearchInOpenEditors) => {
        if (!searchResult.query) {
            console.error('Expected searchResult.query to be defined. Got', searchResult);
            return;
        }
        const editorService = accessor.get(editorService_1.IEditorService);
        const telemetryService = accessor.get(telemetry_1.ITelemetryService);
        const instantiationService = accessor.get(instantiation_1.IInstantiationService);
        const labelService = accessor.get(label_1.ILabelService);
        const configurationService = accessor.get(configuration_1.IConfigurationService);
        const sortOrder = configurationService.getValue('search').sortOrder;
        telemetryService.publicLog2('searchEditor/createEditorFromSearchResult');
        const labelFormatter = (uri) => labelService.getUriLabel(uri, { relative: true });
        const { text, matchRanges, config } = (0, searchEditorSerialization_1.serializeSearchResultForEditor)(searchResult, rawIncludePattern, rawExcludePattern, 0, labelFormatter, sortOrder);
        config.onlyOpenEditors = onlySearchInOpenEditors;
        const contextLines = configurationService.getValue('search').searchEditor.defaultNumberOfContextLines;
        if (searchResult.isDirty || contextLines === 0 || contextLines === null) {
            const input = instantiationService.invokeFunction(searchEditorInput_1.getOrMakeSearchEditorInput, { resultsContents: text, config, from: 'rawData' });
            await editorService.openEditor(input, { pinned: true });
            input.setMatchRanges(matchRanges);
        }
        else {
            const input = instantiationService.invokeFunction(searchEditorInput_1.getOrMakeSearchEditorInput, { from: 'rawData', resultsContents: '', config: { ...config, contextLines } });
            const editor = await editorService.openEditor(input, { pinned: true });
            editor.triggerSearch({ focusResults: true });
        }
    };
    exports.createEditorFromSearchResult = createEditorFromSearchResult;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoRWRpdG9yQWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3NlYXJjaEVkaXRvci9icm93c2VyL3NlYXJjaEVkaXRvckFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBMEJ6RixNQUFNLHNDQUFzQyxHQUFHLENBQUMsUUFBMEIsRUFBRSxFQUFFO1FBQ3BGLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsOEJBQWMsQ0FBQyxDQUFDO1FBQ25ELE1BQU0sS0FBSyxHQUFHLGFBQWEsQ0FBQyxZQUFZLENBQUM7UUFDekMsSUFBSSxLQUFLLFlBQVkscUNBQWlCLEVBQUU7WUFDdEMsYUFBYSxDQUFDLGdCQUFpQyxDQUFDLG1CQUFtQixFQUFFLENBQUM7U0FDdkU7SUFDRixDQUFDLENBQUM7SUFOVyxRQUFBLHNDQUFzQywwQ0FNakQ7SUFFSyxNQUFNLGtDQUFrQyxHQUFHLENBQUMsUUFBMEIsRUFBRSxFQUFFO1FBQ2hGLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsOEJBQWMsQ0FBQyxDQUFDO1FBQ25ELE1BQU0sS0FBSyxHQUFHLGFBQWEsQ0FBQyxZQUFZLENBQUM7UUFDekMsSUFBSSxLQUFLLFlBQVkscUNBQWlCLEVBQUU7WUFDdEMsYUFBYSxDQUFDLGdCQUFpQyxDQUFDLGdCQUFnQixFQUFFLENBQUM7U0FDcEU7SUFDRixDQUFDLENBQUM7SUFOVyxRQUFBLGtDQUFrQyxzQ0FNN0M7SUFFSyxNQUFNLDhCQUE4QixHQUFHLENBQUMsUUFBMEIsRUFBRSxFQUFFO1FBQzVFLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsOEJBQWMsQ0FBQyxDQUFDO1FBQ25ELE1BQU0sS0FBSyxHQUFHLGFBQWEsQ0FBQyxZQUFZLENBQUM7UUFDekMsSUFBSSxLQUFLLFlBQVkscUNBQWlCLEVBQUU7WUFDdEMsYUFBYSxDQUFDLGdCQUFpQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1NBQy9EO0lBQ0YsQ0FBQyxDQUFDO0lBTlcsUUFBQSw4QkFBOEIsa0NBTXpDO0lBRUssTUFBTSxxQ0FBcUMsR0FBRyxDQUFDLFFBQTBCLEVBQUUsRUFBRTtRQUNuRixNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDhCQUFjLENBQUMsQ0FBQztRQUNuRCxNQUFNLEtBQUssR0FBRyxhQUFhLENBQUMsWUFBWSxDQUFDO1FBQ3pDLElBQUksS0FBSyxZQUFZLHFDQUFpQixFQUFFO1lBQ3RDLGFBQWEsQ0FBQyxnQkFBaUMsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1NBQ3RFO0lBQ0YsQ0FBQyxDQUFDO0lBTlcsUUFBQSxxQ0FBcUMseUNBTWhEO0lBRUssTUFBTSxxQ0FBcUMsR0FBRyxDQUFDLFFBQTBCLEVBQUUsUUFBaUIsRUFBRSxFQUFFO1FBQ3RHLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsOEJBQWMsQ0FBQyxDQUFDO1FBQ25ELE1BQU0sS0FBSyxHQUFHLGFBQWEsQ0FBQyxZQUFZLENBQUM7UUFDekMsSUFBSSxLQUFLLFlBQVkscUNBQWlCLEVBQUU7WUFDdEMsYUFBYSxDQUFDLGdCQUFpQyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQzlFO0lBQ0YsQ0FBQyxDQUFDO0lBTlcsUUFBQSxxQ0FBcUMseUNBTWhEO0lBRUssTUFBTSxtQ0FBbUMsR0FBRyxDQUFDLFFBQTBCLEVBQUUsRUFBRTtRQUNqRixNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDhCQUFjLENBQUMsQ0FBQztRQUNuRCxNQUFNLEtBQUssR0FBRyxhQUFhLENBQUMsWUFBWSxDQUFDO1FBQ3pDLElBQUksS0FBSyxZQUFZLHFDQUFpQixFQUFFO1lBQ3RDLGFBQWEsQ0FBQyxnQkFBaUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztTQUNuRTtJQUNGLENBQUMsQ0FBQztJQU5XLFFBQUEsbUNBQW1DLHVDQU05QztJQUVLLEtBQUssVUFBVSxnQkFBZ0IsQ0FBQyxRQUEwQjtRQUNoRSxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFCQUFhLENBQUMsQ0FBQztRQUNqRCxNQUFNLG9CQUFvQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMscUNBQXFCLENBQUMsQ0FBQztRQUNqRSxNQUFNLFVBQVUsR0FBRyxJQUFBLGlDQUFhLEVBQUMsWUFBWSxDQUFDLENBQUM7UUFDL0MsSUFBSSxVQUFVLEVBQUU7WUFDZixNQUFNLG9CQUFvQixDQUFDLGNBQWMsQ0FBQywyQkFBbUIsRUFBRTtnQkFDOUQsY0FBYyxFQUFFLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLEVBQUU7Z0JBQzFELGVBQWUsRUFBRSxVQUFVLENBQUMsb0JBQW9CLENBQUMsdUJBQXVCLEVBQUU7Z0JBQzFFLGNBQWMsRUFBRSxVQUFVLENBQUMsb0JBQW9CLENBQUMsUUFBUSxFQUFFO2dCQUMxRCxRQUFRLEVBQUUsVUFBVSxDQUFDLHNCQUFzQixDQUFDLFdBQVcsRUFBRSxRQUFRLEVBQUU7Z0JBQ25FLGVBQWUsRUFBRSxVQUFVLENBQUMsc0JBQXNCLENBQUMsV0FBVyxFQUFFLGdCQUFnQixFQUFFO2dCQUNsRixjQUFjLEVBQUUsVUFBVSxDQUFDLHNCQUFzQixDQUFDLFdBQVcsRUFBRSxhQUFhLEVBQUU7Z0JBQzlFLGdDQUFnQyxFQUFFLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyx5QkFBeUIsRUFBRTtnQkFDN0Ysb0JBQW9CLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxJQUFJLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO2FBQ2xMLENBQUMsQ0FBQztTQUNIO2FBQU07WUFDTixNQUFNLG9CQUFvQixDQUFDLGNBQWMsQ0FBQywyQkFBbUIsQ0FBQyxDQUFDO1NBQy9EO0lBQ0YsQ0FBQztJQWxCRCw0Q0FrQkM7SUFFTSxNQUFNLG1CQUFtQixHQUMvQixLQUFLLEVBQUUsUUFBMEIsRUFBRSxRQUE4QixFQUFFLEVBQUUsTUFBTSxHQUFHLEtBQUssRUFBRSxFQUFFO1FBQ3RGLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsOEJBQWMsQ0FBQyxDQUFDO1FBQ25ELE1BQU0sbUJBQW1CLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywwQ0FBb0IsQ0FBQyxDQUFDO1FBQy9ELE1BQU0sZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw2QkFBaUIsQ0FBQyxDQUFDO1FBQ3pELE1BQU0sb0JBQW9CLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUIsQ0FBQyxDQUFDO1FBQ2pFLE1BQU0sb0JBQW9CLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUIsQ0FBQyxDQUFDO1FBRWpFLE1BQU0sNEJBQTRCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxREFBNkIsQ0FBQyxDQUFDO1FBQ2pGLE1BQU0sdUJBQXVCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxvQ0FBd0IsQ0FBQyxDQUFDO1FBQ3ZFLE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMseUJBQWUsQ0FBQyxDQUFDO1FBQ3JELE1BQU0sc0JBQXNCLEdBQUcsY0FBYyxDQUFDLDBCQUEwQixDQUFDLGlCQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkYsTUFBTSx1QkFBdUIsR0FBRyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsdUJBQXVCLENBQUMsa0JBQWtCLENBQUMsc0JBQXNCLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUdySixNQUFNLG1CQUFtQixHQUFHLGFBQWEsQ0FBQyx1QkFBdUIsQ0FBQztRQUNsRSxJQUFJLFdBQW9DLENBQUM7UUFDekMsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLElBQUksbUJBQW1CLEVBQUU7WUFDeEIsSUFBSSxJQUFBLDRCQUFZLEVBQUMsbUJBQW1CLENBQUMsRUFBRTtnQkFDdEMsSUFBSSxtQkFBbUIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLFlBQVksRUFBRSxFQUFFO29CQUMzRCxXQUFXLEdBQUcsbUJBQW1CLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztpQkFDdEQ7cUJBQU07b0JBQ04sV0FBVyxHQUFHLG1CQUFtQixDQUFDLGlCQUFpQixFQUFFLENBQUM7aUJBQ3REO2FBQ0Q7aUJBQU07Z0JBQ04sV0FBVyxHQUFHLG1CQUFrQyxDQUFDO2FBQ2pEO1lBQ0QsTUFBTSxTQUFTLEdBQUcsV0FBVyxFQUFFLFlBQVksRUFBRSxDQUFDO1lBQzlDLFFBQVEsR0FBRyxDQUFDLFNBQVMsSUFBSSxXQUFXLEVBQUUsUUFBUSxFQUFFLEVBQUUsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBRXBGLElBQUksU0FBUyxFQUFFLE9BQU8sRUFBRSxJQUFJLG9CQUFvQixDQUFDLFFBQVEsQ0FBaUMsUUFBUSxDQUFDLENBQUMsbUJBQW1CLEVBQUU7Z0JBQ3hILE1BQU0sY0FBYyxHQUFHLFdBQVcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO2dCQUMvRixJQUFJLGNBQWMsRUFBRTtvQkFDbkIsUUFBUSxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUM7aUJBQy9CO2FBQ0Q7U0FDRDthQUFNO1lBQ04sSUFBSSxhQUFhLENBQUMsWUFBWSxZQUFZLHFDQUFpQixFQUFFO2dCQUM1RCxNQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsZ0JBQWdDLENBQUM7Z0JBQzlELFFBQVEsR0FBRyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7YUFDaEM7U0FDRDtRQUVELGdCQUFnQixDQUFDLFVBQVUsQ0FLekIsa0NBQWtDLENBQUMsQ0FBQztRQUV0QyxNQUFNLDZCQUE2QixHQUFHLEtBQUssQ0FBQyxRQUFRLEtBQUssS0FBSyxJQUFJLG9CQUFvQixDQUFDLFFBQVEsQ0FBaUIsUUFBUSxDQUFDLENBQUMsSUFBSyxDQUFDLDZCQUE2QixDQUFDO1FBQzlKLE1BQU0sSUFBSSxHQUF5QixFQUFFLEtBQUssRUFBRSw2QkFBNkIsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNuRyxLQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDMUMsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2QixJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUU7Z0JBQ3ZCLElBQVksQ0FBQyxJQUFXLENBQUMsR0FBRyxDQUFDLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLDRCQUE0QixDQUFDLFlBQVksQ0FBQyx1QkFBdUIsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO2FBQ25KO1NBQ0Q7UUFDRCxNQUFNLFFBQVEsR0FBRyxhQUFhLENBQUMsVUFBVSwyQ0FBbUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sS0FBSyxxQ0FBaUIsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNuSSxJQUFJLE1BQW9CLENBQUM7UUFDekIsSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxPQUFPLEVBQUU7WUFDMUMsTUFBTSxLQUFLLEdBQUcsbUJBQW1CLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM3RCxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNYLE1BQU0sSUFBSSxLQUFLLENBQUMsb0NBQW9DLENBQUMsQ0FBQzthQUN0RDtZQUNELE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxNQUEyQixDQUFDO1lBQ25ELE1BQU0sR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBaUIsQ0FBQztZQUN6RCxJQUFJLFFBQVEsRUFBRTtnQkFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQUU7aUJBQ3ZDO2dCQUFFLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQzthQUFFO1lBQzlCLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDN0I7YUFBTTtZQUNOLE1BQU0sS0FBSyxHQUFHLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyw4Q0FBMEIsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztZQUN0SSx5RUFBeUU7WUFDekUsTUFBTSxHQUFHLE1BQU0sYUFBYSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQywwQkFBVSxDQUFDLENBQUMsQ0FBQyw0QkFBWSxDQUFpQixDQUFDO1NBQ3JIO1FBRUQsTUFBTSxZQUFZLEdBQUcsb0JBQW9CLENBQUMsUUFBUSxDQUFpQyxRQUFRLENBQUMsQ0FBQyxZQUFZLENBQUM7UUFDMUcsSUFDQyxJQUFJLENBQUMsYUFBYSxLQUFLLElBQUk7WUFDM0IsSUFBSSxDQUFDLGFBQWEsS0FBSyxLQUFLLElBQUksWUFBWSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQ3pEO1lBQ0QsTUFBTSxDQUFDLGFBQWEsQ0FBQyxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztTQUMxRDtRQUVELElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQUUsTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUM7U0FBRTtJQUN2RCxDQUFDLENBQUM7SUF2RlUsUUFBQSxtQkFBbUIsdUJBdUY3QjtJQUVJLE1BQU0sNEJBQTRCLEdBQ3hDLEtBQUssRUFBRSxRQUEwQixFQUFFLFlBQTBCLEVBQUUsaUJBQXlCLEVBQUUsaUJBQXlCLEVBQUUsdUJBQWdDLEVBQUUsRUFBRTtRQUN4SixJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRTtZQUN4QixPQUFPLENBQUMsS0FBSyxDQUFDLGdEQUFnRCxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQzlFLE9BQU87U0FDUDtRQUVELE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsOEJBQWMsQ0FBQyxDQUFDO1FBQ25ELE1BQU0sZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw2QkFBaUIsQ0FBQyxDQUFDO1FBQ3pELE1BQU0sb0JBQW9CLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUIsQ0FBQyxDQUFDO1FBQ2pFLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMscUJBQWEsQ0FBQyxDQUFDO1FBQ2pELE1BQU0sb0JBQW9CLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUIsQ0FBQyxDQUFDO1FBQ2pFLE1BQU0sU0FBUyxHQUFHLG9CQUFvQixDQUFDLFFBQVEsQ0FBaUMsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRXBHLGdCQUFnQixDQUFDLFVBQVUsQ0FNekIsMkNBQTJDLENBQUMsQ0FBQztRQUUvQyxNQUFNLGNBQWMsR0FBRyxDQUFDLEdBQVEsRUFBVSxFQUFFLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUUvRixNQUFNLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFBLDBEQUE4QixFQUFDLFlBQVksRUFBRSxpQkFBaUIsRUFBRSxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsY0FBYyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZKLE1BQU0sQ0FBQyxlQUFlLEdBQUcsdUJBQXVCLENBQUM7UUFDakQsTUFBTSxZQUFZLEdBQUcsb0JBQW9CLENBQUMsUUFBUSxDQUFpQyxRQUFRLENBQUMsQ0FBQyxZQUFZLENBQUMsMkJBQTJCLENBQUM7UUFFdEksSUFBSSxZQUFZLENBQUMsT0FBTyxJQUFJLFlBQVksS0FBSyxDQUFDLElBQUksWUFBWSxLQUFLLElBQUksRUFBRTtZQUN4RSxNQUFNLEtBQUssR0FBRyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsOENBQTBCLEVBQUUsRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztZQUNsSSxNQUFNLGFBQWEsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFDeEQsS0FBSyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUNsQzthQUFNO1lBQ04sTUFBTSxLQUFLLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLDhDQUEwQixFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEdBQUcsTUFBTSxFQUFFLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FBQztZQUM3SixNQUFNLE1BQU0sR0FBRyxNQUFNLGFBQWEsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFpQixDQUFDO1lBQ3ZGLE1BQU0sQ0FBQyxhQUFhLENBQUMsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUM3QztJQUNGLENBQUMsQ0FBQztJQXJDVSxRQUFBLDRCQUE0QixnQ0FxQ3RDIn0=