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
define(["require", "exports", "vs/base/common/path", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/mime", "vs/base/common/network", "vs/base/common/objects", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uri", "vs/base/common/uuid", "vs/editor/common/languages", "vs/editor/common/languages/language", "vs/editor/common/languages/supports/tokenization", "vs/editor/common/languages/textToHtmlTokenizer", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/dialogs/common/dialogs", "vs/platform/files/common/files", "vs/platform/opener/common/opener", "vs/platform/storage/common/storage", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/platform/workspace/common/workspace", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/view/notebookCellList", "vs/workbench/contrib/notebook/browser/view/renderers/webviewPreloads", "vs/workbench/contrib/notebook/browser/view/renderers/webviewThemeMapping", "vs/workbench/contrib/notebook/browser/viewModel/markupCellViewModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/contrib/webview/browser/webview", "vs/workbench/contrib/webview/browser/webviewWindowDragMonitor", "vs/workbench/contrib/webview/common/webview", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/path/common/pathService", "vs/workbench/contrib/notebook/common/notebookLoggingService", "vs/platform/telemetry/common/telemetry"], function (require, exports, osPath, arrays_1, async_1, buffer_1, event_1, mime_1, network_1, objects_1, platform_1, resources_1, uri_1, UUID, languages_1, language_1, tokenization_1, textToHtmlTokenizer_1, nls, actions_1, configuration_1, contextkey_1, contextView_1, dialogs_1, files_1, opener_1, storage_1, colorRegistry_1, themeService_1, workspace_1, workspaceTrust_1, notebookBrowser_1, notebookCellList_1, webviewPreloads_1, webviewThemeMapping_1, markupCellViewModel_1, notebookCommon_1, notebookService_1, webview_1, webviewWindowDragMonitor_1, webview_2, editorGroupsService_1, environmentService_1, pathService_1, notebookLoggingService_1, telemetry_1) {
    "use strict";
    var BackLayerWebView_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BackLayerWebView = void 0;
    const LINE_COLUMN_REGEX = /:([\d]+)(?::([\d]+))?$/;
    const LineQueryRegex = /line=(\d+)$/;
    let BackLayerWebView = class BackLayerWebView extends themeService_1.Themable {
        static { BackLayerWebView_1 = this; }
        static getOriginStore(storageService) {
            this._originStore ??= new webview_1.WebviewOriginStore('notebook.backlayerWebview.origins', storageService);
            return this._originStore;
        }
        constructor(notebookEditor, id, notebookViewType, documentUri, options, rendererMessaging, webviewService, openerService, notebookService, contextService, environmentService, fileDialogService, fileService, contextMenuService, contextKeyService, workspaceTrustManagementService, configurationService, languageService, workspaceContextService, editorGroupService, storageService, pathService, notebookLogService, themeService, telemetryService) {
            super(themeService);
            this.notebookEditor = notebookEditor;
            this.id = id;
            this.notebookViewType = notebookViewType;
            this.documentUri = documentUri;
            this.options = options;
            this.rendererMessaging = rendererMessaging;
            this.webviewService = webviewService;
            this.openerService = openerService;
            this.notebookService = notebookService;
            this.contextService = contextService;
            this.environmentService = environmentService;
            this.fileDialogService = fileDialogService;
            this.fileService = fileService;
            this.contextMenuService = contextMenuService;
            this.contextKeyService = contextKeyService;
            this.workspaceTrustManagementService = workspaceTrustManagementService;
            this.configurationService = configurationService;
            this.languageService = languageService;
            this.workspaceContextService = workspaceContextService;
            this.editorGroupService = editorGroupService;
            this.storageService = storageService;
            this.pathService = pathService;
            this.notebookLogService = notebookLogService;
            this.telemetryService = telemetryService;
            this.webview = undefined;
            this.insetMapping = new Map();
            this.pendingWebviewIdleCreationRequest = new Map();
            this.pendingWebviewIdleInsetMapping = new Map();
            this.reversedPendingWebviewIdleInsetMapping = new Map();
            this.markupPreviewMapping = new Map();
            this.hiddenInsetMapping = new Set();
            this.reversedInsetMapping = new Map();
            this.localResourceRootsCache = undefined;
            this._onMessage = this._register(new event_1.Emitter());
            this._preloadsCache = new Set();
            this.onMessage = this._onMessage.event;
            this._disposed = false;
            this.firstInit = true;
            this.nonce = UUID.generateUuid();
            this._logRendererDebugMessage('Creating backlayer webview for notebook');
            this.element = document.createElement('div');
            this.element.style.height = '1400px';
            this.element.style.position = 'absolute';
            if (rendererMessaging) {
                this._register(rendererMessaging);
                rendererMessaging.receiveMessageHandler = (rendererId, message) => {
                    if (!this.webview || this._disposed) {
                        return Promise.resolve(false);
                    }
                    this._sendMessageToWebview({
                        __vscode_notebook_message: true,
                        type: 'customRendererMessage',
                        rendererId: rendererId,
                        message: message
                    });
                    return Promise.resolve(true);
                };
            }
            this._register(workspaceTrustManagementService.onDidChangeTrust(e => {
                const baseUrl = this.asWebviewUri(this.getNotebookBaseUri(), undefined);
                const htmlContent = this.generateContent(baseUrl.toString());
                this.webview?.setHtml(htmlContent);
            }));
            this._register(languages_1.TokenizationRegistry.onDidChange(() => {
                this._sendMessageToWebview({
                    type: 'tokenizedStylesChanged',
                    css: getTokenizationCss(),
                });
            }));
        }
        updateOptions(options) {
            this.options = options;
            this._updateStyles();
            this._updateOptions();
        }
        _logRendererDebugMessage(msg) {
            this.notebookLogService.debug('BacklayerWebview', `${this.documentUri} (${this.id}) - ${msg}`);
        }
        _updateStyles() {
            this._sendMessageToWebview({
                type: 'notebookStyles',
                styles: this._generateStyles()
            });
        }
        _updateOptions() {
            this._sendMessageToWebview({
                type: 'notebookOptions',
                options: {
                    dragAndDropEnabled: this.options.dragAndDropEnabled
                },
                renderOptions: {
                    lineLimit: this.options.outputLineLimit,
                    outputScrolling: this.options.outputScrolling,
                    outputWordWrap: this.options.outputWordWrap
                }
            });
        }
        _generateStyles() {
            return {
                'notebook-output-left-margin': `${this.options.leftMargin + this.options.runGutter}px`,
                'notebook-output-width': `calc(100% - ${this.options.leftMargin + this.options.rightMargin + this.options.runGutter}px)`,
                'notebook-output-node-padding': `${this.options.outputNodePadding}px`,
                'notebook-run-gutter': `${this.options.runGutter}px`,
                'notebook-preview-node-padding': `${this.options.previewNodePadding}px`,
                'notebook-markdown-left-margin': `${this.options.markdownLeftMargin}px`,
                'notebook-output-node-left-padding': `${this.options.outputNodeLeftPadding}px`,
                'notebook-markdown-min-height': `${this.options.previewNodePadding * 2}px`,
                'notebook-markup-font-size': typeof this.options.markupFontSize === 'number' && this.options.markupFontSize > 0 ? `${this.options.markupFontSize}px` : `calc(${this.options.fontSize}px * 1.2)`,
                'notebook-cell-output-font-size': `${this.options.outputFontSize || this.options.fontSize}px`,
                'notebook-cell-output-line-height': `${this.options.outputLineHeight}px`,
                'notebook-cell-output-max-height': `${this.options.outputLineHeight * this.options.outputLineLimit}px`,
                'notebook-cell-output-font-family': this.options.outputFontFamily || this.options.fontFamily,
                'notebook-cell-markup-empty-content': nls.localize('notebook.emptyMarkdownPlaceholder', "Empty markdown cell, double-click or press enter to edit."),
                'notebook-cell-renderer-not-found-error': nls.localize({
                    key: 'notebook.error.rendererNotFound',
                    comment: ['$0 is a placeholder for the mime type']
                }, "No renderer found for '$0'"),
                'notebook-cell-renderer-fallbacks-exhausted': nls.localize({
                    key: 'notebook.error.rendererFallbacksExhausted',
                    comment: ['$0 is a placeholder for the mime type']
                }, "Could not render content for '$0'"),
            };
        }
        generateContent(baseUrl) {
            const renderersData = this.getRendererData();
            const preloadsData = this.getStaticPreloadsData();
            const renderOptions = {
                lineLimit: this.options.outputLineLimit,
                outputScrolling: this.options.outputScrolling,
                outputWordWrap: this.options.outputWordWrap
            };
            const preloadScript = (0, webviewPreloads_1.preloadsScriptStr)({
                ...this.options,
                tokenizationCss: getTokenizationCss(),
            }, { dragAndDropEnabled: this.options.dragAndDropEnabled }, renderOptions, renderersData, preloadsData, this.workspaceTrustManagementService.isWorkspaceTrusted(), this.nonce);
            const enableCsp = this.configurationService.getValue('notebook.experimental.enableCsp');
            const currentHighlight = this.getColor(colorRegistry_1.editorFindMatch);
            const findMatchHighlight = this.getColor(colorRegistry_1.editorFindMatchHighlight);
            return /* html */ `
		<html lang="en">
			<head>
				<meta charset="UTF-8">
				<base href="${baseUrl}/" />
				${enableCsp ?
                `<meta http-equiv="Content-Security-Policy" content="
					default-src 'none';
					script-src ${webview_2.webviewGenericCspSource} 'unsafe-inline' 'unsafe-eval';
					style-src ${webview_2.webviewGenericCspSource} 'unsafe-inline';
					img-src ${webview_2.webviewGenericCspSource} https: http: data:;
					font-src ${webview_2.webviewGenericCspSource} https:;
					connect-src https:;
					child-src https: data:;
				">` : ''}
				<style nonce="${this.nonce}">
					::highlight(find-highlight) {
						background-color: var(--vscode-editor-findMatchBackground, ${findMatchHighlight});
					}

					::highlight(current-find-highlight) {
						background-color: var(--vscode-editor-findMatchHighlightBackground, ${currentHighlight});
					}

					#container .cell_container {
						width: 100%;
					}

					#container .output_container {
						width: 100%;
					}

					#container > div > div > div.output {
						font-size: var(--notebook-cell-output-font-size);
						width: var(--notebook-output-width);
						margin-left: var(--notebook-output-left-margin);
						background-color: var(--theme-notebook-output-background);
						padding-top: var(--notebook-output-node-padding);
						padding-right: var(--notebook-output-node-padding);
						padding-bottom: var(--notebook-output-node-padding);
						padding-left: var(--notebook-output-node-left-padding);
						box-sizing: border-box;
						border-top: none;
					}

					/* markdown */
					#container div.preview {
						width: 100%;
						padding-right: var(--notebook-preview-node-padding);
						padding-left: var(--notebook-markdown-left-margin);
						padding-top: var(--notebook-preview-node-padding);
						padding-bottom: var(--notebook-preview-node-padding);

						box-sizing: border-box;
						white-space: nowrap;
						overflow: hidden;
						white-space: initial;

						font-size: var(--notebook-markup-font-size);
						color: var(--theme-ui-foreground);
					}

					#container div.preview.draggable {
						user-select: none;
						-webkit-user-select: none;
						-ms-user-select: none;
						cursor: grab;
					}

					#container div.preview.selected {
						background: var(--theme-notebook-cell-selected-background);
					}

					#container div.preview.dragging {
						background-color: var(--theme-background);
						opacity: 0.5 !important;
					}

					.monaco-workbench.vs-dark .notebookOverlay .cell.markdown .latex img,
					.monaco-workbench.vs-dark .notebookOverlay .cell.markdown .latex-block img {
						filter: brightness(0) invert(1)
					}

					#container .markup > div.nb-symbolHighlight {
						background-color: var(--theme-notebook-symbol-highlight-background);
					}

					#container > div.nb-cellDeleted .output_container {
						background-color: var(--theme-notebook-diff-removed-background);
					}

					#container > div.nb-cellAdded .output_container {
						background-color: var(--theme-notebook-diff-inserted-background);
					}

					#container > div > div:not(.preview) > div {
						overflow-x: auto;
					}

					#container .no-renderer-error {
						color: var(--vscode-editorError-foreground);
					}

					body {
						padding: 0px;
						height: 100%;
						width: 100%;
					}

					table, thead, tr, th, td, tbody {
						border: none !important;
						border-color: transparent;
						border-spacing: 0;
						border-collapse: collapse;
					}

					table, th, tr {
						vertical-align: middle;
						text-align: right;
					}

					thead {
						font-weight: bold;
						background-color: rgba(130, 130, 130, 0.16);
					}

					th, td {
						padding: 4px 8px;
					}

					tr:nth-child(even) {
						background-color: rgba(130, 130, 130, 0.08);
					}

					tbody th {
						font-weight: normal;
					}

					.find-match {
						background-color: var(--vscode-editor-findMatchHighlightBackground);
					}

					.current-find-match {
						background-color: var(--vscode-editor-findMatchBackground);
					}

					#_defaultColorPalatte {
						color: var(--vscode-editor-findMatchHighlightBackground);
						background-color: var(--vscode-editor-findMatchBackground);
					}
				</style>
			</head>
			<body style="overflow: hidden;">
				<div id='findStart' tabIndex=-1></div>
				<div id='container' class="widgetarea" style="position: absolute;width:100%;top: 0px"></div>
				<div id="_defaultColorPalatte"></div>
				<script type="module">${preloadScript}</script>
			</body>
		</html>`;
        }
        getRendererData() {
            return this.notebookService.getRenderers().map((renderer) => {
                const entrypoint = {
                    extends: renderer.entrypoint.extends,
                    path: this.asWebviewUri(renderer.entrypoint.path, renderer.extensionLocation).toString()
                };
                return {
                    id: renderer.id,
                    entrypoint,
                    mimeTypes: renderer.mimeTypes,
                    messaging: renderer.messaging !== "never" /* RendererMessagingSpec.Never */,
                    isBuiltin: renderer.isBuiltin
                };
            });
        }
        getStaticPreloadsData() {
            return Array.from(this.notebookService.getStaticPreloads(this.notebookViewType), preload => {
                return { entrypoint: this.asWebviewUri(preload.entrypoint, preload.extensionLocation).toString().toString() };
            });
        }
        asWebviewUri(uri, fromExtension) {
            return (0, webview_2.asWebviewUri)(uri, fromExtension?.scheme === network_1.Schemas.vscodeRemote ? { isRemote: true, authority: fromExtension.authority } : undefined);
        }
        postKernelMessage(message) {
            this._sendMessageToWebview({
                __vscode_notebook_message: true,
                type: 'customKernelMessage',
                message,
            });
        }
        resolveOutputId(id) {
            const output = this.reversedInsetMapping.get(id);
            if (!output) {
                return;
            }
            const cellInfo = this.insetMapping.get(output).cellInfo;
            return { cellInfo, output };
        }
        isResolved() {
            return !!this.webview;
        }
        createWebview() {
            const baseUrl = this.asWebviewUri(this.getNotebookBaseUri(), undefined);
            const htmlContent = this.generateContent(baseUrl.toString());
            return this._initialize(htmlContent);
        }
        getNotebookBaseUri() {
            if (this.documentUri.scheme === network_1.Schemas.untitled) {
                const folder = this.workspaceContextService.getWorkspaceFolder(this.documentUri);
                if (folder) {
                    return folder.uri;
                }
                const folders = this.workspaceContextService.getWorkspace().folders;
                if (folders.length) {
                    return folders[0].uri;
                }
            }
            return (0, resources_1.dirname)(this.documentUri);
        }
        getBuiltinLocalResourceRoots() {
            // Python notebooks assume that requirejs is a global.
            // For all other notebooks, they need to provide their own loader.
            if (!this.documentUri.path.toLowerCase().endsWith('.ipynb')) {
                return [];
            }
            if (platform_1.isWeb) {
                return []; // script is inlined
            }
            return [
                (0, resources_1.dirname)(network_1.FileAccess.asFileUri('vs/loader.js')),
            ];
        }
        _initialize(content) {
            if (!document.body.contains(this.element)) {
                throw new Error('Element is already detached from the DOM tree');
            }
            this.webview = this._createInset(this.webviewService, content);
            this.webview.mountTo(this.element);
            this._register(this.webview);
            this._register(new webviewWindowDragMonitor_1.WebviewWindowDragMonitor(() => this.webview));
            const initializePromise = new async_1.DeferredPromise();
            this._register(this.webview.onFatalError(e => {
                initializePromise.error(new Error(`Could not initialize webview: ${e.message}}`));
            }));
            this._register(this.webview.onMessage(async (message) => {
                const data = message.message;
                if (this._disposed) {
                    return;
                }
                if (!data.__vscode_notebook_message) {
                    return;
                }
                switch (data.type) {
                    case 'initialized': {
                        initializePromise.complete();
                        this.initializeWebViewState();
                        break;
                    }
                    case 'initializedMarkup': {
                        if (this.initializeMarkupPromise?.requestId === data.requestId) {
                            this.initializeMarkupPromise?.p.complete();
                            this.initializeMarkupPromise = undefined;
                        }
                        break;
                    }
                    case 'dimension': {
                        for (const update of data.updates) {
                            const height = update.height;
                            if (update.isOutput) {
                                const resolvedResult = this.resolveOutputId(update.id);
                                if (resolvedResult) {
                                    const { cellInfo, output } = resolvedResult;
                                    this.notebookEditor.updateOutputHeight(cellInfo, output, height, !!update.init, 'webview#dimension');
                                    this.notebookEditor.scheduleOutputHeightAck(cellInfo, update.id, height);
                                }
                                else if (update.init) {
                                    // might be idle render request's ack
                                    const outputRequest = this.reversedPendingWebviewIdleInsetMapping.get(update.id);
                                    if (outputRequest) {
                                        const inset = this.pendingWebviewIdleInsetMapping.get(outputRequest);
                                        // clear the pending mapping
                                        this.pendingWebviewIdleCreationRequest.delete(outputRequest);
                                        this.pendingWebviewIdleCreationRequest.delete(outputRequest);
                                        const cellInfo = inset.cellInfo;
                                        this.reversedInsetMapping.set(update.id, outputRequest);
                                        this.insetMapping.set(outputRequest, inset);
                                        this.notebookEditor.updateOutputHeight(cellInfo, outputRequest, height, !!update.init, 'webview#dimension');
                                        this.notebookEditor.scheduleOutputHeightAck(cellInfo, update.id, height);
                                    }
                                    this.reversedPendingWebviewIdleInsetMapping.delete(update.id);
                                }
                                {
                                    if (!update.init) {
                                        continue;
                                    }
                                    const output = this.reversedInsetMapping.get(update.id);
                                    if (!output) {
                                        continue;
                                    }
                                    const inset = this.insetMapping.get(output);
                                    inset.initialized = true;
                                }
                            }
                            else {
                                this.notebookEditor.updateMarkupCellHeight(update.id, height, !!update.init);
                            }
                        }
                        break;
                    }
                    case 'mouseenter': {
                        const resolvedResult = this.resolveOutputId(data.id);
                        if (resolvedResult) {
                            const latestCell = this.notebookEditor.getCellByInfo(resolvedResult.cellInfo);
                            if (latestCell) {
                                latestCell.outputIsHovered = true;
                            }
                        }
                        break;
                    }
                    case 'mouseleave': {
                        const resolvedResult = this.resolveOutputId(data.id);
                        if (resolvedResult) {
                            const latestCell = this.notebookEditor.getCellByInfo(resolvedResult.cellInfo);
                            if (latestCell) {
                                latestCell.outputIsHovered = false;
                            }
                        }
                        break;
                    }
                    case 'outputFocus': {
                        const resolvedResult = this.resolveOutputId(data.id);
                        if (resolvedResult) {
                            const latestCell = this.notebookEditor.getCellByInfo(resolvedResult.cellInfo);
                            if (latestCell) {
                                latestCell.outputIsFocused = true;
                                this.notebookEditor.focusNotebookCell(latestCell, 'output', { skipReveal: true });
                            }
                        }
                        break;
                    }
                    case 'outputBlur': {
                        const resolvedResult = this.resolveOutputId(data.id);
                        if (resolvedResult) {
                            const latestCell = this.notebookEditor.getCellByInfo(resolvedResult.cellInfo);
                            if (latestCell) {
                                latestCell.outputIsFocused = false;
                            }
                        }
                        break;
                    }
                    case 'scroll-ack': {
                        // const date = new Date();
                        // const top = data.data.top;
                        // console.log('ack top ', top, ' version: ', data.version, ' - ', date.getMinutes() + ':' + date.getSeconds() + ':' + date.getMilliseconds());
                        break;
                    }
                    case 'scroll-to-reveal': {
                        this.notebookEditor.setScrollTop(data.scrollTop - notebookCellList_1.NOTEBOOK_WEBVIEW_BOUNDARY);
                        break;
                    }
                    case 'did-scroll-wheel': {
                        this.notebookEditor.triggerScroll({
                            ...data.payload,
                            preventDefault: () => { },
                            stopPropagation: () => { }
                        });
                        break;
                    }
                    case 'focus-editor': {
                        const cell = this.notebookEditor.getCellById(data.cellId);
                        if (cell) {
                            if (data.focusNext) {
                                this.notebookEditor.focusNextNotebookCell(cell, 'editor');
                            }
                            else {
                                await this.notebookEditor.focusNotebookCell(cell, 'editor');
                            }
                        }
                        break;
                    }
                    case 'clicked-data-url': {
                        this._onDidClickDataLink(data);
                        break;
                    }
                    case 'clicked-link': {
                        if ((0, opener_1.matchesScheme)(data.href, network_1.Schemas.command)) {
                            const uri = uri_1.URI.parse(data.href);
                            if (uri.path === 'workbench.action.openLargeOutput') {
                                const outputId = uri.query;
                                const group = this.editorGroupService.activeGroup;
                                if (group) {
                                    if (group.activeEditor) {
                                        group.pinEditor(group.activeEditor);
                                    }
                                }
                                this.openerService.open(notebookCommon_1.CellUri.generateCellOutputUri(this.documentUri, outputId));
                                return;
                            }
                            if (uri.path === 'cellOutput.enableScrolling') {
                                const outputId = uri.query;
                                const cell = this.reversedInsetMapping.get(outputId);
                                if (cell) {
                                    this.telemetryService.publicLog2('workbenchActionExecuted', { id: 'notebook.cell.toggleOutputScrolling', from: 'inlineLink' });
                                    cell.cellViewModel.outputsViewModels.forEach((vm) => {
                                        if (vm.model.metadata) {
                                            vm.model.metadata['scrollable'] = true;
                                            vm.resetRenderer();
                                        }
                                    });
                                }
                                return;
                            }
                            // We allow a very limited set of commands
                            this.openerService.open(data.href, {
                                fromUserGesture: true,
                                fromWorkspace: true,
                                allowCommands: [
                                    'github-issues.authNow',
                                    'workbench.extensions.search',
                                    'workbench.action.openSettings',
                                    '_notebook.selectKernel',
                                    // TODO@rebornix explore open output channel with name command
                                    'jupyter.viewOutput'
                                ],
                            });
                            return;
                        }
                        if ((0, opener_1.matchesSomeScheme)(data.href, network_1.Schemas.http, network_1.Schemas.https, network_1.Schemas.mailto)) {
                            this.openerService.open(data.href, { fromUserGesture: true, fromWorkspace: true });
                        }
                        else if ((0, opener_1.matchesScheme)(data.href, network_1.Schemas.vscodeNotebookCell)) {
                            const uri = uri_1.URI.parse(data.href);
                            this._handleNotebookCellResource(uri);
                        }
                        else if (!/^[\w\-]+:/.test(data.href)) {
                            // Uri without scheme, such as a file path
                            this._handleResourceOpening(tryDecodeURIComponent(data.href));
                        }
                        else {
                            // uri with scheme
                            if (osPath.isAbsolute(data.href)) {
                                this._openUri(uri_1.URI.file(data.href));
                            }
                            else {
                                this._openUri(uri_1.URI.parse(data.href));
                            }
                        }
                        break;
                    }
                    case 'customKernelMessage': {
                        this._onMessage.fire({ message: data.message });
                        break;
                    }
                    case 'customRendererMessage': {
                        this.rendererMessaging?.postMessage(data.rendererId, data.message);
                        break;
                    }
                    case 'clickMarkupCell': {
                        const cell = this.notebookEditor.getCellById(data.cellId);
                        if (cell) {
                            if (data.shiftKey || (platform_1.isMacintosh ? data.metaKey : data.ctrlKey)) {
                                // Modify selection
                                this.notebookEditor.toggleNotebookCellSelection(cell, /* fromPrevious */ data.shiftKey);
                            }
                            else {
                                // Normal click
                                await this.notebookEditor.focusNotebookCell(cell, 'container', { skipReveal: true });
                            }
                        }
                        break;
                    }
                    case 'contextMenuMarkupCell': {
                        const cell = this.notebookEditor.getCellById(data.cellId);
                        if (cell) {
                            // Focus the cell first
                            await this.notebookEditor.focusNotebookCell(cell, 'container', { skipReveal: true });
                            // Then show the context menu
                            const webviewRect = this.element.getBoundingClientRect();
                            this.contextMenuService.showContextMenu({
                                menuId: actions_1.MenuId.NotebookCellTitle,
                                contextKeyService: this.contextKeyService,
                                getAnchor: () => ({
                                    x: webviewRect.x + data.clientX,
                                    y: webviewRect.y + data.clientY
                                })
                            });
                        }
                        break;
                    }
                    case 'toggleMarkupPreview': {
                        const cell = this.notebookEditor.getCellById(data.cellId);
                        if (cell && !this.notebookEditor.creationOptions.isReadOnly) {
                            this.notebookEditor.setMarkupCellEditState(data.cellId, notebookBrowser_1.CellEditState.Editing);
                            await this.notebookEditor.focusNotebookCell(cell, 'editor', { skipReveal: true });
                        }
                        break;
                    }
                    case 'mouseEnterMarkupCell': {
                        const cell = this.notebookEditor.getCellById(data.cellId);
                        if (cell instanceof markupCellViewModel_1.MarkupCellViewModel) {
                            cell.cellIsHovered = true;
                        }
                        break;
                    }
                    case 'mouseLeaveMarkupCell': {
                        const cell = this.notebookEditor.getCellById(data.cellId);
                        if (cell instanceof markupCellViewModel_1.MarkupCellViewModel) {
                            cell.cellIsHovered = false;
                        }
                        break;
                    }
                    case 'cell-drag-start': {
                        this.notebookEditor.didStartDragMarkupCell(data.cellId, data);
                        break;
                    }
                    case 'cell-drag': {
                        this.notebookEditor.didDragMarkupCell(data.cellId, data);
                        break;
                    }
                    case 'cell-drop': {
                        this.notebookEditor.didDropMarkupCell(data.cellId, {
                            dragOffsetY: data.dragOffsetY,
                            ctrlKey: data.ctrlKey,
                            altKey: data.altKey,
                        });
                        break;
                    }
                    case 'cell-drag-end': {
                        this.notebookEditor.didEndDragMarkupCell(data.cellId);
                        break;
                    }
                    case 'renderedMarkup': {
                        const cell = this.notebookEditor.getCellById(data.cellId);
                        if (cell instanceof markupCellViewModel_1.MarkupCellViewModel) {
                            cell.renderedHtml = data.html;
                        }
                        this._handleHighlightCodeBlock(data.codeBlocks);
                        break;
                    }
                    case 'renderedCellOutput': {
                        this._handleHighlightCodeBlock(data.codeBlocks);
                        break;
                    }
                    case 'outputResized': {
                        this.notebookEditor.didResizeOutput(data.cellId);
                        break;
                    }
                    case 'getOutputItem': {
                        const resolvedResult = this.resolveOutputId(data.outputId);
                        const output = resolvedResult?.output.model.outputs.find(output => output.mime === data.mime);
                        this._sendMessageToWebview({
                            type: 'returnOutputItem',
                            requestId: data.requestId,
                            output: output ? { mime: output.mime, valueBytes: output.data.buffer } : undefined,
                        });
                        break;
                    }
                    case 'logRendererDebugMessage': {
                        this._logRendererDebugMessage(`${data.message}${data.data ? ' ' + JSON.stringify(data.data, null, 4) : ''}`);
                        break;
                    }
                    case 'notebookPerformanceMessage': {
                        this.notebookEditor.updatePerformanceMetadata(data.cellId, data.executionId, data.duration, data.rendererId);
                        break;
                    }
                    case 'outputInputFocus': {
                        this.notebookEditor.didFocusOutputInputChange(data.inputFocused);
                    }
                }
            }));
            return initializePromise.p;
        }
        _handleNotebookCellResource(uri) {
            const lineMatch = /\?line=(\d+)$/.exec(uri.fragment);
            if (lineMatch) {
                const parsedLineNumber = parseInt(lineMatch[1], 10);
                if (!isNaN(parsedLineNumber)) {
                    const lineNumber = parsedLineNumber + 1;
                    const fragment = uri.fragment.substring(0, lineMatch.index);
                    // open the uri with selection
                    const editorOptions = {
                        selection: { startLineNumber: lineNumber, startColumn: 1, endLineNumber: lineNumber, endColumn: 1 }
                    };
                    this.openerService.open(uri.with({ fragment }), {
                        fromUserGesture: true,
                        fromWorkspace: true,
                        editorOptions: editorOptions
                    });
                    return;
                }
            }
            this.openerService.open(uri, { fromUserGesture: true, fromWorkspace: true });
            return uri;
        }
        _handleResourceOpening(href) {
            let linkToOpen = undefined;
            if (href.startsWith('/')) {
                linkToOpen = uri_1.URI.parse(href);
            }
            else if (href.startsWith('~')) {
                const userHome = this.pathService.resolvedUserHome;
                if (userHome) {
                    linkToOpen = uri_1.URI.parse(osPath.join(userHome.fsPath, href.substring(1)));
                }
            }
            else {
                if (this.documentUri.scheme === network_1.Schemas.untitled) {
                    const folders = this.workspaceContextService.getWorkspace().folders;
                    if (!folders.length) {
                        return;
                    }
                    linkToOpen = uri_1.URI.joinPath(folders[0].uri, href);
                }
                else {
                    // Resolve relative to notebook document
                    linkToOpen = uri_1.URI.joinPath((0, resources_1.dirname)(this.documentUri), href);
                }
            }
            if (linkToOpen) {
                this._openUri(linkToOpen);
            }
        }
        _openUri(uri) {
            let lineNumber = undefined;
            let column = undefined;
            const lineCol = LINE_COLUMN_REGEX.exec(uri.path);
            if (lineCol) {
                uri = uri.with({
                    path: uri.path.slice(0, lineCol.index),
                    fragment: `L${lineCol[0].slice(1)}`
                });
                lineNumber = parseInt(lineCol[1], 10);
                column = parseInt(lineCol[2], 10);
            }
            //#region error renderer migration, remove once done
            const lineMatch = LineQueryRegex.exec(uri.query);
            if (lineMatch) {
                const parsedLineNumber = parseInt(lineMatch[1], 10);
                if (!isNaN(parsedLineNumber)) {
                    lineNumber = parsedLineNumber + 1;
                    column = 1;
                    uri = uri.with({ fragment: `L${lineNumber}` });
                }
            }
            uri = uri.with({
                query: null
            });
            //#endregion
            let match = undefined;
            for (const group of this.editorGroupService.groups) {
                const editorInput = group.editors.find(editor => editor.resource && (0, resources_1.isEqual)(editor.resource, uri, true));
                if (editorInput) {
                    match = { group, editor: editorInput };
                    break;
                }
            }
            if (match) {
                match.group.openEditor(match.editor, lineNumber !== undefined && column !== undefined ? { selection: { startLineNumber: lineNumber, startColumn: column } } : undefined);
            }
            else {
                this.openerService.open(uri, { fromUserGesture: true, fromWorkspace: true });
            }
        }
        _handleHighlightCodeBlock(codeBlocks) {
            for (const { id, value, lang } of codeBlocks) {
                // The language id may be a language aliases (e.g.js instead of javascript)
                const languageId = this.languageService.getLanguageIdByLanguageName(lang);
                if (!languageId) {
                    continue;
                }
                (0, textToHtmlTokenizer_1.tokenizeToString)(this.languageService, value, languageId).then((html) => {
                    if (this._disposed) {
                        return;
                    }
                    this._sendMessageToWebview({
                        type: 'tokenizedCodeBlock',
                        html,
                        codeBlockId: id
                    });
                });
            }
        }
        async _onDidClickDataLink(event) {
            if (typeof event.data !== 'string') {
                return;
            }
            const [splitStart, splitData] = event.data.split(';base64,');
            if (!splitData || !splitStart) {
                return;
            }
            const defaultDir = (0, resources_1.extname)(this.documentUri) === '.interactive' ?
                this.workspaceContextService.getWorkspace().folders[0]?.uri ?? await this.fileDialogService.defaultFilePath() :
                (0, resources_1.dirname)(this.documentUri);
            let defaultName;
            if (event.downloadName) {
                defaultName = event.downloadName;
            }
            else {
                const mimeType = splitStart.replace(/^data:/, '');
                const candidateExtension = mimeType && (0, mime_1.getExtensionForMimeType)(mimeType);
                defaultName = candidateExtension ? `download${candidateExtension}` : 'download';
            }
            const defaultUri = (0, resources_1.joinPath)(defaultDir, defaultName);
            const newFileUri = await this.fileDialogService.showSaveDialog({
                defaultUri
            });
            if (!newFileUri) {
                return;
            }
            const buff = (0, buffer_1.decodeBase64)(splitData);
            await this.fileService.writeFile(newFileUri, buff);
            await this.openerService.open(newFileUri);
        }
        _createInset(webviewService, content) {
            this.localResourceRootsCache = this._getResourceRootsCache();
            const webview = webviewService.createWebviewElement({
                origin: BackLayerWebView_1.getOriginStore(this.storageService).getOrigin(this.notebookViewType, undefined),
                title: nls.localize('webview title', "Notebook webview content"),
                options: {
                    purpose: "notebookRenderer" /* WebviewContentPurpose.NotebookRenderer */,
                    enableFindWidget: false,
                    transformCssVariables: webviewThemeMapping_1.transformWebviewThemeVars,
                },
                contentOptions: {
                    allowMultipleAPIAcquire: true,
                    allowScripts: true,
                    localResourceRoots: this.localResourceRootsCache,
                },
                extension: undefined,
                providedViewType: 'notebook.output'
            });
            webview.setHtml(content);
            webview.setContextKeyService(this.contextKeyService);
            return webview;
        }
        _getResourceRootsCache() {
            const workspaceFolders = this.contextService.getWorkspace().folders.map(x => x.uri);
            const notebookDir = this.getNotebookBaseUri();
            return [
                this.notebookService.getNotebookProviderResourceRoots(),
                this.notebookService.getRenderers().map(x => (0, resources_1.dirname)(x.entrypoint.path)),
                ...Array.from(this.notebookService.getStaticPreloads(this.notebookViewType), x => [
                    (0, resources_1.dirname)(x.entrypoint),
                    ...x.localResourceRoots,
                ]),
                workspaceFolders,
                notebookDir,
                this.getBuiltinLocalResourceRoots()
            ].flat();
        }
        initializeWebViewState() {
            this._preloadsCache.clear();
            if (this._currentKernel) {
                this._updatePreloadsFromKernel(this._currentKernel);
            }
            for (const [output, inset] of this.insetMapping.entries()) {
                this._sendMessageToWebview({ ...inset.cachedCreation, initiallyHidden: this.hiddenInsetMapping.has(output) });
            }
            if (this.initializeMarkupPromise?.isFirstInit) {
                // On first run the contents have already been initialized so we don't need to init them again
                // no op
            }
            else {
                const mdCells = [...this.markupPreviewMapping.values()];
                this.markupPreviewMapping.clear();
                this.initializeMarkup(mdCells);
            }
            this._updateStyles();
            this._updateOptions();
        }
        shouldUpdateInset(cell, output, cellTop, outputOffset) {
            if (this._disposed) {
                return false;
            }
            if ('isOutputCollapsed' in cell && cell.isOutputCollapsed) {
                return false;
            }
            if (this.hiddenInsetMapping.has(output)) {
                return true;
            }
            const outputCache = this.insetMapping.get(output);
            if (!outputCache) {
                return false;
            }
            if (outputOffset === outputCache.cachedCreation.outputOffset && cellTop === outputCache.cachedCreation.cellTop) {
                return false;
            }
            return true;
        }
        ackHeight(updates) {
            this._sendMessageToWebview({
                type: 'ack-dimension',
                updates
            });
        }
        updateScrollTops(outputRequests, markupPreviews) {
            if (this._disposed) {
                return;
            }
            const widgets = (0, arrays_1.coalesce)(outputRequests.map((request) => {
                const outputCache = this.insetMapping.get(request.output);
                if (!outputCache) {
                    return;
                }
                if (!request.forceDisplay && !this.shouldUpdateInset(request.cell, request.output, request.cellTop, request.outputOffset)) {
                    return;
                }
                const id = outputCache.outputId;
                outputCache.cachedCreation.cellTop = request.cellTop;
                outputCache.cachedCreation.outputOffset = request.outputOffset;
                this.hiddenInsetMapping.delete(request.output);
                return {
                    cellId: request.cell.id,
                    outputId: id,
                    cellTop: request.cellTop,
                    outputOffset: request.outputOffset,
                    forceDisplay: request.forceDisplay,
                };
            }));
            if (!widgets.length && !markupPreviews.length) {
                return;
            }
            this._sendMessageToWebview({
                type: 'view-scroll',
                widgets: widgets,
                markupCells: markupPreviews,
            });
        }
        async createMarkupPreview(initialization) {
            if (this._disposed) {
                return;
            }
            if (this.markupPreviewMapping.has(initialization.cellId)) {
                console.error('Trying to create markup preview that already exists');
                return;
            }
            this.markupPreviewMapping.set(initialization.cellId, initialization);
            this._sendMessageToWebview({
                type: 'createMarkupCell',
                cell: initialization
            });
        }
        async showMarkupPreview(newContent) {
            if (this._disposed) {
                return;
            }
            const entry = this.markupPreviewMapping.get(newContent.cellId);
            if (!entry) {
                return this.createMarkupPreview(newContent);
            }
            const sameContent = newContent.content === entry.content;
            const sameMetadata = ((0, objects_1.equals)(newContent.metadata, entry.metadata));
            if (!sameContent || !sameMetadata || !entry.visible) {
                this._sendMessageToWebview({
                    type: 'showMarkupCell',
                    id: newContent.cellId,
                    handle: newContent.cellHandle,
                    // If the content has not changed, we still want to make sure the
                    // preview is visible but don't need to send anything over
                    content: sameContent ? undefined : newContent.content,
                    top: newContent.offset,
                    metadata: sameMetadata ? undefined : newContent.metadata
                });
            }
            entry.metadata = newContent.metadata;
            entry.content = newContent.content;
            entry.offset = newContent.offset;
            entry.visible = true;
        }
        async hideMarkupPreviews(cellIds) {
            if (this._disposed) {
                return;
            }
            const cellsToHide = [];
            for (const cellId of cellIds) {
                const entry = this.markupPreviewMapping.get(cellId);
                if (entry) {
                    if (entry.visible) {
                        cellsToHide.push(cellId);
                        entry.visible = false;
                    }
                }
            }
            if (cellsToHide.length) {
                this._sendMessageToWebview({
                    type: 'hideMarkupCells',
                    ids: cellsToHide
                });
            }
        }
        async unhideMarkupPreviews(cellIds) {
            if (this._disposed) {
                return;
            }
            const toUnhide = [];
            for (const cellId of cellIds) {
                const entry = this.markupPreviewMapping.get(cellId);
                if (entry) {
                    if (!entry.visible) {
                        entry.visible = true;
                        toUnhide.push(cellId);
                    }
                }
                else {
                    console.error(`Trying to unhide a preview that does not exist: ${cellId}`);
                }
            }
            this._sendMessageToWebview({
                type: 'unhideMarkupCells',
                ids: toUnhide,
            });
        }
        async deleteMarkupPreviews(cellIds) {
            if (this._disposed) {
                return;
            }
            for (const id of cellIds) {
                if (!this.markupPreviewMapping.has(id)) {
                    console.error(`Trying to delete a preview that does not exist: ${id}`);
                }
                this.markupPreviewMapping.delete(id);
            }
            if (cellIds.length) {
                this._sendMessageToWebview({
                    type: 'deleteMarkupCell',
                    ids: cellIds
                });
            }
        }
        async updateMarkupPreviewSelections(selectedCellsIds) {
            if (this._disposed) {
                return;
            }
            this._sendMessageToWebview({
                type: 'updateSelectedMarkupCells',
                selectedCellIds: selectedCellsIds.filter(id => this.markupPreviewMapping.has(id)),
            });
        }
        async initializeMarkup(cells) {
            if (this._disposed) {
                return;
            }
            this.initializeMarkupPromise?.p.complete();
            const requestId = UUID.generateUuid();
            this.initializeMarkupPromise = { p: new async_1.DeferredPromise(), requestId, isFirstInit: this.firstInit };
            this.firstInit = false;
            for (const cell of cells) {
                this.markupPreviewMapping.set(cell.cellId, cell);
            }
            this._sendMessageToWebview({
                type: 'initializeMarkup',
                cells,
                requestId,
            });
            return this.initializeMarkupPromise.p.p;
        }
        /**
         * Validate if cached inset is out of date and require a rerender
         * Note that it doesn't account for output content change.
         */
        _cachedInsetEqual(cachedInset, content) {
            if (content.type === 1 /* RenderOutputType.Extension */) {
                // Use a new renderer
                return cachedInset.renderer?.id === content.renderer.id;
            }
            else {
                // The new renderer is the default HTML renderer
                return cachedInset.cachedCreation.type === 'html';
            }
        }
        requestCreateOutputWhenWebviewIdle(cellInfo, content, cellTop, offset) {
            if (this._disposed) {
                return;
            }
            if (this.insetMapping.has(content.source)) {
                return;
            }
            if (this.pendingWebviewIdleCreationRequest.has(content.source)) {
                return;
            }
            if (this.pendingWebviewIdleInsetMapping.has(content.source)) {
                // handled in renderer process, waiting for webview to process it when idle
                return;
            }
            this.pendingWebviewIdleCreationRequest.set(content.source, (0, async_1.runWhenIdle)(() => {
                const { message, renderer, transfer: transferable } = this._createOutputCreationMessage(cellInfo, content, cellTop, offset, true, true);
                this._sendMessageToWebview(message, transferable);
                this.pendingWebviewIdleInsetMapping.set(content.source, { outputId: message.outputId, versionId: content.source.model.versionId, cellInfo: cellInfo, renderer, cachedCreation: message });
                this.reversedPendingWebviewIdleInsetMapping.set(message.outputId, content.source);
                this.pendingWebviewIdleCreationRequest.delete(content.source);
            }));
        }
        createOutput(cellInfo, content, cellTop, offset) {
            if (this._disposed) {
                return;
            }
            const cachedInset = this.insetMapping.get(content.source);
            // we now request to render the output immediately, so we can remove the pending request
            // dispose the pending request in renderer process if it exists
            this.pendingWebviewIdleCreationRequest.get(content.source)?.dispose();
            this.pendingWebviewIdleCreationRequest.delete(content.source);
            // if request has already been sent out, we then remove it from the pending mapping
            this.pendingWebviewIdleInsetMapping.delete(content.source);
            if (cachedInset) {
                this.reversedPendingWebviewIdleInsetMapping.delete(cachedInset.outputId);
            }
            if (cachedInset && this._cachedInsetEqual(cachedInset, content)) {
                this.hiddenInsetMapping.delete(content.source);
                this._sendMessageToWebview({
                    type: 'showOutput',
                    cellId: cachedInset.cellInfo.cellId,
                    outputId: cachedInset.outputId,
                    cellTop: cellTop,
                    outputOffset: offset
                });
                return;
            }
            // create new output
            const { message, renderer, transfer: transferable } = this._createOutputCreationMessage(cellInfo, content, cellTop, offset, false, false);
            this._sendMessageToWebview(message, transferable);
            this.insetMapping.set(content.source, { outputId: message.outputId, versionId: content.source.model.versionId, cellInfo: cellInfo, renderer, cachedCreation: message });
            this.hiddenInsetMapping.delete(content.source);
            this.reversedInsetMapping.set(message.outputId, content.source);
        }
        createMetadata(output, mimeType) {
            if (mimeType.startsWith('image')) {
                const buffer = output.outputs.find(out => out.mime === 'text/plain')?.data.buffer;
                if (buffer?.length && buffer?.length > 0) {
                    const altText = new TextDecoder().decode(buffer);
                    return { ...output.metadata, vscode_altText: altText };
                }
            }
            return output.metadata;
        }
        _createOutputCreationMessage(cellInfo, content, cellTop, offset, createOnIdle, initiallyHidden) {
            const messageBase = {
                type: 'html',
                executionId: cellInfo.executionId,
                cellId: cellInfo.cellId,
                cellTop: cellTop,
                outputOffset: offset,
                left: 0,
                requiredPreloads: [],
                createOnIdle: createOnIdle
            };
            const transfer = [];
            let message;
            let renderer;
            if (content.type === 1 /* RenderOutputType.Extension */) {
                const output = content.source.model;
                renderer = content.renderer;
                const first = output.outputs.find(op => op.mime === content.mimeType);
                const metadata = this.createMetadata(output, content.mimeType);
                const valueBytes = copyBufferIfNeeded(first.data.buffer, transfer);
                message = {
                    ...messageBase,
                    outputId: output.outputId,
                    rendererId: content.renderer.id,
                    content: {
                        type: 1 /* RenderOutputType.Extension */,
                        outputId: output.outputId,
                        metadata: metadata,
                        output: {
                            mime: first.mime,
                            valueBytes,
                        },
                        allOutputs: output.outputs.map(output => ({ mime: output.mime })),
                    },
                    initiallyHidden: initiallyHidden
                };
            }
            else {
                message = {
                    ...messageBase,
                    outputId: UUID.generateUuid(),
                    content: {
                        type: content.type,
                        htmlContent: content.htmlContent,
                    },
                    initiallyHidden: initiallyHidden
                };
            }
            return {
                message,
                renderer,
                transfer,
            };
        }
        updateOutput(cellInfo, content, cellTop, offset) {
            if (this._disposed) {
                return;
            }
            if (!this.insetMapping.has(content.source)) {
                this.createOutput(cellInfo, content, cellTop, offset);
                return;
            }
            const outputCache = this.insetMapping.get(content.source);
            if (outputCache.versionId === content.source.model.versionId) {
                // already sent this output version to the renderer
                return;
            }
            this.hiddenInsetMapping.delete(content.source);
            let updatedContent = undefined;
            const transfer = [];
            if (content.type === 1 /* RenderOutputType.Extension */) {
                const output = content.source.model;
                const firstBuffer = output.outputs.find(op => op.mime === content.mimeType);
                const appenededData = output.appendedSinceVersion(outputCache.versionId, content.mimeType);
                const appended = appenededData ? { valueBytes: appenededData.buffer, previousVersion: outputCache.versionId } : undefined;
                const valueBytes = copyBufferIfNeeded(firstBuffer.data.buffer, transfer);
                updatedContent = {
                    type: 1 /* RenderOutputType.Extension */,
                    outputId: outputCache.outputId,
                    metadata: output.metadata,
                    output: {
                        mime: content.mimeType,
                        valueBytes,
                        appended: appended
                    },
                    allOutputs: output.outputs.map(output => ({ mime: output.mime }))
                };
            }
            this._sendMessageToWebview({
                type: 'showOutput',
                cellId: outputCache.cellInfo.cellId,
                outputId: outputCache.outputId,
                cellTop: cellTop,
                outputOffset: offset,
                content: updatedContent
            }, transfer);
            outputCache.versionId = content.source.model.versionId;
            return;
        }
        async copyImage(output) {
            this._sendMessageToWebview({
                type: 'copyImage',
                outputId: output.model.outputId,
                altOutputId: output.model.alternativeOutputId
            });
        }
        removeInsets(outputs) {
            if (this._disposed) {
                return;
            }
            for (const output of outputs) {
                const outputCache = this.insetMapping.get(output);
                if (!outputCache) {
                    continue;
                }
                const id = outputCache.outputId;
                this._sendMessageToWebview({
                    type: 'clearOutput',
                    rendererId: outputCache.cachedCreation.rendererId,
                    cellUri: outputCache.cellInfo.cellUri.toString(),
                    outputId: id,
                    cellId: outputCache.cellInfo.cellId
                });
                this.insetMapping.delete(output);
                this.pendingWebviewIdleCreationRequest.get(output)?.dispose();
                this.pendingWebviewIdleCreationRequest.delete(output);
                this.pendingWebviewIdleInsetMapping.delete(output);
                this.reversedPendingWebviewIdleInsetMapping.delete(id);
                this.reversedInsetMapping.delete(id);
            }
        }
        hideInset(output) {
            if (this._disposed) {
                return;
            }
            const outputCache = this.insetMapping.get(output);
            if (!outputCache) {
                return;
            }
            this.hiddenInsetMapping.add(output);
            this._sendMessageToWebview({
                type: 'hideOutput',
                outputId: outputCache.outputId,
                cellId: outputCache.cellInfo.cellId,
            });
        }
        focusWebview() {
            if (this._disposed) {
                return;
            }
            this.webview?.focus();
        }
        focusOutput(cellOrOutputId, alternateId, viewFocused) {
            if (this._disposed) {
                return;
            }
            if (!viewFocused) {
                this.webview?.focus();
            }
            this._sendMessageToWebview({
                type: 'focus-output',
                cellOrOutputId: cellOrOutputId,
                alternateId: alternateId
            });
        }
        async find(query, options) {
            if (query === '') {
                this._sendMessageToWebview({
                    type: 'findStop',
                    ownerID: options.ownerID
                });
                return [];
            }
            const p = new Promise(resolve => {
                const sub = this.webview?.onMessage(e => {
                    if (e.message.type === 'didFind') {
                        resolve(e.message.matches);
                        sub?.dispose();
                    }
                });
            });
            this._sendMessageToWebview({
                type: 'find',
                query: query,
                options
            });
            const ret = await p;
            return ret;
        }
        findStop(ownerID) {
            this._sendMessageToWebview({
                type: 'findStop',
                ownerID
            });
        }
        async findHighlightCurrent(index, ownerID) {
            const p = new Promise(resolve => {
                const sub = this.webview?.onMessage(e => {
                    if (e.message.type === 'didFindHighlightCurrent') {
                        resolve(e.message.offset);
                        sub?.dispose();
                    }
                });
            });
            this._sendMessageToWebview({
                type: 'findHighlightCurrent',
                index,
                ownerID
            });
            const ret = await p;
            return ret;
        }
        async findUnHighlightCurrent(index, ownerID) {
            this._sendMessageToWebview({
                type: 'findUnHighlightCurrent',
                index,
                ownerID
            });
        }
        deltaCellContainerClassNames(cellId, added, removed) {
            this._sendMessageToWebview({
                type: 'decorations',
                cellId,
                addedClassNames: added,
                removedClassNames: removed
            });
        }
        updateOutputRenderers() {
            if (!this.webview) {
                return;
            }
            const renderersData = this.getRendererData();
            this.localResourceRootsCache = this._getResourceRootsCache();
            const mixedResourceRoots = [
                ...(this.localResourceRootsCache || []),
                ...(this._currentKernel ? [this._currentKernel.localResourceRoot] : []),
            ];
            this.webview.localResourcesRoot = mixedResourceRoots;
            this._sendMessageToWebview({
                type: 'updateRenderers',
                rendererData: renderersData
            });
        }
        async updateKernelPreloads(kernel) {
            if (this._disposed || kernel === this._currentKernel) {
                return;
            }
            const previousKernel = this._currentKernel;
            this._currentKernel = kernel;
            if (previousKernel && previousKernel.preloadUris.length > 0) {
                this.webview?.reload(); // preloads will be restored after reload
            }
            else if (kernel) {
                this._updatePreloadsFromKernel(kernel);
            }
        }
        _updatePreloadsFromKernel(kernel) {
            const resources = [];
            for (const preload of kernel.preloadUris) {
                const uri = this.environmentService.isExtensionDevelopment && (preload.scheme === 'http' || preload.scheme === 'https')
                    ? preload : this.asWebviewUri(preload, undefined);
                if (!this._preloadsCache.has(uri.toString())) {
                    resources.push({ uri: uri.toString(), originalUri: preload.toString() });
                    this._preloadsCache.add(uri.toString());
                }
            }
            if (!resources.length) {
                return;
            }
            this._updatePreloads(resources);
        }
        _updatePreloads(resources) {
            if (!this.webview) {
                return;
            }
            const mixedResourceRoots = [
                ...(this.localResourceRootsCache || []),
                ...(this._currentKernel ? [this._currentKernel.localResourceRoot] : []),
            ];
            this.webview.localResourcesRoot = mixedResourceRoots;
            this._sendMessageToWebview({
                type: 'preload',
                resources: resources,
            });
        }
        _sendMessageToWebview(message, transfer) {
            if (this._disposed) {
                return;
            }
            this.webview?.postMessage(message, transfer);
        }
        dispose() {
            this._disposed = true;
            this.webview?.dispose();
            this.webview = undefined;
            this.notebookEditor = null;
            this.insetMapping.clear();
            this.pendingWebviewIdleCreationRequest.clear();
            super.dispose();
        }
    };
    exports.BackLayerWebView = BackLayerWebView;
    exports.BackLayerWebView = BackLayerWebView = BackLayerWebView_1 = __decorate([
        __param(6, webview_1.IWebviewService),
        __param(7, opener_1.IOpenerService),
        __param(8, notebookService_1.INotebookService),
        __param(9, workspace_1.IWorkspaceContextService),
        __param(10, environmentService_1.IWorkbenchEnvironmentService),
        __param(11, dialogs_1.IFileDialogService),
        __param(12, files_1.IFileService),
        __param(13, contextView_1.IContextMenuService),
        __param(14, contextkey_1.IContextKeyService),
        __param(15, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(16, configuration_1.IConfigurationService),
        __param(17, language_1.ILanguageService),
        __param(18, workspace_1.IWorkspaceContextService),
        __param(19, editorGroupsService_1.IEditorGroupsService),
        __param(20, storage_1.IStorageService),
        __param(21, pathService_1.IPathService),
        __param(22, notebookLoggingService_1.INotebookLoggingService),
        __param(23, themeService_1.IThemeService),
        __param(24, telemetry_1.ITelemetryService)
    ], BackLayerWebView);
    function copyBufferIfNeeded(buffer, transfer) {
        if (buffer.byteLength === buffer.buffer.byteLength) {
            // No copy needed but we can't transfer either
            return buffer;
        }
        else {
            // The buffer is smaller than its backing array buffer.
            // Create a copy to avoid sending the entire array buffer.
            const valueBytes = new Uint8Array(buffer);
            transfer.push(valueBytes.buffer);
            return valueBytes;
        }
    }
    function getTokenizationCss() {
        const colorMap = languages_1.TokenizationRegistry.getColorMap();
        const tokenizationCss = colorMap ? (0, tokenization_1.generateTokensCSSForColorMap)(colorMap) : '';
        return tokenizationCss;
    }
    function tryDecodeURIComponent(uri) {
        try {
            return decodeURIComponent(uri);
        }
        catch {
            return uri;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja0xheWVyV2ViVmlldy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvdmlldy9yZW5kZXJlcnMvYmFja0xheWVyV2ViVmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBdURoRyxNQUFNLGlCQUFpQixHQUFHLHdCQUF3QixDQUFDO0lBQ25ELE1BQU0sY0FBYyxHQUFHLGFBQWEsQ0FBQztJQThEOUIsSUFBTSxnQkFBZ0IsR0FBdEIsTUFBTSxnQkFBNEMsU0FBUSx1QkFBUTs7UUFJaEUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxjQUErQjtZQUM1RCxJQUFJLENBQUMsWUFBWSxLQUFLLElBQUksNEJBQWtCLENBQUMsbUNBQW1DLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDbEcsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBQzFCLENBQUM7UUF3QkQsWUFDUSxjQUEyQyxFQUNqQyxFQUFVLEVBQ1gsZ0JBQXdCLEVBQ3hCLFdBQWdCLEVBQ3hCLE9BQWdDLEVBQ3ZCLGlCQUF1RCxFQUN2RCxjQUFnRCxFQUNqRCxhQUE4QyxFQUM1QyxlQUFrRCxFQUMxQyxjQUF5RCxFQUNyRCxrQkFBaUUsRUFDM0UsaUJBQXNELEVBQzVELFdBQTBDLEVBQ25DLGtCQUF3RCxFQUN6RCxpQkFBc0QsRUFDeEMsK0JBQWtGLEVBQzdGLG9CQUE0RCxFQUNqRSxlQUFrRCxFQUMxQyx1QkFBa0UsRUFDdEUsa0JBQXlELEVBQzlELGNBQWdELEVBQ25ELFdBQTBDLEVBQy9CLGtCQUE0RCxFQUN0RSxZQUEyQixFQUN2QixnQkFBb0Q7WUFFdkUsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBMUJiLG1CQUFjLEdBQWQsY0FBYyxDQUE2QjtZQUNqQyxPQUFFLEdBQUYsRUFBRSxDQUFRO1lBQ1gscUJBQWdCLEdB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