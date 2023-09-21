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
    exports.NotificationsTelemetry = exports.notificationToMetrics = void 0;
    function notificationToMetrics(message, source, silent) {
        return {
            id: (0, hash_1.hash)(message.toString()).toString(),
            silent,
            source: source || 'core'
        };
    }
    exports.notificationToMetrics = notificationToMetrics;
    let NotificationsTelemetry = class NotificationsTelemetry extends lifecycle_1.Disposable {
        constructor(telemetryService, notificationService) {
            super();
            this.telemetryService = telemetryService;
            this.notificationService = notificationService;
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.notificationService.onDidAddNotification(notification => {
                const source = notification.source && typeof notification.source !== 'string' ? notification.source.id : notification.source;
                this.telemetryService.publicLog2('notification:show', notificationToMetrics(notification.message, source, notification.priority === notification_1.NotificationPriority.SILENT));
            }));
            this._register(this.notificationService.onDidRemoveNotification(notification => {
                const source = notification.source && typeof notification.source !== 'string' ? notification.source.id : notification.source;
                this.telemetryService.publicLog2('notification:close', notificationToMetrics(notification.message, source, notification.priority === notification_1.NotificationPriority.SILENT));
            }));
        }
    };
    exports.NotificationsTelemetry = NotificationsTelemetry;
    exports.NotificationsTelemetry = NotificationsTelemetry = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, notification_1.INotificationService)
    ], NotificationsTelemetry);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpY2F0aW9uc1RlbGVtZXRyeS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL25vdGlmaWNhdGlvbnMvbm90aWZpY2F0aW9uc1RlbGVtZXRyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFzQmhHLFNBQWdCLHFCQUFxQixDQUFDLE9BQTRCLEVBQUUsTUFBMEIsRUFBRSxNQUFlO1FBQzlHLE9BQU87WUFDTixFQUFFLEVBQUUsSUFBQSxXQUFJLEVBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFO1lBQ3ZDLE1BQU07WUFDTixNQUFNLEVBQUUsTUFBTSxJQUFJLE1BQU07U0FDeEIsQ0FBQztJQUNILENBQUM7SUFORCxzREFNQztJQUVNLElBQU0sc0JBQXNCLEdBQTVCLE1BQU0sc0JBQXVCLFNBQVEsc0JBQVU7UUFFckQsWUFDcUMsZ0JBQW1DLEVBQ2hDLG1CQUF5QztZQUVoRixLQUFLLEVBQUUsQ0FBQztZQUg0QixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQ2hDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFHaEYsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUVPLGlCQUFpQjtZQUN4QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxvQkFBb0IsQ0FBQyxZQUFZLENBQUMsRUFBRTtnQkFDM0UsTUFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDLE1BQU0sSUFBSSxPQUFPLFlBQVksQ0FBQyxNQUFNLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQztnQkFDN0gsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBeUQsbUJBQW1CLEVBQUUscUJBQXFCLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsWUFBWSxDQUFDLFFBQVEsS0FBSyxtQ0FBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzNOLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyx1QkFBdUIsQ0FBQyxZQUFZLENBQUMsRUFBRTtnQkFDOUUsTUFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDLE1BQU0sSUFBSSxPQUFPLFlBQVksQ0FBQyxNQUFNLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQztnQkFDN0gsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBeUQsb0JBQW9CLEVBQUUscUJBQXFCLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsWUFBWSxDQUFDLFFBQVEsS0FBSyxtQ0FBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzVOLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0tBQ0QsQ0FBQTtJQXJCWSx3REFBc0I7cUNBQXRCLHNCQUFzQjtRQUdoQyxXQUFBLDZCQUFpQixDQUFBO1FBQ2pCLFdBQUEsbUNBQW9CLENBQUE7T0FKVixzQkFBc0IsQ0FxQmxDIn0=