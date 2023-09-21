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
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/userActivity/common/userActivityRegistry"], function (require, exports, async_1, event_1, lifecycle_1, extensions_1, instantiation_1, userActivityRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserActivityService = exports.IUserActivityService = void 0;
    exports.IUserActivityService = (0, instantiation_1.createDecorator)('IUserActivityService');
    let UserActivityService = class UserActivityService extends lifecycle_1.Disposable {
        constructor(instantiationService) {
            super();
            this.markInactive = this._register(new async_1.RunOnceScheduler(() => {
                this.isActive = false;
                this.changeEmitter.fire(false);
            }, 10000));
            this.changeEmitter = this._register(new event_1.Emitter);
            this.active = 0;
            /**
             * @inheritdoc
             *
             * Note: initialized to true, since the user just did something to open the
             * window. The bundled DomActivityTracker will initially assume activity
             * as well in order to unset this if the window gets abandoned.
             */
            this.isActive = true;
            /** @inheritdoc */
            this.onDidChangeIsActive = this.changeEmitter.event;
            this._register((0, async_1.runWhenIdle)(() => userActivityRegistry_1.userActivityRegistry.take(this, instantiationService)));
        }
        /** @inheritdoc */
        markActive() {
            if (++this.active === 1) {
                this.isActive = true;
                this.changeEmitter.fire(true);
                this.markInactive.cancel();
            }
            return (0, lifecycle_1.toDisposable)(() => {
                if (--this.active === 0) {
                    this.markInactive.schedule();
                }
            });
        }
    };
    exports.UserActivityService = UserActivityService;
    exports.UserActivityService = UserActivityService = __decorate([
        __param(0, instantiation_1.IInstantiationService)
    ], UserActivityService);
    (0, extensions_1.registerSingleton)(exports.IUserActivityService, UserActivityService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckFjdGl2aXR5U2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy91c2VyQWN0aXZpdHkvY29tbW9uL3VzZXJBY3Rpdml0eVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBaUNuRixRQUFBLG9CQUFvQixHQUFHLElBQUEsK0JBQWUsRUFBdUIsc0JBQXNCLENBQUMsQ0FBQztJQUUzRixJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFvQixTQUFRLHNCQUFVO1FBc0JsRCxZQUFtQyxvQkFBMkM7WUFDN0UsS0FBSyxFQUFFLENBQUM7WUFyQlEsaUJBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksd0JBQWdCLENBQUMsR0FBRyxFQUFFO2dCQUN4RSxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDdEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDaEMsQ0FBQyxFQUFFLEtBQU0sQ0FBQyxDQUFDLENBQUM7WUFFSyxrQkFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFnQixDQUFDLENBQUM7WUFDOUQsV0FBTSxHQUFHLENBQUMsQ0FBQztZQUVuQjs7Ozs7O2VBTUc7WUFDSSxhQUFRLEdBQUcsSUFBSSxDQUFDO1lBRXZCLGtCQUFrQjtZQUNsQix3QkFBbUIsR0FBbUIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUM7WUFJOUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFBLG1CQUFXLEVBQUMsR0FBRyxFQUFFLENBQUMsMkNBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxRixDQUFDO1FBRUQsa0JBQWtCO1FBQ2xCLFVBQVU7WUFDVCxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3hCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO2dCQUNyQixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDOUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQzthQUMzQjtZQUVELE9BQU8sSUFBQSx3QkFBWSxFQUFDLEdBQUcsRUFBRTtnQkFDeEIsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO29CQUN4QixJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDO2lCQUM3QjtZQUNGLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztLQUNELENBQUE7SUF6Q1ksa0RBQW1CO2tDQUFuQixtQkFBbUI7UUFzQmxCLFdBQUEscUNBQXFCLENBQUE7T0F0QnRCLG1CQUFtQixDQXlDL0I7SUFFRCxJQUFBLDhCQUFpQixFQUFDLDRCQUFvQixFQUFFLG1CQUFtQixvQ0FBNEIsQ0FBQyJ9