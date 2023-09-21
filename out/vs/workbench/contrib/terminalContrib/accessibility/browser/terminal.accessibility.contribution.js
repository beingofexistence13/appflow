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
define(["require", "exports", "vs/base/common/lifecycle", "vs/nls", "vs/platform/accessibility/common/accessibility", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/accessibility/browser/accessibilityConfiguration", "vs/workbench/contrib/accessibility/browser/accessibleView", "vs/workbench/contrib/accessibility/browser/accessibleViewActions", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/terminalActions", "vs/workbench/contrib/terminal/browser/terminalExtensions", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/workbench/contrib/terminalContrib/accessibility/browser/bufferContentTracker", "vs/workbench/contrib/terminalContrib/accessibility/browser/terminalAccessibilityHelp", "vs/workbench/contrib/terminalContrib/accessibility/browser/textAreaSyncAddon", "vs/editor/common/core/position", "vs/workbench/contrib/terminalContrib/accessibility/browser/terminalAccessibleBufferProvider", "vs/platform/configuration/common/configuration", "vs/base/common/event"], function (require, exports, lifecycle_1, nls_1, accessibility_1, actions_1, contextkey_1, instantiation_1, accessibilityConfiguration_1, accessibleView_1, accessibleViewActions_1, terminal_1, terminalActions_1, terminalExtensions_1, terminalContextKey_1, bufferContentTracker_1, terminalAccessibilityHelp_1, textAreaSyncAddon_1, position_1, terminalAccessibleBufferProvider_1, configuration_1, event_1) {
    "use strict";
    var TextAreaSyncContribution_1, TerminalAccessibleViewContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalAccessibilityHelpContribution = exports.TerminalAccessibleViewContribution = void 0;
    let TextAreaSyncContribution = class TextAreaSyncContribution extends lifecycle_1.DisposableStore {
        static { TextAreaSyncContribution_1 = this; }
        static { this.ID = 'terminal.textAreaSync'; }
        static get(instance) {
            return instance.getContribution(TextAreaSyncContribution_1.ID);
        }
        constructor(_instance, processManager, widgetManager, _instantiationService) {
            super();
            this._instance = _instance;
            this._instantiationService = _instantiationService;
        }
        xtermReady(xterm) {
            const addon = this._instantiationService.createInstance(textAreaSyncAddon_1.TextAreaSyncAddon, this._instance.capabilities);
            xterm.raw.loadAddon(addon);
            addon.activate(xterm.raw);
        }
    };
    TextAreaSyncContribution = TextAreaSyncContribution_1 = __decorate([
        __param(3, instantiation_1.IInstantiationService)
    ], TextAreaSyncContribution);
    (0, terminalExtensions_1.registerTerminalContribution)(TextAreaSyncContribution.ID, TextAreaSyncContribution);
    let TerminalAccessibleViewContribution = class TerminalAccessibleViewContribution extends lifecycle_1.Disposable {
        static { TerminalAccessibleViewContribution_1 = this; }
        static { this.ID = 'terminal.accessibleBufferProvider'; }
        static get(instance) {
            return instance.getContribution(TerminalAccessibleViewContribution_1.ID);
        }
        constructor(_instance, processManager, widgetManager, _accessibleViewService, _instantiationService, _terminalService, configurationService, _contextKeyService) {
            super();
            this._instance = _instance;
            this._accessibleViewService = _accessibleViewService;
            this._instantiationService = _instantiationService;
            this._terminalService = _terminalService;
            this._contextKeyService = _contextKeyService;
            this._register(accessibleViewActions_1.AccessibleViewAction.addImplementation(90, 'terminal', () => {
                if (this._terminalService.activeInstance !== this._instance) {
                    return false;
                }
                this.show();
                return true;
            }, terminalContextKey_1.TerminalContextKeys.focus));
            this._register(_instance.onDidRunText(() => {
                const focusAfterRun = configurationService.getValue("terminal.integrated.focusAfterRun" /* TerminalSettingId.FocusAfterRun */);
                if (focusAfterRun === 'terminal') {
                    _instance.focus(true);
                }
                else if (focusAfterRun === 'accessible-buffer') {
                    this.show();
                }
            }));
        }
        xtermReady(xterm) {
            const addon = this._instantiationService.createInstance(textAreaSyncAddon_1.TextAreaSyncAddon, this._instance.capabilities);
            xterm.raw.loadAddon(addon);
            addon.activate(xterm.raw);
            this._xterm = xterm;
            this._register(this._xterm.raw.onWriteParsed(async () => {
                if (this._isTerminalAccessibleViewOpen() && this._xterm.raw.buffer.active.baseY === 0) {
                    this.show();
                }
            }));
            const onRequestUpdateEditor = event_1.Event.latch(this._xterm.raw.onScroll);
            this._register(onRequestUpdateEditor(() => {
                if (this._isTerminalAccessibleViewOpen()) {
                    this.show();
                }
            }));
        }
        _isTerminalAccessibleViewOpen() {
            return accessibilityConfiguration_1.accessibleViewCurrentProviderId.getValue(this._contextKeyService) === "terminal" /* AccessibleViewProviderId.Terminal */;
        }
        show() {
            if (!this._xterm) {
                return;
            }
            if (!this._bufferTracker) {
                this._bufferTracker = this._register(this._instantiationService.createInstance(bufferContentTracker_1.BufferContentTracker, this._xterm));
            }
            if (!this._bufferProvider) {
                this._bufferProvider = this._register(this._instantiationService.createInstance(terminalAccessibleBufferProvider_1.TerminalAccessibleBufferProvider, this._instance, this._bufferTracker));
            }
            this._accessibleViewService.show(this._bufferProvider);
        }
        navigateToCommand(type) {
            const currentLine = this._accessibleViewService.getPosition()?.lineNumber || this._accessibleViewService.getLastPosition()?.lineNumber;
            const commands = this._getCommandsWithEditorLine();
            if (!commands?.length || !currentLine) {
                return;
            }
            const filteredCommands = type === "previous" /* NavigationType.Previous */ ? commands.filter(c => c.lineNumber < currentLine).sort((a, b) => b.lineNumber - a.lineNumber) : commands.filter(c => c.lineNumber > currentLine).sort((a, b) => a.lineNumber - b.lineNumber);
            if (!filteredCommands.length) {
                return;
            }
            this._accessibleViewService.setPosition(new position_1.Position(filteredCommands[0].lineNumber, 1), true);
        }
        _getCommandsWithEditorLine() {
            const capability = this._instance.capabilities.get(2 /* TerminalCapability.CommandDetection */);
            const commands = capability?.commands;
            const currentCommand = capability?.currentCommand;
            if (!commands?.length) {
                return;
            }
            const result = [];
            for (const command of commands) {
                const lineNumber = this._getEditorLineForCommand(command);
                if (!lineNumber) {
                    continue;
                }
                result.push({ command, lineNumber });
            }
            if (currentCommand) {
                const lineNumber = this._getEditorLineForCommand(currentCommand);
                if (!!lineNumber) {
                    result.push({ command: currentCommand, lineNumber });
                }
            }
            return result;
        }
        _getEditorLineForCommand(command) {
            if (!this._bufferTracker) {
                return;
            }
            let line;
            if ('marker' in command) {
                line = command.marker?.line;
            }
            else if ('commandStartMarker' in command) {
                line = command.commandStartMarker?.line;
            }
            if (line === undefined || line < 0) {
                return;
            }
            line = this._bufferTracker.bufferToEditorLineMapping.get(line);
            if (line === undefined) {
                return;
            }
            return line + 1;
        }
    };
    exports.TerminalAccessibleViewContribution = TerminalAccessibleViewContribution;
    exports.TerminalAccessibleViewContribution = TerminalAccessibleViewContribution = TerminalAccessibleViewContribution_1 = __decorate([
        __param(3, accessibleView_1.IAccessibleViewService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, terminal_1.ITerminalService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, contextkey_1.IContextKeyService)
    ], TerminalAccessibleViewContribution);
    (0, terminalExtensions_1.registerTerminalContribution)(TerminalAccessibleViewContribution.ID, TerminalAccessibleViewContribution);
    class TerminalAccessibilityHelpContribution extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._register(accessibleViewActions_1.AccessibilityHelpAction.addImplementation(105, 'terminal', async (accessor) => {
                const instantiationService = accessor.get(instantiation_1.IInstantiationService);
                const terminalService = accessor.get(terminal_1.ITerminalService);
                const accessibleViewService = accessor.get(accessibleView_1.IAccessibleViewService);
                const instance = await terminalService.getActiveOrCreateInstance();
                await terminalService.revealActiveTerminal();
                const terminal = instance?.xterm;
                if (!terminal) {
                    return;
                }
                accessibleViewService.show(instantiationService.createInstance(terminalAccessibilityHelp_1.TerminalAccessibleContentProvider, instance, terminal));
            }, contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.focus, contextkey_1.ContextKeyExpr.and(accessibilityConfiguration_1.accessibleViewIsShown, contextkey_1.ContextKeyExpr.equals(accessibilityConfiguration_1.accessibleViewCurrentProviderId.key, "terminal" /* AccessibleViewProviderId.Terminal */)))));
        }
    }
    exports.TerminalAccessibilityHelpContribution = TerminalAccessibilityHelpContribution;
    (0, terminalExtensions_1.registerTerminalContribution)(TerminalAccessibilityHelpContribution.ID, TerminalAccessibilityHelpContribution);
    class FocusAccessibleBufferAction extends actions_1.Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.focusAccessibleBuffer" /* TerminalCommandId.FocusAccessibleBuffer */,
                title: { value: (0, nls_1.localize)('workbench.action.terminal.focusAccessibleBuffer', 'Focus Accessible Buffer'), original: 'Focus Accessible Buffer' },
                precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
                keybinding: [
                    {
                        primary: 512 /* KeyMod.Alt */ | 60 /* KeyCode.F2 */,
                        secondary: [2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */],
                        linux: {
                            primary: 512 /* KeyMod.Alt */ | 60 /* KeyCode.F2 */ | 1024 /* KeyMod.Shift */,
                            secondary: [2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */]
                        },
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: contextkey_1.ContextKeyExpr.and(accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED, terminalContextKey_1.TerminalContextKeys.focus)
                    }
                ]
            });
        }
        async run(accessor, ...args) {
            const terminalService = accessor.get(terminal_1.ITerminalService);
            const terminal = await terminalService.getActiveOrCreateInstance();
            if (!terminal?.xterm) {
                return;
            }
            TerminalAccessibleViewContribution.get(terminal)?.show();
        }
    }
    (0, actions_1.registerAction2)(FocusAccessibleBufferAction);
    (0, terminalActions_1.registerTerminalAction)({
        id: "workbench.action.terminal.accessibleBufferGoToNextCommand" /* TerminalCommandId.AccessibleBufferGoToNextCommand */,
        title: { value: (0, nls_1.localize)('workbench.action.terminal.accessibleBufferGoToNextCommand', 'Accessible Buffer Go to Next Command'), original: 'Accessible Buffer Go to Next Command' },
        precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated, contextkey_1.ContextKeyExpr.and(accessibilityConfiguration_1.accessibleViewIsShown, contextkey_1.ContextKeyExpr.equals(accessibilityConfiguration_1.accessibleViewCurrentProviderId.key, "terminal" /* AccessibleViewProviderId.Terminal */))),
        keybinding: [
            {
                primary: 512 /* KeyMod.Alt */ | 18 /* KeyCode.DownArrow */,
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.and(accessibilityConfiguration_1.accessibleViewIsShown, contextkey_1.ContextKeyExpr.equals(accessibilityConfiguration_1.accessibleViewCurrentProviderId.key, "terminal" /* AccessibleViewProviderId.Terminal */))),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 2
            }
        ],
        run: async (c) => {
            const instance = await c.service.getActiveOrCreateInstance();
            await c.service.revealActiveTerminal();
            if (!instance) {
                return;
            }
            await TerminalAccessibleViewContribution.get(instance)?.navigateToCommand("next" /* NavigationType.Next */);
        }
    });
    (0, terminalActions_1.registerTerminalAction)({
        id: "workbench.action.terminal.accessibleBufferGoToPreviousCommand" /* TerminalCommandId.AccessibleBufferGoToPreviousCommand */,
        title: { value: (0, nls_1.localize)('workbench.action.terminal.accessibleBufferGoToPreviousCommand', 'Accessible Buffer Go to Previous Command'), original: 'Accessible Buffer Go to Previous Command' },
        precondition: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), contextkey_1.ContextKeyExpr.and(accessibilityConfiguration_1.accessibleViewIsShown, contextkey_1.ContextKeyExpr.equals(accessibilityConfiguration_1.accessibleViewCurrentProviderId.key, "terminal" /* AccessibleViewProviderId.Terminal */))),
        keybinding: [
            {
                primary: 512 /* KeyMod.Alt */ | 16 /* KeyCode.UpArrow */,
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.and(accessibilityConfiguration_1.accessibleViewIsShown, contextkey_1.ContextKeyExpr.equals(accessibilityConfiguration_1.accessibleViewCurrentProviderId.key, "terminal" /* AccessibleViewProviderId.Terminal */))),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 2
            }
        ],
        run: async (c) => {
            const instance = await c.service.getActiveOrCreateInstance();
            await c.service.revealActiveTerminal();
            if (!instance) {
                return;
            }
            await TerminalAccessibleViewContribution.get(instance)?.navigateToCommand("previous" /* NavigationType.Previous */);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWwuYWNjZXNzaWJpbGl0eS5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbENvbnRyaWIvYWNjZXNzaWJpbGl0eS9icm93c2VyL3Rlcm1pbmFsLmFjY2Vzc2liaWxpdHkuY29udHJpYnV0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUErQmhHLElBQU0sd0JBQXdCLEdBQTlCLE1BQU0sd0JBQXlCLFNBQVEsMkJBQWU7O2lCQUNyQyxPQUFFLEdBQUcsdUJBQXVCLEFBQTFCLENBQTJCO1FBQzdDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBMkI7WUFDckMsT0FBTyxRQUFRLENBQUMsZUFBZSxDQUEyQiwwQkFBd0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN4RixDQUFDO1FBQ0QsWUFDa0IsU0FBNEIsRUFDN0MsY0FBdUMsRUFDdkMsYUFBb0MsRUFDSSxxQkFBNEM7WUFFcEYsS0FBSyxFQUFFLENBQUM7WUFMUyxjQUFTLEdBQVQsU0FBUyxDQUFtQjtZQUdMLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7UUFHckYsQ0FBQztRQUNELFVBQVUsQ0FBQyxLQUF5QztZQUNuRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsY0FBYyxDQUFDLHFDQUFpQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDeEcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDM0IsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDM0IsQ0FBQzs7SUFqQkksd0JBQXdCO1FBUzNCLFdBQUEscUNBQXFCLENBQUE7T0FUbEIsd0JBQXdCLENBa0I3QjtJQUNELElBQUEs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