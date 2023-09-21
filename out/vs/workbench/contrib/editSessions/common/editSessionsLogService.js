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
define(["require", "exports", "vs/base/common/resources", "vs/nls", "vs/platform/environment/common/environment", "vs/platform/log/common/log", "vs/workbench/contrib/editSessions/common/editSessions"], function (require, exports, resources_1, nls_1, environment_1, log_1, editSessions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditSessionsLogService = void 0;
    let EditSessionsLogService = class EditSessionsLogService extends log_1.AbstractLogger {
        constructor(loggerService, environmentService) {
            super();
            this.logger = this._register(loggerService.createLogger((0, resources_1.joinPath)(environmentService.logsHome, `${editSessions_1.editSessionsLogId}.log`), { id: editSessions_1.editSessionsLogId, name: (0, nls_1.localize)('cloudChangesLog', "Cloud Changes") }));
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
    exports.EditSessionsLogService = EditSessionsLogService;
    exports.EditSessionsLogService = EditSessionsLogService = __decorate([
        __param(0, log_1.ILoggerService),
        __param(1, environment_1.IEnvironmentService)
    ], EditSessionsLogService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdFNlc3Npb25zTG9nU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2VkaXRTZXNzaW9ucy9jb21tb24vZWRpdFNlc3Npb25zTG9nU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFRekYsSUFBTSxzQkFBc0IsR0FBNUIsTUFBTSxzQkFBdUIsU0FBUSxvQkFBYztRQUt6RCxZQUNpQixhQUE2QixFQUN4QixrQkFBdUM7WUFFNUQsS0FBSyxFQUFFLENBQUM7WUFDUixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxJQUFBLG9CQUFRLEVBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLEdBQUcsZ0NBQWlCLE1BQU0sQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLGdDQUFpQixFQUFFLElBQUksRUFBRSxJQUFBLGNBQVEsRUFBQyxpQkFBaUIsRUFBRSxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM1TSxDQUFDO1FBRUQsS0FBSyxDQUFDLE9BQWUsRUFBRSxHQUFHLElBQVc7WUFDcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUVELEtBQUssQ0FBQyxPQUFlLEVBQUUsR0FBRyxJQUFXO1lBQ3BDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFFRCxJQUFJLENBQUMsT0FBZSxFQUFFLEdBQUcsSUFBVztZQUNuQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNwQyxDQUFDO1FBRUQsSUFBSSxDQUFDLE9BQWUsRUFBRSxHQUFHLElBQVc7WUFDbkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDcEMsQ0FBQztRQUVELEtBQUssQ0FBQyxPQUF1QixFQUFFLEdBQUcsSUFBVztZQUM1QyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBRUQsS0FBSztZQUNKLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDckIsQ0FBQztLQUNELENBQUE7SUFwQ1ksd0RBQXNCO3FDQUF0QixzQkFBc0I7UUFNaEMsV0FBQSxvQkFBYyxDQUFBO1FBQ2QsV0FBQSxpQ0FBbUIsQ0FBQTtPQVBULHNCQUFzQixDQW9DbEMifQ==