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
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/actions/common/actions", "vs/nls!vs/workbench/contrib/editSessions/browser/editSessions.contribution", "vs/workbench/contrib/editSessions/common/editSessions", "vs/workbench/contrib/scm/common/scm", "vs/platform/files/common/files", "vs/platform/workspace/common/workspace", "vs/base/common/uri", "vs/base/common/resources", "vs/base/common/buffer", "vs/platform/configuration/common/configuration", "vs/platform/progress/common/progress", "vs/workbench/contrib/editSessions/browser/editSessionsStorageService", "vs/platform/instantiation/common/extensions", "vs/platform/userDataSync/common/userDataSync", "vs/platform/telemetry/common/telemetry", "vs/platform/notification/common/notification", "vs/platform/dialogs/common/dialogs", "vs/platform/product/common/productService", "vs/platform/opener/common/opener", "vs/platform/environment/common/environment", "vs/workbench/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/commands/common/commands", "vs/platform/workspace/common/virtualWorkspace", "vs/base/common/network", "vs/platform/contextkey/common/contextkeys", "vs/workbench/services/extensions/common/extensions", "vs/workbench/contrib/editSessions/common/editSessionsLogService", "vs/workbench/common/views", "vs/platform/instantiation/common/descriptors", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/editSessions/browser/editSessionsViews", "vs/workbench/contrib/editSessions/browser/editSessionsFileSystemProvider", "vs/base/common/platform", "vs/workbench/common/contextkeys", "vs/base/common/cancellation", "vs/base/common/objects", "vs/platform/workspace/common/editSessions", "vs/base/common/themables", "vs/workbench/services/output/common/output", "vs/base/browser/hash", "vs/platform/storage/common/storage", "vs/workbench/services/activity/common/activity", "vs/workbench/services/editor/common/editorService", "vs/base/common/codicons", "vs/base/common/errors", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/contrib/editSessions/common/workspaceStateSync", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/request/common/request", "vs/workbench/contrib/editSessions/common/editSessionsStorageClient", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/services/workspaces/common/workspaceIdentityService"], function (require, exports, lifecycle_1, contributions_1, platform_1, lifecycle_2, actions_1, nls_1, editSessions_1, scm_1, files_1, workspace_1, uri_1, resources_1, buffer_1, configuration_1, progress_1, editSessionsStorageService_1, extensions_1, userDataSync_1, telemetry_1, notification_1, dialogs_1, productService_1, opener_1, environment_1, configuration_2, configurationRegistry_1, quickInput_1, extensionsRegistry_1, contextkey_1, commands_1, virtualWorkspace_1, network_1, contextkeys_1, extensions_2, editSessionsLogService_1, views_1, descriptors_1, viewPaneContainer_1, instantiation_1, editSessionsViews_1, editSessionsFileSystemProvider_1, platform_2, contextkeys_2, cancellation_1, objects_1, editSessions_2, themables_1, output_1, hash_1, storage_1, activity_1, editorService_1, codicons_1, errors_1, remoteAgentService_1, extensions_3, panecomposite_1, workspaceStateSync_1, userDataProfile_1, request_1, editSessionsStorageClient_1, uriIdentity_1, workspaceIdentityService_1) {
    "use strict";
    var $g1b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$g1b = void 0;
    (0, extensions_1.$mr)(editSessions_1.$VZb, editSessionsLogService_1.$a1b, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(editSessions_1.$UZb, editSessionsStorageService_1.$_Zb, 1 /* InstantiationType.Delayed */);
    const continueWorkingOnCommand = {
        id: '_workbench.editSessions.actions.continueEditSession',
        title: { value: (0, nls_1.localize)(0, null), original: 'Continue Working On...' },
        precondition: contextkeys_2.$Qcb.notEqualsTo('0'),
        f1: true
    };
    const openLocalFolderCommand = {
        id: '_workbench.editSessions.actions.continueEditSession.openLocalFolder',
        title: { value: (0, nls_1.localize)(1, null), original: 'Open In Local Folder' },
        category: editSessions_1.$TZb,
        precondition: contextkey_1.$Ii.and(contextkeys_1.$23.toNegated(), contextkeys_2.$Wcb)
    };
    const showOutputChannelCommand = {
        id: 'workbench.editSessions.actions.showOutputChannel',
        title: { value: (0, nls_1.localize)(2, null), original: 'Show Log' },
        category: editSessions_1.$TZb
    };
    const installAdditionalContinueOnOptionsCommand = {
        id: 'workbench.action.continueOn.extensions',
        title: (0, nls_1.localize)(3, null),
    };
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({ ...installAdditionalContinueOnOptionsCommand, f1: false });
        }
        async run(accessor) {
            const paneCompositePartService = accessor.get(panecomposite_1.$Yeb);
            const viewlet = await paneCompositePartService.openPaneComposite(extensions_3.$Ofb, 0 /* ViewContainerLocation.Sidebar */, true);
            const view = viewlet?.getViewPaneContainer();
            view?.search('@tag:continueOn');
        }
    });
    const resumeProgressOptionsTitle = `[${(0, nls_1.localize)(4, null)}](command:${showOutputChannelCommand.id})`;
    const resumeProgressOptions = {
        location: 10 /* ProgressLocation.Window */,
        type: 'syncing',
    };
    const queryParamName = 'editSessionId';
    const useEditSessionsWithContinueOn = 'workbench.editSessions.continueOn';
    let $g1b = class $g1b extends lifecycle_1.$kc {
        static { $g1b_1 = this; }
        static { this.h = 'applicationLaunchedViaContinueOn'; }
        constructor(s, t, u, w, y, z, C, D, F, G, H, I, J, L, M, N, O, P, Q, R, S, U, W, X, Y, Z, $, ab, bb) {
            super();
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
            this.R = R;
            this.S = S;
            this.U = U;
            this.W = W;
            this.X = X;
            this.Y = Y;
            this.Z = Z;
            this.$ = $;
            this.ab = ab;
            this.bb = bb;
            this.a = [];
            this.j = this.B(new lifecycle_1.$lc());
            this.m = new Set();
            this.b = editSessions_1.$7Zb.bindTo(this.P);
            this.g = editSessions_1.$1Zb.bindTo(this.P);
            this.g.set(false);
            if (!this.I['editSessions.store']?.url) {
                return;
            }
            this.r = new editSessionsStorageClient_1.$SZb(uri_1.URI.parse(this.I['editSessions.store'].url), this.I, this.Z, this.F, this.G, this.t, this.S);
            this.s.storeClient = this.r;
            this.n = new workspaceStateSync_1.$f1b(this.$.defaultProfile, undefined, this.r, this.F, this.t, this.G, this.y, this.J, this.S, this.ab, this.bb, this.s);
            this.cb();
            this.gb();
            this.fb();
            this.rb();
            this.B(this.t.registerProvider(editSessionsFileSystemProvider_1.$c1b.SCHEMA, new editSessionsFileSystemProvider_1.$c1b(this.s)));
            this.R.onWillShutdown((e) => {
                if (e.reason !== 3 /* ShutdownReason.RELOAD */ && this.s.isSignedIn && this.J.getValue('workbench.experimental.cloudChanges.autoStore') === 'onShutdown' && !platform_2.$o) {
                    e.join(this.eb(), { id: 'autoStoreWorkingChanges', label: (0, nls_1.localize)(5, null) });
                }
            });
            this.B(this.s.onDidSignIn(() => this.db()));
            this.B(this.s.onDidSignOut(() => this.db()));
        }
        async cb() {
            const shouldAutoResumeOnReload = this.J.getValue('workbench.cloudChanges.autoResume') === 'onReload';
            if (this.G.editSessionId !== undefined) {
                this.F.info(`Resuming cloud changes, reason: found editSessionId ${this.G.editSessionId} in environment service...`);
                await this.u.withProgress(resumeProgressOptions, async (progress) => await this.resumeEditSession(this.G.editSessionId, undefined, undefined, undefined, progress).finally(() => this.G.editSessionId = undefined));
            }
            else if (shouldAutoResumeOnReload && this.s.isSignedIn) {
                this.F.info('Resuming cloud changes, reason: cloud changes enabled...');
                // Attempt to resume edit session based on edit workspace identifier
                // Note: at this point if the user is not signed into edit sessions,
                // we don't want them to be prompted to sign in and should just return early
                await this.u.withProgress(resumeProgressOptions, async (progress) => await this.resumeEditSession(undefined, true, undefined, undefined, progress));
            }
            else if (shouldAutoResumeOnReload) {
                // The application has previously launched via a protocol URL Continue On flow
                const hasApplicationLaunchedFromContinueOnFlow = this.S.getBoolean($g1b_1.h, -1 /* StorageScope.APPLICATION */, false);
                this.F.info(`Prompting to enable cloud changes, has application previously launched from Continue On flow: ${hasApplicationLaunchedFromContinueOnFlow}`);
                const handlePendingEditSessions = () => {
                    // display a badge in the accounts menu but do not prompt the user to sign in again
                    this.F.info('Showing badge to enable cloud changes in accounts menu...');
                    this.db();
                    this.g.set(true);
                    // attempt a resume if we are in a pending state and the user just signed in
                    const disposable = this.s.onDidSignIn(async () => {
                        disposable.dispose();
                        this.F.info('Showing badge to enable cloud changes in accounts menu succeeded, resuming cloud changes...');
                        await this.u.withProgress(resumeProgressOptions, async (progress) => await this.resumeEditSession(undefined, true, undefined, undefined, progress));
                        this.S.remove($g1b_1.h, -1 /* StorageScope.APPLICATION */);
                        this.G.continueOn = undefined;
                    });
                };
                if ((this.G.continueOn !== undefined) &&
                    !this.s.isSignedIn &&
                    // and user has not yet been prompted to sign in on this machine
                    hasApplicationLaunchedFromContinueOnFlow === false) {
                    // store the fact that we prompted the user
                    this.S.store($g1b_1.h, true, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                    this.F.info('Prompting to enable cloud changes...');
                    await this.s.initialize('read');
                    if (this.s.isSignedIn) {
                        this.F.info('Prompting to enable cloud changes succeeded, resuming cloud changes...');
                        await this.u.withProgress(resumeProgressOptions, async (progress) => await this.resumeEditSession(undefined, true, undefined, undefined, progress));
                    }
                    else {
                        handlePendingEditSessions();
                    }
                }
                else if (!this.s.isSignedIn &&
                    // and user has been prompted to sign in on this machine
                    hasApplicationLaunchedFromContinueOnFlow === true) {
                    handlePendingEditSessions();
                }
            }
            else {
                this.F.debug('Auto resuming cloud changes disabled.');
            }
        }
        db() {
            if (this.s.isSignedIn) {
                return this.j.clear();
            }
            const badge = new activity_1.$IV(1, () => (0, nls_1.localize)(6, null));
            this.j.value = this.U.showAccountsActivity({ badge });
        }
        async eb() {
            const cancellationTokenSource = new cancellation_1.$pd();
            await this.u.withProgress({
                location: 10 /* ProgressLocation.Window */,
                type: 'syncing',
                title: (0, nls_1.localize)(7, null)
            }, async () => this.storeEditSession(false, cancellationTokenSource.token), () => {
                cancellationTokenSource.cancel();
                cancellationTokenSource.dispose();
            });
        }
        fb() {
            const container = platform_1.$8m.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
                id: editSessions_1.$2Zb,
                title: { value: editSessions_1.$5Zb, original: editSessions_1.$4Zb },
                ctorDescriptor: new descriptors_1.$yh(viewPaneContainer_1.$Seb, [editSessions_1.$2Zb, { mergeViewWithContainerWhenSingleView: true }]),
                icon: editSessions_1.$6Zb,
                hideIfEmpty: true
            }, 0 /* ViewContainerLocation.Sidebar */, { doNotRegisterOpenCommand: true });
            this.B(this.H.createInstance(editSessionsViews_1.$b1b, container));
        }
        gb() {
            this.jb();
            this.kb();
            this.lb();
            this.tb();
            this.ib();
            this.hb();
        }
        hb() {
            this.B((0, actions_1.$Xu)(class ShowEditSessionOutput extends actions_1.$Wu {
                constructor() {
                    super(showOutputChannelCommand);
                }
                run(accessor, ...args) {
                    const outputChannel = accessor.get(output_1.$eJ);
                    void outputChannel.showChannel(editSessions_1.$$Zb);
                }
            }));
        }
        ib() {
            const that = this;
            this.B((0, actions_1.$Xu)(class ShowEditSessionView extends actions_1.$Wu {
                constructor() {
                    super({
                        id: 'workbench.editSessions.actions.showEditSessions',
                        title: { value: (0, nls_1.localize)(8, null), original: 'Show Cloud Changes' },
                        category: editSessions_1.$TZb,
                        f1: true
                    });
                }
                async run(accessor) {
                    that.b.set(true);
                    const viewsService = accessor.get(views_1.$$E);
                    await viewsService.openView(editSessions_1.$3Zb);
                }
            }));
        }
        jb() {
            const that = this;
            this.B((0, actions_1.$Xu)(class ContinueEditSessionAction extends actions_1.$Wu {
                constructor() {
                    super(continueWorkingOnCommand);
                }
                async run(accessor, workspaceUri, destination) {
                    // First ask the user to pick a destination, if necessary
                    let uri = workspaceUri;
                    if (!destination && !uri) {
                        destination = await that.ub();
                        if (!destination) {
                            that.y.publicLog2('continueOn.editSessions.pick.outcome', { outcome: 'noSelection' });
                            return;
                        }
                    }
                    // Determine if we need to store an edit session, asking for edit session auth if necessary
                    const shouldStoreEditSession = await that.qb();
                    // Run the store action to get back a ref
                    let ref;
                    if (shouldStoreEditSession) {
                        that.y.publicLog2('continueOn.editSessions.store');
                        const cancellationTokenSource = new cancellation_1.$pd();
                        try {
                            ref = await that.u.withProgress({
                                location: 15 /* ProgressLocation.Notification */,
                                cancellable: true,
                                type: 'syncing',
                                title: (0, nls_1.localize)(9, null)
                            }, async () => {
                                const ref = await that.storeEditSession(false, cancellationTokenSource.token);
                                if (ref !== undefined) {
                                    that.y.publicLog2('continueOn.editSessions.store.outcome', { outcome: 'storeSucceeded', hashedId: (0, editSessions_1.$0Zb)(ref) });
                                }
                                else {
                                    that.y.publicLog2('continueOn.editSessions.store.outcome', { outcome: 'storeSkipped' });
                                }
                                return ref;
                            }, () => {
                                cancellationTokenSource.cancel();
                                cancellationTokenSource.dispose();
                                that.y.publicLog2('continueOn.editSessions.store.outcome', { outcome: 'storeCancelledByUser' });
                            });
                        }
                        catch (ex) {
                            that.y.publicLog2('continueOn.editSessions.store.outcome', { outcome: 'storeFailed' });
                            throw ex;
                        }
                    }
                    // Append the ref to the URI
                    uri = destination ? await that.vb(destination) : uri;
                    if (uri === undefined) {
                        return;
                    }
                    if (ref !== undefined && uri !== 'noDestinationUri') {
                        const encodedRef = encodeURIComponent(ref);
                        uri = uri.with({
                            query: uri.query.length > 0 ? (uri.query + `&${queryParamName}=${encodedRef}&continueOn=1`) : `${queryParamName}=${encodedRef}&continueOn=1`
                        });
                        // Open the URI
                        that.F.info(`Opening ${uri.toString()}`);
                        await that.w.open(uri, { openExternal: true });
                    }
                    else if (!shouldStoreEditSession && uri !== 'noDestinationUri') {
                        // Open the URI without an edit session ref
                        that.F.info(`Opening ${uri.toString()}`);
                        await that.w.open(uri, { openExternal: true });
                    }
                    else if (ref === undefined && shouldStoreEditSession) {
                        that.F.warn(`Failed to store working changes when invoking ${continueWorkingOnCommand.id}.`);
                    }
                }
            }));
        }
        kb() {
            const that = this;
            this.B((0, actions_1.$Xu)(class ResumeLatestEditSessionAction extends actions_1.$Wu {
                constructor() {
                    super({
                        id: 'workbench.editSessions.actions.resumeLatest',
                        title: { value: (0, nls_1.localize)(10, null), original: 'Resume Latest Changes from Cloud' },
                        category: editSessions_1.$TZb,
                        f1: true,
                    });
                }
                async run(accessor, editSessionId, forceApplyUnrelatedChange) {
                    await that.u.withProgress({ ...resumeProgressOptions, title: resumeProgressOptionsTitle }, async () => await that.resumeEditSession(editSessionId, undefined, forceApplyUnrelatedChange));
                }
            }));
            this.B((0, actions_1.$Xu)(class ResumeLatestEditSessionAction extends actions_1.$Wu {
                constructor() {
                    super({
                        id: 'workbench.editSessions.actions.resumeFromSerializedPayload',
                        title: { value: (0, nls_1.localize)(11, null), original: 'Resume Changes from Serialized Data' },
                        category: 'Developer',
                        f1: true,
                    });
                }
                async run(accessor, editSessionId) {
                    const data = await that.N.input({ prompt: 'Enter serialized data' });
                    if (data) {
                        that.s.lastReadResources.set('editSessions', { content: data, ref: '' });
                    }
                    await that.u.withProgress({ ...resumeProgressOptions, title: resumeProgressOptionsTitle }, async () => await that.resumeEditSession(editSessionId, undefined, undefined, undefined, undefined, data));
                }
            }));
        }
        lb() {
            const that = this;
            this.B((0, actions_1.$Xu)(class StoreLatestEditSessionAction extends actions_1.$Wu {
                constructor() {
                    super({
                        id: 'workbench.editSessions.actions.storeCurrent',
                        title: { value: (0, nls_1.localize)(12, null), original: 'Store Working Changes in Cloud' },
                        category: editSessions_1.$TZb,
                        f1: true,
                    });
                }
                async run(accessor) {
                    const cancellationTokenSource = new cancellation_1.$pd();
                    await that.u.withProgress({
                        location: 15 /* ProgressLocation.Notification */,
                        title: (0, nls_1.localize)(13, null)
                    }, async () => {
                        that.y.publicLog2('editSessions.store');
                        await that.storeEditSession(true, cancellationTokenSource.token);
                    }, () => {
                        cancellationTokenSource.cancel();
                        cancellationTokenSource.dispose();
                    });
                }
            }));
        }
        async resumeEditSession(ref, silent, forceApplyUnrelatedChange, applyPartialMatch, progress, serializedData) {
            // Wait for the remote environment to become available, if any
            await this.X.getEnvironment();
            // Edit sessions are not currently supported in empty workspaces
            // https://github.com/microsoft/vscode/issues/159220
            if (this.L.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
                return;
            }
            this.F.info(ref !== undefined ? `Resuming changes from cloud with ref ${ref}...` : 'Checking for pending cloud changes...');
            if (silent && !(await this.s.initialize('read', true))) {
                return;
            }
            this.y.publicLog2('editSessions.resume');
            performance.mark('code/willResumeEditSessionFromIdentifier');
            progress?.report({ message: (0, nls_1.localize)(14, null) });
            const data = serializedData ? { content: serializedData, ref: '' } : await this.s.read('editSessions', ref);
            if (!data) {
                if (ref === undefined && !silent) {
                    this.C.info((0, nls_1.localize)(15, null));
                }
                else if (ref !== undefined) {
                    this.C.warn((0, nls_1.localize)(16, null, ref));
                }
                this.F.info(ref !== undefined ? `Aborting resuming changes from cloud as no edit session content is available to be applied from ref ${ref}.` : `Aborting resuming edit session as no edit session content is available to be applied`);
                return;
            }
            progress?.report({ message: resumeProgressOptionsTitle });
            const editSession = JSON.parse(data.content);
            ref = data.ref;
            if (editSession.version > editSessions_1.$WZb) {
                this.C.error((0, nls_1.localize)(17, null, this.I.nameLong));
                this.y.publicLog2('editSessions.resume.outcome', { hashedId: (0, editSessions_1.$0Zb)(ref), outcome: 'clientUpdateNeeded' });
                return;
            }
            try {
                const { changes, conflictingChanges } = await this.mb(editSession, ref, forceApplyUnrelatedChange, applyPartialMatch);
                if (changes.length === 0) {
                    return;
                }
                // TODO@joyceerhl Provide the option to diff files which would be overwritten by edit session contents
                if (conflictingChanges.length > 0) {
                    // Allow to show edit sessions
                    const { confirmed } = await this.D.confirm({
                        type: notification_1.Severity.Warning,
                        message: conflictingChanges.length > 1 ?
                            (0, nls_1.localize)(18, null, conflictingChanges.length) :
                            (0, nls_1.localize)(19, null, (0, resources_1.$fg)(conflictingChanges[0].uri)),
                        detail: conflictingChanges.length > 1 ? (0, dialogs_1.$rA)(conflictingChanges.map((c) => c.uri)) : undefined
                    });
                    if (!confirmed) {
                        return;
                    }
                }
                for (const { uri, type, contents } of changes) {
                    if (type === editSessions_1.ChangeType.Addition) {
                        await this.t.writeFile(uri, (0, editSessions_1.$9Zb)(editSession.version, contents));
                    }
                    else if (type === editSessions_1.ChangeType.Deletion && await this.t.exists(uri)) {
                        await this.t.del(uri);
                    }
                }
                await this.n?.apply(false, {});
                this.F.info(`Deleting edit session with ref ${ref} after successfully applying it to current workspace...`);
                await this.s.delete('editSessions', ref);
                this.F.info(`Deleted edit session with ref ${ref}.`);
                this.y.publicLog2('editSessions.resume.outcome', { hashedId: (0, editSessions_1.$0Zb)(ref), outcome: 'resumeSucceeded' });
            }
            catch (ex) {
                this.F.error('Failed to resume edit session, reason: ', ex.toString());
                this.C.error((0, nls_1.localize)(20, null));
            }
            performance.mark('code/didResumeEditSessionFromIdentifier');
        }
        async mb(editSession, ref, forceApplyUnrelatedChange = false, applyPartialMatch = false) {
            const changes = [];
            const conflictingChanges = [];
            const workspaceFolders = this.L.getWorkspace().folders;
            const cancellationTokenSource = new cancellation_1.$pd();
            for (const folder of editSession.folders) {
                let folderRoot;
                if (folder.canonicalIdentity) {
                    // Look for an edit session identifier that we can use
                    for (const f of workspaceFolders) {
                        const identity = await this.M.getEditSessionIdentifier(f, cancellationTokenSource.token);
                        this.F.info(`Matching identity ${identity} against edit session folder identity ${folder.canonicalIdentity}...`);
                        if ((0, objects_1.$Zm)(identity, folder.canonicalIdentity) || forceApplyUnrelatedChange) {
                            folderRoot = f;
                            break;
                        }
                        if (identity !== undefined) {
                            const match = await this.M.provideEditSessionIdentityMatch(f, identity, folder.canonicalIdentity, cancellationTokenSource.token);
                            if (match === editSessions_2.EditSessionIdentityMatch.Complete) {
                                folderRoot = f;
                                break;
                            }
                            else if (match === editSessions_2.EditSessionIdentityMatch.Partial &&
                                this.J.getValue('workbench.experimental.cloudChanges.partialMatches.enabled') === true) {
                                if (!applyPartialMatch) {
                                    // Surface partially matching edit session
                                    this.C.prompt(notification_1.Severity.Info, (0, nls_1.localize)(21, null), [{ label: (0, nls_1.localize)(22, null), run: () => this.resumeEditSession(ref, false, undefined, true) }]);
                                }
                                else {
                                    folderRoot = f;
                                    break;
                                }
                            }
                        }
                    }
                }
                else {
                    folderRoot = workspaceFolders.find((f) => f.name === folder.name);
                }
                if (!folderRoot) {
                    this.F.info(`Skipping applying ${folder.workingChanges.length} changes from edit session with ref ${ref} as no matching workspace folder was found.`);
                    return { changes: [], conflictingChanges: [], contributedStateHandlers: [] };
                }
                const localChanges = new Set();
                for (const repository of this.z.repositories) {
                    if (repository.provider.rootUri !== undefined &&
                        this.L.getWorkspaceFolder(repository.provider.rootUri)?.name === folder.name) {
                        const repositoryChanges = this.ob(repository);
                        repositoryChanges.forEach((change) => localChanges.add(change.toString()));
                    }
                }
                for (const change of folder.workingChanges) {
                    const uri = (0, resources_1.$ig)(folderRoot.uri, change.relativeFilePath);
                    changes.push({ uri, type: change.type, contents: change.contents });
                    if (await this.nb(localChanges, uri, change)) {
                        conflictingChanges.push({ uri, type: change.type, contents: change.contents });
                    }
                }
            }
            return { changes, conflictingChanges };
        }
        async nb(localChanges, uriWithIncomingChanges, incomingChange) {
            if (!localChanges.has(uriWithIncomingChanges.toString())) {
                return false;
            }
            const { contents, type } = incomingChange;
            switch (type) {
                case (editSessions_1.ChangeType.Addition): {
                    const [originalContents, incomingContents] = await Promise.all([(0, hash_1.$1Q)(contents), (0, hash_1.$1Q)((0, buffer_1.$Zd)((await this.t.readFile(uriWithIncomingChanges)).value))]);
                    return originalContents !== incomingContents;
                }
                case (editSessions_1.ChangeType.Deletion): {
                    return await this.t.exists(uriWithIncomingChanges);
                }
                default:
                    throw new Error('Unhandled change type.');
            }
        }
        async storeEditSession(fromStoreCommand, cancellationToken) {
            const folders = [];
            let editSessionSize = 0;
            let hasEdits = false;
            // Save all saveable editors before building edit session contents
            await this.W.saveAll();
            for (const repository of this.z.repositories) {
                // Look through all resource groups and compute which files were added/modified/deleted
                const trackedUris = this.ob(repository); // A URI might appear in more than one resource group
                const workingChanges = [];
                const { rootUri } = repository.provider;
                const workspaceFolder = rootUri ? this.L.getWorkspaceFolder(rootUri) : undefined;
                let name = workspaceFolder?.name;
                for (const uri of trackedUris) {
                    const workspaceFolder = this.L.getWorkspaceFolder(uri);
                    if (!workspaceFolder) {
                        this.F.info(`Skipping working change ${uri.toString()} as no associated workspace folder was found.`);
                        continue;
                    }
                    await this.M.onWillCreateEditSessionIdentity(workspaceFolder, cancellationToken);
                    name = name ?? workspaceFolder.name;
                    const relativeFilePath = (0, resources_1.$kg)(workspaceFolder.uri, uri) ?? uri.path;
                    // Only deal with file contents for now
                    try {
                        if (!(await this.t.stat(uri)).isFile) {
                            continue;
                        }
                    }
                    catch { }
                    hasEdits = true;
                    if (await this.t.exists(uri)) {
                        const contents = (0, buffer_1.$Zd)((await this.t.readFile(uri)).value);
                        editSessionSize += contents.length;
                        if (editSessionSize > this.s.SIZE_LIMIT) {
                            this.C.error((0, nls_1.localize)(23, null));
                            return undefined;
                        }
                        workingChanges.push({ type: editSessions_1.ChangeType.Addition, fileType: editSessions_1.FileType.File, contents: contents, relativeFilePath: relativeFilePath });
                    }
                    else {
                        // Assume it's a deletion
                        workingChanges.push({ type: editSessions_1.ChangeType.Deletion, fileType: editSessions_1.FileType.File, contents: undefined, relativeFilePath: relativeFilePath });
                    }
                }
                let canonicalIdentity = undefined;
                if (workspaceFolder !== null && workspaceFolder !== undefined) {
                    canonicalIdentity = await this.M.getEditSessionIdentifier(workspaceFolder, cancellationToken);
                }
                // TODO@joyceerhl debt: don't store working changes as a child of the folder
                folders.push({ workingChanges, name: name ?? '', canonicalIdentity: canonicalIdentity ?? undefined, absoluteUri: workspaceFolder?.uri.toString() });
            }
            // Store contributed workspace state
            await this.n?.sync(null, {});
            if (!hasEdits) {
                this.F.info('Skipped storing working changes in the cloud as there are no edits to store.');
                if (fromStoreCommand) {
                    this.C.info((0, nls_1.localize)(24, null));
                }
                return undefined;
            }
            const data = { folders, version: 2, workspaceStateId: this.s.lastWrittenResources.get('workspaceState')?.ref };
            try {
                this.F.info(`Storing edit session...`);
                const ref = await this.s.write('editSessions', data);
                this.F.info(`Stored edit session with ref ${ref}.`);
                return ref;
            }
            catch (ex) {
                this.F.error(`Failed to store edit session, reason: `, ex.toString());
                if (ex instanceof userDataSync_1.$Lgb) {
                    switch (ex.code) {
                        case "TooLarge" /* UserDataSyncErrorCode.TooLarge */:
                            // Uploading a payload can fail due to server size limits
                            this.y.publicLog2('editSessions.upload.failed', { reason: 'TooLarge' });
                            this.C.error((0, nls_1.localize)(25, null));
                            break;
                        default:
                            this.y.publicLog2('editSessions.upload.failed', { reason: 'unknown' });
                            this.C.error((0, nls_1.localize)(26, null));
                            break;
                    }
                }
            }
            return undefined;
        }
        ob(repository) {
            return repository.provider.groups.elements.reduce((resources, resourceGroups) => {
                resourceGroups.elements.forEach((resource) => resources.add(resource.sourceUri));
                return resources;
            }, new Set()); // A URI might appear in more than one resource group
        }
        pb() {
            for (const repository of this.z.repositories) {
                if (this.ob(repository).size > 0) {
                    return true;
                }
            }
            return false;
        }
        async qb() {
            // If the user is already signed in, we should store edit session
            if (this.s.isSignedIn) {
                return this.pb();
            }
            // If the user has been asked before and said no, don't use edit sessions
            if (this.J.getValue(useEditSessionsWithContinueOn) === 'off') {
                this.y.publicLog2('continueOn.editSessions.canStore.outcome', { outcome: 'disabledEditSessionsViaSetting' });
                return false;
            }
            // Prompt the user to use edit sessions if they currently could benefit from using it
            if (this.pb()) {
                const quickpick = this.N.createQuickPick();
                quickpick.placeholder = (0, nls_1.localize)(27, null);
                quickpick.ok = false;
                quickpick.ignoreFocusOut = true;
                const withCloudChanges = { label: (0, nls_1.localize)(28, null) };
                const withoutCloudChanges = { label: (0, nls_1.localize)(29, null) };
                quickpick.items = [withCloudChanges, withoutCloudChanges];
                const continueWithCloudChanges = await new Promise((resolve, reject) => {
                    quickpick.onDidAccept(() => {
                        resolve(quickpick.selectedItems[0] === withCloudChanges);
                        quickpick.hide();
                    });
                    quickpick.onDidHide(() => {
                        reject(new errors_1.$3());
                        quickpick.hide();
                    });
                    quickpick.show();
                });
                if (!continueWithCloudChanges) {
                    this.y.publicLog2('continueOn.editSessions.canStore.outcome', { outcome: 'didNotEnableEditSessionsWhenPrompted' });
                    return continueWithCloudChanges;
                }
                const initialized = await this.s.initialize('write');
                if (!initialized) {
                    this.y.publicLog2('continueOn.editSessions.canStore.outcome', { outcome: 'didNotEnableEditSessionsWhenPrompted' });
                }
                return initialized;
            }
            return false;
        }
        //#region Continue Edit Session extension contribution point
        rb() {
            continueEditSessionExtPoint.setHandler(extensions => {
                const continueEditSessionOptions = [];
                for (const extension of extensions) {
                    if (!(0, extensions_2.$PF)(extension.description, 'contribEditSessions')) {
                        continue;
                    }
                    if (!Array.isArray(extension.value)) {
                        continue;
                    }
                    for (const contribution of extension.value) {
                        const command = actions_1.$Tu.getCommand(contribution.command);
                        if (!command) {
                            return;
                        }
                        const icon = command.icon;
                        const title = typeof command.title === 'string' ? command.title : command.title.value;
                        const when = contextkey_1.$Ii.deserialize(contribution.when);
                        continueEditSessionOptions.push(new ContinueEditSessionItem(themables_1.ThemeIcon.isThemeIcon(icon) ? `$(${icon.id}) ${title}` : title, command.id, command.source?.title, when, contribution.documentation));
                        if (contribution.qualifiedName) {
                            this.sb(command.id, contribution.qualifiedName, contribution.category ?? command.category, when, contribution.remoteGroup);
                        }
                    }
                }
                this.a = continueEditSessionOptions;
            });
        }
        sb(commandId, qualifiedName, category, when, remoteGroup) {
            const command = {
                id: `${continueWorkingOnCommand.id}.${commandId}`,
                title: { original: qualifiedName, value: qualifiedName },
                category: typeof category === 'string' ? { original: category, value: category } : category,
                precondition: when,
                f1: true
            };
            if (!this.m.has(command.id)) {
                this.m.add(command.id);
                (0, actions_1.$Xu)(class StandaloneContinueOnOption extends actions_1.$Wu {
                    constructor() {
                        super(command);
                    }
                    async run(accessor) {
                        return accessor.get(commands_1.$Fr).executeCommand(continueWorkingOnCommand.id, undefined, commandId);
                    }
                });
                if (remoteGroup !== undefined) {
                    actions_1.$Tu.appendMenuItem(actions_1.$Ru.StatusBarRemoteIndicatorMenu, {
                        group: remoteGroup,
                        command: command,
                        when: command.precondition
                    });
                }
            }
        }
        tb() {
            const that = this;
            this.B((0, actions_1.$Xu)(class ContinueInLocalFolderAction extends actions_1.$Wu {
                constructor() {
                    super(openLocalFolderCommand);
                }
                async run(accessor) {
                    const selection = await that.Q.showOpenDialog({
                        title: (0, nls_1.localize)(30, null),
                        canSelectFolders: true,
                        canSelectMany: false,
                        canSelectFiles: false,
                        availableFileSystems: [network_1.Schemas.file]
                    });
                    return selection?.length !== 1 ? undefined : uri_1.URI.from({
                        scheme: that.I.urlProtocol,
                        authority: network_1.Schemas.file,
                        path: selection[0].path
                    });
                }
            }));
            if ((0, virtualWorkspace_1.$uJ)(this.L.getWorkspace()) !== undefined && platform_2.$m) {
                this.sb(openLocalFolderCommand.id, (0, nls_1.localize)(31, null), undefined, openLocalFolderCommand.precondition, undefined);
            }
        }
        async ub() {
            const quickPick = this.N.createQuickPick();
            const workspaceContext = this.L.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */
                ? this.L.getWorkspace().folders[0].name
                : this.L.getWorkspace().folders.map((folder) => folder.name).join(', ');
            quickPick.placeholder = (0, nls_1.localize)(32, null, `'${workspaceContext}'`);
            quickPick.items = this.wb();
            this.Y.onDidChangeExtensions(() => {
                quickPick.items = this.wb();
            });
            const command = await new Promise((resolve, reject) => {
                quickPick.onDidHide(() => resolve(undefined));
                quickPick.onDidAccept((e) => {
                    const selection = quickPick.activeItems[0].command;
                    if (selection === installAdditionalContinueOnOptionsCommand.id) {
                        void this.O.executeCommand(installAdditionalContinueOnOptionsCommand.id);
                    }
                    else {
                        resolve(selection);
                        quickPick.hide();
                    }
                });
                quickPick.show();
                quickPick.onDidTriggerItemButton(async (e) => {
                    if (e.item.documentation !== undefined) {
                        const uri = uri_1.URI.isUri(e.item.documentation) ? uri_1.URI.parse(e.item.documentation) : await this.O.executeCommand(e.item.documentation);
                        void this.w.open(uri, { openExternal: true });
                    }
                });
            });
            quickPick.dispose();
            return command;
        }
        async vb(command) {
            try {
                const uri = await this.O.executeCommand(command);
                // Some continue on commands do not return a URI
                // to support extensions which want to be in control
                // of how the destination is opened
                if (uri === undefined) {
                    this.y.publicLog2('continueOn.openDestination.outcome', { selection: command, outcome: 'noDestinationUri' });
                    return 'noDestinationUri';
                }
                if (uri_1.URI.isUri(uri)) {
                    this.y.publicLog2('continueOn.openDestination.outcome', { selection: command, outcome: 'resolvedUri' });
                    return uri;
                }
                this.y.publicLog2('continueOn.openDestination.outcome', { selection: command, outcome: 'invalidDestination' });
                return undefined;
            }
            catch (ex) {
                if (ex instanceof errors_1.$3) {
                    this.y.publicLog2('continueOn.openDestination.outcome', { selection: command, outcome: 'cancelled' });
                }
                else {
                    this.y.publicLog2('continueOn.openDestination.outcome', { selection: command, outcome: 'unknownError' });
                }
                return undefined;
            }
        }
        wb() {
            const items = [...this.a].filter((option) => option.when === undefined || this.P.contextMatchesRules(option.when));
            if ((0, virtualWorkspace_1.$uJ)(this.L.getWorkspace()) !== undefined && platform_2.$m) {
                items.push(new ContinueEditSessionItem('$(folder) ' + (0, nls_1.localize)(33, null), openLocalFolderCommand.id, (0, nls_1.localize)(34, null)));
            }
            const sortedItems = items.sort((item1, item2) => item1.label.localeCompare(item2.label));
            return sortedItems.concat({ type: 'separator' }, new ContinueEditSessionItem(installAdditionalContinueOnOptionsCommand.title, installAdditionalContinueOnOptionsCommand.id));
        }
    };
    exports.$g1b = $g1b;
    exports.$g1b = $g1b = $g1b_1 = __decorate([
        __param(0, editSessions_1.$UZb),
        __param(1, files_1.$6j),
        __param(2, progress_1.$2u),
        __param(3, opener_1.$NT),
        __param(4, telemetry_1.$9k),
        __param(5, scm_1.$fI),
        __param(6, notification_1.$Yu),
        __param(7, dialogs_1.$oA),
        __param(8, editSessions_1.$VZb),
        __param(9, environment_1.$Ih),
        __param(10, instantiation_1.$Ah),
        __param(11, productService_1.$kj),
        __param(12, configuration_1.$8h),
        __param(13, workspace_1.$Kh),
        __param(14, editSessions_2.$8z),
        __param(15, quickInput_1.$Gq),
        __param(16, commands_1.$Fr),
        __param(17, contextkey_1.$3i),
        __param(18, dialogs_1.$qA),
        __param(19, lifecycle_2.$7y),
        __param(20, storage_1.$Vo),
        __param(21, activity_1.$HV),
        __param(22, editorService_1.$9C),
        __param(23, remoteAgentService_1.$jm),
        __param(24, extensions_2.$MF),
        __param(25, request_1.$Io),
        __param(26, userDataProfile_1.$Ek),
        __param(27, uriIdentity_1.$Ck),
        __param(28, workspaceIdentityService_1.$d1b)
    ], $g1b);
    const infoButtonClass = themables_1.ThemeIcon.asClassName(codicons_1.$Pj.info);
    class ContinueEditSessionItem {
        constructor(label, command, description, when, documentation) {
            this.label = label;
            this.command = command;
            this.description = description;
            this.when = when;
            this.documentation = documentation;
            if (documentation !== undefined) {
                this.buttons = [{
                        iconClass: infoButtonClass,
                        tooltip: (0, nls_1.localize)(35, null),
                    }];
            }
        }
    }
    const continueEditSessionExtPoint = extensionsRegistry_1.$2F.registerExtensionPoint({
        extensionPoint: 'continueEditSession',
        jsonSchema: {
            description: (0, nls_1.localize)(36, null),
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    command: {
                        description: (0, nls_1.localize)(37, null),
                        type: 'string'
                    },
                    group: {
                        description: (0, nls_1.localize)(38, null),
                        type: 'string'
                    },
                    qualifiedName: {
                        description: (0, nls_1.localize)(39, null),
                        type: 'string'
                    },
                    description: {
                        description: (0, nls_1.localize)(40, null),
                        type: 'string'
                    },
                    remoteGroup: {
                        description: (0, nls_1.localize)(41, null),
                        type: 'string'
                    },
                    when: {
                        description: (0, nls_1.localize)(42, null),
                        type: 'string'
                    }
                },
                required: ['command']
            }
        }
    });
    //#endregion
    const workbenchRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution($g1b, 3 /* LifecyclePhase.Restored */);
    platform_1.$8m.as(configurationRegistry_1.$an.Configuration).registerConfiguration({
        ...configuration_2.$$y,
        'properties': {
            'workbench.experimental.cloudChanges.autoStore': {
                enum: ['onShutdown', 'off'],
                enumDescriptions: [
                    (0, nls_1.localize)(43, null),
                    (0, nls_1.localize)(44, null)
                ],
                'type': 'string',
                'tags': ['experimental', 'usesOnlineServices'],
                'default': 'off',
                'markdownDescription': (0, nls_1.localize)(45, null),
            },
            'workbench.cloudChanges.autoResume': {
                enum: ['onReload', 'off'],
                enumDescriptions: [
                    (0, nls_1.localize)(46, null),
                    (0, nls_1.localize)(47, null)
                ],
                'type': 'string',
                'tags': ['usesOnlineServices'],
                'default': 'onReload',
                'markdownDescription': (0, nls_1.localize)(48, null),
            },
            'workbench.cloudChanges.continueOn': {
                enum: ['prompt', 'off'],
                enumDescriptions: [
                    (0, nls_1.localize)(49, null),
                    (0, nls_1.localize)(50, null)
                ],
                type: 'string',
                tags: ['usesOnlineServices'],
                default: 'prompt',
                markdownDescription: (0, nls_1.localize)(51, null)
            },
            'workbench.experimental.cloudChanges.partialMatches.enabled': {
                'type': 'boolean',
                'tags': ['experimental', 'usesOnlineServices'],
                'default': false,
                'markdownDescription': (0, nls_1.localize)(52, null)
            }
        }
    });
});
//# sourceMappingURL=editSessions.contribution.js.map