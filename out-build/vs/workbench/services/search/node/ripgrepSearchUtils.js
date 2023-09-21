/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/arrays", "vs/platform/log/common/log", "vs/workbench/services/search/common/search", "vs/workbench/services/search/common/searchExtTypes"], function (require, exports, arrays_1, log_1, search_1, searchExtTypes) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$tdc = exports.$sdc = exports.$rdc = void 0;
    function $rdc(glob) {
        return glob.startsWith('**') || glob.startsWith('/') ? glob : `/${glob}`;
    }
    exports.$rdc = $rdc;
    /**
     * Create a vscode.TextSearchMatch by using our internal TextSearchMatch type for its previewOptions logic.
     */
    function $sdc(uri, text, range, previewOptions) {
        const searchRange = (0, arrays_1.$Zb)(range, rangeToSearchRange);
        const internalResult = new search_1.$tI(text, searchRange, previewOptions);
        const internalPreviewRange = internalResult.preview.matches;
        return {
            ranges: (0, arrays_1.$Zb)(searchRange, searchRangeToRange),
            uri,
            preview: {
                text: internalResult.preview.text,
                matches: (0, arrays_1.$Zb)(internalPreviewRange, searchRangeToRange)
            }
        };
    }
    exports.$sdc = $sdc;
    function rangeToSearchRange(range) {
        return new search_1.$uI(range.start.line, range.start.character, range.end.line, range.end.character);
    }
    function searchRangeToRange(range) {
        return new searchExtTypes.$iI(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn);
    }
    let $tdc = class $tdc {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        appendLine(msg) {
            this.b.debug(`${this.a}#search`, msg);
        }
    };
    exports.$tdc = $tdc;
    exports.$tdc = $tdc = __decorate([
        __param(1, log_1.$5i)
    ], $tdc);
});
//# sourceMappingURL=ripgrepSearchUtils.js.map