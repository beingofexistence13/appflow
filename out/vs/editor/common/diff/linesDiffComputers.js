/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/diff/legacyLinesDiffComputer", "vs/editor/common/diff/defaultLinesDiffComputer/defaultLinesDiffComputer"], function (require, exports, legacyLinesDiffComputer_1, defaultLinesDiffComputer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.linesDiffComputers = void 0;
    exports.linesDiffComputers = {
        getLegacy: () => new legacyLinesDiffComputer_1.LegacyLinesDiffComputer(),
        getDefault: () => new defaultLinesDiffComputer_1.DefaultLinesDiffComputer(),
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZXNEaWZmQ29tcHV0ZXJzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9kaWZmL2xpbmVzRGlmZkNvbXB1dGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFNbkYsUUFBQSxrQkFBa0IsR0FBRztRQUNqQyxTQUFTLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxpREFBdUIsRUFBRTtRQUM5QyxVQUFVLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxtREFBd0IsRUFBRTtLQUNHLENBQUMifQ==