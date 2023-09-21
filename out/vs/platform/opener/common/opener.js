/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation"], function (require, exports, strings_1, uri_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.extractSelection = exports.withSelection = exports.matchesSomeScheme = exports.matchesScheme = exports.IOpenerService = void 0;
    exports.IOpenerService = (0, instantiation_1.createDecorator)('openerService');
    function matchesScheme(target, scheme) {
        if (uri_1.URI.isUri(target)) {
            return (0, strings_1.equalsIgnoreCase)(target.scheme, scheme);
        }
        else {
            return (0, strings_1.startsWithIgnoreCase)(target, scheme + ':');
        }
    }
    exports.matchesScheme = matchesScheme;
    function matchesSomeScheme(target, ...schemes) {
        return schemes.some(scheme => matchesScheme(target, scheme));
    }
    exports.matchesSomeScheme = matchesSomeScheme;
    /**
     * Encodes selection into the `URI`.
     *
     * IMPORTANT: you MUST use `extractSelection` to separate the selection
     * again from the original `URI` before passing the `URI` into any
     * component that is not aware of selections.
     */
    function withSelection(uri, selection) {
        return uri.with({ fragment: `${selection.startLineNumber},${selection.startColumn}${selection.endLineNumber ? `-${selection.endLineNumber}${selection.endColumn ? `,${selection.endColumn}` : ''}` : ''}` });
    }
    exports.withSelection = withSelection;
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
    function extractSelection(uri) {
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
    exports.extractSelection = extractSelection;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3BlbmVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vb3BlbmVyL2NvbW1vbi9vcGVuZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU25GLFFBQUEsY0FBYyxHQUFHLElBQUEsK0JBQWUsRUFBaUIsZUFBZSxDQUFDLENBQUM7SUEyRy9FLFNBQWdCLGFBQWEsQ0FBQyxNQUFvQixFQUFFLE1BQWM7UUFDakUsSUFBSSxTQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ3RCLE9BQU8sSUFBQSwwQkFBZ0IsRUFBQyxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQy9DO2FBQU07WUFDTixPQUFPLElBQUEsOEJBQW9CLEVBQUMsTUFBTSxFQUFFLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQztTQUNsRDtJQUNGLENBQUM7SUFORCxzQ0FNQztJQUVELFNBQWdCLGlCQUFpQixDQUFDLE1BQW9CLEVBQUUsR0FBRyxPQUFpQjtRQUMzRSxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUZELDhDQUVDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsU0FBZ0IsYUFBYSxDQUFDLEdBQVEsRUFBRSxTQUErQjtRQUN0RSxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxRQUFRLEVBQUUsR0FBRyxTQUFTLENBQUMsZUFBZSxJQUFJLFNBQVMsQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsYUFBYSxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzlNLENBQUM7SUFGRCxzQ0FFQztJQUVEOzs7Ozs7Ozs7T0FTRztJQUNILFNBQWdCLGdCQUFnQixDQUFDLEdBQVE7UUFDeEMsSUFBSSxTQUFTLEdBQXFDLFNBQVMsQ0FBQztRQUM1RCxNQUFNLEtBQUssR0FBRywyQ0FBMkMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzdFLElBQUksS0FBSyxFQUFFO1lBQ1YsU0FBUyxHQUFHO2dCQUNYLGVBQWUsRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNuQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzlDLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztnQkFDeEQsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7YUFDckUsQ0FBQztZQUNGLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDakM7UUFDRCxPQUFPLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFiRCw0Q0FhQyJ9