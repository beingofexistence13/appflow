/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/uri"], function (require, exports, buffer_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.transformAndReviveIncomingURIs = exports.transformIncomingURIs = exports.transformOutgoingURIs = exports.DefaultURITransformer = exports.URITransformer = void 0;
    function toJSON(uri) {
        return uri.toJSON();
    }
    class URITransformer {
        constructor(uriTransformer) {
            this._uriTransformer = uriTransformer;
        }
        transformIncoming(uri) {
            const result = this._uriTransformer.transformIncoming(uri);
            return (result === uri ? uri : toJSON(uri_1.URI.from(result)));
        }
        transformOutgoing(uri) {
            const result = this._uriTransformer.transformOutgoing(uri);
            return (result === uri ? uri : toJSON(uri_1.URI.from(result)));
        }
        transformOutgoingURI(uri) {
            const result = this._uriTransformer.transformOutgoing(uri);
            return (result === uri ? uri : uri_1.URI.from(result));
        }
        transformOutgoingScheme(scheme) {
            return this._uriTransformer.transformOutgoingScheme(scheme);
        }
    }
    exports.URITransformer = URITransformer;
    exports.DefaultURITransformer = new class {
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
    function transformOutgoingURIs(obj, transformer) {
        const result = _transformOutgoingURIs(obj, transformer, 0);
        if (result === null) {
            // no change
            return obj;
        }
        return result;
    }
    exports.transformOutgoingURIs = transformOutgoingURIs;
    function _transformIncomingURIs(obj, transformer, revive, depth) {
        if (!obj || depth > 200) {
            return null;
        }
        if (typeof obj === 'object') {
            if (obj.$mid === 1 /* MarshalledId.Uri */) {
                return revive ? uri_1.URI.revive(transformer.transformIncoming(obj)) : transformer.transformIncoming(obj);
            }
            if (obj instanceof buffer_1.VSBuffer) {
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
    function transformIncomingURIs(obj, transformer) {
        const result = _transformIncomingURIs(obj, transformer, false, 0);
        if (result === null) {
            // no change
            return obj;
        }
        return result;
    }
    exports.transformIncomingURIs = transformIncomingURIs;
    function transformAndReviveIncomingURIs(obj, transformer) {
        const result = _transformIncomingURIs(obj, transformer, true, 0);
        if (result === null) {
            // no change
            return obj;
        }
        return result;
    }
    exports.transformAndReviveIncomingURIs = transformAndReviveIncomingURIs;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJpSXBjLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9jb21tb24vdXJpSXBjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQTRCaEcsU0FBUyxNQUFNLENBQUMsR0FBUTtRQUN2QixPQUEyQixHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDekMsQ0FBQztJQUVELE1BQWEsY0FBYztRQUkxQixZQUFZLGNBQWtDO1lBQzdDLElBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO1FBQ3ZDLENBQUM7UUFFTSxpQkFBaUIsQ0FBQyxHQUFrQjtZQUMxQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzNELE9BQU8sQ0FBQyxNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxRCxDQUFDO1FBRU0saUJBQWlCLENBQUMsR0FBa0I7WUFDMUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMzRCxPQUFPLENBQUMsTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsU0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUQsQ0FBQztRQUVNLG9CQUFvQixDQUFDLEdBQVE7WUFDbkMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMzRCxPQUFPLENBQUMsTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxD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