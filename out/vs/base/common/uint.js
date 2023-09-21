/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toUint32 = exports.toUint8 = exports.Constants = void 0;
    var Constants;
    (function (Constants) {
        /**
         * MAX SMI (SMall Integer) as defined in v8.
         * one bit is lost for boxing/unboxing flag.
         * one bit is lost for sign flag.
         * See https://thibaultlaurens.github.io/javascript/2013/04/29/how-the-v8-engine-works/#tagged-values
         */
        Constants[Constants["MAX_SAFE_SMALL_INTEGER"] = 1073741824] = "MAX_SAFE_SMALL_INTEGER";
        /**
         * MIN SMI (SMall Integer) as defined in v8.
         * one bit is lost for boxing/unboxing flag.
         * one bit is lost for sign flag.
         * See https://thibaultlaurens.github.io/javascript/2013/04/29/how-the-v8-engine-works/#tagged-values
         */
        Constants[Constants["MIN_SAFE_SMALL_INTEGER"] = -1073741824] = "MIN_SAFE_SMALL_INTEGER";
        /**
         * Max unsigned integer that fits on 8 bits.
         */
        Constants[Constants["MAX_UINT_8"] = 255] = "MAX_UINT_8";
        /**
         * Max unsigned integer that fits on 16 bits.
         */
        Constants[Constants["MAX_UINT_16"] = 65535] = "MAX_UINT_16";
        /**
         * Max unsigned integer that fits on 32 bits.
         */
        Constants[Constants["MAX_UINT_32"] = 4294967295] = "MAX_UINT_32";
        Constants[Constants["UNICODE_SUPPLEMENTARY_PLANE_BEGIN"] = 65536] = "UNICODE_SUPPLEMENTARY_PLANE_BEGIN";
    })(Constants || (exports.Constants = Constants = {}));
    function toUint8(v) {
        if (v < 0) {
            return 0;
        }
        if (v > 255 /* Constants.MAX_UINT_8 */) {
            return 255 /* Constants.MAX_UINT_8 */;
        }
        return v | 0;
    }
    exports.toUint8 = toUint8;
    function toUint32(v) {
        if (v < 0) {
            return 0;
        }
        if (v > 4294967295 /* Constants.MAX_UINT_32 */) {
            return 4294967295 /* Constants.MAX_UINT_32 */;
        }
        return v | 0;
    }
    exports.toUint32 = toUint32;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidWludC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL3VpbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBRWhHLElBQWtCLFNBaUNqQjtJQWpDRCxXQUFrQixTQUFTO1FBQzFCOzs7OztXQUtHO1FBQ0gsc0ZBQWdDLENBQUE7UUFFaEM7Ozs7O1dBS0c7UUFDSCx1RkFBbUMsQ0FBQTtRQUVuQzs7V0FFRztRQUNILHVEQUFnQixDQUFBO1FBRWhCOztXQUVHO1FBQ0gsMkRBQW1CLENBQUE7UUFFbkI7O1dBRUc7UUFDSCxnRUFBd0IsQ0FBQTtRQUV4Qix1R0FBNEMsQ0FBQTtJQUM3QyxDQUFDLEVBakNpQixTQUFTLHlCQUFULFNBQVMsUUFpQzFCO0lBRUQsU0FBZ0IsT0FBTyxDQUFDLENBQVM7UUFDaEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ1YsT0FBTyxDQUFDLENBQUM7U0FDVDtRQUNELElBQUksQ0FBQyxpQ0FBdUIsRUFBRTtZQUM3QixzQ0FBNEI7U0FDNUI7UUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDZCxDQUFDO0lBUkQsMEJBUUM7SUFFRCxTQUFnQixRQUFRLENBQUMsQ0FBUztRQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDVixPQUFPLENBQUMsQ0FBQztTQUNUO1FBQ0QsSUFBSSxDQUFDLHlDQUF3QixFQUFFO1lBQzlCLDhDQUE2QjtTQUM3QjtRQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNkLENBQUM7SUFSRCw0QkFRQyJ9