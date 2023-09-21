/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/path"], function (require, exports, path_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.osPathModule = exports.updateLinkWithRelativeCwd = exports.getXtermRangesByAttr = exports.getXtermLineContent = exports.convertBufferRangeToViewport = exports.convertLinkRangeToBuffer = void 0;
    /**
     * Converts a possibly wrapped link's range (comprised of string indices) into a buffer range that plays nicely with xterm.js
     *
     * @param lines A single line (not the entire buffer)
     * @param bufferWidth The number of columns in the terminal
     * @param range The link range - string indices
     * @param startLine The absolute y position (on the buffer) of the line
     */
    function convertLinkRangeToBuffer(lines, bufferWidth, range, startLine) {
        const bufferRange = {
            start: {
                x: range.startColumn,
                y: range.startLineNumber + startLine
            },
            end: {
                x: range.endColumn - 1,
                y: range.endLineNumber + startLine
            }
        };
        // Shift start range right for each wide character before the link
        let startOffset = 0;
        const startWrappedLineCount = Math.ceil(range.startColumn / bufferWidth);
        for (let y = 0; y < Math.min(startWrappedLineCount); y++) {
            const lineLength = Math.min(bufferWidth, (range.startColumn - 1) - y * bufferWidth);
            let lineOffset = 0;
            const line = lines[y];
            // Sanity check for line, apparently this can happen but it's not clear under what
            // circumstances this happens. Continue on, skipping the remainder of start offset if this
            // happens to minimize impact.
            if (!line) {
                break;
            }
            for (let x = 0; x < Math.min(bufferWidth, lineLength + lineOffset); x++) {
                const cell = line.getCell(x);
                // This is unexpected but it means the character doesn't exist, so we shouldn't add to
                // the offset
                if (!cell) {
                    break;
                }
                const width = cell.getWidth();
                if (width === 2) {
                    lineOffset++;
                }
                const char = cell.getChars();
                if (char.length > 1) {
                    lineOffset -= char.length - 1;
                }
            }
            startOffset += lineOffset;
        }
        // Shift end range right for each wide character inside the link
        let endOffset = 0;
        const endWrappedLineCount = Math.ceil(range.endColumn / bufferWidth);
        for (let y = Math.max(0, startWrappedLineCount - 1); y < endWrappedLineCount; y++) {
            const start = (y === startWrappedLineCount - 1 ? (range.startColumn - 1 + startOffset) % bufferWidth : 0);
            const lineLength = Math.min(bufferWidth, range.endColumn + startOffset - y * bufferWidth);
            let lineOffset = 0;
            const line = lines[y];
            // Sanity check for line, apparently this can happen but it's not clear under what
            // circumstances this happens. Continue on, skipping the remainder of start offset if this
            // happens to minimize impact.
            if (!line) {
                break;
            }
            for (let x = start; x < Math.min(bufferWidth, lineLength + lineOffset); x++) {
                const cell = line.getCell(x);
                // This is unexpected but it means the character doesn't exist, so we shouldn't add to
                // the offset
                if (!cell) {
                    break;
                }
                const width = cell.getWidth();
                const chars = cell.getChars();
                // Offset for null cells following wide characters
                if (width === 2) {
                    lineOffset++;
                }
                // Offset for early wrapping when the last cell in row is a wide character
                if (x === bufferWidth - 1 && chars === '') {
                    lineOffset++;
                }
                // Offset multi-code characters like emoji
                if (chars.length > 1) {
                    lineOffset -= chars.length - 1;
                }
            }
            endOffset += lineOffset;
        }
        // Apply the width character offsets to the result
        bufferRange.start.x += startOffset;
        bufferRange.end.x += startOffset + endOffset;
        // Convert back to wrapped lines
        while (bufferRange.start.x > bufferWidth) {
            bufferRange.start.x -= bufferWidth;
            bufferRange.start.y++;
        }
        while (bufferRange.end.x > bufferWidth) {
            bufferRange.end.x -= bufferWidth;
            bufferRange.end.y++;
        }
        return bufferRange;
    }
    exports.convertLinkRangeToBuffer = convertLinkRangeToBuffer;
    function convertBufferRangeToViewport(bufferRange, viewportY) {
        return {
            start: {
                x: bufferRange.start.x - 1,
                y: bufferRange.start.y - viewportY - 1
            },
            end: {
                x: bufferRange.end.x - 1,
                y: bufferRange.end.y - viewportY - 1
            }
        };
    }
    exports.convertBufferRangeToViewport = convertBufferRangeToViewport;
    function getXtermLineContent(buffer, lineStart, lineEnd, cols) {
        // Cap the maximum number of lines generated to prevent potential performance problems. This is
        // more of a sanity check as the wrapped line should already be trimmed down at this point.
        const maxLineLength = Math.max(2048, cols * 2);
        lineEnd = Math.min(lineEnd, lineStart + maxLineLength);
        let content = '';
        for (let i = lineStart; i <= lineEnd; i++) {
            // Make sure only 0 to cols are considered as resizing when windows mode is enabled will
            // retain buffer data outside of the terminal width as reflow is disabled.
            const line = buffer.getLine(i);
            if (line) {
                content += line.translateToString(true, 0, cols);
            }
        }
        return content;
    }
    exports.getXtermLineContent = getXtermLineContent;
    function getXtermRangesByAttr(buffer, lineStart, lineEnd, cols) {
        let bufferRangeStart = undefined;
        let lastFgAttr = -1;
        let lastBgAttr = -1;
        const ranges = [];
        for (let y = lineStart; y <= lineEnd; y++) {
            const line = buffer.getLine(y);
            if (!line) {
                continue;
            }
            for (let x = 0; x < cols; x++) {
                const cell = line.getCell(x);
                if (!cell) {
                    break;
                }
                // HACK: Re-construct the attributes from fg and bg, this is hacky as it relies
                // upon the internal buffer bit layout
                const thisFgAttr = (cell.isBold() |
                    cell.isInverse() |
                    cell.isStrikethrough() |
                    cell.isUnderline());
                const thisBgAttr = (cell.isDim() |
                    cell.isItalic());
                if (lastFgAttr === -1 || lastBgAttr === -1) {
                    bufferRangeStart = { x, y };
                }
                else {
                    if (lastFgAttr !== thisFgAttr || lastBgAttr !== thisBgAttr) {
                        // TODO: x overflow
                        const bufferRangeEnd = { x, y };
                        ranges.push({
                            start: bufferRangeStart,
                            end: bufferRangeEnd
                        });
                        bufferRangeStart = { x, y };
                    }
                }
                lastFgAttr = thisFgAttr;
                lastBgAttr = thisBgAttr;
            }
        }
        return ranges;
    }
    exports.getXtermRangesByAttr = getXtermRangesByAttr;
    // export function positionIsInRange(position: IBufferCellPosition, range: IBufferRange): boolean {
    // 	if (position.y < range.start.y || position.y > range.end.y) {
    // 		return false;
    // 	}
    // 	if (position.y === range.start.y && position.x < range.start.x) {
    // 		return false;
    // 	}
    // 	if (position.y === range.end.y && position.x > range.end.x) {
    // 		return false;
    // 	}
    // 	return true;
    // }
    /**
     * For shells with the CommandDetection capability, the cwd for a command relative to the line of
     * the particular link can be used to narrow down the result for an exact file match.
     */
    function updateLinkWithRelativeCwd(capabilities, y, text, osPath, logService) {
        const cwd = capabilities.get(2 /* TerminalCapability.CommandDetection */)?.getCwdForLine(y);
        logService.trace('terminalLinkHelpers#updateLinkWithRelativeCwd cwd', cwd);
        if (!cwd) {
            return undefined;
        }
        const result = [];
        const sep = osPath.sep;
        if (!text.includes(sep)) {
            result.push(osPath.resolve(cwd + sep + text));
        }
        else {
            let commonDirs = 0;
            let i = 0;
            const cwdPath = cwd.split(sep).reverse();
            const linkPath = text.split(sep);
            // Get all results as candidates, prioritizing the link with the most common directories.
            // For example if in the directory /home/common and the link is common/file, the result
            // should be: `['/home/common/common/file', '/home/common/file']`. The first is the most
            // likely as cwd detection is active.
            while (i < cwdPath.length) {
                result.push(osPath.resolve(cwd + sep + linkPath.slice(commonDirs).join(sep)));
                if (cwdPath[i] === linkPath[i]) {
                    commonDirs++;
                }
                else {
                    break;
                }
                i++;
            }
        }
        return result;
    }
    exports.updateLinkWithRelativeCwd = updateLinkWithRelativeCwd;
    function osPathModule(os) {
        return os === 1 /* OperatingSystem.Windows */ ? path_1.win32 : path_1.posix;
    }
    exports.osPathModule = osPathModule;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxMaW5rSGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsQ29udHJpYi9saW5rcy9icm93c2VyL3Rlcm1pbmFsTGlua0hlbHBlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU2hHOzs7Ozs7O09BT0c7SUFDSCxTQUFnQix3QkFBd0IsQ0FDdkMsS0FBb0IsRUFDcEIsV0FBbUIsRUFDbkIsS0FBYSxFQUNiLFNBQWlCO1FBRWpCLE1BQU0sV0FBVyxHQUFpQjtZQUNqQyxLQUFLLEVBQUU7Z0JBQ04sQ0FBQyxFQUFFLEtBQUssQ0FBQyxXQUFXO2dCQUNwQixDQUFDLEVBQUUsS0FBSyxDQUFDLGVBQWUsR0FBRyxTQUFTO2FBQ3BDO1lBQ0QsR0FBRyxFQUFFO2dCQUNKLENBQUMsRUFBRSxLQUFLLENBQUMsU0FBUyxHQUFHLENBQUM7Z0JBQ3RCLENBQUMsRUFBRSxLQUFLLENBQUMsYUFBYSxHQUFHLFNBQVM7YUFDbEM7U0FDRCxDQUFDO1FBRUYsa0VBQWtFO1FBQ2xFLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQztRQUNwQixNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUMsQ0FBQztRQUN6RSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3pELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUM7WUFDcEYsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO1lB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