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
define(["require", "exports", "vs/base/common/resources", "vs/nls", "vs/platform/environment/common/environment", "vs/platform/log/common/log", "vs/platform/userDataSync/common/userDataSync"], function (require, exports, resources_1, nls_1, environment_1, log_1, userDataSync_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataSyncLogService = void 0;
    let UserDataSyncLogService = class UserDataSyncLogService extends log_1.AbstractLogger {
        constructor(loggerService, environmentService) {
            super();
            this.logger = this._register(loggerService.createLogger((0, resources_1.joinPath)(environmentService.logsHome, `${userDataSync_1.USER_DATA_SYNC_LOG_ID}.log`), { id: userDataSync_1.USER_DATA_SYNC_LOG_ID, name: (0, nls_1.localize)('userDataSyncLog', "Settings Sync") }));
        }
        trace(message, ...args) {
            this.logger.trace(message, ...args);
        }
        debug(message, ...args) {
            this.logger.debug(message, ...args);
        }
        info(message, ...args) {
            this.logger.info(message, ...args);
        }
        warn(message, ...args) {
            this.logger.warn(message, ...args);
        }
        error(message, ...args) {
            this.logger.error(message, ...args);
        }
        flush() {
            this.logger.flush();
        }
    };
    exports.UserDataSyncLogService = UserDataSyncLogService;
    exports.UserDataSyncLogService = UserDataSyncLogService = __decorate([
        __param(0, log_1.ILoggerService),
        __param(1, environment_1.IEnvironmentService)
    ], UserDataSyncLogService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFTeW5jTG9nLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdXNlckRhdGFTeW5jL2NvbW1vbi91c2VyRGF0YVN5bmNMb2cudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBUXpGLElBQU0sc0JBQXNCLEdBQTVCLE1BQU0sc0JBQXVCLFNBQVEsb0JBQWM7UUFLekQsWUFDaUIsYUFBNkIsRUFDeEIsa0JBQXVDO1lBRTVELEtBQUssRUFBRSxDQUFDO1lBQ1IsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsSUFBQSxvQkFBUSxFQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxHQUFHLG9DQUFxQixNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxvQ0FBcUIsRUFBRSxJQUFJLEVBQUUsSUFBQSxjQUFRLEVBQUMsaUJBQWlCLEVBQUUsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDcE4sQ0FBQztRQUVELEtBQUssQ0FBQyxPQUFlLEVBQUUsR0FBRyxJQUFXO1lBQ3BDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFFRCxLQUFLLENBQUMsT0FBZSxFQUFFLEdBQUcsSUFBVztZQUNwQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBRUQsSUFBSSxDQUFDLE9BQWUsRUFBRSxHQUFHLElBQVc7WUFDbkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDcEMsQ0FBQztRQUVELElBQUksQ0FBQyxPQUFlLEVBQUUsR0FBRyxJQUFXO1lBQ25DLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ3BDLENBQUM7UUFFRCxLQUFLLENBQUMsT0FBdUIsRUFBRSxHQUFHLElBQVc7WUFDNUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUVELEtBQUs7WUFDSixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3JCLENBQUM7S0FFRCxDQUFBO0lBckNZLHdEQUFzQjtxQ0FBdEIsc0JBQXNCO1FBTWhDLFdBQUEsb0JBQWMsQ0FBQTtRQUNkLFdBQUEsaUNBQW1CLENBQUE7T0FQVCxzQkFBc0IsQ0FxQ2xDIn0=