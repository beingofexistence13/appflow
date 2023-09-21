/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextSearchCompleteMessageType = exports.Range = exports.Position = void 0;
    class Position {
        constructor(line, character) {
            this.line = line;
            this.character = character;
        }
        isBefore(other) { return false; }
        isBeforeOrEqual(other) { return false; }
        isAfter(other) { return false; }
        isAfterOrEqual(other) { return false; }
        isEqual(other) { return false; }
        compareTo(other) { return 0; }
        translate(_, _2) { return new Position(0, 0); }
        with(_) { return new Position(0, 0); }
    }
    exports.Position = Position;
    class Range {
        constructor(startLine, startCol, endLine, endCol) {
            this.isEmpty = false;
            this.isSingleLine = false;
            this.start = new Position(startLine, startCol);
            this.end = new Position(endLine, endCol);
        }
        contains(positionOrRange) { return false; }
        isEqual(other) { return false; }
        intersection(range) { return undefined; }
        union(other) { return new Range(0, 0, 0, 0); }
        with(_) { return new Range(0, 0, 0, 0); }
    }
    exports.Range = Range;
    /**
     * Represents the severity of a TextSearchComplete message.
     */
    var TextSearchCompleteMessageType;
    (function (TextSearchCompleteMessageType) {
        TextSearchCompleteMessageType[TextSearchCompleteMessageType["Information"] = 1] = "Information";
        TextSearchCompleteMessageType[TextSearchCompleteMessageType["Warning"] = 2] = "Warning";
    })(TextSearchCompleteMessageType || (exports.TextSearchCompleteMessageType = TextSearchCompleteMessageType = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoRXh0VHlwZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvc2VhcmNoL2NvbW1vbi9zZWFyY2hFeHRUeXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFNaEcsTUFBYSxRQUFRO1FBQ3BCLFlBQXFCLElBQVksRUFBVyxTQUFpQjtZQUF4QyxTQUFJLEdBQUosSUFBSSxDQUFRO1lBQVcsY0FBUyxHQUFULFNBQVMsQ0FBUTtRQUFJLENBQUM7UUFFbEUsUUFBUSxDQUFDLEtBQWUsSUFBYSxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDcEQsZUFBZSxDQUFDLEtBQWUsSUFBYSxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDM0QsT0FBTyxDQUFDLEtBQWUsSUFBYSxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDbkQsY0FBYyxDQUFDLEtBQWUsSUFBYSxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDMUQsT0FBTyxDQUFDLEtBQWUsSUFBYSxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDbkQsU0FBUyxDQUFDLEtBQWUsSUFBWSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFHaEQsU0FBUyxDQUFDLENBQU8sRUFBRSxFQUFRLElBQWMsT0FBTyxJQUFJLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBR3JFLElBQUksQ0FBQyxDQUFNLElBQWMsT0FBTyxJQUFJLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3JEO0lBZkQsNEJBZUM7SUFFRCxNQUFhLEtBQUs7UUFJakIsWUFBWSxTQUFpQixFQUFFLFFBQWdCLEVBQUUsT0FBZSxFQUFFLE1BQWM7WUFLaEYsWUFBTyxHQUFHLEtBQUssQ0FBQztZQUNoQixpQkFBWSxHQUFHLEtBQUssQ0FBQztZQUxwQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksUUFBUSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUMvQyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksUUFBUSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUMxQyxDQUFDO1FBSUQsUUFBUSxDQUFDLGVBQWlDLElBQWEsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3RFLE9BQU8sQ0FBQyxLQUFZLElBQWEsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2hELFlBQVksQ0FBQyxLQUFZLElBQXVCLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNuRSxLQUFLLENBQUMsS0FBWSxJQUFXLE9BQU8sSUFBSSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBSTVELElBQUksQ0FBQyxDQUFNLElBQVcsT0FBTyxJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDckQ7SUFuQkQsc0JBbUJDO0lBbUxEOztPQUVHO0lBQ0gsSUFBWSw2QkFHWDtJQUhELFdBQVksNkJBQTZCO1FBQ3hDLCtGQUFlLENBQUE7UUFDZix1RkFBVyxDQUFBO0lBQ1osQ0FBQyxFQUhXLDZCQUE2Qiw2Q0FBN0IsNkJBQTZCLFFBR3hDIn0=