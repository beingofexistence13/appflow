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
define(["require", "exports", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/terminalContrib/links/browser/terminal.links.contribution", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/accessibility/browser/accessibilityConfiguration", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/terminalActions", "vs/workbench/contrib/terminal/browser/terminalExtensions", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/workbench/contrib/terminal/common/terminalStrings", "vs/workbench/contrib/terminalContrib/links/browser/links", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkManager", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkProviderService", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkQuickpick", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkResolver"], function (require, exports, lifecycle_1, nls_1, contextkey_1, extensions_1, instantiation_1, accessibilityConfiguration_1, terminal_1, terminalActions_1, terminalExtensions_1, terminal_2, terminalContextKey_1, terminalStrings_1, links_1, terminalLinkManager_1, terminalLinkProviderService_1, terminalLinkQuickpick_1, terminalLinkResolver_1) {
    "use strict";
    var TerminalLinkContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, extensions_1.$mr)(links_1.$2kb, terminalLinkProviderService_1.$WWb, 1 /* InstantiationType.Delayed */);
    let TerminalLinkContribution = class TerminalLinkContribution extends lifecycle_1.$jc {
        static { TerminalLinkContribution_1 = this; }
        static { this.ID = 'terminal.link'; }
        static get(instance) {
            return instance.getContribution(TerminalLinkContribution_1.ID);
        }
        get linkManager() { return this.a; }
        constructor(h, j, m, n, q) {
            super();
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.q = q;
            this.c = this.n.createInstance(terminalLinkResolver_1.$YWb);
        }
        xtermReady(xterm) {
            const linkManager = this.n.createInstance(terminalLinkManager_1.$VWb, xterm.raw, this.j, this.h.capabilities, this.c);
            if ((0, terminal_2.$IM)(this.j)) {
                this.j.onProcessReady(() => {
                    linkManager.setWidgetManager(this.m);
                });
            }
            else {
                linkManager.setWidgetManager(this.m);
            }
            this.a = this.add(linkManager);
            // Attach the link provider(s) to the instance and listen for changes
            if (!(0, terminal_1.$Qib)(this.h)) {
                for (const linkProvider of this.q.linkProviders) {
                    this.a.registerExternalLinkProvider(linkProvider.provideLinks.bind(linkProvider, this.h));
                }
                this.add(this.q.onDidAddLinkProvider(e => {
                    linkManager.registerExternalLinkProvider(e.provideLinks.bind(e, this.h));
                }));
            }
            // TODO: Currently only a single link provider is supported; the one registered by the ext host
            this.add(this.q.onDidRemoveLinkProvider(e => {
                linkManager.dispose();
                this.xtermReady(xterm);
            }));
        }
        async showLinkQuickpick(extended) {
            if (!this.b) {
                this.b = this.add(this.n.createInstance(terminalLinkQuickpick_1.$XWb));
                this.b.onDidRequestMoreLinks(() => {
                    this.showLinkQuickpick(true);
                });
            }
            const links = await this.r();
            return await this.b.show(links);
        }
        async r() {
            if (!this.a) {
                throw new Error('terminal links are not ready, cannot generate link quick pick');
            }
            return this.a.getLinks();
        }
        async openRecentLink(type) {
            if (!this.a) {
                throw new Error('terminal links are not ready, cannot open a link');
            }
            this.a.openRecentLink(type);
        }
    };
    TerminalLinkContribution = TerminalLinkContribution_1 = __decorate([
        __param(3, instantiation_1.$Ah),
        __param(4, links_1.$2kb)
    ], TerminalLinkContribution);
    (0, terminalExtensions_1.$BKb)(TerminalLinkContribution.ID, TerminalLinkContribution, true);
    const category = terminalStrings_1.$pVb.actionCategory;
    (0, terminalActions_1.$IVb)({
        id: "workbench.action.terminal.openDetectedLink" /* TerminalCommandId.OpenDetectedLink */,
        title: { value: (0, nls_1.localize)(0, null), original: 'Open Detected Link...' },
        f1: true,
        category,
        precondition: terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated,
        keybinding: [{
                primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 45 /* KeyCode.KeyO */,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
                when: terminalContextKey_1.TerminalContextKeys.focus
            }, {
                primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 37 /* KeyCode.KeyG */,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
                when: contextkey_1.$Ii.and(accessibilityConfiguration_1.$jqb, contextkey_1.$Ii.equals(accessibilityConfiguration_1.$oqb.key, "terminal" /* AccessibleViewProviderId.Terminal */))
            },
        ],
        run: (activeInstance) => TerminalLinkContribution.get(activeInstance)?.showLinkQuickpick()
    });
    (0, terminalActions_1.$IVb)({
        id: "workbench.action.terminal.openUrlLink" /* TerminalCommandId.OpenWebLink */,
        title: { value: (0, nls_1.localize)(1, null), original: 'Open Last URL Link' },
        f1: true,
        category,
        precondition: terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated,
        run: (activeInstance) => TerminalLinkContribution.get(activeInstance)?.openRecentLink('url')
    });
    (0, terminalActions_1.$IVb)({
        id: "workbench.action.terminal.openFileLink" /* TerminalCommandId.OpenFileLink */,
        title: { value: (0, nls_1.localize)(2, null), original: 'Open Last Local File Link' },
        f1: true,
        category,
        precondition: terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated,
        run: (activeInstance) => TerminalLinkContribution.get(activeInstance)?.openRecentLink('localFile')
    });
});
//# sourceMappingURL=terminal.links.contribution.js.map