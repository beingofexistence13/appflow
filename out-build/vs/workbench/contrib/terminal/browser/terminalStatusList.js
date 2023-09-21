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
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/severity", "vs/platform/configuration/common/configuration", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/iconRegistry", "vs/base/common/themables"], function (require, exports, codicons_1, event_1, lifecycle_1, severity_1, configuration_1, colorRegistry_1, iconRegistry_1, themables_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$mfb = exports.$lfb = exports.TerminalStatus = void 0;
    /**
     * The set of _internal_ terminal statuses, other components building on the terminal should put
     * their statuses within their component.
     */
    var TerminalStatus;
    (function (TerminalStatus) {
        TerminalStatus["Bell"] = "bell";
        TerminalStatus["Disconnected"] = "disconnected";
        TerminalStatus["RelaunchNeeded"] = "relaunch-needed";
        TerminalStatus["EnvironmentVariableInfoChangesActive"] = "env-var-info-changes-active";
        TerminalStatus["ShellIntegrationAttentionNeeded"] = "shell-integration-attention-needed";
    })(TerminalStatus || (exports.TerminalStatus = TerminalStatus = {}));
    let $lfb = class $lfb extends lifecycle_1.$kc {
        get onDidAddStatus() { return this.c.event; }
        get onDidRemoveStatus() { return this.f.event; }
        get onDidChangePrimaryStatus() { return this.g.event; }
        constructor(h) {
            super();
            this.h = h;
            this.a = new Map();
            this.b = new Map();
            this.c = this.B(new event_1.$fd());
            this.f = this.B(new event_1.$fd());
            this.g = this.B(new event_1.$fd());
        }
        get primary() {
            let result;
            for (const s of this.a.values()) {
                if (!result || s.severity >= result.severity) {
                    result = s;
                }
            }
            return result;
        }
        get statuses() { return Array.from(this.a.values()); }
        add(status, duration) {
            status = this.j(status);
            const outTimeout = this.b.get(status.id);
            if (outTimeout) {
                window.clearTimeout(outTimeout);
                this.b.delete(status.id);
            }
            if (duration && duration > 0) {
                const timeout = window.setTimeout(() => this.remove(status), duration);
                this.b.set(status.id, timeout);
            }
            const existingStatus = this.a.get(status.id);
            if (existingStatus && existingStatus !== status) {
                this.f.fire(existingStatus);
                this.a.delete(existingStatus.id);
            }
            if (!this.a.has(status.id)) {
                const oldPrimary = this.primary;
                this.a.set(status.id, status);
                this.c.fire(status);
                const newPrimary = this.primary;
                if (oldPrimary !== newPrimary) {
                    this.g.fire(newPrimary);
                }
            }
        }
        remove(statusOrId) {
            const status = typeof statusOrId === 'string' ? this.a.get(statusOrId) : statusOrId;
            // Verify the status is the same as the one passed in
            if (status && this.a.get(status.id)) {
                const wasPrimary = this.primary?.id === status.id;
                this.a.delete(status.id);
                this.f.fire(status);
                if (wasPrimary) {
                    this.g.fire(this.primary);
                }
            }
        }
        toggle(status, value) {
            if (value) {
                this.add(status);
            }
            else {
                this.remove(status);
            }
        }
        j(status) {
            if (!status.icon || themables_1.ThemeIcon.getModifier(status.icon) !== 'spin' || this.h.getValue("terminal.integrated.tabs.enableAnimation" /* TerminalSettingId.TabsEnableAnimation */)) {
                return status;
            }
            let icon;
            // Loading without animation is just a curved line that doesn't mean anything
            if (status.icon.id === iconRegistry_1.$dv.id) {
                icon = codicons_1.$Pj.play;
            }
            else {
                icon = themables_1.ThemeIcon.modify(status.icon, undefined);
            }
            // Clone the status when changing the icon so that setting changes are applied without a
            // reload being needed
            return {
                ...status,
                icon
            };
        }
    };
    exports.$lfb = $lfb;
    exports.$lfb = $lfb = __decorate([
        __param(0, configuration_1.$8h)
    ], $lfb);
    function $mfb(severity) {
        switch (severity) {
            case severity_1.default.Error:
                return colorRegistry_1.$Mx;
            case severity_1.default.Warning:
                return colorRegistry_1.$Nx;
            default:
                return '';
        }
    }
    exports.$mfb = $mfb;
});
//# sourceMappingURL=terminalStatusList.js.map