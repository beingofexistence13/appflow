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
define(["require", "exports", "vs/base/common/network", "vs/base/common/lifecycle", "vs/base/common/marshalling", "vs/base/common/resources", "vs/base/common/types", "vs/base/common/uri", "vs/base/common/jsonFormatter", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/editor/common/services/resolverService", "vs/nls", "vs/platform/configuration/common/configurationRegistry", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/workbench/browser/editor", "vs/workbench/common/contributions", "vs/workbench/common/editor", "vs/workbench/contrib/notebook/browser/notebookEditor", "vs/workbench/contrib/notebook/common/notebookEditorInput", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/contrib/notebook/browser/services/notebookServiceImpl", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/services/editor/common/editorService", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/contrib/notebook/common/notebookEditorModelResolverService", "vs/workbench/contrib/notebook/common/notebookDiffEditorInput", "vs/workbench/contrib/notebook/browser/diff/notebookDiffEditor", "vs/workbench/contrib/notebook/common/services/notebookWorkerService", "vs/workbench/contrib/notebook/browser/services/notebookWorkerServiceImpl", "vs/workbench/contrib/notebook/common/notebookCellStatusBarService", "vs/workbench/contrib/notebook/browser/services/notebookCellStatusBarServiceImpl", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/contrib/notebook/browser/services/notebookEditorServiceImpl", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/base/common/event", "vs/workbench/contrib/notebook/browser/diff/diffElementViewModel", "vs/workbench/contrib/notebook/common/notebookEditorModelResolverServiceImpl", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/workbench/contrib/notebook/browser/services/notebookKernelServiceImpl", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/workingCopy/common/workingCopyEditorService", "vs/platform/configuration/common/configuration", "vs/platform/label/common/label", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/contrib/notebook/browser/services/notebookRendererMessagingServiceImpl", "vs/workbench/contrib/notebook/common/notebookRendererMessagingService", "vs/editor/common/config/editorOptions", "vs/workbench/contrib/notebook/browser/services/notebookExecutionStateServiceImpl", "vs/workbench/contrib/notebook/browser/services/notebookExecutionServiceImpl", "vs/workbench/contrib/notebook/common/notebookExecutionService", "vs/workbench/contrib/notebook/common/notebookKeymapService", "vs/workbench/contrib/notebook/browser/services/notebookKeymapServiceImpl", "vs/editor/common/languages/modesRegistry", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/editor/common/services/languageFeatures", "vs/workbench/contrib/comments/browser/commentReply", "vs/editor/browser/services/codeEditorService", "vs/workbench/contrib/notebook/browser/services/notebookKernelHistoryServiceImpl", "vs/workbench/contrib/notebook/common/notebookLoggingService", "vs/workbench/contrib/notebook/browser/services/notebookLoggingServiceImpl", "vs/platform/product/common/product", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/browser/notebookAccessibility", "vs/workbench/contrib/accessibility/browser/accessibleView", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/accessibility/browser/accessibleViewActions", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/browser/controller/insertCellActions", "vs/workbench/contrib/notebook/browser/controller/executeActions", "vs/workbench/contrib/notebook/browser/controller/layoutActions", "vs/workbench/contrib/notebook/browser/controller/editActions", "vs/workbench/contrib/notebook/browser/controller/cellOutputActions", "vs/workbench/contrib/notebook/browser/controller/apiActions", "vs/workbench/contrib/notebook/browser/controller/foldingController", "vs/workbench/contrib/notebook/browser/contrib/editorHint/emptyCellEditorHint", "vs/workbench/contrib/notebook/browser/contrib/clipboard/notebookClipboard", "vs/workbench/contrib/notebook/browser/contrib/find/notebookFind", "vs/workbench/contrib/notebook/browser/contrib/format/formatting", "vs/workbench/contrib/notebook/browser/contrib/saveParticipants/saveParticipants", "vs/workbench/contrib/notebook/browser/contrib/gettingStarted/notebookGettingStarted", "vs/workbench/contrib/notebook/browser/contrib/layout/layoutActions", "vs/workbench/contrib/notebook/browser/contrib/marker/markerProvider", "vs/workbench/contrib/notebook/browser/contrib/navigation/arrow", "vs/workbench/contrib/notebook/browser/contrib/outline/notebookOutline", "vs/workbench/contrib/notebook/browser/contrib/profile/notebookProfile", "vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/statusBarProviders", "vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/contributedStatusBarItemController", "vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/executionStatusBarItemController", "vs/workbench/contrib/notebook/browser/contrib/editorStatusBar/editorStatusBar", "vs/workbench/contrib/notebook/browser/contrib/undoRedo/notebookUndoRedo", "vs/workbench/contrib/notebook/browser/contrib/cellCommands/cellCommands", "vs/workbench/contrib/notebook/browser/contrib/viewportWarmup/viewportWarmup", "vs/workbench/contrib/notebook/browser/contrib/troubleshoot/layout", "vs/workbench/contrib/notebook/browser/contrib/debug/notebookBreakpoints", "vs/workbench/contrib/notebook/browser/contrib/debug/notebookCellPausing", "vs/workbench/contrib/notebook/browser/contrib/debug/notebookDebugDecorations", "vs/workbench/contrib/notebook/browser/contrib/execute/executionEditorProgress", "vs/workbench/contrib/notebook/browser/contrib/kernelDetection/notebookKernelDetection", "vs/workbench/contrib/notebook/browser/diff/notebookDiffActions"], function (require, exports, network_1, lifecycle_1, marshalling_1, resources_1, types_1, uri_1, jsonFormatter_1, model_1, language_1, resolverService_1, nls, configurationRegistry_1, descriptors_1, extensions_1, instantiation_1, platform_1, editor_1, contributions_1, editor_2, notebookEditor_1, notebookEditorInput_1, notebookService_1, notebookServiceImpl_1, notebookCommon_1, editorService_1, undoRedo_1, notebookEditorModelResolverService_1, notebookDiffEditorInput_1, notebookDiffEditor_1, notebookWorkerService_1, notebookWorkerServiceImpl_1, notebookCellStatusBarService_1, notebookCellStatusBarServiceImpl_1, notebookEditorService_1, notebookEditorServiceImpl_1, jsonContributionRegistry_1, event_1, diffElementViewModel_1, notebookEditorModelResolverServiceImpl_1, notebookKernelService_1, notebookKernelServiceImpl_1, extensions_2, workingCopyEditorService_1, configuration_1, label_1, editorGroupsService_1, notebookRendererMessagingServiceImpl_1, notebookRendererMessagingService_1, editorOptions_1, notebookExecutionStateServiceImpl_1, notebookExecutionServiceImpl_1, notebookExecutionService_1, notebookKeymapService_1, notebookKeymapServiceImpl_1, modesRegistry_1, notebookExecutionStateService_1, languageFeatures_1, commentReply_1, codeEditorService_1, notebookKernelHistoryServiceImpl_1, notebookLoggingService_1, notebookLoggingServiceImpl_1, product_1, notebookContextKeys_1, notebookAccessibility_1, accessibleView_1, contextkey_1, accessibleViewActions_1) {
    "use strict";
    var NotebookContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookContribution = void 0;
    /*--------------------------------------------------------------------------------------------- */
    platform_1.Registry.as(editor_2.EditorExtensions.EditorPane).registerEditorPane(editor_1.EditorPaneDescriptor.create(notebookEditor_1.NotebookEditor, notebookEditor_1.NotebookEditor.ID, 'Notebook Editor'), [
        new descriptors_1.SyncDescriptor(notebookEditorInput_1.NotebookEditorInput)
    ]);
    platform_1.Registry.as(editor_2.EditorExtensions.EditorPane).registerEditorPane(editor_1.EditorPaneDescriptor.create(notebookDiffEditor_1.NotebookTextDiffEditor, notebookDiffEditor_1.NotebookTextDiffEditor.ID, 'Notebook Diff Editor'), [
        new descriptors_1.SyncDescriptor(notebookDiffEditorInput_1.NotebookDiffEditorInput)
    ]);
    class NotebookDiffEditorSerializer {
        canSerialize() {
            return true;
        }
        serialize(input) {
            (0, types_1.assertType)(input instanceof notebookDiffEditorInput_1.NotebookDiffEditorInput);
            return JSON.stringify({
                resource: input.resource,
                originalResource: input.original.resource,
                name: input.getName(),
                originalName: input.original.getName(),
                textDiffName: input.getName(),
                viewType: input.viewType,
            });
        }
        deserialize(instantiationService, raw) {
            const data = (0, marshalling_1.parse)(raw);
            if (!data) {
                return undefined;
            }
            const { resource, originalResource, name, viewType } = data;
            if (!data || !uri_1.URI.isUri(resource) || !uri_1.URI.isUri(originalResource) || typeof name !== 'string' || typeof viewType !== 'string') {
                return undefined;
            }
            const input = notebookDiffEditorInput_1.NotebookDiffEditorInput.create(instantiationService, resource, name, undefined, originalResource, viewType);
            return input;
        }
        static canResolveBackup(editorInput, backupResource) {
            return false;
        }
    }
    class NotebookEditorSerializer {
        canSerialize() {
            return true;
        }
        serialize(input) {
            (0, types_1.assertType)(input instanceof notebookEditorInput_1.NotebookEditorInput);
            const data = {
                resource: input.resource,
                viewType: input.viewType,
                options: input.options
            };
            return JSON.stringify(data);
        }
        deserialize(instantiationService, raw) {
            const data = (0, marshalling_1.parse)(raw);
            if (!data) {
                return undefined;
            }
            const { resource, viewType, options } = data;
            if (!data || !uri_1.URI.isUri(resource) || typeof viewType !== 'string') {
                return undefined;
            }
            const input = notebookEditorInput_1.NotebookEditorInput.create(instantiationService, resource, viewType, options);
            return input;
        }
    }
    platform_1.Registry.as(editor_2.EditorExtensions.EditorFactory).registerEditorSerializer(notebookEditorInput_1.NotebookEditorInput.ID, NotebookEditorSerializer);
    platform_1.Registry.as(editor_2.EditorExtensions.EditorFactory).registerEditorSerializer(notebookDiffEditorInput_1.NotebookDiffEditorInput.ID, NotebookDiffEditorSerializer);
    let NotebookContribution = NotebookContribution_1 = class NotebookContribution extends lifecycle_1.Disposable {
        constructor(undoRedoService, configurationService, codeEditorService) {
            super();
            this.codeEditorService = codeEditorService;
            this.updateCellUndoRedoComparisonKey(configurationService, undoRedoService);
            // Watch for changes to undoRedoPerCell setting
            this._register(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(notebookCommon_1.NotebookSetting.undoRedoPerCell)) {
                    this.updateCellUndoRedoComparisonKey(configurationService, undoRedoService);
                }
            }));
            // register comment decoration
            this.codeEditorService.registerDecorationType('comment-controller', commentReply_1.COMMENTEDITOR_DECORATION_KEY, {});
        }
        // Add or remove the cell undo redo comparison key based on the user setting
        updateCellUndoRedoComparisonKey(configurationService, undoRedoService) {
            const undoRedoPerCell = configurationService.getValue(notebookCommon_1.NotebookSetting.undoRedoPerCell);
            if (!undoRedoPerCell) {
                // Add comparison key to map cell => main document
                if (!this._uriComparisonKeyComputer) {
                    this._uriComparisonKeyComputer = undoRedoService.registerUriComparisonKeyComputer(notebookCommon_1.CellUri.scheme, {
                        getComparisonKey: (uri) => {
                            if (undoRedoPerCell) {
                                return uri.toString();
                            }
                            return NotebookContribution_1._getCellUndoRedoComparisonKey(uri);
                        }
                    });
                }
            }
            else {
                // Dispose comparison key
                this._uriComparisonKeyComputer?.dispose();
                this._uriComparisonKeyComputer = undefined;
            }
        }
        static _getCellUndoRedoComparisonKey(uri) {
            const data = notebookCommon_1.CellUri.parse(uri);
            if (!data) {
                return uri.toString();
            }
            return data.notebook.toString();
        }
        dispose() {
            super.dispose();
            this._uriComparisonKeyComputer?.dispose();
        }
    };
    exports.NotebookContribution = NotebookContribution;
    exports.NotebookContribution = NotebookContribution = NotebookContribution_1 = __decorate([
        __param(0, undoRedo_1.IUndoRedoService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, codeEditorService_1.ICodeEditorService)
    ], NotebookContribution);
    let CellContentProvider = class CellContentProvider {
        constructor(textModelService, _modelService, _languageService, _notebookModelResolverService) {
            this._modelService = _modelService;
            this._languageService = _languageService;
            this._notebookModelResolverService = _notebookModelResolverService;
            this._registration = textModelService.registerTextModelContentProvider(notebookCommon_1.CellUri.scheme, this);
        }
        dispose() {
            this._registration.dispose();
        }
        async provideTextContent(resource) {
            const existing = this._modelService.getModel(resource);
            if (existing) {
                return existing;
            }
            const data = notebookCommon_1.CellUri.parse(resource);
            // const data = parseCellUri(resource);
            if (!data) {
                return null;
            }
            const ref = await this._notebookModelResolverService.resolve(data.notebook);
            let result = null;
            if (!ref.object.isResolved()) {
                return null;
            }
            for (const cell of ref.object.notebook.cells) {
                if (cell.uri.toString() === resource.toString()) {
                    const bufferFactory = {
                        create: (defaultEOL) => {
                            const newEOL = (defaultEOL === 2 /* DefaultEndOfLine.CRLF */ ? '\r\n' : '\n');
                            cell.textBuffer.setEOL(newEOL);
                            return { textBuffer: cell.textBuffer, disposable: lifecycle_1.Disposable.None };
                        },
                        getFirstLineText: (limit) => {
                            return cell.textBuffer.getLineContent(1).substring(0, limit);
                        }
                    };
                    const languageId = this._languageService.getLanguageIdByLanguageName(cell.language);
                    const languageSelection = languageId ? this._languageService.createById(languageId) : (cell.cellKind === notebookCommon_1.CellKind.Markup ? this._languageService.createById('markdown') : this._languageService.createByFilepathOrFirstLine(resource, cell.textBuffer.getLineContent(1)));
                    result = this._modelService.createModel(bufferFactory, languageSelection, resource);
                    break;
                }
            }
            if (!result) {
                ref.dispose();
                return null;
            }
            const once = event_1.Event.any(result.onWillDispose, ref.object.notebook.onWillDispose)(() => {
                once.dispose();
                ref.dispose();
            });
            return result;
        }
    };
    CellContentProvider = __decorate([
        __param(0, resolverService_1.ITextModelService),
        __param(1, model_1.IModelService),
        __param(2, language_1.ILanguageService),
        __param(3, notebookEditorModelResolverService_1.INotebookEditorModelResolverService)
    ], CellContentProvider);
    let CellInfoContentProvider = class CellInfoContentProvider {
        constructor(textModelService, _modelService, _languageService, _labelService, _notebookModelResolverService) {
            this._modelService = _modelService;
            this._languageService = _languageService;
            this._labelService = _labelService;
            this._notebookModelResolverService = _notebookModelResolverService;
            this._disposables = [];
            this._disposables.push(textModelService.registerTextModelContentProvider(network_1.Schemas.vscodeNotebookCellMetadata, {
                provideTextContent: this.provideMetadataTextContent.bind(this)
            }));
            this._disposables.push(textModelService.registerTextModelContentProvider(network_1.Schemas.vscodeNotebookCellOutput, {
                provideTextContent: this.provideOutputTextContent.bind(this)
            }));
            this._disposables.push(this._labelService.registerFormatter({
                scheme: network_1.Schemas.vscodeNotebookCellMetadata,
                formatting: {
                    label: '${path} (metadata)',
                    separator: '/'
                }
            }));
            this._disposables.push(this._labelService.registerFormatter({
                scheme: network_1.Schemas.vscodeNotebookCellOutput,
                formatting: {
                    label: '${path} (output)',
                    separator: '/'
                }
            }));
        }
        dispose() {
            (0, lifecycle_1.dispose)(this._disposables);
        }
        async provideMetadataTextContent(resource) {
            const existing = this._modelService.getModel(resource);
            if (existing) {
                return existing;
            }
            const data = notebookCommon_1.CellUri.parseCellPropertyUri(resource, network_1.Schemas.vscodeNotebookCellMetadata);
            if (!data) {
                return null;
            }
            const ref = await this._notebookModelResolverService.resolve(data.notebook);
            let result = null;
            const mode = this._languageService.createById('json');
            for (const cell of ref.object.notebook.cells) {
                if (cell.handle === data.handle) {
                    const metadataSource = (0, diffElementViewModel_1.getFormattedMetadataJSON)(ref.object.notebook, cell.metadata, cell.language);
                    result = this._modelService.createModel(metadataSource, mode, resource);
                    break;
                }
            }
            if (!result) {
                ref.dispose();
                return null;
            }
            const once = result.onWillDispose(() => {
                once.dispose();
                ref.dispose();
            });
            return result;
        }
        parseStreamOutput(op) {
            if (!op) {
                return;
            }
            const streamOutputData = (0, diffElementViewModel_1.getStreamOutputData)(op.outputs);
            if (streamOutputData) {
                return {
                    content: streamOutputData,
                    mode: this._languageService.createById(modesRegistry_1.PLAINTEXT_LANGUAGE_ID)
                };
            }
            return;
        }
        _getResult(data, cell) {
            let result = undefined;
            const mode = this._languageService.createById('json');
            const op = cell.outputs.find(op => op.outputId === data.outputId || op.alternativeOutputId === data.outputId);
            const streamOutputData = this.parseStreamOutput(op);
            if (streamOutputData) {
                result = streamOutputData;
                return result;
            }
            const obj = cell.outputs.map(output => ({
                metadata: output.metadata,
                outputItems: output.outputs.map(opit => ({
                    mimeType: opit.mime,
                    data: opit.data.toString()
                }))
            }));
            const outputSource = (0, jsonFormatter_1.toFormattedString)(obj, {});
            result = {
                content: outputSource,
                mode
            };
            return result;
        }
        async provideOutputTextContent(resource) {
            const existing = this._modelService.getModel(resource);
            if (existing) {
                return existing;
            }
            const data = notebookCommon_1.CellUri.parseCellOutputUri(resource);
            if (!data) {
                return null;
            }
            const ref = await this._notebookModelResolverService.resolve(data.notebook);
            const cell = ref.object.notebook.cells.find(cell => !!cell.outputs.find(op => op.outputId === data.outputId || op.alternativeOutputId === data.outputId));
            if (!cell) {
                ref.dispose();
                return null;
            }
            const result = this._getResult(data, cell);
            if (!result) {
                ref.dispose();
                return null;
            }
            const model = this._modelService.createModel(result.content, result.mode, resource);
            const cellModelListener = event_1.Event.any(cell.onDidChangeOutputs ?? event_1.Event.None, cell.onDidChangeOutputItems ?? event_1.Event.None)(() => {
                const newResult = this._getResult(data, cell);
                if (!newResult) {
                    return;
                }
                model.setValue(newResult.content);
                model.setLanguage(newResult.mode.languageId);
            });
            const once = model.onWillDispose(() => {
                once.dispose();
                cellModelListener.dispose();
                ref.dispose();
            });
            return model;
        }
    };
    CellInfoContentProvider = __decorate([
        __param(0, resolverService_1.ITextModelService),
        __param(1, model_1.IModelService),
        __param(2, language_1.ILanguageService),
        __param(3, label_1.ILabelService),
        __param(4, notebookEditorModelResolverService_1.INotebookEditorModelResolverService)
    ], CellInfoContentProvider);
    class RegisterSchemasContribution extends lifecycle_1.Disposable {
        constructor() {
            super();
            this.registerMetadataSchemas();
        }
        registerMetadataSchemas() {
            const jsonRegistry = platform_1.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
            const metadataSchema = {
                properties: {
                    ['language']: {
                        type: 'string',
                        description: 'The language for the cell'
                    }
                },
                // patternProperties: allSettings.patternProperties,
                additionalProperties: true,
                allowTrailingCommas: true,
                allowComments: true
            };
            jsonRegistry.registerSchema('vscode://schemas/notebook/cellmetadata', metadataSchema);
        }
    }
    let NotebookEditorManager = class NotebookEditorManager {
        constructor(_editorService, _notebookEditorModelService, editorGroups) {
            this._editorService = _editorService;
            this._notebookEditorModelService = _notebookEditorModelService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._disposables.add(event_1.Event.debounce(this._notebookEditorModelService.onDidChangeDirty, (last, current) => !last ? [current] : [...last, current], 100)(this._openMissingDirtyNotebookEditors, this));
            // CLOSE editors when we are about to open conflicting notebooks
            this._disposables.add(_notebookEditorModelService.onWillFailWithConflict(e => {
                for (const group of editorGroups.groups) {
                    const conflictInputs = group.editors.filter(input => input instanceof notebookEditorInput_1.NotebookEditorInput && input.viewType !== e.viewType && (0, resources_1.isEqual)(input.resource, e.resource));
                    const p = group.closeEditors(conflictInputs);
                    e.waitUntil(p);
                }
            }));
        }
        dispose() {
            this._disposables.dispose();
        }
        _openMissingDirtyNotebookEditors(models) {
            const result = [];
            for (const model of models) {
                if (model.isDirty() && !this._editorService.isOpened({ resource: model.resource, typeId: notebookEditorInput_1.NotebookEditorInput.ID, editorId: model.viewType }) && (0, resources_1.extname)(model.resource) !== '.interactive') {
                    result.push({
                        resource: model.resource,
                        options: { inactive: true, preserveFocus: true, pinned: true, override: model.viewType }
                    });
                }
            }
            if (result.length > 0) {
                this._editorService.openEditors(result);
            }
        }
    };
    NotebookEditorManager = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, notebookEditorModelResolverService_1.INotebookEditorModelResolverService),
        __param(2, editorGroupsService_1.IEditorGroupsService)
    ], NotebookEditorManager);
    let SimpleNotebookWorkingCopyEditorHandler = class SimpleNotebookWorkingCopyEditorHandler extends lifecycle_1.Disposable {
        constructor(_instantiationService, _workingCopyEditorService, _extensionService, _notebookService) {
            super();
            this._instantiationService = _instantiationService;
            this._workingCopyEditorService = _workingCopyEditorService;
            this._extensionService = _extensionService;
            this._notebookService = _notebookService;
            this._installHandler();
        }
        async handles(workingCopy) {
            const viewType = this.handlesSync(workingCopy);
            if (!viewType) {
                return false;
            }
            return this._notebookService.canResolve(viewType);
        }
        handlesSync(workingCopy) {
            const viewType = this._getViewType(workingCopy);
            if (!viewType || viewType === 'interactive') {
                return undefined;
            }
            return viewType;
        }
        isOpen(workingCopy, editor) {
            if (!this.handlesSync(workingCopy)) {
                return false;
            }
            return editor instanceof notebookEditorInput_1.NotebookEditorInput && editor.viewType === this._getViewType(workingCopy) && (0, resources_1.isEqual)(workingCopy.resource, editor.resource);
        }
        createEditor(workingCopy) {
            return notebookEditorInput_1.NotebookEditorInput.create(this._instantiationService, workingCopy.resource, this._getViewType(workingCopy));
        }
        async _installHandler() {
            await this._extensionService.whenInstalledExtensionsRegistered();
            this._register(this._workingCopyEditorService.registerHandler(this));
        }
        _getViewType(workingCopy) {
            return notebookCommon_1.NotebookWorkingCopyTypeIdentifier.parse(workingCopy.typeId);
        }
    };
    SimpleNotebookWorkingCopyEditorHandler = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, workingCopyEditorService_1.IWorkingCopyEditorService),
        __param(2, extensions_2.IExtensionService),
        __param(3, notebookService_1.INotebookService)
    ], SimpleNotebookWorkingCopyEditorHandler);
    let NotebookLanguageSelectorScoreRefine = class NotebookLanguageSelectorScoreRefine {
        constructor(_notebookService, languageFeaturesService) {
            this._notebookService = _notebookService;
            languageFeaturesService.setNotebookTypeResolver(this._getNotebookInfo.bind(this));
        }
        _getNotebookInfo(uri) {
            const cellUri = notebookCommon_1.CellUri.parse(uri);
            if (!cellUri) {
                return undefined;
            }
            const notebook = this._notebookService.getNotebookTextModel(cellUri.notebook);
            if (!notebook) {
                return undefined;
            }
            return {
                uri: notebook.uri,
                type: notebook.viewType
            };
        }
    };
    NotebookLanguageSelectorScoreRefine = __decorate([
        __param(0, notebookService_1.INotebookService),
        __param(1, languageFeatures_1.ILanguageFeaturesService)
    ], NotebookLanguageSelectorScoreRefine);
    class NotebookAccessibilityHelpContribution extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._register(accessibleViewActions_1.AccessibilityHelpAction.addImplementation(105, 'notebook', async (accessor) => {
                const codeEditor = accessor.get(codeEditorService_1.ICodeEditorService).getActiveCodeEditor() || accessor.get(codeEditorService_1.ICodeEditorService).getFocusedCodeEditor();
                if (!codeEditor) {
                    return;
                }
                (0, notebookAccessibility_1.runAccessibilityHelpAction)(accessor, codeEditor);
            }, notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR));
        }
    }
    class NotebookAccessibleViewContribution extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._register(accessibleViewActions_1.AccessibleViewAction.addImplementation(100, 'notebook', accessor => {
                const accessibleViewService = accessor.get(accessibleView_1.IAccessibleViewService);
                const editorService = accessor.get(editorService_1.IEditorService);
                return (0, notebookAccessibility_1.showAccessibleOutput)(accessibleViewService, editorService);
            }, contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_OUTPUT_FOCUSED, contextkey_1.ContextKeyExpr.equals('resourceExtname', '.ipynb'))));
        }
    }
    const workbenchContributionsRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(NotebookContribution, 1 /* LifecyclePhase.Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(CellContentProvider, 1 /* LifecyclePhase.Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(CellInfoContentProvider, 1 /* LifecyclePhase.Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(RegisterSchemasContribution, 1 /* LifecyclePhase.Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(NotebookEditorManager, 2 /* LifecyclePhase.Ready */);
    workbenchContributionsRegistry.registerWorkbenchContribution(NotebookLanguageSelectorScoreRefine, 2 /* LifecyclePhase.Ready */);
    workbenchContributionsRegistry.registerWorkbenchContribution(SimpleNotebookWorkingCopyEditorHandler, 2 /* LifecyclePhase.Ready */);
    workbenchContributionsRegistry.registerWorkbenchContribution(NotebookAccessibilityHelpContribution, 4 /* LifecyclePhase.Eventually */);
    workbenchContributionsRegistry.registerWorkbenchContribution(NotebookAccessibleViewContribution, 4 /* LifecyclePhase.Eventually */);
    (0, extensions_1.registerSingleton)(notebookService_1.INotebookService, notebookServiceImpl_1.NotebookService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(notebookWorkerService_1.INotebookEditorWorkerService, notebookWorkerServiceImpl_1.NotebookEditorWorkerServiceImpl, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(notebookEditorModelResolverService_1.INotebookEditorModelResolverService, notebookEditorModelResolverServiceImpl_1.NotebookModelResolverServiceImpl, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(notebookCellStatusBarService_1.INotebookCellStatusBarService, notebookCellStatusBarServiceImpl_1.NotebookCellStatusBarService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(notebookEditorService_1.INotebookEditorService, notebookEditorServiceImpl_1.NotebookEditorWidgetService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(notebookKernelService_1.INotebookKernelService, notebookKernelServiceImpl_1.NotebookKernelService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(notebookKernelService_1.INotebookKernelHistoryService, notebookKernelHistoryServiceImpl_1.NotebookKernelHistoryService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(notebookExecutionService_1.INotebookExecutionService, notebookExecutionServiceImpl_1.NotebookExecutionService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(notebookExecutionStateService_1.INotebookExecutionStateService, notebookExecutionStateServiceImpl_1.NotebookExecutionStateService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(notebookRendererMessagingService_1.INotebookRendererMessagingService, notebookRendererMessagingServiceImpl_1.NotebookRendererMessagingService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(notebookKeymapService_1.INotebookKeymapService, notebookKeymapServiceImpl_1.NotebookKeymapService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(notebookLoggingService_1.INotebookLoggingService, notebookLoggingServiceImpl_1.NotebookLoggingService, 1 /* InstantiationType.Delayed */);
    const schemas = {};
    function isConfigurationPropertySchema(x) {
        return (typeof x.type !== 'undefined' || typeof x.anyOf !== 'undefined');
    }
    for (const editorOption of editorOptions_1.editorOptionsRegistry) {
        const schema = editorOption.schema;
        if (schema) {
            if (isConfigurationPropertySchema(schema)) {
                schemas[`editor.${editorOption.name}`] = schema;
            }
            else {
                for (const key in schema) {
                    if (Object.hasOwnProperty.call(schema, key)) {
                        schemas[key] = schema[key];
                    }
                }
            }
        }
    }
    const editorOptionsCustomizationSchema = {
        description: nls.localize('notebook.editorOptions.experimentalCustomization', 'Settings for code editors used in notebooks. This can be used to customize most editor.* settings.'),
        default: {},
        allOf: [
            {
                properties: schemas,
            }
            // , {
            // 	patternProperties: {
            // 		'^\\[.*\\]$': {
            // 			type: 'object',
            // 			default: {},
            // 			properties: schemas
            // 		}
            // 	}
            // }
        ],
        tags: ['notebookLayout']
    };
    const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        id: 'notebook',
        order: 100,
        title: nls.localize('notebookConfigurationTitle', "Notebook"),
        type: 'object',
        properties: {
            [notebookCommon_1.NotebookSetting.displayOrder]: {
                description: nls.localize('notebook.displayOrder.description', "Priority list for output mime types"),
                type: 'array',
                items: {
                    type: 'string'
                },
                default: []
            },
            [notebookCommon_1.NotebookSetting.cellToolbarLocation]: {
                description: nls.localize('notebook.cellToolbarLocation.description', "Where the cell toolbar should be shown, or whether it should be hidden."),
                type: 'object',
                additionalProperties: {
                    markdownDescription: nls.localize('notebook.cellToolbarLocation.viewType', "Configure the cell toolbar position for for specific file types"),
                    type: 'string',
                    enum: ['left', 'right', 'hidden']
                },
                default: {
                    'default': 'right'
                },
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.showCellStatusBar]: {
                description: nls.localize('notebook.showCellStatusbar.description', "Whether the cell status bar should be shown."),
                type: 'string',
                enum: ['hidden', 'visible', 'visibleAfterExecute'],
                enumDescriptions: [
                    nls.localize('notebook.showCellStatusbar.hidden.description', "The cell Status bar is always hidden."),
                    nls.localize('notebook.showCellStatusbar.visible.description', "The cell Status bar is always visible."),
                    nls.localize('notebook.showCellStatusbar.visibleAfterExecute.description', "The cell Status bar is hidden until the cell has executed. Then it becomes visible to show the execution status.")
                ],
                default: 'visible',
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.textDiffEditorPreview]: {
                description: nls.localize('notebook.diff.enablePreview.description', "Whether to use the enhanced text diff editor for notebook."),
                type: 'boolean',
                default: true,
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.diffOverviewRuler]: {
                description: nls.localize('notebook.diff.enableOverviewRuler.description', "Whether to render the overview ruler in the diff editor for notebook."),
                type: 'boolean',
                default: false,
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.cellToolbarVisibility]: {
                markdownDescription: nls.localize('notebook.cellToolbarVisibility.description', "Whether the cell toolbar should appear on hover or click."),
                type: 'string',
                enum: ['hover', 'click'],
                default: 'click',
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.undoRedoPerCell]: {
                description: nls.localize('notebook.undoRedoPerCell.description', "Whether to use separate undo/redo stack for each cell."),
                type: 'boolean',
                default: true,
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.compactView]: {
                description: nls.localize('notebook.compactView.description', "Control whether the notebook editor should be rendered in a compact form. For example, when turned on, it will decrease the left margin width."),
                type: 'boolean',
                default: true,
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.focusIndicator]: {
                description: nls.localize('notebook.focusIndicator.description', "Controls where the focus indicator is rendered, either along the cell borders or on the left gutter."),
                type: 'string',
                enum: ['border', 'gutter'],
                default: 'gutter',
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.insertToolbarLocation]: {
                description: nls.localize('notebook.insertToolbarPosition.description', "Control where the insert cell actions should appear."),
                type: 'string',
                enum: ['betweenCells', 'notebookToolbar', 'both', 'hidden'],
                enumDescriptions: [
                    nls.localize('insertToolbarLocation.betweenCells', "A toolbar that appears on hover between cells."),
                    nls.localize('insertToolbarLocation.notebookToolbar', "The toolbar at the top of the notebook editor."),
                    nls.localize('insertToolbarLocation.both', "Both toolbars."),
                    nls.localize('insertToolbarLocation.hidden', "The insert actions don't appear anywhere."),
                ],
                default: 'both',
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.globalToolbar]: {
                description: nls.localize('notebook.globalToolbar.description', "Control whether to render a global toolbar inside the notebook editor."),
                type: 'boolean',
                default: true,
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.stickyScroll]: {
                description: nls.localize('notebook.stickyScroll.description', "Experimental. Control whether to render notebook Sticky Scroll headers in the notebook editor."),
                type: 'boolean',
                default: false,
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.consolidatedOutputButton]: {
                description: nls.localize('notebook.consolidatedOutputButton.description', "Control whether outputs action should be rendered in the output toolbar."),
                type: 'boolean',
                default: true,
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.showFoldingControls]: {
                description: nls.localize('notebook.showFoldingControls.description', "Controls when the Markdown header folding arrow is shown."),
                type: 'string',
                enum: ['always', 'never', 'mouseover'],
                enumDescriptions: [
                    nls.localize('showFoldingControls.always', "The folding controls are always visible."),
                    nls.localize('showFoldingControls.never', "Never show the folding controls and reduce the gutter size."),
                    nls.localize('showFoldingControls.mouseover', "The folding controls are visible only on mouseover."),
                ],
                default: 'mouseover',
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.dragAndDropEnabled]: {
                description: nls.localize('notebook.dragAndDrop.description', "Control whether the notebook editor should allow moving cells through drag and drop."),
                type: 'boolean',
                default: true,
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.consolidatedRunButton]: {
                description: nls.localize('notebook.consolidatedRunButton.description', "Control whether extra actions are shown in a dropdown next to the run button."),
                type: 'boolean',
                default: false,
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.globalToolbarShowLabel]: {
                description: nls.localize('notebook.globalToolbarShowLabel', "Control whether the actions on the notebook toolbar should render label or not."),
                type: 'string',
                enum: ['always', 'never', 'dynamic'],
                default: 'always',
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.textOutputLineLimit]: {
                markdownDescription: nls.localize('notebook.textOutputLineLimit', "Controls how many lines of text are displayed in a text output. If {0} is enabled, this setting is used to determine the scroll height of the output.", '`#notebook.output.scrolling#`'),
                type: 'number',
                default: 30,
                tags: ['notebookLayout', 'notebookOutputLayout']
            },
            [notebookCommon_1.NotebookSetting.markupFontSize]: {
                markdownDescription: nls.localize('notebook.markup.fontSize', "Controls the font size in pixels of rendered markup in notebooks. When set to {0}, 120% of {1} is used.", '`0`', '`#editor.fontSize#`'),
                type: 'number',
                default: 0,
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.cellEditorOptionsCustomizations]: editorOptionsCustomizationSchema,
            [notebookCommon_1.NotebookSetting.interactiveWindowCollapseCodeCells]: {
                markdownDescription: nls.localize('notebook.interactiveWindow.collapseCodeCells', "Controls whether code cells in the interactive window are collapsed by default."),
                type: 'string',
                enum: ['always', 'never', 'fromEditor'],
                default: 'fromEditor'
            },
            [notebookCommon_1.NotebookSetting.outputLineHeight]: {
                markdownDescription: nls.localize('notebook.outputLineHeight', "Line height of the output text within notebook cells.\n - When set to 0, editor line height is used.\n - Values between 0 and 8 will be used as a multiplier with the font size.\n - Values greater than or equal to 8 will be used as effective values."),
                type: 'number',
                default: 0,
                tags: ['notebookLayout', 'notebookOutputLayout']
            },
            [notebookCommon_1.NotebookSetting.outputFontSize]: {
                markdownDescription: nls.localize('notebook.outputFontSize', "Font size for the output text within notebook cells. When set to 0, {0} is used.", '`#editor.fontSize#`'),
                type: 'number',
                default: 0,
                tags: ['notebookLayout', 'notebookOutputLayout']
            },
            [notebookCommon_1.NotebookSetting.outputFontFamily]: {
                markdownDescription: nls.localize('notebook.outputFontFamily', "The font family of the output text within notebook cells. When set to empty, the {0} is used.", '`#editor.fontFamily#`'),
                type: 'string',
                tags: ['notebookLayout', 'notebookOutputLayout']
            },
            [notebookCommon_1.NotebookSetting.outputScrolling]: {
                markdownDescription: nls.localize('notebook.outputScrolling', "Initially render notebook outputs in a scrollable region when longer than the limit"),
                type: 'boolean',
                tags: ['notebookLayout', 'notebookOutputLayout'],
                default: typeof product_1.default.quality === 'string' && product_1.default.quality !== 'stable' // only enable as default in insiders
            },
            [notebookCommon_1.NotebookSetting.outputWordWrap]: {
                markdownDescription: nls.localize('notebook.outputWordWrap', "Controls whether the lines in output should wrap."),
                type: 'boolean',
                tags: ['notebookLayout', 'notebookOutputLayout'],
                default: false
            },
            [notebookCommon_1.NotebookSetting.formatOnSave]: {
                markdownDescription: nls.localize('notebook.formatOnSave', "Format a notebook on save. A formatter must be available, the file must not be saved after delay, and the editor must not be shutting down."),
                type: 'boolean',
                tags: ['notebookLayout'],
                default: false
            },
            [notebookCommon_1.NotebookSetting.codeActionsOnSave]: {
                markdownDescription: nls.localize('notebook.codeActionsOnSave', "Run a series of CodeActions for a notebook on save. CodeActions must be specified, the file must not be saved after delay, and the editor must not be shutting down. Example: `source.fixAll: true`"),
                type: 'object',
                additionalProperties: {
                    type: 'string',
                    enum: ['explicit', 'never'],
                    // enum: ['explicit', 'always', 'never'], -- autosave support needs to be built first
                    // nls.localize('always', 'Always triggers Code Actions on save, including autosave, focus, and window change events.'),
                    enumDescriptions: [nls.localize('never', 'Never triggers Code Actions on save.'), nls.localize('explicit', 'Triggers Code Actions only when explicitly saved.')],
                },
                default: {}
            },
            [notebookCommon_1.NotebookSetting.formatOnCellExecution]: {
                markdownDescription: nls.localize('notebook.formatOnCellExecution', "Format a notebook cell upon execution. A formatter must be available."),
                type: 'boolean',
                default: false
            },
            [notebookCommon_1.NotebookSetting.confirmDeleteRunningCell]: {
                markdownDescription: nls.localize('notebook.confirmDeleteRunningCell', "Control whether a confirmation prompt is required to delete a running cell."),
                type: 'boolean',
                default: true
            },
            [notebookCommon_1.NotebookSetting.findScope]: {
                markdownDescription: nls.localize('notebook.findScope', "Customize the Find Widget behavior for searching within notebook cells. When both markup source and markup preview are enabled, the Find Widget will search either the source code or preview based on the current state of the cell."),
                type: 'object',
                properties: {
                    markupSource: {
                        type: 'boolean',
                        default: true
                    },
                    markupPreview: {
                        type: 'boolean',
                        default: true
                    },
                    codeSource: {
                        type: 'boolean',
                        default: true
                    },
                    codeOutput: {
                        type: 'boolean',
                        default: true
                    }
                },
                default: {
                    markupSource: true,
                    markupPreview: true,
                    codeSource: true,
                    codeOutput: true
                },
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.remoteSaving]: {
                markdownDescription: nls.localize('notebook.remoteSaving', "Enables the incremental saving of notebooks in Remote environment. When enabled, only the changes to the notebook are sent to the extension host, improving performance for large notebooks and slow network connections."),
                type: 'boolean',
                default: typeof product_1.default.quality === 'string' && product_1.default.quality !== 'stable' // only enable as default in insiders
            },
            [notebookCommon_1.NotebookSetting.cellExecutionScroll]: {
                markdownDescription: nls.localize('notebook.revealNextOnExecuteBehavior.description', "How far to scroll when revealing the next cell upon exectuting {0}.", 'notebook.cell.executeAndSelectBelow'),
                type: 'string',
                enum: ['fullCell', 'firstLine', 'none'],
                markdownEnumDescriptions: [
                    nls.localize('notebook.revealNextOnExecuteBehavior.fullCell.description', 'Scroll to fully reveal the next cell.'),
                    nls.localize('notebook.revealNextOnExecuteBehavior.firstLine.description', 'Scroll to reveal the first line of the next cell.'),
                    nls.localize('notebook.revealNextOnExecuteBehavior.nonedescription', 'Do not scroll to reveal the next cell.'),
                ],
                default: 'fullCell'
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2suY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci9ub3RlYm9vay5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQXNIaEcsa0dBQWtHO0lBRWxHLG1CQUFRLENBQUMsRUFBRSxDQUFzQix5QkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxrQkFBa0IsQ0FDL0UsNkJBQW9CLENBQUMsTUFBTSxDQUMxQiwrQkFBYyxFQUNkLCtCQUFjLENBQUMsRUFBRSxFQUNqQixpQkFBaUIsQ0FDakIsRUFDRDtRQUNDLElBQUksNEJBQWMsQ0FBQyx5Q0FBbUIsQ0FBQztLQUN2QyxDQUNELENBQUM7SUFFRixtQkFBUSxDQUFDLEVBQUUsQ0FBc0IseUJBQWdCLENBQUMsVUFBVSxDQUFDLENBQUMsa0JBQWtCLENBQy9FLDZCQUFvQixDQUFDLE1BQU0sQ0FDMUIsMkNBQXNCLEVBQ3RCLDJDQUFzQixDQUFDLEVBQUUsRUFDekIsc0JBQXNCLENBQ3RCLEVBQ0Q7UUFDQyxJQUFJLDRCQUFjLENBQUMsaURBQXVCLENBQUM7S0FDM0MsQ0FDRCxDQUFDO0lBRUYsTUFBTSw0QkFBNEI7UUFDakMsWUFBWTtZQUNYLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVELFNBQVMsQ0FBQyxLQUFrQjtZQUMzQixJQUFBLGtCQUFVLEVBQUMsS0FBSyxZQUFZLGlEQUF1QixDQUFDLENBQUM7WUFDckQsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUNyQixRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVE7Z0JBQ3hCLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUTtnQkFDekMsSUFBSSxFQUFFLEtBQUssQ0FBQyxPQUFPLEVBQUU7Z0JBQ3JCLFlB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