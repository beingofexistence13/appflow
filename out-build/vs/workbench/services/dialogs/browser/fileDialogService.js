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
define(["require", "exports", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/extensions", "vs/workbench/services/dialogs/browser/abstractFileDialogService", "vs/base/common/network", "vs/base/common/decorators", "vs/nls!vs/workbench/services/dialogs/browser/fileDialogService", "vs/base/common/mime", "vs/base/common/resources", "vs/base/browser/dom", "vs/base/common/severity", "vs/base/common/buffer", "vs/platform/dnd/browser/dnd", "vs/base/common/iterator", "vs/platform/files/browser/webFileSystemAccess"], function (require, exports, dialogs_1, extensions_1, abstractFileDialogService_1, network_1, decorators_1, nls_1, mime_1, resources_1, dom_1, severity_1, buffer_1, dnd_1, iterator_1, webFileSystemAccess_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$a4b = void 0;
    class $a4b extends abstractFileDialogService_1.$_3b {
        get K() {
            return this.h.getProvider(network_1.Schemas.file);
        }
        async pickFileFolderAndOpen(options) {
            const schema = this.H(options);
            if (!options.defaultUri) {
                options.defaultUri = await this.defaultFilePath(schema);
            }
            if (this.O(schema)) {
                return super.v(schema, options, false);
            }
            throw new Error((0, nls_1.localize)(0, null));
        }
        u(schema, isFolder) {
            return (schema === network_1.Schemas.untitled) ? [network_1.Schemas.file]
                : (((schema !== network_1.Schemas.file) && (!isFolder || (schema !== network_1.Schemas.vscodeRemote))) ? [schema, network_1.Schemas.file] : [schema]);
        }
        async pickFileAndOpen(options) {
            const schema = this.H(options);
            if (!options.defaultUri) {
                options.defaultUri = await this.defaultFilePath(schema);
            }
            if (this.O(schema)) {
                return super.w(schema, options, false);
            }
            if (!webFileSystemAccess_1.WebFileSystemAccess.supported(window)) {
                return this.N('open');
            }
            let fileHandle = undefined;
            try {
                ([fileHandle] = await window.showOpenFilePicker({ multiple: false }));
            }
            catch (error) {
                return; // `showOpenFilePicker` will throw an error when the user cancels
            }
            if (!webFileSystemAccess_1.WebFileSystemAccess.isFileSystemFileHandle(fileHandle)) {
                return;
            }
            const uri = await this.K.registerFileHandle(fileHandle);
            this.x(uri);
            await this.i.open(uri, { fromUserGesture: true, editorOptions: { pinned: true } });
        }
        async pickFolderAndOpen(options) {
            const schema = this.H(options);
            if (!options.defaultUri) {
                options.defaultUri = await this.defaultFolderPath(schema);
            }
            if (this.O(schema)) {
                return super.y(schema, options);
            }
            throw new Error((0, nls_1.localize)(1, null));
        }
        async pickWorkspaceAndOpen(options) {
            options.availableFileSystems = this.I(options);
            const schema = this.H(options);
            if (!options.defaultUri) {
                options.defaultUri = await this.defaultWorkspacePath(schema);
            }
            if (this.O(schema)) {
                return super.z(schema, options);
            }
            throw new Error((0, nls_1.localize)(2, null));
        }
        async pickFileToSave(defaultUri, availableFileSystems) {
            const schema = this.H({ defaultUri, availableFileSystems });
            const options = this.J(defaultUri, availableFileSystems);
            if (this.O(schema)) {
                return super.A(schema, options);
            }
            if (!webFileSystemAccess_1.WebFileSystemAccess.supported(window)) {
                return this.N('save');
            }
            let fileHandle = undefined;
            const startIn = iterator_1.Iterable.first(this.K.directories);
            try {
                fileHandle = await window.showSaveFilePicker({ types: this.M(options.filters), ...{ suggestedName: (0, resources_1.$fg)(defaultUri), startIn } });
            }
            catch (error) {
                return; // `showSaveFilePicker` will throw an error when the user cancels
            }
            if (!webFileSystemAccess_1.WebFileSystemAccess.isFileSystemFileHandle(fileHandle)) {
                return undefined;
            }
            return this.K.registerFileHandle(fileHandle);
        }
        M(filters) {
            return filters?.filter(filter => {
                return !((filter.extensions.length === 1) && ((filter.extensions[0] === '*') || filter.extensions[0] === ''));
            }).map(filter => {
                const accept = {};
                const extensions = filter.extensions.filter(ext => (ext.indexOf('-') < 0) && (ext.indexOf('*') < 0) && (ext.indexOf('_') < 0));
                accept[(0, mime_1.$Ir)(`fileName.${filter.extensions[0]}`) ?? 'text/plain'] = extensions.map(ext => ext.startsWith('.') ? ext : `.${ext}`);
                return {
                    description: filter.name,
                    accept
                };
            });
        }
        async showSaveDialog(options) {
            const schema = this.H(options);
            if (this.O(schema)) {
                return super.B(schema, options);
            }
            if (!webFileSystemAccess_1.WebFileSystemAccess.supported(window)) {
                return this.N('save');
            }
            let fileHandle = undefined;
            const startIn = iterator_1.Iterable.first(this.K.directories);
            try {
                fileHandle = await window.showSaveFilePicker({ types: this.M(options.filters), ...options.defaultUri ? { suggestedName: (0, resources_1.$fg)(options.defaultUri) } : undefined, ...{ startIn } });
            }
            catch (error) {
                return undefined; // `showSaveFilePicker` will throw an error when the user cancels
            }
            if (!webFileSystemAccess_1.WebFileSystemAccess.isFileSystemFileHandle(fileHandle)) {
                return undefined;
            }
            return this.K.registerFileHandle(fileHandle);
        }
        async showOpenDialog(options) {
            const schema = this.H(options);
            if (this.O(schema)) {
                return super.C(schema, options);
            }
            if (!webFileSystemAccess_1.WebFileSystemAccess.supported(window)) {
                return this.N('open');
            }
            let uri;
            const startIn = iterator_1.Iterable.first(this.K.directories) ?? 'documents';
            try {
                if (options.canSelectFiles) {
                    const handle = await window.showOpenFilePicker({ multiple: false, types: this.M(options.filters), ...{ startIn } });
                    if (handle.length === 1 && webFileSystemAccess_1.WebFileSystemAccess.isFileSystemFileHandle(handle[0])) {
                        uri = await this.K.registerFileHandle(handle[0]);
                    }
                }
                else {
                    const handle = await window.showDirectoryPicker({ ...{ startIn } });
                    uri = await this.K.registerDirectoryHandle(handle);
                }
            }
            catch (error) {
                // ignore - `showOpenFilePicker` / `showDirectoryPicker` will throw an error when the user cancels
            }
            return uri ? [uri] : undefined;
        }
        async N(context) {
            // When saving, try to just download the contents
            // of the active text editor if any as a workaround
            if (context === 'save') {
                const activeTextModel = this.q.getActiveCodeEditor()?.getModel();
                if (activeTextModel) {
                    (0, dom_1.$qP)(buffer_1.$Fd.fromString(activeTextModel.getValue()).buffer, (0, resources_1.$fg)(activeTextModel.uri));
                    return;
                }
            }
            // Otherwise inform the user about options
            const buttons = [
                {
                    label: (0, nls_1.localize)(3, null),
                    run: async () => { await this.o.executeCommand('workbench.action.remote.showMenu'); }
                },
                {
                    label: (0, nls_1.localize)(4, null),
                    run: async () => { await this.i.open('https://aka.ms/VSCodeWebLocalFileSystemAccess'); }
                }
            ];
            if (context === 'open') {
                buttons.push({
                    label: (0, nls_1.localize)(5, null),
                    run: async () => {
                        const files = await (0, dom_1.$rP)();
                        if (files) {
                            const filesData = (await this.f.invokeFunction(accessor => (0, dnd_1.$96)(accessor, files))).filter(fileData => !fileData.isDirectory);
                            if (filesData.length > 0) {
                                this.p.openEditors(filesData.map(fileData => {
                                    return {
                                        resource: fileData.resource,
                                        contents: fileData.contents?.toString(),
                                        options: { pinned: true }
                                    };
                                }));
                            }
                        }
                    }
                });
            }
            await this.j.prompt({
                type: severity_1.default.Warning,
                message: (0, nls_1.localize)(6, null),
                detail: (0, nls_1.localize)(7, null),
                buttons
            });
            return undefined;
        }
        O(scheme) {
            return ![network_1.Schemas.file, network_1.Schemas.vscodeUserData, network_1.Schemas.tmp].includes(scheme);
        }
    }
    exports.$a4b = $a4b;
    __decorate([
        decorators_1.$6g
    ], $a4b.prototype, "K", null);
    (0, extensions_1.$mr)(dialogs_1.$qA, $a4b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=fileDialogService.js.map