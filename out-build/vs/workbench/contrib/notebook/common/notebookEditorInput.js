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
define(["require", "exports", "vs/base/common/glob", "vs/workbench/contrib/notebook/common/notebookService", "vs/base/common/resources", "vs/platform/instantiation/common/instantiation", "vs/platform/dialogs/common/dialogs", "vs/workbench/contrib/notebook/common/notebookEditorModelResolverService", "vs/platform/label/common/label", "vs/base/common/network", "vs/platform/files/common/files", "vs/workbench/common/editor/resourceEditorInput", "vs/base/common/errors", "vs/base/common/buffer", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/extensions/common/extensions", "vs/nls!vs/workbench/contrib/notebook/common/notebookEditorInput", "vs/workbench/services/editor/common/editorService"], function (require, exports, glob, notebookService_1, resources_1, instantiation_1, dialogs_1, notebookEditorModelResolverService_1, label_1, network_1, files_1, resourceEditorInput_1, errors_1, buffer_1, filesConfigurationService_1, extensions_1, nls_1, editorService_1) {
    "use strict";
    var $zbb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Abb = exports.$zbb = void 0;
    let $zbb = class $zbb extends resourceEditorInput_1.$xbb {
        static { $zbb_1 = this; }
        static create(instantiationService, resource, viewType, options = {}) {
            return instantiationService.createInstance($zbb_1, resource, viewType, options);
        }
        static { this.ID = 'workbench.input.notebook'; }
        constructor(resource, viewType, options, Q, R, S, U, labelService, fileService, filesConfigurationService, extensionService, editorService) {
            super(resource, undefined, labelService, fileService, filesConfigurationService);
            this.viewType = viewType;
            this.options = options;
            this.Q = Q;
            this.R = R;
            this.S = S;
            this.U = U;
            this.N = null;
            this.P = false;
            this.P = !!options.startDirty;
            // Automatically resolve this input when the "wanted" model comes to life via
            // some other way. This happens only once per input and resolve disposes
            // this listener
            this.O = Q.onDidAddNotebookDocument(e => {
                if (e.viewType === this.viewType && e.uri.toString() === this.resource.toString()) {
                    this.resolve().catch(errors_1.$Y);
                }
            });
            this.B(extensionService.onWillStop(e => {
                if (!this.isDirty()) {
                    return;
                }
                e.veto((async () => {
                    const editors = editorService.findEditors(this);
                    if (editors.length > 0) {
                        const result = await editorService.save(editors[0]);
                        if (result.success) {
                            return false; // Don't Veto
                        }
                    }
                    return true; // Veto
                })(), (0, nls_1.localize)(0, null, this.resource.path));
            }));
        }
        dispose() {
            this.O.dispose();
            this.N?.dispose();
            this.N = null;
            super.dispose();
        }
        get typeId() {
            return $zbb_1.ID;
        }
        get editorId() {
            return this.viewType;
        }
        get capabilities() {
            let capabilities = 0 /* EditorInputCapabilities.None */;
            if (this.resource.scheme === network_1.Schemas.untitled) {
                capabilities |= 4 /* EditorInputCapabilities.Untitled */;
            }
            if (this.N) {
                if (this.N.object.isReadonly()) {
                    capabilities |= 2 /* EditorInputCapabilities.Readonly */;
                }
            }
            else {
                if (this.n.isReadonly(this.resource)) {
                    capabilities |= 2 /* EditorInputCapabilities.Readonly */;
                }
            }
            if (!(capabilities & 2 /* EditorInputCapabilities.Readonly */)) {
                capabilities |= 128 /* EditorInputCapabilities.CanDropIntoEditor */;
            }
            return capabilities;
        }
        getDescription(verbosity = 1 /* Verbosity.MEDIUM */) {
            if (!this.hasCapability(4 /* EditorInputCapabilities.Untitled */) || this.N?.object.hasAssociatedFilePath()) {
                return super.getDescription(verbosity);
            }
            return undefined; // no description for untitled notebooks without associated file path
        }
        isReadonly() {
            if (!this.N) {
                return this.n.isReadonly(this.resource);
            }
            return this.N.object.isReadonly();
        }
        isDirty() {
            if (!this.N) {
                return this.P;
            }
            return this.N.object.isDirty();
        }
        isSaving() {
            const model = this.N?.object;
            if (!model || !model.isDirty() || model.hasErrorState || this.hasCapability(4 /* EditorInputCapabilities.Untitled */)) {
                return false; // require the model to be dirty, file-backed and not in an error state
            }
            // if a short auto save is configured, treat this as being saved
            return this.n.getAutoSaveMode() === 1 /* AutoSaveMode.AFTER_SHORT_DELAY */;
        }
        async save(group, options) {
            if (this.N) {
                if (this.hasCapability(4 /* EditorInputCapabilities.Untitled */)) {
                    return this.saveAs(group, options);
                }
                else {
                    await this.N.object.save(options);
                }
                return this;
            }
            return undefined;
        }
        async saveAs(group, options) {
            if (!this.N) {
                return undefined;
            }
            const provider = this.Q.getContributedNotebookType(this.viewType);
            if (!provider) {
                return undefined;
            }
            const pathCandidate = this.hasCapability(4 /* EditorInputCapabilities.Untitled */) ? await this.W(provider, this.j.getUriBasenameLabel(this.resource)) : this.N.object.resource;
            let target;
            if (this.N.object.hasAssociatedFilePath()) {
                target = pathCandidate;
            }
            else {
                target = await this.S.pickFileToSave(pathCandidate, options?.availableFileSystems);
                if (!target) {
                    return undefined; // save cancelled
                }
            }
            if (!provider.matches(target)) {
                const patterns = provider.selectors.map(pattern => {
                    if (typeof pattern === 'string') {
                        return pattern;
                    }
                    if (glob.$sj(pattern)) {
                        return `${pattern} (base ${pattern.base})`;
                    }
                    if (pattern.exclude) {
                        return `${pattern.include} (exclude: ${pattern.exclude})`;
                    }
                    else {
                        return `${pattern.include}`;
                    }
                }).join(', ');
                throw new Error(`File name ${target} is not supported by ${provider.providerDisplayName}.\n\nPlease make sure the file name matches following patterns:\n${patterns}`);
            }
            return await this.N.object.saveAs(target);
        }
        async W(provider, suggestedFilename) {
            // guess file extensions
            const firstSelector = provider.selectors[0];
            let selectorStr = firstSelector && typeof firstSelector === 'string' ? firstSelector : undefined;
            if (!selectorStr && firstSelector) {
                const include = firstSelector.include;
                if (typeof include === 'string') {
                    selectorStr = include;
                }
            }
            if (selectorStr) {
                const matches = /^\*\.([A-Za-z_-]*)$/.exec(selectorStr);
                if (matches && matches.length > 1) {
                    const fileExt = matches[1];
                    if (!suggestedFilename.endsWith(fileExt)) {
                        return (0, resources_1.$ig)(await this.S.defaultFilePath(), suggestedFilename + '.' + fileExt);
                    }
                }
            }
            return (0, resources_1.$ig)(await this.S.defaultFilePath(), suggestedFilename);
        }
        // called when users rename a notebook document
        async rename(group, target) {
            if (this.N) {
                const contributedNotebookProviders = this.Q.getContributedNotebookTypes(target);
                if (contributedNotebookProviders.find(provider => provider.id === this.N.object.viewType)) {
                    return this.X(group, target);
                }
            }
            return undefined;
        }
        X(_group, newResource) {
            const editorInput = $zbb_1.create(this.U, newResource, this.viewType);
            return { editor: editorInput };
        }
        async revert(_group, options) {
            if (this.N && this.N.object.isDirty()) {
                await this.N.object.revert(options);
            }
        }
        async resolve(_options, perf) {
            if (!await this.Q.canResolve(this.viewType)) {
                return null;
            }
            perf?.mark('extensionActivated');
            // we are now loading the notebook and don't need to listen to
            // "other" loading anymore
            this.O.dispose();
            if (!this.N) {
                const ref = await this.R.resolve(this.resource, this.viewType);
                if (this.N) {
                    // Re-entrant, double resolve happened. Dispose the addition references and proceed
                    // with the truth.
                    ref.dispose();
                    return this.N.object;
                }
                this.N = ref;
                if (this.isDisposed()) {
                    this.N.dispose();
                    this.N = null;
                    return null;
                }
                this.B(this.N.object.onDidChangeDirty(() => this.a.fire()));
                this.B(this.N.object.onDidChangeReadonly(() => this.f.fire()));
                this.B(this.N.object.onDidRevertUntitled(() => this.dispose()));
                if (this.N.object.isDirty()) {
                    this.a.fire();
                }
            }
            else {
                this.N.object.load();
            }
            if (this.options._backupId) {
                const info = await this.Q.withNotebookDataProvider(this.N.object.notebook.viewType);
                if (!(info instanceof notebookService_1.$vbb)) {
                    throw new Error('CANNOT open file notebook with this provider');
                }
                const data = await info.serializer.dataToNotebook(buffer_1.$Fd.fromString(JSON.stringify({ __webview_backup: this.options._backupId })));
                this.N.object.notebook.applyEdits([
                    {
                        editType: 1 /* CellEditType.Replace */,
                        index: 0,
                        count: this.N.object.notebook.length,
                        cells: data.cells
                    }
                ], true, undefined, () => undefined, undefined, false);
                if (this.options._workingCopy) {
                    this.options._backupId = undefined;
                    this.options._workingCopy = undefined;
                    this.options.startDirty = undefined;
                }
            }
            return this.N.object;
        }
        toUntyped() {
            return {
                resource: this.preferredResource,
                options: {
                    override: this.viewType
                }
            };
        }
        matches(otherInput) {
            if (super.matches(otherInput)) {
                return true;
            }
            if (otherInput instanceof $zbb_1) {
                return this.viewType === otherInput.viewType && (0, resources_1.$bg)(this.resource, otherInput.resource);
            }
            return false;
        }
    };
    exports.$zbb = $zbb;
    exports.$zbb = $zbb = $zbb_1 = __decorate([
        __param(3, notebookService_1.$ubb),
        __param(4, notebookEditorModelResolverService_1.$wbb),
        __param(5, dialogs_1.$qA),
        __param(6, instantiation_1.$Ah),
        __param(7, label_1.$Vz),
        __param(8, files_1.$6j),
        __param(9, filesConfigurationService_1.$yD),
        __param(10, extensions_1.$MF),
        __param(11, editorService_1.$9C)
    ], $zbb);
    function $Abb(thing) {
        return !!thing
            && typeof thing === 'object'
            && Array.isArray(thing.editorInputs)
            && (thing.editorInputs.every(input => input instanceof $zbb));
    }
    exports.$Abb = $Abb;
});
//# sourceMappingURL=notebookEditorInput.js.map