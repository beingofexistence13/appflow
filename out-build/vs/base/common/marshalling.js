/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/uri"], function (require, exports, buffer_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$$g = exports.$0g = exports.$9g = void 0;
    function $9g(obj) {
        return JSON.stringify(obj, replacer);
    }
    exports.$9g = $9g;
    function $0g(text) {
        let data = JSON.parse(text);
        data = $$g(data);
        return data;
    }
    exports.$0g = $0g;
    function replacer(key, value) {
        // URI is done via toJSON-member
        if (value instanceof RegExp) {
            return {
                $mid: 2 /* MarshalledId.Regexp */,
                source: value.source,
                flags: value.flags,
            };
        }
        return value;
    }
    function $$g(obj, depth = 0) {
        if (!obj || depth > 200) {
            return obj;
        }
        if (typeof obj === 'object') {
            switch (obj.$mid) {
                case 1 /* MarshalledId.Uri */: return uri_1.URI.revive(obj);
                case 2 /* MarshalledId.Regexp */: return new RegExp(obj.source, obj.flags);
                case 17 /* MarshalledId.Date */: return new Date(obj.source);
            }
            if (obj instanceof buffer_1.$Fd
                || obj instanceof Uint8Array) {
                return obj;
            }
            if (Array.isArray(obj)) {
                for (let i = 0; i < obj.length; ++i) {
                    obj[i] = $$g(obj[i], depth + 1);
                }
            }
            else {
                // walk object
                for (const key in obj) {
                    if (Object.hasOwnProperty.call(obj, key)) {
                        obj[key] = $$g(obj[key], depth + 1);
                    }
                }
            }
        }
        return obj;
    }
    exports.$$g = $$g;
});
//# sourceMappingURL=marshalling.js.map