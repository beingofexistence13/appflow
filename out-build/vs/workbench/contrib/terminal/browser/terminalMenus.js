/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/actions", "vs/base/common/codicons", "vs/base/common/network", "vs/nls!vs/workbench/contrib/terminal/browser/terminalMenus", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/terminal/common/terminal", "vs/workbench/common/contextkeys", "vs/workbench/contrib/tasks/common/taskService", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/workbench/contrib/terminal/common/terminalStrings", "vs/workbench/services/editor/common/editorService"], function (require, exports, actions_1, codicons_1, network_1, nls_1, actions_2, contextkey_1, terminal_1, contextkeys_1, taskService_1, terminal_2, terminalContextKey_1, terminalStrings_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ZVb = exports.$YVb = exports.TerminalMenuBarGroup = void 0;
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
    function $YVb() {
        actions_2.$Tu.appendMenuItems([
            {
                id: actions_2.$Ru.MenubarTerminalMenu,
                item: {
                    group: "1_create" /* TerminalMenuBarGroup.Create */,
                    command: {
                        id: "workbench.action.terminal.new" /* TerminalCommandId.New */,
                        title: (0, nls_1.localize)(0, null)
                    },
                    order: 1
                }
            },
            {
                id: actions_2.$Ru.MenubarTerminalMenu,
                item: {
                    group: "1_create" /* TerminalMenuBarGroup.Create */,
                    command: {
                        id: "workbench.action.terminal.split" /* TerminalCommandId.Split */,
                        title: (0, nls_1.localize)(1, null),
                        precondition: contextkey_1.$Ii.has("terminalIsOpen" /* TerminalContextKeyStrings.IsOpen */)
                    },
                    order: 2,
                    when: terminalContextKey_1.TerminalContextKeys.processSupported
                }
            },
            {
                id: actions_2.$Ru.MenubarTerminalMenu,
                item: {
                    group: "2_run" /* TerminalMenuBarGroup.Run */,
                    command: {
                        id: "workbench.action.terminal.runActiveFile" /* TerminalCommandId.RunActiveFile */,
                        title: (0, nls_1.localize)(2, null)
                    },
                    order: 3,
                    when: terminalContextKey_1.TerminalContextKeys.processSupported
                }
            },
            {
                id: actions_2.$Ru.MenubarTerminalMenu,
                item: {
                    group: "2_run" /* TerminalMenuBarGroup.Run */,
                    command: {
                        id: "workbench.action.terminal.runSelectedText" /* TerminalCommandId.RunSelectedText */,
                        title: (0, nls_1.localize)(3, null)
                    },
                    order: 4,
                    when: terminalContextKey_1.TerminalContextKeys.processSupported
                }
            }
        ]);
        actions_2.$Tu.appendMenuItems([
            {
                id: actions_2.$Ru.TerminalInstanceContext,
                item: {
                    group: "1_create" /* ContextMenuGroup.Create */,
                    command: {
                        id: "workbench.action.terminal.split" /* TerminalCommandId.Split */,
                        title: terminalStrings_1.$pVb.split.value
                    }
                }
            },
            {
                id: actions_2.$Ru.TerminalInstanceContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.new" /* TerminalCommandId.New */,
                        title: terminalStrings_1.$pVb.new
                    },
                    group: "1_create" /* ContextMenuGroup.Create */
                }
            },
            {
                id: actions_2.$Ru.TerminalInstanceContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.killViewOrEditor" /* TerminalCommandId.KillViewOrEditor */,
                        title: terminalStrings_1.$pVb.kill.value,
                    },
                    group: "4_kill" /* ContextMenuGroup.Kill */
                }
            },
            {
                id: actions_2.$Ru.TerminalInstanceContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.copySelection" /* TerminalCommandId.CopySelection */,
                        title: (0, nls_1.localize)(4, null)
                    },
                    group: "2_edit" /* ContextMenuGroup.Edit */,
                    order: 1
                }
            },
            {
                id: actions_2.$Ru.TerminalInstanceContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.copySelectionAsHtml" /* TerminalCommandId.CopySelectionAsHtml */,
                        title: (0, nls_1.localize)(5, null)
                    },
                    group: "2_edit" /* ContextMenuGroup.Edit */,
                    order: 2
                }
            },
            {
                id: actions_2.$Ru.TerminalInstanceContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.paste" /* TerminalCommandId.Paste */,
                        title: (0, nls_1.localize)(6, null)
                    },
                    group: "2_edit" /* ContextMenuGroup.Edit */,
                    order: 3
                }
            },
            {
                id: actions_2.$Ru.TerminalInstanceContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.clear" /* TerminalCommandId.Clear */,
                        title: (0, nls_1.localize)(7, null)
                    },
                    group: "3_clear" /* ContextMenuGroup.Clear */,
                }
            },
            {
                id: actions_2.$Ru.TerminalInstanceContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.sizeToContentWidth" /* TerminalCommandId.SizeToContentWidth */,
                        title: terminalStrings_1.$pVb.toggleSizeToContentWidth
                    },
                    group: "5_config" /* ContextMenuGroup.Config */
                }
            },
            {
                id: actions_2.$Ru.TerminalInstanceContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.selectAll" /* TerminalCommandId.SelectAll */,
                        title: (0, nls_1.localize)(8, null),
                    },
                    group: "2_edit" /* ContextMenuGroup.Edit */,
                    order: 3
                }
            },
        ]);
        actions_2.$Tu.appendMenuItems([
            {
                id: actions_2.$Ru.TerminalEditorInstanceContext,
                item: {
                    group: "1_create" /* ContextMenuGroup.Create */,
                    command: {
                        id: "workbench.action.terminal.split" /* TerminalCommandId.Split */,
                        title: terminalStrings_1.$pVb.split.value
                    }
                }
            },
            {
                id: actions_2.$Ru.TerminalEditorInstanceContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.new" /* TerminalCommandId.New */,
                        title: terminalStrings_1.$pVb.new
                    },
                    group: "1_create" /* ContextMenuGroup.Create */
                }
            },
            {
                id: actions_2.$Ru.TerminalEditorInstanceContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.killEditor" /* TerminalCommandId.KillEditor */,
                        title: terminalStrings_1.$pVb.kill.value
                    },
                    group: "4_kill" /* ContextMenuGroup.Kill */
                }
            },
            {
                id: actions_2.$Ru.TerminalEditorInstanceContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.copySelection" /* TerminalCommandId.CopySelection */,
                        title: (0, nls_1.localize)(9, null)
                    },
                    group: "2_edit" /* ContextMenuGroup.Edit */,
                    order: 1
                }
            },
            {
                id: actions_2.$Ru.TerminalEditorInstanceContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.copySelectionAsHtml" /* TerminalCommandId.CopySelectionAsHtml */,
                        title: (0, nls_1.localize)(10, null)
                    },
                    group: "2_edit" /* ContextMenuGroup.Edit */,
                    order: 2
                }
            },
            {
                id: actions_2.$Ru.TerminalEditorInstanceContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.paste" /* TerminalCommandId.Paste */,
                        title: (0, nls_1.localize)(11, null)
                    },
                    group: "2_edit" /* ContextMenuGroup.Edit */,
                    order: 3
                }
            },
            {
                id: actions_2.$Ru.TerminalEditorInstanceContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.clear" /* TerminalCommandId.Clear */,
                        title: (0, nls_1.localize)(12, null)
                    },
                    group: "3_clear" /* ContextMenuGroup.Clear */,
                }
            },
            {
                id: actions_2.$Ru.TerminalEditorInstanceContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.selectAll" /* TerminalCommandId.SelectAll */,
                        title: (0, nls_1.localize)(13, null),
                    },
                    group: "2_edit" /* ContextMenuGroup.Edit */,
                    order: 3
                }
            },
            {
                id: actions_2.$Ru.TerminalEditorInstanceContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.sizeToContentWidth" /* TerminalCommandId.SizeToContentWidth */,
                        title: terminalStrings_1.$pVb.toggleSizeToContentWidth
                    },
                    group: "5_config" /* ContextMenuGroup.Config */
                }
            }
        ]);
        actions_2.$Tu.appendMenuItems([
            {
                id: actions_2.$Ru.TerminalTabEmptyAreaContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.newWithProfile" /* TerminalCommandId.NewWithProfile */,
                        title: (0, nls_1.localize)(14, null)
                    },
                    group: "1_create" /* ContextMenuGroup.Create */
                }
            },
            {
                id: actions_2.$Ru.TerminalTabEmptyAreaContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.new" /* TerminalCommandId.New */,
                        title: terminalStrings_1.$pVb.new
                    },
                    group: "1_create" /* ContextMenuGroup.Create */
                }
            }
        ]);
        actions_2.$Tu.appendMenuItems([
            {
                id: actions_2.$Ru.TerminalNewDropdownContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.selectDefaultShell" /* TerminalCommandId.SelectDefaultProfile */,
                        title: { value: (0, nls_1.localize)(15, null), original: 'Select Default Profile' },
                    },
                    group: '3_configure'
                }
            },
            {
                id: actions_2.$Ru.TerminalNewDropdownContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.openSettings" /* TerminalCommandId.ConfigureTerminalSettings */,
                        title: (0, nls_1.localize)(16, null)
                    },
                    group: '3_configure'
                }
            },
            {
                id: actions_2.$Ru.TerminalNewDropdownContext,
                item: {
                    command: {
                        id: 'workbench.action.tasks.runTask',
                        title: (0, nls_1.localize)(17, null)
                    },
                    when: taskService_1.$nsb,
                    group: '4_tasks',
                    order: 1
                },
            },
            {
                id: actions_2.$Ru.TerminalNewDropdownContext,
                item: {
                    command: {
                        id: 'workbench.action.tasks.configureTaskRunner',
                        title: (0, nls_1.localize)(18, null)
                    },
                    when: taskService_1.$nsb,
                    group: '4_tasks',
                    order: 2
                },
            }
        ]);
        actions_2.$Tu.appendMenuItems([
            {
                id: actions_2.$Ru.ViewTitle,
                item: {
                    command: {
                        id: "workbench.action.terminal.switchTerminal" /* TerminalCommandId.SwitchTerminal */,
                        title: { value: (0, nls_1.localize)(19, null), original: 'Switch Terminal' }
                    },
                    group: 'navigation',
                    order: 0,
                    when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', terminal_2.$tM), contextkey_1.$Ii.not(`config.${"terminal.integrated.tabs.enabled" /* TerminalSettingId.TabsEnabled */}`)),
                }
            },
            {
                // This is used to show instead of tabs when there is only a single terminal
                id: actions_2.$Ru.ViewTitle,
                item: {
                    command: {
                        id: "workbench.action.terminal.focus" /* TerminalCommandId.Focus */,
                        title: terminalStrings_1.$pVb.focus
                    },
                    alt: {
                        id: "workbench.action.terminal.split" /* TerminalCommandId.Split */,
                        title: terminalStrings_1.$pVb.split.value,
                        icon: codicons_1.$Pj.splitHorizontal
                    },
                    group: 'navigation',
                    order: 0,
                    when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', terminal_2.$tM), contextkey_1.$Ii.has(`config.${"terminal.integrated.tabs.enabled" /* TerminalSettingId.TabsEnabled */}`), contextkey_1.$Ii.or(contextkey_1.$Ii.and(contextkey_1.$Ii.equals(`config.${"terminal.integrated.tabs.showActiveTerminal" /* TerminalSettingId.TabsShowActiveTerminal */}`, 'singleTerminal'), contextkey_1.$Ii.equals("terminalCount" /* TerminalContextKeyStrings.Count */, 1)), contextkey_1.$Ii.and(contextkey_1.$Ii.equals(`config.${"terminal.integrated.tabs.showActiveTerminal" /* TerminalSettingId.TabsShowActiveTerminal */}`, 'singleTerminalOrNarrow'), contextkey_1.$Ii.or(contextkey_1.$Ii.equals("terminalCount" /* TerminalContextKeyStrings.Count */, 1), contextkey_1.$Ii.has("isTerminalTabsNarrow" /* TerminalContextKeyStrings.TabsNarrow */))), contextkey_1.$Ii.and(contextkey_1.$Ii.equals(`config.${"terminal.integrated.tabs.showActiveTerminal" /* TerminalSettingId.TabsShowActiveTerminal */}`, 'singleGroup'), contextkey_1.$Ii.equals("terminalGroupCount" /* TerminalContextKeyStrings.GroupCount */, 1)), contextkey_1.$Ii.equals(`config.${"terminal.integrated.tabs.showActiveTerminal" /* TerminalSettingId.TabsShowActiveTerminal */}`, 'always'))),
                }
            },
            {
                id: actions_2.$Ru.ViewTitle,
                item: {
                    command: {
                        id: "workbench.action.terminal.split" /* TerminalCommandId.Split */,
                        title: terminalStrings_1.$pVb.split,
                        icon: codicons_1.$Pj.splitHorizontal
                    },
                    group: 'navigation',
                    order: 2,
                    when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', terminal_2.$tM), contextkey_1.$Ii.notEquals(`config.${"terminal.integrated.tabs.hideCondition" /* TerminalSettingId.TabsHideCondition */}`, 'never'), contextkey_1.$Ii.or(contextkey_1.$Ii.not(`config.${"terminal.integrated.tabs.enabled" /* TerminalSettingId.TabsEnabled */}`), contextkey_1.$Ii.and(contextkey_1.$Ii.equals(`config.${"terminal.integrated.tabs.showActions" /* TerminalSettingId.TabsShowActions */}`, 'singleTerminal'), contextkey_1.$Ii.equals("terminalCount" /* TerminalContextKeyStrings.Count */, 1)), contextkey_1.$Ii.and(contextkey_1.$Ii.equals(`config.${"terminal.integrated.tabs.showActions" /* TerminalSettingId.TabsShowActions */}`, 'singleTerminalOrNarrow'), contextkey_1.$Ii.or(contextkey_1.$Ii.equals("terminalCount" /* TerminalContextKeyStrings.Count */, 1), contextkey_1.$Ii.has("isTerminalTabsNarrow" /* TerminalContextKeyStrings.TabsNarrow */))), contextkey_1.$Ii.and(contextkey_1.$Ii.equals(`config.${"terminal.integrated.tabs.showActions" /* TerminalSettingId.TabsShowActions */}`, 'singleGroup'), contextkey_1.$Ii.equals("terminalGroupCount" /* TerminalContextKeyStrings.GroupCount */, 1)), contextkey_1.$Ii.equals(`config.${"terminal.integrated.tabs.showActions" /* TerminalSettingId.TabsShowActions */}`, 'always')))
                }
            },
            {
                id: actions_2.$Ru.ViewTitle,
                item: {
                    command: {
                        id: "workbench.action.terminal.kill" /* TerminalCommandId.Kill */,
                        title: terminalStrings_1.$pVb.kill,
                        icon: codicons_1.$Pj.trash
                    },
                    group: 'navigation',
                    order: 3,
                    when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', terminal_2.$tM), contextkey_1.$Ii.notEquals(`config.${"terminal.integrated.tabs.hideCondition" /* TerminalSettingId.TabsHideCondition */}`, 'never'), contextkey_1.$Ii.or(contextkey_1.$Ii.not(`config.${"terminal.integrated.tabs.enabled" /* TerminalSettingId.TabsEnabled */}`), contextkey_1.$Ii.and(contextkey_1.$Ii.equals(`config.${"terminal.integrated.tabs.showActions" /* TerminalSettingId.TabsShowActions */}`, 'singleTerminal'), contextkey_1.$Ii.equals("terminalCount" /* TerminalContextKeyStrings.Count */, 1)), contextkey_1.$Ii.and(contextkey_1.$Ii.equals(`config.${"terminal.integrated.tabs.showActions" /* TerminalSettingId.TabsShowActions */}`, 'singleTerminalOrNarrow'), contextkey_1.$Ii.or(contextkey_1.$Ii.equals("terminalCount" /* TerminalContextKeyStrings.Count */, 1), contextkey_1.$Ii.has("isTerminalTabsNarrow" /* TerminalContextKeyStrings.TabsNarrow */))), contextkey_1.$Ii.and(contextkey_1.$Ii.equals(`config.${"terminal.integrated.tabs.showActions" /* TerminalSettingId.TabsShowActions */}`, 'singleGroup'), contextkey_1.$Ii.equals("terminalGroupCount" /* TerminalContextKeyStrings.GroupCount */, 1)), contextkey_1.$Ii.equals(`config.${"terminal.integrated.tabs.showActions" /* TerminalSettingId.TabsShowActions */}`, 'always')))
                }
            },
            {
                id: actions_2.$Ru.ViewTitle,
                item: {
                    command: {
                        id: "workbench.action.terminal.new" /* TerminalCommandId.New */,
                        title: terminalStrings_1.$pVb.new,
                        icon: codicons_1.$Pj.plus
                    },
                    alt: {
                        id: "workbench.action.terminal.split" /* TerminalCommandId.Split */,
                        title: terminalStrings_1.$pVb.split.value,
                        icon: codicons_1.$Pj.splitHorizontal
                    },
                    group: 'navigation',
                    order: 0,
                    when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', terminal_2.$tM), contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.webExtensionContributedProfile, terminalContextKey_1.TerminalContextKeys.processSupported))
                }
            },
            {
                id: actions_2.$Ru.ViewTitle,
                item: {
                    command: {
                        id: "workbench.action.terminal.clear" /* TerminalCommandId.Clear */,
                        title: (0, nls_1.localize)(20, null),
                        icon: codicons_1.$Pj.clearAll
                    },
                    group: 'navigation',
                    order: 4,
                    when: contextkey_1.$Ii.equals('view', terminal_2.$tM),
                    isHiddenByDefault: true
                }
            },
            {
                id: actions_2.$Ru.ViewTitle,
                item: {
                    command: {
                        id: "workbench.action.terminal.runActiveFile" /* TerminalCommandId.RunActiveFile */,
                        title: (0, nls_1.localize)(21, null),
                        icon: codicons_1.$Pj.run
                    },
                    group: 'navigation',
                    order: 5,
                    when: contextkey_1.$Ii.equals('view', terminal_2.$tM),
                    isHiddenByDefault: true
                }
            },
            {
                id: actions_2.$Ru.ViewTitle,
                item: {
                    command: {
                        id: "workbench.action.terminal.runSelectedText" /* TerminalCommandId.RunSelectedText */,
                        title: (0, nls_1.localize)(22, null),
                        icon: codicons_1.$Pj.selection
                    },
                    group: 'navigation',
                    order: 6,
                    when: contextkey_1.$Ii.equals('view', terminal_2.$tM),
                    isHiddenByDefault: true
                }
            },
        ]);
        actions_2.$Tu.appendMenuItems([
            {
                id: actions_2.$Ru.TerminalTabContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.splitActiveTab" /* TerminalCommandId.SplitActiveTab */,
                        title: terminalStrings_1.$pVb.split.value,
                    },
                    group: "1_create" /* ContextMenuGroup.Create */,
                    order: 1
                }
            },
            {
                id: actions_2.$Ru.TerminalTabContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.moveToEditorActiveTab" /* TerminalCommandId.MoveToEditorActiveTab */,
                        title: terminalStrings_1.$pVb.moveToEditor.value
                    },
                    group: "1_create" /* ContextMenuGroup.Create */,
                    order: 2
                }
            },
            {
                id: actions_2.$Ru.TerminalTabContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.renameActiveTab" /* TerminalCommandId.RenameActiveTab */,
                        title: (0, nls_1.localize)(23, null)
                    },
                    group: "2_edit" /* ContextMenuGroup.Edit */
                }
            },
            {
                id: actions_2.$Ru.TerminalTabContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.changeIconActiveTab" /* TerminalCommandId.ChangeIconActiveTab */,
                        title: (0, nls_1.localize)(24, null)
                    },
                    group: "2_edit" /* ContextMenuGroup.Edit */
                }
            },
            {
                id: actions_2.$Ru.TerminalTabContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.changeColorActiveTab" /* TerminalCommandId.ChangeColorActiveTab */,
                        title: (0, nls_1.localize)(25, null)
                    },
                    group: "2_edit" /* ContextMenuGroup.Edit */
                }
            },
            {
                id: actions_2.$Ru.TerminalTabContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.sizeToContentWidthActiveTab" /* TerminalCommandId.SizeToContentWidthActiveTab */,
                        title: (0, nls_1.localize)(26, null)
                    },
                    group: "2_edit" /* ContextMenuGroup.Edit */
                }
            },
            {
                id: actions_2.$Ru.TerminalTabContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.joinActiveTab" /* TerminalCommandId.JoinActiveTab */,
                        title: (0, nls_1.localize)(27, null)
                    },
                    when: terminalContextKey_1.TerminalContextKeys.tabsSingularSelection.toNegated(),
                    group: "5_config" /* ContextMenuGroup.Config */
                }
            },
            {
                id: actions_2.$Ru.TerminalTabContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.unsplitActiveTab" /* TerminalCommandId.UnsplitActiveTab */,
                        title: terminalStrings_1.$pVb.unsplit.value
                    },
                    when: contextkey_1.$Ii.and(terminalContextKey_1.TerminalContextKeys.tabsSingularSelection, terminalContextKey_1.TerminalContextKeys.splitTerminal),
                    group: "5_config" /* ContextMenuGroup.Config */
                }
            },
            {
                id: actions_2.$Ru.TerminalTabContext,
                item: {
                    command: {
                        id: "workbench.action.terminal.killActiveTab" /* TerminalCommandId.KillActiveTab */,
                        title: terminalStrings_1.$pVb.kill.value
                    },
                    group: "4_kill" /* ContextMenuGroup.Kill */,
                }
            }
        ]);
        actions_2.$Tu.appendMenuItem(actions_2.$Ru.EditorTitleContext, {
            command: {
                id: "workbench.action.terminal.moveToTerminalPanel" /* TerminalCommandId.MoveToTerminalPanel */,
                title: terminalStrings_1.$pVb.moveToTerminalPanel
            },
            when: contextkeys_1.$Kdb.Scheme.isEqualTo(network_1.Schemas.vscodeTerminal),
            group: '2_files'
        });
        actions_2.$Tu.appendMenuItem(actions_2.$Ru.EditorTitleContext, {
            command: {
                id: "workbench.action.terminal.rename" /* TerminalCommandId.Rename */,
                title: terminalStrings_1.$pVb.rename
            },
            when: contextkeys_1.$Kdb.Scheme.isEqualTo(network_1.Schemas.vscodeTerminal),
            group: '3_files'
        });
        actions_2.$Tu.appendMenuItem(actions_2.$Ru.EditorTitleContext, {
            command: {
                id: "workbench.action.terminal.changeColor" /* TerminalCommandId.ChangeColor */,
                title: terminalStrings_1.$pVb.changeColor
            },
            when: contextkeys_1.$Kdb.Scheme.isEqualTo(network_1.Schemas.vscodeTerminal),
            group: '3_files'
        });
        actions_2.$Tu.appendMenuItem(actions_2.$Ru.EditorTitleContext, {
            command: {
                id: "workbench.action.terminal.changeIcon" /* TerminalCommandId.ChangeIcon */,
                title: terminalStrings_1.$pVb.changeIcon
            },
            when: contextkeys_1.$Kdb.Scheme.isEqualTo(network_1.Schemas.vscodeTerminal),
            group: '3_files'
        });
        actions_2.$Tu.appendMenuItem(actions_2.$Ru.EditorTitleContext, {
            command: {
                id: "workbench.action.terminal.sizeToContentWidth" /* TerminalCommandId.SizeToContentWidth */,
                title: terminalStrings_1.$pVb.toggleSizeToContentWidth
            },
            when: contextkeys_1.$Kdb.Scheme.isEqualTo(network_1.Schemas.vscodeTerminal),
            group: '3_files'
        });
        actions_2.$Tu.appendMenuItem(actions_2.$Ru.EditorTitle, {
            command: {
                id: "workbench.action.createTerminalEditorSameGroup" /* TerminalCommandId.CreateTerminalEditorSameGroup */,
                title: terminalStrings_1.$pVb.new,
                icon: codicons_1.$Pj.plus
            },
            alt: {
                id: "workbench.action.terminal.split" /* TerminalCommandId.Split */,
                title: terminalStrings_1.$pVb.split.value,
                icon: codicons_1.$Pj.splitHorizontal
            },
            group: 'navigation',
            order: 0,
            when: contextkeys_1.$Kdb.Scheme.isEqualTo(network_1.Schemas.vscodeTerminal)
        });
    }
    exports.$YVb = $YVb;
    function $ZVb(location, profiles, defaultProfileName, contributedProfiles, terminalService, dropdownMenu) {
        let dropdownActions = [];
        let submenuActions = [];
        profiles = profiles.filter(e => !e.isAutoDetected);
        const splitLocation = (location === terminal_1.TerminalLocation.Editor || (typeof location === 'object' && 'viewColumn' in location && location.viewColumn === editorService_1.$0C)) ? { viewColumn: editorService_1.$$C } : { splitActiveTerminal: true };
        for (const p of profiles) {
            const isDefault = p.profileName === defaultProfileName;
            const options = { config: p, location };
            const splitOptions = { config: p, location: splitLocation };
            const sanitizedProfileName = p.profileName.replace(/[\n\r\t]/g, '');
            dropdownActions.push(new actions_1.$gi("workbench.action.terminal.newWithProfile" /* TerminalCommandId.NewWithProfile */, isDefault ? (0, nls_1.localize)(28, null, sanitizedProfileName) : sanitizedProfileName, undefined, true, async () => {
                const instance = await terminalService.createTerminal(options);
                terminalService.setActiveInstance(instance);
                await terminalService.focusActiveInstance();
            }));
            submenuActions.push(new actions_1.$gi("workbench.action.terminal.split" /* TerminalCommandId.Split */, isDefault ? (0, nls_1.localize)(29, null, sanitizedProfileName) : sanitizedProfileName, undefined, true, async () => {
                const instance = await terminalService.createTerminal(splitOptions);
                terminalService.setActiveInstance(instance);
                await terminalService.focusActiveInstance();
            }));
        }
        for (const contributed of contributedProfiles) {
            const isDefault = contributed.title === defaultProfileName;
            const title = isDefault ? (0, nls_1.localize)(30, null, contributed.title.replace(/[\n\r\t]/g, '')) : contributed.title.replace(/[\n\r\t]/g, '');
            dropdownActions.push(new actions_1.$gi('contributed', title, undefined, true, () => terminalService.createTerminal({
                config: {
                    extensionIdentifier: contributed.extensionIdentifier,
                    id: contributed.id,
                    title
                },
                location
            })));
            submenuActions.push(new actions_1.$gi('contributed-split', title, undefined, true, () => terminalService.createTerminal({
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
            dropdownActions.push(new actions_1.$ji('split.profile', (0, nls_1.localize)(31, null), submenuActions));
            dropdownActions.push(new actions_1.$ii());
        }
        const actions = dropdownMenu.getActions();
        dropdownActions.push(...actions_1.$ii.join(...actions.map(a => a[1])));
        const defaultSubmenuProfileAction = submenuActions.find(d => d.label.endsWith('(Default)'));
        if (defaultSubmenuProfileAction) {
            submenuActions = submenuActions.filter(d => d !== defaultSubmenuProfileAction).sort((a, b) => a.label.localeCompare(b.label));
            submenuActions.unshift(defaultSubmenuProfileAction);
        }
        const dropdownAction = new actions_1.$gi('refresh profiles', 'Launch Profile...', 'codicon-chevron-down', true);
        return { dropdownAction, dropdownMenuActions: dropdownActions, className: `terminal-tab-actions-${terminalService.resolveLocation(location)}` };
    }
    exports.$ZVb = $ZVb;
});
//# sourceMappingURL=terminalMenus.js.map