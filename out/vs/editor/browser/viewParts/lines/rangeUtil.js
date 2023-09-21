/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/view/renderingContext"], function (require, exports, renderingContext_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RangeUtil = void 0;
    class RangeUtil {
        static _createRange() {
            if (!this._handyReadyRange) {
                this._handyReadyRange = document.createRange();
            }
            return this._handyReadyRange;
        }
        static _detachRange(range, endNode) {
            // Move range out of the span node, IE doesn't like having many ranges in
            // the same spot and will act badly for lines containing dashes ('-')
            range.selectNodeContents(endNode);
        }
        static _readClientRects(startElement, startOffset, endElement, endOffset, endNode) {
            const range = this._createRange();
            try {
                range.setStart(startElement, startOffset);
                range.setEnd(endElement, endOffset);
                return range.getClientRects();
            }
            catch (e) {
                // This is life ...
                return null;
            }
            finally {
                this._detachRange(range, endNode);
            }
        }
        static _mergeAdjacentRanges(ranges) {
            if (ranges.length === 1) {
                // There is nothing to merge
                return ranges;
            }
            ranges.sort(renderingContext_1.FloatHorizontalRange.compare);
            const result = [];
            let resultLen = 0;
            let prev = ranges[0];
            for (let i = 1, len = ranges.length; i < len; i++) {
                const range = ranges[i];
                if (prev.left + prev.width + 0.9 /* account for browser's rounding errors*/ >= range.left) {
                    prev.width = Math.max(prev.width, range.left + range.width - prev.left);
                }
                else {
                    result[resultLen++] = prev;
                    prev = range;
                }
            }
            result[resultLen++] = prev;
            return result;
        }
        static _createHorizontalRangesFromClientRects(clientRects, clientRectDeltaLeft, clientRectScale) {
            if (!clientRects || clientRects.length === 0) {
                return null;
            }
            // We go through FloatHorizontalRange because it has been observed in bi-di text
            // that the clientRects are not coming in sorted from the browser
            const result = [];
            for (let i = 0, len = clientRects.length; i < len; i++) {
                const clientRect = clientRects[i];
                result[i] = new renderingContext_1.FloatHorizontalRange(Math.max(0, (clientRect.left - clientRectDeltaLeft) / clientRectScale), clientRect.width / clientRectScale);
            }
            return this._mergeAdjacentRanges(result);
        }
        static readHorizontalRanges(domNode, startChildIndex, startOffset, endChildIndex, endOffset, context) {
            // Panic check
            const min = 0;
            const max = domNode.children.length - 1;
            if (min > max) {
                return null;
            }
            startChildIndex = Math.min(max, Math.max(min, startChildIndex));
            endChildIndex = Math.min(max, Math.max(min, endChildIndex));
            if (startChildIndex === endChildIndex && startOffset === endOffset && startOffset === 0 && !domNode.children[startChildIndex].firstChild) {
                // We must find the position at the beginning of a <span>
                // To cover cases of empty <span>s, avoid using a range and use the <span>'s bounding box
                const clientRects = domNode.children[startChildIndex].getClientRects();
                context.markDidDomLayout();
                return this._createHorizontalRangesFromClientRects(clientRects, context.clientRectDeltaLeft, context.clientRectScale);
            }
            // If crossing over to a span only to select offset 0, then use the previous span's maximum offset
            // Chrome is buggy and doesn't handle 0 offsets well sometimes.
            if (startChildIndex !== endChildIndex) {
                if (endChildIndex > 0 && endOffset === 0) {
                    endChildIndex--;
                    endOffset = 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */;
                }
            }
            let startElement = domNode.children[startChildIndex].firstChild;
            let endElement = domNode.children[endChildIndex].firstChild;
            if (!startElement || !endElement) {
                // When having an empty <span> (without any text content), try to move to the previous <span>
                if (!startElement && startOffset === 0 && startChildIndex > 0) {
                    startElement = domNode.children[startChildIndex - 1].firstChild;
                    startOffset = 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */;
                }
                if (!endElement && endOffset === 0 && endChildIndex > 0) {
                    endElement = domNode.children[endChildIndex - 1].firstChild;
                    endOffset = 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */;
                }
            }
            if (!startElement || !endElement) {
                return null;
            }
            startOffset = Math.min(startElement.textContent.length, Math.max(0, startOffset));
            endOffset = Math.min(endElement.textContent.length, Math.max(0, endOffset));
            const clientRects = this._readClientRects(startElement, startOffset, endElement, endOffset, context.endNode);
            context.markDidDomLayout();
            return this._createHorizontalRangesFromClientRects(clientRects, context.clientRectDeltaLeft, context.clientRectScale);
        }
    }
    exports.RangeUtil = RangeUtil;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZ2VVdGlsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2Jyb3dzZXIvdmlld1BhcnRzL2xpbmVzL3JhbmdlVXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFNaEcsTUFBYSxTQUFTO1FBU2IsTUFBTSxDQUFDLFlBQVk7WUFDMUIsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtnQkFDM0IsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQzthQUMvQztZQUNELE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDO1FBQzlCLENBQUM7UUFFTyxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQVksRUFBRSxPQUFvQjtZQUM3RCx5RUFBeUU7WUFDekUscUVBQXFFO1lBQ3JFLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNuQyxDQUFDO1FBRU8sTUFBTSxDQUFDLGdCQUFnQixDQUFDLFlBQWtCLEVBQUUsV0FBbUIsRUFBRSxVQUFnQixFQUFFLFNBQWlCLEVBQUUsT0FBb0I7WUFDakksTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ2xDLElBQUk7Z0JBQ0gsS0FBSyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBQzFDLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUVwQyxPQUFPLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQzthQUM5QjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNYLG1CQUFtQjtnQkFDbkIsT0FBTyxJQUFJLENBQUM7YUFDWjtvQkFBUztnQkFDVCxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQzthQUNsQztRQUNGLENBQUM7UUFFTyxN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