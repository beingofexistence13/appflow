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
define(["require", "exports", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/base/common/marshalling", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/strings", "vs/base/common/types", "vs/base/common/uri", "vs/editor/browser/services/bulkEditService", "vs/editor/common/core/editOperation", "vs/editor/common/languages/modesRegistry", "vs/editor/common/services/model", "vs/editor/common/services/resolverService", "vs/editor/contrib/peekView/browser/peekView", "vs/editor/contrib/suggest/browser/suggest", "vs/nls!vs/workbench/contrib/interactive/browser/interactive.contribution", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/editor/common/editor", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/registry/common/platform", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/browser/editor", "vs/workbench/common/contributions", "vs/workbench/common/editor", "vs/workbench/common/theme", "vs/workbench/contrib/bulkEdit/browser/bulkCellEdits", "vs/workbench/contrib/interactive/browser/interactiveCommon", "vs/workbench/contrib/interactive/browser/interactiveDocumentService", "vs/workbench/contrib/interactive/browser/interactiveEditor", "vs/workbench/contrib/interactive/browser/interactiveEditorInput", "vs/workbench/contrib/interactive/browser/interactiveHistoryService", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/services/editor/common/editorGroupColumn", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/workingCopy/common/workingCopyEditorService"], function (require, exports, iterator_1, lifecycle_1, marshalling_1, network_1, resources_1, strings_1, types_1, uri_1, bulkEditService_1, editOperation_1, modesRegistry_1, model_1, resolverService_1, peekView_1, suggest_1, nls_1, actions_1, configuration_1, configurationRegistry_1, contextkey_1, editor_1, descriptors_1, extensions_1, instantiation_1, log_1, platform_1, colorRegistry_1, themeService_1, editor_2, contributions_1, editor_3, theme_1, bulkCellEdits_1, interactiveCommon_1, interactiveDocumentService_1, interactiveEditor_1, interactiveEditorInput_1, interactiveHistoryService_1, coreActions_1, icons, notebookEditorService_1, notebookCommon_1, notebookContextKeys_1, notebookKernelService_1, notebookService_1, editorGroupColumn_1, editorGroupsService_1, editorResolverService_1, editorService_1, extensions_2, workingCopyEditorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$MJb = exports.$LJb = void 0;
    const interactiveWindowCategory = { value: (0, nls_1.localize)(0, null), original: 'Interactive Window' };
    platform_1.$8m.as(editor_3.$GE.EditorPane).registerEditorPane(editor_2.$_T.create(interactiveEditor_1.$KJb, notebookCommon_1.$VH, 'Interactive Window'), [
        new descriptors_1.$yh(interactiveEditorInput_1.$5ib)
    ]);
    let $LJb = class $LJb extends lifecycle_1.$kc {
        constructor(notebookService, editorResolverService, editorService, a) {
            super();
            this.a = a;
            const info = notebookService.getContributedNotebookType('interactive');
            // We need to contribute a notebook type for the Interactive Window to provide notebook models.
            if (!info) {
                this.B(notebookService.registerContributedNotebookType('interactive', {
                    providerDisplayName: 'Interactive Notebook',
                    displayName: 'Interactive',
                    filenamePattern: ['*.interactive'],
                    exclusive: true
                }));
            }
            editorResolverService.registerEditor(`${network_1.Schemas.vscodeInteractiveInput}:/**`, {
                id: 'vscode-interactive-input',
                label: 'Interactive Editor',
                priority: editorResolverService_1.RegisteredEditorPriority.exclusive
            }, {
                canSupportResource: uri => uri.scheme === network_1.Schemas.vscodeInteractiveInput,
                singlePerResource: true
            }, {
                createEditorInput: ({ resource }) => {
                    const editorInput = editorService.getEditors(1 /* EditorsOrder.SEQUENTIAL */).find(editor => editor.editor instanceof interactiveEditorInput_1.$5ib && editor.editor.inputResource.toString() === resource.toString());
                    return editorInput;
                }
            });
            editorResolverService.registerEditor(`*.interactive`, {
                id: 'interactive',
                label: 'Interactive Editor',
                priority: editorResolverService_1.RegisteredEditorPriority.exclusive
            }, {
                canSupportResource: uri => (uri.scheme === network_1.Schemas.untitled && (0, resources_1.$gg)(uri) === '.interactive') ||
                    (uri.scheme === network_1.Schemas.vscodeNotebookCell && (0, resources_1.$gg)(uri) === '.interactive'),
                singlePerResource: true
            }, {
                createEditorInput: ({ resource, options }) => {
                    const data = notebookCommon_1.CellUri.parse(resource);
                    let cellOptions;
                    if (data) {
                        cellOptions = { resource, options };
                    }
                    const notebookOptions = { ...options, cellOptions };
                    const editorInput = createEditor(resource, this.a);
                    return {
                        editor: editorInput,
                        options: notebookOptions
                    };
                },
                createUntitledEditorInput: ({ resource, options }) => {
                    if (!resource) {
                        throw new Error('Interactive window editors must have a resource name');
                    }
                    const data = notebookCommon_1.CellUri.parse(resource);
                    let cellOptions;
                    if (data) {
                        cellOptions = { resource, options };
                    }
                    const notebookOptions = { ...options, cellOptions };
                    const editorInput = createEditor(resource, this.a);
                    return {
                        editor: editorInput,
                        options: notebookOptions
                    };
                }
            });
        }
    };
    exports.$LJb = $LJb;
    exports.$LJb = $LJb = __decorate([
        __param(0, notebookService_1.$ubb),
        __param(1, editorResolverService_1.$pbb),
        __param(2, editorService_1.$9C),
        __param(3, instantiation_1.$Ah)
    ], $LJb);
    let InteractiveInputContentProvider = class InteractiveInputContentProvider {
        constructor(textModelService, b) {
            this.b = b;
            this.a = textModelService.registerTextModelContentProvider(network_1.Schemas.vscodeInteractiveInput, this);
        }
        dispose() {
            this.a.dispose();
        }
        async provideTextContent(resource) {
            const existing = this.b.getModel(resource);
            if (existing) {
                return existing;
            }
            const result = this.b.createModel('', null, resource, false);
            return result;
        }
    };
    InteractiveInputContentProvider = __decorate([
        __param(0, resolverService_1.$uA),
        __param(1, model_1.$yA)
    ], InteractiveInputContentProvider);
    function createEditor(resource, instantiationService) {
        const counter = /\/Interactive-(\d+)/.exec(resource.path);
        const inputBoxPath = counter && counter[1] ? `/InteractiveInput-${counter[1]}` : 'InteractiveInput';
        const inputUri = uri_1.URI.from({ scheme: network_1.Schemas.vscodeInteractiveInput, path: inputBoxPath });
        const editorInput = interactiveEditorInput_1.$5ib.create(instantiationService, resource, inputUri);
        return editorInput;
    }
    let InteractiveWindowWorkingCopyEditorHandler = class InteractiveWindowWorkingCopyEditorHandler extends lifecycle_1.$kc {
        constructor(a, b, c) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.f();
        }
        handles(workingCopy) {
            const viewType = this.g(workingCopy);
            return !!viewType && viewType === 'interactive';
        }
        isOpen(workingCopy, editor) {
            if (!this.handles(workingCopy)) {
                return false;
            }
            return editor instanceof interactiveEditorInput_1.$5ib && (0, resources_1.$bg)(workingCopy.resource, editor.resource);
        }
        createEditor(workingCopy) {
            return createEditor(workingCopy.resource, this.a);
        }
        async f() {
            await this.c.whenInstalledExtensionsRegistered();
            this.B(this.b.registerHandler(this));
        }
        g(workingCopy) {
            return notebookCommon_1.$8H.parse(workingCopy.typeId);
        }
    };
    InteractiveWindowWorkingCopyEditorHandler = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, workingCopyEditorService_1.$AD),
        __param(2, extensions_2.$MF)
    ], InteractiveWindowWorkingCopyEditorHandler);
    const workbenchContributionsRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution($LJb, 2 /* LifecyclePhase.Ready */);
    workbenchContributionsRegistry.registerWorkbenchContribution(InteractiveInputContentProvider, 2 /* LifecyclePhase.Ready */);
    workbenchContributionsRegistry.registerWorkbenchContribution(InteractiveWindowWorkingCopyEditorHandler, 2 /* LifecyclePhase.Ready */);
    class $MJb {
        static { this.ID = interactiveEditorInput_1.$5ib.ID; }
        canSerialize(editor) {
            const interactiveEditorInput = editor;
            return uri_1.URI.isUri(interactiveEditorInput?.primary?.resource) && uri_1.URI.isUri(interactiveEditorInput?.inputResource);
        }
        serialize(input) {
            (0, types_1.$tf)(input instanceof interactiveEditorInput_1.$5ib);
            return JSON.stringify({
                resource: input.primary.resource,
                inputResource: input.inputResource,
                name: input.getName(),
                language: input.language
            });
        }
        deserialize(instantiationService, raw) {
            const data = (0, marshalling_1.$0g)(raw);
            if (!data) {
                return undefined;
            }
            const { resource, inputResource, name, language } = data;
            if (!uri_1.URI.isUri(resource) || !uri_1.URI.isUri(inputResource)) {
                return undefined;
            }
            const input = interactiveEditorInput_1.$5ib.create(instantiationService, resource, inputResource, name, language);
            return input;
        }
    }
    exports.$MJb = $MJb;
    platform_1.$8m.as(editor_3.$GE.EditorFactory)
        .registerEditorSerializer($MJb.ID, $MJb);
    (0, extensions_1.$mr)(interactiveHistoryService_1.$3ib, interactiveHistoryService_1.$4ib, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(interactiveDocumentService_1.$1ib, interactiveDocumentService_1.$2ib, 1 /* InstantiationType.Delayed */);
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: '_interactive.open',
                title: { value: (0, nls_1.localize)(1, null), original: 'Open Interactive Window' },
                f1: false,
                category: interactiveWindowCategory,
                description: {
                    description: (0, nls_1.localize)(2, null),
                    args: [
                        {
                            name: 'showOptions',
                            description: 'Show Options',
                            schema: {
                                type: 'object',
                                properties: {
                                    'viewColumn': {
                                        type: 'number',
                                        default: -1
                                    },
                                    'preserveFocus': {
                                        type: 'boolean',
                                        default: true
                                    }
                                },
                            }
                        },
                        {
                            name: 'resource',
                            description: 'Interactive resource Uri',
                            isOptional: true
                        },
                        {
                            name: 'controllerId',
                            description: 'Notebook controller Id',
                            isOptional: true
                        },
                        {
                            name: 'title',
                            description: 'Notebook editor title',
                            isOptional: true
                        }
                    ]
                }
            });
        }
        async run(accessor, showOptions, resource, id, title) {
            const editorService = accessor.get(editorService_1.$9C);
            const editorGroupService = accessor.get(editorGroupsService_1.$5C);
            const historyService = accessor.get(interactiveHistoryService_1.$3ib);
            const kernelService = accessor.get(notebookKernelService_1.$Bbb);
            const logService = accessor.get(log_1.$5i);
            const configurationService = accessor.get(configuration_1.$8h);
            const group = (0, editorGroupColumn_1.$4I)(editorGroupService, configurationService, typeof showOptions === 'number' ? showOptions : showOptions?.viewColumn);
            const editorOptions = {
                activation: editor_1.EditorActivation.PRESERVE,
                preserveFocus: typeof showOptions !== 'number' ? (showOptions?.preserveFocus ?? false) : false
            };
            if (resource && (0, resources_1.$gg)(resource) === '.interactive') {
                logService.debug('Open interactive window from resource:', resource.toString());
                const resourceUri = uri_1.URI.revive(resource);
                const editors = editorService.findEditors(resourceUri).filter(id => id.editor instanceof interactiveEditorInput_1.$5ib && id.editor.resource?.toString() === resourceUri.toString());
                if (editors.length) {
                    logService.debug('Find existing interactive window:', resource.toString());
                    const editorInput = editors[0].editor;
                    const currentGroup = editors[0].groupId;
                    const editor = await editorService.openEditor(editorInput, editorOptions, currentGroup);
                    const editorControl = editor?.getControl();
                    return {
                        notebookUri: editorInput.resource,
                        inputUri: editorInput.inputResource,
                        notebookEditorId: editorControl?.notebookEditor?.getId()
                    };
                }
            }
            const existingNotebookDocument = new Set();
            editorService.getEditors(1 /* EditorsOrder.SEQUENTIAL */).forEach(editor => {
                if (editor.editor.resource) {
                    existingNotebookDocument.add(editor.editor.resource.toString());
                }
            });
            let notebookUri = undefined;
            let inputUri = undefined;
            let counter = 1;
            do {
                notebookUri = uri_1.URI.from({ scheme: network_1.Schemas.untitled, path: `/Interactive-${counter}.interactive` });
                inputUri = uri_1.URI.from({ scheme: network_1.Schemas.vscodeInteractiveInput, path: `/InteractiveInput-${counter}` });
                counter++;
            } while (existingNotebookDocument.has(notebookUri.toString()));
            interactiveEditorInput_1.$5ib.setName(notebookUri, title);
            logService.debug('Open new interactive window:', notebookUri.toString(), inputUri.toString());
            if (id) {
                const allKernels = kernelService.getMatchingKernel({ uri: notebookUri, viewType: 'interactive' }).all;
                const preferredKernel = allKernels.find(kernel => kernel.id === id);
                if (preferredKernel) {
                    kernelService.preselectKernelForNotebook(preferredKernel, { uri: notebookUri, viewType: 'interactive' });
                }
            }
            historyService.clearHistory(notebookUri);
            const editorInput = { resource: notebookUri, options: editorOptions };
            const editorPane = await editorService.openEditor(editorInput, group);
            const editorControl = editorPane?.getControl();
            // Extensions must retain references to these URIs to manipulate the interactive editor
            logService.debug('New interactive window opened. Notebook editor id', editorControl?.notebookEditor?.getId());
            return { notebookUri, inputUri, notebookEditorId: editorControl?.notebookEditor?.getId() };
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'interactive.execute',
                title: { value: (0, nls_1.localize)(3, null), original: 'Execute Code' },
                category: interactiveWindowCategory,
                keybinding: {
                    // when: NOTEBOOK_CELL_LIST_FOCUSED,
                    when: contextkey_1.$Ii.equals('activeEditor', 'workbench.editor.interactive'),
                    primary: 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */,
                    win: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */
                    },
                    weight: coreActions_1.$0ob
                },
                menu: [
                    {
                        id: actions_1.$Ru.InteractiveInputExecute
                    }
                ],
                icon: icons.$upb,
                f1: false,
                description: {
                    description: 'Execute the Contents of the Input Box',
                    args: [
                        {
                            name: 'resource',
                            description: 'Interactive resource Uri',
                            isOptional: true
                        }
                    ]
                }
            });
        }
        async run(accessor, context) {
            const editorService = accessor.get(editorService_1.$9C);
            const bulkEditService = accessor.get(bulkEditService_1.$n1);
            const historyService = accessor.get(interactiveHistoryService_1.$3ib);
            const notebookEditorService = accessor.get(notebookEditorService_1.$1rb);
            let editorControl;
            if (context) {
                const resourceUri = uri_1.URI.revive(context);
                const editors = editorService.findEditors(resourceUri)
                    .filter(id => id.editor instanceof interactiveEditorInput_1.$5ib && id.editor.resource?.toString() === resourceUri.toString());
                if (editors.length) {
                    const editorInput = editors[0].editor;
                    const currentGroup = editors[0].groupId;
                    const editor = await editorService.openEditor(editorInput, currentGroup);
                    editorControl = editor?.getControl();
                }
            }
            else {
                editorControl = editorService.activeEditorPane?.getControl();
            }
            if (editorControl && editorControl.notebookEditor && editorControl.codeEditor) {
                const notebookDocument = editorControl.notebookEditor.textModel;
                const textModel = editorControl.codeEditor.getModel();
                const activeKernel = editorControl.notebookEditor.activeKernel;
                const language = activeKernel?.supportedLanguages[0] ?? modesRegistry_1.$Yt;
                if (notebookDocument && textModel) {
                    const index = notebookDocument.length;
                    const value = textModel.getValue();
                    if ((0, strings_1.$me)(value)) {
                        return;
                    }
                    historyService.addToHistory(notebookDocument.uri, '');
                    textModel.setValue('');
                    const collapseState = editorControl.notebookEditor.notebookOptions.getLayoutConfiguration().interactiveWindowCollapseCodeCells === 'fromEditor' ?
                        {
                            inputCollapsed: false,
                            outputCollapsed: false
                        } :
                        undefined;
                    await bulkEditService.apply([
                        new bulkCellEdits_1.$3bb(notebookDocument.uri, {
                            editType: 1 /* CellEditType.Replace */,
                            index: index,
                            count: 0,
                            cells: [{
                                    cellKind: notebookCommon_1.CellKind.Code,
                                    mime: undefined,
                                    language,
                                    source: value,
                                    outputs: [],
                                    metadata: {},
                                    collapseState
                                }]
                        })
                    ]);
                    // reveal the cell into view first
                    const range = { start: index, end: index + 1 };
                    editorControl.notebookEditor.revealCellRangeInView(range);
                    await editorControl.notebookEditor.executeNotebookCells(editorControl.notebookEditor.getCellsInRange({ start: index, end: index + 1 }));
                    // update the selection and focus in the extension host model
                    const editor = notebookEditorService.getNotebookEditor(editorControl.notebookEditor.getId());
                    if (editor) {
                        editor.setSelections([range]);
                        editor.setFocus(range);
                    }
                }
            }
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'interactive.input.clear',
                title: { value: (0, nls_1.localize)(4, null), original: 'Clear the interactive window input editor contents' },
                category: interactiveWindowCategory,
                f1: false
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const editorControl = editorService.activeEditorPane?.getControl();
            if (editorControl && editorControl.notebookEditor && editorControl.codeEditor) {
                const notebookDocument = editorControl.notebookEditor.textModel;
                const textModel = editorControl.codeEditor.getModel();
                const range = editorControl.codeEditor.getModel()?.getFullModelRange();
                if (notebookDocument && textModel && range) {
                    editorControl.codeEditor.executeEdits('', [editOperation_1.$ls.replace(range, null)]);
                }
            }
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'interactive.history.previous',
                title: { value: (0, nls_1.localize)(5, null), original: 'Previous value in history' },
                category: interactiveWindowCategory,
                f1: false,
                keybinding: {
                    when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('activeEditor', 'workbench.editor.interactive'), interactiveCommon_1.$IJb.notEqualsTo('bottom'), interactiveCommon_1.$IJb.notEqualsTo('none'), suggest_1.$V5.Visible.toNegated()),
                    primary: 16 /* KeyCode.UpArrow */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const historyService = accessor.get(interactiveHistoryService_1.$3ib);
            const editorControl = editorService.activeEditorPane?.getControl();
            if (editorControl && editorControl.notebookEditor && editorControl.codeEditor) {
                const notebookDocument = editorControl.notebookEditor.textModel;
                const textModel = editorControl.codeEditor.getModel();
                if (notebookDocument && textModel) {
                    const previousValue = historyService.getPreviousValue(notebookDocument.uri);
                    if (previousValue) {
                        textModel.setValue(previousValue);
                    }
                }
            }
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'interactive.history.next',
                title: { value: (0, nls_1.localize)(6, null), original: 'Next value in history' },
                category: interactiveWindowCategory,
                f1: false,
                keybinding: {
                    when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('activeEditor', 'workbench.editor.interactive'), interactiveCommon_1.$IJb.notEqualsTo('top'), interactiveCommon_1.$IJb.notEqualsTo('none'), suggest_1.$V5.Visible.toNegated()),
                    primary: 18 /* KeyCode.DownArrow */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const historyService = accessor.get(interactiveHistoryService_1.$3ib);
            const editorControl = editorService.activeEditorPane?.getControl();
            if (editorControl && editorControl.notebookEditor && editorControl.codeEditor) {
                const notebookDocument = editorControl.notebookEditor.textModel;
                const textModel = editorControl.codeEditor.getModel();
                if (notebookDocument && textModel) {
                    const previousValue = historyService.getNextValue(notebookDocument.uri);
                    if (previousValue) {
                        textModel.setValue(previousValue);
                    }
                }
            }
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'interactive.scrollToTop',
                title: (0, nls_1.localize)(7, null),
                keybinding: {
                    when: contextkey_1.$Ii.equals('activeEditor', 'workbench.editor.interactive'),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 14 /* KeyCode.Home */,
                    mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */ },
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                category: interactiveWindowCategory,
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const editorControl = editorService.activeEditorPane?.getControl();
            if (editorControl && editorControl.notebookEditor && editorControl.codeEditor) {
                if (editorControl.notebookEditor.getLength() === 0) {
                    return;
                }
                editorControl.notebookEditor.revealCellRangeInView({ start: 0, end: 1 });
            }
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'interactive.scrollToBottom',
                title: (0, nls_1.localize)(8, null),
                keybinding: {
                    when: contextkey_1.$Ii.equals('activeEditor', 'workbench.editor.interactive'),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 13 /* KeyCode.End */,
                    mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */ },
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                category: interactiveWindowCategory,
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const editorControl = editorService.activeEditorPane?.getControl();
            if (editorControl && editorControl.notebookEditor && editorControl.codeEditor) {
                if (editorControl.notebookEditor.getLength() === 0) {
                    return;
                }
                const len = editorControl.notebookEditor.getLength();
                editorControl.notebookEditor.revealCellRangeInView({ start: len - 1, end: len });
            }
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'interactive.input.focus',
                title: { value: (0, nls_1.localize)(9, null), original: 'Focus Input Editor' },
                category: interactiveWindowCategory,
                menu: {
                    id: actions_1.$Ru.CommandPalette,
                    when: notebookContextKeys_1.$Vnb,
                },
                precondition: notebookContextKeys_1.$Vnb,
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const editorControl = editorService.activeEditorPane?.getControl();
            if (editorControl && editorControl.notebookEditor && editorControl.codeEditor) {
                editorService.activeEditorPane?.focus();
            }
            else {
                // find and open the most recent interactive window
                const openEditors = editorService.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */);
                const interactiveWindow = iterator_1.Iterable.find(openEditors, identifier => { return identifier.editor.typeId === interactiveEditorInput_1.$5ib.ID; });
                if (interactiveWindow) {
                    const editorInput = interactiveWindow.editor;
                    const currentGroup = interactiveWindow.groupId;
                    const editor = await editorService.openEditor(editorInput, currentGroup);
                    const editorControl = editor?.getControl();
                    if (editorControl && editorControl.notebookEditor && editorControl.codeEditor) {
                        editorService.activeEditorPane?.focus();
                    }
                }
            }
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'interactive.history.focus',
                title: { value: (0, nls_1.localize)(10, null), original: 'Focus History' },
                category: interactiveWindowCategory,
                menu: {
                    id: actions_1.$Ru.CommandPalette,
                    when: contextkey_1.$Ii.equals('activeEditor', 'workbench.editor.interactive'),
                },
                precondition: contextkey_1.$Ii.equals('activeEditor', 'workbench.editor.interactive'),
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const editorControl = editorService.activeEditorPane?.getControl();
            if (editorControl && editorControl.notebookEditor && editorControl.codeEditor) {
                editorControl.notebookEditor.focus();
            }
        }
    });
    (0, themeService_1.$mv)((theme) => {
        (0, colorRegistry_1.$sv)('interactive.activeCodeBorder', {
            dark: theme.getColor(peekView_1.$M3) ?? '#007acc',
            light: theme.getColor(peekView_1.$M3) ?? '#007acc',
            hcDark: colorRegistry_1.$Av,
            hcLight: colorRegistry_1.$Av
        }, (0, nls_1.localize)(11, null));
        // registerColor('interactive.activeCodeBackground', {
        // 	dark: (theme.getColor(peekViewEditorBackground) ?? Color.fromHex('#001F33')).transparent(0.25),
        // 	light: (theme.getColor(peekViewEditorBackground) ?? Color.fromHex('#F2F8FC')).transparent(0.25),
        // 	hc: Color.black
        // }, localize('interactive.activeCodeBackground', 'The background color for the current interactive code cell when the editor has focus.'));
        (0, colorRegistry_1.$sv)('interactive.inactiveCodeBorder', {
            dark: theme.getColor(colorRegistry_1.$Bx) ?? (0, colorRegistry_1.$1y)(colorRegistry_1.$Bx, 1),
            light: theme.getColor(colorRegistry_1.$Bx) ?? (0, colorRegistry_1.$1y)(colorRegistry_1.$Bx, 1),
            hcDark: theme_1.$M_,
            hcLight: theme_1.$M_
        }, (0, nls_1.localize)(12, null));
        // registerColor('interactive.inactiveCodeBackground', {
        // 	dark: (theme.getColor(peekViewResultsBackground) ?? Color.fromHex('#252526')).transparent(0.25),
        // 	light: (theme.getColor(peekViewResultsBackground) ?? Color.fromHex('#F3F3F3')).transparent(0.25),
        // 	hc: Color.black
        // }, localize('interactive.inactiveCodeBackground', 'The backgorund color for the current interactive code cell when the editor does not have focus.'));
    });
    platform_1.$8m.as(configurationRegistry_1.$an.Configuration).registerConfiguration({
        id: 'interactiveWindow',
        order: 100,
        type: 'object',
        'properties': {
            [interactiveCommon_1.$JJb.interactiveWindowAlwaysScrollOnNewCell]: {
                type: 'boolean',
                default: true,
                markdownDescription: (0, nls_1.localize)(13, null)
            }
        }
    });
});
//# sourceMappingURL=interactive.contribution.js.map