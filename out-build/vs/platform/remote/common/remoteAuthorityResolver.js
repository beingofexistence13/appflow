/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/platform/instantiation/common/instantiation"], function (require, exports, errors_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Nk = exports.$Mk = exports.RemoteAuthorityResolverErrorCode = exports.$Lk = exports.$Kk = exports.RemoteConnectionType = exports.$Jk = void 0;
    exports.$Jk = (0, instantiation_1.$Bh)('remoteAuthorityResolverService');
    var RemoteConnectionType;
    (function (RemoteConnectionType) {
        RemoteConnectionType[RemoteConnectionType["WebSocket"] = 0] = "WebSocket";
        RemoteConnectionType[RemoteConnectionType["Managed"] = 1] = "Managed";
    })(RemoteConnectionType || (exports.RemoteConnectionType = RemoteConnectionType = {}));
    class $Kk {
        constructor(id) {
            this.id = id;
            this.type = 1 /* RemoteConnectionType.Managed */;
        }
        toString() {
            return `Managed(${this.id})`;
        }
    }
    exports.$Kk = $Kk;
    class $Lk {
        constructor(host, port) {
            this.host = host;
            this.port = port;
            this.type = 0 /* RemoteConnectionType.WebSocket */;
        }
        toString() {
            return `WebSocket(${this.host}:${this.port})`;
        }
    }
    exports.$Lk = $Lk;
    var RemoteAuthorityResolverErrorCode;
    (function (RemoteAuthorityResolverErrorCode) {
        RemoteAuthorityResolverErrorCode["Unknown"] = "Unknown";
        RemoteAuthorityResolverErrorCode["NotAvailable"] = "NotAvailable";
        RemoteAuthorityResolverErrorCode["TemporarilyNotAvailable"] = "TemporarilyNotAvailable";
        RemoteAuthorityResolverErrorCode["NoResolverFound"] = "NoResolverFound";
        RemoteAuthorityResolverErrorCode["InvalidAuthority"] = "InvalidAuthority";
    })(RemoteAuthorityResolverErrorCode || (exports.RemoteAuthorityResolverErrorCode = RemoteAuthorityResolverErrorCode = {}));
    class $Mk extends errors_1.$_ {
        static isNotAvailable(err) {
            return (err instanceof $Mk) && err._code === RemoteAuthorityResolverErrorCode.NotAvailable;
        }
        static isTemporarilyNotAvailable(err) {
            return (err instanceof $Mk) && err._code === RemoteAuthorityResolverErrorCode.TemporarilyNotAvailable;
        }
        static isNoResolverFound(err) {
            return (err instanceof $Mk) && err._code === RemoteAuthorityResolverErrorCode.NoResolverFound;
        }
        static isInvalidAuthority(err) {
            return (err instanceof $Mk) && err._code === RemoteAuthorityResolverErrorCode.InvalidAuthority;
        }
        static isHandled(err) {
            return (err instanceof $Mk) && err.isHandled;
        }
        constructor(message, code = RemoteAuthorityResolverErrorCode.Unknown, detail) {
            super(message);
            this._message = message;
            this._code = code;
            this._detail = detail;
            this.isHandled = (code === RemoteAuthorityResolverErrorCode.NotAvailable) && detail === true;
            // workaround when extending builtin objects and when compiling to ES5, see:
            // https://github.com/microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
            Object.setPrototypeOf(this, $Mk.prototype);
        }
    }
    exports.$Mk = $Mk;
    function $Nk(remoteAuthority) {
        const plusIndex = remoteAuthority.indexOf('+');
        if (plusIndex === -1) {
            return remoteAuthority;
        }
        return remoteAuthority.substring(0, plusIndex);
    }
    exports.$Nk = $Nk;
});
//# sourceMappingURL=remoteAuthorityResolver.js.map