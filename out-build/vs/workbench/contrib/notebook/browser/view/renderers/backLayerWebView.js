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
define(["require", "exports", "vs/base/common/path", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/mime", "vs/base/common/network", "vs/base/common/objects", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uri", "vs/base/common/uuid", "vs/editor/common/languages", "vs/editor/common/languages/language", "vs/editor/common/languages/supports/tokenization", "vs/editor/common/languages/textToHtmlTokenizer", "vs/nls!vs/workbench/contrib/notebook/browser/view/renderers/backLayerWebView", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/dialogs/common/dialogs", "vs/platform/files/common/files", "vs/platform/opener/common/opener", "vs/platform/storage/common/storage", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/platform/workspace/common/workspace", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/view/notebookCellList", "vs/workbench/contrib/notebook/browser/view/renderers/webviewPreloads", "vs/workbench/contrib/notebook/browser/view/renderers/webviewThemeMapping", "vs/workbench/contrib/notebook/browser/viewModel/markupCellViewModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/contrib/webview/browser/webview", "vs/workbench/contrib/webview/browser/webviewWindowDragMonitor", "vs/workbench/contrib/webview/common/webview", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/path/common/pathService", "vs/workbench/contrib/notebook/common/notebookLoggingService", "vs/platform/telemetry/common/telemetry"], function (require, exports, osPath, arrays_1, async_1, buffer_1, event_1, mime_1, network_1, objects_1, platform_1, resources_1, uri_1, UUID, languages_1, language_1, tokenization_1, textToHtmlTokenizer_1, nls, actions_1, configuration_1, contextkey_1, contextView_1, dialogs_1, files_1, opener_1, storage_1, colorRegistry_1, themeService_1, workspace_1, workspaceTrust_1, notebookBrowser_1, notebookCellList_1, webviewPreloads_1, webviewThemeMapping_1, markupCellViewModel_1, notebookCommon_1, notebookService_1, webview_1, webviewWindowDragMonitor_1, webview_2, editorGroupsService_1, environmentService_1, pathService_1, notebookLoggingService_1, telemetry_1) {
    "use strict";
    var $2ob_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$2ob = void 0;
    const LINE_COLUMN_REGEX = /:([\d]+)(?::([\d]+))?$/;
    const LineQueryRegex = /line=(\d+)$/;
    let $2ob = class $2ob extends themeService_1.$nv {
        static { $2ob_1 = this; }
        static b(storageService) {
            this.a ??= new webview_1.$Nbb('notebook.backlayerWebview.origins', storageService);
            return this.a;
        }
        constructor(notebookEditor, F, notebookViewType, documentUri, G, H, I, J, L, M, N, O, P, Q, R, S, U, W, X, Y, Z, $, ab, themeService, bb) {
            super(themeService);
            this.notebookEditor = notebookEditor;
            this.F = F;
            this.notebookViewType = notebookViewType;
            this.documentUri = documentUri;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.L = L;
            this.M = M;
            this.N = N;
            this.O = O;
            this.P = P;
            this.Q = Q;
            this.R = R;
            this.S = S;
            this.U = U;
            this.W = W;
            this.X = X;
            this.Y = Y;
            this.Z = Z;
            this.$ = $;
            this.ab = ab;
            this.bb = bb;
            this.webview = undefined;
            this.insetMapping = new Map();
            this.pendingWebviewIdleCreationRequest = new Map();
            this.pendingWebviewIdleInsetMapping = new Map();
            this.c = new Map();
            this.markupPreviewMapping = new Map();
            this.f = new Set();
            this.g = new Map();
            this.j = undefined;
            this.m = this.B(new event_1.$fd());
            this.r = new Set();
            this.onMessage = this.m.event;
            this.s = false;
            this.u = true;
            this.D = UUID.$4f();
            this.cb('Creating backlayer webview for notebook');
            this.element = document.createElement('div');
            this.element.style.height = '1400px';
            this.element.style.position = 'absolute';
            if (H) {
                this.B(H);
                H.receiveMessageHandler = (rendererId, message) => {
                    if (!this.webview || this.s) {
                        return Promise.resolve(false);
                    }
                    this.Db({
                        __vscode_notebook_message: true,
                        type: 'customRendererMessage',
                        rendererId: rendererId,
                        message: message
                    });
                    return Promise.resolve(true);
                };
            }
            this.B(S.onDidChangeTrust(e => {
                const baseUrl = this.jb(this.lb(), undefined);
                const htmlContent = this.gb(baseUrl.toString());
                this.webview?.setHtml(htmlContent);
            }));
            this.B(languages_1.$bt.onDidChange(() => {
                this.Db({
                    type: 'tokenizedStylesChanged',
                    css: getTokenizationCss(),
                });
            }));
        }
        updateOptions(options) {
            this.G = options;
            this.db();
            this.eb();
        }
        cb(msg) {
            this.ab.debug('BacklayerWebview', `${this.documentUri} (${this.F}) - ${msg}`);
        }
        db() {
            this.Db({
                type: 'notebookStyles',
                styles: this.fb()
            });
        }
        eb() {
            this.Db({
                type: 'notebookOptions',
                options: {
                    dragAndDropEnabled: this.G.dragAndDropEnabled
                },
                renderOptions: {
                    lineLimit: this.G.outputLineLimit,
                    outputScrolling: this.G.outputScrolling,
                    outputWordWrap: this.G.outputWordWrap
                }
            });
        }
        fb() {
            return {
                'notebook-output-left-margin': `${this.G.leftMargin + this.G.runGutter}px`,
                'notebook-output-width': `calc(100% - ${this.G.leftMargin + this.G.rightMargin + this.G.runGutter}px)`,
                'notebook-output-node-padding': `${this.G.outputNodePadding}px`,
                'notebook-run-gutter': `${this.G.runGutter}px`,
                'notebook-preview-node-padding': `${this.G.previewNodePadding}px`,
                'notebook-markdown-left-margin': `${this.G.markdownLeftMargin}px`,
                'notebook-output-node-left-padding': `${this.G.outputNodeLeftPadding}px`,
                'notebook-markdown-min-height': `${this.G.previewNodePadding * 2}px`,
                'notebook-markup-font-size': typeof this.G.markupFontSize === 'number' && this.G.markupFontSize > 0 ? `${this.G.markupFontSize}px` : `calc(${this.G.fontSize}px * 1.2)`,
                'notebook-cell-output-font-size': `${this.G.outputFontSize || this.G.fontSize}px`,
                'notebook-cell-output-line-height': `${this.G.outputLineHeight}px`,
                'notebook-cell-output-max-height': `${this.G.outputLineHeight * this.G.outputLineLimit}px`,
                'notebook-cell-output-font-family': this.G.outputFontFamily || this.G.fontFamily,
                'notebook-cell-markup-empty-content': nls.localize(0, null),
                'notebook-cell-renderer-not-found-error': nls.localize(1, null),



                'notebook-cell-renderer-fallbacks-exhausted': nls.localize(2, null),



            };
        }
        gb(baseUrl) {
            const renderersData = this.hb();
            const preloadsData = this.ib();
            const renderOptions = {
                lineLimit: this.G.outputLineLimit,
                outputScrolling: this.G.outputScrolling,
                outputWordWrap: this.G.outputWordWrap
            };
            const preloadScript = (0, webviewPreloads_1.$Sob)({
                ...this.G,
                tokenizationCss: getTokenizationCss(),
            }, { dragAndDropEnabled: this.G.dragAndDropEnabled }, renderOptions, renderersData, preloadsData, this.S.isWorkspaceTrusted(), this.D);
            const enableCsp = this.U.getValue('notebook.experimental.enableCsp');
            const currentHighlight = this.z(colorRegistry_1.$Sw);
            const findMatchHighlight = this.z(colorRegistry_1.$Tw);
            return /* html */ `
		<html lang="en">
			<head>
				<meta charset="UTF-8">
				<base href="${baseUrl}/" />
				${enableCsp ?
                `<meta http-equiv="Content-Security-Policy" content="
					default-src 'none';
					script-src ${webview_2.$Xob} 'unsafe-inline' 'unsafe-eval';
					style-src ${webview_2.$Xob} 'unsafe-inline';
					img-src ${webview_2.$Xob} https: http: data:;
					font-src ${webview_2.$Xob} https:;
					connect-src https:;
					child-src https: data:;
				">` : ''}
				<style nonce="${this.D}">
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
        hb() {
            return this.L.getRenderers().map((renderer) => {
                const entrypoint = {
                    extends: renderer.entrypoint.extends,
                    path: this.jb(renderer.entrypoint.path, renderer.extensionLocation).toString()
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
        ib() {
            return Array.from(this.L.getStaticPreloads(this.notebookViewType), preload => {
                return { entrypoint: this.jb(preload.entrypoint, preload.extensionLocation).toString().toString() };
            });
        }
        jb(uri, fromExtension) {
            return (0, webview_2.$Yob)(uri, fromExtension?.scheme === network_1.Schemas.vscodeRemote ? { isRemote: true, authority: fromExtension.authority } : undefined);
        }
        postKernelMessage(message) {
            this.Db({
                __vscode_notebook_message: true,
                type: 'customKernelMessage',
                message,
            });
        }
        kb(id) {
            const output = this.g.get(id);
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
            const baseUrl = this.jb(this.lb(), undefined);
            const htmlContent = this.gb(baseUrl.toString());
            return this.nb(htmlContent);
        }
        lb() {
            if (this.documentUri.scheme === network_1.Schemas.untitled) {
                const folder = this.X.getWorkspaceFolder(this.documentUri);
                if (folder) {
                    return folder.uri;
                }
                const folders = this.X.getWorkspace().folders;
                if (folders.length) {
                    return folders[0].uri;
                }
            }
            return (0, resources_1.$hg)(this.documentUri);
        }
        mb() {
            // Python notebooks assume that requirejs is a global.
            // For all other notebooks, they need to provide their own loader.
            if (!this.documentUri.path.toLowerCase().endsWith('.ipynb')) {
                return [];
            }
            if (platform_1.$o) {
                return []; // script is inlined
            }
            return [
                (0, resources_1.$hg)(network_1.$2f.asFileUri('vs/loader.js')),
            ];
        }
        nb(content) {
            if (!document.body.contains(this.element)) {
                throw new Error('Element is already detached from the DOM tree');
            }
            this.webview = this.tb(this.I, content);
            this.webview.mountTo(this.element);
            this.B(this.webview);
            this.B(new webviewWindowDragMonitor_1.$afb(() => this.webview));
            const initializePromise = new async_1.$2g();
            this.B(this.webview.onFatalError(e => {
                initializePromise.error(new Error(`Could not initialize webview: ${e.message}}`));
            }));
            this.B(this.webview.onMessage(async (message) => {
                const data = message.message;
                if (this.s) {
                    return;
                }
                if (!data.__vscode_notebook_message) {
                    return;
                }
                switch (data.type) {
                    case 'initialized': {
                        initializePromise.complete();
                        this.vb();
                        break;
                    }
                    case 'initializedMarkup': {
                        if (this.C?.requestId === data.requestId) {
                            this.C?.p.complete();
                            this.C = undefined;
                        }
                        break;
                    }
                    case 'dimension': {
                        for (const update of data.updates) {
                            const height = update.height;
                            if (update.isOutput) {
                                const resolvedResult = this.kb(update.id);
                                if (resolvedResult) {
                                    const { cellInfo, output } = resolvedResult;
                                    this.notebookEditor.updateOutputHeight(cellInfo, output, height, !!update.init, 'webview#dimension');
                                    this.notebookEditor.scheduleOutputHeightAck(cellInfo, update.id, height);
                                }
                                else if (update.init) {
                                    // might be idle render request's ack
                                    const outputRequest = this.c.get(update.id);
                                    if (outputRequest) {
                                        const inset = this.pendingWebviewIdleInsetMapping.get(outputRequest);
                                        // clear the pending mapping
                                        this.pendingWebviewIdleCreationRequest.delete(outputRequest);
                                        this.pendingWebviewIdleCreationRequest.delete(outputRequest);
                                        const cellInfo = inset.cellInfo;
                                        this.g.set(update.id, outputRequest);
                                        this.insetMapping.set(outputRequest, inset);
                                        this.notebookEditor.updateOutputHeight(cellInfo, outputRequest, height, !!update.init, 'webview#dimension');
                                        this.notebookEditor.scheduleOutputHeightAck(cellInfo, update.id, height);
                                    }
                                    this.c.delete(update.id);
                                }
                                {
                                    if (!update.init) {
                                        continue;
                                    }
                                    const output = this.g.get(update.id);
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
                        const resolvedResult = this.kb(data.id);
                        if (resolvedResult) {
                            const latestCell = this.notebookEditor.getCellByInfo(resolvedResult.cellInfo);
                            if (latestCell) {
                                latestCell.outputIsHovered = true;
                            }
                        }
                        break;
                    }
                    case 'mouseleave': {
                        const resolvedResult = this.kb(data.id);
                        if (resolvedResult) {
                            const latestCell = this.notebookEditor.getCellByInfo(resolvedResult.cellInfo);
                            if (latestCell) {
                                latestCell.outputIsHovered = false;
                            }
                        }
                        break;
                    }
                    case 'outputFocus': {
                        const resolvedResult = this.kb(data.id);
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
                        const resolvedResult = this.kb(data.id);
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
                        this.notebookEditor.setScrollTop(data.scrollTop - notebookCellList_1.$Fob);
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
                        this.sb(data);
                        break;
                    }
                    case 'clicked-link': {
                        if ((0, opener_1.$OT)(data.href, network_1.Schemas.command)) {
                            const uri = uri_1.URI.parse(data.href);
                            if (uri.path === 'workbench.action.openLargeOutput') {
                                const outputId = uri.query;
                                const group = this.Y.activeGroup;
                                if (group) {
                                    if (group.activeEditor) {
                                        group.pinEditor(group.activeEditor);
                                    }
                                }
                                this.J.open(notebookCommon_1.CellUri.generateCellOutputUri(this.documentUri, outputId));
                                return;
                            }
                            if (uri.path === 'cellOutput.enableScrolling') {
                                const outputId = uri.query;
                                const cell = this.g.get(outputId);
                                if (cell) {
                                    this.bb.publicLog2('workbenchActionExecuted', { id: 'notebook.cell.toggleOutputScrolling', from: 'inlineLink' });
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
                            this.J.open(data.href, {
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
                        if ((0, opener_1.$PT)(data.href, network_1.Schemas.http, network_1.Schemas.https, network_1.Schemas.mailto)) {
                            this.J.open(data.href, { fromUserGesture: true, fromWorkspace: true });
                        }
                        else if ((0, opener_1.$OT)(data.href, network_1.Schemas.vscodeNotebookCell)) {
                            const uri = uri_1.URI.parse(data.href);
                            this.ob(uri);
                        }
                        else if (!/^[\w\-]+:/.test(data.href)) {
                            // Uri without scheme, such as a file path
                            this.pb(tryDecodeURIComponent(data.href));
                        }
                        else {
                            // uri with scheme
                            if (osPath.$8d(data.href)) {
                                this.qb(uri_1.URI.file(data.href));
                            }
                            else {
                                this.qb(uri_1.URI.parse(data.href));
                            }
                        }
                        break;
                    }
                    case 'customKernelMessage': {
                        this.m.fire({ message: data.message });
                        break;
                    }
                    case 'customRendererMessage': {
                        this.H?.postMessage(data.rendererId, data.message);
                        break;
                    }
                    case 'clickMarkupCell': {
                        const cell = this.notebookEditor.getCellById(data.cellId);
                        if (cell) {
                            if (data.shiftKey || (platform_1.$j ? data.metaKey : data.ctrlKey)) {
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
                            this.Q.showContextMenu({
                                menuId: actions_1.$Ru.NotebookCellTitle,
                                contextKeyService: this.R,
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
                        if (cell instanceof markupCellViewModel_1.$Snb) {
                            cell.cellIsHovered = true;
                        }
                        break;
                    }
                    case 'mouseLeaveMarkupCell': {
                        const cell = this.notebookEditor.getCellById(data.cellId);
                        if (cell instanceof markupCellViewModel_1.$Snb) {
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
                        if (cell instanceof markupCellViewModel_1.$Snb) {
                            cell.renderedHtml = data.html;
                        }
                        this.rb(data.codeBlocks);
                        break;
                    }
                    case 'renderedCellOutput': {
                        this.rb(data.codeBlocks);
                        break;
                    }
                    case 'outputResized': {
                        this.notebookEditor.didResizeOutput(data.cellId);
                        break;
                    }
                    case 'getOutputItem': {
                        const resolvedResult = this.kb(data.outputId);
                        const output = resolvedResult?.output.model.outputs.find(output => output.mime === data.mime);
                        this.Db({
                            type: 'returnOutputItem',
                            requestId: data.requestId,
                            output: output ? { mime: output.mime, valueBytes: output.data.buffer } : undefined,
                        });
                        break;
                    }
                    case 'logRendererDebugMessage': {
                        this.cb(`${data.message}${data.data ? ' ' + JSON.stringify(data.data, null, 4) : ''}`);
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
        ob(uri) {
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
                    this.J.open(uri.with({ fragment }), {
                        fromUserGesture: true,
                        fromWorkspace: true,
                        editorOptions: editorOptions
                    });
                    return;
                }
            }
            this.J.open(uri, { fromUserGesture: true, fromWorkspace: true });
            return uri;
        }
        pb(href) {
            let linkToOpen = undefined;
            if (href.startsWith('/')) {
                linkToOpen = uri_1.URI.parse(href);
            }
            else if (href.startsWith('~')) {
                const userHome = this.$.resolvedUserHome;
                if (userHome) {
                    linkToOpen = uri_1.URI.parse(osPath.$9d(userHome.fsPath, href.substring(1)));
                }
            }
            else {
                if (this.documentUri.scheme === network_1.Schemas.untitled) {
                    const folders = this.X.getWorkspace().folders;
                    if (!folders.length) {
                        return;
                    }
                    linkToOpen = uri_1.URI.joinPath(folders[0].uri, href);
                }
                else {
                    // Resolve relative to notebook document
                    linkToOpen = uri_1.URI.joinPath((0, resources_1.$hg)(this.documentUri), href);
                }
            }
            if (linkToOpen) {
                this.qb(linkToOpen);
            }
        }
        qb(uri) {
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
            for (const group of this.Y.groups) {
                const editorInput = group.editors.find(editor => editor.resource && (0, resources_1.$bg)(editor.resource, uri, true));
                if (editorInput) {
                    match = { group, editor: editorInput };
                    break;
                }
            }
            if (match) {
                match.group.openEditor(match.editor, lineNumber !== undefined && column !== undefined ? { selection: { startLineNumber: lineNumber, startColumn: column } } : undefined);
            }
            else {
                this.J.open(uri, { fromUserGesture: true, fromWorkspace: true });
            }
        }
        rb(codeBlocks) {
            for (const { id, value, lang } of codeBlocks) {
                // The language id may be a language aliases (e.g.js instead of javascript)
                const languageId = this.W.getLanguageIdByLanguageName(lang);
                if (!languageId) {
                    continue;
                }
                (0, textToHtmlTokenizer_1.$dY)(this.W, value, languageId).then((html) => {
                    if (this.s) {
                        return;
                    }
                    this.Db({
                        type: 'tokenizedCodeBlock',
                        html,
                        codeBlockId: id
                    });
                });
            }
        }
        async sb(event) {
            if (typeof event.data !== 'string') {
                return;
            }
            const [splitStart, splitData] = event.data.split(';base64,');
            if (!splitData || !splitStart) {
                return;
            }
            const defaultDir = (0, resources_1.$gg)(this.documentUri) === '.interactive' ?
                this.X.getWorkspace().folders[0]?.uri ?? await this.O.defaultFilePath() :
                (0, resources_1.$hg)(this.documentUri);
            let defaultName;
            if (event.downloadName) {
                defaultName = event.downloadName;
            }
            else {
                const mimeType = splitStart.replace(/^data:/, '');
                const candidateExtension = mimeType && (0, mime_1.$Kr)(mimeType);
                defaultName = candidateExtension ? `download${candidateExtension}` : 'download';
            }
            const defaultUri = (0, resources_1.$ig)(defaultDir, defaultName);
            const newFileUri = await this.O.showSaveDialog({
                defaultUri
            });
            if (!newFileUri) {
                return;
            }
            const buff = (0, buffer_1.$Yd)(splitData);
            await this.P.writeFile(newFileUri, buff);
            await this.J.open(newFileUri);
        }
        tb(webviewService, content) {
            this.j = this.ub();
            const webview = webviewService.createWebviewElement({
                origin: $2ob_1.b(this.Z).getOrigin(this.notebookViewType, undefined),
                title: nls.localize(3, null),
                options: {
                    purpose: "notebookRenderer" /* WebviewContentPurpose.NotebookRenderer */,
                    enableFindWidget: false,
                    transformCssVariables: webviewThemeMapping_1.$Tob,
                },
                contentOptions: {
                    allowMultipleAPIAcquire: true,
                    allowScripts: true,
                    localResourceRoots: this.j,
                },
                extension: undefined,
                providedViewType: 'notebook.output'
            });
            webview.setHtml(content);
            webview.setContextKeyService(this.R);
            return webview;
        }
        ub() {
            const workspaceFolders = this.M.getWorkspace().folders.map(x => x.uri);
            const notebookDir = this.lb();
            return [
                this.L.getNotebookProviderResourceRoots(),
                this.L.getRenderers().map(x => (0, resources_1.$hg)(x.entrypoint.path)),
                ...Array.from(this.L.getStaticPreloads(this.notebookViewType), x => [
                    (0, resources_1.$hg)(x.entrypoint),
                    ...x.localResourceRoots,
                ]),
                workspaceFolders,
                notebookDir,
                this.mb()
            ].flat();
        }
        vb() {
            this.r.clear();
            if (this.t) {
                this.Bb(this.t);
            }
            for (const [output, inset] of this.insetMapping.entries()) {
                this.Db({ ...inset.cachedCreation, initiallyHidden: this.f.has(output) });
            }
            if (this.C?.isFirstInit) {
                // On first run the contents have already been initialized so we don't need to init them again
                // no op
            }
            else {
                const mdCells = [...this.markupPreviewMapping.values()];
                this.markupPreviewMapping.clear();
                this.initializeMarkup(mdCells);
            }
            this.db();
            this.eb();
        }
        wb(cell, output, cellTop, outputOffset) {
            if (this.s) {
                return false;
            }
            if ('isOutputCollapsed' in cell && cell.isOutputCollapsed) {
                return false;
            }
            if (this.f.has(output)) {
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
            this.Db({
                type: 'ack-dimension',
                updates
            });
        }
        updateScrollTops(outputRequests, markupPreviews) {
            if (this.s) {
                return;
            }
            const widgets = (0, arrays_1.$Fb)(outputRequests.map((request) => {
                const outputCache = this.insetMapping.get(request.output);
                if (!outputCache) {
                    return;
                }
                if (!request.forceDisplay && !this.wb(request.cell, request.output, request.cellTop, request.outputOffset)) {
                    return;
                }
                const id = outputCache.outputId;
                outputCache.cachedCreation.cellTop = request.cellTop;
                outputCache.cachedCreation.outputOffset = request.outputOffset;
                this.f.delete(request.output);
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
            this.Db({
                type: 'view-scroll',
                widgets: widgets,
                markupCells: markupPreviews,
            });
        }
        async xb(initialization) {
            if (this.s) {
                return;
            }
            if (this.markupPreviewMapping.has(initialization.cellId)) {
                console.error('Trying to create markup preview that already exists');
                return;
            }
            this.markupPreviewMapping.set(initialization.cellId, initialization);
            this.Db({
                type: 'createMarkupCell',
                cell: initialization
            });
        }
        async showMarkupPreview(newContent) {
            if (this.s) {
                return;
            }
            const entry = this.markupPreviewMapping.get(newContent.cellId);
            if (!entry) {
                return this.xb(newContent);
            }
            const sameContent = newContent.content === entry.content;
            const sameMetadata = ((0, objects_1.$Zm)(newContent.metadata, entry.metadata));
            if (!sameContent || !sameMetadata || !entry.visible) {
                this.Db({
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
            if (this.s) {
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
                this.Db({
                    type: 'hideMarkupCells',
                    ids: cellsToHide
                });
            }
        }
        async unhideMarkupPreviews(cellIds) {
            if (this.s) {
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
            this.Db({
                type: 'unhideMarkupCells',
                ids: toUnhide,
            });
        }
        async deleteMarkupPreviews(cellIds) {
            if (this.s) {
                return;
            }
            for (const id of cellIds) {
                if (!this.markupPreviewMapping.has(id)) {
                    console.error(`Trying to delete a preview that does not exist: ${id}`);
                }
                this.markupPreviewMapping.delete(id);
            }
            if (cellIds.length) {
                this.Db({
                    type: 'deleteMarkupCell',
                    ids: cellIds
                });
            }
        }
        async updateMarkupPreviewSelections(selectedCellsIds) {
            if (this.s) {
                return;
            }
            this.Db({
                type: 'updateSelectedMarkupCells',
                selectedCellIds: selectedCellsIds.filter(id => this.markupPreviewMapping.has(id)),
            });
        }
        async initializeMarkup(cells) {
            if (this.s) {
                return;
            }
            this.C?.p.complete();
            const requestId = UUID.$4f();
            this.C = { p: new async_1.$2g(), requestId, isFirstInit: this.u };
            this.u = false;
            for (const cell of cells) {
                this.markupPreviewMapping.set(cell.cellId, cell);
            }
            this.Db({
                type: 'initializeMarkup',
                cells,
                requestId,
            });
            return this.C.p.p;
        }
        /**
         * Validate if cached inset is out of date and require a rerender
         * Note that it doesn't account for output content change.
         */
        yb(cachedInset, content) {
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
            if (this.s) {
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
            this.pendingWebviewIdleCreationRequest.set(content.source, (0, async_1.$Wg)(() => {
                const { message, renderer, transfer: transferable } = this.Ab(cellInfo, content, cellTop, offset, true, true);
                this.Db(message, transferable);
                this.pendingWebviewIdleInsetMapping.set(content.source, { outputId: message.outputId, versionId: content.source.model.versionId, cellInfo: cellInfo, renderer, cachedCreation: message });
                this.c.set(message.outputId, content.source);
                this.pendingWebviewIdleCreationRequest.delete(content.source);
            }));
        }
        createOutput(cellInfo, content, cellTop, offset) {
            if (this.s) {
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
                this.c.delete(cachedInset.outputId);
            }
            if (cachedInset && this.yb(cachedInset, content)) {
                this.f.delete(content.source);
                this.Db({
                    type: 'showOutput',
                    cellId: cachedInset.cellInfo.cellId,
                    outputId: cachedInset.outputId,
                    cellTop: cellTop,
                    outputOffset: offset
                });
                return;
            }
            // create new output
            const { message, renderer, transfer: transferable } = this.Ab(cellInfo, content, cellTop, offset, false, false);
            this.Db(message, transferable);
            this.insetMapping.set(content.source, { outputId: message.outputId, versionId: content.source.model.versionId, cellInfo: cellInfo, renderer, cachedCreation: message });
            this.f.delete(content.source);
            this.g.set(message.outputId, content.source);
        }
        zb(output, mimeType) {
            if (mimeType.startsWith('image')) {
                const buffer = output.outputs.find(out => out.mime === 'text/plain')?.data.buffer;
                if (buffer?.length && buffer?.length > 0) {
                    const altText = new TextDecoder().decode(buffer);
                    return { ...output.metadata, vscode_altText: altText };
                }
            }
            return output.metadata;
        }
        Ab(cellInfo, content, cellTop, offset, createOnIdle, initiallyHidden) {
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
                const metadata = this.zb(output, content.mimeType);
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
                    outputId: UUID.$4f(),
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
            if (this.s) {
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
            this.f.delete(content.source);
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
            this.Db({
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
            this.Db({
                type: 'copyImage',
                outputId: output.model.outputId,
                altOutputId: output.model.alternativeOutputId
            });
        }
        removeInsets(outputs) {
            if (this.s) {
                return;
            }
            for (const output of outputs) {
                const outputCache = this.insetMapping.get(output);
                if (!outputCache) {
                    continue;
                }
                const id = outputCache.outputId;
                this.Db({
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
                this.c.delete(id);
                this.g.delete(id);
            }
        }
        hideInset(output) {
            if (this.s) {
                return;
            }
            const outputCache = this.insetMapping.get(output);
            if (!outputCache) {
                return;
            }
            this.f.add(output);
            this.Db({
                type: 'hideOutput',
                outputId: outputCache.outputId,
                cellId: outputCache.cellInfo.cellId,
            });
        }
        focusWebview() {
            if (this.s) {
                return;
            }
            this.webview?.focus();
        }
        focusOutput(cellOrOutputId, alternateId, viewFocused) {
            if (this.s) {
                return;
            }
            if (!viewFocused) {
                this.webview?.focus();
            }
            this.Db({
                type: 'focus-output',
                cellOrOutputId: cellOrOutputId,
                alternateId: alternateId
            });
        }
        async find(query, options) {
            if (query === '') {
                this.Db({
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
            this.Db({
                type: 'find',
                query: query,
                options
            });
            const ret = await p;
            return ret;
        }
        findStop(ownerID) {
            this.Db({
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
            this.Db({
                type: 'findHighlightCurrent',
                index,
                ownerID
            });
            const ret = await p;
            return ret;
        }
        async findUnHighlightCurrent(index, ownerID) {
            this.Db({
                type: 'findUnHighlightCurrent',
                index,
                ownerID
            });
        }
        deltaCellContainerClassNames(cellId, added, removed) {
            this.Db({
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
            const renderersData = this.hb();
            this.j = this.ub();
            const mixedResourceRoots = [
                ...(this.j || []),
                ...(this.t ? [this.t.localResourceRoot] : []),
            ];
            this.webview.localResourcesRoot = mixedResourceRoots;
            this.Db({
                type: 'updateRenderers',
                rendererData: renderersData
            });
        }
        async updateKernelPreloads(kernel) {
            if (this.s || kernel === this.t) {
                return;
            }
            const previousKernel = this.t;
            this.t = kernel;
            if (previousKernel && previousKernel.preloadUris.length > 0) {
                this.webview?.reload(); // preloads will be restored after reload
            }
            else if (kernel) {
                this.Bb(kernel);
            }
        }
        Bb(kernel) {
            const resources = [];
            for (const preload of kernel.preloadUris) {
                const uri = this.N.isExtensionDevelopment && (preload.scheme === 'http' || preload.scheme === 'https')
                    ? preload : this.jb(preload, undefined);
                if (!this.r.has(uri.toString())) {
                    resources.push({ uri: uri.toString(), originalUri: preload.toString() });
                    this.r.add(uri.toString());
                }
            }
            if (!resources.length) {
                return;
            }
            this.Cb(resources);
        }
        Cb(resources) {
            if (!this.webview) {
                return;
            }
            const mixedResourceRoots = [
                ...(this.j || []),
                ...(this.t ? [this.t.localResourceRoot] : []),
            ];
            this.webview.localResourcesRoot = mixedResourceRoots;
            this.Db({
                type: 'preload',
                resources: resources,
            });
        }
        Db(message, transfer) {
            if (this.s) {
                return;
            }
            this.webview?.postMessage(message, transfer);
        }
        dispose() {
            this.s = true;
            this.webview?.dispose();
            this.webview = undefined;
            this.notebookEditor = null;
            this.insetMapping.clear();
            this.pendingWebviewIdleCreationRequest.clear();
            super.dispose();
        }
    };
    exports.$2ob = $2ob;
    exports.$2ob = $2ob = $2ob_1 = __decorate([
        __param(6, webview_1.$Lbb),
        __param(7, opener_1.$NT),
        __param(8, notebookService_1.$ubb),
        __param(9, workspace_1.$Kh),
        __param(10, environmentService_1.$hJ),
        __param(11, dialogs_1.$qA),
        __param(12, files_1.$6j),
        __param(13, contextView_1.$WZ),
        __param(14, contextkey_1.$3i),
        __param(15, workspaceTrust_1.$$z),
        __param(16, configuration_1.$8h),
        __param(17, language_1.$ct),
        __param(18, workspace_1.$Kh),
        __param(19, editorGroupsService_1.$5C),
        __param(20, storage_1.$Vo),
        __param(21, pathService_1.$yJ),
        __param(22, notebookLoggingService_1.$1ob),
        __param(23, themeService_1.$gv),
        __param(24, telemetry_1.$9k)
    ], $2ob);
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
        const colorMap = languages_1.$bt.getColorMap();
        const tokenizationCss = colorMap ? (0, tokenization_1.$Rob)(colorMap) : '';
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
//# sourceMappingURL=backLayerWebView.js.map