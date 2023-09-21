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
define(["require", "exports", "vs/base/common/resources", "vs/base/common/uri", "vs/editor/contrib/find/browser/findModel", "vs/nls!vs/workbench/contrib/searchEditor/browser/searchEditor.contribution", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/workbench/browser/editor", "vs/workbench/common/contributions", "vs/workbench/common/editor", "vs/workbench/common/contextkeys", "vs/workbench/common/views", "vs/workbench/contrib/search/browser/searchActionsBase", "vs/workbench/contrib/search/browser/searchIcons", "vs/workbench/contrib/search/common/constants", "vs/workbench/contrib/searchEditor/browser/constants", "vs/workbench/contrib/searchEditor/browser/searchEditor", "vs/workbench/contrib/searchEditor/browser/searchEditorActions", "vs/workbench/contrib/searchEditor/browser/searchEditorInput", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/search/common/search", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/services/workingCopy/common/workingCopyEditorService", "vs/base/common/lifecycle"], function (require, exports, resources_1, uri_1, findModel_1, nls_1, actions_1, commands_1, contextkey_1, descriptors_1, instantiation_1, platform_1, editor_1, contributions_1, editor_2, contextkeys_1, views_1, searchActionsBase_1, searchIcons_1, SearchConstants, SearchEditorConstants, searchEditor_1, searchEditorActions_1, searchEditorInput_1, editorService_1, search_1, editorResolverService_1, workingCopyEditorService_1, lifecycle_1) {
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
    platform_1.$8m.as(editor_2.$GE.EditorPane).registerEditorPane(editor_1.$_T.create(searchEditor_1.$4Ob, searchEditor_1.$4Ob.ID, (0, nls_1.localize)(0, null)), [
        new descriptors_1.$yh(searchEditorInput_1.$1Ob)
    ]);
    //#endregion
    //#region Startup Contribution
    let SearchEditorContribution = class SearchEditorContribution {
        constructor(editorResolverService, instantiationService) {
            editorResolverService.registerEditor('*' + searchEditorInput_1.$ZOb, {
                id: searchEditorInput_1.$1Ob.ID,
                label: (0, nls_1.localize)(1, null),
                detail: editor_2.$HE.providerDisplayName,
                priority: editorResolverService_1.RegisteredEditorPriority.default,
            }, {
                singlePerResource: true,
                canSupportResource: resource => ((0, resources_1.$gg)(resource) === searchEditorInput_1.$ZOb)
            }, {
                createEditorInput: ({ resource }) => {
                    return { editor: instantiationService.invokeFunction(searchEditorInput_1.$2Ob, { from: 'existingFile', fileUri: resource }) };
                }
            });
        }
    };
    SearchEditorContribution = __decorate([
        __param(0, editorResolverService_1.$pbb),
        __param(1, instantiation_1.$Ah)
    ], SearchEditorContribution);
    const workbenchContributionsRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
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
                    const input = instantiationService.invokeFunction(searchEditorInput_1.$2Ob, { from: 'model', modelUri: uri_1.URI.parse(modelUri), config, backupOf: backingUri ? uri_1.URI.parse(backingUri) : undefined });
                    input.setDirty(dirty);
                    input.setMatchRanges(matchRanges);
                    return input;
                }
                else {
                    if (backingUri) {
                        return instantiationService.invokeFunction(searchEditorInput_1.$2Ob, { from: 'existingFile', fileUri: uri_1.URI.parse(backingUri) });
                    }
                    else {
                        return instantiationService.invokeFunction(searchEditorInput_1.$2Ob, { from: 'rawData', resultsContents: '', config });
                    }
                }
            }
            return undefined;
        }
    }
    platform_1.$8m.as(editor_2.$GE.EditorFactory).registerEditorSerializer(searchEditorInput_1.$1Ob.ID, SearchEditorInputSerializer);
    //#endregion
    //#region Commands
    commands_1.$Gr.registerCommand(CleanSearchEditorStateCommandId, (accessor) => {
        const activeEditorPane = accessor.get(editorService_1.$9C).activeEditorPane;
        if (activeEditorPane instanceof searchEditor_1.$4Ob) {
            activeEditorPane.cleanState();
        }
    });
    //#endregion
    //#region Actions
    const category = { value: (0, nls_1.localize)(2, null), original: 'Search Editor' };
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
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'search.searchEditor.action.deleteFileResults',
                title: { value: (0, nls_1.localize)(3, null), original: 'Delete File Results' },
                keybinding: {
                    weight: 100 /* KeybindingWeight.EditorContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 1 /* KeyCode.Backspace */,
                },
                precondition: SearchEditorConstants.$DOb,
                category,
                f1: true,
            });
        }
        async run(accessor) {
            const contextService = accessor.get(contextkey_1.$3i).getContext(document.activeElement);
            if (contextService.getValue(SearchEditorConstants.$DOb.serialize())) {
                accessor.get(editorService_1.$9C).activeEditorPane.deleteResultBlock();
            }
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: SearchEditorConstants.$IOb,
                title: { value: (0, nls_1.localize)(4, null), original: 'New Search Editor' },
                category,
                f1: true,
                description: openArgDescription
            });
        }
        async run(accessor, args) {
            await accessor.get(instantiation_1.$Ah).invokeFunction(searchEditorActions_1.$_Ob, translateLegacyConfig({ location: 'new', ...args }));
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: SearchEditorConstants.$JOb,
                title: { value: (0, nls_1.localize)(5, null), original: 'Open Search Editor' },
                category,
                f1: true,
                description: openArgDescription
            });
        }
        async run(accessor, args) {
            await accessor.get(instantiation_1.$Ah).invokeFunction(searchEditorActions_1.$_Ob, translateLegacyConfig({ location: 'reuse', ...args }));
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: OpenNewEditorToSideCommandId,
                title: { value: (0, nls_1.localize)(6, null), original: 'Open new Search Editor to the Side' },
                category,
                f1: true,
                description: openArgDescription
            });
        }
        async run(accessor, args) {
            await accessor.get(instantiation_1.$Ah).invokeFunction(searchEditorActions_1.$_Ob, translateLegacyConfig(args), true);
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: OpenInEditorCommandId,
                title: { value: (0, nls_1.localize)(7, null), original: 'Open Results in Editor' },
                category,
                f1: true,
                keybinding: {
                    primary: 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */,
                    when: contextkey_1.$Ii.and(SearchConstants.$oOb, SearchConstants.$hOb),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */
                    }
                },
            });
        }
        async run(accessor) {
            const viewsService = accessor.get(views_1.$$E);
            const instantiationService = accessor.get(instantiation_1.$Ah);
            const searchView = (0, searchActionsBase_1.$yNb)(viewsService);
            if (searchView) {
                await instantiationService.invokeFunction(searchEditorActions_1.$aPb, searchView.searchResult, searchView.searchIncludePattern.getValue(), searchView.searchExcludePattern.getValue(), searchView.searchIncludePattern.onlySearchInOpenEditors());
            }
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: RerunSearchEditorSearchCommandId,
                title: { value: (0, nls_1.localize)(8, null), original: 'Search Again' },
                category,
                keybinding: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 48 /* KeyCode.KeyR */,
                    when: SearchEditorConstants.$DOb,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                icon: searchIcons_1.$iNb,
                menu: [{
                        id: actions_1.$Ru.EditorTitle,
                        group: 'navigation',
                        when: contextkeys_1.$$cb.isEqualTo(SearchEditorConstants.$HOb)
                    },
                    {
                        id: actions_1.$Ru.CommandPalette,
                        when: contextkeys_1.$$cb.isEqualTo(SearchEditorConstants.$HOb)
                    }]
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const input = editorService.activeEditor;
            if (input instanceof searchEditorInput_1.$1Ob) {
                editorService.activeEditorPane.triggerSearch({ resetCursor: false });
            }
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: FocusQueryEditorWidgetCommandId,
                title: { value: (0, nls_1.localize)(9, null), original: 'Focus Search Editor Input' },
                category,
                f1: true,
                precondition: SearchEditorConstants.$DOb,
                keybinding: {
                    primary: 9 /* KeyCode.Escape */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const input = editorService.activeEditor;
            if (input instanceof searchEditorInput_1.$1Ob) {
                editorService.activeEditorPane.focusSearchInput();
            }
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: FocusQueryEditorFilesToIncludeCommandId,
                title: { value: (0, nls_1.localize)(10, null), original: 'Focus Search Editor Files to Include' },
                category,
                f1: true,
                precondition: SearchEditorConstants.$DOb,
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const input = editorService.activeEditor;
            if (input instanceof searchEditorInput_1.$1Ob) {
                editorService.activeEditorPane.focusFilesToIncludeInput();
            }
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: FocusQueryEditorFilesToExcludeCommandId,
                title: { value: (0, nls_1.localize)(11, null), original: 'Focus Search Editor Files to Exclude' },
                category,
                f1: true,
                precondition: SearchEditorConstants.$DOb,
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const input = editorService.activeEditor;
            if (input instanceof searchEditorInput_1.$1Ob) {
                editorService.activeEditorPane.focusFilesToExcludeInput();
            }
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: ToggleSearchEditorCaseSensitiveCommandId,
                title: { value: (0, nls_1.localize)(12, null), original: 'Toggle Match Case' },
                category,
                f1: true,
                precondition: SearchEditorConstants.$DOb,
                keybinding: Object.assign({
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: SearchConstants.$jOb,
                }, findModel_1.$C7)
            });
        }
        run(accessor) {
            (0, searchEditorActions_1.$5Ob)(accessor);
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: ToggleSearchEditorWholeWordCommandId,
                title: { value: (0, nls_1.localize)(13, null), original: 'Toggle Match Whole Word' },
                category,
                f1: true,
                precondition: SearchEditorConstants.$DOb,
                keybinding: Object.assign({
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: SearchConstants.$jOb,
                }, findModel_1.$D7)
            });
        }
        run(accessor) {
            (0, searchEditorActions_1.$6Ob)(accessor);
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: ToggleSearchEditorRegexCommandId,
                title: { value: (0, nls_1.localize)(14, null), original: 'Toggle Use Regular Expression"' },
                category,
                f1: true,
                precondition: SearchEditorConstants.$DOb,
                keybinding: Object.assign({
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: SearchConstants.$jOb,
                }, findModel_1.$E7)
            });
        }
        run(accessor) {
            (0, searchEditorActions_1.$7Ob)(accessor);
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: SearchEditorConstants.$KOb,
                title: { value: (0, nls_1.localize)(15, null), original: 'Toggle Context Lines"' },
                category,
                f1: true,
                precondition: SearchEditorConstants.$DOb,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 512 /* KeyMod.Alt */ | 42 /* KeyCode.KeyL */,
                    mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 42 /* KeyCode.KeyL */ }
                }
            });
        }
        run(accessor) {
            (0, searchEditorActions_1.$8Ob)(accessor);
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: IncreaseSearchEditorContextLinesCommandId,
                title: { original: 'Increase Context Lines', value: (0, nls_1.localize)(16, null) },
                category,
                f1: true,
                precondition: SearchEditorConstants.$DOb,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 512 /* KeyMod.Alt */ | 86 /* KeyCode.Equal */
                }
            });
        }
        run(accessor) { (0, searchEditorActions_1.$9Ob)(accessor, true); }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: DecreaseSearchEditorContextLinesCommandId,
                title: { original: 'Decrease Context Lines', value: (0, nls_1.localize)(17, null) },
                category,
                f1: true,
                precondition: SearchEditorConstants.$DOb,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 512 /* KeyMod.Alt */ | 88 /* KeyCode.Minus */
                }
            });
        }
        run(accessor) { (0, searchEditorActions_1.$9Ob)(accessor, false); }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: SelectAllSearchEditorMatchesCommandId,
                title: { original: 'Select All Matches', value: (0, nls_1.localize)(18, null) },
                category,
                f1: true,
                precondition: SearchEditorConstants.$DOb,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 42 /* KeyCode.KeyL */,
                }
            });
        }
        run(accessor) {
            (0, searchEditorActions_1.$0Ob)(accessor);
        }
    });
    (0, actions_1.$Xu)(class OpenSearchEditorAction extends actions_1.$Wu {
        constructor() {
            super({
                id: 'search.action.openNewEditorFromView',
                title: (0, nls_1.localize)(19, null),
                category,
                icon: searchIcons_1.$qNb,
                menu: [{
                        id: actions_1.$Ru.ViewTitle,
                        group: 'navigation',
                        order: 2,
                        when: contextkey_1.$Ii.equals('view', search_1.$lI),
                    }]
            });
        }
        run(accessor, ...args) {
            return (0, searchEditorActions_1.$$Ob)(accessor);
        }
    });
    //#endregion
    //#region Search Editor Working Copy Editor Handler
    let SearchEditorWorkingCopyEditorHandler = class SearchEditorWorkingCopyEditorHandler extends lifecycle_1.$kc {
        constructor(a, workingCopyEditorService) {
            super();
            this.a = a;
            this.B(workingCopyEditorService.registerHandler(this));
        }
        handles(workingCopy) {
            return workingCopy.resource.scheme === SearchEditorConstants.$EOb;
        }
        isOpen(workingCopy, editor) {
            if (!this.handles(workingCopy)) {
                return false;
            }
            return editor instanceof searchEditorInput_1.$1Ob && (0, resources_1.$bg)(workingCopy.resource, editor.modelUri);
        }
        createEditor(workingCopy) {
            const input = this.a.invokeFunction(searchEditorInput_1.$2Ob, { from: 'model', modelUri: workingCopy.resource });
            input.setDirty(true);
            return input;
        }
    };
    SearchEditorWorkingCopyEditorHandler = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, workingCopyEditorService_1.$AD)
    ], SearchEditorWorkingCopyEditorHandler);
    workbenchContributionsRegistry.registerWorkbenchContribution(SearchEditorWorkingCopyEditorHandler, 2 /* LifecyclePhase.Ready */);
});
//#endregion
//# sourceMappingURL=searchEditor.contribution.js.map