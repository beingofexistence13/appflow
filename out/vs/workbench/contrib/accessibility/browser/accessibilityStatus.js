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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/common/severity", "vs/nls", "vs/platform/accessibility/common/accessibility", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/notification/common/notification", "vs/workbench/services/statusbar/browser/statusbar"], function (require, exports, lifecycle_1, event_1, severity_1, nls_1, accessibility_1, commands_1, configuration_1, notification_1, statusbar_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AccessibilityStatus = void 0;
    let AccessibilityStatus = class AccessibilityStatus extends lifecycle_1.Disposable {
        constructor(configurationService, notificationService, _accessibilityService, statusbarService) {
            super();
            this.configurationService = configurationService;
            this.notificationService = notificationService;
            this._accessibilityService = _accessibilityService;
            this.statusbarService = statusbarService;
            this.screenReaderNotification = null;
            this.promptedScreenReader = false;
            this.screenReaderModeElement = this._register(new lifecycle_1.MutableDisposable());
            this._register(this._accessibilityService.onDidChangeScreenReaderOptimized(() => this.onScreenReaderModeChange()));
            this._register(configurationService.onDidChangeConfiguration(c => {
                if (c.affectsConfiguration('editor.accessibilitySupport')) {
                    this.onScreenReaderModeChange();
                }
            }));
            commands_1.CommandsRegistry.registerCommand({ id: 'showEditorScreenReaderNotification', handler: () => this.showScreenReaderNotification() });
            this.updateScreenReaderModeElement(this._accessibilityService.isScreenReaderOptimized());
        }
        showScreenReaderNotification() {
            this.screenReaderNotification = this.notificationService.prompt(severity_1.default.Info, (0, nls_1.localize)('screenReaderDetectedExplanation.question', "Are you using a screen reader to operate VS Code?"), [{
                    label: (0, nls_1.localize)('screenReaderDetectedExplanation.answerYes', "Yes"),
                    run: () => {
                        this.configurationService.updateValue('editor.accessibilitySupport', 'on', 2 /* ConfigurationTarget.USER */);
                    }
                }, {
                    label: (0, nls_1.localize)('screenReaderDetectedExplanation.answerNo', "No"),
                    run: () => {
                        this.configurationService.updateValue('editor.accessibilitySupport', 'off', 2 /* ConfigurationTarget.USER */);
                    }
                }], {
                sticky: true,
                priority: notification_1.NotificationPriority.URGENT
            });
            event_1.Event.once(this.screenReaderNotification.onDidClose)(() => this.screenReaderNotification = null);
        }
        updateScreenReaderModeElement(visible) {
            if (visible) {
                if (!this.screenReaderModeElement.value) {
                    const text = (0, nls_1.localize)('screenReaderDetected', "Screen Reader Optimized");
                    this.screenReaderModeElement.value = this.statusbarService.addEntry({
                        name: (0, nls_1.localize)('status.editor.screenReaderMode', "Screen Reader Mode"),
                        text,
                        ariaLabel: text,
                        command: 'showEditorScreenReaderNotification',
                        kind: 'prominent'
                    }, 'status.editor.screenReaderMode', 1 /* StatusbarAlignment.RIGHT */, 100.6);
                }
            }
            else {
                this.screenReaderModeElement.clear();
            }
        }
        onScreenReaderModeChange() {
            // We only support text based editors
            const screenReaderDetected = this._accessibilityService.isScreenReaderOptimized();
            if (screenReaderDetected) {
                const screenReaderConfiguration = this.configurationService.getValue('editor.accessibilitySupport');
                if (screenReaderConfiguration === 'auto') {
                    if (!this.promptedScreenReader) {
                        this.promptedScreenReader = true;
                        setTimeout(() => this.showScreenReaderNotification(), 100);
                    }
                }
            }
            if (this.screenReaderNotification) {
                this.screenReaderNotification.close();
            }
            this.updateScreenReaderModeElement(this._accessibilityService.isScreenReaderOptimized());
        }
    };
    exports.AccessibilityStatus = AccessibilityStatus;
    exports.AccessibilityStatus = AccessibilityStatus = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, notification_1.INotificationService),
        __param(2, accessibility_1.IAccessibilityService),
        __param(3, statusbar_1.IStatusbarService)
    ], AccessibilityStatus);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjZXNzaWJpbGl0eVN0YXR1cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2FjY2Vzc2liaWxpdHkvYnJvd3Nlci9hY2Nlc3NpYmlsaXR5U3RhdHVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWF6RixJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFvQixTQUFRLHNCQUFVO1FBS2xELFlBQ3dCLG9CQUE0RCxFQUM3RCxtQkFBMEQsRUFDekQscUJBQTZELEVBQ2pFLGdCQUFvRDtZQUV2RSxLQUFLLEVBQUUsQ0FBQztZQUxnQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQzVDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFDeEMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUNoRCxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBUmhFLDZCQUF3QixHQUErQixJQUFJLENBQUM7WUFDNUQseUJBQW9CLEdBQVksS0FBSyxDQUFDO1lBQzdCLDRCQUF1QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSw2QkFBaUIsRUFBMkIsQ0FBQyxDQUFDO1lBVTNHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGdDQUFnQyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNuSCxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNoRSxJQUFJLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyw2QkFBNkIsQ0FBQyxFQUFFO29CQUMxRCxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztpQkFDaEM7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osMkJB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