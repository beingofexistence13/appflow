/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.KeyboardLayoutContribution = void 0;
    class KeyboardLayoutContribution {
        static { this.INSTANCE = new KeyboardLayoutContribution(); }
        get layoutInfos() {
            return this._layoutInfos;
        }
        constructor() {
            this._layoutInfos = [];
        }
        registerKeyboardLayout(layout) {
            this._layoutInfos.push(layout);
        }
    }
    exports.KeyboardLayoutContribution = KeyboardLayoutContribution;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiXy5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMva2V5YmluZGluZy9icm93c2VyL2tleWJvYXJkTGF5b3V0cy9fLmNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFJaEcsTUFBYSwwQkFBMEI7aUJBQ2YsYUFBUSxHQUErQixJQUFJLDBCQUEwQixFQUFFLEFBQS9ELENBQWdFO1FBSS9GLElBQUksV0FBVztZQUNkLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztRQUMxQixDQUFDO1FBRUQ7WUFOUSxpQkFBWSxHQUFrQixFQUFFLENBQUM7UUFPekMsQ0FBQztRQUVELHNCQUFzQixDQUFDLE1BQW1CO1lBQ3pDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2hDLENBQUM7O0lBZEYsZ0VBZUMifQ==