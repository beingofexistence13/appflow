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
define(["require", "exports", "vs/base/common/event", "vs/workbench/test/browser/workbenchTestServices", "vs/platform/native/common/native", "vs/base/common/buffer", "vs/base/common/lifecycle", "vs/platform/dialogs/common/dialogs", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/textfile/common/textfiles", "vs/platform/extensionManagement/common/extensionTipsService", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionRecommendations/common/extensionRecommendations", "vs/platform/product/common/productService", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/editor/common/services/model", "vs/platform/workspace/common/workspace", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/workbench/services/textfile/electron-sandbox/nativeTextFileService", "vs/base/common/arrays", "vs/base/common/network", "vs/platform/files/common/fileService", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/platform/log/common/log", "vs/platform/userData/common/fileUserDataProvider", "vs/workbench/services/workingCopy/electron-sandbox/workingCopyBackupService", "vs/platform/uriIdentity/common/uriIdentityService", "vs/platform/userDataProfile/common/userDataProfile"], function (require, exports, event_1, workbenchTestServices_1, native_1, buffer_1, lifecycle_1, dialogs_1, environment_1, files_1, editorService_1, textfiles_1, extensionTipsService_1, extensionManagement_1, extensionRecommendations_1, productService_1, storage_1, telemetry_1, model_1, workspace_1, filesConfigurationService_1, lifecycle_2, workingCopyBackup_1, workingCopyService_1, nativeTextFileService_1, arrays_1, network_1, fileService_1, inMemoryFilesystemProvider_1, log_1, fileUserDataProvider_1, workingCopyBackupService_1, uriIdentityService_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Cfc = exports.$Bfc = exports.$Afc = exports.$zfc = exports.$yfc = exports.$xfc = exports.$wfc = void 0;
    class $wfc {
        createRawConnection() { throw new Error('Not Implemented'); }
        getChannel(channelName) { return undefined; }
        registerChannel(channelName, channel) { }
        notifyRestored() { }
    }
    exports.$wfc = $wfc;
    class $xfc {
        constructor() {
            this.windowId = -1;
            this.onDidOpenWindow = event_1.Event.None;
            this.onDidMaximizeWindow = event_1.Event.None;
            this.onDidUnmaximizeWindow = event_1.Event.None;
            this.onDidFocusWindow = event_1.Event.None;
            this.onDidBlurWindow = event_1.Event.None;
            this.onDidResumeOS = event_1.Event.None;
            this.onDidChangeColorScheme = event_1.Event.None;
            this.onDidChangePassword = event_1.Event.None;
            this.onDidTriggerSystemContextMenu = event_1.Event.None;
            this.onDidChangeDisplay = event_1.Event.None;
            this.windowCount = Promise.resolve(1);
        }
        getWindowCount() { return this.windowCount; }
        async getWindows() { return []; }
        async getActiveWindowId() { return undefined; }
        openWindow(arg1, arg2) {
            throw new Error('Method not implemented.');
        }
        async toggleFullScreen() { }
        async handleTitleDoubleClick() { }
        async isMaximized() { return true; }
        async maximizeWindow() { }
        async unmaximizeWindow() { }
        async minimizeWindow() { }
        async updateWindowControls(options) { }
        async setMinimumSize(width, height) { }
        async saveWindowSplash(value) { }
        async focusWindow(options) { }
        async showMessageBox(options) { throw new Error('Method not implemented.'); }
        async showSaveDialog(options) { throw new Error('Method not implemented.'); }
        async showOpenDialog(options) { throw new Error('Method not implemented.'); }
        async pickFileFolderAndOpen(options) { }
        async pickFileAndOpen(options) { }
        async pickFolderAndOpen(options) { }
        async pickWorkspaceAndOpen(options) { }
        async showItemInFolder(path) { }
        async setRepresentedFilename(path) { }
        async isAdmin() { return false; }
        async writeElevated(source, target) { }
        async isRunningUnderARM64Translation() { return false; }
        async getOSProperties() { return Object.create(null); }
        async getOSStatistics() { return Object.create(null); }
        async getOSVirtualMachineHint() { return 0; }
        async getOSColorScheme() { return { dark: true, highContrast: false }; }
        async hasWSLFeatureInstalled() { return false; }
        async killProcess() { }
        async setDocumentEdited(edited) { }
        async openExternal(url) { return false; }
        async updateTouchBar() { }
        async moveItemToTrash() { }
        async newWindowTab() { }
        async showPreviousWindowTab() { }
        async showNextWindowTab() { }
        async moveWindowTabToNewWindow() { }
        async mergeAllWindowTabs() { }
        async toggleWindowTabsBar() { }
        async installShellCommand() { }
        async uninstallShellCommand() { }
        async notifyReady() { }
        async relaunch(options) { }
        async reload() { }
        async closeWindow() { }
        async closeWindowById() { }
        async quit() { }
        async exit(code) { }
        async openDevTools(options) { }
        async toggleDevTools() { }
        async resolveProxy(url) { return undefined; }
        async findFreePort(startPort, giveUpAfter, timeout, stride) { return -1; }
        async readClipboardText(type) { return ''; }
        async writeClipboardText(text, type) { }
        async readClipboardFindText() { return ''; }
        async writeClipboardFindText(text) { }
        async writeClipboardBuffer(format, buffer, type) { }
        async readClipboardBuffer(format) { return buffer_1.$Fd.wrap(Uint8Array.from([])); }
        async hasClipboard(format, type) { return false; }
        async sendInputEvent(event) { }
        async windowsGetStringRegKey(hive, path, name) { return undefined; }
        async profileRenderer() { throw new Error(); }
    }
    exports.$xfc = $xfc;
    let $yfc = class $yfc extends extensionTipsService_1.$D4b {
        constructor(environmentService, telemetryService, extensionManagementService, storageService, nativeHostService, extensionRecommendationNotificationService, fileService, productService) {
            super(environmentService.userHome, nativeHostService, telemetryService, extensionManagementService, storageService, extensionRecommendationNotificationService, fileService, productService);
        }
    };
    exports.$yfc = $yfc;
    exports.$yfc = $yfc = __decorate([
        __param(0, environment_1.$Jh),
        __param(1, telemetry_1.$9k),
        __param(2, extensionManagement_1.$2n),
        __param(3, storage_1.$Vo),
        __param(4, native_1.$05b),
        __param(5, extensionRecommendations_1.$TUb),
        __param(6, files_1.$6j),
        __param(7, productService_1.$kj)
    ], $yfc);
    function $zfc(overrides, disposables = new lifecycle_1.$jc()) {
        const instantiationService = (0, workbenchTestServices_1.$lec)({
            workingCopyBackupService: () => disposables.add(new $Cfc()),
            ...overrides
        }, disposables);
        instantiationService.stub(native_1.$05b, new $xfc());
        return instantiationService;
    }
    exports.$zfc = $zfc;
    let $Afc = class $Afc {
        constructor(lifecycleService, textFileService, filesConfigurationService, contextService, modelService, fileService, nativeHostService, fileDialogService, workingCopyBackupService, workingCopyService, editorService) {
            this.lifecycleService = lifecycleService;
            this.textFileService = textFileService;
            this.filesConfigurationService = filesConfigurationService;
            this.contextService = contextService;
            this.modelService = modelService;
            this.fileService = fileService;
            this.nativeHostService = nativeHostService;
            this.fileDialogService = fileDialogService;
            this.workingCopyBackupService = workingCopyBackupService;
            this.workingCopyService = workingCopyService;
            this.editorService = editorService;
        }
    };
    exports.$Afc = $Afc;
    exports.$Afc = $Afc = __decorate([
        __param(0, lifecycle_2.$7y),
        __param(1, textfiles_1.$JD),
        __param(2, filesConfigurationService_1.$yD),
        __param(3, workspace_1.$Kh),
        __param(4, model_1.$yA),
        __param(5, files_1.$6j),
        __param(6, native_1.$05b),
        __param(7, dialogs_1.$qA),
        __param(8, workingCopyBackup_1.$EA),
        __param(9, workingCopyService_1.$TC),
        __param(10, editorService_1.$9C)
    ], $Afc);
    class $Bfc extends nativeTextFileService_1.$x_b {
        get encoding() {
            if (!this.X) {
                this.X = this.B(this.j.createInstance(workbenchTestServices_1.$pec));
            }
            return this.X;
        }
    }
    exports.$Bfc = $Bfc;
    class $Cfc extends workingCopyBackupService_1.$5_b {
        constructor() {
            const environmentService = workbenchTestServices_1.$qec;
            const logService = new log_1.$fj();
            const fileService = new fileService_1.$Dp(logService);
            const lifecycleService = new workbenchTestServices_1.$Kec();
            super(environmentService, fileService, logService, lifecycleService);
            const inMemoryFileSystemProvider = this.B(new inMemoryFilesystemProvider_1.$rAb());
            this.B(fileService.registerProvider(network_1.Schemas.inMemory, inMemoryFileSystemProvider));
            const uriIdentityService = this.B(new uriIdentityService_1.$pr(fileService));
            const userDataProfilesService = this.B(new userDataProfile_1.$Hk(environmentService, fileService, uriIdentityService, logService));
            this.B(fileService.registerProvider(network_1.Schemas.vscodeUserData, this.B(new fileUserDataProvider_1.$n7b(network_1.Schemas.file, inMemoryFileSystemProvider, network_1.Schemas.vscodeUserData, userDataProfilesService, uriIdentityService, logService))));
            this.f = [];
            this.m = [];
            this.discardedBackups = [];
            this.n = [];
            this.discardedAllBackups = false;
            this.B(fileService);
            this.B(lifecycleService);
        }
        testGetFileService() {
            return this.b;
        }
        async waitForAllBackups() {
            await Promise.all(this.n);
        }
        joinBackupResource() {
            return new Promise(resolve => this.f.push(resolve));
        }
        async backup(identifier, content, versionId, meta, token) {
            const p = super.backup(identifier, content, versionId, meta, token);
            const removeFromPendingBackups = (0, arrays_1.$Sb)(this.n, p.then(undefined, undefined));
            try {
                await p;
            }
            finally {
                removeFromPendingBackups();
            }
            while (this.f.length) {
                this.f.pop()();
            }
        }
        joinDiscardBackup() {
            return new Promise(resolve => this.m.push(resolve));
        }
        async discardBackup(identifier) {
            await super.discardBackup(identifier);
            this.discardedBackups.push(identifier);
            while (this.m.length) {
                this.m.pop()();
            }
        }
        async discardBackups(filter) {
            this.discardedAllBackups = true;
            return super.discardBackups(filter);
        }
        async getBackupContents(identifier) {
            const backupResource = this.toBackupResource(identifier);
            const fileContents = await this.b.readFile(backupResource);
            return fileContents.value.toString();
        }
    }
    exports.$Cfc = $Cfc;
});
//# sourceMappingURL=workbenchTestServices.js.map