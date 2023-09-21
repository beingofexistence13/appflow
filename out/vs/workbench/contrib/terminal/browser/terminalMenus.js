/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/actions", "vs/base/common/codicons", "vs/base/common/network", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/terminal/common/terminal", "vs/workbench/common/contextkeys", "vs/workbench/contrib/tasks/common/taskService", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/workbench/contrib/terminal/common/terminalStrings", "vs/workbench/services/editor/common/editorService"], function (require, exports, actions_1, codicons_1, network_1, nls_1, actions_2, contextkey_1, terminal_1, contextkeys_1, taskService_1, terminal_2, terminalContextKey_1, terminalStrings_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getTerminalActionBarArgs = exports.setupTerminalMenus = exports.TerminalMenuBarGroup = void 0;
    var ContextMenuGroup;
    (function (ContextMenuGroup) {
        ContextMenuGroup["Create"] = "1_create";
        ContextMenuGroup["Edit"] = "2_edit";
        ContextMenuGroup["Clear"] = "3_clear";
        ContextMenuGroup["Kill"] = "4_kill";
        ContextMenuGroup["Config"] = "5_config";
    })(ContextMenuGroup || (ContextMenuGroup = {}));
    var TerminalMenuBarGroup;
    (function (TerminalMenuBarGroup) {
        TerminalMenuBarGroup["Create"] = "1_create";
        TerminalMenuBarGroup["Run"] = "2_run";
        TerminalMenuBarGroup["Manage"] = "3_manage";
        TerminalMenuBarGroup["Configure"] = "4_configure";
    })(TerminalMenuBarGroup || (exports.TerminalMenuBarGroup = TerminalMenuBarGroup = {}));
    function setupTerminalMenus() {
        actions_2.MenuRegistry.appendMenuItems([
            {
                id: actions_2.MenuId.MenubarTerminalMenu,
                item: {
                    group: "1_create" /* TerminalMenuBarGroup.Create */,
                    command: {
                        id: "workbench.action.terminal.new" /* TerminalCommandId.New */,
                        title: (0, nls_1.localize)({ key: 'miNewTerminal', comment: ['&& denotes a mnemonic'] }, "&&New Terminal")
                    },
                    order: 1
                }
            },
            {
                id: actions_2.MenuId.MenubarTerminalMenu,
                item: {
                    group: "1_create" /* TerminalMenuBarGroup.Create */,
                    command: {
                        id: "workbench.action.terminal.split" /* TerminalCommandId.Split */,
                        title: (0, nls_1.localize)({ key: 'miSplitTerminal', comment: ['&& denotes a mnemonic'] }, "&&Split Terminal"),
                        precondition: contextkey_1.ContextKeyExpr.has("terminalIsOpen" /* TerminalContextKeyStrings.IsOpen */)
                    },
                    order: 2,
                    when: terminalContextKey_1.TerminalContextKeys.processSupported
                }
            },
            {
                id: actions_2.MenuId.MenubarTerminalMenu,
                item: {
                    group: "2_run" /* TerminalMenuBarGroup.Run */,
                    command: {
                        id: "workbench.action.terminal.runActiveFile" /* TerminalCommandId.RunActiveFile */,
                        title: (0, nls_1.localize)({ key: 'miRunActiveFile', comment: ['&& denotes a mnemonic'] }, "Run &&Active File")
                    },
                    order: 3,
                    when: terminalContextKey_1.TerminalContextKeys.processSupported
                }
            },
            {
                id: actions_2.MenuId.MenubarTerminalMenu,
                item: {
                    group: "2_run" /* TerminalMenuBarGroup.Run */,
                    command: {
                        id: "workbench.action.terminal.runSelectedText" /* TerminalCommandId.RunSelectedText */,
                        title: (0, nls_1.localize)({ key: 'miRunSelectedText', comment: ['&& denotes a mnemonic'] }, "Run &&Selected Text")
                    },
                    order: 4,
                    when: terminalContextKey_1.TerminalContextKeys.processSupported
                }
            }
        ]);
        actions_2.MenuRegistry.appendMenuItems([
            {
                id: actions_2.MenuId.TerminalInstanceContext,
                item: {
                    group: "1_create" /* ContextMenuGroup.Create */,
                    command: {
                        id: "workbench.action.terminal.split" /* TerminalCommandId.Split */,
                        title: terminalStrings_1.terminalStrings.split.value
                    }
                }
            },
            {
                id: actions_2.MenuId.TerminalInstanceContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.new" /* TerminalCommandId.New */,
                        title: terminalStrings_1.terminalStrings.new
                    },
                    group: "1_create" /* ContextMenuGroup.Create */
                }
            },
            {
                id: actions_2.MenuId.TerminalInstanceContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.killViewOrEditor" /* TerminalCommandId.KillViewOrEditor */,
                        title: terminalStrings_1.terminalStrings.kill.value,
                    },
                    group: "4_kill" /* ContextMenuGroup.Kill */
                }
            },
            {
                id: actions_2.MenuId.TerminalInstanceContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.copySelection" /* TerminalCommandId.CopySelection */,
                        title: (0, nls_1.localize)('workbench.action.terminal.copySelection.short', "Copy")
                    },
                    group: "2_edit" /* ContextMenuGroup.Edit */,
                    order: 1
                }
            },
            {
                id: actions_2.MenuId.TerminalInstanceContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.copySelectionAsHtml" /* TerminalCommandId.CopySelectionAsHtml */,
                        title: (0, nls_1.localize)('workbench.action.terminal.copySelectionAsHtml', "Copy as HTML")
                    },
                    group: "2_edit" /* ContextMenuGroup.Edit */,
                    order: 2
                }
            },
            {
                id: actions_2.MenuId.TerminalInstanceContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.paste" /* TerminalCommandId.Paste */,
                        title: (0, nls_1.localize)('workbench.action.terminal.paste.short', "Paste")
                    },
                    group: "2_edit" /* ContextMenuGroup.Edit */,
                    order: 3
                }
            },
            {
                id: actions_2.MenuId.TerminalInstanceContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.clear" /* TerminalCommandId.Clear */,
                        title: (0, nls_1.localize)('workbench.action.terminal.clear', "Clear")
                    },
                    group: "3_clear" /* ContextMenuGroup.Clear */,
                }
            },
            {
                id: actions_2.MenuId.TerminalInstanceContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.sizeToContentWidth" /* TerminalCommandId.SizeToContentWidth */,
                        title: terminalStrings_1.terminalStrings.toggleSizeToContentWidth
                    },
                    group: "5_config" /* ContextMenuGroup.Config */
                }
            },
            {
                id: actions_2.MenuId.TerminalInstanceContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.selectAll" /* TerminalCommandId.SelectAll */,
                        title: (0, nls_1.localize)('workbench.action.terminal.selectAll', "Select All"),
                    },
                    group: "2_edit" /* ContextMenuGroup.Edit */,
                    order: 3
                }
            },
        ]);
        actions_2.MenuRegistry.appendMenuItems([
            {
                id: actions_2.MenuId.TerminalEditorInstanceContext,
                item: {
                    group: "1_create" /* ContextMenuGroup.Create */,
                    command: {
                        id: "workbench.action.terminal.split" /* TerminalCommandId.Split */,
                        title: terminalStrings_1.terminalStrings.split.value
                    }
                }
            },
            {
                id: actions_2.MenuId.TerminalEditorInstanceContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.new" /* TerminalCommandId.New */,
                        title: terminalStrings_1.terminalStrings.new
                    },
                    group: "1_create" /* ContextMenuGroup.Create */
                }
            },
            {
                id: actions_2.MenuId.TerminalEditorInstanceContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.killEditor" /* TerminalCommandId.KillEditor */,
                        title: terminalStrings_1.terminalStrings.kill.value
                    },
                    group: "4_kill" /* ContextMenuGroup.Kill */
                }
            },
            {
                id: actions_2.MenuId.TerminalEditorInstanceContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.copySelection" /* TerminalCommandId.CopySelection */,
                        title: (0, nls_1.localize)('workbench.action.terminal.copySelection.short', "Copy")
                    },
                    group: "2_edit" /* ContextMenuGroup.Edit */,
                    order: 1
                }
            },
            {
                id: actions_2.MenuId.TerminalEditorInstanceContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.copySelectionAsHtml" /* TerminalCommandId.CopySelectionAsHtml */,
                        title: (0, nls_1.localize)('workbench.action.terminal.copySelectionAsHtml', "Copy as HTML")
                    },
                    group: "2_edit" /* ContextMenuGroup.Edit */,
                    order: 2
                }
            },
            {
                id: actions_2.MenuId.TerminalEditorInstanceContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.paste" /* TerminalCommandId.Paste */,
                        title: (0, nls_1.localize)('workbench.action.terminal.paste.short', "Paste")
                    },
                    group: "2_edit" /* ContextMenuGroup.Edit */,
                    order: 3
                }
            },
            {
                id: actions_2.MenuId.TerminalEditorInstanceContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.clear" /* TerminalCommandId.Clear */,
                        title: (0, nls_1.localize)('workbench.action.terminal.clear', "Clear")
                    },
                    group: "3_clear" /* ContextMenuGroup.Clear */,
                }
            },
            {
                id: actions_2.MenuId.TerminalEditorInstanceContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.selectAll" /* TerminalCommandId.SelectAll */,
                        title: (0, nls_1.localize)('workbench.action.terminal.selectAll', "Select All"),
                    },
                    group: "2_edit" /* ContextMenuGroup.Edit */,
                    order: 3
                }
            },
            {
                id: actions_2.MenuId.TerminalEditorInstanceContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.sizeToContentWidth" /* TerminalCommandId.SizeToContentWidth */,
                        title: terminalStrings_1.terminalStrings.toggleSizeToContentWidth
                    },
                    group: "5_config" /* ContextMenuGroup.Config */
                }
            }
        ]);
        actions_2.MenuRegistry.appendMenuItems([
            {
                id: actions_2.MenuId.TerminalTabEmptyAreaContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.newWithProfile" /* TerminalCommandId.NewWithProfile */,
                        title: (0, nls_1.localize)('workbench.action.terminal.newWithProfile.short', "New Terminal With Profile")
                    },
                    group: "1_create" /* ContextMenuGroup.Create */
                }
            },
            {
                id: actions_2.MenuId.TerminalTabEmptyAreaContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.new" /* TerminalCommandId.New */,
                        title: terminalStrings_1.terminalStrings.new
                    },
                    group: "1_create" /* ContextMenuGroup.Create */
                }
            }
        ]);
        actions_2.MenuRegistry.appendMenuItems([
            {
                id: actions_2.MenuId.TerminalNewDropdownContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.selectDefaultShell" /* TerminalCommandId.SelectDefaultProfile */,
                        title: { value: (0, nls_1.localize)('workbench.action.terminal.selectDefaultProfile', "Select Default Profile"), original: 'Select Default Profile' },
                    },
                    group: '3_configure'
                }
            },
            {
                id: actions_2.MenuId.TerminalNewDropdownContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.openSettings" /* TerminalCommandId.ConfigureTerminalSettings */,
                        title: (0, nls_1.localize)('workbench.action.terminal.openSettings', "Configure Terminal Settings")
                    },
                    group: '3_configure'
                }
            },
            {
                id: actions_2.MenuId.TerminalNewDropdownContext,
                item: {
                    command: {
                        id: 'workbench.action.tasks.runTask',
                        title: (0, nls_1.localize)('workbench.action.tasks.runTask', "Run Task...")
                    },
                    when: taskService_1.TaskExecutionSupportedContext,
                    group: '4_tasks',
                    order: 1
                },
            },
            {
                id: actions_2.MenuId.TerminalNewDropdownContext,
                item: {
                    command: {
                        id: 'workbench.action.tasks.configureTaskRunner',
                        title: (0, nls_1.localize)('workbench.action.tasks.configureTaskRunner', "Configure Tasks...")
                    },
                    when: taskService_1.TaskExecutionSupportedContext,
                    group: '4_tasks',
                    order: 2
                },
            }
        ]);
        actions_2.MenuRegistry.appendMenuItems([
            {
                id: actions_2.MenuId.ViewTitle,
                item: {
                    command: {
                        id: "workbench.action.terminal.switchTerminal" /* TerminalCommandId.SwitchTerminal */,
                        title: { value: (0, nls_1.localize)('workbench.action.terminal.switchTerminal', "Switch Terminal"), original: 'Switch Terminal' }
                    },
                    group: 'navigation',
                    order: 0,
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', terminal_2.TERMINAL_VIEW_ID), contextkey_1.ContextKeyExpr.not(`config.${"terminal.integrated.tabs.enabled" /* TerminalSettingId.TabsEnabled */}`)),
                }
            },
            {
                // This is used to show instead of tabs when there is only a single terminal
                id: actions_2.MenuId.ViewTitle,
                item: {
                    command: {
                        id: "workbench.action.terminal.focus" /* TerminalCommandId.Focus */,
                        title: terminalStrings_1.terminalStrings.focus
                    },
                    alt: {
                        id: "workbench.action.terminal.split" /* TerminalCommandId.Split */,
                        title: terminalStrings_1.terminalStrings.split.value,
                        icon: codicons_1.Codicon.splitHorizontal
                    },
                    group: 'navigation',
                    order: 0,
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', terminal_2.TERMINAL_VIEW_ID), contextkey_1.ContextKeyExpr.has(`config.${"terminal.integrated.tabs.enabled" /* TerminalSettingId.TabsEnabled */}`), contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals(`config.${"terminal.integrated.tabs.showActiveTerminal" /* TerminalSettingId.TabsShowActiveTerminal */}`, 'singleTerminal'), contextkey_1.ContextKeyExpr.equals("terminalCount" /* TerminalContextKeyStrings.Count */, 1)), contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals(`config.${"terminal.integrated.tabs.showActiveTerminal" /* TerminalSettingId.TabsShowActiveTerminal */}`, 'singleTerminalOrNarrow'), contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.equals("terminalCount" /* TerminalContextKeyStrings.Count */, 1), contextkey_1.ContextKeyExpr.has("isTerminalTabsNarrow" /* TerminalContextKeyStrings.TabsNarrow */))), contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals(`config.${"terminal.integrated.tabs.showActiveTerminal" /* TerminalSettingId.TabsShowActiveTerminal */}`, 'singleGroup'), contextkey_1.ContextKeyExpr.equals("terminalGroupCount" /* TerminalContextKeyStrings.GroupCount */, 1)), contextkey_1.ContextKeyExpr.equals(`config.${"terminal.integrated.tabs.showActiveTerminal" /* TerminalSettingId.TabsShowActiveTerminal */}`, 'always'))),
                }
            },
            {
                id: actions_2.MenuId.ViewTitle,
                item: {
                    command: {
                        id: "workbench.action.terminal.split" /* TerminalCommandId.Split */,
                        title: terminalStrings_1.terminalStrings.split,
                        icon: codicons_1.Codicon.splitHorizontal
                    },
                    group: 'navigation',
                    order: 2,
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', terminal_2.TERMINAL_VIEW_ID), contextkey_1.ContextKeyExpr.notEquals(`config.${"terminal.integrated.tabs.hideCondition" /* TerminalSettingId.TabsHideCondition */}`, 'never'), contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.not(`config.${"terminal.integrated.tabs.enabled" /* TerminalSettingId.TabsEnabled */}`), contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals(`config.${"terminal.integrated.tabs.showActions" /* TerminalSettingId.TabsShowActions */}`, 'singleTerminal'), contextkey_1.ContextKeyExpr.equals("terminalCount" /* TerminalContextKeyStrings.Count */, 1)), contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals(`config.${"terminal.integrated.tabs.showActions" /* TerminalSettingId.TabsShowActions */}`, 'singleTerminalOrNarrow'), contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.equals("terminalCount" /* TerminalContextKeyStrings.Count */, 1), contextkey_1.ContextKeyExpr.has("isTerminalTabsNarrow" /* TerminalContextKeyStrings.TabsNarrow */))), contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals(`config.${"terminal.integrated.tabs.showActions" /* TerminalSettingId.TabsShowActions */}`, 'singleGroup'), contextkey_1.ContextKeyExpr.equals("terminalGroupCount" /* TerminalContextKeyStrings.GroupCount */, 1)), contextkey_1.ContextKeyExpr.equals(`config.${"terminal.integrated.tabs.showActions" /* TerminalSettingId.TabsShowActions */}`, 'always')))
                }
            },
            {
                id: actions_2.MenuId.ViewTitle,
                item: {
                    command: {
                        id: "workbench.action.terminal.kill" /* TerminalCommandId.Kill */,
                        title: terminalStrings_1.terminalStrings.kill,
                        icon: codicons_1.Codicon.trash
                    },
                    group: 'navigation',
                    order: 3,
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', terminal_2.TERMINAL_VIEW_ID), contextkey_1.ContextKeyExpr.notEquals(`config.${"terminal.integrated.tabs.hideCondition" /* TerminalSettingId.TabsHideCondition */}`, 'never'), contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.not(`config.${"terminal.integrated.tabs.enabled" /* TerminalSettingId.TabsEnabled */}`), contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals(`config.${"terminal.integrated.tabs.showActions" /* TerminalSettingId.TabsShowActions */}`, 'singleTerminal'), contextkey_1.ContextKeyExpr.equals("terminalCount" /* TerminalContextKeyStrings.Count */, 1)), contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals(`config.${"terminal.integrated.tabs.showActions" /* TerminalSettingId.TabsShowActions */}`, 'singleTerminalOrNarrow'), contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.equals("terminalCount" /* TerminalContextKeyStrings.Count */, 1), contextkey_1.ContextKeyExpr.has("isTerminalTabsNarrow" /* TerminalContextKeyStrings.TabsNarrow */))), contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals(`config.${"terminal.integrated.tabs.showActions" /* TerminalSettingId.TabsShowActions */}`, 'singleGroup'), contextkey_1.ContextKeyExpr.equals("terminalGroupCount" /* TerminalContextKeyStrings.GroupCount */, 1)), contextkey_1.ContextKeyExpr.equals(`config.${"terminal.integrated.tabs.showActions" /* TerminalSettingId.TabsShowActions */}`, 'always')))
                }
            },
            {
                id: actions_2.MenuId.ViewTitle,
                item: {
                    command: {
                        id: "workbench.action.terminal.new" /* TerminalCommandId.New */,
                        title: terminalStrings_1.terminalStrings.new,
                        icon: codicons_1.Codicon.plus
                    },
                    alt: {
                        id: "workbench.action.terminal.split" /* TerminalCommandId.Split */,
                        title: terminalStrings_1.terminalStrings.split.value,
                        icon: codicons_1.Codicon.splitHorizontal
                    },
                    group: 'navigation',
                    order: 0,
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', terminal_2.TERMINAL_VIEW_ID), contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.webExtensionContributedProfile, terminalContextKey_1.TerminalContextKeys.processSupported))
                }
            },
            {
                id: actions_2.MenuId.ViewTitle,
                item: {
                    command: {
                        id: "workbench.action.terminal.clear" /* TerminalCommandId.Clear */,
                        title: (0, nls_1.localize)('workbench.action.terminal.clearLong', "Clear Terminal"),
                        icon: codicons_1.Codicon.clearAll
                    },
                    group: 'navigation',
                    order: 4,
                    when: contextkey_1.ContextKeyExpr.equals('view', terminal_2.TERMINAL_VIEW_ID),
                    isHiddenByDefault: true
                }
            },
            {
                id: actions_2.MenuId.ViewTitle,
                item: {
                    command: {
                        id: "workbench.action.terminal.runActiveFile" /* TerminalCommandId.RunActiveFile */,
                        title: (0, nls_1.localize)('workbench.action.terminal.runActiveFile', "Run Active File"),
                        icon: codicons_1.Codicon.run
                    },
                    group: 'navigation',
                    order: 5,
                    when: contextkey_1.ContextKeyExpr.equals('view', terminal_2.TERMINAL_VIEW_ID),
                    isHiddenByDefault: true
                }
            },
            {
                id: actions_2.MenuId.ViewTitle,
                item: {
                    command: {
                        id: "workbench.action.terminal.runSelectedText" /* TerminalCommandId.RunSelectedText */,
                        title: (0, nls_1.localize)('workbench.action.terminal.runSelectedText', "Run Selected Text"),
                        icon: codicons_1.Codicon.selection
                    },
                    group: 'navigation',
                    order: 6,
                    when: contextkey_1.ContextKeyExpr.equals('view', terminal_2.TERMINAL_VIEW_ID),
                    isHiddenByDefault: true
                }
            },
        ]);
        actions_2.MenuRegistry.appendMenuItems([
            {
                id: actions_2.MenuId.TerminalTabContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.splitActiveTab" /* TerminalCommandId.SplitActiveTab */,
                        title: terminalStrings_1.terminalStrings.split.value,
                    },
                    group: "1_create" /* ContextMenuGroup.Create */,
                    order: 1
                }
            },
            {
                id: actions_2.MenuId.TerminalTabContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.moveToEditorActiveTab" /* TerminalCommandId.MoveToEditorActiveTab */,
                        title: terminalStrings_1.terminalStrings.moveToEditor.value
                    },
                    group: "1_create" /* ContextMenuGroup.Create */,
                    order: 2
                }
            },
            {
                id: actions_2.MenuId.TerminalTabContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.renameActiveTab" /* TerminalCommandId.RenameActiveTab */,
                        title: (0, nls_1.localize)('workbench.action.terminal.renameInstance', "Rename...")
                    },
                    group: "2_edit" /* ContextMenuGroup.Edit */
                }
            },
            {
                id: actions_2.MenuId.TerminalTabContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.changeIconActiveTab" /* TerminalCommandId.ChangeIconActiveTab */,
                        title: (0, nls_1.localize)('workbench.action.terminal.changeIcon', "Change Icon...")
                    },
                    group: "2_edit" /* ContextMenuGroup.Edit */
                }
            },
            {
                id: actions_2.MenuId.TerminalTabContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.changeColorActiveTab" /* TerminalCommandId.ChangeColorActiveTab */,
                        title: (0, nls_1.localize)('workbench.action.terminal.changeColor', "Change Color...")
                    },
                    group: "2_edit" /* ContextMenuGroup.Edit */
                }
            },
            {
                id: actions_2.MenuId.TerminalTabContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.sizeToContentWidthActiveTab" /* TerminalCommandId.SizeToContentWidthActiveTab */,
                        title: (0, nls_1.localize)('workbench.action.terminal.sizeToContentWidthInstance', "Toggle Size to Content Width")
                    },
                    group: "2_edit" /* ContextMenuGroup.Edit */
                }
            },
            {
                id: actions_2.MenuId.TerminalTabContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.joinActiveTab" /* TerminalCommandId.JoinActiveTab */,
                        title: (0, nls_1.localize)('workbench.action.terminal.joinInstance', "Join Terminals")
                    },
                    when: terminalContextKey_1.TerminalContextKeys.tabsSingularSelection.toNegated(),
                    group: "5_config" /* ContextMenuGroup.Config */
                }
            },
            {
                id: actions_2.MenuId.TerminalTabContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.unsplitActiveTab" /* TerminalCommandId.UnsplitActiveTab */,
                        title: terminalStrings_1.terminalStrings.unsplit.value
                    },
                    when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.tabsSingularSelection, terminalContextKey_1.TerminalContextKeys.splitTerminal),
                    group: "5_config" /* ContextMenuGroup.Config */
                }
            },
            {
                id: actions_2.MenuId.TerminalTabContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.killActiveTab" /* TerminalCommandId.KillActiveTab */,
                        title: terminalStrings_1.terminalStrings.kill.value
                    },
                    group: "4_kill" /* ContextMenuGroup.Kill */,
                }
            }
        ]);
        actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.EditorTitleContext, {
            command: {
                id: "workbench.action.terminal.moveToTerminalPanel" /* TerminalCommandId.MoveToTerminalPanel */,
                title: terminalStrings_1.terminalStrings.moveToTerminalPanel
            },
            when: contextkeys_1.ResourceContextKey.Scheme.isEqualTo(network_1.Schemas.vscodeTerminal),
            group: '2_files'
        });
        actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.EditorTitleContext, {
            command: {
                id: "workbench.action.terminal.rename" /* TerminalCommandId.Rename */,
                title: terminalStrings_1.terminalStrings.rename
            },
            when: contextkeys_1.ResourceContextKey.Scheme.isEqualTo(network_1.Schemas.vscodeTerminal),
            group: '3_files'
        });
        actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.EditorTitleContext, {
            command: {
                id: "workbench.action.terminal.changeColor" /* TerminalCommandId.ChangeColor */,
                title: terminalStrings_1.terminalStrings.changeColor
            },
            when: contextkeys_1.ResourceContextKey.Scheme.isEqualTo(network_1.Schemas.vscodeTerminal),
            group: '3_files'
        });
        actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.EditorTitleContext, {
            command: {
                id: "workbench.action.terminal.changeIcon" /* TerminalCommandId.ChangeIcon */,
                title: terminalStrings_1.terminalStrings.changeIcon
            },
            when: contextkeys_1.ResourceContextKey.Scheme.isEqualTo(network_1.Schemas.vscodeTerminal),
            group: '3_files'
        });
        actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.EditorTitleContext, {
            command: {
                id: "workbench.action.terminal.sizeToContentWidth" /* TerminalCommandId.SizeToContentWidth */,
                title: terminalStrings_1.terminalStrings.toggleSizeToContentWidth
            },
            when: contextkeys_1.ResourceContextKey.Scheme.isEqualTo(network_1.Schemas.vscodeTerminal),
            group: '3_files'
        });
        actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.EditorTitle, {
            command: {
                id: "workbench.action.createTerminalEditorSameGroup" /* TerminalCommandId.CreateTerminalEditorSameGroup */,
                title: terminalStrings_1.terminalStrings.new,
                icon: codicons_1.Codicon.plus
            },
            alt: {
                id: "workbench.action.terminal.split" /* TerminalCommandId.Split */,
                title: terminalStrings_1.terminalStrings.split.value,
                icon: codicons_1.Codicon.splitHorizontal
            },
            group: 'navigation',
            order: 0,
            when: contextkeys_1.ResourceContextKey.Scheme.isEqualTo(network_1.Schemas.vscodeTerminal)
        });
    }
    exports.setupTerminalMenus = setupTerminalMenus;
    function getTerminalActionBarArgs(location, profiles, defaultProfileName, contributedProfiles, terminalService, dropdownMenu) {
        let dropdownActions = [];
        let submenuActions = [];
        profiles = profiles.filter(e => !e.isAutoDetected);
        const splitLocation = (location === terminal_1.TerminalLocation.Editor || (typeof location === 'object' && 'viewColumn' in location && location.viewColumn === editorService_1.ACTIVE_GROUP)) ? { viewColumn: editorService_1.SIDE_GROUP } : { splitActiveTerminal: true };
        for (const p of profiles) {
            const isDefault = p.profileName === defaultProfileName;
            const options = { config: p, location };
            const splitOptions = { config: p, location: splitLocation };
            const sanitizedProfileName = p.profileName.replace(/[\n\r\t]/g, '');
            dropdownActions.push(new actions_1.Action("workbench.action.terminal.newWithProfile" /* TerminalCommandId.NewWithProfile */, isDefault ? (0, nls_1.localize)('defaultTerminalProfile', "{0} (Default)", sanitizedProfileName) : sanitizedProfileName, undefined, true, async () => {
                const instance = await terminalService.createTerminal(options);
                terminalService.setActiveInstance(instance);
                await terminalService.focusActiveInstance();
            }));
            submenuActions.push(new actions_1.Action("workbench.action.terminal.split" /* TerminalCommandId.Split */, isDefault ? (0, nls_1.localize)('defaultTerminalProfile', "{0} (Default)", sanitizedProfileName) : sanitizedProfileName, undefined, true, async () => {
                const instance = await terminalService.createTerminal(splitOptions);
                terminalService.setActiveInstance(instance);
                await terminalService.focusActiveInstance();
            }));
        }
        for (const contributed of contributedProfiles) {
            const isDefault = contributed.title === defaultProfileName;
            const title = isDefault ? (0, nls_1.localize)('defaultTerminalProfile', "{0} (Default)", contributed.title.replace(/[\n\r\t]/g, '')) : contributed.title.replace(/[\n\r\t]/g, '');
            dropdownActions.push(new actions_1.Action('contributed', title, undefined, true, () => terminalService.createTerminal({
                config: {
                    extensionIdentifier: contributed.extensionIdentifier,
                    id: contributed.id,
                    title
                },
                location
            })));
            submenuActions.push(new actions_1.Action('contributed-split', title, undefined, true, () => terminalService.createTerminal({
                config: {
                    extensionIdentifier: contributed.extensionIdentifier,
                    id: contributed.id,
                    title
                },
                location: splitLocation
            })));
        }
        const defaultProfileAction = dropdownActions.find(d => d.label.endsWith('(Default)'));
        if (defaultProfileAction) {
            dropdownActions = dropdownActions.filter(d => d !== defaultProfileAction).sort((a, b) => a.label.localeCompare(b.label));
            dropdownActions.unshift(defaultProfileAction);
        }
        if (dropdownActions.length > 0) {
            dropdownActions.push(new actions_1.SubmenuAction('split.profile', (0, nls_1.localize)('splitTerminal', 'Split Terminal'), submenuActions));
            dropdownActions.push(new actions_1.Separator());
        }
        const actions = dropdownMenu.getActions();
        dropdownActions.push(...actions_1.Separator.join(...actions.map(a => a[1])));
        const defaultSubmenuProfileAction = submenuActions.find(d => d.label.endsWith('(Default)'));
        if (defaultSubmenuProfileAction) {
            submenuActions = submenuActions.filter(d => d !== defaultSubmenuProfileAction).sort((a, b) => a.label.localeCompare(b.label));
            submenuActions.unshift(defaultSubmenuProfileAction);
        }
        const dropdownAction = new actions_1.Action('refresh profiles', 'Launch Profile...', 'codicon-chevron-down', true);
        return { dropdownAction, dropdownMenuActions: dropdownActions, className: `terminal-tab-actions-${terminalService.resolveLocation(location)}` };
    }
    exports.getTerminalActionBarArgs = getTerminalActionBarArgs;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxNZW51cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsL2Jyb3dzZXIvdGVybWluYWxNZW51cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFpQmhHLElBQVcsZ0JBTVY7SUFORCxXQUFXLGdCQUFnQjtRQUMxQix1Q0FBbUIsQ0FBQTtRQUNuQixtQ0FBZSxDQUFBO1FBQ2YscUNBQWlCLENBQUE7UUFDakIsbUNBQWUsQ0FBQTtRQUNmLHVDQUFtQixDQUFBO0lBQ3BCLENBQUMsRUFOVSxnQkFBZ0IsS0FBaEIsZ0JBQWdCLFFBTTFCO0lBRUQsSUFBa0Isb0JBS2pCO0lBTEQsV0FBa0Isb0JBQW9CO1FBQ3JDLDJDQUFtQixDQUFBO1FBQ25CLHFDQUFhLENBQUE7UUFDYiwyQ0FBbUIsQ0FBQTtRQUNuQixpREFBeUIsQ0FBQTtJQUMxQixDQUFDLEVBTGlCLG9CQUFvQixvQ0FBcEIsb0JBQW9CLFFBS3JDO0lBRUQsU0FBZ0Isa0JBQWtCO1FBQ2pDLHNCQUFZLENBQUMsZUFBZSxDQUMzQjtZQUNDO2dCQUNDLEVBQUUsRUFBRSxnQkFBTSxDQUFDLG1CQUFtQjtnQkFDOUIsSUFBSSxFQUFFO29CQUNMLEtBQUssOENBQTZCO29CQUNsQyxPQUFPLEVBQUU7d0JBQ1IsRUFBRSw2REFBdUI7d0JBQ3pCLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxFQUFFLEdBQUcsRUFBRSxlQUFlLEVBQUUsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLGdCQUFnQixDQUFDO3FCQUMvRjtvQkFDRCxLQUFLLEVBQUUsQ0FBQztpQkFDUjthQUNEO1lBQ0Q7Z0JBQ0MsRUFBRSxFQUFFLGdCQUFNLENBQUMsbUJBQW1CO2dCQUM5QixJQUFJLEVBQUU7b0JBQ0wsS0FBSyw4Q0FBNkI7b0JBQ2xDLE9BQU8sRUFBRTt3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