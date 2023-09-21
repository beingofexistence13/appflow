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
define(["require", "exports", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/terminalContrib/accessibility/browser/terminal.accessibility.contribution", "vs/platform/accessibility/common/accessibility", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/accessibility/browser/accessibilityConfiguration", "vs/workbench/contrib/accessibility/browser/accessibleView", "vs/workbench/contrib/accessibility/browser/accessibleViewActions", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/terminalActions", "vs/workbench/contrib/terminal/browser/terminalExtensions", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/workbench/contrib/terminalContrib/accessibility/browser/bufferContentTracker", "vs/workbench/contrib/terminalContrib/accessibility/browser/terminalAccessibilityHelp", "vs/workbench/contrib/terminalContrib/accessibility/browser/textAreaSyncAddon", "vs/editor/common/core/position", "vs/workbench/contrib/terminalContrib/accessibility/browser/terminalAccessibleBufferProvider", "vs/platform/configuration/common/configuration", "vs/base/common/event"], function (require, exports, lifecycle_1, nls_1, accessibility_1, actions_1, contextkey_1, instantiation_1, accessibilityConfiguration_1, accessibleView_1, accessibleViewActions_1, terminal_1, terminalActions_1, terminalExtensions_1, terminalContextKey_1, bufferContentTracker_1, terminalAccessibilityHelp_1, textAreaSyncAddon_1, position_1, terminalAccessibleBufferProvider_1, configuration_1, event_1) {
    "use strict";
    var TextAreaSyncContribution_1, $xWb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$yWb = exports.$xWb = void 0;
    let TextAreaSyncContribution = class TextAreaSyncContribution extends lifecycle_1.$jc {
        static { TextAreaSyncContribution_1 = this; }
        static { this.ID = 'terminal.textAreaSync'; }
        static get(instance) {
            return instance.getContribution(TextAreaSyncContribution_1.ID);
        }
        constructor(h, processManager, widgetManager, j) {
            super();
            this.h = h;
            this.j = j;
        }
        xtermReady(xterm) {
            const addon = this.j.createInstance(textAreaSyncAddon_1.$vWb, this.h.capabilities);
            xterm.raw.loadAddon(addon);
            addon.activate(xterm.raw);
        }
    };
    TextAreaSyncContribution = TextAreaSyncContribution_1 = __decorate([
        __param(3, instantiation_1.$Ah)
    ], TextAreaSyncContribution);
    (0, terminalExtensions_1.$BKb)(TextAreaSyncContribution.ID, TextAreaSyncContribution);
    let $xWb = class $xWb extends lifecycle_1.$kc {
        static { $xWb_1 = this; }
        static { this.ID = 'terminal.accessibleBufferProvider'; }
        static get(instance) {
            return instance.getContribution($xWb_1.ID);
        }
        constructor(j, processManager, widgetManager, m, n, r, configurationService, s) {
            super();
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.B(accessibleViewActions_1.$uGb.addImplementation(90, 'terminal', () => {
                if (this.r.activeInstance !== this.j) {
                    return false;
                }
                this.show();
                return true;
            }, terminalContextKey_1.TerminalContextKeys.focus));
            this.B(j.onDidRunText(() => {
                const focusAfterRun = configurationService.getValue("terminal.integrated.focusAfterRun" /* TerminalSettingId.FocusAfterRun */);
                if (focusAfterRun === 'terminal') {
                    j.focus(true);
                }
                else if (focusAfterRun === 'accessible-buffer') {
                    this.show();
                }
            }));
        }
        xtermReady(xterm) {
            const addon = this.n.createInstance(textAreaSyncAddon_1.$vWb, this.j.capabilities);
            xterm.raw.loadAddon(addon);
            addon.activate(xterm.raw);
            this.h = xterm;
            this.B(this.h.raw.onWriteParsed(async () => {
                if (this.t() && this.h.raw.buffer.active.baseY === 0) {
                    this.show();
                }
            }));
            const onRequestUpdateEditor = event_1.Event.latch(this.h.raw.onScroll);
            this.B(onRequestUpdateEditor(() => {
                if (this.t()) {
                    this.show();
                }
            }));
        }
        t() {
            return accessibilityConfiguration_1.$oqb.getValue(this.s) === "terminal" /* AccessibleViewProviderId.Terminal */;
        }
        show() {
            if (!this.h) {
                return;
            }
            if (!this.f) {
                this.f = this.B(this.n.createInstance(bufferContentTracker_1.$tWb, this.h));
            }
            if (!this.g) {
                this.g = this.B(this.n.createInstance(terminalAccessibleBufferProvider_1.$wWb, this.j, this.f));
            }
            this.m.show(this.g);
        }
        navigateToCommand(type) {
            const currentLine = this.m.getPosition()?.lineNumber || this.m.getLastPosition()?.lineNumber;
            const commands = this.u();
            if (!commands?.length || !currentLine) {
                return;
            }
            const filteredCommands = type === "previous" /* NavigationType.Previous */ ? commands.filter(c => c.lineNumber < currentLine).sort((a, b) => b.lineNumber - a.lineNumber) : commands.filter(c => c.lineNumber > currentLine).sort((a, b) => a.lineNumber - b.lineNumber);
            if (!filteredCommands.length) {
                return;
            }
            this.m.setPosition(new position_1.$js(filteredCommands[0].lineNumber, 1), true);
        }
        u() {
            const capability = this.j.capabilities.get(2 /* TerminalCapability.CommandDetection */);
            const commands = capability?.commands;
            const currentCommand = capability?.currentCommand;
            if (!commands?.length) {
                return;
            }
            const result = [];
            for (const command of commands) {
                const lineNumber = this.w(command);
                if (!lineNumber) {
                    continue;
                }
                result.push({ command, lineNumber });
            }
            if (currentCommand) {
                const lineNumber = this.w(currentCommand);
                if (!!lineNumber) {
                    result.push({ command: currentCommand, lineNumber });
                }
            }
            return result;
        }
        w(command) {
            if (!this.f) {
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
            line = this.f.bufferToEditorLineMapping.get(line);
            if (line === undefined) {
                return;
            }
            return line + 1;
        }
    };
    exports.$xWb = $xWb;
    exports.$xWb = $xWb = $xWb_1 = __decorate([
        __param(3, accessibleView_1.$wqb),
        __param(4, instantiation_1.$Ah),
        __param(5, terminal_1.$Mib),
        __param(6, configuration_1.$8h),
        __param(7, contextkey_1.$3i)
    ], $xWb);
    (0, terminalExtensions_1.$BKb)($xWb.ID, $xWb);
    class $yWb extends lifecycle_1.$kc {
        constructor() {
            super();
            this.B(accessibleViewActions_1.$tGb.addImplementation(105, 'terminal', async (accessor) => {
                const instantiationService = accessor.get(instantiation_1.$Ah);
                const terminalService = accessor.get(terminal_1.$Mib);
                const accessibleViewService = accessor.get(accessibleView_1.$wqb);
                const instance = await terminalService.getActiveOrCreateInstance();
                await terminalService.revealActiveTerminal();
                const terminal = instance?.xterm;
                if (!terminal) {
                    return;
                }
                accessibleViewService.show(instantiationService.createInstance(terminalAccessibilityHelp_1.$uWb, instance, terminal));
            }, contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.focus, contextkey_1.$Ii.and(accessibilityConfiguration_1.$jqb, contextkey_1.$Ii.equals(accessibilityConfiguration_1.$oqb.key, "terminal" /* AccessibleViewProviderId.Terminal */)))));
        }
    }
    exports.$yWb = $yWb;
    (0, terminalExtensions_1.$BKb)($yWb.ID, $yWb);
    class FocusAccessibleBufferAction extends actions_1.$Wu {
        constructor() {
            super({
                id: "workbench.action.terminal.focusAccessibleBuffer" /* TerminalCommandId.FocusAccessibleBuffer */,
                title: { value: (0, nls_1.localize)(0, null), original: 'Focus Accessible Buffer' },
                precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
                keybinding: [
                    {
                        primary: 512 /* KeyMod.Alt */ | 60 /* KeyCode.F2 */,
                        secondary: [2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */],
                        linux: {
                            primary: 512 /* KeyMod.Alt */ | 60 /* KeyCode.F2 */ | 1024 /* KeyMod.Shift */,
                            secondary: [2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */]
                        },
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: contextkey_1.$Ii.and(accessibility_1.$2r, terminalContextKey_1.TerminalContextKeys.focus)
                    }
                ]
            });
        }
        async run(accessor, ...args) {
            const terminalService = accessor.get(terminal_1.$Mib);
            const terminal = await terminalService.getActiveOrCreateInstance();
            if (!terminal?.xterm) {
                return;
            }
            $xWb.get(terminal)?.show();
        }
    }
    (0, actions_1.$Xu)(FocusAccessibleBufferAction);
    (0, terminalActions_1.$HVb)({
        id: "workbench.action.terminal.accessibleBufferGoToNextCommand" /* TerminalCommandId.AccessibleBufferGoToNextCommand */,
        title: { value: (0, nls_1.localize)(1, null), original: 'Accessible Buffer Go to Next Command' },
        precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated, contextkey_1.$Ii.and(accessibilityConfiguration_1.$jqb, contextkey_1.$Ii.equals(accessibilityConfiguration_1.$oqb.key, "terminal" /* AccessibleViewProviderId.Terminal */))),
        keybinding: [
            {
                primary: 512 /* KeyMod.Alt */ | 18 /* KeyCode.DownArrow */,
                when: contextkey_1.$Ii.and(contextkey_1.$Ii.and(accessibilityConfiguration_1.$jqb, contextkey_1.$Ii.equals(accessibilityConfiguration_1.$oqb.key, "terminal" /* AccessibleViewProviderId.Terminal */))),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 2
            }
        ],
        run: async (c) => {
            const instance = await c.service.getActiveOrCreateInstance();
            await c.service.revealActiveTerminal();
            if (!instance) {
                return;
            }
            await $xWb.get(instance)?.navigateToCommand("next" /* NavigationType.Next */);
        }
    });
    (0, terminalActions_1.$HVb)({
        id: "workbench.action.terminal.accessibleBufferGoToPreviousCommand" /* TerminalCommandId.AccessibleBufferGoToPreviousCommand */,
        title: { value: (0, nls_1.localize)(2, null), original: 'Accessible Buffer Go to Previous Command' },
        precondition: contextkey_1.$Ii.and(contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), contextkey_1.$Ii.and(accessibilityConfiguration_1.$jqb, contextkey_1.$Ii.equals(accessibilityConfiguration_1.$oqb.key, "terminal" /* AccessibleViewProviderId.Terminal */))),
        keybinding: [
            {
                primary: 512 /* KeyMod.Alt */ | 16 /* KeyCode.UpArrow */,
                when: contextkey_1.$Ii.and(contextkey_1.$Ii.and(accessibilityConfiguration_1.$jqb, contextkey_1.$Ii.equals(accessibilityConfiguration_1.$oqb.key, "terminal" /* AccessibleViewProviderId.Terminal */))),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 2
            }
        ],
        run: async (c) => {
            const instance = await c.service.getActiveOrCreateInstance();
            await c.service.revealActiveTerminal();
            if (!instance) {
                return;
            }
            await $xWb.get(instance)?.navigateToCommand("previous" /* NavigationType.Previous */);
        }
    });
});
//# sourceMappingURL=terminal.accessibility.contribution.js.map