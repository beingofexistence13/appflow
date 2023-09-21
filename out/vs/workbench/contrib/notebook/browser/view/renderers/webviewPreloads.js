/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.preloadsScriptStr = void 0;
    async function webviewPreloads(ctx) {
        const textEncoder = new TextEncoder();
        const textDecoder = new TextDecoder();
        let currentOptions = ctx.options;
        const isWorkspaceTrusted = ctx.isWorkspaceTrusted;
        let currentRenderOptions = ctx.renderOptions;
        const settingChange = createEmitter();
        const acquireVsCodeApi = globalThis.acquireVsCodeApi;
        const vscode = acquireVsCodeApi();
        delete globalThis.acquireVsCodeApi;
        const tokenizationStyle = new CSSStyleSheet();
        tokenizationStyle.replaceSync(ctx.style.tokenizationCss);
        const runWhenIdle = (typeof requestIdleCallback !== 'function' || typeof cancelIdleCallback !== 'function')
            ? (runner) => {
                setTimeout(() => {
                    if (disposed) {
                        return;
                    }
                    const end = Date.now() + 15; // one frame at 64fps
                    runner(Object.freeze({
                        didTimeout: true,
                        timeRemaining() {
                            return Math.max(0, end - Date.now());
                        }
                    }));
                });
                let disposed = false;
                return {
                    dispose() {
                        if (disposed) {
                            return;
                        }
                        disposed = true;
                    }
                };
            }
            : (runner, timeout) => {
                const handle = requestIdleCallback(runner, typeof timeout === 'number' ? { timeout } : undefined);
                let disposed = false;
                return {
                    dispose() {
                        if (disposed) {
                            return;
                        }
                        disposed = true;
                        cancelIdleCallback(handle);
                    }
                };
            };
        // check if an input element is focused within the output element
        const checkOutputInputFocus = () => {
            const activeElement = document.activeElement;
            if (!activeElement) {
                return;
            }
            if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
                postNotebookMessage('outputInputFocus', { inputFocused: true });
                activeElement.addEventListener('blur', () => {
                    postNotebookMessage('outputInputFocus', { inputFocused: false });
                }, { once: true });
            }
        };
        const handleInnerClick = (event) => {
            if (!event || !event.view || !event.view.document) {
                return;
            }
            for (const node of event.composedPath()) {
                if (node instanceof HTMLElement && node.classList.contains('output')) {
                    // output
                    postNotebookMessage('outputFocus', {
                        id: node.id,
                    });
                    break;
                }
            }
            for (const node of event.composedPath()) {
                if (node instanceof HTMLAnchorElement && node.href) {
                    if (node.href.startsWith('blob:')) {
                        handleBlobUrlClick(node.href, node.download);
                    }
                    else if (node.href.startsWith('data:')) {
                        handleDataUrl(node.href, node.download);
                    }
                    else if (node.getAttribute('href')?.trim().startsWith('#')) {
                        // Scrolling to location within current doc
                        if (!node.hash) {
                            postNotebookMessage('scroll-to-reveal', { scrollTop: 0 });
                            return;
                        }
                        const targetId = node.hash.substring(1);
                        // Check outer document first
                        let scrollTarget = event.view.document.getElementById(targetId);
                        if (!scrollTarget) {
                            // Fallback to checking preview shadow doms
                            for (const preview of event.view.document.querySelectorAll('.preview')) {
                                scrollTarget = preview.shadowRoot?.getElementById(targetId);
                                if (scrollTarget) {
                                    break;
                                }
                            }
                        }
                        if (scrollTarget) {
                            const scrollTop = scrollTarget.getBoundingClientRect().top + event.view.scrollY;
                            postNotebookMessage('scroll-to-reveal', { scrollTop });
                            return;
                        }
                    }
                    else {
                        const href = node.getAttribute('href');
                        if (href) {
                            postNotebookMessage('clicked-link', { href });
                        }
                    }
                    event.preventDefault();
                    event.stopPropagation();
                    return;
                }
            }
        };
        const handleDataUrl = async (data, downloadName) => {
            postNotebookMessage('clicked-data-url', {
                data,
                downloadName
            });
        };
        const handleBlobUrlClick = async (url, downloadName) => {
            try {
                const response = await fetch(url);
                const blob = await response.blob();
                const reader = new FileReader();
                reader.addEventListener('load', () => {
                    handleDataUrl(reader.result, downloadName);
                });
                reader.readAsDataURL(blob);
            }
            catch (e) {
                console.error(e.message);
            }
        };
        document.body.addEventListener('click', handleInnerClick);
        document.body.addEventListener('focusin', checkOutputInputFocus);
        function createKernelContext() {
            return Object.freeze({
                onDidReceiveKernelMessage: onDidReceiveKernelMessage.event,
                postKernelMessage: (data) => postNotebookMessage('customKernelMessage', { message: data }),
            });
        }
        async function runKernelPreload(url) {
            try {
                return await activateModuleKernelPreload(url);
            }
            catch (e) {
                console.error(e);
                throw e;
            }
        }
        async function activateModuleKernelPreload(url) {
            const module = await __import(url);
            if (!module.activate) {
                console.error(`Notebook preload '${url}' was expected to be a module but it does not export an 'activate' function`);
                return;
            }
            return module.activate(createKernelContext());
        }
        const dimensionUpdater = new class {
            constructor() {
                this.pending = new Map();
            }
            updateHeight(id, height, options) {
                if (!this.pending.size) {
                    setTimeout(() => {
                        this.updateImmediately();
                    }, 0);
                }
                const update = this.pending.get(id);
                if (update && update.isOutput) {
                    this.pending.set(id, {
                        id,
                        height,
                        init: update.init,
                        isOutput: update.isOutput,
                    });
                }
                else {
                    this.pending.set(id, {
                        id,
                        height,
                        ...options,
                    });
                }
            }
            updateImmediately() {
                if (!this.pending.size) {
                    return;
                }
                postNotebookMessage('dimension', {
                    updates: Array.from(this.pending.values())
                });
                this.pending.clear();
            }
        };
        const resizeObserver = new class {
            constructor() {
                this._observedElements = new WeakMap();
                this._observer = new ResizeObserver(entries => {
                    for (const entry of entries) {
                        if (!document.body.contains(entry.target)) {
                            continue;
                        }
                        const observedElementInfo = this._observedElements.get(entry.target);
                        if (!observedElementInfo) {
                            continue;
                        }
                        this.postResizeMessage(observedElementInfo.cellId);
                        if (entry.target.id !== observedElementInfo.id) {
                            continue;
                        }
                        if (!entry.contentRect) {
                            continue;
                        }
                        if (!observedElementInfo.output) {
                            // markup, update directly
                            this.updateHeight(observedElementInfo, entry.target.offsetHeight);
                            continue;
                        }
                        const newHeight = entry.contentRect.height;
                        const shouldUpdatePadding = (newHeight !== 0 && observedElementInfo.lastKnownPadding === 0) ||
                            (newHeight === 0 && observedElementInfo.lastKnownPadding !== 0);
                        if (shouldUpdatePadding) {
                            // Do not update dimension in resize observer
                            window.requestAnimationFrame(() => {
                                if (newHeight !== 0) {
                                    entry.target.style.padding = `${ctx.style.outputNodePadding}px ${ctx.style.outputNodePadding}px ${ctx.style.outputNodePadding}px ${ctx.style.outputNodeLeftPadding}px`;
                                }
                                else {
                                    entry.target.style.padding = `0px`;
                                }
                                this.updateHeight(observedElementInfo, entry.target.offsetHeight);
                            });
                        }
                        else {
                            this.updateHeight(observedElementInfo, entry.target.offsetHeight);
                        }
                    }
                });
            }
            updateHeight(observedElementInfo, offsetHeight) {
                if (observedElementInfo.lastKnownHeight !== offsetHeight) {
                    observedElementInfo.lastKnownHeight = offsetHeight;
                    dimensionUpdater.updateHeight(observedElementInfo.id, offsetHeight, {
                        isOutput: observedElementInfo.output
                    });
                }
            }
            observe(container, id, output, cellId) {
                if (this._observedElements.has(container)) {
                    return;
                }
                this._observedElements.set(container, { id, output, lastKnownPadding: ctx.style.outputNodePadding, lastKnownHeight: -1, cellId });
                this._observer.observe(container);
            }
            postResizeMessage(cellId) {
                // Debounce this callback to only happen after
                // 250 ms. Don't need resize events that often.
                clearTimeout(this._outputResizeTimer);
                this._outputResizeTimer = setTimeout(() => {
                    postNotebookMessage('outputResized', {
                        cellId
                    });
                }, 250);
            }
        };
        function scrollWillGoToParent(event) {
            for (let node = event.target; node; node = node.parentNode) {
                if (!(node instanceof Element) || node.id === 'container' || node.classList.contains('cell_container') || node.classList.contains('markup') || node.classList.contains('output_container')) {
                    return false;
                }
                // scroll up
                if (event.deltaY < 0 && node.scrollTop > 0) {
                    // there is still some content to scroll
                    return true;
                }
                // scroll down
                if (event.deltaY > 0 && node.scrollTop + node.clientHeight < node.scrollHeight) {
                    // per https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight
                    // scrollTop is not rounded but scrollHeight and clientHeight are
                    // so we need to check if the difference is less than some threshold
                    if (node.scrollHeight - node.scrollTop - node.clientHeight < 2) {
                        continue;
                    }
                    // if the node is not scrollable, we can continue. We don't check the computed style always as it's expensive
                    if (window.getComputedStyle(node).overflowY === 'hidden' || window.getComputedStyle(node).overflowY === 'visible') {
                        continue;
                    }
                    return true;
                }
            }
            return false;
        }
        const handleWheel = (event) => {
            if (event.defaultPrevented || scrollWillGoToParent(event)) {
                return;
            }
            postNotebookMessage('did-scroll-wheel', {
                payload: {
                    deltaMode: event.deltaMode,
                    deltaX: event.deltaX,
                    deltaY: event.deltaY,
                    deltaZ: event.deltaZ,
                    wheelDelta: event.wheelDelta,
                    wheelDeltaX: event.wheelDeltaX,
                    wheelDeltaY: event.wheelDeltaY,
                    detail: event.detail,
                    shiftKey: event.shiftKey,
                    type: event.type
                }
            });
        };
        function focusFirstFocusableOrContainerInOutput(cellOrOutputId, alternateId) {
            const cellOutputContainer = (document.getElementById(cellOrOutputId) ??
                alternateId) ? document.getElementById(alternateId) : undefined;
            if (cellOutputContainer) {
                if (cellOutputContainer.contains(document.activeElement)) {
                    return;
                }
                let focusableElement = cellOutputContainer.querySelector('[tabindex="0"], [href], button, input, option, select, textarea');
                if (!focusableElement) {
                    focusableElement = cellOutputContainer;
                    focusableElement.tabIndex = -1;
                }
                focusableElement.focus();
            }
        }
        function createFocusSink(cellId, focusNext) {
            const element = document.createElement('div');
            element.id = `focus-sink-${cellId}`;
            element.tabIndex = 0;
            element.addEventListener('focus', () => {
                postNotebookMessage('focus-editor', {
                    cellId: cellId,
                    focusNext
                });
            });
            return element;
        }
        function _internalHighlightRange(range, tagName = 'mark', attributes = {}) {
            // derived from https://github.com/Treora/dom-highlight-range/blob/master/highlight-range.js
            // Return an array of the text nodes in the range. Split the start and end nodes if required.
            function _textNodesInRange(range) {
                if (!range.startContainer.ownerDocument) {
                    return [];
                }
                // If the start or end node is a text node and only partly in the range, split it.
                if (range.startContainer.nodeType === Node.TEXT_NODE && range.startOffset > 0) {
                    const startContainer = range.startContainer;
                    const endOffset = range.endOffset; // (this may get lost when the splitting the node)
                    const createdNode = startContainer.splitText(range.startOffset);
                    if (range.endContainer === startContainer) {
                        // If the end was in the same container, it will now be in the newly created node.
                        range.setEnd(createdNode, endOffset - range.startOffset);
                    }
                    range.setStart(createdNode, 0);
                }
                if (range.endContainer.nodeType === Node.TEXT_NODE
                    && range.endOffset < range.endContainer.length) {
                    range.endContainer.splitText(range.endOffset);
                }
                // Collect the text nodes.
                const walker = range.startContainer.ownerDocument.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_TEXT, node => range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT);
                walker.currentNode = range.startContainer;
                // // Optimise by skipping nodes that are explicitly outside the range.
                // const NodeTypesWithCharacterOffset = [
                //  Node.TEXT_NODE,
                //  Node.PROCESSING_INSTRUCTION_NODE,
                //  Node.COMMENT_NODE,
                // ];
                // if (!NodeTypesWithCharacterOffset.includes(range.startContainer.nodeType)) {
                //   if (range.startOffset < range.startContainer.childNodes.length) {
                //     walker.currentNode = range.startContainer.childNodes[range.startOffset];
                //   } else {
                //     walker.nextSibling(); // TODO verify this is correct.
                //   }
                // }
                const nodes = [];
                if (walker.currentNode.nodeType === Node.TEXT_NODE) {
                    nodes.push(walker.currentNode);
                }
                while (walker.nextNode() && range.comparePoint(walker.currentNode, 0) !== 1) {
                    if (walker.currentNode.nodeType === Node.TEXT_NODE) {
                        nodes.push(walker.currentNode);
                    }
                }
                return nodes;
            }
            // Replace [node] with <tagName ...attributes>[node]</tagName>
            function wrapNodeInHighlight(node, tagName, attributes) {
                const highlightElement = node.ownerDocument.createElement(tagName);
                Object.keys(attributes).forEach(key => {
                    highlightElement.setAttribute(key, attributes[key]);
                });
                const tempRange = node.ownerDocument.createRange();
                tempRange.selectNode(node);
                tempRange.surroundContents(highlightElement);
                return highlightElement;
            }
            if (range.collapsed) {
                return {
                    remove: () => { },
                    update: () => { }
                };
            }
            // First put all nodes in an array (splits start and end nodes if needed)
            const nodes = _textNodesInRange(range);
            // Highlight each node
            const highlightElements = [];
            for (const nodeIdx in nodes) {
                const highlightElement = wrapNodeInHighlight(nodes[nodeIdx], tagName, attributes);
                highlightElements.push(highlightElement);
            }
            // Remove a highlight element created with wrapNodeInHighlight.
            function _removeHighlight(highlightElement) {
                if (highlightElement.childNodes.length === 1) {
                    highlightElement.parentNode?.replaceChild(highlightElement.firstChild, highlightElement);
                }
                else {
                    // If the highlight somehow contains multiple nodes now, move them all.
                    while (highlightElement.firstChild) {
                        highlightElement.parentNode?.insertBefore(highlightElement.firstChild, highlightElement);
                    }
                    highlightElement.remove();
                }
            }
            // Return a function that cleans up the highlightElements.
            function _removeHighlights() {
                // Remove each of the created highlightElements.
                for (const highlightIdx in highlightElements) {
                    _removeHighlight(highlightElements[highlightIdx]);
                }
            }
            function _updateHighlight(highlightElement, attributes = {}) {
                Object.keys(attributes).forEach(key => {
                    highlightElement.setAttribute(key, attributes[key]);
                });
            }
            function updateHighlights(attributes) {
                for (const highlightIdx in highlightElements) {
                    _updateHighlight(highlightElements[highlightIdx], attributes);
                }
            }
            return {
                remove: _removeHighlights,
                update: updateHighlights
            };
        }
        function selectRange(_range) {
            const sel = window.getSelection();
            if (sel) {
                try {
                    sel.removeAllRanges();
                    const r = document.createRange();
                    r.setStart(_range.startContainer, _range.startOffset);
                    r.setEnd(_range.endContainer, _range.endOffset);
                    sel.addRange(r);
                }
                catch (e) {
                    console.log(e);
                }
            }
        }
        function highlightRange(range, useCustom, tagName = 'mark', attributes = {}) {
            if (useCustom) {
                const ret = _internalHighlightRange(range, tagName, attributes);
                return {
                    range: range,
                    dispose: ret.remove,
                    update: (color, className) => {
                        if (className === undefined) {
                            ret.update({
                                'style': `background-color: ${color}`
                            });
                        }
                        else {
                            ret.update({
                                'class': className
                            });
                        }
                    }
                };
            }
            else {
                window.document.execCommand('hiliteColor', false, matchColor);
                const cloneRange = window.getSelection().getRangeAt(0).cloneRange();
                const _range = {
                    collapsed: cloneRange.collapsed,
                    commonAncestorContainer: cloneRange.commonAncestorContainer,
                    endContainer: cloneRange.endContainer,
                    endOffset: cloneRange.endOffset,
                    startContainer: cloneRange.startContainer,
                    startOffset: cloneRange.startOffset
                };
                return {
                    range: _range,
                    dispose: () => {
                        selectRange(_range);
                        try {
                            document.designMode = 'On';
                            document.execCommand('removeFormat', false, undefined);
                            document.designMode = 'Off';
                            window.getSelection()?.removeAllRanges();
                        }
                        catch (e) {
                            console.log(e);
                        }
                    },
                    update: (color, className) => {
                        selectRange(_range);
                        try {
                            document.designMode = 'On';
                            document.execCommand('removeFormat', false, undefined);
                            window.document.execCommand('hiliteColor', false, color);
                            document.designMode = 'Off';
                            window.getSelection()?.removeAllRanges();
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }
                };
            }
        }
        function createEmitter(listenerChange = () => undefined) {
            const listeners = new Set();
            return {
                fire(data) {
                    for (const listener of [...listeners]) {
                        listener.fn.call(listener.thisArg, data);
                    }
                },
                event(fn, thisArg, disposables) {
                    const listenerObj = { fn, thisArg };
                    const disposable = {
                        dispose: () => {
                            listeners.delete(listenerObj);
                            listenerChange(listeners);
                        },
                    };
                    listeners.add(listenerObj);
                    listenerChange(listeners);
                    if (disposables instanceof Array) {
                        disposables.push(disposable);
                    }
                    else if (disposables) {
                        disposables.add(disposable);
                    }
                    return disposable;
                },
            };
        }
        function showRenderError(errorText, outputNode, errors) {
            outputNode.innerText = errorText;
            const errList = document.createElement('ul');
            for (const result of errors) {
                console.error(result);
                const item = document.createElement('li');
                item.innerText = result.message;
                errList.appendChild(item);
            }
            outputNode.appendChild(errList);
        }
        const outputItemRequests = new class {
            constructor() {
                this._requestPool = 0;
                this._requests = new Map();
            }
            getOutputItem(outputId, mime) {
                const requestId = this._requestPool++;
                let resolve;
                const p = new Promise(r => resolve = r);
                this._requests.set(requestId, { resolve: resolve });
                postNotebookMessage('getOutputItem', { requestId, outputId, mime });
                return p;
            }
            resolveOutputItem(requestId, output) {
                const request = this._requests.get(requestId);
                if (!request) {
                    return;
                }
                this._requests.delete(requestId);
                request.resolve(output);
            }
        };
        let hasWarnedAboutAllOutputItemsProposal = false;
        function createOutputItem(id, mime, metadata, valueBytes, allOutputItemData, appended) {
            function create(id, mime, metadata, valueBytes, appended) {
                return Object.freeze({
                    id,
                    mime,
                    metadata,
                    appendedText() {
                        if (appended) {
                            return textDecoder.decode(appended.valueBytes);
                        }
                        return undefined;
                    },
                    data() {
                        return valueBytes;
                    },
                    text() {
                        return textDecoder.decode(valueBytes);
                    },
                    json() {
                        return JSON.parse(this.text());
                    },
                    blob() {
                        return new Blob([valueBytes], { type: this.mime });
                    },
                    get _allOutputItems() {
                        if (!hasWarnedAboutAllOutputItemsProposal) {
                            hasWarnedAboutAllOutputItemsProposal = true;
                            console.warn(`'_allOutputItems' is proposed API. DO NOT ship an extension that depends on it!`);
                        }
                        return allOutputItemList;
                    },
                });
            }
            const allOutputItemCache = new Map();
            const allOutputItemList = Object.freeze(allOutputItemData.map(outputItem => {
                const mime = outputItem.mime;
                return Object.freeze({
                    mime,
                    getItem() {
                        const existingTask = allOutputItemCache.get(mime);
                        if (existingTask) {
                            return existingTask;
                        }
                        const task = outputItemRequests.getOutputItem(id, mime).then(item => {
                            return item ? create(id, item.mime, metadata, item.valueBytes) : undefined;
                        });
                        allOutputItemCache.set(mime, task);
                        return task;
                    }
                });
            }));
            const item = create(id, mime, metadata, valueBytes, appended);
            allOutputItemCache.set(mime, Promise.resolve(item));
            return item;
        }
        const onDidReceiveKernelMessage = createEmitter();
        const ttPolicy = window.trustedTypes?.createPolicy('notebookRenderer', {
            createHTML: value => value,
            createScript: value => value, // CodeQL [SM03712] The rendered content is provided by renderer extensions, which are responsible for sanitizing their content themselves. The notebook webview is also sandboxed.
        });
        window.addEventListener('wheel', handleWheel);
        const matchColor = window.getComputedStyle(document.getElementById('_defaultColorPalatte')).color;
        const currentMatchColor = window.getComputedStyle(document.getElementById('_defaultColorPalatte')).backgroundColor;
        class JSHighlighter {
            constructor() {
                this._activeHighlightInfo = new Map();
            }
            addHighlights(matches, ownerID) {
                for (let i = matches.length - 1; i >= 0; i--) {
                    const match = matches[i];
                    const ret = highlightRange(match.originalRange, true, 'mark', match.isShadow ? {
                        'style': 'background-color: ' + matchColor + ';',
                    } : {
                        'class': 'find-match'
                    });
                    match.highlightResult = ret;
                }
                const highlightInfo = {
                    matches,
                    currentMatchIndex: -1
                };
                this._activeHighlightInfo.set(ownerID, highlightInfo);
            }
            removeHighlights(ownerID) {
                this._activeHighlightInfo.get(ownerID)?.matches.forEach(match => {
                    match.highlightResult?.dispose();
                });
                this._activeHighlightInfo.delete(ownerID);
            }
            highlightCurrentMatch(index, ownerID) {
                const highlightInfo = this._activeHighlightInfo.get(ownerID);
                if (!highlightInfo) {
                    console.error('Modified current highlight match before adding highlight list.');
                    return;
                }
                const oldMatch = highlightInfo.matches[highlightInfo.currentMatchIndex];
                oldMatch?.highlightResult?.update(matchColor, oldMatch.isShadow ? undefined : 'find-match');
                const match = highlightInfo.matches[index];
                highlightInfo.currentMatchIndex = index;
                const sel = window.getSelection();
                if (!!match && !!sel && match.highlightResult) {
                    let offset = 0;
                    try {
                        const outputOffset = document.getElementById(match.id).getBoundingClientRect().top;
                        const tempRange = document.createRange();
                        tempRange.selectNode(match.highlightResult.range.startContainer);
                        match.highlightResult.range.startContainer.parentElement?.scrollIntoView({ behavior: 'auto', block: 'end', inline: 'nearest' });
                        const rangeOffset = tempRange.getBoundingClientRect().top;
                        tempRange.detach();
                        offset = rangeOffset - outputOffset;
                    }
                    catch (e) {
                        console.error(e);
                    }
                    match.highlightResult?.update(currentMatchColor, match.isShadow ? undefined : 'current-find-match');
                    document.getSelection()?.removeAllRanges();
                    postNotebookMessage('didFindHighlightCurrent', {
                        offset
                    });
                }
            }
            unHighlightCurrentMatch(index, ownerID) {
                const highlightInfo = this._activeHighlightInfo.get(ownerID);
                if (!highlightInfo) {
                    return;
                }
                const oldMatch = highlightInfo.matches[index];
                if (oldMatch && oldMatch.highlightResult) {
                    oldMatch.highlightResult.update(matchColor, oldMatch.isShadow ? undefined : 'find-match');
                }
            }
            dispose() {
                document.getSelection()?.removeAllRanges();
                this._activeHighlightInfo.forEach(highlightInfo => {
                    highlightInfo.matches.forEach(match => {
                        match.highlightResult?.dispose();
                    });
                });
            }
        }
        class CSSHighlighter {
            constructor() {
                this._activeHighlightInfo = new Map();
                this._matchesHighlight = new Highlight();
                this._matchesHighlight.priority = 1;
                this._currentMatchesHighlight = new Highlight();
                this._currentMatchesHighlight.priority = 2;
                CSS.highlights?.set(`find-highlight`, this._matchesHighlight);
                CSS.highlights?.set(`current-find-highlight`, this._currentMatchesHighlight);
            }
            _refreshRegistry(updateMatchesHighlight = true) {
                // for performance reasons, only update the full list of highlights when we need to
                if (updateMatchesHighlight) {
                    this._matchesHighlight.clear();
                }
                this._currentMatchesHighlight.clear();
                this._activeHighlightInfo.forEach((highlightInfo) => {
                    if (updateMatchesHighlight) {
                        for (let i = 0; i < highlightInfo.matches.length; i++) {
                            this._matchesHighlight.add(highlightInfo.matches[i].originalRange);
                        }
                    }
                    if (highlightInfo.currentMatchIndex < highlightInfo.matches.length && highlightInfo.currentMatchIndex >= 0) {
                        this._currentMatchesHighlight.add(highlightInfo.matches[highlightInfo.currentMatchIndex].originalRange);
                    }
                });
            }
            addHighlights(matches, ownerID) {
                for (let i = 0; i < matches.length; i++) {
                    this._matchesHighlight.add(matches[i].originalRange);
                }
                const newEntry = {
                    matches,
                    currentMatchIndex: -1,
                };
                this._activeHighlightInfo.set(ownerID, newEntry);
            }
            highlightCurrentMatch(index, ownerID) {
                const highlightInfo = this._activeHighlightInfo.get(ownerID);
                if (!highlightInfo) {
                    console.error('Modified current highlight match before adding highlight list.');
                    return;
                }
                highlightInfo.currentMatchIndex = index;
                const match = highlightInfo.matches[index];
                if (match) {
                    let offset = 0;
                    try {
                        const outputOffset = document.getElementById(match.id).getBoundingClientRect().top;
                        match.originalRange.startContainer.parentElement?.scrollIntoView({ behavior: 'auto', block: 'end', inline: 'nearest' });
                        const rangeOffset = match.originalRange.getBoundingClientRect().top;
                        offset = rangeOffset - outputOffset;
                        postNotebookMessage('didFindHighlightCurrent', {
                            offset
                        });
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
                this._refreshRegistry(false);
            }
            unHighlightCurrentMatch(index, ownerID) {
                const highlightInfo = this._activeHighlightInfo.get(ownerID);
                if (!highlightInfo) {
                    return;
                }
                highlightInfo.currentMatchIndex = -1;
            }
            removeHighlights(ownerID) {
                this._activeHighlightInfo.delete(ownerID);
                this._refreshRegistry();
            }
            dispose() {
                document.getSelection()?.removeAllRanges();
                this._currentMatchesHighlight.clear();
                this._matchesHighlight.clear();
            }
        }
        const _highlighter = (CSS.highlights) ? new CSSHighlighter() : new JSHighlighter();
        function extractSelectionLine(selection) {
            const range = selection.getRangeAt(0);
            // we need to keep a reference to the old selection range to re-apply later
            const oldRange = range.cloneRange();
            const captureLength = selection.toString().length;
            // use selection API to modify selection to get entire line (the first line if multi-select)
            // collapse selection to start so that the cursor position is at beginning of match
            selection.collapseToStart();
            // extend selection in both directions to select the line
            selection.modify('move', 'backward', 'lineboundary');
            selection.modify('extend', 'forward', 'lineboundary');
            const line = selection.toString();
            // using the original range and the new range, we can find the offset of the match from the line start.
            const rangeStart = getStartOffset(selection.getRangeAt(0), oldRange);
            // line range for match
            const lineRange = {
                start: rangeStart,
                end: rangeStart + captureLength,
            };
            // re-add the old range so that the selection is restored
            selection.removeAllRanges();
            selection.addRange(oldRange);
            return { line, range: lineRange };
        }
        function getStartOffset(lineRange, originalRange) {
            // sometimes, the old and new range are in different DOM elements (ie: when the match is inside of <b></b>)
            // so we need to find the first common ancestor DOM element and find the positions of the old and new range relative to that.
            const firstCommonAncestor = findFirstCommonAncestor(lineRange.startContainer, originalRange.startContainer);
            const selectionOffset = getSelectionOffsetRelativeTo(firstCommonAncestor, lineRange.startContainer) + lineRange.startOffset;
            const textOffset = getSelectionOffsetRelativeTo(firstCommonAncestor, originalRange.startContainer) + originalRange.startOffset;
            return textOffset - selectionOffset;
        }
        // modified from https://stackoverflow.com/a/68583466/16253823
        function findFirstCommonAncestor(nodeA, nodeB) {
            const range = new Range();
            range.setStart(nodeA, 0);
            range.setEnd(nodeB, 0);
            return range.commonAncestorContainer;
        }
        function getTextContentLength(node) {
            let length = 0;
            if (node.nodeType === Node.TEXT_NODE) {
                length += node.textContent?.length || 0;
            }
            else {
                for (const childNode of node.childNodes) {
                    length += getTextContentLength(childNode);
                }
            }
            return length;
        }
        // modified from https://stackoverflow.com/a/48812529/16253823
        function getSelectionOffsetRelativeTo(parentElement, currentNode) {
            if (!currentNode) {
                return 0;
            }
            let offset = 0;
            if (currentNode === parentElement || !parentElement.contains(currentNode)) {
                return offset;
            }
            // count the number of chars before the current dom elem and the start of the dom
            let prevSibling = currentNode.previousSibling;
            while (prevSibling) {
                offset += getTextContentLength(prevSibling);
                prevSibling = prevSibling.previousSibling;
            }
            return offset + getSelectionOffsetRelativeTo(parentElement, currentNode.parentNode);
        }
        const find = (query, options) => {
            let find = true;
            const matches = [];
            const range = document.createRange();
            range.selectNodeContents(document.getElementById('findStart'));
            const sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(range);
            viewModel.toggleDragDropEnabled(false);
            try {
                document.designMode = 'On';
                while (find && matches.length < 500) {
                    find = window.find(query, /* caseSensitive*/ !!options.caseSensitive, 
                    /* backwards*/ false, 
                    /* wrapAround*/ false, 
                    /* wholeWord */ !!options.wholeWord, 
                    /* searchInFrames*/ true, false);
                    if (find) {
                        const selection = window.getSelection();
                        if (!selection) {
                            console.log('no selection');
                            break;
                        }
                        // Markdown preview are rendered in a shadow DOM.
                        if (options.includeMarkup && selection.rangeCount > 0 && selection.getRangeAt(0).startContainer.nodeType === 1
                            && selection.getRangeAt(0).startContainer.classList.contains('markup')) {
                            // markdown preview container
                            const preview = selection.anchorNode?.firstChild;
                            const root = preview.shadowRoot;
                            const shadowSelection = root?.getSelection ? root?.getSelection() : null;
                            // find the match in the shadow dom by checking the selection inside the shadow dom
                            if (shadowSelection && shadowSelection.anchorNode) {
                                matches.push({
                                    type: 'preview',
                                    id: preview.id,
                                    cellId: preview.id,
                                    container: preview,
                                    isShadow: true,
                                    originalRange: shadowSelection.getRangeAt(0),
                                    searchPreviewInfo: options.shouldGetSearchPreviewInfo ? extractSelectionLine(shadowSelection) : undefined,
                                });
                            }
                        }
                        // Outputs might be rendered inside a shadow DOM.
                        if (options.includeOutput && selection.rangeCount > 0 && selection.getRangeAt(0).startContainer.nodeType === 1
                            && selection.getRangeAt(0).startContainer.classList.contains('output_container')) {
                            // output container
                            const cellId = selection.getRangeAt(0).startContainer.parentElement.id;
                            const outputNode = selection.anchorNode?.firstChild;
                            const root = outputNode.shadowRoot;
                            const shadowSelection = root?.getSelection ? root?.getSelection() : null;
                            if (shadowSelection && shadowSelection.anchorNode) {
                                matches.push({
                                    type: 'output',
                                    id: outputNode.id,
                                    cellId: cellId,
                                    container: outputNode,
                                    isShadow: true,
                                    originalRange: shadowSelection.getRangeAt(0),
                                    searchPreviewInfo: options.shouldGetSearchPreviewInfo ? extractSelectionLine(shadowSelection) : undefined,
                                });
                            }
                        }
                        const anchorNode = selection.anchorNode?.parentElement;
                        if (anchorNode) {
                            const lastEl = matches.length ? matches[matches.length - 1] : null;
                            // Optimization: avoid searching for the output container
                            if (lastEl && lastEl.container.contains(anchorNode) && options.includeOutput) {
                                matches.push({
                                    type: lastEl.type,
                                    id: lastEl.id,
                                    cellId: lastEl.cellId,
                                    container: lastEl.container,
                                    isShadow: false,
                                    originalRange: selection.getRangeAt(0),
                                    searchPreviewInfo: options.shouldGetSearchPreviewInfo ? extractSelectionLine(selection) : undefined,
                                });
                            }
                            else {
                                // Traverse up the DOM to find the container
                                for (let node = anchorNode; node; node = node.parentElement) {
                                    if (!(node instanceof Element)) {
                                        break;
                                    }
                                    if (node.classList.contains('output') && options.includeOutput) {
                                        // inside output
                                        const cellId = node.parentElement?.parentElement?.id;
                                        if (cellId) {
                                            matches.push({
                                                type: 'output',
                                                id: node.id,
                                                cellId: cellId,
                                                container: node,
                                                isShadow: false,
                                                originalRange: selection.getRangeAt(0),
                                                searchPreviewInfo: options.shouldGetSearchPreviewInfo ? extractSelectionLine(selection) : undefined,
                                            });
                                        }
                                        break;
                                    }
                                    if (node.id === 'container' || node === document.body) {
                                        break;
                                    }
                                }
                            }
                        }
                        else {
                            break;
                        }
                    }
                }
            }
            catch (e) {
                console.log(e);
            }
            _highlighter.addHighlights(matches, options.ownerID);
            document.getSelection()?.removeAllRanges();
            viewModel.toggleDragDropEnabled(currentOptions.dragAndDropEnabled);
            document.designMode = 'Off';
            postNotebookMessage('didFind', {
                matches: matches.map((match, index) => ({
                    type: match.type,
                    id: match.id,
                    cellId: match.cellId,
                    index,
                    searchPreviewInfo: match.searchPreviewInfo,
                }))
            });
        };
        const copyOutputImage = async (outputId, altOutputId, retries = 5) => {
            if (!document.hasFocus() && retries > 0) {
                // copyImage can be called from outside of the webview, which means this function may be running whilst the webview is gaining focus.
                // Since navigator.clipboard.write requires the document to be focused, we need to wait for focus.
                // We cannot use a listener, as there is a high chance the focus is gained during the setup of the listener resulting in us missing it.
                setTimeout(() => { copyOutputImage(outputId, altOutputId, retries - 1); }, 20);
                return;
            }
            try {
                const image = document.getElementById(outputId)?.querySelector('img')
                    ?? document.getElementById(altOutputId)?.querySelector('img');
                if (image) {
                    await navigator.clipboard.write([new ClipboardItem({
                            'image/png': new Promise((resolve) => {
                                const canvas = document.createElement('canvas');
                                if (canvas !== null) {
                                    canvas.width = image.naturalWidth;
                                    canvas.height = image.naturalHeight;
                                    const context = canvas.getContext('2d');
                                    context?.drawImage(image, 0, 0);
                                }
                                canvas.toBlob((blob) => {
                                    if (blob) {
                                        resolve(blob);
                                    }
                                    canvas.remove();
                                }, 'image/png');
                            })
                        })]);
                }
                else {
                    console.error('Could not find image element to copy for output with id', outputId);
                }
            }
            catch (e) {
                console.error('Could not copy image:', e);
            }
        };
        window.addEventListener('message', async (rawEvent) => {
            const event = rawEvent;
            switch (event.data.type) {
                case 'initializeMarkup': {
                    try {
                        await Promise.all(event.data.cells.map(info => viewModel.ensureMarkupCell(info)));
                    }
                    finally {
                        dimensionUpdater.updateImmediately();
                        postNotebookMessage('initializedMarkup', { requestId: event.data.requestId });
                    }
                    break;
                }
                case 'createMarkupCell':
                    viewModel.ensureMarkupCell(event.data.cell);
                    break;
                case 'showMarkupCell':
                    viewModel.showMarkupCell(event.data.id, event.data.top, event.data.content, event.data.metadata);
                    break;
                case 'hideMarkupCells':
                    for (const id of event.data.ids) {
                        viewModel.hideMarkupCell(id);
                    }
                    break;
                case 'unhideMarkupCells':
                    for (const id of event.data.ids) {
                        viewModel.unhideMarkupCell(id);
                    }
                    break;
                case 'deleteMarkupCell':
                    for (const id of event.data.ids) {
                        viewModel.deleteMarkupCell(id);
                    }
                    break;
                case 'updateSelectedMarkupCells':
                    viewModel.updateSelectedCells(event.data.selectedCellIds);
                    break;
                case 'html': {
                    const data = event.data;
                    if (data.createOnIdle) {
                        outputRunner.enqueueIdle(data.outputId, signal => {
                            // cancel the idle callback if it exists
                            return viewModel.renderOutputCell(data, signal);
                        });
                    }
                    else {
                        outputRunner.enqueue(data.outputId, signal => {
                            // cancel the idle callback if it exists
                            return viewModel.renderOutputCell(data, signal);
                        });
                    }
                    break;
                }
                case 'view-scroll':
                    {
                        // const date = new Date();
                        // console.log('----- will scroll ----  ', date.getMinutes() + ':' + date.getSeconds() + ':' + date.getMilliseconds());
                        event.data.widgets.forEach(widget => {
                            outputRunner.enqueue(widget.outputId, () => {
                                viewModel.updateOutputsScroll([widget]);
                            });
                        });
                        viewModel.updateMarkupScrolls(event.data.markupCells);
                        break;
                    }
                case 'clear':
                    renderers.clearAll();
                    viewModel.clearAll();
                    document.getElementById('container').innerText = '';
                    break;
                case 'clearOutput': {
                    const { cellId, rendererId, outputId } = event.data;
                    outputRunner.cancelOutput(outputId);
                    viewModel.clearOutput(cellId, outputId, rendererId);
                    break;
                }
                case 'hideOutput': {
                    const { cellId, outputId } = event.data;
                    outputRunner.enqueue(outputId, () => {
                        viewModel.hideOutput(cellId);
                    });
                    break;
                }
                case 'showOutput': {
                    const { outputId, cellTop, cellId, content } = event.data;
                    outputRunner.enqueue(outputId, () => {
                        viewModel.showOutput(cellId, outputId, cellTop);
                        if (content) {
                            viewModel.updateAndRerender(cellId, outputId, content);
                        }
                    });
                    break;
                }
                case 'copyImage': {
                    await copyOutputImage(event.data.outputId, event.data.altOutputId);
                    break;
                }
                case 'ack-dimension': {
                    for (const { cellId, outputId, height } of event.data.updates) {
                        viewModel.updateOutputHeight(cellId, outputId, height);
                    }
                    break;
                }
                case 'preload': {
                    const resources = event.data.resources;
                    for (const { uri } of resources) {
                        kernelPreloads.load(uri);
                    }
                    break;
                }
                case 'updateRenderers': {
                    const { rendererData } = event.data;
                    renderers.updateRendererData(rendererData);
                    break;
                }
                case 'focus-output':
                    focusFirstFocusableOrContainerInOutput(event.data.cellOrOutputId, event.data.alternateId);
                    break;
                case 'decorations': {
                    let outputContainer = document.getElementById(event.data.cellId);
                    if (!outputContainer) {
                        viewModel.ensureOutputCell(event.data.cellId, -100000, true);
                        outputContainer = document.getElementById(event.data.cellId);
                    }
                    outputContainer?.classList.add(...event.data.addedClassNames);
                    outputContainer?.classList.remove(...event.data.removedClassNames);
                    break;
                }
                case 'customKernelMessage':
                    onDidReceiveKernelMessage.fire(event.data.message);
                    break;
                case 'customRendererMessage':
                    renderers.getRenderer(event.data.rendererId)?.receiveMessage(event.data.message);
                    break;
                case 'notebookStyles': {
                    const documentStyle = document.documentElement.style;
                    for (let i = documentStyle.length - 1; i >= 0; i--) {
                        const property = documentStyle[i];
                        // Don't remove properties that the webview might have added separately
                        if (property && property.startsWith('--notebook-')) {
                            documentStyle.removeProperty(property);
                        }
                    }
                    // Re-add new properties
                    for (const [name, value] of Object.entries(event.data.styles)) {
                        documentStyle.setProperty(`--${name}`, value);
                    }
                    break;
                }
                case 'notebookOptions':
                    currentOptions = event.data.options;
                    viewModel.toggleDragDropEnabled(currentOptions.dragAndDropEnabled);
                    currentRenderOptions = event.data.renderOptions;
                    settingChange.fire(currentRenderOptions);
                    break;
                case 'tokenizedCodeBlock': {
                    const { codeBlockId, html } = event.data;
                    MarkdownCodeBlock.highlightCodeBlock(codeBlockId, html);
                    break;
                }
                case 'tokenizedStylesChanged': {
                    tokenizationStyle.replaceSync(event.data.css);
                    break;
                }
                case 'find': {
                    _highlighter.removeHighlights(event.data.options.ownerID);
                    find(event.data.query, event.data.options);
                    break;
                }
                case 'findHighlightCurrent': {
                    _highlighter?.highlightCurrentMatch(event.data.index, event.data.ownerID);
                    break;
                }
                case 'findUnHighlightCurrent': {
                    _highlighter?.unHighlightCurrentMatch(event.data.index, event.data.ownerID);
                    break;
                }
                case 'findStop': {
                    _highlighter.removeHighlights(event.data.ownerID);
                    break;
                }
                case 'returnOutputItem': {
                    outputItemRequests.resolveOutputItem(event.data.requestId, event.data.output);
                }
            }
        });
        const renderFallbackErrorName = 'vscode.fallbackToNextRenderer';
        class Renderer {
            constructor(data) {
                this.data = data;
                this._onMessageEvent = createEmitter();
            }
            receiveMessage(message) {
                this._onMessageEvent.fire(message);
            }
            async renderOutputItem(item, element, signal) {
                try {
                    await this.load();
                }
                catch (e) {
                    if (!signal.aborted) {
                        showRenderError(`Error loading renderer '${this.data.id}'`, element, e instanceof Error ? [e] : []);
                    }
                    return;
                }
                if (!this._api) {
                    if (!signal.aborted) {
                        showRenderError(`Renderer '${this.data.id}' does not implement renderOutputItem`, element, []);
                    }
                    return;
                }
                try {
                    const renderStart = performance.now();
                    await this._api.renderOutputItem(item, element, signal);
                    this.postDebugMessage('Rendered output item', { id: item.id, duration: `${performance.now() - renderStart}ms` });
                }
                catch (e) {
                    if (signal.aborted) {
                        return;
                    }
                    if (e instanceof Error && e.name === renderFallbackErrorName) {
                        throw e;
                    }
                    showRenderError(`Error rendering output item using '${this.data.id}'`, element, e instanceof Error ? [e] : []);
                    this.postDebugMessage('Rendering output item failed', { id: item.id, error: e + '' });
                }
            }
            disposeOutputItem(id) {
                this._api?.disposeOutputItem?.(id);
            }
            createRendererContext() {
                const { id, messaging } = this.data;
                const context = {
                    setState: newState => vscode.setState({ ...vscode.getState(), [id]: newState }),
                    getState: () => {
                        const state = vscode.getState();
                        return typeof state === 'object' && state ? state[id] : undefined;
                    },
                    getRenderer: async (id) => {
                        const renderer = renderers.getRenderer(id);
                        if (!renderer) {
                            return undefined;
                        }
                        if (renderer._api) {
                            return renderer._api;
                        }
                        return renderer.load();
                    },
                    workspace: {
                        get isTrusted() { return isWorkspaceTrusted; }
                    },
                    settings: {
                        get lineLimit() { return currentRenderOptions.lineLimit; },
                        get outputScrolling() { return currentRenderOptions.outputScrolling; },
                        get outputWordWrap() { return currentRenderOptions.outputWordWrap; },
                    },
                    get onDidChangeSettings() { return settingChange.event; }
                };
                if (messaging) {
                    context.onDidReceiveMessage = this._onMessageEvent.event;
                    context.postMessage = message => postNotebookMessage('customRendererMessage', { rendererId: id, message });
                }
                return Object.freeze(context);
            }
            load() {
                this._loadPromise ??= this._load();
                return this._loadPromise;
            }
            /** Inner function cached in the _loadPromise(). */
            async _load() {
                this.postDebugMessage('Start loading renderer');
                try {
                    // Preloads need to be loaded before loading renderers.
                    await kernelPreloads.waitForAllCurrent();
                    const importStart = performance.now();
                    const module = await __import(this.data.entrypoint.path);
                    this.postDebugMessage('Imported renderer', { duration: `${performance.now() - importStart}ms` });
                    if (!module) {
                        return;
                    }
                    this._api = await module.activate(this.createRendererContext());
                    this.postDebugMessage('Activated renderer', { duration: `${performance.now() - importStart}ms` });
                    const dependantRenderers = ctx.rendererData
                        .filter(d => d.entrypoint.extends === this.data.id);
                    if (dependantRenderers.length) {
                        this.postDebugMessage('Activating dependant renderers', { dependents: dependantRenderers.map(x => x.id).join(', ') });
                    }
                    // Load all renderers that extend this renderer
                    await Promise.all(dependantRenderers.map(async (d) => {
                        const renderer = renderers.getRenderer(d.id);
                        if (!renderer) {
                            throw new Error(`Could not find extending renderer: ${d.id}`);
                        }
                        try {
                            return await renderer.load();
                        }
                        catch (e) {
                            // Squash any errors extends errors. They won't prevent the renderer
                            // itself from working, so just log them.
                            console.error(e);
                            this.postDebugMessage('Activating dependant renderer failed', { dependent: d.id, error: e + '' });
                            return undefined;
                        }
                    }));
                    return this._api;
                }
                catch (e) {
                    this.postDebugMessage('Loading renderer failed');
                    throw e;
                }
            }
            postDebugMessage(msg, data) {
                postNotebookMessage('logRendererDebugMessage', {
                    message: `[renderer ${this.data.id}] - ${msg}`,
                    data
                });
            }
        }
        const kernelPreloads = new class {
            constructor() {
                this.preloads = new Map();
            }
            /**
             * Returns a promise that resolves when the given preload is activated.
             */
            waitFor(uri) {
                return this.preloads.get(uri) || Promise.resolve(new Error(`Preload not ready: ${uri}`));
            }
            /**
             * Loads a preload.
             * @param uri URI to load from
             * @param originalUri URI to show in an error message if the preload is invalid.
             */
            load(uri) {
                const promise = Promise.all([
                    runKernelPreload(uri),
                    this.waitForAllCurrent(),
                ]);
                this.preloads.set(uri, promise);
                return promise;
            }
            /**
             * Returns a promise that waits for all currently-registered preloads to
             * activate before resolving.
             */
            waitForAllCurrent() {
                return Promise.all([...this.preloads.values()].map(p => p.catch(err => err)));
            }
        };
        const outputRunner = new class {
            constructor() {
                this.outputs = new Map();
                this.pendingOutputCreationRequest = new Map();
            }
            /**
             * Pushes the action onto the list of actions for the given output ID,
             * ensuring that it's run in-order.
             */
            enqueue(outputId, action) {
                this.pendingOutputCreationRequest.get(outputId)?.dispose();
                this.pendingOutputCreationRequest.delete(outputId);
                const record = this.outputs.get(outputId);
                if (!record) {
                    const controller = new AbortController();
                    this.outputs.set(outputId, { abort: controller, queue: new Promise(r => r(action(controller.signal))) });
                }
                else {
                    record.queue = record.queue.then(async (r) => {
                        if (!record.abort.signal.aborted) {
                            await action(record.abort.signal);
                        }
                    });
                }
            }
            enqueueIdle(outputId, action) {
                this.pendingOutputCreationRequest.get(outputId)?.dispose();
                outputRunner.pendingOutputCreationRequest.set(outputId, runWhenIdle(() => {
                    outputRunner.enqueue(outputId, action);
                    outputRunner.pendingOutputCreationRequest.delete(outputId);
                }));
            }
            /**
             * Cancels the rendering of all outputs.
             */
            cancelAll() {
                // Delete all pending idle requests
                this.pendingOutputCreationRequest.forEach(r => r.dispose());
                this.pendingOutputCreationRequest.clear();
                for (const { abort } of this.outputs.values()) {
                    abort.abort();
                }
                this.outputs.clear();
            }
            /**
             * Cancels any ongoing rendering out an output.
             */
            cancelOutput(outputId) {
                // Delete the pending idle request if it exists
                this.pendingOutputCreationRequest.get(outputId)?.dispose();
                this.pendingOutputCreationRequest.delete(outputId);
                const output = this.outputs.get(outputId);
                if (output) {
                    output.abort.abort();
                    this.outputs.delete(outputId);
                }
            }
        };
        const renderers = new class {
            constructor() {
                this._renderers = new Map();
                for (const renderer of ctx.rendererData) {
                    this.addRenderer(renderer);
                }
            }
            getRenderer(id) {
                return this._renderers.get(id);
            }
            rendererEqual(a, b) {
                if (a.id !== b.id || a.entrypoint.path !== b.entrypoint.path || a.entrypoint.extends !== b.entrypoint.extends || a.messaging !== b.messaging) {
                    return false;
                }
                if (a.mimeTypes.length !== b.mimeTypes.length) {
                    return false;
                }
                for (let i = 0; i < a.mimeTypes.length; i++) {
                    if (a.mimeTypes[i] !== b.mimeTypes[i]) {
                        return false;
                    }
                }
                return true;
            }
            updateRendererData(rendererData) {
                const oldKeys = new Set(this._renderers.keys());
                const newKeys = new Set(rendererData.map(d => d.id));
                for (const renderer of rendererData) {
                    const existing = this._renderers.get(renderer.id);
                    if (existing && this.rendererEqual(existing.data, renderer)) {
                        continue;
                    }
                    this.addRenderer(renderer);
                }
                for (const key of oldKeys) {
                    if (!newKeys.has(key)) {
                        this._renderers.delete(key);
                    }
                }
            }
            addRenderer(renderer) {
                this._renderers.set(renderer.id, new Renderer(renderer));
            }
            clearAll() {
                outputRunner.cancelAll();
                for (const renderer of this._renderers.values()) {
                    renderer.disposeOutputItem();
                }
            }
            clearOutput(rendererId, outputId) {
                outputRunner.cancelOutput(outputId);
                this._renderers.get(rendererId)?.disposeOutputItem(outputId);
            }
            async render(item, preferredRendererId, element, signal) {
                const primaryRenderer = this.findRenderer(preferredRendererId, item);
                if (!primaryRenderer) {
                    const errorMessage = (document.documentElement.style.getPropertyValue('--notebook-cell-renderer-not-found-error') || '').replace('$0', () => item.mime);
                    this.showRenderError(item, element, errorMessage);
                    return;
                }
                // Try primary renderer first
                if (!(await this._doRender(item, element, primaryRenderer, signal)).continue) {
                    return;
                }
                // Primary renderer failed in an expected way. Fallback to render the next mime types
                for (const additionalItemData of item._allOutputItems) {
                    if (additionalItemData.mime === item.mime) {
                        continue;
                    }
                    const additionalItem = await additionalItemData.getItem();
                    if (signal.aborted) {
                        return;
                    }
                    if (additionalItem) {
                        const renderer = this.findRenderer(undefined, additionalItem);
                        if (renderer) {
                            if (!(await this._doRender(additionalItem, element, renderer, signal)).continue) {
                                return; // We rendered successfully
                            }
                        }
                    }
                }
                // All renderers have failed and there is nothing left to fallback to
                const errorMessage = (document.documentElement.style.getPropertyValue('--notebook-cell-renderer-fallbacks-exhausted') || '').replace('$0', () => item.mime);
                this.showRenderError(item, element, errorMessage);
            }
            async _doRender(item, element, renderer, signal) {
                try {
                    await renderer.renderOutputItem(item, element, signal);
                    return { continue: false }; // We rendered successfully
                }
                catch (e) {
                    if (signal.aborted) {
                        return { continue: false };
                    }
                    if (e instanceof Error && e.name === renderFallbackErrorName) {
                        return { continue: true };
                    }
                    else {
                        throw e; // Bail and let callers handle unknown errors
                    }
                }
            }
            findRenderer(preferredRendererId, info) {
                let renderer;
                if (typeof preferredRendererId === 'string') {
                    renderer = Array.from(this._renderers.values())
                        .find((renderer) => renderer.data.id === preferredRendererId);
                }
                else {
                    const renderers = Array.from(this._renderers.values())
                        .filter((renderer) => renderer.data.mimeTypes.includes(info.mime) && !renderer.data.entrypoint.extends);
                    if (renderers.length) {
                        // De-prioritize built-in renderers
                        renderers.sort((a, b) => +a.data.isBuiltin - +b.data.isBuiltin);
                        // Use first renderer we find in sorted list
                        renderer = renderers[0];
                    }
                }
                return renderer;
            }
            showRenderError(info, element, errorMessage) {
                const errorContainer = document.createElement('div');
                const error = document.createElement('div');
                error.className = 'no-renderer-error';
                error.innerText = errorMessage;
                const cellText = document.createElement('div');
                cellText.innerText = info.text();
                errorContainer.appendChild(error);
                errorContainer.appendChild(cellText);
                element.innerText = '';
                element.appendChild(errorContainer);
            }
        }();
        const viewModel = new class ViewModel {
            constructor() {
                this._markupCells = new Map();
                this._outputCells = new Map();
            }
            clearAll() {
                for (const cell of this._markupCells.values()) {
                    cell.dispose();
                }
                this._markupCells.clear();
                for (const output of this._outputCells.values()) {
                    output.dispose();
                }
                this._outputCells.clear();
            }
            async createMarkupCell(init, top, visible) {
                const existing = this._markupCells.get(init.cellId);
                if (existing) {
                    console.error(`Trying to create markup that already exists: ${init.cellId}`);
                    return existing;
                }
                const cell = new MarkupCell(init.cellId, init.mime, init.content, top, init.metadata);
                cell.element.style.visibility = visible ? '' : 'hidden';
                this._markupCells.set(init.cellId, cell);
                await cell.ready;
                return cell;
            }
            async ensureMarkupCell(info) {
                let cell = this._markupCells.get(info.cellId);
                if (cell) {
                    cell.element.style.visibility = info.visible ? '' : 'hidden';
                    await cell.updateContentAndRender(info.content, info.metadata);
                }
                else {
                    cell = await this.createMarkupCell(info, info.offset, info.visible);
                }
            }
            deleteMarkupCell(id) {
                const cell = this.getExpectedMarkupCell(id);
                if (cell) {
                    cell.remove();
                    cell.dispose();
                    this._markupCells.delete(id);
                }
            }
            async updateMarkupContent(id, newContent, metadata) {
                const cell = this.getExpectedMarkupCell(id);
                await cell?.updateContentAndRender(newContent, metadata);
            }
            showMarkupCell(id, top, newContent, metadata) {
                const cell = this.getExpectedMarkupCell(id);
                cell?.show(top, newContent, metadata);
            }
            hideMarkupCell(id) {
                const cell = this.getExpectedMarkupCell(id);
                cell?.hide();
            }
            unhideMarkupCell(id) {
                const cell = this.getExpectedMarkupCell(id);
                cell?.unhide();
            }
            getExpectedMarkupCell(id) {
                const cell = this._markupCells.get(id);
                if (!cell) {
                    console.log(`Could not find markup cell '${id}'`);
                    return undefined;
                }
                return cell;
            }
            updateSelectedCells(selectedCellIds) {
                const selectedCellSet = new Set(selectedCellIds);
                for (const cell of this._markupCells.values()) {
                    cell.setSelected(selectedCellSet.has(cell.id));
                }
            }
            toggleDragDropEnabled(dragAndDropEnabled) {
                for (const cell of this._markupCells.values()) {
                    cell.toggleDragDropEnabled(dragAndDropEnabled);
                }
            }
            updateMarkupScrolls(markupCells) {
                for (const { id, top } of markupCells) {
                    const cell = this._markupCells.get(id);
                    if (cell) {
                        cell.element.style.top = `${top}px`;
                    }
                }
            }
            async renderOutputCell(data, signal) {
                const preloadErrors = await Promise.all(data.requiredPreloads.map(p => kernelPreloads.waitFor(p.uri).then(() => undefined, err => err)));
                if (signal.aborted) {
                    return;
                }
                const cellOutput = this.ensureOutputCell(data.cellId, data.cellTop, false);
                return cellOutput.renderOutputElement(data, preloadErrors, signal);
            }
            ensureOutputCell(cellId, cellTop, skipCellTopUpdateIfExist) {
                let cell = this._outputCells.get(cellId);
                const existed = !!cell;
                if (!cell) {
                    cell = new OutputCell(cellId);
                    this._outputCells.set(cellId, cell);
                }
                if (existed && skipCellTopUpdateIfExist) {
                    return cell;
                }
                cell.element.style.top = cellTop + 'px';
                return cell;
            }
            clearOutput(cellId, outputId, rendererId) {
                const cell = this._outputCells.get(cellId);
                cell?.clearOutput(outputId, rendererId);
            }
            showOutput(cellId, outputId, top) {
                const cell = this._outputCells.get(cellId);
                cell?.show(outputId, top);
            }
            updateAndRerender(cellId, outputId, content) {
                const cell = this._outputCells.get(cellId);
                cell?.updateContentAndRerender(outputId, content);
            }
            hideOutput(cellId) {
                const cell = this._outputCells.get(cellId);
                cell?.hide();
            }
            updateOutputHeight(cellId, outputId, height) {
                const cell = this._outputCells.get(cellId);
                cell?.updateOutputHeight(outputId, height);
            }
            updateOutputsScroll(updates) {
                for (const request of updates) {
                    const cell = this._outputCells.get(request.cellId);
                    cell?.updateScroll(request);
                }
            }
        }();
        class MarkdownCodeBlock {
            static { this.pendingCodeBlocksToHighlight = new Map(); }
            static highlightCodeBlock(id, html) {
                const el = MarkdownCodeBlock.pendingCodeBlocksToHighlight.get(id);
                if (!el) {
                    return;
                }
                const trustedHtml = ttPolicy?.createHTML(html) ?? html;
                el.innerHTML = trustedHtml;
                const root = el.getRootNode();
                if (root instanceof ShadowRoot) {
                    if (!root.adoptedStyleSheets.includes(tokenizationStyle)) {
                        root.adoptedStyleSheets.push(tokenizationStyle);
                    }
                }
            }
            static requestHighlightCodeBlock(root) {
                const codeBlocks = [];
                let i = 0;
                for (const el of root.querySelectorAll('.vscode-code-block')) {
                    const lang = el.getAttribute('data-vscode-code-block-lang');
                    if (el.textContent && lang) {
                        const id = `${Date.now()}-${i++}`;
                        codeBlocks.push({ value: el.textContent, lang: lang, id });
                        MarkdownCodeBlock.pendingCodeBlocksToHighlight.set(id, el);
                    }
                }
                return codeBlocks;
            }
        }
        class MarkupCell {
            constructor(id, mime, content, top, metadata) {
                this._isDisposed = false;
                const self = this;
                this.id = id;
                this._content = { value: content, version: 0, metadata: metadata };
                let resolve;
                let reject;
                this.ready = new Promise((res, rej) => {
                    resolve = res;
                    reject = rej;
                });
                let cachedData;
                this.outputItem = Object.freeze({
                    id,
                    mime,
                    get metadata() {
                        return self._content.metadata;
                    },
                    text: () => {
                        return this._content.value;
                    },
                    json: () => {
                        return undefined;
                    },
                    data: () => {
                        if (cachedData?.version === this._content.version) {
                            return cachedData.value;
                        }
                        const data = textEncoder.encode(this._content.value);
                        cachedData = { version: this._content.version, value: data };
                        return data;
                    },
                    blob() {
                        return new Blob([this.data()], { type: this.mime });
                    },
                    _allOutputItems: [{
                            mime,
                            getItem: async () => this.outputItem,
                        }]
                });
                const root = document.getElementById('container');
                const markupCell = document.createElement('div');
                markupCell.className = 'markup';
                markupCell.style.position = 'absolute';
                markupCell.style.width = '100%';
                this.element = document.createElement('div');
                this.element.id = this.id;
                this.element.classList.add('preview');
                this.element.style.position = 'absolute';
                this.element.style.top = top + 'px';
                this.toggleDragDropEnabled(currentOptions.dragAndDropEnabled);
                markupCell.appendChild(this.element);
                root.appendChild(markupCell);
                this.addEventListeners();
                this.updateContentAndRender(this._content.value, this._content.metadata).then(() => {
                    if (!this._isDisposed) {
                        resizeObserver.observe(this.element, this.id, false, this.id);
                    }
                    resolve();
                }, () => reject());
            }
            dispose() {
                this._isDisposed = true;
                this.renderTaskAbort?.abort();
                this.renderTaskAbort = undefined;
            }
            addEventListeners() {
                this.element.addEventListener('dblclick', () => {
                    postNotebookMessage('toggleMarkupPreview', { cellId: this.id });
                });
                this.element.addEventListener('click', e => {
                    postNotebookMessage('clickMarkupCell', {
                        cellId: this.id,
                        altKey: e.altKey,
                        ctrlKey: e.ctrlKey,
                        metaKey: e.metaKey,
                        shiftKey: e.shiftKey,
                    });
                });
                this.element.addEventListener('contextmenu', e => {
                    postNotebookMessage('contextMenuMarkupCell', {
                        cellId: this.id,
                        clientX: e.clientX,
                        clientY: e.clientY,
                    });
                });
                this.element.addEventListener('mouseenter', () => {
                    postNotebookMessage('mouseEnterMarkupCell', { cellId: this.id });
                });
                this.element.addEventListener('mouseleave', () => {
                    postNotebookMessage('mouseLeaveMarkupCell', { cellId: this.id });
                });
                this.element.addEventListener('dragstart', e => {
                    markupCellDragManager.startDrag(e, this.id);
                });
                this.element.addEventListener('drag', e => {
                    markupCellDragManager.updateDrag(e, this.id);
                });
                this.element.addEventListener('dragend', e => {
                    markupCellDragManager.endDrag(e, this.id);
                });
            }
            async updateContentAndRender(newContent, metadata) {
                this._content = { value: newContent, version: this._content.version + 1, metadata };
                this.renderTaskAbort?.abort();
                const controller = new AbortController();
                this.renderTaskAbort = controller;
                try {
                    await renderers.render(this.outputItem, undefined, this.element, this.renderTaskAbort.signal);
                }
                finally {
                    if (this.renderTaskAbort === controller) {
                        this.renderTaskAbort = undefined;
                    }
                }
                const root = (this.element.shadowRoot ?? this.element);
                const html = [];
                for (const child of root.children) {
                    switch (child.tagName) {
                        case 'LINK':
                        case 'SCRIPT':
                        case 'STYLE':
                            // not worth sending over since it will be stripped before rendering
                            break;
                        default:
                            html.push(child.outerHTML);
                            break;
                    }
                }
                const codeBlocks = MarkdownCodeBlock.requestHighlightCodeBlock(root);
                postNotebookMessage('renderedMarkup', {
                    cellId: this.id,
                    html: html.join(''),
                    codeBlocks
                });
                dimensionUpdater.updateHeight(this.id, this.element.offsetHeight, {
                    isOutput: false
                });
            }
            show(top, newContent, metadata) {
                this.element.style.visibility = '';
                this.element.style.top = `${top}px`;
                if (typeof newContent === 'string' || metadata) {
                    this.updateContentAndRender(newContent ?? this._content.value, metadata ?? this._content.metadata);
                }
                else {
                    this.updateMarkupDimensions();
                }
            }
            hide() {
                this.element.style.visibility = 'hidden';
            }
            unhide() {
                this.element.style.visibility = '';
                this.updateMarkupDimensions();
            }
            remove() {
                this.element.remove();
            }
            async updateMarkupDimensions() {
                dimensionUpdater.updateHeight(this.id, this.element.offsetHeight, {
                    isOutput: false
                });
            }
            setSelected(selected) {
                this.element.classList.toggle('selected', selected);
            }
            toggleDragDropEnabled(enabled) {
                if (enabled) {
                    this.element.classList.add('draggable');
                    this.element.setAttribute('draggable', 'true');
                }
                else {
                    this.element.classList.remove('draggable');
                    this.element.removeAttribute('draggable');
                }
            }
        }
        class OutputCell {
            constructor(cellId) {
                this.outputElements = new Map();
                const container = document.getElementById('container');
                const upperWrapperElement = createFocusSink(cellId);
                container.appendChild(upperWrapperElement);
                this.element = document.createElement('div');
                this.element.style.position = 'absolute';
                this.element.style.outline = '0';
                this.element.id = cellId;
                this.element.classList.add('cell_container');
                container.appendChild(this.element);
                this.element = this.element;
                const lowerWrapperElement = createFocusSink(cellId, true);
                container.appendChild(lowerWrapperElement);
            }
            dispose() {
                for (const output of this.outputElements.values()) {
                    output.dispose();
                }
                this.outputElements.clear();
            }
            createOutputElement(data) {
                let outputContainer = this.outputElements.get(data.outputId);
                if (!outputContainer) {
                    outputContainer = new OutputContainer(data.outputId);
                    this.element.appendChild(outputContainer.element);
                    this.outputElements.set(data.outputId, outputContainer);
                }
                return outputContainer.createOutputElement(data.outputId, data.outputOffset, data.left, data.cellId);
            }
            async renderOutputElement(data, preloadErrors, signal) {
                const startTime = Date.now();
                const outputElement /** outputNode */ = this.createOutputElement(data);
                await outputElement.render(data.content, data.rendererId, preloadErrors, signal);
                // don't hide until after this step so that the height is right
                outputElement /** outputNode */.element.style.visibility = data.initiallyHidden ? 'hidden' : '';
                if (!!data.executionId && !!data.rendererId) {
                    postNotebookMessage('notebookPerformanceMessage', { cellId: data.cellId, executionId: data.executionId, duration: Date.now() - startTime, rendererId: data.rendererId });
                }
            }
            clearOutput(outputId, rendererId) {
                const output = this.outputElements.get(outputId);
                output?.clear(rendererId);
                output?.dispose();
                this.outputElements.delete(outputId);
            }
            show(outputId, top) {
                const outputContainer = this.outputElements.get(outputId);
                if (!outputContainer) {
                    return;
                }
                this.element.style.visibility = '';
                this.element.style.top = `${top}px`;
                dimensionUpdater.updateHeight(outputId, outputContainer.element.offsetHeight, {
                    isOutput: true,
                });
            }
            hide() {
                this.element.style.visibility = 'hidden';
            }
            updateContentAndRerender(outputId, content) {
                this.outputElements.get(outputId)?.updateContentAndRender(content);
            }
            updateOutputHeight(outputId, height) {
                this.outputElements.get(outputId)?.updateHeight(height);
            }
            updateScroll(request) {
                this.element.style.top = `${request.cellTop}px`;
                const outputElement = this.outputElements.get(request.outputId);
                if (outputElement) {
                    outputElement.updateScroll(request.outputOffset);
                    if (request.forceDisplay && outputElement.outputNode) {
                        // TODO @rebornix @mjbvz, there is a misalignment here.
                        // We set output visibility on cell container, other than output container or output node itself.
                        outputElement.outputNode.element.style.visibility = '';
                    }
                }
                if (request.forceDisplay) {
                    this.element.style.visibility = '';
                }
            }
        }
        class OutputContainer {
            get outputNode() {
                return this._outputNode;
            }
            constructor(outputId) {
                this.outputId = outputId;
                this.element = document.createElement('div');
                this.element.classList.add('output_container');
                this.element.setAttribute('data-vscode-context', JSON.stringify({ 'preventDefaultContextMenuItems': true }));
                this.element.style.position = 'absolute';
                this.element.style.overflow = 'hidden';
            }
            dispose() {
                this._outputNode?.dispose();
            }
            clear(rendererId) {
                if (rendererId) {
                    renderers.clearOutput(rendererId, this.outputId);
                }
                this.element.remove();
            }
            updateHeight(height) {
                this.element.style.maxHeight = `${height}px`;
                this.element.style.height = `${height}px`;
            }
            updateScroll(outputOffset) {
                this.element.style.top = `${outputOffset}px`;
            }
            createOutputElement(outputId, outputOffset, left, cellId) {
                this.element.innerText = '';
                this.element.style.maxHeight = '0px';
                this.element.style.top = `${outputOffset}px`;
                this._outputNode?.dispose();
                this._outputNode = new OutputElement(outputId, left, cellId);
                this.element.appendChild(this._outputNode.element);
                return this._outputNode;
            }
            updateContentAndRender(content) {
                this._outputNode?.updateAndRerender(content);
            }
        }
        vscode.postMessage({
            __vscode_notebook_message: true,
            type: 'initialized'
        });
        for (const preload of ctx.staticPreloadsData) {
            kernelPreloads.load(preload.entrypoint);
        }
        function postNotebookMessage(type, properties) {
            vscode.postMessage({
                __vscode_notebook_message: true,
                type,
                ...properties
            });
        }
        class OutputElement {
            constructor(outputId, left, cellId) {
                this.outputId = outputId;
                this.cellId = cellId;
                this.hasResizeObserver = false;
                this.element = document.createElement('div');
                this.element.id = outputId;
                this.element.classList.add('output');
                this.element.style.position = 'absolute';
                this.element.style.top = `0px`;
                this.element.style.left = left + 'px';
                this.element.style.padding = `${ctx.style.outputNodePadding}px ${ctx.style.outputNodePadding}px ${ctx.style.outputNodePadding}px ${ctx.style.outputNodeLeftPadding}`;
                this.element.addEventListener('mouseenter', () => {
                    postNotebookMessage('mouseenter', { id: outputId });
                });
                this.element.addEventListener('mouseleave', () => {
                    postNotebookMessage('mouseleave', { id: outputId });
                });
            }
            dispose() {
                this.renderTaskAbort?.abort();
                this.renderTaskAbort = undefined;
            }
            async render(content, preferredRendererId, preloadErrors, signal) {
                this.renderTaskAbort?.abort();
                this.renderTaskAbort = undefined;
                this._content = { preferredRendererId, preloadErrors };
                if (content.type === 0 /* RenderOutputType.Html */) {
                    const trustedHtml = ttPolicy?.createHTML(content.htmlContent) ?? content.htmlContent; // CodeQL [SM03712] The content comes from renderer extensions, not from direct user input.
                    this.element.innerHTML = trustedHtml;
                }
                else if (preloadErrors.some(e => e instanceof Error)) {
                    const errors = preloadErrors.filter((e) => e instanceof Error);
                    showRenderError(`Error loading preloads`, this.element, errors);
                }
                else {
                    const item = createOutputItem(this.outputId, content.output.mime, content.metadata, content.output.valueBytes, content.allOutputs, content.output.appended);
                    const controller = new AbortController();
                    this.renderTaskAbort = controller;
                    // Abort rendering if caller aborts
                    signal?.addEventListener('abort', () => controller.abort());
                    try {
                        await renderers.render(item, preferredRendererId, this.element, controller.signal);
                    }
                    finally {
                        if (this.renderTaskAbort === controller) {
                            this.renderTaskAbort = undefined;
                        }
                    }
                }
                if (!this.hasResizeObserver) {
                    this.hasResizeObserver = true;
                    resizeObserver.observe(this.element, this.outputId, true, this.cellId);
                }
                const offsetHeight = this.element.offsetHeight;
                const cps = document.defaultView.getComputedStyle(this.element);
                if (offsetHeight !== 0 && cps.padding === '0px') {
                    // we set padding to zero if the output height is zero (then we can have a zero-height output DOM node)
                    // thus we need to ensure the padding is accounted when updating the init height of the output
                    dimensionUpdater.updateHeight(this.outputId, offsetHeight + ctx.style.outputNodePadding * 2, {
                        isOutput: true,
                        init: true,
                    });
                    this.element.style.padding = `${ctx.style.outputNodePadding}px ${ctx.style.outputNodePadding}px ${ctx.style.outputNodePadding}px ${ctx.style.outputNodeLeftPadding}`;
                }
                else {
                    dimensionUpdater.updateHeight(this.outputId, this.element.offsetHeight, {
                        isOutput: true,
                        init: true,
                    });
                }
                const root = this.element.shadowRoot ?? this.element;
                const codeBlocks = MarkdownCodeBlock.requestHighlightCodeBlock(root);
                if (codeBlocks.length > 0) {
                    postNotebookMessage('renderedCellOutput', {
                        codeBlocks
                    });
                }
            }
            updateAndRerender(content) {
                if (this._content) {
                    this.render(content, this._content.preferredRendererId, this._content.preloadErrors);
                }
            }
        }
        const markupCellDragManager = new class MarkupCellDragManager {
            constructor() {
                document.addEventListener('dragover', e => {
                    // Allow dropping dragged markup cells
                    e.preventDefault();
                });
                document.addEventListener('drop', e => {
                    e.preventDefault();
                    const drag = this.currentDrag;
                    if (!drag) {
                        return;
                    }
                    this.currentDrag = undefined;
                    postNotebookMessage('cell-drop', {
                        cellId: drag.cellId,
                        ctrlKey: e.ctrlKey,
                        altKey: e.altKey,
                        dragOffsetY: e.clientY,
                    });
                });
            }
            startDrag(e, cellId) {
                if (!e.dataTransfer) {
                    return;
                }
                if (!currentOptions.dragAndDropEnabled) {
                    return;
                }
                this.currentDrag = { cellId, clientY: e.clientY };
                const overlayZIndex = 9999;
                if (!this.dragOverlay) {
                    this.dragOverlay = document.createElement('div');
                    this.dragOverlay.style.position = 'absolute';
                    this.dragOverlay.style.top = '0';
                    this.dragOverlay.style.left = '0';
                    this.dragOverlay.style.zIndex = `${overlayZIndex}`;
                    this.dragOverlay.style.width = '100%';
                    this.dragOverlay.style.height = '100%';
                    this.dragOverlay.style.background = 'transparent';
                    document.body.appendChild(this.dragOverlay);
                }
                e.target.style.zIndex = `${overlayZIndex + 1}`;
                e.target.classList.add('dragging');
                postNotebookMessage('cell-drag-start', {
                    cellId: cellId,
                    dragOffsetY: e.clientY,
                });
                // Continuously send updates while dragging instead of relying on `updateDrag`.
                // This lets us scroll the list based on drag position.
                const trySendDragUpdate = () => {
                    if (this.currentDrag?.cellId !== cellId) {
                        return;
                    }
                    postNotebookMessage('cell-drag', {
                        cellId: cellId,
                        dragOffsetY: this.currentDrag.clientY,
                    });
                    requestAnimationFrame(trySendDragUpdate);
                };
                requestAnimationFrame(trySendDragUpdate);
            }
            updateDrag(e, cellId) {
                if (cellId !== this.currentDrag?.cellId) {
                    this.currentDrag = undefined;
                }
                else {
                    this.currentDrag = { cellId, clientY: e.clientY };
                }
            }
            endDrag(e, cellId) {
                this.currentDrag = undefined;
                e.target.classList.remove('dragging');
                postNotebookMessage('cell-drag-end', {
                    cellId: cellId
                });
                if (this.dragOverlay) {
                    document.body.removeChild(this.dragOverlay);
                    this.dragOverlay = undefined;
                }
                e.target.style.zIndex = '';
            }
        }();
    }
    function preloadsScriptStr(styleValues, options, renderOptions, renderers, preloads, isWorkspaceTrusted, nonce) {
        const ctx = {
            style: styleValues,
            options,
            renderOptions,
            rendererData: renderers,
            staticPreloadsData: preloads,
            isWorkspaceTrusted,
            nonce,
        };
        // TS will try compiling `import()` in webviewPreloads, so use a helper function instead
        // of using `import(...)` directly
        return `
		const __import = (x) => import(x);
		(${webviewPreloads})(
			JSON.parse(decodeURIComponent("${encodeURIComponent(JSON.stringify(ctx))}"))
		)\n//# sourceURL=notebookWebviewPreloads.js\n`;
    }
    exports.preloadsScriptStr = preloadsScriptStr;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vidmlld1ByZWxvYWRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci92aWV3L3JlbmRlcmVycy93ZWJ2aWV3UHJlbG9hZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBcUZoRyxLQUFLLFVBQVUsZUFBZSxDQUFDLEdBQW1CO1FBQ2pELE1BQU0sV0FBVyxHQUFHLElBQUksV0FBVyxFQUFFLENBQUM7UUFDdEMsTUFBTSxXQUFXLEdBQUcsSUFBSSxXQUFXLEVBQUUsQ0FBQztRQUV0QyxJQUFJLGNBQWMsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDO1FBQ2pDLE1BQU0sa0JBQWtCLEdBQUcsR0FBRyxDQUFDLGtCQUFrQixDQUFDO1FBQ2xELElBQUksb0JBQW9CLEdBQUcsR0FBRyxDQUFDLGFBQWEsQ0FBQztRQUM3QyxNQUFNLGFBQWEsR0FBK0IsYUFBYSxFQUFpQixDQUFDO1FBRWpGLE1BQU0sZ0JBQWdCLEdBQUcsVUFBVSxDQUFDLGdCQUFnQixDQUFDO1FBQ3JELE1BQU0sTUFBTSxHQUFHLGdCQUFnQixFQUFFLENBQUM7UUFDbEMsT0FBUSxVQUFrQixDQUFDLGdCQUFnQixDQUFDO1FBRTVDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQztRQUM5QyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUV6RCxNQUFNLFdBQVcsR0FBOEUsQ0FBQyxPQUFPLG1CQUFtQixLQUFLLFVBQVUsSUFBSSxPQUFPLGtCQUFrQixLQUFLLFVBQVUsQ0FBQztZQUNyTCxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTtnQkFDWixVQUFVLENBQUMsR0FBRyxFQUFFO29CQUNmLElBQUksUUFBUSxFQUFFO3dCQUNiLE9BQU87cUJBQ1A7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