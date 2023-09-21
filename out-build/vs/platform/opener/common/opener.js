/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation"], function (require, exports, strings_1, uri_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$RT = exports.$QT = exports.$PT = exports.$OT = exports.$NT = void 0;
    exports.$NT = (0, instantiation_1.$Bh)('openerService');
    function $OT(target, scheme) {
        if (uri_1.URI.isUri(target)) {
            return (0, strings_1.$Me)(target.scheme, scheme);
        }
        else {
            return (0, strings_1.$Ne)(target, scheme + ':');
        }
    }
    exports.$OT = $OT;
    function $PT(target, ...schemes) {
        return schemes.some(scheme => $OT(target, scheme));
    }
    exports.$PT = $PT;
    /**
     * Encodes selection into the `URI`.
     *
     * IMPORTANT: you MUST use `extractSelection` to separate the selection
     * again from the original `URI` before passing the `URI` into any
     * component that is not aware of selections.
     */
    function $QT(uri, selection) {
        return uri.with({ fragment: `${selection.startLineNumber},${selection.startColumn}${selection.endLineNumber ? `-${selection.endLineNumber}${selection.endColumn ? `,${selection.endColumn}` : ''}` : ''}` });
    }
    exports.$QT = $QT;
    /**
     * file:///some/file.js#73
     * file:///some/file.js#L73
     * file:///some/file.js#73,84
     * file:///some/file.js#L73,84
     * file:///some/file.js#73-83
     * file:///some/file.js#L73-L83
     * file:///some/file.js#73,84-83,52
     * file:///some/file.js#L73,84-L83,52
     */
    function $RT(uri) {
        let selection = undefined;
        const match = /^L?(\d+)(?:,(\d+))?(-L?(\d+)(?:,(\d+))?)?/.exec(uri.fragment);
        if (match) {
            selection = {
                startLineNumber: parseInt(match[1]),
                startColumn: match[2] ? parseInt(match[2]) : 1,
                endLineNumber: match[4] ? parseInt(match[4]) : undefined,
                endColumn: match[4] ? (match[5] ? parseInt(match[5]) : 1) : undefined
            };
            uri = uri.with({ fragment: '' });
        }
        return { selection, uri };
    }
    exports.$RT = $RT;
});
//# sourceMappingURL=opener.js.map