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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataSync/common/userDataSync"], function (require, exports, event_1, lifecycle_1, uri_1, userDataProfile_1, userDataSync_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataSyncChannelClient = exports.UserDataSyncChannel = void 0;
    function reviewSyncResource(syncResource, userDataProfilesService) {
        return { ...syncResource, profile: (0, userDataProfile_1.reviveProfile)(syncResource.profile, userDataProfilesService.profilesHome.scheme) };
    }
    function reviewSyncResourceHandle(syncResourceHandle) {
        return { created: syncResourceHandle.created, uri: uri_1.URI.revive(syncResourceHandle.uri) };
    }
    class UserDataSyncChannel {
        constructor(service, userDataProfilesService, logService) {
            this.service = service;
            this.userDataProfilesService = userDataProfilesService;
            this.logService = logService;
            this.manualSyncTasks = new Map();
            this.onManualSynchronizeResources = new event_1.Emitter();
        }
        listen(_, event) {
            switch (event) {
                // sync
                case 'onDidChangeStatus': return this.service.onDidChangeStatus;
                case 'onDidChangeConflicts': return this.service.onDidChangeConflicts;
                case 'onDidChangeLocal': return this.service.onDidChangeLocal;
                case 'onDidChangeLastSyncTime': return this.service.onDidChangeLastSyncTime;
                case 'onSyncErrors': return this.service.onSyncErrors;
                case 'onDidResetLocal': return this.service.onDidResetLocal;
                case 'onDidResetRemote': return this.service.onDidResetRemote;
                // manual sync
                case 'manualSync/onSynchronizeResources': return this.onManualSynchronizeResources.event;
            }
            throw new Error(`Event not found: ${event}`);
        }
        async call(context, command, args) {
            try {
                const result = await this._call(context, command, args);
                return result;
            }
            catch (e) {
                this.logService.error(e);
                throw e;
            }
        }
        async _call(context, command, args) {
            switch (command) {
                // sync
                case '_getInitialData': return Promise.resolve([this.service.status, this.service.conflicts, this.service.lastSyncTime]);
                case 'reset': return this.service.reset();
                case 'resetRemote': return this.service.resetRemote();
                case 'resetLocal': return this.service.resetLocal();
                case 'hasPreviouslySynced': return this.service.hasPreviouslySynced();
                case 'hasLocalData': return this.service.hasLocalData();
                case 'resolveContent': return this.service.resolveContent(uri_1.URI.revive(args[0]));
                case 'accept': return this.service.accept(reviewSyncResource(args[0], this.userDataProfilesService), uri_1.URI.revive(args[1]), args[2], args[3]);
                case 'replace': return this.service.replace(reviewSyncResourceHandle(args[0]));
                case 'cleanUpRemoteData': return this.service.cleanUpRemoteData();
                case 'getRemoteActivityData': return this.service.saveRemoteActivityData(uri_1.URI.revive(args[0]));
                case 'extractActivityData': return this.service.extractActivityData(uri_1.URI.revive(args[0]), uri_1.URI.revive(args[1]));
                case 'createManualSyncTask': return this.createManualSyncTask();
            }
            // manual sync
            if (command.startsWith('manualSync/')) {
                const manualSyncTaskCommand = command.substring('manualSync/'.length);
                const manualSyncTaskId = args[0];
                const manualSyncTask = this.getManualSyncTask(manualSyncTaskId);
                args = args.slice(1);
                switch (manualSyncTaskCommand) {
                    case 'merge': return manualSyncTask.merge();
                    case 'apply': return manualSyncTask.apply().then(() => this.manualSyncTasks.delete(this.createKey(manualSyncTask.id)));
                    case 'stop': return manualSyncTask.stop().finally(() => this.manualSyncTasks.delete(this.createKey(manualSyncTask.id)));
                }
            }
            throw new Error('Invalid call');
        }
        getManualSyncTask(manualSyncTaskId) {
            const manualSyncTask = this.manualSyncTasks.get(this.createKey(manualSyncTaskId));
            if (!manualSyncTask) {
                throw new Error(`Manual sync taks not found: ${manualSyncTaskId}`);
            }
            return manualSyncTask;
        }
        async createManualSyncTask() {
            const manualSyncTask = await this.service.createManualSyncTask();
            this.manualSyncTasks.set(this.createKey(manualSyncTask.id), manualSyncTask);
            return manualSyncTask.id;
        }
        createKey(manualSyncTaskId) { return `manualSyncTask-${manualSyncTaskId}`; }
    }
    exports.UserDataSyncChannel = UserDataSyncChannel;
    let UserDataSyncChannelClient = class UserDataSyncChannelClient extends lifecycle_1.Disposable {
        get status() { return this._status; }
        get onDidChangeLocal() { return this.channel.listen('onDidChangeLocal'); }
        get conflicts() { return this._conflicts; }
        get lastSyncTime() { return this._lastSyncTime; }
        get onDidResetLocal() { return this.channel.listen('onDidResetLocal'); }
        get onDidResetRemote() { return this.channel.listen('onDidResetRemote'); }
        constructor(userDataSyncChannel, userDataProfilesService) {
            super();
            this.userDataProfilesService = userDataProfilesService;
            this._status = "uninitialized" /* SyncStatus.Uninitialized */;
            this._onDidChangeStatus = this._register(new event_1.Emitter());
            this.onDidChangeStatus = this._onDidChangeStatus.event;
            this._conflicts = [];
            this._onDidChangeConflicts = this._register(new event_1.Emitter());
            this.onDidChangeConflicts = this._onDidChangeConflicts.event;
            this._lastSyncTime = undefined;
            this._onDidChangeLastSyncTime = this._register(new event_1.Emitter());
            this.onDidChangeLastSyncTime = this._onDidChangeLastSyncTime.event;
            this._onSyncErrors = this._register(new event_1.Emitter());
            this.onSyncErrors = this._onSyncErrors.event;
            this.channel = {
                call(command, arg, cancellationToken) {
                    return userDataSyncChannel.call(command, arg, cancellationToken)
                        .then(null, error => { throw userDataSync_1.UserDataSyncError.toUserDataSyncError(error); });
                },
                listen(event, arg) {
                    return userDataSyncChannel.listen(event, arg);
                }
            };
            this.channel.call('_getInitialData').then(([status, conflicts, lastSyncTime]) => {
                this.updateStatus(status);
                this.updateConflicts(conflicts);
                if (lastSyncTime) {
                    this.updateLastSyncTime(lastSyncTime);
                }
                this._register(this.channel.listen('onDidChangeStatus')(status => this.updateStatus(status)));
                this._register(this.channel.listen('onDidChangeLastSyncTime')(lastSyncTime => this.updateLastSyncTime(lastSyncTime)));
            });
            this._register(this.channel.listen('onDidChangeConflicts')(conflicts => this.updateConflicts(conflicts)));
            this._register(this.channel.listen('onSyncErrors')(errors => this._onSyncErrors.fire(errors.map(syncError => ({ ...syncError, error: userDataSync_1.UserDataSyncError.toUserDataSyncError(syncError.error) })))));
        }
        createSyncTask() {
            throw new Error('not supported');
        }
        async createManualSyncTask() {
            const id = await this.channel.call('createManualSyncTask');
            const that = this;
            const manualSyncTaskChannelClient = new ManualSyncTaskChannelClient(id, {
                async call(command, arg, cancellationToken) {
                    return that.channel.call(`manualSync/${command}`, [id, ...(Array.isArray(arg) ? arg : [arg])], cancellationToken);
                },
                listen() {
                    throw new Error('not supported');
                }
            });
            return manualSyncTaskChannelClient;
        }
        reset() {
            return this.channel.call('reset');
        }
        resetRemote() {
            return this.channel.call('resetRemote');
        }
        resetLocal() {
            return this.channel.call('resetLocal');
        }
        hasPreviouslySynced() {
            return this.channel.call('hasPreviouslySynced');
        }
        hasLocalData() {
            return this.channel.call('hasLocalData');
        }
        accept(syncResource, resource, content, apply) {
            return this.channel.call('accept', [syncResource, resource, content, apply]);
        }
        resolveContent(resource) {
            return this.channel.call('resolveContent', [resource]);
        }
        cleanUpRemoteData() {
            return this.channel.call('cleanUpRemoteData');
        }
        replace(syncResourceHandle) {
            return this.channel.call('replace', [syncResourceHandle]);
        }
        saveRemoteActivityData(location) {
            return this.channel.call('getRemoteActivityData', [location]);
        }
        extractActivityData(activityDataResource, location) {
            return this.channel.call('extractActivityData', [activityDataResource, location]);
        }
        async updateStatus(status) {
            this._status = status;
            this._onDidChangeStatus.fire(status);
        }
        async updateConflicts(conflicts) {
            // Revive URIs
            this._conflicts = conflicts.map(syncConflict => ({
                syncResource: syncConflict.syncResource,
                profile: (0, userDataProfile_1.reviveProfile)(syncConflict.profile, this.userDataProfilesService.profilesHome.scheme),
                conflicts: syncConflict.conflicts.map(r => ({
                    ...r,
                    baseResource: uri_1.URI.revive(r.baseResource),
                    localResource: uri_1.URI.revive(r.localResource),
                    remoteResource: uri_1.URI.revive(r.remoteResource),
                    previewResource: uri_1.URI.revive(r.previewResource),
                }))
            }));
            this._onDidChangeConflicts.fire(this._conflicts);
        }
        updateLastSyncTime(lastSyncTime) {
            if (this._lastSyncTime !== lastSyncTime) {
                this._lastSyncTime = lastSyncTime;
                this._onDidChangeLastSyncTime.fire(lastSyncTime);
            }
        }
    };
    exports.UserDataSyncChannelClient = UserDataSyncChannelClient;
    exports.UserDataSyncChannelClient = UserDataSyncChannelClient = __decorate([
        __param(1, userDataProfile_1.IUserDataProfilesService)
    ], UserDataSyncChannelClient);
    class ManualSyncTaskChannelClient extends lifecycle_1.Disposable {
        constructor(id, channel) {
            super();
            this.id = id;
            this.channel = channel;
        }
        async merge() {
            return this.channel.call('merge');
        }
        async apply() {
            return this.channel.call('apply');
        }
        stop() {
            return this.channel.call('stop');
        }
        dispose() {
            this.channel.call('dispose');
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFTeW5jU2VydmljZUlwYy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3VzZXJEYXRhU3luYy9jb21tb24vdXNlckRhdGFTeW5jU2VydmljZUlwYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFnQmhHLFNBQVMsa0JBQWtCLENBQUMsWUFBbUMsRUFBRSx1QkFBaUQ7UUFDakgsT0FBTyxFQUFFLEdBQUcsWUFBWSxFQUFFLE9BQU8sRUFBRSxJQUFBLCtCQUFhLEVBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSx1QkFBdUIsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztJQUN2SCxDQUFDO0lBRUQsU0FBUyx3QkFBd0IsQ0FBQyxrQkFBdUM7UUFDeEUsT0FBTyxFQUFFLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLFNBQUcsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztJQUN6RixDQUFDO0lBRUQsTUFBYSxtQkFBbUI7UUFLL0IsWUFDa0IsT0FBNkIsRUFDN0IsdUJBQWlELEVBQ2pELFVBQXVCO1lBRnZCLFlBQU8sR0FBUCxPQUFPLENBQXNCO1lBQzdCLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBMEI7WUFDakQsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQU54QixvQkFBZSxHQUFHLElBQUksR0FBRyxFQUFtQyxDQUFDO1lBQzdELGlDQUE0QixHQUFHLElBQUksZUFBTyxFQUFnRCxDQUFDO1FBTXhHLENBQUM7UUFFTCxNQUFNLENBQUMsQ0FBVSxFQUFFLEtBQWE7WUFDL0IsUUFBUSxLQUFLLEVBQUU7Z0JBQ2QsT0FBTztnQkFDUCxLQUFLLG1CQUFtQixDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDO2dC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