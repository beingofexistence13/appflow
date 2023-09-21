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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log"], function (require, exports, event_1, lifecycle_1, instantiation_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SharedProcessLifecycleService = exports.ISharedProcessLifecycleService = void 0;
    exports.ISharedProcessLifecycleService = (0, instantiation_1.createDecorator)('sharedProcessLifecycleService');
    let SharedProcessLifecycleService = class SharedProcessLifecycleService extends lifecycle_1.Disposable {
        constructor(logService) {
            super();
            this.logService = logService;
            this._onWillShutdown = this._register(new event_1.Emitter());
            this.onWillShutdown = this._onWillShutdown.event;
        }
        fireOnWillShutdown() {
            this.logService.trace('Lifecycle#onWillShutdown.fire()');
            this._onWillShutdown.fire();
        }
    };
    exports.SharedProcessLifecycleService = SharedProcessLifecycleService;
    exports.SharedProcessLifecycleService = SharedProcessLifecycleService = __decorate([
        __param(0, log_1.ILogService)
    ], SharedProcessLifecycleService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkUHJvY2Vzc0xpZmVjeWNsZVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9saWZlY3ljbGUvbm9kZS9zaGFyZWRQcm9jZXNzTGlmZWN5Y2xlU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFPbkYsUUFBQSw4QkFBOEIsR0FBRyxJQUFBLCtCQUFlLEVBQWlDLCtCQUErQixDQUFDLENBQUM7SUFZeEgsSUFBTSw2QkFBNkIsR0FBbkMsTUFBTSw2QkFBOEIsU0FBUSxzQkFBVTtRQU81RCxZQUNjLFVBQXdDO1lBRXJELEtBQUssRUFBRSxDQUFDO1lBRnNCLGVBQVUsR0FBVixVQUFVLENBQWE7WUFKckMsb0JBQWUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUM5RCxtQkFBYyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDO1FBTXJELENBQUM7UUFFRCxrQkFBa0I7WUFDakIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsaUNBQWlDLENBQUMsQ0FBQztZQUV6RCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzdCLENBQUM7S0FDRCxDQUFBO0lBbEJZLHNFQUE2Qjs0Q0FBN0IsNkJBQTZCO1FBUXZDLFdBQUEsaUJBQVcsQ0FBQTtPQVJELDZCQUE2QixDQWtCekMifQ==