/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/base/common/uri", "vs/platform/configuration/common/configuration", "vs/platform/opener/common/opener", "vs/platform/product/common/productService", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkHelpers", "vs/workbench/contrib/terminal/common/terminal"], function (require, exports, lifecycle_1, strings_1, uri_1, configuration_1, opener_1, productService_1, terminalLinkHelpers_1, terminal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$SWb = void 0;
    var Constants;
    (function (Constants) {
        /**
         * The max line length to try extract word links from.
         */
        Constants[Constants["MaxLineLength"] = 2000] = "MaxLineLength";
    })(Constants || (Constants = {}));
    let $SWb = class $SWb extends lifecycle_1.$kc {
        static { this.id = 'word'; }
        constructor(xterm, b, c) {
            super();
            this.xterm = xterm;
            this.b = b;
            this.c = c;
            // Word links typically search the workspace so it makes sense that their maximum link length is
            // quite small.
            this.maxLinkLength = 100;
            this.g();
            this.B(this.b.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("terminal.integrated.wordSeparators" /* TerminalSettingId.WordSeparators */)) {
                    this.g();
                }
            }));
        }
        detect(lines, startLine, endLine) {
            const links = [];
            // Get the text representation of the wrapped line
            const text = (0, terminalLinkHelpers_1.$EWb)(this.xterm.buffer.active, startLine, endLine, this.xterm.cols);
            if (text === '' || text.length > 2000 /* Constants.MaxLineLength */) {
                return [];
            }
            // Parse out all words from the wrapped line
            const words = this.f(text);
            // Map the words to ITerminalLink objects
            for (const word of words) {
                if (word.text === '') {
                    continue;
                }
                if (word.text.length > 0 && word.text.charAt(word.text.length - 1) === ':') {
                    word.text = word.text.slice(0, -1);
                    word.endIndex--;
                }
                const bufferRange = (0, terminalLinkHelpers_1.$CWb)(lines, this.xterm.cols, {
                    startColumn: word.startIndex + 1,
                    startLineNumber: 1,
                    endColumn: word.endIndex + 1,
                    endLineNumber: 1
                }, startLine);
                // Support this product's URL protocol
                if ((0, opener_1.$OT)(word.text, this.c.urlProtocol)) {
                    const uri = uri_1.URI.parse(word.text);
                    if (uri) {
                        links.push({
                            text: word.text,
                            uri,
                            bufferRange,
                            type: "Url" /* TerminalBuiltinLinkType.Url */
                        });
                    }
                    continue;
                }
                // Search links
                links.push({
                    text: word.text,
                    bufferRange,
                    type: "Search" /* TerminalBuiltinLinkType.Search */
                });
            }
            return links;
        }
        f(text) {
            const words = [];
            const splitWords = text.split(this.a);
            let runningIndex = 0;
            for (let i = 0; i < splitWords.length; i++) {
                words.push({
                    text: splitWords[i],
                    startIndex: runningIndex,
                    endIndex: runningIndex + splitWords[i].length
                });
                runningIndex += splitWords[i].length + 1;
            }
            return words;
        }
        g() {
            const separators = this.b.getValue(terminal_1.$vM).wordSeparators;
            let powerlineSymbols = '';
            for (let i = 0xe0b0; i <= 0xe0bf; i++) {
                powerlineSymbols += String.fromCharCode(i);
            }
            this.a = new RegExp(`[${(0, strings_1.$qe)(separators)}${powerlineSymbols}]`, 'g');
        }
    };
    exports.$SWb = $SWb;
    exports.$SWb = $SWb = __decorate([
        __param(1, configuration_1.$8h),
        __param(2, productService_1.$kj)
    ], $SWb);
});
//# sourceMappingURL=terminalWordLinkDetector.js.map