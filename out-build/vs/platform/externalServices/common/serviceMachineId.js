/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/uuid"], function (require, exports, buffer_1, uuid_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$2o = void 0;
    async function $2o(environmentService, fileService, storageService) {
        let uuid = storageService ? storageService.get('storage.serviceMachineId', -1 /* StorageScope.APPLICATION */) || null : null;
        if (uuid) {
            return uuid;
        }
        try {
            const contents = await fileService.readFile(environmentService.serviceMachineIdResource);
            const value = contents.value.toString();
            uuid = (0, uuid_1.$3f)(value) ? value : null;
        }
        catch (e) {
            uuid = null;
        }
        if (!uuid) {
            uuid = (0, uuid_1.$4f)();
            try {
                await fileService.writeFile(environmentService.serviceMachineIdResource, buffer_1.$Fd.fromString(uuid));
            }
            catch (error) {
                //noop
            }
        }
        storageService?.store('storage.serviceMachineId', uuid, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        return uuid;
    }
    exports.$2o = $2o;
});
//# sourceMappingURL=serviceMachineId.js.map