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
define(["require", "exports", "vs/nls!vs/workbench/contrib/debug/browser/debugActionViewItems", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/selectBox/selectBox", "vs/platform/configuration/common/configuration", "vs/platform/commands/common/commands", "vs/workbench/contrib/debug/common/debug", "vs/base/common/themables", "vs/platform/theme/common/colorRegistry", "vs/platform/contextview/browser/contextView", "vs/platform/workspace/common/workspace", "vs/base/common/lifecycle", "vs/workbench/contrib/debug/browser/debugCommands", "vs/base/browser/ui/actionbar/actionViewItems", "vs/workbench/contrib/debug/browser/debugIcons", "vs/platform/keybinding/common/keybinding", "vs/platform/theme/browser/defaultStyles"], function (require, exports, nls, dom, keyboardEvent_1, selectBox_1, configuration_1, commands_1, debug_1, themables_1, colorRegistry_1, contextView_1, workspace_1, lifecycle_1, debugCommands_1, actionViewItems_1, debugIcons_1, keybinding_1, defaultStyles_1) {
    "use strict";
    var $cRb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$dRb = exports.$cRb = void 0;
    const $ = dom.$;
    let $cRb = class $cRb extends actionViewItems_1.$MQ {
        static { $cRb_1 = this; }
        static { this.a = '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500'; }
        constructor(H, action, I, J, L, M, contextViewService, N) {
            super(H, action);
            this.H = H;
            this.I = I;
            this.J = J;
            this.L = L;
            this.M = M;
            this.N = N;
            this.h = [];
            this.r = 0;
            this.y = [];
            this.n = [];
            this.g = new selectBox_1.$HQ([], -1, contextViewService, defaultStyles_1.$B2, { ariaLabel: nls.localize(0, null) });
            this.g.setFocusable(false);
            this.n.push(this.g);
            this.O();
        }
        O() {
            this.n.push(this.J.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('launch')) {
                    this.P();
                }
            }));
            this.n.push(this.I.getConfigurationManager().onDidSelectConfiguration(() => {
                this.P();
            }));
        }
        render(container) {
            this.b = container;
            container.classList.add('start-debug-action-item');
            this.c = dom.$0O(container, $(themables_1.ThemeIcon.asCSSSelector(debugIcons_1.$lnb)));
            const keybinding = this.N.lookupKeybinding(this.action.id)?.getLabel();
            const keybindingLabel = keybinding ? ` (${keybinding})` : '';
            this.c.title = this.action.label + keybindingLabel;
            this.c.setAttribute('role', 'button');
            this.c.ariaLabel = this.c.title;
            this.n.push(dom.$nO(this.c, dom.$3O.CLICK, () => {
                this.c.blur();
                if (this.I.state !== 1 /* State.Initializing */) {
                    this.actionRunner.run(this.action, this.H);
                }
            }));
            this.n.push(dom.$nO(this.c, dom.$3O.MOUSE_DOWN, (e) => {
                if (this.action.enabled && e.button === 0) {
                    this.c.classList.add('active');
                }
            }));
            this.n.push(dom.$nO(this.c, dom.$3O.MOUSE_UP, () => {
                this.c.classList.remove('active');
            }));
            this.n.push(dom.$nO(this.c, dom.$3O.MOUSE_OUT, () => {
                this.c.classList.remove('active');
            }));
            this.n.push(dom.$nO(this.c, dom.$3O.KEY_DOWN, (e) => {
                const event = new keyboardEvent_1.$jO(e);
                if (event.equals(17 /* KeyCode.RightArrow */)) {
                    this.c.tabIndex = -1;
                    this.g.focus();
                    event.stopPropagation();
                }
            }));
            this.n.push(this.g.onDidSelect(async (e) => {
                const target = this.h[e.index];
                const shouldBeSelected = target.handler ? await target.handler() : false;
                if (shouldBeSelected) {
                    this.r = e.index;
                }
                else {
                    // Some select options should not remain selected https://github.com/microsoft/vscode/issues/31526
                    this.g.select(this.r);
                }
            }));
            const selectBoxContainer = $('.configuration');
            this.g.render(dom.$0O(container, selectBoxContainer));
            this.n.push(dom.$nO(selectBoxContainer, dom.$3O.KEY_DOWN, (e) => {
                const event = new keyboardEvent_1.$jO(e);
                if (event.equals(15 /* KeyCode.LeftArrow */)) {
                    this.g.setFocusable(false);
                    this.c.tabIndex = 0;
                    this.c.focus();
                    event.stopPropagation();
                }
            }));
            this.b.style.border = `1px solid ${(0, colorRegistry_1.$pv)(colorRegistry_1.$7v)}`;
            selectBoxContainer.style.borderLeft = `1px solid ${(0, colorRegistry_1.$pv)(colorRegistry_1.$7v)}`;
            this.b.style.backgroundColor = (0, colorRegistry_1.$pv)(colorRegistry_1.$4v);
            this.I.getConfigurationManager().getDynamicProviders().then(providers => {
                this.y = providers;
                if (this.y.length > 0) {
                    this.P();
                }
            });
            this.P();
        }
        setActionContext(context) {
            this.H = context;
        }
        isEnabled() {
            return true;
        }
        focus(fromRight) {
            if (fromRight) {
                this.g.focus();
            }
            else {
                this.c.tabIndex = 0;
                this.c.focus();
            }
        }
        blur() {
            this.c.tabIndex = -1;
            this.g.blur();
            this.b.blur();
        }
        setFocusable(focusable) {
            if (focusable) {
                this.c.tabIndex = 0;
            }
            else {
                this.c.tabIndex = -1;
                this.g.setFocusable(false);
            }
        }
        dispose() {
            this.n = (0, lifecycle_1.$fc)(this.n);
        }
        P() {
            this.r = 0;
            this.h = [];
            const manager = this.I.getConfigurationManager();
            const inWorkspace = this.M.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */;
            let lastGroup;
            const disabledIdxs = [];
            manager.getAllConfigurations().forEach(({ launch, name, presentation }) => {
                if (lastGroup !== presentation?.group) {
                    lastGroup = presentation?.group;
                    if (this.h.length) {
                        this.h.push({ label: $cRb_1.a, handler: () => Promise.resolve(false) });
                        disabledIdxs.push(this.h.length - 1);
                    }
                }
                if (name === manager.selectedConfiguration.name && launch === manager.selectedConfiguration.launch) {
                    this.r = this.h.length;
                }
                const label = inWorkspace ? `${name} (${launch.name})` : name;
                this.h.push({
                    label, handler: async () => {
                        await manager.selectConfiguration(launch, name);
                        return true;
                    }
                });
            });
            // Only take 3 elements from the recent dynamic configurations to not clutter the dropdown
            manager.getRecentDynamicConfigurations().slice(0, 3).forEach(({ name, type }) => {
                if (type === manager.selectedConfiguration.type && manager.selectedConfiguration.name === name) {
                    this.r = this.h.length;
                }
                this.h.push({
                    label: name,
                    handler: async () => {
                        await manager.selectConfiguration(undefined, name, undefined, { type });
                        return true;
                    }
                });
            });
            if (this.h.length === 0) {
                this.h.push({ label: nls.localize(1, null), handler: async () => false });
            }
            this.h.push({ label: $cRb_1.a, handler: () => Promise.resolve(false) });
            disabledIdxs.push(this.h.length - 1);
            this.y.forEach(p => {
                this.h.push({
                    label: `${p.label}...`,
                    handler: async () => {
                        const picked = await p.pick();
                        if (picked) {
                            await manager.selectConfiguration(picked.launch, picked.config.name, picked.config, { type: p.type });
                            return true;
                        }
                        return false;
                    }
                });
            });
            manager.getLaunches().filter(l => !l.hidden).forEach(l => {
                const label = inWorkspace ? nls.localize(2, null, l.name) : nls.localize(3, null);
                this.h.push({
                    label, handler: async () => {
                        await this.L.executeCommand(debugCommands_1.$dQb, l.uri.toString());
                        return false;
                    }
                });
            });
            this.g.setOptions(this.h.map((data, index) => ({ text: data.label, isDisabled: disabledIdxs.indexOf(index) !== -1 })), this.r);
        }
    };
    exports.$cRb = $cRb;
    exports.$cRb = $cRb = $cRb_1 = __decorate([
        __param(2, debug_1.$nH),
        __param(3, configuration_1.$8h),
        __param(4, commands_1.$Fr),
        __param(5, workspace_1.$Kh),
        __param(6, contextView_1.$VZ),
        __param(7, keybinding_1.$2D)
    ], $cRb);
    let $dRb = class $dRb extends actionViewItems_1.$OQ {
        constructor(action, session, a, contextViewService, y) {
            super(null, action, [], -1, contextViewService, defaultStyles_1.$B2, { ariaLabel: nls.localize(4, null) });
            this.a = a;
            this.y = y;
            this.B(this.a.getViewModel().onDidFocusSession(() => {
                const session = this.J();
                if (session) {
                    const index = this.L().indexOf(session);
                    this.select(index);
                }
            }));
            this.B(this.a.onDidNewSession(session => {
                const sessionListeners = [];
                sessionListeners.push(session.onDidChangeName(() => this.I()));
                sessionListeners.push(session.onDidEndAdapter(() => (0, lifecycle_1.$fc)(sessionListeners)));
                this.I();
            }));
            this.L().forEach(session => {
                this.B(session.onDidChangeName(() => this.I()));
            });
            this.B(this.a.onDidEndSession(() => this.I()));
            const selectedSession = session ? this.M(session) : undefined;
            this.I(selectedSession);
        }
        r(_, index) {
            return this.L()[index];
        }
        I(session) {
            if (!session) {
                session = this.J();
            }
            const sessions = this.L();
            const names = sessions.map(s => {
                const label = s.getLabel();
                if (s.parentSession) {
                    // Indent child sessions so they look like children
                    return `\u00A0\u00A0${label}`;
                }
                return label;
            });
            this.setOptions(names.map(data => ({ text: data })), session ? sessions.indexOf(session) : undefined);
        }
        J() {
            const session = this.a.getViewModel().focusedSession;
            return session ? this.M(session) : undefined;
        }
        L() {
            const showSubSessions = this.y.getValue('debug').showSubSessionsInToolBar;
            const sessions = this.a.getModel().getSessions();
            return showSubSessions ? sessions : sessions.filter(s => !s.parentSession);
        }
        M(focusedSession) {
            const showSubSessions = this.y.getValue('debug').showSubSessionsInToolBar;
            while (focusedSession.parentSession && !showSubSessions) {
                focusedSession = focusedSession.parentSession;
            }
            return focusedSession;
        }
    };
    exports.$dRb = $dRb;
    exports.$dRb = $dRb = __decorate([
        __param(2, debug_1.$nH),
        __param(3, contextView_1.$VZ),
        __param(4, configuration_1.$8h)
    ], $dRb);
});
//# sourceMappingURL=debugActionViewItems.js.map