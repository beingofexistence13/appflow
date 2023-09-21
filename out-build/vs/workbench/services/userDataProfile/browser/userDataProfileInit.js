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
    exports.$K2b = void 0;
    let $K2b = class $K2b {
        constructor(c, d, e, f, g, h, i) {
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.a = [];
            this.b = new async_1.$Fg();
        }
        async whenInitializationFinished() {
            await this.b.wait();
        }
        async requiresInitialization() {
            if (!this.c.options?.profile?.contents) {
                return false;
            }
            if (!this.f.isNew(0 /* StorageScope.PROFILE */)) {
                return false;
            }
            return true;
        }
        async initializeRequiredResources() {
            this.g.trace(`UserDataProfileInitializer#initializeRequiredResources`);
            const promises = [];
            const profileTemplate = await this.l();
            if (profileTemplate?.settings) {
                promises.push(this.n(new settingsResource_1.$1zb(this.e, this.d, this.g), profileTemplate.settings, "settings" /* ProfileResourceType.Settings */));
            }
            if (profileTemplate?.globalState) {
                promises.push(this.n(new globalStateResource_1.$mAb(this.f), profileTemplate.globalState, "globalState" /* ProfileResourceType.GlobalState */));
            }
            await Promise.all(promises);
        }
        async initializeOtherResources(instantiationService) {
            try {
                this.g.trace(`UserDataProfileInitializer#initializeOtherResources`);
                const promises = [];
                const profileTemplate = await this.l();
                if (profileTemplate?.keybindings) {
                    promises.push(this.n(new keybindingsResource_1.$4zb(this.e, this.d, this.g), profileTemplate.keybindings, "keybindings" /* ProfileResourceType.Keybindings */));
                }
                if (profileTemplate?.tasks) {
                    promises.push(this.n(new tasksResource_1.$0zb(this.e, this.d, this.g), profileTemplate.tasks, "tasks" /* ProfileResourceType.Tasks */));
                }
                if (profileTemplate?.snippets) {
                    promises.push(this.n(new snippetsResource_1.$7zb(this.e, this.d, this.h), profileTemplate.snippets, "snippets" /* ProfileResourceType.Snippets */));
                }
                promises.push(this.initializeInstalledExtensions(instantiationService));
                await async_1.Promises.settled(promises);
            }
            finally {
                this.b.open();
            }
        }
        async initializeInstalledExtensions(instantiationService) {
            if (!this.j) {
                const profileTemplate = await this.l();
                if (profileTemplate?.extensions) {
                    this.j = this.n(instantiationService.createInstance(extensionsResource_1.$hAb), profileTemplate.extensions, "extensions" /* ProfileResourceType.Extensions */);
                }
                else {
                    this.j = Promise.resolve();
                }
            }
            return this.j;
        }
        l() {
            if (!this.k) {
                this.k = this.m();
            }
            return this.k;
        }
        async m() {
            if (!this.c.options?.profile?.contents) {
                return null;
            }
            if ((0, types_1.$jf)(this.c.options.profile.contents)) {
                try {
                    return JSON.parse(this.c.options.profile.contents);
                }
                catch (error) {
                    this.g.error(error);
                    return null;
                }
            }
            try {
                const url = uri_1.URI.revive(this.c.options.profile.contents).toString(true);
                const context = await this.i.request({ type: 'GET', url }, cancellation_1.CancellationToken.None);
                if (context.res.statusCode === 200) {
                    return await (0, request_1.$Oo)(context);
                }
                else {
                    this.g.warn(`UserDataProfileInitializer: Failed to get profile from URL: ${url}. Status code: ${context.res.statusCode}.`);
                }
            }
            catch (error) {
                this.g.error(error);
            }
            return null;
        }
        async n(initializer, content, profileResource) {
            try {
                if (this.a.includes(profileResource)) {
                    this.g.info(`UserDataProfileInitializer: ${profileResource} initialized already.`);
                    return;
                }
                this.a.push(profileResource);
                this.g.trace(`UserDataProfileInitializer: Initializing ${profileResource}`);
                await initializer.initialize(content);
                this.g.info(`UserDataProfileInitializer: Initialized ${profileResource}`);
            }
            catch (error) {
                this.g.info(`UserDataProfileInitializer: Error while initializing ${profileResource}`);
                this.g.error(error);
            }
        }
    };
    exports.$K2b = $K2b;
    exports.$K2b = $K2b = __decorate([
        __param(0, environmentService_1.$LT),
        __param(1, files_1.$6j),
        __param(2, userDataProfile_1.$CJ),
        __param(3, storage_1.$Vo),
        __param(4, log_1.$5i),
        __param(5, uriIdentity_1.$Ck),
        __param(6, request_1.$Io)
    ], $K2b);
});
//# sourceMappingURL=userDataProfileInit.js.map