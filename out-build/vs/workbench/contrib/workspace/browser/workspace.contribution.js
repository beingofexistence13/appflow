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
define(["require", "exports", "vs/platform/instantiation/common/descriptors", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/workspace/browser/workspace.contribution", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configurationRegistry", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/registry/common/platform", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/common/contributions", "vs/base/common/codicons", "vs/workbench/services/editor/common/editorService", "vs/platform/contextkey/common/contextkey", "vs/platform/commands/common/commands", "vs/workbench/services/statusbar/browser/statusbar", "vs/workbench/browser/editor", "vs/workbench/contrib/workspace/browser/workspaceTrustEditor", "vs/workbench/services/workspaces/browser/workspaceTrustEditorInput", "vs/workbench/services/workspaces/common/workspaceTrust", "vs/workbench/common/editor", "vs/platform/telemetry/common/telemetry", "vs/platform/workspace/common/workspace", "vs/base/common/path", "vs/platform/configuration/common/configuration", "vs/base/common/htmlContent", "vs/platform/storage/common/storage", "vs/workbench/services/host/browser/host", "vs/workbench/services/banner/browser/bannerService", "vs/platform/workspace/common/virtualWorkspace", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/services/environment/common/environmentService", "vs/workbench/contrib/preferences/common/preferences", "vs/workbench/services/preferences/common/preferences", "vs/platform/label/common/label", "vs/platform/product/common/productService", "vs/workbench/contrib/workspace/common/workspace", "vs/base/common/platform", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/common/configuration", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/css!./media/workspaceTrustEditor"], function (require, exports, descriptors_1, lifecycle_1, nls_1, actions_1, configurationRegistry_1, dialogs_1, instantiation_1, notification_1, platform_1, workspaceTrust_1, contributions_1, codicons_1, editorService_1, contextkey_1, commands_1, statusbar_1, editor_1, workspaceTrustEditor_1, workspaceTrustEditorInput_1, workspaceTrust_2, editor_2, telemetry_1, workspace_1, path_1, configuration_1, htmlContent_1, storage_1, host_1, bannerService_1, virtualWorkspace_1, extensions_1, environmentService_1, preferences_1, preferences_2, label_1, productService_1, workspace_2, platform_2, remoteAgentService_1, configuration_2, resources_1, uri_1, environment_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$M1b = exports.$L1b = exports.$K1b = void 0;
    const BANNER_RESTRICTED_MODE = 'workbench.banner.restrictedMode';
    const STARTUP_PROMPT_SHOWN_KEY = 'workspace.trust.startupPrompt.shown';
    const BANNER_RESTRICTED_MODE_DISMISSED_KEY = 'workbench.banner.restrictedMode.dismissed';
    let $K1b = class $K1b extends lifecycle_1.$kc {
        constructor(contextKeyService, workspaceTrustEnablementService, workspaceTrustManagementService) {
            super();
            this.a = workspace_2.$XPb.IsEnabled.bindTo(contextKeyService);
            this.a.set(workspaceTrustEnablementService.isWorkspaceTrustEnabled());
            this.c = workspace_2.$XPb.IsTrusted.bindTo(contextKeyService);
            this.c.set(workspaceTrustManagementService.isWorkspaceTrusted());
            this.B(workspaceTrustManagementService.onDidChangeTrust(trusted => this.c.set(trusted)));
        }
    };
    exports.$K1b = $K1b;
    exports.$K1b = $K1b = __decorate([
        __param(0, contextkey_1.$3i),
        __param(1, workspaceTrust_1.$0z),
        __param(2, workspaceTrust_1.$$z)
    ], $K1b);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution($K1b, 3 /* LifecyclePhase.Restored */);
    /*
     * Trust Request via Service UX handler
     */
    let $L1b = class $L1b extends lifecycle_1.$kc {
        constructor(a, c, f, g, h) {
            super();
            this.a = a;
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.m();
        }
        get j() {
            return !(0, workspace_1.$Lh)((0, workspace_1.$Ph)(this.f.getWorkspace()));
        }
        async m() {
            await this.g.workspaceResolved;
            // Open files trust request
            this.B(this.h.onDidInitiateOpenFilesTrustRequest(async () => {
                // Details
                const markdownDetails = [
                    this.f.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */ ?
                        (0, nls_1.localize)(0, null) :
                        (0, nls_1.localize)(1, null),
                    (0, nls_1.localize)(2, null)
                ];
                // Dialog
                await this.a.prompt({
                    type: notification_1.Severity.Info,
                    message: this.f.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */ ?
                        (0, nls_1.localize)(3, null) :
                        (0, nls_1.localize)(4, null),
                    buttons: [
                        {
                            label: (0, nls_1.localize)(5, null),
                            run: ({ checkboxChecked }) => this.h.completeOpenFilesTrustRequest(1 /* WorkspaceTrustUriResponse.Open */, !!checkboxChecked)
                        },
                        {
                            label: (0, nls_1.localize)(6, null),
                            run: ({ checkboxChecked }) => this.h.completeOpenFilesTrustRequest(2 /* WorkspaceTrustUriResponse.OpenInNewWindow */, !!checkboxChecked)
                        }
                    ],
                    cancelButton: {
                        run: () => this.h.completeOpenFilesTrustRequest(3 /* WorkspaceTrustUriResponse.Cancel */)
                    },
                    checkbox: {
                        label: (0, nls_1.localize)(7, null),
                        checked: false
                    },
                    custom: {
                        icon: codicons_1.$Pj.shield,
                        markdownDetails: markdownDetails.map(md => { return { markdown: new htmlContent_1.$Xj(md) }; })
                    }
                });
            }));
            // Workspace trust request
            this.B(this.h.onDidInitiateWorkspaceTrustRequest(async (requestOptions) => {
                // Title
                const message = this.j ?
                    (0, nls_1.localize)(8, null) :
                    (0, nls_1.localize)(9, null);
                // Message
                const defaultDetails = (0, nls_1.localize)(10, null);
                const details = requestOptions?.message ?? defaultDetails;
                // Buttons
                const buttons = requestOptions?.buttons ?? [
                    { label: this.j ? (0, nls_1.localize)(11, null) : (0, nls_1.localize)(12, null), type: 'ContinueWithTrust' },
                    { label: (0, nls_1.localize)(13, null), type: 'Manage' }
                ];
                // Add Cancel button if not provided
                if (!buttons.some(b => b.type === 'Cancel')) {
                    buttons.push({ label: (0, nls_1.localize)(14, null), type: 'Cancel' });
                }
                // Dialog
                const { result } = await this.a.prompt({
                    type: notification_1.Severity.Info,
                    message,
                    custom: {
                        icon: codicons_1.$Pj.shield,
                        markdownDetails: [
                            { markdown: new htmlContent_1.$Xj(details) },
                            { markdown: new htmlContent_1.$Xj((0, nls_1.localize)(15, null)) }
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
                        await this.h.completeWorkspaceTrustRequest(true);
                        break;
                    case 'ContinueWithoutTrust':
                        await this.h.completeWorkspaceTrustRequest(undefined);
                        break;
                    case 'Manage':
                        this.h.cancelWorkspaceTrustRequest();
                        await this.c.executeCommand(workspace_2.$YPb);
                        break;
                    case 'Cancel':
                        this.h.cancelWorkspaceTrustRequest();
                        break;
                }
            }));
        }
    };
    exports.$L1b = $L1b;
    exports.$L1b = $L1b = __decorate([
        __param(0, dialogs_1.$oA),
        __param(1, commands_1.$Fr),
        __param(2, workspace_1.$Kh),
        __param(3, workspaceTrust_1.$$z),
        __param(4, workspaceTrust_1.$_z)
    ], $L1b);
    /*
     * Trust UX and Startup Handler
     */
    let $M1b = class $M1b extends lifecycle_1.$kc {
        constructor(f, g, h, j, m, n, r, s, t, u, w, y, z, C, D) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
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
            this.a = `status.workspaceTrust.${this.g.getWorkspace().id}`;
            this.c = this.B(new lifecycle_1.$lc());
            (async () => {
                await this.j.workspaceTrustInitialized;
                if (this.h.isWorkspaceTrustEnabled()) {
                    this.F();
                    this.R();
                    // Show modal dialog
                    if (this.w.hasFocus) {
                        this.I();
                    }
                    else {
                        const focusDisposable = this.w.onDidChangeFocus(focused => {
                            if (focused) {
                                focusDisposable.dispose();
                                this.I();
                            }
                        });
                    }
                }
            })();
        }
        F() {
            this.B(this.g.onWillChangeWorkspaceFolders(e => {
                if (e.fromCache) {
                    return;
                }
                if (!this.h.isWorkspaceTrustEnabled()) {
                    return;
                }
                const addWorkspaceFolder = async (e) => {
                    const trusted = this.j.isWorkspaceTrusted();
                    // Workspace is trusted and there are added/changed folders
                    if (trusted && (e.changes.added.length || e.changes.changed.length)) {
                        const addedFoldersTrustInfo = await Promise.all(e.changes.added.map(folder => this.j.getUriTrustInfo(folder.uri)));
                        if (!addedFoldersTrustInfo.map(info => info.trusted).every(trusted => trusted)) {
                            const { confirmed } = await this.f.confirm({
                                type: notification_1.Severity.Info,
                                message: (0, nls_1.localize)(16, null),
                                detail: (0, nls_1.localize)(17, null),
                                cancelButton: (0, nls_1.localize)(18, null),
                                custom: { icon: codicons_1.$Pj.shield }
                            });
                            // Mark added/changed folders as trusted
                            await this.j.setUrisTrust(addedFoldersTrustInfo.map(i => i.uri), confirmed);
                        }
                    }
                };
                return e.join(addWorkspaceFolder(e));
            }));
            this.B(this.j.onDidChangeTrust(trusted => {
                this.G(trusted);
            }));
            this.B(this.s.onDidInitiateWorkspaceTrustRequestOnStartup(async () => {
                let titleString;
                let learnMoreString;
                let trustOption;
                let dontTrustOption;
                const isAiGeneratedWorkspace = await this.M();
                if (isAiGeneratedWorkspace && this.y.aiGeneratedWorkspaceTrust) {
                    titleString = this.y.aiGeneratedWorkspaceTrust.title;
                    learnMoreString = this.y.aiGeneratedWorkspaceTrust.startupTrustRequestLearnMore;
                    trustOption = this.y.aiGeneratedWorkspaceTrust.trustOption;
                    dontTrustOption = this.y.aiGeneratedWorkspaceTrust.dontTrustOption;
                }
                else {
                    console.warn('AI generated workspace trust dialog contents not available.');
                }
                const title = titleString ?? (this.L ?
                    (0, nls_1.localize)(19, null) :
                    (0, nls_1.localize)(20, null));
                let checkboxText;
                const workspaceIdentifier = (0, workspace_1.$Ph)(this.g.getWorkspace());
                const isSingleFolderWorkspace = (0, workspace_1.$Lh)(workspaceIdentifier);
                const isEmptyWindow = (0, workspace_1.$Mh)(workspaceIdentifier);
                if (!isAiGeneratedWorkspace && this.j.canSetParentFolderTrust()) {
                    const name = (0, resources_1.$fg)((0, resources_1.$hg)(workspaceIdentifier.uri));
                    checkboxText = (0, nls_1.localize)(21, null, name);
                }
                // Show Workspace Trust Start Dialog
                this.H(title, { label: trustOption ?? (0, nls_1.localize)(22, null), sublabel: isSingleFolderWorkspace ? (0, nls_1.localize)(23, null) : (0, nls_1.localize)(24, null) }, { label: dontTrustOption ?? (0, nls_1.localize)(25, null), sublabel: isSingleFolderWorkspace ? (0, nls_1.localize)(26, null) : (0, nls_1.localize)(27, null) }, [
                    !isSingleFolderWorkspace ?
                        (0, nls_1.localize)(28, null, this.y.nameShort) :
                        (0, nls_1.localize)(29, null, this.y.nameShort),
                    learnMoreString ?? (0, nls_1.localize)(30, null),
                    !isEmptyWindow ?
                        `\`${this.u.getWorkspaceLabel(workspaceIdentifier, { verbose: 2 /* Verbosity.LONG */ })}\`` : '',
                ], checkboxText);
            }));
        }
        G(trusted) {
            const bannerItem = this.N(!trusted);
            this.U(trusted);
            if (bannerItem) {
                if (!trusted) {
                    this.t.show(bannerItem);
                }
                else {
                    this.t.hide(BANNER_RESTRICTED_MODE);
                }
            }
        }
        //#region Dialog
        async H(question, trustedOption, untrustedOption, markdownStrings, trustParentString) {
            await this.f.prompt({
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
                                await this.j.setParentFolderTrust(true);
                            }
                            else {
                                await this.s.completeWorkspaceTrustRequest(true);
                            }
                        }
                    },
                    {
                        label: untrustedOption.label,
                        run: () => {
                            this.G(false);
                            this.s.cancelWorkspaceTrustRequest();
                        }
                    }
                ],
                custom: {
                    buttonDetails: [
                        trustedOption.sublabel,
                        untrustedOption.sublabel
                    ],
                    disableCloseAction: true,
                    icon: codicons_1.$Pj.shield,
                    markdownDetails: markdownStrings.map(md => { return { markdown: new htmlContent_1.$Xj(md) }; })
                }
            });
            this.r.store(STARTUP_PROMPT_SHOWN_KEY, true, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        async I() {
            if (this.j.isWorkspaceTrusted()) {
                this.G(true);
                return;
            }
            // Don't show modal prompt if workspace trust cannot be changed
            if (!(this.j.canSetWorkspaceTrust())) {
                return;
            }
            // Don't show modal prompt for virtual workspaces by default
            if ((0, virtualWorkspace_1.$xJ)(this.g.getWorkspace())) {
                this.G(false);
                return;
            }
            // Don't show modal prompt for empty workspaces by default
            if (this.g.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
                this.G(false);
                return;
            }
            if (this.J === 'never') {
                this.G(false);
                return;
            }
            if (this.J === 'once' && this.r.getBoolean(STARTUP_PROMPT_SHOWN_KEY, 1 /* StorageScope.WORKSPACE */, false)) {
                this.G(false);
                return;
            }
            // Use the workspace trust request service to show modal dialog
            this.s.requestWorkspaceTrustOnStartup();
        }
        get J() {
            return this.m.getValue(workspaceTrust_2.$lcb);
        }
        get L() {
            return !(0, workspace_1.$Lh)((0, workspace_1.$Ph)(this.g.getWorkspace()));
        }
        async M() {
            const aiGeneratedWorkspaces = uri_1.URI.joinPath(this.C.workspaceStorageHome, 'aiGeneratedWorkspaces.json');
            return await this.D.exists(aiGeneratedWorkspaces).then(async (result) => {
                if (result) {
                    try {
                        const content = await this.D.readFile(aiGeneratedWorkspaces);
                        const workspaces = JSON.parse(content.value.toString());
                        if (workspaces.indexOf(this.g.getWorkspace().folders[0].uri.toString()) > -1) {
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
        N(restrictedMode) {
            const dismissedRestricted = this.r.getBoolean(BANNER_RESTRICTED_MODE_DISMISSED_KEY, 1 /* StorageScope.WORKSPACE */, false);
            // never show the banner
            if (this.Q === 'never') {
                return undefined;
            }
            // info has been dismissed
            if (this.Q === 'untilDismissed' && dismissedRestricted) {
                return undefined;
            }
            const actions = [
                {
                    label: (0, nls_1.localize)(31, null),
                    href: 'command:' + workspace_2.$YPb
                },
                {
                    label: (0, nls_1.localize)(32, null),
                    href: 'https://aka.ms/vscode-workspace-trust'
                }
            ];
            return {
                id: BANNER_RESTRICTED_MODE,
                icon: workspaceTrustEditor_1.$I1b,
                ariaLabel: this.O(),
                message: this.P(),
                actions,
                onClose: () => {
                    if (restrictedMode) {
                        this.r.store(BANNER_RESTRICTED_MODE_DISMISSED_KEY, true, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
                    }
                }
            };
        }
        O() {
            switch (this.g.getWorkbenchState()) {
                case 1 /* WorkbenchState.EMPTY */:
                    return (0, nls_1.localize)(33, null);
                case 2 /* WorkbenchState.FOLDER */:
                    return (0, nls_1.localize)(34, null);
                case 3 /* WorkbenchState.WORKSPACE */:
                    return (0, nls_1.localize)(35, null);
            }
        }
        P() {
            switch (this.g.getWorkbenchState()) {
                case 1 /* WorkbenchState.EMPTY */:
                    return (0, nls_1.localize)(36, null);
                case 2 /* WorkbenchState.FOLDER */:
                    return (0, nls_1.localize)(37, null);
                case 3 /* WorkbenchState.WORKSPACE */:
                    return (0, nls_1.localize)(38, null);
            }
        }
        get Q() {
            const result = this.m.getValue(workspaceTrust_2.$mcb);
            // In serverless environments, we don't need to aggressively show the banner
            if (result !== 'always' && platform_2.$o && !this.z.getConnection()?.remoteAuthority) {
                return 'never';
            }
            return result;
        }
        //#endregion
        //#region Statusbar
        R() {
            const entry = this.S(this.j.isWorkspaceTrusted());
            this.c.value = this.n.addEntry(entry, this.a, 0 /* StatusbarAlignment.LEFT */, 0.99 * Number.MAX_VALUE /* Right of remote indicator */);
            this.n.updateEntryVisibility(this.a, false);
        }
        S(trusted) {
            const text = (0, workspaceTrust_1.$9z)(trusted);
            let ariaLabel = '';
            let toolTip;
            switch (this.g.getWorkbenchState()) {
                case 1 /* WorkbenchState.EMPTY */: {
                    ariaLabel = trusted ? (0, nls_1.localize)(39, null) :
                        (0, nls_1.localize)(40, null);
                    toolTip = trusted ? ariaLabel : {
                        value: (0, nls_1.localize)(41, null, `command:${extensions_1.$1fb}`, `command:${workspace_2.$YPb}`),
                        isTrusted: true,
                        supportThemeIcons: true
                    };
                    break;
                }
                case 2 /* WorkbenchState.FOLDER */: {
                    ariaLabel = trusted ? (0, nls_1.localize)(42, null) :
                        (0, nls_1.localize)(43, null);
                    toolTip = trusted ? ariaLabel : {
                        value: (0, nls_1.localize)(44, null, `command:${extensions_1.$1fb}`, `command:${workspace_2.$YPb}`),
                        isTrusted: true,
                        supportThemeIcons: true
                    };
                    break;
                }
                case 3 /* WorkbenchState.WORKSPACE */: {
                    ariaLabel = trusted ? (0, nls_1.localize)(45, null) :
                        (0, nls_1.localize)(46, null);
                    toolTip = trusted ? ariaLabel : {
                        value: (0, nls_1.localize)(47, null, `command:${extensions_1.$1fb}`, `command:${workspace_2.$YPb}`),
                        isTrusted: true,
                        supportThemeIcons: true
                    };
                    break;
                }
            }
            return {
                name: (0, nls_1.localize)(48, null),
                text: trusted ? `$(shield)` : `$(shield) ${text}`,
                ariaLabel: ariaLabel,
                tooltip: toolTip,
                command: workspace_2.$YPb,
                kind: 'prominent'
            };
        }
        U(trusted) {
            this.c.value?.update(this.S(trusted));
            this.n.updateEntryVisibility(this.a, !trusted);
        }
    };
    exports.$M1b = $M1b;
    exports.$M1b = $M1b = __decorate([
        __param(0, dialogs_1.$oA),
        __param(1, workspace_1.$Kh),
        __param(2, workspaceTrust_1.$0z),
        __param(3, workspaceTrust_1.$$z),
        __param(4, configuration_1.$8h),
        __param(5, statusbar_1.$6$),
        __param(6, storage_1.$Vo),
        __param(7, workspaceTrust_1.$_z),
        __param(8, bannerService_1.$_xb),
        __param(9, label_1.$Vz),
        __param(10, host_1.$VT),
        __param(11, productService_1.$kj),
        __param(12, remoteAgentService_1.$jm),
        __param(13, environment_1.$Ih),
        __param(14, files_1.$6j)
    ], $M1b);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution($L1b, 2 /* LifecyclePhase.Ready */);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution($M1b, 3 /* LifecyclePhase.Restored */);
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
            return instantiationService.createInstance(workspaceTrustEditorInput_1.$H1b);
        }
    }
    platform_1.$8m.as(editor_2.$GE.EditorFactory)
        .registerEditorSerializer(workspaceTrustEditorInput_1.$H1b.ID, WorkspaceTrustEditorInputSerializer);
    platform_1.$8m.as(editor_2.$GE.EditorPane).registerEditorPane(editor_1.$_T.create(workspaceTrustEditor_1.$J1b, workspaceTrustEditor_1.$J1b.ID, (0, nls_1.localize)(49, null)), [
        new descriptors_1.$yh(workspaceTrustEditorInput_1.$H1b)
    ]);
    /*
     * Actions
     */
    // Configure Workspace Trust Settings
    const CONFIGURE_TRUST_COMMAND_ID = 'workbench.trust.configure';
    const WORKSPACES_CATEGORY = { value: (0, nls_1.localize)(50, null), original: 'Workspaces' };
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: CONFIGURE_TRUST_COMMAND_ID,
                title: { original: 'Configure Workspace Trust Settings', value: (0, nls_1.localize)(51, null) },
                precondition: contextkey_1.$Ii.and(workspace_2.$XPb.IsEnabled, contextkey_1.$Ii.equals(`config.${workspaceTrust_2.$kcb}`, true)),
                category: WORKSPACES_CATEGORY,
                f1: true
            });
        }
        run(accessor) {
            accessor.get(preferences_2.$BE).openUserSettings({ jsonEditor: false, query: `@tag:${preferences_1.$PCb}` });
        }
    });
    // Manage Workspace Trust
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: workspace_2.$YPb,
                title: { original: 'Manage Workspace Trust', value: (0, nls_1.localize)(52, null) },
                precondition: contextkey_1.$Ii.and(workspace_2.$XPb.IsEnabled, contextkey_1.$Ii.equals(`config.${workspaceTrust_2.$kcb}`, true)),
                category: WORKSPACES_CATEGORY,
                f1: true,
            });
        }
        run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const instantiationService = accessor.get(instantiation_1.$Ah);
            const input = instantiationService.createInstance(workspaceTrustEditorInput_1.$H1b);
            editorService.openEditor(input, { pinned: true });
            return;
        }
    });
    /*
     * Configuration
     */
    platform_1.$8m.as(configurationRegistry_1.$an.Configuration)
        .registerConfiguration({
        ...configuration_2.$_y,
        properties: {
            [workspaceTrust_2.$kcb]: {
                type: 'boolean',
                default: true,
                description: (0, nls_1.localize)(53, null),
                tags: [preferences_1.$PCb],
                scope: 1 /* ConfigurationScope.APPLICATION */,
            },
            [workspaceTrust_2.$lcb]: {
                type: 'string',
                default: 'once',
                description: (0, nls_1.localize)(54, null),
                tags: [preferences_1.$PCb],
                scope: 1 /* ConfigurationScope.APPLICATION */,
                enum: ['always', 'once', 'never'],
                enumDescriptions: [
                    (0, nls_1.localize)(55, null),
                    (0, nls_1.localize)(56, null),
                    (0, nls_1.localize)(57, null),
                ]
            },
            [workspaceTrust_2.$mcb]: {
                type: 'string',
                default: 'untilDismissed',
                description: (0, nls_1.localize)(58, null),
                tags: [preferences_1.$PCb],
                scope: 1 /* ConfigurationScope.APPLICATION */,
                enum: ['always', 'untilDismissed', 'never'],
                enumDescriptions: [
                    (0, nls_1.localize)(59, null),
                    (0, nls_1.localize)(60, null),
                    (0, nls_1.localize)(61, null),
                ]
            },
            [workspaceTrust_2.$ncb]: {
                type: 'string',
                default: 'prompt',
                markdownDescription: (0, nls_1.localize)(62, null, workspaceTrust_2.$ocb),
                tags: [preferences_1.$PCb],
                scope: 1 /* ConfigurationScope.APPLICATION */,
                enum: ['prompt', 'open', 'newWindow'],
                enumDescriptions: [
                    (0, nls_1.localize)(63, null),
                    (0, nls_1.localize)(64, null),
                    (0, nls_1.localize)(65, null),
                ]
            },
            [workspaceTrust_2.$ocb]: {
                type: 'boolean',
                default: true,
                markdownDescription: (0, nls_1.localize)(66, null, workspaceTrust_2.$ncb),
                tags: [preferences_1.$PCb],
                scope: 1 /* ConfigurationScope.APPLICATION */
            }
        }
    });
    let WorkspaceTrustTelemetryContribution = class WorkspaceTrustTelemetryContribution extends lifecycle_1.$kc {
        constructor(a, c, f, g, h) {
            super();
            this.a = a;
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.h.workspaceTrustInitialized
                .then(() => {
                this.j();
                this.m(this.h.isWorkspaceTrusted());
                this.B(this.h.onDidChangeTrust(isTrusted => this.m(isTrusted)));
            });
        }
        j() {
            if (!this.g.isWorkspaceTrustEnabled()) {
                const disabledByCliFlag = this.a.disableWorkspaceTrust;
                this.c.publicLog2('workspaceTrustDisabled', {
                    reason: disabledByCliFlag ? 'cli' : 'setting'
                });
                return;
            }
            this.c.publicLog2('workspaceTrustFolderCounts', {
                trustedFoldersCount: this.h.getTrustedUris().length,
            });
        }
        async m(isTrusted) {
            if (!this.g.isWorkspaceTrustEnabled()) {
                return;
            }
            this.c.publicLog2('workspaceTrustStateChanged', {
                workspaceId: this.f.getWorkspace().id,
                isTrusted: isTrusted
            });
            if (isTrusted) {
                const getDepth = (folder) => {
                    let resolvedPath = (0, path_1.$0d)(folder);
                    let depth = 0;
                    while ((0, path_1.$_d)(resolvedPath) !== resolvedPath && depth < 100) {
                        resolvedPath = (0, path_1.$_d)(resolvedPath);
                        depth++;
                    }
                    return depth;
                };
                for (const folder of this.f.getWorkspace().folders) {
                    const { trusted, uri } = await this.h.getUriTrustInfo(folder.uri);
                    if (!trusted) {
                        continue;
                    }
                    const workspaceFolderDepth = getDepth(folder.uri.fsPath);
                    const trustedFolderDepth = getDepth(uri.fsPath);
                    const delta = workspaceFolderDepth - trustedFolderDepth;
                    this.c.publicLog2('workspaceFolderDepthBelowTrustedFolder', { workspaceFolderDepth, trustedFolderDepth, delta });
                }
            }
        }
    };
    WorkspaceTrustTelemetryContribution = __decorate([
        __param(0, environmentService_1.$hJ),
        __param(1, telemetry_1.$9k),
        __param(2, workspace_1.$Kh),
        __param(3, workspaceTrust_1.$0z),
        __param(4, workspaceTrust_1.$$z)
    ], WorkspaceTrustTelemetryContribution);
    platform_1.$8m.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(WorkspaceTrustTelemetryContribution, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=workspace.contribution.js.map