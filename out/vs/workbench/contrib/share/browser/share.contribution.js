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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/codicons", "vs/base/common/htmlContent", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/workbench/common/editor", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/extensions", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/registry/common/platform", "vs/platform/workspace/common/workspace", "vs/workbench/common/contextkeys", "vs/workbench/common/contributions", "vs/workbench/contrib/share/browser/shareService", "vs/workbench/contrib/share/common/share", "vs/workbench/services/editor/common/editorService", "vs/platform/progress/common/progress", "vs/editor/browser/services/codeEditorService", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/common/configuration", "vs/base/common/lifecycle", "vs/css!./share"], function (require, exports, cancellation_1, codicons_1, htmlContent_1, nls_1, actions_1, clipboardService_1, configuration_1, contextkey_1, editor_1, dialogs_1, extensions_1, notification_1, opener_1, platform_1, workspace_1, contextkeys_1, contributions_1, shareService_1, share_1, editorService_1, progress_1, codeEditorService_1, configurationRegistry_1, configuration_2, lifecycle_1) {
    "use strict";
    var ShareWorkbenchContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    const targetMenus = [
        actions_1.MenuId.EditorContextShare,
        actions_1.MenuId.SCMResourceContextShare,
        actions_1.MenuId.OpenEditorsContextShare,
        actions_1.MenuId.EditorTitleContextShare,
        actions_1.MenuId.MenubarShare,
        // MenuId.EditorLineNumberContext, // todo@joyceerhl add share
        actions_1.MenuId.ExplorerContextShare
    ];
    let ShareWorkbenchContribution = class ShareWorkbenchContribution {
        static { ShareWorkbenchContribution_1 = this; }
        static { this.SHARE_ENABLED_SETTING = 'workbench.experimental.share.enabled'; }
        constructor(shareService, configurationService) {
            this.shareService = shareService;
            this.configurationService = configurationService;
            if (this.configurationService.getValue(ShareWorkbenchContribution_1.SHARE_ENABLED_SETTING)) {
                this.registerActions();
            }
            this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(ShareWorkbenchContribution_1.SHARE_ENABLED_SETTING)) {
                    const settingValue = this.configurationService.getValue(ShareWorkbenchContribution_1.SHARE_ENABLED_SETTING);
                    if (settingValue === true && this._disposables === undefined) {
                        this.registerActions();
                    }
                    else if (settingValue === false && this._disposables !== undefined) {
                        this._disposables?.clear();
                        this._disposables = undefined;
                    }
                }
            });
        }
        registerActions() {
            if (!this._disposables) {
                this._disposables = new lifecycle_1.DisposableStore();
            }
            this._disposables.add((0, actions_1.registerAction2)(class ShareAction extends actions_1.Action2 {
                static { this.ID = 'workbench.action.share'; }
                static { this.LABEL = (0, nls_1.localize)('share', 'Share...'); }
                constructor() {
                    super({
                        id: ShareAction.ID,
                        title: { value: ShareAction.LABEL, original: 'Share...' },
                        f1: true,
                        icon: codicons_1.Codicon.linkExternal,
                        precondition: contextkey_1.ContextKeyExpr.and(shareService_1.ShareProviderCountContext.notEqualsTo(0), contextkeys_1.WorkspaceFolderCountContext.notEqualsTo(0)),
                        keybinding: {
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            primary: 512 /* KeyMod.Alt */ | 2048 /* KeyMod.CtrlCmd */ | 49 /* KeyCode.KeyS */,
                        },
                        menu: [
                            { id: actions_1.MenuId.CommandCenter, order: 1000 }
                        ]
                    });
                }
                async run(accessor, ...args) {
                    const shareService = accessor.get(share_1.IShareService);
                    const activeEditor = accessor.get(editorService_1.IEditorService)?.activeEditor;
                    const resourceUri = (activeEditor && editor_1.EditorResourceAccessor.getOriginalUri(activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY }))
                        ?? accessor.get(workspace_1.IWorkspaceContextService).getWorkspace().folders[0].uri;
                    const clipboardService = accessor.get(clipboardService_1.IClipboardService);
                    const dialogService = accessor.get(dialogs_1.IDialogService);
                    const urlService = accessor.get(opener_1.IOpenerService);
                    const progressService = accessor.get(progress_1.IProgressService);
                    const selection = accessor.get(codeEditorService_1.ICodeEditorService).getActiveCodeEditor()?.getSelection() ?? undefined;
                    const result = await progressService.withProgress({
                        location: 10 /* ProgressLocation.Window */,
                        detail: (0, nls_1.localize)('generating link', 'Generating link...')
                    }, async () => shareService.provideShare({ resourceUri, selection }, new cancellation_1.CancellationTokenSource().token));
                    if (result) {
                        const uriText = result.toString();
                        const isResultText = typeof result === 'string';
                        await clipboardService.writeText(uriText);
                        dialogService.prompt({
                            type: notification_1.Severity.Info,
                            message: isResultText ? (0, nls_1.localize)('shareTextSuccess', 'Copied text to clipboard!') : (0, nls_1.localize)('shareSuccess', 'Copied link to clipboard!'),
                            custom: {
                                icon: codicons_1.Codicon.check,
                                markdownDetails: [{
                                        markdown: new htmlContent_1.MarkdownString(`<div aria-label='${uriText}'>${uriText}</div>`, { supportHtml: true }),
                                        classes: [isResultText ? 'share-dialog-input-text' : 'share-dialog-input-link']
                                    }]
                            },
                            cancelButton: (0, nls_1.localize)('close', 'Close'),
                            buttons: isResultText ? [] : [{ label: (0, nls_1.localize)('open link', 'Open Link'), run: () => { urlService.open(result, { openExternal: true }); } }]
                        });
                    }
                }
            }));
            const actions = this.shareService.getShareActions();
            for (const menuId of targetMenus) {
                for (const action of actions) {
                    // todo@joyceerhl avoid duplicates
                    this._disposables.add(actions_1.MenuRegistry.appendMenuItem(menuId, action));
                }
            }
        }
    };
    ShareWorkbenchContribution = ShareWorkbenchContribution_1 = __decorate([
        __param(0, share_1.IShareService),
        __param(1, configuration_1.IConfigurationService)
    ], ShareWorkbenchContribution);
    (0, extensions_1.registerSingleton)(share_1.IShareService, shareService_1.ShareService, 1 /* InstantiationType.Delayed */);
    const workbenchContributionsRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(ShareWorkbenchContribution, 4 /* LifecyclePhase.Eventually */);
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        ...configuration_2.workbenchConfigurationNodeBase,
        properties: {
            'workbench.experimental.share.enabled': {
                type: 'boolean',
                default: false,
                tags: ['experimental'],
                markdownDescription: (0, nls_1.localize)('experimental.share.enabled', "Controls whether to render the Share action next to the command center when {0} is {1}.", '`#window.commandCenter#`', '`true`'),
                restricted: false,
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmUuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc2hhcmUvYnJvd3Nlci9zaGFyZS5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBaUNoRyxNQUFNLFdBQVcsR0FBRztRQUNuQixnQkFBTSxDQUFDLGtCQUFrQjtRQUN6QixnQkFBTSxDQUFDLHVCQUF1QjtRQUM5QixnQkFBTSxDQUFDLHVCQUF1QjtRQUM5QixnQkFBTSxDQUFDLHVCQUF1QjtRQUM5QixnQkFBTSxDQUFDLFlBQVk7UUFDbkIsOERBQThEO1FBQzlELGdCQUFNLENBQUMsb0JBQW9CO0tBQzNCLENBQUM7SUFFRixJQUFNLDBCQUEwQixHQUFoQyxNQUFNLDBCQUEwQjs7aUJBQ2hCLDBCQUFxQixHQUFHLHNDQUFzQyxBQUF6QyxDQUEwQztRQUk5RSxZQUNpQyxZQUEyQixFQUNuQixvQkFBMkM7WUFEbkQsaUJBQVksR0FBWixZQUFZLENBQWU7WUFDbkIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUVuRixJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQVUsNEJBQTBCLENBQUMscUJBQXFCLENBQUMsRUFBRTtnQkFDbEcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO2FBQ3ZCO1lBQ0QsSUFBSSxDQUFDLG9CQUFvQixDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUN0RCxJQUFJLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyw0QkFBMEIsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFO29CQUM3RSxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFVLDRCQUEwQixDQUFDLHFCQUFxQixDQUFDLENBQUM7b0JBQ25ILElBQUksWUFBWSxLQUFLLElBQUks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