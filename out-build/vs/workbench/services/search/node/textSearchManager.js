/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/services/textfile/common/encoding", "vs/base/node/pfs", "vs/workbench/services/search/common/textSearchManager"], function (require, exports, encoding_1, pfs, textSearchManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Gdc = void 0;
    class $Gdc extends textSearchManager_1.$vcc {
        constructor(query, provider, _pfs = pfs, processType = 'searchProcess') {
            super(query, provider, {
                readdir: resource => _pfs.Promises.readdir(resource.fsPath),
                toCanonicalName: name => (0, encoding_1.$pD)(name)
            }, processType);
        }
    }
    exports.$Gdc = $Gdc;
});
//# sourceMappingURL=textSearchManager.js.map