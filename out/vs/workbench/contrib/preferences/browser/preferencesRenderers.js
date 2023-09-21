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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/actions", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/map", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/model/textModel", "vs/editor/contrib/codeAction/common/types", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/markers/common/markers", "vs/platform/registry/common/platform", "vs/base/common/themables", "vs/platform/workspace/common/workspace", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/browser/codeeditor", "vs/workbench/contrib/preferences/browser/preferencesIcons", "vs/workbench/contrib/preferences/browser/preferencesWidgets", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/preferences/common/preferencesModels", "vs/platform/uriIdentity/common/uriIdentity", "vs/editor/common/services/languageFeatures", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/base/common/resources", "vs/platform/userDataProfile/common/userDataProfile", "vs/workbench/services/configuration/common/configuration"], function (require, exports, dom_1, actions_1, async_1, event_1, lifecycle_1, map_1, position_1, range_1, textModel_1, types_1, nls, configuration_1, configurationRegistry_1, contextView_1, instantiation_1, markers_1, platform_1, themables_1, workspace_1, workspaceTrust_1, codeeditor_1, preferencesIcons_1, preferencesWidgets_1, environmentService_1, preferences_1, preferencesModels_1, uriIdentity_1, languageFeatures_1, userDataProfile_1, resources_1, userDataProfile_2, configuration_2) {
    "use strict";
    var WorkspaceConfigurationRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkspaceSettingsRenderer = exports.UserSettingsRenderer = void 0;
    let UserSettingsRenderer = class UserSettingsRenderer extends lifecycle_1.Disposable {
        constructor(editor, preferencesModel, preferencesService, configurationService, instantiationService) {
            super();
            this.editor = editor;
            this.preferencesModel = preferencesModel;
            this.preferencesService = preferencesService;
            this.configurationService = configurationService;
            this.instantiationService = instantiationService;
            this.modelChangeDelayer = new async_1.Delayer(200);
            this.settingHighlighter = this._register(instantiationService.createInstance(SettingHighlighter, editor));
            this.editSettingActionRenderer = this._register(this.instantiationService.createInstance(EditSettingRenderer, this.editor, this.preferencesModel, this.settingHighlighter));
            this._register(this.editSettingActionRenderer.onUpdateSetting(({ key, value, source }) => this.updatePreference(key, value, source)));
            this._register(this.editor.getModel().onDidChangeContent(() => this.modelChangeDelayer.trigger(() => this.onModelChanged())));
            this.unsupportedSettingsRenderer = this._register(instantiationService.createInstance(UnsupportedSettingsRenderer, editor, preferencesModel));
        }
        render() {
            this.editSettingActionRenderer.render(this.preferencesModel.settingsGroups, this.associatedPreferencesModel);
            this.unsupportedSettingsRenderer.render();
        }
        updatePreference(key, value, source) {
            const overrideIdentifiers = source.overrideOf ? (0, configurationRegistry_1.overrideIdentifiersFromKey)(source.overrideOf.key) : null;
            const resource = this.preferencesModel.uri;
            this.configurationService.updateValue(key, value, { overrideIdentifiers, resource }, this.preferencesModel.configurationTarget)
                .then(() => this.onSettingUpdated(source));
        }
        onModelChanged() {
            if (!this.editor.hasModel()) {
                // model could have been disposed during the delay
                return;
            }
            this.render();
        }
        onSettingUpdated(setting) {
            this.editor.focus();
            setting = this.getSetting(setting);
            if (setting) {
                // TODO:@sandy Selection range should be template range
                this.editor.setSelection(setting.valueRange);
                this.settingHighlighter.highlight(setting, true);
            }
        }
        getSetting(setting) {
            const { key, overrideOf } = setting;
            if (overrideOf) {
                const setting = this.getSetting(overrideOf);
                for (const override of setting.overrides) {
                    if (override.key === key) {
                        return override;
                    }
                }
                return undefined;
            }
            return this.preferencesModel.getPreference(key);
        }
        focusPreference(setting) {
            const s = this.getSetting(setting);
            if (s) {
                this.settingHighlighter.highlight(s, true);
                this.editor.setPosition({ lineNumber: s.keyRange.startLineNumber, column: s.keyRange.startColumn });
            }
            else {
                this.settingHighlighter.clear(true);
            }
        }
        clearFocus(setting) {
            this.settingHighlighter.clear(true);
        }
        editPreference(setting) {
            const editableSetting = this.getSetting(setting);
            return !!(editableSetting && this.editSettingActionRenderer.activateOnSetting(editableSetting));
        }
    };
    exports.UserSettingsRenderer = UserSettingsRenderer;
    exports.UserSettingsRenderer = UserSettingsRenderer = __decorate([
        __param(2, preferences_1.IPreferencesService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, instantiation_1.IInstantiationService)
    ], UserSettingsRenderer);
    let WorkspaceSettingsRenderer = class WorkspaceSettingsRenderer extends UserSettingsRenderer {
        constructor(editor, preferencesModel, preferencesService, configurationService, instantiationService) {
            super(editor, preferencesModel, preferencesService, configurationService, instantiationService);
            this.workspaceConfigurationRenderer = this._register(instantiationService.createInstance(WorkspaceConfigurationRenderer, editor, preferencesModel));
        }
        render() {
            super.render();
            this.workspaceConfigurationRenderer.render();
        }
    };
    exports.WorkspaceSettingsRenderer = WorkspaceSettingsRenderer;
    exports.WorkspaceSettingsRenderer = WorkspaceSettingsRenderer = __decorate([
        __param(2, preferences_1.IPreferencesService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, instantiation_1.IInstantiationService)
    ], WorkspaceSettingsRenderer);
    let EditSettingRenderer = class EditSettingRenderer extends lifecycle_1.Disposable {
        constructor(editor, primarySettingsModel, settingHighlighter, configurationService, instantiationService, contextMenuService) {
            super();
            this.editor = editor;
            this.primarySettingsModel = primarySettingsModel;
            this.settingHighlighter = settingHighlighter;
            this.configurationService = configurationService;
            this.instantiationService = instantiationService;
            this.contextMenuService = contextMenuService;
            this.settingsGroups = [];
            this._onUpdateSetting = new event_1.Emitter();
            this.onUpdateSetting = this._onUpdateSetting.event;
            this.editPreferenceWidgetForCursorPosition = this._register(this.instantiationService.createInstance(preferencesWidgets_1.EditPreferenceWidget, editor));
            this.editPreferenceWidgetForMouseMove = this._register(this.instantiationService.createInstance(preferencesWidgets_1.EditPreferenceWidget, editor));
            this.toggleEditPreferencesForMouseMoveDelayer = new async_1.Delayer(75);
            this._register(this.editPreferenceWidgetForCursorPosition.onClick(e => this.onEditSettingClicked(this.editPreferenceWidgetForCursorPosition, e)));
            this._register(this.editPreferenceWidgetForMouseMove.onClick(e => this.onEditSettingClicked(this.editPreferenceWidgetForMouseMove, e)));
            this._register(this.editor.onDidChangeCursorPosition(positionChangeEvent => this.onPositionChanged(positionChangeEvent)));
            this._register(this.editor.onMouseMove(mouseMoveEvent => this.onMouseMoved(mouseMoveEvent)));
            this._register(this.editor.onDidChangeConfiguration(() => this.onConfigurationChanged()));
        }
        render(settingsGroups, associatedPreferencesModel) {
            this.editPreferenceWidgetForCursorPosition.hide();
            this.editPreferenceWidgetForMouseMove.hide();
            this.settingsGroups = settingsGroups;
            this.associatedPreferencesModel = associatedPreferencesModel;
            const settings = this.getSettings(this.editor.getPosition().lineNumber);
            if (settings.length) {
                this.showEditPreferencesWidget(this.editPreferenceWidgetForCursorPosition, settings);
            }
        }
        isDefaultSettings() {
            return this.primarySettingsModel instanceof preferencesModels_1.DefaultSettingsEditorModel;
        }
        onConfigurationChanged() {
            if (!this.editor.getOption(57 /* EditorOption.glyphMargin */)) {
                this.editPreferenceWidgetForCursorPosition.hide();
                this.editPreferenceWidgetForMouseMove.hide();
            }
        }
        onPositionChanged(positionChangeEvent) {
            this.editPreferenceWidgetForMouseMove.hide();
            const settings = this.getSettings(positionChangeEvent.position.lineNumber);
            if (settings.length) {
                this.showEditPreferencesWidget(this.editPreferenceWidgetForCursorPosition, settings);
            }
            else {
                this.editPreferenceWidgetForCursorPosition.hide();
            }
        }
        onMouseMoved(mouseMoveEvent) {
            const editPreferenceWidget = this.getEditPreferenceWidgetUnderMouse(mouseMoveEvent);
            if (editPreferenceWidget) {
                this.onMouseOver(editPreferenceWidget);
                return;
            }
            this.settingHighlighter.clear();
            this.toggleEditPreferencesForMouseMoveDelayer.trigger(() => this.toggleEditPreferenceWidgetForMouseMove(mouseMoveEvent));
        }
        getEditPreferenceWidgetUnderMouse(mouseMoveEvent) {
            if (mouseMoveEvent.target.type === 2 /* MouseTargetType.GUTTER_GLYPH_MARGIN */) {
                const line = mouseMoveEvent.target.position.lineNumber;
                if (this.editPreferenceWidgetForMouseMove.getLine() === line && this.editPreferenceWidgetForMouseMove.isVisible()) {
                    return this.editPreferenceWidgetForMouseMove;
                }
                if (this.editPreferenceWidgetForCursorPosition.getLine() === line && this.editPreferenceWidgetForCursorPosition.isVisible()) {
                    return this.editPreferenceWidgetForCursorPosition;
                }
            }
            return undefined;
        }
        toggleEditPreferenceWidgetForMouseMove(mouseMoveEvent) {
            const settings = mouseMoveEvent.target.position ? this.getSettings(mouseMoveEvent.target.position.lineNumber) : null;
            if (settings && settings.length) {
                this.showEditPreferencesWidget(this.editPreferenceWidgetForMouseMove, settings);
            }
            else {
                this.editPreferenceWidgetForMouseMove.hide();
            }
        }
        showEditPreferencesWidget(editPreferencesWidget, settings) {
            const line = settings[0].valueRange.startLineNumber;
            if (this.editor.getOption(57 /* EditorOption.glyphMargin */) && this.marginFreeFromOtherDecorations(line)) {
                editPreferencesWidget.show(line, nls.localize('editTtile', "Edit"), settings);
                const editPreferenceWidgetToHide = editPreferencesWidget === this.editPreferenceWidgetForCursorPosition ? this.editPreferenceWidgetForMouseMove : this.editPreferenceWidgetForCursorPosition;
                editPreferenceWidgetToHide.hide();
            }
        }
        marginFreeFromOtherDecorations(line) {
            const decorations = this.editor.getLineDecorations(line);
            if (decorations) {
                for (const { options } of decorations) {
                    if (options.glyphMarginClassName && options.glyphMarginClassName.indexOf(themables_1.ThemeIcon.asClassName(preferencesIcons_1.settingsEditIcon)) === -1) {
                        return false;
                    }
                }
            }
            return true;
        }
        getSettings(lineNumber) {
            const configurationMap = this.getConfigurationsMap();
            return this.getSettingsAtLineNumber(lineNumber).filter(setting => {
                const configurationNode = configurationMap[setting.key];
                if (configurationNode) {
                    if (configurationNode.policy && this.configurationService.inspect(setting.key).policyValue !== undefined) {
                        return false;
                    }
                    if (this.isDefaultSettings()) {
                        if (setting.key === 'launch') {
                            // Do not show because of https://github.com/microsoft/vscode/issues/32593
                            return false;
                        }
                        return true;
                    }
                    if (configurationNode.type === 'boolean' || configurationNode.enum) {
                        if (this.primarySettingsModel.configurationTarget !== 6 /* ConfigurationTarget.WORKSPACE_FOLDER */) {
                            return true;
                        }
                        if (configurationNode.scope === 4 /* ConfigurationScope.RESOURCE */ || configurationNode.scope === 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */) {
                            return true;
                        }
                    }
                }
                return false;
            });
        }
        getSettingsAtLineNumber(lineNumber) {
            // index of setting, across all groups/sections
            let index = 0;
            const settings = [];
            for (const group of this.settingsGroups) {
                if (group.range.startLineNumber > lineNumber) {
                    break;
                }
                if (lineNumber >= group.range.startLineNumber && lineNumber <= group.range.endLineNumber) {
                    for (const section of group.sections) {
                        for (const setting of section.settings) {
                            if (setting.range.startLineNumber > lineNumber) {
                                break;
                            }
                            if (lineNumber >= setting.range.startLineNumber && lineNumber <= setting.range.endLineNumber) {
                                if (!this.isDefaultSettings() && setting.overrides.length) {
                                    // Only one level because override settings cannot have override settings
                                    for (const overrideSetting of setting.overrides) {
                                        if (lineNumber >= overrideSetting.range.startLineNumber && lineNumber <= overrideSetting.range.endLineNumber) {
                                            settings.push({ ...overrideSetting, index, groupId: group.id });
                                        }
                                    }
                                }
                                else {
                                    settings.push({ ...setting, index, groupId: group.id });
                                }
                            }
                            index++;
                        }
                    }
                }
            }
            return settings;
        }
        onMouseOver(editPreferenceWidget) {
            this.settingHighlighter.highlight(editPreferenceWidget.preferences[0]);
        }
        onEditSettingClicked(editPreferenceWidget, e) {
            dom_1.EventHelper.stop(e.event, true);
            const actions = this.getSettings(editPreferenceWidget.getLine()).length === 1 ? this.getActions(editPreferenceWidget.preferences[0], this.getConfigurationsMap()[editPreferenceWidget.preferences[0].key])
                : editPreferenceWidget.preferences.map(setting => new actions_1.SubmenuAction(`preferences.submenu.${setting.key}`, setting.key, this.getActions(setting, this.getConfigurationsMap()[setting.key])));
            this.contextMenuService.showContextMenu({
                getAnchor: () => e.event,
                getActions: () => actions
            });
        }
        activateOnSetting(setting) {
            const startLine = setting.keyRange.startLineNumber;
            const settings = this.getSettings(startLine);
            if (!settings.length) {
                return false;
            }
            this.editPreferenceWidgetForMouseMove.show(startLine, '', settings);
            const actions = this.getActions(this.editPreferenceWidgetForMouseMove.preferences[0], this.getConfigurationsMap()[this.editPreferenceWidgetForMouseMove.preferences[0].key]);
            this.contextMenuService.showContextMenu({
                getAnchor: () => this.toAbsoluteCoords(new position_1.Position(startLine, 1)),
                getActions: () => actions
            });
            return true;
        }
        toAbsoluteCoords(position) {
            const positionCoords = this.editor.getScrolledVisiblePosition(position);
            const editorCoords = (0, dom_1.getDomNodePagePosition)(this.editor.getDomNode());
            const x = editorCoords.left + positionCoords.left;
            const y = editorCoords.top + positionCoords.top + positionCoords.height;
            return { x, y: y + 10 };
        }
        getConfigurationsMap() {
            return platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getConfigurationProperties();
        }
        getActions(setting, jsonSchema) {
            if (jsonSchema.type === 'boolean') {
                return [{
                        id: 'truthyValue',
                        label: 'true',
                        enabled: true,
                        run: () => this.updateSetting(setting.key, true, setting)
                    }, {
                        id: 'falsyValue',
                        label: 'false',
                        enabled: true,
                        run: () => this.updateSetting(setting.key, false, setting)
                    }];
            }
            if (jsonSchema.enum) {
                return jsonSchema.enum.map(value => {
                    return {
                        id: value,
                        label: JSON.stringify(value),
                        enabled: true,
                        run: () => this.updateSetting(setting.key, value, setting)
                    };
                });
            }
            return this.getDefaultActions(setting);
        }
        getDefaultActions(setting) {
            if (this.isDefaultSettings()) {
                const settingInOtherModel = this.associatedPreferencesModel.getPreference(setting.key);
                return [{
                        id: 'setDefaultValue',
                        label: settingInOtherModel ? nls.localize('replaceDefaultValue', "Replace in Settings") : nls.localize('copyDefaultValue', "Copy to Settings"),
                        enabled: true,
                        run: () => this.updateSetting(setting.key, setting.value, setting)
                    }];
            }
            return [];
        }
        updateSetting(key, value, source) {
            this._onUpdateSetting.fire({ key, value, source });
        }
    };
    EditSettingRenderer = __decorate([
        __param(3, configuration_1.IConfigurationService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, contextView_1.IContextMenuService)
    ], EditSettingRenderer);
    let SettingHighlighter = class SettingHighlighter extends lifecycle_1.Disposable {
        constructor(editor, instantiationService) {
            super();
            this.editor = editor;
            this.fixedHighlighter = this._register(instantiationService.createInstance(codeeditor_1.RangeHighlightDecorations));
            this.volatileHighlighter = this._register(instantiationService.createInstance(codeeditor_1.RangeHighlightDecorations));
        }
        highlight(setting, fix = false) {
            this.volatileHighlighter.removeHighlightRange();
            this.fixedHighlighter.removeHighlightRange();
            const highlighter = fix ? this.fixedHighlighter : this.volatileHighlighter;
            highlighter.highlightRange({
                range: setting.valueRange,
                resource: this.editor.getModel().uri
            }, this.editor);
            this.editor.revealLineInCenterIfOutsideViewport(setting.valueRange.startLineNumber, 0 /* editorCommon.ScrollType.Smooth */);
        }
        clear(fix = false) {
            this.volatileHighlighter.removeHighlightRange();
            if (fix) {
                this.fixedHighlighter.removeHighlightRange();
            }
        }
    };
    SettingHighlighter = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], SettingHighlighter);
    let UnsupportedSettingsRenderer = class UnsupportedSettingsRenderer extends lifecycle_1.Disposable {
        constructor(editor, settingsEditorModel, markerService, environmentService, configurationService, workspaceTrustManagementService, uriIdentityService, languageFeaturesService, userDataProfileService, userDataProfilesService) {
            super();
            this.editor = editor;
            this.settingsEditorModel = settingsEditorModel;
            this.markerService = markerService;
            this.environmentService = environmentService;
            this.configurationService = configurationService;
            this.workspaceTrustManagementService = workspaceTrustManagementService;
            this.uriIdentityService = uriIdentityService;
            this.userDataProfileService = userDataProfileService;
            this.userDataProfilesService = userDataProfilesService;
            this.renderingDelayer = new async_1.Delayer(200);
            this.codeActions = new map_1.ResourceMap(uri => this.uriIdentityService.extUri.getComparisonKey(uri));
            this._register(this.editor.getModel().onDidChangeContent(() => this.delayedRender()));
            this._register(event_1.Event.filter(this.configurationService.onDidChangeConfiguration, e => e.source === 7 /* ConfigurationTarget.DEFAULT */)(() => this.delayedRender()));
            this._register(languageFeaturesService.codeActionProvider.register({ pattern: settingsEditorModel.uri.path }, this));
        }
        delayedRender() {
            this.renderingDelayer.trigger(() => this.render());
        }
        render() {
            this.codeActions.clear();
            const markerData = this.generateMarkerData();
            if (markerData.length) {
                this.markerService.changeOne('UnsupportedSettingsRenderer', this.settingsEditorModel.uri, markerData);
            }
            else {
                this.markerService.remove('UnsupportedSettingsRenderer', [this.settingsEditorModel.uri]);
            }
        }
        async provideCodeActions(model, range, context, token) {
            const actions = [];
            const codeActionsByRange = this.codeActions.get(model.uri);
            if (codeActionsByRange) {
                for (const [codeActionsRange, codeActions] of codeActionsByRange) {
                    if (codeActionsRange.containsRange(range)) {
                        actions.push(...codeActions);
                    }
                }
            }
            return {
                actions,
                dispose: () => { }
            };
        }
        generateMarkerData() {
            const markerData = [];
            const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getConfigurationProperties();
            for (const settingsGroup of this.settingsEditorModel.settingsGroups) {
                for (const section of settingsGroup.sections) {
                    for (const setting of section.settings) {
                        if (configurationRegistry_1.OVERRIDE_PROPERTY_REGEX.test(setting.key)) {
                            if (setting.overrides) {
                                this.handleOverrides(setting.overrides, configurationRegistry, markerData);
                            }
                            continue;
                        }
                        const configuration = configurationRegistry[setting.key];
                        if (configuration) {
                            if (this.handlePolicyConfiguration(setting, configuration, markerData)) {
                                continue;
                            }
                            switch (this.settingsEditorModel.configurationTarget) {
                                case 3 /* ConfigurationTarget.USER_LOCAL */:
                                    this.handleLocalUserConfiguration(setting, configuration, markerData);
                                    break;
                                case 4 /* ConfigurationTarget.USER_REMOTE */:
                                    this.handleRemoteUserConfiguration(setting, configuration, markerData);
                                    break;
                                case 5 /* ConfigurationTarget.WORKSPACE */:
                                    this.handleWorkspaceConfiguration(setting, configuration, markerData);
                                    break;
                                case 6 /* ConfigurationTarget.WORKSPACE_FOLDER */:
                                    this.handleWorkspaceFolderConfiguration(setting, configuration, markerData);
                                    break;
                            }
                        }
                        else {
                            markerData.push(this.gemerateUnknownConfigurationMarker(setting));
                        }
                    }
                }
            }
            return markerData;
        }
        handlePolicyConfiguration(setting, configuration, markerData) {
            if (!configuration.policy) {
                return false;
            }
            if (this.configurationService.inspect(setting.key).policyValue === undefined) {
                return false;
            }
            if (this.settingsEditorModel.configurationTarget === 7 /* ConfigurationTarget.DEFAULT */) {
                return false;
            }
            markerData.push({
                severity: markers_1.MarkerSeverity.Hint,
                tags: [1 /* MarkerTag.Unnecessary */],
                ...setting.range,
                message: nls.localize('unsupportedPolicySetting', "This setting cannot be applied because it is configured in the system policy.")
            });
            return true;
        }
        handleOverrides(overrides, configurationRegistry, markerData) {
            for (const setting of overrides || []) {
                const configuration = configurationRegistry[setting.key];
                if (configuration) {
                    if (configuration.scope !== 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */) {
                        markerData.push({
                            severity: markers_1.MarkerSeverity.Hint,
                            tags: [1 /* MarkerTag.Unnecessary */],
                            ...setting.range,
                            message: nls.localize('unsupportLanguageOverrideSetting', "This setting cannot be applied because it is not registered as language override setting.")
                        });
                    }
                }
                else {
                    markerData.push(this.gemerateUnknownConfigurationMarker(setting));
                }
            }
        }
        handleLocalUserConfiguration(setting, configuration, markerData) {
            if (!this.userDataProfileService.currentProfile.isDefault && !this.userDataProfileService.currentProfile.useDefaultFlags?.settings) {
                if ((0, resources_1.isEqual)(this.userDataProfilesService.defaultProfile.settingsResource, this.settingsEditorModel.uri) && !this.configurationService.isSettingAppliedForAllProfiles(setting.key)) {
                    // If we're in the default profile setting file, and the setting cannot be applied in all profiles
                    markerData.push({
                        severity: markers_1.MarkerSeverity.Hint,
                        tags: [1 /* MarkerTag.Unnecessary */],
                        ...setting.range,
                        message: nls.localize('defaultProfileSettingWhileNonDefaultActive', "This setting cannot be applied while a non-default profile is active. It will be applied when the default profile is active.")
                    });
                }
                else if ((0, resources_1.isEqual)(this.userDataProfileService.currentProfile.settingsResource, this.settingsEditorModel.uri)) {
                    if (configuration.scope === 1 /* ConfigurationScope.APPLICATION */) {
                        // If we're in a profile setting file, and the setting is application-scoped, fade it out.
                        markerData.push(this.generateUnsupportedApplicationSettingMarker(setting));
                    }
                    else if (this.configurationService.isSettingAppliedForAllProfiles(setting.key)) {
                        // If we're in the non-default profile setting file, and the setting can be applied in all profiles, fade it out.
                        markerData.push({
                            severity: markers_1.MarkerSeverity.Hint,
                            tags: [1 /* MarkerTag.Unnecessary */],
                            ...setting.range,
                            message: nls.localize('allProfileSettingWhileInNonDefaultProfileSetting', "This setting cannot be applied because it is configured to be applied in all profiles using setting {0}. Value from the default profile will be used instead.", configuration_2.APPLY_ALL_PROFILES_SETTING)
                        });
                    }
                }
            }
            if (this.environmentService.remoteAuthority && (configuration.scope === 2 /* ConfigurationScope.MACHINE */ || configuration.scope === 6 /* ConfigurationScope.MACHINE_OVERRIDABLE */)) {
                markerData.push({
                    severity: markers_1.MarkerSeverity.Hint,
                    tags: [1 /* MarkerTag.Unnecessary */],
                    ...setting.range,
                    message: nls.localize('unsupportedRemoteMachineSetting', "This setting cannot be applied in this window. It will be applied when you open a local window.")
                });
            }
        }
        handleRemoteUserConfiguration(setting, configuration, markerData) {
            if (configuration.scope === 1 /* ConfigurationScope.APPLICATION */) {
                markerData.push(this.generateUnsupportedApplicationSettingMarker(setting));
            }
        }
        handleWorkspaceConfiguration(setting, configuration, markerData) {
            if (configuration.scope === 1 /* ConfigurationScope.APPLICATION */) {
                markerData.push(this.generateUnsupportedApplicationSettingMarker(setting));
            }
            if (configuration.scope === 2 /* ConfigurationScope.MACHINE */) {
                markerData.push(this.generateUnsupportedMachineSettingMarker(setting));
            }
            if (!this.workspaceTrustManagementService.isWorkspaceTrusted() && configuration.restricted) {
                const marker = this.generateUntrustedSettingMarker(setting);
                markerData.push(marker);
                const codeActions = this.generateUntrustedSettingCodeActions([marker]);
                this.addCodeActions(marker, codeActions);
            }
        }
        handleWorkspaceFolderConfiguration(setting, configuration, markerData) {
            if (configuration.scope === 1 /* ConfigurationScope.APPLICATION */) {
                markerData.push(this.generateUnsupportedApplicationSettingMarker(setting));
            }
            if (configuration.scope === 2 /* ConfigurationScope.MACHINE */) {
                markerData.push(this.generateUnsupportedMachineSettingMarker(setting));
            }
            if (configuration.scope === 3 /* ConfigurationScope.WINDOW */) {
                markerData.push({
                    severity: markers_1.MarkerSeverity.Hint,
                    tags: [1 /* MarkerTag.Unnecessary */],
                    ...setting.range,
                    message: nls.localize('unsupportedWindowSetting', "This setting cannot be applied in this workspace. It will be applied when you open the containing workspace folder directly.")
                });
            }
            if (!this.workspaceTrustManagementService.isWorkspaceTrusted() && configuration.restricted) {
                const marker = this.generateUntrustedSettingMarker(setting);
                markerData.push(marker);
                const codeActions = this.generateUntrustedSettingCodeActions([marker]);
                this.addCodeActions(marker, codeActions);
            }
        }
        generateUnsupportedApplicationSettingMarker(setting) {
            return {
                severity: markers_1.MarkerSeverity.Hint,
                tags: [1 /* MarkerTag.Unnecessary */],
                ...setting.range,
                message: nls.localize('unsupportedApplicationSetting', "This setting has an application scope and can be set only in the user settings file.")
            };
        }
        generateUnsupportedMachineSettingMarker(setting) {
            return {
                severity: markers_1.MarkerSeverity.Hint,
                tags: [1 /* MarkerTag.Unnecessary */],
                ...setting.range,
                message: nls.localize('unsupportedMachineSetting', "This setting can only be applied in user settings in local window or in remote settings in remote window.")
            };
        }
        generateUntrustedSettingMarker(setting) {
            return {
                severity: markers_1.MarkerSeverity.Warning,
                ...setting.range,
                message: nls.localize('untrustedSetting', "This setting can only be applied in a trusted workspace.")
            };
        }
        gemerateUnknownConfigurationMarker(setting) {
            return {
                severity: markers_1.MarkerSeverity.Hint,
                tags: [1 /* MarkerTag.Unnecessary */],
                ...setting.range,
                message: nls.localize('unknown configuration setting', "Unknown Configuration Setting")
            };
        }
        generateUntrustedSettingCodeActions(diagnostics) {
            return [{
                    title: nls.localize('manage workspace trust', "Manage Workspace Trust"),
                    command: {
                        id: 'workbench.trust.manage',
                        title: nls.localize('manage workspace trust', "Manage Workspace Trust")
                    },
                    diagnostics,
                    kind: types_1.CodeActionKind.QuickFix.value
                }];
        }
        addCodeActions(range, codeActions) {
            let actions = this.codeActions.get(this.settingsEditorModel.uri);
            if (!actions) {
                actions = [];
                this.codeActions.set(this.settingsEditorModel.uri, actions);
            }
            actions.push([range_1.Range.lift(range), codeActions]);
        }
        dispose() {
            this.markerService.remove('UnsupportedSettingsRenderer', [this.settingsEditorModel.uri]);
            this.codeActions.clear();
            super.dispose();
        }
    };
    UnsupportedSettingsRenderer = __decorate([
        __param(2, markers_1.IMarkerService),
        __param(3, environmentService_1.IWorkbenchEnvironmentService),
        __param(4, configuration_2.IWorkbenchConfigurationService),
        __param(5, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(6, uriIdentity_1.IUriIdentityService),
        __param(7, languageFeatures_1.ILanguageFeaturesService),
        __param(8, userDataProfile_1.IUserDataProfileService),
        __param(9, userDataProfile_2.IUserDataProfilesService)
    ], UnsupportedSettingsRenderer);
    let WorkspaceConfigurationRenderer = class WorkspaceConfigurationRenderer extends lifecycle_1.Disposable {
        static { WorkspaceConfigurationRenderer_1 = this; }
        static { this.supportedKeys = ['folders', 'tasks', 'launch', 'extensions', 'settings', 'remoteAuthority', 'transient']; }
        constructor(editor, workspaceSettingsEditorModel, workspaceContextService, markerService) {
            super();
            this.editor = editor;
            this.workspaceSettingsEditorModel = workspaceSettingsEditorModel;
            this.workspaceContextService = workspaceContextService;
            this.markerService = markerService;
            this.decorations = this.editor.createDecorationsCollection();
            this.renderingDelayer = new async_1.Delayer(200);
            this._register(this.editor.getModel().onDidChangeContent(() => this.renderingDelayer.trigger(() => this.render())));
        }
        render() {
            const markerData = [];
            if (this.workspaceContextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */ && this.workspaceSettingsEditorModel instanceof preferencesModels_1.WorkspaceConfigurationEditorModel) {
                const ranges = [];
                for (const settingsGroup of this.workspaceSettingsEditorModel.configurationGroups) {
                    for (const section of settingsGroup.sections) {
                        for (const setting of section.settings) {
                            if (!WorkspaceConfigurationRenderer_1.supportedKeys.includes(setting.key)) {
                                markerData.push({
                                    severity: markers_1.MarkerSeverity.Hint,
                                    tags: [1 /* MarkerTag.Unnecessary */],
                                    ...setting.range,
                                    message: nls.localize('unsupportedProperty', "Unsupported Property")
                                });
                            }
                        }
                    }
                }
                this.decorations.set(ranges.map(range => this.createDecoration(range)));
            }
            if (markerData.length) {
                this.markerService.changeOne('WorkspaceConfigurationRenderer', this.workspaceSettingsEditorModel.uri, markerData);
            }
            else {
                this.markerService.remove('WorkspaceConfigurationRenderer', [this.workspaceSettingsEditorModel.uri]);
            }
        }
        static { this._DIM_CONFIGURATION_ = textModel_1.ModelDecorationOptions.register({
            description: 'dim-configuration',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            inlineClassName: 'dim-configuration'
        }); }
        createDecoration(range) {
            return {
                range,
                options: WorkspaceConfigurationRenderer_1._DIM_CONFIGURATION_
            };
        }
        dispose() {
            this.markerService.remove('WorkspaceConfigurationRenderer', [this.workspaceSettingsEditorModel.uri]);
            this.decorations.clear();
            super.dispose();
        }
    };
    WorkspaceConfigurationRenderer = WorkspaceConfigurationRenderer_1 = __decorate([
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, markers_1.IMarkerService)
    ], WorkspaceConfigurationRenderer);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmVyZW5jZXNSZW5kZXJlcnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9wcmVmZXJlbmNlcy9icm93c2VyL3ByZWZlcmVuY2VzUmVuZGVyZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFxRHpGLElBQU0sb0JBQW9CLEdBQTFCLE1BQU0sb0JBQXFCLFNBQVEsc0JBQVU7UUFTbkQsWUFBc0IsTUFBbUIsRUFBVyxnQkFBcUMsRUFDbkUsa0JBQWlELEVBQy9DLG9CQUE0RCxFQUM1RCxvQkFBcUQ7WUFFNUUsS0FBSyxFQUFFLENBQUM7WUFMYSxXQUFNLEdBQU4sTUFBTSxDQUFhO1lBQVcscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFxQjtZQUN6RCx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQzlCLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDbEQseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQVJyRSx1QkFBa0IsR0FBa0IsSUFBSSxlQUFPLENBQU8sR0FBRyxDQUFDLENBQUM7WUFXbEUsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLGtCQUFrQixFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDMUcsSUFBSSxDQUFDLHlCQUF5QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQzVLLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLGVBQWUsQ0FBQyxDQUFDLEVBQUUsR0FB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