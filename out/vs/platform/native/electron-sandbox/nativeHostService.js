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
define(["require", "exports", "vs/base/parts/ipc/common/ipc", "vs/platform/ipc/common/mainProcessService"], function (require, exports, ipc_1, mainProcessService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeHostService = void 0;
    // @ts-ignore: interface is implemented via proxy
    let NativeHostService = class NativeHostService {
        constructor(windowId, mainProcessService) {
            this.windowId = windowId;
            return ipc_1.ProxyChannel.toService(mainProcessService.getChannel('nativeHost'), {
                context: windowId,
                properties: (() => {
                    const properties = new Map();
                    properties.set('windowId', windowId);
                    return properties;
                })()
            });
        }
    };
    exports.NativeHostService = NativeHostService;
    exports.NativeHostService = NativeHostService = __decorate([
        __param(1, mainProcessService_1.IMainProcessService)
    ], NativeHostService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF0aXZlSG9zdFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9uYXRpdmUvZWxlY3Ryb24tc2FuZGJveC9uYXRpdmVIb3N0U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFNaEcsaURBQWlEO0lBQzFDLElBQU0saUJBQWlCLEdBQXZCLE1BQU0saUJBQWlCO1FBSTdCLFlBQ1UsUUFBZ0IsRUFDSixrQkFBdUM7WUFEbkQsYUFBUSxHQUFSLFFBQVEsQ0FBUTtZQUd6QixPQUFPLGtCQUFZLENBQUMsU0FBUyxDQUFxQixrQkFBa0IsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLEVBQUU7Z0JBQzlGLE9BQU8sRUFBRSxRQUFRO2dCQUNqQixVQUFVLEVBQUUsQ0FBQyxHQUFHLEVBQUU7b0JBQ2pCLE1BQU0sVUFBVSxHQUFHLElBQUksR0FBRyxFQUFtQixDQUFDO29CQUM5QyxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztvQkFFckMsT0FBTyxVQUFVLENBQUM7Z0JBQ25CLENBQUMsQ0FBQyxFQUFFO2FBQ0osQ0FBQyxDQUFDO1FBQ0osQ0FBQztLQUNELENBQUE7SUFsQlksOENBQWlCO2dDQUFqQixpQkFBaUI7UUFNM0IsV0FBQSx3Q0FBbUIsQ0FBQTtPQU5ULGlCQUFpQixDQWtCN0IifQ==