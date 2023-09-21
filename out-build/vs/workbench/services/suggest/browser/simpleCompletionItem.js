/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/filters"], function (require, exports, filters_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Dib = void 0;
    class $Dib {
        constructor(completion) {
            this.completion = completion;
            // sorting, filtering
            this.score = filters_1.FuzzyScore.Default;
            this.distance = 0;
            // ensure lower-variants (perf)
            this.labelLow = this.completion.label.toLowerCase();
        }
    }
    exports.$Dib = $Dib;
});
//# sourceMappingURL=simpleCompletionItem.js.map