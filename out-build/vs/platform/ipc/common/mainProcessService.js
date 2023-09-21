/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$p7b = exports.$o7b = void 0;
    exports.$o7b = (0, instantiation_1.$Bh)('mainProcessService');
    /**
     * An implementation of `IMainProcessService` that leverages `IPCServer`.
     */
    class $p7b {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        getChannel(channelName) {
            return this.a.getChannel(channelName, this.b);
        }
        registerChannel(channelName, channel) {
            this.a.registerChannel(channelName, channel);
        }
    }
    exports.$p7b = $p7b;
});
//# sourceMappingURL=mainProcessService.js.map