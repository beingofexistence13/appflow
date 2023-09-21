/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/characterClassifier"], function (require, exports, characterClassifier_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getMapForWordSeparators = exports.WordCharacterClassifier = exports.WordCharacterClass = void 0;
    var WordCharacterClass;
    (function (WordCharacterClass) {
        WordCharacterClass[WordCharacterClass["Regular"] = 0] = "Regular";
        WordCharacterClass[WordCharacterClass["Whitespace"] = 1] = "Whitespace";
        WordCharacterClass[WordCharacterClass["WordSeparator"] = 2] = "WordSeparator";
    })(WordCharacterClass || (exports.WordCharacterClass = WordCharacterClass = {}));
    class WordCharacterClassifier extends characterClassifier_1.CharacterClassifier {
        constructor(wordSeparators) {
            super(0 /* WordCharacterClass.Regular */);
            for (let i = 0, len = wordSeparators.length; i < len; i++) {
                this.set(wordSeparators.charCodeAt(i), 2 /* WordCharacterClass.WordSeparator */);
            }
            this.set(32 /* CharCode.Space */, 1 /* WordCharacterClass.Whitespace */);
            this.set(9 /* CharCode.Tab */, 1 /* WordCharacterClass.Whitespace */);
        }
    }
    exports.WordCharacterClassifier = WordCharacterClassifier;
    function once(computeFn) {
        const cache = {}; // TODO@Alex unbounded cache
        return (input) => {
            if (!cache.hasOwnProperty(input)) {
                cache[input] = computeFn(input);
            }
            return cache[input];
        };
    }
    exports.getMapForWordSeparators = once((input) => new WordCharacterClassifier(input));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29yZENoYXJhY3RlckNsYXNzaWZpZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL2NvcmUvd29yZENoYXJhY3RlckNsYXNzaWZpZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBS2hHLElBQWtCLGtCQUlqQjtJQUpELFdBQWtCLGtCQUFrQjtRQUNuQyxpRUFBVyxDQUFBO1FBQ1gsdUVBQWMsQ0FBQTtRQUNkLDZFQUFpQixDQUFBO0lBQ2xCLENBQUMsRUFKaUIsa0JBQWtCLGtDQUFsQixrQkFBa0IsUUFJbkM7SUFFRCxNQUFhLHVCQUF3QixTQUFRLHlDQUF1QztRQUVuRixZQUFZLGNBQXNCO1lBQ2pDLEtBQUssb0NBQTRCLENBQUM7WUFFbEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDMUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQywyQ0FBbUMsQ0FBQzthQUN6RTtZQUVELElBQUksQ0FBQyxHQUFHLGdFQUErQyxDQUFDO1lBQ3hELElBQUksQ0FBQyxHQUFHLDZEQUE2QyxDQUFDO1FBQ3ZELENBQUM7S0FFRDtJQWJELDBEQWFDO0lBRUQsU0FBUyxJQUFJLENBQUksU0FBK0I7UUFDL0MsTUFBTSxLQUFLLEdBQXlCLEVBQUUsQ0FBQyxDQUFDLDRCQUE0QjtRQUNwRSxPQUFPLENBQUMsS0FBYSxFQUFLLEVBQUU7WUFDM0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ2pDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDaEM7WUFDRCxPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNyQixDQUFDLENBQUM7SUFDSCxDQUFDO0lBRVksUUFBQSx1QkFBdUIsR0FBRyxJQUFJLENBQzFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxJQUFJLHVCQUF1QixDQUFDLEtBQUssQ0FBQyxDQUM3QyxDQUFDIn0=