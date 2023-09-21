/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/platform/instantiation/common/instantiation"], function (require, exports, arrays_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$jKb = exports.$iKb = void 0;
    class $iKb {
        constructor() {
            this.value = [];
        }
        /**
         * Adds a new value to the decorations.
         */
        push(value) {
            const searchIndex = (0, arrays_1.$ub)(this.value, value, (a, b) => a.line - b.line);
            this.value.splice(searchIndex < 0 ? ~searchIndex : searchIndex, 0, value);
        }
        /**
         * Gets decorations on each line.
         */
        *lines() {
            if (!this.value.length) {
                return;
            }
            let startIndex = 0;
            let startLine = this.value[0].line;
            for (let i = 1; i < this.value.length; i++) {
                const v = this.value[i];
                if (v.line !== startLine) {
                    yield [startLine, this.value.slice(startIndex, i)];
                    startLine = v.line;
                    startIndex = i;
                }
            }
            yield [startLine, this.value.slice(startIndex)];
        }
    }
    exports.$iKb = $iKb;
    exports.$jKb = (0, instantiation_1.$Bh)('testingDecorationService');
});
//# sourceMappingURL=testingDecorations.js.map