/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "vs/platform/environment/common/environmentService", "vs/platform/environment/node/userDataPath"], function (require, exports, os_1, environmentService_1, userDataPath_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$bm = exports.$am = exports.$_l = void 0;
    class $_l extends environmentService_1.$9l {
        constructor(args, productService) {
            super(args, {
                homeDir: (0, os_1.homedir)(),
                tmpDir: (0, os_1.tmpdir)(),
                userDataDir: (0, userDataPath_1.getUserDataPath)(args, productService.nameShort)
            }, productService);
        }
    }
    exports.$_l = $_l;
    function $am(args, isBuilt) {
        return (0, environmentService_1.$$l)(args['inspect-ptyhost'], args['inspect-brk-ptyhost'], 5877, isBuilt, args.extensionEnvironment);
    }
    exports.$am = $am;
    function $bm(args, isBuilt) {
        return (0, environmentService_1.$$l)(args['inspect-sharedprocess'], args['inspect-brk-sharedprocess'], 5879, isBuilt, args.extensionEnvironment);
    }
    exports.$bm = $bm;
});
//# sourceMappingURL=environmentService.js.map