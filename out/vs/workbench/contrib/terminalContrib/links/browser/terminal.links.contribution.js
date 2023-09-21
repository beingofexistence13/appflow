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
define(["require", "exports", "vs/base/common/lifecycle", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/accessibility/browser/accessibilityConfiguration", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/terminalActions", "vs/workbench/contrib/terminal/browser/terminalExtensions", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/workbench/contrib/terminal/common/terminalStrings", "vs/workbench/contrib/terminalContrib/links/browser/links", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkManager", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkProviderService", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkQuickpick", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkResolver"], function (require, exports, lifecycle_1, nls_1, contextkey_1, extensions_1, instantiation_1, accessibilityConfiguration_1, terminal_1, terminalActions_1, terminalExtensions_1, terminal_2, terminalContextKey_1, terminalStrings_1, links_1, terminalLinkManager_1, terminalLinkProviderService_1, terminalLinkQuickpick_1, terminalLinkResolver_1) {
    "use strict";
    var TerminalLinkContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, extensions_1.registerSingleton)(links_1.ITerminalLinkProviderService, terminalLinkProviderService_1.TerminalLinkProviderService, 1 /* InstantiationType.Delayed */);
    let TerminalLinkContribution = class TerminalLinkContribution extends lifecycle_1.DisposableStore {
        static { TerminalLinkContribution_1 = this; }
        static { this.ID = 'terminal.link'; }
        static get(instance) {
            return instance.getContribution(TerminalLinkContribution_1.ID);
        }
        get linkManager() { return this._linkManager; }
        constructor(_instance, _processManager, _widgetManager, _instantiationService, _terminalLinkProviderService) {
            super();
            this._instance = _instance;
            this._processManager = _processManager;
            this._widgetManager = _widgetManager;
            this._instantiationService = _instantiationService;
            this._terminalLinkProviderService = _terminalLinkProviderService;
            this._linkResolver = this._instantiationService.createInstance(terminalLinkResolver_1.TerminalLinkResolver);
        }
        xtermReady(xterm) {
            const linkManager = this._instantiationService.createInstance(terminalLinkManager_1.TerminalLinkManager, xterm.raw, this._processManager, this._instance.capabilities, this._linkResolver);
            if ((0, terminal_2.isTerminalProcessManager)(this._processManager)) {
                this._processManager.onProcessReady(() => {
                    linkManager.setWidgetManager(this._widgetManager);
                });
            }
            else {
                linkManager.setWidgetManager(this._widgetManager);
            }
            this._linkManager = this.add(linkManager);
            // Attach the link provider(s) to the instance and listen for changes
            if (!(0, terminal_1.isDetachedTerminalInstance)(this._instance)) {
                for (const linkProvider of this._terminalLinkProviderService.linkProviders) {
                    this._linkManager.registerExternalLinkProvider(linkProvider.provideLinks.bind(linkProvider, this._instance));
                }
                this.add(this._terminalLinkProviderService.onDidAddLinkProvider(e => {
                    linkManager.registerExternalLinkProvider(e.provideLinks.bind(e, this._instance));
                }));
            }
            // TODO: Currently only a single link provider is supported; the one registered by the ext host
            this.add(this._terminalLinkProviderService.onDidRemoveLinkProvider(e => {
                linkManager.dispose();
                this.xtermReady(xterm);
            }));
        }
        async showLinkQuickpick(extended) {
            if (!this._terminalLinkQuickpick) {
                this._terminalLinkQuickpick = this.add(this._instantiationService.createInstance(terminalLinkQuickpick_1.TerminalLinkQuickpick));
                this._terminalLinkQuickpick.onDidRequestMoreLinks(() => {
                    this.showLinkQuickpick(true);
                });
            }
            const links = await this._getLinks();
            return await this._terminalLinkQuickpick.show(links);
        }
        async _getLinks() {
            if (!this._linkManager) {
                throw new Error('terminal links are not ready, cannot generate link quick pick');
            }
            return this._linkManager.getLinks();
        }
        async openRecentLink(type) {
            if (!this._linkManager) {
                throw new Error('terminal links are not ready, cannot open a link');
            }
            this._linkManager.openRecentLink(type);
        }
    };
    TerminalLinkContribution = TerminalLinkContribution_1 = __decorate([
        __param(3, instantiation_1.IInstantiationService),
        __param(4, links_1.ITerminalLinkProviderService)
    ], TerminalLinkContribution);
    (0, terminalExtensions_1.registerTerminalContribution)(TerminalLinkContribution.ID, TerminalLinkContribution, true);
    const category = terminalStrings_1.terminalStrings.actionCategory;
    (0, terminalActions_1.registerActiveInstanceAction)({
        id: "workbench.action.terminal.openDetectedLink" /* TerminalCommandId.OpenDetectedLink */,
        title: { value: (0, nls_1.localize)('workbench.action.terminal.openDetectedLink', "Open Detected Link..."), original: 'Open Detected Link...' },
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
                when: contextkey_1.ContextKeyExpr.and(accessibilityConfiguration_1.accessibleViewIsShown, contextkey_1.ContextKeyExpr.equals(accessibilityConfiguration_1.accessibleViewCurrentProviderId.key, "terminal" /* AccessibleViewProviderId.Terminal */))
            },
        ],
        run: (activeInstance) => TerminalLinkContribution.get(activeInstance)?.showLinkQuickpick()
    });
    (0, terminalActions_1.registerActiveInstanceAction)({
        id: "workbench.action.terminal.openUrlLink" /* TerminalCommandId.OpenWebLink */,
        title: { value: (0, nls_1.localize)('workbench.action.terminal.openLastUrlLink', "Open Last URL Link"), original: 'Open Last URL Link' },
        f1: true,
        category,
        precondition: terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated,
        run: (activeInstance) => TerminalLinkContribution.get(activeInstance)?.openRecentLink('url')
    });
    (0, terminalActions_1.registerActiveInstanceAction)({
        id: "workbench.action.terminal.openFileLink" /* TerminalCommandId.OpenFileLink */,
        title: { value: (0, nls_1.localize)('workbench.action.terminal.openLastLocalFileLink', "Open Last Local File Link"), original: 'Open Last Local File Link' },
        f1: true,
        category,
        precondition: terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated,
        run: (activeInstance) => TerminalLinkContribution.get(activeInstance)?.openRecentLink('localFile')
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWwubGlua3MuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWxDb250cmliL2xpbmtzL2Jyb3dzZXIvdGVybWluYWwubGlua3MuY29udHJpYnV0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXdCaEcsSUFBQSw4QkFBaUIsRUFBQyxvQ0FBNEIsRUFBRSx5REFBMkIsb0NBQTRCLENBQUM7SUFFeEcsSUFBTSx3QkFBd0IsR0FBOUIsTUFBTSx3QkFBeUIsU0FBUSwyQkFBZTs7aUJBQ3JDLE9BQUUsR0FBRyxlQUFlLEFBQWxCLENBQW1CO1FBRXJDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBMkI7WUFDckMsT0FBTyxRQUFRLENBQUMsZUFBZSxDQUEyQiwwQkFBd0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN4RixDQUFDO1FBR0QsSUFBSSxXQUFXLEtBQXNDLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFLaEYsWUFDa0IsU0FBd0QsRUFDeEQsZUFBK0QsRUFDL0QsY0FBcUMsRUFDZCxxQkFBNEMsRUFDckMsNEJBQTBEO1lBRXpHLEtBQUssRUFBRSxDQUFDO1lBTlMsY0FBUyxHQUFULFNBQVMsQ0FBK0M7WUFDeEQsb0JBQWUsR0FBZixlQUFlLENBQWdEO1lBQy9ELG1CQUFjLEdBQWQsY0FBYyxDQUF1QjtZQUNkLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDckMsaUNBQTRCLEdBQTVCLDRCQUE0QixDQUE4QjtZQUd6RyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxjQUFjLENBQUMsMkNBQW9CLENBQUMsQ0FBQztRQUN0RixDQUFDO1FBRUQsVUFBVSxDQUFDLEtBQWlEO1lBQzNELE1BQU0sV0FBVyxHQUFH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