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
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/base/common/actions", "vs/base/common/cancellation", "vs/base/common/date", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/filters", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/base/common/network", "vs/platform/label/common/label", "vs/base/common/strings", "vs/base/common/uri", "vs/base/browser/ui/iconLabel/iconLabel", "vs/workbench/browser/parts/views/viewPane", "vs/platform/list/browser/listService", "vs/platform/keybinding/common/keybinding", "vs/platform/contextview/browser/contextView", "vs/platform/contextkey/common/contextkey", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/timeline/common/timeline", "vs/workbench/services/editor/common/editorService", "vs/workbench/common/editor", "vs/platform/commands/common/commands", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/common/views", "vs/platform/progress/common/progress", "vs/platform/opener/common/opener", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/telemetry/common/telemetry", "vs/base/browser/ui/actionbar/actionViewItems", "vs/platform/theme/common/theme", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/workbench/browser/parts/editor/editorCommands", "vs/base/common/types", "vs/base/browser/markdownRenderer", "vs/workbench/services/hover/browser/hover", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/services/extensions/common/extensions", "vs/platform/storage/common/storage", "vs/css!./media/timelinePane"], function (require, exports, nls_1, DOM, actions_1, cancellation_1, date_1, decorators_1, event_1, filters_1, iterator_1, lifecycle_1, network_1, label_1, strings_1, uri_1, iconLabel_1, viewPane_1, listService_1, keybinding_1, contextView_1, contextkey_1, configuration_1, instantiation_1, timeline_1, editorService_1, editor_1, commands_1, themeService_1, themables_1, views_1, progress_1, opener_1, actionbar_1, menuEntryActionViewItem_1, actions_2, telemetry_1, actionViewItems_1, theme_1, codicons_1, iconRegistry_1, editorCommands_1, types_1, markdownRenderer_1, hover_1, uriIdentity_1, extensions_1, storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TimelineListVirtualDelegate = exports.TimelineKeyboardNavigationLabelProvider = exports.TimelineIdentityProvider = exports.TimelinePane = exports.TimelineExcludeSources = exports.TimelineFollowActiveEditorContext = void 0;
    const ItemHeight = 22;
    function isLoadMoreCommand(item) {
        return item instanceof LoadMoreCommand;
    }
    function isTimelineItem(item) {
        return !item?.handle.startsWith('vscode-command:') ?? false;
    }
    function updateRelativeTime(item, lastRelativeTime) {
        item.relativeTime = isTimelineItem(item) ? (0, date_1.fromNow)(item.timestamp) : undefined;
        item.relativeTimeFullWord = isTimelineItem(item) ? (0, date_1.fromNow)(item.timestamp, false, true) : undefined;
        if (lastRelativeTime === undefined || item.relativeTime !== lastRelativeTime) {
            lastRelativeTime = item.relativeTime;
            item.hideRelativeTime = false;
        }
        else {
            item.hideRelativeTime = true;
        }
        return lastRelativeTime;
    }
    class TimelineAggregate {
        constructor(timeline) {
            this._stale = false;
            this._requiresReset = false;
            this.source = timeline.source;
            this.items = timeline.items;
            this._cursor = timeline.paging?.cursor;
            this.lastRenderedIndex = -1;
        }
        get cursor() {
            return this._cursor;
        }
        get more() {
            return this._cursor !== undefined;
        }
        get newest() {
            return this.items[0];
        }
        get oldest() {
            return this.items[this.items.length - 1];
        }
        add(timeline, options) {
            let updated = false;
            if (timeline.items.length !== 0 && this.items.length !== 0) {
                updated = true;
                const ids = new Set();
                const timestamps = new Set();
                for (const item of timeline.items) {
                    if (item.id === undefined) {
                        timestamps.add(item.timestamp);
                    }
                    else {
                        ids.add(item.id);
                    }
                }
                // Remove any duplicate items
                let i = this.items.length;
                let item;
                while (i--) {
                    item = this.items[i];
                    if ((item.id !== undefined && ids.has(item.id)) || timestamps.has(item.timestamp)) {
                        this.items.splice(i, 1);
                    }
                }
                if ((timeline.items[timeline.items.length - 1]?.timestamp ?? 0) >= (this.newest?.timestamp ?? 0)) {
                    this.items.splice(0, 0, ...timeline.items);
                }
                else {
                    this.items.push(...timeline.items);
                }
            }
            else if (timeline.items.length !== 0) {
                updated = true;
                this.items.push(...timeline.items);
            }
            // If we are not requesting more recent items than we have, then update the cursor
            if (options.cursor !== undefined || typeof options.limit !== 'object') {
                this._cursor = timeline.paging?.cursor;
            }
            if (updated) {
                this.items.sort((a, b) => (b.timestamp - a.timestamp) ||
                    (a.source === undefined
                        ? b.source === undefined ? 0 : 1
                        : b.source === undefined ? -1 : b.source.localeCompare(a.source, undefined, { numeric: true, sensitivity: 'base' })));
            }
            return updated;
        }
        get stale() {
            return this._stale;
        }
        get requiresReset() {
            return this._requiresReset;
        }
        invalidate(requiresReset) {
            this._stale = true;
            this._requiresReset = requiresReset;
        }
    }
    class LoadMoreCommand {
        constructor(loading) {
            this.handle = 'vscode-command:loadMore';
            this.timestamp = 0;
            this.description = undefined;
            this.tooltip = undefined;
            this.contextValue = undefined;
            // Make things easier for duck typing
            this.id = undefined;
            this.icon = undefined;
            this.iconDark = undefined;
            this.source = undefined;
            this.relativeTime = undefined;
            this.relativeTimeFullWord = undefined;
            this.hideRelativeTime = undefined;
            this._loading = false;
            this._loading = loading;
        }
        get loading() {
            return this._loading;
        }
        set loading(value) {
            this._loading = value;
        }
        get ariaLabel() {
            return this.label;
        }
        get label() {
            return this.loading ? (0, nls_1.localize)('timeline.loadingMore', "Loading...") : (0, nls_1.localize)('timeline.loadMore', "Load more");
        }
        get themeIcon() {
            return undefined; //this.loading ? { id: 'sync~spin' } : undefined;
        }
    }
    exports.TimelineFollowActiveEditorContext = new contextkey_1.RawContextKey('timelineFollowActiveEditor', true, true);
    exports.TimelineExcludeSources = new contextkey_1.RawContextKey('timelineExcludeSources', '[]', true);
    let TimelinePane = class TimelinePane extends viewPane_1.ViewPane {
        static { this.TITLE = (0, nls_1.localize)('timeline', "Timeline"); }
        constructor(options, keybindingService, contextMenuService, contextKeyService, configurationService, storageService, viewDescriptorService, instantiationService, editorService, commandService, progressService, timelineService, openerService, themeService, telemetryService, labelService, uriIdentityService, extensionService) {
            super({ ...options, titleMenuId: actions_2.MenuId.TimelineTitle }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.storageService = storageService;
            this.editorService = editorService;
            this.commandService = commandService;
            this.progressService = progressService;
            this.timelineService = timelineService;
            this.labelService = labelService;
            this.uriIdentityService = uriIdentityService;
            this.extensionService = extensionService;
            this.pendingRequests = new Map();
            this.timelinesBySource = new Map();
            this._followActiveEditor = true;
            this._isEmpty = true;
            this._maxItemCount = 0;
            this._visibleItemCount = 0;
            this._pendingRefresh = false;
            this.commands = this._register(this.instantiationService.createInstance(TimelinePaneCommands, this));
            this.followActiveEditorContext = exports.TimelineFollowActiveEditorContext.bindTo(this.contextKeyService);
            this.timelineExcludeSourcesContext = exports.TimelineExcludeSources.bindTo(this.contextKeyService);
            // TOOD @lramos15 remove after a few iterations of deprecated setting
            const oldExcludedSourcesSetting = configurationService.getValue('timeline.excludeSources');
            if (oldExcludedSourcesSetting) {
                configurationService.updateValue('timeline.excludeSources', undefined);
                const oldSettingString = JSON.stringify(oldExcludedSourcesSetting);
                this.timelineExcludeSourcesContext.set(oldSettingString);
                // Update the storage service with the setting
                storageService.store('timeline.excludeSources', oldSettingString, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            }
            const excludedSourcesString = storageService.get('timeline.excludeSources', 0 /* StorageScope.PROFILE */, '[]');
            this.timelineExcludeSourcesContext.set(excludedSourcesString);
            this.excludedSources = new Set(JSON.parse(excludedSourcesString));
            this._register(storageService.onDidChangeValue(0 /* StorageScope.PROFILE */, 'timeline.excludeSources', this._register(new lifecycle_1.DisposableStore()))(this.onStorageServiceChanged, this));
            this._register(configurationService.onDidChangeConfiguration(this.onConfigurationChanged, this));
            this._register(timelineService.onDidChangeProviders(this.onProvidersChanged, this));
            this._register(timelineService.onDidChangeTimeline(this.onTimelineChanged, this));
            this._register(timelineService.onDidChangeUri(uri => this.setUri(uri), this));
        }
        get followActiveEditor() {
            return this._followActiveEditor;
        }
        set followActiveEditor(value) {
            if (this._followActiveEditor === value) {
                return;
            }
            this._followActiveEditor = value;
            this.followActiveEditorContext.set(value);
            this.updateFilename(this._filename);
            if (value) {
                this.onActiveEditorChanged();
            }
        }
        get pageOnScroll() {
            if (this._pageOnScroll === undefined) {
                this._pageOnScroll = this.configurationService.getValue('timeline.pageOnScroll') ?? false;
            }
            return this._pageOnScroll;
        }
        get pageSize() {
            let pageSize = this.configurationService.getValue('timeline.pageSize');
            if (pageSize === undefined || pageSize === null) {
                // If we are paging when scrolling, then add an extra item to the end to make sure the "Load more" item is out of view
                pageSize = Math.max(20, Math.floor((this.tree?.renderHeight ?? 0 / ItemHeight) + (this.pageOnScroll ? 1 : -1)));
            }
            return pageSize;
        }
        reset() {
            this.loadTimeline(true);
        }
        setUri(uri) {
            this.setUriCore(uri, true);
        }
        setUriCore(uri, disableFollowing) {
            if (disableFollowing) {
                this.followActiveEditor = false;
            }
            this.uri = uri;
            this.updateFilename(uri ? this.labelService.getUriBasenameLabel(uri) : undefined);
            this.treeRenderer?.setUri(uri);
            this.loadTimeline(true);
        }
        onStorageServiceChanged() {
            const excludedSourcesString = this.storageService.get('timeline.excludeSources', 0 /* StorageScope.PROFILE */, '[]');
            this.timelineExcludeSourcesContext.set(excludedSourcesString);
            this.excludedSources = new Set(JSON.parse(excludedSourcesString));
            const missing = this.timelineService.getSources()
                .filter(({ id }) => !this.excludedSources.has(id) && !this.timelinesBySource.has(id));
            if (missing.length !== 0) {
                this.loadTimeline(true, missing.map(({ id }) => id));
            }
            else {
                this.refresh();
            }
        }
        onConfigurationChanged(e) {
            if (e.affectsConfiguration('timeline.pageOnScroll')) {
                this._pageOnScroll = undefined;
            }
        }
        onActiveEditorChanged() {
            if (!this.followActiveEditor || !this.isExpanded()) {
                return;
            }
            const uri = editor_1.EditorResourceAccessor.getOriginalUri(this.editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            if ((this.uriIdentityService.extUri.isEqual(uri, this.uri) && uri !== undefined) ||
                // Fallback to match on fsPath if we are dealing with files or git schemes
                (uri?.fsPath === this.uri?.fsPath && (uri?.scheme === network_1.Schemas.file || uri?.scheme === 'git') && (this.uri?.scheme === network_1.Schemas.file || this.uri?.scheme === 'git'))) {
                // If the uri hasn't changed, make sure we have valid caches
                for (const source of this.timelineService.getSources()) {
                    if (this.excludedSources.has(source.id)) {
                        continue;
                    }
                    const timeline = this.timelinesBySource.get(source.id);
                    if (timeline !== undefined && !timeline.stale) {
                        continue;
                    }
                    if (timeline !== undefined) {
                        this.updateTimeline(timeline, timeline.requiresReset);
                    }
                    else {
                        this.loadTimelineForSource(source.id, uri, true);
                    }
                }
                return;
            }
            this.setUriCore(uri, false);
        }
        onProvidersChanged(e) {
            if (e.removed) {
                for (const source of e.removed) {
                    this.timelinesBySource.delete(source);
                }
                this.refresh();
            }
            if (e.added) {
                this.loadTimeline(true, e.added);
            }
        }
        onTimelineChanged(e) {
            if (e?.uri === undefined || this.uriIdentityService.extUri.isEqual(e.uri, this.uri)) {
                const timeline = this.timelinesBySource.get(e.id);
                if (timeline === undefined) {
                    return;
                }
                if (this.isBodyVisible()) {
                    this.updateTimeline(timeline, e.reset);
                }
                else {
                    timeline.invalidate(e.reset);
                }
            }
        }
        updateFilename(filename) {
            this._filename = filename;
            if (this.followActiveEditor || !filename) {
                this.updateTitleDescription(filename);
            }
            else {
                this.updateTitleDescription(`${filename} (pinned)`);
            }
        }
        get message() {
            return this._message;
        }
        set message(message) {
            this._message = message;
            this.updateMessage();
        }
        updateMessage() {
            if (this._message !== undefined) {
                this.showMessage(this._message);
            }
            else {
                this.hideMessage();
            }
        }
        showMessage(message) {
            if (!this.$message) {
                return;
            }
            this.$message.classList.remove('hide');
            this.resetMessageElement();
            this.$message.textContent = message;
        }
        hideMessage() {
            this.resetMessageElement();
            this.$message.classList.add('hide');
        }
        resetMessageElement() {
            DOM.clearNode(this.$message);
        }
        get hasVisibleItems() {
            return this._visibleItemCount > 0;
        }
        clear(cancelPending) {
            this._visibleItemCount = 0;
            this._maxItemCount = this.pageSize;
            this.timelinesBySource.clear();
            if (cancelPending) {
                for (const { tokenSource } of this.pendingRequests.values()) {
                    tokenSource.dispose(true);
                }
                this.pendingRequests.clear();
                if (!this.isBodyVisible() && this.tree) {
                    this.tree.setChildren(null, undefined);
                    this._isEmpty = true;
                }
            }
        }
        async loadTimeline(reset, sources) {
            // If we have no source, we are resetting all sources, so cancel everything in flight and reset caches
            if (sources === undefined) {
                if (reset) {
                    this.clear(true);
                }
                // TODO@eamodio: Are these the right the list of schemes to exclude? Is there a better way?
                if (this.uri?.scheme === network_1.Schemas.vscodeSettings || this.uri?.scheme === network_1.Schemas.webviewPanel || this.uri?.scheme === network_1.Schemas.walkThrough) {
                    this.uri = undefined;
                    this.clear(false);
                    this.refresh();
                    return;
                }
                if (this._isEmpty && this.uri !== undefined) {
                    this.setLoadingUriMessage();
                }
            }
            if (this.uri === undefined) {
                this.clear(false);
                this.refresh();
                return;
            }
            if (!this.isBodyVisible()) {
                return;
            }
            let hasPendingRequests = false;
            for (const source of sources ?? this.timelineService.getSources().map(s => s.id)) {
                const requested = this.loadTimelineForSource(source, this.uri, reset);
                if (requested) {
                    hasPendingRequests = true;
                }
            }
            if (!hasPendingRequests) {
                this.refresh();
            }
            else if (this._isEmpty) {
                this.setLoadingUriMessage();
            }
        }
        loadTimelineForSource(source, uri, reset, options) {
            if (this.excludedSources.has(source)) {
                return false;
            }
            const timeline = this.timelinesBySource.get(source);
            // If we are paging, and there are no more items or we have enough cached items to cover the next page,
            // don't bother querying for more
            if (!reset &&
                options?.cursor !== undefined &&
                timeline !== undefined &&
                (!timeline?.more || timeline.items.length > timeline.lastRenderedIndex + this.pageSize)) {
                return false;
            }
            if (options === undefined) {
                options = { cursor: reset ? undefined : timeline?.cursor, limit: this.pageSize };
            }
            let request = this.pendingRequests.get(source);
            if (request !== undefined) {
                options.cursor = request.options.cursor;
                // TODO@eamodio deal with concurrent requests better
                if (typeof options.limit === 'number') {
                    if (typeof request.options.limit === 'number') {
                        options.limit += request.options.limit;
                    }
                    else {
                        options.limit = request.options.limit;
                    }
                }
            }
            request?.tokenSource.dispose(true);
            options.cacheResults = true;
            options.resetCache = reset;
            request = this.timelineService.getTimeline(source, uri, options, new cancellation_1.CancellationTokenSource());
            if (request === undefined) {
                return false;
            }
            this.pendingRequests.set(source, request);
            request.tokenSource.token.onCancellationRequested(() => this.pendingRequests.delete(source));
            this.handleRequest(request);
            return true;
        }
        updateTimeline(timeline, reset) {
            if (reset) {
                this.timelinesBySource.delete(timeline.source);
                // Override the limit, to re-query for all our existing cached (possibly visible) items to keep visual continuity
                const { oldest } = timeline;
                this.loadTimelineForSource(timeline.source, this.uri, true, oldest !== undefined ? { limit: { timestamp: oldest.timestamp, id: oldest.id } } : undefined);
            }
            else {
                // Override the limit, to query for any newer items
                const { newest } = timeline;
                this.loadTimelineForSource(timeline.source, this.uri, false, newest !== undefined ? { limit: { timestamp: newest.timestamp, id: newest.id } } : { limit: this.pageSize });
            }
        }
        async handleRequest(request) {
            let response;
            try {
                response = await this.progressService.withProgress({ location: this.id }, () => request.result);
            }
            finally {
                this.pendingRequests.delete(request.source);
            }
            if (response === undefined ||
                request.tokenSource.token.isCancellationRequested ||
                request.uri !== this.uri) {
                if (this.pendingRequests.size === 0 && this._pendingRefresh) {
                    this.refresh();
                }
                return;
            }
            const source = request.source;
            let updated = false;
            const timeline = this.timelinesBySource.get(source);
            if (timeline === undefined) {
                this.timelinesBySource.set(source, new TimelineAggregate(response));
                updated = true;
            }
            else {
                updated = timeline.add(response, request.options);
            }
            if (updated) {
                this._pendingRefresh = true;
                // If we have visible items already and there are other pending requests, debounce for a bit to wait for other requests
                if (this.hasVisibleItems && this.pendingRequests.size !== 0) {
                    this.refreshDebounced();
                }
                else {
                    this.refresh();
                }
            }
            else if (this.pendingRequests.size === 0) {
                if (this._pendingRefresh) {
                    this.refresh();
                }
                else {
                    this.tree.rerender();
                }
            }
        }
        *getItems() {
            let more = false;
            if (this.uri === undefined || this.timelinesBySource.size === 0) {
                this._visibleItemCount = 0;
                return;
            }
            const maxCount = this._maxItemCount;
            let count = 0;
            if (this.timelinesBySource.size === 1) {
                const [source, timeline] = iterator_1.Iterable.first(this.timelinesBySource);
                timeline.lastRenderedIndex = -1;
                if (this.excludedSources.has(source)) {
                    this._visibleItemCount = 0;
                    return;
                }
                if (timeline.items.length !== 0) {
                    // If we have any items, just say we have one for now -- the real count will be updated below
                    this._visibleItemCount = 1;
                }
                more = timeline.more;
                let lastRelativeTime;
                for (const item of timeline.items) {
                    item.relativeTime = undefined;
                    item.hideRelativeTime = undefined;
                    count++;
                    if (count > maxCount) {
                        more = true;
                        break;
                    }
                    lastRelativeTime = updateRelativeTime(item, lastRelativeTime);
                    yield { element: item };
                }
                timeline.lastRenderedIndex = count - 1;
            }
            else {
                const sources = [];
                let hasAnyItems = false;
                let mostRecentEnd = 0;
                for (const [source, timeline] of this.timelinesBySource) {
                    timeline.lastRenderedIndex = -1;
                    if (this.excludedSources.has(source) || timeline.stale) {
                        continue;
                    }
                    if (timeline.items.length !== 0) {
                        hasAnyItems = true;
                    }
                    if (timeline.more) {
                        more = true;
                        const last = timeline.items[Math.min(maxCount, timeline.items.length - 1)];
                        if (last.timestamp > mostRecentEnd) {
                            mostRecentEnd = last.timestamp;
                        }
                    }
                    const iterator = timeline.items[Symbol.iterator]();
                    sources.push({ timeline: timeline, iterator: iterator, nextItem: iterator.next() });
                }
                this._visibleItemCount = hasAnyItems ? 1 : 0;
                function getNextMostRecentSource() {
                    return sources
                        .filter(source => !source.nextItem.done)
                        .reduce((previous, current) => (previous === undefined || current.nextItem.value.timestamp >= previous.nextItem.value.timestamp) ? current : previous, undefined);
                }
                let lastRelativeTime;
                let nextSource;
                while (nextSource = getNextMostRecentSource()) {
                    nextSource.timeline.lastRenderedIndex++;
                    const item = nextSource.nextItem.value;
                    item.relativeTime = undefined;
                    item.hideRelativeTime = undefined;
                    if (item.timestamp >= mostRecentEnd) {
                        count++;
                        if (count > maxCount) {
                            more = true;
                            break;
                        }
                        lastRelativeTime = updateRelativeTime(item, lastRelativeTime);
                        yield { element: item };
                    }
                    nextSource.nextItem = nextSource.iterator.next();
                }
            }
            this._visibleItemCount = count;
            if (count > 0) {
                if (more) {
                    yield {
                        element: new LoadMoreCommand(this.pendingRequests.size !== 0)
                    };
                }
                else if (this.pendingRequests.size !== 0) {
                    yield {
                        element: new LoadMoreCommand(true)
                    };
                }
            }
        }
        refresh() {
            if (!this.isBodyVisible()) {
                return;
            }
            this.tree.setChildren(null, this.getItems());
            this._isEmpty = !this.hasVisibleItems;
            if (this.uri === undefined) {
                this.updateFilename(undefined);
                this.message = (0, nls_1.localize)('timeline.editorCannotProvideTimeline', "The active editor cannot provide timeline information.");
            }
            else if (this._isEmpty) {
                if (this.pendingRequests.size !== 0) {
                    this.setLoadingUriMessage();
                }
                else {
                    this.updateFilename(this.labelService.getUriBasenameLabel(this.uri));
                    this.message = (0, nls_1.localize)('timeline.noTimelineInfo', "No timeline information was provided.");
                }
            }
            else {
                this.updateFilename(this.labelService.getUriBasenameLabel(this.uri));
                this.message = undefined;
            }
            this._pendingRefresh = false;
        }
        refreshDebounced() {
            this.refresh();
        }
        focus() {
            super.focus();
            this.tree.domFocus();
        }
        setExpanded(expanded) {
            const changed = super.setExpanded(expanded);
            if (changed && this.isBodyVisible()) {
                if (!this.followActiveEditor) {
                    this.setUriCore(this.uri, true);
                }
                else {
                    this.onActiveEditorChanged();
                }
            }
            return changed;
        }
        setVisible(visible) {
            if (visible) {
                this.extensionService.activateByEvent('onView:timeline');
                this.visibilityDisposables = new lifecycle_1.DisposableStore();
                this.editorService.onDidActiveEditorChange(this.onActiveEditorChanged, this, this.visibilityDisposables);
                // Refresh the view on focus to update the relative timestamps
                this.onDidFocus(() => this.refreshDebounced(), this, this.visibilityDisposables);
                super.setVisible(visible);
                this.onActiveEditorChanged();
            }
            else {
                this.visibilityDisposables?.dispose();
                super.setVisible(visible);
            }
        }
        layoutBody(height, width) {
            super.layoutBody(height, width);
            this.tree.layout(height, width);
        }
        renderHeaderTitle(container) {
            super.renderHeaderTitle(container, this.title);
            container.classList.add('timeline-view');
        }
        renderBody(container) {
            super.renderBody(container);
            this.$container = container;
            container.classList.add('tree-explorer-viewlet-tree-view', 'timeline-tree-view');
            this.$message = DOM.append(this.$container, DOM.$('.message'));
            this.$message.classList.add('timeline-subtle');
            this.message = (0, nls_1.localize)('timeline.editorCannotProvideTimeline', "The active editor cannot provide timeline information.");
            this.$tree = document.createElement('div');
            this.$tree.classList.add('customview-tree', 'file-icon-themable-tree', 'hide-arrows');
            // this.treeElement.classList.add('show-file-icons');
            container.appendChild(this.$tree);
            this.treeRenderer = this.instantiationService.createInstance(TimelineTreeRenderer, this.commands);
            this.treeRenderer.onDidScrollToEnd(item => {
                if (this.pageOnScroll) {
                    this.loadMore(item);
                }
            });
            this.tree = this.instantiationService.createInstance(listService_1.WorkbenchObjectTree, 'TimelinePane', this.$tree, new TimelineListVirtualDelegate(), [this.treeRenderer], {
                identityProvider: new TimelineIdentityProvider(),
                accessibilityProvider: {
                    getAriaLabel(element) {
                        if (isLoadMoreCommand(element)) {
                            return element.ariaLabel;
                        }
                        return element.accessibilityInformation ? element.accessibilityInformation.label : (0, nls_1.localize)('timeline.aria.item', "{0}: {1}", element.relativeTimeFullWord ?? '', element.label);
                    },
                    getRole(element) {
                        if (isLoadMoreCommand(element)) {
                            return 'treeitem';
                        }
                        return element.accessibilityInformation && element.accessibilityInformation.role ? element.accessibilityInformation.role : 'treeitem';
                    },
                    getWidgetAriaLabel() {
                        return (0, nls_1.localize)('timeline', "Timeline");
                    }
                },
                keyboardNavigationLabelProvider: new TimelineKeyboardNavigationLabelProvider(),
                multipleSelectionSupport: false,
                overrideStyles: {
                    listBackground: this.getBackgroundColor()
                }
            });
            this._register(this.tree.onContextMenu(e => this.onContextMenu(this.commands, e)));
            this._register(this.tree.onDidChangeSelection(e => this.ensureValidItems()));
            this._register(this.tree.onDidOpen(e => {
                if (!e.browserEvent || !this.ensureValidItems()) {
                    return;
                }
                const selection = this.tree.getSelection();
                let item;
                if (selection.length === 1) {
                    item = selection[0];
                }
                if (item === null) {
                    return;
                }
                if (isTimelineItem(item)) {
                    if (item.command) {
                        let args = item.command.arguments ?? [];
                        if (item.command.id === editorCommands_1.API_OPEN_EDITOR_COMMAND_ID || item.command.id === editorCommands_1.API_OPEN_DIFF_EDITOR_COMMAND_ID) {
                            // Some commands owned by us should receive the
                            // `IOpenEvent` as context to open properly
                            args = [...args, e];
                        }
                        this.commandService.executeCommand(item.command.id, ...args);
                    }
                }
                else if (isLoadMoreCommand(item)) {
                    this.loadMore(item);
                }
            }));
        }
        loadMore(item) {
            if (item.loading) {
                return;
            }
            item.loading = true;
            this.tree.rerender(item);
            if (this.pendingRequests.size !== 0) {
                return;
            }
            this._maxItemCount = this._visibleItemCount + this.pageSize;
            this.loadTimeline(false);
        }
        ensureValidItems() {
            // If we don't have any non-excluded timelines, clear the tree and show the loading message
            if (!this.hasVisibleItems || !this.timelineService.getSources().some(({ id }) => !this.excludedSources.has(id) && this.timelinesBySource.has(id))) {
                this.tree.setChildren(null, undefined);
                this._isEmpty = true;
                this.setLoadingUriMessage();
                return false;
            }
            return true;
        }
        setLoadingUriMessage() {
            const file = this.uri && this.labelService.getUriBasenameLabel(this.uri);
            this.updateFilename(file);
            this.message = file ? (0, nls_1.localize)('timeline.loading', "Loading timeline for {0}...", file) : '';
        }
        onContextMenu(commands, treeEvent) {
            const item = treeEvent.element;
            if (item === null) {
                return;
            }
            const event = treeEvent.browserEvent;
            event.preventDefault();
            event.stopPropagation();
            if (!this.ensureValidItems()) {
                return;
            }
            this.tree.setFocus([item]);
            const actions = commands.getItemContextActions(item);
            if (!actions.length) {
                return;
            }
            this.contextMenuService.showContextMenu({
                getAnchor: () => treeEvent.anchor,
                getActions: () => actions,
                getActionViewItem: (action) => {
                    const keybinding = this.keybindingService.lookupKeybinding(action.id);
                    if (keybinding) {
                        return new actionViewItems_1.ActionViewItem(action, action, { label: true, keybinding: keybinding.getLabel() });
                    }
                    return undefined;
                },
                onHide: (wasCancelled) => {
                    if (wasCancelled) {
                        this.tree.domFocus();
                    }
                },
                getActionsContext: () => ({ uri: this.uri, item: item }),
                actionRunner: new TimelineActionRunner()
            });
        }
    };
    exports.TimelinePane = TimelinePane;
    __decorate([
        (0, decorators_1.debounce)(500)
    ], TimelinePane.prototype, "refreshDebounced", null);
    exports.TimelinePane = TimelinePane = __decorate([
        __param(1, keybinding_1.IKeybindingService),
        __param(2, contextView_1.IContextMenuService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, storage_1.IStorageService),
        __param(6, views_1.IViewDescriptorService),
        __param(7, instantiation_1.IInstantiationService),
        __param(8, editorService_1.IEditorService),
        __param(9, commands_1.ICommandService),
        __param(10, progress_1.IProgressService),
        __param(11, timeline_1.ITimelineService),
        __param(12, opener_1.IOpenerService),
        __param(13, themeService_1.IThemeService),
        __param(14, telemetry_1.ITelemetryService),
        __param(15, label_1.ILabelService),
        __param(16, uriIdentity_1.IUriIdentityService),
        __param(17, extensions_1.IExtensionService)
    ], TimelinePane);
    class TimelineElementTemplate {
        static { this.id = 'TimelineElementTemplate'; }
        constructor(container, actionViewItemProvider, hoverDelegate) {
            container.classList.add('custom-view-tree-node-item');
            this.icon = DOM.append(container, DOM.$('.custom-view-tree-node-item-icon'));
            this.iconLabel = new iconLabel_1.IconLabel(container, { supportHighlights: true, supportIcons: true, hoverDelegate: hoverDelegate });
            const timestampContainer = DOM.append(this.iconLabel.element, DOM.$('.timeline-timestamp-container'));
            this.timestamp = DOM.append(timestampContainer, DOM.$('span.timeline-timestamp'));
            const actionsContainer = DOM.append(this.iconLabel.element, DOM.$('.actions'));
            this.actionBar = new actionbar_1.ActionBar(actionsContainer, { actionViewItemProvider: actionViewItemProvider });
        }
        dispose() {
            this.iconLabel.dispose();
            this.actionBar.dispose();
        }
        reset() {
            this.icon.className = '';
            this.icon.style.backgroundImage = '';
            this.actionBar.clear();
        }
    }
    class TimelineIdentityProvider {
        getId(item) {
            return item.handle;
        }
    }
    exports.TimelineIdentityProvider = TimelineIdentityProvider;
    class TimelineActionRunner extends actions_1.ActionRunner {
        async runAction(action, { uri, item }) {
            if (!isTimelineItem(item)) {
                // TODO@eamodio do we need to do anything else?
                await action.run();
                return;
            }
            await action.run({
                $mid: 12 /* MarshalledId.TimelineActionContext */,
                handle: item.handle,
                source: item.source,
                uri: uri
            }, uri, item.source);
        }
    }
    class TimelineKeyboardNavigationLabelProvider {
        getKeyboardNavigationLabel(element) {
            return element.label;
        }
    }
    exports.TimelineKeyboardNavigationLabelProvider = TimelineKeyboardNavigationLabelProvider;
    class TimelineListVirtualDelegate {
        getHeight(_element) {
            return ItemHeight;
        }
        getTemplateId(element) {
            return TimelineElementTemplate.id;
        }
    }
    exports.TimelineListVirtualDelegate = TimelineListVirtualDelegate;
    let TimelineTreeRenderer = class TimelineTreeRenderer {
        constructor(commands, instantiationService, themeService, hoverService, configurationService) {
            this.commands = commands;
            this.instantiationService = instantiationService;
            this.themeService = themeService;
            this.hoverService = hoverService;
            this.configurationService = configurationService;
            this._onDidScrollToEnd = new event_1.Emitter();
            this.onDidScrollToEnd = this._onDidScrollToEnd.event;
            this.templateId = TimelineElementTemplate.id;
            this.actionViewItemProvider = menuEntryActionViewItem_1.createActionViewItem.bind(undefined, this.instantiationService);
            this._hoverDelegate = {
                showHover: (options) => this.hoverService.showHover(options),
                delay: this.configurationService.getValue('workbench.hover.delay')
            };
        }
        setUri(uri) {
            this.uri = uri;
        }
        renderTemplate(container) {
            return new TimelineElementTemplate(container, this.actionViewItemProvider, this._hoverDelegate);
        }
        renderElement(node, index, template, height) {
            template.reset();
            const { element: item } = node;
            const theme = this.themeService.getColorTheme();
            const icon = theme.type === theme_1.ColorScheme.LIGHT ? item.icon : item.iconDark;
            const iconUrl = icon ? uri_1.URI.revive(icon) : null;
            if (iconUrl) {
                template.icon.className = 'custom-view-tree-node-item-icon';
                template.icon.style.backgroundImage = DOM.asCSSUrl(iconUrl);
                template.icon.style.color = '';
            }
            else if (item.themeIcon) {
                template.icon.className = `custom-view-tree-node-item-icon ${themables_1.ThemeIcon.asClassName(item.themeIcon)}`;
                if (item.themeIcon.color) {
                    template.icon.style.color = theme.getColor(item.themeIcon.color.id)?.toString() ?? '';
                }
                else {
                    template.icon.style.color = '';
                }
                template.icon.style.backgroundImage = '';
            }
            else {
                template.icon.className = 'custom-view-tree-node-item-icon';
                template.icon.style.backgroundImage = '';
                template.icon.style.color = '';
            }
            const tooltip = item.tooltip
                ? (0, types_1.isString)(item.tooltip)
                    ? item.tooltip
                    : { markdown: item.tooltip, markdownNotSupportedFallback: (0, markdownRenderer_1.renderMarkdownAsPlaintext)(item.tooltip) }
                : undefined;
            template.iconLabel.setLabel(item.label, item.description, {
                title: tooltip,
                matches: (0, filters_1.createMatches)(node.filterData)
            });
            template.timestamp.textContent = item.relativeTime ?? '';
            template.timestamp.ariaLabel = item.relativeTimeFullWord ?? '';
            template.timestamp.parentElement.classList.toggle('timeline-timestamp--duplicate', isTimelineItem(item) && item.hideRelativeTime);
            template.actionBar.context = { uri: this.uri, item: item };
            template.actionBar.actionRunner = new TimelineActionRunner();
            template.actionBar.push(this.commands.getItemActions(item), { icon: true, label: false });
            // If we are rendering the load more item, we've scrolled to the end, so trigger an event
            if (isLoadMoreCommand(item)) {
                setTimeout(() => this._onDidScrollToEnd.fire(item), 0);
            }
        }
        disposeTemplate(template) {
            template.dispose();
        }
    };
    TimelineTreeRenderer = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, themeService_1.IThemeService),
        __param(3, hover_1.IHoverService),
        __param(4, configuration_1.IConfigurationService)
    ], TimelineTreeRenderer);
    const timelineRefresh = (0, iconRegistry_1.registerIcon)('timeline-refresh', codicons_1.Codicon.refresh, (0, nls_1.localize)('timelineRefresh', 'Icon for the refresh timeline action.'));
    const timelinePin = (0, iconRegistry_1.registerIcon)('timeline-pin', codicons_1.Codicon.pin, (0, nls_1.localize)('timelinePin', 'Icon for the pin timeline action.'));
    const timelineUnpin = (0, iconRegistry_1.registerIcon)('timeline-unpin', codicons_1.Codicon.pinned, (0, nls_1.localize)('timelineUnpin', 'Icon for the unpin timeline action.'));
    let TimelinePaneCommands = class TimelinePaneCommands extends lifecycle_1.Disposable {
        constructor(pane, timelineService, storageService, contextKeyService, menuService) {
            super();
            this.pane = pane;
            this.timelineService = timelineService;
            this.storageService = storageService;
            this.contextKeyService = contextKeyService;
            this.menuService = menuService;
            this._register(this.sourceDisposables = new lifecycle_1.DisposableStore());
            this._register((0, actions_2.registerAction2)(class extends actions_2.Action2 {
                constructor() {
                    super({
                        id: 'timeline.refresh',
                        title: { value: (0, nls_1.localize)('refresh', "Refresh"), original: 'Refresh' },
                        icon: timelineRefresh,
                        category: { value: (0, nls_1.localize)('timeline', "Timeline"), original: 'Timeline' },
                        menu: {
                            id: actions_2.MenuId.TimelineTitle,
                            group: 'navigation',
                            order: 99,
                        }
                    });
                }
                run(accessor, ...args) {
                    pane.reset();
                }
            }));
            this._register(commands_1.CommandsRegistry.registerCommand('timeline.toggleFollowActiveEditor', (accessor, ...args) => pane.followActiveEditor = !pane.followActiveEditor));
            this._register(actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TimelineTitle, ({
                command: {
                    id: 'timeline.toggleFollowActiveEditor',
                    title: { value: (0, nls_1.localize)('timeline.toggleFollowActiveEditorCommand.follow', "Pin the Current Timeline"), original: 'Pin the Current Timeline' },
                    icon: timelinePin,
                    category: { value: (0, nls_1.localize)('timeline', "Timeline"), original: 'Timeline' },
                },
                group: 'navigation',
                order: 98,
                when: exports.TimelineFollowActiveEditorContext
            })));
            this._register(actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TimelineTitle, ({
                command: {
                    id: 'timeline.toggleFollowActiveEditor',
                    title: { value: (0, nls_1.localize)('timeline.toggleFollowActiveEditorCommand.unfollow', "Unpin the Current Timeline"), original: 'Unpin the Current Timeline' },
                    icon: timelineUnpin,
                    category: { value: (0, nls_1.localize)('timeline', "Timeline"), original: 'Timeline' },
                },
                group: 'navigation',
                order: 98,
                when: exports.TimelineFollowActiveEditorContext.toNegated()
            })));
            this._register(timelineService.onDidChangeProviders(() => this.updateTimelineSourceFilters()));
            this.updateTimelineSourceFilters();
        }
        getItemActions(element) {
            return this.getActions(actions_2.MenuId.TimelineItemContext, { key: 'timelineItem', value: element.contextValue }).primary;
        }
        getItemContextActions(element) {
            return this.getActions(actions_2.MenuId.TimelineItemContext, { key: 'timelineItem', value: element.contextValue }).secondary;
        }
        getActions(menuId, context) {
            const contextKeyService = this.contextKeyService.createOverlay([
                ['view', this.pane.id],
                [context.key, context.value],
            ]);
            const menu = this.menuService.createMenu(menuId, contextKeyService);
            const primary = [];
            const secondary = [];
            const result = { primary, secondary };
            (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(menu, { shouldForwardArgs: true }, result, 'inline');
            menu.dispose();
            return result;
        }
        updateTimelineSourceFilters() {
            this.sourceDisposables.clear();
            const excluded = new Set(JSON.parse(this.storageService.get('timeline.excludeSources', 0 /* StorageScope.PROFILE */, '[]')));
            for (const source of this.timelineService.getSources()) {
                this.sourceDisposables.add((0, actions_2.registerAction2)(class extends actions_2.Action2 {
                    constructor() {
                        super({
                            id: `timeline.toggleExcludeSource:${source.id}`,
                            title: source.label,
                            menu: {
                                id: actions_2.MenuId.TimelineFilterSubMenu,
                                group: 'navigation',
                            },
                            toggled: contextkey_1.ContextKeyExpr.regex(`timelineExcludeSources`, new RegExp(`\\b${(0, strings_1.escapeRegExpCharacters)(source.id)}\\b`)).negate()
                        });
                    }
                    run(accessor, ...args) {
                        if (excluded.has(source.id)) {
                            excluded.delete(source.id);
                        }
                        else {
                            excluded.add(source.id);
                        }
                        const storageService = accessor.get(storage_1.IStorageService);
                        storageService.store('timeline.excludeSources', JSON.stringify([...excluded.keys()]), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
                    }
                }));
            }
        }
    };
    TimelinePaneCommands = __decorate([
        __param(1, timeline_1.ITimelineService),
        __param(2, storage_1.IStorageService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, actions_2.IMenuService)
    ], TimelinePaneCommands);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZWxpbmVQYW5lLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGltZWxpbmUvYnJvd3Nlci90aW1lbGluZVBhbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBdURoRyxNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUM7SUFJdEIsU0FBUyxpQkFBaUIsQ0FBQyxJQUE2QjtRQUN2RCxPQUFPLElBQUksWUFBWSxlQUFlLENBQUM7SUFDeEMsQ0FBQztJQUVELFNBQVMsY0FBYyxDQUFDLElBQTZCO1FBQ3BELE9BQU8sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEtBQUssQ0FBQztJQUM3RCxDQUFDO0lBRUQsU0FBUyxrQkFBa0IsQ0FBQyxJQUFrQixFQUFFLGdCQUFvQztRQUNuRixJQUFJLENBQUMsWUFBWSxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBQSxjQUFPLEVBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDL0UsSUFBSSxDQUFDLG9CQUFvQixHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBQSxjQUFPLEVBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUNwRyxJQUFJLGdCQUFnQixLQUFLLFNBQVMsSUFBSSxJQUFJLENBQUMsWUFBWSxLQUFLLGdCQUFnQixFQUFFO1lBQzdFLGdCQUFnQixHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7WUFDckMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQztTQUM5QjthQUFNO1lBQ04sSUFBSSxDQUFDLGdCQUFnQixHQUFHLElB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