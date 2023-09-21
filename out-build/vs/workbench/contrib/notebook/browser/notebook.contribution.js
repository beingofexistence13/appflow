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
define(["require", "exports", "vs/base/common/network", "vs/base/common/lifecycle", "vs/base/common/marshalling", "vs/base/common/resources", "vs/base/common/types", "vs/base/common/uri", "vs/base/common/jsonFormatter", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/editor/common/services/resolverService", "vs/nls!vs/workbench/contrib/notebook/browser/notebook.contribution", "vs/platform/configuration/common/configurationRegistry", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/workbench/browser/editor", "vs/workbench/common/contributions", "vs/workbench/common/editor", "vs/workbench/contrib/notebook/browser/notebookEditor", "vs/workbench/contrib/notebook/common/notebookEditorInput", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/contrib/notebook/browser/services/notebookServiceImpl", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/services/editor/common/editorService", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/contrib/notebook/common/notebookEditorModelResolverService", "vs/workbench/contrib/notebook/common/notebookDiffEditorInput", "vs/workbench/contrib/notebook/browser/diff/notebookDiffEditor", "vs/workbench/contrib/notebook/common/services/notebookWorkerService", "vs/workbench/contrib/notebook/browser/services/notebookWorkerServiceImpl", "vs/workbench/contrib/notebook/common/notebookCellStatusBarService", "vs/workbench/contrib/notebook/browser/services/notebookCellStatusBarServiceImpl", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/contrib/notebook/browser/services/notebookEditorServiceImpl", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/base/common/event", "vs/workbench/contrib/notebook/browser/diff/diffElementViewModel", "vs/workbench/contrib/notebook/common/notebookEditorModelResolverServiceImpl", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/workbench/contrib/notebook/browser/services/notebookKernelServiceImpl", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/workingCopy/common/workingCopyEditorService", "vs/platform/configuration/common/configuration", "vs/platform/label/common/label", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/contrib/notebook/browser/services/notebookRendererMessagingServiceImpl", "vs/workbench/contrib/notebook/common/notebookRendererMessagingService", "vs/editor/common/config/editorOptions", "vs/workbench/contrib/notebook/browser/services/notebookExecutionStateServiceImpl", "vs/workbench/contrib/notebook/browser/services/notebookExecutionServiceImpl", "vs/workbench/contrib/notebook/common/notebookExecutionService", "vs/workbench/contrib/notebook/common/notebookKeymapService", "vs/workbench/contrib/notebook/browser/services/notebookKeymapServiceImpl", "vs/editor/common/languages/modesRegistry", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/editor/common/services/languageFeatures", "vs/workbench/contrib/comments/browser/commentReply", "vs/editor/browser/services/codeEditorService", "vs/workbench/contrib/notebook/browser/services/notebookKernelHistoryServiceImpl", "vs/workbench/contrib/notebook/common/notebookLoggingService", "vs/workbench/contrib/notebook/browser/services/notebookLoggingServiceImpl", "vs/platform/product/common/product", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/browser/notebookAccessibility", "vs/workbench/contrib/accessibility/browser/accessibleView", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/accessibility/browser/accessibleViewActions", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/browser/controller/insertCellActions", "vs/workbench/contrib/notebook/browser/controller/executeActions", "vs/workbench/contrib/notebook/browser/controller/layoutActions", "vs/workbench/contrib/notebook/browser/controller/editActions", "vs/workbench/contrib/notebook/browser/controller/cellOutputActions", "vs/workbench/contrib/notebook/browser/controller/apiActions", "vs/workbench/contrib/notebook/browser/controller/foldingController", "vs/workbench/contrib/notebook/browser/contrib/editorHint/emptyCellEditorHint", "vs/workbench/contrib/notebook/browser/contrib/clipboard/notebookClipboard", "vs/workbench/contrib/notebook/browser/contrib/find/notebookFind", "vs/workbench/contrib/notebook/browser/contrib/format/formatting", "vs/workbench/contrib/notebook/browser/contrib/saveParticipants/saveParticipants", "vs/workbench/contrib/notebook/browser/contrib/gettingStarted/notebookGettingStarted", "vs/workbench/contrib/notebook/browser/contrib/layout/layoutActions", "vs/workbench/contrib/notebook/browser/contrib/marker/markerProvider", "vs/workbench/contrib/notebook/browser/contrib/navigation/arrow", "vs/workbench/contrib/notebook/browser/contrib/outline/notebookOutline", "vs/workbench/contrib/notebook/browser/contrib/profile/notebookProfile", "vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/statusBarProviders", "vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/contributedStatusBarItemController", "vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/executionStatusBarItemController", "vs/workbench/contrib/notebook/browser/contrib/editorStatusBar/editorStatusBar", "vs/workbench/contrib/notebook/browser/contrib/undoRedo/notebookUndoRedo", "vs/workbench/contrib/notebook/browser/contrib/cellCommands/cellCommands", "vs/workbench/contrib/notebook/browser/contrib/viewportWarmup/viewportWarmup", "vs/workbench/contrib/notebook/browser/contrib/troubleshoot/layout", "vs/workbench/contrib/notebook/browser/contrib/debug/notebookBreakpoints", "vs/workbench/contrib/notebook/browser/contrib/debug/notebookCellPausing", "vs/workbench/contrib/notebook/browser/contrib/debug/notebookDebugDecorations", "vs/workbench/contrib/notebook/browser/contrib/execute/executionEditorProgress", "vs/workbench/contrib/notebook/browser/contrib/kernelDetection/notebookKernelDetection", "vs/workbench/contrib/notebook/browser/diff/notebookDiffActions"], function (require, exports, network_1, lifecycle_1, marshalling_1, resources_1, types_1, uri_1, jsonFormatter_1, model_1, language_1, resolverService_1, nls, configurationRegistry_1, descriptors_1, extensions_1, instantiation_1, platform_1, editor_1, contributions_1, editor_2, notebookEditor_1, notebookEditorInput_1, notebookService_1, notebookServiceImpl_1, notebookCommon_1, editorService_1, undoRedo_1, notebookEditorModelResolverService_1, notebookDiffEditorInput_1, notebookDiffEditor_1, notebookWorkerService_1, notebookWorkerServiceImpl_1, notebookCellStatusBarService_1, notebookCellStatusBarServiceImpl_1, notebookEditorService_1, notebookEditorServiceImpl_1, jsonContributionRegistry_1, event_1, diffElementViewModel_1, notebookEditorModelResolverServiceImpl_1, notebookKernelService_1, notebookKernelServiceImpl_1, extensions_2, workingCopyEditorService_1, configuration_1, label_1, editorGroupsService_1, notebookRendererMessagingServiceImpl_1, notebookRendererMessagingService_1, editorOptions_1, notebookExecutionStateServiceImpl_1, notebookExecutionServiceImpl_1, notebookExecutionService_1, notebookKeymapService_1, notebookKeymapServiceImpl_1, modesRegistry_1, notebookExecutionStateService_1, languageFeatures_1, commentReply_1, codeEditorService_1, notebookKernelHistoryServiceImpl_1, notebookLoggingService_1, notebookLoggingServiceImpl_1, product_1, notebookContextKeys_1, notebookAccessibility_1, accessibleView_1, contextkey_1, accessibleViewActions_1) {
    "use strict";
    var $vGb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$vGb = void 0;
    /*--------------------------------------------------------------------------------------------- */
    platform_1.$8m.as(editor_2.$GE.EditorPane).registerEditorPane(editor_1.$_T.create(notebookEditor_1.$lEb, notebookEditor_1.$lEb.ID, 'Notebook Editor'), [
        new descriptors_1.$yh(notebookEditorInput_1.$zbb)
    ]);
    platform_1.$8m.as(editor_2.$GE.EditorPane).registerEditorPane(editor_1.$_T.create(notebookDiffEditor_1.$1Eb, notebookDiffEditor_1.$1Eb.ID, 'Notebook Diff Editor'), [
        new descriptors_1.$yh(notebookDiffEditorInput_1.$pEb)
    ]);
    class NotebookDiffEditorSerializer {
        canSerialize() {
            return true;
        }
        serialize(input) {
            (0, types_1.$tf)(input instanceof notebookDiffEditorInput_1.$pEb);
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
            const data = (0, marshalling_1.$0g)(raw);
            if (!data) {
                return undefined;
            }
            const { resource, originalResource, name, viewType } = data;
            if (!data || !uri_1.URI.isUri(resource) || !uri_1.URI.isUri(originalResource) || typeof name !== 'string' || typeof viewType !== 'string') {
                return undefined;
            }
            const input = notebookDiffEditorInput_1.$pEb.create(instantiationService, resource, name, undefined, originalResource, viewType);
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
            (0, types_1.$tf)(input instanceof notebookEditorInput_1.$zbb);
            const data = {
                resource: input.resource,
                viewType: input.viewType,
                options: input.options
            };
            return JSON.stringify(data);
        }
        deserialize(instantiationService, raw) {
            const data = (0, marshalling_1.$0g)(raw);
            if (!data) {
                return undefined;
            }
            const { resource, viewType, options } = data;
            if (!data || !uri_1.URI.isUri(resource) || typeof viewType !== 'string') {
                return undefined;
            }
            const input = notebookEditorInput_1.$zbb.create(instantiationService, resource, viewType, options);
            return input;
        }
    }
    platform_1.$8m.as(editor_2.$GE.EditorFactory).registerEditorSerializer(notebookEditorInput_1.$zbb.ID, NotebookEditorSerializer);
    platform_1.$8m.as(editor_2.$GE.EditorFactory).registerEditorSerializer(notebookDiffEditorInput_1.$pEb.ID, NotebookDiffEditorSerializer);
    let $vGb = $vGb_1 = class $vGb extends lifecycle_1.$kc {
        constructor(undoRedoService, configurationService, b) {
            super();
            this.b = b;
            this.c(configurationService, undoRedoService);
            // Watch for changes to undoRedoPerCell setting
            this.B(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(notebookCommon_1.$7H.undoRedoPerCell)) {
                    this.c(configurationService, undoRedoService);
                }
            }));
            // register comment decoration
            this.b.registerDecorationType('comment-controller', commentReply_1.$tmb, {});
        }
        // Add or remove the cell undo redo comparison key based on the user setting
        c(configurationService, undoRedoService) {
            const undoRedoPerCell = configurationService.getValue(notebookCommon_1.$7H.undoRedoPerCell);
            if (!undoRedoPerCell) {
                // Add comparison key to map cell => main document
                if (!this.a) {
                    this.a = undoRedoService.registerUriComparisonKeyComputer(notebookCommon_1.CellUri.scheme, {
                        getComparisonKey: (uri) => {
                            if (undoRedoPerCell) {
                                return uri.toString();
                            }
                            return $vGb_1.f(uri);
                        }
                    });
                }
            }
            else {
                // Dispose comparison key
                this.a?.dispose();
                this.a = undefined;
            }
        }
        static f(uri) {
            const data = notebookCommon_1.CellUri.parse(uri);
            if (!data) {
                return uri.toString();
            }
            return data.notebook.toString();
        }
        dispose() {
            super.dispose();
            this.a?.dispose();
        }
    };
    exports.$vGb = $vGb;
    exports.$vGb = $vGb = $vGb_1 = __decorate([
        __param(0, undoRedo_1.$wu),
        __param(1, configuration_1.$8h),
        __param(2, codeEditorService_1.$nV)
    ], $vGb);
    let CellContentProvider = class CellContentProvider {
        constructor(textModelService, b, c, d) {
            this.b = b;
            this.c = c;
            this.d = d;
            this.a = textModelService.registerTextModelContentProvider(notebookCommon_1.CellUri.scheme, this);
        }
        dispose() {
            this.a.dispose();
        }
        async provideTextContent(resource) {
            const existing = this.b.getModel(resource);
            if (existing) {
                return existing;
            }
            const data = notebookCommon_1.CellUri.parse(resource);
            // const data = parseCellUri(resource);
            if (!data) {
                return null;
            }
            const ref = await this.d.resolve(data.notebook);
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
                            return { textBuffer: cell.textBuffer, disposable: lifecycle_1.$kc.None };
                        },
                        getFirstLineText: (limit) => {
                            return cell.textBuffer.getLineContent(1).substring(0, limit);
                        }
                    };
                    const languageId = this.c.getLanguageIdByLanguageName(cell.language);
                    const languageSelection = languageId ? this.c.createById(languageId) : (cell.cellKind === notebookCommon_1.CellKind.Markup ? this.c.createById('markdown') : this.c.createByFilepathOrFirstLine(resource, cell.textBuffer.getLineContent(1)));
                    result = this.b.createModel(bufferFactory, languageSelection, resource);
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
        __param(0, resolverService_1.$uA),
        __param(1, model_1.$yA),
        __param(2, language_1.$ct),
        __param(3, notebookEditorModelResolverService_1.$wbb)
    ], CellContentProvider);
    let CellInfoContentProvider = class CellInfoContentProvider {
        constructor(textModelService, b, c, d, f) {
            this.b = b;
            this.c = c;
            this.d = d;
            this.f = f;
            this.a = [];
            this.a.push(textModelService.registerTextModelContentProvider(network_1.Schemas.vscodeNotebookCellMetadata, {
                provideTextContent: this.provideMetadataTextContent.bind(this)
            }));
            this.a.push(textModelService.registerTextModelContentProvider(network_1.Schemas.vscodeNotebookCellOutput, {
                provideTextContent: this.provideOutputTextContent.bind(this)
            }));
            this.a.push(this.d.registerFormatter({
                scheme: network_1.Schemas.vscodeNotebookCellMetadata,
                formatting: {
                    label: '${path} (metadata)',
                    separator: '/'
                }
            }));
            this.a.push(this.d.registerFormatter({
                scheme: network_1.Schemas.vscodeNotebookCellOutput,
                formatting: {
                    label: '${path} (output)',
                    separator: '/'
                }
            }));
        }
        dispose() {
            (0, lifecycle_1.$fc)(this.a);
        }
        async provideMetadataTextContent(resource) {
            const existing = this.b.getModel(resource);
            if (existing) {
                return existing;
            }
            const data = notebookCommon_1.CellUri.parseCellPropertyUri(resource, network_1.Schemas.vscodeNotebookCellMetadata);
            if (!data) {
                return null;
            }
            const ref = await this.f.resolve(data.notebook);
            let result = null;
            const mode = this.c.createById('json');
            for (const cell of ref.object.notebook.cells) {
                if (cell.handle === data.handle) {
                    const metadataSource = (0, diffElementViewModel_1.$LEb)(ref.object.notebook, cell.metadata, cell.language);
                    result = this.b.createModel(metadataSource, mode, resource);
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
        g(op) {
            if (!op) {
                return;
            }
            const streamOutputData = (0, diffElementViewModel_1.$MEb)(op.outputs);
            if (streamOutputData) {
                return {
                    content: streamOutputData,
                    mode: this.c.createById(modesRegistry_1.$Yt)
                };
            }
            return;
        }
        h(data, cell) {
            let result = undefined;
            const mode = this.c.createById('json');
            const op = cell.outputs.find(op => op.outputId === data.outputId || op.alternativeOutputId === data.outputId);
            const streamOutputData = this.g(op);
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
            const outputSource = (0, jsonFormatter_1.$yS)(obj, {});
            result = {
                content: outputSource,
                mode
            };
            return result;
        }
        async provideOutputTextContent(resource) {
            const existing = this.b.getModel(resource);
            if (existing) {
                return existing;
            }
            const data = notebookCommon_1.CellUri.parseCellOutputUri(resource);
            if (!data) {
                return null;
            }
            const ref = await this.f.resolve(data.notebook);
            const cell = ref.object.notebook.cells.find(cell => !!cell.outputs.find(op => op.outputId === data.outputId || op.alternativeOutputId === data.outputId));
            if (!cell) {
                ref.dispose();
                return null;
            }
            const result = this.h(data, cell);
            if (!result) {
                ref.dispose();
                return null;
            }
            const model = this.b.createModel(result.content, result.mode, resource);
            const cellModelListener = event_1.Event.any(cell.onDidChangeOutputs ?? event_1.Event.None, cell.onDidChangeOutputItems ?? event_1.Event.None)(() => {
                const newResult = this.h(data, cell);
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
        __param(0, resolverService_1.$uA),
        __param(1, model_1.$yA),
        __param(2, language_1.$ct),
        __param(3, label_1.$Vz),
        __param(4, notebookEditorModelResolverService_1.$wbb)
    ], CellInfoContentProvider);
    class RegisterSchemasContribution extends lifecycle_1.$kc {
        constructor() {
            super();
            this.a();
        }
        a() {
            const jsonRegistry = platform_1.$8m.as(jsonContributionRegistry_1.$9m.JSONContribution);
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
        constructor(b, c, editorGroups) {
            this.b = b;
            this.c = c;
            this.a = new lifecycle_1.$jc();
            this.a.add(event_1.Event.debounce(this.c.onDidChangeDirty, (last, current) => !last ? [current] : [...last, current], 100)(this.d, this));
            // CLOSE editors when we are about to open conflicting notebooks
            this.a.add(c.onWillFailWithConflict(e => {
                for (const group of editorGroups.groups) {
                    const conflictInputs = group.editors.filter(input => input instanceof notebookEditorInput_1.$zbb && input.viewType !== e.viewType && (0, resources_1.$bg)(input.resource, e.resource));
                    const p = group.closeEditors(conflictInputs);
                    e.waitUntil(p);
                }
            }));
        }
        dispose() {
            this.a.dispose();
        }
        d(models) {
            const result = [];
            for (const model of models) {
                if (model.isDirty() && !this.b.isOpened({ resource: model.resource, typeId: notebookEditorInput_1.$zbb.ID, editorId: model.viewType }) && (0, resources_1.$gg)(model.resource) !== '.interactive') {
                    result.push({
                        resource: model.resource,
                        options: { inactive: true, preserveFocus: true, pinned: true, override: model.viewType }
                    });
                }
            }
            if (result.length > 0) {
                this.b.openEditors(result);
            }
        }
    };
    NotebookEditorManager = __decorate([
        __param(0, editorService_1.$9C),
        __param(1, notebookEditorModelResolverService_1.$wbb),
        __param(2, editorGroupsService_1.$5C)
    ], NotebookEditorManager);
    let SimpleNotebookWorkingCopyEditorHandler = class SimpleNotebookWorkingCopyEditorHandler extends lifecycle_1.$kc {
        constructor(a, b, c, f) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
            this.h();
        }
        async handles(workingCopy) {
            const viewType = this.g(workingCopy);
            if (!viewType) {
                return false;
            }
            return this.f.canResolve(viewType);
        }
        g(workingCopy) {
            const viewType = this.j(workingCopy);
            if (!viewType || viewType === 'interactive') {
                return undefined;
            }
            return viewType;
        }
        isOpen(workingCopy, editor) {
            if (!this.g(workingCopy)) {
                return false;
            }
            return editor instanceof notebookEditorInput_1.$zbb && editor.viewType === this.j(workingCopy) && (0, resources_1.$bg)(workingCopy.resource, editor.resource);
        }
        createEditor(workingCopy) {
            return notebookEditorInput_1.$zbb.create(this.a, workingCopy.resource, this.j(workingCopy));
        }
        async h() {
            await this.c.whenInstalledExtensionsRegistered();
            this.B(this.b.registerHandler(this));
        }
        j(workingCopy) {
            return notebookCommon_1.$8H.parse(workingCopy.typeId);
        }
    };
    SimpleNotebookWorkingCopyEditorHandler = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, workingCopyEditorService_1.$AD),
        __param(2, extensions_2.$MF),
        __param(3, notebookService_1.$ubb)
    ], SimpleNotebookWorkingCopyEditorHandler);
    let NotebookLanguageSelectorScoreRefine = class NotebookLanguageSelectorScoreRefine {
        constructor(a, languageFeaturesService) {
            this.a = a;
            languageFeaturesService.setNotebookTypeResolver(this.b.bind(this));
        }
        b(uri) {
            const cellUri = notebookCommon_1.CellUri.parse(uri);
            if (!cellUri) {
                return undefined;
            }
            const notebook = this.a.getNotebookTextModel(cellUri.notebook);
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
        __param(0, notebookService_1.$ubb),
        __param(1, languageFeatures_1.$hF)
    ], NotebookLanguageSelectorScoreRefine);
    class NotebookAccessibilityHelpContribution extends lifecycle_1.$kc {
        constructor() {
            super();
            this.B(accessibleViewActions_1.$tGb.addImplementation(105, 'notebook', async (accessor) => {
                const codeEditor = accessor.get(codeEditorService_1.$nV).getActiveCodeEditor() || accessor.get(codeEditorService_1.$nV).getFocusedCodeEditor();
                if (!codeEditor) {
                    return;
                }
                (0, notebookAccessibility_1.$rGb)(accessor, codeEditor);
            }, notebookContextKeys_1.$Wnb));
        }
    }
    class NotebookAccessibleViewContribution extends lifecycle_1.$kc {
        constructor() {
            super();
            this.B(accessibleViewActions_1.$uGb.addImplementation(100, 'notebook', accessor => {
                const accessibleViewService = accessor.get(accessibleView_1.$wqb);
                const editorService = accessor.get(editorService_1.$9C);
                return (0, notebookAccessibility_1.$sGb)(accessibleViewService, editorService);
            }, contextkey_1.$Ii.and(notebookContextKeys_1.$1nb, contextkey_1.$Ii.equals('resourceExtname', '.ipynb'))));
        }
    }
    const workbenchContributionsRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution($vGb, 1 /* LifecyclePhase.Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(CellContentProvider, 1 /* LifecyclePhase.Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(CellInfoContentProvider, 1 /* LifecyclePhase.Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(RegisterSchemasContribution, 1 /* LifecyclePhase.Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(NotebookEditorManager, 2 /* LifecyclePhase.Ready */);
    workbenchContributionsRegistry.registerWorkbenchContribution(NotebookLanguageSelectorScoreRefine, 2 /* LifecyclePhase.Ready */);
    workbenchContributionsRegistry.registerWorkbenchContribution(SimpleNotebookWorkingCopyEditorHandler, 2 /* LifecyclePhase.Ready */);
    workbenchContributionsRegistry.registerWorkbenchContribution(NotebookAccessibilityHelpContribution, 4 /* LifecyclePhase.Eventually */);
    workbenchContributionsRegistry.registerWorkbenchContribution(NotebookAccessibleViewContribution, 4 /* LifecyclePhase.Eventually */);
    (0, extensions_1.$mr)(notebookService_1.$ubb, notebookServiceImpl_1.$uEb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(notebookWorkerService_1.$kEb, notebookWorkerServiceImpl_1.$4Eb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(notebookEditorModelResolverService_1.$wbb, notebookEditorModelResolverServiceImpl_1.$7Eb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(notebookCellStatusBarService_1.$Qmb, notebookCellStatusBarServiceImpl_1.$5Eb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(notebookEditorService_1.$1rb, notebookEditorServiceImpl_1.$6Eb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(notebookKernelService_1.$Bbb, notebookKernelServiceImpl_1.$8Eb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(notebookKernelService_1.$Cbb, notebookKernelHistoryServiceImpl_1.$oGb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(notebookExecutionService_1.$aI, notebookExecutionServiceImpl_1.$iGb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(notebookExecutionStateService_1.$_H, notebookExecutionStateServiceImpl_1.$hGb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(notebookRendererMessagingService_1.$Uob, notebookRendererMessagingServiceImpl_1.$9Eb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(notebookKeymapService_1.$jGb, notebookKeymapServiceImpl_1.$mGb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(notebookLoggingService_1.$1ob, notebookLoggingServiceImpl_1.$pGb, 1 /* InstantiationType.Delayed */);
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
        description: nls.localize(0, null),
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
    const configurationRegistry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
    configurationRegistry.registerConfiguration({
        id: 'notebook',
        order: 100,
        title: nls.localize(1, null),
        type: 'object',
        properties: {
            [notebookCommon_1.$7H.displayOrder]: {
                description: nls.localize(2, null),
                type: 'array',
                items: {
                    type: 'string'
                },
                default: []
            },
            [notebookCommon_1.$7H.cellToolbarLocation]: {
                description: nls.localize(3, null),
                type: 'object',
                additionalProperties: {
                    markdownDescription: nls.localize(4, null),
                    type: 'string',
                    enum: ['left', 'right', 'hidden']
                },
                default: {
                    'default': 'right'
                },
                tags: ['notebookLayout']
            },
            [notebookCommon_1.$7H.showCellStatusBar]: {
                description: nls.localize(5, null),
                type: 'string',
                enum: ['hidden', 'visible', 'visibleAfterExecute'],
                enumDescriptions: [
                    nls.localize(6, null),
                    nls.localize(7, null),
                    nls.localize(8, null)
                ],
                default: 'visible',
                tags: ['notebookLayout']
            },
            [notebookCommon_1.$7H.textDiffEditorPreview]: {
                description: nls.localize(9, null),
                type: 'boolean',
                default: true,
                tags: ['notebookLayout']
            },
            [notebookCommon_1.$7H.diffOverviewRuler]: {
                description: nls.localize(10, null),
                type: 'boolean',
                default: false,
                tags: ['notebookLayout']
            },
            [notebookCommon_1.$7H.cellToolbarVisibility]: {
                markdownDescription: nls.localize(11, null),
                type: 'string',
                enum: ['hover', 'click'],
                default: 'click',
                tags: ['notebookLayout']
            },
            [notebookCommon_1.$7H.undoRedoPerCell]: {
                description: nls.localize(12, null),
                type: 'boolean',
                default: true,
                tags: ['notebookLayout']
            },
            [notebookCommon_1.$7H.compactView]: {
                description: nls.localize(13, null),
                type: 'boolean',
                default: true,
                tags: ['notebookLayout']
            },
            [notebookCommon_1.$7H.focusIndicator]: {
                description: nls.localize(14, null),
                type: 'string',
                enum: ['border', 'gutter'],
                default: 'gutter',
                tags: ['notebookLayout']
            },
            [notebookCommon_1.$7H.insertToolbarLocation]: {
                description: nls.localize(15, null),
                type: 'string',
                enum: ['betweenCells', 'notebookToolbar', 'both', 'hidden'],
                enumDescriptions: [
                    nls.localize(16, null),
                    nls.localize(17, null),
                    nls.localize(18, null),
                    nls.localize(19, null),
                ],
                default: 'both',
                tags: ['notebookLayout']
            },
            [notebookCommon_1.$7H.globalToolbar]: {
                description: nls.localize(20, null),
                type: 'boolean',
                default: true,
                tags: ['notebookLayout']
            },
            [notebookCommon_1.$7H.stickyScroll]: {
                description: nls.localize(21, null),
                type: 'boolean',
                default: false,
                tags: ['notebookLayout']
            },
            [notebookCommon_1.$7H.consolidatedOutputButton]: {
                description: nls.localize(22, null),
                type: 'boolean',
                default: true,
                tags: ['notebookLayout']
            },
            [notebookCommon_1.$7H.showFoldingControls]: {
                description: nls.localize(23, null),
                type: 'string',
                enum: ['always', 'never', 'mouseover'],
                enumDescriptions: [
                    nls.localize(24, null),
                    nls.localize(25, null),
                    nls.localize(26, null),
                ],
                default: 'mouseover',
                tags: ['notebookLayout']
            },
            [notebookCommon_1.$7H.dragAndDropEnabled]: {
                description: nls.localize(27, null),
                type: 'boolean',
                default: true,
                tags: ['notebookLayout']
            },
            [notebookCommon_1.$7H.consolidatedRunButton]: {
                description: nls.localize(28, null),
                type: 'boolean',
                default: false,
                tags: ['notebookLayout']
            },
            [notebookCommon_1.$7H.globalToolbarShowLabel]: {
                description: nls.localize(29, null),
                type: 'string',
                enum: ['always', 'never', 'dynamic'],
                default: 'always',
                tags: ['notebookLayout']
            },
            [notebookCommon_1.$7H.textOutputLineLimit]: {
                markdownDescription: nls.localize(30, null, '`#notebook.output.scrolling#`'),
                type: 'number',
                default: 30,
                tags: ['notebookLayout', 'notebookOutputLayout']
            },
            [notebookCommon_1.$7H.markupFontSize]: {
                markdownDescription: nls.localize(31, null, '`0`', '`#editor.fontSize#`'),
                type: 'number',
                default: 0,
                tags: ['notebookLayout']
            },
            [notebookCommon_1.$7H.cellEditorOptionsCustomizations]: editorOptionsCustomizationSchema,
            [notebookCommon_1.$7H.interactiveWindowCollapseCodeCells]: {
                markdownDescription: nls.localize(32, null),
                type: 'string',
                enum: ['always', 'never', 'fromEditor'],
                default: 'fromEditor'
            },
            [notebookCommon_1.$7H.outputLineHeight]: {
                markdownDescription: nls.localize(33, null),
                type: 'number',
                default: 0,
                tags: ['notebookLayout', 'notebookOutputLayout']
            },
            [notebookCommon_1.$7H.outputFontSize]: {
                markdownDescription: nls.localize(34, null, '`#editor.fontSize#`'),
                type: 'number',
                default: 0,
                tags: ['notebookLayout', 'notebookOutputLayout']
            },
            [notebookCommon_1.$7H.outputFontFamily]: {
                markdownDescription: nls.localize(35, null, '`#editor.fontFamily#`'),
                type: 'string',
                tags: ['notebookLayout', 'notebookOutputLayout']
            },
            [notebookCommon_1.$7H.outputScrolling]: {
                markdownDescription: nls.localize(36, null),
                type: 'boolean',
                tags: ['notebookLayout', 'notebookOutputLayout'],
                default: typeof product_1.default.quality === 'string' && product_1.default.quality !== 'stable' // only enable as default in insiders
            },
            [notebookCommon_1.$7H.outputWordWrap]: {
                markdownDescription: nls.localize(37, null),
                type: 'boolean',
                tags: ['notebookLayout', 'notebookOutputLayout'],
                default: false
            },
            [notebookCommon_1.$7H.formatOnSave]: {
                markdownDescription: nls.localize(38, null),
                type: 'boolean',
                tags: ['notebookLayout'],
                default: false
            },
            [notebookCommon_1.$7H.codeActionsOnSave]: {
                markdownDescription: nls.localize(39, null),
                type: 'object',
                additionalProperties: {
                    type: 'string',
                    enum: ['explicit', 'never'],
                    // enum: ['explicit', 'always', 'never'], -- autosave support needs to be built first
                    // nls.localize('always', 'Always triggers Code Actions on save, including autosave, focus, and window change events.'),
                    enumDescriptions: [nls.localize(40, null), nls.localize(41, null)],
                },
                default: {}
            },
            [notebookCommon_1.$7H.formatOnCellExecution]: {
                markdownDescription: nls.localize(42, null),
                type: 'boolean',
                default: false
            },
            [notebookCommon_1.$7H.confirmDeleteRunningCell]: {
                markdownDescription: nls.localize(43, null),
                type: 'boolean',
                default: true
            },
            [notebookCommon_1.$7H.findScope]: {
                markdownDescription: nls.localize(44, null),
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
            [notebookCommon_1.$7H.remoteSaving]: {
                markdownDescription: nls.localize(45, null),
                type: 'boolean',
                default: typeof product_1.default.quality === 'string' && product_1.default.quality !== 'stable' // only enable as default in insiders
            },
            [notebookCommon_1.$7H.cellExecutionScroll]: {
                markdownDescription: nls.localize(46, null, 'notebook.cell.executeAndSelectBelow'),
                type: 'string',
                enum: ['fullCell', 'firstLine', 'none'],
                markdownEnumDescriptions: [
                    nls.localize(47, null),
                    nls.localize(48, null),
                    nls.localize(49, null),
                ],
                default: 'fullCell'
            }
        }
    });
});
//# sourceMappingURL=notebook.contribution.js.map