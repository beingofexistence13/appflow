/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.INotebookKernelHistoryService = exports.INotebookKernelService = exports.ProxyKernelState = void 0;
    var ProxyKernelState;
    (function (ProxyKernelState) {
        ProxyKernelState[ProxyKernelState["Disconnected"] = 1] = "Disconnected";
        ProxyKernelState[ProxyKernelState["Connected"] = 2] = "Connected";
        ProxyKernelState[ProxyKernelState["Initializing"] = 3] = "Initializing";
    })(ProxyKernelState || (exports.ProxyKernelState = ProxyKernelState = {}));
    exports.INotebookKernelService = (0, instantiation_1.createDecorator)('INotebookKernelService');
    exports.INotebookKernelHistoryService = (0, instantiation_1.createDecorator)('INotebookKernelHistoryService');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tLZXJuZWxTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svY29tbW9uL25vdGVib29rS2VybmVsU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUF1RGhHLElBQWtCLGdCQUlqQjtJQUpELFdBQWtCLGdCQUFnQjtRQUNqQyx1RUFBZ0IsQ0FBQTtRQUNoQixpRUFBYSxDQUFBO1FBQ2IsdUVBQWdCLENBQUE7SUFDakIsQ0FBQyxFQUppQixnQkFBZ0IsZ0NBQWhCLGdCQUFnQixRQUlqQztJQStCWSxRQUFBLHNCQUFzQixHQUFHLElBQUEsK0JBQWUsRUFBeUIsd0JBQXdCLENBQUMsQ0FBQztJQWlEM0YsUUFBQSw2QkFBNkIsR0FBRyxJQUFBLCtCQUFlLEVBQWdDLCtCQUErQixDQUFDLENBQUMifQ==