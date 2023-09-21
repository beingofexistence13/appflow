/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/path"], function (require, exports, path_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.normalizeMimeType = exports.getExtensionForMimeType = exports.getMediaMime = exports.getMediaOrTextMime = exports.Mimes = void 0;
    exports.Mimes = Object.freeze({
        text: 'text/plain',
        binary: 'application/octet-stream',
        unknown: 'application/unknown',
        markdown: 'text/markdown',
        latex: 'text/latex',
        uriList: 'text/uri-list',
    });
    const mapExtToTextMimes = {
        '.css': 'text/css',
        '.csv': 'text/csv',
        '.htm': 'text/html',
        '.html': 'text/html',
        '.ics': 'text/calendar',
        '.js': 'text/javascript',
        '.mjs': 'text/javascript',
        '.txt': 'text/plain',
        '.xml': 'text/xml'
    };
    // Known media mimes that we can handle
    const mapExtToMediaMimes = {
        '.aac': 'audio/x-aac',
        '.avi': 'video/x-msvideo',
        '.bmp': 'image/bmp',
        '.flv': 'video/x-flv',
        '.gif': 'image/gif',
        '.ico': 'image/x-icon',
        '.jpe': 'image/jpg',
        '.jpeg': 'image/jpg',
        '.jpg': 'image/jpg',
        '.m1v': 'video/mpeg',
        '.m2a': 'audio/mpeg',
        '.m2v': 'video/mpeg',
        '.m3a': 'audio/mpeg',
        '.mid': 'audio/midi',
        '.midi': 'audio/midi',
        '.mk3d': 'video/x-matroska',
        '.mks': 'video/x-matroska',
        '.mkv': 'video/x-matroska',
        '.mov': 'video/quicktime',
        '.movie': 'video/x-sgi-movie',
        '.mp2': 'audio/mpeg',
        '.mp2a': 'audio/mpeg',
        '.mp3': 'audio/mpeg',
        '.mp4': 'video/mp4',
        '.mp4a': 'audio/mp4',
        '.mp4v': 'video/mp4',
        '.mpe': 'video/mpeg',
        '.mpeg': 'video/mpeg',
        '.mpg': 'video/mpeg',
        '.mpg4': 'video/mp4',
        '.mpga': 'audio/mpeg',
        '.oga': 'audio/ogg',
        '.ogg': 'audio/ogg',
        '.opus': 'audio/opus',
        '.ogv': 'video/ogg',
        '.png': 'image/png',
        '.psd': 'image/vnd.adobe.photoshop',
        '.qt': 'video/quicktime',
        '.spx': 'audio/ogg',
        '.svg': 'image/svg+xml',
        '.tga': 'image/x-tga',
        '.tif': 'image/tiff',
        '.tiff': 'image/tiff',
        '.wav': 'audio/x-wav',
        '.webm': 'video/webm',
        '.webp': 'image/webp',
        '.wma': 'audio/x-ms-wma',
        '.wmv': 'video/x-ms-wmv',
        '.woff': 'application/font-woff',
    };
    function getMediaOrTextMime(path) {
        const ext = (0, path_1.extname)(path);
        const textMime = mapExtToTextMimes[ext.toLowerCase()];
        if (textMime !== undefined) {
            return textMime;
        }
        else {
            return getMediaMime(path);
        }
    }
    exports.getMediaOrTextMime = getMediaOrTextMime;
    function getMediaMime(path) {
        const ext = (0, path_1.extname)(path);
        return mapExtToMediaMimes[ext.toLowerCase()];
    }
    exports.getMediaMime = getMediaMime;
    function getExtensionForMimeType(mimeType) {
        for (const extension in mapExtToMediaMimes) {
            if (mapExtToMediaMimes[extension] === mimeType) {
                return extension;
            }
        }
        return undefined;
    }
    exports.getExtensionForMimeType = getExtensionForMimeType;
    const _simplePattern = /^(.+)\/(.+?)(;.+)?$/;
    function normalizeMimeType(mimeType, strict) {
        const match = _simplePattern.exec(mimeType);
        if (!match) {
            return strict
                ? undefined
                : mimeType;
        }
        // https://datatracker.ietf.org/doc/html/rfc2045#section-5.1
        // media and subtype must ALWAYS be lowercase, parameter not
        return `${match[1].toLowerCase()}/${match[2].toLowerCase()}${match[3] ?? ''}`;
    }
    exports.normalizeMimeType = normalizeMimeType;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWltZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL21pbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBSW5GLFFBQUEsS0FBSyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDbEMsSUFBSSxFQUFFLFlBQVk7UUFDbEIsTUFBTSxFQUFFLDBCQUEwQjtRQUNsQyxPQUFPLEVBQUUscUJBQXFCO1FBQzlCLFFBQVEsRUFBRSxlQUFlO1FBQ3pCLEtBQUssRUFBRSxZQUFZO1FBQ25CLE9BQU8sRUFBRSxlQUFlO0tBQ3hCLENBQUMsQ0FBQztJQU1ILE1BQU0saUJBQWlCLEdBQXVCO1FBQzdDLE1BQU0sRUFBRSxVQUFVO1FBQ2xCLE1BQU0sRUFBRSxVQUFVO1FBQ2xCLE1BQU0sRUFBRSxXQUFXO1FBQ25CLE9BQU8sRUFBRSxXQUFXO1FBQ3BCLE1BQU0sRUFBRSxlQUFlO1FBQ3ZCLEtBQUssRUFBRSxpQkFBaUI7UUFDeEIsTUFBTSxFQUFFLGlCQUFpQjtRQUN6QixNQUFNLEVBQUUsWUFBWTtRQUNwQixNQUFNLEVBQUUsVUFBVTtLQUNsQixDQUFDO0lBRUYsdUNBQXVDO0lBQ3ZDLE1BQU0sa0JBQWtCLEdBQXVCO1FBQzlDLE1BQU0sRUFBRSxhQUFhO1FBQ3JCLE1BQU0sRUFBRSxpQkFBaUI7UUFDekIsTUFBTSxFQUFFLFdBQVc7UUFDbkIsTUFBTSxFQUFFLGFBQWE7UUFDckIsTUFBTSxFQUFFLFdBQVc7UUFDbkIsTUFBTSxFQUFFLGNBQWM7UUFDdEIsTUFBTSxFQUFFLFdBQVc7UUFDbkIsT0FBTyxFQUFFLFdBQVc7UUFDcEIsTUFBTSxFQUFFLFdBQVc7UUFDbkIsTUFBTSxFQUFFLFlBQVk7UUFDcEIsTUFBTSxFQUFFLFlBQVk7UUFDcEIsTUFBTSxFQUFFLFlBQVk7UUFDcEIsTUFBTSxFQUFFLFlBQVk7UUFDcEIsTUFBTSxFQUFFLFlBQVk7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