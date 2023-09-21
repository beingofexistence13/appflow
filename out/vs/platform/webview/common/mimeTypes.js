/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/mime", "vs/base/common/path"], function (require, exports, mime_1, path_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getWebviewContentMimeType = void 0;
    const webviewMimeTypes = new Map([
        ['.svg', 'image/svg+xml'],
        ['.txt', mime_1.Mimes.text],
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
    function getWebviewContentMimeType(resource) {
        const ext = (0, path_1.extname)(resource.fsPath).toLowerCase();
        return webviewMimeTypes.get(ext) || (0, mime_1.getMediaMime)(resource.fsPath) || mime_1.Mimes.unknown;
    }
    exports.getWebviewContentMimeType = getWebviewContentMimeType;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWltZVR5cGVzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vd2Vidmlldy9jb21tb24vbWltZVR5cGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1oRyxNQUFNLGdCQUFnQixHQUFHLElBQUksR0FBRyxDQUFDO1FBQ2hDLENBQUMsTUFBTSxFQUFFLGVBQWUsQ0FBQztRQUN6QixDQUFDLE1BQU0sRUFBRSxZQUFLLENBQUMsSUFBSSxDQUFDO1FBQ3BCLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQztRQUNwQixDQUFDLEtBQUssRUFBRSx3QkFBd0IsQ0FBQztRQUNqQyxDQUFDLE1BQU0sRUFBRSx3QkFBd0IsQ0FBQztRQUNsQyxDQUFDLE1BQU0sRUFBRSx3QkFBd0IsQ0FBQztRQUNsQyxDQUFDLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQztRQUM3QixDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUM7UUFDdEIsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDO1FBQ3JCLENBQUMsUUFBUSxFQUFFLHVCQUF1QixDQUFDO1FBQ25DLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQztRQUNwQixDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQztRQUMzQixDQUFDLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQztLQUM3QixDQUFDLENBQUM7SUFFSCxTQUFnQix5QkFBeUIsQ0FBQyxRQUFhO1FBQ3RELE1BQU0sR0FBRyxHQUFHLElBQUEsY0FBTyxFQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNuRCxPQUFPLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFBLG1CQUFZLEVBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLFlBQUssQ0FBQyxPQUFPLENBQUM7SUFDcEYsQ0FBQztJQUhELDhEQUdDIn0=