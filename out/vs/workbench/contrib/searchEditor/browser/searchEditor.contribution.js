/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/resources", "vs/base/common/uri", "vs/editor/contrib/find/browser/findModel", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/workbench/browser/editor", "vs/workbench/common/contributions", "vs/workbench/common/editor", "vs/workbench/common/contextkeys", "vs/workbench/common/views", "vs/workbench/contrib/search/browser/searchActionsBase", "vs/workbench/contrib/search/browser/searchIcons", "vs/workbench/contrib/search/common/constants", "vs/workbench/contrib/searchEditor/browser/constants", "vs/workbench/contrib/searchEditor/browser/searchEditor", "vs/workbench/contrib/searchEditor/browser/searchEditorActions", "vs/workbench/contrib/searchEditor/browser/searchEditorInput", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/search/common/search", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/services/workingCopy/common/workingCopyEditorService", "vs/base/common/lifecycle"], function (require, exports, resources_1, uri_1, findModel_1, nls_1, actions_1, commands_1, contextkey_1, descriptors_1, instantiation_1, platform_1, editor_1, contributions_1, editor_2, contextkeys_1, views_1, searchActionsBase_1, searchIcons_1, SearchConstants, SearchEditorConstants, searchEditor_1, searchEditorActions_1, searchEditorInput_1, editorService_1, search_1, editorResolverService_1, workingCopyEditorService_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const OpenInEditorCommandId = 'search.action.openInEditor';
    const OpenNewEditorToSideCommandId = 'search.action.openNewEditorToSide';
    const FocusQueryEditorWidgetCommandId = 'search.action.focusQueryEditorWidget';
    const FocusQueryEditorFilesToIncludeCommandId = 'search.action.focusFilesToInclude';
    const FocusQueryEditorFilesToExcludeCommandId = 'search.action.focusFilesToExclude';
    const ToggleSearchEditorCaseSensitiveCommandId = 'toggleSearchEditorCaseSensitive';
    const ToggleSearchEditorWholeWordCommandId = 'toggleSearchEditorWholeWord';
    const ToggleSearchEditorRegexCommandId = 'toggleSearchEditorRegex';
    const IncreaseSearchEditorContextLinesCommandId = 'increaseSearchEditorContextLines';
    const DecreaseSearchEditorContextLinesCommandId = 'decreaseSearchEditorContextLines';
    const RerunSearchEditorSearchCommandId = 'rerunSearchEditorSearch';
    const CleanSearchEditorStateCommandId = 'cleanSearchEditorState';
    const SelectAllSearchEditorMatchesCommandId = 'selectAllSearchEditorMatches';
    //#region Editor Descriptior
    platform_1.Registry.as(editor_2.EditorExtensions.EditorPane).registerEditorPane(editor_1.EditorPaneDescriptor.create(searchEditor_1.SearchEditor, searchEditor_1.SearchEditor.ID, (0, nls_1.localize)('searchEditor', "Search Editor")), [
        new descriptors_1.SyncDescriptor(searchEditorInput_1.SearchEditorInput)
    ]);
    //#endregion
    //#region Startup Contribution
    let SearchEditorContribution = class SearchEditorContribution {
        constructor(editorResolverService, instantiationService) {
            editorResolverService.registerEditor('*' + searchEditorInput_1.SEARCH_EDITOR_EXT, {
                id: searchEditorInput_1.SearchEditorInput.ID,
                label: (0, nls_1.localize)('promptOpenWith.searchEditor.displayName', "Search Editor"),
                detail: editor_2.DEFAULT_EDITOR_ASSOCIATION.providerDisplayName,
                priority: editorResolverService_1.RegisteredEditorPriority.default,
            }, {
                singlePerResource: true,
                canSupportResource: resource => ((0, resources_1.extname)(resource) === searchEditorInput_1.SEARCH_EDITOR_EXT)
            }, {
                createEditorInput: ({ resource }) => {
                    return { editor: instantiationService.invokeFunction(searchEditorInput_1.getOrMakeSearchEditorInput, { from: 'existingFile', fileUri: resource }) };
                }
            });
        }
    };
    SearchEditorContribution = __decorate([
        __param(0, editorResolverService_1.IEditorResolverService),
        __param(1, instantiation_1.IInstantiationService)
    ], SearchEditorContribution);
    const workbenchContributionsRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(SearchEditorContribution, 1 /* LifecyclePhase.Starting */);
    class SearchEditorInputSerializer {
        canSerialize(input) {
            return !!input.tryReadConfigSync();
        }
        serialize(input) {
            if (input.isDisposed()) {
                return JSON.stringify({ modelUri: undefined, dirty: false, config: input.tryReadConfigSync(), name: input.getName(), matchRanges: [], backingUri: input.backingUri?.toString() });
            }
            let modelUri = undefined;
            if (input.modelUri.path || input.modelUri.fragment && input.isDirty()) {
                modelUri = input.modelUri.toString();
            }
            const config = input.tryReadConfigSync();
            const dirty = input.isDirty();
            const matchRanges = dirty ? input.getMatchRanges() : [];
            const backingUri = input.backingUri;
            return JSON.stringify({ modelUri, dirty, config, name: input.getName(), matchRanges, backingUri: backingUri?.toString() });
        }
        deserialize(instantiationService, serializedEditorInput) {
            const { modelUri, dirty, config, matchRanges, backingUri } = JSON.parse(serializedEditorInput);
            if (config && (config.query !== undefined)) {
                if (modelUri) {
                    const input = instantiationService.invokeFunction(searchEditorInput_1.getOrMakeSearchEditorInput, { from: 'model', modelUri: uri_1.URI.parse(modelUri), config, backupOf: backingUri ? uri_1.URI.parse(backingUri) : undefined });
                    input.setDirty(dirty);
                    input.setMatchRanges(matchRanges);
                    return input;
                }
                else {
                    if (backingUri) {
                        return instantiationService.invokeFunction(searchEditorInput_1.getOrMakeSearchEditorInput, { from: 'existingFile', fileUri: uri_1.URI.parse(backingUri) });
                    }
                    else {
                        return instantiationService.invokeFunction(searchEditorInput_1.getOrMakeSearchEditorInput, { from: 'rawData', resultsContents: '', config });
                    }
                }
            }
            return undefined;
        }
    }
    platform_1.Registry.as(editor_2.EditorExtensions.EditorFactory).registerEditorSerializer(searchEditorInput_1.SearchEditorInput.ID, SearchEditorInputSerializer);
    //#endregion
    //#region Commands
    commands_1.CommandsRegistry.registerCommand(CleanSearchEditorStateCommandId, (accessor) => {
        const activeEditorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
        if (activeEditorPane instanceof searchEditor_1.SearchEditor) {
            activeEditorPane.cleanState();
        }
    });
    //#endregion
    //#region Actions
    const category = { value: (0, nls_1.localize)('search', "Search Editor"), original: 'Search Editor' };
    const translateLegacyConfig = (legacyConfig = {}) => {
        const config = {};
        const overrides = {
            includes: 'filesToInclude',
            excludes: 'filesToExclude',
            wholeWord: 'matchWholeWord',
            caseSensitive: 'isCaseSensitive',
            regexp: 'isRegexp',
            useIgnores: 'useExcludeSettingsAndIgnoreFiles',
        };
        Object.entries(legacyConfig).forEach(([key, value]) => {
            config[overrides[key] ?? key] = value;
        });
        return config;
    };
    const openArgDescription = {
        description: 'Open a new search editor. Arguments passed can include variables like ${relativeFileDirname}.',
        args: [{
                name: 'Open new Search Editor args',
                schema: {
                    properties: {
                        query: { type: 'string' },
                        filesToInclude: { type: 'string' },
                        filesToExclude: { type: 'string' },
                        contextLines: { type: 'number' },
                        matchWholeWord: { type: 'boolean' },
                        isCaseSensitive: { type: 'boolean' },
                        isRegexp: { type: 'boolean' },
                        useExcludeSettingsAndIgnoreFiles: { type: 'boolean' },
                        showIncludesExcludes: { type: 'boolean' },
                        triggerSearch: { type: 'boolean' },
                        focusResults: { type: 'boolean' },
                        onlyOpenEditors: { type: 'boolean' },
                    }
                }
            }]
    };
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'search.searchEditor.action.deleteFileResults',
                title: { value: (0, nls_1.localize)('searchEditor.deleteResultBlock', "Delete File Results"), original: 'Delete File Results' },
                keybinding: {
                    weight: 100 /* KeybindingWeight.EditorContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 1 /* KeyCode.Backspace */,
                },
                precondition: SearchEditorConstants.InSearchEditor,
                category,
                f1: true,
            });
        }
        async run(accessor) {
            const contextService = accessor.get(contextkey_1.IContextKeyService).getContext(document.activeElement);
            if (contextService.getValue(SearchEditorConstants.InSearchEditor.serialize())) {
                accessor.get(editorService_1.IEditorService).activeEditorPane.deleteResultBlock();
            }
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: SearchEditorConstants.OpenNewEditorCommandId,
                title: { value: (0, nls_1.localize)('search.openNewSearchEditor', "New Search Editor"), original: 'New Search Editor' },
                category,
                f1: true,
                description: openArgDescription
            });
        }
        async run(accessor, args) {
            await accessor.get(instantiation_1.IInstantiationService).invokeFunction(searchEditorActions_1.openNewSearchEditor, translateLegacyConfig({ location: 'new', ...args }));
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: SearchEditorConstants.OpenEditorCommandId,
                title: { value: (0, nls_1.localize)('search.openSearchEditor', "Open Search Editor"), original: 'Open Search Editor' },
                category,
                f1: true,
                description: openArgDescription
            });
        }
        async run(accessor, args) {
            await accessor.get(instantiation_1.IInstantiationService).invokeFunction(searchEditorActions_1.openNewSearchEditor, translateLegacyConfig({ location: 'reuse', ...args }));
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: OpenNewEditorToSideCommandId,
                title: { value: (0, nls_1.localize)('search.openNewEditorToSide', "Open New Search Editor to the Side"), original: 'Open new Search Editor to the Side' },
                category,
                f1: true,
                description: openArgDescription
            });
        }
        async run(accessor, args) {
            await accessor.get(instantiation_1.IInstantiationService).invokeFunction(searchEditorActions_1.openNewSearchEditor, translateLegacyConfig(args), true);
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: OpenInEditorCommandId,
                title: { value: (0, nls_1.localize)('search.openResultsInEditor', "Open Results in Editor"), original: 'Open Results in Editor' },
                category,
                f1: true,
                keybinding: {
                    primary: 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */,
                    when: contextkey_1.ContextKeyExpr.and(SearchConstants.HasSearchResults, SearchConstants.SearchViewFocusedKey),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */
                    }
                },
            });
        }
        async run(accessor) {
            const viewsService = accessor.get(views_1.IViewsService);
            const instantiationService = accessor.get(instantiation_1.IInstantiationService);
            const searchView = (0, searchActionsBase_1.getSearchView)(viewsService);
            if (searchView) {
                await instantiationService.invokeFunction(searchEditorActions_1.createEditorFromSearchResult, searchView.searchResult, searchView.searchIncludePattern.getValue(), searchView.searchExcludePattern.getValue(), searchView.searchIncludePattern.onlySearchInOpenEditors());
            }
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: RerunSearchEditorSearchCommandId,
                title: { value: (0, nls_1.localize)('search.rerunSearchInEditor', "Search Again"), original: 'Search Again' },
                category,
                keybinding: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 48 /* KeyCode.KeyR */,
                    when: SearchEditorConstants.InSearchEditor,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                icon: searchIcons_1.searchRefreshIcon,
                menu: [{
                        id: actions_1.MenuId.EditorTitle,
                        group: 'navigation',
                        when: contextkeys_1.ActiveEditorContext.isEqualTo(SearchEditorConstants.SearchEditorID)
                    },
                    {
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkeys_1.ActiveEditorContext.isEqualTo(SearchEditorConstants.SearchEditorID)
                    }]
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const input = editorService.activeEditor;
            if (input instanceof searchEditorInput_1.SearchEditorInput) {
                editorService.activeEditorPane.triggerSearch({ resetCursor: false });
            }
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: FocusQueryEditorWidgetCommandId,
                title: { value: (0, nls_1.localize)('search.action.focusQueryEditorWidget', "Focus Search Editor Input"), original: 'Focus Search Editor Input' },
                category,
                f1: true,
                precondition: SearchEditorConstants.InSearchEditor,
                keybinding: {
                    primary: 9 /* KeyCode.Escape */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const input = editorService.activeEditor;
            if (input instanceof searchEditorInput_1.SearchEditorInput) {
                editorService.activeEditorPane.focusSearchInput();
            }
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: FocusQueryEditorFilesToIncludeCommandId,
                title: { value: (0, nls_1.localize)('search.action.focusFilesToInclude', "Focus Search Editor Files to Include"), original: 'Focus Search Editor Files to Include' },
                category,
                f1: true,
                precondition: SearchEditorConstants.InSearchEditor,
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const input = editorService.activeEditor;
            if (input instanceof searchEditorInput_1.SearchEditorInput) {
                editorService.activeEditorPane.focusFilesToIncludeInput();
            }
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: FocusQueryEditorFilesToExcludeCommandId,
                title: { value: (0, nls_1.localize)('search.action.focusFilesToExclude', "Focus Search Editor Files to Exclude"), original: 'Focus Search Editor Files to Exclude' },
                category,
                f1: true,
                precondition: SearchEditorConstants.InSearchEditor,
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const input = editorService.activeEditor;
            if (input instanceof searchEditorInput_1.SearchEditorInput) {
                editorService.activeEditorPane.focusFilesToExcludeInput();
            }
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: ToggleSearchEditorCaseSensitiveCommandId,
                title: { value: (0, nls_1.localize)('searchEditor.action.toggleSearchEditorCaseSensitive', "Toggle Match Case"), original: 'Toggle Match Case' },
                category,
                f1: true,
                precondition: SearchEditorConstants.InSearchEditor,
                keybinding: Object.assign({
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: SearchConstants.SearchInputBoxFocusedKey,
                }, findModel_1.ToggleCaseSensitiveKeybinding)
            });
        }
        run(accessor) {
            (0, searchEditorActions_1.toggleSearchEditorCaseSensitiveCommand)(accessor);
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: ToggleSearchEditorWholeWordCommandId,
                title: { value: (0, nls_1.localize)('searchEditor.action.toggleSearchEditorWholeWord', "Toggle Match Whole Word"), original: 'Toggle Match Whole Word' },
                category,
                f1: true,
                precondition: SearchEditorConstants.InSearchEditor,
                keybinding: Object.assign({
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: SearchConstants.SearchInputBoxFocusedKey,
                }, findModel_1.ToggleWholeWordKeybinding)
            });
        }
        run(accessor) {
            (0, searchEditorActions_1.toggleSearchEditorWholeWordCommand)(accessor);
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: ToggleSearchEditorRegexCommandId,
                title: { value: (0, nls_1.localize)('searchEditor.action.toggleSearchEditorRegex', "Toggle Use Regular Expression"), original: 'Toggle Use Regular Expression"' },
                category,
                f1: true,
                precondition: SearchEditorConstants.InSearchEditor,
                keybinding: Object.assign({
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: SearchConstants.SearchInputBoxFocusedKey,
                }, findModel_1.ToggleRegexKeybinding)
            });
        }
        run(accessor) {
            (0, searchEditorActions_1.toggleSearchEditorRegexCommand)(accessor);
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: SearchEditorConstants.ToggleSearchEditorContextLinesCommandId,
                title: { value: (0, nls_1.localize)('searchEditor.action.toggleSearchEditorContextLines', "Toggle Context Lines"), original: 'Toggle Context Lines"' },
                category,
                f1: true,
                precondition: SearchEditorConstants.InSearchEditor,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 512 /* KeyMod.Alt */ | 42 /* KeyCode.KeyL */,
                    mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 42 /* KeyCode.KeyL */ }
                }
            });
        }
        run(accessor) {
            (0, searchEditorActions_1.toggleSearchEditorContextLinesCommand)(accessor);
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: IncreaseSearchEditorContextLinesCommandId,
                title: { original: 'Increase Context Lines', value: (0, nls_1.localize)('searchEditor.action.increaseSearchEditorContextLines', "Increase Context Lines") },
                category,
                f1: true,
                precondition: SearchEditorConstants.InSearchEditor,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 512 /* KeyMod.Alt */ | 86 /* KeyCode.Equal */
                }
            });
        }
        run(accessor) { (0, searchEditorActions_1.modifySearchEditorContextLinesCommand)(accessor, true); }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: DecreaseSearchEditorContextLinesCommandId,
                title: { original: 'Decrease Context Lines', value: (0, nls_1.localize)('searchEditor.action.decreaseSearchEditorContextLines', "Decrease Context Lines") },
                category,
                f1: true,
                precondition: SearchEditorConstants.InSearchEditor,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 512 /* KeyMod.Alt */ | 88 /* KeyCode.Minus */
                }
            });
        }
        run(accessor) { (0, searchEditorActions_1.modifySearchEditorContextLinesCommand)(accessor, false); }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: SelectAllSearchEditorMatchesCommandId,
                title: { original: 'Select All Matches', value: (0, nls_1.localize)('searchEditor.action.selectAllSearchEditorMatches', "Select All Matches") },
                category,
                f1: true,
                precondition: SearchEditorConstants.InSearchEditor,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 42 /* KeyCode.KeyL */,
                }
            });
        }
        run(accessor) {
            (0, searchEditorActions_1.selectAllSearchEditorMatchesCommand)(accessor);
        }
    });
    (0, actions_1.registerAction2)(class OpenSearchEditorAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'search.action.openNewEditorFromView',
                title: (0, nls_1.localize)('search.openNewEditor', "Open New Search Editor"),
                category,
                icon: searchIcons_1.searchNewEditorIcon,
                menu: [{
                        id: actions_1.MenuId.ViewTitle,
                        group: 'navigation',
                        order: 2,
                        when: contextkey_1.ContextKeyExpr.equals('view', search_1.VIEW_ID),
                    }]
            });
        }
        run(accessor, ...args) {
            return (0, searchEditorActions_1.openSearchEditor)(accessor);
        }
    });
    //#endregion
    //#region Search Editor Working Copy Editor Handler
    let SearchEditorWorkingCopyEditorHandler = class SearchEditorWorkingCopyEditorHandler extends lifecycle_1.Disposable {
        constructor(instantiationService, workingCopyEditorService) {
            super();
            this.instantiationService = instantiationService;
            this._register(workingCopyEditorService.registerHandler(this));
        }
        handles(workingCopy) {
            return workingCopy.resource.scheme === SearchEditorConstants.SearchEditorScheme;
        }
        isOpen(workingCopy, editor) {
            if (!this.handles(workingCopy)) {
                return false;
            }
            return editor instanceof searchEditorInput_1.SearchEditorInput && (0, resources_1.isEqual)(workingCopy.resource, editor.modelUri);
        }
        createEditor(workingCopy) {
            const input = this.instantiationService.invokeFunction(searchEditorInput_1.getOrMakeSearchEditorInput, { from: 'model', modelUri: workingCopy.resource });
            input.setDirty(true);
            return input;
        }
    };
    SearchEditorWorkingCopyEditorHandler = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, workingCopyEditorService_1.IWorkingCopyEditorService)
    ], SearchEditorWorkingCopyEditorHandler);
    workbenchContributionsRegistry.registerWorkbenchContribution(SearchEditorWorkingCopyEditorHandler, 2 /* LifecyclePhase.Ready */);
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoRWRpdG9yLmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3NlYXJjaEVkaXRvci9icm93c2VyL3NlYXJjaEVkaXRvci5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7SUFzQ2hHLE1BQU0scUJBQXFCLEdBQUcsNEJBQTRCLENBQUM7SUFDM0QsTUFBTSw0QkFBNEIsR0FBRyxtQ0FBbUMsQ0FBQztJQUN6RSxNQUFNLCtCQUErQixHQUFHLHNDQUFzQyxDQUFDO0lBQy9FLE1BQU0sdUNBQXVDLEdBQUcsbUNBQW1DLENBQUM7SUFDcEYsTUFBTSx1Q0FBdUMsR0FBRyxtQ0FBbUMsQ0FBQztJQUVwRixNQUFNLHdDQUF3QyxHQUFHLGlDQUFpQyxDQUFDO0lBQ25GLE1BQU0sb0NBQW9DLEdBQUcsNkJBQTZCLENBQUM7SUFDM0UsTUFBTSxnQ0FBZ0MsR0FBRyx5QkFBeUIsQ0FBQztJQUNuRSxNQUFNLHlDQUF5QyxHQUFHLGtDQUFrQyxDQUFDO0lBQ3JGLE1BQU0seUNBQXlDLEdBQUcsa0NBQWtDLENBQUM7SUFFckYsTUFBTSxnQ0FBZ0MsR0FBRyx5QkFBeUIsQ0FBQztJQUNuRSxNQUFNLCtCQUErQixHQUFHLHdCQUF3QixDQUFDO0lBQ2pFLE1BQU0scUNBQXFDLEdBQUcsOEJBQThCLENBQUM7SUFJN0UsNEJBQTRCO0lBQzVCLG1CQUFRLENBQUMsRUFBRSxDQUFzQix5QkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxrQkFBa0IsQ0FDL0UsNkJBQW9CLENBQUMsTUFBTSxDQUMxQiwyQkFBWSxFQUNaLDJCQUFZLENBQUMsRUFBRSxFQUNmLElBQUEsY0FBUSxFQUFDLGNBQWMsRUFBRSxlQUFlLENBQUMsQ0FDekMsRUFDRDtRQUNDLElBQUksNEJBQWMsQ0FBQyxxQ0FBaUIsQ0FB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