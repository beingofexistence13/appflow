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
define(["require", "exports", "vs/base/common/keyCodes", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/types", "vs/editor/browser/editorExtensions", "vs/editor/contrib/suggest/browser/suggest", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/contextkey/common/contextkeys", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/label/common/label", "vs/platform/registry/common/platform", "vs/platform/workspace/common/workspace", "vs/workbench/browser/actions/workspaceCommands", "vs/workbench/browser/editor", "vs/workbench/common/contributions", "vs/workbench/common/editor", "vs/workbench/common/contextkeys", "vs/workbench/contrib/files/common/files", "vs/workbench/contrib/preferences/browser/keybindingsEditor", "vs/workbench/contrib/preferences/browser/preferencesActions", "vs/workbench/contrib/preferences/browser/preferencesEditor", "vs/workbench/contrib/preferences/browser/preferencesIcons", "vs/workbench/contrib/preferences/browser/settingsEditor2", "vs/workbench/contrib/preferences/common/preferences", "vs/workbench/contrib/preferences/common/preferencesContribution", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/preferences/browser/keybindingsEditorInput", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/preferences/common/preferencesEditorInput", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/userDataProfile/common/userDataProfile", "vs/editor/browser/editorBrowser", "vs/css!./media/preferences"], function (require, exports, keyCodes_1, lifecycle_1, network_1, types_1, editorExtensions_1, suggest_1, nls, actions_1, commands_1, contextkey_1, contextkeys_1, descriptors_1, instantiation_1, keybindingsRegistry_1, label_1, platform_1, workspace_1, workspaceCommands_1, editor_1, contributions_1, editor_2, contextkeys_2, files_1, keybindingsEditor_1, preferencesActions_1, preferencesEditor_1, preferencesIcons_1, settingsEditor2_1, preferences_1, preferencesContribution_1, editorService_1, environmentService_1, extensions_1, keybindingsEditorInput_1, preferences_2, preferencesEditorInput_1, userDataProfile_1, userDataProfile_2, editorBrowser_1) {
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
    platform_1.Registry.as(editor_2.EditorExtensions.EditorPane).registerEditorPane(editor_1.EditorPaneDescriptor.create(settingsEditor2_1.SettingsEditor2, settingsEditor2_1.SettingsEditor2.ID, nls.localize('settingsEditor2', "Settings Editor 2")), [
        new descriptors_1.SyncDescriptor(preferencesEditorInput_1.SettingsEditor2Input)
    ]);
    platform_1.Registry.as(editor_2.EditorExtensions.EditorPane).registerEditorPane(editor_1.EditorPaneDescriptor.create(keybindingsEditor_1.KeybindingsEditor, keybindingsEditor_1.KeybindingsEditor.ID, nls.localize('keybindingsEditor', "Keybindings Editor")), [
        new descriptors_1.SyncDescriptor(keybindingsEditorInput_1.KeybindingsEditorInput)
    ]);
    class KeybindingsEditorInputSerializer {
        canSerialize(editorInput) {
            return true;
        }
        serialize(editorInput) {
            return '';
        }
        deserialize(instantiationService) {
            return instantiationService.createInstance(keybindingsEditorInput_1.KeybindingsEditorInput);
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
            return instantiationService.createInstance(preferencesEditorInput_1.SettingsEditor2Input);
        }
    }
    platform_1.Registry.as(editor_2.EditorExtensions.EditorFactory).registerEditorSerializer(keybindingsEditorInput_1.KeybindingsEditorInput.ID, KeybindingsEditorInputSerializer);
    platform_1.Registry.as(editor_2.EditorExtensions.EditorFactory).registerEditorSerializer(preferencesEditorInput_1.SettingsEditor2Input.ID, SettingsEditor2InputSerializer);
    const OPEN_USER_SETTINGS_UI_TITLE = { value: nls.localize('openSettings2', "Open Settings (UI)"), original: 'Open Settings (UI)' };
    const OPEN_USER_SETTINGS_JSON_TITLE = { value: nls.localize('openUserSettingsJson', "Open User Settings (JSON)"), original: 'Open User Settings (JSON)' };
    const OPEN_APPLICATION_SETTINGS_JSON_TITLE = { value: nls.localize('openApplicationSettingsJson', "Open Application Settings (JSON)"), original: 'Open Application Settings (JSON)' };
    const category = { value: nls.localize('preferences', "Preferences"), original: 'Preferences' };
    function sanitizeBoolean(arg) {
        return (0, types_1.isBoolean)(arg) ? arg : undefined;
    }
    function sanitizeString(arg) {
        return (0, types_1.isString)(arg) ? arg : undefined;
    }
    function sanitizeOpenSettingsArgs(args) {
        if (!(0, types_1.isObject)(args)) {
            args = {};
        }
        let sanitizedObject = {
            focusSearch: sanitizeBoolean(args?.focusSearch),
            openToSide: sanitizeBoolean(args?.openToSide),
            query: sanitizeString(args?.query)
        };
        if ((0, types_1.isString)(args?.revealSetting?.key)) {
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
    let PreferencesActionsContribution = class PreferencesActionsContribution extends lifecycle_1.Disposable {
        constructor(environmentService, userDataProfileService, preferencesService, workspaceContextService, labelService, extensionService, userDataProfilesService) {
            super();
            this.environmentService = environmentService;
            this.userDataProfileService = userDataProfileService;
            this.preferencesService = preferencesService;
            this.workspaceContextService = workspaceContextService;
            this.labelService = labelService;
            this.extensionService = extensionService;
            this.userDataProfilesService = userDataProfilesService;
            this.registerSettingsActions();
            this.registerKeybindingsActions();
            this.updatePreferencesEditorMenuItem();
            this._register(workspaceContextService.onDidChangeWorkbenchState(() => this.updatePreferencesEditorMenuItem()));
            this._register(workspaceContextService.onDidChangeWorkspaceFolders(() => this.updatePreferencesEditorMenuItemForWorkspaceFolders()));
        }
        registerSettingsActions() {
            this._register((0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_COMMAND_OPEN_SETTINGS,
                        title: {
                            value: nls.localize('settings', "Settings"),
                            mnemonicTitle: nls.localize({ key: 'miOpenSettings', comment: ['&& denotes a mnemonic'] }, "&&Settings"),
                            original: 'Settings'
                        },
                        keybinding: {
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            when: null,
                            primary: 2048 /* KeyMod.CtrlCmd */ | 87 /* KeyCode.Comma */,
                        },
                        menu: [{
                                id: actions_1.MenuId.GlobalActivity,
                                group: '2_configuration',
                                order: 2
                            }, {
                                id: actions_1.MenuId.MenubarPreferencesMenu,
                                group: '2_configuration',
                                order: 2
                            }],
                    });
                }
                run(accessor, args) {
                    // args takes a string for backcompat
                    const opts = typeof args === 'string' ? { query: args } : sanitizeOpenSettingsArgs(args);
                    return accessor.get(preferences_2.IPreferencesService).openSettings(opts);
                }
            }));
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openSettings2',
                        title: { value: nls.localize('openSettings2', "Open Settings (UI)"), original: 'Open Settings (UI)' },
                        category,
                        f1: true,
                    });
                }
                run(accessor, args) {
                    args = sanitizeOpenSettingsArgs(args);
                    return accessor.get(preferences_2.IPreferencesService).openSettings({ jsonEditor: false, ...args });
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
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
                    return accessor.get(preferences_2.IPreferencesService).openSettings({ jsonEditor: true, ...args });
                }
            });
            const that = this;
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openApplicationSettingsJson',
                        title: OPEN_APPLICATION_SETTINGS_JSON_TITLE,
                        category,
                        menu: {
                            id: actions_1.MenuId.CommandPalette,
                            when: contextkey_1.ContextKeyExpr.notEquals(userDataProfile_1.CURRENT_PROFILE_CONTEXT.key, that.userDataProfilesService.defaultProfile.id)
                        }
                    });
                }
                run(accessor, args) {
                    args = sanitizeOpenSettingsArgs(args);
                    return accessor.get(preferences_2.IPreferencesService).openApplicationSettings({ jsonEditor: true, ...args });
                }
            });
            // Opens the User tab of the Settings editor
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openGlobalSettings',
                        title: { value: nls.localize('openGlobalSettings', "Open User Settings"), original: 'Open User Settings' },
                        category,
                        f1: true,
                    });
                }
                run(accessor, args) {
                    args = sanitizeOpenSettingsArgs(args);
                    return accessor.get(preferences_2.IPreferencesService).openUserSettings(args);
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openRawDefaultSettings',
                        title: { value: nls.localize('openRawDefaultSettings', "Open Default Settings (JSON)"), original: 'Open Default Settings (JSON)' },
                        category,
                        f1: true,
                    });
                }
                run(accessor) {
                    return accessor.get(preferences_2.IPreferencesService).openRawDefaultSettings();
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: preferencesActions_1.ConfigureLanguageBasedSettingsAction.ID,
                        title: preferencesActions_1.ConfigureLanguageBasedSettingsAction.LABEL,
                        category,
                        f1: true,
                    });
                }
                run(accessor) {
                    return accessor.get(instantiation_1.IInstantiationService).createInstance(preferencesActions_1.ConfigureLanguageBasedSettingsAction, preferencesActions_1.ConfigureLanguageBasedSettingsAction.ID, preferencesActions_1.ConfigureLanguageBasedSettingsAction.LABEL.value).run();
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openWorkspaceSettings',
                        title: { value: nls.localize('openWorkspaceSettings', "Open Workspace Settings"), original: 'Open Workspace Settings' },
                        category,
                        menu: {
                            id: actions_1.MenuId.CommandPalette,
                            when: contextkeys_2.WorkbenchStateContext.notEqualsTo('empty')
                        }
                    });
                }
                run(accessor, args) {
                    // Match the behaviour of workbench.action.openSettings
                    args = typeof args === 'string' ? { query: args } : sanitizeOpenSettingsArgs(args);
                    return accessor.get(preferences_2.IPreferencesService).openWorkspaceSettings(args);
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openAccessibilitySettings',
                        title: { value: nls.localize('openAccessibilitySettings', "Open Accessibility Settings"), original: 'Open Accessibility Settings' },
                        category,
                        menu: {
                            id: actions_1.MenuId.CommandPalette,
                            when: contextkeys_2.WorkbenchStateContext.notEqualsTo('empty')
                        }
                    });
                }
                async run(accessor) {
                    await accessor.get(preferences_2.IPreferencesService).openSettings({ jsonEditor: false, query: '@tag:accessibility' });
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openWorkspaceSettingsFile',
                        title: { value: nls.localize('openWorkspaceSettingsFile', "Open Workspace Settings (JSON)"), original: 'Open Workspace Settings (JSON)' },
                        category,
                        menu: {
                            id: actions_1.MenuId.CommandPalette,
                            when: contextkeys_2.WorkbenchStateContext.notEqualsTo('empty')
                        }
                    });
                }
                run(accessor, args) {
                    args = sanitizeOpenSettingsArgs(args);
                    return accessor.get(preferences_2.IPreferencesService).openWorkspaceSettings({ jsonEditor: true, ...args });
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openFolderSettings',
                        title: { value: nls.localize('openFolderSettings', "Open Folder Settings"), original: 'Open Folder Settings' },
                        category,
                        menu: {
                            id: actions_1.MenuId.CommandPalette,
                            when: contextkeys_2.WorkbenchStateContext.isEqualTo('workspace')
                        }
                    });
                }
                async run(accessor, args) {
                    const commandService = accessor.get(commands_1.ICommandService);
                    const preferencesService = accessor.get(preferences_2.IPreferencesService);
                    const workspaceFolder = await commandService.executeCommand(workspaceCommands_1.PICK_WORKSPACE_FOLDER_COMMAND_ID);
                    if (workspaceFolder) {
                        args = sanitizeOpenSettingsArgs(args);
                        await preferencesService.openFolderSettings({ folderUri: workspaceFolder.uri, ...args });
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openFolderSettingsFile',
                        title: { value: nls.localize('openFolderSettingsFile', "Open Folder Settings (JSON)"), original: 'Open Folder Settings (JSON)' },
                        category,
                        menu: {
                            id: actions_1.MenuId.CommandPalette,
                            when: contextkeys_2.WorkbenchStateContext.isEqualTo('workspace')
                        }
                    });
                }
                async run(accessor, args) {
                    const commandService = accessor.get(commands_1.ICommandService);
                    const preferencesService = accessor.get(preferences_2.IPreferencesService);
                    const workspaceFolder = await commandService.executeCommand(workspaceCommands_1.PICK_WORKSPACE_FOLDER_COMMAND_ID);
                    if (workspaceFolder) {
                        args = sanitizeOpenSettingsArgs(args);
                        await preferencesService.openFolderSettings({ folderUri: workspaceFolder.uri, jsonEditor: true, ...args });
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: '_workbench.action.openFolderSettings',
                        title: { value: nls.localize('openFolderSettings', "Open Folder Settings"), original: 'Open Folder Settings' },
                        category,
                        menu: {
                            id: actions_1.MenuId.ExplorerContext,
                            group: '2_workspace',
                            order: 20,
                            when: contextkey_1.ContextKeyExpr.and(files_1.ExplorerRootContext, files_1.ExplorerFolderContext)
                        }
                    });
                }
                run(accessor, resource) {
                    return accessor.get(preferences_2.IPreferencesService).openFolderSettings({ folderUri: resource });
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FILTER_ONLINE,
                        title: nls.localize({ key: 'miOpenOnlineSettings', comment: ['&& denotes a mnemonic'] }, "&&Online Services Settings"),
                        menu: {
                            id: actions_1.MenuId.MenubarPreferencesMenu,
                            group: '3_settings',
                            order: 1,
                        }
                    });
                }
                run(accessor) {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof settingsEditor2_1.SettingsEditor2) {
                        editorPane.focusSearch(`@tag:usesOnlineServices`);
                    }
                    else {
                        accessor.get(preferences_2.IPreferencesService).openSettings({ jsonEditor: false, query: '@tag:usesOnlineServices' });
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FILTER_UNTRUSTED,
                        title: { value: nls.localize('filterUntrusted', "Show untrusted workspace settings"), original: 'Show untrusted workspace settings' },
                    });
                }
                run(accessor) {
                    accessor.get(preferences_2.IPreferencesService).openWorkspaceSettings({ jsonEditor: false, query: `@tag:${preferences_1.REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG}` });
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_COMMAND_FILTER_TELEMETRY,
                        title: nls.localize({ key: 'miOpenTelemetrySettings', comment: ['&& denotes a mnemonic'] }, "&&Telemetry Settings")
                    });
                }
                run(accessor) {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof settingsEditor2_1.SettingsEditor2) {
                        editorPane.focusSearch(`@tag:telemetry`);
                    }
                    else {
                        accessor.get(preferences_2.IPreferencesService).openSettings({ jsonEditor: false, query: '@tag:telemetry' });
                    }
                }
            });
            this.registerSettingsEditorActions();
            this.extensionService.whenInstalledExtensionsRegistered()
                .then(() => {
                const remoteAuthority = this.environmentService.remoteAuthority;
                const hostLabel = this.labelService.getHostLabel(network_1.Schemas.vscodeRemote, remoteAuthority) || remoteAuthority;
                const label = nls.localize('openRemoteSettings', "Open Remote Settings ({0})", hostLabel);
                (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                    constructor() {
                        super({
                            id: 'workbench.action.openRemoteSettings',
                            title: { value: label, original: `Open Remote Settings (${hostLabel})` },
                            category,
                            menu: {
                                id: actions_1.MenuId.CommandPalette,
                                when: contextkeys_2.RemoteNameContext.notEqualsTo('')
                            }
                        });
                    }
                    run(accessor, args) {
                        args = sanitizeOpenSettingsArgs(args);
                        return accessor.get(preferences_2.IPreferencesService).openRemoteSettings(args);
                    }
                });
                const jsonLabel = nls.localize('openRemoteSettingsJSON', "Open Remote Settings (JSON) ({0})", hostLabel);
                (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                    constructor() {
                        super({
                            id: 'workbench.action.openRemoteSettingsFile',
                            title: { value: jsonLabel, original: `Open Remote Settings (JSON) (${hostLabel})` },
                            category,
                            menu: {
                                id: actions_1.MenuId.CommandPalette,
                                when: contextkeys_2.RemoteNameContext.notEqualsTo('')
                            }
                        });
                    }
                    run(accessor, args) {
                        args = sanitizeOpenSettingsArgs(args);
                        return accessor.get(preferences_2.IPreferencesService).openRemoteSettings({ jsonEditor: true, ...args });
                    }
                });
            });
        }
        registerSettingsEditorActions() {
            function getPreferencesEditor(accessor) {
                const activeEditorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                if (activeEditorPane instanceof settingsEditor2_1.SettingsEditor2) {
                    return activeEditorPane;
                }
                return null;
            }
            function settingsEditorFocusSearch(accessor) {
                const preferencesEditor = getPreferencesEditor(accessor);
                preferencesEditor?.focusSearch();
            }
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_SEARCH,
                        precondition: preferences_1.CONTEXT_SETTINGS_EDITOR,
                        keybinding: {
                            primary: 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */,
                            weight: 100 /* KeybindingWeight.EditorContrib */,
                            when: null
                        },
                        category,
                        f1: true,
                        title: { value: nls.localize('settings.focusSearch', "Focus Settings Search"), original: 'Focus Settings Search' }
                    });
                }
                run(accessor) { settingsEditorFocusSearch(accessor); }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: preferences_1.SETTINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS,
                        precondition: preferences_1.CONTEXT_SETTINGS_EDITOR,
                        keybinding: {
                            primary: 9 /* KeyCode.Escape */,
                            weight: 100 /* KeybindingWeight.EditorContrib */,
                            when: preferences_1.CONTEXT_SETTINGS_SEARCH_FOCUS
                        },
                        category,
                        f1: true,
                        title: { value: nls.localize('settings.clearResults', "Clear Settings Search Results"), original: 'Clear Settings Search Results' }
                    });
                }
                run(accessor) {
                    const preferencesEditor = getPreferencesEditor(accessor);
                    preferencesEditor?.clearSearchResults();
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FOCUS_FILE,
                        precondition: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_SETTINGS_SEARCH_FOCUS, suggest_1.Context.Visible.toNegated()),
                        keybinding: {
                            primary: 18 /* KeyCode.DownArrow */,
                            weight: 100 /* KeybindingWeight.EditorContrib */,
                            when: null
                        },
                        title: nls.localize('settings.focusFile', "Focus settings file")
                    });
                }
                run(accessor, args) {
                    const preferencesEditor = getPreferencesEditor(accessor);
                    preferencesEditor?.focusSettings();
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_FROM_SEARCH,
                        precondition: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_SETTINGS_SEARCH_FOCUS, suggest_1.Context.Visible.toNegated()),
                        keybinding: {
                            primary: 18 /* KeyCode.DownArrow */,
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            when: null
                        },
                        title: nls.localize('settings.focusFile', "Focus settings file")
                    });
                }
                run(accessor, args) {
                    const preferencesEditor = getPreferencesEditor(accessor);
                    preferencesEditor?.focusSettings();
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_LIST,
                        precondition: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_SETTINGS_EDITOR, preferences_1.CONTEXT_TOC_ROW_FOCUS),
                        keybinding: {
                            primary: 3 /* KeyCode.Enter */,
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            when: null
                        },
                        title: nls.localize('settings.focusSettingsList', "Focus settings list")
                    });
                }
                run(accessor) {
                    const preferencesEditor = getPreferencesEditor(accessor);
                    if (preferencesEditor instanceof settingsEditor2_1.SettingsEditor2) {
                        preferencesEditor.focusSettings();
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FOCUS_TOC,
                        precondition: preferences_1.CONTEXT_SETTINGS_EDITOR,
                        f1: true,
                        keybinding: [
                            {
                                primary: 15 /* KeyCode.LeftArrow */,
                                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                                when: preferences_1.CONTEXT_SETTINGS_ROW_FOCUS
                            }
                        ],
                        category,
                        title: { value: nls.localize('settings.focusSettingsTOC', "Focus Settings Table of Contents"), original: 'Focus Settings Table of Contents' }
                    });
                }
                run(accessor) {
                    const preferencesEditor = getPreferencesEditor(accessor);
                    if (!(preferencesEditor instanceof settingsEditor2_1.SettingsEditor2)) {
                        return;
                    }
                    preferencesEditor.focusTOC();
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FOCUS_CONTROL,
                        precondition: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_SETTINGS_EDITOR, preferences_1.CONTEXT_SETTINGS_ROW_FOCUS),
                        keybinding: {
                            primary: 3 /* KeyCode.Enter */,
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        },
                        title: nls.localize('settings.focusSettingControl', "Focus Setting Control")
                    });
                }
                run(accessor) {
                    const preferencesEditor = getPreferencesEditor(accessor);
                    if (!(preferencesEditor instanceof settingsEditor2_1.SettingsEditor2)) {
                        return;
                    }
                    if (document.activeElement?.classList.contains('monaco-list')) {
                        preferencesEditor.focusSettings(true);
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: preferences_1.SETTINGS_EDITOR_COMMAND_SHOW_CONTEXT_MENU,
                        precondition: preferences_1.CONTEXT_SETTINGS_EDITOR,
                        keybinding: {
                            primary: 1024 /* KeyMod.Shift */ | 67 /* KeyCode.F9 */,
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            when: null
                        },
                        f1: true,
                        category,
                        title: { value: nls.localize('settings.showContextMenu', "Show Setting Context Menu"), original: 'Show Setting Context Menu' }
                    });
                }
                run(accessor) {
                    const preferencesEditor = getPreferencesEditor(accessor);
                    if (preferencesEditor instanceof settingsEditor2_1.SettingsEditor2) {
                        preferencesEditor.showContextMenu();
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FOCUS_UP,
                        precondition: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_SETTINGS_EDITOR, preferences_1.CONTEXT_SETTINGS_SEARCH_FOCUS.toNegated(), preferences_1.CONTEXT_SETTINGS_JSON_EDITOR.toNegated()),
                        keybinding: {
                            primary: 9 /* KeyCode.Escape */,
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            when: null
                        },
                        f1: true,
                        category,
                        title: { value: nls.localize('settings.focusLevelUp', "Move Focus Up One Level"), original: 'Move Focus Up One Level' }
                    });
                }
                run(accessor) {
                    const preferencesEditor = getPreferencesEditor(accessor);
                    if (!(preferencesEditor instanceof settingsEditor2_1.SettingsEditor2)) {
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
        registerKeybindingsActions() {
            const that = this;
            const category = { value: nls.localize('preferences', "Preferences"), original: 'Preferences' };
            const id = 'workbench.action.openGlobalKeybindings';
            this._register((0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id,
                        title: { value: nls.localize('openGlobalKeybindings', "Open Keyboard Shortcuts"), original: 'Open Keyboard Shortcuts' },
                        shortTitle: nls.localize('keyboardShortcuts', "Keyboard Shortcuts"),
                        category,
                        icon: preferencesIcons_1.preferencesOpenSettingsIcon,
                        keybinding: {
                            when: null,
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 49 /* KeyCode.KeyS */)
                        },
                        menu: [
                            { id: actions_1.MenuId.CommandPalette },
                            {
                                id: actions_1.MenuId.EditorTitle,
                                when: contextkeys_2.ResourceContextKey.Resource.isEqualTo(that.userDataProfileService.currentProfile.keybindingsResource.toString()),
                                group: 'navigation',
                                order: 1,
                            },
                            {
                                id: actions_1.MenuId.GlobalActivity,
                                group: '2_configuration',
                                order: 4
                            }
                        ]
                    });
                }
                run(accessor, args) {
                    const query = typeof args === 'string' ? args : undefined;
                    return accessor.get(preferences_2.IPreferencesService).openGlobalKeybindingSettings(false, { query });
                }
            }));
            this._register(actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarPreferencesMenu, {
                command: {
                    id,
                    title: nls.localize('keyboardShortcuts', "Keyboard Shortcuts"),
                },
                group: '2_configuration',
                order: 4
            }));
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openDefaultKeybindingsFile',
                        title: { value: nls.localize('openDefaultKeybindingsFile', "Open Default Keyboard Shortcuts (JSON)"), original: 'Open Default Keyboard Shortcuts (JSON)' },
                        category,
                        menu: { id: actions_1.MenuId.CommandPalette }
                    });
                }
                run(accessor) {
                    return accessor.get(preferences_2.IPreferencesService).openDefaultKeybindingsFile();
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openGlobalKeybindingsFile',
                        title: { value: nls.localize('openGlobalKeybindingsFile', "Open Keyboard Shortcuts (JSON)"), original: 'Open Keyboard Shortcuts (JSON)' },
                        category,
                        icon: preferencesIcons_1.preferencesOpenSettingsIcon,
                        menu: [
                            { id: actions_1.MenuId.CommandPalette },
                            {
                                id: actions_1.MenuId.EditorTitle,
                                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR),
                                group: 'navigation',
                            }
                        ]
                    });
                }
                run(accessor) {
                    return accessor.get(preferences_2.IPreferencesService).openGlobalKeybindingSettings(true);
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: preferences_1.KEYBINDINGS_EDITOR_SHOW_DEFAULT_KEYBINDINGS,
                        title: { value: nls.localize('showDefaultKeybindings', "Show System Keybindings"), original: 'Show System Keyboard Shortcuts' },
                        menu: [
                            {
                                id: actions_1.MenuId.EditorTitle,
                                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR),
                                group: '1_keyboard_preferences_actions'
                            }
                        ]
                    });
                }
                run(accessor) {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.search('@source:system');
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: preferences_1.KEYBINDINGS_EDITOR_SHOW_EXTENSION_KEYBINDINGS,
                        title: { value: nls.localize('showExtensionKeybindings', "Show Extension Keybindings"), original: 'Show Extension Keyboard Shortcuts' },
                        menu: [
                            {
                                id: actions_1.MenuId.EditorTitle,
                                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR),
                                group: '1_keyboard_preferences_actions'
                            }
                        ]
                    });
                }
                run(accessor) {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.search('@source:extension');
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: preferences_1.KEYBINDINGS_EDITOR_SHOW_USER_KEYBINDINGS,
                        title: { value: nls.localize('showUserKeybindings', "Show User Keybindings"), original: 'Show User Keyboard Shortcuts' },
                        menu: [
                            {
                                id: actions_1.MenuId.EditorTitle,
                                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR),
                                group: '1_keyboard_preferences_actions'
                            }
                        ]
                    });
                }
                run(accessor) {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.search('@source:user');
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS,
                        title: nls.localize('clear', "Clear Search Results"),
                        keybinding: {
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDINGS_SEARCH_FOCUS),
                            primary: 9 /* KeyCode.Escape */,
                        }
                    });
                }
                run(accessor) {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.clearSearchResults();
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_HISTORY,
                        title: nls.localize('clearHistory', "Clear Keyboard Shortcuts Search History"),
                        category,
                        menu: [
                            {
                                id: actions_1.MenuId.CommandPalette,
                                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR),
                            }
                        ]
                    });
                }
                run(accessor) {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.clearKeyboardShortcutSearchHistory();
                    }
                }
            });
            this.registerKeybindingEditorActions();
        }
        registerKeybindingEditorActions() {
            const that = this;
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_DEFINE,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDING_FOCUS, preferences_1.CONTEXT_WHEN_FOCUS.toNegated()),
                primary: 3 /* KeyCode.Enter */,
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.defineKeybinding(editorPane.activeKeybindingEntry, false);
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_ADD,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDING_FOCUS),
                primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */),
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.defineKeybinding(editorPane.activeKeybindingEntry, true);
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_DEFINE_WHEN,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDING_FOCUS),
                primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 35 /* KeyCode.KeyE */),
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor && editorPane.activeKeybindingEntry.keybindingItem.keybinding) {
                        editorPane.defineWhenExpression(editorPane.activeKeybindingEntry);
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_REMOVE,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDING_FOCUS, contextkeys_1.InputFocusedContext.toNegated()),
                primary: 20 /* KeyCode.Delete */,
                mac: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */
                },
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.removeKeybinding(editorPane.activeKeybindingEntry);
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_RESET,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDING_FOCUS),
                primary: 0,
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.resetKeybinding(editorPane.activeKeybindingEntry);
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_SEARCH,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR),
                primary: 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */,
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.focusSearch();
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_RECORD_SEARCH_KEYS,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDINGS_SEARCH_FOCUS),
                primary: 512 /* KeyMod.Alt */ | 41 /* KeyCode.KeyK */,
                mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 41 /* KeyCode.KeyK */ },
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.recordSearchKeys();
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_SORTBY_PRECEDENCE,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR),
                primary: 512 /* KeyMod.Alt */ | 46 /* KeyCode.KeyP */,
                mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 46 /* KeyCode.KeyP */ },
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.toggleSortByPrecedence();
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_SHOW_SIMILAR,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDING_FOCUS),
                primary: 0,
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.showSimilarKeybindings(editorPane.activeKeybindingEntry);
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_COPY,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDING_FOCUS, preferences_1.CONTEXT_WHEN_FOCUS.negate()),
                primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */,
                handler: async (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        await editorPane.copyKeybinding(editorPane.activeKeybindingEntry);
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDING_FOCUS),
                primary: 0,
                handler: async (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        await editorPane.copyKeybindingCommand(editorPane.activeKeybindingEntry);
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND_TITLE,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDING_FOCUS),
                primary: 0,
                handler: async (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        await editorPane.copyKeybindingCommandTitle(editorPane.activeKeybindingEntry);
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_FOCUS_KEYBINDINGS,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDINGS_SEARCH_FOCUS),
                primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */,
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.focusKeybindings();
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_REJECT_WHEN,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_WHEN_FOCUS, suggest_1.Context.Visible.toNegated()),
                primary: 9 /* KeyCode.Escape */,
                handler: async (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.rejectWhenExpression(editorPane.activeKeybindingEntry);
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_ACCEPT_WHEN,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_WHEN_FOCUS, suggest_1.Context.Visible.toNegated()),
                primary: 3 /* KeyCode.Enter */,
                handler: async (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.acceptWhenExpression(editorPane.activeKeybindingEntry);
                    }
                }
            });
            const profileScopedActionDisposables = this._register(new lifecycle_1.DisposableStore());
            const registerProfileScopedActions = () => {
                profileScopedActionDisposables.clear();
                profileScopedActionDisposables.add((0, actions_1.registerAction2)(class DefineKeybindingAction extends actions_1.Action2 {
                    constructor() {
                        const when = contextkeys_2.ResourceContextKey.Resource.isEqualTo(that.userDataProfileService.currentProfile.keybindingsResource.toString());
                        super({
                            id: 'editor.action.defineKeybinding',
                            title: { value: nls.localize('defineKeybinding.start', "Define Keybinding"), original: 'Define Keybinding' },
                            f1: true,
                            precondition: when,
                            keybinding: {
                                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                                when,
                                primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */)
                            },
                            menu: {
                                id: actions_1.MenuId.EditorContent,
                                when,
                            }
                        });
                    }
                    async run(accessor) {
                        const codeEditor = accessor.get(editorService_1.IEditorService).activeTextEditorControl;
                        if ((0, editorBrowser_1.isCodeEditor)(codeEditor)) {
                            codeEditor.getContribution(preferences_2.DEFINE_KEYBINDING_EDITOR_CONTRIB_ID)?.showDefineKeybindingWidget();
                        }
                    }
                }));
            };
            registerProfileScopedActions();
            this._register(this.userDataProfileService.onDidChangeCurrentProfile(() => registerProfileScopedActions()));
        }
        updatePreferencesEditorMenuItem() {
            const commandId = '_workbench.openWorkspaceSettingsEditor';
            if (this.workspaceContextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */ && !commands_1.CommandsRegistry.getCommand(commandId)) {
                commands_1.CommandsRegistry.registerCommand(commandId, () => this.preferencesService.openWorkspaceSettings({ jsonEditor: false }));
                actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, {
                    command: {
                        id: commandId,
                        title: OPEN_USER_SETTINGS_UI_TITLE,
                        icon: preferencesIcons_1.preferencesOpenSettingsIcon
                    },
                    when: contextkey_1.ContextKeyExpr.and(contextkeys_2.ResourceContextKey.Resource.isEqualTo(this.preferencesService.workspaceSettingsResource.toString()), contextkeys_2.WorkbenchStateContext.isEqualTo('workspace'), contextkey_1.ContextKeyExpr.not('isInDiffEditor')),
                    group: 'navigation',
                    order: 1
                });
            }
            this.updatePreferencesEditorMenuItemForWorkspaceFolders();
        }
        updatePreferencesEditorMenuItemForWorkspaceFolders() {
            for (const folder of this.workspaceContextService.getWorkspace().folders) {
                const commandId = `_workbench.openFolderSettings.${folder.uri.toString()}`;
                if (!commands_1.CommandsRegistry.getCommand(commandId)) {
                    commands_1.CommandsRegistry.registerCommand(commandId, () => {
                        if (this.workspaceContextService.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
                            return this.preferencesService.openWorkspaceSettings({ jsonEditor: false });
                        }
                        else {
                            return this.preferencesService.openFolderSettings({ folderUri: folder.uri, jsonEditor: false });
                        }
                    });
                    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, {
                        command: {
                            id: commandId,
                            title: OPEN_USER_SETTINGS_UI_TITLE,
                            icon: preferencesIcons_1.preferencesOpenSettingsIcon
                        },
                        when: contextkey_1.ContextKeyExpr.and(contextkeys_2.ResourceContextKey.Resource.isEqualTo(this.preferencesService.getFolderSettingsResource(folder.uri).toString()), contextkey_1.ContextKeyExpr.not('isInDiffEditor')),
                        group: 'navigation',
                        order: 1
                    });
                }
            }
        }
    };
    PreferencesActionsContribution = __decorate([
        __param(0, environmentService_1.IWorkbenchEnvironmentService),
        __param(1, userDataProfile_1.IUserDataProfileService),
        __param(2, preferences_2.IPreferencesService),
        __param(3, workspace_1.IWorkspaceContextService),
        __param(4, label_1.ILabelService),
        __param(5, extensions_1.IExtensionService),
        __param(6, userDataProfile_2.IUserDataProfilesService)
    ], PreferencesActionsContribution);
    let SettingsEditorTitleContribution = class SettingsEditorTitleContribution extends lifecycle_1.Disposable {
        constructor(userDataProfileService, userDataProfilesService) {
            super();
            this.userDataProfileService = userDataProfileService;
            this.userDataProfilesService = userDataProfilesService;
            this.registerSettingsEditorTitleActions();
        }
        registerSettingsEditorTitleActions() {
            const registerOpenUserSettingsEditorFromJsonActionDisposables = this._register(new lifecycle_1.MutableDisposable());
            const openUserSettingsEditorWhen = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(contextkeys_2.ResourceContextKey.Resource.isEqualTo(this.userDataProfileService.currentProfile.settingsResource.toString()), contextkeys_2.ResourceContextKey.Resource.isEqualTo(this.userDataProfilesService.defaultProfile.settingsResource.toString())), contextkey_1.ContextKeyExpr.not('isInDiffEditor'));
            const registerOpenUserSettingsEditorFromJsonAction = () => {
                registerOpenUserSettingsEditorFromJsonActionDisposables.value = (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                    constructor() {
                        super({
                            id: '_workbench.openUserSettingsEditor',
                            title: OPEN_USER_SETTINGS_UI_TITLE,
                            icon: preferencesIcons_1.preferencesOpenSettingsIcon,
                            menu: [{
                                    id: actions_1.MenuId.EditorTitle,
                                    when: openUserSettingsEditorWhen,
                                    group: 'navigation',
                                    order: 1
                                }]
                        });
                    }
                    run(accessor, args) {
                        args = sanitizeOpenSettingsArgs(args);
                        return accessor.get(preferences_2.IPreferencesService).openUserSettings({ jsonEditor: false, ...args });
                    }
                });
            };
            registerOpenUserSettingsEditorFromJsonAction();
            this._register(this.userDataProfileService.onDidChangeCurrentProfile(() => {
                // Force the action to check the context again.
                registerOpenUserSettingsEditorFromJsonAction();
            }));
            const openSettingsJsonWhen = contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_SETTINGS_EDITOR, preferences_1.CONTEXT_SETTINGS_JSON_EDITOR.toNegated());
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_SWITCH_TO_JSON,
                        title: { value: nls.localize('openSettingsJson', "Open Settings (JSON)"), original: 'Open Settings (JSON)' },
                        icon: preferencesIcons_1.preferencesOpenSettingsIcon,
                        menu: [{
                                id: actions_1.MenuId.EditorTitle,
                                when: openSettingsJsonWhen,
                                group: 'navigation',
                                order: 1
                            }]
                    });
                }
                run(accessor) {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof settingsEditor2_1.SettingsEditor2) {
                        return editorPane.switchToSettingsFile();
                    }
                    return null;
                }
            });
        }
    };
    SettingsEditorTitleContribution = __decorate([
        __param(0, userDataProfile_1.IUserDataProfileService),
        __param(1, userDataProfile_2.IUserDataProfilesService)
    ], SettingsEditorTitleContribution);
    const workbenchContributionsRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(PreferencesActionsContribution, 1 /* LifecyclePhase.Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(preferencesContribution_1.PreferencesContribution, 1 /* LifecyclePhase.Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(SettingsEditorTitleContribution, 3 /* LifecyclePhase.Restored */);
    (0, editorExtensions_1.registerEditorContribution)(preferencesEditor_1.SettingsEditorContribution.ID, preferencesEditor_1.SettingsEditorContribution, 1 /* EditorContributionInstantiation.AfterFirstRender */);
    // Preferences menu
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
        title: nls.localize({ key: 'miPreferences', comment: ['&& denotes a mnemonic'] }, "&&Preferences"),
        submenu: actions_1.MenuId.MenubarPreferencesMenu,
        group: '5_autosave',
        order: 2,
        when: contextkeys_1.IsMacNativeContext.toNegated() // on macOS native the preferences menu is separate under the application menu
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmVyZW5jZXMuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvcHJlZmVyZW5jZXMvYnJvd3Nlci9wcmVmZXJlbmNlcy5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7SUE4Q2hHLE1BQU0sOEJBQThCLEdBQUcsd0JBQXdCLENBQUM7SUFFaEUsTUFBTSxrQ0FBa0MsR0FBRyxtQ0FBbUMsQ0FBQztJQUMvRSxNQUFNLGtEQUFrRCxHQUFHLHlDQUF5QyxDQUFDO0lBQ3JHLE1BQU0sMkNBQTJDLEdBQUcsbUNBQW1DLENBQUM7SUFDeEYsTUFBTSxpQ0FBaUMsR0FBRywwQkFBMEIsQ0FBQztJQUNyRSxNQUFNLHFDQUFxQyxHQUFHLHFDQUFxQyxDQUFDO0lBQ3BGLE1BQU0sZ0NBQWdDLEdBQUcsOEJBQThCLENBQUM7SUFFeEUsTUFBTSxzQ0FBc0MsR0FBRyx1QkFBdUIsQ0FBQztJQUN2RSxNQUFNLHFDQUFxQyxHQUFHLHlCQUF5QixDQUFDO0lBQ3hFLE1BQU0sd0NBQXdDLEdBQUcsMEJBQTBCLENBQUM7SUFFNUUsTUFBTSw4QkFBOEIsR0FBRywrQkFBK0IsQ0FBQztJQUN2RSxNQUFNLGlDQUFpQyxHQUFHLDRCQUE0QixDQUFDO0lBRXZFLG1CQUFRLENBQUMsRUFBRSxDQUFzQix5QkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxrQkFBa0IsQ0FDL0UsNkJBQW9CLENBQUMsTUFBTSxDQUMxQixpQ0FBZSxFQUNmLGlDQUFlLENBQUMsRUFBRSxFQUNsQixHQUFHLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLG1CQUFtQixDQUFDLENBQ3BELEVBQ0Q7UUFDQyxJQUFJLDRCQUFjLENBQUMsNkNBQW9CLENBQUM7S0FDeEMsQ0FDRCxDQUFDO0lBRUYsbUJBQVEsQ0FBQyxFQUFFLENB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