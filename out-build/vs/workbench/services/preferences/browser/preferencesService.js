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
define(["require", "exports", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/json", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/uri", "vs/editor/browser/coreCommands", "vs/editor/browser/editorBrowser", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/editor/common/services/resolverService", "vs/nls!vs/workbench/services/preferences/browser/preferencesService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/label/common/label", "vs/platform/notification/common/notification", "vs/platform/registry/common/platform", "vs/platform/workspace/common/workspace", "vs/workbench/common/editor", "vs/workbench/common/editor/sideBySideEditorInput", "vs/workbench/common/editor/textResourceEditorInput", "vs/workbench/services/configuration/common/jsonEditing", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/preferences/browser/keybindingsEditorInput", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/preferences/common/preferencesEditorInput", "vs/workbench/services/preferences/common/preferencesModels", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/textfile/common/textEditorService", "vs/workbench/services/textfile/common/textfiles", "vs/base/common/types", "vs/editor/contrib/suggest/browser/suggestController", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/userDataProfile/common/userDataProfile"], function (require, exports, errors_1, event_1, json_1, lifecycle_1, network, uri_1, coreCommands_1, editorBrowser_1, model_1, language_1, resolverService_1, nls, configuration_1, configurationRegistry_1, extensions_1, instantiation_1, keybinding_1, label_1, notification_1, platform_1, workspace_1, editor_1, sideBySideEditorInput_1, textResourceEditorInput_1, jsonEditing_1, editorGroupsService_1, editorService_1, keybindingsEditorInput_1, preferences_1, preferencesEditorInput_1, preferencesModels_1, remoteAgentService_1, textEditorService_1, textfiles_1, types_1, suggestController_1, userDataProfile_1, userDataProfile_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Fyb = void 0;
    const emptyEditableSettingsContent = '{\n}';
    let $Fyb = class $Fyb extends lifecycle_1.$kc {
        constructor(g, h, j, m, n, r, s, t, u, w, keybindingService, y, z, C, D, F, G) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.a = this.B(new event_1.$fd());
            this.defaultKeybindingsResource = uri_1.URI.from({ scheme: network.Schemas.vscode, authority: 'defaultsettings', path: '/keybindings.json' });
            this.H = uri_1.URI.from({ scheme: network.Schemas.vscode, authority: 'defaultsettings', path: '/defaultSettings.json' });
            // The default keybindings.json updates based on keyboard layouts, so here we make sure
            // if a model has been given out we update it accordingly.
            this.B(keybindingService.onDidUpdateKeybindings(() => {
                const model = y.getModel(this.defaultKeybindingsResource);
                if (!model) {
                    // model has not been given out => nothing to do
                    return;
                }
                y.updateModel(model, (0, preferencesModels_1.$yE)(keybindingService));
            }));
        }
        get userSettingsResource() {
            return this.t.currentProfile.settingsResource;
        }
        get workspaceSettingsResource() {
            if (this.r.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
                return null;
            }
            const workspace = this.r.getWorkspace();
            return workspace.configuration || workspace.folders[0].toResource(preferences_1.$DE);
        }
        get settingsEditor2Input() {
            return this.s.createInstance(preferencesEditorInput_1.$Eyb);
        }
        getFolderSettingsResource(resource) {
            const folder = this.r.getWorkspaceFolder(resource);
            return folder ? folder.toResource(preferences_1.$DE) : null;
        }
        resolveModel(uri) {
            if (this.Q(uri)) {
                // We opened a split json editor in this case,
                // and this half shows the default settings.
                const target = this.P(uri);
                const languageSelection = this.C.createById('jsonc');
                const model = this.B(this.y.createModel('', languageSelection, uri));
                let defaultSettings;
                this.m.onDidChangeConfiguration(e => {
                    if (e.source === 7 /* ConfigurationTarget.DEFAULT */) {
                        const model = this.y.getModel(uri);
                        if (!model) {
                            // model has not been given out => nothing to do
                            return;
                        }
                        defaultSettings = this.$(target);
                        this.y.updateModel(model, defaultSettings.getContentWithoutMostCommonlyUsed(true));
                        defaultSettings._onDidChange.fire();
                    }
                });
                // Check if Default settings is already created and updated in above promise
                if (!defaultSettings) {
                    defaultSettings = this.$(target);
                    this.y.updateModel(model, defaultSettings.getContentWithoutMostCommonlyUsed(true));
                }
                return model;
            }
            if (this.H.toString() === uri.toString()) {
                const defaultRawSettingsEditorModel = this.s.createInstance(preferencesModels_1.$xE, this.$(3 /* ConfigurationTarget.USER_LOCAL */));
                const languageSelection = this.C.createById('jsonc');
                const model = this.B(this.y.createModel(defaultRawSettingsEditorModel.content, languageSelection, uri));
                return model;
            }
            if (this.defaultKeybindingsResource.toString() === uri.toString()) {
                const defaultKeybindingsEditorModel = this.s.createInstance(preferencesModels_1.$zE, uri);
                const languageSelection = this.C.createById('jsonc');
                const model = this.B(this.y.createModel(defaultKeybindingsEditorModel.content, languageSelection, uri));
                return model;
            }
            return null;
        }
        async createPreferencesEditorModel(uri) {
            if (this.Q(uri)) {
                return this.Z(uri);
            }
            if (this.userSettingsResource.toString() === uri.toString() || this.u.defaultProfile.settingsResource.toString() === uri.toString()) {
                return this.Y(3 /* ConfigurationTarget.USER_LOCAL */, uri);
            }
            const workspaceSettingsUri = await this.getEditableSettingsURI(5 /* ConfigurationTarget.WORKSPACE */);
            if (workspaceSettingsUri && workspaceSettingsUri.toString() === uri.toString()) {
                return this.Y(5 /* ConfigurationTarget.WORKSPACE */, workspaceSettingsUri);
            }
            if (this.r.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
                const settingsUri = await this.getEditableSettingsURI(6 /* ConfigurationTarget.WORKSPACE_FOLDER */, uri);
                if (settingsUri && settingsUri.toString() === uri.toString()) {
                    return this.Y(6 /* ConfigurationTarget.WORKSPACE_FOLDER */, uri);
                }
            }
            const remoteEnvironment = await this.F.getEnvironment();
            const remoteSettingsUri = remoteEnvironment ? remoteEnvironment.settingsPath : null;
            if (remoteSettingsUri && remoteSettingsUri.toString() === uri.toString()) {
                return this.Y(4 /* ConfigurationTarget.USER_REMOTE */, uri);
            }
            return null;
        }
        openRawDefaultSettings() {
            return this.g.openEditor({ resource: this.H });
        }
        openRawUserSettings() {
            return this.g.openEditor({ resource: this.userSettingsResource });
        }
        I() {
            return this.m.getValue('workbench.settings.editor') === 'json';
        }
        openSettings(options = {}) {
            options = {
                ...options,
                target: 3 /* ConfigurationTarget.USER_LOCAL */,
            };
            if (options.query) {
                options.jsonEditor = false;
            }
            return this.J(this.userSettingsResource, options);
        }
        openLanguageSpecificSettings(languageId, options = {}) {
            if (this.I()) {
                options.query = undefined;
                options.revealSetting = { key: `[${languageId}]`, edit: true };
            }
            else {
                options.query = `@lang:${languageId}${options.query ? ` ${options.query}` : ''}`;
            }
            options.target = options.target ?? 3 /* ConfigurationTarget.USER_LOCAL */;
            return this.J(this.userSettingsResource, options);
        }
        J(settingsResource, options) {
            options = {
                ...options,
                jsonEditor: options.jsonEditor ?? this.I()
            };
            return options.jsonEditor ?
                this.M(settingsResource, options) :
                this.L(options);
        }
        async L(options) {
            const input = this.settingsEditor2Input;
            options = {
                ...options,
                focusSearch: true
            };
            await this.g.openEditor(input, (0, preferences_1.$AE)(options), options.openToSide ? editorService_1.$$C : undefined);
            return this.h.activeGroup.activeEditorPane;
        }
        openApplicationSettings(options = {}) {
            options = {
                ...options,
                target: 3 /* ConfigurationTarget.USER_LOCAL */,
            };
            return this.J(this.u.defaultProfile.settingsResource, options);
        }
        openUserSettings(options = {}) {
            options = {
                ...options,
                target: 3 /* ConfigurationTarget.USER_LOCAL */,
            };
            return this.J(this.userSettingsResource, options);
        }
        async openRemoteSettings(options = {}) {
            const environment = await this.F.getEnvironment();
            if (environment) {
                options = {
                    ...options,
                    target: 4 /* ConfigurationTarget.USER_REMOTE */,
                };
                this.J(environment.settingsPath, options);
            }
            return undefined;
        }
        openWorkspaceSettings(options = {}) {
            if (!this.workspaceSettingsResource) {
                this.n.info(nls.localize(0, null));
                return Promise.reject(null);
            }
            options = {
                ...options,
                target: 5 /* ConfigurationTarget.WORKSPACE */
            };
            return this.J(this.workspaceSettingsResource, options);
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
            return this.J(folderSettingsUri, options);
        }
        async openGlobalKeybindingSettings(textual, options) {
            options = { pinned: true, revealIfOpened: true, ...options };
            if (textual) {
                const emptyContents = '// ' + nls.localize(1, null) + '\n[\n]';
                const editableKeybindings = this.t.currentProfile.keybindingsResource;
                const openDefaultKeybindings = !!this.m.getValue('workbench.settings.openDefaultKeybindings');
                // Create as needed and open in editor
                await this.bb(editableKeybindings, emptyContents);
                if (openDefaultKeybindings) {
                    const activeEditorGroup = this.h.activeGroup;
                    const sideEditorGroup = this.h.addGroup(activeEditorGroup.id, 3 /* GroupDirection.RIGHT */);
                    await Promise.all([
                        this.g.openEditor({ resource: this.defaultKeybindingsResource, options: { pinned: true, preserveFocus: true, revealIfOpened: true, override: editor_1.$HE.id }, label: nls.localize(2, null), description: '' }),
                        this.g.openEditor({ resource: editableKeybindings, options }, sideEditorGroup.id)
                    ]);
                }
                else {
                    await this.g.openEditor({ resource: editableKeybindings, options });
                }
            }
            else {
                const editor = (await this.g.openEditor(this.s.createInstance(keybindingsEditorInput_1.$Dyb), { ...options }));
                if (options.query) {
                    editor.search(options.query);
                }
            }
        }
        openDefaultKeybindingsFile() {
            return this.g.openEditor({ resource: this.defaultKeybindingsResource, label: nls.localize(3, null) });
        }
        async M(resource, options) {
            const group = options?.openToSide ? editorService_1.$$C : undefined;
            const editor = await this.N(resource, options, group);
            if (editor && options?.revealSetting) {
                await this.db(options.revealSetting.key, !!options.revealSetting.edit, editor, resource);
            }
            return editor;
        }
        async N(resource, options, group) {
            const openSplitJSON = !!this.m.getValue(preferences_1.$FE);
            const openDefaultSettings = !!this.m.getValue(preferences_1.$EE);
            if (openSplitJSON || openDefaultSettings) {
                return this.O(resource, options, group);
            }
            const configurationTarget = options?.target ?? 2 /* ConfigurationTarget.USER */;
            const editableSettingsEditorInput = await this.X(configurationTarget, resource);
            options = { ...options, pinned: true };
            return await this.g.openEditor(editableSettingsEditorInput, (0, preferences_1.$AE)(options), group);
        }
        async O(resource, options = {}, group) {
            const configurationTarget = options.target ?? 2 /* ConfigurationTarget.USER */;
            await this.ab(configurationTarget, resource);
            const preferencesEditorInput = this.createSplitJsonEditorInput(configurationTarget, resource);
            options = { ...options, pinned: true };
            return this.g.openEditor(preferencesEditorInput, (0, preferences_1.$AE)(options), group);
        }
        createSplitJsonEditorInput(configurationTarget, resource) {
            const editableSettingsEditorInput = this.G.createTextEditor({ resource });
            const defaultPreferencesEditorInput = this.s.createInstance(textResourceEditorInput_1.$7eb, this.W(configurationTarget), undefined, undefined, undefined, undefined);
            return this.s.createInstance(sideBySideEditorInput_1.$VC, editableSettingsEditorInput.getName(), undefined, defaultPreferencesEditorInput, editableSettingsEditorInput);
        }
        createSettings2EditorModel() {
            return this.s.createInstance(preferencesModels_1.$tE, this.$(3 /* ConfigurationTarget.USER_LOCAL */));
        }
        P(uri) {
            return this.S(uri) ?
                5 /* ConfigurationTarget.WORKSPACE */ :
                this.U(uri) ?
                    6 /* ConfigurationTarget.WORKSPACE_FOLDER */ :
                    3 /* ConfigurationTarget.USER_LOCAL */;
        }
        Q(uri) {
            return this.R(uri) || this.S(uri) || this.U(uri);
        }
        R(uri) {
            return uri.authority === 'defaultsettings' && uri.scheme === network.Schemas.vscode && !!uri.path.match(/\/(\d+\/)?settings\.json$/);
        }
        S(uri) {
            return uri.authority === 'defaultsettings' && uri.scheme === network.Schemas.vscode && !!uri.path.match(/\/(\d+\/)?workspaceSettings\.json$/);
        }
        U(uri) {
            return uri.authority === 'defaultsettings' && uri.scheme === network.Schemas.vscode && !!uri.path.match(/\/(\d+\/)?resourceSettings\.json$/);
        }
        W(configurationTarget) {
            switch (configurationTarget) {
                case 5 /* ConfigurationTarget.WORKSPACE */:
                    return uri_1.URI.from({ scheme: network.Schemas.vscode, authority: 'defaultsettings', path: `/workspaceSettings.json` });
                case 6 /* ConfigurationTarget.WORKSPACE_FOLDER */:
                    return uri_1.URI.from({ scheme: network.Schemas.vscode, authority: 'defaultsettings', path: `/resourceSettings.json` });
            }
            return uri_1.URI.from({ scheme: network.Schemas.vscode, authority: 'defaultsettings', path: `/settings.json` });
        }
        async X(target, resource) {
            await this.ab(target, resource);
            return this.G.createTextEditor({ resource });
        }
        async Y(configurationTarget, settingsUri) {
            const workspace = this.r.getWorkspace();
            if (workspace.configuration && workspace.configuration.toString() === settingsUri.toString()) {
                const reference = await this.w.createModelReference(settingsUri);
                return this.s.createInstance(preferencesModels_1.$uE, reference, configurationTarget);
            }
            const reference = await this.w.createModelReference(settingsUri);
            return this.s.createInstance(preferencesModels_1.$sE, reference, configurationTarget);
        }
        async Z(defaultSettingsUri) {
            const reference = await this.w.createModelReference(defaultSettingsUri);
            const target = this.P(defaultSettingsUri);
            return this.s.createInstance(preferencesModels_1.$wE, defaultSettingsUri, reference, this.$(target));
        }
        $(target) {
            if (target === 5 /* ConfigurationTarget.WORKSPACE */) {
                if (!this.c) {
                    this.c = new preferencesModels_1.$vE(this.cb(), target);
                }
                return this.c;
            }
            if (target === 6 /* ConfigurationTarget.WORKSPACE_FOLDER */) {
                if (!this.f) {
                    this.f = new preferencesModels_1.$vE(this.cb(), target);
                }
                return this.f;
            }
            if (!this.b) {
                this.b = new preferencesModels_1.$vE(this.cb(), target);
            }
            return this.b;
        }
        async getEditableSettingsURI(configurationTarget, resource) {
            switch (configurationTarget) {
                case 1 /* ConfigurationTarget.APPLICATION */:
                    return this.u.defaultProfile.settingsResource;
                case 2 /* ConfigurationTarget.USER */:
                case 3 /* ConfigurationTarget.USER_LOCAL */:
                    return this.userSettingsResource;
                case 4 /* ConfigurationTarget.USER_REMOTE */: {
                    const remoteEnvironment = await this.F.getEnvironment();
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
        async ab(target, resource) {
            if (this.r.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */ && target === 5 /* ConfigurationTarget.WORKSPACE */) {
                const workspaceConfig = this.r.getWorkspace().configuration;
                if (!workspaceConfig) {
                    return;
                }
                const content = await this.j.read(workspaceConfig);
                if (Object.keys((0, json_1.$Lm)(content.value)).indexOf('settings') === -1) {
                    await this.z.write(resource, [{ path: ['settings'], value: {} }], true);
                }
                return undefined;
            }
            await this.bb(resource, emptyEditableSettingsContent);
        }
        async bb(resource, contents) {
            try {
                await this.j.read(resource, { acceptTextOnly: true });
            }
            catch (error) {
                if (error.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    try {
                        await this.j.write(resource, contents);
                        return;
                    }
                    catch (error2) {
                        throw new Error(nls.localize(4, null, this.D.getUriLabel(resource, { relative: true }), (0, errors_1.$8)(error2)));
                    }
                }
                else {
                    throw error;
                }
            }
        }
        cb() {
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
        async db(settingKey, edit, editor, settingsResource) {
            const codeEditor = editor ? (0, editorBrowser_1.$lV)(editor.getControl()) : null;
            if (!codeEditor) {
                return;
            }
            const settingsModel = await this.createPreferencesEditorModel(settingsResource);
            if (!settingsModel) {
                return;
            }
            const position = await this.eb(settingKey, edit, settingsModel, codeEditor);
            if (position) {
                codeEditor.setPosition(position);
                codeEditor.revealPositionNearTop(position);
                codeEditor.focus();
                if (edit) {
                    suggestController_1.$G6.get(codeEditor)?.triggerSuggest();
                }
            }
        }
        async eb(settingKey, edit, settingsModel, codeEditor) {
            const model = codeEditor.getModel();
            if (!model) {
                return null;
            }
            const schema = platform_1.$8m.as(configurationRegistry_1.$an.Configuration).getConfigurationProperties()[settingKey];
            const isOverrideProperty = configurationRegistry_1.$kn.test(settingKey);
            if (!schema && !isOverrideProperty) {
                return null;
            }
            let position = null;
            const type = schema?.type ?? 'object' /* Type not defined or is an Override Identifier */;
            let setting = settingsModel.getPreference(settingKey);
            if (!setting && edit) {
                let defaultValue = (type === 'object' || type === 'array') ? this.m.inspect(settingKey).defaultValue : (0, configurationRegistry_1.$nn)(type);
                defaultValue = defaultValue === undefined && isOverrideProperty ? {} : defaultValue;
                if (defaultValue !== undefined) {
                    const key = settingsModel instanceof preferencesModels_1.$uE ? ['settings', settingKey] : [settingKey];
                    await this.z.write(settingsModel.uri, [{ path: key, value: defaultValue }], false);
                    setting = settingsModel.getPreference(settingKey);
                }
            }
            if (setting) {
                if (edit) {
                    if ((0, types_1.$lf)(setting.value) || Array.isArray(setting.value)) {
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
            this.a.fire();
            super.dispose();
        }
    };
    exports.$Fyb = $Fyb;
    exports.$Fyb = $Fyb = __decorate([
        __param(0, editorService_1.$9C),
        __param(1, editorGroupsService_1.$5C),
        __param(2, textfiles_1.$JD),
        __param(3, configuration_1.$8h),
        __param(4, notification_1.$Yu),
        __param(5, workspace_1.$Kh),
        __param(6, instantiation_1.$Ah),
        __param(7, userDataProfile_1.$CJ),
        __param(8, userDataProfile_2.$Ek),
        __param(9, resolverService_1.$uA),
        __param(10, keybinding_1.$2D),
        __param(11, model_1.$yA),
        __param(12, jsonEditing_1.$$fb),
        __param(13, language_1.$ct),
        __param(14, label_1.$Vz),
        __param(15, remoteAgentService_1.$jm),
        __param(16, textEditorService_1.$sxb)
    ], $Fyb);
    (0, extensions_1.$mr)(preferences_1.$BE, $Fyb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=preferencesService.js.map