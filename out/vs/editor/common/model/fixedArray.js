/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays"], function (require, exports, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FixedArray = void 0;
    /**
     * An array that avoids being sparse by always
     * filling up unused indices with a default value.
     */
    class FixedArray {
        constructor(_default) {
            this._default = _default;
            this._store = [];
        }
        get(index) {
            if (index < this._store.length) {
                return this._store[index];
            }
            return this._default;
        }
        set(index, value) {
            while (index >= this._store.length) {
                this._store[this._store.length] = this._default;
            }
            this._store[index] = value;
        }
        replace(index, oldLength, newLength) {
            if (index >= this._store.length) {
                return;
            }
            if (oldLength === 0) {
                this.insert(index, newLength);
                return;
            }
            else if (newLength === 0) {
                this.delete(index, oldLength);
                return;
            }
            const before = this._store.slice(0, index);
            const after = this._store.slice(index + oldLength);
            const insertArr = arrayFill(newLength, this._default);
            this._store = before.concat(insertArr, after);
        }
        delete(deleteIndex, deleteCount) {
            if (deleteCount === 0 || deleteIndex >= this._store.length) {
                return;
            }
            this._store.splice(deleteIndex, deleteCount);
        }
        insert(insertIndex, insertCount) {
            if (insertCount === 0 || insertIndex >= this._store.length) {
                return;
            }
            const arr = [];
            for (let i = 0; i < insertCount; i++) {
                arr[i] = this._default;
            }
            this._store = (0, arrays_1.arrayInsert)(this._store, insertIndex, arr);
        }
    }
    exports.FixedArray = FixedArray;
    function arrayFill(length, value) {
        const arr = [];
        for (let i = 0; i < length; i++) {
            arr[i] = value;
        }
        return arr;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZml4ZWRBcnJheS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vbW9kZWwvZml4ZWRBcnJheS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFJaEc7OztPQUdHO0lBQ0gsTUFBYSxVQUFVO1FBR3RCLFlBQ2tCLFFBQVc7WUFBWCxhQUFRLEdBQVIsUUFBUSxDQUFHO1lBSHJCLFdBQU0sR0FBUSxFQUFFLENBQUM7UUFJckIsQ0FBQztRQUVFLEdBQUcsQ0FBQyxLQUFhO1lBQ3ZCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO2dCQUMvQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDMUI7WUFDRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDdEIsQ0FBQztRQUVNLEdBQUcsQ0FBQyxLQUFhLEVBQUUsS0FBUTtZQUNqQyxPQUFPLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTtnQkFDbkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7YUFDaEQ7WUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUM1QixDQUFDO1FBRU0sT0FBTyxDQUFDLEtBQWEsRUFBRSxTQUFpQixFQUFFLFNBQWlCO1lBQ2pFLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO2dCQUNoQyxPQUFPO2FBQ1A7WUFFRCxJQUFJLFNBQVMsS0FBSyxDQUFDLEVBQUU7Z0JBQ3BCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUM5QixPQUFPO2FBQ1A7aUJBQU0sSUFBSSxTQUFTLEtBQUssQ0FBQyxFQUFFO2dCQUMzQixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDOUIsT0FBTzthQUNQO1lBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzNDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUMsQ0FBQztZQUNuRCxNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN0RCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFFTSxNQUFNLENBQUMsV0FBbUIsRUFBRSxXQUFtQjtZQUNyRCxJQUFJLFdBQVcsS0FBSyxDQUFDLElBQUksV0FBVyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO2dCQUMzRCxPQUFPO2FBQ1A7WUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUVNLE1BQU0sQ0FBQyxXQUFtQixFQUFFLFdBQW1CO1lBQ3JELElBQUksV0FBVyxLQUFLLENBQUMsSUFBSSxXQUFXLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7Z0JBQzNELE9BQU87YUFDUDtZQUNELE1BQU0sR0FBRyxHQUFRLEVBQUUsQ0FBQztZQUNwQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNyQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQzthQUN2QjtZQUNELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBQSxvQkFBVyxFQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzFELENBQUM7S0FDRDtJQXpERCxnQ0F5REM7SUFFRCxTQUFTLFNBQVMsQ0FBSSxNQUFjLEVBQUUsS0FBUTtRQUM3QyxNQUFNLEdBQUcsR0FBUSxFQUFFLENBQUM7UUFDcEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNoQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO1NBQ2Y7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUMifQ==