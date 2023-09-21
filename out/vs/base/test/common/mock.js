/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "sinon"], function (require, exports, sinon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mockObject = exports.mock = void 0;
    function mock() {
        return function () { };
    }
    exports.mock = mock;
    // Creates an object object that returns sinon mocks for every property. Optionally
    // takes base properties.
    const mockObject = () => (properties) => {
        return new Proxy({ ...properties }, {
            get(target, key) {
                if (!target.hasOwnProperty(key)) {
                    target[key] = (0, sinon_1.stub)();
                }
                return target[key];
            },
            set(target, key, value) {
                target[key] = value;
                return true;
            },
        });
    };
    exports.mockObject = mockObject;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9jay5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvdGVzdC9jb21tb24vbW9jay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRaEcsU0FBZ0IsSUFBSTtRQUNuQixPQUFPLGNBQWMsQ0FBUSxDQUFDO0lBQy9CLENBQUM7SUFGRCxvQkFFQztJQUlELG1GQUFtRjtJQUNuRix5QkFBeUI7SUFDbEIsTUFBTSxVQUFVLEdBQUcsR0FBcUIsRUFBRSxDQUFDLENBQTZCLFVBQWUsRUFBMkIsRUFBRTtRQUMxSCxPQUFPLElBQUksS0FBSyxDQUFDLEVBQUUsR0FBRyxVQUFVLEVBQVMsRUFBRTtZQUMxQyxHQUFHLENBQUMsTUFBTSxFQUFFLEdBQUc7Z0JBQ2QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ2hDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFBLFlBQUksR0FBRSxDQUFDO2lCQUNyQjtnQkFFRCxPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNwQixDQUFDO1lBQ0QsR0FBRyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSztnQkFDckIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztnQkFDcEIsT0FBTyxJQUFJLENBQUM7WUFDYixDQUFDO1NBQ0QsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDO0lBZFcsUUFBQSxVQUFVLGNBY3JCIn0=