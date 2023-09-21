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
    exports.TerminalWordLinkDetector = void 0;
    var Constants;
    (function (Constants) {
        /**
         * The max line length to try extract word links from.
         */
        Constants[Constants["MaxLineLength"] = 2000] = "MaxLineLength";
    })(Constants || (Constants = {}));
    let TerminalWordLinkDetector = class TerminalWordLinkDetector extends lifecycle_1.Disposable {
        static { this.id = 'word'; }
        constructor(xterm, _configurationService, _productService) {
            super();
            this.xterm = xterm;
            this._configurationService = _configurationService;
            this._productService = _productService;
            // Word links typically search the workspace so it makes sense that their maximum link length is
            // quite small.
            this.maxLinkLength = 100;
            this._refreshSeparatorCodes();
            this._register(this._configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("terminal.integrated.wordSeparators" /* TerminalSettingId.WordSeparators */)) {
                    this._refreshSeparatorCodes();
                }
            }));
        }
        detect(lines, startLine, endLine) {
            const links = [];
            // Get the text representation of the wrapped line
            const text = (0, terminalLinkHelpers_1.getXtermLineContent)(this.xterm.buffer.active, startLine, endLine, this.xterm.cols);
            if (text === '' || text.length > 2000 /* Constants.MaxLineLength */) {
                return [];
            }
            // Parse out all words from the wrapped line
            const words = this._parseWords(text);
            // Map the words to ITerminalLink objects
            for (const word of words) {
                if (word.text === '') {
                    continue;
                }
                if (word.text.length > 0 && word.text.charAt(word.text.length - 1) === ':') {
                    word.text = word.text.slice(0, -1);
                    word.endIndex--;
                }
                const bufferRange = (0, terminalLinkHelpers_1.convertLinkRangeToBuffer)(lines, this.xterm.cols, {
                    startColumn: word.startIndex + 1,
                    startLineNumber: 1,
                    endColumn: word.endIndex + 1,
                    endLineNumber: 1
                }, startLine);
                // Support this product's URL protocol
                if ((0, opener_1.matchesScheme)(word.text, this._productService.urlProtocol)) {
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
        _parseWords(text) {
            const words = [];
            const splitWords = text.split(this._separatorRegex);
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
        _refreshSeparatorCodes() {
            const separators = this._configurationService.getValue(terminal_1.TERMINAL_CONFIG_SECTION).wordSeparators;
            let powerlineSymbols = '';
            for (let i = 0xe0b0; i <= 0xe0bf; i++) {
                powerlineSymbols += String.fromCharCode(i);
            }
            this._separatorRegex = new RegExp(`[${(0, strings_1.escapeRegExpCharacters)(separators)}${powerlineSymbols}]`, 'g');
        }
    };
    exports.TerminalWordLinkDetector = TerminalWordLinkDetector;
    exports.TerminalWordLinkDetector = TerminalWordLinkDetector = __decorate([
        __param(1, configuration_1.IConfigurationService),
        __param(2, productService_1.IProductService)
    ], TerminalWordLinkDetector);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxXb3JkTGlua0RldGVjdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWxDb250cmliL2xpbmtzL2Jyb3dzZXIvdGVybWluYWxXb3JkTGlua0RldGVjdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWNoRyxJQUFXLFNBS1Y7SUFMRCxXQUFXLFNBQVM7UUFDbkI7O1dBRUc7UUFDSCw4REFBb0IsQ0FBQTtJQUNyQixDQUFDLEVBTFUsU0FBUyxLQUFULFNBQVMsUUFLbkI7SUFRTSxJQUFNLHdCQUF3QixHQUE5QixNQUFNLHdCQUF5QixTQUFRLHNCQUFVO2lCQUNoRCxPQUFFLEdBQUcsTUFBTSxBQUFULENBQVU7UUFRbkIsWUFDVSxLQUFlLEVBQ0QscUJBQTZELEVBQ25FLGVBQWlEO1lBRWxFLEtBQUssRUFBRSxDQUFDO1lBSkMsVUFBSyxHQUFMLEtBQUssQ0FBVTtZQUNnQiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQ2xELG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtZQVRuRSxnR0FBZ0c7WUFDaEcsZUFBZTtZQUNOLGtCQUFhLEdBQUcsR0FBRyxDQUFDO1lBVzVCLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1lBQzlCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUN0RSxJQUFJLENBQUMsQ0FBQyxvQkFBb0IsNkVBQWtDLEVBQUU7b0JBQzdELElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO2lCQUM5QjtZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRUQsTUFBTSxDQUFDLEtBQW9CLEVBQUUsU0FBaUIsRUFBRSxPQUFlO1lBQzlELE1BQU0sS0FBSyxHQUEwQixF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