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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/notification/common/notification", "vs/platform/telemetry/common/telemetry", "vs/base/common/hash"], function (require, exports, lifecycle_1, notification_1, telemetry_1, hash_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$2Ib = exports.$1Ib = void 0;
    function $1Ib(message, source, silent) {
        return {
            id: (0, hash_1.$pi)(message.toString()).toString(),
            silent,
            source: source || 'core'
        };
    }
    exports.$1Ib = $1Ib;
    let $2Ib = class $2Ib extends lifecycle_1.$kc {
        constructor(a, b) {
            super();
            this.a = a;
            this.b = b;
            this.c();
        }
        c() {
            this.B(this.b.onDidAddNotification(notification => {
                const source = notification.source && typeof notification.source !== 'string' ? notification.source.id : notification.source;
                this.a.publicLog2('notification:show', $1Ib(notification.message, source, notification.priority === notification_1.NotificationPriority.SILENT));
            }));
            this.B(this.b.onDidRemoveNotification(notification => {
                const source = notification.source && typeof notification.source !== 'string' ? notification.source.id : notification.source;
                this.a.publicLog2('notification:close', $1Ib(notification.message, source, notification.priority === notification_1.NotificationPriority.SILENT));
            }));
        }
    };
    exports.$2Ib = $2Ib;
    exports.$2Ib = $2Ib = __decorate([
        __param(0, telemetry_1.$9k),
        __param(1, notification_1.$Yu)
    ], $2Ib);
});
//# sourceMappingURL=notificationsTelemetry.js.map