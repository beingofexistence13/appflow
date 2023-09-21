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
define(["require", "exports", "vs/platform/storage/common/storage", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/base/common/async", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/workbench/services/userDataProfile/browser/settingsResource", "vs/workbench/services/userDataProfile/browser/globalStateResource", "vs/workbench/services/userDataProfile/browser/keybindingsResource", "vs/workbench/services/userDataProfile/browser/tasksResource", "vs/workbench/services/userDataProfile/browser/snippetsResource", "vs/workbench/services/userDataProfile/browser/extensionsResource", "vs/workbench/services/environment/browser/environmentService", "vs/base/common/types", "vs/platform/request/common/request", "vs/base/common/cancellation", "vs/base/common/uri"], function (require, exports, storage_1, files_1, log_1, async_1, uriIdentity_1, userDataProfile_1, settingsResource_1, globalStateResource_1, keybindingsResource_1, tasksResource_1, snippetsResource_1, extensionsResource_1, environmentService_1, types_1, request_1, cancellation_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataProfileInitializer = void 0;
    let UserDataProfileInitializer = class UserDataProfileInitializer {
        constructor(environmentService, fileService, userDataProfileService, storageService, logService, uriIdentityService, requestService) {
            this.environmentService = environmentService;
            this.fileService = fileService;
            this.userDataProfileService = userDataProfileService;
            this.storageService = storageService;
            this.logService = logService;
            this.uriIdentityService = uriIdentityService;
            this.requestService = requestService;
            this.initialized = [];
            this.initializationFinished = new async_1.Barrier();
        }
        async whenInitializationFinished() {
            await this.initializationFinished.wait();
        }
        async requiresInitialization() {
            if (!this.environmentService.options?.profile?.contents) {
                return false;
            }
            if (!this.storageService.isNew(0 /* StorageScope.PROFILE */)) {
                return false;
            }
            return true;
        }
        async initializeRequiredResources() {
            this.logService.trace(`UserDataProfileInitializer#initializeRequiredResources`);
            const promises = [];
            const profileTemplate = await this.getProfileTemplate();
            if (profileTemplate?.settings) {
                promises.push(this.initialize(new settingsResource_1.SettingsResourceInitializer(this.userDataProfileService, this.fileService, this.logService), profileTemplate.settings, "settings" /* ProfileResourceType.Settings */));
            }
            if (profileTemplate?.globalState) {
                promises.push(this.initialize(new globalStateResource_1.GlobalStateResourceInitializer(this.storageService), profileTemplate.globalState, "globalState" /* ProfileResourceType.GlobalState */));
            }
            await Promise.all(promises);
        }
        async initializeOtherResources(instantiationService) {
            try {
                this.logService.trace(`UserDataProfileInitializer#initializeOtherResources`);
                const promises = [];
                const profileTemplate = await this.getProfileTemplate();
                if (profileTemplate?.keybindings) {
                    promises.push(this.initialize(new keybindingsResource_1.KeybindingsResourceInitializer(this.userDataProfileService, this.fileService, this.logService), profileTemplate.keybindings, "keybindings" /* ProfileResourceType.Keybindings */));
                }
                if (profileTemplate?.tasks) {
                    promises.push(this.initialize(new tasksResource_1.TasksResourceInitializer(this.userDataProfileService, this.fileService, this.logService), profileTemplate.tasks, "tasks" /* ProfileResourceType.Tasks */));
                }
                if (profileTemplate?.snippets) {
                    promises.push(this.initialize(new snippetsResource_1.SnippetsResourceInitializer(this.userDataProfileService, this.fileService, this.uriIdentityService), profileTemplate.snippets, "snippets" /* ProfileResourceType.Snippets */));
                }
                promises.push(this.initializeInstalledExtensions(instantiationService));
                await async_1.Promises.settled(promises);
            }
            finally {
                this.initializationFinished.open();
            }
        }
        async initializeInstalledExtensions(instantiationService) {
            if (!this.initializeInstalledExtensionsPromise) {
                const profileTemplate = await this.getProfileTemplate();
                if (profileTemplate?.extensions) {
                    this.initializeInstalledExtensionsPromise = this.initialize(instantiationService.createInstance(extensionsResource_1.ExtensionsResourceInitializer), profileTemplate.extensions, "extensions" /* ProfileResourceType.Extensions */);
                }
                else {
                    this.initializeInstalledExtensionsPromise = Promise.resolve();
                }
            }
            return this.initializeInstalledExtensionsPromise;
        }
        getProfileTemplate() {
            if (!this.profileTemplatePromise) {
                this.profileTemplatePromise = this.doGetProfileTemplate();
            }
            return this.profileTemplatePromise;
        }
        async doGetProfileTemplate() {
            if (!this.environmentService.options?.profile?.contents) {
                return null;
            }
            if ((0, types_1.isString)(this.environmentService.options.profile.contents)) {
                try {
                    return JSON.parse(this.environmentService.options.profile.contents);
                }
                catch (error) {
                    this.logService.error(error);
                    return null;
                }
            }
            try {
                const url = uri_1.URI.revive(this.environmentService.options.profile.contents).toString(true);
                const context = await this.requestService.request({ type: 'GET', url }, cancellation_1.CancellationToken.None);
                if (context.res.statusCode === 200) {
                    return await (0, request_1.asJson)(context);
                }
                else {
                    this.logService.warn(`UserDataProfileInitializer: Failed to get profile from URL: ${url}. Status code: ${context.res.statusCode}.`);
                }
            }
            catch (error) {
                this.logService.error(error);
            }
            return null;
        }
        async initialize(initializer, content, profileResource) {
            try {
                if (this.initialized.includes(profileResource)) {
                    this.logService.info(`UserDataProfileInitializer: ${profileResource} initialized already.`);
                    return;
                }
                this.initialized.push(profileResource);
                this.logService.trace(`UserDataProfileInitializer: Initializing ${profileResource}`);
                await initializer.initialize(content);
                this.logService.info(`UserDataProfileInitializer: Initialized ${profileResource}`);
            }
            catch (error) {
                this.logService.info(`UserDataProfileInitializer: Error while initializing ${profileResource}`);
                this.logService.error(error);
            }
        }
    };
    exports.UserDataProfileInitializer = UserDataProfileInitializer;
    exports.UserDataProfileInitializer = UserDataProfileInitializer = __decorate([
        __param(0, environmentService_1.IBrowserWorkbenchEnvironmentService),
        __param(1, files_1.IFileService),
        __param(2, userDataProfile_1.IUserDataProfileService),
        __param(3, storage_1.IStorageService),
        __param(4, log_1.ILogService),
        __param(5, uriIdentity_1.IUriIdentityService),
        __param(6, request_1.IRequestService)
    ], UserDataProfileInitializer);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFQcm9maWxlSW5pdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy91c2VyRGF0YVByb2ZpbGUvYnJvd3Nlci91c2VyRGF0YVByb2ZpbGVJbml0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXVCekYsSUFBTSwwQkFBMEIsR0FBaEMsTUFBTSwwQkFBMEI7UUFPdEMsWUFDc0Msa0JBQXdFLEVBQy9GLFdBQTBDLEVBQy9CLHNCQUFnRSxFQUN4RSxjQUFnRCxFQUNwRCxVQUF3QyxFQUNoQyxrQkFBd0QsRUFDNUQsY0FBZ0Q7WUFOWCx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFDO1lBQzlFLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQ2QsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF5QjtZQUN2RCxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDbkMsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUNmLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFDM0MsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBVmpELGdCQUFXLEdBQTBCLEVBQUUsQ0FBQztZQUN4QywyQkFBc0IsR0FBRyxJQUFJLGVBQU8sRUFBRSxDQUFDO1FBV3hELENBQUM7UUFFRCxLQUFLLENBQUMsMEJBQTBCO1lBQy9CLE1BQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksRUFBRSxDQUFDO1FBQzFDLENBQUM7UUFFRCxLQUFLLENBQUMsc0JBQXNCO1lBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUU7Z0JBQ3hELE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLDhCQUFzQixFQUFFO2dCQUNyRCxPQUFPLEtBQUss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