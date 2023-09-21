/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Sob = void 0;
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
                this.c = new Map();
            }
            updateHeight(id, height, options) {
                if (!this.c.size) {
                    setTimeout(() => {
                        this.updateImmediately();
                    }, 0);
                }
                const update = this.c.get(id);
                if (update && update.isOutput) {
                    this.c.set(id, {
                        id,
                        height,
                        init: update.init,
                        isOutput: update.isOutput,
                    });
                }
                else {
                    this.c.set(id, {
                        id,
                        height,
                        ...options,
                    });
                }
            }
            updateImmediately() {
                if (!this.c.size) {
                    return;
                }
                postNotebookMessage('dimension', {
                    updates: Array.from(this.c.values())
                });
                this.c.clear();
            }
        };
        const resizeObserver = new class {
            constructor() {
                this.f = new WeakMap();
                this.c = new ResizeObserver(entries => {
                    for (const entry of entries) {
                        if (!document.body.contains(entry.target)) {
                            continue;
                        }
                        const observedElementInfo = this.f.get(entry.target);
                        if (!observedElementInfo) {
                            continue;
                        }
                        this.j(observedElementInfo.cellId);
                        if (entry.target.id !== observedElementInfo.id) {
                            continue;
                        }
                        if (!entry.contentRect) {
                            continue;
                        }
                        if (!observedElementInfo.output) {
                            // markup, update directly
                            this.h(observedElementInfo, entry.target.offsetHeight);
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
                                this.h(observedElementInfo, entry.target.offsetHeight);
                            });
                        }
                        else {
                            this.h(observedElementInfo, entry.target.offsetHeight);
                        }
                    }
                });
            }
            h(observedElementInfo, offsetHeight) {
                if (observedElementInfo.lastKnownHeight !== offsetHeight) {
                    observedElementInfo.lastKnownHeight = offsetHeight;
                    dimensionUpdater.updateHeight(observedElementInfo.id, offsetHeight, {
                        isOutput: observedElementInfo.output
                    });
                }
            }
            observe(container, id, output, cellId) {
                if (this.f.has(container)) {
                    return;
                }
                this.f.set(container, { id, output, lastKnownPadding: ctx.style.outputNodePadding, lastKnownHeight: -1, cellId });
                this.c.observe(container);
            }
            j(cellId) {
                // Debounce this callback to only happen after
                // 250 ms. Don't need resize events that often.
                clearTimeout(this.g);
                this.g = setTimeout(() => {
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
                this.c = 0;
                this.f = new Map();
            }
            getOutputItem(outputId, mime) {
                const requestId = this.c++;
                let resolve;
                const p = new Promise(r => resolve = r);
                this.f.set(requestId, { resolve: resolve });
                postNotebookMessage('getOutputItem', { requestId, outputId, mime });
                return p;
            }
            resolveOutputItem(requestId, output) {
                const request = this.f.get(requestId);
                if (!request) {
                    return;
                }
                this.f.delete(requestId);
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
                this.c = new Map();
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
                this.c.set(ownerID, highlightInfo);
            }
            removeHighlights(ownerID) {
                this.c.get(ownerID)?.matches.forEach(match => {
                    match.highlightResult?.dispose();
                });
                this.c.delete(ownerID);
            }
            highlightCurrentMatch(index, ownerID) {
                const highlightInfo = this.c.get(ownerID);
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
                const highlightInfo = this.c.get(ownerID);
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
                this.c.forEach(highlightInfo => {
                    highlightInfo.matches.forEach(match => {
                        match.highlightResult?.dispose();
                    });
                });
            }
        }
        class CSSHighlighter {
            constructor() {
                this.c = new Map();
                this.f = new Highlight();
                this.f.priority = 1;
                this.g = new Highlight();
                this.g.priority = 2;
                CSS.highlights?.set(`find-highlight`, this.f);
                CSS.highlights?.set(`current-find-highlight`, this.g);
            }
            _refreshRegistry(updateMatchesHighlight = true) {
                // for performance reasons, only update the full list of highlights when we need to
                if (updateMatchesHighlight) {
                    this.f.clear();
                }
                this.g.clear();
                this.c.forEach((highlightInfo) => {
                    if (updateMatchesHighlight) {
                        for (let i = 0; i < highlightInfo.matches.length; i++) {
                            this.f.add(highlightInfo.matches[i].originalRange);
                        }
                    }
                    if (highlightInfo.currentMatchIndex < highlightInfo.matches.length && highlightInfo.currentMatchIndex >= 0) {
                        this.g.add(highlightInfo.matches[highlightInfo.currentMatchIndex].originalRange);
                    }
                });
            }
            addHighlights(matches, ownerID) {
                for (let i = 0; i < matches.length; i++) {
                    this.f.add(matches[i].originalRange);
                }
                const newEntry = {
                    matches,
                    currentMatchIndex: -1,
                };
                this.c.set(ownerID, newEntry);
            }
            highlightCurrentMatch(index, ownerID) {
                const highlightInfo = this.c.get(ownerID);
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
                const highlightInfo = this.c.get(ownerID);
                if (!highlightInfo) {
                    return;
                }
                highlightInfo.currentMatchIndex = -1;
            }
            removeHighlights(ownerID) {
                this.c.delete(ownerID);
                this._refreshRegistry();
            }
            dispose() {
                document.getSelection()?.removeAllRanges();
                this.g.clear();
                this.f.clear();
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
                this.c = createEmitter();
            }
            receiveMessage(message) {
                this.c.fire(message);
            }
            async renderOutputItem(item, element, signal) {
                try {
                    await this.j();
                }
                catch (e) {
                    if (!signal.aborted) {
                        showRenderError(`Error loading renderer '${this.data.id}'`, element, e instanceof Error ? [e] : []);
                    }
                    return;
                }
                if (!this.g) {
                    if (!signal.aborted) {
                        showRenderError(`Renderer '${this.data.id}' does not implement renderOutputItem`, element, []);
                    }
                    return;
                }
                try {
                    const renderStart = performance.now();
                    await this.g.renderOutputItem(item, element, signal);
                    this.l('Rendered output item', { id: item.id, duration: `${performance.now() - renderStart}ms` });
                }
                catch (e) {
                    if (signal.aborted) {
                        return;
                    }
                    if (e instanceof Error && e.name === renderFallbackErrorName) {
                        throw e;
                    }
                    showRenderError(`Error rendering output item using '${this.data.id}'`, element, e instanceof Error ? [e] : []);
                    this.l('Rendering output item failed', { id: item.id, error: e + '' });
                }
            }
            disposeOutputItem(id) {
                this.g?.disposeOutputItem?.(id);
            }
            h() {
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
                        if (renderer.g) {
                            return renderer.g;
                        }
                        return renderer.j();
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
                    context.onDidReceiveMessage = this.c.event;
                    context.postMessage = message => postNotebookMessage('customRendererMessage', { rendererId: id, message });
                }
                return Object.freeze(context);
            }
            j() {
                this.f ??= this.k();
                return this.f;
            }
            /** Inner function cached in the _loadPromise(). */
            async k() {
                this.l('Start loading renderer');
                try {
                    // Preloads need to be loaded before loading renderers.
                    await kernelPreloads.waitForAllCurrent();
                    const importStart = performance.now();
                    const module = await __import(this.data.entrypoint.path);
                    this.l('Imported renderer', { duration: `${performance.now() - importStart}ms` });
                    if (!module) {
                        return;
                    }
                    this.g = await module.activate(this.h());
                    this.l('Activated renderer', { duration: `${performance.now() - importStart}ms` });
                    const dependantRenderers = ctx.rendererData
                        .filter(d => d.entrypoint.extends === this.data.id);
                    if (dependantRenderers.length) {
                        this.l('Activating dependant renderers', { dependents: dependantRenderers.map(x => x.id).join(', ') });
                    }
                    // Load all renderers that extend this renderer
                    await Promise.all(dependantRenderers.map(async (d) => {
                        const renderer = renderers.getRenderer(d.id);
                        if (!renderer) {
                            throw new Error(`Could not find extending renderer: ${d.id}`);
                        }
                        try {
                            return await renderer.j();
                        }
                        catch (e) {
                            // Squash any errors extends errors. They won't prevent the renderer
                            // itself from working, so just log them.
                            console.error(e);
                            this.l('Activating dependant renderer failed', { dependent: d.id, error: e + '' });
                            return undefined;
                        }
                    }));
                    return this.g;
                }
                catch (e) {
                    this.l('Loading renderer failed');
                    throw e;
                }
            }
            l(msg, data) {
                postNotebookMessage('logRendererDebugMessage', {
                    message: `[renderer ${this.data.id}] - ${msg}`,
                    data
                });
            }
        }
        const kernelPreloads = new class {
            constructor() {
                this.c = new Map();
            }
            /**
             * Returns a promise that resolves when the given preload is activated.
             */
            waitFor(uri) {
                return this.c.get(uri) || Promise.resolve(new Error(`Preload not ready: ${uri}`));
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
                this.c.set(uri, promise);
                return promise;
            }
            /**
             * Returns a promise that waits for all currently-registered preloads to
             * activate before resolving.
             */
            waitForAllCurrent() {
                return Promise.all([...this.c.values()].map(p => p.catch(err => err)));
            }
        };
        const outputRunner = new class {
            constructor() {
                this.c = new Map();
                this.f = new Map();
            }
            /**
             * Pushes the action onto the list of actions for the given output ID,
             * ensuring that it's run in-order.
             */
            enqueue(outputId, action) {
                this.f.get(outputId)?.dispose();
                this.f.delete(outputId);
                const record = this.c.get(outputId);
                if (!record) {
                    const controller = new AbortController();
                    this.c.set(outputId, { abort: controller, queue: new Promise(r => r(action(controller.signal))) });
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
                this.f.get(outputId)?.dispose();
                outputRunner.f.set(outputId, runWhenIdle(() => {
                    outputRunner.enqueue(outputId, action);
                    outputRunner.f.delete(outputId);
                }));
            }
            /**
             * Cancels the rendering of all outputs.
             */
            cancelAll() {
                // Delete all pending idle requests
                this.f.forEach(r => r.dispose());
                this.f.clear();
                for (const { abort } of this.c.values()) {
                    abort.abort();
                }
                this.c.clear();
            }
            /**
             * Cancels any ongoing rendering out an output.
             */
            cancelOutput(outputId) {
                // Delete the pending idle request if it exists
                this.f.get(outputId)?.dispose();
                this.f.delete(outputId);
                const output = this.c.get(outputId);
                if (output) {
                    output.abort.abort();
                    this.c.delete(outputId);
                }
            }
        };
        const renderers = new class {
            constructor() {
                this.c = new Map();
                for (const renderer of ctx.rendererData) {
                    this.g(renderer);
                }
            }
            getRenderer(id) {
                return this.c.get(id);
            }
            f(a, b) {
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
                const oldKeys = new Set(this.c.keys());
                const newKeys = new Set(rendererData.map(d => d.id));
                for (const renderer of rendererData) {
                    const existing = this.c.get(renderer.id);
                    if (existing && this.f(existing.data, renderer)) {
                        continue;
                    }
                    this.g(renderer);
                }
                for (const key of oldKeys) {
                    if (!newKeys.has(key)) {
                        this.c.delete(key);
                    }
                }
            }
            g(renderer) {
                this.c.set(renderer.id, new Renderer(renderer));
            }
            clearAll() {
                outputRunner.cancelAll();
                for (const renderer of this.c.values()) {
                    renderer.disposeOutputItem();
                }
            }
            clearOutput(rendererId, outputId) {
                outputRunner.cancelOutput(outputId);
                this.c.get(rendererId)?.disposeOutputItem(outputId);
            }
            async render(item, preferredRendererId, element, signal) {
                const primaryRenderer = this.j(preferredRendererId, item);
                if (!primaryRenderer) {
                    const errorMessage = (document.documentElement.style.getPropertyValue('--notebook-cell-renderer-not-found-error') || '').replace('$0', () => item.mime);
                    this.k(item, element, errorMessage);
                    return;
                }
                // Try primary renderer first
                if (!(await this.h(item, element, primaryRenderer, signal)).continue) {
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
                        const renderer = this.j(undefined, additionalItem);
                        if (renderer) {
                            if (!(await this.h(additionalItem, element, renderer, signal)).continue) {
                                return; // We rendered successfully
                            }
                        }
                    }
                }
                // All renderers have failed and there is nothing left to fallback to
                const errorMessage = (document.documentElement.style.getPropertyValue('--notebook-cell-renderer-fallbacks-exhausted') || '').replace('$0', () => item.mime);
                this.k(item, element, errorMessage);
            }
            async h(item, element, renderer, signal) {
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
            j(preferredRendererId, info) {
                let renderer;
                if (typeof preferredRendererId === 'string') {
                    renderer = Array.from(this.c.values())
                        .find((renderer) => renderer.data.id === preferredRendererId);
                }
                else {
                    const renderers = Array.from(this.c.values())
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
            k(info, element, errorMessage) {
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
                this.c = new Map();
                this.f = new Map();
            }
            clearAll() {
                for (const cell of this.c.values()) {
                    cell.dispose();
                }
                this.c.clear();
                for (const output of this.f.values()) {
                    output.dispose();
                }
                this.f.clear();
            }
            async g(init, top, visible) {
                const existing = this.c.get(init.cellId);
                if (existing) {
                    console.error(`Trying to create markup that already exists: ${init.cellId}`);
                    return existing;
                }
                const cell = new MarkupCell(init.cellId, init.mime, init.content, top, init.metadata);
                cell.element.style.visibility = visible ? '' : 'hidden';
                this.c.set(init.cellId, cell);
                await cell.ready;
                return cell;
            }
            async ensureMarkupCell(info) {
                let cell = this.c.get(info.cellId);
                if (cell) {
                    cell.element.style.visibility = info.visible ? '' : 'hidden';
                    await cell.updateContentAndRender(info.content, info.metadata);
                }
                else {
                    cell = await this.g(info, info.offset, info.visible);
                }
            }
            deleteMarkupCell(id) {
                const cell = this.h(id);
                if (cell) {
                    cell.remove();
                    cell.dispose();
                    this.c.delete(id);
                }
            }
            async updateMarkupContent(id, newContent, metadata) {
                const cell = this.h(id);
                await cell?.updateContentAndRender(newContent, metadata);
            }
            showMarkupCell(id, top, newContent, metadata) {
                const cell = this.h(id);
                cell?.show(top, newContent, metadata);
            }
            hideMarkupCell(id) {
                const cell = this.h(id);
                cell?.hide();
            }
            unhideMarkupCell(id) {
                const cell = this.h(id);
                cell?.unhide();
            }
            h(id) {
                const cell = this.c.get(id);
                if (!cell) {
                    console.log(`Could not find markup cell '${id}'`);
                    return undefined;
                }
                return cell;
            }
            updateSelectedCells(selectedCellIds) {
                const selectedCellSet = new Set(selectedCellIds);
                for (const cell of this.c.values()) {
                    cell.setSelected(selectedCellSet.has(cell.id));
                }
            }
            toggleDragDropEnabled(dragAndDropEnabled) {
                for (const cell of this.c.values()) {
                    cell.toggleDragDropEnabled(dragAndDropEnabled);
                }
            }
            updateMarkupScrolls(markupCells) {
                for (const { id, top } of markupCells) {
                    const cell = this.c.get(id);
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
                let cell = this.f.get(cellId);
                const existed = !!cell;
                if (!cell) {
                    cell = new OutputCell(cellId);
                    this.f.set(cellId, cell);
                }
                if (existed && skipCellTopUpdateIfExist) {
                    return cell;
                }
                cell.element.style.top = cellTop + 'px';
                return cell;
            }
            clearOutput(cellId, outputId, rendererId) {
                const cell = this.f.get(cellId);
                cell?.clearOutput(outputId, rendererId);
            }
            showOutput(cellId, outputId, top) {
                const cell = this.f.get(cellId);
                cell?.show(outputId, top);
            }
            updateAndRerender(cellId, outputId, content) {
                const cell = this.f.get(cellId);
                cell?.updateContentAndRerender(outputId, content);
            }
            hideOutput(cellId) {
                const cell = this.f.get(cellId);
                cell?.hide();
            }
            updateOutputHeight(cellId, outputId, height) {
                const cell = this.f.get(cellId);
                cell?.updateOutputHeight(outputId, height);
            }
            updateOutputsScroll(updates) {
                for (const request of updates) {
                    const cell = this.f.get(request.cellId);
                    cell?.updateScroll(request);
                }
            }
        }();
        class MarkdownCodeBlock {
            static { this.c = new Map(); }
            static highlightCodeBlock(id, html) {
                const el = MarkdownCodeBlock.c.get(id);
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
                        MarkdownCodeBlock.c.set(id, el);
                    }
                }
                return codeBlocks;
            }
        }
        class MarkupCell {
            constructor(id, mime, content, top, metadata) {
                this.g = false;
                const self = this;
                this.id = id;
                this.f = { value: content, version: 0, metadata: metadata };
                let resolve;
                let reject;
                this.ready = new Promise((res, rej) => {
                    resolve = res;
                    reject = rej;
                });
                let cachedData;
                this.c = Object.freeze({
                    id,
                    mime,
                    get metadata() {
                        return self.f.metadata;
                    },
                    text: () => {
                        return this.f.value;
                    },
                    json: () => {
                        return undefined;
                    },
                    data: () => {
                        if (cachedData?.version === this.f.version) {
                            return cachedData.value;
                        }
                        const data = textEncoder.encode(this.f.value);
                        cachedData = { version: this.f.version, value: data };
                        return data;
                    },
                    blob() {
                        return new Blob([this.data()], { type: this.mime });
                    },
                    _allOutputItems: [{
                            mime,
                            getItem: async () => this.c,
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
                this.j();
                this.updateContentAndRender(this.f.value, this.f.metadata).then(() => {
                    if (!this.g) {
                        resizeObserver.observe(this.element, this.id, false, this.id);
                    }
                    resolve();
                }, () => reject());
            }
            dispose() {
                this.g = true;
                this.h?.abort();
                this.h = undefined;
            }
            j() {
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
                this.f = { value: newContent, version: this.f.version + 1, metadata };
                this.h?.abort();
                const controller = new AbortController();
                this.h = controller;
                try {
                    await renderers.render(this.c, undefined, this.element, this.h.signal);
                }
                finally {
                    if (this.h === controller) {
                        this.h = undefined;
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
                    this.updateContentAndRender(newContent ?? this.f.value, metadata ?? this.f.metadata);
                }
                else {
                    this.k();
                }
            }
            hide() {
                this.element.style.visibility = 'hidden';
            }
            unhide() {
                this.element.style.visibility = '';
                this.k();
            }
            remove() {
                this.element.remove();
            }
            async k() {
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
                this.c = new Map();
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
                for (const output of this.c.values()) {
                    output.dispose();
                }
                this.c.clear();
            }
            f(data) {
                let outputContainer = this.c.get(data.outputId);
                if (!outputContainer) {
                    outputContainer = new OutputContainer(data.outputId);
                    this.element.appendChild(outputContainer.element);
                    this.c.set(data.outputId, outputContainer);
                }
                return outputContainer.createOutputElement(data.outputId, data.outputOffset, data.left, data.cellId);
            }
            async renderOutputElement(data, preloadErrors, signal) {
                const startTime = Date.now();
                const outputElement /** outputNode */ = this.f(data);
                await outputElement.render(data.content, data.rendererId, preloadErrors, signal);
                // don't hide until after this step so that the height is right
                outputElement /** outputNode */.element.style.visibility = data.initiallyHidden ? 'hidden' : '';
                if (!!data.executionId && !!data.rendererId) {
                    postNotebookMessage('notebookPerformanceMessage', { cellId: data.cellId, executionId: data.executionId, duration: Date.now() - startTime, rendererId: data.rendererId });
                }
            }
            clearOutput(outputId, rendererId) {
                const output = this.c.get(outputId);
                output?.clear(rendererId);
                output?.dispose();
                this.c.delete(outputId);
            }
            show(outputId, top) {
                const outputContainer = this.c.get(outputId);
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
                this.c.get(outputId)?.updateContentAndRender(content);
            }
            updateOutputHeight(outputId, height) {
                this.c.get(outputId)?.updateHeight(height);
            }
            updateScroll(request) {
                this.element.style.top = `${request.cellTop}px`;
                const outputElement = this.c.get(request.outputId);
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
                return this.c;
            }
            constructor(f) {
                this.f = f;
                this.element = document.createElement('div');
                this.element.classList.add('output_container');
                this.element.setAttribute('data-vscode-context', JSON.stringify({ 'preventDefaultContextMenuItems': true }));
                this.element.style.position = 'absolute';
                this.element.style.overflow = 'hidden';
            }
            dispose() {
                this.c?.dispose();
            }
            clear(rendererId) {
                if (rendererId) {
                    renderers.clearOutput(rendererId, this.f);
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
                this.c?.dispose();
                this.c = new OutputElement(outputId, left, cellId);
                this.element.appendChild(this.c.element);
                return this.c;
            }
            updateContentAndRender(content) {
                this.c?.updateAndRerender(content);
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
            constructor(h, left, cellId) {
                this.h = h;
                this.cellId = cellId;
                this.f = false;
                this.element = document.createElement('div');
                this.element.id = h;
                this.element.classList.add('output');
                this.element.style.position = 'absolute';
                this.element.style.top = `0px`;
                this.element.style.left = left + 'px';
                this.element.style.padding = `${ctx.style.outputNodePadding}px ${ctx.style.outputNodePadding}px ${ctx.style.outputNodePadding}px ${ctx.style.outputNodeLeftPadding}`;
                this.element.addEventListener('mouseenter', () => {
                    postNotebookMessage('mouseenter', { id: h });
                });
                this.element.addEventListener('mouseleave', () => {
                    postNotebookMessage('mouseleave', { id: h });
                });
            }
            dispose() {
                this.g?.abort();
                this.g = undefined;
            }
            async render(content, preferredRendererId, preloadErrors, signal) {
                this.g?.abort();
                this.g = undefined;
                this.c = { preferredRendererId, preloadErrors };
                if (content.type === 0 /* RenderOutputType.Html */) {
                    const trustedHtml = ttPolicy?.createHTML(content.htmlContent) ?? content.htmlContent; // CodeQL [SM03712] The content comes from renderer extensions, not from direct user input.
                    this.element.innerHTML = trustedHtml;
                }
                else if (preloadErrors.some(e => e instanceof Error)) {
                    const errors = preloadErrors.filter((e) => e instanceof Error);
                    showRenderError(`Error loading preloads`, this.element, errors);
                }
                else {
                    const item = createOutputItem(this.h, content.output.mime, content.metadata, content.output.valueBytes, content.allOutputs, content.output.appended);
                    const controller = new AbortController();
                    this.g = controller;
                    // Abort rendering if caller aborts
                    signal?.addEventListener('abort', () => controller.abort());
                    try {
                        await renderers.render(item, preferredRendererId, this.element, controller.signal);
                    }
                    finally {
                        if (this.g === controller) {
                            this.g = undefined;
                        }
                    }
                }
                if (!this.f) {
                    this.f = true;
                    resizeObserver.observe(this.element, this.h, true, this.cellId);
                }
                const offsetHeight = this.element.offsetHeight;
                const cps = document.defaultView.getComputedStyle(this.element);
                if (offsetHeight !== 0 && cps.padding === '0px') {
                    // we set padding to zero if the output height is zero (then we can have a zero-height output DOM node)
                    // thus we need to ensure the padding is accounted when updating the init height of the output
                    dimensionUpdater.updateHeight(this.h, offsetHeight + ctx.style.outputNodePadding * 2, {
                        isOutput: true,
                        init: true,
                    });
                    this.element.style.padding = `${ctx.style.outputNodePadding}px ${ctx.style.outputNodePadding}px ${ctx.style.outputNodePadding}px ${ctx.style.outputNodeLeftPadding}`;
                }
                else {
                    dimensionUpdater.updateHeight(this.h, this.element.offsetHeight, {
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
                if (this.c) {
                    this.render(content, this.c.preferredRendererId, this.c.preloadErrors);
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
                    const drag = this.c;
                    if (!drag) {
                        return;
                    }
                    this.c = undefined;
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
                this.c = { cellId, clientY: e.clientY };
                const overlayZIndex = 9999;
                if (!this.f) {
                    this.f = document.createElement('div');
                    this.f.style.position = 'absolute';
                    this.f.style.top = '0';
                    this.f.style.left = '0';
                    this.f.style.zIndex = `${overlayZIndex}`;
                    this.f.style.width = '100%';
                    this.f.style.height = '100%';
                    this.f.style.background = 'transparent';
                    document.body.appendChild(this.f);
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
                    if (this.c?.cellId !== cellId) {
                        return;
                    }
                    postNotebookMessage('cell-drag', {
                        cellId: cellId,
                        dragOffsetY: this.c.clientY,
                    });
                    requestAnimationFrame(trySendDragUpdate);
                };
                requestAnimationFrame(trySendDragUpdate);
            }
            updateDrag(e, cellId) {
                if (cellId !== this.c?.cellId) {
                    this.c = undefined;
                }
                else {
                    this.c = { cellId, clientY: e.clientY };
                }
            }
            endDrag(e, cellId) {
                this.c = undefined;
                e.target.classList.remove('dragging');
                postNotebookMessage('cell-drag-end', {
                    cellId: cellId
                });
                if (this.f) {
                    document.body.removeChild(this.f);
                    this.f = undefined;
                }
                e.target.style.zIndex = '';
            }
        }();
    }
    function $Sob(styleValues, options, renderOptions, renderers, preloads, isWorkspaceTrusted, nonce) {
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
    exports.$Sob = $Sob;
});
//# sourceMappingURL=webviewPreloads.js.map