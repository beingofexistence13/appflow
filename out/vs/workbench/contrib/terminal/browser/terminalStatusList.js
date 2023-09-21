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
    exports.getColorForSeverity = exports.TerminalStatusList = exports.TerminalStatus = void 0;
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
    let TerminalStatusList = class TerminalStatusList extends lifecycle_1.Disposable {
        get onDidAddStatus() { return this._onDidAddStatus.event; }
        get onDidRemoveStatus() { return this._onDidRemoveStatus.event; }
        get onDidChangePrimaryStatus() { return this._onDidChangePrimaryStatus.event; }
        constructor(_configurationService) {
            super();
            this._configurationService = _configurationService;
            this._statuses = new Map();
            this._statusTimeouts = new Map();
            this._onDidAddStatus = this._register(new event_1.Emitter());
            this._onDidRemoveStatus = this._register(new event_1.Emitter());
            this._onDidChangePrimaryStatus = this._register(new event_1.Emitter());
        }
        get primary() {
            let result;
            for (const s of this._statuses.values()) {
                if (!result || s.severity >= result.severity) {
                    result = s;
                }
            }
            return result;
        }
        get statuses() { return Array.from(this._statuses.values()); }
        add(status, duration) {
            status = this._applyAnimationSetting(status);
            const outTimeout = this._statusTimeouts.get(status.id);
            if (outTimeout) {
                window.clearTimeout(outTimeout);
                this._statusTimeouts.delete(status.id);
            }
            if (duration && duration > 0) {
                const timeout = window.setTimeout(() => this.remove(status), duration);
                this._statusTimeouts.set(status.id, timeout);
            }
            const existingStatus = this._statuses.get(status.id);
            if (existingStatus && existingStatus !== status) {
                this._onDidRemoveStatus.fire(existingStatus);
                this._statuses.delete(existingStatus.id);
            }
            if (!this._statuses.has(status.id)) {
                const oldPrimary = this.primary;
                this._statuses.set(status.id, status);
                this._onDidAddStatus.fire(status);
                const newPrimary = this.primary;
                if (oldPrimary !== newPrimary) {
                    this._onDidChangePrimaryStatus.fire(newPrimary);
                }
            }
        }
        remove(statusOrId) {
            const status = typeof statusOrId === 'string' ? this._statuses.get(statusOrId) : statusOrId;
            // Verify the status is the same as the one passed in
            if (status && this._statuses.get(status.id)) {
                const wasPrimary = this.primary?.id === status.id;
                this._statuses.delete(status.id);
                this._onDidRemoveStatus.fire(status);
                if (wasPrimary) {
                    this._onDidChangePrimaryStatus.fire(this.primary);
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
        _applyAnimationSetting(status) {
            if (!status.icon || themables_1.ThemeIcon.getModifier(status.icon) !== 'spin' || this._configurationService.getValue("terminal.integrated.tabs.enableAnimation" /* TerminalSettingId.TabsEnableAnimation */)) {
                return status;
            }
            let icon;
            // Loading without animation is just a curved line that doesn't mean anything
            if (status.icon.id === iconRegistry_1.spinningLoading.id) {
                icon = codicons_1.Codicon.play;
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
    exports.TerminalStatusList = TerminalStatusList;
    exports.TerminalStatusList = TerminalStatusList = __decorate([
        __param(0, configuration_1.IConfigurationService)
    ], TerminalStatusList);
    function getColorForSeverity(severity) {
        switch (severity) {
            case severity_1.default.Error:
                return colorRegistry_1.listErrorForeground;
            case severity_1.default.Warning:
                return colorRegistry_1.listWarningForeground;
            default:
                return '';
        }
    }
    exports.getColorForSeverity = getColorForSeverity;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxTdGF0dXNMaXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvYnJvd3Nlci90ZXJtaW5hbFN0YXR1c0xpc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBYWhHOzs7T0FHRztJQUNILElBQWtCLGNBTWpCO0lBTkQsV0FBa0IsY0FBYztRQUMvQiwrQkFBYSxDQUFBO1FBQ2IsK0NBQTZCLENBQUE7UUFDN0Isb0RBQWtDLENBQUE7UUFDbEMsc0ZBQW9FLENBQUE7UUFDcEUsd0ZBQXNFLENBQUE7SUFDdkUsQ0FBQyxFQU5pQixjQUFjLDhCQUFkLGNBQWMsUUFNL0I7SUF5Qk0sSUFBTSxrQkFBa0IsR0FBeEIsTUFBTSxrQkFBbUIsU0FBUSxzQkFBVTtRQUtqRCxJQUFJLGNBQWMsS0FBNkIsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFFbkYsSUFBSSxpQkFBaUIsS0FBNkIsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUV6RixJQUFJLHdCQUF3QixLQUF5QyxPQUFPLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBRW5ILFlBQ3dCLHFCQUE2RDtZQUVwRixLQUFLLEVBQUUsQ0FBQztZQUZnQywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBWHBFLGNBQVMsR0FBaUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNwRCxvQkFBZSxHQUF3QixJQUFJLEdBQUcsRUFBRSxDQUFDO1lBRWpELG9CQUFlLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBbUIsQ0FBQyxDQUFDO1lBRWpFLHVCQUFrQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFP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