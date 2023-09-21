/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/mime", "vs/base/common/path"], function (require, exports, mime_1, path_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$34b = void 0;
    const webviewMimeTypes = new Map([
        ['.svg', 'image/svg+xml'],
        ['.txt', mime_1.$Hr.text],
        ['.css', 'text/css'],
        ['.js', 'application/javascript'],
        ['.cjs', 'application/javascript'],
        ['.mjs', 'application/javascript'],
        ['.json', 'application/json'],
        ['.html', 'text/html'],
        ['.htm', 'text/html'],
        ['.xhtml', 'application/xhtml+xml'],
        ['.oft', 'font/otf'],
        ['.xml', 'application/xml'],
        ['.wasm', 'application/wasm'],
    ]);
    function $34b(resource) {
        const ext = (0, path_1.$be)(resource.fsPath).toLowerCase();
        return webviewMimeTypes.get(ext) || (0, mime_1.$Jr)(resource.fsPath) || mime_1.$Hr.unknown;
    }
    exports.$34b = $34b;
});
//# sourceMappingURL=mimeTypes.js.map