/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/uri"], function (require, exports, buffer_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Fm = exports.$Em = exports.$Dm = exports.$Cm = exports.$Bm = void 0;
    function toJSON(uri) {
        return uri.toJSON();
    }
    class $Bm {
        constructor(uriTransformer) {
            this.a = uriTransformer;
        }
        transformIncoming(uri) {
            const result = this.a.transformIncoming(uri);
            return (result === uri ? uri : toJSON(uri_1.URI.from(result)));
        }
        transformOutgoing(uri) {
            const result = this.a.transformOutgoing(uri);
            return (result === uri ? uri : toJSON(uri_1.URI.from(result)));
        }
        transformOutgoingURI(uri) {
            const result = this.a.transformOutgoing(uri);
            return (result === uri ? uri : uri_1.URI.from(result));
        }
        transformOutgoingScheme(scheme) {
            return this.a.transformOutgoingScheme(scheme);
        }
    }
    exports.$Bm = $Bm;
    exports.$Cm = new class {
        transformIncoming(uri) {
            return uri;
        }
        transformOutgoing(uri) {
            return uri;
        }
        transformOutgoingURI(uri) {
            return uri;
        }
        transformOutgoingScheme(scheme) {
            return scheme;
        }
    };
    function _transformOutgoingURIs(obj, transformer, depth) {
        if (!obj || depth > 200) {
            return null;
        }
        if (typeof obj === 'object') {
            if (obj instanceof uri_1.URI) {
                return transformer.transformOutgoing(obj);
            }
            // walk object (or array)
            for (const key in obj) {
                if (Object.hasOwnProperty.call(obj, key)) {
                    const r = _transformOutgoingURIs(obj[key], transformer, depth + 1);
                    if (r !== null) {
                        obj[key] = r;
                    }
                }
            }
        }
        return null;
    }
    function $Dm(obj, transformer) {
        const result = _transformOutgoingURIs(obj, transformer, 0);
        if (result === null) {
            // no change
            return obj;
        }
        return result;
    }
    exports.$Dm = $Dm;
    function _transformIncomingURIs(obj, transformer, revive, depth) {
        if (!obj || depth > 200) {
            return null;
        }
        if (typeof obj === 'object') {
            if (obj.$mid === 1 /* MarshalledId.Uri */) {
                return revive ? uri_1.URI.revive(transformer.transformIncoming(obj)) : transformer.transformIncoming(obj);
            }
            if (obj instanceof buffer_1.$Fd) {
                return null;
            }
            // walk object (or array)
            for (const key in obj) {
                if (Object.hasOwnProperty.call(obj, key)) {
                    const r = _transformIncomingURIs(obj[key], transformer, revive, depth + 1);
                    if (r !== null) {
                        obj[key] = r;
                    }
                }
            }
        }
        return null;
    }
    function $Em(obj, transformer) {
        const result = _transformIncomingURIs(obj, transformer, false, 0);
        if (result === null) {
            // no change
            return obj;
        }
        return result;
    }
    exports.$Em = $Em;
    function $Fm(obj, transformer) {
        const result = _transformIncomingURIs(obj, transformer, true, 0);
        if (result === null) {
            // no change
            return obj;
        }
        return result;
    }
    exports.$Fm = $Fm;
});
//# sourceMappingURL=uriIpc.js.map