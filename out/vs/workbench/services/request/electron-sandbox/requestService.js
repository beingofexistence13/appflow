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
define(["require", "exports", "vs/platform/configuration/common/configuration", "vs/platform/log/common/log", "vs/platform/request/browser/requestService", "vs/platform/instantiation/common/extensions", "vs/platform/request/common/request", "vs/platform/native/common/native"], function (require, exports, configuration_1, log_1, requestService_1, extensions_1, request_1, native_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeRequestService = void 0;
    let NativeRequestService = class NativeRequestService extends requestService_1.RequestService {
        constructor(configurationService, loggerService, nativeHostService) {
            super(configurationService, loggerService);
            this.nativeHostService = nativeHostService;
        }
        async resolveProxy(url) {
            return this.nativeHostService.resolveProxy(url);
        }
    };
    exports.NativeRequestService = NativeRequestService;
    exports.NativeRequestService = NativeRequestService = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, log_1.ILoggerService),
        __param(2, native_1.INativeHostService)
    ], NativeRequestService);
    (0, extensions_1.registerSingleton)(request_1.IRequestService, NativeRequestService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvcmVxdWVzdC9lbGVjdHJvbi1zYW5kYm94L3JlcXVlc3RTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVN6RixJQUFNLG9CQUFvQixHQUExQixNQUFNLG9CQUFxQixTQUFRLCtCQUFjO1FBRXZELFlBQ3dCLG9CQUEyQyxFQUNsRCxhQUE2QixFQUNqQixpQkFBcUM7WUFFakUsS0FBSyxDQUFDLG9CQUFvQixFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBRmYsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtRQUdsRSxDQUFDO1FBRVEsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFXO1lBQ3RDLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqRCxDQUFDO0tBQ0QsQ0FBQTtJQWJZLG9EQUFvQjttQ0FBcEIsb0JBQW9CO1FBRzlCLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSxvQkFBYyxDQUFBO1FBQ2QsV0FBQSwyQkFBa0IsQ0FBQTtPQUxSLG9CQUFvQixDQWFoQztJQUVELElBQUEsOEJBQWlCLEVBQUMseUJBQWUsRUFBRSxvQkFBb0Isb0NBQTRCLENBQUMifQ==