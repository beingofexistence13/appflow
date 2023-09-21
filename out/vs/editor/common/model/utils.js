/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.computeIndentLevel = void 0;
    /**
     * Returns:
     *  - -1 => the line consists of whitespace
     *  - otherwise => the indent level is returned value
     */
    function computeIndentLevel(line, tabSize) {
        let indent = 0;
        let i = 0;
        const len = line.length;
        while (i < len) {
            const chCode = line.charCodeAt(i);
            if (chCode === 32 /* CharCode.Space */) {
                indent++;
            }
            else if (chCode === 9 /* CharCode.Tab */) {
                indent = indent - indent % tabSize + tabSize;
            }
            else {
                break;
            }
            i++;
        }
        if (i === len) {
            return -1; // line only consists of whitespace
        }
        return indent;
    }
    exports.computeIndentLevel = computeIndentLevel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL21vZGVsL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUloRzs7OztPQUlHO0lBQ0gsU0FBZ0Isa0JBQWtCLENBQUMsSUFBWSxFQUFFLE9BQWU7UUFDL0QsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1YsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUV4QixPQUFPLENBQUMsR0FBRyxHQUFHLEVBQUU7WUFDZixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLElBQUksTUFBTSw0QkFBbUIsRUFBRTtnQkFDOUIsTUFBTSxFQUFFLENBQUM7YUFDVDtpQkFBTSxJQUFJLE1BQU0seUJBQWlCLEVBQUU7Z0JBQ25DLE1BQU0sR0FBRyxNQUFNLEdBQUcsTUFBTSxHQUFHLE9BQU8sR0FBRyxPQUFPLENBQUM7YUFDN0M7aUJBQU07Z0JBQ04sTUFBTTthQUNOO1lBQ0QsQ0FBQyxFQUFFLENBQUM7U0FDSjtRQUVELElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRTtZQUNkLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxtQ0FBbUM7U0FDOUM7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7SUF0QkQsZ0RBc0JDIn0=