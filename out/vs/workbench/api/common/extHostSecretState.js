/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/api/common/extHost.protocol", "vs/base/common/event", "vs/platform/instantiation/common/instantiation"], function (require, exports, extHost_protocol_1, event_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IExtHostSecretState = exports.ExtHostSecretState = void 0;
    class ExtHostSecretState {
        constructor(mainContext) {
            this._onDidChangePassword = new event_1.Emitter();
            this.onDidChangePassword = this._onDidChangePassword.event;
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadSecretState);
        }
        async $onDidChangePassword(e) {
            this._onDidChangePassword.fire(e);
        }
        get(extensionId, key) {
            return this._proxy.$getPassword(extensionId, key);
        }
        store(extensionId, key, value) {
            return this._proxy.$setPassword(extensionId, key, value);
        }
        delete(extensionId, key) {
            return this._proxy.$deletePassword(extensionId, key);
        }
    }
    exports.ExtHostSecretState = ExtHostSecretState;
    exports.IExtHostSecretState = (0, instantiation_1.createDecorator)('IExtHostSecretState');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFNlY3JldFN0YXRlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdFNlY3JldFN0YXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU9oRyxNQUFhLGtCQUFrQjtRQUs5QixZQUFZLFdBQStCO1lBSG5DLHlCQUFvQixHQUFHLElBQUksZUFBTyxFQUF3QyxDQUFDO1lBQzFFLHdCQUFtQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUM7WUFHOUQsSUFBSSxDQUFDLE1BQU0sR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDLDhCQUFXLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUN2RSxDQUFDO1FBRUQsS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQXVDO1lBQ2pFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkMsQ0FBQztRQUVELEdBQUcsQ0FBQyxXQUFtQixFQUFFLEdBQVc7WUFDbkMsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDbkQsQ0FBQztRQUVELEtBQUssQ0FBQyxXQUFtQixFQUFFLEdBQVcsRUFBRSxLQUFhO1lBQ3BELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMxRCxDQUFDO1FBRUQsTUFBTSxDQUFDLFdBQW1CLEVBQUUsR0FBVztZQUN0QyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN0RCxDQUFDO0tBQ0Q7SUF4QkQsZ0RBd0JDO0lBR1ksUUFBQSxtQkFBbUIsR0FBRyxJQUFBLCtCQUFlLEVBQXNCLHFCQUFxQixDQUFDLENBQUMifQ==