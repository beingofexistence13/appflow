/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$rm = exports.$qm = exports.$pm = exports.$om = exports.$nm = exports.ExtHostConnectionType = void 0;
    var ExtHostConnectionType;
    (function (ExtHostConnectionType) {
        ExtHostConnectionType[ExtHostConnectionType["IPC"] = 1] = "IPC";
        ExtHostConnectionType[ExtHostConnectionType["Socket"] = 2] = "Socket";
        ExtHostConnectionType[ExtHostConnectionType["MessagePort"] = 3] = "MessagePort";
    })(ExtHostConnectionType || (exports.ExtHostConnectionType = ExtHostConnectionType = {}));
    /**
     * The extension host will connect via named pipe / domain socket to its renderer.
     */
    class $nm {
        static { this.ENV_KEY = 'VSCODE_EXTHOST_IPC_HOOK'; }
        constructor(pipeName) {
            this.pipeName = pipeName;
            this.type = 1 /* ExtHostConnectionType.IPC */;
        }
        serialize(env) {
            env[$nm.ENV_KEY] = this.pipeName;
        }
    }
    exports.$nm = $nm;
    /**
     * The extension host will receive via nodejs IPC the socket to its renderer.
     */
    class $om {
        constructor() {
            this.type = 2 /* ExtHostConnectionType.Socket */;
        }
        static { this.ENV_KEY = 'VSCODE_EXTHOST_WILL_SEND_SOCKET'; }
        serialize(env) {
            env[$om.ENV_KEY] = '1';
        }
    }
    exports.$om = $om;
    /**
     * The extension host will receive via nodejs IPC the MessagePort to its renderer.
     */
    class $pm {
        constructor() {
            this.type = 3 /* ExtHostConnectionType.MessagePort */;
        }
        static { this.ENV_KEY = 'VSCODE_WILL_SEND_MESSAGE_PORT'; }
        serialize(env) {
            env[$pm.ENV_KEY] = '1';
        }
    }
    exports.$pm = $pm;
    function clean(env) {
        delete env[$nm.ENV_KEY];
        delete env[$om.ENV_KEY];
        delete env[$pm.ENV_KEY];
    }
    /**
     * Write `connection` into `env` and clean up `env`.
     */
    function $qm(connection, env) {
        // Avoid having two different keys that might introduce amiguity or problems.
        clean(env);
        connection.serialize(env);
    }
    exports.$qm = $qm;
    /**
     * Read `connection` from `env` and clean up `env`.
     */
    function $rm(env) {
        if (env[$nm.ENV_KEY]) {
            return cleanAndReturn(env, new $nm(env[$nm.ENV_KEY]));
        }
        if (env[$om.ENV_KEY]) {
            return cleanAndReturn(env, new $om());
        }
        if (env[$pm.ENV_KEY]) {
            return cleanAndReturn(env, new $pm());
        }
        throw new Error(`No connection information defined in environment!`);
    }
    exports.$rm = $rm;
    function cleanAndReturn(env, result) {
        clean(env);
        return result;
    }
});
//# sourceMappingURL=extensionHostEnv.js.map