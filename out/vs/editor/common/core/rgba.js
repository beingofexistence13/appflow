/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RGBA8 = void 0;
    /**
     * A very VM friendly rgba datastructure.
     * Please don't touch unless you take a look at the IR.
     */
    class RGBA8 {
        static { this.Empty = new RGBA8(0, 0, 0, 0); }
        constructor(r, g, b, a) {
            this._rgba8Brand = undefined;
            this.r = RGBA8._clamp(r);
            this.g = RGBA8._clamp(g);
            this.b = RGBA8._clamp(b);
            this.a = RGBA8._clamp(a);
        }
        equals(other) {
            return (this.r === other.r
                && this.g === other.g
                && this.b === other.b
                && this.a === other.a);
        }
        static _clamp(c) {
            if (c < 0) {
                return 0;
            }
            if (c > 255) {
                return 255;
            }
            return c | 0;
        }
    }
    exports.RGBA8 = RGBA8;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmdiYS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vY29yZS9yZ2JhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUVoRzs7O09BR0c7SUFDSCxNQUFhLEtBQUs7aUJBR0QsVUFBSyxHQUFHLElBQUksS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxBQUF4QixDQUF5QjtRQW1COUMsWUFBWSxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTO1lBckJ0RCxnQkFBVyxHQUFTLFNBQVMsQ0FBQztZQXNCN0IsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6QixJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFCLENBQUM7UUFFTSxNQUFNLENBQUMsS0FBWTtZQUN6QixPQUFPLENBQ04sSUFBSSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQzttQkFDZixJQUFJLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDO21CQUNsQixJQUFJLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDO21CQUNsQixJQUFJLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQ3JCLENBQUM7UUFDSCxDQUFDO1FBRU0sTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFTO1lBQzdCLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDVixPQUFPLENBQUMsQ0FBQzthQUNUO1lBQ0QsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFO2dCQUNaLE9BQU8sR0FBRyxDQUFDO2FBQ1g7WUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDZCxDQUFDOztJQTlDRixzQkErQ0MifQ==