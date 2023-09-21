/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/buffer"], function (require, exports, arrays_1, buffer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$rkb = void 0;
    class $rkb {
        constructor() {
            this.a = 0;
            this.b = new Map();
        }
        add(dataTransfer) {
            const requestId = this.a++;
            this.b.set(requestId, (0, arrays_1.$Fb)(Array.from(dataTransfer, ([, item]) => item.asFile())));
            return {
                id: requestId,
                dispose: () => {
                    this.b.delete(requestId);
                }
            };
        }
        async resolveFileData(requestId, dataItemId) {
            const files = this.b.get(requestId);
            if (!files) {
                throw new Error('No data transfer found');
            }
            const file = files.find(file => file.id === dataItemId);
            if (!file) {
                throw new Error('No matching file found in data transfer');
            }
            return buffer_1.$Fd.wrap(await file.data());
        }
        dispose() {
            this.b.clear();
        }
    }
    exports.$rkb = $rkb;
});
//# sourceMappingURL=dataTransferCache.js.map