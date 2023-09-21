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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/uri", "vs/nls!vs/workbench/contrib/terminalContrib/links/browser/terminalLinkManager", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/tunnel/common/tunnel", "vs/workbench/contrib/terminalContrib/links/browser/terminalExternalLinkDetector", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkDetectorAdapter", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkOpeners", "vs/workbench/contrib/terminalContrib/links/browser/terminalLocalLinkDetector", "vs/workbench/contrib/terminalContrib/links/browser/terminalUriLinkDetector", "vs/workbench/contrib/terminalContrib/links/browser/terminalWordLinkDetector", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/widgets/terminalHoverWidget", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkHelpers", "vs/base/common/async", "vs/platform/terminal/common/terminal", "vs/workbench/contrib/terminalContrib/links/browser/terminalMultiLineLinkDetector"], function (require, exports, dom_1, htmlContent_1, lifecycle_1, platform_1, uri_1, nls, configuration_1, instantiation_1, tunnel_1, terminalExternalLinkDetector_1, terminalLinkDetectorAdapter_1, terminalLinkOpeners_1, terminalLocalLinkDetector_1, terminalUriLinkDetector_1, terminalWordLinkDetector_1, terminal_1, terminalHoverWidget_1, terminal_2, terminalLinkHelpers_1, async_1, terminal_3, terminalMultiLineLinkDetector_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$VWb = void 0;
    /**
     * An object responsible for managing registration of link matchers and link providers.
     */
    let $VWb = class $VWb extends lifecycle_1.$jc {
        constructor(m, n, capabilities, q, s, t, u, w) {
            super();
            this.m = m;
            this.n = n;
            this.q = q;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.b = new Map();
            this.c = [];
            this.h = [];
            this.j = new Map();
            let enableFileLinks = true;
            const enableFileLinksConfig = this.s.getValue(terminal_2.$vM).enableFileLinks;
            switch (enableFileLinksConfig) {
                case 'off':
                case false: // legacy from v1.75
                    enableFileLinks = false;
                    break;
                case 'notRemote':
                    enableFileLinks = !this.n.remoteAuthority;
                    break;
            }
            // Setup link detectors in their order of priority
            this.z(terminalUriLinkDetector_1.$RWb.id, this.t.createInstance(terminalUriLinkDetector_1.$RWb, this.m, this.n, this.q));
            if (enableFileLinks) {
                this.z(terminalMultiLineLinkDetector_1.$UWb.id, this.t.createInstance(terminalMultiLineLinkDetector_1.$UWb, this.m, this.n, this.q));
                this.z(terminalLocalLinkDetector_1.$QWb.id, this.t.createInstance(terminalLocalLinkDetector_1.$QWb, this.m, capabilities, this.n, this.q));
            }
            this.z(terminalWordLinkDetector_1.$SWb.id, this.add(this.t.createInstance(terminalWordLinkDetector_1.$SWb, this.m)));
            // Setup link openers
            const localFileOpener = this.t.createInstance(terminalLinkOpeners_1.$LWb);
            const localFolderInWorkspaceOpener = this.t.createInstance(terminalLinkOpeners_1.$MWb);
            this.j.set("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, localFileOpener);
            this.j.set("LocalFolderInWorkspace" /* TerminalBuiltinLinkType.LocalFolderInWorkspace */, localFolderInWorkspaceOpener);
            this.j.set("LocalFolderOutsideWorkspace" /* TerminalBuiltinLinkType.LocalFolderOutsideWorkspace */, this.t.createInstance(terminalLinkOpeners_1.$NWb));
            this.j.set("Search" /* TerminalBuiltinLinkType.Search */, this.t.createInstance(terminalLinkOpeners_1.$OWb, capabilities, this.n.initialCwd, localFileOpener, localFolderInWorkspaceOpener, () => this.n.os || platform_1.OS));
            this.j.set("Url" /* TerminalBuiltinLinkType.Url */, this.t.createInstance(terminalLinkOpeners_1.$PWb, !!this.n.remoteAuthority));
            this.I();
            let activeHoverDisposable;
            let activeTooltipScheduler;
            this.add((0, lifecycle_1.$ic)(() => {
                activeHoverDisposable?.dispose();
                activeTooltipScheduler?.dispose();
            }));
            this.m.options.linkHandler = {
                activate: (_, text) => {
                    this.j.get("Url" /* TerminalBuiltinLinkType.Url */)?.open({
                        type: "Url" /* TerminalBuiltinLinkType.Url */,
                        text,
                        bufferRange: null,
                        uri: uri_1.URI.parse(text)
                    });
                },
                hover: (e, text, range) => {
                    activeHoverDisposable?.dispose();
                    activeHoverDisposable = undefined;
                    activeTooltipScheduler?.dispose();
                    activeTooltipScheduler = new async_1.$Sg(() => {
                        const core = this.m._core;
                        const cellDimensions = {
                            width: core._renderService.dimensions.css.cell.width,
                            height: core._renderService.dimensions.css.cell.height
                        };
                        const terminalDimensions = {
                            width: this.m.cols,
                            height: this.m.rows
                        };
                        activeHoverDisposable = this.G({
                            viewportRange: (0, terminalLinkHelpers_1.$DWb)(range, this.m.buffer.active.viewportY),
                            cellDimensions,
                            terminalDimensions
                        }, this.L(text, text), undefined, (text) => this.m.options.linkHandler?.activate(e, text, range));
                        // Clear out scheduler until next hover event
                        activeTooltipScheduler?.dispose();
                        activeTooltipScheduler = undefined;
                    }, this.s.getValue('workbench.hover.delay'));
                    activeTooltipScheduler.schedule();
                }
            };
        }
        z(id, detector, isExternal = false) {
            const detectorAdapter = this.add(this.t.createInstance(terminalLinkDetectorAdapter_1.$KWb, detector));
            this.add(detectorAdapter.onDidActivateLink(e => {
                // Prevent default electron link handling so Alt+Click mode works normally
                e.event?.preventDefault();
                // Require correct modifier on click unless event is coming from linkQuickPick selection
                if (e.event && !(e.event instanceof terminal_1.$Rib) && !this.J(e.event)) {
                    return;
                }
                // Just call the handler if there is no before listener
                if (e.link.activate) {
                    // Custom activate call (external links only)
                    e.link.activate(e.link.text);
                }
                else {
                    this.B(e.link);
                }
            }));
            this.add(detectorAdapter.onDidShowHover(e => this.F(e.link, e.viewportRange, e.modifierDownCallback, e.modifierUpCallback)));
            if (!isExternal) {
                this.b.set(id, detectorAdapter);
            }
            return detectorAdapter;
        }
        async B(link) {
            this.u.debug('Opening link', link);
            const opener = this.j.get(link.type);
            if (!opener) {
                throw new Error(`No matching opener for link type "${link.type}"`);
            }
            await opener.open(link);
        }
        async openRecentLink(type) {
            let links;
            let i = this.m.buffer.active.length;
            while ((!links || links.length === 0) && i >= this.m.buffer.active.viewportY) {
                links = await this.D(i, type);
                i--;
            }
            if (!links || links.length < 1) {
                return undefined;
            }
            const event = new terminal_1.$Rib(dom_1.$3O.CLICK);
            links[0].activate(event, links[0].text);
            return links[0];
        }
        async getLinks() {
            // Fetch and await the viewport results
            const viewportLinksByLinePromises = [];
            for (let i = this.m.buffer.active.viewportY + this.m.rows - 1; i >= this.m.buffer.active.viewportY; i--) {
                viewportLinksByLinePromises.push(this.C(i));
            }
            const viewportLinksByLine = await Promise.all(viewportLinksByLinePromises);
            // Assemble viewport links
            const viewportLinks = {
                wordLinks: [],
                webLinks: [],
                fileLinks: [],
                folderLinks: [],
            };
            for (const links of viewportLinksByLine) {
                if (links) {
                    const { wordLinks, webLinks, fileLinks, folderLinks } = links;
                    if (wordLinks?.length) {
                        viewportLinks.wordLinks.push(...wordLinks.reverse());
                    }
                    if (webLinks?.length) {
                        viewportLinks.webLinks.push(...webLinks.reverse());
                    }
                    if (fileLinks?.length) {
                        viewportLinks.fileLinks.push(...fileLinks.reverse());
                    }
                    if (folderLinks?.length) {
                        viewportLinks.folderLinks.push(...folderLinks.reverse());
                    }
                }
            }
            // Fetch the remaining results async
            const aboveViewportLinksPromises = [];
            for (let i = this.m.buffer.active.viewportY - 1; i >= 0; i--) {
                aboveViewportLinksPromises.push(this.C(i));
            }
            const belowViewportLinksPromises = [];
            for (let i = this.m.buffer.active.length - 1; i >= this.m.buffer.active.viewportY + this.m.rows; i--) {
                belowViewportLinksPromises.push(this.C(i));
            }
            // Assemble all links in results
            const allLinks = Promise.all(aboveViewportLinksPromises).then(async (aboveViewportLinks) => {
                const belowViewportLinks = await Promise.all(belowViewportLinksPromises);
                const allResults = {
                    wordLinks: [...viewportLinks.wordLinks],
                    webLinks: [...viewportLinks.webLinks],
                    fileLinks: [...viewportLinks.fileLinks],
                    folderLinks: [...viewportLinks.folderLinks]
                };
                for (const links of [...belowViewportLinks, ...aboveViewportLinks]) {
                    if (links) {
                        const { wordLinks, webLinks, fileLinks, folderLinks } = links;
                        if (wordLinks?.length) {
                            allResults.wordLinks.push(...wordLinks.reverse());
                        }
                        if (webLinks?.length) {
                            allResults.webLinks.push(...webLinks.reverse());
                        }
                        if (fileLinks?.length) {
                            allResults.fileLinks.push(...fileLinks.reverse());
                        }
                        if (folderLinks?.length) {
                            allResults.folderLinks.push(...folderLinks.reverse());
                        }
                    }
                }
                return allResults;
            });
            return {
                viewport: viewportLinks,
                all: allLinks
            };
        }
        async C(y) {
            const unfilteredWordLinks = await this.D(y, 'word');
            const webLinks = await this.D(y, 'url');
            const fileLinks = await this.D(y, 'localFile');
            const folderLinks = await this.D(y, 'localFolder');
            const words = new Set();
            let wordLinks;
            if (unfilteredWordLinks) {
                wordLinks = [];
                for (const link of unfilteredWordLinks) {
                    if (!words.has(link.text) && link.text.length > 1) {
                        wordLinks.push(link);
                        words.add(link.text);
                    }
                }
            }
            return { wordLinks, webLinks, fileLinks, folderLinks };
        }
        async D(y, type) {
            switch (type) {
                case 'word':
                    return (await new Promise(r => this.b.get(terminalWordLinkDetector_1.$SWb.id)?.provideLinks(y, r)));
                case 'url':
                    return (await new Promise(r => this.b.get(terminalUriLinkDetector_1.$RWb.id)?.provideLinks(y, r)));
                case 'localFile': {
                    const links = (await new Promise(r => this.b.get(terminalLocalLinkDetector_1.$QWb.id)?.provideLinks(y, r)));
                    return links?.filter(link => link.type === "LocalFile" /* TerminalBuiltinLinkType.LocalFile */);
                }
                case 'localFolder': {
                    const links = (await new Promise(r => this.b.get(terminalLocalLinkDetector_1.$QWb.id)?.provideLinks(y, r)));
                    return links?.filter(link => link.type === "LocalFolderInWorkspace" /* TerminalBuiltinLinkType.LocalFolderInWorkspace */);
                }
            }
        }
        F(link, viewportRange, modifierDownCallback, modifierUpCallback) {
            if (!this.a) {
                return;
            }
            const core = this.m._core;
            const cellDimensions = {
                width: core._renderService.dimensions.css.cell.width,
                height: core._renderService.dimensions.css.cell.height
            };
            const terminalDimensions = {
                width: this.m.cols,
                height: this.m.rows
            };
            // Don't pass the mouse event as this avoids the modifier check
            this.G({
                viewportRange,
                cellDimensions,
                terminalDimensions,
                modifierDownCallback,
                modifierUpCallback
            }, this.L(link.text, link.label), link.actions, (text) => link.activate(undefined, text), link);
        }
        G(targetOptions, text, actions, linkHandler, link) {
            if (this.a) {
                const widget = this.t.createInstance(terminalHoverWidget_1.$TWb, targetOptions, text, actions, linkHandler);
                const attached = this.a.attachWidget(widget);
                if (attached) {
                    link?.onInvalidated(() => attached.dispose());
                }
                return attached;
            }
            return undefined;
        }
        setWidgetManager(widgetManager) {
            this.a = widgetManager;
        }
        H() {
            (0, lifecycle_1.$fc)(this.c);
            this.c.length = 0;
        }
        I() {
            for (const p of this.b.values()) {
                this.c.push(this.m.registerLinkProvider(p));
            }
        }
        registerExternalLinkProvider(provideLinks) {
            // Clear and re-register the standard link providers so they are a lower priority than the new one
            this.H();
            const detectorId = `extension-${this.h.length}`;
            const wrappedLinkProvider = this.z(detectorId, new terminalExternalLinkDetector_1.$IWb(detectorId, this.m, provideLinks), true);
            const newLinkProvider = this.m.registerLinkProvider(wrappedLinkProvider);
            this.h.push(newLinkProvider);
            this.I();
            return newLinkProvider;
        }
        J(event) {
            const editorConf = this.s.getValue('editor');
            if (editorConf.multiCursorModifier === 'ctrlCmd') {
                return !!event.altKey;
            }
            return platform_1.$j ? event.metaKey : event.ctrlKey;
        }
        L(uri, label) {
            const editorConf = this.s.getValue('editor');
            let clickLabel = '';
            if (editorConf.multiCursorModifier === 'ctrlCmd') {
                if (platform_1.$j) {
                    clickLabel = nls.localize(0, null);
                }
                else {
                    clickLabel = nls.localize(1, null);
                }
            }
            else {
                if (platform_1.$j) {
                    clickLabel = nls.localize(2, null);
                }
                else {
                    clickLabel = nls.localize(3, null);
                }
            }
            let fallbackLabel = nls.localize(4, null);
            try {
                if (this.w.canTunnel(uri_1.URI.parse(uri))) {
                    fallbackLabel = nls.localize(5, null);
                }
            }
            catch {
                // No-op, already set to fallback
            }
            const markdown = new htmlContent_1.$Xj('', true);
            // Escapes markdown in label & uri
            if (label) {
                label = markdown.appendText(label).value;
                markdown.value = '';
            }
            if (uri) {
                uri = markdown.appendText(uri).value;
                markdown.value = '';
            }
            label = label || fallbackLabel;
            // Use the label when uri is '' so the link displays correctly
            uri = uri || label;
            // Although if there is a space in the uri, just replace it completely
            if (/(\s|&nbsp;)/.test(uri)) {
                uri = nls.localize(6, null);
            }
            return markdown.appendLink(uri, label).appendMarkdown(` (${clickLabel})`);
        }
    };
    exports.$VWb = $VWb;
    exports.$VWb = $VWb = __decorate([
        __param(4, configuration_1.$8h),
        __param(5, instantiation_1.$Ah),
        __param(6, terminal_3.$Zq),
        __param(7, tunnel_1.$Wz)
    ], $VWb);
});
//# sourceMappingURL=terminalLinkManager.js.map