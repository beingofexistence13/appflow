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
define(["require", "exports", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/extensions", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/contextkey/common/contextkey", "vs/platform/configuration/common/configuration", "vs/platform/files/common/files", "vs/base/common/objects", "vs/base/common/platform", "vs/platform/workspace/common/workspace", "vs/workbench/common/resources", "vs/base/common/async", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/environment/common/environment", "vs/base/common/map"], function (require, exports, nls_1, instantiation_1, extensions_1, event_1, lifecycle_1, contextkey_1, configuration_1, files_1, objects_1, platform_1, workspace_1, resources_1, async_1, uriIdentity_1, environment_1, map_1) {
    "use strict";
    var FilesConfigurationService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FilesConfigurationService = exports.IFilesConfigurationService = exports.AutoSaveMode = exports.AutoSaveAfterShortDelayContext = void 0;
    exports.AutoSaveAfterShortDelayContext = new contextkey_1.RawContextKey('autoSaveAfterShortDelayContext', false, true);
    var AutoSaveMode;
    (function (AutoSaveMode) {
        AutoSaveMode[AutoSaveMode["OFF"] = 0] = "OFF";
        AutoSaveMode[AutoSaveMode["AFTER_SHORT_DELAY"] = 1] = "AFTER_SHORT_DELAY";
        AutoSaveMode[AutoSaveMode["AFTER_LONG_DELAY"] = 2] = "AFTER_LONG_DELAY";
        AutoSaveMode[AutoSaveMode["ON_FOCUS_CHANGE"] = 3] = "ON_FOCUS_CHANGE";
        AutoSaveMode[AutoSaveMode["ON_WINDOW_CHANGE"] = 4] = "ON_WINDOW_CHANGE";
    })(AutoSaveMode || (exports.AutoSaveMode = AutoSaveMode = {}));
    exports.IFilesConfigurationService = (0, instantiation_1.createDecorator)('filesConfigurationService');
    let FilesConfigurationService = class FilesConfigurationService extends lifecycle_1.Disposable {
        static { FilesConfigurationService_1 = this; }
        static { this.DEFAULT_AUTO_SAVE_MODE = platform_1.isWeb ? files_1.AutoSaveConfiguration.AFTER_DELAY : files_1.AutoSaveConfiguration.OFF; }
        static { this.READONLY_MESSAGES = {
            providerReadonly: { value: (0, nls_1.localize)('providerReadonly', "Editor is read-only because the file system of the file is read-only."), isTrusted: true },
            sessionReadonly: { value: (0, nls_1.localize)({ key: 'sessionReadonly', comment: ['Please do not translate the word "command", it is part of our internal syntax which must not change', '{Locked="](command:{0})"}'] }, "Editor is read-only because the file was set read-only in this session. [Click here](command:{0}) to set writeable.", 'workbench.action.files.setActiveEditorWriteableInSession'), isTrusted: true },
            configuredReadonly: { value: (0, nls_1.localize)({ key: 'configuredReadonly', comment: ['Please do not translate the word "command", it is part of our internal syntax which must not change', '{Locked="](command:{0})"}'] }, "Editor is read-only because the file was set read-only via settings. [Click here](command:{0}) to configure.", `workbench.action.openSettings?${encodeURIComponent('["files.readonly"]')}`), isTrusted: true },
            fileLocked: { value: (0, nls_1.localize)({ key: 'fileLocked', comment: ['Please do not translate the word "command", it is part of our internal syntax which must not change', '{Locked="](command:{0})"}'] }, "Editor is read-only because of file permissions. [Click here](command:{0}) to set writeable anyway.", 'workbench.action.files.setActiveEditorWriteableInSession'), isTrusted: true },
            fileReadonly: { value: (0, nls_1.localize)('fileReadonly', "Editor is read-only because the file is read-only."), isTrusted: true }
        }; }
        constructor(contextKeyService, configurationService, contextService, environmentService, uriIdentityService, fileService) {
            super();
            this.configurationService = configurationService;
            this.contextService = contextService;
            this.environmentService = environmentService;
            this.uriIdentityService = uriIdentityService;
            this.fileService = fileService;
            this._onAutoSaveConfigurationChange = this._register(new event_1.Emitter());
            this.onAutoSaveConfigurationChange = this._onAutoSaveConfigurationChange.event;
            this._onFilesAssociationChange = this._register(new event_1.Emitter());
            this.onFilesAssociationChange = this._onFilesAssociationChange.event;
            this._onReadonlyConfigurationChange = this._register(new event_1.Emitter());
            this.onReadonlyChange = this._onReadonlyConfigurationChange.event;
            this.readonlyIncludeMatcher = this._register(new async_1.IdleValue(() => this.createReadonlyMatcher(files_1.FILES_READONLY_INCLUDE_CONFIG)));
            this.readonlyExcludeMatcher = this._register(new async_1.IdleValue(() => this.createReadonlyMatcher(files_1.FILES_READONLY_EXCLUDE_CONFIG)));
            this.sessionReadonlyOverrides = new map_1.ResourceMap(resource => this.uriIdentityService.extUri.getComparisonKey(resource));
            this.autoSaveAfterShortDelayContext = exports.AutoSaveAfterShortDelayContext.bindTo(contextKeyService);
            const configuration = configurationService.getValue();
            this.currentFilesAssociationConfig = configuration?.files?.associations;
            this.currentHotExitConfig = configuration?.files?.hotExit || files_1.HotExitConfiguration.ON_EXIT;
            this.onFilesConfigurationChange(configuration);
            this.registerListeners();
        }
        createReadonlyMatcher(config) {
            const matcher = this._register(new resources_1.ResourceGlobMatcher(resource => this.configurationService.getValue(config, { resource }), event => event.affectsConfiguration(config), this.contextService, this.configurationService));
            this._register(matcher.onExpressionChange(() => this._onReadonlyConfigurationChange.fire()));
            return matcher;
        }
        isReadonly(resource, stat) {
            // if the entire file system provider is readonly, we respect that
            // and do not allow to change readonly. we take this as a hint that
            // the provider has no capabilities of writing.
            const provider = this.fileService.getProvider(resource.scheme);
            if (provider && (0, files_1.hasReadonlyCapability)(provider)) {
                return provider.readOnlyMessage ?? FilesConfigurationService_1.READONLY_MESSAGES.providerReadonly;
            }
            // session override always wins over the others
            const sessionReadonlyOverride = this.sessionReadonlyOverrides.get(resource);
            if (typeof sessionReadonlyOverride === 'boolean') {
                return sessionReadonlyOverride === true ? FilesConfigurationService_1.READONLY_MESSAGES.sessionReadonly : false;
            }
            if (this.uriIdentityService.extUri.isEqualOrParent(resource, this.environmentService.userRoamingDataHome) ||
                this.uriIdentityService.extUri.isEqual(resource, this.contextService.getWorkspace().configuration ?? undefined)) {
                return false; // explicitly exclude some paths from readonly that we need for configuration
            }
            // configured glob patterns win over stat information
            if (this.readonlyIncludeMatcher.value.matches(resource)) {
                return !this.readonlyExcludeMatcher.value.matches(resource) ? FilesConfigurationService_1.READONLY_MESSAGES.configuredReadonly : false;
            }
            // check if file is locked and configured to treat as readonly
            if (this.configuredReadonlyFromPermissions && stat?.locked) {
                return FilesConfigurationService_1.READONLY_MESSAGES.fileLocked;
            }
            // check if file is marked readonly from the file system provider
            if (stat?.readonly) {
                return FilesConfigurationService_1.READONLY_MESSAGES.fileReadonly;
            }
            return false;
        }
        async updateReadonly(resource, readonly) {
            if (readonly === 'toggle') {
                let stat = undefined;
                try {
                    stat = await this.fileService.resolve(resource, { resolveMetadata: true });
                }
                catch (error) {
                    // ignore
                }
                readonly = !this.isReadonly(resource, stat);
            }
            if (readonly === 'reset') {
                this.sessionReadonlyOverrides.delete(resource);
            }
            else {
                this.sessionReadonlyOverrides.set(resource, readonly);
            }
            this._onReadonlyConfigurationChange.fire();
        }
        registerListeners() {
            // Files configuration changes
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('files')) {
                    this.onFilesConfigurationChange(this.configurationService.getValue());
                }
            }));
        }
        onFilesConfigurationChange(configuration) {
            // Auto Save
            const autoSaveMode = configuration?.files?.autoSave || FilesConfigurationService_1.DEFAULT_AUTO_SAVE_MODE;
            switch (autoSaveMode) {
                case files_1.AutoSaveConfiguration.AFTER_DELAY:
                    this.configuredAutoSaveDelay = configuration?.files?.autoSaveDelay;
                    this.configuredAutoSaveOnFocusChange = false;
                    this.configuredAutoSaveOnWindowChange = false;
                    break;
                case files_1.AutoSaveConfiguration.ON_FOCUS_CHANGE:
                    this.configuredAutoSaveDelay = undefined;
                    this.configuredAutoSaveOnFocusChange = true;
                    this.configuredAutoSaveOnWindowChange = false;
                    break;
                case files_1.AutoSaveConfiguration.ON_WINDOW_CHANGE:
                    this.configuredAutoSaveDelay = undefined;
                    this.configuredAutoSaveOnFocusChange = false;
                    this.configuredAutoSaveOnWindowChange = true;
                    break;
                default:
                    this.configuredAutoSaveDelay = undefined;
                    this.configuredAutoSaveOnFocusChange = false;
                    this.configuredAutoSaveOnWindowChange = false;
                    break;
            }
            this.autoSaveAfterShortDelayContext.set(this.getAutoSaveMode() === 1 /* AutoSaveMode.AFTER_SHORT_DELAY */);
            this._onAutoSaveConfigurationChange.fire(this.getAutoSaveConfiguration());
            // Check for change in files associations
            const filesAssociation = configuration?.files?.associations;
            if (!(0, objects_1.equals)(this.currentFilesAssociationConfig, filesAssociation)) {
                this.currentFilesAssociationConfig = filesAssociation;
                this._onFilesAssociationChange.fire();
            }
            // Hot exit
            const hotExitMode = configuration?.files?.hotExit;
            if (hotExitMode === files_1.HotExitConfiguration.OFF || hotExitMode === files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE) {
                this.currentHotExitConfig = hotExitMode;
            }
            else {
                this.currentHotExitConfig = files_1.HotExitConfiguration.ON_EXIT;
            }
            // Readonly
            const readonlyFromPermissions = Boolean(configuration?.files?.readonlyFromPermissions);
            if (readonlyFromPermissions !== Boolean(this.configuredReadonlyFromPermissions)) {
                this.configuredReadonlyFromPermissions = readonlyFromPermissions;
                this._onReadonlyConfigurationChange.fire();
            }
        }
        getAutoSaveMode() {
            if (this.configuredAutoSaveOnFocusChange) {
                return 3 /* AutoSaveMode.ON_FOCUS_CHANGE */;
            }
            if (this.configuredAutoSaveOnWindowChange) {
                return 4 /* AutoSaveMode.ON_WINDOW_CHANGE */;
            }
            if (typeof this.configuredAutoSaveDelay === 'number' && this.configuredAutoSaveDelay >= 0) {
                return this.configuredAutoSaveDelay <= 1000 ? 1 /* AutoSaveMode.AFTER_SHORT_DELAY */ : 2 /* AutoSaveMode.AFTER_LONG_DELAY */;
            }
            return 0 /* AutoSaveMode.OFF */;
        }
        getAutoSaveConfiguration() {
            return {
                autoSaveDelay: typeof this.configuredAutoSaveDelay === 'number' && this.configuredAutoSaveDelay >= 0 ? this.configuredAutoSaveDelay : undefined,
                autoSaveFocusChange: !!this.configuredAutoSaveOnFocusChange,
                autoSaveApplicationChange: !!this.configuredAutoSaveOnWindowChange
            };
        }
        async toggleAutoSave() {
            const currentSetting = this.configurationService.getValue('files.autoSave');
            let newAutoSaveValue;
            if ([files_1.AutoSaveConfiguration.AFTER_DELAY, files_1.AutoSaveConfiguration.ON_FOCUS_CHANGE, files_1.AutoSaveConfiguration.ON_WINDOW_CHANGE].some(setting => setting === currentSetting)) {
                newAutoSaveValue = files_1.AutoSaveConfiguration.OFF;
            }
            else {
                newAutoSaveValue = files_1.AutoSaveConfiguration.AFTER_DELAY;
            }
            return this.configurationService.updateValue('files.autoSave', newAutoSaveValue);
        }
        get isHotExitEnabled() {
            if (this.contextService.getWorkspace().transient) {
                // Transient workspace: hot exit is disabled because
                // transient workspaces are not restored upon restart
                return false;
            }
            return this.currentHotExitConfig !== files_1.HotExitConfiguration.OFF;
        }
        get hotExitConfiguration() {
            return this.currentHotExitConfig;
        }
        preventSaveConflicts(resource, language) {
            return this.configurationService.getValue('files.saveConflictResolution', { resource, overrideIdentifier: language }) !== 'overwriteFileOnDisk';
        }
    };
    exports.FilesConfigurationService = FilesConfigurationService;
    exports.FilesConfigurationService = FilesConfigurationService = FilesConfigurationService_1 = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, environment_1.IEnvironmentService),
        __param(4, uriIdentity_1.IUriIdentityService),
        __param(5, files_1.IFileService)
    ], FilesConfigurationService);
    (0, extensions_1.registerSingleton)(exports.IFilesConfigurationService, FilesConfigurationService, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZXNDb25maWd1cmF0aW9uU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9maWxlc0NvbmZpZ3VyYXRpb24vY29tbW9uL2ZpbGVzQ29uZmlndXJhdGlvblNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQXFCbkYsUUFBQSw4QkFBOEIsR0FBRyxJQUFJLDBCQUFhLENBQVUsZ0NBQWdDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBUXhILElBQWtCLFlBTWpCO0lBTkQsV0FBa0IsWUFBWTtRQUM3Qiw2Q0FBRyxDQUFBO1FBQ0gseUVBQWlCLENBQUE7UUFDakIsdUVBQWdCLENBQUE7UUFDaEIscUVBQWUsQ0FBQTtRQUNmLHVFQUFnQixDQUFBO0lBQ2pCLENBQUMsRUFOaUIsWUFBWSw0QkFBWixZQUFZLFFBTTdCO0lBRVksUUFBQSwwQkFBMEIsR0FBRyxJQUFBLCtCQUFlLEVBQTZCLDJCQUEyQixDQUFDLENBQUM7SUFxQzVHLElBQU0seUJBQXlCLEdBQS9CLE1BQU0seUJBQTBCLFNBQVEsc0JBQVU7O2lCQUloQywyQkFBc0IsR0FBRyxnQkFBSyxDQUFDLENBQUMsQ0FBQyw2QkFBcUIsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLDZCQUFxQixDQUFDLEdBQUcsQUFBeEUsQ0FBeUU7aUJBRS9GLHNCQUFpQixHQUFHO1lBQzNDLGdCQUFnQixFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGtCQUFrQixFQUFFLHVFQUF1RSxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRTtZQUNuSixlQUFlLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsRUFBRSxHQUFHLEVBQUUsaUJBQWlCLEVBQUUsT0FBTyxFQUFFLENBQUMscUdBQXFHLEVBQUUsMkJB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