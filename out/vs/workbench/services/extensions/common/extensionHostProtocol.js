/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer"], function (require, exports, buffer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeLogMarkers = exports.isMessageOfType = exports.createMessageOfType = exports.MessageType = exports.ExtensionHostExitCode = exports.UIKind = void 0;
    var UIKind;
    (function (UIKind) {
        UIKind[UIKind["Desktop"] = 1] = "Desktop";
        UIKind[UIKind["Web"] = 2] = "Web";
    })(UIKind || (exports.UIKind = UIKind = {}));
    var ExtensionHostExitCode;
    (function (ExtensionHostExitCode) {
        // nodejs uses codes 1-13 and exit codes >128 are signal exits
        ExtensionHostExitCode[ExtensionHostExitCode["VersionMismatch"] = 55] = "VersionMismatch";
        ExtensionHostExitCode[ExtensionHostExitCode["UnexpectedError"] = 81] = "UnexpectedError";
    })(ExtensionHostExitCode || (exports.ExtensionHostExitCode = ExtensionHostExitCode = {}));
    var MessageType;
    (function (MessageType) {
        MessageType[MessageType["Initialized"] = 0] = "Initialized";
        MessageType[MessageType["Ready"] = 1] = "Ready";
        MessageType[MessageType["Terminate"] = 2] = "Terminate";
    })(MessageType || (exports.MessageType = MessageType = {}));
    function createMessageOfType(type) {
        const result = buffer_1.VSBuffer.alloc(1);
        switch (type) {
            case 0 /* MessageType.Initialized */:
                result.writeUInt8(1, 0);
                break;
            case 1 /* MessageType.Ready */:
                result.writeUInt8(2, 0);
                break;
            case 2 /* MessageType.Terminate */:
                result.writeUInt8(3, 0);
                break;
        }
        return result;
    }
    exports.createMessageOfType = createMessageOfType;
    function isMessageOfType(message, type) {
        if (message.byteLength !== 1) {
            return false;
        }
        switch (message.readUInt8(0)) {
            case 1: return type === 0 /* MessageType.Initialized */;
            case 2: return type === 1 /* MessageType.Ready */;
            case 3: return type === 2 /* MessageType.Terminate */;
            default: return false;
        }
    }
    exports.isMessageOfType = isMessageOfType;
    var NativeLogMarkers;
    (function (NativeLogMarkers) {
        NativeLogMarkers["Start"] = "START_NATIVE_LOG";
        NativeLogMarkers["End"] = "END_NATIVE_LOG";
    })(NativeLogMarkers || (exports.NativeLogMarkers = NativeLogMarkers = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uSG9zdFByb3RvY29sLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2V4dGVuc2lvbnMvY29tbW9uL2V4dGVuc2lvbkhvc3RQcm90b2NvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFxRmhHLElBQVksTUFHWDtJQUhELFdBQVksTUFBTTtRQUNqQix5Q0FBVyxDQUFBO1FBQ1gsaUNBQU8sQ0FBQTtJQUNSLENBQUMsRUFIVyxNQUFNLHNCQUFOLE1BQU0sUUFHakI7SUFFRCxJQUFrQixxQkFJakI7SUFKRCxXQUFrQixxQkFBcUI7UUFDdEMsOERBQThEO1FBQzlELHdGQUFvQixDQUFBO1FBQ3BCLHdGQUFvQixDQUFBO0lBQ3JCLENBQUMsRUFKaUIscUJBQXFCLHFDQUFyQixxQkFBcUIsUUFJdEM7SUFrQkQsSUFBa0IsV0FJakI7SUFKRCxXQUFrQixXQUFXO1FBQzVCLDJEQUFXLENBQUE7UUFDWCwrQ0FBSyxDQUFBO1FBQ0wsdURBQVMsQ0FBQTtJQUNWLENBQUMsRUFKaUIsV0FBVywyQkFBWCxXQUFXLFFBSTVCO0lBRUQsU0FBZ0IsbUJBQW1CLENBQUMsSUFBaUI7UUFDcEQsTUFBTSxNQUFNLEdBQUcsaUJBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFakMsUUFBUSxJQUFJLEVBQUU7WUFDYjtnQkFBOEIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQUMsTUFBTTtZQUM3RDtnQkFBd0IsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQUMsTUFBTTtZQUN2RDtnQkFBNEIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQUMsTUFBTTtTQUMzRDtRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztJQVZELGtEQVVDO0lBRUQsU0FBZ0IsZUFBZSxDQUFDLE9BQWlCLEVBQUUsSUFBaUI7UUFDbkUsSUFBSSxPQUFPLENBQUMsVUFBVSxLQUFLLENBQUMsRUFBRTtZQUM3QixPQUFPLEtBQUssQ0FBQztTQUNiO1FBRUQsUUFBUSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQzdCLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLG9DQUE0QixDQUFDO1lBQ2hELEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLDhCQUFzQixDQUFDO1lBQzFDLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLGtDQUEwQixDQUFDO1lBQzlDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sS0FBSyxDQUFDO1NBQ3RCO0lBQ0YsQ0FBQztJQVhELDBDQVdDO0lBRUQsSUFBa0IsZ0JBR2pCO0lBSEQsV0FBa0IsZ0JBQWdCO1FBQ2pDLDhDQUEwQixDQUFBO1FBQzFCLDBDQUFzQixDQUFBO0lBQ3ZCLENBQUMsRUFIaUIsZ0JBQWdCLGdDQUFoQixnQkFBZ0IsUUFHakMifQ==