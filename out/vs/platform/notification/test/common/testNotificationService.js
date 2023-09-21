/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/notification/common/notification"], function (require, exports, event_1, lifecycle_1, notification_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestNotificationService = void 0;
    class TestNotificationService {
        constructor() {
            this.onDidAddNotification = event_1.Event.None;
            this.onDidRemoveNotification = event_1.Event.None;
            this.onDidChangeDoNotDisturbMode = event_1.Event.None;
            this.doNotDisturbMode = false;
        }
        static { this.NO_OP = new notification_1.NoOpNotification(); }
        info(message) {
            return this.notify({ severity: notification_1.Severity.Info, message });
        }
        warn(message) {
            return this.notify({ severity: notification_1.Severity.Warning, message });
        }
        error(error) {
            return this.notify({ severity: notification_1.Severity.Error, message: error });
        }
        notify(notification) {
            return TestNotificationService.NO_OP;
        }
        prompt(severity, message, choices, options) {
            return TestNotificationService.NO_OP;
        }
        status(message, options) {
            return lifecycle_1.Disposable.None;
        }
    }
    exports.TestNotificationService = TestNotificationService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdE5vdGlmaWNhdGlvblNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9ub3RpZmljYXRpb24vdGVzdC9jb21tb24vdGVzdE5vdGlmaWNhdGlvblNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHLE1BQWEsdUJBQXVCO1FBQXBDO1lBRVUseUJBQW9CLEdBQXlCLGFBQUssQ0FBQyxJQUFJLENBQUM7WUFFeEQsNEJBQXVCLEdBQXlCLGFBQUssQ0FBQyxJQUFJLENBQUM7WUFFM0QsZ0NBQTJCLEdBQWdCLGFBQUssQ0FBQyxJQUFJLENBQUM7WUFJL0QscUJBQWdCLEdBQVksS0FBSyxDQUFDO1FBMkJuQyxDQUFDO2lCQXpCd0IsVUFBSyxHQUF3QixJQUFJLCtCQUFnQixFQUFFLEFBQTlDLENBQStDO1FBRTVFLElBQUksQ0FBQyxPQUFlO1lBQ25CLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFFBQVEsRUFBRSx1QkFBUSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQzFELENBQUM7UUFFRCxJQUFJLENBQUMsT0FBZTtZQUNuQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxRQUFRLEVBQUUsdUJBQVEsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBRUQsS0FBSyxDQUFDLEtBQXFCO1lBQzFCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFFBQVEsRUFBRSx1QkFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNsRSxDQUFDO1FBRUQsTUFBTSxDQUFDLFlBQTJCO1lBQ2pDLE9BQU8sdUJBQXVCLENBQUMsS0FBSyxDQUFDO1FBQ3RDLENBQUM7UUFFRCxNQUFNLENBQUMsUUFBa0IsRUFBRSxPQUFlLEVBQUUsT0FBd0IsRUFBRSxPQUF3QjtZQUM3RixPQUFPLHVCQUF1QixDQUFDLEtBQUssQ0FBQztRQUN0QyxDQUFDO1FBRUQsTUFBTSxDQUFDLE9BQXVCLEVBQUUsT0FBK0I7WUFDOUQsT0FBTyxzQkFBVSxDQUFDLElBQUksQ0FBQztRQUN4QixDQUFDOztJQXBDRiwwREFxQ0MifQ==