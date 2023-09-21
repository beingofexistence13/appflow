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
define(["require", "exports", "vs/workbench/services/statusbar/browser/statusbar", "vs/base/common/lifecycle", "vs/workbench/browser/parts/notifications/notificationsCommands", "vs/nls!vs/workbench/browser/parts/notifications/notificationsStatus", "vs/platform/notification/common/notification"], function (require, exports, statusbar_1, lifecycle_1, notificationsCommands_1, nls_1, notification_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$c2b = void 0;
    let $c2b = class $c2b extends lifecycle_1.$kc {
        constructor(h, j, m) {
            super();
            this.h = h;
            this.j = j;
            this.m = m;
            this.b = 0;
            this.f = false;
            this.g = false;
            this.s();
            if (h.statusMessage) {
                this.w(h.statusMessage);
            }
            this.n();
        }
        n() {
            this.B(this.h.onDidChangeNotification(e => this.r(e)));
            this.B(this.h.onDidChangeStatusMessage(e => this.u(e)));
            this.B(this.m.onDidChangeDoNotDisturbMode(() => this.s()));
        }
        r(e) {
            // Consider a notification as unread as long as it only
            // appeared as toast and not in the notification center
            if (!this.f) {
                if (e.kind === 0 /* NotificationChangeType.ADD */) {
                    this.b++;
                }
                else if (e.kind === 3 /* NotificationChangeType.REMOVE */ && this.b > 0) {
                    this.b--;
                }
            }
            // Update in status bar
            this.s();
        }
        s() {
            // Figure out how many notifications have progress only if neither
            // toasts are visible nor center is visible. In that case we still
            // want to give a hint to the user that something is running.
            let notificationsInProgress = 0;
            if (!this.f && !this.g) {
                for (const notification of this.h.notifications) {
                    if (notification.hasProgress) {
                        notificationsInProgress++;
                    }
                }
            }
            // Show the status bar entry depending on do not disturb setting
            let statusProperties = {
                name: (0, nls_1.localize)(0, null),
                text: `${notificationsInProgress > 0 || this.b > 0 ? '$(bell-dot)' : '$(bell)'}`,
                ariaLabel: (0, nls_1.localize)(1, null),
                command: this.f ? notificationsCommands_1.$4Ib : notificationsCommands_1.$3Ib,
                tooltip: this.t(notificationsInProgress),
                showBeak: this.f
            };
            if (this.m.doNotDisturbMode) {
                statusProperties = {
                    ...statusProperties,
                    text: `${notificationsInProgress > 0 || this.b > 0 ? '$(bell-slash-dot)' : '$(bell-slash)'}`,
                    ariaLabel: (0, nls_1.localize)(2, null),
                    tooltip: (0, nls_1.localize)(3, null)
                };
            }
            if (!this.a) {
                this.a = this.j.addEntry(statusProperties, 'status.notifications', 1 /* StatusbarAlignment.RIGHT */, -Number.MAX_VALUE /* towards the far end of the right hand side */);
            }
            else {
                this.a.update(statusProperties);
            }
        }
        t(notificationsInProgress) {
            if (this.f) {
                return (0, nls_1.localize)(4, null);
            }
            if (this.h.notifications.length === 0) {
                return (0, nls_1.localize)(5, null);
            }
            if (notificationsInProgress === 0) {
                if (this.b === 0) {
                    return (0, nls_1.localize)(6, null);
                }
                if (this.b === 1) {
                    return (0, nls_1.localize)(7, null);
                }
                return (0, nls_1.localize)(8, null, this.b);
            }
            if (this.b === 0) {
                return (0, nls_1.localize)(9, null, notificationsInProgress);
            }
            if (this.b === 1) {
                return (0, nls_1.localize)(10, null, notificationsInProgress);
            }
            return (0, nls_1.localize)(11, null, this.b, notificationsInProgress);
        }
        update(isCenterVisible, isToastsVisible) {
            let updateNotificationsCenterStatusItem = false;
            if (this.f !== isCenterVisible) {
                this.f = isCenterVisible;
                this.b = 0; // Showing the notification center resets the unread counter to 0
                updateNotificationsCenterStatusItem = true;
            }
            if (this.g !== isToastsVisible) {
                this.g = isToastsVisible;
                updateNotificationsCenterStatusItem = true;
            }
            // Update in status bar as needed
            if (updateNotificationsCenterStatusItem) {
                this.s();
            }
        }
        u(e) {
            const statusItem = e.item;
            switch (e.kind) {
                // Show status notification
                case 0 /* StatusMessageChangeType.ADD */:
                    this.w(statusItem);
                    break;
                // Hide status notification (if its still the current one)
                case 1 /* StatusMessageChangeType.REMOVE */:
                    if (this.c && this.c[0] === statusItem) {
                        (0, lifecycle_1.$fc)(this.c[1]);
                        this.c = undefined;
                    }
                    break;
            }
        }
        w(item) {
            const message = item.message;
            const showAfter = item.options && typeof item.options.showAfter === 'number' ? item.options.showAfter : 0;
            const hideAfter = item.options && typeof item.options.hideAfter === 'number' ? item.options.hideAfter : -1;
            // Dismiss any previous
            if (this.c) {
                (0, lifecycle_1.$fc)(this.c[1]);
            }
            // Create new
            let statusMessageEntry;
            let showHandle = setTimeout(() => {
                statusMessageEntry = this.j.addEntry({
                    name: (0, nls_1.localize)(12, null),
                    text: message,
                    ariaLabel: message
                }, 'status.message', 0 /* StatusbarAlignment.LEFT */, -Number.MAX_VALUE /* far right on left hand side */);
                showHandle = null;
            }, showAfter);
            // Dispose function takes care of timeouts and actual entry
            let hideHandle;
            const statusMessageDispose = {
                dispose: () => {
                    if (showHandle) {
                        clearTimeout(showHandle);
                    }
                    if (hideHandle) {
                        clearTimeout(hideHandle);
                    }
                    statusMessageEntry?.dispose();
                }
            };
            if (hideAfter > 0) {
                hideHandle = setTimeout(() => statusMessageDispose.dispose(), hideAfter);
            }
            // Remember as current status message
            this.c = [item, statusMessageDispose];
        }
    };
    exports.$c2b = $c2b;
    exports.$c2b = $c2b = __decorate([
        __param(1, statusbar_1.$6$),
        __param(2, notification_1.$Yu)
    ], $c2b);
});
//# sourceMappingURL=notificationsStatus.js.map