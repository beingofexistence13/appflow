var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/filters", "vs/nls!vs/workbench/contrib/debug/browser/debugConsoleQuickAccess", "vs/platform/commands/common/commands", "vs/platform/quickinput/browser/pickerQuickAccess", "vs/workbench/common/views", "vs/workbench/contrib/debug/browser/debugCommands", "vs/workbench/contrib/debug/common/debug"], function (require, exports, filters_1, nls_1, commands_1, pickerQuickAccess_1, views_1, debugCommands_1, debug_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$kRb = void 0;
    let $kRb = class $kRb extends pickerQuickAccess_1.$sqb {
        constructor(a, b, h) {
            super(debugCommands_1.$bRb, { canAcceptInBackground: true });
            this.a = a;
            this.b = b;
            this.h = h;
        }
        g(filter, disposables, token) {
            const debugConsolePicks = [];
            this.a.getModel().getSessions(true).filter(s => s.hasSeparateRepl()).forEach((session, index) => {
                const pick = this.m(session, index, filter);
                if (pick) {
                    debugConsolePicks.push(pick);
                }
            });
            if (debugConsolePicks.length > 0) {
                debugConsolePicks.push({ type: 'separator' });
            }
            const createTerminalLabel = (0, nls_1.localize)(0, null);
            debugConsolePicks.push({
                label: `$(plus) ${createTerminalLabel}`,
                ariaLabel: createTerminalLabel,
                accept: () => this.h.executeCommand(debugCommands_1.$xQb)
            });
            return debugConsolePicks;
        }
        m(session, sessionIndex, filter) {
            const label = session.name;
            const highlights = (0, filters_1.$Ej)(filter, label, true);
            if (highlights) {
                return {
                    label,
                    highlights: { label: highlights },
                    accept: (keyMod, event) => {
                        this.a.focusStackFrame(undefined, undefined, session, { explicit: true });
                        if (!this.b.isViewVisible(debug_1.$rG)) {
                            this.b.openView(debug_1.$rG, true);
                        }
                    }
                };
            }
            return undefined;
        }
    };
    exports.$kRb = $kRb;
    exports.$kRb = $kRb = __decorate([
        __param(0, debug_1.$nH),
        __param(1, views_1.$$E),
        __param(2, commands_1.$Fr)
    ], $kRb);
});
//# sourceMappingURL=debugConsoleQuickAccess.js.map