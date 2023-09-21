/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle"], function (require, exports, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$V0b = void 0;
    exports.$V0b = Object.freeze({
        _serviceBrand: undefined,
        registerOpener() { return lifecycle_1.$kc.None; },
        registerValidator() { return lifecycle_1.$kc.None; },
        registerExternalUriResolver() { return lifecycle_1.$kc.None; },
        setDefaultExternalOpener() { },
        registerExternalOpener() { return lifecycle_1.$kc.None; },
        async open() { return false; },
        async resolveExternalUri(uri) { return { resolved: uri, dispose() { } }; },
    });
});
//# sourceMappingURL=nullOpenerService.js.map