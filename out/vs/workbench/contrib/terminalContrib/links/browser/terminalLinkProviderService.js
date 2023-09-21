/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event"], function (require, exports, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalLinkProviderService = void 0;
    class TerminalLinkProviderService {
        constructor() {
            this._linkProviders = new Set();
            this._onDidAddLinkProvider = new event_1.Emitter();
            this._onDidRemoveLinkProvider = new event_1.Emitter();
        }
        get linkProviders() { return this._linkProviders; }
        get onDidAddLinkProvider() { return this._onDidAddLinkProvider.event; }
        get onDidRemoveLinkProvider() { return this._onDidRemoveLinkProvider.event; }
        registerLinkProvider(linkProvider) {
            const disposables = [];
            this._linkProviders.add(linkProvider);
            this._onDidAddLinkProvider.fire(linkProvider);
            return {
                dispose: () => {
                    for (const disposable of disposables) {
                        disposable.dispose();
                    }
                    this._linkProviders.delete(linkProvider);
                    this._onDidRemoveLinkProvider.fire(linkProvider);
                }
            };
        }
    }
    exports.TerminalLinkProviderService = TerminalLinkProviderService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxMaW5rUHJvdmlkZXJTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWxDb250cmliL2xpbmtzL2Jyb3dzZXIvdGVybWluYWxMaW5rUHJvdmlkZXJTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU9oRyxNQUFhLDJCQUEyQjtRQUF4QztZQUdTLG1CQUFjLEdBQUcsSUFBSSxHQUFHLEVBQWlDLENBQUM7WUFHakQsMEJBQXFCLEdBQUcsSUFBSSxlQUFPLEVBQWlDLENBQUM7WUFFckUsNkJBQXdCLEdBQUcsSUFBSSxlQUFPLEVBQWlDLENBQUM7UUFpQjFGLENBQUM7UUFyQkEsSUFBSSxhQUFhLEtBQWlELE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7UUFHL0YsSUFBSSxvQkFBb0IsS0FBMkMsT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUU3RyxJQUFJLHVCQUF1QixLQUEyQyxPQUFPLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBRW5ILG9CQUFvQixDQUFDLFlBQTJDO1lBQy9ELE1BQU0sV0FBVyxHQUFrQixFQUFFLENBQUM7WUFDdEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUM5QyxPQUFPO2dCQUNOLE9BQU8sRUFBRSxHQUFHLEVBQUU7b0JBQ2IsS0FBSyxNQUFNLFVBQVUsSUFBSSxXQUFXLEVBQUU7d0JBQ3JDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztxQkFDckI7b0JBQ0QsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQ3pDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ2xELENBQUM7YUFDRCxDQUFDO1FBQ0gsQ0FBQztLQUNEO0lBekJELGtFQXlCQyJ9