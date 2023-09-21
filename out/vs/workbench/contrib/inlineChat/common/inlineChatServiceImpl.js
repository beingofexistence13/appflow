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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/common/linkedList", "vs/platform/contextkey/common/contextkey", "./inlineChat"], function (require, exports, lifecycle_1, event_1, linkedList_1, contextkey_1, inlineChat_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlineChatServiceImpl = void 0;
    let InlineChatServiceImpl = class InlineChatServiceImpl {
        get onDidChangeProviders() {
            return this._onDidChangeProviders.event;
        }
        constructor(contextKeyService) {
            this._entries = new linkedList_1.LinkedList();
            this._onDidChangeProviders = new event_1.Emitter();
            this._ctxHasProvider = inlineChat_1.CTX_INLINE_CHAT_HAS_PROVIDER.bindTo(contextKeyService);
        }
        addProvider(provider) {
            const rm = this._entries.push(provider);
            this._ctxHasProvider.set(true);
            this._onDidChangeProviders.fire();
            return (0, lifecycle_1.toDisposable)(() => {
                rm();
                this._ctxHasProvider.set(this._entries.size > 0);
                this._onDidChangeProviders.fire();
            });
        }
        getAllProvider() {
            return [...this._entries].reverse();
        }
    };
    exports.InlineChatServiceImpl = InlineChatServiceImpl;
    exports.InlineChatServiceImpl = InlineChatServiceImpl = __decorate([
        __param(0, contextkey_1.IContextKeyService)
    ], InlineChatServiceImpl);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lQ2hhdFNlcnZpY2VJbXBsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvaW5saW5lQ2hhdC9jb21tb24vaW5saW5lQ2hhdFNlcnZpY2VJbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVF6RixJQUFNLHFCQUFxQixHQUEzQixNQUFNLHFCQUFxQjtRQVNqQyxJQUFXLG9CQUFvQjtZQUM5QixPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUM7UUFDekMsQ0FBQztRQUVELFlBQWdDLGlCQUFxQztZQVRwRCxhQUFRLEdBQUcsSUFBSSx1QkFBVSxFQUE4QixDQUFDO1lBSXhELDBCQUFxQixHQUFHLElBQUksZUFBTyxFQUFRLENBQUM7WUFNNUQsSUFBSSxDQUFDLGVBQWUsR0FBRyx5Q0FBNEIsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUMvRSxDQUFDO1FBRUQsV0FBVyxDQUFDLFFBQW9DO1lBRS9DLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQy9CLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUVsQyxPQUFPLElBQUEsd0JBQVksRUFBQyxHQUFHLEVBQUU7Z0JBQ3hCLEVBQUUsRUFBRSxDQUFDO2dCQUNMLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNqRCxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDbkMsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsY0FBYztZQUNiLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNyQyxDQUFDO0tBQ0QsQ0FBQTtJQWpDWSxzREFBcUI7b0NBQXJCLHFCQUFxQjtRQWFwQixXQUFBLCtCQUFrQixDQUFBO09BYm5CLHFCQUFxQixDQWlDakMifQ==