"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryDocument = void 0;
class InMemoryDocument {
    constructor(uri, _contents, version = 0) {
        this.uri = uri;
        this._contents = _contents;
        this.version = version;
    }
    getText() {
        return this._contents;
    }
}
exports.InMemoryDocument = InMemoryDocument;
//# sourceMappingURL=inMemoryDocument.js.map