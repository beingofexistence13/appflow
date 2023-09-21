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
define(["require", "exports", "vs/nls!vs/workbench/contrib/terminal/browser/terminalQuickAccess", "vs/platform/quickinput/browser/pickerQuickAccess", "vs/base/common/filters", "vs/workbench/contrib/terminal/browser/terminal", "vs/platform/commands/common/commands", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/contrib/terminal/browser/terminalIcons", "vs/workbench/contrib/terminal/browser/terminalIcon", "vs/workbench/contrib/terminal/common/terminalStrings", "vs/platform/terminal/common/terminal", "vs/workbench/services/editor/common/editorService", "vs/platform/instantiation/common/instantiation"], function (require, exports, nls_1, pickerQuickAccess_1, filters_1, terminal_1, commands_1, themeService_1, themables_1, terminalIcons_1, terminalIcon_1, terminalStrings_1, terminal_2, editorService_1, instantiation_1) {
    "use strict";
    var $qVb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$qVb = void 0;
    let terminalPicks = [];
    let $qVb = class $qVb extends pickerQuickAccess_1.$sqb {
        static { $qVb_1 = this; }
        static { this.PREFIX = 'term '; }
        constructor(a, b, h, j, m, n, r) {
            super($qVb_1.PREFIX, { canAcceptInBackground: true });
            this.a = a;
            this.b = b;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
        }
        g(filter) {
            terminalPicks = [];
            terminalPicks.push({ type: 'separator', label: 'panel' });
            const terminalGroups = this.j.groups;
            for (let groupIndex = 0; groupIndex < terminalGroups.length; groupIndex++) {
                const terminalGroup = terminalGroups[groupIndex];
                for (let terminalIndex = 0; terminalIndex < terminalGroup.terminalInstances.length; terminalIndex++) {
                    const terminal = terminalGroup.terminalInstances[terminalIndex];
                    const pick = this.t(terminal, terminalIndex, filter, { groupIndex, groupSize: terminalGroup.terminalInstances.length });
                    if (pick) {
                        terminalPicks.push(pick);
                    }
                }
            }
            if (terminalPicks.length > 0) {
                terminalPicks.push({ type: 'separator', label: 'editor' });
            }
            const terminalEditors = this.h.instances;
            for (let editorIndex = 0; editorIndex < terminalEditors.length; editorIndex++) {
                const term = terminalEditors[editorIndex];
                term.target = terminal_2.TerminalLocation.Editor;
                const pick = this.t(term, editorIndex, filter);
                if (pick) {
                    terminalPicks.push(pick);
                }
            }
            if (terminalPicks.length > 0) {
                terminalPicks.push({ type: 'separator' });
            }
            const createTerminalLabel = (0, nls_1.localize)(0, null);
            terminalPicks.push({
                label: `$(plus) ${createTerminalLabel}`,
                ariaLabel: createTerminalLabel,
                accept: () => this.m.executeCommand("workbench.action.terminal.new" /* TerminalCommandId.New */)
            });
            const createWithProfileLabel = (0, nls_1.localize)(1, null);
            terminalPicks.push({
                label: `$(plus) ${createWithProfileLabel}`,
                ariaLabel: createWithProfileLabel,
                accept: () => this.m.executeCommand("workbench.action.terminal.newWithProfile" /* TerminalCommandId.NewWithProfile */)
            });
            return terminalPicks;
        }
        t(terminal, terminalIndex, filter, groupInfo) {
            const iconId = this.r.invokeFunction(terminalIcon_1.$Yib, terminal);
            const index = groupInfo
                ? (groupInfo.groupSize > 1
                    ? `${groupInfo.groupIndex + 1}.${terminalIndex + 1}`
                    : `${groupInfo.groupIndex + 1}`)
                : `${terminalIndex + 1}`;
            const label = `$(${iconId}) ${index}: ${terminal.title}`;
            const iconClasses = [];
            const colorClass = (0, terminalIcon_1.$Tib)(terminal);
            if (colorClass) {
                iconClasses.push(colorClass);
            }
            const uriClasses = (0, terminalIcon_1.$Xib)(terminal, this.n.getColorTheme().type);
            if (uriClasses) {
                iconClasses.push(...uriClasses);
            }
            const highlights = (0, filters_1.$Ej)(filter, label, true);
            if (highlights) {
                return {
                    label,
                    description: terminal.description,
                    highlights: { label: highlights },
                    buttons: [
                        {
                            iconClass: themables_1.ThemeIcon.asClassName(terminalIcons_1.$oib),
                            tooltip: (0, nls_1.localize)(2, null)
                        },
                        {
                            iconClass: themables_1.ThemeIcon.asClassName(terminalIcons_1.$pib),
                            tooltip: terminalStrings_1.$pVb.kill.value
                        }
                    ],
                    iconClasses,
                    trigger: buttonIndex => {
                        switch (buttonIndex) {
                            case 0:
                                this.m.executeCommand("workbench.action.terminal.rename" /* TerminalCommandId.Rename */, terminal);
                                return pickerQuickAccess_1.TriggerAction.NO_ACTION;
                            case 1:
                                this.b.safeDisposeTerminal(terminal);
                                return pickerQuickAccess_1.TriggerAction.REMOVE_ITEM;
                        }
                        return pickerQuickAccess_1.TriggerAction.NO_ACTION;
                    },
                    accept: (keyMod, event) => {
                        if (terminal.target === terminal_2.TerminalLocation.Editor) {
                            const existingEditors = this.a.findEditors(terminal.resource);
                            this.h.openEditor(terminal, { viewColumn: existingEditors?.[0].groupId });
                            this.h.setActiveInstance(terminal);
                        }
                        else {
                            this.j.showPanel(!event.inBackground);
                            this.j.setActiveInstance(terminal);
                        }
                    }
                };
            }
            return undefined;
        }
    };
    exports.$qVb = $qVb;
    exports.$qVb = $qVb = $qVb_1 = __decorate([
        __param(0, editorService_1.$9C),
        __param(1, terminal_1.$Nib),
        __param(2, terminal_1.$Nib),
        __param(3, terminal_1.$Oib),
        __param(4, commands_1.$Fr),
        __param(5, themeService_1.$gv),
        __param(6, instantiation_1.$Ah)
    ], $qVb);
});
//# sourceMappingURL=terminalQuickAccess.js.map