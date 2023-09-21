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
define(["require", "exports", "vs/nls", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/product/common/productService", "vs/workbench/services/issue/common/issue", "vs/base/common/lifecycle", "vs/platform/actions/common/actions", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/extensionManagement/browser/extensionBisect", "vs/platform/notification/common/notification", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/host/browser/host", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/instantiation/common/instantiation", "vs/platform/action/common/actionCommonCategories", "vs/platform/instantiation/common/extensions", "vs/platform/contextkey/common/contextkey", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/platform/storage/common/storage", "vs/platform/opener/common/opener", "vs/base/common/uri", "vs/workbench/common/contextkeys", "vs/platform/contextkey/common/contextkeys"], function (require, exports, nls_1, extensionManagement_1, productService_1, issue_1, lifecycle_1, actions_1, userDataProfile_1, dialogs_1, extensionBisect_1, notification_1, extensionManagement_2, host_1, userDataProfile_2, instantiation_1, actionCommonCategories_1, extensions_1, contextkey_1, platform_1, contributions_1, storage_1, opener_1, uri_1, contextkeys_1, contextkeys_2) {
    "use strict";
    var TroubleshootIssueService_1, IssueTroubleshootUi_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    const ITroubleshootIssueService = (0, instantiation_1.createDecorator)('ITroubleshootIssueService');
    var TroubleshootStage;
    (function (TroubleshootStage) {
        TroubleshootStage[TroubleshootStage["EXTENSIONS"] = 1] = "EXTENSIONS";
        TroubleshootStage[TroubleshootStage["WORKBENCH"] = 2] = "WORKBENCH";
    })(TroubleshootStage || (TroubleshootStage = {}));
    class TroubleShootState {
        static fromJSON(raw) {
            if (!raw) {
                return undefined;
            }
            try {
                const data = JSON.parse(raw);
                if ((data.stage === TroubleshootStage.EXTENSIONS || data.stage === TroubleshootStage.WORKBENCH)
                    && typeof data.profile === 'string') {
                    return new TroubleShootState(data.stage, data.profile);
                }
            }
            catch { /* ignore */ }
            return undefined;
        }
        constructor(stage, profile) {
            this.stage = stage;
            this.profile = profile;
        }
    }
    let TroubleshootIssueService = class TroubleshootIssueService extends lifecycle_1.Disposable {
        static { TroubleshootIssueService_1 = this; }
        static { this.storageKey = 'issueTroubleshootState'; }
        constructor(userDataProfileService, userDataProfilesService, userDataProfileManagementService, userDataProfileImportExportService, dialogService, extensionBisectService, notificationService, extensionManagementService, extensionEnablementService, issueService, productService, hostService, storageService, openerService) {
            super();
            this.userDataProfileService = userDataProfileService;
            this.userDataProfilesService = userDataProfilesService;
            this.userDataProfileManagementService = userDataProfileManagementService;
            this.userDataProfileImportExportService = userDataProfileImportExportService;
            this.dialogService = dialogService;
            this.extensionBisectService = extensionBisectService;
            this.notificationService = notificationService;
            this.extensionManagementService = extensionManagementService;
            this.extensionEnablementService = extensionEnablementService;
            this.issueService = issueService;
            this.productService = productService;
            this.hostService = hostService;
            this.storageService = storageService;
            this.openerService = openerService;
        }
        isActive() {
            return this.state !== undefined;
        }
        async start() {
            if (this.isActive()) {
                throw new Error('invalid state');
            }
            const res = await this.dialogService.confirm({
                message: (0, nls_1.localize)('troubleshoot issue', "Troubleshoot Issue"),
                detail: (0, nls_1.localize)('detail.start', "Issue troubleshooting is a process to help you identify the cause for an issue. The cause for an issue can be a misconfiguration, due to an extension, or be {0} itself.\n\nDuring the process the window reloads repeatedly. Each time you must confirm if you are still seeing the issue.", this.productService.nameLong),
                primaryButton: (0, nls_1.localize)({ key: 'msg', comment: ['&& denotes a mnemonic'] }, "&&Troubleshoot Issue"),
                custom: true
            });
            if (!res.confirmed) {
                return;
            }
            const originalProfile = this.userDataProfileService.currentProfile;
            await this.userDataProfileImportExportService.createTroubleshootProfile();
            this.state = new TroubleShootState(TroubleshootStage.EXTENSIONS, originalProfile.id);
            await this.resume();
        }
        async resume() {
            if (!this.isActive()) {
                return;
            }
            if (this.state?.stage === TroubleshootStage.EXTENSIONS && !this.extensionBisectService.isActive) {
                await this.reproduceIssueWithExtensionsDisabled();
            }
            if (this.state?.stage === TroubleshootStage.WORKBENCH) {
                await this.reproduceIssueWithEmptyProfile();
            }
            await this.stop();
        }
        async stop() {
            if (!this.isActive()) {
                return;
            }
            if (this.notificationHandle) {
                this.notificationHandle.close();
                this.notificationHandle = undefined;
            }
            if (this.extensionBisectService.isActive) {
                await this.extensionBisectService.reset();
            }
            const profile = this.userDataProfilesService.profiles.find(p => p.id === this.state?.profile) ?? this.userDataProfilesService.defaultProfile;
            this.state = undefined;
            await this.userDataProfileManagementService.switchProfile(profile);
        }
        async reproduceIssueWithExtensionsDisabled() {
            if (!(await this.extensionManagementService.getInstalled(1 /* ExtensionType.User */)).length) {
                this.state = new TroubleShootState(TroubleshootStage.WORKBENCH, this.state.profile);
                return;
            }
            const result = await this.askToReproduceIssue((0, nls_1.localize)('profile.extensions.disabled', "Issue troubleshooting is active and has temporarily disabled all installed extensions. Check if you can still reproduce the problem and proceed by selecting from these options."));
            if (result === 'good') {
                const profile = this.userDataProfilesService.profiles.find(p => p.id === this.state.profile) ?? this.userDataProfilesService.defaultProfile;
                await this.reproduceIssueWithExtensionsBisect(profile);
            }
            if (result === 'bad') {
                this.state = new TroubleShootState(TroubleshootStage.WORKBENCH, this.state.profile);
            }
            if (result === 'stop') {
                await this.stop();
            }
        }
        async reproduceIssueWithEmptyProfile() {
            await this.userDataProfileManagementService.createAndEnterTransientProfile();
            this.updateState(this.state);
            const result = await this.askToReproduceIssue((0, nls_1.localize)('empty.profile', "Issue troubleshooting is active and has temporarily reset your configurations to defaults. Check if you can still reproduce the problem and proceed by selecting from these options."));
            if (result === 'stop') {
                await this.stop();
            }
            if (result === 'good') {
                await this.askToReportIssue((0, nls_1.localize)('issue is with configuration', "Issue troubleshooting has identified that the issue is caused by your configurations. Please report the issue by exporting your configurations using \"Export Profile\" command and share the file in the issue report."));
            }
            if (result === 'bad') {
                await this.askToReportIssue((0, nls_1.localize)('issue is in core', "Issue troubleshooting has identified that the issue is with {0}.", this.productService.nameLong));
            }
        }
        async reproduceIssueWithExtensionsBisect(profile) {
            await this.userDataProfileManagementService.switchProfile(profile);
            const extensions = (await this.extensionManagementService.getInstalled(1 /* ExtensionType.User */)).filter(ext => this.extensionEnablementService.isEnabled(ext));
            await this.extensionBisectService.start(extensions);
            await this.hostService.reload();
        }
        askToReproduceIssue(message) {
            return new Promise((c, e) => {
                const goodPrompt = {
                    label: (0, nls_1.localize)('I cannot reproduce', "I Can't Reproduce"),
                    run: () => c('good')
                };
                const badPrompt = {
                    label: (0, nls_1.localize)('This is Bad', "I Can Reproduce"),
                    run: () => c('bad')
                };
                const stop = {
                    label: (0, nls_1.localize)('Stop', "Stop"),
                    run: () => c('stop')
                };
                this.notificationHandle = this.notificationService.prompt(notification_1.Severity.Info, message, [goodPrompt, badPrompt, stop], { sticky: true, priority: notification_1.NotificationPriority.URGENT });
            });
        }
        async askToReportIssue(message) {
            let isCheckedInInsiders = false;
            if (this.productService.quality === 'stable') {
                const res = await this.askToReproduceIssueWithInsiders();
                if (res === 'good') {
                    await this.dialogService.prompt({
                        type: notification_1.Severity.Info,
                        message: (0, nls_1.localize)('troubleshoot issue', "Troubleshoot Issue"),
                        detail: (0, nls_1.localize)('use insiders', "This likely means that the issue has been addressed already and will be available in an upcoming release. You can safely use {0} insiders until the new stable version is available.", this.productService.nameLong),
                        custom: true
                    });
                    return;
                }
                if (res === 'stop') {
                    await this.stop();
                    return;
                }
                if (res === 'bad') {
                    isCheckedInInsiders = true;
                }
            }
            await this.issueService.openReporter({
                issueBody: `> ${message} ${isCheckedInInsiders ? `It is confirmed that the issue exists in ${this.productService.nameLong} Insiders` : ''}`,
            });
        }
        async askToReproduceIssueWithInsiders() {
            const confirmRes = await this.dialogService.confirm({
                type: 'info',
                message: (0, nls_1.localize)('troubleshoot issue', "Troubleshoot Issue"),
                primaryButton: (0, nls_1.localize)('download insiders', "Download {0} Insiders", this.productService.nameLong),
                cancelButton: (0, nls_1.localize)('report anyway', "Report Issue Anyway"),
                detail: (0, nls_1.localize)('ask to download insiders', "Please try to download and reproduce the issue in {0} insiders.", this.productService.nameLong),
                custom: {
                    disableCloseAction: true,
                }
            });
            if (!confirmRes.confirmed) {
                return undefined;
            }
            const opened = await this.openerService.open(uri_1.URI.parse('https://aka.ms/vscode-insiders'));
            if (!opened) {
                return undefined;
            }
            const res = await this.dialogService.prompt({
                type: 'info',
                message: (0, nls_1.localize)('troubleshoot issue', "Troubleshoot Issue"),
                buttons: [{
                        label: (0, nls_1.localize)('good', "I can't reproduce"),
                        run: () => 'good'
                    }, {
                        label: (0, nls_1.localize)('bad', "I can reproduce"),
                        run: () => 'bad'
                    }],
                cancelButton: {
                    label: (0, nls_1.localize)('stop', "Stop"),
                    run: () => 'stop'
                },
                detail: (0, nls_1.localize)('ask to reproduce issue', "Please try to reproduce the issue in {0} insiders and confirm if the issue exists there.", this.productService.nameLong),
                custom: {
                    disableCloseAction: true,
                }
            });
            return res.result;
        }
        get state() {
            if (this._state === undefined) {
                const raw = this.storageService.get(TroubleshootIssueService_1.storageKey, 0 /* StorageScope.PROFILE */);
                this._state = TroubleShootState.fromJSON(raw);
            }
            return this._state || undefined;
        }
        set state(state) {
            this._state = state ?? null;
            this.updateState(state);
        }
        updateState(state) {
            if (state) {
                this.storageService.store(TroubleshootIssueService_1.storageKey, JSON.stringify(state), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.storageService.remove(TroubleshootIssueService_1.storageKey, 0 /* StorageScope.PROFILE */);
            }
        }
    };
    TroubleshootIssueService = TroubleshootIssueService_1 = __decorate([
        __param(0, userDataProfile_1.IUserDataProfileService),
        __param(1, userDataProfile_2.IUserDataProfilesService),
        __param(2, userDataProfile_1.IUserDataProfileManagementService),
        __param(3, userDataProfile_1.IUserDataProfileImportExportService),
        __param(4, dialogs_1.IDialogService),
        __param(5, extensionBisect_1.IExtensionBisectService),
        __param(6, notification_1.INotificationService),
        __param(7, extensionManagement_1.IExtensionManagementService),
        __param(8, extensionManagement_2.IWorkbenchExtensionEnablementService),
        __param(9, issue_1.IWorkbenchIssueService),
        __param(10, productService_1.IProductService),
        __param(11, host_1.IHostService),
        __param(12, storage_1.IStorageService),
        __param(13, opener_1.IOpenerService)
    ], TroubleshootIssueService);
    let IssueTroubleshootUi = class IssueTroubleshootUi extends lifecycle_1.Disposable {
        static { IssueTroubleshootUi_1 = this; }
        static { this.ctxIsTroubleshootActive = new contextkey_1.RawContextKey('isIssueTroubleshootActive', false); }
        constructor(contextKeyService, troubleshootIssueService, storageService) {
            super();
            this.contextKeyService = contextKeyService;
            this.troubleshootIssueService = troubleshootIssueService;
            this.updateContext();
            if (troubleshootIssueService.isActive()) {
                troubleshootIssueService.resume();
            }
            this._register(storageService.onDidChangeValue(0 /* StorageScope.PROFILE */, TroubleshootIssueService.storageKey, this._register(new lifecycle_1.DisposableStore()))(() => {
                this.updateContext();
            }));
        }
        updateContext() {
            IssueTroubleshootUi_1.ctxIsTroubleshootActive.bindTo(this.contextKeyService).set(this.troubleshootIssueService.isActive());
        }
    };
    IssueTroubleshootUi = IssueTroubleshootUi_1 = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, ITroubleshootIssueService),
        __param(2, storage_1.IStorageService)
    ], IssueTroubleshootUi);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(IssueTroubleshootUi, 3 /* LifecyclePhase.Restored */);
    (0, actions_1.registerAction2)(class TroubleshootIssueAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.troubleshootIssue.start',
                title: { value: (0, nls_1.localize)('troubleshootIssue', "Troubleshoot Issue..."), original: 'Troubleshoot Issue...' },
                category: actionCommonCategories_1.Categories.Help,
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.and(IssueTroubleshootUi.ctxIsTroubleshootActive.negate(), contextkeys_1.RemoteNameContext.isEqualTo(''), contextkeys_2.IsWebContext.negate()),
            });
        }
        run(accessor) {
            return accessor.get(ITroubleshootIssueService).start();
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.troubleshootIssue.stop',
                title: { value: (0, nls_1.localize)('title.stop', "Stop Troubleshoot Issue"), original: 'Stop Troubleshoot Issue' },
                category: actionCommonCategories_1.Categories.Help,
                f1: true,
                precondition: IssueTroubleshootUi.ctxIsTroubleshootActive
            });
        }
        async run(accessor) {
            return accessor.get(ITroubleshootIssueService).stop();
        }
    });
    (0, extensions_1.registerSingleton)(ITroubleshootIssueService, TroubleshootIssueService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNzdWVUcm91Ymxlc2hvb3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvaXNzdWUvYnJvd3Nlci9pc3N1ZVRyb3VibGVzaG9vdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUE2QmhHLE1BQU0seUJBQXlCLEdBQUcsSUFBQSwrQkFBZSxFQUE0QiwyQkFBMkIsQ0FBQyxDQUFDO0lBVTFHLElBQUssaUJBR0o7SUFIRCxXQUFLLGlCQUFpQjtRQUNyQixxRUFBYyxDQUFBO1FBQ2QsbUVBQVMsQ0FBQTtJQUNWLENBQUMsRUFISSxpQkFBaUIsS0FBakIsaUJBQWlCLFFBR3JCO0lBSUQsTUFBTSxpQkFBaUI7UUFFdEIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUF1QjtZQUN0QyxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUNULE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1lBQ0QsSUFBSTtnQkFFSCxNQUFNLElBQUksR0FBUSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNsQyxJQUNDLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxpQkFBaUIsQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxpQkFBaUIsQ0FBQyxTQUFTLENBQUM7dUJBQ3hGLE9BQU8sSUFBSSxDQUFDLE9BQU8sS0FBSyxRQUFRLEVBQ2xDO29CQUNELE9BQU8sSUFBSSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztpQkFDdkQ7YUFDRDtZQUFDLE1BQU0sRUFBRSxZQUFZLEVBQUU7WUFDeEIsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUVELFlBQ1UsS0FBd0IsRUFDeEIsT0FBZTtZQURmLFVBQUssR0FBTCxLQUFLLENBQW1CO1lBQ3hCLFlBQU8sR0FBUCxP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