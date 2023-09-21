/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestEditorWorkerService = void 0;
    class TestEditorWorkerService {
        canComputeUnicodeHighlights(uri) { return false; }
        async computedUnicodeHighlights(uri) { return { ranges: [], hasMore: false, ambiguousCharacterCount: 0, invisibleCharacterCount: 0, nonBasicAsciiCharacterCount: 0 }; }
        async computeDiff(original, modified, options, algorithm) { return null; }
        canComputeDirtyDiff(original, modified) { return false; }
        async computeDirtyDiff(original, modified, ignoreTrimWhitespace) { return null; }
        async computeMoreMinimalEdits(resource, edits) { return undefined; }
        async computeHumanReadableDiff(resource, edits) { return undefined; }
        canComputeWordRanges(resource) { return false; }
        async computeWordRanges(resource, range) { return null; }
        canNavigateValueSet(resource) { return false; }
        async navigateValueSet(resource, range, up) { return null; }
    }
    exports.TestEditorWorkerService = TestEditorWorkerService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdEVkaXRvcldvcmtlclNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvdGVzdC9jb21tb24vc2VydmljZXMvdGVzdEVkaXRvcldvcmtlclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU2hHLE1BQWEsdUJBQXVCO1FBSW5DLDJCQUEyQixDQUFDLEdBQVEsSUFBYSxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDaEUsS0FBSyxDQUFDLHlCQUF5QixDQUFDLEdBQVEsSUFBdUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSx1QkFBdUIsRUFBRSxDQUFDLEVBQUUsdUJBQXVCLEVBQUUsQ0FBQyxFQUFFLDJCQUEyQixFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMvTSxLQUFLLENBQUMsV0FBVyxDQUFDLFFBQWEsRUFBRSxRQUFhLEVBQUUsT0FBcUMsRUFBRSxTQUE0QixJQUFtQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDcEssbUJBQW1CLENBQUMsUUFBYSxFQUFFLFFBQWEsSUFBYSxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDNUUsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFFBQWEsRUFBRSxRQUFhLEVBQUUsb0JBQTZCLElBQStCLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQztRQUMvSCxLQUFLLENBQUMsdUJBQXVCLENBQUMsUUFBYSxFQUFFLEtBQW9DLElBQXFDLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQztRQUN6SSxLQUFLLENBQUMsd0JBQXdCLENBQUMsUUFBYSxFQUFFLEtBQW9DLElBQXFDLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQztRQUMxSSxvQkFBb0IsQ0FBQyxRQUFhLElBQWEsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQzlELEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxRQUFhLEVBQUUsS0FBYSxJQUFrRCxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDcEgsbUJBQW1CLENBQUMsUUFBYSxJQUFhLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQztRQUM3RCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsUUFBYSxFQUFFLEtBQWEsRUFBRSxFQUFXLElBQWtELE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQztLQUNoSTtJQWZELDBEQWVDIn0=