/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/platform/instantiation/common/instantiation"], function (require, exports, errors_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getRemoteAuthorityPrefix = exports.RemoteAuthorityResolverError = exports.RemoteAuthorityResolverErrorCode = exports.WebSocketRemoteConnection = exports.ManagedRemoteConnection = exports.RemoteConnectionType = exports.IRemoteAuthorityResolverService = void 0;
    exports.IRemoteAuthorityResolverService = (0, instantiation_1.createDecorator)('remoteAuthorityResolverService');
    var RemoteConnectionType;
    (function (RemoteConnectionType) {
        RemoteConnectionType[RemoteConnectionType["WebSocket"] = 0] = "WebSocket";
        RemoteConnectionType[RemoteConnectionType["Managed"] = 1] = "Managed";
    })(RemoteConnectionType || (exports.RemoteConnectionType = RemoteConnectionType = {}));
    class ManagedRemoteConnection {
        constructor(id) {
            this.id = id;
            this.type = 1 /* RemoteConnectionType.Managed */;
        }
        toString() {
            return `Managed(${this.id})`;
        }
    }
    exports.ManagedRemoteConnection = ManagedRemoteConnection;
    class WebSocketRemoteConnection {
        constructor(host, port) {
            this.host = host;
            this.port = port;
            this.type = 0 /* RemoteConnectionType.WebSocket */;
        }
        toString() {
            return `WebSocket(${this.host}:${this.port})`;
        }
    }
    exports.WebSocketRemoteConnection = WebSocketRemoteConnection;
    var RemoteAuthorityResolverErrorCode;
    (function (RemoteAuthorityResolverErrorCode) {
        RemoteAuthorityResolverErrorCode["Unknown"] = "Unknown";
        RemoteAuthorityResolverErrorCode["NotAvailable"] = "NotAvailable";
        RemoteAuthorityResolverErrorCode["TemporarilyNotAvailable"] = "TemporarilyNotAvailable";
        RemoteAuthorityResolverErrorCode["NoResolverFound"] = "NoResolverFound";
        RemoteAuthorityResolverErrorCode["InvalidAuthority"] = "InvalidAuthority";
    })(RemoteAuthorityResolverErrorCode || (exports.RemoteAuthorityResolverErrorCode = RemoteAuthorityResolverErrorCode = {}));
    class RemoteAuthorityResolverError extends errors_1.ErrorNoTelemetry {
        static isNotAvailable(err) {
            return (err instanceof RemoteAuthorityResolverError) && err._code === RemoteAuthorityResolverErrorCode.NotAvailable;
        }
        static isTemporarilyNotAvailable(err) {
            return (err instanceof RemoteAuthorityResolverError) && err._code === RemoteAuthorityResolverErrorCode.TemporarilyNotAvailable;
        }
        static isNoResolverFound(err) {
            return (err instanceof RemoteAuthorityResolverError) && err._code === RemoteAuthorityResolverErrorCode.NoResolverFound;
        }
        static isInvalidAuthority(err) {
            return (err instanceof RemoteAuthorityResolverError) && err._code === RemoteAuthorityResolverErrorCode.InvalidAuthority;
        }
        static isHandled(err) {
            return (err instanceof RemoteAuthorityResolverError) && err.isHandled;
        }
        constructor(message, code = RemoteAuthorityResolverErrorCode.Unknown, detail) {
            super(message);
            this._message = message;
            this._code = code;
            this._detail = detail;
            this.isHandled = (code === RemoteAuthorityResolverErrorCode.NotAvailable) && detail === true;
            // workaround when extending builtin objects and when compiling to ES5, see:
            // https://github.com/microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
            Object.setPrototypeOf(this, RemoteAuthorityResolverError.prototype);
        }
    }
    exports.RemoteAuthorityResolverError = RemoteAuthorityResolverError;
    function getRemoteAuthorityPrefix(remoteAuthority) {
        const plusIndex = remoteAuthority.indexOf('+');
        if (plusIndex === -1) {
            return remoteAuthority;
        }
        return remoteAuthority.substring(0, plusIndex);
    }
    exports.getRemoteAuthorityPrefix = getRemoteAuthorityPrefix;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlQXV0aG9yaXR5UmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9yZW1vdGUvY29tbW9uL3JlbW90ZUF1dGhvcml0eVJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU9uRixRQUFBLCtCQUErQixHQUFHLElBQUEsK0JBQWUsRUFBa0MsZ0NBQWdDLENBQUMsQ0FBQztJQUVsSSxJQUFrQixvQkFHakI7SUFIRCxXQUFrQixvQkFBb0I7UUFDckMseUVBQVMsQ0FBQTtRQUNULHFFQUFPLENBQUE7SUFDUixDQUFDLEVBSGlCLG9CQUFvQixvQ0FBcEIsb0JBQW9CLFFBR3JDO0lBRUQsTUFBYSx1QkFBdUI7UUFHbkMsWUFDaUIsRUFBVTtZQUFWLE9BQUUsR0FBRixFQUFFLENBQVE7WUFIWCxTQUFJLHdDQUFnQztRQUloRCxDQUFDO1FBRUUsUUFBUTtZQUNkLE9BQU8sV0FBVyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUM7UUFDOUIsQ0FBQztLQUNEO0lBVkQsMERBVUM7SUFFRCxNQUFhLHlCQUF5QjtRQUdyQyxZQUNpQixJQUFZLEVBQ1osSUFBWTtZQURaLFNBQUksR0FBSixJQUFJLENBQVE7WUFDWixTQUFJLEdBQUosSUFBSSxDQUFRO1lBSmIsU0FBSSwwQ0FBa0M7UUFLbEQsQ0FBQztRQUVFLFFBQVE7WUFDZCxPQUFPLGFBQWEsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUM7UUFDL0MsQ0FBQztLQUNEO0lBWEQsOERBV0M7SUFpREQsSUFBWSxnQ0FNWDtJQU5ELFdBQVksZ0NBQWdDO1FBQzNDLHVEQUFtQixDQUFBO1FBQ25CLGlFQUE2QixDQUFBO1FBQzdCLHVGQUFtRCxDQUFBO1FBQ25ELHVFQUFtQyxDQUFBO1FBQ25DLHlFQUFxQyxDQUFBO0lBQ3RDLENBQUMsRUFOVyxnQ0FBZ0MsZ0RBQWhDLGdDQUFnQyxRQU0zQztJQUVELE1BQWEsNEJBQTZCLFNBQVEseUJBQWdCO1FBRTFELE1BQU0sQ0FBQyxjQUFjLENBQUMsR0FBUTtZQUNwQyxPQUFPLENBQUMsR0FBRyxZQUFZLDRCQUE0QixDQUFDLElBQUksR0FBRyxDQUFDLEtBQUssS0FBSyxnQ0FBZ0MsQ0FBQyxZQUFZLENBQUM7UUFDckgsQ0FBQztRQUVNLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQyxHQUFRO1lBQy9DLE9BQU8sQ0FBQyxHQUFHLFlBQVksNEJBQTRCLENBQUMsSUFBSSxHQUFHLENBQUMsS0FBSyxLQUFLLGdDQUFnQyxDQUFDLHVCQUF1QixDQUFDO1FBQ2hJLENBQUM7UUFFTSxNQUFNLENBQUMsaUJBQWlCLENBQUMsR0FBUTtZQUN2QyxPQUFPLENBQUMsR0FBRyxZQUFZLDRCQUE0QixDQUFDLElBQUksR0FBRyxDQUFDLEtBQUssS0FBSyxnQ0FBZ0MsQ0FBQyxlQUFlLENBQUM7UUFDeEgsQ0FBQztRQUVNLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxHQUFRO1lBQ3hDLE9BQU8sQ0FBQyxHQUFHLFlBQVksNEJBQTRCLENBQUMsSUFBSSxHQUFHLENBQUMsS0FBSyxLQUFLLGdDQUFnQyxDQUFDLGdCQUFnQixDQUFDO1FBQ3pILENBQUM7UUFFTSxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQVE7WUFDL0IsT0FBTyxDQUFDLEdBQUcsWUFBWSw0QkFBNEIsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUM7UUFDdkUsQ0FBQztRQVFELFlBQVksT0FBZ0IsRUFBRSxPQUF5QyxnQ0FBZ0MsQ0FBQyxPQUFPLEVBQUUsTUFBWTtZQUM1SCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFZixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztZQUN4QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztZQUNsQixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUV0QixJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsSUFBSSxLQUFLLGdDQUFnQyxDQUFDLFlBQVksQ0FBQyxJQUFJLE1BQU0sS0FBSyxJQUFJLENBQUM7WUFFN0YsNEVBQTRFO1lBQzVFLCtJQUErSTtZQUMvSSxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSw0QkFBNEIsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNyRSxDQUFDO0tBQ0Q7SUF6Q0Qsb0VBeUNDO0lBMEJELFNBQWdCLHdCQUF3QixDQUFDLGVBQXVCO1FBQy9ELE1BQU0sU0FBUyxHQUFHLGVBQWUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDL0MsSUFBSSxTQUFTLEtBQUssQ0FBQyxDQUFDLEVBQUU7WUFDckIsT0FBTyxlQUFlLENBQUM7U0FDdkI7UUFDRCxPQUFPLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFORCw0REFNQyJ9