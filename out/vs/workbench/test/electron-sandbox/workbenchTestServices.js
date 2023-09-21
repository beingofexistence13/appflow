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
    exports.TestNativeWorkingCopyBackupService = exports.TestNativeTextFileServiceWithEncodingOverrides = exports.TestServiceAccessor = exports.workbenchInstantiationService = exports.TestExtensionTipsService = exports.TestNativeHostService = exports.TestSharedProcessService = void 0;
    class TestSharedProcessService {
        createRawConnection() { throw new Error('Not Implemented'); }
        getChannel(channelName) { return undefined; }
        registerChannel(channelName, channel) { }
        notifyRestored() { }
    }
    exports.TestSharedProcessService = TestSharedProcessService;
    class TestNativeHostService {
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
        async readClipboardBuffer(format) { return buffer_1.VSBuffer.wrap(Uint8Array.from([])); }
        async hasClipboard(format, type) { return false; }
        async sendInputEvent(event) { }
        async windowsGetStringRegKey(hive, path, name) { return undefined; }
        async profileRenderer() { throw new Error(); }
    }
    exports.TestNativeHostService = TestNativeHostService;
    let TestExtensionTipsService = class TestExtensionTipsService extends extensionTipsService_1.AbstractNativeExtensionTipsService {
        constructor(environmentService, telemetryService, extensionManagementService, storageService, nativeHostService, extensionRecommendationNotificationService, fileService, productService) {
            super(environmentService.userHome, nativeHostService, telemetryService, extensionManagementService, storageService, extensionRecommendationNotificationService, fileService, productService);
        }
    };
    exports.TestExtensionTipsService = TestExtensionTipsService;
    exports.TestExtensionTipsService = TestExtensionTipsService = __decorate([
        __param(0, environment_1.INativeEnvironmentService),
        __param(1, telemetry_1.ITelemetryService),
        __param(2, extensionManagement_1.IExtensionManagementService),
        __param(3, storage_1.IStorageService),
        __param(4, native_1.INativeHostService),
        __param(5, extensionRecommendations_1.IExtensionRecommendationNotificationService),
        __param(6, files_1.IFileService),
        __param(7, productService_1.IProductService)
    ], TestExtensionTipsService);
    function workbenchInstantiationService(overrides, disposables = new lifecycle_1.DisposableStore()) {
        const instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)({
            workingCopyBackupService: () => disposables.add(new TestNativeWorkingCopyBackupService()),
            ...overrides
        }, disposables);
        instantiationService.stub(native_1.INativeHostService, new TestNativeHostService());
        return instantiationService;
    }
    exports.workbenchInstantiationService = workbenchInstantiationService;
    let TestServiceAccessor = class TestServiceAccessor {
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
    exports.TestServiceAccessor = TestServiceAccessor;
    exports.TestServiceAccessor = TestServiceAccessor = __decorate([
        __param(0, lifecycle_2.ILifecycleService),
        __param(1, textfiles_1.ITextFileService),
        __param(2, filesConfigurationService_1.IFilesConfigurationService),
        __param(3, workspace_1.IWorkspaceContextService),
        __param(4, model_1.IModelService),
        __param(5, files_1.IFileService),
        __param(6, native_1.INativeHostService),
        __param(7, dialogs_1.IFileDialogService),
        __param(8, workingCopyBackup_1.IWorkingCopyBackupService),
        __param(9, workingCopyService_1.IWorkingCopyService),
        __param(10, editorService_1.IEditorService)
    ], TestServiceAccessor);
    class TestNativeTextFileServiceWithEncodingOverrides extends nativeTextFileService_1.NativeTextFileService {
        get encoding() {
            if (!this._testEncoding) {
                this._testEncoding = this._register(this.instantiationService.createInstance(workbenchTestServices_1.TestEncodingOracle));
            }
            return this._testEncoding;
        }
    }
    exports.TestNativeTextFileServiceWithEncodingOverrides = TestNativeTextFileServiceWithEncodingOverrides;
    class TestNativeWorkingCopyBackupService extends workingCopyBackupService_1.NativeWorkingCopyBackupService {
        constructor() {
            const environmentService = workbenchTestServices_1.TestEnvironmentService;
            const logService = new log_1.NullLogService();
            const fileService = new fileService_1.FileService(logService);
            const lifecycleService = new workbenchTestServices_1.TestLifecycleService();
            super(environmentService, fileService, logService, lifecycleService);
            const inMemoryFileSystemProvider = this._register(new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider());
            this._register(fileService.registerProvider(network_1.Schemas.inMemory, inMemoryFileSystemProvider));
            const uriIdentityService = this._register(new uriIdentityService_1.UriIdentityService(fileService));
            const userDataProfilesService = this._register(new userDataProfile_1.UserDataProfilesService(environmentService, fileService, uriIdentityService, logService));
            this._register(fileService.registerProvider(network_1.Schemas.vscodeUserData, this._register(new fileUserDataProvider_1.FileUserDataProvider(network_1.Schemas.file, inMemoryFileSystemProvider, network_1.Schemas.vscodeUserData, userDataProfilesService, uriIdentityService, logService))));
            this.backupResourceJoiners = [];
            this.discardBackupJoiners = [];
            this.discardedBackups = [];
            this.pendingBackupsArr = [];
            this.discardedAllBackups = false;
            this._register(fileService);
            this._register(lifecycleService);
        }
        testGetFileService() {
            return this.fileService;
        }
        async waitForAllBackups() {
            await Promise.all(this.pendingBackupsArr);
        }
        joinBackupResource() {
            return new Promise(resolve => this.backupResourceJoiners.push(resolve));
        }
        async backup(identifier, content, versionId, meta, token) {
            const p = super.backup(identifier, content, versionId, meta, token);
            const removeFromPendingBackups = (0, arrays_1.insert)(this.pendingBackupsArr, p.then(undefined, undefined));
            try {
                await p;
            }
            finally {
                removeFromPendingBackups();
            }
            while (this.backupResourceJoiners.length) {
                this.backupResourceJoiners.pop()();
            }
        }
        joinDiscardBackup() {
            return new Promise(resolve => this.discardBackupJoiners.push(resolve));
        }
        async discardBackup(identifier) {
            await super.discardBackup(identifier);
            this.discardedBackups.push(identifier);
            while (this.discardBackupJoiners.length) {
                this.discardBackupJoiners.pop()();
            }
        }
        async discardBackups(filter) {
            this.discardedAllBackups = true;
            return super.discardBackups(filter);
        }
        async getBackupContents(identifier) {
            const backupResource = this.toBackupResource(identifier);
            const fileContents = await this.fileService.readFile(backupResource);
            return fileContents.value.toString();
        }
    }
    exports.TestNativeWorkingCopyBackupService = TestNativeWorkingCopyBackupService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2JlbmNoVGVzdFNlcnZpY2VzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3Rlc3QvZWxlY3Ryb24tc2FuZGJveC93b3JrYmVuY2hUZXN0U2VydmljZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBZ0RoRyxNQUFhLHdCQUF3QjtRQUlwQyxtQkFBbUIsS0FBWSxNQUFNLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BFLFVBQVUsQ0FBQyxXQUFtQixJQUFTLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQztRQUMxRCxlQUFlLENBQUMsV0FBbUIsRUFBRSxPQUFZLElBQVUsQ0FBQztRQUM1RCxjQUFjLEtBQVcsQ0FBQztLQUMxQjtJQVJELDREQVFDO0lBRUQsTUFBYSxxQkFBcUI7UUFBbEM7WUFHVSxhQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFFdkIsb0JBQWUsR0FBa0IsYUFBSyxDQUFDLElBQUksQ0FBQztZQUM1Qyx3QkFBbUIsR0FBa0IsYUFBSyxDQUFDLElBQUksQ0FBQztZQUNoRCwwQkFBcUIsR0FBa0IsYUFBSyxDQUFDLElBQUksQ0FBQztZQUNsRCxxQkFBZ0IsR0FBa0IsYUFBSyxDQUFDLElBQUksQ0FBQztZQUM3QyxvQkFBZSxHQUFrQixhQUFLLENBQUMsSUFBSSxDQUFDO1lBQzVDLGtCQUFhLEdBQW1CLGFBQUssQ0FBQyxJQUFJLENBQUM7WUFDM0MsMkJBQXNCLEdBQUcsYUFBSyxDQUFDLElBQUksQ0FBQztZQUNwQyx3QkFBbUIsR0FBRyxhQUFLLENBQUMsSUFBSSxDQUFDO1lBQ2pDLGtDQUE2QixHQUFzRCxhQUFLLENBQUMsSUFBSSxDQUFDO1lBQzlGLHVCQUFrQixHQUFHLGFBQUssQ0FBQyxJQUFJLENBQUM7WUFFaEMsZ0JBQVcsR0FBRyxPQUFPLENBQUMsT0FB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