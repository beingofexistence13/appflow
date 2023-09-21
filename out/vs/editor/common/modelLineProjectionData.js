/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/assert", "vs/editor/common/core/position", "vs/editor/common/model"], function (require, exports, assert_1, position_1, model_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OutputPosition = exports.InjectedText = exports.ModelLineProjectionData = void 0;
    /**
     * *input*:
     * ```
     * xxxxxxxxxxxxxxxxxxxxxxxxxxx
     * ```
     *
     * -> Applying injections `[i...i]`, *inputWithInjections*:
     * ```
     * xxxxxx[iiiiiiiiii]xxxxxxxxxxxxxxxxx[ii]xxxx
     * ```
     *
     * -> breaking at offsets `|` in `xxxxxx[iiiiiii|iii]xxxxxxxxxxx|xxxxxx[ii]xxxx|`:
     * ```
     * xxxxxx[iiiiiii
     * iii]xxxxxxxxxxx
     * xxxxxx[ii]xxxx
     * ```
     *
     * -> applying wrappedTextIndentLength, *output*:
     * ```
     * xxxxxx[iiiiiii
     *    iii]xxxxxxxxxxx
     *    xxxxxx[ii]xxxx
     * ```
     */
    class ModelLineProjectionData {
        constructor(injectionOffsets, 
        /**
         * `injectionOptions.length` must equal `injectionOffsets.length`
         */
        injectionOptions, 
        /**
         * Refers to offsets after applying injections to the source.
         * The last break offset indicates the length of the source after applying injections.
         */
        breakOffsets, 
        /**
         * Refers to offsets after applying injections
         */
        breakOffsetsVisibleColumn, wrappedTextIndentLength) {
            this.injectionOffsets = injectionOffsets;
            this.injectionOptions = injectionOptions;
            this.breakOffsets = breakOffsets;
            this.breakOffsetsVisibleColumn = breakOffsetsVisibleColumn;
            this.wrappedTextIndentLength = wrappedTextIndentLength;
        }
        getOutputLineCount() {
            return this.breakOffsets.length;
        }
        getMinOutputOffset(outputLineIndex) {
            if (outputLineIndex > 0) {
                return this.wrappedTextIndentLength;
            }
            return 0;
        }
        getLineLength(outputLineIndex) {
            // These offsets refer to model text with injected text.
            const startOffset = outputLineIndex > 0 ? this.breakOffsets[outputLineIndex - 1] : 0;
            const endOffset = this.breakOffsets[outputLineIndex];
            let lineLength = endOffset - startOffset;
            if (outputLineIndex > 0) {
                lineLength += this.wrappedTextIndentLength;
            }
            return lineLength;
        }
        getMaxOutputOffset(outputLineIndex) {
            return this.getLineLength(outputLineIndex);
        }
        translateToInputOffset(outputLineIndex, outputOffset) {
            if (outputLineIndex > 0) {
                outputOffset = Math.max(0, outputOffset - this.wrappedTextIndentLength);
            }
            const offsetInInputWithInjection = outputLineIndex === 0 ? outputOffset : this.breakOffsets[outputLineIndex - 1] + outputOffset;
            let offsetInInput = offsetInInputWithInjection;
            if (this.injectionOffsets !== null) {
                for (let i = 0; i < this.injectionOffsets.length; i++) {
                    if (offsetInInput > this.injectionOffsets[i]) {
                        if (offsetInInput < this.injectionOffsets[i] + this.injectionOptions[i].content.length) {
                            // `inputOffset` is within injected text
                            offsetInInput = this.injectionOffsets[i];
                        }
                        else {
                            offsetInInput -= this.injectionOptions[i].content.length;
                        }
                    }
                    else {
                        break;
                    }
                }
            }
            return offsetInInput;
        }
        translateToOutputPosition(inputOffset, affinity = 2 /* PositionAffinity.None */) {
            let inputOffsetInInputWithInjection = inputOffset;
            if (this.injectionOffsets !== null) {
                for (let i = 0; i < this.injectionOffsets.length; i++) {
                    if (inputOffset < this.injectionOffsets[i]) {
                        break;
                    }
                    if (affinity !== 1 /* PositionAffinity.Right */ && inputOffset === this.injectionOffsets[i]) {
                        break;
                    }
                    inputOffsetInInputWithInjection += this.injectionOptions[i].content.length;
                }
            }
            return this.offsetInInputWithInjectionsToOutputPosition(inputOffsetInInputWithInjection, affinity);
        }
        offsetInInputWithInjectionsToOutputPosition(offsetInInputWithInjections, affinity = 2 /* PositionAffinity.None */) {
            let low = 0;
            let high = this.breakOffsets.length - 1;
            let mid = 0;
            let midStart = 0;
            while (low <= high) {
                mid = low + ((high - low) / 2) | 0;
                const midStop = this.breakOffsets[mid];
                midStart = mid > 0 ? this.breakOffsets[mid - 1] : 0;
                if (affinity === 0 /* PositionAffinity.Left */) {
                    if (offsetInInputWithInjections <= midStart) {
                        high = mid - 1;
                    }
                    else if (offsetInInputWithInjections > midStop) {
                        low = mid + 1;
                    }
                    else {
                        break;
                    }
                }
                else {
                    if (offsetInInputWithInjections < midStart) {
                        high = mid - 1;
                    }
                    else if (offsetInInputWithInjections >= midStop) {
                        low = mid + 1;
                    }
                    else {
                        break;
                    }
                }
            }
            let outputOffset = offsetInInputWithInjections - midStart;
            if (mid > 0) {
                outputOffset += this.wrappedTextIndentLength;
            }
            return new OutputPosition(mid, outputOffset);
        }
        normalizeOutputPosition(outputLineIndex, outputOffset, affinity) {
            if (this.injectionOffsets !== null) {
                const offsetInInputWithInjections = this.outputPositionToOffsetInInputWithInjections(outputLineIndex, outputOffset);
                const normalizedOffsetInUnwrappedLine = this.normalizeOffsetInInputWithInjectionsAroundInjections(offsetInInputWithInjections, affinity);
                if (normalizedOffsetInUnwrappedLine !== offsetInInputWithInjections) {
                    // injected text caused a change
                    return this.offsetInInputWithInjectionsToOutputPosition(normalizedOffsetInUnwrappedLine, affinity);
                }
            }
            if (affinity === 0 /* PositionAffinity.Left */) {
                if (outputLineIndex > 0 && outputOffset === this.getMinOutputOffset(outputLineIndex)) {
                    return new OutputPosition(outputLineIndex - 1, this.getMaxOutputOffset(outputLineIndex - 1));
                }
            }
            else if (affinity === 1 /* PositionAffinity.Right */) {
                const maxOutputLineIndex = this.getOutputLineCount() - 1;
                if (outputLineIndex < maxOutputLineIndex && outputOffset === this.getMaxOutputOffset(outputLineIndex)) {
                    return new OutputPosition(outputLineIndex + 1, this.getMinOutputOffset(outputLineIndex + 1));
                }
            }
            return new OutputPosition(outputLineIndex, outputOffset);
        }
        outputPositionToOffsetInInputWithInjections(outputLineIndex, outputOffset) {
            if (outputLineIndex > 0) {
                outputOffset = Math.max(0, outputOffset - this.wrappedTextIndentLength);
            }
            const result = (outputLineIndex > 0 ? this.breakOffsets[outputLineIndex - 1] : 0) + outputOffset;
            return result;
        }
        normalizeOffsetInInputWithInjectionsAroundInjections(offsetInInputWithInjections, affinity) {
            const injectedText = this.getInjectedTextAtOffset(offsetInInputWithInjections);
            if (!injectedText) {
                return offsetInInputWithInjections;
            }
            if (affinity === 2 /* PositionAffinity.None */) {
                if (offsetInInputWithInjections === injectedText.offsetInInputWithInjections + injectedText.length
                    && hasRightCursorStop(this.injectionOptions[injectedText.injectedTextIndex].cursorStops)) {
                    return injectedText.offsetInInputWithInjections + injectedText.length;
                }
                else {
                    let result = injectedText.offsetInInputWithInjections;
                    if (hasLeftCursorStop(this.injectionOptions[injectedText.injectedTextIndex].cursorStops)) {
                        return result;
                    }
                    let index = injectedText.injectedTextIndex - 1;
                    while (index >= 0 && this.injectionOffsets[index] === this.injectionOffsets[injectedText.injectedTextIndex]) {
                        if (hasRightCursorStop(this.injectionOptions[index].cursorStops)) {
                            break;
                        }
                        result -= this.injectionOptions[index].content.length;
                        if (hasLeftCursorStop(this.injectionOptions[index].cursorStops)) {
                            break;
                        }
                        index--;
                    }
                    return result;
                }
            }
            else if (affinity === 1 /* PositionAffinity.Right */ || affinity === 4 /* PositionAffinity.RightOfInjectedText */) {
                let result = injectedText.offsetInInputWithInjections + injectedText.length;
                let index = injectedText.injectedTextIndex;
                // traverse all injected text that touch each other
                while (index + 1 < this.injectionOffsets.length && this.injectionOffsets[index + 1] === this.injectionOffsets[index]) {
                    result += this.injectionOptions[index + 1].content.length;
                    index++;
                }
                return result;
            }
            else if (affinity === 0 /* PositionAffinity.Left */ || affinity === 3 /* PositionAffinity.LeftOfInjectedText */) {
                // affinity is left
                let result = injectedText.offsetInInputWithInjections;
                let index = injectedText.injectedTextIndex;
                // traverse all injected text that touch each other
                while (index - 1 >= 0 && this.injectionOffsets[index - 1] === this.injectionOffsets[index]) {
                    result -= this.injectionOptions[index - 1].content.length;
                    index--;
                }
                return result;
            }
            (0, assert_1.assertNever)(affinity);
        }
        getInjectedText(outputLineIndex, outputOffset) {
            const offset = this.outputPositionToOffsetInInputWithInjections(outputLineIndex, outputOffset);
            const injectedText = this.getInjectedTextAtOffset(offset);
            if (!injectedText) {
                return null;
            }
            return {
                options: this.injectionOptions[injectedText.injectedTextIndex]
            };
        }
        getInjectedTextAtOffset(offsetInInputWithInjections) {
            const injectionOffsets = this.injectionOffsets;
            const injectionOptions = this.injectionOptions;
            if (injectionOffsets !== null) {
                let totalInjectedTextLengthBefore = 0;
                for (let i = 0; i < injectionOffsets.length; i++) {
                    const length = injectionOptions[i].content.length;
                    const injectedTextStartOffsetInInputWithInjections = injectionOffsets[i] + totalInjectedTextLengthBefore;
                    const injectedTextEndOffsetInInputWithInjections = injectionOffsets[i] + totalInjectedTextLengthBefore + length;
                    if (injectedTextStartOffsetInInputWithInjections > offsetInInputWithInjections) {
                        // Injected text starts later.
                        break; // All later injected texts have an even larger offset.
                    }
                    if (offsetInInputWithInjections <= injectedTextEndOffsetInInputWithInjections) {
                        // Injected text ends after or with the given position (but also starts with or before it).
                        return {
                            injectedTextIndex: i,
                            offsetInInputWithInjections: injectedTextStartOffsetInInputWithInjections,
                            length
                        };
                    }
                    totalInjectedTextLengthBefore += length;
                }
            }
            return undefined;
        }
    }
    exports.ModelLineProjectionData = ModelLineProjectionData;
    function hasRightCursorStop(cursorStop) {
        if (cursorStop === null || cursorStop === undefined) {
            return true;
        }
        return cursorStop === model_1.InjectedTextCursorStops.Right || cursorStop === model_1.InjectedTextCursorStops.Both;
    }
    function hasLeftCursorStop(cursorStop) {
        if (cursorStop === null || cursorStop === undefined) {
            return true;
        }
        return cursorStop === model_1.InjectedTextCursorStops.Left || cursorStop === model_1.InjectedTextCursorStops.Both;
    }
    class InjectedText {
        constructor(options) {
            this.options = options;
        }
    }
    exports.InjectedText = InjectedText;
    class OutputPosition {
        constructor(outputLineIndex, outputOffset) {
            this.outputLineIndex = outputLineIndex;
            this.outputOffset = outputOffset;
        }
        toString() {
            return `${this.outputLineIndex}:${this.outputOffset}`;
        }
        toPosition(baseLineNumber) {
            return new position_1.Position(baseLineNumber + this.outputLineIndex, this.outputOffset + 1);
        }
    }
    exports.OutputPosition = OutputPosition;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWxMaW5lUHJvamVjdGlvbkRhdGEuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL21vZGVsTGluZVByb2plY3Rpb25EYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVNoRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09Bd0JHO0lBQ0gsTUFBYSx1QkFBdUI7UUFDbkMsWUFDUSxnQkFBaUM7UUFDeEM7O1dBRUc7UUFDSSxnQkFBOEM7UUFDckQ7OztXQUdHO1FBQ0ksWUFBc0I7UUFDN0I7O1dBRUc7UUFDSSx5QkFBbUMsRUFDbkMsdUJBQStCO1lBZC9CLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBaUI7WUFJakMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUE4QjtZQUs5QyxpQkFBWSxHQUFaLFlBQVksQ0FBVTtZQUl0Qiw4QkFBeUIsR0FBekIseUJBQXlCLENBQVU7WUFDbkMsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUFRO1FBRXZDLENBQUM7UUFFTSxrQkFBa0I7WUFDeEIsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQztRQUNqQyxDQUFDO1FBRU0sa0JBQWtCLENBQUMsZUFBdUI7WUFDaEQsSUFBSSxlQUFlLEdBQUcsQ0FBQyxFQUFFO2dCQUN4QixPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQzthQUNwQztZQUNELE9BQU8sQ0FBQyxDQUFDO1FBQ1YsQ0FBQztRQUVNLGFBQWEsQ0FBQyxlQUF1QjtZQUMzQyx3REFBd0Q7WUFDeEQsTUFBTSxXQUFXLEdBQUcsZUFBZSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyRixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FB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