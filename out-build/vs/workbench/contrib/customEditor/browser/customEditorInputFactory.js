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
    exports.$slb = exports.$rlb = void 0;
    let $rlb = class $rlb extends webviewEditorInputSerializer_1.$nlb {
        static { this.ID = customEditorInput_1.$kfb.typeId; }
        constructor(webviewWorkbenchService, d, e) {
            super(webviewWorkbenchService);
            this.d = d;
            this.e = e;
        }
        serialize(input) {
            const dirty = input.isDirty();
            const data = {
                ...this.c(input),
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
        b(data) {
            return {
                ...super.b(data),
                editorResource: uri_1.URI.from(data.editorResource),
                dirty: data.dirty,
            };
        }
        deserialize(_instantiationService, serializedEditorInput) {
            const data = this.b(JSON.parse(serializedEditorInput));
            const webview = reviveWebview(this.e, data);
            const customInput = this.d.createInstance(customEditorInput_1.$kfb, { resource: data.editorResource, viewType: data.viewType }, webview, { startsDirty: data.dirty, backupId: data.backupId });
            if (typeof data.group === 'number') {
                customInput.updateGroup(data.group);
            }
            return customInput;
        }
    };
    exports.$rlb = $rlb;
    exports.$rlb = $rlb = __decorate([
        __param(0, webviewWorkbenchService_1.$hfb),
        __param(1, instantiation_1.$Ah),
        __param(2, webview_1.$Lbb)
    ], $rlb);
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
    let $slb = class $slb extends lifecycle_1.$kc {
        constructor(a, _workingCopyEditorService, b, c, _customEditorService // DO NOT REMOVE (needed on startup to register overrides properly)
        ) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.B(_workingCopyEditorService.registerHandler(this));
        }
        handles(workingCopy) {
            return workingCopy.resource.scheme === network_1.Schemas.vscodeCustomEditor;
        }
        isOpen(workingCopy, editor) {
            if (!this.handles(workingCopy)) {
                return false;
            }
            if (workingCopy.resource.authority === 'jupyter-notebook-ipynb' && editor instanceof notebookEditorInput_1.$zbb) {
                try {
                    const data = JSON.parse(workingCopy.resource.query);
                    const workingCopyResource = uri_1.URI.from(data);
                    return (0, resources_1.$bg)(workingCopyResource, editor.resource);
                }
                catch {
                    return false;
                }
            }
            if (!(editor instanceof customEditorInput_1.$kfb)) {
                return false;
            }
            if (workingCopy.resource.authority !== editor.viewType.replace(/[^a-z0-9\-_]/gi, '-').toLowerCase()) {
                return false;
            }
            // The working copy stores the uri of the original resource as its query param
            try {
                const data = JSON.parse(workingCopy.resource.query);
                const workingCopyResource = uri_1.URI.from(data);
                return (0, resources_1.$bg)(workingCopyResource, editor.resource);
            }
            catch {
                return false;
            }
        }
        async createEditor(workingCopy) {
            const backup = await this.b.resolve(workingCopy);
            if (!backup?.meta) {
                throw new Error(`No backup found for custom editor: ${workingCopy.resource}`);
            }
            const backupData = backup.meta;
            const extension = (0, webviewEditorInputSerializer_1.$olb)(backupData.extension?.id, backupData.extension?.location);
            const webview = reviveWebview(this.c, {
                viewType: backupData.viewType,
                origin: backupData.webview.origin,
                webviewOptions: (0, webviewEditorInputSerializer_1.$plb)(backupData.webview.options),
                contentOptions: (0, webviewEditorInputSerializer_1.$qlb)(backupData.webview.options),
                state: backupData.webview.state,
                extension,
            });
            const editor = this.a.createInstance(customEditorInput_1.$kfb, { resource: uri_1.URI.revive(backupData.editorResource), viewType: backupData.viewType }, webview, { backupId: backupData.backupId });
            editor.updateGroup(0);
            return editor;
        }
    };
    exports.$slb = $slb;
    exports.$slb = $slb = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, workingCopyEditorService_1.$AD),
        __param(2, workingCopyBackup_1.$EA),
        __param(3, webview_1.$Lbb),
        __param(4, customEditor_1.$8eb)
    ], $slb);
});
//# sourceMappingURL=customEditorInputFactory.js.map