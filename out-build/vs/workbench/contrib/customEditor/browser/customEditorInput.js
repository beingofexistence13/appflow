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
    var $kfb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$kfb = void 0;
    let $kfb = class $kfb extends webviewWorkbenchService_1.$ifb {
        static { $kfb_1 = this; }
        static create(instantiationService, resource, viewType, group, options) {
            return instantiationService.invokeFunction(accessor => {
                // If it's an untitled file we must populate the untitledDocumentData
                const untitledString = accessor.get(untitledTextEditorService_1.$tD).getValue(resource);
                const untitledDocumentData = untitledString ? buffer_1.$Fd.fromString(untitledString) : undefined;
                const webview = accessor.get(webview_1.$Lbb).createWebviewOverlay({
                    providedViewType: viewType,
                    title: undefined,
                    options: { customClasses: options?.customClasses },
                    contentOptions: {},
                    extension: undefined,
                });
                const input = instantiationService.createInstance($kfb_1, { resource, viewType }, webview, { untitledDocumentData: untitledDocumentData, oldResource: options?.oldResource });
                if (typeof group !== 'undefined') {
                    input.updateGroup(group);
                }
                return input;
            });
        }
        static { this.typeId = 'workbench.editors.webviewEditor'; }
        get resource() { return this.D; }
        constructor(init, webview, options, webviewWorkbenchService, J, L, M, N, O, P, Q) {
            super({ providedId: init.viewType, viewType: init.viewType, name: '' }, webview, webviewWorkbenchService);
            this.J = J;
            this.L = L;
            this.M = M;
            this.N = N;
            this.O = O;
            this.P = P;
            this.Q = Q;
            this.W = undefined;
            this.Y = undefined;
            this.$ = undefined;
            this.bb = undefined;
            this.db = undefined;
            this.fb = undefined;
            this.D = init.resource;
            this.oldResource = options.oldResource;
            this.F = options.startsDirty;
            this.G = options.backupId;
            this.H = options.untitledDocumentData;
            this.R();
        }
        R() {
            // Clear our labels on certain label related events
            this.B(this.L.onDidChangeFormatters(e => this.S(e.scheme)));
            this.B(this.P.onDidChangeFileSystemProviderRegistrations(e => this.S(e.scheme)));
            this.B(this.P.onDidChangeFileSystemProviderCapabilities(e => this.S(e.scheme)));
        }
        S(scheme) {
            if (scheme === this.resource.scheme) {
                this.U();
            }
        }
        U() {
            // Clear any cached labels from before
            this.W = undefined;
            this.Y = undefined;
            this.$ = undefined;
            this.bb = undefined;
            this.db = undefined;
            this.fb = undefined;
            // Trigger recompute of label
            this.b.fire();
        }
        get typeId() {
            return $kfb_1.typeId;
        }
        get editorId() {
            return this.viewType;
        }
        get capabilities() {
            let capabilities = 0 /* EditorInputCapabilities.None */;
            capabilities |= 128 /* EditorInputCapabilities.CanDropIntoEditor */;
            if (!this.M.getCustomEditorCapabilities(this.viewType)?.supportsMultipleEditorsPerDocument) {
                capabilities |= 8 /* EditorInputCapabilities.Singleton */;
            }
            if (this.I) {
                if (this.I.object.isReadonly()) {
                    capabilities |= 2 /* EditorInputCapabilities.Readonly */;
                }
            }
            else {
                if (this.Q.isReadonly(this.resource)) {
                    capabilities |= 2 /* EditorInputCapabilities.Readonly */;
                }
            }
            if (this.resource.scheme === network_1.Schemas.untitled) {
                capabilities |= 4 /* EditorInputCapabilities.Untitled */;
            }
            return capabilities;
        }
        getName() {
            return (0, path_1.$ae)(this.L.getUriLabel(this.resource));
        }
        getDescription(verbosity = 1 /* Verbosity.MEDIUM */) {
            switch (verbosity) {
                case 0 /* Verbosity.SHORT */:
                    return this.X;
                case 2 /* Verbosity.LONG */:
                    return this.ab;
                case 1 /* Verbosity.MEDIUM */:
                default:
                    return this.Z;
            }
        }
        get X() {
            if (typeof this.W !== 'string') {
                this.W = this.L.getUriBasenameLabel((0, resources_1.$hg)(this.resource));
            }
            return this.W;
        }
        get Z() {
            if (typeof this.Y !== 'string') {
                this.Y = this.L.getUriLabel((0, resources_1.$hg)(this.resource), { relative: true });
            }
            return this.Y;
        }
        get ab() {
            if (typeof this.$ !== 'string') {
                this.$ = this.L.getUriLabel((0, resources_1.$hg)(this.resource));
            }
            return this.$;
        }
        get cb() {
            if (typeof this.bb !== 'string') {
                this.bb = this.getName();
            }
            return this.bb;
        }
        get eb() {
            if (typeof this.db !== 'string') {
                this.db = this.L.getUriLabel(this.resource, { relative: true });
            }
            return this.db;
        }
        get gb() {
            if (typeof this.fb !== 'string') {
                this.fb = this.L.getUriLabel(this.resource);
            }
            return this.fb;
        }
        getTitle(verbosity) {
            switch (verbosity) {
                case 0 /* Verbosity.SHORT */:
                    return this.cb;
                case 2 /* Verbosity.LONG */:
                    return this.gb;
                default:
                case 1 /* Verbosity.MEDIUM */:
                    return this.eb;
            }
        }
        matches(other) {
            if (super.matches(other)) {
                return true;
            }
            return this === other || (other instanceof $kfb_1
                && this.viewType === other.viewType
                && (0, resources_1.$bg)(this.resource, other.resource));
        }
        copy() {
            return $kfb_1.create(this.J, this.resource, this.viewType, this.group, this.webview.options);
        }
        isReadonly() {
            if (!this.I) {
                return this.Q.isReadonly(this.resource);
            }
            return this.I.object.isReadonly();
        }
        isDirty() {
            if (!this.I) {
                return !!this.F;
            }
            return this.I.object.isDirty();
        }
        async save(groupId, options) {
            if (!this.I) {
                return undefined;
            }
            const target = await this.I.object.saveCustomEditor(options);
            if (!target) {
                return undefined; // save cancelled
            }
            // Different URIs == untyped input returned to allow resolver to possibly resolve to a different editor type
            if (!(0, resources_1.$bg)(target, this.resource)) {
                return { resource: target };
            }
            return this;
        }
        async saveAs(groupId, options) {
            if (!this.I) {
                return undefined;
            }
            const dialogPath = this.D;
            const target = await this.N.pickFileToSave(dialogPath, options?.availableFileSystems);
            if (!target) {
                return undefined; // save cancelled
            }
            if (!await this.I.object.saveCustomEditorAs(this.D, target, options)) {
                return undefined;
            }
            return (await this.rename(groupId, target))?.editor;
        }
        async revert(group, options) {
            if (this.I) {
                return this.I.object.revert(options);
            }
            this.F = false;
            this.a.fire();
        }
        async resolve() {
            await super.resolve();
            if (this.isDisposed()) {
                return null;
            }
            if (!this.I) {
                const oldCapabilities = this.capabilities;
                this.I = this.B((0, types_1.$uf)(await this.M.models.tryRetain(this.resource, this.viewType)));
                this.B(this.I.object.onDidChangeDirty(() => this.a.fire()));
                this.B(this.I.object.onDidChangeReadonly(() => this.f.fire()));
                // If we're loading untitled file data we should ensure it's dirty
                if (this.H) {
                    this.F = true;
                }
                if (this.isDirty()) {
                    this.a.fire();
                }
                if (this.capabilities !== oldCapabilities) {
                    this.f.fire();
                }
            }
            return null;
        }
        async rename(group, newResource) {
            // We return an untyped editor input which can then be resolved in the editor service
            return { editor: { resource: newResource } };
        }
        undo() {
            (0, types_1.$uf)(this.I);
            return this.O.undo(this.resource);
        }
        redo() {
            (0, types_1.$uf)(this.I);
            return this.O.redo(this.resource);
        }
        onMove(handler) {
            // TODO: Move this to the service
            this.hb = handler;
        }
        u(other) {
            if (!super.u(other)) {
                return;
            }
            other.hb = this.hb;
            this.hb = undefined;
            return other;
        }
        get backupId() {
            if (this.I) {
                return this.I.object.backupId;
            }
            return this.G;
        }
        get untitledDocumentData() {
            return this.H;
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
    exports.$kfb = $kfb;
    exports.$kfb = $kfb = $kfb_1 = __decorate([
        __param(3, webviewWorkbenchService_1.$hfb),
        __param(4, instantiation_1.$Ah),
        __param(5, label_1.$Vz),
        __param(6, customEditor_1.$8eb),
        __param(7, dialogs_1.$qA),
        __param(8, undoRedo_1.$wu),
        __param(9, files_1.$6j),
        __param(10, filesConfigurationService_1.$yD)
    ], $kfb);
});
//# sourceMappingURL=customEditorInput.js.map