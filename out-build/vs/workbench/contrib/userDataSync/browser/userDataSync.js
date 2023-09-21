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
define(["require", "exports", "vs/base/common/actions", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/uri", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/editor/common/services/resolverService", "vs/nls!vs/workbench/contrib/userDataSync/browser/userDataSync", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/quickinput/common/quickInput", "vs/platform/telemetry/common/telemetry", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/common/editor", "vs/workbench/services/output/common/output", "vs/workbench/services/activity/common/activity", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/preferences/common/preferences", "vs/base/common/date", "vs/platform/product/common/productService", "vs/platform/opener/common/opener", "vs/workbench/services/authentication/common/authentication", "vs/platform/registry/common/platform", "vs/platform/instantiation/common/descriptors", "vs/workbench/common/views", "vs/workbench/contrib/userDataSync/browser/userDataSyncViews", "vs/workbench/services/userDataSync/common/userDataSync", "vs/base/common/codicons", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/platform/action/common/actionCommonCategories", "vs/workbench/services/host/browser/host", "vs/platform/userDataProfile/common/userDataProfile", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/contrib/mergeEditor/common/mergeEditor", "vs/workbench/services/issue/common/issue", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/progress/common/progress", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/files/common/files", "vs/base/common/strings", "vs/platform/userDataSync/common/userDataSyncMachines"], function (require, exports, actions_1, errors_1, event_1, lifecycle_1, resources_1, uri_1, model_1, language_1, resolverService_1, nls_1, actions_2, commands_1, configuration_1, contextkey_1, dialogs_1, instantiation_1, notification_1, quickInput_1, telemetry_1, userDataSync_1, editor_1, output_1, activity_1, editorService_1, preferences_1, date_1, productService_1, opener_1, authentication_1, platform_1, descriptors_1, views_1, userDataSyncViews_1, userDataSync_2, codicons_1, viewPaneContainer_1, actionCommonCategories_1, host_1, userDataProfile_1, textfiles_1, mergeEditor_1, issue_1, userDataProfile_2, progress_1, uriIdentity_1, files_1, strings_1, userDataSyncMachines_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$IZb = void 0;
    const turnOffSyncCommand = { id: 'workbench.userDataSync.actions.turnOff', title: { value: (0, nls_1.localize)(0, null), original: 'Turn Off' } };
    const configureSyncCommand = { id: userDataSync_2.$VAb, title: { value: (0, nls_1.localize)(1, null), original: 'Configure...' } };
    const showConflictsCommandId = 'workbench.userDataSync.actions.showConflicts';
    const syncNowCommand = {
        id: 'workbench.userDataSync.actions.syncNow',
        title: { value: (0, nls_1.localize)(2, null), original: 'Sync Now' },
        description(userDataSyncService) {
            if (userDataSyncService.status === "syncing" /* SyncStatus.Syncing */) {
                return (0, nls_1.localize)(3, null);
            }
            if (userDataSyncService.lastSyncTime) {
                return (0, nls_1.localize)(4, null, (0, date_1.$6l)(userDataSyncService.lastSyncTime, true));
            }
            return undefined;
        }
    };
    const showSyncSettingsCommand = { id: 'workbench.userDataSync.actions.settings', title: { value: (0, nls_1.localize)(5, null), original: 'Show Settings' }, };
    const showSyncedDataCommand = { id: 'workbench.userDataSync.actions.showSyncedData', title: { value: (0, nls_1.localize)(6, null), original: 'Show Synced Data' }, };
    const CONTEXT_TURNING_ON_STATE = new contextkey_1.$2i('userDataSyncTurningOn', false);
    let $IZb = class $IZb extends lifecycle_1.$kc {
        constructor(j, n, r, contextKeyService, s, t, u, w, y, z, C, D, F, userDataAutoSyncService, textModelResolverService, G, H, I, J, L, M, N, O, P, Q) {
            super();
            this.j = j;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.L = L;
            this.M = M;
            this.N = N;
            this.O = O;
            this.P = P;
            this.Q = Q;
            this.g = this.B(new lifecycle_1.$lc());
            this.h = this.B(new lifecycle_1.$lc());
            this.U = new Map();
            this.ab = new Map();
            this.f = CONTEXT_TURNING_ON_STATE.bindTo(contextKeyService);
            if (r.enabled) {
                (0, userDataSync_1.$zgb)();
                this.fb();
                this.eb();
                this.W(this.n.conflicts);
                this.B(event_1.Event.any(event_1.Event.debounce(n.onDidChangeStatus, () => undefined, 500), this.j.onDidChangeEnablement, this.r.onDidChangeAccountStatus)(() => {
                    this.fb();
                    this.eb();
                }));
                this.B(n.onDidChangeConflicts(() => this.W(this.n.conflicts)));
                this.B(j.onDidChangeEnablement(() => this.W(this.n.conflicts)));
                this.B(n.onSyncErrors(errors => this.bb(errors)));
                this.B(userDataAutoSyncService.onError(error => this.Z(error)));
                this.pb();
                this.Gb();
                textModelResolverService.registerTextModelContentProvider(userDataSync_1.$Wgb, D.createInstance(UserDataRemoteContentProvider));
                this.B(event_1.Event.any(n.onDidChangeStatus, j.onDidChangeEnablement)(() => this.R = !j.isEnabled() && n.status !== "idle" /* SyncStatus.Idle */));
            }
        }
        get R() {
            return !!this.f.get();
        }
        set R(turningOn) {
            this.f.set(turningOn);
            this.eb();
        }
        S({ syncResource: resource, profile }) {
            return `${profile.id}:${resource}`;
        }
        W(conflicts) {
            if (!this.j.isEnabled()) {
                return;
            }
            this.eb();
            if (conflicts.length) {
                // Clear and dispose conflicts those were cleared
                for (const [key, disposable] of this.U.entries()) {
                    if (!conflicts.some(conflict => this.S(conflict) === key)) {
                        disposable.dispose();
                        this.U.delete(key);
                    }
                }
                for (const conflict of this.n.conflicts) {
                    const key = this.S(conflict);
                    // Show conflicts notification if not shown before
                    if (!this.U.has(key)) {
                        const conflictsArea = (0, userDataSync_2.$LAb)(conflict.syncResource);
                        const handle = this.t.prompt(notification_1.Severity.Warning, (0, nls_1.localize)(7, null, conflictsArea.toLowerCase()), [
                            {
                                label: (0, nls_1.localize)(8, null),
                                run: () => {
                                    this.H.publicLog2('sync/handleConflicts', { source: conflict.syncResource, action: 'acceptLocal' });
                                    this.Y(conflict, conflict.conflicts[0]);
                                }
                            },
                            {
                                label: (0, nls_1.localize)(9, null),
                                run: () => {
                                    this.H.publicLog2('sync/handleConflicts', { source: conflict.syncResource, action: 'acceptRemote' });
                                    this.X(conflict, conflict.conflicts[0]);
                                }
                            },
                            {
                                label: (0, nls_1.localize)(10, null),
                                run: () => {
                                    this.H.publicLog2('sync/showConflicts', { source: conflict.syncResource });
                                    this.r.showConflicts(conflict.conflicts[0]);
                                }
                            }
                        ], {
                            sticky: true
                        });
                        this.U.set(key, (0, lifecycle_1.$ic)(() => {
                            // close the conflicts warning notification
                            handle.close();
                            this.U.delete(key);
                        }));
                    }
                }
            }
            else {
                this.U.forEach(disposable => disposable.dispose());
                this.U.clear();
            }
        }
        async X(syncResource, conflict) {
            try {
                await this.n.accept(syncResource, conflict.remoteResource, undefined, this.j.isEnabled());
            }
            catch (e) {
                this.t.error((0, nls_1.localize)(11, null, `command:${userDataSync_2.$WAb}`));
            }
        }
        async Y(syncResource, conflict) {
            try {
                await this.n.accept(syncResource, conflict.localResource, undefined, this.j.isEnabled());
            }
            catch (e) {
                this.t.error((0, nls_1.localize)(12, null, `command:${userDataSync_2.$WAb}`));
            }
        }
        Z(error) {
            switch (error.code) {
                case "SessionExpired" /* UserDataSyncErrorCode.SessionExpired */:
                    this.t.notify({
                        severity: notification_1.Severity.Info,
                        message: (0, nls_1.localize)(13, null),
                        actions: {
                            primary: [new actions_1.$gi('turn on sync', (0, nls_1.localize)(14, null), undefined, true, () => this.gb())]
                        }
                    });
                    break;
                case "TurnedOff" /* UserDataSyncErrorCode.TurnedOff */:
                    this.t.notify({
                        severity: notification_1.Severity.Info,
                        message: (0, nls_1.localize)(15, null),
                        actions: {
                            primary: [new actions_1.$gi('turn on sync', (0, nls_1.localize)(16, null), undefined, true, () => this.gb())]
                        }
                    });
                    break;
                case "TooLarge" /* UserDataSyncErrorCode.TooLarge */:
                    if (error.resource === "keybindings" /* SyncResource.Keybindings */ || error.resource === "settings" /* SyncResource.Settings */ || error.resource === "tasks" /* SyncResource.Tasks */) {
                        this.mb(error.resource);
                        const sourceArea = (0, userDataSync_2.$LAb)(error.resource);
                        this.$(error.resource, (0, nls_1.localize)(17, null, sourceArea.toLowerCase(), sourceArea.toLowerCase(), '100kb'), error);
                    }
                    break;
                case "LocalTooManyProfiles" /* UserDataSyncErrorCode.LocalTooManyProfiles */:
                    this.mb("profiles" /* SyncResource.Profiles */);
                    this.t.error((0, nls_1.localize)(18, null));
                    break;
                case "IncompatibleLocalContent" /* UserDataSyncErrorCode.IncompatibleLocalContent */:
                case "Gone" /* UserDataSyncErrorCode.Gone */:
                case "UpgradeRequired" /* UserDataSyncErrorCode.UpgradeRequired */: {
                    const message = (0, nls_1.localize)(19, null, this.I.version, this.I.commit);
                    const operationId = error.operationId ? (0, nls_1.localize)(20, null, error.operationId) : undefined;
                    this.t.notify({
                        severity: notification_1.Severity.Error,
                        message: operationId ? `${message} ${operationId}` : message,
                    });
                    break;
                }
                case "MethodNotFound" /* UserDataSyncErrorCode.MethodNotFound */: {
                    const message = (0, nls_1.localize)(21, null);
                    const operationId = error.operationId ? (0, nls_1.localize)(22, null, error.operationId) : undefined;
                    this.t.notify({
                        severity: notification_1.Severity.Error,
                        message: operationId ? `${message} ${operationId}` : message,
                        actions: {
                            primary: [
                                new actions_1.$gi('Show Sync Logs', (0, nls_1.localize)(23, null), undefined, true, () => this.P.executeCommand(userDataSync_2.$WAb)),
                                new actions_1.$gi('Report Issue', (0, nls_1.localize)(24, null), undefined, true, () => this.Q.openReporter())
                            ]
                        }
                    });
                    break;
                }
                case "IncompatibleRemoteContent" /* UserDataSyncErrorCode.IncompatibleRemoteContent */:
                    this.t.notify({
                        severity: notification_1.Severity.Error,
                        message: (0, nls_1.localize)(25, null),
                        actions: {
                            primary: [
                                new actions_1.$gi('reset', (0, nls_1.localize)(26, null), undefined, true, () => this.r.resetSyncedData()),
                                new actions_1.$gi('show synced data', (0, nls_1.localize)(27, null), undefined, true, () => this.r.showSyncActivity())
                            ]
                        }
                    });
                    return;
                case "ServiceChanged" /* UserDataSyncErrorCode.ServiceChanged */:
                    this.t.notify({
                        severity: notification_1.Severity.Info,
                        message: this.M.userDataSyncStore?.type === 'insiders' ?
                            (0, nls_1.localize)(28, null) :
                            (0, nls_1.localize)(29, null),
                    });
                    return;
                case "DefaultServiceChanged" /* UserDataSyncErrorCode.DefaultServiceChanged */:
                    // Settings sync is using separate service
                    if (this.j.isEnabled()) {
                        this.t.notify({
                            severity: notification_1.Severity.Info,
                            message: (0, nls_1.localize)(30, null),
                        });
                    }
                    // If settings sync got turned off then ask user to turn on sync again.
                    else {
                        this.t.notify({
                            severity: notification_1.Severity.Info,
                            message: (0, nls_1.localize)(31, null, this.I.nameLong),
                            actions: {
                                primary: [new actions_1.$gi('turn on sync', (0, nls_1.localize)(32, null), undefined, true, () => this.gb())]
                            }
                        });
                    }
                    return;
            }
        }
        $(resource, message, error) {
            const operationId = error.operationId ? (0, nls_1.localize)(33, null, error.operationId) : undefined;
            this.t.notify({
                severity: notification_1.Severity.Error,
                message: operationId ? `${message} ${operationId}` : message,
                actions: {
                    primary: [new actions_1.$gi('open sync file', (0, nls_1.localize)(34, null, (0, userDataSync_2.$LAb)(resource)), undefined, true, () => resource === "settings" /* SyncResource.Settings */ ? this.G.openUserSettings({ jsonEditor: true }) : this.G.openGlobalKeybindingSettings(true))]
                }
            });
        }
        bb(errors) {
            if (errors.length) {
                for (const { profile, syncResource: resource, error } of errors) {
                    switch (error.code) {
                        case "LocalInvalidContent" /* UserDataSyncErrorCode.LocalInvalidContent */:
                            this.cb({ profile, syncResource: resource });
                            break;
                        default: {
                            const key = `${profile.id}:${resource}`;
                            const disposable = this.ab.get(key);
                            if (disposable) {
                                disposable.dispose();
                                this.ab.delete(key);
                            }
                        }
                    }
                }
            }
            else {
                this.ab.forEach(disposable => disposable.dispose());
                this.ab.clear();
            }
        }
        cb({ profile, syncResource: source }) {
            const key = `${profile.id}:${source}`;
            if (this.ab.has(key)) {
                return;
            }
            if (source !== "settings" /* SyncResource.Settings */ && source !== "keybindings" /* SyncResource.Keybindings */ && source !== "tasks" /* SyncResource.Tasks */) {
                return;
            }
            if (!this.O.hasFocus) {
                return;
            }
            const resource = source === "settings" /* SyncResource.Settings */ ? this.y.currentProfile.settingsResource
                : source === "keybindings" /* SyncResource.Keybindings */ ? this.y.currentProfile.keybindingsResource
                    : this.y.currentProfile.tasksResource;
            const editorUri = editor_1.$3E.getCanonicalUri(this.u.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            if ((0, resources_1.$bg)(resource, editorUri)) {
                // Do not show notification if the file in error is active
                return;
            }
            const errorArea = (0, userDataSync_2.$LAb)(source);
            const handle = this.t.notify({
                severity: notification_1.Severity.Error,
                message: (0, nls_1.localize)(35, null, errorArea.toLowerCase()),
                actions: {
                    primary: [new actions_1.$gi('open sync file', (0, nls_1.localize)(36, null, errorArea), undefined, true, () => source === "settings" /* SyncResource.Settings */ ? this.G.openUserSettings({ jsonEditor: true }) : this.G.openGlobalKeybindingSettings(true))]
                }
            });
            this.ab.set(key, (0, lifecycle_1.$ic)(() => {
                // close the error warning notification
                handle.close();
                this.ab.delete(key);
            }));
        }
        db() {
            return this.n.conflicts.reduce((result, { conflicts }) => { return result + conflicts.length; }, 0);
        }
        async eb() {
            this.g.clear();
            let badge = undefined;
            let clazz;
            let priority = undefined;
            if (this.n.conflicts.length && this.j.isEnabled()) {
                badge = new activity_1.$IV(this.db(), () => (0, nls_1.localize)(37, null, userDataSync_2.$NAb));
            }
            else if (this.R) {
                badge = new activity_1.$LV(() => (0, nls_1.localize)(38, null));
                clazz = 'progress-badge';
                priority = 1;
            }
            if (badge) {
                this.g.value = this.s.showGlobalActivity({ badge, clazz, priority });
            }
        }
        async fb() {
            this.h.clear();
            let badge = undefined;
            if (this.n.status !== "uninitialized" /* SyncStatus.Uninitialized */ && this.j.isEnabled() && this.r.accountStatus === "unavailable" /* AccountStatus.Unavailable */) {
                badge = new activity_1.$IV(1, () => (0, nls_1.localize)(39, null));
            }
            if (badge) {
                this.h.value = this.s.showAccountsActivity({ badge, clazz: undefined, priority: undefined });
            }
        }
        async gb() {
            try {
                if (!this.r.authenticationProviders.length) {
                    throw new Error((0, nls_1.localize)(40, null));
                }
                const turnOn = await this.hb();
                if (!turnOn) {
                    return;
                }
                if (this.M.userDataSyncStore?.canSwitch) {
                    await this.ob(this.M.userDataSyncStore);
                }
                await this.r.turnOn();
            }
            catch (e) {
                if ((0, errors_1.$2)(e)) {
                    return;
                }
                if (e instanceof userDataSync_1.$Kgb) {
                    switch (e.code) {
                        case "TooLarge" /* UserDataSyncErrorCode.TooLarge */:
                            if (e.resource === "keybindings" /* SyncResource.Keybindings */ || e.resource === "settings" /* SyncResource.Settings */ || e.resource === "tasks" /* SyncResource.Tasks */) {
                                this.$(e.resource, (0, nls_1.localize)(41, null, (0, userDataSync_2.$LAb)(e.resource).toLowerCase(), '100kb'), e);
                                return;
                            }
                            break;
                        case "IncompatibleLocalContent" /* UserDataSyncErrorCode.IncompatibleLocalContent */:
                        case "Gone" /* UserDataSyncErrorCode.Gone */:
                        case "UpgradeRequired" /* UserDataSyncErrorCode.UpgradeRequired */: {
                            const message = (0, nls_1.localize)(42, null, this.I.version, this.I.commit);
                            const operationId = e.operationId ? (0, nls_1.localize)(43, null, e.operationId) : undefined;
                            this.t.notify({
                                severity: notification_1.Severity.Error,
                                message: operationId ? `${message} ${operationId}` : message,
                            });
                            return;
                        }
                        case "IncompatibleRemoteContent" /* UserDataSyncErrorCode.IncompatibleRemoteContent */:
                            this.t.notify({
                                severity: notification_1.Severity.Error,
                                message: (0, nls_1.localize)(44, null),
                                actions: {
                                    primary: [
                                        new actions_1.$gi('reset', (0, nls_1.localize)(45, null), undefined, true, () => this.r.resetSyncedData()),
                                        new actions_1.$gi('show synced data', (0, nls_1.localize)(46, null), undefined, true, () => this.r.showSyncActivity())
                                    ]
                                }
                            });
                            return;
                        case "Unauthorized" /* UserDataSyncErrorCode.Unauthorized */:
                        case "Forbidden" /* UserDataSyncErrorCode.Forbidden */:
                            this.t.error((0, nls_1.localize)(47, null));
                            return;
                    }
                    this.t.error((0, nls_1.localize)(48, null, `command:${userDataSync_2.$WAb}`));
                }
                else {
                    this.t.error((0, nls_1.localize)(49, null, (0, errors_1.$8)(e)));
                }
            }
        }
        async hb() {
            return new Promise((c, e) => {
                const disposables = new lifecycle_1.$jc();
                const quickPick = this.C.createQuickPick();
                disposables.add(quickPick);
                quickPick.title = userDataSync_2.$NAb;
                quickPick.ok = false;
                quickPick.customButton = true;
                quickPick.customLabel = (0, nls_1.localize)(50, null);
                quickPick.description = (0, nls_1.localize)(51, null);
                quickPick.canSelectMany = true;
                quickPick.ignoreFocusOut = true;
                quickPick.hideInput = true;
                quickPick.hideCheckAll = true;
                const items = this.ib();
                quickPick.items = items;
                quickPick.selectedItems = items.filter(item => this.j.isResourceEnabled(item.id));
                let accepted = false;
                disposables.add(event_1.Event.any(quickPick.onDidAccept, quickPick.onDidCustom)(() => {
                    accepted = true;
                    quickPick.hide();
                }));
                disposables.add(quickPick.onDidHide(() => {
                    try {
                        if (accepted) {
                            this.jb(items, quickPick.selectedItems);
                        }
                        c(accepted);
                    }
                    catch (error) {
                        e(error);
                    }
                    finally {
                        disposables.dispose();
                    }
                }));
                quickPick.show();
            });
        }
        ib() {
            const result = [{
                    id: "settings" /* SyncResource.Settings */,
                    label: (0, userDataSync_2.$LAb)("settings" /* SyncResource.Settings */)
                }, {
                    id: "keybindings" /* SyncResource.Keybindings */,
                    label: (0, userDataSync_2.$LAb)("keybindings" /* SyncResource.Keybindings */),
                    description: this.N.getValue('settingsSync.keybindingsPerPlatform') ? (0, nls_1.localize)(52, null) : undefined
                }, {
                    id: "snippets" /* SyncResource.Snippets */,
                    label: (0, userDataSync_2.$LAb)("snippets" /* SyncResource.Snippets */)
                }, {
                    id: "tasks" /* SyncResource.Tasks */,
                    label: (0, userDataSync_2.$LAb)("tasks" /* SyncResource.Tasks */)
                }, {
                    id: "globalState" /* SyncResource.GlobalState */,
                    label: (0, userDataSync_2.$LAb)("globalState" /* SyncResource.GlobalState */),
                }, {
                    id: "extensions" /* SyncResource.Extensions */,
                    label: (0, userDataSync_2.$LAb)("extensions" /* SyncResource.Extensions */)
                }];
            if (this.w.isEnabled()) {
                result.push({
                    id: "profiles" /* SyncResource.Profiles */,
                    label: (0, userDataSync_2.$LAb)("profiles" /* SyncResource.Profiles */),
                });
            }
            return result;
        }
        jb(items, selectedItems) {
            for (const item of items) {
                const wasEnabled = this.j.isResourceEnabled(item.id);
                const isEnabled = !!selectedItems.filter(selected => selected.id === item.id)[0];
                if (wasEnabled !== isEnabled) {
                    this.j.setResourceEnablement(item.id, isEnabled);
                }
            }
        }
        async kb() {
            return new Promise((c, e) => {
                const disposables = new lifecycle_1.$jc();
                const quickPick = this.C.createQuickPick();
                disposables.add(quickPick);
                quickPick.title = (0, nls_1.localize)(53, null, userDataSync_2.$NAb);
                quickPick.placeholder = (0, nls_1.localize)(54, null);
                quickPick.canSelectMany = true;
                quickPick.ignoreFocusOut = true;
                quickPick.ok = true;
                const items = this.ib();
                quickPick.items = items;
                quickPick.selectedItems = items.filter(item => this.j.isResourceEnabled(item.id));
                disposables.add(quickPick.onDidAccept(async () => {
                    if (quickPick.selectedItems.length) {
                        this.jb(items, quickPick.selectedItems);
                        quickPick.hide();
                    }
                }));
                disposables.add(quickPick.onDidHide(() => {
                    disposables.dispose();
                    c();
                }));
                quickPick.show();
            });
        }
        async lb() {
            const result = await this.z.confirm({
                message: (0, nls_1.localize)(55, null),
                detail: (0, nls_1.localize)(56, null),
                primaryButton: (0, nls_1.localize)(57, null),
                checkbox: this.r.accountStatus === "available" /* AccountStatus.Available */ ? {
                    label: (0, nls_1.localize)(58, null)
                } : undefined
            });
            if (result.confirmed) {
                return this.r.turnoff(!!result.checkboxChecked);
            }
        }
        mb(source) {
            switch (source) {
                case "settings" /* SyncResource.Settings */: return this.j.setResourceEnablement("settings" /* SyncResource.Settings */, false);
                case "keybindings" /* SyncResource.Keybindings */: return this.j.setResourceEnablement("keybindings" /* SyncResource.Keybindings */, false);
                case "snippets" /* SyncResource.Snippets */: return this.j.setResourceEnablement("snippets" /* SyncResource.Snippets */, false);
                case "tasks" /* SyncResource.Tasks */: return this.j.setResourceEnablement("tasks" /* SyncResource.Tasks */, false);
                case "extensions" /* SyncResource.Extensions */: return this.j.setResourceEnablement("extensions" /* SyncResource.Extensions */, false);
                case "globalState" /* SyncResource.GlobalState */: return this.j.setResourceEnablement("globalState" /* SyncResource.GlobalState */, false);
                case "profiles" /* SyncResource.Profiles */: return this.j.setResourceEnablement("profiles" /* SyncResource.Profiles */, false);
            }
        }
        nb() {
            return this.F.showChannel(userDataSync_1.$Vgb);
        }
        async ob(userDataSyncStore) {
            return new Promise((c, e) => {
                const disposables = new lifecycle_1.$jc();
                const quickPick = disposables.add(this.C.createQuickPick());
                quickPick.title = (0, nls_1.localize)(59, null, userDataSync_2.$NAb);
                quickPick.description = (0, nls_1.localize)(60, null);
                quickPick.hideInput = true;
                quickPick.ignoreFocusOut = true;
                const getDescription = (url) => {
                    const isDefault = (0, resources_1.$bg)(url, userDataSyncStore.defaultUrl);
                    if (isDefault) {
                        return (0, nls_1.localize)(61, null);
                    }
                    return undefined;
                };
                quickPick.items = [
                    {
                        id: 'insiders',
                        label: (0, nls_1.localize)(62, null),
                        description: getDescription(userDataSyncStore.insidersUrl)
                    },
                    {
                        id: 'stable',
                        label: (0, nls_1.localize)(63, null),
                        description: getDescription(userDataSyncStore.stableUrl)
                    }
                ];
                disposables.add(quickPick.onDidAccept(async () => {
                    try {
                        await this.M.switch(quickPick.selectedItems[0].id);
                        c();
                    }
                    catch (error) {
                        e(error);
                    }
                    finally {
                        quickPick.hide();
                    }
                }));
                disposables.add(quickPick.onDidHide(() => disposables.dispose()));
                quickPick.show();
            });
        }
        pb() {
            if (this.j.canToggleEnablement()) {
                this.qb();
                this.zb();
            }
            this.rb();
            this.sb();
            this.tb(); // When Sync is turned on from CLI
            this.vb();
            this.xb();
            this.wb();
            this.yb();
            this.Ab();
            this.Cb();
            this.Db();
            this.Bb();
            this.Ib();
            this.Eb();
            this.Fb();
        }
        qb() {
            const that = this;
            const when = contextkey_1.$Ii.and(userDataSync_2.$PAb.notEqualsTo("uninitialized" /* SyncStatus.Uninitialized */), userDataSync_2.$QAb.toNegated(), CONTEXT_TURNING_ON_STATE.negate());
            this.B((0, actions_2.$Xu)(class TurningOnSyncAction extends actions_2.$Wu {
                constructor() {
                    super({
                        id: 'workbench.userDataSync.actions.turnOn',
                        title: { value: (0, nls_1.localize)(64, null), original: 'Backup and Sync Settings...' },
                        category: { value: userDataSync_2.$NAb, original: `Settings Sync` },
                        f1: true,
                        precondition: when,
                        menu: [{
                                group: '3_settings_sync',
                                id: actions_2.$Ru.GlobalActivity,
                                when,
                                order: 1
                            }, {
                                group: '3_settings_sync',
                                id: actions_2.$Ru.MenubarPreferencesMenu,
                                when,
                                order: 1
                            }, {
                                group: '1_settings',
                                id: actions_2.$Ru.AccountsContext,
                                when,
                                order: 2
                            }]
                    });
                }
                async run() {
                    return that.gb();
                }
            }));
        }
        rb() {
            const when = contextkey_1.$Ii.and(userDataSync_2.$PAb.notEqualsTo("uninitialized" /* SyncStatus.Uninitialized */), userDataSync_2.$QAb.toNegated(), CONTEXT_TURNING_ON_STATE);
            this.B((0, actions_2.$Xu)(class TurningOnSyncAction extends actions_2.$Wu {
                constructor() {
                    super({
                        id: 'workbench.userData.actions.turningOn',
                        title: (0, nls_1.localize)(65, null),
                        precondition: contextkey_1.$Ii.false(),
                        menu: [{
                                group: '3_settings_sync',
                                id: actions_2.$Ru.GlobalActivity,
                                when,
                                order: 2
                            }, {
                                group: '1_settings',
                                id: actions_2.$Ru.AccountsContext,
                                when,
                            }]
                    });
                }
                async run() { }
            }));
        }
        sb() {
            const that = this;
            this.B((0, actions_2.$Xu)(class TurningOnSyncAction extends actions_2.$Wu {
                constructor() {
                    super({
                        id: 'workbench.userData.actions.cancelTurnOn',
                        title: (0, nls_1.localize)(66, null),
                        icon: codicons_1.$Pj.stopCircle,
                        menu: {
                            id: actions_2.$Ru.ViewContainerTitle,
                            when: contextkey_1.$Ii.and(CONTEXT_TURNING_ON_STATE, contextkey_1.$Ii.equals('viewContainer', userDataSync_2.$XAb)),
                            group: 'navigation',
                            order: 1
                        }
                    });
                }
                async run() {
                    return that.r.turnoff(false);
                }
            }));
        }
        tb() {
            const that = this;
            const id = 'workbench.userData.actions.signin';
            const when = contextkey_1.$Ii.and(userDataSync_2.$PAb.notEqualsTo("uninitialized" /* SyncStatus.Uninitialized */), userDataSync_2.$QAb, userDataSync_2.$RAb.isEqualTo("unavailable" /* AccountStatus.Unavailable */));
            this.B((0, actions_2.$Xu)(class StopSyncAction extends actions_2.$Wu {
                constructor() {
                    super({
                        id: 'workbench.userData.actions.signin',
                        title: (0, nls_1.localize)(67, null),
                        menu: {
                            group: '3_settings_sync',
                            id: actions_2.$Ru.GlobalActivity,
                            when,
                            order: 2
                        }
                    });
                }
                async run() {
                    try {
                        await that.r.signIn();
                    }
                    catch (e) {
                        that.t.error(e);
                    }
                }
            }));
            this.B(actions_2.$Tu.appendMenuItem(actions_2.$Ru.AccountsContext, {
                group: '1_settings',
                command: {
                    id,
                    title: (0, nls_1.localize)(68, null),
                },
                when
            }));
        }
        ub() {
            return { value: (0, nls_1.localize)(69, null, this.db()), original: `Show Conflicts (${this.db()})` };
        }
        vb() {
            const that = this;
            this.B((0, actions_2.$Xu)(class TurningOnSyncAction extends actions_2.$Wu {
                constructor() {
                    super({
                        id: showConflictsCommandId,
                        get title() { return that.ub(); },
                        category: { value: userDataSync_2.$NAb, original: `Settings Sync` },
                        f1: true,
                        precondition: userDataSync_2.$UAb,
                        menu: [{
                                group: '3_settings_sync',
                                id: actions_2.$Ru.GlobalActivity,
                                when: userDataSync_2.$UAb,
                                order: 2
                            }, {
                                group: '3_settings_sync',
                                id: actions_2.$Ru.MenubarPreferencesMenu,
                                when: userDataSync_2.$UAb,
                                order: 2
                            }]
                    });
                }
                async run() {
                    return that.r.showConflicts();
                }
            }));
        }
        wb() {
            const that = this;
            const when = contextkey_1.$Ii.and(userDataSync_2.$QAb, userDataSync_2.$RAb.isEqualTo("available" /* AccountStatus.Available */), userDataSync_2.$PAb.notEqualsTo("uninitialized" /* SyncStatus.Uninitialized */));
            this.B((0, actions_2.$Xu)(class SyncStatusAction extends actions_2.$Wu {
                constructor() {
                    super({
                        id: 'workbench.userDataSync.actions.manage',
                        title: (0, nls_1.localize)(70, null),
                        toggled: contextkey_1.$Mi.INSTANCE,
                        menu: [
                            {
                                id: actions_2.$Ru.GlobalActivity,
                                group: '3_settings_sync',
                                when,
                                order: 2
                            },
                            {
                                id: actions_2.$Ru.MenubarPreferencesMenu,
                                group: '3_settings_sync',
                                when,
                                order: 2,
                            },
                            {
                                id: actions_2.$Ru.AccountsContext,
                                group: '1_settings',
                                when,
                            }
                        ],
                    });
                }
                run(accessor) {
                    return new Promise((c, e) => {
                        const quickInputService = accessor.get(quickInput_1.$Gq);
                        const commandService = accessor.get(commands_1.$Fr);
                        const disposables = new lifecycle_1.$jc();
                        const quickPick = quickInputService.createQuickPick();
                        disposables.add(quickPick);
                        const items = [];
                        if (that.n.conflicts.length) {
                            items.push({ id: showConflictsCommandId, label: `${userDataSync_2.$NAb}: ${that.ub().original}` });
                            items.push({ type: 'separator' });
                        }
                        items.push({ id: configureSyncCommand.id, label: `${userDataSync_2.$NAb}: ${configureSyncCommand.title.original}` });
                        items.push({ id: showSyncSettingsCommand.id, label: `${userDataSync_2.$NAb}: ${showSyncSettingsCommand.title.original}` });
                        items.push({ id: showSyncedDataCommand.id, label: `${userDataSync_2.$NAb}: ${showSyncedDataCommand.title.original}` });
                        items.push({ type: 'separator' });
                        items.push({ id: syncNowCommand.id, label: `${userDataSync_2.$NAb}: ${syncNowCommand.title.original}`, description: syncNowCommand.description(that.n) });
                        if (that.j.canToggleEnablement()) {
                            const account = that.r.current;
                            items.push({ id: turnOffSyncCommand.id, label: `${userDataSync_2.$NAb}: ${turnOffSyncCommand.title.original}`, description: account ? `${account.accountName} (${that.L.getLabel(account.authenticationProviderId)})` : undefined });
                        }
                        quickPick.items = items;
                        disposables.add(quickPick.onDidAccept(() => {
                            if (quickPick.selectedItems[0] && quickPick.selectedItems[0].id) {
                                commandService.executeCommand(quickPick.selectedItems[0].id);
                            }
                            quickPick.hide();
                        }));
                        disposables.add(quickPick.onDidHide(() => {
                            disposables.dispose();
                            c();
                        }));
                        quickPick.show();
                    });
                }
            }));
        }
        xb() {
            const that = this;
            const when = contextkey_1.$Ii.and(userDataSync_2.$RAb.isEqualTo("available" /* AccountStatus.Available */), userDataSync_2.$PAb.notEqualsTo("uninitialized" /* SyncStatus.Uninitialized */));
            this.B((0, actions_2.$Xu)(class SyncStatusAction extends actions_2.$Wu {
                constructor() {
                    super({
                        id: showSyncedDataCommand.id,
                        title: showSyncedDataCommand.title,
                        category: { value: userDataSync_2.$NAb, original: `Settings Sync` },
                        precondition: when,
                        menu: {
                            id: actions_2.$Ru.CommandPalette,
                            when
                        }
                    });
                }
                run(accessor) {
                    return that.r.showSyncActivity();
                }
            }));
        }
        yb() {
            const that = this;
            this.B((0, actions_2.$Xu)(class SyncNowAction extends actions_2.$Wu {
                constructor() {
                    super({
                        id: syncNowCommand.id,
                        title: syncNowCommand.title,
                        category: { value: userDataSync_2.$NAb, original: `Settings Sync` },
                        menu: {
                            id: actions_2.$Ru.CommandPalette,
                            when: contextkey_1.$Ii.and(userDataSync_2.$QAb, userDataSync_2.$RAb.isEqualTo("available" /* AccountStatus.Available */), userDataSync_2.$PAb.notEqualsTo("uninitialized" /* SyncStatus.Uninitialized */))
                        }
                    });
                }
                run(accessor) {
                    return that.r.syncNow();
                }
            }));
        }
        zb() {
            const that = this;
            this.B((0, actions_2.$Xu)(class StopSyncAction extends actions_2.$Wu {
                constructor() {
                    super({
                        id: turnOffSyncCommand.id,
                        title: turnOffSyncCommand.title,
                        category: { value: userDataSync_2.$NAb, original: `Settings Sync` },
                        menu: {
                            id: actions_2.$Ru.CommandPalette,
                            when: contextkey_1.$Ii.and(userDataSync_2.$PAb.notEqualsTo("uninitialized" /* SyncStatus.Uninitialized */), userDataSync_2.$QAb),
                        },
                    });
                }
                async run() {
                    try {
                        await that.lb();
                    }
                    catch (e) {
                        if (!(0, errors_1.$2)(e)) {
                            that.t.error((0, nls_1.localize)(71, null, `command:${userDataSync_2.$WAb}`));
                        }
                    }
                }
            }));
        }
        Ab() {
            const that = this;
            const when = contextkey_1.$Ii.and(userDataSync_2.$PAb.notEqualsTo("uninitialized" /* SyncStatus.Uninitialized */), userDataSync_2.$QAb);
            this.B((0, actions_2.$Xu)(class ConfigureSyncAction extends actions_2.$Wu {
                constructor() {
                    super({
                        id: configureSyncCommand.id,
                        title: configureSyncCommand.title,
                        category: { value: userDataSync_2.$NAb, original: `Settings Sync` },
                        icon: codicons_1.$Pj.settingsGear,
                        tooltip: (0, nls_1.localize)(72, null),
                        menu: [{
                                id: actions_2.$Ru.CommandPalette,
                                when
                            }, {
                                id: actions_2.$Ru.ViewContainerTitle,
                                when: contextkey_1.$Ii.and(userDataSync_2.$QAb, contextkey_1.$Ii.equals('viewContainer', userDataSync_2.$XAb)),
                                group: 'navigation',
                                order: 2
                            }]
                    });
                }
                run() { return that.kb(); }
            }));
        }
        Bb() {
            const that = this;
            this.B((0, actions_2.$Xu)(class ShowSyncActivityAction extends actions_2.$Wu {
                constructor() {
                    super({
                        id: userDataSync_2.$WAb,
                        title: (0, nls_1.localize)(73, null, userDataSync_2.$NAb),
                        tooltip: (0, nls_1.localize)(74, null),
                        icon: codicons_1.$Pj.output,
                        menu: [{
                                id: actions_2.$Ru.CommandPalette,
                                when: contextkey_1.$Ii.and(userDataSync_2.$PAb.notEqualsTo("uninitialized" /* SyncStatus.Uninitialized */)),
                            }, {
                                id: actions_2.$Ru.ViewContainerTitle,
                                when: contextkey_1.$Ii.equals('viewContainer', userDataSync_2.$XAb),
                                group: 'navigation',
                                order: 1
                            }],
                    });
                }
                run() { return that.nb(); }
            }));
        }
        Cb() {
            this.B((0, actions_2.$Xu)(class ShowSyncSettingsAction extends actions_2.$Wu {
                constructor() {
                    super({
                        id: showSyncSettingsCommand.id,
                        title: showSyncSettingsCommand.title,
                        category: { value: userDataSync_2.$NAb, original: `Settings Sync` },
                        menu: {
                            id: actions_2.$Ru.CommandPalette,
                            when: contextkey_1.$Ii.and(userDataSync_2.$PAb.notEqualsTo("uninitialized" /* SyncStatus.Uninitialized */)),
                        },
                    });
                }
                run(accessor) {
                    accessor.get(preferences_1.$BE).openUserSettings({ jsonEditor: false, query: '@tag:sync' });
                }
            }));
        }
        Db() {
            const that = this;
            this.B((0, actions_2.$Xu)(class HelpAction extends actions_2.$Wu {
                constructor() {
                    super({
                        id: 'workbench.userDataSync.actions.help',
                        title: { value: userDataSync_2.$NAb, original: 'Settings Sync' },
                        category: actionCommonCategories_1.$Nl.Help,
                        menu: [{
                                id: actions_2.$Ru.CommandPalette,
                                when: contextkey_1.$Ii.and(userDataSync_2.$PAb.notEqualsTo("uninitialized" /* SyncStatus.Uninitialized */)),
                            }],
                    });
                }
                run() { return that.J.open(uri_1.URI.parse('https://aka.ms/vscode-settings-sync-help')); }
            }));
            actions_2.$Tu.appendMenuItem(actions_2.$Ru.ViewContainerTitle, {
                command: {
                    id: 'workbench.userDataSync.actions.help',
                    title: actionCommonCategories_1.$Nl.Help.value
                },
                when: contextkey_1.$Ii.equals('viewContainer', userDataSync_2.$XAb),
                group: '1_help',
            });
        }
        Eb() {
            const that = this;
            this.B((0, actions_2.$Xu)(class AcceptMergesAction extends actions_2.$Wu {
                constructor() {
                    super({
                        id: 'workbench.userDataSync.actions.acceptMerges',
                        title: (0, nls_1.localize)(75, null),
                        menu: [{
                                id: actions_2.$Ru.EditorContent,
                                when: contextkey_1.$Ii.and(mergeEditor_1.$5jb, contextkey_1.$Ii.regex(mergeEditor_1.$0jb.key, new RegExp(`^${userDataSync_1.$Wgb}:`))),
                            }],
                    });
                }
                async run(accessor, previewResource) {
                    const textFileService = accessor.get(textfiles_1.$JD);
                    await textFileService.save(previewResource);
                    const content = await textFileService.read(previewResource);
                    await that.n.accept(this.d(previewResource), previewResource, content.value, true);
                }
                d(previewResource) {
                    const conflict = that.n.conflicts.find(({ conflicts }) => conflicts.some(conflict => (0, resources_1.$bg)(conflict.previewResource, previewResource)));
                    if (conflict) {
                        return conflict;
                    }
                    throw new Error(`Unknown resource: ${previewResource.toString()}`);
                }
            }));
        }
        Fb() {
            this.B((0, actions_2.$Xu)(class DownloadSyncActivityAction extends actions_2.$Wu {
                constructor() {
                    super({
                        id: 'workbench.userDataSync.actions.downloadSyncActivity',
                        title: { original: 'Download Settings Sync Activity', value: (0, nls_1.localize)(76, null) },
                        category: actionCommonCategories_1.$Nl.Developer,
                        f1: true,
                        precondition: contextkey_1.$Ii.and(userDataSync_2.$RAb.isEqualTo("available" /* AccountStatus.Available */), userDataSync_2.$PAb.notEqualsTo("uninitialized" /* SyncStatus.Uninitialized */))
                    });
                }
                async run(accessor) {
                    const userDataSyncWorkbenchService = accessor.get(userDataSync_2.$KAb);
                    const fileDialogService = accessor.get(dialogs_1.$qA);
                    const progressService = accessor.get(progress_1.$2u);
                    const uriIdentityService = accessor.get(uriIdentity_1.$Ck);
                    const fileService = accessor.get(files_1.$6j);
                    const userDataSyncMachinesService = accessor.get(userDataSyncMachines_1.$sgb);
                    const result = await fileDialogService.showOpenDialog({
                        title: (0, nls_1.localize)(77, null),
                        canSelectFiles: false,
                        canSelectFolders: true,
                        canSelectMany: false,
                        openLabel: (0, nls_1.localize)(78, null),
                    });
                    if (!result?.[0]) {
                        return;
                    }
                    await progressService.withProgress({ location: 10 /* ProgressLocation.Window */ }, async () => {
                        const machines = await userDataSyncMachinesService.getMachines();
                        const currentMachine = machines.find(m => m.isCurrent);
                        const name = (currentMachine ? currentMachine.name + ' - ' : '') + 'Settings Sync Activity';
                        const stat = await fileService.resolve(result[0]);
                        const nameRegEx = new RegExp(`${(0, strings_1.$qe)(name)}\\s(\\d+)`);
                        const indexes = [];
                        for (const child of stat.children ?? []) {
                            if (child.name === name) {
                                indexes.push(0);
                            }
                            else {
                                const matches = nameRegEx.exec(child.name);
                                if (matches) {
                                    indexes.push(parseInt(matches[1]));
                                }
                            }
                        }
                        indexes.sort((a, b) => a - b);
                        return userDataSyncWorkbenchService.downloadSyncActivity(uriIdentityService.extUri.joinPath(result[0], indexes[0] !== 0 ? name : `${name} ${indexes[indexes.length - 1] + 1}`));
                    });
                }
            }));
        }
        Gb() {
            const container = this.Hb();
            this.Jb(container);
        }
        Hb() {
            return platform_1.$8m.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
                id: userDataSync_2.$XAb,
                title: { value: userDataSync_2.$NAb, original: userDataSync_2.$MAb },
                ctorDescriptor: new descriptors_1.$yh(viewPaneContainer_1.$Seb, [userDataSync_2.$XAb, { mergeViewWithContainerWhenSingleView: true }]),
                icon: userDataSync_2.$OAb,
                hideIfEmpty: true,
            }, 0 /* ViewContainerLocation.Sidebar */);
        }
        Ib() {
            const that = this;
            this.B((0, actions_2.$Xu)(class extends actions_2.$Wu {
                constructor() {
                    super({
                        id: 'workbench.actions.syncData.reset',
                        title: (0, nls_1.localize)(79, null),
                        menu: [{
                                id: actions_2.$Ru.ViewContainerTitle,
                                when: contextkey_1.$Ii.equals('viewContainer', userDataSync_2.$XAb),
                                group: '0_configure',
                            }],
                    });
                }
                run() { return that.r.resetSyncedData(); }
            }));
        }
        Jb(container) {
            this.B(this.D.createInstance(userDataSyncViews_1.$HZb, container));
        }
    };
    exports.$IZb = $IZb;
    exports.$IZb = $IZb = __decorate([
        __param(0, userDataSync_1.$Pgb),
        __param(1, userDataSync_1.$Qgb),
        __param(2, userDataSync_2.$KAb),
        __param(3, contextkey_1.$3i),
        __param(4, activity_1.$HV),
        __param(5, notification_1.$Yu),
        __param(6, editorService_1.$9C),
        __param(7, userDataProfile_1.$Ek),
        __param(8, userDataProfile_2.$CJ),
        __param(9, dialogs_1.$oA),
        __param(10, quickInput_1.$Gq),
        __param(11, instantiation_1.$Ah),
        __param(12, output_1.$eJ),
        __param(13, userDataSync_1.$Sgb),
        __param(14, resolverService_1.$uA),
        __param(15, preferences_1.$BE),
        __param(16, telemetry_1.$9k),
        __param(17, productService_1.$kj),
        __param(18, opener_1.$NT),
        __param(19, authentication_1.$3I),
        __param(20, userDataSync_1.$Egb),
        __param(21, configuration_1.$8h),
        __param(22, host_1.$VT),
        __param(23, commands_1.$Fr),
        __param(24, issue_1.$rtb)
    ], $IZb);
    let UserDataRemoteContentProvider = class UserDataRemoteContentProvider {
        constructor(d, f, g) {
            this.d = d;
            this.f = f;
            this.g = g;
        }
        provideTextContent(uri) {
            if (uri.scheme === userDataSync_1.$Wgb) {
                return this.d.resolveContent(uri).then(content => this.f.createModel(content || '', this.g.createById('jsonc'), uri));
            }
            return null;
        }
    };
    UserDataRemoteContentProvider = __decorate([
        __param(0, userDataSync_1.$Qgb),
        __param(1, model_1.$yA),
        __param(2, language_1.$ct)
    ], UserDataRemoteContentProvider);
});
//# sourceMappingURL=userDataSync.js.map