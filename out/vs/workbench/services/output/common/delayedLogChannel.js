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
define(["require", "exports", "vs/platform/log/common/log"], function (require, exports, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DelayedLogChannel = void 0;
    let DelayedLogChannel = class DelayedLogChannel {
        constructor(id, name, file, loggerService) {
            this.file = file;
            this.loggerService = loggerService;
            this.logger = loggerService.createLogger(file, { name, id, hidden: true });
        }
        log(level, message) {
            this.loggerService.setVisibility(this.file, true);
            (0, log_1.log)(this.logger, level, message);
        }
    };
    exports.DelayedLogChannel = DelayedLogChannel;
    exports.DelayedLogChannel = DelayedLogChannel = __decorate([
        __param(3, log_1.ILoggerService)
    ], DelayedLogChannel);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsYXllZExvZ0NoYW5uZWwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvb3V0cHV0L2NvbW1vbi9kZWxheWVkTG9nQ2hhbm5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFLekYsSUFBTSxpQkFBaUIsR0FBdkIsTUFBTSxpQkFBaUI7UUFJN0IsWUFDQyxFQUFVLEVBQUUsSUFBWSxFQUFtQixJQUFTLEVBQ25CLGFBQTZCO1lBRG5CLFNBQUksR0FBSixJQUFJLENBQUs7WUFDbkIsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBRTlELElBQUksQ0FBQyxNQUFNLEdBQUcsYUFBYSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQzVFLENBQUM7UUFFRCxHQUFHLENBQUMsS0FBZSxFQUFFLE9BQWU7WUFDbkMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNsRCxJQUFBLFNBQUcsRUFBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNsQyxDQUFDO0tBRUQsQ0FBQTtJQWhCWSw4Q0FBaUI7Z0NBQWpCLGlCQUFpQjtRQU0zQixXQUFBLG9CQUFjLENBQUE7T0FOSixpQkFBaUIsQ0FnQjdCIn0=