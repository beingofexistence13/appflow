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
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/selectBox/selectBox", "vs/platform/configuration/common/configuration", "vs/platform/commands/common/commands", "vs/workbench/contrib/debug/common/debug", "vs/base/common/themables", "vs/platform/theme/common/colorRegistry", "vs/platform/contextview/browser/contextView", "vs/platform/workspace/common/workspace", "vs/base/common/lifecycle", "vs/workbench/contrib/debug/browser/debugCommands", "vs/base/browser/ui/actionbar/actionViewItems", "vs/workbench/contrib/debug/browser/debugIcons", "vs/platform/keybinding/common/keybinding", "vs/platform/theme/browser/defaultStyles"], function (require, exports, nls, dom, keyboardEvent_1, selectBox_1, configuration_1, commands_1, debug_1, themables_1, colorRegistry_1, contextView_1, workspace_1, lifecycle_1, debugCommands_1, actionViewItems_1, debugIcons_1, keybinding_1, defaultStyles_1) {
    "use strict";
    var StartDebugActionViewItem_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FocusSessionActionViewItem = exports.StartDebugActionViewItem = void 0;
    const $ = dom.$;
    let StartDebugActionViewItem = class StartDebugActionViewItem extends actionViewItems_1.BaseActionViewItem {
        static { StartDebugActionViewItem_1 = this; }
        static { this.SEPARATOR = '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500'; }
        constructor(context, action, debugService, configurationService, commandService, contextService, contextViewService, keybindingService) {
            super(context, action);
            this.context = context;
            this.debugService = debugService;
            this.configurationService = configurationService;
            this.commandService = commandService;
            this.contextService = contextService;
            this.keybindingService = keybindingService;
            this.debugOptions = [];
            this.selected = 0;
            this.providers = [];
            this.toDispose = [];
            this.selectBox = new selectBox_1.SelectBox([], -1, contextViewService, defaultStyles_1.defaultSelectBoxStyles, { ariaLabel: nls.localize('debugLaunchConfigurations', 'Debug Launch Configurations') });
            this.selectBox.setFocusable(false);
            this.toDispose.push(this.selectBox);
            this.registerListeners();
        }
        registerListeners() {
            this.toDispose.push(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('launch')) {
                    this.updateOptions();
                }
            }));
            this.toDispose.push(this.debugService.getConfigurationManager().onDidSelectConfiguration(() => {
                this.updateOptions();
            }));
        }
        render(container) {
            this.container = container;
            container.classList.add('start-debug-action-item');
            this.start = dom.append(container, $(themables_1.ThemeIcon.asCSSSelector(debugIcons_1.debugStart)));
            const keybinding = this.keybindingService.lookupKeybinding(this.action.id)?.getLabel();
            const keybindingLabel = keybinding ? ` (${keybinding})` : '';
            this.start.title = this.action.label + keybindingLabel;
            this.start.setAttribute('role', 'button');
            this.start.ariaLabel = this.start.title;
            this.toDispose.push(dom.addDisposableListener(this.start, dom.EventType.CLICK, () => {
                this.start.blur();
                if (this.debugService.state !== 1 /* State.Initializing */) {
                    this.actionRunner.run(this.action, this.context);
                }
            }));
            this.toDispose.push(dom.addDisposableListener(this.start, dom.EventType.MOUSE_DOWN, (e) => {
                if (this.action.enabled && e.button === 0) {
                    this.start.classList.add('active');
                }
            }));
            this.toDispose.push(dom.addDisposableListener(this.start, dom.EventType.MOUSE_UP, () => {
                this.start.classList.remove('active');
            }));
            this.toDispose.push(dom.addDisposableListener(this.start, dom.EventType.MOUSE_OUT, () => {
                this.start.classList.remove('active');
            }));
            this.toDispose.push(dom.addDisposableListener(this.start, dom.EventType.KEY_DOWN, (e) => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.equals(17 /* KeyCode.RightArrow */)) {
                    this.start.tabIndex = -1;
                    this.selectBox.focus();
                    event.stopPropagation();
                }
            }));
            this.toDispose.push(this.selectBox.onDidSelect(async (e) => {
                const target = this.debugOptions[e.index];
                const shouldBeSelected = target.handler ? await target.handler() : false;
                if (shouldBeSelected) {
                    this.selected = e.index;
                }
                else {
                    // Some select options should not remain selected https://github.com/microsoft/vscode/issues/31526
                    this.selectBox.select(this.selected);
                }
            }));
            const selectBoxContainer = $('.configuration');
            this.selectBox.render(dom.append(container, selectBoxContainer));
            this.toDispose.push(dom.addDisposableListener(selectBoxContainer, dom.EventType.KEY_DOWN, (e) => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.equals(15 /* KeyCode.LeftArrow */)) {
                    this.selectBox.setFocusable(false);
                    this.start.tabIndex = 0;
                    this.start.focus();
                    event.stopPropagation();
                }
            }));
            this.container.style.border = `1px solid ${(0, colorRegistry_1.asCssVariable)(colorRegistry_1.selectBorder)}`;
            selectBoxContainer.style.borderLeft = `1px solid ${(0, colorRegistry_1.asCssVariable)(colorRegistry_1.selectBorder)}`;
            this.container.style.backgroundColor = (0, colorRegistry_1.asCssVariable)(colorRegistry_1.selectBackground);
            this.debugService.getConfigurationManager().getDynamicProviders().then(providers => {
                this.providers = providers;
                if (this.providers.length > 0) {
                    this.updateOptions();
                }
            });
            this.updateOptions();
        }
        setActionContext(context) {
            this.context = context;
        }
        isEnabled() {
            return true;
        }
        focus(fromRight) {
            if (fromRight) {
                this.selectBox.focus();
            }
            else {
                this.start.tabIndex = 0;
                this.start.focus();
            }
        }
        blur() {
            this.start.tabIndex = -1;
            this.selectBox.blur();
            this.container.blur();
        }
        setFocusable(focusable) {
            if (focusable) {
                this.start.tabIndex = 0;
            }
            else {
                this.start.tabIndex = -1;
                this.selectBox.setFocusable(false);
            }
        }
        dispose() {
            this.toDispose = (0, lifecycle_1.dispose)(this.toDispose);
        }
        updateOptions() {
            this.selected = 0;
            this.debugOptions = [];
            const manager = this.debugService.getConfigurationManager();
            const inWorkspace = this.contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */;
            let lastGroup;
            const disabledIdxs = [];
            manager.getAllConfigurations().forEach(({ launch, name, presentation }) => {
                if (lastGroup !== presentation?.group) {
                    lastGroup = presentation?.group;
                    if (this.debugOptions.length) {
                        this.debugOptions.push({ label: StartDebugActionViewItem_1.SEPARATOR, handler: () => Promise.resolve(false) });
                        disabledIdxs.push(this.debugOptions.length - 1);
                    }
                }
                if (name === manager.selectedConfiguration.name && launch === manager.selectedConfiguration.launch) {
                    this.selected = this.debugOptions.length;
                }
                const label = inWorkspace ? `${name} (${launch.name})` : name;
                this.debugOptions.push({
                    label, handler: async () => {
                        await manager.selectConfiguration(launch, name);
                        return true;
                    }
                });
            });
            // Only take 3 elements from the recent dynamic configurations to not clutter the dropdown
            manager.getRecentDynamicConfigurations().slice(0, 3).forEach(({ name, type }) => {
                if (type === manager.selectedConfiguration.type && manager.selectedConfiguration.name === name) {
                    this.selected = this.debugOptions.length;
                }
                this.debugOptions.push({
                    label: name,
                    handler: async () => {
                        await manager.selectConfiguration(undefined, name, undefined, { type });
                        return true;
                    }
                });
            });
            if (this.debugOptions.length === 0) {
                this.debugOptions.push({ label: nls.localize('noConfigurations', "No Configurations"), handler: async () => false });
            }
            this.debugOptions.push({ label: StartDebugActionViewItem_1.SEPARATOR, handler: () => Promise.resolve(false) });
            disabledIdxs.push(this.debugOptions.length - 1);
            this.providers.forEach(p => {
                this.debugOptions.push({
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
                const label = inWorkspace ? nls.localize("addConfigTo", "Add Config ({0})...", l.name) : nls.localize('addConfiguration', "Add Configuration...");
                this.debugOptions.push({
                    label, handler: async () => {
                        await this.commandService.executeCommand(debugCommands_1.ADD_CONFIGURATION_ID, l.uri.toString());
                        return false;
                    }
                });
            });
            this.selectBox.setOptions(this.debugOptions.map((data, index) => ({ text: data.label, isDisabled: disabledIdxs.indexOf(index) !== -1 })), this.selected);
        }
    };
    exports.StartDebugActionViewItem = StartDebugActionViewItem;
    exports.StartDebugActionViewItem = StartDebugActionViewItem = StartDebugActionViewItem_1 = __decorate([
        __param(2, debug_1.IDebugService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, commands_1.ICommandService),
        __param(5, workspace_1.IWorkspaceContextService),
        __param(6, contextView_1.IContextViewService),
        __param(7, keybinding_1.IKeybindingService)
    ], StartDebugActionViewItem);
    let FocusSessionActionViewItem = class FocusSessionActionViewItem extends actionViewItems_1.SelectActionViewItem {
        constructor(action, session, debugService, contextViewService, configurationService) {
            super(null, action, [], -1, contextViewService, defaultStyles_1.defaultSelectBoxStyles, { ariaLabel: nls.localize('debugSession', 'Debug Session') });
            this.debugService = debugService;
            this.configurationService = configurationService;
            this._register(this.debugService.getViewModel().onDidFocusSession(() => {
                const session = this.getSelectedSession();
                if (session) {
                    const index = this.getSessions().indexOf(session);
                    this.select(index);
                }
            }));
            this._register(this.debugService.onDidNewSession(session => {
                const sessionListeners = [];
                sessionListeners.push(session.onDidChangeName(() => this.update()));
                sessionListeners.push(session.onDidEndAdapter(() => (0, lifecycle_1.dispose)(sessionListeners)));
                this.update();
            }));
            this.getSessions().forEach(session => {
                this._register(session.onDidChangeName(() => this.update()));
            });
            this._register(this.debugService.onDidEndSession(() => this.update()));
            const selectedSession = session ? this.mapFocusedSessionToSelected(session) : undefined;
            this.update(selectedSession);
        }
        getActionContext(_, index) {
            return this.getSessions()[index];
        }
        update(session) {
            if (!session) {
                session = this.getSelectedSession();
            }
            const sessions = this.getSessions();
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
        getSelectedSession() {
            const session = this.debugService.getViewModel().focusedSession;
            return session ? this.mapFocusedSessionToSelected(session) : undefined;
        }
        getSessions() {
            const showSubSessions = this.configurationService.getValue('debug').showSubSessionsInToolBar;
            const sessions = this.debugService.getModel().getSessions();
            return showSubSessions ? sessions : sessions.filter(s => !s.parentSession);
        }
        mapFocusedSessionToSelected(focusedSession) {
            const showSubSessions = this.configurationService.getValue('debug').showSubSessionsInToolBar;
            while (focusedSession.parentSession && !showSubSessions) {
                focusedSession = focusedSession.parentSession;
            }
            return focusedSession;
        }
    };
    exports.FocusSessionActionViewItem = FocusSessionActionViewItem;
    exports.FocusSessionActionViewItem = FocusSessionActionViewItem = __decorate([
        __param(2, debug_1.IDebugService),
        __param(3, contextView_1.IContextViewService),
        __param(4, configuration_1.IConfigurationService)
    ], FocusSessionActionViewItem);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdBY3Rpb25WaWV3SXRlbXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9kZWJ1Zy9icm93c2VyL2RlYnVnQWN0aW9uVmlld0l0ZW1zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFzQmhHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFFVCxJQUFNLHdCQUF3QixHQUE5QixNQUFNLHdCQUF5QixTQUFRLG9DQUFrQjs7aUJBRXZDLGNBQVMsR0FBRyx3REFBd0QsQUFBM0QsQ0FBNEQ7UUFVN0YsWUFDUyxPQUFnQixFQUN4QixNQUFlLEVBQ0EsWUFBNEMsRUFDcEMsb0JBQTRELEVBQ2xFLGNBQWdELEVBQ3ZDLGNBQXlELEVBQzlELGtCQUF1QyxFQUN4QyxpQkFBc0Q7WUFFMUUsS0FBSyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztZQVRmLFlBQU8sR0FBUCxPQUFPLENBQVM7WUFFUSxpQkFBWSxHQUFaLFlBQVksQ0FBZTtZQUNuQix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ2pELG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUN0QixtQkFBYyxHQUFkLGNBQWMsQ0FBMEI7WUFFOUMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQWJuRSxpQkFBWSxHQUEyRCxFQUFFLENBQUM7WUFFMUUsYUFBUSxHQUFHLENBQUMsQ0FBQztZQUNiLGNBQVMsR0FBNkcsRUFBRSxDQUFDO1lBYWhJLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxxQkFBUyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxrQkFBa0IsRUFBRSxzQ0FBc0IsRUFBRSxFQUFFLFNBQVMsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDJC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