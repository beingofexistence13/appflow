/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uint"], function (require, exports, uint_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CharacterSet = exports.CharacterClassifier = void 0;
    /**
     * A fast character classifier that uses a compact array for ASCII values.
     */
    class CharacterClassifier {
        constructor(_defaultValue) {
            const defaultValue = (0, uint_1.toUint8)(_defaultValue);
            this._defaultValue = defaultValue;
            this._asciiMap = CharacterClassifier._createAsciiMap(defaultValue);
            this._map = new Map();
        }
        static _createAsciiMap(defaultValue) {
            const asciiMap = new Uint8Array(256);
            asciiMap.fill(defaultValue);
            return asciiMap;
        }
        set(charCode, _value) {
            const value = (0, uint_1.toUint8)(_value);
            if (charCode >= 0 && charCode < 256) {
                this._asciiMap[charCode] = value;
            }
            else {
                this._map.set(charCode, value);
            }
        }
        get(charCode) {
            if (charCode >= 0 && charCode < 256) {
                return this._asciiMap[charCode];
            }
            else {
                return (this._map.get(charCode) || this._defaultValue);
            }
        }
        clear() {
            this._asciiMap.fill(this._defaultValue);
            this._map.clear();
        }
    }
    exports.CharacterClassifier = CharacterClassifier;
    var Boolean;
    (function (Boolean) {
        Boolean[Boolean["False"] = 0] = "False";
        Boolean[Boolean["True"] = 1] = "True";
    })(Boolean || (Boolean = {}));
    class CharacterSet {
        constructor() {
            this._actual = new CharacterClassifier(0 /* Boolean.False */);
        }
        add(charCode) {
            this._actual.set(charCode, 1 /* Boolean.True */);
        }
        has(charCode) {
            return (this._actual.get(charCode) === 1 /* Boolean.True */);
        }
        clear() {
            return this._actual.clear();
        }
    }
    exports.CharacterSet = CharacterSet;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcmFjdGVyQ2xhc3NpZmllci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vY29yZS9jaGFyYWN0ZXJDbGFzc2lmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUloRzs7T0FFRztJQUNILE1BQWEsbUJBQW1CO1FBYS9CLFlBQVksYUFBZ0I7WUFDM0IsTUFBTSxZQUFZLEdBQUcsSUFBQSxjQUFPLEVBQUMsYUFBYSxDQUFDLENBQUM7WUFFNUMsSUFBSSxDQUFDLGFBQWEsR0FBRyxZQUFZLENBQUM7WUFDbEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxtQkFBbUIsQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDbkUsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztRQUN2QyxDQUFDO1FBRU8sTUFBTSxDQUFDLGVBQWUsQ0FBQyxZQUFvQjtZQUNsRCxNQUFNLFFBQVEsR0FBRyxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNyQyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzVCLE9BQU8sUUFBUSxDQUFDO1FBQ2pCLENBQUM7UUFFTSxHQUFHLENBQUMsUUFBZ0IsRUFBRSxNQUFTO1lBQ3JDLE1BQU0sS0FBSyxHQUFHLElBQUEsY0FBTyxFQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRTlCLElBQUksUUFBUSxJQUFJLENBQUMsSUFBSSxRQUFRLEdBQUcsR0FBRyxFQUFFO2dCQUNwQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEtBQUssQ0FBQzthQUNqQztpQkFBTTtnQkFDTixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDL0I7UUFDRixDQUFDO1FBRU0sR0FBRyxDQUFDLFFBQWdCO1lBQzFCLElBQUksUUFBUSxJQUFJLENBQUMsSUFBSSxRQUFRLEdBQUcsR0FBRyxFQUFFO2dCQUNwQyxPQUFVLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDbkM7aUJBQU07Z0JBQ04sT0FBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQzthQUMxRDtRQUNGLENBQUM7UUFFTSxLQUFLO1lBQ1gsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDbkIsQ0FBQztLQUNEO0lBakRELGtEQWlEQztJQUVELElBQVcsT0FHVjtJQUhELFdBQVcsT0FBTztRQUNqQix1Q0FBUyxDQUFBO1FBQ1QscUNBQVEsQ0FBQTtJQUNULENBQUMsRUFIVSxPQUFPLEtBQVAsT0FBTyxRQUdqQjtJQUVELE1BQWEsWUFBWTtRQUl4QjtZQUNDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxtQkFBbUIsdUJBQXdCLENBQUM7UUFDaEUsQ0FBQztRQUVNLEdBQUcsQ0FBQyxRQUFnQjtZQUMxQixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLHVCQUFlLENBQUM7UUFDMUMsQ0FBQztRQUVNLEdBQUcsQ0FBQyxRQUFnQjtZQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLHlCQUFpQixDQUFDLENBQUM7UUFDdEQsQ0FBQztRQUVNLEtBQUs7WUFDWCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsQ0FBQztLQUNEO0lBbkJELG9DQW1CQyJ9