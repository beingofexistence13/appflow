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
    exports.$27b = exports.$17b = void 0;
    function reviewSyncResource(syncResource, userDataProfilesService) {
        return { ...syncResource, profile: (0, userDataProfile_1.$Fk)(syncResource.profile, userDataProfilesService.profilesHome.scheme) };
    }
    function reviewSyncResourceHandle(syncResourceHandle) {
        return { created: syncResourceHandle.created, uri: uri_1.URI.revive(syncResourceHandle.uri) };
    }
    class $17b {
        constructor(c, d, f) {
            this.c = c;
            this.d = d;
            this.f = f;
            this.a = new Map();
            this.b = new event_1.$fd();
        }
        listen(_, event) {
            switch (event) {
                // sync
                case 'onDidChangeStatus': return this.c.onDidChangeStatus;
                case 'onDidChangeConflicts': return this.c.onDidChangeConflicts;
                case 'onDidChangeLocal': return this.c.onDidChangeLocal;
                case 'onDidChangeLastSyncTime': return this.c.onDidChangeLastSyncTime;
                case 'onSyncErrors': return this.c.onSyncErrors;
                case 'onDidResetLocal': return this.c.onDidResetLocal;
                case 'onDidResetRemote': return this.c.onDidResetRemote;
                // manual sync
                case 'manualSync/onSynchronizeResources': return this.b.event;
            }
            throw new Error(`Event not found: ${event}`);
        }
        async call(context, command, args) {
            try {
                const result = await this.g(context, command, args);
                return result;
            }
            catch (e) {
                this.f.error(e);
                throw e;
            }
        }
        async g(context, command, args) {
            switch (command) {
                // sync
                case '_getInitialData': return Promise.resolve([this.c.status, this.c.conflicts, this.c.lastSyncTime]);
                case 'reset': return this.c.reset();
                case 'resetRemote': return this.c.resetRemote();
                case 'resetLocal': return this.c.resetLocal();
                case 'hasPreviouslySynced': return this.c.hasPreviouslySynced();
                case 'hasLocalData': return this.c.hasLocalData();
                case 'resolveContent': return this.c.resolveContent(uri_1.URI.revive(args[0]));
                case 'accept': return this.c.accept(reviewSyncResource(args[0], this.d), uri_1.URI.revive(args[1]), args[2], args[3]);
                case 'replace': return this.c.replace(reviewSyncResourceHandle(args[0]));
                case 'cleanUpRemoteData': return this.c.cleanUpRemoteData();
                case 'getRemoteActivityData': return this.c.saveRemoteActivityData(uri_1.URI.revive(args[0]));
                case 'extractActivityData': return this.c.extractActivityData(uri_1.URI.revive(args[0]), uri_1.URI.revive(args[1]));
                case 'createManualSyncTask': return this.i();
            }
            // manual sync
            if (command.startsWith('manualSync/')) {
                const manualSyncTaskCommand = command.substring('manualSync/'.length);
                const manualSyncTaskId = args[0];
                const manualSyncTask = this.h(manualSyncTaskId);
                args = args.slice(1);
                switch (manualSyncTaskCommand) {
                    case 'merge': return manualSyncTask.merge();
                    case 'apply': return manualSyncTask.apply().then(() => this.a.delete(this.j(manualSyncTask.id)));
                    case 'stop': return manualSyncTask.stop().finally(() => this.a.delete(this.j(manualSyncTask.id)));
                }
            }
            throw new Error('Invalid call');
        }
        h(manualSyncTaskId) {
            const manualSyncTask = this.a.get(this.j(manualSyncTaskId));
            if (!manualSyncTask) {
                throw new Error(`Manual sync taks not found: ${manualSyncTaskId}`);
            }
            return manualSyncTask;
        }
        async i() {
            const manualSyncTask = await this.c.createManualSyncTask();
            this.a.set(this.j(manualSyncTask.id), manualSyncTask);
            return manualSyncTask.id;
        }
        j(manualSyncTaskId) { return `manualSyncTask-${manualSyncTaskId}`; }
    }
    exports.$17b = $17b;
    let $27b = class $27b extends lifecycle_1.$kc {
        get status() { return this.b; }
        get onDidChangeLocal() { return this.a.listen('onDidChangeLocal'); }
        get conflicts() { return this.f; }
        get lastSyncTime() { return this.h; }
        get onDidResetLocal() { return this.a.listen('onDidResetLocal'); }
        get onDidResetRemote() { return this.a.listen('onDidResetRemote'); }
        constructor(userDataSyncChannel, n) {
            super();
            this.n = n;
            this.b = "uninitialized" /* SyncStatus.Uninitialized */;
            this.c = this.B(new event_1.$fd());
            this.onDidChangeStatus = this.c.event;
            this.f = [];
            this.g = this.B(new event_1.$fd());
            this.onDidChangeConflicts = this.g.event;
            this.h = undefined;
            this.j = this.B(new event_1.$fd());
            this.onDidChangeLastSyncTime = this.j.event;
            this.m = this.B(new event_1.$fd());
            this.onSyncErrors = this.m.event;
            this.a = {
                call(command, arg, cancellationToken) {
                    return userDataSyncChannel.call(command, arg, cancellationToken)
                        .then(null, error => { throw userDataSync_1.$Kgb.toUserDataSyncError(error); });
                },
                listen(event, arg) {
                    return userDataSyncChannel.listen(event, arg);
                }
            };
            this.a.call('_getInitialData').then(([status, conflicts, lastSyncTime]) => {
                this.s(status);
                this.t(conflicts);
                if (lastSyncTime) {
                    this.u(lastSyncTime);
                }
                this.B(this.a.listen('onDidChangeStatus')(status => this.s(status)));
                this.B(this.a.listen('onDidChangeLastSyncTime')(lastSyncTime => this.u(lastSyncTime)));
            });
            this.B(this.a.listen('onDidChangeConflicts')(conflicts => this.t(conflicts)));
            this.B(this.a.listen('onSyncErrors')(errors => this.m.fire(errors.map(syncError => ({ ...syncError, error: userDataSync_1.$Kgb.toUserDataSyncError(syncError.error) })))));
        }
        createSyncTask() {
            throw new Error('not supported');
        }
        async createManualSyncTask() {
            const id = await this.a.call('createManualSyncTask');
            const that = this;
            const manualSyncTaskChannelClient = new ManualSyncTaskChannelClient(id, {
                async call(command, arg, cancellationToken) {
                    return that.a.call(`manualSync/${command}`, [id, ...(Array.isArray(arg) ? arg : [arg])], cancellationToken);
                },
                listen() {
                    throw new Error('not supported');
                }
            });
            return manualSyncTaskChannelClient;
        }
        reset() {
            return this.a.call('reset');
        }
        resetRemote() {
            return this.a.call('resetRemote');
        }
        resetLocal() {
            return this.a.call('resetLocal');
        }
        hasPreviouslySynced() {
            return this.a.call('hasPreviouslySynced');
        }
        hasLocalData() {
            return this.a.call('hasLocalData');
        }
        accept(syncResource, resource, content, apply) {
            return this.a.call('accept', [syncResource, resource, content, apply]);
        }
        resolveContent(resource) {
            return this.a.call('resolveContent', [resource]);
        }
        cleanUpRemoteData() {
            return this.a.call('cleanUpRemoteData');
        }
        replace(syncResourceHandle) {
            return this.a.call('replace', [syncResourceHandle]);
        }
        saveRemoteActivityData(location) {
            return this.a.call('getRemoteActivityData', [location]);
        }
        extractActivityData(activityDataResource, location) {
            return this.a.call('extractActivityData', [activityDataResource, location]);
        }
        async s(status) {
            this.b = status;
            this.c.fire(status);
        }
        async t(conflicts) {
            // Revive URIs
            this.f = conflicts.map(syncConflict => ({
                syncResource: syncConflict.syncResource,
                profile: (0, userDataProfile_1.$Fk)(syncConflict.profile, this.n.profilesHome.scheme),
                conflicts: syncConflict.conflicts.map(r => ({
                    ...r,
                    baseResource: uri_1.URI.revive(r.baseResource),
                    localResource: uri_1.URI.revive(r.localResource),
                    remoteResource: uri_1.URI.revive(r.remoteResource),
                    previewResource: uri_1.URI.revive(r.previewResource),
                }))
            }));
            this.g.fire(this.f);
        }
        u(lastSyncTime) {
            if (this.h !== lastSyncTime) {
                this.h = lastSyncTime;
                this.j.fire(lastSyncTime);
            }
        }
    };
    exports.$27b = $27b;
    exports.$27b = $27b = __decorate([
        __param(1, userDataProfile_1.$Ek)
    ], $27b);
    class ManualSyncTaskChannelClient extends lifecycle_1.$kc {
        constructor(id, a) {
            super();
            this.id = id;
            this.a = a;
        }
        async merge() {
            return this.a.call('merge');
        }
        async apply() {
            return this.a.call('apply');
        }
        stop() {
            return this.a.call('stop');
        }
        dispose() {
            this.a.call('dispose');
        }
    }
});
//# sourceMappingURL=userDataSyncServiceIpc.js.map