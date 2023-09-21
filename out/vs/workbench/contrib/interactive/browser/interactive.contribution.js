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
define(["require", "exports", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/base/common/marshalling", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/strings", "vs/base/common/types", "vs/base/common/uri", "vs/editor/browser/services/bulkEditService", "vs/editor/common/core/editOperation", "vs/editor/common/languages/modesRegistry", "vs/editor/common/services/model", "vs/editor/common/services/resolverService", "vs/editor/contrib/peekView/browser/peekView", "vs/editor/contrib/suggest/browser/suggest", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/editor/common/editor", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/registry/common/platform", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/browser/editor", "vs/workbench/common/contributions", "vs/workbench/common/editor", "vs/workbench/common/theme", "vs/workbench/contrib/bulkEdit/browser/bulkCellEdits", "vs/workbench/contrib/interactive/browser/interactiveCommon", "vs/workbench/contrib/interactive/browser/interactiveDocumentService", "vs/workbench/contrib/interactive/browser/interactiveEditor", "vs/workbench/contrib/interactive/browser/interactiveEditorInput", "vs/workbench/contrib/interactive/browser/interactiveHistoryService", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/services/editor/common/editorGroupColumn", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/workingCopy/common/workingCopyEditorService"], function (require, exports, iterator_1, lifecycle_1, marshalling_1, network_1, resources_1, strings_1, types_1, uri_1, bulkEditService_1, editOperation_1, modesRegistry_1, model_1, resolverService_1, peekView_1, suggest_1, nls_1, actions_1, configuration_1, configurationRegistry_1, contextkey_1, editor_1, descriptors_1, extensions_1, instantiation_1, log_1, platform_1, colorRegistry_1, themeService_1, editor_2, contributions_1, editor_3, theme_1, bulkCellEdits_1, interactiveCommon_1, interactiveDocumentService_1, interactiveEditor_1, interactiveEditorInput_1, interactiveHistoryService_1, coreActions_1, icons, notebookEditorService_1, notebookCommon_1, notebookContextKeys_1, notebookKernelService_1, notebookService_1, editorGroupColumn_1, editorGroupsService_1, editorResolverService_1, editorService_1, extensions_2, workingCopyEditorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InteractiveEditorSerializer = exports.InteractiveDocumentContribution = void 0;
    const interactiveWindowCategory = { value: (0, nls_1.localize)('interactiveWindow', 'Interactive Window'), original: 'Interactive Window' };
    platform_1.Registry.as(editor_3.EditorExtensions.EditorPane).registerEditorPane(editor_2.EditorPaneDescriptor.create(interactiveEditor_1.InteractiveEditor, notebookCommon_1.INTERACTIVE_WINDOW_EDITOR_ID, 'Interactive Window'), [
        new descriptors_1.SyncDescriptor(interactiveEditorInput_1.InteractiveEditorInput)
    ]);
    let InteractiveDocumentContribution = class InteractiveDocumentContribution extends lifecycle_1.Disposable {
        constructor(notebookService, editorResolverService, editorService, instantiationService) {
            super();
            this.instantiationService = instantiationService;
            const info = notebookService.getContributedNotebookType('interactive');
            // We need to contribute a notebook type for the Interactive Window to provide notebook models.
            if (!info) {
                this._register(notebookService.registerContributedNotebookType('interactive', {
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
                    const editorInput = editorService.getEditors(1 /* EditorsOrder.SEQUENTIAL */).find(editor => editor.editor instanceof interactiveEditorInput_1.InteractiveEditorInput && editor.editor.inputResource.toString() === resource.toString());
                    return editorInput;
                }
            });
            editorResolverService.registerEditor(`*.interactive`, {
                id: 'interactive',
                label: 'Interactive Editor',
                priority: editorResolverService_1.RegisteredEditorPriority.exclusive
            }, {
                canSupportResource: uri => (uri.scheme === network_1.Schemas.untitled && (0, resources_1.extname)(uri) === '.interactive') ||
                    (uri.scheme === network_1.Schemas.vscodeNotebookCell && (0, resources_1.extname)(uri) === '.interactive'),
                singlePerResource: true
            }, {
                createEditorInput: ({ resource, options }) => {
                    const data = notebookCommon_1.CellUri.parse(resource);
                    let cellOptions;
                    if (data) {
                        cellOptions = { resource, options };
                    }
                    const notebookOptions = { ...options, cellOptions };
                    const editorInput = createEditor(resource, this.instantiationService);
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
                    const editorInput = createEditor(resource, this.instantiationService);
                    return {
                        editor: editorInput,
                        options: notebookOptions
                    };
                }
            });
        }
    };
    exports.InteractiveDocumentContribution = InteractiveDocumentContribution;
    exports.InteractiveDocumentContribution = InteractiveDocumentContribution = __decorate([
        __param(0, notebookService_1.INotebookService),
        __param(1, editorResolverService_1.IEditorResolverService),
        __param(2, editorService_1.IEditorService),
        __param(3, instantiation_1.IInstantiationService)
    ], InteractiveDocumentContribution);
    let InteractiveInputContentProvider = class InteractiveInputContentProvider {
        constructor(textModelService, _modelService) {
            this._modelService = _modelService;
            this._registration = textModelService.registerTextModelContentProvider(network_1.Schemas.vscodeInteractiveInput, this);
        }
        dispose() {
            this._registration.dispose();
        }
        async provideTextContent(resource) {
            const existing = this._modelService.getModel(resource);
            if (existing) {
                return existing;
            }
            const result = this._modelService.createModel('', null, resource, false);
            return result;
        }
    };
    InteractiveInputContentProvider = __decorate([
        __param(0, resolverService_1.ITextModelService),
        __param(1, model_1.IModelService)
    ], InteractiveInputContentProvider);
    function createEditor(resource, instantiationService) {
        const counter = /\/Interactive-(\d+)/.exec(resource.path);
        const inputBoxPath = counter && counter[1] ? `/InteractiveInput-${counter[1]}` : 'InteractiveInput';
        const inputUri = uri_1.URI.from({ scheme: network_1.Schemas.vscodeInteractiveInput, path: inputBoxPath });
        const editorInput = interactiveEditorInput_1.InteractiveEditorInput.create(instantiationService, resource, inputUri);
        return editorInput;
    }
    let InteractiveWindowWorkingCopyEditorHandler = class InteractiveWindowWorkingCopyEditorHandler extends lifecycle_1.Disposable {
        constructor(_instantiationService, _workingCopyEditorService, _extensionService) {
            super();
            this._instantiationService = _instantiationService;
            this._workingCopyEditorService = _workingCopyEditorService;
            this._extensionService = _extensionService;
            this._installHandler();
        }
        handles(workingCopy) {
            const viewType = this._getViewType(workingCopy);
            return !!viewType && viewType === 'interactive';
        }
        isOpen(workingCopy, editor) {
            if (!this.handles(workingCopy)) {
                return false;
            }
            return editor instanceof interactiveEditorInput_1.InteractiveEditorInput && (0, resources_1.isEqual)(workingCopy.resource, editor.resource);
        }
        createEditor(workingCopy) {
            return createEditor(workingCopy.resource, this._instantiationService);
        }
        async _installHandler() {
            await this._extensionService.whenInstalledExtensionsRegistered();
            this._register(this._workingCopyEditorService.registerHandler(this));
        }
        _getViewType(workingCopy) {
            return notebookCommon_1.NotebookWorkingCopyTypeIdentifier.parse(workingCopy.typeId);
        }
    };
    InteractiveWindowWorkingCopyEditorHandler = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, workingCopyEditorService_1.IWorkingCopyEditorService),
        __param(2, extensions_2.IExtensionService)
    ], InteractiveWindowWorkingCopyEditorHandler);
    const workbenchContributionsRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(InteractiveDocumentContribution, 2 /* LifecyclePhase.Ready */);
    workbenchContributionsRegistry.registerWorkbenchContribution(InteractiveInputContentProvider, 2 /* LifecyclePhase.Ready */);
    workbenchContributionsRegistry.registerWorkbenchContribution(InteractiveWindowWorkingCopyEditorHandler, 2 /* LifecyclePhase.Ready */);
    class InteractiveEditorSerializer {
        static { this.ID = interactiveEditorInput_1.InteractiveEditorInput.ID; }
        canSerialize(editor) {
            const interactiveEditorInput = editor;
            return uri_1.URI.isUri(interactiveEditorInput?.primary?.resource) && uri_1.URI.isUri(interactiveEditorInput?.inputResource);
        }
        serialize(input) {
            (0, types_1.assertType)(input instanceof interactiveEditorInput_1.InteractiveEditorInput);
            return JSON.stringify({
                resource: input.primary.resource,
                inputResource: input.inputResource,
                name: input.getName(),
                language: input.language
            });
        }
        deserialize(instantiationService, raw) {
            const data = (0, marshalling_1.parse)(raw);
            if (!data) {
                return undefined;
            }
            const { resource, inputResource, name, language } = data;
            if (!uri_1.URI.isUri(resource) || !uri_1.URI.isUri(inputResource)) {
                return undefined;
            }
            const input = interactiveEditorInput_1.InteractiveEditorInput.create(instantiationService, resource, inputResource, name, language);
            return input;
        }
    }
    exports.InteractiveEditorSerializer = InteractiveEditorSerializer;
    platform_1.Registry.as(editor_3.EditorExtensions.EditorFactory)
        .registerEditorSerializer(InteractiveEditorSerializer.ID, InteractiveEditorSerializer);
    (0, extensions_1.registerSingleton)(interactiveHistoryService_1.IInteractiveHistoryService, interactiveHistoryService_1.InteractiveHistoryService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(interactiveDocumentService_1.IInteractiveDocumentService, interactiveDocumentService_1.InteractiveDocumentService, 1 /* InstantiationType.Delayed */);
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: '_interactive.open',
                title: { value: (0, nls_1.localize)('interactive.open', "Open Interactive Window"), original: 'Open Interactive Window' },
                f1: false,
                category: interactiveWindowCategory,
                description: {
                    description: (0, nls_1.localize)('interactive.open', "Open Interactive Window"),
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
            const editorService = accessor.get(editorService_1.IEditorService);
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const historyService = accessor.get(interactiveHistoryService_1.IInteractiveHistoryService);
            const kernelService = accessor.get(notebookKernelService_1.INotebookKernelService);
            const logService = accessor.get(log_1.ILogService);
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const group = (0, editorGroupColumn_1.columnToEditorGroup)(editorGroupService, configurationService, typeof showOptions === 'number' ? showOptions : showOptions?.viewColumn);
            const editorOptions = {
                activation: editor_1.EditorActivation.PRESERVE,
                preserveFocus: typeof showOptions !== 'number' ? (showOptions?.preserveFocus ?? false) : false
            };
            if (resource && (0, resources_1.extname)(resource) === '.interactive') {
                logService.debug('Open interactive window from resource:', resource.toString());
                const resourceUri = uri_1.URI.revive(resource);
                const editors = editorService.findEditors(resourceUri).filter(id => id.editor instanceof interactiveEditorInput_1.InteractiveEditorInput && id.editor.resource?.toString() === resourceUri.toString());
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
            interactiveEditorInput_1.InteractiveEditorInput.setName(notebookUri, title);
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
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'interactive.execute',
                title: { value: (0, nls_1.localize)('interactive.execute', "Execute Code"), original: 'Execute Code' },
                category: interactiveWindowCategory,
                keybinding: {
                    // when: NOTEBOOK_CELL_LIST_FOCUSED,
                    when: contextkey_1.ContextKeyExpr.equals('activeEditor', 'workbench.editor.interactive'),
                    primary: 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */,
                    win: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */
                    },
                    weight: coreActions_1.NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
                },
                menu: [
                    {
                        id: actions_1.MenuId.InteractiveInputExecute
                    }
                ],
                icon: icons.executeIcon,
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
            const editorService = accessor.get(editorService_1.IEditorService);
            const bulkEditService = accessor.get(bulkEditService_1.IBulkEditService);
            const historyService = accessor.get(interactiveHistoryService_1.IInteractiveHistoryService);
            const notebookEditorService = accessor.get(notebookEditorService_1.INotebookEditorService);
            let editorControl;
            if (context) {
                const resourceUri = uri_1.URI.revive(context);
                const editors = editorService.findEditors(resourceUri)
                    .filter(id => id.editor instanceof interactiveEditorInput_1.InteractiveEditorInput && id.editor.resource?.toString() === resourceUri.toString());
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
                const language = activeKernel?.supportedLanguages[0] ?? modesRegistry_1.PLAINTEXT_LANGUAGE_ID;
                if (notebookDocument && textModel) {
                    const index = notebookDocument.length;
                    const value = textModel.getValue();
                    if ((0, strings_1.isFalsyOrWhitespace)(value)) {
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
                        new bulkCellEdits_1.ResourceNotebookCellEdit(notebookDocument.uri, {
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
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'interactive.input.clear',
                title: { value: (0, nls_1.localize)('interactive.input.clear', "Clear the interactive window input editor contents"), original: 'Clear the interactive window input editor contents' },
                category: interactiveWindowCategory,
                f1: false
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const editorControl = editorService.activeEditorPane?.getControl();
            if (editorControl && editorControl.notebookEditor && editorControl.codeEditor) {
                const notebookDocument = editorControl.notebookEditor.textModel;
                const textModel = editorControl.codeEditor.getModel();
                const range = editorControl.codeEditor.getModel()?.getFullModelRange();
                if (notebookDocument && textModel && range) {
                    editorControl.codeEditor.executeEdits('', [editOperation_1.EditOperation.replace(range, null)]);
                }
            }
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'interactive.history.previous',
                title: { value: (0, nls_1.localize)('interactive.history.previous', "Previous value in history"), original: 'Previous value in history' },
                category: interactiveWindowCategory,
                f1: false,
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('activeEditor', 'workbench.editor.interactive'), interactiveCommon_1.INTERACTIVE_INPUT_CURSOR_BOUNDARY.notEqualsTo('bottom'), interactiveCommon_1.INTERACTIVE_INPUT_CURSOR_BOUNDARY.notEqualsTo('none'), suggest_1.Context.Visible.toNegated()),
                    primary: 16 /* KeyCode.UpArrow */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const historyService = accessor.get(interactiveHistoryService_1.IInteractiveHistoryService);
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
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'interactive.history.next',
                title: { value: (0, nls_1.localize)('interactive.history.next', "Next value in history"), original: 'Next value in history' },
                category: interactiveWindowCategory,
                f1: false,
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('activeEditor', 'workbench.editor.interactive'), interactiveCommon_1.INTERACTIVE_INPUT_CURSOR_BOUNDARY.notEqualsTo('top'), interactiveCommon_1.INTERACTIVE_INPUT_CURSOR_BOUNDARY.notEqualsTo('none'), suggest_1.Context.Visible.toNegated()),
                    primary: 18 /* KeyCode.DownArrow */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const historyService = accessor.get(interactiveHistoryService_1.IInteractiveHistoryService);
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
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'interactive.scrollToTop',
                title: (0, nls_1.localize)('interactiveScrollToTop', 'Scroll to Top'),
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.equals('activeEditor', 'workbench.editor.interactive'),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 14 /* KeyCode.Home */,
                    mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */ },
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                category: interactiveWindowCategory,
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const editorControl = editorService.activeEditorPane?.getControl();
            if (editorControl && editorControl.notebookEditor && editorControl.codeEditor) {
                if (editorControl.notebookEditor.getLength() === 0) {
                    return;
                }
                editorControl.notebookEditor.revealCellRangeInView({ start: 0, end: 1 });
            }
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'interactive.scrollToBottom',
                title: (0, nls_1.localize)('interactiveScrollToBottom', 'Scroll to Bottom'),
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.equals('activeEditor', 'workbench.editor.interactive'),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 13 /* KeyCode.End */,
                    mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */ },
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                category: interactiveWindowCategory,
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
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
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'interactive.input.focus',
                title: { value: (0, nls_1.localize)('interactive.input.focus', "Focus Input Editor"), original: 'Focus Input Editor' },
                category: interactiveWindowCategory,
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: notebookContextKeys_1.InteractiveWindowOpen,
                },
                precondition: notebookContextKeys_1.InteractiveWindowOpen,
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const editorControl = editorService.activeEditorPane?.getControl();
            if (editorControl && editorControl.notebookEditor && editorControl.codeEditor) {
                editorService.activeEditorPane?.focus();
            }
            else {
                // find and open the most recent interactive window
                const openEditors = editorService.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */);
                const interactiveWindow = iterator_1.Iterable.find(openEditors, identifier => { return identifier.editor.typeId === interactiveEditorInput_1.InteractiveEditorInput.ID; });
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
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'interactive.history.focus',
                title: { value: (0, nls_1.localize)('interactive.history.focus', "Focus History"), original: 'Focus History' },
                category: interactiveWindowCategory,
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyExpr.equals('activeEditor', 'workbench.editor.interactive'),
                },
                precondition: contextkey_1.ContextKeyExpr.equals('activeEditor', 'workbench.editor.interactive'),
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const editorControl = editorService.activeEditorPane?.getControl();
            if (editorControl && editorControl.notebookEditor && editorControl.codeEditor) {
                editorControl.notebookEditor.focus();
            }
        }
    });
    (0, themeService_1.registerThemingParticipant)((theme) => {
        (0, colorRegistry_1.registerColor)('interactive.activeCodeBorder', {
            dark: theme.getColor(peekView_1.peekViewBorder) ?? '#007acc',
            light: theme.getColor(peekView_1.peekViewBorder) ?? '#007acc',
            hcDark: colorRegistry_1.contrastBorder,
            hcLight: colorRegistry_1.contrastBorder
        }, (0, nls_1.localize)('interactive.activeCodeBorder', 'The border color for the current interactive code cell when the editor has focus.'));
        // registerColor('interactive.activeCodeBackground', {
        // 	dark: (theme.getColor(peekViewEditorBackground) ?? Color.fromHex('#001F33')).transparent(0.25),
        // 	light: (theme.getColor(peekViewEditorBackground) ?? Color.fromHex('#F2F8FC')).transparent(0.25),
        // 	hc: Color.black
        // }, localize('interactive.activeCodeBackground', 'The background color for the current interactive code cell when the editor has focus.'));
        (0, colorRegistry_1.registerColor)('interactive.inactiveCodeBorder', {
            dark: theme.getColor(colorRegistry_1.listInactiveSelectionBackground) ?? (0, colorRegistry_1.transparent)(colorRegistry_1.listInactiveSelectionBackground, 1),
            light: theme.getColor(colorRegistry_1.listInactiveSelectionBackground) ?? (0, colorRegistry_1.transparent)(colorRegistry_1.listInactiveSelectionBackground, 1),
            hcDark: theme_1.PANEL_BORDER,
            hcLight: theme_1.PANEL_BORDER
        }, (0, nls_1.localize)('interactive.inactiveCodeBorder', 'The border color for the current interactive code cell when the editor does not have focus.'));
        // registerColor('interactive.inactiveCodeBackground', {
        // 	dark: (theme.getColor(peekViewResultsBackground) ?? Color.fromHex('#252526')).transparent(0.25),
        // 	light: (theme.getColor(peekViewResultsBackground) ?? Color.fromHex('#F3F3F3')).transparent(0.25),
        // 	hc: Color.black
        // }, localize('interactive.inactiveCodeBackground', 'The backgorund color for the current interactive code cell when the editor does not have focus.'));
    });
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        id: 'interactiveWindow',
        order: 100,
        type: 'object',
        'properties': {
            [interactiveCommon_1.InteractiveWindowSetting.interactiveWindowAlwaysScrollOnNewCell]: {
                type: 'boolean',
                default: true,
                markdownDescription: (0, nls_1.localize)('interactiveWindow.alwaysScrollOnNewCell', "Automatically scroll the interactive window to show the output of the last statement executed. If this value is false, the window will only scroll if the last cell was already the one scrolled to.")
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJhY3RpdmUuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvaW50ZXJhY3RpdmUvYnJvd3Nlci9pbnRlcmFjdGl2ZS5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBZ0VoRyxNQUFNLHlCQUF5QixHQUFxQixFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxtQkFBbUIsRUFBRSxvQkFBb0IsQ0FBQyxFQUFFLFFBQVEsRUFBRSxvQkFBb0IsRUFBRSxDQUFDO0lBRW5KLG1CQUFRLENBQUMsRUFBRSxDQUFzQix5QkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxrQkFBa0IsQ0FDL0UsNkJBQW9CLENBQUMsTUFBTSxDQUMxQixxQ0FBaUIsRUFDakIsNkNBQTRCLEVBQzVCLG9CQUFvQixDQUNwQixFQUNEO1FBQ0MsSUFBSSw0QkFBYyxDQUFDLCtDQUFzQixDQUFDO0tBQzFDLENBQ0QsQ0FBQztJQUVLLElBQU0sK0JBQStCLEdBQXJDLE1BQU0sK0JBQWdDLFNBQVEsc0JBQVU7UUFDOUQsWUFDbUIsZUFBaUMsRUFDM0IscUJBQTZDLEVBQ3JELGFBQTZCLEVBQ0wsb0JBQTJDO1lBRW5GLEtBQUssRUFBRSxDQUFDO1lBRmdDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFJbkYsTUFBTSxJQUFJLEdBQUcsZUFBZSxDQUFDLDBCQUEwQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRXZFLCtGQUErRjtZQUMvRixJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNWLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLCtCQUErQixDQUFDLGFBQWEsRUFBRTtvQkFDN0UsbUJBQW1CLEVBQUUsc0JBQXNCO29CQUMzQyxXQUFXLEVBQUUsYUFBYTtvQkFDMUIsZUFBZSxFQUFFLENB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