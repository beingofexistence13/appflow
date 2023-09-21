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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/customEditor/browser/customEditorInput", "vs/workbench/contrib/customEditor/common/customEditor", "vs/workbench/contrib/notebook/common/notebookEditorInput", "vs/workbench/contrib/webview/browser/webview", "vs/workbench/contrib/webviewPanel/browser/webviewEditorInputSerializer", "vs/workbench/contrib/webviewPanel/browser/webviewWorkbenchService", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/workbench/services/workingCopy/common/workingCopyEditorService"], function (require, exports, lifecycle_1, network_1, resources_1, uri_1, instantiation_1, customEditorInput_1, customEditor_1, notebookEditorInput_1, webview_1, webviewEditorInputSerializer_1, webviewWorkbenchService_1, workingCopyBackup_1, workingCopyEditorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ComplexCustomWorkingCopyEditorHandler = exports.CustomEditorInputSerializer = void 0;
    let CustomEditorInputSerializer = class CustomEditorInputSerializer extends webviewEditorInputSerializer_1.WebviewEditorInputSerializer {
        static { this.ID = customEditorInput_1.CustomEditorInput.typeId; }
        constructor(webviewWorkbenchService, _instantiationService, _webviewService) {
            super(webviewWorkbenchService);
            this._instantiationService = _instantiationService;
            this._webviewService = _webviewService;
        }
        serialize(input) {
            const dirty = input.isDirty();
            const data = {
                ...this.toJson(input),
                editorResource: input.resource.toJSON(),
                dirty,
                backupId: dirty ? input.backupId : undefined,
            };
            try {
                return JSON.stringify(data);
            }
            catch {
                return undefined;
            }
        }
        fromJson(data) {
            return {
                ...super.fromJson(data),
                editorResource: uri_1.URI.from(data.editorResource),
                dirty: data.dirty,
            };
        }
        deserialize(_instantiationService, serializedEditorInput) {
            const data = this.fromJson(JSON.parse(serializedEditorInput));
            const webview = reviveWebview(this._webviewService, data);
            const customInput = this._instantiationService.createInstance(customEditorInput_1.CustomEditorInput, { resource: data.editorResource, viewType: data.viewType }, webview, { startsDirty: data.dirty, backupId: data.backupId });
            if (typeof data.group === 'number') {
                customInput.updateGroup(data.group);
            }
            return customInput;
        }
    };
    exports.CustomEditorInputSerializer = CustomEditorInputSerializer;
    exports.CustomEditorInputSerializer = CustomEditorInputSerializer = __decorate([
        __param(0, webviewWorkbenchService_1.IWebviewWorkbenchService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, webview_1.IWebviewService)
    ], CustomEditorInputSerializer);
    function reviveWebview(webviewService, data) {
        const webview = webviewService.createWebviewOverlay({
            providedViewType: data.viewType,
            origin: data.origin,
            title: undefined,
            options: {
                purpose: "customEditor" /* WebviewContentPurpose.CustomEditor */,
                enableFindWidget: data.webviewOptions.enableFindWidget,
                retainContextWhenHidden: data.webviewOptions.retainContextWhenHidden,
            },
            contentOptions: data.contentOptions,
            extension: data.extension,
        });
        webview.state = data.state;
        return webview;
    }
    let ComplexCustomWorkingCopyEditorHandler = class ComplexCustomWorkingCopyEditorHandler extends lifecycle_1.Disposable {
        constructor(_instantiationService, _workingCopyEditorService, _workingCopyBackupService, _webviewService, _customEditorService // DO NOT REMOVE (needed on startup to register overrides properly)
        ) {
            super();
            this._instantiationService = _instantiationService;
            this._workingCopyBackupService = _workingCopyBackupService;
            this._webviewService = _webviewService;
            this._register(_workingCopyEditorService.registerHandler(this));
        }
        handles(workingCopy) {
            return workingCopy.resource.scheme === network_1.Schemas.vscodeCustomEditor;
        }
        isOpen(workingCopy, editor) {
            if (!this.handles(workingCopy)) {
                return false;
            }
            if (workingCopy.resource.authority === 'jupyter-notebook-ipynb' && editor instanceof notebookEditorInput_1.NotebookEditorInput) {
                try {
                    const data = JSON.parse(workingCopy.resource.query);
                    const workingCopyResource = uri_1.URI.from(data);
                    return (0, resources_1.isEqual)(workingCopyResource, editor.resource);
                }
                catch {
                    return false;
                }
            }
            if (!(editor instanceof customEditorInput_1.CustomEditorInput)) {
                return false;
            }
            if (workingCopy.resource.authority !== editor.viewType.replace(/[^a-z0-9\-_]/gi, '-').toLowerCase()) {
                return false;
            }
            // The working copy stores the uri of the original resource as its query param
            try {
                const data = JSON.parse(workingCopy.resource.query);
                const workingCopyResource = uri_1.URI.from(data);
                return (0, resources_1.isEqual)(workingCopyResource, editor.resource);
            }
            catch {
                return false;
            }
        }
        async createEditor(workingCopy) {
            const backup = await this._workingCopyBackupService.resolve(workingCopy);
            if (!backup?.meta) {
                throw new Error(`No backup found for custom editor: ${workingCopy.resource}`);
            }
            const backupData = backup.meta;
            const extension = (0, webviewEditorInputSerializer_1.reviveWebviewExtensionDescription)(backupData.extension?.id, backupData.extension?.location);
            const webview = reviveWebview(this._webviewService, {
                viewType: backupData.viewType,
                origin: backupData.webview.origin,
                webviewOptions: (0, webviewEditorInputSerializer_1.restoreWebviewOptions)(backupData.webview.options),
                contentOptions: (0, webviewEditorInputSerializer_1.restoreWebviewContentOptions)(backupData.webview.options),
                state: backupData.webview.state,
                extension,
            });
            const editor = this._instantiationService.createInstance(customEditorInput_1.CustomEditorInput, { resource: uri_1.URI.revive(backupData.editorResource), viewType: backupData.viewType }, webview, { backupId: backupData.backupId });
            editor.updateGroup(0);
            return editor;
        }
    };
    exports.ComplexCustomWorkingCopyEditorHandler = ComplexCustomWorkingCopyEditorHandler;
    exports.ComplexCustomWorkingCopyEditorHandler = ComplexCustomWorkingCopyEditorHandler = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, workingCopyEditorService_1.IWorkingCopyEditorService),
        __param(2, workingCopyBackup_1.IWorkingCopyBackupService),
        __param(3, webview_1.IWebviewService),
        __param(4, customEditor_1.ICustomEditorService)
    ], ComplexCustomWorkingCopyEditorHandler);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tRWRpdG9ySW5wdXRGYWN0b3J5LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY3VzdG9tRWRpdG9yL2Jyb3dzZXIvY3VzdG9tRWRpdG9ySW5wdXRGYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWdEekYsSUFBTSwyQkFBMkIsR0FBakMsTUFBTSwyQkFBNEIsU0FBUSwyREFBNEI7aUJBRTVDLE9BQUUsR0FBRyxxQ0FBaUIsQ0FBQyxNQUFNLEFBQTNCLENBQTRCO1FBRTlELFlBQzJCLHVCQUFpRCxFQUNuQyxxQkFBNEMsRUFDbEQsZUFBZ0M7WUFFbEUsS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUM7WUFIUywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQ2xELG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtRQUduRSxDQUFDO1FBRWUsU0FBUyxDQUFDLEtBQXdCO1lBQ2pELE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUM5QixNQUFNLElBQUksR0FBMkI7Z0JBQ3BDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7Z0JBQ3JCLGNBQWMsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRTtnQkFDdkMsS0FBSztnQkFDTCxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTO2FBQzVDLENBQUM7WUFFRixJQUFJO2dCQUNILE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUM1QjtZQUFDLE1BQU07Z0JBQ1AsT0FBTyxTQUFTLENBQUM7YUFDakI7UUFDRixDQUFDO1FBRWtCLFFBQVEsQ0FBQyxJQUE0QjtZQUN2RCxPQUFPO2dCQUNOLEdBQUcsS0FB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