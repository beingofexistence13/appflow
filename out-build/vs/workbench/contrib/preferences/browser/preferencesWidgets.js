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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/widget", "vs/base/common/actions", "vs/base/common/event", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/uri", "vs/nls!vs/workbench/contrib/preferences/browser/preferencesWidgets", "vs/platform/history/browser/contextScopedHistoryWidget", "vs/platform/history/browser/historyWidgetKeybindingHint", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/label/common/label", "vs/platform/theme/common/colorRegistry", "vs/base/common/themables", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/preferences/browser/preferencesIcons", "vs/workbench/services/environment/common/environmentService", "vs/editor/common/languages/language"], function (require, exports, DOM, keyboardEvent_1, actionbar_1, actionViewItems_1, widget_1, actions_1, event_1, htmlContent_1, lifecycle_1, network_1, resources_1, uri_1, nls_1, contextScopedHistoryWidget_1, historyWidgetKeybindingHint_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, label_1, colorRegistry_1, themables_1, workspace_1, preferencesIcons_1, environmentService_1, language_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$0Bb = exports.$9Bb = exports.$8Bb = exports.$7Bb = void 0;
    let $7Bb = class $7Bb extends actionViewItems_1.$MQ {
        constructor(action, y, H) {
            super(null, action);
            this.y = y;
            this.H = H;
            this.b = new Map();
            const workspace = this.y.getWorkspace();
            this.a = workspace.folders.length === 1 ? workspace.folders[0] : null;
            this.B(this.y.onDidChangeWorkspaceFolders(() => this.M()));
        }
        get folder() {
            return this.a;
        }
        set folder(folder) {
            this.a = folder;
            this.N();
        }
        setCount(settingsTarget, count) {
            const workspaceFolder = this.y.getWorkspaceFolder(settingsTarget);
            if (!workspaceFolder) {
                throw new Error('unknown folder');
            }
            const folder = workspaceFolder.uri;
            this.b.set(folder.toString(), count);
            this.N();
        }
        render(container) {
            this.element = container;
            this.c = container;
            this.h = DOM.$('.action-title');
            this.r = DOM.$('.action-details');
            this.s = DOM.$('.dropdown-icon.hide' + themables_1.ThemeIcon.asCSSSelector(preferencesIcons_1.$UBb));
            this.g = DOM.$('a.action-label.folder-settings', {
                role: 'button',
                'aria-haspopup': 'true',
                'tabindex': '0'
            }, this.h, this.r, this.s);
            this.B(DOM.$nO(this.g, DOM.$3O.MOUSE_DOWN, e => DOM.$5O.stop(e)));
            this.B(DOM.$nO(this.g, DOM.$3O.CLICK, e => this.onClick(e)));
            this.B(DOM.$nO(this.c, DOM.$3O.KEY_UP, e => this.I(e)));
            DOM.$0O(this.c, this.g);
            this.N();
        }
        I(event) {
            const keyboardEvent = new keyboardEvent_1.$jO(event);
            switch (keyboardEvent.keyCode) {
                case 3 /* KeyCode.Enter */:
                case 10 /* KeyCode.Space */:
                    this.onClick(event);
                    return;
            }
        }
        onClick(event) {
            DOM.$5O.stop(event, true);
            if (!this.folder || this._action.checked) {
                this.O();
            }
            else {
                this._action.run(this.a);
            }
        }
        u() {
            this.N();
        }
        G() {
            this.N();
        }
        M() {
            const oldFolder = this.a;
            const workspace = this.y.getWorkspace();
            if (oldFolder) {
                this.a = workspace.folders.filter(folder => (0, resources_1.$bg)(folder.uri, oldFolder.uri))[0] || workspace.folders[0];
            }
            this.a = this.a ? this.a : workspace.folders.length === 1 ? workspace.folders[0] : null;
            this.N();
            if (this._action.checked) {
                this._action.run(this.a);
            }
        }
        N() {
            let total = 0;
            this.b.forEach(n => total += n);
            const workspace = this.y.getWorkspace();
            if (this.a) {
                this.h.textContent = this.a.name;
                this.g.title = this.a.name;
                const detailsText = this.Q(this._action.label, total);
                this.r.textContent = detailsText;
                this.s.classList.toggle('hide', workspace.folders.length === 1 || !this._action.checked);
            }
            else {
                const labelText = this.Q(this._action.label, total);
                this.h.textContent = labelText;
                this.r.textContent = '';
                this.g.title = this._action.label;
                this.s.classList.remove('hide');
            }
            this.g.classList.toggle('checked', this._action.checked);
            this.c.classList.toggle('disabled', !this._action.enabled);
        }
        O() {
            this.H.showContextMenu({
                getAnchor: () => this.c,
                getActions: () => this.P(),
                getActionViewItem: () => undefined,
                onHide: () => {
                    this.g.blur();
                }
            });
        }
        P() {
            const actions = [];
            const workspaceFolders = this.y.getWorkspace().folders;
            if (this.y.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */ && workspaceFolders.length > 0) {
                actions.push(...workspaceFolders.map((folder, index) => {
                    const folderCount = this.b.get(folder.uri.toString());
                    return {
                        id: 'folderSettingsTarget' + index,
                        label: this.Q(folder.name, folderCount),
                        checked: this.folder && (0, resources_1.$bg)(this.folder.uri, folder.uri),
                        enabled: true,
                        run: () => this._action.run(folder)
                    };
                }));
            }
            return actions;
        }
        Q(label, count) {
            // Append the count if it's >0 and not undefined
            if (count) {
                label += ` (${count})`;
            }
            return label;
        }
    };
    exports.$7Bb = $7Bb;
    exports.$7Bb = $7Bb = __decorate([
        __param(1, workspace_1.$Kh),
        __param(2, contextView_1.$WZ)
    ], $7Bb);
    let $8Bb = class $8Bb extends widget_1.$IP {
        constructor(parent, options, y, J, L, M, N) {
            super();
            this.y = y;
            this.J = J;
            this.L = L;
            this.M = M;
            this.N = N;
            this.t = null;
            this.w = this.B(new event_1.$fd());
            this.onDidTargetChange = this.w.event;
            this.s = options ?? {};
            this.P(parent);
            this.B(this.y.onDidChangeWorkbenchState(() => this.Q()));
            this.B(this.y.onDidChangeWorkspaceFolders(() => this.R()));
        }
        O() {
            const remoteAuthority = this.L.remoteAuthority;
            const hostLabel = remoteAuthority && this.M.getHostLabel(network_1.Schemas.vscodeRemote, remoteAuthority);
            this.b.label = (0, nls_1.localize)(0, null);
            this.c.label = (0, nls_1.localize)(1, null) + (hostLabel ? ` [${hostLabel}]` : '');
            this.g.label = (0, nls_1.localize)(2, null);
            this.h.label = (0, nls_1.localize)(3, null);
        }
        P(parent) {
            const settingsTabsWidget = DOM.$0O(parent, DOM.$('.settings-tabs-widget'));
            this.a = this.B(new actionbar_1.$1P(settingsTabsWidget, {
                orientation: 0 /* ActionsOrientation.HORIZONTAL */,
                focusOnlyEnabledItems: true,
                ariaLabel: (0, nls_1.localize)(4, null),
                animated: false,
                actionViewItemProvider: (action) => action.id === 'folderSettings' ? this.r : undefined
            }));
            this.b = new actions_1.$gi('userSettings', '', '.settings-tab', true, () => this.updateTarget(3 /* ConfigurationTarget.USER_LOCAL */));
            this.b.tooltip = (0, nls_1.localize)(5, null);
            this.c = new actions_1.$gi('userSettingsRemote', '', '.settings-tab', true, () => this.updateTarget(4 /* ConfigurationTarget.USER_REMOTE */));
            const remoteAuthority = this.L.remoteAuthority;
            const hostLabel = remoteAuthority && this.M.getHostLabel(network_1.Schemas.vscodeRemote, remoteAuthority);
            this.c.tooltip = (0, nls_1.localize)(6, null) + (hostLabel ? ` [${hostLabel}]` : '');
            this.g = new actions_1.$gi('workspaceSettings', '', '.settings-tab', false, () => this.updateTarget(5 /* ConfigurationTarget.WORKSPACE */));
            this.h = new actions_1.$gi('folderSettings', '', '.settings-tab', false, async (folder) => {
                this.updateTarget((0, workspace_1.$Th)(folder) ? folder.uri : 3 /* ConfigurationTarget.USER_LOCAL */);
            });
            this.r = this.J.createInstance($7Bb, this.h);
            this.O();
            this.R();
            this.a.push([this.b, this.c, this.g, this.h]);
        }
        get settingsTarget() {
            return this.t;
        }
        set settingsTarget(settingsTarget) {
            this.t = settingsTarget;
            this.b.checked = 3 /* ConfigurationTarget.USER_LOCAL */ === this.settingsTarget;
            this.c.checked = 4 /* ConfigurationTarget.USER_REMOTE */ === this.settingsTarget;
            this.g.checked = 5 /* ConfigurationTarget.WORKSPACE */ === this.settingsTarget;
            if (this.settingsTarget instanceof uri_1.URI) {
                this.r.action.checked = true;
                this.r.folder = this.y.getWorkspaceFolder(this.settingsTarget);
            }
            else {
                this.r.action.checked = false;
            }
        }
        setResultCount(settingsTarget, count) {
            if (settingsTarget === 5 /* ConfigurationTarget.WORKSPACE */) {
                let label = (0, nls_1.localize)(7, null);
                if (count) {
                    label += ` (${count})`;
                }
                this.g.label = label;
            }
            else if (settingsTarget === 3 /* ConfigurationTarget.USER_LOCAL */) {
                let label = (0, nls_1.localize)(8, null);
                if (count) {
                    label += ` (${count})`;
                }
                this.b.label = label;
            }
            else if (settingsTarget instanceof uri_1.URI) {
                this.r.setCount(settingsTarget, count);
            }
        }
        updateLanguageFilterIndicators(filter) {
            this.O();
            if (filter) {
                const languageToUse = this.N.getLanguageName(filter);
                if (languageToUse) {
                    const languageSuffix = ` [${languageToUse}]`;
                    this.b.label += languageSuffix;
                    this.c.label += languageSuffix;
                    this.g.label += languageSuffix;
                    this.h.label += languageSuffix;
                }
            }
        }
        Q() {
            this.r.folder = null;
            this.R();
            if (this.settingsTarget === 5 /* ConfigurationTarget.WORKSPACE */ && this.y.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
                this.updateTarget(3 /* ConfigurationTarget.USER_LOCAL */);
            }
        }
        updateTarget(settingsTarget) {
            const isSameTarget = this.settingsTarget === settingsTarget ||
                settingsTarget instanceof uri_1.URI &&
                    this.settingsTarget instanceof uri_1.URI &&
                    (0, resources_1.$bg)(this.settingsTarget, settingsTarget);
            if (!isSameTarget) {
                this.settingsTarget = settingsTarget;
                this.w.fire(this.settingsTarget);
            }
            return Promise.resolve(undefined);
        }
        async R() {
            this.a.domNode.classList.toggle('empty-workbench', this.y.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */);
            this.c.enabled = !!(this.s.enableRemoteSettings && this.L.remoteAuthority);
            this.g.enabled = this.y.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */;
            this.r.action.enabled = this.y.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */ && this.y.getWorkspace().folders.length > 0;
            this.g.tooltip = (0, nls_1.localize)(9, null);
        }
    };
    exports.$8Bb = $8Bb;
    exports.$8Bb = $8Bb = __decorate([
        __param(2, workspace_1.$Kh),
        __param(3, instantiation_1.$Ah),
        __param(4, environmentService_1.$hJ),
        __param(5, label_1.$Vz),
        __param(6, language_1.$ct)
    ], $8Bb);
    let $9Bb = class $9Bb extends widget_1.$IP {
        constructor(parent, s, t, w, y, J) {
            super();
            this.s = s;
            this.t = t;
            this.w = w;
            this.y = y;
            this.J = J;
            this.h = this.B(new event_1.$fd());
            this.onDidChange = this.h.event;
            this.r = this.B(new event_1.$fd());
            this.onFocus = this.r.event;
            this.L(parent);
        }
        L(parent) {
            this.domNode = DOM.$0O(parent, DOM.$('div.settings-header-widget'));
            this.M(DOM.$0O(this.domNode, DOM.$('div.settings-search-container')));
            this.g = DOM.$0O(this.domNode, DOM.$('div.settings-search-controls'));
            if (this.s.showResultCount) {
                this.a = DOM.$0O(this.g, DOM.$('.settings-count-widget'));
                this.a.style.backgroundColor = (0, colorRegistry_1.$pv)(colorRegistry_1.$dw);
                this.a.style.color = (0, colorRegistry_1.$pv)(colorRegistry_1.$ew);
                this.a.style.border = `1px solid ${(0, colorRegistry_1.$pv)(colorRegistry_1.$Av)}`;
            }
            this.inputBox.inputElement.setAttribute('aria-live', this.s.ariaLive || 'off');
            if (this.s.ariaLabelledBy) {
                this.inputBox.inputElement.setAttribute('aria-labelledBy', this.s.ariaLabelledBy);
            }
            const focusTracker = this.B(DOM.$8O(this.inputBox.inputElement));
            this.B(focusTracker.onDidFocus(() => this.r.fire()));
            const focusKey = this.s.focusKey;
            if (focusKey) {
                this.B(focusTracker.onDidFocus(() => focusKey.set(true)));
                this.B(focusTracker.onDidBlur(() => focusKey.set(false)));
            }
        }
        M(searchContainer) {
            this.b = searchContainer;
            const searchInput = DOM.$0O(this.b, DOM.$('div.settings-search-input'));
            this.inputBox = this.B(this.N(searchInput));
            this.B(this.inputBox.onDidChange(value => this.h.fire(value)));
        }
        N(parent) {
            const showHistoryHint = () => (0, historyWidgetKeybindingHint_1.$L7)(this.J);
            const box = this.B(new contextScopedHistoryWidget_1.$S5(parent, this.t, { ...this.s, showHistoryHint }, this.y));
            return box;
        }
        showMessage(message) {
            // Avoid setting the aria-label unnecessarily, the screenreader will read the count every time it's set, since it's aria-live:assertive. #50968
            if (this.a && message !== this.a.textContent) {
                this.a.textContent = message;
                this.inputBox.inputElement.setAttribute('aria-label', message);
                this.inputBox.inputElement.style.paddingRight = this.O() + 'px';
            }
        }
        layout(dimension) {
            if (dimension.width < 400) {
                this.a?.classList.add('hide');
                this.inputBox.inputElement.style.paddingRight = '0px';
            }
            else {
                this.a?.classList.remove('hide');
                this.inputBox.inputElement.style.paddingRight = this.O() + 'px';
            }
        }
        O() {
            const countWidth = this.a ? DOM.$HO(this.a) : 0;
            return countWidth + 20;
        }
        focus() {
            this.inputBox.focus();
            if (this.getValue()) {
                this.inputBox.select();
            }
        }
        hasFocus() {
            return this.inputBox.hasFocus();
        }
        clear() {
            this.inputBox.value = '';
        }
        getValue() {
            return this.inputBox.value;
        }
        setValue(value) {
            return this.inputBox.value = value;
        }
        dispose() {
            this.s.focusKey?.set(false);
            super.dispose();
        }
    };
    exports.$9Bb = $9Bb;
    exports.$9Bb = $9Bb = __decorate([
        __param(2, contextView_1.$VZ),
        __param(3, instantiation_1.$Ah),
        __param(4, contextkey_1.$3i),
        __param(5, keybinding_1.$2D)
    ], $9Bb);
    class $0Bb extends lifecycle_1.$kc {
        constructor(g) {
            super();
            this.g = g;
            this.a = -1;
            this.b = [];
            this.c = this.g.createDecorationsCollection();
            this.f = this.B(new event_1.$fd());
            this.onClick = this.f.event;
            this.B(this.g.onMouseDown((e) => {
                if (e.target.type !== 2 /* MouseTargetType.GUTTER_GLYPH_MARGIN */ || e.target.detail.isAfterLines || !this.isVisible()) {
                    return;
                }
                this.f.fire(e);
            }));
        }
        get preferences() {
            return this.b;
        }
        getLine() {
            return this.a;
        }
        show(line, hoverMessage, preferences) {
            this.b = preferences;
            const newDecoration = [];
            this.a = line;
            newDecoration.push({
                options: {
                    description: 'edit-preference-widget-decoration',
                    glyphMarginClassName: themables_1.ThemeIcon.asClassName(preferencesIcons_1.$1Bb),
                    glyphMarginHoverMessage: new htmlContent_1.$Xj().appendText(hoverMessage),
                    stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
                },
                range: {
                    startLineNumber: line,
                    startColumn: 1,
                    endLineNumber: line,
                    endColumn: 1
                }
            });
            this.c.set(newDecoration);
        }
        hide() {
            this.c.clear();
        }
        isVisible() {
            return this.c.length > 0;
        }
        dispose() {
            this.hide();
            super.dispose();
        }
    }
    exports.$0Bb = $0Bb;
});
//# sourceMappingURL=preferencesWidgets.js.map