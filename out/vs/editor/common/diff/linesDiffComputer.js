/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MovedText = exports.LinesDiff = void 0;
    class LinesDiff {
        constructor(changes, 
        /**
         * Sorted by original line ranges.
         * The original line ranges and the modified line ranges must be disjoint (but can be touching).
         */
        moves, 
        /**
         * Indicates if the time out was reached.
         * In that case, the diffs might be an approximation and the user should be asked to rerun the diff with more time.
         */
        hitTimeout) {
            this.changes = changes;
            this.moves = moves;
            this.hitTimeout = hitTimeout;
        }
    }
    exports.LinesDiff = LinesDiff;
    class MovedText {
        constructor(lineRangeMapping, changes) {
            this.lineRangeMapping = lineRangeMapping;
            this.changes = changes;
        }
        flip() {
            return new MovedText(this.lineRangeMapping.flip(), this.changes.map(c => c.flip()));
        }
    }
    exports.MovedText = MovedText;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZXNEaWZmQ29tcHV0ZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL2RpZmYvbGluZXNEaWZmQ29tcHV0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBY2hHLE1BQWEsU0FBUztRQUNyQixZQUNVLE9BQTRDO1FBRXJEOzs7V0FHRztRQUNNLEtBQTJCO1FBRXBDOzs7V0FHRztRQUNNLFVBQW1CO1lBWm5CLFlBQU8sR0FBUCxPQUFPLENBQXFDO1lBTTVDLFVBQUssR0FBTCxLQUFLLENBQXNCO1lBTTNCLGVBQVUsR0FBVixVQUFVLENBQVM7UUFFN0IsQ0FBQztLQUNEO0lBakJELDhCQWlCQztJQUVELE1BQWEsU0FBUztRQVVyQixZQUNDLGdCQUFrQyxFQUNsQyxPQUE0QztZQUU1QyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7WUFDekMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDeEIsQ0FBQztRQUVNLElBQUk7WUFDVixPQUFPLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDckYsQ0FBQztLQUNEO0lBckJELDhCQXFCQyJ9