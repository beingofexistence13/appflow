/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkHelpers"], function (require, exports, terminalLinkHelpers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$IWb = void 0;
    class $IWb {
        constructor(id, xterm, a) {
            this.id = id;
            this.xterm = xterm;
            this.a = a;
            this.maxLinkLength = 2000;
        }
        async detect(lines, startLine, endLine) {
            // Get the text representation of the wrapped line
            const text = (0, terminalLinkHelpers_1.$EWb)(this.xterm.buffer.active, startLine, endLine, this.xterm.cols);
            if (text === '' || text.length > this.maxLinkLength) {
                return [];
            }
            const externalLinks = await this.a(text);
            if (!externalLinks) {
                return [];
            }
            const result = externalLinks.map(link => {
                const bufferRange = (0, terminalLinkHelpers_1.$CWb)(lines, this.xterm.cols, {
                    startColumn: link.startIndex + 1,
                    startLineNumber: 1,
                    endColumn: link.startIndex + link.length + 1,
                    endLineNumber: 1
                }, startLine);
                const matchingText = text.substring(link.startIndex, link.startIndex + link.length) || '';
                const l = {
                    text: matchingText,
                    label: link.label,
                    bufferRange,
                    type: { id: this.id },
                    activate: link.activate
                };
                return l;
            });
            return result;
        }
    }
    exports.$IWb = $IWb;
});
//# sourceMappingURL=terminalExternalLinkDetector.js.map