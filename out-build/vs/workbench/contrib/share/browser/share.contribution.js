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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/codicons", "vs/base/common/htmlContent", "vs/nls!vs/workbench/contrib/share/browser/share.contribution", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/workbench/common/editor", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/extensions", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/registry/common/platform", "vs/platform/workspace/common/workspace", "vs/workbench/common/contextkeys", "vs/workbench/common/contributions", "vs/workbench/contrib/share/browser/shareService", "vs/workbench/contrib/share/common/share", "vs/workbench/services/editor/common/editorService", "vs/platform/progress/common/progress", "vs/editor/browser/services/codeEditorService", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/common/configuration", "vs/base/common/lifecycle", "vs/css!./share"], function (require, exports, cancellation_1, codicons_1, htmlContent_1, nls_1, actions_1, clipboardService_1, configuration_1, contextkey_1, editor_1, dialogs_1, extensions_1, notification_1, opener_1, platform_1, workspace_1, contextkeys_1, contributions_1, shareService_1, share_1, editorService_1, progress_1, codeEditorService_1, configurationRegistry_1, configuration_2, lifecycle_1) {
    "use strict";
    var ShareWorkbenchContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    const targetMenus = [
        actions_1.$Ru.EditorContextShare,
        actions_1.$Ru.SCMResourceContextShare,
        actions_1.$Ru.OpenEditorsContextShare,
        actions_1.$Ru.EditorTitleContextShare,
        actions_1.$Ru.MenubarShare,
        // MenuId.EditorLineNumberContext, // todo@joyceerhl add share
        actions_1.$Ru.ExplorerContextShare
    ];
    let ShareWorkbenchContribution = class ShareWorkbenchContribution {
        static { ShareWorkbenchContribution_1 = this; }
        static { this.a = 'workbench.experimental.share.enabled'; }
        constructor(c, d) {
            this.c = c;
            this.d = d;
            if (this.d.getValue(ShareWorkbenchContribution_1.a)) {
                this.f();
            }
            this.d.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(ShareWorkbenchContribution_1.a)) {
                    const settingValue = this.d.getValue(ShareWorkbenchContribution_1.a);
                    if (settingValue === true && this.b === undefined) {
                        this.f();
                    }
                    else if (settingValue === false && this.b !== undefined) {
                        this.b?.clear();
                        this.b = undefined;
                    }
                }
            });
        }
        f() {
            if (!this.b) {
                this.b = new lifecycle_1.$jc();
            }
            this.b.add((0, actions_1.$Xu)(class ShareAction extends actions_1.$Wu {
                static { this.ID = 'workbench.action.share'; }
                static { this.LABEL = (0, nls_1.localize)(0, null); }
                constructor() {
                    super({
                        id: ShareAction.ID,
                        title: { value: ShareAction.LABEL, original: 'Share...' },
                        f1: true,
                        icon: codicons_1.$Pj.linkExternal,
                        precondition: contextkey_1.$Ii.and(shareService_1.$U1b.notEqualsTo(0), contextkeys_1.$Qcb.notEqualsTo(0)),
                        keybinding: {
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            primary: 512 /* KeyMod.Alt */ | 2048 /* KeyMod.CtrlCmd */ | 49 /* KeyCode.KeyS */,
                        },
                        menu: [
                            { id: actions_1.$Ru.CommandCenter, order: 1000 }
                        ]
                    });
                }
                async run(accessor, ...args) {
                    const shareService = accessor.get(share_1.$jtb);
                    const activeEditor = accessor.get(editorService_1.$9C)?.activeEditor;
                    const resourceUri = (activeEditor && editor_1.$3E.getOriginalUri(activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY }))
                        ?? accessor.get(workspace_1.$Kh).getWorkspace().folders[0].uri;
                    const clipboardService = accessor.get(clipboardService_1.$UZ);
                    const dialogService = accessor.get(dialogs_1.$oA);
                    const urlService = accessor.get(opener_1.$NT);
                    const progressService = accessor.get(progress_1.$2u);
                    const selection = accessor.get(codeEditorService_1.$nV).getActiveCodeEditor()?.getSelection() ?? undefined;
                    const result = await progressService.withProgress({
                        location: 10 /* ProgressLocation.Window */,
                        detail: (0, nls_1.localize)(1, null)
                    }, async () => shareService.provideShare({ resourceUri, selection }, new cancellation_1.$pd().token));
                    if (result) {
                        const uriText = result.toString();
                        const isResultText = typeof result === 'string';
                        await clipboardService.writeText(uriText);
                        dialogService.prompt({
                            type: notification_1.Severity.Info,
                            message: isResultText ? (0, nls_1.localize)(2, null) : (0, nls_1.localize)(3, null),
                            custom: {
                                icon: codicons_1.$Pj.check,
                                markdownDetails: [{
                                        markdown: new htmlContent_1.$Xj(`<div aria-label='${uriText}'>${uriText}</div>`, { supportHtml: true }),
                                        classes: [isResultText ? 'share-dialog-input-text' : 'share-dialog-input-link']
                                    }]
                            },
                            cancelButton: (0, nls_1.localize)(4, null),
                            buttons: isResultText ? [] : [{ label: (0, nls_1.localize)(5, null), run: () => { urlService.open(result, { openExternal: true }); } }]
                        });
                    }
                }
            }));
            const actions = this.c.getShareActions();
            for (const menuId of targetMenus) {
                for (const action of actions) {
                    // todo@joyceerhl avoid duplicates
                    this.b.add(actions_1.$Tu.appendMenuItem(menuId, action));
                }
            }
        }
    };
    ShareWorkbenchContribution = ShareWorkbenchContribution_1 = __decorate([
        __param(0, share_1.$jtb),
        __param(1, configuration_1.$8h)
    ], ShareWorkbenchContribution);
    (0, extensions_1.$mr)(share_1.$jtb, shareService_1.$V1b, 1 /* InstantiationType.Delayed */);
    const workbenchContributionsRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(ShareWorkbenchContribution, 4 /* LifecyclePhase.Eventually */);
    platform_1.$8m.as(configurationRegistry_1.$an.Configuration).registerConfiguration({
        ...configuration_2.$$y,
        properties: {
            'workbench.experimental.share.enabled': {
                type: 'boolean',
                default: false,
                tags: ['experimental'],
                markdownDescription: (0, nls_1.localize)(6, null, '`#window.commandCenter#`', '`true`'),
                restricted: false,
            }
        }
    });
});
//# sourceMappingURL=share.contribution.js.map