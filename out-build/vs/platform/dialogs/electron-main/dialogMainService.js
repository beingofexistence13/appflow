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
define(["require", "exports", "electron", "vs/base/common/async", "vs/base/common/hash", "vs/base/common/labels", "vs/base/common/lifecycle", "vs/base/common/normalization", "vs/base/common/platform", "vs/base/node/pfs", "vs/nls!vs/platform/dialogs/electron-main/dialogMainService", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/workspace/common/workspace"], function (require, exports, electron_1, async_1, hash_1, labels_1, lifecycle_1, normalization_1, platform_1, pfs_1, nls_1, dialogs_1, instantiation_1, log_1, productService_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$O5b = exports.$N5b = void 0;
    exports.$N5b = (0, instantiation_1.$Bh)('dialogMainService');
    let $O5b = class $O5b {
        constructor(d, e) {
            this.d = d;
            this.e = e;
            this.a = new Map();
            this.b = new Map();
            this.c = new async_1.$Ng();
        }
        pickFileFolder(options, window) {
            return this.f({ ...options, pickFolders: true, pickFiles: true, title: (0, nls_1.localize)(0, null) }, window);
        }
        pickFolder(options, window) {
            return this.f({ ...options, pickFolders: true, title: (0, nls_1.localize)(1, null) }, window);
        }
        pickFile(options, window) {
            return this.f({ ...options, pickFiles: true, title: (0, nls_1.localize)(2, null) }, window);
        }
        pickWorkspace(options, window) {
            const title = (0, nls_1.localize)(3, null);
            const buttonLabel = (0, labels_1.$lA)((0, nls_1.localize)(4, null));
            const filters = workspace_1.$Zh;
            return this.f({ ...options, pickFiles: true, title, filters, buttonLabel }, window);
        }
        async f(options, window) {
            // Ensure dialog options
            const dialogOptions = {
                title: options.title,
                buttonLabel: options.buttonLabel,
                filters: options.filters,
                defaultPath: options.defaultPath
            };
            // Ensure properties
            if (typeof options.pickFiles === 'boolean' || typeof options.pickFolders === 'boolean') {
                dialogOptions.properties = undefined; // let it override based on the booleans
                if (options.pickFiles && options.pickFolders) {
                    dialogOptions.properties = ['multiSelections', 'openDirectory', 'openFile', 'createDirectory'];
                }
            }
            if (!dialogOptions.properties) {
                dialogOptions.properties = ['multiSelections', options.pickFolders ? 'openDirectory' : 'openFile', 'createDirectory'];
            }
            if (platform_1.$j) {
                dialogOptions.properties.push('treatPackageAsDirectory'); // always drill into .app files
            }
            // Show Dialog
            const result = await this.showOpenDialog(dialogOptions, (window || electron_1.BrowserWindow.getFocusedWindow()) ?? undefined);
            if (result && result.filePaths && result.filePaths.length > 0) {
                return result.filePaths;
            }
            return undefined;
        }
        g(window) {
            // Queue message box requests per window so that one can show
            // after the other.
            if (window) {
                let windowDialogQueue = this.b.get(window.id);
                if (!windowDialogQueue) {
                    windowDialogQueue = new async_1.$Ng();
                    this.b.set(window.id, windowDialogQueue);
                }
                return windowDialogQueue;
            }
            else {
                return this.c;
            }
        }
        showMessageBox(rawOptions, window) {
            return this.g(window).queue(async () => {
                const { options, buttonIndeces } = (0, dialogs_1.$sA)(rawOptions, this.e);
                let result = undefined;
                if (window) {
                    result = await electron_1.dialog.showMessageBox(window, options);
                }
                else {
                    result = await electron_1.dialog.showMessageBox(options);
                }
                return {
                    response: buttonIndeces[result.response],
                    checkboxChecked: result.checkboxChecked
                };
            });
        }
        async showSaveDialog(options, window) {
            // Prevent duplicates of the same dialog queueing at the same time
            const fileDialogLock = this.j(options, window);
            if (!fileDialogLock) {
                this.d.error('[DialogMainService]: file save dialog is already or will be showing for the window with the same configuration');
                return { canceled: true };
            }
            try {
                return await this.g(window).queue(async () => {
                    let result;
                    if (window) {
                        result = await electron_1.dialog.showSaveDialog(window, options);
                    }
                    else {
                        result = await electron_1.dialog.showSaveDialog(options);
                    }
                    result.filePath = this.h(result.filePath);
                    return result;
                });
            }
            finally {
                (0, lifecycle_1.$fc)(fileDialogLock);
            }
        }
        h(path) {
            if (path && platform_1.$j) {
                path = (0, normalization_1.$hl)(path); // macOS only: normalize paths to NFC form
            }
            return path;
        }
        i(paths) {
            return paths.map(path => this.h(path));
        }
        async showOpenDialog(options, window) {
            // Ensure the path exists (if provided)
            if (options.defaultPath) {
                const pathExists = await pfs_1.Promises.exists(options.defaultPath);
                if (!pathExists) {
                    options.defaultPath = undefined;
                }
            }
            // Prevent duplicates of the same dialog queueing at the same time
            const fileDialogLock = this.j(options, window);
            if (!fileDialogLock) {
                this.d.error('[DialogMainService]: file open dialog is already or will be showing for the window with the same configuration');
                return { canceled: true, filePaths: [] };
            }
            try {
                return await this.g(window).queue(async () => {
                    let result;
                    if (window) {
                        result = await electron_1.dialog.showOpenDialog(window, options);
                    }
                    else {
                        result = await electron_1.dialog.showOpenDialog(options);
                    }
                    result.filePaths = this.i(result.filePaths);
                    return result;
                });
            }
            finally {
                (0, lifecycle_1.$fc)(fileDialogLock);
            }
        }
        j(options, window) {
            // If no window is provided, allow as many dialogs as
            // needed since we consider them not modal per window
            if (!window) {
                return lifecycle_1.$kc.None;
            }
            // If a window is provided, only allow a single dialog
            // at the same time because dialogs are modal and we
            // do not want to open one dialog after the other
            // (https://github.com/microsoft/vscode/issues/114432)
            // we figure this out by `hashing` the configuration
            // options for the dialog to prevent duplicates
            this.d.trace('[DialogMainService]: request to acquire file dialog lock', options);
            let windowFileDialogLocks = this.a.get(window.id);
            if (!windowFileDialogLocks) {
                windowFileDialogLocks = new Set();
                this.a.set(window.id, windowFileDialogLocks);
            }
            const optionsHash = (0, hash_1.$pi)(options);
            if (windowFileDialogLocks.has(optionsHash)) {
                return undefined; // prevent duplicates, return
            }
            this.d.trace('[DialogMainService]: new file dialog lock created', options);
            windowFileDialogLocks.add(optionsHash);
            return (0, lifecycle_1.$ic)(() => {
                this.d.trace('[DialogMainService]: file dialog lock disposed', options);
                windowFileDialogLocks?.delete(optionsHash);
                // If the window has no more dialog locks, delete it from the set of locks
                if (windowFileDialogLocks?.size === 0) {
                    this.a.delete(window.id);
                }
            });
        }
    };
    exports.$O5b = $O5b;
    exports.$O5b = $O5b = __decorate([
        __param(0, log_1.$5i),
        __param(1, productService_1.$kj)
    ], $O5b);
});
//# sourceMappingURL=dialogMainService.js.map