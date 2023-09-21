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
define(["require", "exports", "vs/platform/log/common/log", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostInitDataService", "vs/workbench/api/common/extHostRpcService", "vs/base/common/uri", "vs/base/common/marshalling"], function (require, exports, log_1, extHost_protocol_1, extHostInitDataService_1, extHostRpcService_1, uri_1, marshalling_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostLoggerService = void 0;
    let ExtHostLoggerService = class ExtHostLoggerService extends log_1.AbstractLoggerService {
        constructor(rpc, initData) {
            super(initData.logLevel, initData.logsLocation, initData.loggers.map(logger => (0, marshalling_1.revive)(logger)));
            this._proxy = rpc.getProxy(extHost_protocol_1.MainContext.MainThreadLogger);
        }
        $setLogLevel(logLevel, resource) {
            if (resource) {
                this.setLogLevel(uri_1.URI.revive(resource), logLevel);
            }
            else {
                this.setLogLevel(logLevel);
            }
        }
        setVisibility(resource, visibility) {
            super.setVisibility(resource, visibility);
            this._proxy.$setVisibility(resource, visibility);
        }
        doCreateLogger(resource, logLevel, options) {
            return new Logger(this._proxy, resource, logLevel, options);
        }
    };
    exports.ExtHostLoggerService = ExtHostLoggerService;
    exports.ExtHostLoggerService = ExtHostLoggerService = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService),
        __param(1, extHostInitDataService_1.IExtHostInitDataService)
    ], ExtHostLoggerService);
    class Logger extends log_1.AbstractMessageLogger {
        constructor(proxy, file, logLevel, loggerOptions) {
            super(loggerOptions?.logLevel === 'always');
            this.proxy = proxy;
            this.file = file;
            this.isLoggerCreated = false;
            this.buffer = [];
            this.setLevel(logLevel);
            this.proxy.$createLogger(file, loggerOptions)
                .then(() => {
                this.doLog(this.buffer);
                this.isLoggerCreated = true;
            });
        }
        log(level, message) {
            const messages = [[level, message]];
            if (this.isLoggerCreated) {
                this.doLog(messages);
            }
            else {
                this.buffer.push(...messages);
            }
        }
        doLog(messages) {
            this.proxy.$log(this.file, messages);
        }
        flush() {
            this.proxy.$flush(this.file);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdExvZ2dlclNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9leHRIb3N0TG9nZ2VyU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFTekYsSUFBTSxvQkFBb0IsR0FBMUIsTUFBTSxvQkFBcUIsU0FBUSwyQkFBcUI7UUFLOUQsWUFDcUIsR0FBdUIsRUFDbEIsUUFBaUM7WUFFMUQsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUEsb0JBQU0sRUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEcsSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLDhCQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUMxRCxDQUFDO1FBRUQsWUFBWSxDQUFDLFFBQWtCLEVBQUUsUUFBd0I7WUFDeEQsSUFBSSxRQUFRLEVBQUU7Z0JBQ2IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2FBQ2pEO2lCQUFNO2dCQUNOLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDM0I7UUFDRixDQUFDO1FBRVEsYUFBYSxDQUFDLFFBQWEsRUFBRSxVQUFtQjtZQUN4RCxLQUFLLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUMxQyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUVTLGNBQWMsQ0FBQyxRQUFhLEVBQUUsUUFBa0IsRUFBRSxPQUF3QjtZQUNuRixPQUFPLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM3RCxDQUFDO0tBQ0QsQ0FBQTtJQTdCWSxvREFBb0I7bUNBQXBCLG9CQUFvQjtRQU05QixXQUFBLHNDQUFrQixDQUFBO1FBQ2xCLFdBQUEsZ0RBQXVCLENBQUE7T0FQYixvQkFBb0IsQ0E2QmhDO0lBRUQsTUFBTSxNQUFPLFNBQVEsMkJBQXFCO1FBS3pDLFlBQ2tCLEtBQTRCLEVBQzVCLElBQVMsRUFDMUIsUUFBa0IsRUFDbEIsYUFBOEI7WUFFOUIsS0FBSyxDQUFDLGFBQWEsRUFBRSxRQUFRLEtBQUssUUFBUSxDQUFDLENBQUM7WUFMM0IsVUFBSyxHQUFMLEtBQUssQ0FBdUI7WUFDNUIsU0FBSSxHQUFKLElBQUksQ0FBSztZQUxuQixvQkFBZSxHQUFZLEtBQUssQ0FBQztZQUNqQyxXQUFNLEdBQXlCLEVBQUUsQ0FBQztZQVN6QyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxhQUFhLENBQUM7aUJBQzNDLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ1YsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3hCLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO1lBQzdCLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVTLEdBQUcsQ0FBQyxLQUFlLEVBQUUsT0FBZTtZQUM3QyxNQUFNLFFBQVEsR0FBeUIsQ0FBQyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQzFELElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRTtnQkFDekIsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNyQjtpQkFBTTtnQkFDTixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDO2FBQzlCO1FBQ0YsQ0FBQztRQUVPLEtBQUssQ0FBQyxRQUE4QjtZQUMzQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFFUSxLQUFLO1lBQ2IsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlCLENBQUM7S0FDRCJ9