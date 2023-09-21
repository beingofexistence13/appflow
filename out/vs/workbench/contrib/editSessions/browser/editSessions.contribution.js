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
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/actions/common/actions", "vs/nls", "vs/workbench/contrib/editSessions/common/editSessions", "vs/workbench/contrib/scm/common/scm", "vs/platform/files/common/files", "vs/platform/workspace/common/workspace", "vs/base/common/uri", "vs/base/common/resources", "vs/base/common/buffer", "vs/platform/configuration/common/configuration", "vs/platform/progress/common/progress", "vs/workbench/contrib/editSessions/browser/editSessionsStorageService", "vs/platform/instantiation/common/extensions", "vs/platform/userDataSync/common/userDataSync", "vs/platform/telemetry/common/telemetry", "vs/platform/notification/common/notification", "vs/platform/dialogs/common/dialogs", "vs/platform/product/common/productService", "vs/platform/opener/common/opener", "vs/platform/environment/common/environment", "vs/workbench/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/commands/common/commands", "vs/platform/workspace/common/virtualWorkspace", "vs/base/common/network", "vs/platform/contextkey/common/contextkeys", "vs/workbench/services/extensions/common/extensions", "vs/workbench/contrib/editSessions/common/editSessionsLogService", "vs/workbench/common/views", "vs/platform/instantiation/common/descriptors", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/editSessions/browser/editSessionsViews", "vs/workbench/contrib/editSessions/browser/editSessionsFileSystemProvider", "vs/base/common/platform", "vs/workbench/common/contextkeys", "vs/base/common/cancellation", "vs/base/common/objects", "vs/platform/workspace/common/editSessions", "vs/base/common/themables", "vs/workbench/services/output/common/output", "vs/base/browser/hash", "vs/platform/storage/common/storage", "vs/workbench/services/activity/common/activity", "vs/workbench/services/editor/common/editorService", "vs/base/common/codicons", "vs/base/common/errors", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/contrib/editSessions/common/workspaceStateSync", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/request/common/request", "vs/workbench/contrib/editSessions/common/editSessionsStorageClient", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/services/workspaces/common/workspaceIdentityService"], function (require, exports, lifecycle_1, contributions_1, platform_1, lifecycle_2, actions_1, nls_1, editSessions_1, scm_1, files_1, workspace_1, uri_1, resources_1, buffer_1, configuration_1, progress_1, editSessionsStorageService_1, extensions_1, userDataSync_1, telemetry_1, notification_1, dialogs_1, productService_1, opener_1, environment_1, configuration_2, configurationRegistry_1, quickInput_1, extensionsRegistry_1, contextkey_1, commands_1, virtualWorkspace_1, network_1, contextkeys_1, extensions_2, editSessionsLogService_1, views_1, descriptors_1, viewPaneContainer_1, instantiation_1, editSessionsViews_1, editSessionsFileSystemProvider_1, platform_2, contextkeys_2, cancellation_1, objects_1, editSessions_2, themables_1, output_1, hash_1, storage_1, activity_1, editorService_1, codicons_1, errors_1, remoteAgentService_1, extensions_3, panecomposite_1, workspaceStateSync_1, userDataProfile_1, request_1, editSessionsStorageClient_1, uriIdentity_1, workspaceIdentityService_1) {
    "use strict";
    var EditSessionsContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditSessionsContribution = void 0;
    (0, extensions_1.registerSingleton)(editSessions_1.IEditSessionsLogService, editSessionsLogService_1.EditSessionsLogService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(editSessions_1.IEditSessionsStorageService, editSessionsStorageService_1.EditSessionsWorkbenchService, 1 /* InstantiationType.Delayed */);
    const continueWorkingOnCommand = {
        id: '_workbench.editSessions.actions.continueEditSession',
        title: { value: (0, nls_1.localize)('continue working on', "Continue Working On..."), original: 'Continue Working On...' },
        precondition: contextkeys_2.WorkspaceFolderCountContext.notEqualsTo('0'),
        f1: true
    };
    const openLocalFolderCommand = {
        id: '_workbench.editSessions.actions.continueEditSession.openLocalFolder',
        title: { value: (0, nls_1.localize)('continue edit session in local folder', "Open In Local Folder"), original: 'Open In Local Folder' },
        category: editSessions_1.EDIT_SESSION_SYNC_CATEGORY,
        precondition: contextkey_1.ContextKeyExpr.and(contextkeys_1.IsWebContext.toNegated(), contextkeys_2.VirtualWorkspaceContext)
    };
    const showOutputChannelCommand = {
        id: 'workbench.editSessions.actions.showOutputChannel',
        title: { value: (0, nls_1.localize)('show log', 'Show Log'), original: 'Show Log' },
        category: editSessions_1.EDIT_SESSION_SYNC_CATEGORY
    };
    const installAdditionalContinueOnOptionsCommand = {
        id: 'workbench.action.continueOn.extensions',
        title: (0, nls_1.localize)('continueOn.installAdditional', 'Install additional development environment options'),
    };
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({ ...installAdditionalContinueOnOptionsCommand, f1: false });
        }
        async run(accessor) {
            const paneCompositePartService = accessor.get(panecomposite_1.IPaneCompositePartService);
            const viewlet = await paneCompositePartService.openPaneComposite(extensions_3.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true);
            const view = viewlet?.getViewPaneContainer();
            view?.search('@tag:continueOn');
        }
    });
    const resumeProgressOptionsTitle = `[${(0, nls_1.localize)('resuming working changes window', 'Resuming working changes...')}](command:${showOutputChannelCommand.id})`;
    const resumeProgressOptions = {
        location: 10 /* ProgressLocation.Window */,
        type: 'syncing',
    };
    const queryParamName = 'editSessionId';
    const useEditSessionsWithContinueOn = 'workbench.editSessions.continueOn';
    let EditSessionsContribution = class EditSessionsContribution extends lifecycle_1.Disposable {
        static { EditSessionsContribution_1 = this; }
        static { this.APPLICATION_LAUNCHED_VIA_CONTINUE_ON_STORAGE_KEY = 'applicationLaunchedViaContinueOn'; }
        constructor(editSessionsStorageService, fileService, progressService, openerService, telemetryService, scmService, notificationService, dialogService, logService, environmentService, instantiationService, productService, configurationService, contextService, editSessionIdentityService, quickInputService, commandService, contextKeyService, fileDialogService, lifecycleService, storageService, activityService, editorService, remoteAgentService, extensionService, requestService, userDataProfilesService, uriIdentityService, workspaceIdentityService) {
            super();
            this.editSessionsStorageService = editSessionsStorageService;
            this.fileService = fileService;
            this.progressService = progressService;
            this.openerService = openerService;
            this.telemetryService = telemetryService;
            this.scmService = scmService;
            this.notificationService = notificationService;
            this.dialogService = dialogService;
            this.logService = logService;
            this.environmentService = environmentService;
            this.instantiationService = instantiationService;
            this.productService = productService;
            this.configurationService = configurationService;
            this.contextService = contextService;
            this.editSessionIdentityService = editSessionIdentityService;
            this.quickInputService = quickInputService;
            this.commandService = commandService;
            this.contextKeyService = contextKeyService;
            this.fileDialogService = fileDialogService;
            this.lifecycleService = lifecycleService;
            this.storageService = storageService;
            this.activityService = activityService;
            this.editorService = editorService;
            this.remoteAgentService = remoteAgentService;
            this.extensionService = extensionService;
            this.requestService = requestService;
            this.userDataProfilesService = userDataProfilesService;
            this.uriIdentityService = uriIdentityService;
            this.workspaceIdentityService = workspaceIdentityService;
            this.continueEditSessionOptions = [];
            this.accountsMenuBadgeDisposable = this._register(new lifecycle_1.MutableDisposable());
            this.registeredCommands = new Set();
            this.shouldShowViewsContext = editSessions_1.EDIT_SESSIONS_SHOW_VIEW.bindTo(this.contextKeyService);
            this.pendingEditSessionsContext = editSessions_1.EDIT_SESSIONS_PENDING.bindTo(this.contextKeyService);
            this.pendingEditSessionsContext.set(false);
            if (!this.productService['editSessions.store']?.url) {
                return;
            }
            this.editSessionsStorageClient = new editSessionsStorageClient_1.EditSessionsStoreClient(uri_1.URI.parse(this.productService['editSessions.store'].url), this.productService, this.requestService, this.logService, this.environmentService, this.fileService, this.storageService);
            this.editSessionsStorageService.storeClient = this.editSessionsStorageClient;
            this.workspaceStateSynchronizer = new workspaceStateSync_1.WorkspaceStateSynchroniser(this.userDataProfilesService.defaultProfile, undefined, this.editSessionsStorageClient, this.logService, this.fileService, this.environmentService, this.telemetryService, this.configurationService, this.storageService, this.uriIdentityService, this.workspaceIdentityService, this.editSessionsStorageService);
            this.autoResumeEditSession();
            this.registerActions();
            this.registerViews();
            this.registerContributedEditSessionOptions();
            this._register(this.fileService.registerProvider(editSessionsFileSystemProvider_1.EditSessionsFileSystemProvider.SCHEMA, new editSessionsFileSystemProvider_1.EditSessionsFileSystemProvider(this.editSessionsStorageService)));
            this.lifecycleService.onWillShutdown((e) => {
                if (e.reason !== 3 /* ShutdownReason.RELOAD */ && this.editSessionsStorageService.isSignedIn && this.configurationService.getValue('workbench.experimental.cloudChanges.autoStore') === 'onShutdown' && !platform_2.isWeb) {
                    e.join(this.autoStoreEditSession(), { id: 'autoStoreWorkingChanges', label: (0, nls_1.localize)('autoStoreWorkingChanges', 'Storing current working changes...') });
                }
            });
            this._register(this.editSessionsStorageService.onDidSignIn(() => this.updateAccountsMenuBadge()));
            this._register(this.editSessionsStorageService.onDidSignOut(() => this.updateAccountsMenuBadge()));
        }
        async autoResumeEditSession() {
            const shouldAutoResumeOnReload = this.configurationService.getValue('workbench.cloudChanges.autoResume') === 'onReload';
            if (this.environmentService.editSessionId !== undefined) {
                this.logService.info(`Resuming cloud changes, reason: found editSessionId ${this.environmentService.editSessionId} in environment service...`);
                await this.progressService.withProgress(resumeProgressOptions, async (progress) => await this.resumeEditSession(this.environmentService.editSessionId, undefined, undefined, undefined, progress).finally(() => this.environmentService.editSessionId = undefined));
            }
            else if (shouldAutoResumeOnReload && this.editSessionsStorageService.isSignedIn) {
                this.logService.info('Resuming cloud changes, reason: cloud changes enabled...');
                // Attempt to resume edit session based on edit workspace identifier
                // Note: at this point if the user is not signed into edit sessions,
                // we don't want them to be prompted to sign in and should just return early
                await this.progressService.withProgress(resumeProgressOptions, async (progress) => await this.resumeEditSession(undefined, true, undefined, undefined, progress));
            }
            else if (shouldAutoResumeOnReload) {
                // The application has previously launched via a protocol URL Continue On flow
                const hasApplicationLaunchedFromContinueOnFlow = this.storageService.getBoolean(EditSessionsContribution_1.APPLICATION_LAUNCHED_VIA_CONTINUE_ON_STORAGE_KEY, -1 /* StorageScope.APPLICATION */, false);
                this.logService.info(`Prompting to enable cloud changes, has application previously launched from Continue On flow: ${hasApplicationLaunchedFromContinueOnFlow}`);
                const handlePendingEditSessions = () => {
                    // display a badge in the accounts menu but do not prompt the user to sign in again
                    this.logService.info('Showing badge to enable cloud changes in accounts menu...');
                    this.updateAccountsMenuBadge();
                    this.pendingEditSessionsContext.set(true);
                    // attempt a resume if we are in a pending state and the user just signed in
                    const disposable = this.editSessionsStorageService.onDidSignIn(async () => {
                        disposable.dispose();
                        this.logService.info('Showing badge to enable cloud changes in accounts menu succeeded, resuming cloud changes...');
                        await this.progressService.withProgress(resumeProgressOptions, async (progress) => await this.resumeEditSession(undefined, true, undefined, undefined, progress));
                        this.storageService.remove(EditSessionsContribution_1.APPLICATION_LAUNCHED_VIA_CONTINUE_ON_STORAGE_KEY, -1 /* StorageScope.APPLICATION */);
                        this.environmentService.continueOn = undefined;
                    });
                };
                if ((this.environmentService.continueOn !== undefined) &&
                    !this.editSessionsStorageService.isSignedIn &&
                    // and user has not yet been prompted to sign in on this machine
                    hasApplicationLaunchedFromContinueOnFlow === false) {
                    // store the fact that we prompted the user
                    this.storageService.store(EditSessionsContribution_1.APPLICATION_LAUNCHED_VIA_CONTINUE_ON_STORAGE_KEY, true, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                    this.logService.info('Prompting to enable cloud changes...');
                    await this.editSessionsStorageService.initialize('read');
                    if (this.editSessionsStorageService.isSignedIn) {
                        this.logService.info('Prompting to enable cloud changes succeeded, resuming cloud changes...');
                        await this.progressService.withProgress(resumeProgressOptions, async (progress) => await this.resumeEditSession(undefined, true, undefined, undefined, progress));
                    }
                    else {
                        handlePendingEditSessions();
                    }
                }
                else if (!this.editSessionsStorageService.isSignedIn &&
                    // and user has been prompted to sign in on this machine
                    hasApplicationLaunchedFromContinueOnFlow === true) {
                    handlePendingEditSessions();
                }
            }
            else {
                this.logService.debug('Auto resuming cloud changes disabled.');
            }
        }
        updateAccountsMenuBadge() {
            if (this.editSessionsStorageService.isSignedIn) {
                return this.accountsMenuBadgeDisposable.clear();
            }
            const badge = new activity_1.NumberBadge(1, () => (0, nls_1.localize)('check for pending cloud changes', 'Check for pending cloud changes'));
            this.accountsMenuBadgeDisposable.value = this.activityService.showAccountsActivity({ badge });
        }
        async autoStoreEditSession() {
            const cancellationTokenSource = new cancellation_1.CancellationTokenSource();
            await this.progressService.withProgress({
                location: 10 /* ProgressLocation.Window */,
                type: 'syncing',
                title: (0, nls_1.localize)('store working changes', 'Storing working changes...')
            }, async () => this.storeEditSession(false, cancellationTokenSource.token), () => {
                cancellationTokenSource.cancel();
                cancellationTokenSource.dispose();
            });
        }
        registerViews() {
            const container = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
                id: editSessions_1.EDIT_SESSIONS_CONTAINER_ID,
                title: { value: editSessions_1.EDIT_SESSIONS_TITLE, original: editSessions_1.EDIT_SESSIONS_ORIGINAL_TITLE },
                ctorDescriptor: new descriptors_1.SyncDescriptor(viewPaneContainer_1.ViewPaneContainer, [editSessions_1.EDIT_SESSIONS_CONTAINER_ID, { mergeViewWithContainerWhenSingleView: true }]),
                icon: editSessions_1.EDIT_SESSIONS_VIEW_ICON,
                hideIfEmpty: true
            }, 0 /* ViewContainerLocation.Sidebar */, { doNotRegisterOpenCommand: true });
            this._register(this.instantiationService.createInstance(editSessionsViews_1.EditSessionsDataViews, container));
        }
        registerActions() {
            this.registerContinueEditSessionAction();
            this.registerResumeLatestEditSessionAction();
            this.registerStoreLatestEditSessionAction();
            this.registerContinueInLocalFolderAction();
            this.registerShowEditSessionViewAction();
            this.registerShowEditSessionOutputChannelAction();
        }
        registerShowEditSessionOutputChannelAction() {
            this._register((0, actions_1.registerAction2)(class ShowEditSessionOutput extends actions_1.Action2 {
                constructor() {
                    super(showOutputChannelCommand);
                }
                run(accessor, ...args) {
                    const outputChannel = accessor.get(output_1.IOutputService);
                    void outputChannel.showChannel(editSessions_1.editSessionsLogId);
                }
            }));
        }
        registerShowEditSessionViewAction() {
            const that = this;
            this._register((0, actions_1.registerAction2)(class ShowEditSessionView extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.editSessions.actions.showEditSessions',
                        title: { value: (0, nls_1.localize)('show cloud changes', "Show Cloud Changes"), original: 'Show Cloud Changes' },
                        category: editSessions_1.EDIT_SESSION_SYNC_CATEGORY,
                        f1: true
                    });
                }
                async run(accessor) {
                    that.shouldShowViewsContext.set(true);
                    const viewsService = accessor.get(views_1.IViewsService);
                    await viewsService.openView(editSessions_1.EDIT_SESSIONS_DATA_VIEW_ID);
                }
            }));
        }
        registerContinueEditSessionAction() {
            const that = this;
            this._register((0, actions_1.registerAction2)(class ContinueEditSessionAction extends actions_1.Action2 {
                constructor() {
                    super(continueWorkingOnCommand);
                }
                async run(accessor, workspaceUri, destination) {
                    // First ask the user to pick a destination, if necessary
                    let uri = workspaceUri;
                    if (!destination && !uri) {
                        destination = await that.pickContinueEditSessionDestination();
                        if (!destination) {
                            that.telemetryService.publicLog2('continueOn.editSessions.pick.outcome', { outcome: 'noSelection' });
                            return;
                        }
                    }
                    // Determine if we need to store an edit session, asking for edit session auth if necessary
                    const shouldStoreEditSession = await that.shouldContinueOnWithEditSession();
                    // Run the store action to get back a ref
                    let ref;
                    if (shouldStoreEditSession) {
                        that.telemetryService.publicLog2('continueOn.editSessions.store');
                        const cancellationTokenSource = new cancellation_1.CancellationTokenSource();
                        try {
                            ref = await that.progressService.withProgress({
                                location: 15 /* ProgressLocation.Notification */,
                                cancellable: true,
                                type: 'syncing',
                                title: (0, nls_1.localize)('store your working changes', 'Storing your working changes...')
                            }, async () => {
                                const ref = await that.storeEditSession(false, cancellationTokenSource.token);
                                if (ref !== undefined) {
                                    that.telemetryService.publicLog2('continueOn.editSessions.store.outcome', { outcome: 'storeSucceeded', hashedId: (0, editSessions_1.hashedEditSessionId)(ref) });
                                }
                                else {
                                    that.telemetryService.publicLog2('continueOn.editSessions.store.outcome', { outcome: 'storeSkipped' });
                                }
                                return ref;
                            }, () => {
                                cancellationTokenSource.cancel();
                                cancellationTokenSource.dispose();
                                that.telemetryService.publicLog2('continueOn.editSessions.store.outcome', { outcome: 'storeCancelledByUser' });
                            });
                        }
                        catch (ex) {
                            that.telemetryService.publicLog2('continueOn.editSessions.store.outcome', { outcome: 'storeFailed' });
                            throw ex;
                        }
                    }
                    // Append the ref to the URI
                    uri = destination ? await that.resolveDestination(destination) : uri;
                    if (uri === undefined) {
                        return;
                    }
                    if (ref !== undefined && uri !== 'noDestinationUri') {
                        const encodedRef = encodeURIComponent(ref);
                        uri = uri.with({
                            query: uri.query.length > 0 ? (uri.query + `&${queryParamName}=${encodedRef}&continueOn=1`) : `${queryParamName}=${encodedRef}&continueOn=1`
                        });
                        // Open the URI
                        that.logService.info(`Opening ${uri.toString()}`);
                        await that.openerService.open(uri, { openExternal: true });
                    }
                    else if (!shouldStoreEditSession && uri !== 'noDestinationUri') {
                        // Open the URI without an edit session ref
                        that.logService.info(`Opening ${uri.toString()}`);
                        await that.openerService.open(uri, { openExternal: true });
                    }
                    else if (ref === undefined && shouldStoreEditSession) {
                        that.logService.warn(`Failed to store working changes when invoking ${continueWorkingOnCommand.id}.`);
                    }
                }
            }));
        }
        registerResumeLatestEditSessionAction() {
            const that = this;
            this._register((0, actions_1.registerAction2)(class ResumeLatestEditSessionAction extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.editSessions.actions.resumeLatest',
                        title: { value: (0, nls_1.localize)('resume latest cloud changes', "Resume Latest Changes from Cloud"), original: 'Resume Latest Changes from Cloud' },
                        category: editSessions_1.EDIT_SESSION_SYNC_CATEGORY,
                        f1: true,
                    });
                }
                async run(accessor, editSessionId, forceApplyUnrelatedChange) {
                    await that.progressService.withProgress({ ...resumeProgressOptions, title: resumeProgressOptionsTitle }, async () => await that.resumeEditSession(editSessionId, undefined, forceApplyUnrelatedChange));
                }
            }));
            this._register((0, actions_1.registerAction2)(class ResumeLatestEditSessionAction extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.editSessions.actions.resumeFromSerializedPayload',
                        title: { value: (0, nls_1.localize)('resume cloud changes', "Resume Changes from Serialized Data"), original: 'Resume Changes from Serialized Data' },
                        category: 'Developer',
                        f1: true,
                    });
                }
                async run(accessor, editSessionId) {
                    const data = await that.quickInputService.input({ prompt: 'Enter serialized data' });
                    if (data) {
                        that.editSessionsStorageService.lastReadResources.set('editSessions', { content: data, ref: '' });
                    }
                    await that.progressService.withProgress({ ...resumeProgressOptions, title: resumeProgressOptionsTitle }, async () => await that.resumeEditSession(editSessionId, undefined, undefined, undefined, undefined, data));
                }
            }));
        }
        registerStoreLatestEditSessionAction() {
            const that = this;
            this._register((0, actions_1.registerAction2)(class StoreLatestEditSessionAction extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.editSessions.actions.storeCurrent',
                        title: { value: (0, nls_1.localize)('store working changes in cloud', "Store Working Changes in Cloud"), original: 'Store Working Changes in Cloud' },
                        category: editSessions_1.EDIT_SESSION_SYNC_CATEGORY,
                        f1: true,
                    });
                }
                async run(accessor) {
                    const cancellationTokenSource = new cancellation_1.CancellationTokenSource();
                    await that.progressService.withProgress({
                        location: 15 /* ProgressLocation.Notification */,
                        title: (0, nls_1.localize)('storing working changes', 'Storing working changes...')
                    }, async () => {
                        that.telemetryService.publicLog2('editSessions.store');
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
            await this.remoteAgentService.getEnvironment();
            // Edit sessions are not currently supported in empty workspaces
            // https://github.com/microsoft/vscode/issues/159220
            if (this.contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
                return;
            }
            this.logService.info(ref !== undefined ? `Resuming changes from cloud with ref ${ref}...` : 'Checking for pending cloud changes...');
            if (silent && !(await this.editSessionsStorageService.initialize('read', true))) {
                return;
            }
            this.telemetryService.publicLog2('editSessions.resume');
            performance.mark('code/willResumeEditSessionFromIdentifier');
            progress?.report({ message: (0, nls_1.localize)('checkingForWorkingChanges', 'Checking for pending cloud changes...') });
            const data = serializedData ? { content: serializedData, ref: '' } : await this.editSessionsStorageService.read('editSessions', ref);
            if (!data) {
                if (ref === undefined && !silent) {
                    this.notificationService.info((0, nls_1.localize)('no cloud changes', 'There are no changes to resume from the cloud.'));
                }
                else if (ref !== undefined) {
                    this.notificationService.warn((0, nls_1.localize)('no cloud changes for ref', 'Could not resume changes from the cloud for ID {0}.', ref));
                }
                this.logService.info(ref !== undefined ? `Aborting resuming changes from cloud as no edit session content is available to be applied from ref ${ref}.` : `Aborting resuming edit session as no edit session content is available to be applied`);
                return;
            }
            progress?.report({ message: resumeProgressOptionsTitle });
            const editSession = JSON.parse(data.content);
            ref = data.ref;
            if (editSession.version > editSessions_1.EditSessionSchemaVersion) {
                this.notificationService.error((0, nls_1.localize)('client too old', "Please upgrade to a newer version of {0} to resume your working changes from the cloud.", this.productService.nameLong));
                this.telemetryService.publicLog2('editSessions.resume.outcome', { hashedId: (0, editSessions_1.hashedEditSessionId)(ref), outcome: 'clientUpdateNeeded' });
                return;
            }
            try {
                const { changes, conflictingChanges } = await this.generateChanges(editSession, ref, forceApplyUnrelatedChange, applyPartialMatch);
                if (changes.length === 0) {
                    return;
                }
                // TODO@joyceerhl Provide the option to diff files which would be overwritten by edit session contents
                if (conflictingChanges.length > 0) {
                    // Allow to show edit sessions
                    const { confirmed } = await this.dialogService.confirm({
                        type: notification_1.Severity.Warning,
                        message: conflictingChanges.length > 1 ?
                            (0, nls_1.localize)('resume edit session warning many', 'Resuming your working changes from the cloud will overwrite the following {0} files. Do you want to proceed?', conflictingChanges.length) :
                            (0, nls_1.localize)('resume edit session warning 1', 'Resuming your working changes from the cloud will overwrite {0}. Do you want to proceed?', (0, resources_1.basename)(conflictingChanges[0].uri)),
                        detail: conflictingChanges.length > 1 ? (0, dialogs_1.getFileNamesMessage)(conflictingChanges.map((c) => c.uri)) : undefined
                    });
                    if (!confirmed) {
                        return;
                    }
                }
                for (const { uri, type, contents } of changes) {
                    if (type === editSessions_1.ChangeType.Addition) {
                        await this.fileService.writeFile(uri, (0, editSessions_1.decodeEditSessionFileContent)(editSession.version, contents));
                    }
                    else if (type === editSessions_1.ChangeType.Deletion && await this.fileService.exists(uri)) {
                        await this.fileService.del(uri);
                    }
                }
                await this.workspaceStateSynchronizer?.apply(false, {});
                this.logService.info(`Deleting edit session with ref ${ref} after successfully applying it to current workspace...`);
                await this.editSessionsStorageService.delete('editSessions', ref);
                this.logService.info(`Deleted edit session with ref ${ref}.`);
                this.telemetryService.publicLog2('editSessions.resume.outcome', { hashedId: (0, editSessions_1.hashedEditSessionId)(ref), outcome: 'resumeSucceeded' });
            }
            catch (ex) {
                this.logService.error('Failed to resume edit session, reason: ', ex.toString());
                this.notificationService.error((0, nls_1.localize)('resume failed', "Failed to resume your working changes from the cloud."));
            }
            performance.mark('code/didResumeEditSessionFromIdentifier');
        }
        async generateChanges(editSession, ref, forceApplyUnrelatedChange = false, applyPartialMatch = false) {
            const changes = [];
            const conflictingChanges = [];
            const workspaceFolders = this.contextService.getWorkspace().folders;
            const cancellationTokenSource = new cancellation_1.CancellationTokenSource();
            for (const folder of editSession.folders) {
                let folderRoot;
                if (folder.canonicalIdentity) {
                    // Look for an edit session identifier that we can use
                    for (const f of workspaceFolders) {
                        const identity = await this.editSessionIdentityService.getEditSessionIdentifier(f, cancellationTokenSource.token);
                        this.logService.info(`Matching identity ${identity} against edit session folder identity ${folder.canonicalIdentity}...`);
                        if ((0, objects_1.equals)(identity, folder.canonicalIdentity) || forceApplyUnrelatedChange) {
                            folderRoot = f;
                            break;
                        }
                        if (identity !== undefined) {
                            const match = await this.editSessionIdentityService.provideEditSessionIdentityMatch(f, identity, folder.canonicalIdentity, cancellationTokenSource.token);
                            if (match === editSessions_2.EditSessionIdentityMatch.Complete) {
                                folderRoot = f;
                                break;
                            }
                            else if (match === editSessions_2.EditSessionIdentityMatch.Partial &&
                                this.configurationService.getValue('workbench.experimental.cloudChanges.partialMatches.enabled') === true) {
                                if (!applyPartialMatch) {
                                    // Surface partially matching edit session
                                    this.notificationService.prompt(notification_1.Severity.Info, (0, nls_1.localize)('editSessionPartialMatch', 'You have pending working changes in the cloud for this workspace. Would you like to resume them?'), [{ label: (0, nls_1.localize)('resume', 'Resume'), run: () => this.resumeEditSession(ref, false, undefined, true) }]);
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
                    this.logService.info(`Skipping applying ${folder.workingChanges.length} changes from edit session with ref ${ref} as no matching workspace folder was found.`);
                    return { changes: [], conflictingChanges: [], contributedStateHandlers: [] };
                }
                const localChanges = new Set();
                for (const repository of this.scmService.repositories) {
                    if (repository.provider.rootUri !== undefined &&
                        this.contextService.getWorkspaceFolder(repository.provider.rootUri)?.name === folder.name) {
                        const repositoryChanges = this.getChangedResources(repository);
                        repositoryChanges.forEach((change) => localChanges.add(change.toString()));
                    }
                }
                for (const change of folder.workingChanges) {
                    const uri = (0, resources_1.joinPath)(folderRoot.uri, change.relativeFilePath);
                    changes.push({ uri, type: change.type, contents: change.contents });
                    if (await this.willChangeLocalContents(localChanges, uri, change)) {
                        conflictingChanges.push({ uri, type: change.type, contents: change.contents });
                    }
                }
            }
            return { changes, conflictingChanges };
        }
        async willChangeLocalContents(localChanges, uriWithIncomingChanges, incomingChange) {
            if (!localChanges.has(uriWithIncomingChanges.toString())) {
                return false;
            }
            const { contents, type } = incomingChange;
            switch (type) {
                case (editSessions_1.ChangeType.Addition): {
                    const [originalContents, incomingContents] = await Promise.all([(0, hash_1.sha1Hex)(contents), (0, hash_1.sha1Hex)((0, buffer_1.encodeBase64)((await this.fileService.readFile(uriWithIncomingChanges)).value))]);
                    return originalContents !== incomingContents;
                }
                case (editSessions_1.ChangeType.Deletion): {
                    return await this.fileService.exists(uriWithIncomingChanges);
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
            await this.editorService.saveAll();
            for (const repository of this.scmService.repositories) {
                // Look through all resource groups and compute which files were added/modified/deleted
                const trackedUris = this.getChangedResources(repository); // A URI might appear in more than one resource group
                const workingChanges = [];
                const { rootUri } = repository.provider;
                const workspaceFolder = rootUri ? this.contextService.getWorkspaceFolder(rootUri) : undefined;
                let name = workspaceFolder?.name;
                for (const uri of trackedUris) {
                    const workspaceFolder = this.contextService.getWorkspaceFolder(uri);
                    if (!workspaceFolder) {
                        this.logService.info(`Skipping working change ${uri.toString()} as no associated workspace folder was found.`);
                        continue;
                    }
                    await this.editSessionIdentityService.onWillCreateEditSessionIdentity(workspaceFolder, cancellationToken);
                    name = name ?? workspaceFolder.name;
                    const relativeFilePath = (0, resources_1.relativePath)(workspaceFolder.uri, uri) ?? uri.path;
                    // Only deal with file contents for now
                    try {
                        if (!(await this.fileService.stat(uri)).isFile) {
                            continue;
                        }
                    }
                    catch { }
                    hasEdits = true;
                    if (await this.fileService.exists(uri)) {
                        const contents = (0, buffer_1.encodeBase64)((await this.fileService.readFile(uri)).value);
                        editSessionSize += contents.length;
                        if (editSessionSize > this.editSessionsStorageService.SIZE_LIMIT) {
                            this.notificationService.error((0, nls_1.localize)('payload too large', 'Your working changes exceed the size limit and cannot be stored.'));
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
                    canonicalIdentity = await this.editSessionIdentityService.getEditSessionIdentifier(workspaceFolder, cancellationToken);
                }
                // TODO@joyceerhl debt: don't store working changes as a child of the folder
                folders.push({ workingChanges, name: name ?? '', canonicalIdentity: canonicalIdentity ?? undefined, absoluteUri: workspaceFolder?.uri.toString() });
            }
            // Store contributed workspace state
            await this.workspaceStateSynchronizer?.sync(null, {});
            if (!hasEdits) {
                this.logService.info('Skipped storing working changes in the cloud as there are no edits to store.');
                if (fromStoreCommand) {
                    this.notificationService.info((0, nls_1.localize)('no working changes to store', 'Skipped storing working changes in the cloud as there are no edits to store.'));
                }
                return undefined;
            }
            const data = { folders, version: 2, workspaceStateId: this.editSessionsStorageService.lastWrittenResources.get('workspaceState')?.ref };
            try {
                this.logService.info(`Storing edit session...`);
                const ref = await this.editSessionsStorageService.write('editSessions', data);
                this.logService.info(`Stored edit session with ref ${ref}.`);
                return ref;
            }
            catch (ex) {
                this.logService.error(`Failed to store edit session, reason: `, ex.toString());
                if (ex instanceof userDataSync_1.UserDataSyncStoreError) {
                    switch (ex.code) {
                        case "TooLarge" /* UserDataSyncErrorCode.TooLarge */:
                            // Uploading a payload can fail due to server size limits
                            this.telemetryService.publicLog2('editSessions.upload.failed', { reason: 'TooLarge' });
                            this.notificationService.error((0, nls_1.localize)('payload too large', 'Your working changes exceed the size limit and cannot be stored.'));
                            break;
                        default:
                            this.telemetryService.publicLog2('editSessions.upload.failed', { reason: 'unknown' });
                            this.notificationService.error((0, nls_1.localize)('payload failed', 'Your working changes cannot be stored.'));
                            break;
                    }
                }
            }
            return undefined;
        }
        getChangedResources(repository) {
            return repository.provider.groups.elements.reduce((resources, resourceGroups) => {
                resourceGroups.elements.forEach((resource) => resources.add(resource.sourceUri));
                return resources;
            }, new Set()); // A URI might appear in more than one resource group
        }
        hasEditSession() {
            for (const repository of this.scmService.repositories) {
                if (this.getChangedResources(repository).size > 0) {
                    return true;
                }
            }
            return false;
        }
        async shouldContinueOnWithEditSession() {
            // If the user is already signed in, we should store edit session
            if (this.editSessionsStorageService.isSignedIn) {
                return this.hasEditSession();
            }
            // If the user has been asked before and said no, don't use edit sessions
            if (this.configurationService.getValue(useEditSessionsWithContinueOn) === 'off') {
                this.telemetryService.publicLog2('continueOn.editSessions.canStore.outcome', { outcome: 'disabledEditSessionsViaSetting' });
                return false;
            }
            // Prompt the user to use edit sessions if they currently could benefit from using it
            if (this.hasEditSession()) {
                const quickpick = this.quickInputService.createQuickPick();
                quickpick.placeholder = (0, nls_1.localize)('continue with cloud changes', "Select whether to bring your working changes with you");
                quickpick.ok = false;
                quickpick.ignoreFocusOut = true;
                const withCloudChanges = { label: (0, nls_1.localize)('with cloud changes', "Yes, continue with my working changes") };
                const withoutCloudChanges = { label: (0, nls_1.localize)('without cloud changes', "No, continue without my working changes") };
                quickpick.items = [withCloudChanges, withoutCloudChanges];
                const continueWithCloudChanges = await new Promise((resolve, reject) => {
                    quickpick.onDidAccept(() => {
                        resolve(quickpick.selectedItems[0] === withCloudChanges);
                        quickpick.hide();
                    });
                    quickpick.onDidHide(() => {
                        reject(new errors_1.CancellationError());
                        quickpick.hide();
                    });
                    quickpick.show();
                });
                if (!continueWithCloudChanges) {
                    this.telemetryService.publicLog2('continueOn.editSessions.canStore.outcome', { outcome: 'didNotEnableEditSessionsWhenPrompted' });
                    return continueWithCloudChanges;
                }
                const initialized = await this.editSessionsStorageService.initialize('write');
                if (!initialized) {
                    this.telemetryService.publicLog2('continueOn.editSessions.canStore.outcome', { outcome: 'didNotEnableEditSessionsWhenPrompted' });
                }
                return initialized;
            }
            return false;
        }
        //#region Continue Edit Session extension contribution point
        registerContributedEditSessionOptions() {
            continueEditSessionExtPoint.setHandler(extensions => {
                const continueEditSessionOptions = [];
                for (const extension of extensions) {
                    if (!(0, extensions_2.isProposedApiEnabled)(extension.description, 'contribEditSessions')) {
                        continue;
                    }
                    if (!Array.isArray(extension.value)) {
                        continue;
                    }
                    for (const contribution of extension.value) {
                        const command = actions_1.MenuRegistry.getCommand(contribution.command);
                        if (!command) {
                            return;
                        }
                        const icon = command.icon;
                        const title = typeof command.title === 'string' ? command.title : command.title.value;
                        const when = contextkey_1.ContextKeyExpr.deserialize(contribution.when);
                        continueEditSessionOptions.push(new ContinueEditSessionItem(themables_1.ThemeIcon.isThemeIcon(icon) ? `$(${icon.id}) ${title}` : title, command.id, command.source?.title, when, contribution.documentation));
                        if (contribution.qualifiedName) {
                            this.generateStandaloneOptionCommand(command.id, contribution.qualifiedName, contribution.category ?? command.category, when, contribution.remoteGroup);
                        }
                    }
                }
                this.continueEditSessionOptions = continueEditSessionOptions;
            });
        }
        generateStandaloneOptionCommand(commandId, qualifiedName, category, when, remoteGroup) {
            const command = {
                id: `${continueWorkingOnCommand.id}.${commandId}`,
                title: { original: qualifiedName, value: qualifiedName },
                category: typeof category === 'string' ? { original: category, value: category } : category,
                precondition: when,
                f1: true
            };
            if (!this.registeredCommands.has(command.id)) {
                this.registeredCommands.add(command.id);
                (0, actions_1.registerAction2)(class StandaloneContinueOnOption extends actions_1.Action2 {
                    constructor() {
                        super(command);
                    }
                    async run(accessor) {
                        return accessor.get(commands_1.ICommandService).executeCommand(continueWorkingOnCommand.id, undefined, commandId);
                    }
                });
                if (remoteGroup !== undefined) {
                    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.StatusBarRemoteIndicatorMenu, {
                        group: remoteGroup,
                        command: command,
                        when: command.precondition
                    });
                }
            }
        }
        registerContinueInLocalFolderAction() {
            const that = this;
            this._register((0, actions_1.registerAction2)(class ContinueInLocalFolderAction extends actions_1.Action2 {
                constructor() {
                    super(openLocalFolderCommand);
                }
                async run(accessor) {
                    const selection = await that.fileDialogService.showOpenDialog({
                        title: (0, nls_1.localize)('continueEditSession.openLocalFolder.title.v2', 'Select a local folder to continue working in'),
                        canSelectFolders: true,
                        canSelectMany: false,
                        canSelectFiles: false,
                        availableFileSystems: [network_1.Schemas.file]
                    });
                    return selection?.length !== 1 ? undefined : uri_1.URI.from({
                        scheme: that.productService.urlProtocol,
                        authority: network_1.Schemas.file,
                        path: selection[0].path
                    });
                }
            }));
            if ((0, virtualWorkspace_1.getVirtualWorkspaceLocation)(this.contextService.getWorkspace()) !== undefined && platform_2.isNative) {
                this.generateStandaloneOptionCommand(openLocalFolderCommand.id, (0, nls_1.localize)('continueWorkingOn.existingLocalFolder', 'Continue Working in Existing Local Folder'), undefined, openLocalFolderCommand.precondition, undefined);
            }
        }
        async pickContinueEditSessionDestination() {
            const quickPick = this.quickInputService.createQuickPick();
            const workspaceContext = this.contextService.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */
                ? this.contextService.getWorkspace().folders[0].name
                : this.contextService.getWorkspace().folders.map((folder) => folder.name).join(', ');
            quickPick.placeholder = (0, nls_1.localize)('continueEditSessionPick.title.v2', "Select a development environment to continue working on {0} in", `'${workspaceContext}'`);
            quickPick.items = this.createPickItems();
            this.extensionService.onDidChangeExtensions(() => {
                quickPick.items = this.createPickItems();
            });
            const command = await new Promise((resolve, reject) => {
                quickPick.onDidHide(() => resolve(undefined));
                quickPick.onDidAccept((e) => {
                    const selection = quickPick.activeItems[0].command;
                    if (selection === installAdditionalContinueOnOptionsCommand.id) {
                        void this.commandService.executeCommand(installAdditionalContinueOnOptionsCommand.id);
                    }
                    else {
                        resolve(selection);
                        quickPick.hide();
                    }
                });
                quickPick.show();
                quickPick.onDidTriggerItemButton(async (e) => {
                    if (e.item.documentation !== undefined) {
                        const uri = uri_1.URI.isUri(e.item.documentation) ? uri_1.URI.parse(e.item.documentation) : await this.commandService.executeCommand(e.item.documentation);
                        void this.openerService.open(uri, { openExternal: true });
                    }
                });
            });
            quickPick.dispose();
            return command;
        }
        async resolveDestination(command) {
            try {
                const uri = await this.commandService.executeCommand(command);
                // Some continue on commands do not return a URI
                // to support extensions which want to be in control
                // of how the destination is opened
                if (uri === undefined) {
                    this.telemetryService.publicLog2('continueOn.openDestination.outcome', { selection: command, outcome: 'noDestinationUri' });
                    return 'noDestinationUri';
                }
                if (uri_1.URI.isUri(uri)) {
                    this.telemetryService.publicLog2('continueOn.openDestination.outcome', { selection: command, outcome: 'resolvedUri' });
                    return uri;
                }
                this.telemetryService.publicLog2('continueOn.openDestination.outcome', { selection: command, outcome: 'invalidDestination' });
                return undefined;
            }
            catch (ex) {
                if (ex instanceof errors_1.CancellationError) {
                    this.telemetryService.publicLog2('continueOn.openDestination.outcome', { selection: command, outcome: 'cancelled' });
                }
                else {
                    this.telemetryService.publicLog2('continueOn.openDestination.outcome', { selection: command, outcome: 'unknownError' });
                }
                return undefined;
            }
        }
        createPickItems() {
            const items = [...this.continueEditSessionOptions].filter((option) => option.when === undefined || this.contextKeyService.contextMatchesRules(option.when));
            if ((0, virtualWorkspace_1.getVirtualWorkspaceLocation)(this.contextService.getWorkspace()) !== undefined && platform_2.isNative) {
                items.push(new ContinueEditSessionItem('$(folder) ' + (0, nls_1.localize)('continueEditSessionItem.openInLocalFolder.v2', 'Open in Local Folder'), openLocalFolderCommand.id, (0, nls_1.localize)('continueEditSessionItem.builtin', 'Built-in')));
            }
            const sortedItems = items.sort((item1, item2) => item1.label.localeCompare(item2.label));
            return sortedItems.concat({ type: 'separator' }, new ContinueEditSessionItem(installAdditionalContinueOnOptionsCommand.title, installAdditionalContinueOnOptionsCommand.id));
        }
    };
    exports.EditSessionsContribution = EditSessionsContribution;
    exports.EditSessionsContribution = EditSessionsContribution = EditSessionsContribution_1 = __decorate([
        __param(0, editSessions_1.IEditSessionsStorageService),
        __param(1, files_1.IFileService),
        __param(2, progress_1.IProgressService),
        __param(3, opener_1.IOpenerService),
        __param(4, telemetry_1.ITelemetryService),
        __param(5, scm_1.ISCMService),
        __param(6, notification_1.INotificationService),
        __param(7, dialogs_1.IDialogService),
        __param(8, editSessions_1.IEditSessionsLogService),
        __param(9, environment_1.IEnvironmentService),
        __param(10, instantiation_1.IInstantiationService),
        __param(11, productService_1.IProductService),
        __param(12, configuration_1.IConfigurationService),
        __param(13, workspace_1.IWorkspaceContextService),
        __param(14, editSessions_2.IEditSessionIdentityService),
        __param(15, quickInput_1.IQuickInputService),
        __param(16, commands_1.ICommandService),
        __param(17, contextkey_1.IContextKeyService),
        __param(18, dialogs_1.IFileDialogService),
        __param(19, lifecycle_2.ILifecycleService),
        __param(20, storage_1.IStorageService),
        __param(21, activity_1.IActivityService),
        __param(22, editorService_1.IEditorService),
        __param(23, remoteAgentService_1.IRemoteAgentService),
        __param(24, extensions_2.IExtensionService),
        __param(25, request_1.IRequestService),
        __param(26, userDataProfile_1.IUserDataProfilesService),
        __param(27, uriIdentity_1.IUriIdentityService),
        __param(28, workspaceIdentityService_1.IWorkspaceIdentityService)
    ], EditSessionsContribution);
    const infoButtonClass = themables_1.ThemeIcon.asClassName(codicons_1.Codicon.info);
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
                        tooltip: (0, nls_1.localize)('learnMoreTooltip', 'Learn More'),
                    }];
            }
        }
    }
    const continueEditSessionExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'continueEditSession',
        jsonSchema: {
            description: (0, nls_1.localize)('continueEditSessionExtPoint', 'Contributes options for continuing the current edit session in a different environment'),
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    command: {
                        description: (0, nls_1.localize)('continueEditSessionExtPoint.command', 'Identifier of the command to execute. The command must be declared in the \'commands\'-section and return a URI representing a different environment where the current edit session can be continued.'),
                        type: 'string'
                    },
                    group: {
                        description: (0, nls_1.localize)('continueEditSessionExtPoint.group', 'Group into which this item belongs.'),
                        type: 'string'
                    },
                    qualifiedName: {
                        description: (0, nls_1.localize)('continueEditSessionExtPoint.qualifiedName', 'A fully qualified name for this item which is used for display in menus.'),
                        type: 'string'
                    },
                    description: {
                        description: (0, nls_1.localize)('continueEditSessionExtPoint.description', "The url, or a command that returns the url, to the option's documentation page."),
                        type: 'string'
                    },
                    remoteGroup: {
                        description: (0, nls_1.localize)('continueEditSessionExtPoint.remoteGroup', 'Group into which this item belongs in the remote indicator.'),
                        type: 'string'
                    },
                    when: {
                        description: (0, nls_1.localize)('continueEditSessionExtPoint.when', 'Condition which must be true to show this item.'),
                        type: 'string'
                    }
                },
                required: ['command']
            }
        }
    });
    //#endregion
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(EditSessionsContribution, 3 /* LifecyclePhase.Restored */);
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        ...configuration_2.workbenchConfigurationNodeBase,
        'properties': {
            'workbench.experimental.cloudChanges.autoStore': {
                enum: ['onShutdown', 'off'],
                enumDescriptions: [
                    (0, nls_1.localize)('autoStoreWorkingChanges.onShutdown', "Automatically store current working changes in the cloud on window close."),
                    (0, nls_1.localize)('autoStoreWorkingChanges.off', "Never attempt to automatically store working changes in the cloud.")
                ],
                'type': 'string',
                'tags': ['experimental', 'usesOnlineServices'],
                'default': 'off',
                'markdownDescription': (0, nls_1.localize)('autoStoreWorkingChangesDescription', "Controls whether to automatically store available working changes in the cloud for the current workspace. This setting has no effect in the web."),
            },
            'workbench.cloudChanges.autoResume': {
                enum: ['onReload', 'off'],
                enumDescriptions: [
                    (0, nls_1.localize)('autoResumeWorkingChanges.onReload', "Automatically resume available working changes from the cloud on window reload."),
                    (0, nls_1.localize)('autoResumeWorkingChanges.off', "Never attempt to resume working changes from the cloud.")
                ],
                'type': 'string',
                'tags': ['usesOnlineServices'],
                'default': 'onReload',
                'markdownDescription': (0, nls_1.localize)('autoResumeWorkingChanges', "Controls whether to automatically resume available working changes stored in the cloud for the current workspace."),
            },
            'workbench.cloudChanges.continueOn': {
                enum: ['prompt', 'off'],
                enumDescriptions: [
                    (0, nls_1.localize)('continueOnCloudChanges.promptForAuth', 'Prompt the user to sign in to store working changes in the cloud with Continue Working On.'),
                    (0, nls_1.localize)('continueOnCloudChanges.off', 'Do not store working changes in the cloud with Continue Working On unless the user has already turned on Cloud Changes.')
                ],
                type: 'string',
                tags: ['usesOnlineServices'],
                default: 'prompt',
                markdownDescription: (0, nls_1.localize)('continueOnCloudChanges', 'Controls whether to prompt the user to store working changes in the cloud when using Continue Working On.')
            },
            'workbench.experimental.cloudChanges.partialMatches.enabled': {
                'type': 'boolean',
                'tags': ['experimental', 'usesOnlineServices'],
                'default': false,
                'markdownDescription': (0, nls_1.localize)('cloudChangesPartialMatchesEnabled', "Controls whether to surface cloud changes which partially match the current session.")
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdFNlc3Npb25zLmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2VkaXRTZXNzaW9ucy9icm93c2VyL2VkaXRTZXNzaW9ucy5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQW9FaEcsSUFBQSw4QkFBaUIsRUFBQyxzQ0FBdUIsRUFBRSwrQ0FBc0Isb0NBQTRCLENBQUM7SUFDOUYsSUFBQSw4QkFBaUIsRUFBQywwQ0FBMkIsRUFBRSx5REFBNEIsb0NBQTRCLENBQUM7SUFHeEcsTUFBTSx3QkFBd0IsR0FBb0I7UUFDakQsRUFBRSxFQUFFLHFEQUFxRDtRQUN6RCxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMscUJBQXFCLEVBQUUsd0JBQXdCLENBQUMsRUFBRSxRQUFRLEVBQUUsd0JBQXdCLEVBQUU7UUFDL0csWUFBWSxFQUFFLHlDQUEyQixDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUM7UUFDMUQsRUFBRSxFQUFFLElBQUk7S0FDUixDQUFDO0lBQ0YsTUFBTSxzQkFBc0IsR0FBb0I7UUFDL0MsRUFBRSxFQUFFLHFFQUFxRTtRQUN6RSxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsdUNBQXVDLEVBQUUsc0JBQXNCLENBQUMsRUFBRSxRQUFRLEVBQUUsc0JBQXNCLEVBQUU7UUFDN0gsUUFBUSxFQUFFLHlDQUEwQjtRQUNwQyxZQUFZLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQUMsMEJBQVksQ0FBQyxTQUFTLEVBQUUsRUFBRSxxQ0FBdUIsQ0FBQztLQUNuRixDQUFDO0lBQ0YsTUFBTSx3QkFBd0IsR0FBb0I7UUFDakQsRUFBRSxFQUFFLGtEQUFrRDtRQUN0RCxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBQSxj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