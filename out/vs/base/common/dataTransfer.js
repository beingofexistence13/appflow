/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/iterator", "vs/base/common/uuid"], function (require, exports, arrays_1, iterator_1, uuid_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UriList = exports.matchesMimeType = exports.VSDataTransfer = exports.createFileDataTransferItem = exports.createStringDataTransferItem = void 0;
    function createStringDataTransferItem(stringOrPromise) {
        return {
            asString: async () => stringOrPromise,
            asFile: () => undefined,
            value: typeof stringOrPromise === 'string' ? stringOrPromise : undefined,
        };
    }
    exports.createStringDataTransferItem = createStringDataTransferItem;
    function createFileDataTransferItem(fileName, uri, data) {
        const file = { id: (0, uuid_1.generateUuid)(), name: fileName, uri, data };
        return {
            asString: async () => '',
            asFile: () => file,
            value: undefined,
        };
    }
    exports.createFileDataTransferItem = createFileDataTransferItem;
    class VSDataTransfer {
        constructor() {
            this._entries = new Map();
        }
        get size() {
            let size = 0;
            for (const _ of this._entries) {
                size++;
            }
            return size;
        }
        has(mimeType) {
            return this._entries.has(this.toKey(mimeType));
        }
        matches(pattern) {
            const mimes = [...this._entries.keys()];
            if (iterator_1.Iterable.some(this, ([_, item]) => item.asFile())) {
                mimes.push('files');
            }
            return matchesMimeType_normalized(normalizeMimeType(pattern), mimes);
        }
        get(mimeType) {
            return this._entries.get(this.toKey(mimeType))?.[0];
        }
        /**
         * Add a new entry to this data transfer.
         *
         * This does not replace existing entries for `mimeType`.
         */
        append(mimeType, value) {
            const existing = this._entries.get(mimeType);
            if (existing) {
                existing.push(value);
            }
            else {
                this._entries.set(this.toKey(mimeType), [value]);
            }
        }
        /**
         * Set the entry for a given mime type.
         *
         * This replaces all existing entries for `mimeType`.
         */
        replace(mimeType, value) {
            this._entries.set(this.toKey(mimeType), [value]);
        }
        /**
         * Remove all entries for `mimeType`.
         */
        delete(mimeType) {
            this._entries.delete(this.toKey(mimeType));
        }
        /**
         * Iterate over all `[mime, item]` pairs in this data transfer.
         *
         * There may be multiple entries for each mime type.
         */
        *[Symbol.iterator]() {
            for (const [mine, items] of this._entries) {
                for (const item of items) {
                    yield [mine, item];
                }
            }
        }
        toKey(mimeType) {
            return normalizeMimeType(mimeType);
        }
    }
    exports.VSDataTransfer = VSDataTransfer;
    function normalizeMimeType(mimeType) {
        return mimeType.toLowerCase();
    }
    function matchesMimeType(pattern, mimeTypes) {
        return matchesMimeType_normalized(normalizeMimeType(pattern), mimeTypes.map(normalizeMimeType));
    }
    exports.matchesMimeType = matchesMimeType;
    function matchesMimeType_normalized(normalizedPattern, normalizedMimeTypes) {
        // Anything wildcard
        if (normalizedPattern === '*/*') {
            return normalizedMimeTypes.length > 0;
        }
        // Exact match
        if (normalizedMimeTypes.includes(normalizedPattern)) {
            return true;
        }
        // Wildcard, such as `image/*`
        const wildcard = normalizedPattern.match(/^([a-z]+)\/([a-z]+|\*)$/i);
        if (!wildcard) {
            return false;
        }
        const [_, type, subtype] = wildcard;
        if (subtype === '*') {
            return normalizedMimeTypes.some(mime => mime.startsWith(type + '/'));
        }
        return false;
    }
    exports.UriList = Object.freeze({
        // http://amundsen.com/hypermedia/urilist/
        create: (entries) => {
            return (0, arrays_1.distinct)(entries.map(x => x.toString())).join('\r\n');
        },
        split: (str) => {
            return str.split('\r\n');
        },
        parse: (str) => {
            return exports.UriList.split(str).filter(value => !value.startsWith('#'));
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YVRyYW5zZmVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9jb21tb24vZGF0YVRyYW5zZmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQW9CaEcsU0FBZ0IsNEJBQTRCLENBQUMsZUFBeUM7UUFDckYsT0FBTztZQUNOLFFBQVEsRUFBRSxLQUFLLElBQUksRUFBRSxDQUFDLGVBQWU7WUFDckMsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLFNBQVM7WUFDdkIsS0FBSyxFQUFFLE9BQU8sZUFBZSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxTQUFTO1NBQ3hFLENBQUM7SUFDSCxDQUFDO0lBTkQsb0VBTUM7SUFFRCxTQUFnQiwwQkFBMEIsQ0FBQyxRQUFnQixFQUFFLEdBQW9CLEVBQUUsSUFBK0I7UUFDakgsTUFBTSxJQUFJLEdBQUcsRUFBRSxFQUFFLEVBQUUsSUFBQSxtQkFBWSxHQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUM7UUFDL0QsT0FBTztZQUNOLFFBQVEsRUFBRSxLQUFLLElBQUksRUFBRSxDQUFDLEVBQUU7WUFDeEIsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUk7WUFDbEIsS0FBSyxFQUFFLFNBQVM7U0FDaEIsQ0FBQztJQUNILENBQUM7SUFQRCxnRUFPQztJQStCRCxNQUFhLGNBQWM7UUFBM0I7WUFFa0IsYUFBUSxHQUFHLElBQUksR0FBRyxFQUErQixDQUFDO1FBeUVwRSxDQUFDO1FBdkVBLElBQVcsSUFBSTtZQUNkLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQztZQUNiLEtBQUssTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDOUIsSUFBSSxFQUFFLENBQUM7YUFDUDtZQUNELE9BQU8sSUFBSSxDQUFDO1FB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