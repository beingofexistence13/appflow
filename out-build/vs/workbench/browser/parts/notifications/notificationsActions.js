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
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/notifications/notificationsActions", "vs/base/common/actions", "vs/workbench/browser/parts/notifications/notificationsCommands", "vs/platform/commands/common/commands", "vs/platform/clipboard/common/clipboardService", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/base/common/themables", "vs/css!./media/notificationsActions"], function (require, exports, nls_1, actions_1, notificationsCommands_1, commands_1, clipboardService_1, codicons_1, iconRegistry_1, themables_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$81b = exports.$71b = exports.$61b = exports.$51b = exports.$41b = exports.$31b = exports.$21b = exports.$11b = void 0;
    const clearIcon = (0, iconRegistry_1.$9u)('notifications-clear', codicons_1.$Pj.close, (0, nls_1.localize)(0, null));
    const clearAllIcon = (0, iconRegistry_1.$9u)('notifications-clear-all', codicons_1.$Pj.clearAll, (0, nls_1.localize)(1, null));
    const hideIcon = (0, iconRegistry_1.$9u)('notifications-hide', codicons_1.$Pj.chevronDown, (0, nls_1.localize)(2, null));
    const expandIcon = (0, iconRegistry_1.$9u)('notifications-expand', codicons_1.$Pj.chevronUp, (0, nls_1.localize)(3, null));
    const collapseIcon = (0, iconRegistry_1.$9u)('notifications-collapse', codicons_1.$Pj.chevronDown, (0, nls_1.localize)(4, null));
    const configureIcon = (0, iconRegistry_1.$9u)('notifications-configure', codicons_1.$Pj.gear, (0, nls_1.localize)(5, null));
    const doNotDisturbIcon = (0, iconRegistry_1.$9u)('notifications-do-not-disturb', codicons_1.$Pj.bellSlash, (0, nls_1.localize)(6, null));
    let $11b = class $11b extends actions_1.$gi {
        static { this.ID = notificationsCommands_1.$9Ib; }
        static { this.LABEL = (0, nls_1.localize)(7, null); }
        constructor(id, label, a) {
            super(id, label, themables_1.ThemeIcon.asClassName(clearIcon));
            this.a = a;
        }
        async run(notification) {
            this.a.executeCommand(notificationsCommands_1.$9Ib, notification);
        }
    };
    exports.$11b = $11b;
    exports.$11b = $11b = __decorate([
        __param(2, commands_1.$Fr)
    ], $11b);
    let $21b = class $21b extends actions_1.$gi {
        static { this.ID = notificationsCommands_1.$0Ib; }
        static { this.LABEL = (0, nls_1.localize)(8, null); }
        constructor(id, label, a) {
            super(id, label, themables_1.ThemeIcon.asClassName(clearAllIcon));
            this.a = a;
        }
        async run() {
            this.a.executeCommand(notificationsCommands_1.$0Ib);
        }
    };
    exports.$21b = $21b;
    exports.$21b = $21b = __decorate([
        __param(2, commands_1.$Fr)
    ], $21b);
    let $31b = class $31b extends actions_1.$gi {
        static { this.ID = notificationsCommands_1.$$Ib; }
        static { this.LABEL = (0, nls_1.localize)(9, null); }
        constructor(id, label, a) {
            super(id, label, themables_1.ThemeIcon.asClassName(doNotDisturbIcon));
            this.a = a;
        }
        async run() {
            this.a.executeCommand(notificationsCommands_1.$$Ib);
        }
    };
    exports.$31b = $31b;
    exports.$31b = $31b = __decorate([
        __param(2, commands_1.$Fr)
    ], $31b);
    let $41b = class $41b extends actions_1.$gi {
        static { this.ID = notificationsCommands_1.$4Ib; }
        static { this.LABEL = (0, nls_1.localize)(10, null); }
        constructor(id, label, a) {
            super(id, label, themables_1.ThemeIcon.asClassName(hideIcon));
            this.a = a;
        }
        async run() {
            this.a.executeCommand(notificationsCommands_1.$4Ib);
        }
    };
    exports.$41b = $41b;
    exports.$41b = $41b = __decorate([
        __param(2, commands_1.$Fr)
    ], $41b);
    let $51b = class $51b extends actions_1.$gi {
        static { this.ID = notificationsCommands_1.$7Ib; }
        static { this.LABEL = (0, nls_1.localize)(11, null); }
        constructor(id, label, a) {
            super(id, label, themables_1.ThemeIcon.asClassName(expandIcon));
            this.a = a;
        }
        async run(notification) {
            this.a.executeCommand(notificationsCommands_1.$7Ib, notification);
        }
    };
    exports.$51b = $51b;
    exports.$51b = $51b = __decorate([
        __param(2, commands_1.$Fr)
    ], $51b);
    let $61b = class $61b extends actions_1.$gi {
        static { this.ID = notificationsCommands_1.$6Ib; }
        static { this.LABEL = (0, nls_1.localize)(12, null); }
        constructor(id, label, a) {
            super(id, label, themables_1.ThemeIcon.asClassName(collapseIcon));
            this.a = a;
        }
        async run(notification) {
            this.a.executeCommand(notificationsCommands_1.$6Ib, notification);
        }
    };
    exports.$61b = $61b;
    exports.$61b = $61b = __decorate([
        __param(2, commands_1.$Fr)
    ], $61b);
    class $71b extends actions_1.$gi {
        static { this.ID = 'workbench.action.configureNotification'; }
        static { this.LABEL = (0, nls_1.localize)(13, null); }
        constructor(id, label, configurationActions) {
            super(id, label, themables_1.ThemeIcon.asClassName(configureIcon));
            this.configurationActions = configurationActions;
        }
    }
    exports.$71b = $71b;
    let $81b = class $81b extends actions_1.$gi {
        static { this.ID = 'workbench.action.copyNotificationMessage'; }
        static { this.LABEL = (0, nls_1.localize)(14, null); }
        constructor(id, label, a) {
            super(id, label);
            this.a = a;
        }
        run(notification) {
            return this.a.writeText(notification.message.raw);
        }
    };
    exports.$81b = $81b;
    exports.$81b = $81b = __decorate([
        __param(2, clipboardService_1.$UZ)
    ], $81b);
});
//# sourceMappingURL=notificationsActions.js.map