/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "./dirtydiffDecorator", "vs/workbench/contrib/scm/common/scm", "vs/platform/actions/common/actions", "./activity", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/commands/common/commands", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/scm/common/scmService", "vs/workbench/common/views", "vs/workbench/contrib/scm/browser/scmViewPaneContainer", "vs/platform/instantiation/common/descriptors", "vs/editor/common/languages/modesRegistry", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/workbench/contrib/scm/browser/scmViewPane", "vs/workbench/contrib/scm/browser/scmViewService", "vs/workbench/contrib/scm/browser/scmRepositoriesViewPane", "vs/editor/contrib/suggest/browser/suggest", "vs/workbench/contrib/workspace/common/workspace", "vs/workbench/contrib/scm/common/quickDiff", "vs/workbench/contrib/scm/common/quickDiffService", "vs/workbench/contrib/scm/browser/scmSyncViewPane"], function (require, exports, nls_1, platform_1, contributions_1, dirtydiffDecorator_1, scm_1, actions_1, activity_1, configurationRegistry_1, contextkey_1, commands_1, keybindingsRegistry_1, extensions_1, scmService_1, views_1, scmViewPaneContainer_1, descriptors_1, modesRegistry_1, codicons_1, iconRegistry_1, scmViewPane_1, scmViewService_1, scmRepositoriesViewPane_1, suggest_1, workspace_1, quickDiff_1, quickDiffService_1, scmSyncViewPane_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    modesRegistry_1.ModesRegistry.registerLanguage({
        id: 'scminput',
        extensions: [],
        aliases: [],
        mimetypes: ['text/x-scm-input']
    });
    platform_1.Registry.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(dirtydiffDecorator_1.DirtyDiffWorkbenchController, 3 /* LifecyclePhase.Restored */);
    const sourceControlViewIcon = (0, iconRegistry_1.registerIcon)('source-control-view-icon', codicons_1.Codicon.sourceControl, (0, nls_1.localize)('sourceControlViewIcon', 'View icon of the Source Control view.'));
    const viewContainer = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: scm_1.VIEWLET_ID,
        title: { value: (0, nls_1.localize)('source control', "Source Control"), original: 'Source Control' },
        ctorDescriptor: new descriptors_1.SyncDescriptor(scmViewPaneContainer_1.SCMViewPaneContainer),
        storageId: 'workbench.scm.views.state',
        icon: sourceControlViewIcon,
        alwaysUseContainerInfo: true,
        order: 2,
        hideIfEmpty: true,
    }, 0 /* ViewContainerLocation.Sidebar */, { doNotRegisterOpenCommand: true });
    const viewsRegistry = platform_1.Registry.as(views_1.Extensions.ViewsRegistry);
    viewsRegistry.registerViewWelcomeContent(scm_1.VIEW_PANE_ID, {
        content: (0, nls_1.localize)('no open repo', "No source control providers registered."),
        when: 'default'
    });
    viewsRegistry.registerViewWelcomeContent(scm_1.VIEW_PANE_ID, {
        content: (0, nls_1.localize)('no open repo in an untrusted workspace', "None of the registered source control providers work in Restricted Mode."),
        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('scm.providerCount', 0), workspace_1.WorkspaceTrustContext.IsEnabled, workspace_1.WorkspaceTrustContext.IsTrusted.toNegated())
    });
    viewsRegistry.registerViewWelcomeContent(scm_1.VIEW_PANE_ID, {
        content: `[${(0, nls_1.localize)('manageWorkspaceTrustAction', "Manage Workspace Trust")}](command:${workspace_1.MANAGE_TRUST_COMMAND_ID})`,
        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('scm.providerCount', 0), workspace_1.WorkspaceTrustContext.IsEnabled, workspace_1.WorkspaceTrustContext.IsTrusted.toNegated())
    });
    viewsRegistry.registerViews([{
            id: scm_1.VIEW_PANE_ID,
            name: (0, nls_1.localize)('source control', "Source Control"),
            ctorDescriptor: new descriptors_1.SyncDescriptor(scmViewPane_1.SCMViewPane),
            canToggleVisibility: true,
            canMoveView: true,
            weight: 60,
            order: -999,
            containerIcon: sourceControlViewIcon,
            openCommandActionDescriptor: {
                id: viewContainer.id,
                mnemonicTitle: (0, nls_1.localize)({ key: 'miViewSCM', comment: ['&& denotes a mnemonic'] }, "Source &&Control"),
                keybindings: {
                    primary: 0,
                    win: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 37 /* KeyCode.KeyG */ },
                    linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 37 /* KeyCode.KeyG */ },
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 37 /* KeyCode.KeyG */ },
                },
                order: 2,
            }
        }], viewContainer);
    viewsRegistry.registerViews([{
            id: scm_1.REPOSITORIES_VIEW_PANE_ID,
            name: (0, nls_1.localize)('source control repositories', "Source Control Repositories"),
            ctorDescriptor: new descriptors_1.SyncDescriptor(scmRepositoriesViewPane_1.SCMRepositoriesViewPane),
            canToggleVisibility: true,
            hideByDefault: true,
            canMoveView: true,
            weight: 20,
            order: -1000,
            when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('scm.providerCount'), contextkey_1.ContextKeyExpr.notEquals('scm.providerCount', 0)),
            // readonly when = ContextKeyExpr.or(ContextKeyExpr.equals('config.scm.alwaysShowProviders', true), ContextKeyExpr.and(ContextKeyExpr.notEquals('scm.providerCount', 0), ContextKeyExpr.notEquals('scm.providerCount', 1)));
            containerIcon: sourceControlViewIcon
        }], viewContainer);
    viewsRegistry.registerViews([{
            id: scm_1.SYNC_VIEW_PANE_ID,
            name: (0, nls_1.localize)('source control sync', "Source Control Sync"),
            ctorDescriptor: new descriptors_1.SyncDescriptor(scmSyncViewPane_1.SCMSyncViewPane),
            canToggleVisibility: true,
            canMoveView: true,
            weight: 20,
            order: -998,
            when: contextkey_1.ContextKeyExpr.equals('config.scm.experimental.showSyncView', true),
        }], viewContainer);
    platform_1.Registry.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(activity_1.SCMActiveResourceContextKeyController, 3 /* LifecyclePhase.Restored */);
    platform_1.Registry.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(activity_1.SCMStatusController, 3 /* LifecyclePhase.Restored */);
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        id: 'scm',
        order: 5,
        title: (0, nls_1.localize)('scmConfigurationTitle', "Source Control"),
        type: 'object',
        scope: 4 /* ConfigurationScope.RESOURCE */,
        properties: {
            'scm.diffDecorations': {
                type: 'string',
                enum: ['all', 'gutter', 'overview', 'minimap', 'none'],
                enumDescriptions: [
                    (0, nls_1.localize)('scm.diffDecorations.all', "Show the diff decorations in all available locations."),
                    (0, nls_1.localize)('scm.diffDecorations.gutter', "Show the diff decorations only in the editor gutter."),
                    (0, nls_1.localize)('scm.diffDecorations.overviewRuler', "Show the diff decorations only in the overview ruler."),
                    (0, nls_1.localize)('scm.diffDecorations.minimap', "Show the diff decorations only in the minimap."),
                    (0, nls_1.localize)('scm.diffDecorations.none', "Do not show the diff decorations.")
                ],
                default: 'all',
                description: (0, nls_1.localize)('diffDecorations', "Controls diff decorations in the editor.")
            },
            'scm.diffDecorationsGutterWidth': {
                type: 'number',
                enum: [1, 2, 3, 4, 5],
                default: 3,
                description: (0, nls_1.localize)('diffGutterWidth', "Controls the width(px) of diff decorations in gutter (added & modified).")
            },
            'scm.diffDecorationsGutterVisibility': {
                type: 'string',
                enum: ['always', 'hover'],
                enumDescriptions: [
                    (0, nls_1.localize)('scm.diffDecorationsGutterVisibility.always', "Show the diff decorator in the gutter at all times."),
                    (0, nls_1.localize)('scm.diffDecorationsGutterVisibility.hover', "Show the diff decorator in the gutter only on hover.")
                ],
                description: (0, nls_1.localize)('scm.diffDecorationsGutterVisibility', "Controls the visibility of the Source Control diff decorator in the gutter."),
                default: 'always'
            },
            'scm.diffDecorationsGutterAction': {
                type: 'string',
                enum: ['diff', 'none'],
                enumDescriptions: [
                    (0, nls_1.localize)('scm.diffDecorationsGutterAction.diff', "Show the inline diff Peek view on click."),
                    (0, nls_1.localize)('scm.diffDecorationsGutterAction.none', "Do nothing.")
                ],
                description: (0, nls_1.localize)('scm.diffDecorationsGutterAction', "Controls the behavior of Source Control diff gutter decorations."),
                default: 'diff'
            },
            'scm.diffDecorationsGutterPattern': {
                type: 'object',
                description: (0, nls_1.localize)('diffGutterPattern', "Controls whether a pattern is used for the diff decorations in gutter."),
                additionalProperties: false,
                properties: {
                    'added': {
                        type: 'boolean',
                        description: (0, nls_1.localize)('diffGutterPatternAdded', "Use pattern for the diff decorations in gutter for added lines."),
                    },
                    'modified': {
                        type: 'boolean',
                        description: (0, nls_1.localize)('diffGutterPatternModifed', "Use pattern for the diff decorations in gutter for modified lines."),
                    },
                },
                default: {
                    'added': false,
                    'modified': true
                }
            },
            'scm.diffDecorationsIgnoreTrimWhitespace': {
                type: 'string',
                enum: ['true', 'false', 'inherit'],
                enumDescriptions: [
                    (0, nls_1.localize)('scm.diffDecorationsIgnoreTrimWhitespace.true', "Ignore leading and trailing whitespace."),
                    (0, nls_1.localize)('scm.diffDecorationsIgnoreTrimWhitespace.false', "Do not ignore leading and trailing whitespace."),
                    (0, nls_1.localize)('scm.diffDecorationsIgnoreTrimWhitespace.inherit', "Inherit from `diffEditor.ignoreTrimWhitespace`.")
                ],
                description: (0, nls_1.localize)('diffDecorationsIgnoreTrimWhitespace', "Controls whether leading and trailing whitespace is ignored in Source Control diff gutter decorations."),
                default: 'false'
            },
            'scm.alwaysShowActions': {
                type: 'boolean',
                description: (0, nls_1.localize)('alwaysShowActions', "Controls whether inline actions are always visible in the Source Control view."),
                default: false
            },
            'scm.countBadge': {
                type: 'string',
                enum: ['all', 'focused', 'off'],
                enumDescriptions: [
                    (0, nls_1.localize)('scm.countBadge.all', "Show the sum of all Source Control Provider count badges."),
                    (0, nls_1.localize)('scm.countBadge.focused', "Show the count badge of the focused Source Control Provider."),
                    (0, nls_1.localize)('scm.countBadge.off', "Disable the Source Control count badge.")
                ],
                description: (0, nls_1.localize)('scm.countBadge', "Controls the count badge on the Source Control icon on the Activity Bar."),
                default: 'all'
            },
            'scm.providerCountBadge': {
                type: 'string',
                enum: ['hidden', 'auto', 'visible'],
                enumDescriptions: [
                    (0, nls_1.localize)('scm.providerCountBadge.hidden', "Hide Source Control Provider count badges."),
                    (0, nls_1.localize)('scm.providerCountBadge.auto', "Only show count badge for Source Control Provider when non-zero."),
                    (0, nls_1.localize)('scm.providerCountBadge.visible', "Show Source Control Provider count badges.")
                ],
                description: (0, nls_1.localize)('scm.providerCountBadge', "Controls the count badges on Source Control Provider headers. These headers only appear when there is more than one provider."),
                default: 'hidden'
            },
            'scm.defaultViewMode': {
                type: 'string',
                enum: ['tree', 'list'],
                enumDescriptions: [
                    (0, nls_1.localize)('scm.defaultViewMode.tree', "Show the repository changes as a tree."),
                    (0, nls_1.localize)('scm.defaultViewMode.list', "Show the repository changes as a list.")
                ],
                description: (0, nls_1.localize)('scm.defaultViewMode', "Controls the default Source Control repository view mode."),
                default: 'list'
            },
            'scm.defaultViewSortKey': {
                type: 'string',
                enum: ['name', 'path', 'status'],
                enumDescriptions: [
                    (0, nls_1.localize)('scm.defaultViewSortKey.name', "Sort the repository changes by file name."),
                    (0, nls_1.localize)('scm.defaultViewSortKey.path', "Sort the repository changes by path."),
                    (0, nls_1.localize)('scm.defaultViewSortKey.status', "Sort the repository changes by Source Control status.")
                ],
                description: (0, nls_1.localize)('scm.defaultViewSortKey', "Controls the default Source Control repository changes sort order when viewed as a list."),
                default: 'path'
            },
            'scm.autoReveal': {
                type: 'boolean',
                description: (0, nls_1.localize)('autoReveal', "Controls whether the Source Control view should automatically reveal and select files when opening them."),
                default: true
            },
            'scm.inputFontFamily': {
                type: 'string',
                markdownDescription: (0, nls_1.localize)('inputFontFamily', "Controls the font for the input message. Use `default` for the workbench user interface font family, `editor` for the `#editor.fontFamily#`'s value, or a custom font family."),
                default: 'default'
            },
            'scm.inputFontSize': {
                type: 'number',
                markdownDescription: (0, nls_1.localize)('inputFontSize', "Controls the font size for the input message in pixels."),
                default: 13
            },
            'scm.alwaysShowRepositories': {
                type: 'boolean',
                markdownDescription: (0, nls_1.localize)('alwaysShowRepository', "Controls whether repositories should always be visible in the Source Control view."),
                default: false
            },
            'scm.repositories.sortOrder': {
                type: 'string',
                enum: ['discovery time', 'name', 'path'],
                enumDescriptions: [
                    (0, nls_1.localize)('scm.repositoriesSortOrder.discoveryTime', "Repositories in the Source Control Repositories view are sorted by discovery time. Repositories in the Source Control view are sorted in the order that they were selected."),
                    (0, nls_1.localize)('scm.repositoriesSortOrder.name', "Repositories in the Source Control Repositories and Source Control views are sorted by repository name."),
                    (0, nls_1.localize)('scm.repositoriesSortOrder.path', "Repositories in the Source Control Repositories and Source Control views are sorted by repository path.")
                ],
                description: (0, nls_1.localize)('repositoriesSortOrder', "Controls the sort order of the repositories in the source control repositories view."),
                default: 'discovery time'
            },
            'scm.repositories.visible': {
                type: 'number',
                description: (0, nls_1.localize)('providersVisible', "Controls how many repositories are visible in the Source Control Repositories section. Set to 0, to be able to manually resize the view."),
                default: 10
            },
            'scm.showActionButton': {
                type: 'boolean',
                markdownDescription: (0, nls_1.localize)('showActionButton', "Controls whether an action button can be shown in the Source Control view."),
                default: true
            },
            'scm.experimental.showSyncView': {
                type: 'boolean',
                description: (0, nls_1.localize)('showSyncView', "Controls whether the Source Control Sync view is shown."),
                default: false
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'scm.acceptInput',
        description: { description: (0, nls_1.localize)('scm accept', "Source Control: Accept Input"), args: [] },
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.has('scmRepository'),
        primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
        handler: accessor => {
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
            const context = contextKeyService.getContext(document.activeElement);
            const repositoryId = context.getValue('scmRepository');
            if (!repositoryId) {
                return Promise.resolve(null);
            }
            const scmService = accessor.get(scm_1.ISCMService);
            const repository = scmService.getRepository(repositoryId);
            if (!repository?.provider.acceptInputCommand) {
                return Promise.resolve(null);
            }
            const id = repository.provider.acceptInputCommand.id;
            const args = repository.provider.acceptInputCommand.arguments;
            const commandService = accessor.get(commands_1.ICommandService);
            return commandService.executeCommand(id, ...(args || []));
        }
    });
    const viewNextCommitCommand = {
        description: { description: (0, nls_1.localize)('scm view next commit', "Source Control: View Next Commit"), args: [] },
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        handler: (accessor) => {
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
            const scmService = accessor.get(scm_1.ISCMService);
            const context = contextKeyService.getContext(document.activeElement);
            const repositoryId = context.getValue('scmRepository');
            const repository = repositoryId ? scmService.getRepository(repositoryId) : undefined;
            repository?.input.showNextHistoryValue();
        }
    };
    const viewPreviousCommitCommand = {
        description: { description: (0, nls_1.localize)('scm view previous commit', "Source Control: View Previous Commit"), args: [] },
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        handler: (accessor) => {
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
            const scmService = accessor.get(scm_1.ISCMService);
            const context = contextKeyService.getContext(document.activeElement);
            const repositoryId = context.getValue('scmRepository');
            const repository = repositoryId ? scmService.getRepository(repositoryId) : undefined;
            repository?.input.showPreviousHistoryValue();
        }
    };
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        ...viewNextCommitCommand,
        id: 'scm.viewNextCommit',
        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('scmRepository'), contextkey_1.ContextKeyExpr.has('scmInputIsInLastPosition'), suggest_1.Context.Visible.toNegated()),
        primary: 18 /* KeyCode.DownArrow */
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        ...viewPreviousCommitCommand,
        id: 'scm.viewPreviousCommit',
        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('scmRepository'), contextkey_1.ContextKeyExpr.has('scmInputIsInFirstPosition'), suggest_1.Context.Visible.toNegated()),
        primary: 16 /* KeyCode.UpArrow */
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        ...viewNextCommitCommand,
        id: 'scm.forceViewNextCommit',
        when: contextkey_1.ContextKeyExpr.has('scmRepository'),
        primary: 512 /* KeyMod.Alt */ | 18 /* KeyCode.DownArrow */
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        ...viewPreviousCommitCommand,
        id: 'scm.forceViewPreviousCommit',
        when: contextkey_1.ContextKeyExpr.has('scmRepository'),
        primary: 512 /* KeyMod.Alt */ | 16 /* KeyCode.UpArrow */
    });
    commands_1.CommandsRegistry.registerCommand('scm.openInIntegratedTerminal', async (accessor, provider) => {
        if (!provider || !provider.rootUri) {
            return;
        }
        const commandService = accessor.get(commands_1.ICommandService);
        await commandService.executeCommand('openInIntegratedTerminal', provider.rootUri);
    });
    commands_1.CommandsRegistry.registerCommand('scm.openInTerminal', async (accessor, provider) => {
        if (!provider || !provider.rootUri) {
            return;
        }
        const commandService = accessor.get(commands_1.ICommandService);
        await commandService.executeCommand('openInTerminal', provider.rootUri);
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.SCMSourceControl, {
        group: '100_end',
        command: {
            id: 'scm.openInTerminal',
            title: (0, nls_1.localize)('open in external terminal', "Open in External Terminal")
        },
        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('scmProviderHasRootUri', true), contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.equals('config.terminal.sourceControlRepositoriesKind', 'external'), contextkey_1.ContextKeyExpr.equals('config.terminal.sourceControlRepositoriesKind', 'both')))
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.SCMSourceControl, {
        group: '100_end',
        command: {
            id: 'scm.openInIntegratedTerminal',
            title: (0, nls_1.localize)('open in integrated terminal', "Open in Integrated Terminal")
        },
        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('scmProviderHasRootUri', true), contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.equals('config.terminal.sourceControlRepositoriesKind', 'integrated'), contextkey_1.ContextKeyExpr.equals('config.terminal.sourceControlRepositoriesKind', 'both')))
    });
    (0, extensions_1.registerSingleton)(scm_1.ISCMService, scmService_1.SCMService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(scm_1.ISCMViewService, scmViewService_1.SCMViewService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(quickDiff_1.IQuickDiffService, quickDiffService_1.QuickDiffService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NtLmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3NjbS9icm93c2VyL3NjbS5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFpQ2hHLDZCQUFhLENBQUMsZ0JBQWdCLENBQUM7UUFDOUIsRUFBRSxFQUFFLFVBQVU7UUFDZCxVQUFVLEVBQUUsRUFBRTtRQUNkLE9BQU8sRUFBRSxFQUFFO1FBQ1gsU0FBUyxFQUFFLENBQUMsa0JBQWtCLENBQUM7S0FDL0IsQ0FBQyxDQUFDO0lBRUgsbUJBQVEsQ0FBQyxFQUFFLENBQWtDLDBCQUFtQixDQUFDLFNBQVMsQ0FBQztTQUN6RSw2QkFBNkIsQ0FBQyxpREFBNEIsa0NBQTBCLENBQUM7SUFFdkYsTUFBTSxxQkFBcUIsR0FBRyxJQUFBLDJCQUFZLEVBQUMsMEJBQTBCLEVBQUUsa0JBQU8sQ0FBQyxhQUFhLEVBQUUsSUFBQSxjQUFRLEVBQUMsdUJBQXVCLEVBQUUsdUNBQXVDLENBQUMsQ0FBQyxDQUFDO0lBRTFLLE1BQU0sYUFBYSxHQUFHLG1CQUFRLENBQUMsRUFBRSxDQUEwQixrQkFBdUIsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO1FBQ2hJLEVBQUUsRUFBRSxnQkFBVTtRQUNkLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxnQkFBZ0IsRUFBRSxnQkFBZ0IsQ0FBQyxFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRTtRQUMxRixjQUFjLEVBQUUsSUFBSSw0QkFBYyxDQUFDLDJDQUFvQixDQUFDO1FBQ3hELFNBQVMsRUFBRSwyQkFBMkI7UUFDdEMsSUFBSSxFQUFFLHFCQUFxQjtRQUMzQixzQkFBc0IsRUFBRSxJQUFJO1FBQzVCLEtBQUssRUFBRSxDQUFDO1FBQ1IsV0FBVyxFQUFFLElBQUk7S0FD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