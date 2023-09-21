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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/actions", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/map", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/model/textModel", "vs/editor/contrib/codeAction/common/types", "vs/nls!vs/workbench/contrib/preferences/browser/preferencesRenderers", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/markers/common/markers", "vs/platform/registry/common/platform", "vs/base/common/themables", "vs/platform/workspace/common/workspace", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/browser/codeeditor", "vs/workbench/contrib/preferences/browser/preferencesIcons", "vs/workbench/contrib/preferences/browser/preferencesWidgets", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/preferences/common/preferencesModels", "vs/platform/uriIdentity/common/uriIdentity", "vs/editor/common/services/languageFeatures", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/base/common/resources", "vs/platform/userDataProfile/common/userDataProfile", "vs/workbench/services/configuration/common/configuration"], function (require, exports, dom_1, actions_1, async_1, event_1, lifecycle_1, map_1, position_1, range_1, textModel_1, types_1, nls, configuration_1, configurationRegistry_1, contextView_1, instantiation_1, markers_1, platform_1, themables_1, workspace_1, workspaceTrust_1, codeeditor_1, preferencesIcons_1, preferencesWidgets_1, environmentService_1, preferences_1, preferencesModels_1, uriIdentity_1, languageFeatures_1, userDataProfile_1, resources_1, userDataProfile_2, configuration_2) {
    "use strict";
    var WorkspaceConfigurationRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$kDb = exports.$jDb = void 0;
    let $jDb = class $jDb extends lifecycle_1.$kc {
        constructor(h, preferencesModel, j, m, n) {
            super();
            this.h = h;
            this.preferencesModel = preferencesModel;
            this.j = j;
            this.m = m;
            this.n = n;
            this.c = new async_1.$Dg(200);
            this.a = this.B(n.createInstance(SettingHighlighter, h));
            this.b = this.B(this.n.createInstance(EditSettingRenderer, this.h, this.preferencesModel, this.a));
            this.B(this.b.onUpdateSetting(({ key, value, source }) => this.updatePreference(key, value, source)));
            this.B(this.h.getModel().onDidChangeContent(() => this.c.trigger(() => this.r())));
            this.g = this.B(n.createInstance(UnsupportedSettingsRenderer, h, preferencesModel));
        }
        render() {
            this.b.render(this.preferencesModel.settingsGroups, this.f);
            this.g.render();
        }
        updatePreference(key, value, source) {
            const overrideIdentifiers = source.overrideOf ? (0, configurationRegistry_1.$ln)(source.overrideOf.key) : null;
            const resource = this.preferencesModel.uri;
            this.m.updateValue(key, value, { overrideIdentifiers, resource }, this.preferencesModel.configurationTarget)
                .then(() => this.t(source));
        }
        r() {
            if (!this.h.hasModel()) {
                // model could have been disposed during the delay
                return;
            }
            this.render();
        }
        t(setting) {
            this.h.focus();
            setting = this.u(setting);
            if (setting) {
                // TODO:@sandy Selection range should be template range
                this.h.setSelection(setting.valueRange);
                this.a.highlight(setting, true);
            }
        }
        u(setting) {
            const { key, overrideOf } = setting;
            if (overrideOf) {
                const setting = this.u(overrideOf);
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
            const s = this.u(setting);
            if (s) {
                this.a.highlight(s, true);
                this.h.setPosition({ lineNumber: s.keyRange.startLineNumber, column: s.keyRange.startColumn });
            }
            else {
                this.a.clear(true);
            }
        }
        clearFocus(setting) {
            this.a.clear(true);
        }
        editPreference(setting) {
            const editableSetting = this.u(setting);
            return !!(editableSetting && this.b.activateOnSetting(editableSetting));
        }
    };
    exports.$jDb = $jDb;
    exports.$jDb = $jDb = __decorate([
        __param(2, preferences_1.$BE),
        __param(3, configuration_1.$8h),
        __param(4, instantiation_1.$Ah)
    ], $jDb);
    let $kDb = class $kDb extends $jDb {
        constructor(editor, preferencesModel, preferencesService, configurationService, instantiationService) {
            super(editor, preferencesModel, preferencesService, configurationService, instantiationService);
            this.w = this.B(instantiationService.createInstance(WorkspaceConfigurationRenderer, editor, preferencesModel));
        }
        render() {
            super.render();
            this.w.render();
        }
    };
    exports.$kDb = $kDb;
    exports.$kDb = $kDb = __decorate([
        __param(2, preferences_1.$BE),
        __param(3, configuration_1.$8h),
        __param(4, instantiation_1.$Ah)
    ], $kDb);
    let EditSettingRenderer = class EditSettingRenderer extends lifecycle_1.$kc {
        constructor(h, j, m, n, r, t) {
            super();
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.t = t;
            this.c = [];
            this.g = new event_1.$fd();
            this.onUpdateSetting = this.g.event;
            this.a = this.B(this.r.createInstance(preferencesWidgets_1.$0Bb, h));
            this.b = this.B(this.r.createInstance(preferencesWidgets_1.$0Bb, h));
            this.f = new async_1.$Dg(75);
            this.B(this.a.onClick(e => this.M(this.a, e)));
            this.B(this.b.onClick(e => this.M(this.b, e)));
            this.B(this.h.onDidChangeCursorPosition(positionChangeEvent => this.z(positionChangeEvent)));
            this.B(this.h.onMouseMove(mouseMoveEvent => this.C(mouseMoveEvent)));
            this.B(this.h.onDidChangeConfiguration(() => this.w()));
        }
        render(settingsGroups, associatedPreferencesModel) {
            this.a.hide();
            this.b.hide();
            this.c = settingsGroups;
            this.associatedPreferencesModel = associatedPreferencesModel;
            const settings = this.I(this.h.getPosition().lineNumber);
            if (settings.length) {
                this.G(this.a, settings);
            }
        }
        u() {
            return this.j instanceof preferencesModels_1.$wE;
        }
        w() {
            if (!this.h.getOption(57 /* EditorOption.glyphMargin */)) {
                this.a.hide();
                this.b.hide();
            }
        }
        z(positionChangeEvent) {
            this.b.hide();
            const settings = this.I(positionChangeEvent.position.lineNumber);
            if (settings.length) {
                this.G(this.a, settings);
            }
            else {
                this.a.hide();
            }
        }
        C(mouseMoveEvent) {
            const editPreferenceWidget = this.D(mouseMoveEvent);
            if (editPreferenceWidget) {
                this.L(editPreferenceWidget);
                return;
            }
            this.m.clear();
            this.f.trigger(() => this.F(mouseMoveEvent));
        }
        D(mouseMoveEvent) {
            if (mouseMoveEvent.target.type === 2 /* MouseTargetType.GUTTER_GLYPH_MARGIN */) {
                const line = mouseMoveEvent.target.position.lineNumber;
                if (this.b.getLine() === line && this.b.isVisible()) {
                    return this.b;
                }
                if (this.a.getLine() === line && this.a.isVisible()) {
                    return this.a;
                }
            }
            return undefined;
        }
        F(mouseMoveEvent) {
            const settings = mouseMoveEvent.target.position ? this.I(mouseMoveEvent.target.position.lineNumber) : null;
            if (settings && settings.length) {
                this.G(this.b, settings);
            }
            else {
                this.b.hide();
            }
        }
        G(editPreferencesWidget, settings) {
            const line = settings[0].valueRange.startLineNumber;
            if (this.h.getOption(57 /* EditorOption.glyphMargin */) && this.H(line)) {
                editPreferencesWidget.show(line, nls.localize(0, null), settings);
                const editPreferenceWidgetToHide = editPreferencesWidget === this.a ? this.b : this.a;
                editPreferenceWidgetToHide.hide();
            }
        }
        H(line) {
            const decorations = this.h.getLineDecorations(line);
            if (decorations) {
                for (const { options } of decorations) {
                    if (options.glyphMarginClassName && options.glyphMarginClassName.indexOf(themables_1.ThemeIcon.asClassName(preferencesIcons_1.$1Bb)) === -1) {
                        return false;
                    }
                }
            }
            return true;
        }
        I(lineNumber) {
            const configurationMap = this.O();
            return this.J(lineNumber).filter(setting => {
                const configurationNode = configurationMap[setting.key];
                if (configurationNode) {
                    if (configurationNode.policy && this.n.inspect(setting.key).policyValue !== undefined) {
                        return false;
                    }
                    if (this.u()) {
                        if (setting.key === 'launch') {
                            // Do not show because of https://github.com/microsoft/vscode/issues/32593
                            return false;
                        }
                        return true;
                    }
                    if (configurationNode.type === 'boolean' || configurationNode.enum) {
                        if (this.j.configurationTarget !== 6 /* ConfigurationTarget.WORKSPACE_FOLDER */) {
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
        J(lineNumber) {
            // index of setting, across all groups/sections
            let index = 0;
            const settings = [];
            for (const group of this.c) {
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
                                if (!this.u() && setting.overrides.length) {
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
        L(editPreferenceWidget) {
            this.m.highlight(editPreferenceWidget.preferences[0]);
        }
        M(editPreferenceWidget, e) {
            dom_1.$5O.stop(e.event, true);
            const actions = this.I(editPreferenceWidget.getLine()).length === 1 ? this.P(editPreferenceWidget.preferences[0], this.O()[editPreferenceWidget.preferences[0].key])
                : editPreferenceWidget.preferences.map(setting => new actions_1.$ji(`preferences.submenu.${setting.key}`, setting.key, this.P(setting, this.O()[setting.key])));
            this.t.showContextMenu({
                getAnchor: () => e.event,
                getActions: () => actions
            });
        }
        activateOnSetting(setting) {
            const startLine = setting.keyRange.startLineNumber;
            const settings = this.I(startLine);
            if (!settings.length) {
                return false;
            }
            this.b.show(startLine, '', settings);
            const actions = this.P(this.b.preferences[0], this.O()[this.b.preferences[0].key]);
            this.t.showContextMenu({
                getAnchor: () => this.N(new position_1.$js(startLine, 1)),
                getActions: () => actions
            });
            return true;
        }
        N(position) {
            const positionCoords = this.h.getScrolledVisiblePosition(position);
            const editorCoords = (0, dom_1.$FO)(this.h.getDomNode());
            const x = editorCoords.left + positionCoords.left;
            const y = editorCoords.top + positionCoords.top + positionCoords.height;
            return { x, y: y + 10 };
        }
        O() {
            return platform_1.$8m.as(configurationRegistry_1.$an.Configuration).getConfigurationProperties();
        }
        P(setting, jsonSchema) {
            if (jsonSchema.type === 'boolean') {
                return [{
                        id: 'truthyValue',
                        label: 'true',
                        enabled: true,
                        run: () => this.R(setting.key, true, setting)
                    }, {
                        id: 'falsyValue',
                        label: 'false',
                        enabled: true,
                        run: () => this.R(setting.key, false, setting)
                    }];
            }
            if (jsonSchema.enum) {
                return jsonSchema.enum.map(value => {
                    return {
                        id: value,
                        label: JSON.stringify(value),
                        enabled: true,
                        run: () => this.R(setting.key, value, setting)
                    };
                });
            }
            return this.Q(setting);
        }
        Q(setting) {
            if (this.u()) {
                const settingInOtherModel = this.associatedPreferencesModel.getPreference(setting.key);
                return [{
                        id: 'setDefaultValue',
                        label: settingInOtherModel ? nls.localize(1, null) : nls.localize(2, null),
                        enabled: true,
                        run: () => this.R(setting.key, setting.value, setting)
                    }];
            }
            return [];
        }
        R(key, value, source) {
            this.g.fire({ key, value, source });
        }
    };
    EditSettingRenderer = __decorate([
        __param(3, configuration_1.$8h),
        __param(4, instantiation_1.$Ah),
        __param(5, contextView_1.$WZ)
    ], EditSettingRenderer);
    let SettingHighlighter = class SettingHighlighter extends lifecycle_1.$kc {
        constructor(c, instantiationService) {
            super();
            this.c = c;
            this.a = this.B(instantiationService.createInstance(codeeditor_1.$qrb));
            this.b = this.B(instantiationService.createInstance(codeeditor_1.$qrb));
        }
        highlight(setting, fix = false) {
            this.b.removeHighlightRange();
            this.a.removeHighlightRange();
            const highlighter = fix ? this.a : this.b;
            highlighter.highlightRange({
                range: setting.valueRange,
                resource: this.c.getModel().uri
            }, this.c);
            this.c.revealLineInCenterIfOutsideViewport(setting.valueRange.startLineNumber, 0 /* editorCommon.ScrollType.Smooth */);
        }
        clear(fix = false) {
            this.b.removeHighlightRange();
            if (fix) {
                this.a.removeHighlightRange();
            }
        }
    };
    SettingHighlighter = __decorate([
        __param(1, instantiation_1.$Ah)
    ], SettingHighlighter);
    let UnsupportedSettingsRenderer = class UnsupportedSettingsRenderer extends lifecycle_1.$kc {
        constructor(c, f, g, h, j, m, n, languageFeaturesService, r, t) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.t = t;
            this.a = new async_1.$Dg(200);
            this.b = new map_1.$zi(uri => this.n.extUri.getComparisonKey(uri));
            this.B(this.c.getModel().onDidChangeContent(() => this.u()));
            this.B(event_1.Event.filter(this.j.onDidChangeConfiguration, e => e.source === 7 /* ConfigurationTarget.DEFAULT */)(() => this.u()));
            this.B(languageFeaturesService.codeActionProvider.register({ pattern: f.uri.path }, this));
        }
        u() {
            this.a.trigger(() => this.render());
        }
        render() {
            this.b.clear();
            const markerData = this.w();
            if (markerData.length) {
                this.g.changeOne('UnsupportedSettingsRenderer', this.f.uri, markerData);
            }
            else {
                this.g.remove('UnsupportedSettingsRenderer', [this.f.uri]);
            }
        }
        async provideCodeActions(model, range, context, token) {
            const actions = [];
            const codeActionsByRange = this.b.get(model.uri);
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
        w() {
            const markerData = [];
            const configurationRegistry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration).getConfigurationProperties();
            for (const settingsGroup of this.f.settingsGroups) {
                for (const section of settingsGroup.sections) {
                    for (const setting of section.settings) {
                        if (configurationRegistry_1.$kn.test(setting.key)) {
                            if (setting.overrides) {
                                this.C(setting.overrides, configurationRegistry, markerData);
                            }
                            continue;
                        }
                        const configuration = configurationRegistry[setting.key];
                        if (configuration) {
                            if (this.z(setting, configuration, markerData)) {
                                continue;
                            }
                            switch (this.f.configurationTarget) {
                                case 3 /* ConfigurationTarget.USER_LOCAL */:
                                    this.D(setting, configuration, markerData);
                                    break;
                                case 4 /* ConfigurationTarget.USER_REMOTE */:
                                    this.F(setting, configuration, markerData);
                                    break;
                                case 5 /* ConfigurationTarget.WORKSPACE */:
                                    this.G(setting, configuration, markerData);
                                    break;
                                case 6 /* ConfigurationTarget.WORKSPACE_FOLDER */:
                                    this.H(setting, configuration, markerData);
                                    break;
                            }
                        }
                        else {
                            markerData.push(this.M(setting));
                        }
                    }
                }
            }
            return markerData;
        }
        z(setting, configuration, markerData) {
            if (!configuration.policy) {
                return false;
            }
            if (this.j.inspect(setting.key).policyValue === undefined) {
                return false;
            }
            if (this.f.configurationTarget === 7 /* ConfigurationTarget.DEFAULT */) {
                return false;
            }
            markerData.push({
                severity: markers_1.MarkerSeverity.Hint,
                tags: [1 /* MarkerTag.Unnecessary */],
                ...setting.range,
                message: nls.localize(3, null)
            });
            return true;
        }
        C(overrides, configurationRegistry, markerData) {
            for (const setting of overrides || []) {
                const configuration = configurationRegistry[setting.key];
                if (configuration) {
                    if (configuration.scope !== 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */) {
                        markerData.push({
                            severity: markers_1.MarkerSeverity.Hint,
                            tags: [1 /* MarkerTag.Unnecessary */],
                            ...setting.range,
                            message: nls.localize(4, null)
                        });
                    }
                }
                else {
                    markerData.push(this.M(setting));
                }
            }
        }
        D(setting, configuration, markerData) {
            if (!this.r.currentProfile.isDefault && !this.r.currentProfile.useDefaultFlags?.settings) {
                if ((0, resources_1.$bg)(this.t.defaultProfile.settingsResource, this.f.uri) && !this.j.isSettingAppliedForAllProfiles(setting.key)) {
                    // If we're in the default profile setting file, and the setting cannot be applied in all profiles
                    markerData.push({
                        severity: markers_1.MarkerSeverity.Hint,
                        tags: [1 /* MarkerTag.Unnecessary */],
                        ...setting.range,
                        message: nls.localize(5, null)
                    });
                }
                else if ((0, resources_1.$bg)(this.r.currentProfile.settingsResource, this.f.uri)) {
                    if (configuration.scope === 1 /* ConfigurationScope.APPLICATION */) {
                        // If we're in a profile setting file, and the setting is application-scoped, fade it out.
                        markerData.push(this.I(setting));
                    }
                    else if (this.j.isSettingAppliedForAllProfiles(setting.key)) {
                        // If we're in the non-default profile setting file, and the setting can be applied in all profiles, fade it out.
                        markerData.push({
                            severity: markers_1.MarkerSeverity.Hint,
                            tags: [1 /* MarkerTag.Unnecessary */],
                            ...setting.range,
                            message: nls.localize(6, null, configuration_2.$oE)
                        });
                    }
                }
            }
            if (this.h.remoteAuthority && (configuration.scope === 2 /* ConfigurationScope.MACHINE */ || configuration.scope === 6 /* ConfigurationScope.MACHINE_OVERRIDABLE */)) {
                markerData.push({
                    severity: markers_1.MarkerSeverity.Hint,
                    tags: [1 /* MarkerTag.Unnecessary */],
                    ...setting.range,
                    message: nls.localize(7, null)
                });
            }
        }
        F(setting, configuration, markerData) {
            if (configuration.scope === 1 /* ConfigurationScope.APPLICATION */) {
                markerData.push(this.I(setting));
            }
        }
        G(setting, configuration, markerData) {
            if (configuration.scope === 1 /* ConfigurationScope.APPLICATION */) {
                markerData.push(this.I(setting));
            }
            if (configuration.scope === 2 /* ConfigurationScope.MACHINE */) {
                markerData.push(this.J(setting));
            }
            if (!this.m.isWorkspaceTrusted() && configuration.restricted) {
                const marker = this.L(setting);
                markerData.push(marker);
                const codeActions = this.N([marker]);
                this.O(marker, codeActions);
            }
        }
        H(setting, configuration, markerData) {
            if (configuration.scope === 1 /* ConfigurationScope.APPLICATION */) {
                markerData.push(this.I(setting));
            }
            if (configuration.scope === 2 /* ConfigurationScope.MACHINE */) {
                markerData.push(this.J(setting));
            }
            if (configuration.scope === 3 /* ConfigurationScope.WINDOW */) {
                markerData.push({
                    severity: markers_1.MarkerSeverity.Hint,
                    tags: [1 /* MarkerTag.Unnecessary */],
                    ...setting.range,
                    message: nls.localize(8, null)
                });
            }
            if (!this.m.isWorkspaceTrusted() && configuration.restricted) {
                const marker = this.L(setting);
                markerData.push(marker);
                const codeActions = this.N([marker]);
                this.O(marker, codeActions);
            }
        }
        I(setting) {
            return {
                severity: markers_1.MarkerSeverity.Hint,
                tags: [1 /* MarkerTag.Unnecessary */],
                ...setting.range,
                message: nls.localize(9, null)
            };
        }
        J(setting) {
            return {
                severity: markers_1.MarkerSeverity.Hint,
                tags: [1 /* MarkerTag.Unnecessary */],
                ...setting.range,
                message: nls.localize(10, null)
            };
        }
        L(setting) {
            return {
                severity: markers_1.MarkerSeverity.Warning,
                ...setting.range,
                message: nls.localize(11, null)
            };
        }
        M(setting) {
            return {
                severity: markers_1.MarkerSeverity.Hint,
                tags: [1 /* MarkerTag.Unnecessary */],
                ...setting.range,
                message: nls.localize(12, null)
            };
        }
        N(diagnostics) {
            return [{
                    title: nls.localize(13, null),
                    command: {
                        id: 'workbench.trust.manage',
                        title: nls.localize(14, null)
                    },
                    diagnostics,
                    kind: types_1.$v1.QuickFix.value
                }];
        }
        O(range, codeActions) {
            let actions = this.b.get(this.f.uri);
            if (!actions) {
                actions = [];
                this.b.set(this.f.uri, actions);
            }
            actions.push([range_1.$ks.lift(range), codeActions]);
        }
        dispose() {
            this.g.remove('UnsupportedSettingsRenderer', [this.f.uri]);
            this.b.clear();
            super.dispose();
        }
    };
    UnsupportedSettingsRenderer = __decorate([
        __param(2, markers_1.$3s),
        __param(3, environmentService_1.$hJ),
        __param(4, configuration_2.$mE),
        __param(5, workspaceTrust_1.$$z),
        __param(6, uriIdentity_1.$Ck),
        __param(7, languageFeatures_1.$hF),
        __param(8, userDataProfile_1.$CJ),
        __param(9, userDataProfile_2.$Ek)
    ], UnsupportedSettingsRenderer);
    let WorkspaceConfigurationRenderer = class WorkspaceConfigurationRenderer extends lifecycle_1.$kc {
        static { WorkspaceConfigurationRenderer_1 = this; }
        static { this.a = ['folders', 'tasks', 'launch', 'extensions', 'settings', 'remoteAuthority', 'transient']; }
        constructor(f, g, h, j) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.b = this.f.createDecorationsCollection();
            this.c = new async_1.$Dg(200);
            this.B(this.f.getModel().onDidChangeContent(() => this.c.trigger(() => this.render())));
        }
        render() {
            const markerData = [];
            if (this.h.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */ && this.g instanceof preferencesModels_1.$uE) {
                const ranges = [];
                for (const settingsGroup of this.g.configurationGroups) {
                    for (const section of settingsGroup.sections) {
                        for (const setting of section.settings) {
                            if (!WorkspaceConfigurationRenderer_1.a.includes(setting.key)) {
                                markerData.push({
                                    severity: markers_1.MarkerSeverity.Hint,
                                    tags: [1 /* MarkerTag.Unnecessary */],
                                    ...setting.range,
                                    message: nls.localize(15, null)
                                });
                            }
                        }
                    }
                }
                this.b.set(ranges.map(range => this.n(range)));
            }
            if (markerData.length) {
                this.j.changeOne('WorkspaceConfigurationRenderer', this.g.uri, markerData);
            }
            else {
                this.j.remove('WorkspaceConfigurationRenderer', [this.g.uri]);
            }
        }
        static { this.m = textModel_1.$RC.register({
            description: 'dim-configuration',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            inlineClassName: 'dim-configuration'
        }); }
        n(range) {
            return {
                range,
                options: WorkspaceConfigurationRenderer_1.m
            };
        }
        dispose() {
            this.j.remove('WorkspaceConfigurationRenderer', [this.g.uri]);
            this.b.clear();
            super.dispose();
        }
    };
    WorkspaceConfigurationRenderer = WorkspaceConfigurationRenderer_1 = __decorate([
        __param(2, workspace_1.$Kh),
        __param(3, markers_1.$3s)
    ], WorkspaceConfigurationRenderer);
});
//# sourceMappingURL=preferencesRenderers.js.map