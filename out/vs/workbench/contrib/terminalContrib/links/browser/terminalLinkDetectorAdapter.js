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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/terminalContrib/links/browser/terminalLink"], function (require, exports, event_1, lifecycle_1, nls_1, instantiation_1, terminalLink_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalLinkDetectorAdapter = void 0;
    /**
     * Wrap a link detector object so it can be used in xterm.js
     */
    let TerminalLinkDetectorAdapter = class TerminalLinkDetectorAdapter extends lifecycle_1.Disposable {
        constructor(_detector, _instantiationService) {
            super();
            this._detector = _detector;
            this._instantiationService = _instantiationService;
            this._onDidActivateLink = this._register(new event_1.Emitter());
            this.onDidActivateLink = this._onDidActivateLink.event;
            this._onDidShowHover = this._register(new event_1.Emitter());
            this.onDidShowHover = this._onDidShowHover.event;
            this._activeProvideLinkRequests = new Map();
        }
        async provideLinks(bufferLineNumber, callback) {
            let activeRequest = this._activeProvideLinkRequests.get(bufferLineNumber);
            if (activeRequest) {
                await activeRequest;
                callback(this._activeLinks);
                return;
            }
            if (this._activeLinks) {
                for (const link of this._activeLinks) {
                    link.dispose();
                }
            }
            activeRequest = this._provideLinks(bufferLineNumber);
            this._activeProvideLinkRequests.set(bufferLineNumber, activeRequest);
            this._activeLinks = await activeRequest;
            this._activeProvideLinkRequests.delete(bufferLineNumber);
            callback(this._activeLinks);
        }
        async _provideLinks(bufferLineNumber) {
            // Dispose of all old links if new links are provided, links are only cached for the current line
            const links = [];
            let startLine = bufferLineNumber - 1;
            let endLine = startLine;
            const lines = [
                this._detector.xterm.buffer.active.getLine(startLine)
            ];
            // Cap the maximum context on either side of the line being provided, by taking the context
            // around the line being provided for this ensures the line the pointer is on will have
            // links provided.
            const maxLineContext = Math.max(this._detector.maxLinkLength / this._detector.xterm.cols);
            const minStartLine = Math.max(startLine - maxLineContext, 0);
            const maxEndLine = Math.min(endLine + maxLineContext, this._detector.xterm.buffer.active.length);
            while (startLine >= minStartLine && this._detector.xterm.buffer.active.getLine(startLine)?.isWrapped) {
                lines.unshift(this._detector.xterm.buffer.active.getLine(startLine - 1));
                startLine--;
            }
            while (endLine < maxEndLine && this._detector.xterm.buffer.active.getLine(endLine + 1)?.isWrapped) {
                lines.push(this._detector.xterm.buffer.active.getLine(endLine + 1));
                endLine++;
            }
            const detectedLinks = await this._detector.detect(lines, startLine, endLine);
            for (const link of detectedLinks) {
                links.push(this._createTerminalLink(link, async (event) => {
                    this._onDidActivateLink.fire({ link, event });
                }));
            }
            return links;
        }
        _createTerminalLink(l, activateCallback) {
            // Remove trailing colon if there is one so the link is more useful
            if (!l.disableTrimColon && l.text.length > 0 && l.text.charAt(l.text.length - 1) === ':') {
                l.text = l.text.slice(0, -1);
                l.bufferRange.end.x--;
            }
            return this._instantiationService.createInstance(terminalLink_1.TerminalLink, this._detector.xterm, l.bufferRange, l.text, l.actions, this._detector.xterm.buffer.active.viewportY, activateCallback, (link, viewportRange, modifierDownCallback, modifierUpCallback) => this._onDidShowHover.fire({
                link,
                viewportRange,
                modifierDownCallback,
                modifierUpCallback
            }), l.type !== "Search" /* TerminalBuiltinLinkType.Search */, // Only search is low confidence
            l.label || this._getLabel(l.type), l.type);
        }
        _getLabel(type) {
            switch (type) {
                case "Search" /* TerminalBuiltinLinkType.Search */: return (0, nls_1.localize)('searchWorkspace', 'Search workspace');
                case "LocalFile" /* TerminalBuiltinLinkType.LocalFile */: return (0, nls_1.localize)('openFile', 'Open file in editor');
                case "LocalFolderInWorkspace" /* TerminalBuiltinLinkType.LocalFolderInWorkspace */: return (0, nls_1.localize)('focusFolder', 'Focus folder in explorer');
                case "LocalFolderOutsideWorkspace" /* TerminalBuiltinLinkType.LocalFolderOutsideWorkspace */: return (0, nls_1.localize)('openFolder', 'Open folder in new window');
                case "Url" /* TerminalBuiltinLinkType.Url */:
                default:
                    return (0, nls_1.localize)('followLink', 'Follow link');
            }
        }
    };
    exports.TerminalLinkDetectorAdapter = TerminalLinkDetectorAdapter;
    exports.TerminalLinkDetectorAdapter = TerminalLinkDetectorAdapter = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], TerminalLinkDetectorAdapter);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxMaW5rRGV0ZWN0b3JBZGFwdGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWxDb250cmliL2xpbmtzL2Jyb3dzZXIvdGVybWluYWxMaW5rRGV0ZWN0b3JBZGFwdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXVCaEc7O09BRUc7SUFDSSxJQUFNLDJCQUEyQixHQUFqQyxNQUFNLDJCQUE0QixTQUFRLHNCQUFVO1FBUTFELFlBQ2tCLFNBQWdDLEVBQzFCLHFCQUE2RDtZQUVwRixLQUFLLEVBQUUsQ0FBQztZQUhTLGNBQVMsR0FBVCxTQUFTLENBQXVCO1lBQ1QsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQVBwRSx1QkFBa0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFzQixDQUFDLENBQUM7WUFDL0Usc0JBQWlCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQztZQUMxQyxvQkFBZSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQW1CLENBQUMsQ0FBQztZQUN6RSxtQkFBYyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDO1lBUzdDLCtCQUEwQixHQUF5QyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRnJGLENBQUM7UUFHRCxLQUFLLENBQUMsWUFBWSxDQUFDLGdCQUF3QixFQUFFLFFBQThDO1lBQzFGLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUMxRSxJQUFJLGFBQWEsRUFBRTtnQkFDbEIsTUFBTSxhQUFhLENBQUM7Z0JBQ3BCLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQzVCLE9BQU87YUFD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