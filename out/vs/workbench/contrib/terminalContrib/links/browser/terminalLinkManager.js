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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/uri", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/tunnel/common/tunnel", "vs/workbench/contrib/terminalContrib/links/browser/terminalExternalLinkDetector", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkDetectorAdapter", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkOpeners", "vs/workbench/contrib/terminalContrib/links/browser/terminalLocalLinkDetector", "vs/workbench/contrib/terminalContrib/links/browser/terminalUriLinkDetector", "vs/workbench/contrib/terminalContrib/links/browser/terminalWordLinkDetector", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/widgets/terminalHoverWidget", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkHelpers", "vs/base/common/async", "vs/platform/terminal/common/terminal", "vs/workbench/contrib/terminalContrib/links/browser/terminalMultiLineLinkDetector"], function (require, exports, dom_1, htmlContent_1, lifecycle_1, platform_1, uri_1, nls, configuration_1, instantiation_1, tunnel_1, terminalExternalLinkDetector_1, terminalLinkDetectorAdapter_1, terminalLinkOpeners_1, terminalLocalLinkDetector_1, terminalUriLinkDetector_1, terminalWordLinkDetector_1, terminal_1, terminalHoverWidget_1, terminal_2, terminalLinkHelpers_1, async_1, terminal_3, terminalMultiLineLinkDetector_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalLinkManager = void 0;
    /**
     * An object responsible for managing registration of link matchers and link providers.
     */
    let TerminalLinkManager = class TerminalLinkManager extends lifecycle_1.DisposableStore {
        constructor(_xterm, _processInfo, capabilities, _linkResolver, _configurationService, _instantiationService, _logService, _tunnelService) {
            super();
            this._xterm = _xterm;
            this._processInfo = _processInfo;
            this._linkResolver = _linkResolver;
            this._configurationService = _configurationService;
            this._instantiationService = _instantiationService;
            this._logService = _logService;
            this._tunnelService = _tunnelService;
            this._standardLinkProviders = new Map();
            this._linkProvidersDisposables = [];
            this._externalLinkProviders = [];
            this._openers = new Map();
            let enableFileLinks = true;
            const enableFileLinksConfig = this._configurationService.getValue(terminal_2.TERMINAL_CONFIG_SECTION).enableFileLinks;
            switch (enableFileLinksConfig) {
                case 'off':
                case false: // legacy from v1.75
                    enableFileLinks = false;
                    break;
                case 'notRemote':
                    enableFileLinks = !this._processInfo.remoteAuthority;
                    break;
            }
            // Setup link detectors in their order of priority
            this._setupLinkDetector(terminalUriLinkDetector_1.TerminalUriLinkDetector.id, this._instantiationService.createInstance(terminalUriLinkDetector_1.TerminalUriLinkDetector, this._xterm, this._processInfo, this._linkResolver));
            if (enableFileLinks) {
                this._setupLinkDetector(terminalMultiLineLinkDetector_1.TerminalMultiLineLinkDetector.id, this._instantiationService.createInstance(terminalMultiLineLinkDetector_1.TerminalMultiLineLinkDetector, this._xterm, this._processInfo, this._linkResolver));
                this._setupLinkDetector(terminalLocalLinkDetector_1.TerminalLocalLinkDetector.id, this._instantiationService.createInstance(terminalLocalLinkDetector_1.TerminalLocalLinkDetector, this._xterm, capabilities, this._processInfo, this._linkResolver));
            }
            this._setupLinkDetector(terminalWordLinkDetector_1.TerminalWordLinkDetector.id, this.add(this._instantiationService.createInstance(terminalWordLinkDetector_1.TerminalWordLinkDetector, this._xterm)));
            // Setup link openers
            const localFileOpener = this._instantiationService.createInstance(terminalLinkOpeners_1.TerminalLocalFileLinkOpener);
            const localFolderInWorkspaceOpener = this._instantiationService.createInstance(terminalLinkOpeners_1.TerminalLocalFolderInWorkspaceLinkOpener);
            this._openers.set("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, localFileOpener);
            this._openers.set("LocalFolderInWorkspace" /* TerminalBuiltinLinkType.LocalFolderInWorkspace */, localFolderInWorkspaceOpener);
            this._openers.set("LocalFolderOutsideWorkspace" /* TerminalBuiltinLinkType.LocalFolderOutsideWorkspace */, this._instantiationService.createInstance(terminalLinkOpeners_1.TerminalLocalFolderOutsideWorkspaceLinkOpener));
            this._openers.set("Search" /* TerminalBuiltinLinkType.Search */, this._instantiationService.createInstance(terminalLinkOpeners_1.TerminalSearchLinkOpener, capabilities, this._processInfo.initialCwd, localFileOpener, localFolderInWorkspaceOpener, () => this._processInfo.os || platform_1.OS));
            this._openers.set("Url" /* TerminalBuiltinLinkType.Url */, this._instantiationService.createInstance(terminalLinkOpeners_1.TerminalUrlLinkOpener, !!this._processInfo.remoteAuthority));
            this._registerStandardLinkProviders();
            let activeHoverDisposable;
            let activeTooltipScheduler;
            this.add((0, lifecycle_1.toDisposable)(() => {
                activeHoverDisposable?.dispose();
                activeTooltipScheduler?.dispose();
            }));
            this._xterm.options.linkHandler = {
                activate: (_, text) => {
                    this._openers.get("Url" /* TerminalBuiltinLinkType.Url */)?.open({
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
                    activeTooltipScheduler = new async_1.RunOnceScheduler(() => {
                        const core = this._xterm._core;
                        const cellDimensions = {
                            width: core._renderService.dimensions.css.cell.width,
                            height: core._renderService.dimensions.css.cell.height
                        };
                        const terminalDimensions = {
                            width: this._xterm.cols,
                            height: this._xterm.rows
                        };
                        activeHoverDisposable = this._showHover({
                            viewportRange: (0, terminalLinkHelpers_1.convertBufferRangeToViewport)(range, this._xterm.buffer.active.viewportY),
                            cellDimensions,
                            terminalDimensions
                        }, this._getLinkHoverString(text, text), undefined, (text) => this._xterm.options.linkHandler?.activate(e, text, range));
                        // Clear out scheduler until next hover event
                        activeTooltipScheduler?.dispose();
                        activeTooltipScheduler = undefined;
                    }, this._configurationService.getValue('workbench.hover.delay'));
                    activeTooltipScheduler.schedule();
                }
            };
        }
        _setupLinkDetector(id, detector, isExternal = false) {
            const detectorAdapter = this.add(this._instantiationService.createInstance(terminalLinkDetectorAdapter_1.TerminalLinkDetectorAdapter, detector));
            this.add(detectorAdapter.onDidActivateLink(e => {
                // Prevent default electron link handling so Alt+Click mode works normally
                e.event?.preventDefault();
                // Require correct modifier on click unless event is coming from linkQuickPick selection
                if (e.event && !(e.event instanceof terminal_1.TerminalLinkQuickPickEvent) && !this._isLinkActivationModifierDown(e.event)) {
                    return;
                }
                // Just call the handler if there is no before listener
                if (e.link.activate) {
                    // Custom activate call (external links only)
                    e.link.activate(e.link.text);
                }
                else {
                    this._openLink(e.link);
                }
            }));
            this.add(detectorAdapter.onDidShowHover(e => this._tooltipCallback(e.link, e.viewportRange, e.modifierDownCallback, e.modifierUpCallback)));
            if (!isExternal) {
                this._standardLinkProviders.set(id, detectorAdapter);
            }
            return detectorAdapter;
        }
        async _openLink(link) {
            this._logService.debug('Opening link', link);
            const opener = this._openers.get(link.type);
            if (!opener) {
                throw new Error(`No matching opener for link type "${link.type}"`);
            }
            await opener.open(link);
        }
        async openRecentLink(type) {
            let links;
            let i = this._xterm.buffer.active.length;
            while ((!links || links.length === 0) && i >= this._xterm.buffer.active.viewportY) {
                links = await this._getLinksForType(i, type);
                i--;
            }
            if (!links || links.length < 1) {
                return undefined;
            }
            const event = new terminal_1.TerminalLinkQuickPickEvent(dom_1.EventType.CLICK);
            links[0].activate(event, links[0].text);
            return links[0];
        }
        async getLinks() {
            // Fetch and await the viewport results
            const viewportLinksByLinePromises = [];
            for (let i = this._xterm.buffer.active.viewportY + this._xterm.rows - 1; i >= this._xterm.buffer.active.viewportY; i--) {
                viewportLinksByLinePromises.push(this._getLinksForLine(i));
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
            for (let i = this._xterm.buffer.active.viewportY - 1; i >= 0; i--) {
                aboveViewportLinksPromises.push(this._getLinksForLine(i));
            }
            const belowViewportLinksPromises = [];
            for (let i = this._xterm.buffer.active.length - 1; i >= this._xterm.buffer.active.viewportY + this._xterm.rows; i--) {
                belowViewportLinksPromises.push(this._getLinksForLine(i));
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
        async _getLinksForLine(y) {
            const unfilteredWordLinks = await this._getLinksForType(y, 'word');
            const webLinks = await this._getLinksForType(y, 'url');
            const fileLinks = await this._getLinksForType(y, 'localFile');
            const folderLinks = await this._getLinksForType(y, 'localFolder');
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
        async _getLinksForType(y, type) {
            switch (type) {
                case 'word':
                    return (await new Promise(r => this._standardLinkProviders.get(terminalWordLinkDetector_1.TerminalWordLinkDetector.id)?.provideLinks(y, r)));
                case 'url':
                    return (await new Promise(r => this._standardLinkProviders.get(terminalUriLinkDetector_1.TerminalUriLinkDetector.id)?.provideLinks(y, r)));
                case 'localFile': {
                    const links = (await new Promise(r => this._standardLinkProviders.get(terminalLocalLinkDetector_1.TerminalLocalLinkDetector.id)?.provideLinks(y, r)));
                    return links?.filter(link => link.type === "LocalFile" /* TerminalBuiltinLinkType.LocalFile */);
                }
                case 'localFolder': {
                    const links = (await new Promise(r => this._standardLinkProviders.get(terminalLocalLinkDetector_1.TerminalLocalLinkDetector.id)?.provideLinks(y, r)));
                    return links?.filter(link => link.type === "LocalFolderInWorkspace" /* TerminalBuiltinLinkType.LocalFolderInWorkspace */);
                }
            }
        }
        _tooltipCallback(link, viewportRange, modifierDownCallback, modifierUpCallback) {
            if (!this._widgetManager) {
                return;
            }
            const core = this._xterm._core;
            const cellDimensions = {
                width: core._renderService.dimensions.css.cell.width,
                height: core._renderService.dimensions.css.cell.height
            };
            const terminalDimensions = {
                width: this._xterm.cols,
                height: this._xterm.rows
            };
            // Don't pass the mouse event as this avoids the modifier check
            this._showHover({
                viewportRange,
                cellDimensions,
                terminalDimensions,
                modifierDownCallback,
                modifierUpCallback
            }, this._getLinkHoverString(link.text, link.label), link.actions, (text) => link.activate(undefined, text), link);
        }
        _showHover(targetOptions, text, actions, linkHandler, link) {
            if (this._widgetManager) {
                const widget = this._instantiationService.createInstance(terminalHoverWidget_1.TerminalHover, targetOptions, text, actions, linkHandler);
                const attached = this._widgetManager.attachWidget(widget);
                if (attached) {
                    link?.onInvalidated(() => attached.dispose());
                }
                return attached;
            }
            return undefined;
        }
        setWidgetManager(widgetManager) {
            this._widgetManager = widgetManager;
        }
        _clearLinkProviders() {
            (0, lifecycle_1.dispose)(this._linkProvidersDisposables);
            this._linkProvidersDisposables.length = 0;
        }
        _registerStandardLinkProviders() {
            for (const p of this._standardLinkProviders.values()) {
                this._linkProvidersDisposables.push(this._xterm.registerLinkProvider(p));
            }
        }
        registerExternalLinkProvider(provideLinks) {
            // Clear and re-register the standard link providers so they are a lower priority than the new one
            this._clearLinkProviders();
            const detectorId = `extension-${this._externalLinkProviders.length}`;
            const wrappedLinkProvider = this._setupLinkDetector(detectorId, new terminalExternalLinkDetector_1.TerminalExternalLinkDetector(detectorId, this._xterm, provideLinks), true);
            const newLinkProvider = this._xterm.registerLinkProvider(wrappedLinkProvider);
            this._externalLinkProviders.push(newLinkProvider);
            this._registerStandardLinkProviders();
            return newLinkProvider;
        }
        _isLinkActivationModifierDown(event) {
            const editorConf = this._configurationService.getValue('editor');
            if (editorConf.multiCursorModifier === 'ctrlCmd') {
                return !!event.altKey;
            }
            return platform_1.isMacintosh ? event.metaKey : event.ctrlKey;
        }
        _getLinkHoverString(uri, label) {
            const editorConf = this._configurationService.getValue('editor');
            let clickLabel = '';
            if (editorConf.multiCursorModifier === 'ctrlCmd') {
                if (platform_1.isMacintosh) {
                    clickLabel = nls.localize('terminalLinkHandler.followLinkAlt.mac', "option + click");
                }
                else {
                    clickLabel = nls.localize('terminalLinkHandler.followLinkAlt', "alt + click");
                }
            }
            else {
                if (platform_1.isMacintosh) {
                    clickLabel = nls.localize('terminalLinkHandler.followLinkCmd', "cmd + click");
                }
                else {
                    clickLabel = nls.localize('terminalLinkHandler.followLinkCtrl', "ctrl + click");
                }
            }
            let fallbackLabel = nls.localize('followLink', "Follow link");
            try {
                if (this._tunnelService.canTunnel(uri_1.URI.parse(uri))) {
                    fallbackLabel = nls.localize('followForwardedLink', "Follow link using forwarded port");
                }
            }
            catch {
                // No-op, already set to fallback
            }
            const markdown = new htmlContent_1.MarkdownString('', true);
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
                uri = nls.localize('followLinkUrl', 'Link');
            }
            return markdown.appendLink(uri, label).appendMarkdown(` (${clickLabel})`);
        }
    };
    exports.TerminalLinkManager = TerminalLinkManager;
    exports.TerminalLinkManager = TerminalLinkManager = __decorate([
        __param(4, configuration_1.IConfigurationService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, terminal_3.ITerminalLogService),
        __param(7, tunnel_1.ITunnelService)
    ], TerminalLinkManager);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxMaW5rTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsQ29udHJpYi9saW5rcy9icm93c2VyL3Rlcm1pbmFsTGlua01hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBa0NoRzs7T0FFRztJQUNJLElBQU0sbUJBQW1CLEdBQXpCLE1BQU0sbUJBQW9CLFNBQVEsMkJBQWU7UUFPdkQsWUFDa0IsTUFBZ0IsRUFDaEIsWUFBa0MsRUFDbkQsWUFBc0MsRUFDckIsYUFBb0MsRUFDOUIscUJBQTZELEVBQzdELHFCQUE2RCxFQUMvRCxXQUFpRCxFQUN0RCxjQUErQztZQUUvRCxLQUFLLEVBQUUsQ0FBQztZQVRTLFdBQU0sR0FBTixNQUFNLENBQVU7WUFDaEIsaUJBQVksR0FBWixZQUFZLENBQXNCO1lBRWxDLGtCQUFhLEdBQWIsYUFBYSxDQUF1QjtZQUNiLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDNUMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUM5QyxnQkFBVyxHQUFYLFdBQVcsQ0FBcUI7WUFDckMsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBYi9DLDJCQUFzQixHQUErQixJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQy9ELDhCQUF5QixHQUFrQixFQUFFLENBQUM7WUFDOUMsMkJBQXNCLEdBQWtCLEVBQUUsQ0FBQztZQUMzQyxhQUFRLEdBQStDLElBQUksR0FBRyxFQUFFLENBQUM7WUFjakYsSUFBSSxlQUFlLEdBQVksSUFBSSxDQUFDO1lBQ3BDLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBeUIsa0NBQXVCLENBQUMsQ0FBQyxlQUFzRSxDQUFDO1lBQzFMLFFBQVEscUJBQXFCLEVBQUU7Z0JBQzlCLEtBQUssS0FB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