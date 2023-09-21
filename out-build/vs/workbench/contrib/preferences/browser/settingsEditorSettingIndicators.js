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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/iconLabel/simpleIconLabel", "vs/base/common/async", "vs/base/common/lifecycle", "vs/editor/common/languages/language", "vs/nls!vs/workbench/contrib/preferences/browser/settingsEditorSettingIndicators", "vs/platform/commands/common/commands", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/contrib/preferences/common/preferences", "vs/workbench/services/configuration/common/configuration", "vs/workbench/services/hover/browser/hover"], function (require, exports, DOM, keyboardEvent_1, simpleIconLabel_1, async_1, lifecycle_1, language_1, nls_1, commands_1, userDataProfile_1, userDataSync_1, preferences_1, configuration_1, hover_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$BDb = exports.$ADb = void 0;
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
    let $ADb = class $ADb {
        constructor(container, l, m, n, o, p, q) {
            this.l = l;
            this.m = m;
            this.n = n;
            this.o = o;
            this.p = p;
            this.q = q;
            this.j = new lifecycle_1.$jc();
            this.k = 0;
            this.r = {
                hoverPosition: 2 /* HoverPosition.BELOW */,
                showPointer: true,
                compact: false,
                trapFocus: true
            };
            this.a = DOM.$0O(container, $('.setting-indicators-container'));
            this.a.style.display = 'inline';
            this.h = this.p.isEnabled();
            this.b = this.t();
            this.c = this.u();
            this.d = this.v();
            this.f = this.w();
            this.g = [this.b, this.c, this.d, this.f];
        }
        s(disposables, element, showHover) {
            disposables.clear();
            const scheduler = disposables.add(new async_1.$Sg(() => {
                const hover = showHover(false);
                if (hover) {
                    disposables.add(hover);
                }
            }, this.l.getValue('workbench.hover.delay')));
            disposables.add(DOM.$nO(element, DOM.$3O.MOUSE_OVER, () => {
                if (!scheduler.isScheduled()) {
                    scheduler.schedule();
                }
            }));
            disposables.add(DOM.$nO(element, DOM.$3O.MOUSE_LEAVE, () => {
                scheduler.cancel();
            }));
            disposables.add(DOM.$nO(element, DOM.$3O.KEY_DOWN, (e) => {
                const evt = new keyboardEvent_1.$jO(e);
                if (evt.equals(10 /* KeyCode.Space */) || evt.equals(3 /* KeyCode.Enter */)) {
                    const hover = showHover(true);
                    if (hover) {
                        disposables.add(hover);
                    }
                    e.preventDefault();
                }
            }));
        }
        t() {
            const workspaceTrustElement = $('span.setting-indicator.setting-item-workspace-trust');
            const workspaceTrustLabel = new simpleIconLabel_1.$LR(workspaceTrustElement);
            workspaceTrustLabel.text = '$(warning) ' + (0, nls_1.localize)(0, null);
            const content = (0, nls_1.localize)(1, null);
            const disposables = new lifecycle_1.$jc();
            const showHover = (focus) => {
                return this.m.showHover({
                    ...this.r,
                    content,
                    target: workspaceTrustElement,
                    actions: [{
                            label: (0, nls_1.localize)(2, null),
                            commandId: 'workbench.trust.manage',
                            run: (target) => {
                                this.q.executeCommand('workbench.trust.manage');
                            }
                        }],
                }, focus);
            };
            this.s(disposables, workspaceTrustElement, showHover);
            return {
                element: workspaceTrustElement,
                label: workspaceTrustLabel,
                disposables
            };
        }
        u() {
            // Don't add .setting-indicator class here, because it gets conditionally added later.
            const otherOverridesElement = $('span.setting-item-overrides');
            const otherOverridesLabel = new simpleIconLabel_1.$LR(otherOverridesElement);
            return {
                element: otherOverridesElement,
                label: otherOverridesLabel,
                disposables: new lifecycle_1.$jc()
            };
        }
        v() {
            const syncIgnoredElement = $('span.setting-indicator.setting-item-ignored');
            const syncIgnoredLabel = new simpleIconLabel_1.$LR(syncIgnoredElement);
            syncIgnoredLabel.text = (0, nls_1.localize)(3, null);
            const syncIgnoredHoverContent = (0, nls_1.localize)(4, null);
            const disposables = new lifecycle_1.$jc();
            const showHover = (focus) => {
                return this.m.showHover({
                    ...this.r,
                    content: syncIgnoredHoverContent,
                    target: syncIgnoredElement
                }, focus);
            };
            this.s(disposables, syncIgnoredElement, showHover);
            return {
                element: syncIgnoredElement,
                label: syncIgnoredLabel,
                disposables: new lifecycle_1.$jc()
            };
        }
        w() {
            const defaultOverrideIndicator = $('span.setting-indicator.setting-item-default-overridden');
            const defaultOverrideLabel = new simpleIconLabel_1.$LR(defaultOverrideIndicator);
            defaultOverrideLabel.text = (0, nls_1.localize)(5, null);
            return {
                element: defaultOverrideIndicator,
                label: defaultOverrideLabel,
                disposables: new lifecycle_1.$jc()
            };
        }
        x() {
            const indicatorsToShow = this.g.filter(indicator => {
                return indicator.element.style.display !== 'none';
            });
            this.a.innerText = '';
            this.a.style.display = 'none';
            if (indicatorsToShow.length) {
                this.a.style.display = 'inline';
                DOM.$0O(this.a, $('span', undefined, '('));
                for (let i = 0; i < indicatorsToShow.length - 1; i++) {
                    DOM.$0O(this.a, indicatorsToShow[i].element);
                    DOM.$0O(this.a, $('span.comma', undefined, ' • '));
                }
                DOM.$0O(this.a, indicatorsToShow[indicatorsToShow.length - 1].element);
                DOM.$0O(this.a, $('span', undefined, ')'));
                this.y(indicatorsToShow);
            }
        }
        y(indicators) {
            this.j.clear();
            this.a.role = indicators.length >= 1 ? 'toolbar' : 'button';
            if (!indicators.length) {
                return;
            }
            const firstElement = indicators[0].focusElement ?? indicators[0].element;
            firstElement.tabIndex = 0;
            this.j.add(DOM.$nO(this.a, 'keydown', (e) => {
                const ev = new keyboardEvent_1.$jO(e);
                let handled = true;
                if (ev.equals(14 /* KeyCode.Home */)) {
                    this.z(indicators, 0);
                }
                else if (ev.equals(13 /* KeyCode.End */)) {
                    this.z(indicators, indicators.length - 1);
                }
                else if (ev.equals(17 /* KeyCode.RightArrow */)) {
                    const indexToFocus = (this.k + 1) % indicators.length;
                    this.z(indicators, indexToFocus);
                }
                else if (ev.equals(15 /* KeyCode.LeftArrow */)) {
                    const indexToFocus = this.k ? this.k - 1 : indicators.length - 1;
                    this.z(indicators, indexToFocus);
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
        z(indicators, index) {
            if (index === this.k) {
                return;
            }
            const indicator = indicators[index];
            const elementToFocus = indicator.focusElement ?? indicator.element;
            elementToFocus.tabIndex = 0;
            elementToFocus.focus();
            const currentlyFocusedIndicator = indicators[this.k];
            const previousFocusedElement = currentlyFocusedIndicator.focusElement ?? currentlyFocusedIndicator.element;
            previousFocusedElement.tabIndex = -1;
            this.k = index;
        }
        updateWorkspaceTrust(element) {
            this.b.element.style.display = element.isUntrusted ? 'inline' : 'none';
            this.x();
        }
        updateSyncIgnored(element, ignoredSettings) {
            this.d.element.style.display = this.n.isEnabled()
                && ignoredSettings.includes(element.setting.key) ? 'inline' : 'none';
            this.x();
            if (cachedSyncIgnoredSettings !== ignoredSettings) {
                cachedSyncIgnoredSettings = ignoredSettings;
                cachedSyncIgnoredSettingsSet = new Set(cachedSyncIgnoredSettings);
            }
        }
        A(completeScope) {
            const [scope, language] = completeScope.split(':');
            const localizedScope = scope === 'user' ?
                (0, nls_1.localize)(6, null) : scope === 'workspace' ?
                (0, nls_1.localize)(7, null) : (0, nls_1.localize)(8, null);
            if (language) {
                return `${this.o.getLanguageName(language)} > ${localizedScope}`;
            }
            return localizedScope;
        }
        dispose() {
            this.j.dispose();
            for (const indicator of this.g) {
                indicator.disposables.dispose();
            }
        }
        updateScopeOverrides(element, onDidClickOverrideElement, onApplyFilter) {
            this.c.element.innerText = '';
            this.c.element.style.display = 'none';
            this.c.focusElement = this.c.element;
            if (element.hasPolicyValue) {
                // If the setting falls under a policy, then no matter what the user sets, the policy value takes effect.
                this.c.element.style.display = 'inline';
                this.c.element.classList.add('setting-indicator');
                this.c.label.text = '$(warning) ' + (0, nls_1.localize)(9, null);
                const content = (0, nls_1.localize)(10, null);
                const showHover = (focus) => {
                    return this.m.showHover({
                        ...this.r,
                        content,
                        actions: [{
                                label: (0, nls_1.localize)(11, null),
                                commandId: '_settings.action.viewPolicySettings',
                                run: (_) => {
                                    onApplyFilter.fire(`@${preferences_1.$OCb}`);
                                }
                            }],
                        target: this.c.element
                    }, focus);
                };
                this.s(this.c.disposables, this.c.element, showHover);
            }
            else if (this.h && element.settingsTarget === 3 /* ConfigurationTarget.USER_LOCAL */ && this.l.isSettingAppliedForAllProfiles(element.setting.key)) {
                this.c.element.style.display = 'inline';
                this.c.element.classList.add('setting-indicator');
                this.c.label.text = (0, nls_1.localize)(12, null);
                const content = (0, nls_1.localize)(13, null);
                const showHover = (focus) => {
                    return this.m.showHover({
                        ...this.r,
                        content,
                        target: this.c.element
                    }, focus);
                };
                this.s(this.c.disposables, this.c.element, showHover);
            }
            else if (element.overriddenScopeList.length || element.overriddenDefaultsLanguageList.length) {
                if (element.overriddenScopeList.length === 1 && !element.overriddenDefaultsLanguageList.length) {
                    // We can inline the override and show all the text in the label
                    // so that users don't have to wait for the hover to load
                    // just to click into the one override there is.
                    this.c.element.style.display = 'inline';
                    this.c.element.classList.remove('setting-indicator');
                    this.c.disposables.clear();
                    const prefaceText = element.isConfigured ?
                        (0, nls_1.localize)(14, null) :
                        (0, nls_1.localize)(15, null);
                    this.c.label.text = `${prefaceText} `;
                    const overriddenScope = element.overriddenScopeList[0];
                    const view = DOM.$0O(this.c.element, $('a.modified-scope', undefined, this.A(overriddenScope)));
                    view.tabIndex = -1;
                    this.c.focusElement = view;
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
                    this.c.disposables.add(DOM.$nO(view, DOM.$3O.CLICK, (e) => {
                        onClickOrKeydown(e);
                    }));
                    this.c.disposables.add(DOM.$nO(view, DOM.$3O.KEY_DOWN, (e) => {
                        const ev = new keyboardEvent_1.$jO(e);
                        if (ev.equals(10 /* KeyCode.Space */) || ev.equals(3 /* KeyCode.Enter */)) {
                            onClickOrKeydown(e);
                        }
                    }));
                }
                else {
                    this.c.element.style.display = 'inline';
                    this.c.element.classList.add('setting-indicator');
                    const scopeOverridesLabelText = element.isConfigured ?
                        (0, nls_1.localize)(16, null) :
                        (0, nls_1.localize)(17, null);
                    this.c.label.text = scopeOverridesLabelText;
                    let contentMarkdownString = '';
                    if (element.overriddenScopeList.length) {
                        const prefaceText = element.isConfigured ?
                            (0, nls_1.localize)(18, null) :
                            (0, nls_1.localize)(19, null);
                        contentMarkdownString = prefaceText;
                        for (const scope of element.overriddenScopeList) {
                            const scopeDisplayText = this.A(scope);
                            contentMarkdownString += `\n- [${scopeDisplayText}](${encodeURIComponent(scope)} "${getAccessibleScopeDisplayText(scope, this.o)}")`;
                        }
                    }
                    if (element.overriddenDefaultsLanguageList.length) {
                        if (contentMarkdownString) {
                            contentMarkdownString += `\n\n`;
                        }
                        const prefaceText = (0, nls_1.localize)(20, null);
                        contentMarkdownString += prefaceText;
                        for (const language of element.overriddenDefaultsLanguageList) {
                            const scopeDisplayText = this.o.getLanguageName(language);
                            contentMarkdownString += `\n- [${scopeDisplayText}](${encodeURIComponent(`default:${language}`)} "${scopeDisplayText}")`;
                        }
                    }
                    const content = {
                        value: contentMarkdownString,
                        isTrusted: false,
                        supportHtml: false
                    };
                    const showHover = (focus) => {
                        return this.m.showHover({
                            ...this.r,
                            content,
                            linkHandler: (url) => {
                                const [scope, language] = decodeURIComponent(url).split(':');
                                onDidClickOverrideElement.fire({
                                    settingKey: element.setting.key,
                                    scope: scope,
                                    language
                                });
                            },
                            target: this.c.element
                        }, focus);
                    };
                    this.s(this.c.disposables, this.c.element, showHover);
                }
            }
            this.x();
        }
        updateDefaultOverrideIndicator(element) {
            this.f.element.style.display = 'none';
            const sourceToDisplay = getDefaultValueSourceToDisplay(element);
            if (sourceToDisplay !== undefined) {
                this.f.element.style.display = 'inline';
                this.f.disposables.clear();
                const defaultOverrideHoverContent = (0, nls_1.localize)(21, null, sourceToDisplay);
                const showHover = (focus) => {
                    return this.m.showHover({
                        content: defaultOverrideHoverContent,
                        target: this.f.element,
                        hoverPosition: 2 /* HoverPosition.BELOW */,
                        showPointer: true,
                        compact: false
                    }, focus);
                };
                this.s(this.f.disposables, this.f.element, showHover);
            }
            this.x();
        }
    };
    exports.$ADb = $ADb;
    exports.$ADb = $ADb = __decorate([
        __param(1, configuration_1.$mE),
        __param(2, hover_1.$zib),
        __param(3, userDataSync_1.$Pgb),
        __param(4, language_1.$ct),
        __param(5, userDataProfile_1.$Ek),
        __param(6, commands_1.$Fr)
    ], $ADb);
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
            (0, nls_1.localize)(22, null) : scope === 'workspace' ?
            (0, nls_1.localize)(23, null) : (0, nls_1.localize)(24, null);
        if (language) {
            return (0, nls_1.localize)(25, null, localizedScope, languageService.getLanguageName(language));
        }
        return localizedScope;
    }
    function getAccessibleScopeDisplayMidSentenceText(completeScope, languageService) {
        const [scope, language] = completeScope.split(':');
        const localizedScope = scope === 'user' ?
            (0, nls_1.localize)(26, null) : scope === 'workspace' ?
            (0, nls_1.localize)(27, null) : (0, nls_1.localize)(28, null);
        if (language) {
            return (0, nls_1.localize)(29, null, localizedScope.toLowerCase(), languageService.getLanguageName(language));
        }
        return localizedScope;
    }
    function $BDb(element, configurationService, userDataProfilesService, languageService) {
        const ariaLabelSections = [];
        // Add workspace trust text
        if (element.isUntrusted) {
            ariaLabelSections.push((0, nls_1.localize)(30, null));
        }
        if (element.hasPolicyValue) {
            ariaLabelSections.push((0, nls_1.localize)(31, null));
        }
        else if (userDataProfilesService.isEnabled() && element.settingsTarget === 3 /* ConfigurationTarget.USER_LOCAL */ && configurationService.isSettingAppliedForAllProfiles(element.setting.key)) {
            ariaLabelSections.push((0, nls_1.localize)(32, null));
        }
        else {
            // Add other overrides text
            const otherOverridesStart = element.isConfigured ?
                (0, nls_1.localize)(33, null) :
                (0, nls_1.localize)(34, null);
            const otherOverridesList = element.overriddenScopeList
                .map(scope => getAccessibleScopeDisplayMidSentenceText(scope, languageService)).join(', ');
            if (element.overriddenScopeList.length) {
                ariaLabelSections.push(`${otherOverridesStart} ${otherOverridesList}`);
            }
        }
        // Add sync ignored text
        if (cachedSyncIgnoredSettingsSet.has(element.setting.key)) {
            ariaLabelSections.push((0, nls_1.localize)(35, null));
        }
        // Add default override indicator text
        const sourceToDisplay = getDefaultValueSourceToDisplay(element);
        if (sourceToDisplay !== undefined) {
            ariaLabelSections.push((0, nls_1.localize)(36, null, sourceToDisplay));
        }
        // Add text about default values being overridden in other languages
        const otherLanguageOverridesList = element.overriddenDefaultsLanguageList
            .map(language => languageService.getLanguageName(language)).join(', ');
        if (element.overriddenDefaultsLanguageList.length) {
            const otherLanguageOverridesText = (0, nls_1.localize)(37, null, otherLanguageOverridesList);
            ariaLabelSections.push(otherLanguageOverridesText);
        }
        const ariaLabel = ariaLabelSections.join('. ');
        return ariaLabel;
    }
    exports.$BDb = $BDb;
});
//# sourceMappingURL=settingsEditorSettingIndicators.js.map