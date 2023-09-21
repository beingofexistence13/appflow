/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation"], function (require, exports, lifecycle_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChatProviderService = exports.IChatProviderService = exports.ChatMessageRole = void 0;
    var ChatMessageRole;
    (function (ChatMessageRole) {
        ChatMessageRole[ChatMessageRole["System"] = 0] = "System";
        ChatMessageRole[ChatMessageRole["User"] = 1] = "User";
        ChatMessageRole[ChatMessageRole["Assistant"] = 2] = "Assistant";
        ChatMessageRole[ChatMessageRole["Function"] = 3] = "Function";
    })(ChatMessageRole || (exports.ChatMessageRole = ChatMessageRole = {}));
    exports.IChatProviderService = (0, instantiation_1.createDecorator)('chatProviderService');
    class ChatProviderService {
        constructor() {
            this._providers = new Map();
        }
        registerChatResponseProvider(identifier, provider) {
            if (this._providers.has(identifier)) {
                throw new Error(`Chat response provider with identifier ${identifier} is already registered.`);
            }
            this._providers.set(identifier, provider);
            return (0, lifecycle_1.toDisposable)(() => this._providers.delete(identifier));
        }
        fetchChatResponse(identifier, messages, options, progress, token) {
            const provider = this._providers.get(identifier);
            if (!provider) {
                throw new Error(`Chat response provider with identifier ${identifier} is not registered.`);
            }
            return provider.provideChatResponse(messages, options, progress, token);
        }
    }
    exports.ChatProviderService = ChatProviderService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY2hhdC9jb21tb24vY2hhdFByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVFoRyxJQUFrQixlQUtqQjtJQUxELFdBQWtCLGVBQWU7UUFDaEMseURBQU0sQ0FBQTtRQUNOLHFEQUFJLENBQUE7UUFDSiwrREFBUyxDQUFBO1FBQ1QsNkRBQVEsQ0FBQTtJQUNULENBQUMsRUFMaUIsZUFBZSwrQkFBZixlQUFlLFFBS2hDO0lBd0JZLFFBQUEsb0JBQW9CLEdBQUcsSUFBQSwrQkFBZSxFQUF1QixxQkFBcUIsQ0FBQyxDQUFDO0lBV2pHLE1BQWEsbUJBQW1CO1FBQWhDO1lBR2tCLGVBQVUsR0FBdUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQWtCN0UsQ0FBQztRQWZBLDRCQUE0QixDQUFDLFVBQWtCLEVBQUUsUUFBK0I7WUFDL0UsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDcEMsTUFBTSxJQUFJLEtBQUssQ0FBQywwQ0FBMEMsVUFBVSx5QkFBeUIsQ0FBQyxDQUFDO2FBQy9GO1lBQ0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzFDLE9BQU8sSUFBQSx3QkFBWSxFQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDL0QsQ0FBQztRQUVELGlCQUFpQixDQUFDLFVBQWtCLEVBQUUsUUFBd0IsRUFBRSxPQUFnQyxFQUFFLFFBQTBDLEVBQUUsS0FBd0I7WUFDckssTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDakQsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDZCxNQUFNLElBQUksS0FBSyxDQUFDLDBDQUEwQyxVQUFVLHFCQUFxQixDQUFDLENBQUM7YUFDM0Y7WUFDRCxPQUFPLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN6RSxDQUFDO0tBQ0Q7SUFyQkQsa0RBcUJDIn0=