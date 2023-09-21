/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/base/common/platform", "vs/editor/browser/editorExtensions", "vs/nls!vs/workbench/contrib/debug/browser/debug.contribution", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/extensions", "vs/platform/quickinput/common/quickAccess", "vs/platform/registry/common/platform", "vs/workbench/browser/editor", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/workbench/common/contributions", "vs/workbench/common/editor", "vs/workbench/common/views", "vs/workbench/contrib/debug/browser/breakpointEditorContribution", "vs/workbench/contrib/debug/browser/breakpointsView", "vs/workbench/contrib/debug/browser/callStackEditorContribution", "vs/workbench/contrib/debug/browser/callStackView", "vs/workbench/contrib/debug/browser/debugColors", "vs/workbench/contrib/debug/browser/debugCommands", "vs/workbench/contrib/debug/browser/debugConsoleQuickAccess", "vs/workbench/contrib/debug/browser/debugEditorActions", "vs/workbench/contrib/debug/browser/debugEditorContribution", "vs/workbench/contrib/debug/browser/debugIcons", "vs/workbench/contrib/debug/browser/debugProgress", "vs/workbench/contrib/debug/browser/debugQuickAccess", "vs/workbench/contrib/debug/browser/debugService", "vs/workbench/contrib/debug/browser/debugStatus", "vs/workbench/contrib/debug/browser/debugTitle", "vs/workbench/contrib/debug/browser/debugToolBar", "vs/workbench/contrib/debug/browser/debugViewlet", "vs/workbench/contrib/debug/browser/disassemblyView", "vs/workbench/contrib/debug/browser/loadedScriptsView", "vs/workbench/contrib/debug/browser/repl", "vs/workbench/contrib/debug/browser/statusbarColorProvider", "vs/workbench/contrib/debug/browser/variablesView", "vs/workbench/contrib/debug/browser/watchExpressionsView", "vs/workbench/contrib/debug/browser/welcomeView", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugContentProvider", "vs/workbench/contrib/debug/common/debugLifecycle", "vs/workbench/contrib/debug/common/disassemblyViewInput", "vs/workbench/services/configuration/common/configuration", "vs/css!./media/debug.contribution", "vs/css!./media/debugHover"], function (require, exports, network_1, platform_1, editorExtensions_1, nls, actions_1, configurationRegistry_1, contextkey_1, descriptors_1, extensions_1, quickAccess_1, platform_2, editor_1, viewPaneContainer_1, contributions_1, editor_2, views_1, breakpointEditorContribution_1, breakpointsView_1, callStackEditorContribution_1, callStackView_1, debugColors_1, debugCommands_1, debugConsoleQuickAccess_1, debugEditorActions_1, debugEditorContribution_1, icons, debugProgress_1, debugQuickAccess_1, debugService_1, debugStatus_1, debugTitle_1, debugToolBar_1, debugViewlet_1, disassemblyView_1, loadedScriptsView_1, repl_1, statusbarColorProvider_1, variablesView_1, watchExpressionsView_1, welcomeView_1, debug_1, debugContentProvider_1, debugLifecycle_1, disassemblyViewInput_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const debugCategory = nls.localize(0, null);
    (0, debugColors_1.$Enb)();
    (0, extensions_1.$mr)(debug_1.$nH, debugService_1.$WRb, 1 /* InstantiationType.Delayed */);
    // Register Debug Workbench Contributions
    platform_2.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(debugStatus_1.$YRb, 4 /* LifecyclePhase.Eventually */);
    platform_2.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(debugProgress_1.$ERb, 4 /* LifecyclePhase.Eventually */);
    if (platform_1.$o) {
        platform_2.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(debugTitle_1.$1Rb, 4 /* LifecyclePhase.Eventually */);
    }
    platform_2.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(debugToolBar_1.$eRb, 3 /* LifecyclePhase.Restored */);
    platform_2.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(debugContentProvider_1.$4Rb, 4 /* LifecyclePhase.Eventually */);
    platform_2.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(statusbarColorProvider_1.$lSb, 4 /* LifecyclePhase.Eventually */);
    platform_2.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(disassemblyView_1.$8Fb, 4 /* LifecyclePhase.Eventually */);
    platform_2.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(debugLifecycle_1.$sSb, 4 /* LifecyclePhase.Eventually */);
    // Register Quick Access
    platform_2.$8m.as(quickAccess_1.$8p.Quickaccess).registerQuickAccessProvider({
        ctor: debugQuickAccess_1.$FRb,
        prefix: debugCommands_1.$aRb,
        contextKey: 'inLaunchConfigurationsPicker',
        placeholder: nls.localize(1, null),
        helpEntries: [{
                description: nls.localize(2, null),
                commandId: debugCommands_1.$xQb,
                commandCenterOrder: 50
            }]
    });
    // Register quick access for debug console
    platform_2.$8m.as(quickAccess_1.$8p.Quickaccess).registerQuickAccessProvider({
        ctor: debugConsoleQuickAccess_1.$kRb,
        prefix: debugCommands_1.$bRb,
        contextKey: 'inDebugConsolePicker',
        placeholder: nls.localize(3, null),
        helpEntries: [{ description: nls.localize(4, null), commandId: debugCommands_1.$yQb }]
    });
    (0, editorExtensions_1.$AV)('editor.contrib.callStack', callStackEditorContribution_1.$6Fb, 1 /* EditorContributionInstantiation.AfterFirstRender */);
    (0, editorExtensions_1.$AV)(debug_1.$iH, breakpointEditorContribution_1.$cGb, 1 /* EditorContributionInstantiation.AfterFirstRender */);
    (0, editorExtensions_1.$AV)(debug_1.$hH, debugEditorContribution_1.$DRb, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
    const registerDebugCommandPaletteItem = (id, title, when, precondition) => {
        actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, {
            when: contextkey_1.$Ii.and(debug_1.$ZG, when),
            group: debugCategory,
            command: {
                id,
                title,
                category: debugCommands_1.$NQb,
                precondition
            }
        });
    };
    registerDebugCommandPaletteItem(debugCommands_1.$iQb, debugCommands_1.$OQb);
    registerDebugCommandPaletteItem(debugCommands_1.$jQb, { value: nls.localize(5, null), original: 'Terminate Thread' }, debug_1.$yG);
    registerDebugCommandPaletteItem(debugCommands_1.$kQb, debugCommands_1.$PQb, debug_1.$yG, debug_1.$uG.isEqualTo('stopped'));
    registerDebugCommandPaletteItem(debugCommands_1.$lQb, debugCommands_1.$QQb, debug_1.$yG, debug_1.$uG.isEqualTo('stopped'));
    registerDebugCommandPaletteItem(debugCommands_1.$mQb, debugCommands_1.$RQb, debug_1.$yG, contextkey_1.$Ii.and(debug_1.$XG, debug_1.$yG, debug_1.$uG.isEqualTo('stopped')));
    registerDebugCommandPaletteItem(debugCommands_1.$nQb, debugCommands_1.$SQb, debug_1.$yG, debug_1.$uG.isEqualTo('stopped'));
    registerDebugCommandPaletteItem(debugCommands_1.$oQb, debugCommands_1.$TQb, debug_1.$yG, debug_1.$uG.isEqualTo('running'));
    registerDebugCommandPaletteItem(debugCommands_1.$pQb, debugCommands_1.$UQb, debug_1.$yG, contextkey_1.$Ii.or(debug_1.$SG, debug_1.$8G));
    registerDebugCommandPaletteItem(debugCommands_1.$qQb, debugCommands_1.$VQb, debug_1.$yG, contextkey_1.$Ii.or(debug_1.$SG, contextkey_1.$Ii.and(debug_1.$9G, debug_1.$8G)));
    registerDebugCommandPaletteItem(debugCommands_1.$rQb, debugCommands_1.$WQb, debug_1.$yG, contextkey_1.$Ii.or(debug_1.$SG.toNegated(), debug_1.$8G));
    registerDebugCommandPaletteItem(debugCommands_1.$tQb, debugCommands_1.$XQb, debug_1.$yG, debug_1.$uG.isEqualTo('stopped'));
    registerDebugCommandPaletteItem(debugCommands_1.$uQb, { value: nls.localize(6, null), original: 'Focus on Debug Console View' });
    registerDebugCommandPaletteItem(debugCommands_1.$vQb, { value: nls.localize(7, null), original: 'Jump to Cursor' }, debug_1.$WG);
    registerDebugCommandPaletteItem(debugCommands_1.$vQb, { value: nls.localize(8, null), original: 'Set Next Statement' }, debug_1.$WG);
    registerDebugCommandPaletteItem(debugEditorActions_1.$lRb.ID, { value: debugEditorActions_1.$lRb.LABEL, original: 'Run to Cursor' }, debug_1.$ZG);
    registerDebugCommandPaletteItem(debugEditorActions_1.$mRb.ID, { value: debugEditorActions_1.$mRb.LABEL, original: 'Evaluate in Debug Console' }, debug_1.$yG);
    registerDebugCommandPaletteItem(debugEditorActions_1.$nRb.ID, { value: debugEditorActions_1.$nRb.LABEL, original: 'Add to Watch' });
    registerDebugCommandPaletteItem(debugCommands_1.$eQb, { value: nls.localize(9, null), original: 'Inline Breakpoint' });
    registerDebugCommandPaletteItem(debugCommands_1.$BQb, debugCommands_1.$2Qb, contextkey_1.$Ii.and(debug_1.$ZG, debug_1.$uG.notEqualsTo((0, debug_1.$lH)(1 /* State.Initializing */))));
    registerDebugCommandPaletteItem(debugCommands_1.$CQb, debugCommands_1.$3Qb, contextkey_1.$Ii.and(debug_1.$ZG, debug_1.$uG.notEqualsTo((0, debug_1.$lH)(1 /* State.Initializing */))));
    registerDebugCommandPaletteItem(debugCommands_1.$xQb, debugCommands_1.$ZQb, contextkey_1.$Ii.and(debug_1.$ZG, debug_1.$uG.notEqualsTo((0, debug_1.$lH)(1 /* State.Initializing */))));
    registerDebugCommandPaletteItem(debugCommands_1.$GQb, debugCommands_1.$4Qb);
    registerDebugCommandPaletteItem(debugCommands_1.$HQb, debugCommands_1.$5Qb);
    registerDebugCommandPaletteItem(debugCommands_1.$IQb, debugCommands_1.$6Qb, debug_1.$yG);
    registerDebugCommandPaletteItem(debugCommands_1.$yQb, debugCommands_1.$$Qb);
    registerDebugCommandPaletteItem(debugCommands_1.$zQb, debugCommands_1.$_Qb);
    registerDebugCommandPaletteItem(debugCommands_1.$JQb, debugCommands_1.$7Qb, debug_1.$yG, debug_1.$uG.isEqualTo('stopped'));
    registerDebugCommandPaletteItem(debugCommands_1.$KQb, debugCommands_1.$8Qb, debug_1.$yG, debug_1.$uG.isEqualTo('stopped'));
    registerDebugCommandPaletteItem(debugCommands_1.$LQb, debugCommands_1.$9Qb, debug_1.$yG, debug_1.$uG.isEqualTo('stopped'));
    registerDebugCommandPaletteItem(debugCommands_1.$MQb, debugCommands_1.$0Qb, debug_1.$yG, debug_1.$uG.isEqualTo('stopped'));
    // Debug callstack context menu
    const registerDebugViewMenuItem = (menuId, id, title, order, when, precondition, group = 'navigation', icon) => {
        actions_1.$Tu.appendMenuItem(menuId, {
            group,
            when,
            order,
            icon,
            command: {
                id,
                title,
                icon,
                precondition
            }
        });
    };
    registerDebugViewMenuItem(actions_1.$Ru.DebugCallStackContext, debugCommands_1.$iQb, debugCommands_1.$OQb, 10, debug_1.$IG.isEqualTo('session'), undefined, '3_modification');
    registerDebugViewMenuItem(actions_1.$Ru.DebugCallStackContext, debugCommands_1.$pQb, debugCommands_1.$UQb, 20, debug_1.$IG.isEqualTo('session'), undefined, '3_modification');
    registerDebugViewMenuItem(actions_1.$Ru.DebugCallStackContext, debugCommands_1.$qQb, debugCommands_1.$VQb, 21, contextkey_1.$Ii.and(debug_1.$IG.isEqualTo('session'), debug_1.$9G, debug_1.$8G), undefined, '3_modification');
    registerDebugViewMenuItem(actions_1.$Ru.DebugCallStackContext, debugCommands_1.$rQb, debugCommands_1.$WQb, 30, debug_1.$IG.isEqualTo('session'), undefined, '3_modification');
    registerDebugViewMenuItem(actions_1.$Ru.DebugCallStackContext, debugCommands_1.$oQb, debugCommands_1.$TQb, 10, contextkey_1.$Ii.and(debug_1.$IG.isEqualTo('thread'), debug_1.$uG.isEqualTo('running')));
    registerDebugViewMenuItem(actions_1.$Ru.DebugCallStackContext, debugCommands_1.$tQb, debugCommands_1.$XQb, 10, contextkey_1.$Ii.and(debug_1.$IG.isEqualTo('thread'), debug_1.$uG.isEqualTo('stopped')));
    registerDebugViewMenuItem(actions_1.$Ru.DebugCallStackContext, debugCommands_1.$kQb, debugCommands_1.$PQb, 20, debug_1.$IG.isEqualTo('thread'), debug_1.$uG.isEqualTo('stopped'));
    registerDebugViewMenuItem(actions_1.$Ru.DebugCallStackContext, debugCommands_1.$lQb, debugCommands_1.$QQb, 30, debug_1.$IG.isEqualTo('thread'), debug_1.$uG.isEqualTo('stopped'));
    registerDebugViewMenuItem(actions_1.$Ru.DebugCallStackContext, debugCommands_1.$nQb, debugCommands_1.$SQb, 40, debug_1.$IG.isEqualTo('thread'), debug_1.$uG.isEqualTo('stopped'));
    registerDebugViewMenuItem(actions_1.$Ru.DebugCallStackContext, debugCommands_1.$jQb, nls.localize(10, null), 10, debug_1.$IG.isEqualTo('thread'), undefined, 'termination');
    registerDebugViewMenuItem(actions_1.$Ru.DebugCallStackContext, debugCommands_1.$sQb, nls.localize(11, null), 10, contextkey_1.$Ii.and(debug_1.$IG.isEqualTo('stackFrame'), debug_1.$UG), debug_1.$VG);
    registerDebugViewMenuItem(actions_1.$Ru.DebugCallStackContext, debugCommands_1.$fQb, nls.localize(12, null), 20, debug_1.$IG.isEqualTo('stackFrame'), undefined, '3_modification');
    registerDebugViewMenuItem(actions_1.$Ru.DebugVariablesContext, variablesView_1.$sRb, nls.localize(13, null), 15, debug_1.$NG, debug_1.$yG, 'inline', icons.$Anb);
    registerDebugViewMenuItem(actions_1.$Ru.DebugVariablesContext, variablesView_1.$qRb, nls.localize(14, null), 10, contextkey_1.$Ii.or(debug_1.$3G, contextkey_1.$Ii.and(debug_1.$0G, debug_1.$4G)), debug_1.$$G.toNegated(), '3_modification');
    registerDebugViewMenuItem(actions_1.$Ru.DebugVariablesContext, variablesView_1.$rRb, nls.localize(15, null), 10, undefined, undefined, '5_cutcopypaste');
    registerDebugViewMenuItem(actions_1.$Ru.DebugVariablesContext, variablesView_1.$wRb, nls.localize(16, null), 20, debug_1.$0G, undefined, '5_cutcopypaste');
    registerDebugViewMenuItem(actions_1.$Ru.DebugVariablesContext, variablesView_1.$xRb, nls.localize(17, null), 100, debug_1.$0G, undefined, 'z_commands');
    registerDebugViewMenuItem(actions_1.$Ru.DebugVariablesContext, variablesView_1.$vRb, nls.localize(18, null), 200, debug_1.$7G, undefined, 'z_commands');
    registerDebugViewMenuItem(actions_1.$Ru.DebugVariablesContext, variablesView_1.$tRb, nls.localize(19, null), 210, debug_1.$5G, undefined, 'z_commands');
    registerDebugViewMenuItem(actions_1.$Ru.DebugVariablesContext, variablesView_1.$uRb, nls.localize(20, null), 220, debug_1.$6G, undefined, 'z_commands');
    registerDebugViewMenuItem(actions_1.$Ru.DebugWatchContext, watchExpressionsView_1.$oSb, watchExpressionsView_1.$pSb, 10, undefined, undefined, '3_modification');
    registerDebugViewMenuItem(actions_1.$Ru.DebugWatchContext, debugCommands_1.$DQb, nls.localize(21, null), 20, debug_1.$MG.isEqualTo('expression'), undefined, '3_modification');
    registerDebugViewMenuItem(actions_1.$Ru.DebugWatchContext, debugCommands_1.$EQb, nls.localize(22, null), 30, contextkey_1.$Ii.or(contextkey_1.$Ii.and(debug_1.$MG.isEqualTo('expression'), debug_1.$4G), contextkey_1.$Ii.and(debug_1.$MG.isEqualTo('variable'), debug_1.$3G)), debug_1.$$G.toNegated(), '3_modification');
    registerDebugViewMenuItem(actions_1.$Ru.DebugWatchContext, variablesView_1.$rRb, nls.localize(23, null), 40, contextkey_1.$Ii.or(debug_1.$MG.isEqualTo('expression'), debug_1.$MG.isEqualTo('variable')), debug_1.$yG, '3_modification');
    registerDebugViewMenuItem(actions_1.$Ru.DebugWatchContext, variablesView_1.$sRb, nls.localize(24, null), 10, debug_1.$NG, undefined, 'inline', icons.$Anb);
    registerDebugViewMenuItem(actions_1.$Ru.DebugWatchContext, debugCommands_1.$FQb, nls.localize(25, null), 20, debug_1.$MG.isEqualTo('expression'), undefined, 'inline', icons.$tnb);
    registerDebugViewMenuItem(actions_1.$Ru.DebugWatchContext, watchExpressionsView_1.$qSb, watchExpressionsView_1.$rSb, 20, undefined, undefined, 'z_commands');
    // Touch Bar
    if (platform_1.$j) {
        const registerTouchBarEntry = (id, title, order, when, iconUri) => {
            actions_1.$Tu.appendMenuItem(actions_1.$Ru.TouchBarContext, {
                command: {
                    id,
                    title,
                    icon: { dark: iconUri }
                },
                when: contextkey_1.$Ii.and(debug_1.$ZG, when),
                group: '9_debug',
                order
            });
        };
        registerTouchBarEntry(debugCommands_1.$CQb, debugCommands_1.$3Qb, 0, debug_1.$yG.toNegated(), network_1.$2f.asFileUri('vs/workbench/contrib/debug/browser/media/continue-tb.png'));
        registerTouchBarEntry(debugCommands_1.$BQb, debugCommands_1.$2Qb, 1, debug_1.$yG.toNegated(), network_1.$2f.asFileUri('vs/workbench/contrib/debug/browser/media/run-with-debugging-tb.png'));
        registerTouchBarEntry(debugCommands_1.$tQb, debugCommands_1.$XQb, 0, debug_1.$uG.isEqualTo('stopped'), network_1.$2f.asFileUri('vs/workbench/contrib/debug/browser/media/continue-tb.png'));
        registerTouchBarEntry(debugCommands_1.$oQb, debugCommands_1.$TQb, 1, contextkey_1.$Ii.and(debug_1.$yG, contextkey_1.$Ii.notEquals('debugState', 'stopped')), network_1.$2f.asFileUri('vs/workbench/contrib/debug/browser/media/pause-tb.png'));
        registerTouchBarEntry(debugCommands_1.$kQb, debugCommands_1.$PQb, 2, debug_1.$yG, network_1.$2f.asFileUri('vs/workbench/contrib/debug/browser/media/stepover-tb.png'));
        registerTouchBarEntry(debugCommands_1.$lQb, debugCommands_1.$QQb, 3, debug_1.$yG, network_1.$2f.asFileUri('vs/workbench/contrib/debug/browser/media/stepinto-tb.png'));
        registerTouchBarEntry(debugCommands_1.$nQb, debugCommands_1.$SQb, 4, debug_1.$yG, network_1.$2f.asFileUri('vs/workbench/contrib/debug/browser/media/stepout-tb.png'));
        registerTouchBarEntry(debugCommands_1.$iQb, debugCommands_1.$OQb, 5, debug_1.$yG, network_1.$2f.asFileUri('vs/workbench/contrib/debug/browser/media/restart-tb.png'));
        registerTouchBarEntry(debugCommands_1.$rQb, debugCommands_1.$WQb, 6, debug_1.$yG, network_1.$2f.asFileUri('vs/workbench/contrib/debug/browser/media/stop-tb.png'));
    }
    // Editor Title Menu's "Run/Debug" dropdown item
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitle, { submenu: actions_1.$Ru.EditorTitleRun, rememberDefaultAction: true, title: { value: nls.localize(26, null), original: 'Run or Debug...', }, icon: icons.$knb, group: 'navigation', order: -1 });
    // Debug menu
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarMainMenu, {
        submenu: actions_1.$Ru.MenubarDebugMenu,
        title: {
            value: 'Run',
            original: 'Run',
            mnemonicTitle: nls.localize(27, null)
        },
        order: 6
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarDebugMenu, {
        group: '1_debug',
        command: {
            id: debugCommands_1.$BQb,
            title: nls.localize(28, null)
        },
        order: 1,
        when: debug_1.$ZG
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarDebugMenu, {
        group: '1_debug',
        command: {
            id: debugCommands_1.$CQb,
            title: nls.localize(29, null)
        },
        order: 2,
        when: debug_1.$ZG
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarDebugMenu, {
        group: '1_debug',
        command: {
            id: debugCommands_1.$rQb,
            title: nls.localize(30, null),
            precondition: debug_1.$yG
        },
        order: 3,
        when: debug_1.$ZG
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarDebugMenu, {
        group: '1_debug',
        command: {
            id: debugCommands_1.$iQb,
            title: nls.localize(31, null),
            precondition: debug_1.$yG
        },
        order: 4,
        when: debug_1.$ZG
    });
    // Configuration
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarDebugMenu, {
        group: '2_configuration',
        command: {
            id: debugCommands_1.$dQb,
            title: nls.localize(32, null)
        },
        order: 2,
        when: debug_1.$ZG
    });
    // Step Commands
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarDebugMenu, {
        group: '3_step',
        command: {
            id: debugCommands_1.$kQb,
            title: nls.localize(33, null),
            precondition: debug_1.$uG.isEqualTo('stopped')
        },
        order: 1,
        when: debug_1.$ZG
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarDebugMenu, {
        group: '3_step',
        command: {
            id: debugCommands_1.$lQb,
            title: nls.localize(34, null),
            precondition: debug_1.$uG.isEqualTo('stopped')
        },
        order: 2,
        when: debug_1.$ZG
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarDebugMenu, {
        group: '3_step',
        command: {
            id: debugCommands_1.$nQb,
            title: nls.localize(35, null),
            precondition: debug_1.$uG.isEqualTo('stopped')
        },
        order: 3,
        when: debug_1.$ZG
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarDebugMenu, {
        group: '3_step',
        command: {
            id: debugCommands_1.$tQb,
            title: nls.localize(36, null),
            precondition: debug_1.$uG.isEqualTo('stopped')
        },
        order: 4,
        when: debug_1.$ZG
    });
    // New Breakpoints
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarNewBreakpointMenu, {
        group: '1_breakpoints',
        command: {
            id: debugCommands_1.$eQb,
            title: nls.localize(37, null)
        },
        order: 2,
        when: debug_1.$ZG
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarDebugMenu, {
        group: '4_new_breakpoint',
        title: nls.localize(38, null),
        submenu: actions_1.$Ru.MenubarNewBreakpointMenu,
        order: 2,
        when: debug_1.$ZG
    });
    // Breakpoint actions are registered from breakpointsView.ts
    // Install Debuggers
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarDebugMenu, {
        group: 'z_install',
        command: {
            id: 'debug.installAdditionalDebuggers',
            title: nls.localize(39, null)
        },
        order: 1
    });
    // register repl panel
    const VIEW_CONTAINER = platform_2.$8m.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: debug_1.$qG,
        title: { value: nls.localize(40, null), original: 'Debug Console' },
        icon: icons.$Tmb,
        ctorDescriptor: new descriptors_1.$yh(viewPaneContainer_1.$Seb, [debug_1.$qG, { mergeViewWithContainerWhenSingleView: true }]),
        storageId: debug_1.$qG,
        hideIfEmpty: true,
        order: 2,
    }, 1 /* ViewContainerLocation.Panel */, { doNotRegisterOpenCommand: true });
    platform_2.$8m.as(views_1.Extensions.ViewsRegistry).registerViews([{
            id: debug_1.$rG,
            name: nls.localize(41, null),
            containerIcon: icons.$Tmb,
            canToggleVisibility: false,
            canMoveView: true,
            when: debug_1.$ZG,
            ctorDescriptor: new descriptors_1.$yh(repl_1.Repl),
            openCommandActionDescriptor: {
                id: 'workbench.debug.action.toggleRepl',
                mnemonicTitle: nls.localize(42, null),
                keybindings: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 55 /* KeyCode.KeyY */ },
                order: 2
            }
        }], VIEW_CONTAINER);
    const viewContainer = platform_2.$8m.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: debug_1.$jG,
        title: { value: nls.localize(43, null), original: 'Run and Debug' },
        openCommandActionDescriptor: {
            id: debug_1.$jG,
            mnemonicTitle: nls.localize(44, null),
            keybindings: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 34 /* KeyCode.KeyD */ },
            order: 3
        },
        ctorDescriptor: new descriptors_1.$yh(debugViewlet_1.$3Rb),
        icon: icons.$Umb,
        alwaysUseContainerInfo: true,
        order: 3,
    }, 0 /* ViewContainerLocation.Sidebar */);
    // Register default debug views
    const viewsRegistry = platform_2.$8m.as(views_1.Extensions.ViewsRegistry);
    viewsRegistry.registerViews([{ id: debug_1.$kG, name: nls.localize(45, null), containerIcon: icons.$Vmb, ctorDescriptor: new descriptors_1.$yh(variablesView_1.$oRb), order: 10, weight: 40, canToggleVisibility: true, canMoveView: true, focusCommand: { id: 'workbench.debug.action.focusVariablesView' }, when: debug_1.$wG.isEqualTo('default') }], viewContainer);
    viewsRegistry.registerViews([{ id: debug_1.$lG, name: nls.localize(46, null), containerIcon: icons.$Wmb, ctorDescriptor: new descriptors_1.$yh(watchExpressionsView_1.$nSb), order: 20, weight: 10, canToggleVisibility: true, canMoveView: true, focusCommand: { id: 'workbench.debug.action.focusWatchView' }, when: debug_1.$wG.isEqualTo('default') }], viewContainer);
    viewsRegistry.registerViews([{ id: debug_1.$mG, name: nls.localize(47, null), containerIcon: icons.$Xmb, ctorDescriptor: new descriptors_1.$yh(callStackView_1.$jRb), order: 30, weight: 30, canToggleVisibility: true, canMoveView: true, focusCommand: { id: 'workbench.debug.action.focusCallStackView' }, when: debug_1.$wG.isEqualTo('default') }], viewContainer);
    viewsRegistry.registerViews([{ id: debug_1.$oG, name: nls.localize(48, null), containerIcon: icons.$Ymb, ctorDescriptor: new descriptors_1.$yh(breakpointsView_1.$0Fb), order: 40, weight: 20, canToggleVisibility: true, canMoveView: true, focusCommand: { id: 'workbench.debug.action.focusBreakpointsView' }, when: contextkey_1.$Ii.or(debug_1.$YG, debug_1.$wG.isEqualTo('default'), debug_1.$xG) }], viewContainer);
    viewsRegistry.registerViews([{ id: welcomeView_1.$2Rb.ID, name: welcomeView_1.$2Rb.LABEL, containerIcon: icons.$Umb, ctorDescriptor: new descriptors_1.$yh(welcomeView_1.$2Rb), order: 1, weight: 40, canToggleVisibility: true, when: debug_1.$wG.isEqualTo('simple') }], viewContainer);
    viewsRegistry.registerViews([{ id: debug_1.$nG, name: nls.localize(49, null), containerIcon: icons.$Zmb, ctorDescriptor: new descriptors_1.$yh(loadedScriptsView_1.$5Rb), order: 35, weight: 5, canToggleVisibility: true, canMoveView: true, collapsed: true, when: contextkey_1.$Ii.and(debug_1.$QG, debug_1.$wG.isEqualTo('default')) }], viewContainer);
    // Register disassembly view
    platform_2.$8m.as(editor_2.$GE.EditorPane).registerEditorPane(editor_1.$_T.create(disassemblyView_1.$7Fb, debug_1.$pG, nls.localize(50, null)), [new descriptors_1.$yh(disassemblyViewInput_1.$GFb)]);
    // Register configuration
    const configurationRegistry = platform_2.$8m.as(configurationRegistry_1.$an.Configuration);
    configurationRegistry.registerConfiguration({
        id: 'debug',
        order: 20,
        title: nls.localize(51, null),
        type: 'object',
        properties: {
            'debug.allowBreakpointsEverywhere': {
                type: 'boolean',
                description: nls.localize(52, null),
                default: false
            },
            'debug.openExplorerOnEnd': {
                type: 'boolean',
                description: nls.localize(53, null),
                default: false
            },
            'debug.inlineValues': {
                type: 'string',
                'enum': ['on', 'off', 'auto'],
                description: nls.localize(54, null),
                'enumDescriptions': [
                    nls.localize(55, null),
                    nls.localize(56, null),
                    nls.localize(57, null),
                ],
                default: 'auto'
            },
            'debug.toolBarLocation': {
                enum: ['floating', 'docked', 'commandCenter', 'hidden'],
                markdownDescription: nls.localize(58, null, '#window.commandCenter#', '#window.titleBarStyle#'),
                default: 'floating',
                enumDescriptions: [
                    nls.localize(59, null),
                    nls.localize(60, null),
                    nls.localize(61, null),
                    nls.localize(62, null),
                ]
            },
            'debug.showInStatusBar': {
                enum: ['never', 'always', 'onFirstSessionStart'],
                enumDescriptions: [nls.localize(63, null), nls.localize(64, null), nls.localize(65, null)],
                description: nls.localize(66, null),
                default: 'onFirstSessionStart'
            },
            'debug.internalConsoleOptions': debug_1.$kH,
            'debug.console.closeOnEnd': {
                type: 'boolean',
                description: nls.localize(67, null),
                default: false
            },
            'debug.terminal.clearBeforeReusing': {
                type: 'boolean',
                description: nls.localize(68, null),
                default: false
            },
            'debug.openDebug': {
                enum: ['neverOpen', 'openOnSessionStart', 'openOnFirstSessionStart', 'openOnDebugBreak'],
                default: 'openOnDebugBreak',
                description: nls.localize(69, null)
            },
            'debug.showSubSessionsInToolBar': {
                type: 'boolean',
                description: nls.localize(70, null),
                default: false
            },
            'debug.console.fontSize': {
                type: 'number',
                description: nls.localize(71, null),
                default: platform_1.$j ? 12 : 14,
            },
            'debug.console.fontFamily': {
                type: 'string',
                description: nls.localize(72, null),
                default: 'default'
            },
            'debug.console.lineHeight': {
                type: 'number',
                description: nls.localize(73, null),
                default: 0
            },
            'debug.console.wordWrap': {
                type: 'boolean',
                description: nls.localize(74, null),
                default: true
            },
            'debug.console.historySuggestions': {
                type: 'boolean',
                description: nls.localize(75, null),
                default: true
            },
            'debug.console.collapseIdenticalLines': {
                type: 'boolean',
                description: nls.localize(76, null),
                default: true
            },
            'debug.console.acceptSuggestionOnEnter': {
                enum: ['off', 'on'],
                description: nls.localize(77, null),
                default: 'off'
            },
            'launch': {
                type: 'object',
                description: nls.localize(78, null),
                default: { configurations: [], compounds: [] },
                $ref: configuration_1.$_D
            },
            'debug.focusWindowOnBreak': {
                type: 'boolean',
                description: nls.localize(79, null),
                default: true
            },
            'debug.focusEditorOnBreak': {
                type: 'boolean',
                description: nls.localize(80, null),
                default: true
            },
            'debug.onTaskErrors': {
                enum: ['debugAnyway', 'showErrors', 'prompt', 'abort'],
                enumDescriptions: [nls.localize(81, null), nls.localize(82, null), nls.localize(83, null), nls.localize(84, null)],
                description: nls.localize(85, null),
                default: 'prompt'
            },
            'debug.showBreakpointsInOverviewRuler': {
                type: 'boolean',
                description: nls.localize(86, null),
                default: false
            },
            'debug.showInlineBreakpointCandidates': {
                type: 'boolean',
                description: nls.localize(87, null),
                default: true
            },
            'debug.saveBeforeStart': {
                description: nls.localize(88, null),
                enum: ['allEditorsInActiveGroup', 'nonUntitledEditorsInActiveGroup', 'none'],
                enumDescriptions: [
                    nls.localize(89, null),
                    nls.localize(90, null),
                    nls.localize(91, null),
                ],
                default: 'allEditorsInActiveGroup',
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */
            },
            'debug.confirmOnExit': {
                description: nls.localize(92, null),
                type: 'string',
                enum: ['never', 'always'],
                enumDescriptions: [
                    nls.localize(93, null),
                    nls.localize(94, null),
                ],
                default: 'never'
            },
            'debug.disassemblyView.showSourceCode': {
                type: 'boolean',
                default: true,
                description: nls.localize(95, null)
            },
            'debug.autoExpandLazyVariables': {
                type: 'boolean',
                default: false,
                description: nls.localize(96, null)
            },
            'debug.enableStatusBarColor': {
                type: 'boolean',
                description: nls.localize(97, null),
                default: true
            }
        }
    });
});
//# sourceMappingURL=debug.contribution.js.map