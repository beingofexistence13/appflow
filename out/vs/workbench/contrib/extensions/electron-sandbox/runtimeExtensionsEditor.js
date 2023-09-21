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
define(["require", "exports", "vs/nls", "vs/base/common/actions", "vs/platform/telemetry/common/telemetry", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/extensions/common/extensions", "vs/platform/theme/common/themeService", "vs/workbench/services/extensions/common/extensions", "vs/platform/contextview/browser/contextView", "vs/platform/notification/common/notification", "vs/platform/contextkey/common/contextkey", "vs/platform/storage/common/storage", "vs/platform/label/common/label", "vs/workbench/contrib/extensions/electron-sandbox/extensionsSlowActions", "vs/workbench/services/environment/common/environmentService", "vs/workbench/contrib/extensions/common/reportExtensionIssueAction", "vs/workbench/contrib/extensions/browser/abstractRuntimeExtensionsEditor", "vs/base/common/buffer", "vs/base/common/uri", "vs/platform/files/common/files", "vs/platform/native/common/native", "vs/platform/profiling/common/profiling", "vs/platform/clipboard/common/clipboardService"], function (require, exports, nls, actions_1, telemetry_1, instantiation_1, extensions_1, themeService_1, extensions_2, contextView_1, notification_1, contextkey_1, storage_1, label_1, extensionsSlowActions_1, environmentService_1, reportExtensionIssueAction_1, abstractRuntimeExtensionsEditor_1, buffer_1, uri_1, files_1, native_1, profiling_1, clipboardService_1) {
    "use strict";
    var StartExtensionHostProfileAction_1, SaveExtensionHostProfileAction_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SaveExtensionHostProfileAction = exports.StopExtensionHostProfileAction = exports.StartExtensionHostProfileAction = exports.RuntimeExtensionsEditor = exports.ProfileSessionState = exports.CONTEXT_EXTENSION_HOST_PROFILE_RECORDED = exports.CONTEXT_PROFILE_SESSION_STATE = exports.IExtensionHostProfileService = void 0;
    exports.IExtensionHostProfileService = (0, instantiation_1.createDecorator)('extensionHostProfileService');
    exports.CONTEXT_PROFILE_SESSION_STATE = new contextkey_1.RawContextKey('profileSessionState', 'none');
    exports.CONTEXT_EXTENSION_HOST_PROFILE_RECORDED = new contextkey_1.RawContextKey('extensionHostProfileRecorded', false);
    var ProfileSessionState;
    (function (ProfileSessionState) {
        ProfileSessionState[ProfileSessionState["None"] = 0] = "None";
        ProfileSessionState[ProfileSessionState["Starting"] = 1] = "Starting";
        ProfileSessionState[ProfileSessionState["Running"] = 2] = "Running";
        ProfileSessionState[ProfileSessionState["Stopping"] = 3] = "Stopping";
    })(ProfileSessionState || (exports.ProfileSessionState = ProfileSessionState = {}));
    let RuntimeExtensionsEditor = class RuntimeExtensionsEditor extends abstractRuntimeExtensionsEditor_1.AbstractRuntimeExtensionsEditor {
        constructor(telemetryService, themeService, contextKeyService, extensionsWorkbenchService, extensionService, notificationService, contextMenuService, instantiationService, storageService, labelService, environmentService, clipboardService, _extensionHostProfileService) {
            super(telemetryService, themeService, contextKeyService, extensionsWorkbenchService, extensionService, notificationService, contextMenuService, instantiationService, storageService, labelService, environmentService, clipboardService);
            this._extensionHostProfileService = _extensionHostProfileService;
            this._profileInfo = this._extensionHostProfileService.lastProfile;
            this._extensionsHostRecorded = exports.CONTEXT_EXTENSION_HOST_PROFILE_RECORDED.bindTo(contextKeyService);
            this._profileSessionState = exports.CONTEXT_PROFILE_SESSION_STATE.bindTo(contextKeyService);
            this._register(this._extensionHostProfileService.onDidChangeLastProfile(() => {
                this._profileInfo = this._extensionHostProfileService.lastProfile;
                this._extensionsHostRecorded.set(!!this._profileInfo);
                this._updateExtensions();
            }));
            this._register(this._extensionHostProfileService.onDidChangeState(() => {
                const state = this._extensionHostProfileService.state;
                this._profileSessionState.set(ProfileSessionState[state].toLowerCase());
            }));
        }
        _getProfileInfo() {
            return this._profileInfo;
        }
        _getUnresponsiveProfile(extensionId) {
            return this._extensionHostProfileService.getUnresponsiveProfile(extensionId);
        }
        _createSlowExtensionAction(element) {
            if (element.unresponsiveProfile) {
                return this._instantiationService.createInstance(extensionsSlowActions_1.SlowExtensionAction, element.description, element.unresponsiveProfile);
            }
            return null;
        }
        _createReportExtensionIssueAction(element) {
            if (element.marketplaceInfo) {
                return this._instantiationService.createInstance(reportExtensionIssueAction_1.ReportExtensionIssueAction, element.description);
            }
            return null;
        }
        _createSaveExtensionHostProfileAction() {
            return this._instantiationService.createInstance(SaveExtensionHostProfileAction, SaveExtensionHostProfileAction.ID, SaveExtensionHostProfileAction.LABEL);
        }
        _createProfileAction() {
            const state = this._extensionHostProfileService.state;
            const profileAction = (state === ProfileSessionState.Running
                ? this._instantiationService.createInstance(StopExtensionHostProfileAction, StopExtensionHostProfileAction.ID, StopExtensionHostProfileAction.LABEL)
                : this._instantiationService.createInstance(StartExtensionHostProfileAction, StartExtensionHostProfileAction.ID, StartExtensionHostProfileAction.LABEL));
            return profileAction;
        }
    };
    exports.RuntimeExtensionsEditor = RuntimeExtensionsEditor;
    exports.RuntimeExtensionsEditor = RuntimeExtensionsEditor = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, themeService_1.IThemeService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, extensions_1.IExtensionsWorkbenchService),
        __param(4, extensions_2.IExtensionService),
        __param(5, notification_1.INotificationService),
        __param(6, contextView_1.IContextMenuService),
        __param(7, instantiation_1.IInstantiationService),
        __param(8, storage_1.IStorageService),
        __param(9, label_1.ILabelService),
        __param(10, environmentService_1.IWorkbenchEnvironmentService),
        __param(11, clipboardService_1.IClipboardService),
        __param(12, exports.IExtensionHostProfileService)
    ], RuntimeExtensionsEditor);
    let StartExtensionHostProfileAction = class StartExtensionHostProfileAction extends actions_1.Action {
        static { StartExtensionHostProfileAction_1 = this; }
        static { this.ID = 'workbench.extensions.action.extensionHostProfile'; }
        static { this.LABEL = nls.localize('extensionHostProfileStart', "Start Extension Host Profile"); }
        constructor(id = StartExtensionHostProfileAction_1.ID, label = StartExtensionHostProfileAction_1.LABEL, _extensionHostProfileService) {
            super(id, label);
            this._extensionHostProfileService = _extensionHostProfileService;
        }
        run() {
            this._extensionHostProfileService.startProfiling();
            return Promise.resolve();
        }
    };
    exports.StartExtensionHostProfileAction = StartExtensionHostProfileAction;
    exports.StartExtensionHostProfileAction = StartExtensionHostProfileAction = StartExtensionHostProfileAction_1 = __decorate([
        __param(2, exports.IExtensionHostProfileService)
    ], StartExtensionHostProfileAction);
    let StopExtensionHostProfileAction = class StopExtensionHostProfileAction extends actions_1.Action {
        static { this.ID = 'workbench.extensions.action.stopExtensionHostProfile'; }
        static { this.LABEL = nls.localize('stopExtensionHostProfileStart', "Stop Extension Host Profile"); }
        constructor(id = StartExtensionHostProfileAction.ID, label = StartExtensionHostProfileAction.LABEL, _extensionHostProfileService) {
            super(id, label);
            this._extensionHostProfileService = _extensionHostProfileService;
        }
        run() {
            this._extensionHostProfileService.stopProfiling();
            return Promise.resolve();
        }
    };
    exports.StopExtensionHostProfileAction = StopExtensionHostProfileAction;
    exports.StopExtensionHostProfileAction = StopExtensionHostProfileAction = __decorate([
        __param(2, exports.IExtensionHostProfileService)
    ], StopExtensionHostProfileAction);
    let SaveExtensionHostProfileAction = class SaveExtensionHostProfileAction extends actions_1.Action {
        static { SaveExtensionHostProfileAction_1 = this; }
        static { this.LABEL = nls.localize('saveExtensionHostProfile', "Save Extension Host Profile"); }
        static { this.ID = 'workbench.extensions.action.saveExtensionHostProfile'; }
        constructor(id = SaveExtensionHostProfileAction_1.ID, label = SaveExtensionHostProfileAction_1.LABEL, _nativeHostService, _environmentService, _extensionHostProfileService, _fileService) {
            super(id, label, undefined, false);
            this._nativeHostService = _nativeHostService;
            this._environmentService = _environmentService;
            this._extensionHostProfileService = _extensionHostProfileService;
            this._fileService = _fileService;
            this._extensionHostProfileService.onDidChangeLastProfile(() => {
                this.enabled = (this._extensionHostProfileService.lastProfile !== null);
            });
        }
        run() {
            return Promise.resolve(this._asyncRun());
        }
        async _asyncRun() {
            const picked = await this._nativeHostService.showSaveDialog({
                title: nls.localize('saveprofile.dialogTitle', "Save Extension Host Profile"),
                buttonLabel: nls.localize('saveprofile.saveButton', "Save"),
                defaultPath: `CPU-${new Date().toISOString().replace(/[\-:]/g, '')}.cpuprofile`,
                filters: [{
                        name: 'CPU Profiles',
                        extensions: ['cpuprofile', 'txt']
                    }]
            });
            if (!picked || !picked.filePath || picked.canceled) {
                return;
            }
            const profileInfo = this._extensionHostProfileService.lastProfile;
            let dataToWrite = profileInfo ? profileInfo.data : {};
            let savePath = picked.filePath;
            if (this._environmentService.isBuilt) {
                // when running from a not-development-build we remove
                // absolute filenames because we don't want to reveal anything
                // about users. We also append the `.txt` suffix to make it
                // easier to attach these files to GH issues
                dataToWrite = profiling_1.Utils.rewriteAbsolutePaths(dataToWrite, 'piiRemoved');
                savePath = savePath + '.txt';
            }
            return this._fileService.writeFile(uri_1.URI.file(savePath), buffer_1.VSBuffer.fromString(JSON.stringify(profileInfo ? profileInfo.data : {}, null, '\t')));
        }
    };
    exports.SaveExtensionHostProfileAction = SaveExtensionHostProfileAction;
    exports.SaveExtensionHostProfileAction = SaveExtensionHostProfileAction = SaveExtensionHostProfileAction_1 = __decorate([
        __param(2, native_1.INativeHostService),
        __param(3, environmentService_1.IWorkbenchEnvironmentService),
        __param(4, exports.IExtensionHostProfileService),
        __param(5, files_1.IFileService)
    ], SaveExtensionHostProfileAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZUV4dGVuc2lvbnNFZGl0b3IuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9leHRlbnNpb25zL2VsZWN0cm9uLXNhbmRib3gvcnVudGltZUV4dGVuc2lvbnNFZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQTJCbkYsUUFBQSw0QkFBNEIsR0FBRyxJQUFBLCtCQUFlLEVBQStCLDZCQUE2QixDQUFDLENBQUM7SUFDNUcsUUFBQSw2QkFBNkIsR0FBRyxJQUFJLDBCQUFhLENBQVMscUJBQXFCLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDekYsUUFBQSx1Q0FBdUMsR0FBRyxJQUFJLDBCQUFhLENBQVUsOEJBQThCLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFFekgsSUFBWSxtQkFLWDtJQUxELFdBQVksbUJBQW1CO1FBQzlCLDZEQUFRLENBQUE7UUFDUixxRUFBWSxDQUFBO1FBQ1osbUVBQVcsQ0FBQTtRQUNYLHFFQUFZLENBQUE7SUFDYixDQUFDLEVBTFcsbUJBQW1CLG1DQUFuQixtQkFBbUIsUUFLOUI7SUFrQk0sSUFBTSx1QkFBdUIsR0FBN0IsTUFBTSx1QkFBd0IsU0FBUSxpRUFBK0I7UUFNM0UsWUFDb0IsZ0JBQW1DLEVBQ3ZDLFlBQTJCLEVBQ3RCLGlCQUFxQyxFQUM1QiwwQkFBdUQsRUFDakUsZ0JBQW1DLEVBQ2hDLG1CQUF5QyxFQUMxQyxrQkFBdUMsRUFDckMsb0JBQTJDLEVBQ2pELGNBQStCLEVBQ2pDLFlBQTJCLEVBQ1osa0JBQWdELEVBQzNELGdCQUFtQyxFQUNQLDRCQUEwRDtZQUV6RyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLGlCQUFpQixFQUFFLDBCQUEwQixFQUFFLGdCQUFnQixFQUFFLG1CQUFtQixFQUFFLGtCQUFrQixFQUFFLG9CQUFvQixFQUFFLGNBQWMs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