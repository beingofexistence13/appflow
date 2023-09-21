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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/iconLabel/simpleIconLabel", "vs/base/common/async", "vs/base/common/lifecycle", "vs/editor/common/languages/language", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/contrib/preferences/common/preferences", "vs/workbench/services/configuration/common/configuration", "vs/workbench/services/hover/browser/hover"], function (require, exports, DOM, keyboardEvent_1, simpleIconLabel_1, async_1, lifecycle_1, language_1, nls_1, commands_1, userDataProfile_1, userDataSync_1, preferences_1, configuration_1, hover_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getIndicatorsLabelAriaLabel = exports.SettingsTreeIndicatorsLabel = void 0;
    const $ = DOM.$;
    /**
     * Contains a set of the sync-ignored settings
     * to keep the sync ignored indicator and the getIndicatorsLabelAriaLabel() function in sync.
     * SettingsTreeIndicatorsLabel#updateSyncIgnored provides the source of truth.
     */
    let cachedSyncIgnoredSettingsSet = new Set();
    /**
     * Contains a copy of the sync-ignored settings to determine when to update
     * cachedSyncIgnoredSettingsSet.
     */
    let cachedSyncIgnoredSettings = [];
    /**
     * Renders the indicators next to a setting, such as "Also Modified In".
     */
    let SettingsTreeIndicatorsLabel = class SettingsTreeIndicatorsLabel {
        constructor(container, configurationService, hoverService, userDataSyncEnablementService, languageService, userDataProfilesService, commandService) {
            this.configurationService = configurationService;
            this.hoverService = hoverService;
            this.userDataSyncEnablementService = userDataSyncEnablementService;
            this.languageService = languageService;
            this.userDataProfilesService = userDataProfilesService;
            this.commandService = commandService;
            this.keybindingListeners = new lifecycle_1.DisposableStore();
            this.focusedIndex = 0;
            this.defaultHoverOptions = {
                hoverPosition: 2 /* HoverPosition.BELOW */,
                showPointer: true,
                compact: false,
                trapFocus: true
            };
            this.indicatorsContainerElement = DOM.append(container, $('.setting-indicators-container'));
            this.indicatorsContainerElement.style.display = 'inline';
            this.profilesEnabled = this.userDataProfilesService.isEnabled();
            this.workspaceTrustIndicator = this.createWorkspaceTrustIndicator();
            this.scopeOverridesIndicator = this.createScopeOverridesIndicator();
            this.syncIgnoredIndicator = this.createSyncIgnoredIndicator();
            this.defaultOverrideIndicator = this.createDefaultOverrideIndicator();
            this.allIndicators = [this.workspaceTrustIndicator, this.scopeOverridesIndicator, this.syncIgnoredIndicator, this.defaultOverrideIndicator];
        }
        addHoverDisposables(disposables, element, showHover) {
            disposables.clear();
            const scheduler = disposables.add(new async_1.RunOnceScheduler(() => {
                const hover = showHover(false);
                if (hover) {
                    disposables.add(hover);
                }
            }, this.configurationService.getValue('workbench.hover.delay')));
            disposables.add(DOM.addDisposableListener(element, DOM.EventType.MOUSE_OVER, () => {
                if (!scheduler.isScheduled()) {
                    scheduler.schedule();
                }
            }));
            disposables.add(DOM.addDisposableListener(element, DOM.EventType.MOUSE_LEAVE, () => {
                scheduler.cancel();
            }));
            disposables.add(DOM.addDisposableListener(element, DOM.EventType.KEY_DOWN, (e) => {
                const evt = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (evt.equals(10 /* KeyCode.Space */) || evt.equals(3 /* KeyCode.Enter */)) {
                    const hover = showHover(true);
                    if (hover) {
                        disposables.add(hover);
                    }
                    e.preventDefault();
                }
            }));
        }
        createWorkspaceTrustIndicator() {
            const workspaceTrustElement = $('span.setting-indicator.setting-item-workspace-trust');
            const workspaceTrustLabel = new simpleIconLabel_1.SimpleIconLabel(workspaceTrustElement);
            workspaceTrustLabel.text = '$(warning) ' + (0, nls_1.localize)('workspaceUntrustedLabel', "Setting value not applied");
            const content = (0, nls_1.localize)('trustLabel', "The setting value can only be applied in a trusted workspace.");
            const disposables = new lifecycle_1.DisposableStore();
            const showHover = (focus) => {
                return this.hoverService.showHover({
                    ...this.defaultHoverOptions,
                    content,
                    target: workspaceTrustElement,
                    actions: [{
                            label: (0, nls_1.localize)('manageWorkspaceTrust', "Manage Workspace Trust"),
                            commandId: 'workbench.trust.manage',
                            run: (target) => {
                                this.commandService.executeCommand('workbench.trust.manage');
                            }
                        }],
                }, focus);
            };
            this.addHoverDisposables(disposables, workspaceTrustElement, showHover);
            return {
                element: workspaceTrustElement,
                label: workspaceTrustLabel,
                disposables
            };
        }
        createScopeOverridesIndicator() {
            // Don't add .setting-indicator class here, because it gets conditionally added later.
            const otherOverridesElement = $('span.setting-item-overrides');
            const otherOverridesLabel = new simpleIconLabel_1.SimpleIconLabel(otherOverridesElement);
            return {
                element: otherOverridesElement,
                label: otherOverridesLabel,
                disposables: new lifecycle_1.DisposableStore()
            };
        }
        createSyncIgnoredIndicator() {
            const syncIgnoredElement = $('span.setting-indicator.setting-item-ignored');
            const syncIgnoredLabel = new simpleIconLabel_1.SimpleIconLabel(syncIgnoredElement);
            syncIgnoredLabel.text = (0, nls_1.localize)('extensionSyncIgnoredLabel', 'Not synced');
            const syncIgnoredHoverContent = (0, nls_1.localize)('syncIgnoredTitle', "This setting is ignored during sync");
            const disposables = new lifecycle_1.DisposableStore();
            const showHover = (focus) => {
                return this.hoverService.showHover({
                    ...this.defaultHoverOptions,
                    content: syncIgnoredHoverContent,
                    target: syncIgnoredElement
                }, focus);
            };
            this.addHoverDisposables(disposables, syncIgnoredElement, showHover);
            return {
                element: syncIgnoredElement,
                label: syncIgnoredLabel,
                disposables: new lifecycle_1.DisposableStore()
            };
        }
        createDefaultOverrideIndicator() {
            const defaultOverrideIndicator = $('span.setting-indicator.setting-item-default-overridden');
            const defaultOverrideLabel = new simpleIconLabel_1.SimpleIconLabel(defaultOverrideIndicator);
            defaultOverrideLabel.text = (0, nls_1.localize)('defaultOverriddenLabel', "Default value changed");
            return {
                element: defaultOverrideIndicator,
                label: defaultOverrideLabel,
                disposables: new lifecycle_1.DisposableStore()
            };
        }
        render() {
            const indicatorsToShow = this.allIndicators.filter(indicator => {
                return indicator.element.style.display !== 'none';
            });
            this.indicatorsContainerElement.innerText = '';
            this.indicatorsContainerElement.style.display = 'none';
            if (indicatorsToShow.length) {
                this.indicatorsContainerElement.style.display = 'inline';
                DOM.append(this.indicatorsContainerElement, $('span', undefined, '('));
                for (let i = 0; i < indicatorsToShow.length - 1; i++) {
                    DOM.append(this.indicatorsContainerElement, indicatorsToShow[i].element);
                    DOM.append(this.indicatorsContainerElement, $('span.comma', undefined, ' • '));
                }
                DOM.append(this.indicatorsContainerElement, indicatorsToShow[indicatorsToShow.length - 1].element);
                DOM.append(this.indicatorsContainerElement, $('span', undefined, ')'));
                this.resetIndicatorNavigationKeyBindings(indicatorsToShow);
            }
        }
        resetIndicatorNavigationKeyBindings(indicators) {
            this.keybindingListeners.clear();
            this.indicatorsContainerElement.role = indicators.length >= 1 ? 'toolbar' : 'button';
            if (!indicators.length) {
                return;
            }
            const firstElement = indicators[0].focusElement ?? indicators[0].element;
            firstElement.tabIndex = 0;
            this.keybindingListeners.add(DOM.addDisposableListener(this.indicatorsContainerElement, 'keydown', (e) => {
                const ev = new keyboardEvent_1.StandardKeyboardEvent(e);
                let handled = true;
                if (ev.equals(14 /* KeyCode.Home */)) {
                    this.focusIndicatorAt(indicators, 0);
                }
                else if (ev.equals(13 /* KeyCode.End */)) {
                    this.focusIndicatorAt(indicators, indicators.length - 1);
                }
                else if (ev.equals(17 /* KeyCode.RightArrow */)) {
                    const indexToFocus = (this.focusedIndex + 1) % indicators.length;
                    this.focusIndicatorAt(indicators, indexToFocus);
                }
                else if (ev.equals(15 /* KeyCode.LeftArrow */)) {
                    const indexToFocus = this.focusedIndex ? this.focusedIndex - 1 : indicators.length - 1;
                    this.focusIndicatorAt(indicators, indexToFocus);
                }
                else {
                    handled = false;
                }
                if (handled) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }));
        }
        focusIndicatorAt(indicators, index) {
            if (index === this.focusedIndex) {
                return;
            }
            const indicator = indicators[index];
            const elementToFocus = indicator.focusElement ?? indicator.element;
            elementToFocus.tabIndex = 0;
            elementToFocus.focus();
            const currentlyFocusedIndicator = indicators[this.focusedIndex];
            const previousFocusedElement = currentlyFocusedIndicator.focusElement ?? currentlyFocusedIndicator.element;
            previousFocusedElement.tabIndex = -1;
            this.focusedIndex = index;
        }
        updateWorkspaceTrust(element) {
            this.workspaceTrustIndicator.element.style.display = element.isUntrusted ? 'inline' : 'none';
            this.render();
        }
        updateSyncIgnored(element, ignoredSettings) {
            this.syncIgnoredIndicator.element.style.display = this.userDataSyncEnablementService.isEnabled()
                && ignoredSettings.includes(element.setting.key) ? 'inline' : 'none';
            this.render();
            if (cachedSyncIgnoredSettings !== ignoredSettings) {
                cachedSyncIgnoredSettings = ignoredSettings;
                cachedSyncIgnoredSettingsSet = new Set(cachedSyncIgnoredSettings);
            }
        }
        getInlineScopeDisplayText(completeScope) {
            const [scope, language] = completeScope.split(':');
            const localizedScope = scope === 'user' ?
                (0, nls_1.localize)('user', "User") : scope === 'workspace' ?
                (0, nls_1.localize)('workspace', "Workspace") : (0, nls_1.localize)('remote', "Remote");
            if (language) {
                return `${this.languageService.getLanguageName(language)} > ${localizedScope}`;
            }
            return localizedScope;
        }
        dispose() {
            this.keybindingListeners.dispose();
            for (const indicator of this.allIndicators) {
                indicator.disposables.dispose();
            }
        }
        updateScopeOverrides(element, onDidClickOverrideElement, onApplyFilter) {
            this.scopeOverridesIndicator.element.innerText = '';
            this.scopeOverridesIndicator.element.style.display = 'none';
            this.scopeOverridesIndicator.focusElement = this.scopeOverridesIndicator.element;
            if (element.hasPolicyValue) {
                // If the setting falls under a policy, then no matter what the user sets, the policy value takes effect.
                this.scopeOverridesIndicator.element.style.display = 'inline';
                this.scopeOverridesIndicator.element.classList.add('setting-indicator');
                this.scopeOverridesIndicator.label.text = '$(warning) ' + (0, nls_1.localize)('policyLabelText', "Setting value not applied");
                const content = (0, nls_1.localize)('policyDescription', "This setting is managed by your organization and its applied value cannot be changed.");
                const showHover = (focus) => {
                    return this.hoverService.showHover({
                        ...this.defaultHoverOptions,
                        content,
                        actions: [{
                                label: (0, nls_1.localize)('policyFilterLink', "View policy settings"),
                                commandId: '_settings.action.viewPolicySettings',
                                run: (_) => {
                                    onApplyFilter.fire(`@${preferences_1.POLICY_SETTING_TAG}`);
                                }
                            }],
                        target: this.scopeOverridesIndicator.element
                    }, focus);
                };
                this.addHoverDisposables(this.scopeOverridesIndicator.disposables, this.scopeOverridesIndicator.element, showHover);
            }
            else if (this.profilesEnabled && element.settingsTarget === 3 /* ConfigurationTarget.USER_LOCAL */ && this.configurationService.isSettingAppliedForAllProfiles(element.setting.key)) {
                this.scopeOverridesIndicator.element.style.display = 'inline';
                this.scopeOverridesIndicator.element.classList.add('setting-indicator');
                this.scopeOverridesIndicator.label.text = (0, nls_1.localize)('applicationSetting', "Applies to all profiles");
                const content = (0, nls_1.localize)('applicationSettingDescription', "The setting is not specific to the current profile, and will retain its value when switching profiles.");
                const showHover = (focus) => {
                    return this.hoverService.showHover({
                        ...this.defaultHoverOptions,
                        content,
                        target: this.scopeOverridesIndicator.element
                    }, focus);
                };
                this.addHoverDisposables(this.scopeOverridesIndicator.disposables, this.scopeOverridesIndicator.element, showHover);
            }
            else if (element.overriddenScopeList.length || element.overriddenDefaultsLanguageList.length) {
                if (element.overriddenScopeList.length === 1 && !element.overriddenDefaultsLanguageList.length) {
                    // We can inline the override and show all the text in the label
                    // so that users don't have to wait for the hover to load
                    // just to click into the one override there is.
                    this.scopeOverridesIndicator.element.style.display = 'inline';
                    this.scopeOverridesIndicator.element.classList.remove('setting-indicator');
                    this.scopeOverridesIndicator.disposables.clear();
                    const prefaceText = element.isConfigured ?
                        (0, nls_1.localize)('alsoConfiguredIn', "Also modified in") :
                        (0, nls_1.localize)('configuredIn', "Modified in");
                    this.scopeOverridesIndicator.label.text = `${prefaceText} `;
                    const overriddenScope = element.overriddenScopeList[0];
                    const view = DOM.append(this.scopeOverridesIndicator.element, $('a.modified-scope', undefined, this.getInlineScopeDisplayText(overriddenScope)));
                    view.tabIndex = -1;
                    this.scopeOverridesIndicator.focusElement = view;
                    const onClickOrKeydown = (e) => {
                        const [scope, language] = overriddenScope.split(':');
                        onDidClickOverrideElement.fire({
                            settingKey: element.setting.key,
                            scope: scope,
                            language
                        });
                        e.preventDefault();
                        e.stopPropagation();
                    };
                    this.scopeOverridesIndicator.disposables.add(DOM.addDisposableListener(view, DOM.EventType.CLICK, (e) => {
                        onClickOrKeydown(e);
                    }));
                    this.scopeOverridesIndicator.disposables.add(DOM.addDisposableListener(view, DOM.EventType.KEY_DOWN, (e) => {
                        const ev = new keyboardEvent_1.StandardKeyboardEvent(e);
                        if (ev.equals(10 /* KeyCode.Space */) || ev.equals(3 /* KeyCode.Enter */)) {
                            onClickOrKeydown(e);
                        }
                    }));
                }
                else {
                    this.scopeOverridesIndicator.element.style.display = 'inline';
                    this.scopeOverridesIndicator.element.classList.add('setting-indicator');
                    const scopeOverridesLabelText = element.isConfigured ?
                        (0, nls_1.localize)('alsoConfiguredElsewhere', "Also modified elsewhere") :
                        (0, nls_1.localize)('configuredElsewhere', "Modified elsewhere");
                    this.scopeOverridesIndicator.label.text = scopeOverridesLabelText;
                    let contentMarkdownString = '';
                    if (element.overriddenScopeList.length) {
                        const prefaceText = element.isConfigured ?
                            (0, nls_1.localize)('alsoModifiedInScopes', "The setting has also been modified in the following scopes:") :
                            (0, nls_1.localize)('modifiedInScopes', "The setting has been modified in the following scopes:");
                        contentMarkdownString = prefaceText;
                        for (const scope of element.overriddenScopeList) {
                            const scopeDisplayText = this.getInlineScopeDisplayText(scope);
                            contentMarkdownString += `\n- [${scopeDisplayText}](${encodeURIComponent(scope)} "${getAccessibleScopeDisplayText(scope, this.languageService)}")`;
                        }
                    }
                    if (element.overriddenDefaultsLanguageList.length) {
                        if (contentMarkdownString) {
                            contentMarkdownString += `\n\n`;
                        }
                        const prefaceText = (0, nls_1.localize)('hasDefaultOverridesForLanguages', "The following languages have default overrides:");
                        contentMarkdownString += prefaceText;
                        for (const language of element.overriddenDefaultsLanguageList) {
                            const scopeDisplayText = this.languageService.getLanguageName(language);
                            contentMarkdownString += `\n- [${scopeDisplayText}](${encodeURIComponent(`default:${language}`)} "${scopeDisplayText}")`;
                        }
                    }
                    const content = {
                        value: contentMarkdownString,
                        isTrusted: false,
                        supportHtml: false
                    };
                    const showHover = (focus) => {
                        return this.hoverService.showHover({
                            ...this.defaultHoverOptions,
                            content,
                            linkHandler: (url) => {
                                const [scope, language] = decodeURIComponent(url).split(':');
                                onDidClickOverrideElement.fire({
                                    settingKey: element.setting.key,
                                    scope: scope,
                                    language
                                });
                            },
                            target: this.scopeOverridesIndicator.element
                        }, focus);
                    };
                    this.addHoverDisposables(this.scopeOverridesIndicator.disposables, this.scopeOverridesIndicator.element, showHover);
                }
            }
            this.render();
        }
        updateDefaultOverrideIndicator(element) {
            this.defaultOverrideIndicator.element.style.display = 'none';
            const sourceToDisplay = getDefaultValueSourceToDisplay(element);
            if (sourceToDisplay !== undefined) {
                this.defaultOverrideIndicator.element.style.display = 'inline';
                this.defaultOverrideIndicator.disposables.clear();
                const defaultOverrideHoverContent = (0, nls_1.localize)('defaultOverriddenDetails', "Default setting value overridden by {0}", sourceToDisplay);
                const showHover = (focus) => {
                    return this.hoverService.showHover({
                        content: defaultOverrideHoverContent,
                        target: this.defaultOverrideIndicator.element,
                        hoverPosition: 2 /* HoverPosition.BELOW */,
                        showPointer: true,
                        compact: false
                    }, focus);
                };
                this.addHoverDisposables(this.defaultOverrideIndicator.disposables, this.defaultOverrideIndicator.element, showHover);
            }
            this.render();
        }
    };
    exports.SettingsTreeIndicatorsLabel = SettingsTreeIndicatorsLabel;
    exports.SettingsTreeIndicatorsLabel = SettingsTreeIndicatorsLabel = __decorate([
        __param(1, configuration_1.IWorkbenchConfigurationService),
        __param(2, hover_1.IHoverService),
        __param(3, userDataSync_1.IUserDataSyncEnablementService),
        __param(4, language_1.ILanguageService),
        __param(5, userDataProfile_1.IUserDataProfilesService),
        __param(6, commands_1.ICommandService)
    ], SettingsTreeIndicatorsLabel);
    function getDefaultValueSourceToDisplay(element) {
        let sourceToDisplay;
        const defaultValueSource = element.defaultValueSource;
        if (defaultValueSource) {
            if (typeof defaultValueSource !== 'string') {
                sourceToDisplay = defaultValueSource.displayName ?? defaultValueSource.id;
            }
            else if (typeof defaultValueSource === 'string') {
                sourceToDisplay = defaultValueSource;
            }
        }
        return sourceToDisplay;
    }
    function getAccessibleScopeDisplayText(completeScope, languageService) {
        const [scope, language] = completeScope.split(':');
        const localizedScope = scope === 'user' ?
            (0, nls_1.localize)('user', "User") : scope === 'workspace' ?
            (0, nls_1.localize)('workspace', "Workspace") : (0, nls_1.localize)('remote', "Remote");
        if (language) {
            return (0, nls_1.localize)('modifiedInScopeForLanguage', "The {0} scope for {1}", localizedScope, languageService.getLanguageName(language));
        }
        return localizedScope;
    }
    function getAccessibleScopeDisplayMidSentenceText(completeScope, languageService) {
        const [scope, language] = completeScope.split(':');
        const localizedScope = scope === 'user' ?
            (0, nls_1.localize)('user', "User") : scope === 'workspace' ?
            (0, nls_1.localize)('workspace', "Workspace") : (0, nls_1.localize)('remote', "Remote");
        if (language) {
            return (0, nls_1.localize)('modifiedInScopeForLanguageMidSentence', "the {0} scope for {1}", localizedScope.toLowerCase(), languageService.getLanguageName(language));
        }
        return localizedScope;
    }
    function getIndicatorsLabelAriaLabel(element, configurationService, userDataProfilesService, languageService) {
        const ariaLabelSections = [];
        // Add workspace trust text
        if (element.isUntrusted) {
            ariaLabelSections.push((0, nls_1.localize)('workspaceUntrustedAriaLabel', "Workspace untrusted; setting value not applied"));
        }
        if (element.hasPolicyValue) {
            ariaLabelSections.push((0, nls_1.localize)('policyDescriptionAccessible', "Managed by organization policy; setting value not applied"));
        }
        else if (userDataProfilesService.isEnabled() && element.settingsTarget === 3 /* ConfigurationTarget.USER_LOCAL */ && configurationService.isSettingAppliedForAllProfiles(element.setting.key)) {
            ariaLabelSections.push((0, nls_1.localize)('applicationSettingDescriptionAccessible', "Setting value retained when switching profiles"));
        }
        else {
            // Add other overrides text
            const otherOverridesStart = element.isConfigured ?
                (0, nls_1.localize)('alsoConfiguredIn', "Also modified in") :
                (0, nls_1.localize)('configuredIn', "Modified in");
            const otherOverridesList = element.overriddenScopeList
                .map(scope => getAccessibleScopeDisplayMidSentenceText(scope, languageService)).join(', ');
            if (element.overriddenScopeList.length) {
                ariaLabelSections.push(`${otherOverridesStart} ${otherOverridesList}`);
            }
        }
        // Add sync ignored text
        if (cachedSyncIgnoredSettingsSet.has(element.setting.key)) {
            ariaLabelSections.push((0, nls_1.localize)('syncIgnoredAriaLabel', "Setting ignored during sync"));
        }
        // Add default override indicator text
        const sourceToDisplay = getDefaultValueSourceToDisplay(element);
        if (sourceToDisplay !== undefined) {
            ariaLabelSections.push((0, nls_1.localize)('defaultOverriddenDetailsAriaLabel', "{0} overrides the default value", sourceToDisplay));
        }
        // Add text about default values being overridden in other languages
        const otherLanguageOverridesList = element.overriddenDefaultsLanguageList
            .map(language => languageService.getLanguageName(language)).join(', ');
        if (element.overriddenDefaultsLanguageList.length) {
            const otherLanguageOverridesText = (0, nls_1.localize)('defaultOverriddenLanguagesList', "Language-specific default values exist for {0}", otherLanguageOverridesList);
            ariaLabelSections.push(otherLanguageOverridesText);
        }
        const ariaLabel = ariaLabelSections.join('. ');
        return ariaLabel;
    }
    exports.getIndicatorsLabelAriaLabel = getIndicatorsLabelAriaLabel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3NFZGl0b3JTZXR0aW5nSW5kaWNhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3ByZWZlcmVuY2VzL2Jyb3dzZXIvc2V0dGluZ3NFZGl0b3JTZXR0aW5nSW5kaWNhdG9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFzQmhHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFxQmhCOzs7O09BSUc7SUFDSCxJQUFJLDRCQUE0QixHQUFnQixJQUFJLEdBQUcsRUFBVSxDQUFDO0lBRWxFOzs7T0FHRztJQUNILElBQUkseUJBQXlCLEdBQWEsRUFBRSxDQUFDO0lBRTdDOztPQUVHO0lBQ0ksSUFBTSwyQkFBMkIsR0FBakMsTUFBTSwyQkFBMkI7UUFjdkMsWUFDQyxTQUFzQixFQUNVLG9CQUFxRSxFQUN0RixZQUE0QyxFQUMzQiw2QkFBOEUsRUFDNUYsZUFBa0QsRUFDMUMsdUJBQWtFLEVBQzNFLGNBQWdEO1lBTGhCLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBZ0M7WUFDckUsaUJBQVksR0FBWixZQUFZLENBQWU7WUFDVixrQ0FBNkIsR0FBN0IsNkJBQTZCLENBQWdDO1lBQzNFLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQUN6Qiw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQTBCO1lBQzFELG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQVZqRCx3QkFBbUIsR0FBb0IsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFDdEUsaUJBQVksR0FBRyxDQUFDLENBQUM7WUFzQmpCLHdCQUFtQixHQUEyQjtnQkFDckQsYUFBYSw2QkFBcUI7Z0JBQ2xDLFdBQVcsRUFBRSxJQUFJO2dCQUNqQixPQUFPLEVBQUUsS0FBSztnQkFDZCxTQUFTLEVBQUUsSUFBSTthQUNmLENBQUM7WUFqQkQsSUFBSSxDQUFD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