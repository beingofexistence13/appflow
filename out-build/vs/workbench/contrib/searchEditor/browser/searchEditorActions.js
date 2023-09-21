/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/editor/browser/editorBrowser", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/platform/telemetry/common/telemetry", "vs/platform/workspace/common/workspace", "vs/workbench/common/views", "vs/workbench/contrib/search/browser/searchActionsBase", "vs/workbench/contrib/searchEditor/browser/searchEditorInput", "vs/workbench/contrib/searchEditor/browser/searchEditorSerialization", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/history/common/history", "vs/css!./media/searchEditor"], function (require, exports, network_1, editorBrowser_1, configuration_1, instantiation_1, label_1, telemetry_1, workspace_1, views_1, searchActionsBase_1, searchEditorInput_1, searchEditorSerialization_1, configurationResolver_1, editorGroupsService_1, editorService_1, history_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$aPb = exports.$_Ob = exports.$$Ob = exports.$0Ob = exports.$9Ob = exports.$8Ob = exports.$7Ob = exports.$6Ob = exports.$5Ob = void 0;
    const $5Ob = (accessor) => {
        const editorService = accessor.get(editorService_1.$9C);
        const input = editorService.activeEditor;
        if (input instanceof searchEditorInput_1.$1Ob) {
            editorService.activeEditorPane.toggleCaseSensitive();
        }
    };
    exports.$5Ob = $5Ob;
    const $6Ob = (accessor) => {
        const editorService = accessor.get(editorService_1.$9C);
        const input = editorService.activeEditor;
        if (input instanceof searchEditorInput_1.$1Ob) {
            editorService.activeEditorPane.toggleWholeWords();
        }
    };
    exports.$6Ob = $6Ob;
    const $7Ob = (accessor) => {
        const editorService = accessor.get(editorService_1.$9C);
        const input = editorService.activeEditor;
        if (input instanceof searchEditorInput_1.$1Ob) {
            editorService.activeEditorPane.toggleRegex();
        }
    };
    exports.$7Ob = $7Ob;
    const $8Ob = (accessor) => {
        const editorService = accessor.get(editorService_1.$9C);
        const input = editorService.activeEditor;
        if (input instanceof searchEditorInput_1.$1Ob) {
            editorService.activeEditorPane.toggleContextLines();
        }
    };
    exports.$8Ob = $8Ob;
    const $9Ob = (accessor, increase) => {
        const editorService = accessor.get(editorService_1.$9C);
        const input = editorService.activeEditor;
        if (input instanceof searchEditorInput_1.$1Ob) {
            editorService.activeEditorPane.modifyContextLines(increase);
        }
    };
    exports.$9Ob = $9Ob;
    const $0Ob = (accessor) => {
        const editorService = accessor.get(editorService_1.$9C);
        const input = editorService.activeEditor;
        if (input instanceof searchEditorInput_1.$1Ob) {
            editorService.activeEditorPane.focusAllResults();
        }
    };
    exports.$0Ob = $0Ob;
    async function $$Ob(accessor) {
        const viewsService = accessor.get(views_1.$$E);
        const instantiationService = accessor.get(instantiation_1.$Ah);
        const searchView = (0, searchActionsBase_1.$yNb)(viewsService);
        if (searchView) {
            await instantiationService.invokeFunction(exports.$_Ob, {
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
            await instantiationService.invokeFunction(exports.$_Ob);
        }
    }
    exports.$$Ob = $$Ob;
    const $_Ob = async (accessor, _args = {}, toSide = false) => {
        const editorService = accessor.get(editorService_1.$9C);
        const editorGroupsService = accessor.get(editorGroupsService_1.$5C);
        const telemetryService = accessor.get(telemetry_1.$9k);
        const instantiationService = accessor.get(instantiation_1.$Ah);
        const configurationService = accessor.get(configuration_1.$8h);
        const configurationResolverService = accessor.get(configurationResolver_1.$NM);
        const workspaceContextService = accessor.get(workspace_1.$Kh);
        const historyService = accessor.get(history_1.$SM);
        const activeWorkspaceRootUri = historyService.getLastActiveWorkspaceRoot(network_1.Schemas.file);
        const lastActiveWorkspaceRoot = activeWorkspaceRootUri ? workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? undefined : undefined;
        const activeEditorControl = editorService.activeTextEditorControl;
        let activeModel;
        let selected = '';
        if (activeEditorControl) {
            if ((0, editorBrowser_1.$jV)(activeEditorControl)) {
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
            if (editorService.activeEditor instanceof searchEditorInput_1.$1Ob) {
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
        const existing = editorService.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */).find(id => id.editor.typeId === searchEditorInput_1.$1Ob.ID);
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
            const input = instantiationService.invokeFunction(searchEditorInput_1.$2Ob, { config: args, resultsContents: '', from: 'rawData' });
            // TODO @roblourens make this use the editor resolver service if possible
            editor = await editorService.openEditor(input, { pinned: true }, toSide ? editorService_1.$$C : editorService_1.$0C);
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
    exports.$_Ob = $_Ob;
    const $aPb = async (accessor, searchResult, rawIncludePattern, rawExcludePattern, onlySearchInOpenEditors) => {
        if (!searchResult.query) {
            console.error('Expected searchResult.query to be defined. Got', searchResult);
            return;
        }
        const editorService = accessor.get(editorService_1.$9C);
        const telemetryService = accessor.get(telemetry_1.$9k);
        const instantiationService = accessor.get(instantiation_1.$Ah);
        const labelService = accessor.get(label_1.$Vz);
        const configurationService = accessor.get(configuration_1.$8h);
        const sortOrder = configurationService.getValue('search').sortOrder;
        telemetryService.publicLog2('searchEditor/createEditorFromSearchResult');
        const labelFormatter = (uri) => labelService.getUriLabel(uri, { relative: true });
        const { text, matchRanges, config } = (0, searchEditorSerialization_1.$TOb)(searchResult, rawIncludePattern, rawExcludePattern, 0, labelFormatter, sortOrder);
        config.onlyOpenEditors = onlySearchInOpenEditors;
        const contextLines = configurationService.getValue('search').searchEditor.defaultNumberOfContextLines;
        if (searchResult.isDirty || contextLines === 0 || contextLines === null) {
            const input = instantiationService.invokeFunction(searchEditorInput_1.$2Ob, { resultsContents: text, config, from: 'rawData' });
            await editorService.openEditor(input, { pinned: true });
            input.setMatchRanges(matchRanges);
        }
        else {
            const input = instantiationService.invokeFunction(searchEditorInput_1.$2Ob, { from: 'rawData', resultsContents: '', config: { ...config, contextLines } });
            const editor = await editorService.openEditor(input, { pinned: true });
            editor.triggerSearch({ focusResults: true });
        }
    };
    exports.$aPb = $aPb;
});
//# sourceMappingURL=searchEditorActions.js.map