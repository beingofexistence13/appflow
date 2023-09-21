/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "cookie", "fs", "vs/base/common/path", "vs/base/common/uuid", "vs/base/common/network", "vs/base/node/pfs"], function (require, exports, cookie, fs, path, uuid_1, network_1, pfs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.requestHasValidConnectionToken = exports.determineServerConnectionToken = exports.parseServerConnectionToken = exports.ServerConnectionTokenParseError = exports.MandatoryServerConnectionToken = exports.NoneServerConnectionToken = exports.ServerConnectionTokenType = void 0;
    const connectionTokenRegex = /^[0-9A-Za-z_-]+$/;
    var ServerConnectionTokenType;
    (function (ServerConnectionTokenType) {
        ServerConnectionTokenType[ServerConnectionTokenType["None"] = 0] = "None";
        ServerConnectionTokenType[ServerConnectionTokenType["Optional"] = 1] = "Optional";
        ServerConnectionTokenType[ServerConnectionTokenType["Mandatory"] = 2] = "Mandatory";
    })(ServerConnectionTokenType || (exports.ServerConnectionTokenType = ServerConnectionTokenType = {}));
    class NoneServerConnectionToken {
        constructor() {
            this.type = 0 /* ServerConnectionTokenType.None */;
        }
        validate(connectionToken) {
            return true;
        }
    }
    exports.NoneServerConnectionToken = NoneServerConnectionToken;
    class MandatoryServerConnectionToken {
        constructor(value) {
            this.value = value;
            this.type = 2 /* ServerConnectionTokenType.Mandatory */;
        }
        validate(connectionToken) {
            return (connectionToken === this.value);
        }
    }
    exports.MandatoryServerConnectionToken = MandatoryServerConnectionToken;
    class ServerConnectionTokenParseError {
        constructor(message) {
            this.message = message;
        }
    }
    exports.ServerConnectionTokenParseError = ServerConnectionTokenParseError;
    async function parseServerConnectionToken(args, defaultValue) {
        const withoutConnectionToken = args['without-connection-token'];
        const connectionToken = args['connection-token'];
        const connectionTokenFile = args['connection-token-file'];
        if (withoutConnectionToken) {
            if (typeof connectionToken !== 'undefined' || typeof connectionTokenFile !== 'undefined') {
                return new ServerConnectionTokenParseError(`Please do not use the argument '--connection-token' or '--connection-token-file' at the same time as '--without-connection-token'.`);
            }
            return new NoneServerConnectionToken();
        }
        if (typeof connectionTokenFile !== 'undefined') {
            if (typeof connectionToken !== 'undefined') {
                return new ServerConnectionTokenParseError(`Please do not use the argument '--connection-token' at the same time as '--connection-token-file'.`);
            }
            let rawConnectionToken;
            try {
                rawConnectionToken = fs.readFileSync(connectionTokenFile).toString().replace(/\r?\n$/, '');
            }
            catch (e) {
                return new ServerConnectionTokenParseError(`Unable to read the connection token file at '${connectionTokenFile}'.`);
            }
            if (!connectionTokenRegex.test(rawConnectionToken)) {
                return new ServerConnectionTokenParseError(`The connection token defined in '${connectionTokenFile} does not adhere to the characters 0-9, a-z, A-Z, _, or -.`);
            }
            return new MandatoryServerConnectionToken(rawConnectionToken);
        }
        if (typeof connectionToken !== 'undefined') {
            if (!connectionTokenRegex.test(connectionToken)) {
                return new ServerConnectionTokenParseError(`The connection token '${connectionToken} does not adhere to the characters 0-9, a-z, A-Z or -.`);
            }
            return new MandatoryServerConnectionToken(connectionToken);
        }
        return new MandatoryServerConnectionToken(await defaultValue());
    }
    exports.parseServerConnectionToken = parseServerConnectionToken;
    async function determineServerConnectionToken(args) {
        const readOrGenerateConnectionToken = async () => {
            if (!args['user-data-dir']) {
                // No place to store it!
                return (0, uuid_1.generateUuid)();
            }
            const storageLocation = path.join(args['user-data-dir'], 'token');
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
            const connectionToken = (0, uuid_1.generateUuid)();
            try {
                // Try to store it
                await pfs_1.Promises.writeFile(storageLocation, connectionToken, { mode: 0o600 });
            }
            catch (err) { }
            return connectionToken;
        };
        return parseServerConnectionToken(args, readOrGenerateConnectionToken);
    }
    exports.determineServerConnectionToken = determineServerConnectionToken;
    function requestHasValidConnectionToken(connectionToken, req, parsedUrl) {
        // First check if there is a valid query parameter
        if (connectionToken.validate(parsedUrl.query[network_1.connectionTokenQueryName])) {
            return true;
        }
        // Otherwise, check if there is a valid cookie
        const cookies = cookie.parse(req.headers.cookie || '');
        return connectionToken.validate(cookies[network_1.connectionTokenCookieName]);
    }
    exports.requestHasValidConnectionToken = requestHasValidConnectionToken;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyQ29ubmVjdGlvblRva2VuLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvc2VydmVyL25vZGUvc2VydmVyQ29ubmVjdGlvblRva2VuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVloRyxNQUFNLG9CQUFvQixHQUFHLGtCQUFrQixDQUFDO0lBRWhELElBQWtCLHlCQUlqQjtJQUpELFdBQWtCLHlCQUF5QjtRQUMxQyx5RUFBSSxDQUFBO1FBQ0osaUZBQVEsQ0FBQTtRQUNSLG1GQUFTLENBQUE7SUFDVixDQUFDLEVBSmlCLHlCQUF5Qix5Q0FBekIseUJBQXlCLFFBSTFDO0lBRUQsTUFBYSx5QkFBeUI7UUFBdEM7WUFDaUIsU0FBSSwwQ0FBa0M7UUFLdkQsQ0FBQztRQUhPLFFBQVEsQ0FBQyxlQUFvQjtZQUNuQyxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7S0FDRDtJQU5ELDhEQU1DO0lBRUQsTUFBYSw4QkFBOEI7UUFHMUMsWUFBNEIsS0FBYTtZQUFiLFVBQUssR0FBTCxLQUFLLENBQVE7WUFGekIsU0FBSSwrQ0FBdUM7UUFHM0QsQ0FBQztRQUVNLFFBQVEsQ0FBQyxlQUFvQjtZQUNuQyxPQUFPLENBQUMsZUFBZSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6QyxDQUFDO0tBQ0Q7SUFURCx3RUFTQztJQUlELE1BQWEsK0JBQStCO1FBQzNDLFlBQ2lCLE9BQWU7WUFBZixZQUFPLEdBQVAsT0FBTyxDQUFRO1FBQzVCLENBQUM7S0FDTDtJQUpELDBFQUlDO0lBRU0sS0FBSyxVQUFVLDBCQUEwQixDQUFDLElBQXNCLEVBQUUsWUFBbUM7UUFDM0csTUFBTSxzQkFBc0IsR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUNoRSxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUNqRCxNQUFNLG1C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