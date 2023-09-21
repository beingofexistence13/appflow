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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/terminalContrib/links/browser/terminalLinkDetectorAdapter", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/terminalContrib/links/browser/terminalLink"], function (require, exports, event_1, lifecycle_1, nls_1, instantiation_1, terminalLink_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$KWb = void 0;
    /**
     * Wrap a link detector object so it can be used in xterm.js
     */
    let $KWb = class $KWb extends lifecycle_1.$kc {
        constructor(f, g) {
            super();
            this.f = f;
            this.g = g;
            this.b = this.B(new event_1.$fd());
            this.onDidActivateLink = this.b.event;
            this.c = this.B(new event_1.$fd());
            this.onDidShowHover = this.c.event;
            this.h = new Map();
        }
        async provideLinks(bufferLineNumber, callback) {
            let activeRequest = this.h.get(bufferLineNumber);
            if (activeRequest) {
                await activeRequest;
                callback(this.a);
                return;
            }
            if (this.a) {
                for (const link of this.a) {
                    link.dispose();
                }
            }
            activeRequest = this.j(bufferLineNumber);
            this.h.set(bufferLineNumber, activeRequest);
            this.a = await activeRequest;
            this.h.delete(bufferLineNumber);
            callback(this.a);
        }
        async j(bufferLineNumber) {
            // Dispose of all old links if new links are provided, links are only cached for the current line
            const links = [];
            let startLine = bufferLineNumber - 1;
            let endLine = startLine;
            const lines = [
                this.f.xterm.buffer.active.getLine(startLine)
            ];
            // Cap the maximum context on either side of the line being provided, by taking the context
            // around the line being provided for this ensures the line the pointer is on will have
            // links provided.
            const maxLineContext = Math.max(this.f.maxLinkLength / this.f.xterm.cols);
            const minStartLine = Math.max(startLine - maxLineContext, 0);
            const maxEndLine = Math.min(endLine + maxLineContext, this.f.xterm.buffer.active.length);
            while (startLine >= minStartLine && this.f.xterm.buffer.active.getLine(startLine)?.isWrapped) {
                lines.unshift(this.f.xterm.buffer.active.getLine(startLine - 1));
                startLine--;
            }
            while (endLine < maxEndLine && this.f.xterm.buffer.active.getLine(endLine + 1)?.isWrapped) {
                lines.push(this.f.xterm.buffer.active.getLine(endLine + 1));
                endLine++;
            }
            const detectedLinks = await this.f.detect(lines, startLine, endLine);
            for (const link of detectedLinks) {
                links.push(this.m(link, async (event) => {
                    this.b.fire({ link, event });
                }));
            }
            return links;
        }
        m(l, activateCallback) {
            // Remove trailing colon if there is one so the link is more useful
            if (!l.disableTrimColon && l.text.length > 0 && l.text.charAt(l.text.length - 1) === ':') {
                l.text = l.text.slice(0, -1);
                l.bufferRange.end.x--;
            }
            return this.g.createInstance(terminalLink_1.$JWb, this.f.xterm, l.bufferRange, l.text, l.actions, this.f.xterm.buffer.active.viewportY, activateCallback, (link, viewportRange, modifierDownCallback, modifierUpCallback) => this.c.fire({
                link,
                viewportRange,
                modifierDownCallback,
                modifierUpCallback
            }), l.type !== "Search" /* TerminalBuiltinLinkType.Search */, // Only search is low confidence
            l.label || this.n(l.type), l.type);
        }
        n(type) {
            switch (type) {
                case "Search" /* TerminalBuiltinLinkType.Search */: return (0, nls_1.localize)(0, null);
                case "LocalFile" /* TerminalBuiltinLinkType.LocalFile */: return (0, nls_1.localize)(1, null);
                case "LocalFolderInWorkspace" /* TerminalBuiltinLinkType.LocalFolderInWorkspace */: return (0, nls_1.localize)(2, null);
                case "LocalFolderOutsideWorkspace" /* TerminalBuiltinLinkType.LocalFolderOutsideWorkspace */: return (0, nls_1.localize)(3, null);
                case "Url" /* TerminalBuiltinLinkType.Url */:
                default:
                    return (0, nls_1.localize)(4, null);
            }
        }
    };
    exports.$KWb = $KWb;
    exports.$KWb = $KWb = __decorate([
        __param(1, instantiation_1.$Ah)
    ], $KWb);
});
//# sourceMappingURL=terminalLinkDetectorAdapter.js.map