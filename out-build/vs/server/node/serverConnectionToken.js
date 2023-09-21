/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "cookie", "fs", "vs/base/common/path", "vs/base/common/uuid", "vs/base/common/network", "vs/base/node/pfs"], function (require, exports, cookie, fs, path, uuid_1, network_1, pfs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Am = exports.$zm = exports.$ym = exports.$xm = exports.$wm = exports.$vm = exports.ServerConnectionTokenType = void 0;
    const connectionTokenRegex = /^[0-9A-Za-z_-]+$/;
    var ServerConnectionTokenType;
    (function (ServerConnectionTokenType) {
        ServerConnectionTokenType[ServerConnectionTokenType["None"] = 0] = "None";
        ServerConnectionTokenType[ServerConnectionTokenType["Optional"] = 1] = "Optional";
        ServerConnectionTokenType[ServerConnectionTokenType["Mandatory"] = 2] = "Mandatory";
    })(ServerConnectionTokenType || (exports.ServerConnectionTokenType = ServerConnectionTokenType = {}));
    class $vm {
        constructor() {
            this.type = 0 /* ServerConnectionTokenType.None */;
        }
        validate(connectionToken) {
            return true;
        }
    }
    exports.$vm = $vm;
    class $wm {
        constructor(value) {
            this.value = value;
            this.type = 2 /* ServerConnectionTokenType.Mandatory */;
        }
        validate(connectionToken) {
            return (connectionToken === this.value);
        }
    }
    exports.$wm = $wm;
    class $xm {
        constructor(message) {
            this.message = message;
        }
    }
    exports.$xm = $xm;
    async function $ym(args, defaultValue) {
        const withoutConnectionToken = args['without-connection-token'];
        const connectionToken = args['connection-token'];
        const connectionTokenFile = args['connection-token-file'];
        if (withoutConnectionToken) {
            if (typeof connectionToken !== 'undefined' || typeof connectionTokenFile !== 'undefined') {
                return new $xm(`Please do not use the argument '--connection-token' or '--connection-token-file' at the same time as '--without-connection-token'.`);
            }
            return new $vm();
        }
        if (typeof connectionTokenFile !== 'undefined') {
            if (typeof connectionToken !== 'undefined') {
                return new $xm(`Please do not use the argument '--connection-token' at the same time as '--connection-token-file'.`);
            }
            let rawConnectionToken;
            try {
                rawConnectionToken = fs.readFileSync(connectionTokenFile).toString().replace(/\r?\n$/, '');
            }
            catch (e) {
                return new $xm(`Unable to read the connection token file at '${connectionTokenFile}'.`);
            }
            if (!connectionTokenRegex.test(rawConnectionToken)) {
                return new $xm(`The connection token defined in '${connectionTokenFile} does not adhere to the characters 0-9, a-z, A-Z, _, or -.`);
            }
            return new $wm(rawConnectionToken);
        }
        if (typeof connectionToken !== 'undefined') {
            if (!connectionTokenRegex.test(connectionToken)) {
                return new $xm(`The connection token '${connectionToken} does not adhere to the characters 0-9, a-z, A-Z or -.`);
            }
            return new $wm(connectionToken);
        }
        return new $wm(await defaultValue());
    }
    exports.$ym = $ym;
    async function $zm(args) {
        const readOrGenerateConnectionToken = async () => {
            if (!args['user-data-dir']) {
                // No place to store it!
                return (0, uuid_1.$4f)();
            }
            const storageLocation = path.$9d(args['user-data-dir'], 'token');
            // First try to find a connection token
            try {
                const fileContents = await pfs_1.Promises.readFile(storageLocation);
                const connectionToken = fileContents.toString().replace(/\r?\n$/, '');
                if (connectionTokenRegex.test(connectionToken)) {
                    return connectionToken;
                }
            }
            catch (err) { }
            // No connection token found, generate one
            const connectionToken = (0, uuid_1.$4f)();
            try {
                // Try to store it
                await pfs_1.Promises.writeFile(storageLocation, connectionToken, { mode: 0o600 });
            }
            catch (err) { }
            return connectionToken;
        };
        return $ym(args, readOrGenerateConnectionToken);
    }
    exports.$zm = $zm;
    function $Am(connectionToken, req, parsedUrl) {
        // First check if there is a valid query parameter
        if (connectionToken.validate(parsedUrl.query[network_1.$Vf])) {
            return true;
        }
        // Otherwise, check if there is a valid cookie
        const cookies = cookie.parse(req.headers.cookie || '');
        return connectionToken.validate(cookies[network_1.$Uf]);
    }
    exports.$Am = $Am;
});
//# sourceMappingURL=serverConnectionToken.js.map