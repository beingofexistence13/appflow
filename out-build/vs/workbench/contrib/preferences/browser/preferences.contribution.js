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
define(["require", "exports", "vs/base/common/keyCodes", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/types", "vs/editor/browser/editorExtensions", "vs/editor/contrib/suggest/browser/suggest", "vs/nls!vs/workbench/contrib/preferences/browser/preferences.contribution", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/contextkey/common/contextkeys", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/label/common/label", "vs/platform/registry/common/platform", "vs/platform/workspace/common/workspace", "vs/workbench/browser/actions/workspaceCommands", "vs/workbench/browser/editor", "vs/workbench/common/contributions", "vs/workbench/common/editor", "vs/workbench/common/contextkeys", "vs/workbench/contrib/files/common/files", "vs/workbench/contrib/preferences/browser/keybindingsEditor", "vs/workbench/contrib/preferences/browser/preferencesActions", "vs/workbench/contrib/preferences/browser/preferencesEditor", "vs/workbench/contrib/preferences/browser/preferencesIcons", "vs/workbench/contrib/preferences/browser/settingsEditor2", "vs/workbench/contrib/preferences/common/preferences", "vs/workbench/contrib/preferences/common/preferencesContribution", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/preferences/browser/keybindingsEditorInput", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/preferences/common/preferencesEditorInput", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/userDataProfile/common/userDataProfile", "vs/editor/browser/editorBrowser", "vs/css!./media/preferences"], function (require, exports, keyCodes_1, lifecycle_1, network_1, types_1, editorExtensions_1, suggest_1, nls, actions_1, commands_1, contextkey_1, contextkeys_1, descriptors_1, instantiation_1, keybindingsRegistry_1, label_1, platform_1, workspace_1, workspaceCommands_1, editor_1, contributions_1, editor_2, contextkeys_2, files_1, keybindingsEditor_1, preferencesActions_1, preferencesEditor_1, preferencesIcons_1, settingsEditor2_1, preferences_1, preferencesContribution_1, editorService_1, environmentService_1, extensions_1, keybindingsEditorInput_1, preferences_2, preferencesEditorInput_1, userDataProfile_1, userDataProfile_2, editorBrowser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const SETTINGS_EDITOR_COMMAND_SEARCH = 'settings.action.search';
    const SETTINGS_EDITOR_COMMAND_FOCUS_FILE = 'settings.action.focusSettingsFile';
    const SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_FROM_SEARCH = 'settings.action.focusSettingsFromSearch';
    const SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_LIST = 'settings.action.focusSettingsList';
    const SETTINGS_EDITOR_COMMAND_FOCUS_TOC = 'settings.action.focusTOC';
    const SETTINGS_EDITOR_COMMAND_FOCUS_CONTROL = 'settings.action.focusSettingControl';
    const SETTINGS_EDITOR_COMMAND_FOCUS_UP = 'settings.action.focusLevelUp';
    const SETTINGS_EDITOR_COMMAND_SWITCH_TO_JSON = 'settings.switchToJSON';
    const SETTINGS_EDITOR_COMMAND_FILTER_ONLINE = 'settings.filterByOnline';
    const SETTINGS_EDITOR_COMMAND_FILTER_UNTRUSTED = 'settings.filterUntrusted';
    const SETTINGS_COMMAND_OPEN_SETTINGS = 'workbench.action.openSettings';
    const SETTINGS_COMMAND_FILTER_TELEMETRY = 'settings.filterByTelemetry';
    platform_1.$8m.as(editor_2.$GE.EditorPane).registerEditorPane(editor_1.$_T.create(settingsEditor2_1.$8Db, settingsEditor2_1.$8Db.ID, nls.localize(0, null)), [
        new descriptors_1.$yh(preferencesEditorInput_1.$Eyb)
    ]);
    platform_1.$8m.as(editor_2.$GE.EditorPane).registerEditorPane(editor_1.$_T.create(keybindingsEditor_1.$hDb, keybindingsEditor_1.$hDb.ID, nls.localize(1, null)), [
        new descriptors_1.$yh(keybindingsEditorInput_1.$Dyb)
    ]);
    class KeybindingsEditorInputSerializer {
        canSerialize(editorInput) {
            return true;
        }
        serialize(editorInput) {
            return '';
        }
        deserialize(instantiationService) {
            return instantiationService.createInstance(keybindingsEditorInput_1.$Dyb);
        }
    }
    class SettingsEditor2InputSerializer {
        canSerialize(editorInput) {
            return true;
        }
        serialize(input) {
            return '';
        }
        deserialize(instantiationService) {
            return instantiationService.createInstance(preferencesEditorInput_1.$Eyb);
        }
    }
    platform_1.$8m.as(editor_2.$GE.EditorFactory).registerEditorSerializer(keybindingsEditorInput_1.$Dyb.ID, KeybindingsEditorInputSerializer);
    platform_1.$8m.as(editor_2.$GE.EditorFactory).registerEditorSerializer(preferencesEditorInput_1.$Eyb.ID, SettingsEditor2InputSerializer);
    const OPEN_USER_SETTINGS_UI_TITLE = { value: nls.localize(2, null), original: 'Open Settings (UI)' };
    const OPEN_USER_SETTINGS_JSON_TITLE = { value: nls.localize(3, null), original: 'Open User Settings (JSON)' };
    const OPEN_APPLICATION_SETTINGS_JSON_TITLE = { value: nls.localize(4, null), original: 'Open Application Settings (JSON)' };
    const category = { value: nls.localize(5, null), original: 'Preferences' };
    function sanitizeBoolean(arg) {
        return (0, types_1.$pf)(arg) ? arg : undefined;
    }
    function sanitizeString(arg) {
        return (0, types_1.$jf)(arg) ? arg : undefined;
    }
    function sanitizeOpenSettingsArgs(args) {
        if (!(0, types_1.$lf)(args)) {
            args = {};
        }
        let sanitizedObject = {
            focusSearch: sanitizeBoolean(args?.focusSearch),
            openToSide: sanitizeBoolean(args?.openToSide),
            query: sanitizeString(args?.query)
        };
        if ((0, types_1.$jf)(args?.revealSetting?.key)) {
            sanitizedObject = {
                ...sanitizedObject,
                revealSetting: {
                    key: args.revealSetting.key,
                    edit: sanitizeBoolean(args.revealSetting?.edit)
                }
            };
        }
        return sanitizedObject;
    }
    let PreferencesActionsContribution = class PreferencesActionsContribution extends lifecycle_1.$kc {
        constructor(a, b, c, f, g, h, j) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m();
            this.r();
            this.t();
            this.B(f.onDidChangeWorkbenchState(() => this.t()));
            this.B(f.onDidChangeWorkspaceFolders(() => this.u()));
        }
        m() {
            this.B((0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: SETTINGS_COMMAND_OPEN_SETTINGS,
                        title: {
                            value: nls.localize(6, null),
                            mnemonicTitle: nls.localize(7, null),
                            original: 'Settings'
                        },
                        keybinding: {
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            when: null,
                            primary: 2048 /* KeyMod.CtrlCmd */ | 87 /* KeyCode.Comma */,
                        },
                        menu: [{
                                id: actions_1.$Ru.GlobalActivity,
                                group: '2_configuration',
                                order: 2
                            }, {
                                id: actions_1.$Ru.MenubarPreferencesMenu,
                                group: '2_configuration',
                                order: 2
                            }],
                    });
                }
                run(accessor, args) {
                    // args takes a string for backcompat
                    const opts = typeof args === 'string' ? { query: args } : sanitizeOpenSettingsArgs(args);
                    return accessor.get(preferences_2.$BE).openSettings(opts);
                }
            }));
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: 'workbench.action.openSettings2',
                        title: { value: nls.localize(8, null), original: 'Open Settings (UI)' },
                        category,
                        f1: true,
                    });
                }
                run(accessor, args) {
                    args = sanitizeOpenSettingsArgs(args);
                    return accessor.get(preferences_2.$BE).openSettings({ jsonEditor: false, ...args });
                }
            });
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: 'workbench.action.openSettingsJson',
                        title: OPEN_USER_SETTINGS_JSON_TITLE,
                        category,
                        f1: true,
                    });
                }
                run(accessor, args) {
                    args = sanitizeOpenSettingsArgs(args);
                    return accessor.get(preferences_2.$BE).openSettings({ jsonEditor: true, ...args });
                }
            });
            const that = this;
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: 'workbench.action.openApplicationSettingsJson',
                        title: OPEN_APPLICATION_SETTINGS_JSON_TITLE,
                        category,
                        menu: {
                            id: actions_1.$Ru.CommandPalette,
                            when: contextkey_1.$Ii.notEquals(userDataProfile_1.$QJ.key, that.j.defaultProfile.id)
                        }
                    });
                }
                run(accessor, args) {
                    args = sanitizeOpenSettingsArgs(args);
                    return accessor.get(preferences_2.$BE).openApplicationSettings({ jsonEditor: true, ...args });
                }
            });
            // Opens the User tab of the Settings editor
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: 'workbench.action.openGlobalSettings',
                        title: { value: nls.localize(9, null), original: 'Open User Settings' },
                        category,
                        f1: true,
                    });
                }
                run(accessor, args) {
                    args = sanitizeOpenSettingsArgs(args);
                    return accessor.get(preferences_2.$BE).openUserSettings(args);
                }
            });
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: 'workbench.action.openRawDefaultSettings',
                        title: { value: nls.localize(10, null), original: 'Open Default Settings (JSON)' },
                        category,
                        f1: true,
                    });
                }
                run(accessor) {
                    return accessor.get(preferences_2.$BE).openRawDefaultSettings();
                }
            });
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: preferencesActions_1.$iDb.ID,
                        title: preferencesActions_1.$iDb.LABEL,
                        category,
                        f1: true,
                    });
                }
                run(accessor) {
                    return accessor.get(instantiation_1.$Ah).createInstance(preferencesActions_1.$iDb, preferencesActions_1.$iDb.ID, preferencesActions_1.$iDb.LABEL.value).run();
                }
            });
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: 'workbench.action.openWorkspaceSettings',
                        title: { value: nls.localize(11, null), original: 'Open Workspace Settings' },
                        category,
                        menu: {
                            id: actions_1.$Ru.CommandPalette,
                            when: contextkeys_2.$Pcb.notEqualsTo('empty')
                        }
                    });
                }
                run(accessor, args) {
                    // Match the behaviour of workbench.action.openSettings
                    args = typeof args === 'string' ? { query: args } : sanitizeOpenSettingsArgs(args);
                    return accessor.get(preferences_2.$BE).openWorkspaceSettings(args);
                }
            });
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: 'workbench.action.openAccessibilitySettings',
                        title: { value: nls.localize(12, null), original: 'Open Accessibility Settings' },
                        category,
                        menu: {
                            id: actions_1.$Ru.CommandPalette,
                            when: contextkeys_2.$Pcb.notEqualsTo('empty')
                        }
                    });
                }
                async run(accessor) {
                    await accessor.get(preferences_2.$BE).openSettings({ jsonEditor: false, query: '@tag:accessibility' });
                }
            });
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: 'workbench.action.openWorkspaceSettingsFile',
                        title: { value: nls.localize(13, null), original: 'Open Workspace Settings (JSON)' },
                        category,
                        menu: {
                            id: actions_1.$Ru.CommandPalette,
                            when: contextkeys_2.$Pcb.notEqualsTo('empty')
                        }
                    });
                }
                run(accessor, args) {
                    args = sanitizeOpenSettingsArgs(args);
                    return accessor.get(preferences_2.$BE).openWorkspaceSettings({ jsonEditor: true, ...args });
                }
            });
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: 'workbench.action.openFolderSettings',
                        title: { value: nls.localize(14, null), original: 'Open Folder Settings' },
                        category,
                        menu: {
                            id: actions_1.$Ru.CommandPalette,
                            when: contextkeys_2.$Pcb.isEqualTo('workspace')
                        }
                    });
                }
                async run(accessor, args) {
                    const commandService = accessor.get(commands_1.$Fr);
                    const preferencesService = accessor.get(preferences_2.$BE);
                    const workspaceFolder = await commandService.executeCommand(workspaceCommands_1.$dgb);
                    if (workspaceFolder) {
                        args = sanitizeOpenSettingsArgs(args);
                        await preferencesService.openFolderSettings({ folderUri: workspaceFolder.uri, ...args });
                    }
                }
            });
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: 'workbench.action.openFolderSettingsFile',
                        title: { value: nls.localize(15, null), original: 'Open Folder Settings (JSON)' },
                        category,
                        menu: {
                            id: actions_1.$Ru.CommandPalette,
                            when: contextkeys_2.$Pcb.isEqualTo('workspace')
                        }
                    });
                }
                async run(accessor, args) {
                    const commandService = accessor.get(commands_1.$Fr);
                    const preferencesService = accessor.get(preferences_2.$BE);
                    const workspaceFolder = await commandService.executeCommand(workspaceCommands_1.$dgb);
                    if (workspaceFolder) {
                        args = sanitizeOpenSettingsArgs(args);
                        await preferencesService.openFolderSettings({ folderUri: workspaceFolder.uri, jsonEditor: true, ...args });
                    }
                }
            });
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: '_workbench.action.openFolderSettings',
                        title: { value: nls.localize(16, null), original: 'Open Folder Settings' },
                        category,
                        menu: {
                            id: actions_1.$Ru.ExplorerContext,
                            group: '2_workspace',
                            order: 20,
                            when: contextkey_1.$Ii.and(files_1.$Udb, files_1.$Qdb)
                        }
                    });
                }
                run(accessor, resource) {
                    return accessor.get(preferences_2.$BE).openFolderSettings({ folderUri: resource });
                }
            });
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FILTER_ONLINE,
                        title: nls.localize(17, null),
                        menu: {
                            id: actions_1.$Ru.MenubarPreferencesMenu,
                            group: '3_settings',
                            order: 1,
                        }
                    });
                }
                run(accessor) {
                    const editorPane = accessor.get(editorService_1.$9C).activeEditorPane;
                    if (editorPane instanceof settingsEditor2_1.$8Db) {
                        editorPane.focusSearch(`@tag:usesOnlineServices`);
                    }
                    else {
                        accessor.get(preferences_2.$BE).openSettings({ jsonEditor: false, query: '@tag:usesOnlineServices' });
                    }
                }
            });
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FILTER_UNTRUSTED,
                        title: { value: nls.localize(18, null), original: 'Show untrusted workspace settings' },
                    });
                }
                run(accessor) {
                    accessor.get(preferences_2.$BE).openWorkspaceSettings({ jsonEditor: false, query: `@tag:${preferences_1.$QCb}` });
                }
            });
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: SETTINGS_COMMAND_FILTER_TELEMETRY,
                        title: nls.localize(19, null)
                    });
                }
                run(accessor) {
                    const editorPane = accessor.get(editorService_1.$9C).activeEditorPane;
                    if (editorPane instanceof settingsEditor2_1.$8Db) {
                        editorPane.focusSearch(`@tag:telemetry`);
                    }
                    else {
                        accessor.get(preferences_2.$BE).openSettings({ jsonEditor: false, query: '@tag:telemetry' });
                    }
                }
            });
            this.n();
            this.h.whenInstalledExtensionsRegistered()
                .then(() => {
                const remoteAuthority = this.a.remoteAuthority;
                const hostLabel = this.g.getHostLabel(network_1.Schemas.vscodeRemote, remoteAuthority) || remoteAuthority;
                const label = nls.localize(20, null, hostLabel);
                (0, actions_1.$Xu)(class extends actions_1.$Wu {
                    constructor() {
                        super({
                            id: 'workbench.action.openRemoteSettings',
                            title: { value: label, original: `Open Remote Settings (${hostLabel})` },
                            category,
                            menu: {
                                id: actions_1.$Ru.CommandPalette,
                                when: contextkeys_2.$Vcb.notEqualsTo('')
                            }
                        });
                    }
                    run(accessor, args) {
                        args = sanitizeOpenSettingsArgs(args);
                        return accessor.get(preferences_2.$BE).openRemoteSettings(args);
                    }
                });
                const jsonLabel = nls.localize(21, null, hostLabel);
                (0, actions_1.$Xu)(class extends actions_1.$Wu {
                    constructor() {
                        super({
                            id: 'workbench.action.openRemoteSettingsFile',
                            title: { value: jsonLabel, original: `Open Remote Settings (JSON) (${hostLabel})` },
                            category,
                            menu: {
                                id: actions_1.$Ru.CommandPalette,
                                when: contextkeys_2.$Vcb.notEqualsTo('')
                            }
                        });
                    }
                    run(accessor, args) {
                        args = sanitizeOpenSettingsArgs(args);
                        return accessor.get(preferences_2.$BE).openRemoteSettings({ jsonEditor: true, ...args });
                    }
                });
            });
        }
        n() {
            function getPreferencesEditor(accessor) {
                const activeEditorPane = accessor.get(editorService_1.$9C).activeEditorPane;
                if (activeEditorPane instanceof settingsEditor2_1.$8Db) {
                    return activeEditorPane;
                }
                return null;
            }
            function settingsEditorFocusSearch(accessor) {
                const preferencesEditor = getPreferencesEditor(accessor);
                preferencesEditor?.focusSearch();
            }
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_SEARCH,
                        precondition: preferences_1.$fCb,
                        keybinding: {
                            primary: 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */,
                            weight: 100 /* KeybindingWeight.EditorContrib */,
                            when: null
                        },
                        category,
                        f1: true,
                        title: { value: nls.localize(22, null), original: 'Focus Settings Search' }
                    });
                }
                run(accessor) { settingsEditorFocusSearch(accessor); }
            });
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: preferences_1.$cCb,
                        precondition: preferences_1.$fCb,
                        keybinding: {
                            primary: 9 /* KeyCode.Escape */,
                            weight: 100 /* KeybindingWeight.EditorContrib */,
                            when: preferences_1.$hCb
                        },
                        category,
                        f1: true,
                        title: { value: nls.localize(23, null), original: 'Clear Settings Search Results' }
                    });
                }
                run(accessor) {
                    const preferencesEditor = getPreferencesEditor(accessor);
                    preferencesEditor?.clearSearchResults();
                }
            });
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FOCUS_FILE,
                        precondition: contextkey_1.$Ii.and(preferences_1.$hCb, suggest_1.$V5.Visible.toNegated()),
                        keybinding: {
                            primary: 18 /* KeyCode.DownArrow */,
                            weight: 100 /* KeybindingWeight.EditorContrib */,
                            when: null
                        },
                        title: nls.localize(24, null)
                    });
                }
                run(accessor, args) {
                    const preferencesEditor = getPreferencesEditor(accessor);
                    preferencesEditor?.focusSettings();
                }
            });
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_FROM_SEARCH,
                        precondition: contextkey_1.$Ii.and(preferences_1.$hCb, suggest_1.$V5.Visible.toNegated()),
                        keybinding: {
                            primary: 18 /* KeyCode.DownArrow */,
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            when: null
                        },
                        title: nls.localize(25, null)
                    });
                }
                run(accessor, args) {
                    const preferencesEditor = getPreferencesEditor(accessor);
                    preferencesEditor?.focusSettings();
                }
            });
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_LIST,
                        precondition: contextkey_1.$Ii.and(preferences_1.$fCb, preferences_1.$iCb),
                        keybinding: {
                            primary: 3 /* KeyCode.Enter */,
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            when: null
                        },
                        title: nls.localize(26, null)
                    });
                }
                run(accessor) {
                    const preferencesEditor = getPreferencesEditor(accessor);
                    if (preferencesEditor instanceof settingsEditor2_1.$8Db) {
                        preferencesEditor.focusSettings();
                    }
                }
            });
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FOCUS_TOC,
                        precondition: preferences_1.$fCb,
                        f1: true,
                        keybinding: [
                            {
                                primary: 15 /* KeyCode.LeftArrow */,
                                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                                when: preferences_1.$jCb
                            }
                        ],
                        category,
                        title: { value: nls.localize(27, null), original: 'Focus Settings Table of Contents' }
                    });
                }
                run(accessor) {
                    const preferencesEditor = getPreferencesEditor(accessor);
                    if (!(preferencesEditor instanceof settingsEditor2_1.$8Db)) {
                        return;
                    }
                    preferencesEditor.focusTOC();
                }
            });
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FOCUS_CONTROL,
                        precondition: contextkey_1.$Ii.and(preferences_1.$fCb, preferences_1.$jCb),
                        keybinding: {
                            primary: 3 /* KeyCode.Enter */,
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        },
                        title: nls.localize(28, null)
                    });
                }
                run(accessor) {
                    const preferencesEditor = getPreferencesEditor(accessor);
                    if (!(preferencesEditor instanceof settingsEditor2_1.$8Db)) {
                        return;
                    }
                    if (document.activeElement?.classList.contains('monaco-list')) {
                        preferencesEditor.focusSettings(true);
                    }
                }
            });
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: preferences_1.$dCb,
                        precondition: preferences_1.$fCb,
                        keybinding: {
                            primary: 1024 /* KeyMod.Shift */ | 67 /* KeyCode.F9 */,
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            when: null
                        },
                        f1: true,
                        category,
                        title: { value: nls.localize(29, null), original: 'Show Setting Context Menu' }
                    });
                }
                run(accessor) {
                    const preferencesEditor = getPreferencesEditor(accessor);
                    if (preferencesEditor instanceof settingsEditor2_1.$8Db) {
                        preferencesEditor.showContextMenu();
                    }
                }
            });
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FOCUS_UP,
                        precondition: contextkey_1.$Ii.and(preferences_1.$fCb, preferences_1.$hCb.toNegated(), preferences_1.$gCb.toNegated()),
                        keybinding: {
                            primary: 9 /* KeyCode.Escape */,
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            when: null
                        },
                        f1: true,
                        category,
                        title: { value: nls.localize(30, null), original: 'Move Focus Up One Level' }
                    });
                }
                run(accessor) {
                    const preferencesEditor = getPreferencesEditor(accessor);
                    if (!(preferencesEditor instanceof settingsEditor2_1.$8Db)) {
                        return;
                    }
                    if (preferencesEditor.currentFocusContext === 3 /* SettingsFocusContext.SettingControl */) {
                        preferencesEditor.focusSettings();
                    }
                    else if (preferencesEditor.currentFocusContext === 2 /* SettingsFocusContext.SettingTree */) {
                        preferencesEditor.focusTOC();
                    }
                    else if (preferencesEditor.currentFocusContext === 1 /* SettingsFocusContext.TableOfContents */) {
                        preferencesEditor.focusSearch();
                    }
                }
            });
        }
        r() {
            const that = this;
            const category = { value: nls.localize(31, null), original: 'Preferences' };
            const id = 'workbench.action.openGlobalKeybindings';
            this.B((0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id,
                        title: { value: nls.localize(32, null), original: 'Open Keyboard Shortcuts' },
                        shortTitle: nls.localize(33, null),
                        category,
                        icon: preferencesIcons_1.$6Bb,
                        keybinding: {
                            when: null,
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 49 /* KeyCode.KeyS */)
                        },
                        menu: [
                            { id: actions_1.$Ru.CommandPalette },
                            {
                                id: actions_1.$Ru.EditorTitle,
                                when: contextkeys_2.$Kdb.Resource.isEqualTo(that.b.currentProfile.keybindingsResource.toString()),
                                group: 'navigation',
                                order: 1,
                            },
                            {
                                id: actions_1.$Ru.GlobalActivity,
                                group: '2_configuration',
                                order: 4
                            }
                        ]
                    });
                }
                run(accessor, args) {
                    const query = typeof args === 'string' ? args : undefined;
                    return accessor.get(preferences_2.$BE).openGlobalKeybindingSettings(false, { query });
                }
            }));
            this.B(actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarPreferencesMenu, {
                command: {
                    id,
                    title: nls.localize(34, null),
                },
                group: '2_configuration',
                order: 4
            }));
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: 'workbench.action.openDefaultKeybindingsFile',
                        title: { value: nls.localize(35, null), original: 'Open Default Keyboard Shortcuts (JSON)' },
                        category,
                        menu: { id: actions_1.$Ru.CommandPalette }
                    });
                }
                run(accessor) {
                    return accessor.get(preferences_2.$BE).openDefaultKeybindingsFile();
                }
            });
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: 'workbench.action.openGlobalKeybindingsFile',
                        title: { value: nls.localize(36, null), original: 'Open Keyboard Shortcuts (JSON)' },
                        category,
                        icon: preferencesIcons_1.$6Bb,
                        menu: [
                            { id: actions_1.$Ru.CommandPalette },
                            {
                                id: actions_1.$Ru.EditorTitle,
                                when: contextkey_1.$Ii.and(preferences_1.$kCb),
                                group: 'navigation',
                            }
                        ]
                    });
                }
                run(accessor) {
                    return accessor.get(preferences_2.$BE).openGlobalKeybindingSettings(true);
                }
            });
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: preferences_1.$FCb,
                        title: { value: nls.localize(37, null), original: 'Show System Keyboard Shortcuts' },
                        menu: [
                            {
                                id: actions_1.$Ru.EditorTitle,
                                when: contextkey_1.$Ii.and(preferences_1.$kCb),
                                group: '1_keyboard_preferences_actions'
                            }
                        ]
                    });
                }
                run(accessor) {
                    const editorPane = accessor.get(editorService_1.$9C).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.$hDb) {
                        editorPane.search('@source:system');
                    }
                }
            });
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: preferences_1.$HCb,
                        title: { value: nls.localize(38, null), original: 'Show Extension Keyboard Shortcuts' },
                        menu: [
                            {
                                id: actions_1.$Ru.EditorTitle,
                                when: contextkey_1.$Ii.and(preferences_1.$kCb),
                                group: '1_keyboard_preferences_actions'
                            }
                        ]
                    });
                }
                run(accessor) {
                    const editorPane = accessor.get(editorService_1.$9C).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.$hDb) {
                        editorPane.search('@source:extension');
                    }
                }
            });
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: preferences_1.$GCb,
                        title: { value: nls.localize(39, null), original: 'Show User Keyboard Shortcuts' },
                        menu: [
                            {
                                id: actions_1.$Ru.EditorTitle,
                                when: contextkey_1.$Ii.and(preferences_1.$kCb),
                                group: '1_keyboard_preferences_actions'
                            }
                        ]
                    });
                }
                run(accessor) {
                    const editorPane = accessor.get(editorService_1.$9C).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.$hDb) {
                        editorPane.search('@source:user');
                    }
                }
            });
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: preferences_1.$pCb,
                        title: nls.localize(40, null),
                        keybinding: {
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            when: contextkey_1.$Ii.and(preferences_1.$kCb, preferences_1.$lCb),
                            primary: 9 /* KeyCode.Escape */,
                        }
                    });
                }
                run(accessor) {
                    const editorPane = accessor.get(editorService_1.$9C).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.$hDb) {
                        editorPane.clearSearchResults();
                    }
                }
            });
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: preferences_1.$qCb,
                        title: nls.localize(41, null),
                        category,
                        menu: [
                            {
                                id: actions_1.$Ru.CommandPalette,
                                when: contextkey_1.$Ii.and(preferences_1.$kCb),
                            }
                        ]
                    });
                }
                run(accessor) {
                    const editorPane = accessor.get(editorService_1.$9C).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.$hDb) {
                        editorPane.clearKeyboardShortcutSearchHistory();
                    }
                }
            });
            this.s();
        }
        s() {
            const that = this;
            keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
                id: preferences_1.$tCb,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.$Ii.and(preferences_1.$kCb, preferences_1.$mCb, preferences_1.$nCb.toNegated()),
                primary: 3 /* KeyCode.Enter */,
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.$9C).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.$hDb) {
                        editorPane.defineKeybinding(editorPane.activeKeybindingEntry, false);
                    }
                }
            });
            keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
                id: preferences_1.$uCb,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.$Ii.and(preferences_1.$kCb, preferences_1.$mCb),
                primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */),
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.$9C).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.$hDb) {
                        editorPane.defineKeybinding(editorPane.activeKeybindingEntry, true);
                    }
                }
            });
            keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
                id: preferences_1.$vCb,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.$Ii.and(preferences_1.$kCb, preferences_1.$mCb),
                primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 35 /* KeyCode.KeyE */),
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.$9C).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.$hDb && editorPane.activeKeybindingEntry.keybindingItem.keybinding) {
                        editorPane.defineWhenExpression(editorPane.activeKeybindingEntry);
                    }
                }
            });
            keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
                id: preferences_1.$yCb,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.$Ii.and(preferences_1.$kCb, preferences_1.$mCb, contextkeys_1.$93.toNegated()),
                primary: 20 /* KeyCode.Delete */,
                mac: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */
                },
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.$9C).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.$hDb) {
                        editorPane.removeKeybinding(editorPane.activeKeybindingEntry);
                    }
                }
            });
            keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
                id: preferences_1.$zCb,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.$Ii.and(preferences_1.$kCb, preferences_1.$mCb),
                primary: 0,
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.$9C).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.$hDb) {
                        editorPane.resetKeybinding(editorPane.activeKeybindingEntry);
                    }
                }
            });
            keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
                id: preferences_1.$oCb,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.$Ii.and(preferences_1.$kCb),
                primary: 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */,
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.$9C).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.$hDb) {
                        editorPane.focusSearch();
                    }
                }
            });
            keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
                id: preferences_1.$rCb,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.$Ii.and(preferences_1.$kCb, preferences_1.$lCb),
                primary: 512 /* KeyMod.Alt */ | 41 /* KeyCode.KeyK */,
                mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 41 /* KeyCode.KeyK */ },
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.$9C).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.$hDb) {
                        editorPane.recordSearchKeys();
                    }
                }
            });
            keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
                id: preferences_1.$sCb,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.$Ii.and(preferences_1.$kCb),
                primary: 512 /* KeyMod.Alt */ | 46 /* KeyCode.KeyP */,
                mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 46 /* KeyCode.KeyP */ },
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.$9C).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.$hDb) {
                        editorPane.toggleSortByPrecedence();
                    }
                }
            });
            keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
                id: preferences_1.$DCb,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.$Ii.and(preferences_1.$kCb, preferences_1.$mCb),
                primary: 0,
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.$9C).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.$hDb) {
                        editorPane.showSimilarKeybindings(editorPane.activeKeybindingEntry);
                    }
                }
            });
            keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
                id: preferences_1.$ACb,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.$Ii.and(preferences_1.$kCb, preferences_1.$mCb, preferences_1.$nCb.negate()),
                primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */,
                handler: async (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.$9C).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.$hDb) {
                        await editorPane.copyKeybinding(editorPane.activeKeybindingEntry);
                    }
                }
            });
            keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
                id: preferences_1.$BCb,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.$Ii.and(preferences_1.$kCb, preferences_1.$mCb),
                primary: 0,
                handler: async (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.$9C).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.$hDb) {
                        await editorPane.copyKeybindingCommand(editorPane.activeKeybindingEntry);
                    }
                }
            });
            keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
                id: preferences_1.$CCb,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.$Ii.and(preferences_1.$kCb, preferences_1.$mCb),
                primary: 0,
                handler: async (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.$9C).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.$hDb) {
                        await editorPane.copyKeybindingCommandTitle(editorPane.activeKeybindingEntry);
                    }
                }
            });
            keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
                id: preferences_1.$ECb,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.$Ii.and(preferences_1.$kCb, preferences_1.$lCb),
                primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */,
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.$9C).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.$hDb) {
                        editorPane.focusKeybindings();
                    }
                }
            });
            keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
                id: preferences_1.$xCb,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.$Ii.and(preferences_1.$kCb, preferences_1.$nCb, suggest_1.$V5.Visible.toNegated()),
                primary: 9 /* KeyCode.Escape */,
                handler: async (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.$9C).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.$hDb) {
                        editorPane.rejectWhenExpression(editorPane.activeKeybindingEntry);
                    }
                }
            });
            keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
                id: preferences_1.$wCb,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.$Ii.and(preferences_1.$kCb, preferences_1.$nCb, suggest_1.$V5.Visible.toNegated()),
                primary: 3 /* KeyCode.Enter */,
                handler: async (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.$9C).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.$hDb) {
                        editorPane.acceptWhenExpression(editorPane.activeKeybindingEntry);
                    }
                }
            });
            const profileScopedActionDisposables = this.B(new lifecycle_1.$jc());
            const registerProfileScopedActions = () => {
                profileScopedActionDisposables.clear();
                profileScopedActionDisposables.add((0, actions_1.$Xu)(class DefineKeybindingAction extends actions_1.$Wu {
                    constructor() {
                        const when = contextkeys_2.$Kdb.Resource.isEqualTo(that.b.currentProfile.keybindingsResource.toString());
                        super({
                            id: 'editor.action.defineKeybinding',
                            title: { value: nls.localize(42, null), original: 'Define Keybinding' },
                            f1: true,
                            precondition: when,
                            keybinding: {
                                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                                when,
                                primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */)
                            },
                            menu: {
                                id: actions_1.$Ru.EditorContent,
                                when,
                            }
                        });
                    }
                    async run(accessor) {
                        const codeEditor = accessor.get(editorService_1.$9C).activeTextEditorControl;
                        if ((0, editorBrowser_1.$iV)(codeEditor)) {
                            codeEditor.getContribution(preferences_2.$CE)?.showDefineKeybindingWidget();
                        }
                    }
                }));
            };
            registerProfileScopedActions();
            this.B(this.b.onDidChangeCurrentProfile(() => registerProfileScopedActions()));
        }
        t() {
            const commandId = '_workbench.openWorkspaceSettingsEditor';
            if (this.f.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */ && !commands_1.$Gr.getCommand(commandId)) {
                commands_1.$Gr.registerCommand(commandId, () => this.c.openWorkspaceSettings({ jsonEditor: false }));
                actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitle, {
                    command: {
                        id: commandId,
                        title: OPEN_USER_SETTINGS_UI_TITLE,
                        icon: preferencesIcons_1.$6Bb
                    },
                    when: contextkey_1.$Ii.and(contextkeys_2.$Kdb.Resource.isEqualTo(this.c.workspaceSettingsResource.toString()), contextkeys_2.$Pcb.isEqualTo('workspace'), contextkey_1.$Ii.not('isInDiffEditor')),
                    group: 'navigation',
                    order: 1
                });
            }
            this.u();
        }
        u() {
            for (const folder of this.f.getWorkspace().folders) {
                const commandId = `_workbench.openFolderSettings.${folder.uri.toString()}`;
                if (!commands_1.$Gr.getCommand(commandId)) {
                    commands_1.$Gr.registerCommand(commandId, () => {
                        if (this.f.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
                            return this.c.openWorkspaceSettings({ jsonEditor: false });
                        }
                        else {
                            return this.c.openFolderSettings({ folderUri: folder.uri, jsonEditor: false });
                        }
                    });
                    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitle, {
                        command: {
                            id: commandId,
                            title: OPEN_USER_SETTINGS_UI_TITLE,
                            icon: preferencesIcons_1.$6Bb
                        },
                        when: contextkey_1.$Ii.and(contextkeys_2.$Kdb.Resource.isEqualTo(this.c.getFolderSettingsResource(folder.uri).toString()), contextkey_1.$Ii.not('isInDiffEditor')),
                        group: 'navigation',
                        order: 1
                    });
                }
            }
        }
    };
    PreferencesActionsContribution = __decorate([
        __param(0, environmentService_1.$hJ),
        __param(1, userDataProfile_1.$CJ),
        __param(2, preferences_2.$BE),
        __param(3, workspace_1.$Kh),
        __param(4, label_1.$Vz),
        __param(5, extensions_1.$MF),
        __param(6, userDataProfile_2.$Ek)
    ], PreferencesActionsContribution);
    let SettingsEditorTitleContribution = class SettingsEditorTitleContribution extends lifecycle_1.$kc {
        constructor(a, b) {
            super();
            this.a = a;
            this.b = b;
            this.c();
        }
        c() {
            const registerOpenUserSettingsEditorFromJsonActionDisposables = this.B(new lifecycle_1.$lc());
            const openUserSettingsEditorWhen = contextkey_1.$Ii.and(contextkey_1.$Ii.or(contextkeys_2.$Kdb.Resource.isEqualTo(this.a.currentProfile.settingsResource.toString()), contextkeys_2.$Kdb.Resource.isEqualTo(this.b.defaultProfile.settingsResource.toString())), contextkey_1.$Ii.not('isInDiffEditor'));
            const registerOpenUserSettingsEditorFromJsonAction = () => {
                registerOpenUserSettingsEditorFromJsonActionDisposables.value = (0, actions_1.$Xu)(class extends actions_1.$Wu {
                    constructor() {
                        super({
                            id: '_workbench.openUserSettingsEditor',
                            title: OPEN_USER_SETTINGS_UI_TITLE,
                            icon: preferencesIcons_1.$6Bb,
                            menu: [{
                                    id: actions_1.$Ru.EditorTitle,
                                    when: openUserSettingsEditorWhen,
                                    group: 'navigation',
                                    order: 1
                                }]
                        });
                    }
                    run(accessor, args) {
                        args = sanitizeOpenSettingsArgs(args);
                        return accessor.get(preferences_2.$BE).openUserSettings({ jsonEditor: false, ...args });
                    }
                });
            };
            registerOpenUserSettingsEditorFromJsonAction();
            this.B(this.a.onDidChangeCurrentProfile(() => {
                // Force the action to check the context again.
                registerOpenUserSettingsEditorFromJsonAction();
            }));
            const openSettingsJsonWhen = contextkey_1.$Ii.and(preferences_1.$fCb, preferences_1.$gCb.toNegated());
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_SWITCH_TO_JSON,
                        title: { value: nls.localize(43, null), original: 'Open Settings (JSON)' },
                        icon: preferencesIcons_1.$6Bb,
                        menu: [{
                                id: actions_1.$Ru.EditorTitle,
                                when: openSettingsJsonWhen,
                                group: 'navigation',
                                order: 1
                            }]
                    });
                }
                run(accessor) {
                    const editorPane = accessor.get(editorService_1.$9C).activeEditorPane;
                    if (editorPane instanceof settingsEditor2_1.$8Db) {
                        return editorPane.switchToSettingsFile();
                    }
                    return null;
                }
            });
        }
    };
    SettingsEditorTitleContribution = __decorate([
        __param(0, userDataProfile_1.$CJ),
        __param(1, userDataProfile_2.$Ek)
    ], SettingsEditorTitleContribution);
    const workbenchContributionsRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(PreferencesActionsContribution, 1 /* LifecyclePhase.Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(preferencesContribution_1.$9Db, 1 /* LifecyclePhase.Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(SettingsEditorTitleContribution, 3 /* LifecyclePhase.Restored */);
    (0, editorExtensions_1.$AV)(preferencesEditor_1.$lDb.ID, preferencesEditor_1.$lDb, 1 /* EditorContributionInstantiation.AfterFirstRender */);
    // Preferences menu
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarFileMenu, {
        title: nls.localize(44, null),
        submenu: actions_1.$Ru.MenubarPreferencesMenu,
        group: '5_autosave',
        order: 2,
        when: contextkeys_1.$33.toNegated() // on macOS native the preferences menu is separate under the application menu
    });
});
//# sourceMappingURL=preferences.contribution.js.map