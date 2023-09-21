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
define(["require", "exports", "vs/base/common/event", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/workbench/common/memento"], function (require, exports, event_1, instantiation_1, storage_1, memento_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChatWidgetHistoryService = exports.IChatWidgetHistoryService = void 0;
    exports.IChatWidgetHistoryService = (0, instantiation_1.createDecorator)('IChatWidgetHistoryService');
    let ChatWidgetHistoryService = class ChatWidgetHistoryService {
        constructor(storageService) {
            this._onDidClearHistory = new event_1.Emitter();
            this.onDidClearHistory = this._onDidClearHistory.event;
            this.memento = new memento_1.Memento('interactive-session', storageService);
            this.viewState = this.memento.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        getHistory(providerId) {
            return this.viewState.history?.[providerId] ?? [];
        }
        saveHistory(providerId, history) {
            if (!this.viewState.history) {
                this.viewState.history = {};
            }
            this.viewState.history[providerId] = history;
            this.memento.saveMemento();
        }
        clearHistory() {
            this.viewState.history = {};
            this.memento.saveMemento();
            this._onDidClearHistory.fire();
        }
    };
    exports.ChatWidgetHistoryService = ChatWidgetHistoryService;
    exports.ChatWidgetHistoryService = ChatWidgetHistoryService = __decorate([
        __param(0, storage_1.IStorageService)
    ], ChatWidgetHistoryService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFdpZGdldEhpc3RvcnlTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY2hhdC9jb21tb24vY2hhdFdpZGdldEhpc3RvcnlTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQU9uRixRQUFBLHlCQUF5QixHQUFHLElBQUEsK0JBQWUsRUFBNEIsMkJBQTJCLENBQUMsQ0FBQztJQWUxRyxJQUFNLHdCQUF3QixHQUE5QixNQUFNLHdCQUF3QjtRQVNwQyxZQUNrQixjQUErQjtZQUpoQyx1QkFBa0IsR0FBRyxJQUFJLGVBQU8sRUFBUSxDQUFDO1lBQ2pELHNCQUFpQixHQUFnQixJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDO1lBS3ZFLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxpQkFBTyxDQUFDLHFCQUFxQixFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ2xFLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLCtEQUErRCxDQUFDO1FBQ3pHLENBQUM7UUFFRCxVQUFVLENBQUMsVUFBa0I7WUFDNUIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNuRCxDQUFDO1FBRUQsV0FBVyxDQUFDLFVBQWtCLEVBQUUsT0FBaUI7WUFDaEQsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFO2dCQUM1QixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7YUFDNUI7WUFDRCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxPQUFPLENBQUM7WUFDN0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUM1QixDQUFDO1FBRUQsWUFBWTtZQUNYLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUM1QixJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQzNCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNoQyxDQUFDO0tBQ0QsQ0FBQTtJQWpDWSw0REFBd0I7dUNBQXhCLHdCQUF3QjtRQVVsQyxXQUFBLHlCQUFlLENBQUE7T0FWTCx3QkFBd0IsQ0FpQ3BDIn0=