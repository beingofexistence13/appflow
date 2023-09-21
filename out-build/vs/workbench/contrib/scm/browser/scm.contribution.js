/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/scm/browser/scm.contribution", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "./dirtydiffDecorator", "vs/workbench/contrib/scm/common/scm", "vs/platform/actions/common/actions", "./activity", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/commands/common/commands", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/scm/common/scmService", "vs/workbench/common/views", "vs/workbench/contrib/scm/browser/scmViewPaneContainer", "vs/platform/instantiation/common/descriptors", "vs/editor/common/languages/modesRegistry", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/workbench/contrib/scm/browser/scmViewPane", "vs/workbench/contrib/scm/browser/scmViewService", "vs/workbench/contrib/scm/browser/scmRepositoriesViewPane", "vs/editor/contrib/suggest/browser/suggest", "vs/workbench/contrib/workspace/common/workspace", "vs/workbench/contrib/scm/common/quickDiff", "vs/workbench/contrib/scm/common/quickDiffService", "vs/workbench/contrib/scm/browser/scmSyncViewPane"], function (require, exports, nls_1, platform_1, contributions_1, dirtydiffDecorator_1, scm_1, actions_1, activity_1, configurationRegistry_1, contextkey_1, commands_1, keybindingsRegistry_1, extensions_1, scmService_1, views_1, scmViewPaneContainer_1, descriptors_1, modesRegistry_1, codicons_1, iconRegistry_1, scmViewPane_1, scmViewService_1, scmRepositoriesViewPane_1, suggest_1, workspace_1, quickDiff_1, quickDiffService_1, scmSyncViewPane_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    modesRegistry_1.$Xt.registerLanguage({
        id: 'scminput',
        extensions: [],
        aliases: [],
        mimetypes: ['text/x-scm-input']
    });
    platform_1.$8m.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(dirtydiffDecorator_1.$leb, 3 /* LifecyclePhase.Restored */);
    const sourceControlViewIcon = (0, iconRegistry_1.$9u)('source-control-view-icon', codicons_1.$Pj.sourceControl, (0, nls_1.localize)(0, null));
    const viewContainer = platform_1.$8m.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: scm_1.$bI,
        title: { value: (0, nls_1.localize)(1, null), original: 'Source Control' },
        ctorDescriptor: new descriptors_1.$yh(scmViewPaneContainer_1.$xPb),
        storageId: 'workbench.scm.views.state',
        icon: sourceControlViewIcon,
        alwaysUseContainerInfo: true,
        order: 2,
        hideIfEmpty: true,
    }, 0 /* ViewContainerLocation.Sidebar */, { doNotRegisterOpenCommand: true });
    const viewsRegistry = platform_1.$8m.as(views_1.Extensions.ViewsRegistry);
    viewsRegistry.registerViewWelcomeContent(scm_1.$cI, {
        content: (0, nls_1.localize)(2, null),
        when: 'default'
    });
    viewsRegistry.registerViewWelcomeContent(scm_1.$cI, {
        content: (0, nls_1.localize)(3, null),
        when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('scm.providerCount', 0), workspace_1.$XPb.IsEnabled, workspace_1.$XPb.IsTrusted.toNegated())
    });
    viewsRegistry.registerViewWelcomeContent(scm_1.$cI, {
        content: `[${(0, nls_1.localize)(4, null)}](command:${workspace_1.$YPb})`,
        when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('scm.providerCount', 0), workspace_1.$XPb.IsEnabled, workspace_1.$XPb.IsTrusted.toNegated())
    });
    viewsRegistry.registerViews([{
            id: scm_1.$cI,
            name: (0, nls_1.localize)(5, null),
            ctorDescriptor: new descriptors_1.$yh(scmViewPane_1.$TPb),
            canToggleVisibility: true,
            canMoveView: true,
            weight: 60,
            order: -999,
            containerIcon: sourceControlViewIcon,
            openCommandActionDescriptor: {
                id: viewContainer.id,
                mnemonicTitle: (0, nls_1.localize)(6, null),
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
            id: scm_1.$dI,
            name: (0, nls_1.localize)(7, null),
            ctorDescriptor: new descriptors_1.$yh(scmRepositoriesViewPane_1.$WPb),
            canToggleVisibility: true,
            hideByDefault: true,
            canMoveView: true,
            weight: 20,
            order: -1000,
            when: contextkey_1.$Ii.and(contextkey_1.$Ii.has('scm.providerCount'), contextkey_1.$Ii.notEquals('scm.providerCount', 0)),
            // readonly when = ContextKeyExpr.or(ContextKeyExpr.equals('config.scm.alwaysShowProviders', true), ContextKeyExpr.and(ContextKeyExpr.notEquals('scm.providerCount', 0), ContextKeyExpr.notEquals('scm.providerCount', 1)));
            containerIcon: sourceControlViewIcon
        }], viewContainer);
    viewsRegistry.registerViews([{
            id: scm_1.$eI,
            name: (0, nls_1.localize)(8, null),
            ctorDescriptor: new descriptors_1.$yh(scmSyncViewPane_1.$1Pb),
            canToggleVisibility: true,
            canMoveView: true,
            weight: 20,
            order: -998,
            when: contextkey_1.$Ii.equals('config.scm.experimental.showSyncView', true),
        }], viewContainer);
    platform_1.$8m.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(activity_1.$vPb, 3 /* LifecyclePhase.Restored */);
    platform_1.$8m.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(activity_1.$uPb, 3 /* LifecyclePhase.Restored */);
    platform_1.$8m.as(configurationRegistry_1.$an.Configuration).registerConfiguration({
        id: 'scm',
        order: 5,
        title: (0, nls_1.localize)(9, null),
        type: 'object',
        scope: 4 /* ConfigurationScope.RESOURCE */,
        properties: {
            'scm.diffDecorations': {
                type: 'string',
                enum: ['all', 'gutter', 'overview', 'minimap', 'none'],
                enumDescriptions: [
                    (0, nls_1.localize)(10, null),
                    (0, nls_1.localize)(11, null),
                    (0, nls_1.localize)(12, null),
                    (0, nls_1.localize)(13, null),
                    (0, nls_1.localize)(14, null)
                ],
                default: 'all',
                description: (0, nls_1.localize)(15, null)
            },
            'scm.diffDecorationsGutterWidth': {
                type: 'number',
                enum: [1, 2, 3, 4, 5],
                default: 3,
                description: (0, nls_1.localize)(16, null)
            },
            'scm.diffDecorationsGutterVisibility': {
                type: 'string',
                enum: ['always', 'hover'],
                enumDescriptions: [
                    (0, nls_1.localize)(17, null),
                    (0, nls_1.localize)(18, null)
                ],
                description: (0, nls_1.localize)(19, null),
                default: 'always'
            },
            'scm.diffDecorationsGutterAction': {
                type: 'string',
                enum: ['diff', 'none'],
                enumDescriptions: [
                    (0, nls_1.localize)(20, null),
                    (0, nls_1.localize)(21, null)
                ],
                description: (0, nls_1.localize)(22, null),
                default: 'diff'
            },
            'scm.diffDecorationsGutterPattern': {
                type: 'object',
                description: (0, nls_1.localize)(23, null),
                additionalProperties: false,
                properties: {
                    'added': {
                        type: 'boolean',
                        description: (0, nls_1.localize)(24, null),
                    },
                    'modified': {
                        type: 'boolean',
                        description: (0, nls_1.localize)(25, null),
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
                    (0, nls_1.localize)(26, null),
                    (0, nls_1.localize)(27, null),
                    (0, nls_1.localize)(28, null)
                ],
                description: (0, nls_1.localize)(29, null),
                default: 'false'
            },
            'scm.alwaysShowActions': {
                type: 'boolean',
                description: (0, nls_1.localize)(30, null),
                default: false
            },
            'scm.countBadge': {
                type: 'string',
                enum: ['all', 'focused', 'off'],
                enumDescriptions: [
                    (0, nls_1.localize)(31, null),
                    (0, nls_1.localize)(32, null),
                    (0, nls_1.localize)(33, null)
                ],
                description: (0, nls_1.localize)(34, null),
                default: 'all'
            },
            'scm.providerCountBadge': {
                type: 'string',
                enum: ['hidden', 'auto', 'visible'],
                enumDescriptions: [
                    (0, nls_1.localize)(35, null),
                    (0, nls_1.localize)(36, null),
                    (0, nls_1.localize)(37, null)
                ],
                description: (0, nls_1.localize)(38, null),
                default: 'hidden'
            },
            'scm.defaultViewMode': {
                type: 'string',
                enum: ['tree', 'list'],
                enumDescriptions: [
                    (0, nls_1.localize)(39, null),
                    (0, nls_1.localize)(40, null)
                ],
                description: (0, nls_1.localize)(41, null),
                default: 'list'
            },
            'scm.defaultViewSortKey': {
                type: 'string',
                enum: ['name', 'path', 'status'],
                enumDescriptions: [
                    (0, nls_1.localize)(42, null),
                    (0, nls_1.localize)(43, null),
                    (0, nls_1.localize)(44, null)
                ],
                description: (0, nls_1.localize)(45, null),
                default: 'path'
            },
            'scm.autoReveal': {
                type: 'boolean',
                description: (0, nls_1.localize)(46, null),
                default: true
            },
            'scm.inputFontFamily': {
                type: 'string',
                markdownDescription: (0, nls_1.localize)(47, null),
                default: 'default'
            },
            'scm.inputFontSize': {
                type: 'number',
                markdownDescription: (0, nls_1.localize)(48, null),
                default: 13
            },
            'scm.alwaysShowRepositories': {
                type: 'boolean',
                markdownDescription: (0, nls_1.localize)(49, null),
                default: false
            },
            'scm.repositories.sortOrder': {
                type: 'string',
                enum: ['discovery time', 'name', 'path'],
                enumDescriptions: [
                    (0, nls_1.localize)(50, null),
                    (0, nls_1.localize)(51, null),
                    (0, nls_1.localize)(52, null)
                ],
                description: (0, nls_1.localize)(53, null),
                default: 'discovery time'
            },
            'scm.repositories.visible': {
                type: 'number',
                description: (0, nls_1.localize)(54, null),
                default: 10
            },
            'scm.showActionButton': {
                type: 'boolean',
                markdownDescription: (0, nls_1.localize)(55, null),
                default: true
            },
            'scm.experimental.showSyncView': {
                type: 'boolean',
                description: (0, nls_1.localize)(56, null),
                default: false
            }
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'scm.acceptInput',
        description: { description: (0, nls_1.localize)(57, null), args: [] },
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.$Ii.has('scmRepository'),
        primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
        handler: accessor => {
            const contextKeyService = accessor.get(contextkey_1.$3i);
            const context = contextKeyService.getContext(document.activeElement);
            const repositoryId = context.getValue('scmRepository');
            if (!repositoryId) {
                return Promise.resolve(null);
            }
            const scmService = accessor.get(scm_1.$fI);
            const repository = scmService.getRepository(repositoryId);
            if (!repository?.provider.acceptInputCommand) {
                return Promise.resolve(null);
            }
            const id = repository.provider.acceptInputCommand.id;
            const args = repository.provider.acceptInputCommand.arguments;
            const commandService = accessor.get(commands_1.$Fr);
            return commandService.executeCommand(id, ...(args || []));
        }
    });
    const viewNextCommitCommand = {
        description: { description: (0, nls_1.localize)(58, null), args: [] },
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        handler: (accessor) => {
            const contextKeyService = accessor.get(contextkey_1.$3i);
            const scmService = accessor.get(scm_1.$fI);
            const context = contextKeyService.getContext(document.activeElement);
            const repositoryId = context.getValue('scmRepository');
            const repository = repositoryId ? scmService.getRepository(repositoryId) : undefined;
            repository?.input.showNextHistoryValue();
        }
    };
    const viewPreviousCommitCommand = {
        description: { description: (0, nls_1.localize)(59, null), args: [] },
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        handler: (accessor) => {
            const contextKeyService = accessor.get(contextkey_1.$3i);
            const scmService = accessor.get(scm_1.$fI);
            const context = contextKeyService.getContext(document.activeElement);
            const repositoryId = context.getValue('scmRepository');
            const repository = repositoryId ? scmService.getRepository(repositoryId) : undefined;
            repository?.input.showPreviousHistoryValue();
        }
    };
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        ...viewNextCommitCommand,
        id: 'scm.viewNextCommit',
        when: contextkey_1.$Ii.and(contextkey_1.$Ii.has('scmRepository'), contextkey_1.$Ii.has('scmInputIsInLastPosition'), suggest_1.$V5.Visible.toNegated()),
        primary: 18 /* KeyCode.DownArrow */
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        ...viewPreviousCommitCommand,
        id: 'scm.viewPreviousCommit',
        when: contextkey_1.$Ii.and(contextkey_1.$Ii.has('scmRepository'), contextkey_1.$Ii.has('scmInputIsInFirstPosition'), suggest_1.$V5.Visible.toNegated()),
        primary: 16 /* KeyCode.UpArrow */
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        ...viewNextCommitCommand,
        id: 'scm.forceViewNextCommit',
        when: contextkey_1.$Ii.has('scmRepository'),
        primary: 512 /* KeyMod.Alt */ | 18 /* KeyCode.DownArrow */
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        ...viewPreviousCommitCommand,
        id: 'scm.forceViewPreviousCommit',
        when: contextkey_1.$Ii.has('scmRepository'),
        primary: 512 /* KeyMod.Alt */ | 16 /* KeyCode.UpArrow */
    });
    commands_1.$Gr.registerCommand('scm.openInIntegratedTerminal', async (accessor, provider) => {
        if (!provider || !provider.rootUri) {
            return;
        }
        const commandService = accessor.get(commands_1.$Fr);
        await commandService.executeCommand('openInIntegratedTerminal', provider.rootUri);
    });
    commands_1.$Gr.registerCommand('scm.openInTerminal', async (accessor, provider) => {
        if (!provider || !provider.rootUri) {
            return;
        }
        const commandService = accessor.get(commands_1.$Fr);
        await commandService.executeCommand('openInTerminal', provider.rootUri);
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.SCMSourceControl, {
        group: '100_end',
        command: {
            id: 'scm.openInTerminal',
            title: (0, nls_1.localize)(60, null)
        },
        when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('scmProviderHasRootUri', true), contextkey_1.$Ii.or(contextkey_1.$Ii.equals('config.terminal.sourceControlRepositoriesKind', 'external'), contextkey_1.$Ii.equals('config.terminal.sourceControlRepositoriesKind', 'both')))
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.SCMSourceControl, {
        group: '100_end',
        command: {
            id: 'scm.openInIntegratedTerminal',
            title: (0, nls_1.localize)(61, null)
        },
        when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('scmProviderHasRootUri', true), contextkey_1.$Ii.or(contextkey_1.$Ii.equals('config.terminal.sourceControlRepositoriesKind', 'integrated'), contextkey_1.$Ii.equals('config.terminal.sourceControlRepositoriesKind', 'both')))
    });
    (0, extensions_1.$mr)(scm_1.$fI, scmService_1.$wPb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(scm_1.$gI, scmViewService_1.$OPb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(quickDiff_1.$aeb, quickDiffService_1.$ZPb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=scm.contribution.js.map