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
    exports.OutputChannel = exports.createTextSearchResult = exports.anchorGlob = void 0;
    function anchorGlob(glob) {
        return glob.startsWith('**') || glob.startsWith('/') ? glob : `/${glob}`;
    }
    exports.anchorGlob = anchorGlob;
    /**
     * Create a vscode.TextSearchMatch by using our internal TextSearchMatch type for its previewOptions logic.
     */
    function createTextSearchResult(uri, text, range, previewOptions) {
        const searchRange = (0, arrays_1.mapArrayOrNot)(range, rangeToSearchRange);
        const internalResult = new search_1.TextSearchMatch(text, searchRange, previewOptions);
        const internalPreviewRange = internalResult.preview.matches;
        return {
            ranges: (0, arrays_1.mapArrayOrNot)(searchRange, searchRangeToRange),
            uri,
            preview: {
                text: internalResult.preview.text,
                matches: (0, arrays_1.mapArrayOrNot)(internalPreviewRange, searchRangeToRange)
            }
        };
    }
    exports.createTextSearchResult = createTextSearchResult;
    function rangeToSearchRange(range) {
        return new search_1.SearchRange(range.start.line, range.start.character, range.end.line, range.end.character);
    }
    function searchRangeToRange(range) {
        return new searchExtTypes.Range(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn);
    }
    let OutputChannel = class OutputChannel {
        constructor(prefix, logService) {
            this.prefix = prefix;
            this.logService = logService;
        }
        appendLine(msg) {
            this.logService.debug(`${this.prefix}#search`, msg);
        }
    };
    exports.OutputChannel = OutputChannel;
    exports.OutputChannel = OutputChannel = __decorate([
        __param(1, log_1.ILogService)
    ], OutputChannel);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmlwZ3JlcFNlYXJjaFV0aWxzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3NlYXJjaC9ub2RlL3JpcGdyZXBTZWFyY2hVdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFVaEcsU0FBZ0IsVUFBVSxDQUFDLElBQVk7UUFDdEMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUMxRSxDQUFDO0lBRkQsZ0NBRUM7SUFFRDs7T0FFRztJQUNILFNBQWdCLHNCQUFzQixDQUFDLEdBQVEsRUFBRSxJQUFZLEVBQUUsS0FBb0QsRUFBRSxjQUF3RDtRQUM1SyxNQUFNLFdBQVcsR0FBRyxJQUFBLHNCQUFhLEVBQUMsS0FBSyxFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFFN0QsTUFBTSxjQUFjLEdBQUcsSUFBSSx3QkFBZSxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDOUUsTUFBTSxvQkFBb0IsR0FBRyxjQUFjLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztRQUM1RCxPQUFPO1lBQ04sTUFBTSxFQUFFLElBQUEsc0JBQWEsRUFBQyxXQUFXLEVBQUUsa0JBQWtCLENBQUM7WUFDdEQsR0FBRztZQUNILE9BQU8sRUFBRTtnQkFDUixJQUFJLEVBQUUsY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJO2dCQUNqQyxPQUFPLEVBQUUsSUFBQSxzQkFBYSxFQUFDLG9CQUFvQixFQUFFLGtCQUFrQixDQUFDO2FBQ2hFO1NBQ0QsQ0FBQztJQUNILENBQUM7SUFiRCx3REFhQztJQUVELFNBQVMsa0JBQWtCLENBQUMsS0FBMkI7UUFDdEQsT0FBTyxJQUFJLG9CQUFXLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN0RyxDQUFDO0lBRUQsU0FBUyxrQkFBa0IsQ0FBQyxLQUFrQjtRQUM3QyxPQUFPLElBQUksY0FBYyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLEtBQUssQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDakgsQ0FBQztJQU1NLElBQU0sYUFBYSxHQUFuQixNQUFNLGFBQWE7UUFDekIsWUFBb0IsTUFBYyxFQUFnQyxVQUF1QjtZQUFyRSxXQUFNLEdBQU4sTUFBTSxDQUFRO1lBQWdDLGVBQVUsR0FBVixVQUFVLENBQWE7UUFBSSxDQUFDO1FBRTlGLFVBQVUsQ0FBQyxHQUFXO1lBQ3JCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3JELENBQUM7S0FDRCxDQUFBO0lBTlksc0NBQWE7NEJBQWIsYUFBYTtRQUNZLFdBQUEsaUJBQVcsQ0FBQTtPQURwQyxhQUFhLENBTXpCIn0=