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
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/network", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/types", "vs/platform/dialogs/common/dialogs", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/contrib/customEditor/common/customEditor", "vs/workbench/contrib/webview/browser/webview", "vs/workbench/contrib/webviewPanel/browser/webviewWorkbenchService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/untitled/common/untitledTextEditorService"], function (require, exports, buffer_1, network_1, path_1, resources_1, types_1, dialogs_1, files_1, instantiation_1, label_1, undoRedo_1, customEditor_1, webview_1, webviewWorkbenchService_1, filesConfigurationService_1, untitledTextEditorService_1) {
    "use strict";
    var CustomEditorInput_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CustomEditorInput = void 0;
    let CustomEditorInput = class CustomEditorInput extends webviewWorkbenchService_1.LazilyResolvedWebviewEditorInput {
        static { CustomEditorInput_1 = this; }
        static create(instantiationService, resource, viewType, group, options) {
            return instantiationService.invokeFunction(accessor => {
                // If it's an untitled file we must populate the untitledDocumentData
                const untitledString = accessor.get(untitledTextEditorService_1.IUntitledTextEditorService).getValue(resource);
                const untitledDocumentData = untitledString ? buffer_1.VSBuffer.fromString(untitledString) : undefined;
                const webview = accessor.get(webview_1.IWebviewService).createWebviewOverlay({
                    providedViewType: viewType,
                    title: undefined,
                    options: { customClasses: options?.customClasses },
                    contentOptions: {},
                    extension: undefined,
                });
                const input = instantiationService.createInstance(CustomEditorInput_1, { resource, viewType }, webview, { untitledDocumentData: untitledDocumentData, oldResource: options?.oldResource });
                if (typeof group !== 'undefined') {
                    input.updateGroup(group);
                }
                return input;
            });
        }
        static { this.typeId = 'workbench.editors.webviewEditor'; }
        get resource() { return this._editorResource; }
        constructor(init, webview, options, webviewWorkbenchService, instantiationService, labelService, customEditorService, fileDialogService, undoRedoService, fileService, filesConfigurationService) {
            super({ providedId: init.viewType, viewType: init.viewType, name: '' }, webview, webviewWorkbenchService);
            this.instantiationService = instantiationService;
            this.labelService = labelService;
            this.customEditorService = customEditorService;
            this.fileDialogService = fileDialogService;
            this.undoRedoService = undoRedoService;
            this.fileService = fileService;
            this.filesConfigurationService = filesConfigurationService;
            this._shortDescription = undefined;
            this._mediumDescription = undefined;
            this._longDescription = undefined;
            this._shortTitle = undefined;
            this._mediumTitle = undefined;
            this._longTitle = undefined;
            this._editorResource = init.resource;
            this.oldResource = options.oldResource;
            this._defaultDirtyState = options.startsDirty;
            this._backupId = options.backupId;
            this._untitledDocumentData = options.untitledDocumentData;
            this.registerListeners();
        }
        registerListeners() {
            // Clear our labels on certain label related events
            this._register(this.labelService.onDidChangeFormatters(e => this.onLabelEvent(e.scheme)));
            this._register(this.fileService.onDidChangeFileSystemProviderRegistrations(e => this.onLabelEvent(e.scheme)));
            this._register(this.fileService.onDidChangeFileSystemProviderCapabilities(e => this.onLabelEvent(e.scheme)));
        }
        onLabelEvent(scheme) {
            if (scheme === this.resource.scheme) {
                this.updateLabel();
            }
        }
        updateLabel() {
            // Clear any cached labels from before
            this._shortDescription = undefined;
            this._mediumDescription = undefined;
            this._longDescription = undefined;
            this._shortTitle = undefined;
            this._mediumTitle = undefined;
            this._longTitle = undefined;
            // Trigger recompute of label
            this._onDidChangeLabel.fire();
        }
        get typeId() {
            return CustomEditorInput_1.typeId;
        }
        get editorId() {
            return this.viewType;
        }
        get capabilities() {
            let capabilities = 0 /* EditorInputCapabilities.None */;
            capabilities |= 128 /* EditorInputCapabilities.CanDropIntoEditor */;
            if (!this.customEditorService.getCustomEditorCapabilities(this.viewType)?.supportsMultipleEditorsPerDocument) {
                capabilities |= 8 /* EditorInputCapabilities.Singleton */;
            }
            if (this._modelRef) {
                if (this._modelRef.object.isReadonly()) {
                    capabilities |= 2 /* EditorInputCapabilities.Readonly */;
                }
            }
            else {
                if (this.filesConfigurationService.isReadonly(this.resource)) {
                    capabilities |= 2 /* EditorInputCapabilities.Readonly */;
                }
            }
            if (this.resource.scheme === network_1.Schemas.untitled) {
                capabilities |= 4 /* EditorInputCapabilities.Untitled */;
            }
            return capabilities;
        }
        getName() {
            return (0, path_1.basename)(this.labelService.getUriLabel(this.resource));
        }
        getDescription(verbosity = 1 /* Verbosity.MEDIUM */) {
            switch (verbosity) {
                case 0 /* Verbosity.SHORT */:
                    return this.shortDescription;
                case 2 /* Verbosity.LONG */:
                    return this.longDescription;
                case 1 /* Verbosity.MEDIUM */:
                default:
                    return this.mediumDescription;
            }
        }
        get shortDescription() {
            if (typeof this._shortDescription !== 'string') {
                this._shortDescription = this.labelService.getUriBasenameLabel((0, resources_1.dirname)(this.resource));
            }
            return this._shortDescription;
        }
        get mediumDescription() {
            if (typeof this._mediumDescription !== 'string') {
                this._mediumDescription = this.labelService.getUriLabel((0, resources_1.dirname)(this.resource), { relative: true });
            }
            return this._mediumDescription;
        }
        get longDescription() {
            if (typeof this._longDescription !== 'string') {
                this._longDescription = this.labelService.getUriLabel((0, resources_1.dirname)(this.resource));
            }
            return this._longDescription;
        }
        get shortTitle() {
            if (typeof this._shortTitle !== 'string') {
                this._shortTitle = this.getName();
            }
            return this._shortTitle;
        }
        get mediumTitle() {
            if (typeof this._mediumTitle !== 'string') {
                this._mediumTitle = this.labelService.getUriLabel(this.resource, { relative: true });
            }
            return this._mediumTitle;
        }
        get longTitle() {
            if (typeof this._longTitle !== 'string') {
                this._longTitle = this.labelService.getUriLabel(this.resource);
            }
            return this._longTitle;
        }
        getTitle(verbosity) {
            switch (verbosity) {
                case 0 /* Verbosity.SHORT */:
                    return this.shortTitle;
                case 2 /* Verbosity.LONG */:
                    return this.longTitle;
                default:
                case 1 /* Verbosity.MEDIUM */:
                    return this.mediumTitle;
            }
        }
        matches(other) {
            if (super.matches(other)) {
                return true;
            }
            return this === other || (other instanceof CustomEditorInput_1
                && this.viewType === other.viewType
                && (0, resources_1.isEqual)(this.resource, other.resource));
        }
        copy() {
            return CustomEditorInput_1.create(this.instantiationService, this.resource, this.viewType, this.group, this.webview.options);
        }
        isReadonly() {
            if (!this._modelRef) {
                return this.filesConfigurationService.isReadonly(this.resource);
            }
            return this._modelRef.object.isReadonly();
        }
        isDirty() {
            if (!this._modelRef) {
                return !!this._defaultDirtyState;
            }
            return this._modelRef.object.isDirty();
        }
        async save(groupId, options) {
            if (!this._modelRef) {
                return undefined;
            }
            const target = await this._modelRef.object.saveCustomEditor(options);
            if (!target) {
                return undefined; // save cancelled
            }
            // Different URIs == untyped input returned to allow resolver to possibly resolve to a different editor type
            if (!(0, resources_1.isEqual)(target, this.resource)) {
                return { resource: target };
            }
            return this;
        }
        async saveAs(groupId, options) {
            if (!this._modelRef) {
                return undefined;
            }
            const dialogPath = this._editorResource;
            const target = await this.fileDialogService.pickFileToSave(dialogPath, options?.availableFileSystems);
            if (!target) {
                return undefined; // save cancelled
            }
            if (!await this._modelRef.object.saveCustomEditorAs(this._editorResource, target, options)) {
                return undefined;
            }
            return (await this.rename(groupId, target))?.editor;
        }
        async revert(group, options) {
            if (this._modelRef) {
                return this._modelRef.object.revert(options);
            }
            this._defaultDirtyState = false;
            this._onDidChangeDirty.fire();
        }
        async resolve() {
            await super.resolve();
            if (this.isDisposed()) {
                return null;
            }
            if (!this._modelRef) {
                const oldCapabilities = this.capabilities;
                this._modelRef = this._register((0, types_1.assertIsDefined)(await this.customEditorService.models.tryRetain(this.resource, this.viewType)));
                this._register(this._modelRef.object.onDidChangeDirty(() => this._onDidChangeDirty.fire()));
                this._register(this._modelRef.object.onDidChangeReadonly(() => this._onDidChangeCapabilities.fire()));
                // If we're loading untitled file data we should ensure it's dirty
                if (this._untitledDocumentData) {
                    this._defaultDirtyState = true;
                }
                if (this.isDirty()) {
                    this._onDidChangeDirty.fire();
                }
                if (this.capabilities !== oldCapabilities) {
                    this._onDidChangeCapabilities.fire();
                }
            }
            return null;
        }
        async rename(group, newResource) {
            // We return an untyped editor input which can then be resolved in the editor service
            return { editor: { resource: newResource } };
        }
        undo() {
            (0, types_1.assertIsDefined)(this._modelRef);
            return this.undoRedoService.undo(this.resource);
        }
        redo() {
            (0, types_1.assertIsDefined)(this._modelRef);
            return this.undoRedoService.redo(this.resource);
        }
        onMove(handler) {
            // TODO: Move this to the service
            this._moveHandler = handler;
        }
        transfer(other) {
            if (!super.transfer(other)) {
                return;
            }
            other._moveHandler = this._moveHandler;
            this._moveHandler = undefined;
            return other;
        }
        get backupId() {
            if (this._modelRef) {
                return this._modelRef.object.backupId;
            }
            return this._backupId;
        }
        get untitledDocumentData() {
            return this._untitledDocumentData;
        }
        toUntyped() {
            return {
                resource: this.resource,
                options: {
                    override: this.viewType
                }
            };
        }
    };
    exports.CustomEditorInput = CustomEditorInput;
    exports.CustomEditorInput = CustomEditorInput = CustomEditorInput_1 = __decorate([
        __param(3, webviewWorkbenchService_1.IWebviewWorkbenchService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, label_1.ILabelService),
        __param(6, customEditor_1.ICustomEditorService),
        __param(7, dialogs_1.IFileDialogService),
        __param(8, undoRedo_1.IUndoRedoService),
        __param(9, files_1.IFileService),
        __param(10, filesConfigurationService_1.IFilesConfigurationService)
    ], CustomEditorInput);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tRWRpdG9ySW5wdXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jdXN0b21FZGl0b3IvYnJvd3Nlci9jdXN0b21FZGl0b3JJbnB1dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBNkJ6RixJQUFNLGlCQUFpQixHQUF2QixNQUFNLGlCQUFrQixTQUFRLDBEQUFnQzs7UUFFdEUsTUFBTSxDQUFDLE1BQU0sQ0FDWixvQkFBMkMsRUFDM0MsUUFBYSxFQUNiLFFBQWdCLEVBQ2hCLEtBQWtDLEVBQ2xDLE9BQXlFO1lBRXpFLE9BQU8sb0JBQW9CLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUNyRCxxRUFBcUU7Z0JBQ3JFLE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsc0RBQTBCLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ25GLE1BQU0sb0JBQW9CLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxpQkFBUSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO2dCQUM5RixNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHlCQUFlLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQztvQkFDbEUsZ0JBQWdCLEVBQUUsUUFBUTtvQkFDMUIsS0FBSyxFQUFFLFNBQVM7b0JBQ2hCLE9BQU8sRUFBRSxFQUFFLGFBQWEsRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFFO29CQUNsRCxjQUFjLEVBQUUsRUFBRTtvQkFDbEIsU0FBUyxFQUFFLFNBQVM7aUJBQ3BCLENBQUMsQ0FBQztnQkFDSCxNQUFNLEtBQUssR0FBRyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsbUJBQWlCLEVBQUUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFF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