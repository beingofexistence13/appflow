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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/common/severity", "vs/nls!vs/workbench/contrib/accessibility/browser/accessibilityStatus", "vs/platform/accessibility/common/accessibility", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/notification/common/notification", "vs/workbench/services/statusbar/browser/statusbar"], function (require, exports, lifecycle_1, event_1, severity_1, nls_1, accessibility_1, commands_1, configuration_1, notification_1, statusbar_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$T1b = void 0;
    let $T1b = class $T1b extends lifecycle_1.$kc {
        constructor(g, h, j, m) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.a = null;
            this.b = false;
            this.f = this.B(new lifecycle_1.$lc());
            this.B(this.j.onDidChangeScreenReaderOptimized(() => this.s()));
            this.B(g.onDidChangeConfiguration(c => {
                if (c.affectsConfiguration('editor.accessibilitySupport')) {
                    this.s();
                }
            }));
            commands_1.$Gr.registerCommand({ id: 'showEditorScreenReaderNotification', handler: () => this.n() });
            this.r(this.j.isScreenReaderOptimized());
        }
        n() {
            this.a = this.h.prompt(severity_1.default.Info, (0, nls_1.localize)(0, null), [{
                    label: (0, nls_1.localize)(1, null),
                    run: () => {
                        this.g.updateValue('editor.accessibilitySupport', 'on', 2 /* ConfigurationTarget.USER */);
                    }
                }, {
                    label: (0, nls_1.localize)(2, null),
                    run: () => {
                        this.g.updateValue('editor.accessibilitySupport', 'off', 2 /* ConfigurationTarget.USER */);
                    }
                }], {
                sticky: true,
                priority: notification_1.NotificationPriority.URGENT
            });
            event_1.Event.once(this.a.onDidClose)(() => this.a = null);
        }
        r(visible) {
            if (visible) {
                if (!this.f.value) {
                    const text = (0, nls_1.localize)(3, null);
                    this.f.value = this.m.addEntry({
                        name: (0, nls_1.localize)(4, null),
                        text,
                        ariaLabel: text,
                        command: 'showEditorScreenReaderNotification',
                        kind: 'prominent'
                    }, 'status.editor.screenReaderMode', 1 /* StatusbarAlignment.RIGHT */, 100.6);
                }
            }
            else {
                this.f.clear();
            }
        }
        s() {
            // We only support text based editors
            const screenReaderDetected = this.j.isScreenReaderOptimized();
            if (screenReaderDetected) {
                const screenReaderConfiguration = this.g.getValue('editor.accessibilitySupport');
                if (screenReaderConfiguration === 'auto') {
                    if (!this.b) {
                        this.b = true;
                        setTimeout(() => this.n(), 100);
                    }
                }
            }
            if (this.a) {
                this.a.close();
            }
            this.r(this.j.isScreenReaderOptimized());
        }
    };
    exports.$T1b = $T1b;
    exports.$T1b = $T1b = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, notification_1.$Yu),
        __param(2, accessibility_1.$1r),
        __param(3, statusbar_1.$6$)
    ], $T1b);
});
//# sourceMappingURL=accessibilityStatus.js.map