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
define(["require", "exports", "vs/platform/instantiation/common/descriptors", "vs/base/common/lifecycle", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configurationRegistry", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/registry/common/platform", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/common/contributions", "vs/base/common/codicons", "vs/workbench/services/editor/common/editorService", "vs/platform/contextkey/common/contextkey", "vs/platform/commands/common/commands", "vs/workbench/services/statusbar/browser/statusbar", "vs/workbench/browser/editor", "vs/workbench/contrib/workspace/browser/workspaceTrustEditor", "vs/workbench/services/workspaces/browser/workspaceTrustEditorInput", "vs/workbench/services/workspaces/common/workspaceTrust", "vs/workbench/common/editor", "vs/platform/telemetry/common/telemetry", "vs/platform/workspace/common/workspace", "vs/base/common/path", "vs/platform/configuration/common/configuration", "vs/base/common/htmlContent", "vs/platform/storage/common/storage", "vs/workbench/services/host/browser/host", "vs/workbench/services/banner/browser/bannerService", "vs/platform/workspace/common/virtualWorkspace", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/services/environment/common/environmentService", "vs/workbench/contrib/preferences/common/preferences", "vs/workbench/services/preferences/common/preferences", "vs/platform/label/common/label", "vs/platform/product/common/productService", "vs/workbench/contrib/workspace/common/workspace", "vs/base/common/platform", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/common/configuration", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/css!./media/workspaceTrustEditor"], function (require, exports, descriptors_1, lifecycle_1, nls_1, actions_1, configurationRegistry_1, dialogs_1, instantiation_1, notification_1, platform_1, workspaceTrust_1, contributions_1, codicons_1, editorService_1, contextkey_1, commands_1, statusbar_1, editor_1, workspaceTrustEditor_1, workspaceTrustEditorInput_1, workspaceTrust_2, editor_2, telemetry_1, workspace_1, path_1, configuration_1, htmlContent_1, storage_1, host_1, bannerService_1, virtualWorkspace_1, extensions_1, environmentService_1, preferences_1, preferences_2, label_1, productService_1, workspace_2, platform_2, remoteAgentService_1, configuration_2, resources_1, uri_1, environment_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkspaceTrustUXHandler = exports.WorkspaceTrustRequestHandler = exports.WorkspaceTrustContextKeys = void 0;
    const BANNER_RESTRICTED_MODE = 'workbench.banner.restrictedMode';
    const STARTUP_PROMPT_SHOWN_KEY = 'workspace.trust.startupPrompt.shown';
    const BANNER_RESTRICTED_MODE_DISMISSED_KEY = 'workbench.banner.restrictedMode.dismissed';
    let WorkspaceTrustContextKeys = class WorkspaceTrustContextKeys extends lifecycle_1.Disposable {
        constructor(contextKeyService, workspaceTrustEnablementService, workspaceTrustManagementService) {
            super();
            this._ctxWorkspaceTrustEnabled = workspace_2.WorkspaceTrustContext.IsEnabled.bindTo(contextKeyService);
            this._ctxWorkspaceTrustEnabled.set(workspaceTrustEnablementService.isWorkspaceTrustEnabled());
            this._ctxWorkspaceTrustState = workspace_2.WorkspaceTrustContext.IsTrusted.bindTo(contextKeyService);
            this._ctxWorkspaceTrustState.set(workspaceTrustManagementService.isWorkspaceTrusted());
            this._register(workspaceTrustManagementService.onDidChangeTrust(trusted => this._ctxWorkspaceTrustState.set(trusted)));
        }
    };
    exports.WorkspaceTrustContextKeys = WorkspaceTrustContextKeys;
    exports.WorkspaceTrustContextKeys = WorkspaceTrustContextKeys = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, workspaceTrust_1.IWorkspaceTrustEnablementService),
        __param(2, workspaceTrust_1.IWorkspaceTrustManagementService)
    ], WorkspaceTrustContextKeys);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(WorkspaceTrustContextKeys, 3 /* LifecyclePhase.Restored */);
    /*
     * Trust Request via Service UX handler
     */
    let WorkspaceTrustRequestHandler = class WorkspaceTrustRequestHandler extends lifecycle_1.Disposable {
        constructor(dialogService, commandService, workspaceContextService, workspaceTrustManagementService, workspaceTrustRequestService) {
            super();
            this.dialogService = dialogService;
            this.commandService = commandService;
            this.workspaceContextService = workspaceContextService;
            this.workspaceTrustManagementService = workspaceTrustManagementService;
            this.workspaceTrustRequestService = workspaceTrustRequestService;
            this.registerListeners();
        }
        get useWorkspaceLanguage() {
            return !(0, workspace_1.isSingleFolderWorkspaceIdentifier)((0, workspace_1.toWorkspaceIdentifier)(this.workspaceContextService.getWorkspace()));
        }
        async registerListeners() {
            await this.workspaceTrustManagementService.workspaceResolved;
            // Open files trust request
            this._register(this.workspaceTrustRequestService.onDidInitiateOpenFilesTrustRequest(async () => {
                // Details
                const markdownDetails = [
                    this.workspaceContextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */ ?
                        (0, nls_1.localize)('openLooseFileWorkspaceDetails', "You are trying to open untrusted files in a workspace which is trusted.") :
                        (0, nls_1.localize)('openLooseFileWindowDetails', "You are trying to open untrusted files in a window which is trusted."),
                    (0, nls_1.localize)('openLooseFileLearnMore', "If you don't want to open untrusted files, we recommend to open them in Restricted Mode in a new window as the files may be malicious. See [our docs](https://aka.ms/vscode-workspace-trust) to learn more.")
                ];
                // Dialog
                await this.dialogService.prompt({
                    type: notification_1.Severity.Info,
                    message: this.workspaceContextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */ ?
                        (0, nls_1.localize)('openLooseFileWorkspaceMesssage', "Do you want to allow untrusted files in this workspace?") :
                        (0, nls_1.localize)('openLooseFileWindowMesssage', "Do you want to allow untrusted files in this window?"),
                    buttons: [
                        {
                            label: (0, nls_1.localize)({ key: 'open', comment: ['&& denotes a mnemonic'] }, "&&Open"),
                            run: ({ checkboxChecked }) => this.workspaceTrustRequestService.completeOpenFilesTrustRequest(1 /* WorkspaceTrustUriResponse.Open */, !!checkboxChecked)
                        },
                        {
                            label: (0, nls_1.localize)({ key: 'newWindow', comment: ['&& denotes a mnemonic'] }, "Open in &&Restricted Mode"),
                            run: ({ checkboxChecked }) => this.workspaceTrustRequestService.completeOpenFilesTrustRequest(2 /* WorkspaceTrustUriResponse.OpenInNewWindow */, !!checkboxChecked)
                        }
                    ],
                    cancelButton: {
                        run: () => this.workspaceTrustRequestService.completeOpenFilesTrustRequest(3 /* WorkspaceTrustUriResponse.Cancel */)
                    },
                    checkbox: {
                        label: (0, nls_1.localize)('openLooseFileWorkspaceCheckbox', "Remember my decision for all workspaces"),
                        checked: false
                    },
                    custom: {
                        icon: codicons_1.Codicon.shield,
                        markdownDetails: markdownDetails.map(md => { return { markdown: new htmlContent_1.MarkdownString(md) }; })
                    }
                });
            }));
            // Workspace trust request
            this._register(this.workspaceTrustRequestService.onDidInitiateWorkspaceTrustRequest(async (requestOptions) => {
                // Title
                const message = this.useWorkspaceLanguage ?
                    (0, nls_1.localize)('workspaceTrust', "Do you trust the authors of the files in this workspace?") :
                    (0, nls_1.localize)('folderTrust', "Do you trust the authors of the files in this folder?");
                // Message
                const defaultDetails = (0, nls_1.localize)('immediateTrustRequestMessage', "A feature you are trying to use may be a security risk if you do not trust the source of the files or folders you currently have open.");
                const details = requestOptions?.message ?? defaultDetails;
                // Buttons
                const buttons = requestOptions?.buttons ?? [
                    { label: this.useWorkspaceLanguage ? (0, nls_1.localize)({ key: 'grantWorkspaceTrustButton', comment: ['&& denotes a mnemonic'] }, "&&Trust Workspace & Continue") : (0, nls_1.localize)({ key: 'grantFolderTrustButton', comment: ['&& denotes a mnemonic'] }, "&&Trust Folder & Continue"), type: 'ContinueWithTrust' },
                    { label: (0, nls_1.localize)({ key: 'manageWorkspaceTrustButton', comment: ['&& denotes a mnemonic'] }, "&&Manage"), type: 'Manage' }
                ];
                // Add Cancel button if not provided
                if (!buttons.some(b => b.type === 'Cancel')) {
                    buttons.push({ label: (0, nls_1.localize)('cancelWorkspaceTrustButton', "Cancel"), type: 'Cancel' });
                }
                // Dialog
                const { result } = await this.dialogService.prompt({
                    type: notification_1.Severity.Info,
                    message,
                    custom: {
                        icon: codicons_1.Codicon.shield,
                        markdownDetails: [
                            { markdown: new htmlContent_1.MarkdownString(details) },
                            { markdown: new htmlContent_1.MarkdownString((0, nls_1.localize)('immediateTrustRequestLearnMore', "If you don't trust the authors of these files, we do not recommend continuing as the files may be malicious. See [our docs](https://aka.ms/vscode-workspace-trust) to learn more.")) }
                        ]
                    },
                    buttons: buttons.filter(b => b.type !== 'Cancel').map(button => {
                        return {
                            label: button.label,
                            run: () => button.type
                        };
                    }),
                    cancelButton: (() => {
                        const cancelButton = buttons.find(b => b.type === 'Cancel');
                        if (!cancelButton) {
                            return undefined;
                        }
                        return {
                            label: cancelButton.label,
                            run: () => cancelButton.type
                        };
                    })()
                });
                // Dialog result
                switch (result) {
                    case 'ContinueWithTrust':
                        await this.workspaceTrustRequestService.completeWorkspaceTrustRequest(true);
                        break;
                    case 'ContinueWithoutTrust':
                        await this.workspaceTrustRequestService.completeWorkspaceTrustRequest(undefined);
                        break;
                    case 'Manage':
                        this.workspaceTrustRequestService.cancelWorkspaceTrustRequest();
                        await this.commandService.executeCommand(workspace_2.MANAGE_TRUST_COMMAND_ID);
                        break;
                    case 'Cancel':
                        this.workspaceTrustRequestService.cancelWorkspaceTrustRequest();
                        break;
                }
            }));
        }
    };
    exports.WorkspaceTrustRequestHandler = WorkspaceTrustRequestHandler;
    exports.WorkspaceTrustRequestHandler = WorkspaceTrustRequestHandler = __decorate([
        __param(0, dialogs_1.IDialogService),
        __param(1, commands_1.ICommandService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(4, workspaceTrust_1.IWorkspaceTrustRequestService)
    ], WorkspaceTrustRequestHandler);
    /*
     * Trust UX and Startup Handler
     */
    let WorkspaceTrustUXHandler = class WorkspaceTrustUXHandler extends lifecycle_1.Disposable {
        constructor(dialogService, workspaceContextService, workspaceTrustEnablementService, workspaceTrustManagementService, configurationService, statusbarService, storageService, workspaceTrustRequestService, bannerService, labelService, hostService, productService, remoteAgentService, environmentService, fileService) {
            super();
            this.dialogService = dialogService;
            this.workspaceContextService = workspaceContextService;
            this.workspaceTrustEnablementService = workspaceTrustEnablementService;
            this.workspaceTrustManagementService = workspaceTrustManagementService;
            this.configurationService = configurationService;
            this.statusbarService = statusbarService;
            this.storageService = storageService;
            this.workspaceTrustRequestService = workspaceTrustRequestService;
            this.bannerService = bannerService;
            this.labelService = labelService;
            this.hostService = hostService;
            this.productService = productService;
            this.remoteAgentService = remoteAgentService;
            this.environmentService = environmentService;
            this.fileService = fileService;
            this.entryId = `status.workspaceTrust.${this.workspaceContextService.getWorkspace().id}`;
            this.statusbarEntryAccessor = this._register(new lifecycle_1.MutableDisposable());
            (async () => {
                await this.workspaceTrustManagementService.workspaceTrustInitialized;
                if (this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
                    this.registerListeners();
                    this.createStatusbarEntry();
                    // Show modal dialog
                    if (this.hostService.hasFocus) {
                        this.showModalOnStart();
                    }
                    else {
                        const focusDisposable = this.hostService.onDidChangeFocus(focused => {
                            if (focused) {
                                focusDisposable.dispose();
                                this.showModalOnStart();
                            }
                        });
                    }
                }
            })();
        }
        registerListeners() {
            this._register(this.workspaceContextService.onWillChangeWorkspaceFolders(e => {
                if (e.fromCache) {
                    return;
                }
                if (!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
                    return;
                }
                const addWorkspaceFolder = async (e) => {
                    const trusted = this.workspaceTrustManagementService.isWorkspaceTrusted();
                    // Workspace is trusted and there are added/changed folders
                    if (trusted && (e.changes.added.length || e.changes.changed.length)) {
                        const addedFoldersTrustInfo = await Promise.all(e.changes.added.map(folder => this.workspaceTrustManagementService.getUriTrustInfo(folder.uri)));
                        if (!addedFoldersTrustInfo.map(info => info.trusted).every(trusted => trusted)) {
                            const { confirmed } = await this.dialogService.confirm({
                                type: notification_1.Severity.Info,
                                message: (0, nls_1.localize)('addWorkspaceFolderMessage', "Do you trust the authors of the files in this folder?"),
                                detail: (0, nls_1.localize)('addWorkspaceFolderDetail', "You are adding files that are not currently trusted to a trusted workspace. Do you trust the authors of these new files?"),
                                cancelButton: (0, nls_1.localize)('no', 'No'),
                                custom: { icon: codicons_1.Codicon.shield }
                            });
                            // Mark added/changed folders as trusted
                            await this.workspaceTrustManagementService.setUrisTrust(addedFoldersTrustInfo.map(i => i.uri), confirmed);
                        }
                    }
                };
                return e.join(addWorkspaceFolder(e));
            }));
            this._register(this.workspaceTrustManagementService.onDidChangeTrust(trusted => {
                this.updateWorkbenchIndicators(trusted);
            }));
            this._register(this.workspaceTrustRequestService.onDidInitiateWorkspaceTrustRequestOnStartup(async () => {
                let titleString;
                let learnMoreString;
                let trustOption;
                let dontTrustOption;
                const isAiGeneratedWorkspace = await this.isAiGeneratedWorkspace();
                if (isAiGeneratedWorkspace && this.productService.aiGeneratedWorkspaceTrust) {
                    titleString = this.productService.aiGeneratedWorkspaceTrust.title;
                    learnMoreString = this.productService.aiGeneratedWorkspaceTrust.startupTrustRequestLearnMore;
                    trustOption = this.productService.aiGeneratedWorkspaceTrust.trustOption;
                    dontTrustOption = this.productService.aiGeneratedWorkspaceTrust.dontTrustOption;
                }
                else {
                    console.warn('AI generated workspace trust dialog contents not available.');
                }
                const title = titleString ?? (this.useWorkspaceLanguage ?
                    (0, nls_1.localize)('workspaceTrust', "Do you trust the authors of the files in this workspace?") :
                    (0, nls_1.localize)('folderTrust', "Do you trust the authors of the files in this folder?"));
                let checkboxText;
                const workspaceIdentifier = (0, workspace_1.toWorkspaceIdentifier)(this.workspaceContextService.getWorkspace());
                const isSingleFolderWorkspace = (0, workspace_1.isSingleFolderWorkspaceIdentifier)(workspaceIdentifier);
                const isEmptyWindow = (0, workspace_1.isEmptyWorkspaceIdentifier)(workspaceIdentifier);
                if (!isAiGeneratedWorkspace && this.workspaceTrustManagementService.canSetParentFolderTrust()) {
                    const name = (0, resources_1.basename)((0, resources_1.dirname)(workspaceIdentifier.uri));
                    checkboxText = (0, nls_1.localize)('checkboxString', "Trust the authors of all files in the parent folder '{0}'", name);
                }
                // Show Workspace Trust Start Dialog
                this.doShowModal(title, { label: trustOption ?? (0, nls_1.localize)({ key: 'trustOption', comment: ['&& denotes a mnemonic'] }, "&&Yes, I trust the authors"), sublabel: isSingleFolderWorkspace ? (0, nls_1.localize)('trustFolderOptionDescription', "Trust folder and enable all features") : (0, nls_1.localize)('trustWorkspaceOptionDescription', "Trust workspace and enable all features") }, { label: dontTrustOption ?? (0, nls_1.localize)({ key: 'dontTrustOption', comment: ['&& denotes a mnemonic'] }, "&&No, I don't trust the authors"), sublabel: isSingleFolderWorkspace ? (0, nls_1.localize)('dontTrustFolderOptionDescription', "Browse folder in restricted mode") : (0, nls_1.localize)('dontTrustWorkspaceOptionDescription', "Browse workspace in restricted mode") }, [
                    !isSingleFolderWorkspace ?
                        (0, nls_1.localize)('workspaceStartupTrustDetails', "{0} provides features that may automatically execute files in this workspace.", this.productService.nameShort) :
                        (0, nls_1.localize)('folderStartupTrustDetails', "{0} provides features that may automatically execute files in this folder.", this.productService.nameShort),
                    learnMoreString ?? (0, nls_1.localize)('startupTrustRequestLearnMore', "If you don't trust the authors of these files, we recommend to continue in restricted mode as the files may be malicious. See [our docs](https://aka.ms/vscode-workspace-trust) to learn more."),
                    !isEmptyWindow ?
                        `\`${this.labelService.getWorkspaceLabel(workspaceIdentifier, { verbose: 2 /* Verbosity.LONG */ })}\`` : '',
                ], checkboxText);
            }));
        }
        updateWorkbenchIndicators(trusted) {
            const bannerItem = this.getBannerItem(!trusted);
            this.updateStatusbarEntry(trusted);
            if (bannerItem) {
                if (!trusted) {
                    this.bannerService.show(bannerItem);
                }
                else {
                    this.bannerService.hide(BANNER_RESTRICTED_MODE);
                }
            }
        }
        //#region Dialog
        async doShowModal(question, trustedOption, untrustedOption, markdownStrings, trustParentString) {
            await this.dialogService.prompt({
                type: notification_1.Severity.Info,
                message: question,
                checkbox: trustParentString ? {
                    label: trustParentString
                } : undefined,
                buttons: [
                    {
                        label: trustedOption.label,
                        run: async ({ checkboxChecked }) => {
                            if (checkboxChecked) {
                                await this.workspaceTrustManagementService.setParentFolderTrust(true);
                            }
                            else {
                                await this.workspaceTrustRequestService.completeWorkspaceTrustRequest(true);
                            }
                        }
                    },
                    {
                        label: untrustedOption.label,
                        run: () => {
                            this.updateWorkbenchIndicators(false);
                            this.workspaceTrustRequestService.cancelWorkspaceTrustRequest();
                        }
                    }
                ],
                custom: {
                    buttonDetails: [
                        trustedOption.sublabel,
                        untrustedOption.sublabel
                    ],
                    disableCloseAction: true,
                    icon: codicons_1.Codicon.shield,
                    markdownDetails: markdownStrings.map(md => { return { markdown: new htmlContent_1.MarkdownString(md) }; })
                }
            });
            this.storageService.store(STARTUP_PROMPT_SHOWN_KEY, true, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        async showModalOnStart() {
            if (this.workspaceTrustManagementService.isWorkspaceTrusted()) {
                this.updateWorkbenchIndicators(true);
                return;
            }
            // Don't show modal prompt if workspace trust cannot be changed
            if (!(this.workspaceTrustManagementService.canSetWorkspaceTrust())) {
                return;
            }
            // Don't show modal prompt for virtual workspaces by default
            if ((0, virtualWorkspace_1.isVirtualWorkspace)(this.workspaceContextService.getWorkspace())) {
                this.updateWorkbenchIndicators(false);
                return;
            }
            // Don't show modal prompt for empty workspaces by default
            if (this.workspaceContextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
                this.updateWorkbenchIndicators(false);
                return;
            }
            if (this.startupPromptSetting === 'never') {
                this.updateWorkbenchIndicators(false);
                return;
            }
            if (this.startupPromptSetting === 'once' && this.storageService.getBoolean(STARTUP_PROMPT_SHOWN_KEY, 1 /* StorageScope.WORKSPACE */, false)) {
                this.updateWorkbenchIndicators(false);
                return;
            }
            // Use the workspace trust request service to show modal dialog
            this.workspaceTrustRequestService.requestWorkspaceTrustOnStartup();
        }
        get startupPromptSetting() {
            return this.configurationService.getValue(workspaceTrust_2.WORKSPACE_TRUST_STARTUP_PROMPT);
        }
        get useWorkspaceLanguage() {
            return !(0, workspace_1.isSingleFolderWorkspaceIdentifier)((0, workspace_1.toWorkspaceIdentifier)(this.workspaceContextService.getWorkspace()));
        }
        async isAiGeneratedWorkspace() {
            const aiGeneratedWorkspaces = uri_1.URI.joinPath(this.environmentService.workspaceStorageHome, 'aiGeneratedWorkspaces.json');
            return await this.fileService.exists(aiGeneratedWorkspaces).then(async (result) => {
                if (result) {
                    try {
                        const content = await this.fileService.readFile(aiGeneratedWorkspaces);
                        const workspaces = JSON.parse(content.value.toString());
                        if (workspaces.indexOf(this.workspaceContextService.getWorkspace().folders[0].uri.toString()) > -1) {
                            return true;
                        }
                    }
                    catch (e) {
                        // Ignore errors when resolving file contents
                    }
                }
                return false;
            });
        }
        //#endregion
        //#region Banner
        getBannerItem(restrictedMode) {
            const dismissedRestricted = this.storageService.getBoolean(BANNER_RESTRICTED_MODE_DISMISSED_KEY, 1 /* StorageScope.WORKSPACE */, false);
            // never show the banner
            if (this.bannerSetting === 'never') {
                return undefined;
            }
            // info has been dismissed
            if (this.bannerSetting === 'untilDismissed' && dismissedRestricted) {
                return undefined;
            }
            const actions = [
                {
                    label: (0, nls_1.localize)('restrictedModeBannerManage', "Manage"),
                    href: 'command:' + workspace_2.MANAGE_TRUST_COMMAND_ID
                },
                {
                    label: (0, nls_1.localize)('restrictedModeBannerLearnMore', "Learn More"),
                    href: 'https://aka.ms/vscode-workspace-trust'
                }
            ];
            return {
                id: BANNER_RESTRICTED_MODE,
                icon: workspaceTrustEditor_1.shieldIcon,
                ariaLabel: this.getBannerItemAriaLabels(),
                message: this.getBannerItemMessages(),
                actions,
                onClose: () => {
                    if (restrictedMode) {
                        this.storageService.store(BANNER_RESTRICTED_MODE_DISMISSED_KEY, true, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
                    }
                }
            };
        }
        getBannerItemAriaLabels() {
            switch (this.workspaceContextService.getWorkbenchState()) {
                case 1 /* WorkbenchState.EMPTY */:
                    return (0, nls_1.localize)('restrictedModeBannerAriaLabelWindow', "Restricted Mode is intended for safe code browsing. Trust this window to enable all features. Use navigation keys to access banner actions.");
                case 2 /* WorkbenchState.FOLDER */:
                    return (0, nls_1.localize)('restrictedModeBannerAriaLabelFolder', "Restricted Mode is intended for safe code browsing. Trust this folder to enable all features. Use navigation keys to access banner actions.");
                case 3 /* WorkbenchState.WORKSPACE */:
                    return (0, nls_1.localize)('restrictedModeBannerAriaLabelWorkspace', "Restricted Mode is intended for safe code browsing. Trust this workspace to enable all features. Use navigation keys to access banner actions.");
            }
        }
        getBannerItemMessages() {
            switch (this.workspaceContextService.getWorkbenchState()) {
                case 1 /* WorkbenchState.EMPTY */:
                    return (0, nls_1.localize)('restrictedModeBannerMessageWindow', "Restricted Mode is intended for safe code browsing. Trust this window to enable all features.");
                case 2 /* WorkbenchState.FOLDER */:
                    return (0, nls_1.localize)('restrictedModeBannerMessageFolder', "Restricted Mode is intended for safe code browsing. Trust this folder to enable all features.");
                case 3 /* WorkbenchState.WORKSPACE */:
                    return (0, nls_1.localize)('restrictedModeBannerMessageWorkspace', "Restricted Mode is intended for safe code browsing. Trust this workspace to enable all features.");
            }
        }
        get bannerSetting() {
            const result = this.configurationService.getValue(workspaceTrust_2.WORKSPACE_TRUST_BANNER);
            // In serverless environments, we don't need to aggressively show the banner
            if (result !== 'always' && platform_2.isWeb && !this.remoteAgentService.getConnection()?.remoteAuthority) {
                return 'never';
            }
            return result;
        }
        //#endregion
        //#region Statusbar
        createStatusbarEntry() {
            const entry = this.getStatusbarEntry(this.workspaceTrustManagementService.isWorkspaceTrusted());
            this.statusbarEntryAccessor.value = this.statusbarService.addEntry(entry, this.entryId, 0 /* StatusbarAlignment.LEFT */, 0.99 * Number.MAX_VALUE /* Right of remote indicator */);
            this.statusbarService.updateEntryVisibility(this.entryId, false);
        }
        getStatusbarEntry(trusted) {
            const text = (0, workspaceTrust_1.workspaceTrustToString)(trusted);
            let ariaLabel = '';
            let toolTip;
            switch (this.workspaceContextService.getWorkbenchState()) {
                case 1 /* WorkbenchState.EMPTY */: {
                    ariaLabel = trusted ? (0, nls_1.localize)('status.ariaTrustedWindow', "This window is trusted.") :
                        (0, nls_1.localize)('status.ariaUntrustedWindow', "Restricted Mode: Some features are disabled because this window is not trusted.");
                    toolTip = trusted ? ariaLabel : {
                        value: (0, nls_1.localize)({ key: 'status.tooltipUntrustedWindow2', comment: ['[abc]({n}) are links.  Only translate `features are disabled` and `window is not trusted`. Do not change brackets and parentheses or {n}'] }, "Running in Restricted Mode\n\nSome [features are disabled]({0}) because this [window is not trusted]({1}).", `command:${extensions_1.LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID}`, `command:${workspace_2.MANAGE_TRUST_COMMAND_ID}`),
                        isTrusted: true,
                        supportThemeIcons: true
                    };
                    break;
                }
                case 2 /* WorkbenchState.FOLDER */: {
                    ariaLabel = trusted ? (0, nls_1.localize)('status.ariaTrustedFolder', "This folder is trusted.") :
                        (0, nls_1.localize)('status.ariaUntrustedFolder', "Restricted Mode: Some features are disabled because this folder is not trusted.");
                    toolTip = trusted ? ariaLabel : {
                        value: (0, nls_1.localize)({ key: 'status.tooltipUntrustedFolder2', comment: ['[abc]({n}) are links.  Only translate `features are disabled` and `folder is not trusted`. Do not change brackets and parentheses or {n}'] }, "Running in Restricted Mode\n\nSome [features are disabled]({0}) because this [folder is not trusted]({1}).", `command:${extensions_1.LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID}`, `command:${workspace_2.MANAGE_TRUST_COMMAND_ID}`),
                        isTrusted: true,
                        supportThemeIcons: true
                    };
                    break;
                }
                case 3 /* WorkbenchState.WORKSPACE */: {
                    ariaLabel = trusted ? (0, nls_1.localize)('status.ariaTrustedWorkspace', "This workspace is trusted.") :
                        (0, nls_1.localize)('status.ariaUntrustedWorkspace', "Restricted Mode: Some features are disabled because this workspace is not trusted.");
                    toolTip = trusted ? ariaLabel : {
                        value: (0, nls_1.localize)({ key: 'status.tooltipUntrustedWorkspace2', comment: ['[abc]({n}) are links. Only translate `features are disabled` and `workspace is not trusted`. Do not change brackets and parentheses or {n}'] }, "Running in Restricted Mode\n\nSome [features are disabled]({0}) because this [workspace is not trusted]({1}).", `command:${extensions_1.LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID}`, `command:${workspace_2.MANAGE_TRUST_COMMAND_ID}`),
                        isTrusted: true,
                        supportThemeIcons: true
                    };
                    break;
                }
            }
            return {
                name: (0, nls_1.localize)('status.WorkspaceTrust', "Workspace Trust"),
                text: trusted ? `$(shield)` : `$(shield) ${text}`,
                ariaLabel: ariaLabel,
                tooltip: toolTip,
                command: workspace_2.MANAGE_TRUST_COMMAND_ID,
                kind: 'prominent'
            };
        }
        updateStatusbarEntry(trusted) {
            this.statusbarEntryAccessor.value?.update(this.getStatusbarEntry(trusted));
            this.statusbarService.updateEntryVisibility(this.entryId, !trusted);
        }
    };
    exports.WorkspaceTrustUXHandler = WorkspaceTrustUXHandler;
    exports.WorkspaceTrustUXHandler = WorkspaceTrustUXHandler = __decorate([
        __param(0, dialogs_1.IDialogService),
        __param(1, workspace_1.IWorkspaceContextService),
        __param(2, workspaceTrust_1.IWorkspaceTrustEnablementService),
        __param(3, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, statusbar_1.IStatusbarService),
        __param(6, storage_1.IStorageService),
        __param(7, workspaceTrust_1.IWorkspaceTrustRequestService),
        __param(8, bannerService_1.IBannerService),
        __param(9, label_1.ILabelService),
        __param(10, host_1.IHostService),
        __param(11, productService_1.IProductService),
        __param(12, remoteAgentService_1.IRemoteAgentService),
        __param(13, environment_1.IEnvironmentService),
        __param(14, files_1.IFileService)
    ], WorkspaceTrustUXHandler);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(WorkspaceTrustRequestHandler, 2 /* LifecyclePhase.Ready */);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(WorkspaceTrustUXHandler, 3 /* LifecyclePhase.Restored */);
    /**
     * Trusted Workspace GUI Editor
     */
    class WorkspaceTrustEditorInputSerializer {
        canSerialize(editorInput) {
            return true;
        }
        serialize(input) {
            return '';
        }
        deserialize(instantiationService) {
            return instantiationService.createInstance(workspaceTrustEditorInput_1.WorkspaceTrustEditorInput);
        }
    }
    platform_1.Registry.as(editor_2.EditorExtensions.EditorFactory)
        .registerEditorSerializer(workspaceTrustEditorInput_1.WorkspaceTrustEditorInput.ID, WorkspaceTrustEditorInputSerializer);
    platform_1.Registry.as(editor_2.EditorExtensions.EditorPane).registerEditorPane(editor_1.EditorPaneDescriptor.create(workspaceTrustEditor_1.WorkspaceTrustEditor, workspaceTrustEditor_1.WorkspaceTrustEditor.ID, (0, nls_1.localize)('workspaceTrustEditor', "Workspace Trust Editor")), [
        new descriptors_1.SyncDescriptor(workspaceTrustEditorInput_1.WorkspaceTrustEditorInput)
    ]);
    /*
     * Actions
     */
    // Configure Workspace Trust Settings
    const CONFIGURE_TRUST_COMMAND_ID = 'workbench.trust.configure';
    const WORKSPACES_CATEGORY = { value: (0, nls_1.localize)('workspacesCategory', "Workspaces"), original: 'Workspaces' };
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: CONFIGURE_TRUST_COMMAND_ID,
                title: { original: 'Configure Workspace Trust Settings', value: (0, nls_1.localize)('configureWorkspaceTrustSettings', "Configure Workspace Trust Settings") },
                precondition: contextkey_1.ContextKeyExpr.and(workspace_2.WorkspaceTrustContext.IsEnabled, contextkey_1.ContextKeyExpr.equals(`config.${workspaceTrust_2.WORKSPACE_TRUST_ENABLED}`, true)),
                category: WORKSPACES_CATEGORY,
                f1: true
            });
        }
        run(accessor) {
            accessor.get(preferences_2.IPreferencesService).openUserSettings({ jsonEditor: false, query: `@tag:${preferences_1.WORKSPACE_TRUST_SETTING_TAG}` });
        }
    });
    // Manage Workspace Trust
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: workspace_2.MANAGE_TRUST_COMMAND_ID,
                title: { original: 'Manage Workspace Trust', value: (0, nls_1.localize)('manageWorkspaceTrust', "Manage Workspace Trust") },
                precondition: contextkey_1.ContextKeyExpr.and(workspace_2.WorkspaceTrustContext.IsEnabled, contextkey_1.ContextKeyExpr.equals(`config.${workspaceTrust_2.WORKSPACE_TRUST_ENABLED}`, true)),
                category: WORKSPACES_CATEGORY,
                f1: true,
            });
        }
        run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const instantiationService = accessor.get(instantiation_1.IInstantiationService);
            const input = instantiationService.createInstance(workspaceTrustEditorInput_1.WorkspaceTrustEditorInput);
            editorService.openEditor(input, { pinned: true });
            return;
        }
    });
    /*
     * Configuration
     */
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration)
        .registerConfiguration({
        ...configuration_2.securityConfigurationNodeBase,
        properties: {
            [workspaceTrust_2.WORKSPACE_TRUST_ENABLED]: {
                type: 'boolean',
                default: true,
                description: (0, nls_1.localize)('workspace.trust.description', "Controls whether or not Workspace Trust is enabled within VS Code."),
                tags: [preferences_1.WORKSPACE_TRUST_SETTING_TAG],
                scope: 1 /* ConfigurationScope.APPLICATION */,
            },
            [workspaceTrust_2.WORKSPACE_TRUST_STARTUP_PROMPT]: {
                type: 'string',
                default: 'once',
                description: (0, nls_1.localize)('workspace.trust.startupPrompt.description', "Controls when the startup prompt to trust a workspace is shown."),
                tags: [preferences_1.WORKSPACE_TRUST_SETTING_TAG],
                scope: 1 /* ConfigurationScope.APPLICATION */,
                enum: ['always', 'once', 'never'],
                enumDescriptions: [
                    (0, nls_1.localize)('workspace.trust.startupPrompt.always', "Ask for trust every time an untrusted workspace is opened."),
                    (0, nls_1.localize)('workspace.trust.startupPrompt.once', "Ask for trust the first time an untrusted workspace is opened."),
                    (0, nls_1.localize)('workspace.trust.startupPrompt.never', "Do not ask for trust when an untrusted workspace is opened."),
                ]
            },
            [workspaceTrust_2.WORKSPACE_TRUST_BANNER]: {
                type: 'string',
                default: 'untilDismissed',
                description: (0, nls_1.localize)('workspace.trust.banner.description', "Controls when the restricted mode banner is shown."),
                tags: [preferences_1.WORKSPACE_TRUST_SETTING_TAG],
                scope: 1 /* ConfigurationScope.APPLICATION */,
                enum: ['always', 'untilDismissed', 'never'],
                enumDescriptions: [
                    (0, nls_1.localize)('workspace.trust.banner.always', "Show the banner every time an untrusted workspace is open."),
                    (0, nls_1.localize)('workspace.trust.banner.untilDismissed', "Show the banner when an untrusted workspace is opened until dismissed."),
                    (0, nls_1.localize)('workspace.trust.banner.never', "Do not show the banner when an untrusted workspace is open."),
                ]
            },
            [workspaceTrust_2.WORKSPACE_TRUST_UNTRUSTED_FILES]: {
                type: 'string',
                default: 'prompt',
                markdownDescription: (0, nls_1.localize)('workspace.trust.untrustedFiles.description', "Controls how to handle opening untrusted files in a trusted workspace. This setting also applies to opening files in an empty window which is trusted via `#{0}#`.", workspaceTrust_2.WORKSPACE_TRUST_EMPTY_WINDOW),
                tags: [preferences_1.WORKSPACE_TRUST_SETTING_TAG],
                scope: 1 /* ConfigurationScope.APPLICATION */,
                enum: ['prompt', 'open', 'newWindow'],
                enumDescriptions: [
                    (0, nls_1.localize)('workspace.trust.untrustedFiles.prompt', "Ask how to handle untrusted files for each workspace. Once untrusted files are introduced to a trusted workspace, you will not be prompted again."),
                    (0, nls_1.localize)('workspace.trust.untrustedFiles.open', "Always allow untrusted files to be introduced to a trusted workspace without prompting."),
                    (0, nls_1.localize)('workspace.trust.untrustedFiles.newWindow', "Always open untrusted files in a separate window in restricted mode without prompting."),
                ]
            },
            [workspaceTrust_2.WORKSPACE_TRUST_EMPTY_WINDOW]: {
                type: 'boolean',
                default: true,
                markdownDescription: (0, nls_1.localize)('workspace.trust.emptyWindow.description', "Controls whether or not the empty window is trusted by default within VS Code. When used with `#{0}#`, you can enable the full functionality of VS Code without prompting in an empty window.", workspaceTrust_2.WORKSPACE_TRUST_UNTRUSTED_FILES),
                tags: [preferences_1.WORKSPACE_TRUST_SETTING_TAG],
                scope: 1 /* ConfigurationScope.APPLICATION */
            }
        }
    });
    let WorkspaceTrustTelemetryContribution = class WorkspaceTrustTelemetryContribution extends lifecycle_1.Disposable {
        constructor(environmentService, telemetryService, workspaceContextService, workspaceTrustEnablementService, workspaceTrustManagementService) {
            super();
            this.environmentService = environmentService;
            this.telemetryService = telemetryService;
            this.workspaceContextService = workspaceContextService;
            this.workspaceTrustEnablementService = workspaceTrustEnablementService;
            this.workspaceTrustManagementService = workspaceTrustManagementService;
            this.workspaceTrustManagementService.workspaceTrustInitialized
                .then(() => {
                this.logInitialWorkspaceTrustInfo();
                this.logWorkspaceTrust(this.workspaceTrustManagementService.isWorkspaceTrusted());
                this._register(this.workspaceTrustManagementService.onDidChangeTrust(isTrusted => this.logWorkspaceTrust(isTrusted)));
            });
        }
        logInitialWorkspaceTrustInfo() {
            if (!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
                const disabledByCliFlag = this.environmentService.disableWorkspaceTrust;
                this.telemetryService.publicLog2('workspaceTrustDisabled', {
                    reason: disabledByCliFlag ? 'cli' : 'setting'
                });
                return;
            }
            this.telemetryService.publicLog2('workspaceTrustFolderCounts', {
                trustedFoldersCount: this.workspaceTrustManagementService.getTrustedUris().length,
            });
        }
        async logWorkspaceTrust(isTrusted) {
            if (!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
                return;
            }
            this.telemetryService.publicLog2('workspaceTrustStateChanged', {
                workspaceId: this.workspaceContextService.getWorkspace().id,
                isTrusted: isTrusted
            });
            if (isTrusted) {
                const getDepth = (folder) => {
                    let resolvedPath = (0, path_1.resolve)(folder);
                    let depth = 0;
                    while ((0, path_1.dirname)(resolvedPath) !== resolvedPath && depth < 100) {
                        resolvedPath = (0, path_1.dirname)(resolvedPath);
                        depth++;
                    }
                    return depth;
                };
                for (const folder of this.workspaceContextService.getWorkspace().folders) {
                    const { trusted, uri } = await this.workspaceTrustManagementService.getUriTrustInfo(folder.uri);
                    if (!trusted) {
                        continue;
                    }
                    const workspaceFolderDepth = getDepth(folder.uri.fsPath);
                    const trustedFolderDepth = getDepth(uri.fsPath);
                    const delta = workspaceFolderDepth - trustedFolderDepth;
                    this.telemetryService.publicLog2('workspaceFolderDepthBelowTrustedFolder', { workspaceFolderDepth, trustedFolderDepth, delta });
                }
            }
        }
    };
    WorkspaceTrustTelemetryContribution = __decorate([
        __param(0, environmentService_1.IWorkbenchEnvironmentService),
        __param(1, telemetry_1.ITelemetryService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, workspaceTrust_1.IWorkspaceTrustEnablementService),
        __param(4, workspaceTrust_1.IWorkspaceTrustManagementService)
    ], WorkspaceTrustTelemetryContribution);
    platform_1.Registry.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(WorkspaceTrustTelemetryContribution, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlLmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3dvcmtzcGFjZS9icm93c2VyL3dvcmtzcGFjZS5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBa0RoRyxNQUFNLHNCQUFzQixHQUFHLGlDQUFpQyxDQUFDO0lBQ2pFLE1BQU0sd0JBQXdCLEdBQUcscUNBQXFDLENBQUM7SUFDdkUsTUFBTSxvQ0FBb0MsR0FBRywyQ0FBMkMsQ0FBQztJQUVsRixJQUFNLHlCQUF5QixHQUEvQixNQUFNLHlCQUEwQixTQUFRLHNCQUFVO1FBS3hELFlBQ3FCLGlCQUFxQyxFQUN2QiwrQkFBaUUsRUFDakUsK0JBQWlFO1lBRW5HLEtBQUssRUFBRSxDQUFDO1lBRVIsSUFBSSxDQUFDLHlCQUF5QixHQUFHLGlDQUFxQixDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUMzRixJQUFJLENBQUMseUJBQXlCLENBQUMsR0FBRyxDQUFDLCtCQUErQixDQUFDLHVCQUF1QixFQUFFLENBQUMsQ0FBQztZQUU5RixJQUFJLENBQUMsdUJBQXVCLEdBQUcsaUNBQXFCLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ3pGLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsK0JBQStCLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO1lBRXZGLElBQUksQ0FBQyxTQUFTLENBQUMsK0JBQStCLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4SCxDQUFDO0tBQ0QsQ0FBQTtJQXBCWSw4REFBeUI7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