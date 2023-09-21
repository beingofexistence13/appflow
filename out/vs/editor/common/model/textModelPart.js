/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle"], function (require, exports, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextModelPart = void 0;
    class TextModelPart extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._isDisposed = false;
        }
        dispose() {
            super.dispose();
            this._isDisposed = true;
        }
        assertNotDisposed() {
            if (this._isDisposed) {
                throw new Error('TextModelPart is disposed!');
            }
        }
    }
    exports.TextModelPart = TextModelPart;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dE1vZGVsUGFydC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vbW9kZWwvdGV4dE1vZGVsUGFydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFJaEcsTUFBYSxhQUFjLFNBQVEsc0JBQVU7UUFBN0M7O1lBQ1MsZ0JBQVcsR0FBRyxLQUFLLENBQUM7UUFXN0IsQ0FBQztRQVRnQixPQUFPO1lBQ3RCLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNoQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztRQUN6QixDQUFDO1FBQ1MsaUJBQWlCO1lBQzFCLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDckIsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO2FBQzlDO1FBQ0YsQ0FBQztLQUNEO0lBWkQsc0NBWUMifQ==