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
define(["require", "exports", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/json", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/uri", "vs/editor/browser/coreCommands", "vs/editor/browser/editorBrowser", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/editor/common/services/resolverService", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/label/common/label", "vs/platform/notification/common/notification", "vs/platform/registry/common/platform", "vs/platform/workspace/common/workspace", "vs/workbench/common/editor", "vs/workbench/common/editor/sideBySideEditorInput", "vs/workbench/common/editor/textResourceEditorInput", "vs/workbench/services/configuration/common/jsonEditing", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/preferences/browser/keybindingsEditorInput", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/preferences/common/preferencesEditorInput", "vs/workbench/services/preferences/common/preferencesModels", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/textfile/common/textEditorService", "vs/workbench/services/textfile/common/textfiles", "vs/base/common/types", "vs/editor/contrib/suggest/browser/suggestController", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/userDataProfile/common/userDataProfile"], function (require, exports, errors_1, event_1, json_1, lifecycle_1, network, uri_1, coreCommands_1, editorBrowser_1, model_1, language_1, resolverService_1, nls, configuration_1, configurationRegistry_1, extensions_1, instantiation_1, keybinding_1, label_1, notification_1, platform_1, workspace_1, editor_1, sideBySideEditorInput_1, textResourceEditorInput_1, jsonEditing_1, editorGroupsService_1, editorService_1, keybindingsEditorInput_1, preferences_1, preferencesEditorInput_1, preferencesModels_1, remoteAgentService_1, textEditorService_1, textfiles_1, types_1, suggestController_1, userDataProfile_1, userDataProfile_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PreferencesService = void 0;
    const emptyEditableSettingsContent = '{\n}';
    let PreferencesService = class PreferencesService extends lifecycle_1.Disposable {
        constructor(editorService, editorGroupService, textFileService, configurationService, notificationService, contextService, instantiationService, userDataProfileService, userDataProfilesService, textModelResolverService, keybindingService, modelService, jsonEditingService, languageService, labelService, remoteAgentService, textEditorService) {
            super();
            this.editorService = editorService;
            this.editorGroupService = editorGroupService;
            this.textFileService = textFileService;
            this.configurationService = configurationService;
            this.notificationService = notificationService;
            this.contextService = contextService;
            this.instantiationService = instantiationService;
            this.userDataProfileService = userDataProfileService;
            this.userDataProfilesService = userDataProfilesService;
            this.textModelResolverService = textModelResolverService;
            this.modelService = modelService;
            this.jsonEditingService = jsonEditingService;
            this.languageService = languageService;
            this.labelService = labelService;
            this.remoteAgentService = remoteAgentService;
            this.textEditorService = textEditorService;
            this._onDispose = this._register(new event_1.Emitter());
            this.defaultKeybindingsResource = uri_1.URI.from({ scheme: network.Schemas.vscode, authority: 'defaultsettings', path: '/keybindings.json' });
            this.defaultSettingsRawResource = uri_1.URI.from({ scheme: network.Schemas.vscode, authority: 'defaultsettings', path: '/defaultSettings.json' });
            // The default keybindings.json updates based on keyboard layouts, so here we make sure
            // if a model has been given out we update it accordingly.
            this._register(keybindingService.onDidUpdateKeybindings(() => {
                const model = modelService.getModel(this.defaultKeybindingsResource);
                if (!model) {
                    // model has not been given out => nothing to do
                    return;
                }
                modelService.updateModel(model, (0, preferencesModels_1.defaultKeybindingsContents)(keybindingService));
            }));
        }
        get userSettingsResource() {
            return this.userDataProfileService.currentProfile.settingsResource;
        }
        get workspaceSettingsResource() {
            if (this.contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
                return null;
            }
            const workspace = this.contextService.getWorkspace();
            return workspace.configuration || workspace.folders[0].toResource(preferences_1.FOLDER_SETTINGS_PATH);
        }
        get settingsEditor2Input() {
            return this.instantiationService.createInstance(preferencesEditorInput_1.SettingsEditor2Input);
        }
        getFolderSettingsResource(resource) {
            const folder = this.contextService.getWorkspaceFolder(resource);
            return folder ? folder.toResource(preferences_1.FOLDER_SETTINGS_PATH) : null;
        }
        resolveModel(uri) {
            if (this.isDefaultSettingsResource(uri)) {
                // We opened a split json editor in this case,
                // and this half shows the default settings.
                const target = this.getConfigurationTargetFromDefaultSettingsResource(uri);
                const languageSelection = this.languageService.createById('jsonc');
                const model = this._register(this.modelService.createModel('', languageSelection, uri));
                let defaultSettings;
                this.configurationService.onDidChangeConfiguration(e => {
                    if (e.source === 7 /* ConfigurationTarget.DEFAULT */) {
                        const model = this.modelService.getModel(uri);
                        if (!model) {
                            // model has not been given out => nothing to do
                            return;
                        }
                        defaultSettings = this.getDefaultSettings(target);
                        this.modelService.updateModel(model, defaultSettings.getContentWithoutMostCommonlyUsed(true));
                        defaultSettings._onDidChange.fire();
                    }
                });
                // Check if Default settings is already created and updated in above promise
                if (!defaultSettings) {
                    defaultSettings = this.getDefaultSettings(target);
                    this.modelService.updateModel(model, defaultSettings.getContentWithoutMostCommonlyUsed(true));
                }
                return model;
            }
            if (this.defaultSettingsRawResource.toString() === uri.toString()) {
                const defaultRawSettingsEditorModel = this.instantiationService.createInstance(preferencesModels_1.DefaultRawSettingsEditorModel, this.getDefaultSettings(3 /* ConfigurationTarget.USER_LOCAL */));
                const languageSelection = this.languageService.createById('jsonc');
                const model = this._register(this.modelService.createModel(defaultRawSettingsEditorModel.content, languageSelection, uri));
                return model;
            }
            if (this.defaultKeybindingsResource.toString() === uri.toString()) {
                const defaultKeybindingsEditorModel = this.instantiationService.createInstance(preferencesModels_1.DefaultKeybindingsEditorModel, uri);
                const languageSelection = this.languageService.createById('jsonc');
                const model = this._register(this.modelService.createModel(defaultKeybindingsEditorModel.content, languageSelection, uri));
                return model;
            }
            return null;
        }
        async createPreferencesEditorModel(uri) {
            if (this.isDefaultSettingsResource(uri)) {
                return this.createDefaultSettingsEditorModel(uri);
            }
            if (this.userSettingsResource.toString() === uri.toString() || this.userDataProfilesService.defaultProfile.settingsResource.toString() === uri.toString()) {
                return this.createEditableSettingsEditorModel(3 /* ConfigurationTarget.USER_LOCAL */, uri);
            }
            const workspaceSettingsUri = await this.getEditableSettingsURI(5 /* ConfigurationTarget.WORKSPACE */);
            if (workspaceSettingsUri && workspaceSettingsUri.toString() === uri.toString()) {
                return this.createEditableSettingsEditorModel(5 /* ConfigurationTarget.WORKSPACE */, workspaceSettingsUri);
            }
            if (this.contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
                const settingsUri = await this.getEditableSettingsURI(6 /* ConfigurationTarget.WORKSPACE_FOLDER */, uri);
                if (settingsUri && settingsUri.toString() === uri.toString()) {
                    return this.createEditableSettingsEditorModel(6 /* ConfigurationTarget.WORKSPACE_FOLDER */, uri);
                }
            }
            const remoteEnvironment = await this.remoteAgentService.getEnvironment();
            const remoteSettingsUri = remoteEnvironment ? remoteEnvironment.settingsPath : null;
            if (remoteSettingsUri && remoteSettingsUri.toString() === uri.toString()) {
                return this.createEditableSettingsEditorModel(4 /* ConfigurationTarget.USER_REMOTE */, uri);
            }
            return null;
        }
        openRawDefaultSettings() {
            return this.editorService.openEditor({ resource: this.defaultSettingsRawResource });
        }
        openRawUserSettings() {
            return this.editorService.openEditor({ resource: this.userSettingsResource });
        }
        shouldOpenJsonByDefault() {
            return this.configurationService.getValue('workbench.settings.editor') === 'json';
        }
        openSettings(options = {}) {
            options = {
                ...options,
                target: 3 /* ConfigurationTarget.USER_LOCAL */,
            };
            if (options.query) {
                options.jsonEditor = false;
            }
            return this.open(this.userSettingsResource, options);
        }
        openLanguageSpecificSettings(languageId, options = {}) {
            if (this.shouldOpenJsonByDefault()) {
                options.query = undefined;
                options.revealSetting = { key: `[${languageId}]`, edit: true };
            }
            else {
                options.query = `@lang:${languageId}${options.query ? ` ${options.query}` : ''}`;
            }
            options.target = options.target ?? 3 /* ConfigurationTarget.USER_LOCAL */;
            return this.open(this.userSettingsResource, options);
        }
        open(settingsResource, options) {
            options = {
                ...options,
                jsonEditor: options.jsonEditor ?? this.shouldOpenJsonByDefault()
            };
            return options.jsonEditor ?
                this.openSettingsJson(settingsResource, options) :
                this.openSettings2(options);
        }
        async openSettings2(options) {
            const input = this.settingsEditor2Input;
            options = {
                ...options,
                focusSearch: true
            };
            await this.editorService.openEditor(input, (0, preferences_1.validateSettingsEditorOptions)(options), options.openToSide ? editorService_1.SIDE_GROUP : undefined);
            return this.editorGroupService.activeGroup.activeEditorPane;
        }
        openApplicationSettings(options = {}) {
            options = {
                ...options,
                target: 3 /* ConfigurationTarget.USER_LOCAL */,
            };
            return this.open(this.userDataProfilesService.defaultProfile.settingsResource, options);
        }
        openUserSettings(options = {}) {
            options = {
                ...options,
                target: 3 /* ConfigurationTarget.USER_LOCAL */,
            };
            return this.open(this.userSettingsResource, options);
        }
        async openRemoteSettings(options = {}) {
            const environment = await this.remoteAgentService.getEnvironment();
            if (environment) {
                options = {
                    ...options,
                    target: 4 /* ConfigurationTarget.USER_REMOTE */,
                };
                this.open(environment.settingsPath, options);
            }
            return undefined;
        }
        openWorkspaceSettings(options = {}) {
            if (!this.workspaceSettingsResource) {
                this.notificationService.info(nls.localize('openFolderFirst', "Open a folder or workspace first to create workspace or folder settings."));
                return Promise.reject(null);
            }
            options = {
                ...options,
                target: 5 /* ConfigurationTarget.WORKSPACE */
            };
            return this.open(this.workspaceSettingsResource, options);
        }
        async openFolderSettings(options = {}) {
            options = {
                ...options,
                target: 6 /* ConfigurationTarget.WORKSPACE_FOLDER */
            };
            if (!options.folderUri) {
                throw new Error(`Missing folder URI`);
            }
            const folderSettingsUri = await this.getEditableSettingsURI(6 /* ConfigurationTarget.WORKSPACE_FOLDER */, options.folderUri);
            if (!folderSettingsUri) {
                throw new Error(`Invalid folder URI - ${options.folderUri.toString()}`);
            }
            return this.open(folderSettingsUri, options);
        }
        async openGlobalKeybindingSettings(textual, options) {
            options = { pinned: true, revealIfOpened: true, ...options };
            if (textual) {
                const emptyContents = '// ' + nls.localize('emptyKeybindingsHeader', "Place your key bindings in this file to override the defaults") + '\n[\n]';
                const editableKeybindings = this.userDataProfileService.currentProfile.keybindingsResource;
                const openDefaultKeybindings = !!this.configurationService.getValue('workbench.settings.openDefaultKeybindings');
                // Create as needed and open in editor
                await this.createIfNotExists(editableKeybindings, emptyContents);
                if (openDefaultKeybindings) {
                    const activeEditorGroup = this.editorGroupService.activeGroup;
                    const sideEditorGroup = this.editorGroupService.addGroup(activeEditorGroup.id, 3 /* GroupDirection.RIGHT */);
                    await Promise.all([
                        this.editorService.openEditor({ resource: this.defaultKeybindingsResource, options: { pinned: true, preserveFocus: true, revealIfOpened: true, override: editor_1.DEFAULT_EDITOR_ASSOCIATION.id }, label: nls.localize('defaultKeybindings', "Default Keybindings"), description: '' }),
                        this.editorService.openEditor({ resource: editableKeybindings, options }, sideEditorGroup.id)
                    ]);
                }
                else {
                    await this.editorService.openEditor({ resource: editableKeybindings, options });
                }
            }
            else {
                const editor = (await this.editorService.openEditor(this.instantiationService.createInstance(keybindingsEditorInput_1.KeybindingsEditorInput), { ...options }));
                if (options.query) {
                    editor.search(options.query);
                }
            }
        }
        openDefaultKeybindingsFile() {
            return this.editorService.openEditor({ resource: this.defaultKeybindingsResource, label: nls.localize('defaultKeybindings', "Default Keybindings") });
        }
        async openSettingsJson(resource, options) {
            const group = options?.openToSide ? editorService_1.SIDE_GROUP : undefined;
            const editor = await this.doOpenSettingsJson(resource, options, group);
            if (editor && options?.revealSetting) {
                await this.revealSetting(options.revealSetting.key, !!options.revealSetting.edit, editor, resource);
            }
            return editor;
        }
        async doOpenSettingsJson(resource, options, group) {
            const openSplitJSON = !!this.configurationService.getValue(preferences_1.USE_SPLIT_JSON_SETTING);
            const openDefaultSettings = !!this.configurationService.getValue(preferences_1.DEFAULT_SETTINGS_EDITOR_SETTING);
            if (openSplitJSON || openDefaultSettings) {
                return this.doOpenSplitJSON(resource, options, group);
            }
            const configurationTarget = options?.target ?? 2 /* ConfigurationTarget.USER */;
            const editableSettingsEditorInput = await this.getOrCreateEditableSettingsEditorInput(configurationTarget, resource);
            options = { ...options, pinned: true };
            return await this.editorService.openEditor(editableSettingsEditorInput, (0, preferences_1.validateSettingsEditorOptions)(options), group);
        }
        async doOpenSplitJSON(resource, options = {}, group) {
            const configurationTarget = options.target ?? 2 /* ConfigurationTarget.USER */;
            await this.createSettingsIfNotExists(configurationTarget, resource);
            const preferencesEditorInput = this.createSplitJsonEditorInput(configurationTarget, resource);
            options = { ...options, pinned: true };
            return this.editorService.openEditor(preferencesEditorInput, (0, preferences_1.validateSettingsEditorOptions)(options), group);
        }
        createSplitJsonEditorInput(configurationTarget, resource) {
            const editableSettingsEditorInput = this.textEditorService.createTextEditor({ resource });
            const defaultPreferencesEditorInput = this.instantiationService.createInstance(textResourceEditorInput_1.TextResourceEditorInput, this.getDefaultSettingsResource(configurationTarget), undefined, undefined, undefined, undefined);
            return this.instantiationService.createInstance(sideBySideEditorInput_1.SideBySideEditorInput, editableSettingsEditorInput.getName(), undefined, defaultPreferencesEditorInput, editableSettingsEditorInput);
        }
        createSettings2EditorModel() {
            return this.instantiationService.createInstance(preferencesModels_1.Settings2EditorModel, this.getDefaultSettings(3 /* ConfigurationTarget.USER_LOCAL */));
        }
        getConfigurationTargetFromDefaultSettingsResource(uri) {
            return this.isDefaultWorkspaceSettingsResource(uri) ?
                5 /* ConfigurationTarget.WORKSPACE */ :
                this.isDefaultFolderSettingsResource(uri) ?
                    6 /* ConfigurationTarget.WORKSPACE_FOLDER */ :
                    3 /* ConfigurationTarget.USER_LOCAL */;
        }
        isDefaultSettingsResource(uri) {
            return this.isDefaultUserSettingsResource(uri) || this.isDefaultWorkspaceSettingsResource(uri) || this.isDefaultFolderSettingsResource(uri);
        }
        isDefaultUserSettingsResource(uri) {
            return uri.authority === 'defaultsettings' && uri.scheme === network.Schemas.vscode && !!uri.path.match(/\/(\d+\/)?settings\.json$/);
        }
        isDefaultWorkspaceSettingsResource(uri) {
            return uri.authority === 'defaultsettings' && uri.scheme === network.Schemas.vscode && !!uri.path.match(/\/(\d+\/)?workspaceSettings\.json$/);
        }
        isDefaultFolderSettingsResource(uri) {
            return uri.authority === 'defaultsettings' && uri.scheme === network.Schemas.vscode && !!uri.path.match(/\/(\d+\/)?resourceSettings\.json$/);
        }
        getDefaultSettingsResource(configurationTarget) {
            switch (configurationTarget) {
                case 5 /* ConfigurationTarget.WORKSPACE */:
                    return uri_1.URI.from({ scheme: network.Schemas.vscode, authority: 'defaultsettings', path: `/workspaceSettings.json` });
                case 6 /* ConfigurationTarget.WORKSPACE_FOLDER */:
                    return uri_1.URI.from({ scheme: network.Schemas.vscode, authority: 'defaultsettings', path: `/resourceSettings.json` });
            }
            return uri_1.URI.from({ scheme: network.Schemas.vscode, authority: 'defaultsettings', path: `/settings.json` });
        }
        async getOrCreateEditableSettingsEditorInput(target, resource) {
            await this.createSettingsIfNotExists(target, resource);
            return this.textEditorService.createTextEditor({ resource });
        }
        async createEditableSettingsEditorModel(configurationTarget, settingsUri) {
            const workspace = this.contextService.getWorkspace();
            if (workspace.configuration && workspace.configuration.toString() === settingsUri.toString()) {
                const reference = await this.textModelResolverService.createModelReference(settingsUri);
                return this.instantiationService.createInstance(preferencesModels_1.WorkspaceConfigurationEditorModel, reference, configurationTarget);
            }
            const reference = await this.textModelResolverService.createModelReference(settingsUri);
            return this.instantiationService.createInstance(preferencesModels_1.SettingsEditorModel, reference, configurationTarget);
        }
        async createDefaultSettingsEditorModel(defaultSettingsUri) {
            const reference = await this.textModelResolverService.createModelReference(defaultSettingsUri);
            const target = this.getConfigurationTargetFromDefaultSettingsResource(defaultSettingsUri);
            return this.instantiationService.createInstance(preferencesModels_1.DefaultSettingsEditorModel, defaultSettingsUri, reference, this.getDefaultSettings(target));
        }
        getDefaultSettings(target) {
            if (target === 5 /* ConfigurationTarget.WORKSPACE */) {
                if (!this._defaultWorkspaceSettingsContentModel) {
                    this._defaultWorkspaceSettingsContentModel = new preferencesModels_1.DefaultSettings(this.getMostCommonlyUsedSettings(), target);
                }
                return this._defaultWorkspaceSettingsContentModel;
            }
            if (target === 6 /* ConfigurationTarget.WORKSPACE_FOLDER */) {
                if (!this._defaultFolderSettingsContentModel) {
                    this._defaultFolderSettingsContentModel = new preferencesModels_1.DefaultSettings(this.getMostCommonlyUsedSettings(), target);
                }
                return this._defaultFolderSettingsContentModel;
            }
            if (!this._defaultUserSettingsContentModel) {
                this._defaultUserSettingsContentModel = new preferencesModels_1.DefaultSettings(this.getMostCommonlyUsedSettings(), target);
            }
            return this._defaultUserSettingsContentModel;
        }
        async getEditableSettingsURI(configurationTarget, resource) {
            switch (configurationTarget) {
                case 1 /* ConfigurationTarget.APPLICATION */:
                    return this.userDataProfilesService.defaultProfile.settingsResource;
                case 2 /* ConfigurationTarget.USER */:
                case 3 /* ConfigurationTarget.USER_LOCAL */:
                    return this.userSettingsResource;
                case 4 /* ConfigurationTarget.USER_REMOTE */: {
                    const remoteEnvironment = await this.remoteAgentService.getEnvironment();
                    return remoteEnvironment ? remoteEnvironment.settingsPath : null;
                }
                case 5 /* ConfigurationTarget.WORKSPACE */:
                    return this.workspaceSettingsResource;
                case 6 /* ConfigurationTarget.WORKSPACE_FOLDER */:
                    if (resource) {
                        return this.getFolderSettingsResource(resource);
                    }
            }
            return null;
        }
        async createSettingsIfNotExists(target, resource) {
            if (this.contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */ && target === 5 /* ConfigurationTarget.WORKSPACE */) {
                const workspaceConfig = this.contextService.getWorkspace().configuration;
                if (!workspaceConfig) {
                    return;
                }
                const content = await this.textFileService.read(workspaceConfig);
                if (Object.keys((0, json_1.parse)(content.value)).indexOf('settings') === -1) {
                    await this.jsonEditingService.write(resource, [{ path: ['settings'], value: {} }], true);
                }
                return undefined;
            }
            await this.createIfNotExists(resource, emptyEditableSettingsContent);
        }
        async createIfNotExists(resource, contents) {
            try {
                await this.textFileService.read(resource, { acceptTextOnly: true });
            }
            catch (error) {
                if (error.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    try {
                        await this.textFileService.write(resource, contents);
                        return;
                    }
                    catch (error2) {
                        throw new Error(nls.localize('fail.createSettings', "Unable to create '{0}' ({1}).", this.labelService.getUriLabel(resource, { relative: true }), (0, errors_1.getErrorMessage)(error2)));
                    }
                }
                else {
                    throw error;
                }
            }
        }
        getMostCommonlyUsedSettings() {
            return [
                'files.autoSave',
                'editor.fontSize',
                'editor.fontFamily',
                'editor.tabSize',
                'editor.renderWhitespace',
                'editor.cursorStyle',
                'editor.multiCursorModifier',
                'editor.insertSpaces',
                'editor.wordWrap',
                'files.exclude',
                'files.associations',
                'workbench.editor.enablePreview'
            ];
        }
        async revealSetting(settingKey, edit, editor, settingsResource) {
            const codeEditor = editor ? (0, editorBrowser_1.getCodeEditor)(editor.getControl()) : null;
            if (!codeEditor) {
                return;
            }
            const settingsModel = await this.createPreferencesEditorModel(settingsResource);
            if (!settingsModel) {
                return;
            }
            const position = await this.getPositionToReveal(settingKey, edit, settingsModel, codeEditor);
            if (position) {
                codeEditor.setPosition(position);
                codeEditor.revealPositionNearTop(position);
                codeEditor.focus();
                if (edit) {
                    suggestController_1.SuggestController.get(codeEditor)?.triggerSuggest();
                }
            }
        }
        async getPositionToReveal(settingKey, edit, settingsModel, codeEditor) {
            const model = codeEditor.getModel();
            if (!model) {
                return null;
            }
            const schema = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getConfigurationProperties()[settingKey];
            const isOverrideProperty = configurationRegistry_1.OVERRIDE_PROPERTY_REGEX.test(settingKey);
            if (!schema && !isOverrideProperty) {
                return null;
            }
            let position = null;
            const type = schema?.type ?? 'object' /* Type not defined or is an Override Identifier */;
            let setting = settingsModel.getPreference(settingKey);
            if (!setting && edit) {
                let defaultValue = (type === 'object' || type === 'array') ? this.configurationService.inspect(settingKey).defaultValue : (0, configurationRegistry_1.getDefaultValue)(type);
                defaultValue = defaultValue === undefined && isOverrideProperty ? {} : defaultValue;
                if (defaultValue !== undefined) {
                    const key = settingsModel instanceof preferencesModels_1.WorkspaceConfigurationEditorModel ? ['settings', settingKey] : [settingKey];
                    await this.jsonEditingService.write(settingsModel.uri, [{ path: key, value: defaultValue }], false);
                    setting = settingsModel.getPreference(settingKey);
                }
            }
            if (setting) {
                if (edit) {
                    if ((0, types_1.isObject)(setting.value) || Array.isArray(setting.value)) {
                        position = { lineNumber: setting.valueRange.startLineNumber, column: setting.valueRange.startColumn + 1 };
                        codeEditor.setPosition(position);
                        await coreCommands_1.CoreEditingCommands.LineBreakInsert.runEditorCommand(null, codeEditor, null);
                        position = { lineNumber: position.lineNumber + 1, column: model.getLineMaxColumn(position.lineNumber + 1) };
                        const firstNonWhiteSpaceColumn = model.getLineFirstNonWhitespaceColumn(position.lineNumber);
                        if (firstNonWhiteSpaceColumn) {
                            // Line has some text. Insert another new line.
                            codeEditor.setPosition({ lineNumber: position.lineNumber, column: firstNonWhiteSpaceColumn });
                            await coreCommands_1.CoreEditingCommands.LineBreakInsert.runEditorCommand(null, codeEditor, null);
                            position = { lineNumber: position.lineNumber, column: model.getLineMaxColumn(position.lineNumber) };
                        }
                    }
                    else {
                        position = { lineNumber: setting.valueRange.startLineNumber, column: setting.valueRange.endColumn };
                    }
                }
                else {
                    position = { lineNumber: setting.keyRange.startLineNumber, column: setting.keyRange.startColumn };
                }
            }
            return position;
        }
        dispose() {
            this._onDispose.fire();
            super.dispose();
        }
    };
    exports.PreferencesService = PreferencesService;
    exports.PreferencesService = PreferencesService = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, editorGroupsService_1.IEditorGroupsService),
        __param(2, textfiles_1.ITextFileService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, notification_1.INotificationService),
        __param(5, workspace_1.IWorkspaceContextService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, userDataProfile_1.IUserDataProfileService),
        __param(8, userDataProfile_2.IUserDataProfilesService),
        __param(9, resolverService_1.ITextModelService),
        __param(10, keybinding_1.IKeybindingService),
        __param(11, model_1.IModelService),
        __param(12, jsonEditing_1.IJSONEditingService),
        __param(13, language_1.ILanguageService),
        __param(14, label_1.ILabelService),
        __param(15, remoteAgentService_1.IRemoteAgentService),
        __param(16, textEditorService_1.ITextEditorService)
    ], PreferencesService);
    (0, extensions_1.registerSingleton)(preferences_1.IPreferencesService, PreferencesService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmVyZW5jZXNTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3ByZWZlcmVuY2VzL2Jyb3dzZXIvcHJlZmVyZW5jZXNTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTZDaEcsTUFBTSw0QkFBNEIsR0FBRyxNQUFNLENBQUM7SUFFckMsSUFBTSxrQkFBa0IsR0FBeEIsTUFBTSxrQkFBbUIsU0FBUSxzQkFBVTtRQVVqRCxZQUNpQixhQUE4QyxFQUN4QyxrQkFBeUQsRUFDN0QsZUFBa0QsRUFDN0Msb0JBQTRELEVBQzdELG1CQUEwRCxFQUN0RCxjQUF5RCxFQUM1RCxvQkFBNEQsRUFDMUQsc0JBQWdFLEVBQy9ELHVCQUFrRSxFQUN6RSx3QkFBNEQsRUFDM0QsaUJBQXFDLEVBQzFDLFlBQTRDLEVBQ3RDLGtCQUF3RCxFQUMzRCxlQUFrRCxFQUNyRCxZQUE0QyxFQUN0QyxrQkFBd0QsRUFDekQsaUJBQXNEO1lBRTFFLEtBQUssRUFBRSxDQUFDO1lBbEJ5QixrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDdkIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFzQjtZQUM1QyxvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7WUFDNUIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUM1Qyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXNCO1lBQ3JDLG1CQUFjLEdBQWQsY0FBYyxDQUEwQjtZQUMzQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ3pDLDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBeUI7WUFDOUMsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUEwQjtZQUN4RCw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQW1CO1lBRS9DLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQ3JCLHVCQUFrQixHQUFsQixrQkFB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