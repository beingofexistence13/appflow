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
define(["require", "exports", "./extHost.protocol", "vs/platform/log/common/log", "vs/workbench/services/extensions/common/extensions"], function (require, exports, extHost_protocol_1, log_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostMessageService = void 0;
    function isMessageItem(item) {
        return item && item.title;
    }
    let ExtHostMessageService = class ExtHostMessageService {
        constructor(mainContext, _logService) {
            this._logService = _logService;
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadMessageService);
        }
        showMessage(extension, severity, message, optionsOrFirstItem, rest) {
            const options = {
                source: { identifier: extension.identifier, label: extension.displayName || extension.name }
            };
            let items;
            if (typeof optionsOrFirstItem === 'string' || isMessageItem(optionsOrFirstItem)) {
                items = [optionsOrFirstItem, ...rest];
            }
            else {
                options.modal = optionsOrFirstItem?.modal;
                options.useCustom = optionsOrFirstItem?.useCustom;
                options.detail = optionsOrFirstItem?.detail;
                items = rest;
            }
            if (options.useCustom) {
                (0, extensions_1.checkProposedApiEnabled)(extension, 'resolvers');
            }
            const commands = [];
            for (let handle = 0; handle < items.length; handle++) {
                const command = items[handle];
                if (typeof command === 'string') {
                    commands.push({ title: command, handle, isCloseAffordance: false });
                }
                else if (typeof command === 'object') {
                    const { title, isCloseAffordance } = command;
                    commands.push({ title, isCloseAffordance: !!isCloseAffordance, handle });
                }
                else {
                    this._logService.warn('Invalid message item:', command);
                }
            }
            return this._proxy.$showMessage(severity, message, options, commands).then(handle => {
                if (typeof handle === 'number') {
                    return items[handle];
                }
                return undefined;
            });
        }
    };
    exports.ExtHostMessageService = ExtHostMessageService;
    exports.ExtHostMessageService = ExtHostMessageService = __decorate([
        __param(1, log_1.ILogService)
    ], ExtHostMessageService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdE1lc3NhZ2VTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdE1lc3NhZ2VTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVNoRyxTQUFTLGFBQWEsQ0FBQyxJQUFTO1FBQy9CLE9BQU8sSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDM0IsQ0FBQztJQUVNLElBQU0scUJBQXFCLEdBQTNCLE1BQU0scUJBQXFCO1FBSWpDLFlBQ0MsV0FBeUIsRUFDSyxXQUF3QjtZQUF4QixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQUV0RCxJQUFJLENBQUMsTUFBTSxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsOEJBQVcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQzFFLENBQUM7UUFNRCxXQUFXLENBQUMsU0FBZ0MsRUFBRSxRQUFrQixFQUFFLE9BQWUsRUFBRSxrQkFBbUYsRUFBRSxJQUF3QztZQUUvTSxNQUFNLE9BQU8sR0FBNkI7Z0JBQ3pDLE1BQU0sRUFBRSxFQUFFLFVBQVUsRUFBRSxTQUFTLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsV0FBVyxJQUFJLFNBQVMsQ0FBQyxJQUFJLEVBQUU7YUFDNUYsQ0FBQztZQUNGLElBQUksS0FBc0MsQ0FBQztZQUUzQyxJQUFJLE9BQU8sa0JBQWtCLEtBQUssUUFBUSxJQUFJLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO2dCQUNoRixLQUFLLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO2FBQ3RDO2lCQUFNO2dCQUNOLE9BQU8sQ0FBQyxLQUFLLEdBQUcsa0JBQWtCLEVBQUUsS0FBSyxDQUFDO2dCQUMxQyxPQUFPLENBQUMsU0FBUyxHQUFHLGtCQUFrQixFQUFFLFNBQVMsQ0FBQztnQkFDbEQsT0FBTyxDQUFDLE1BQU0sR0FBRyxrQkFBa0IsRUFBRSxNQUFNLENBQUM7Z0JBQzVDLEtBQUssR0FBRyxJQUFJLENBQUM7YUFDYjtZQUVELElBQUksT0FBTyxDQUFDLFNBQVMsRUFBRTtnQkFDdEIsSUFBQSxvQ0FBdUIsRUFBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUM7YUFDaEQ7WUFFRCxNQUFNLFFBQVEsR0FBb0UsRUFBRSxDQUFDO1lBRXJGLEtBQUssSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUNyRCxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzlCLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFO29CQUNoQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsaUJBQWlCLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztpQkFDcEU7cUJBQU0sSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLEVBQUU7b0JBQ3ZDLE1BQU0sRUFBRSxLQUFLLEVBQUUsaUJBQWlCLEVBQUUsR0FBRyxPQUFPLENBQUM7b0JBQzdDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7aUJBQ3pFO3FCQUFNO29CQUNOLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLE9BQU8sQ0FBQyxDQUFDO2lCQUN4RDthQUNEO1lBRUQsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ25GLElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxFQUFFO29CQUMvQixPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDckI7Z0JBQ0QsT0FBTyxTQUFTLENBQUM7WUFDbEIsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO0tBQ0QsQ0FBQTtJQXhEWSxzREFBcUI7b0NBQXJCLHFCQUFxQjtRQU0vQixXQUFBLGlCQUFXLENBQUE7T0FORCxxQkFBcUIsQ0F3RGpDIn0=