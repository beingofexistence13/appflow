/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/telemetry/common/1dsAppender"], function (require, exports, _1dsAppender_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$33b = void 0;
    class $33b extends _1dsAppender_1.$_M {
        constructor(isInternalTelemetry, eventPrefix, defaultData, iKeyOrClientFactory) {
            super(isInternalTelemetry, eventPrefix, defaultData, iKeyOrClientFactory);
            // If we cannot fetch the endpoint it means it is down and we should not send any telemetry.
            // This is most likely due to ad blockers
            fetch(this.d, { method: 'GET' }).catch(err => {
                this.a = undefined;
            });
        }
    }
    exports.$33b = $33b;
});
//# sourceMappingURL=1dsAppender.js.map