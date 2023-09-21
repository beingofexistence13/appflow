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
define(["require", "exports", "vs/nls!vs/workbench/contrib/timeline/browser/timelinePane", "vs/base/browser/dom", "vs/base/common/actions", "vs/base/common/cancellation", "vs/base/common/date", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/filters", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/base/common/network", "vs/platform/label/common/label", "vs/base/common/strings", "vs/base/common/uri", "vs/base/browser/ui/iconLabel/iconLabel", "vs/workbench/browser/parts/views/viewPane", "vs/platform/list/browser/listService", "vs/platform/keybinding/common/keybinding", "vs/platform/contextview/browser/contextView", "vs/platform/contextkey/common/contextkey", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/timeline/common/timeline", "vs/workbench/services/editor/common/editorService", "vs/workbench/common/editor", "vs/platform/commands/common/commands", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/common/views", "vs/platform/progress/common/progress", "vs/platform/opener/common/opener", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/telemetry/common/telemetry", "vs/base/browser/ui/actionbar/actionViewItems", "vs/platform/theme/common/theme", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/workbench/browser/parts/editor/editorCommands", "vs/base/common/types", "vs/base/browser/markdownRenderer", "vs/workbench/services/hover/browser/hover", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/services/extensions/common/extensions", "vs/platform/storage/common/storage", "vs/css!./media/timelinePane"], function (require, exports, nls_1, DOM, actions_1, cancellation_1, date_1, decorators_1, event_1, filters_1, iterator_1, lifecycle_1, network_1, label_1, strings_1, uri_1, iconLabel_1, viewPane_1, listService_1, keybinding_1, contextView_1, contextkey_1, configuration_1, instantiation_1, timeline_1, editorService_1, editor_1, commands_1, themeService_1, themables_1, views_1, progress_1, opener_1, actionbar_1, menuEntryActionViewItem_1, actions_2, telemetry_1, actionViewItems_1, theme_1, codicons_1, iconRegistry_1, editorCommands_1, types_1, markdownRenderer_1, hover_1, uriIdentity_1, extensions_1, storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$t1b = exports.$s1b = exports.$r1b = exports.$q1b = exports.$p1b = exports.$o1b = void 0;
    const ItemHeight = 22;
    function isLoadMoreCommand(item) {
        return item instanceof LoadMoreCommand;
    }
    function isTimelineItem(item) {
        return !item?.handle.startsWith('vscode-command:') ?? false;
    }
    function updateRelativeTime(item, lastRelativeTime) {
        item.relativeTime = isTimelineItem(item) ? (0, date_1.$6l)(item.timestamp) : undefined;
        item.relativeTimeFullWord = isTimelineItem(item) ? (0, date_1.$6l)(item.timestamp, false, true) : undefined;
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
            this.d = false;
            this.f = false;
            this.source = timeline.source;
            this.items = timeline.items;
            this.c = timeline.paging?.cursor;
            this.lastRenderedIndex = -1;
        }
        get cursor() {
            return this.c;
        }
        get more() {
            return this.c !== undefined;
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
                this.c = timeline.paging?.cursor;
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
            return this.d;
        }
        get requiresReset() {
            return this.f;
        }
        invalidate(requiresReset) {
            this.d = true;
            this.f = requiresReset;
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
            this.c = false;
            this.c = loading;
        }
        get loading() {
            return this.c;
        }
        set loading(value) {
            this.c = value;
        }
        get ariaLabel() {
            return this.label;
        }
        get label() {
            return this.loading ? (0, nls_1.localize)(0, null) : (0, nls_1.localize)(1, null);
        }
        get themeIcon() {
            return undefined; //this.loading ? { id: 'sync~spin' } : undefined;
        }
    }
    exports.$o1b = new contextkey_1.$2i('timelineFollowActiveEditor', true, true);
    exports.$p1b = new contextkey_1.$2i('timelineExcludeSources', '[]', true);
    let $q1b = class $q1b extends viewPane_1.$Ieb {
        static { this.TITLE = (0, nls_1.localize)(2, null); }
        constructor(options, keybindingService, contextMenuService, contextKeyService, configurationService, Xb, viewDescriptorService, instantiationService, Yb, Zb, $b, ac, openerService, themeService, telemetryService, bc, cc, dc) {
            super({ ...options, titleMenuId: actions_2.$Ru.TimelineTitle }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.Xb = Xb;
            this.Yb = Yb;
            this.Zb = Zb;
            this.$b = $b;
            this.ac = ac;
            this.bc = bc;
            this.cc = cc;
            this.dc = dc;
            this.ab = new Map();
            this.sb = new Map();
            this.ec = true;
            this.sc = true;
            this.tc = 0;
            this.uc = 0;
            this.Ac = false;
            this.m = this.B(this.Bb.createInstance(TimelinePaneCommands, this));
            this.r = exports.$o1b.bindTo(this.zb);
            this.t = exports.$p1b.bindTo(this.zb);
            // TOOD @lramos15 remove after a few iterations of deprecated setting
            const oldExcludedSourcesSetting = configurationService.getValue('timeline.excludeSources');
            if (oldExcludedSourcesSetting) {
                configurationService.updateValue('timeline.excludeSources', undefined);
                const oldSettingString = JSON.stringify(oldExcludedSourcesSetting);
                this.t.set(oldSettingString);
                // Update the storage service with the setting
                Xb.store('timeline.excludeSources', oldSettingString, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            }
            const excludedSourcesString = Xb.get('timeline.excludeSources', 0 /* StorageScope.PROFILE */, '[]');
            this.t.set(excludedSourcesString);
            this.L = new Set(JSON.parse(excludedSourcesString));
            this.B(Xb.onDidChangeValue(0 /* StorageScope.PROFILE */, 'timeline.excludeSources', this.B(new lifecycle_1.$jc()))(this.hc, this));
            this.B(configurationService.onDidChangeConfiguration(this.ic, this));
            this.B(ac.onDidChangeProviders(this.kc, this));
            this.B(ac.onDidChangeTimeline(this.lc, this));
            this.B(ac.onDidChangeUri(uri => this.setUri(uri), this));
        }
        get followActiveEditor() {
            return this.ec;
        }
        set followActiveEditor(value) {
            if (this.ec === value) {
                return;
            }
            this.ec = value;
            this.r.set(value);
            this.updateFilename(this.mc);
            if (value) {
                this.jc();
            }
        }
        get pageOnScroll() {
            if (this.fc === undefined) {
                this.fc = this.yb.getValue('timeline.pageOnScroll') ?? false;
            }
            return this.fc;
        }
        get pageSize() {
            let pageSize = this.yb.getValue('timeline.pageSize');
            if (pageSize === undefined || pageSize === null) {
                // If we are paging when scrolling, then add an extra item to the end to make sure the "Load more" item is out of view
                pageSize = Math.max(20, Math.floor((this.h?.renderHeight ?? 0 / ItemHeight) + (this.pageOnScroll ? 1 : -1)));
            }
            return pageSize;
        }
        reset() {
            this.xc(true);
        }
        setUri(uri) {
            this.gc(uri, true);
        }
        gc(uri, disableFollowing) {
            if (disableFollowing) {
                this.followActiveEditor = false;
            }
            this.Wb = uri;
            this.updateFilename(uri ? this.bc.getUriBasenameLabel(uri) : undefined);
            this.j?.setUri(uri);
            this.xc(true);
        }
        hc() {
            const excludedSourcesString = this.Xb.get('timeline.excludeSources', 0 /* StorageScope.PROFILE */, '[]');
            this.t.set(excludedSourcesString);
            this.L = new Set(JSON.parse(excludedSourcesString));
            const missing = this.ac.getSources()
                .filter(({ id }) => !this.L.has(id) && !this.sb.has(id));
            if (missing.length !== 0) {
                this.xc(true, missing.map(({ id }) => id));
            }
            else {
                this.Dc();
            }
        }
        ic(e) {
            if (e.affectsConfiguration('timeline.pageOnScroll')) {
                this.fc = undefined;
            }
        }
        jc() {
            if (!this.followActiveEditor || !this.isExpanded()) {
                return;
            }
            const uri = editor_1.$3E.getOriginalUri(this.Yb.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            if ((this.cc.extUri.isEqual(uri, this.Wb) && uri !== undefined) ||
                // Fallback to match on fsPath if we are dealing with files or git schemes
                (uri?.fsPath === this.Wb?.fsPath && (uri?.scheme === network_1.Schemas.file || uri?.scheme === 'git') && (this.Wb?.scheme === network_1.Schemas.file || this.Wb?.scheme === 'git'))) {
                // If the uri hasn't changed, make sure we have valid caches
                for (const source of this.ac.getSources()) {
                    if (this.L.has(source.id)) {
                        continue;
                    }
                    const timeline = this.sb.get(source.id);
                    if (timeline !== undefined && !timeline.stale) {
                        continue;
                    }
                    if (timeline !== undefined) {
                        this.zc(timeline, timeline.requiresReset);
                    }
                    else {
                        this.yc(source.id, uri, true);
                    }
                }
                return;
            }
            this.gc(uri, false);
        }
        kc(e) {
            if (e.removed) {
                for (const source of e.removed) {
                    this.sb.delete(source);
                }
                this.Dc();
            }
            if (e.added) {
                this.xc(true, e.added);
            }
        }
        lc(e) {
            if (e?.uri === undefined || this.cc.extUri.isEqual(e.uri, this.Wb)) {
                const timeline = this.sb.get(e.id);
                if (timeline === undefined) {
                    return;
                }
                if (this.isBodyVisible()) {
                    this.zc(timeline, e.reset);
                }
                else {
                    timeline.invalidate(e.reset);
                }
            }
        }
        updateFilename(filename) {
            this.mc = filename;
            if (this.followActiveEditor || !filename) {
                this.Lb(filename);
            }
            else {
                this.Lb(`${filename} (pinned)`);
            }
        }
        get message() {
            return this.nc;
        }
        set message(message) {
            this.nc = message;
            this.oc();
        }
        oc() {
            if (this.nc !== undefined) {
                this.pc(this.nc);
            }
            else {
                this.qc();
            }
        }
        pc(message) {
            if (!this.f) {
                return;
            }
            this.f.classList.remove('hide');
            this.rc();
            this.f.textContent = message;
        }
        qc() {
            this.rc();
            this.f.classList.add('hide');
        }
        rc() {
            DOM.$lO(this.f);
        }
        get vc() {
            return this.uc > 0;
        }
        wc(cancelPending) {
            this.uc = 0;
            this.tc = this.pageSize;
            this.sb.clear();
            if (cancelPending) {
                for (const { tokenSource } of this.ab.values()) {
                    tokenSource.dispose(true);
                }
                this.ab.clear();
                if (!this.isBodyVisible() && this.h) {
                    this.h.setChildren(null, undefined);
                    this.sc = true;
                }
            }
        }
        async xc(reset, sources) {
            // If we have no source, we are resetting all sources, so cancel everything in flight and reset caches
            if (sources === undefined) {
                if (reset) {
                    this.wc(true);
                }
                // TODO@eamodio: Are these the right the list of schemes to exclude? Is there a better way?
                if (this.Wb?.scheme === network_1.Schemas.vscodeSettings || this.Wb?.scheme === network_1.Schemas.webviewPanel || this.Wb?.scheme === network_1.Schemas.walkThrough) {
                    this.Wb = undefined;
                    this.wc(false);
                    this.Dc();
                    return;
                }
                if (this.sc && this.Wb !== undefined) {
                    this.setLoadingUriMessage();
                }
            }
            if (this.Wb === undefined) {
                this.wc(false);
                this.Dc();
                return;
            }
            if (!this.isBodyVisible()) {
                return;
            }
            let hasPendingRequests = false;
            for (const source of sources ?? this.ac.getSources().map(s => s.id)) {
                const requested = this.yc(source, this.Wb, reset);
                if (requested) {
                    hasPendingRequests = true;
                }
            }
            if (!hasPendingRequests) {
                this.Dc();
            }
            else if (this.sc) {
                this.setLoadingUriMessage();
            }
        }
        yc(source, uri, reset, options) {
            if (this.L.has(source)) {
                return false;
            }
            const timeline = this.sb.get(source);
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
            let request = this.ab.get(source);
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
            request = this.ac.getTimeline(source, uri, options, new cancellation_1.$pd());
            if (request === undefined) {
                return false;
            }
            this.ab.set(source, request);
            request.tokenSource.token.onCancellationRequested(() => this.ab.delete(source));
            this.Bc(request);
            return true;
        }
        zc(timeline, reset) {
            if (reset) {
                this.sb.delete(timeline.source);
                // Override the limit, to re-query for all our existing cached (possibly visible) items to keep visual continuity
                const { oldest } = timeline;
                this.yc(timeline.source, this.Wb, true, oldest !== undefined ? { limit: { timestamp: oldest.timestamp, id: oldest.id } } : undefined);
            }
            else {
                // Override the limit, to query for any newer items
                const { newest } = timeline;
                this.yc(timeline.source, this.Wb, false, newest !== undefined ? { limit: { timestamp: newest.timestamp, id: newest.id } } : { limit: this.pageSize });
            }
        }
        async Bc(request) {
            let response;
            try {
                response = await this.$b.withProgress({ location: this.id }, () => request.result);
            }
            finally {
                this.ab.delete(request.source);
            }
            if (response === undefined ||
                request.tokenSource.token.isCancellationRequested ||
                request.uri !== this.Wb) {
                if (this.ab.size === 0 && this.Ac) {
                    this.Dc();
                }
                return;
            }
            const source = request.source;
            let updated = false;
            const timeline = this.sb.get(source);
            if (timeline === undefined) {
                this.sb.set(source, new TimelineAggregate(response));
                updated = true;
            }
            else {
                updated = timeline.add(response, request.options);
            }
            if (updated) {
                this.Ac = true;
                // If we have visible items already and there are other pending requests, debounce for a bit to wait for other requests
                if (this.vc && this.ab.size !== 0) {
                    this.Ec();
                }
                else {
                    this.Dc();
                }
            }
            else if (this.ab.size === 0) {
                if (this.Ac) {
                    this.Dc();
                }
                else {
                    this.h.rerender();
                }
            }
        }
        *Cc() {
            let more = false;
            if (this.Wb === undefined || this.sb.size === 0) {
                this.uc = 0;
                return;
            }
            const maxCount = this.tc;
            let count = 0;
            if (this.sb.size === 1) {
                const [source, timeline] = iterator_1.Iterable.first(this.sb);
                timeline.lastRenderedIndex = -1;
                if (this.L.has(source)) {
                    this.uc = 0;
                    return;
                }
                if (timeline.items.length !== 0) {
                    // If we have any items, just say we have one for now -- the real count will be updated below
                    this.uc = 1;
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
                for (const [source, timeline] of this.sb) {
                    timeline.lastRenderedIndex = -1;
                    if (this.L.has(source) || timeline.stale) {
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
                this.uc = hasAnyItems ? 1 : 0;
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
            this.uc = count;
            if (count > 0) {
                if (more) {
                    yield {
                        element: new LoadMoreCommand(this.ab.size !== 0)
                    };
                }
                else if (this.ab.size !== 0) {
                    yield {
                        element: new LoadMoreCommand(true)
                    };
                }
            }
        }
        Dc() {
            if (!this.isBodyVisible()) {
                return;
            }
            this.h.setChildren(null, this.Cc());
            this.sc = !this.vc;
            if (this.Wb === undefined) {
                this.updateFilename(undefined);
                this.message = (0, nls_1.localize)(3, null);
            }
            else if (this.sc) {
                if (this.ab.size !== 0) {
                    this.setLoadingUriMessage();
                }
                else {
                    this.updateFilename(this.bc.getUriBasenameLabel(this.Wb));
                    this.message = (0, nls_1.localize)(4, null);
                }
            }
            else {
                this.updateFilename(this.bc.getUriBasenameLabel(this.Wb));
                this.message = undefined;
            }
            this.Ac = false;
        }
        Ec() {
            this.Dc();
        }
        focus() {
            super.focus();
            this.h.domFocus();
        }
        setExpanded(expanded) {
            const changed = super.setExpanded(expanded);
            if (changed && this.isBodyVisible()) {
                if (!this.followActiveEditor) {
                    this.gc(this.Wb, true);
                }
                else {
                    this.jc();
                }
            }
            return changed;
        }
        setVisible(visible) {
            if (visible) {
                this.dc.activateByEvent('onView:timeline');
                this.n = new lifecycle_1.$jc();
                this.Yb.onDidActiveEditorChange(this.jc, this, this.n);
                // Refresh the view on focus to update the relative timestamps
                this.onDidFocus(() => this.Ec(), this, this.n);
                super.setVisible(visible);
                this.jc();
            }
            else {
                this.n?.dispose();
                super.setVisible(visible);
            }
        }
        W(height, width) {
            super.W(height, width);
            this.h.layout(height, width);
        }
        Ib(container) {
            super.Ib(container, this.title);
            container.classList.add('timeline-view');
        }
        U(container) {
            super.U(container);
            this.c = container;
            container.classList.add('tree-explorer-viewlet-tree-view', 'timeline-tree-view');
            this.f = DOM.$0O(this.c, DOM.$('.message'));
            this.f.classList.add('timeline-subtle');
            this.message = (0, nls_1.localize)(5, null);
            this.g = document.createElement('div');
            this.g.classList.add('customview-tree', 'file-icon-themable-tree', 'hide-arrows');
            // this.treeElement.classList.add('show-file-icons');
            container.appendChild(this.g);
            this.j = this.Bb.createInstance(TimelineTreeRenderer, this.m);
            this.j.onDidScrollToEnd(item => {
                if (this.pageOnScroll) {
                    this.Ic(item);
                }
            });
            this.h = this.Bb.createInstance(listService_1.$t4, 'TimelinePane', this.g, new $t1b(), [this.j], {
                identityProvider: new $r1b(),
                accessibilityProvider: {
                    getAriaLabel(element) {
                        if (isLoadMoreCommand(element)) {
                            return element.ariaLabel;
                        }
                        return element.accessibilityInformation ? element.accessibilityInformation.label : (0, nls_1.localize)(6, null, element.relativeTimeFullWord ?? '', element.label);
                    },
                    getRole(element) {
                        if (isLoadMoreCommand(element)) {
                            return 'treeitem';
                        }
                        return element.accessibilityInformation && element.accessibilityInformation.role ? element.accessibilityInformation.role : 'treeitem';
                    },
                    getWidgetAriaLabel() {
                        return (0, nls_1.localize)(7, null);
                    }
                },
                keyboardNavigationLabelProvider: new $s1b(),
                multipleSelectionSupport: false,
                overrideStyles: {
                    listBackground: this.Rb()
                }
            });
            this.B(this.h.onContextMenu(e => this.Jc(this.m, e)));
            this.B(this.h.onDidChangeSelection(e => this.ensureValidItems()));
            this.B(this.h.onDidOpen(e => {
                if (!e.browserEvent || !this.ensureValidItems()) {
                    return;
                }
                const selection = this.h.getSelection();
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
                        if (item.command.id === editorCommands_1.$Wub || item.command.id === editorCommands_1.$Xub) {
                            // Some commands owned by us should receive the
                            // `IOpenEvent` as context to open properly
                            args = [...args, e];
                        }
                        this.Zb.executeCommand(item.command.id, ...args);
                    }
                }
                else if (isLoadMoreCommand(item)) {
                    this.Ic(item);
                }
            }));
        }
        Ic(item) {
            if (item.loading) {
                return;
            }
            item.loading = true;
            this.h.rerender(item);
            if (this.ab.size !== 0) {
                return;
            }
            this.tc = this.uc + this.pageSize;
            this.xc(false);
        }
        ensureValidItems() {
            // If we don't have any non-excluded timelines, clear the tree and show the loading message
            if (!this.vc || !this.ac.getSources().some(({ id }) => !this.L.has(id) && this.sb.has(id))) {
                this.h.setChildren(null, undefined);
                this.sc = true;
                this.setLoadingUriMessage();
                return false;
            }
            return true;
        }
        setLoadingUriMessage() {
            const file = this.Wb && this.bc.getUriBasenameLabel(this.Wb);
            this.updateFilename(file);
            this.message = file ? (0, nls_1.localize)(8, null, file) : '';
        }
        Jc(commands, treeEvent) {
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
            this.h.setFocus([item]);
            const actions = commands.getItemContextActions(item);
            if (!actions.length) {
                return;
            }
            this.xb.showContextMenu({
                getAnchor: () => treeEvent.anchor,
                getActions: () => actions,
                getActionViewItem: (action) => {
                    const keybinding = this.wb.lookupKeybinding(action.id);
                    if (keybinding) {
                        return new actionViewItems_1.$NQ(action, action, { label: true, keybinding: keybinding.getLabel() });
                    }
                    return undefined;
                },
                onHide: (wasCancelled) => {
                    if (wasCancelled) {
                        this.h.domFocus();
                    }
                },
                getActionsContext: () => ({ uri: this.Wb, item: item }),
                actionRunner: new TimelineActionRunner()
            });
        }
    };
    exports.$q1b = $q1b;
    __decorate([
        (0, decorators_1.$7g)(500)
    ], $q1b.prototype, "Ec", null);
    exports.$q1b = $q1b = __decorate([
        __param(1, keybinding_1.$2D),
        __param(2, contextView_1.$WZ),
        __param(3, contextkey_1.$3i),
        __param(4, configuration_1.$8h),
        __param(5, storage_1.$Vo),
        __param(6, views_1.$_E),
        __param(7, instantiation_1.$Ah),
        __param(8, editorService_1.$9C),
        __param(9, commands_1.$Fr),
        __param(10, progress_1.$2u),
        __param(11, timeline_1.$ZI),
        __param(12, opener_1.$NT),
        __param(13, themeService_1.$gv),
        __param(14, telemetry_1.$9k),
        __param(15, label_1.$Vz),
        __param(16, uriIdentity_1.$Ck),
        __param(17, extensions_1.$MF)
    ], $q1b);
    class TimelineElementTemplate {
        static { this.id = 'TimelineElementTemplate'; }
        constructor(container, actionViewItemProvider, hoverDelegate) {
            container.classList.add('custom-view-tree-node-item');
            this.icon = DOM.$0O(container, DOM.$('.custom-view-tree-node-item-icon'));
            this.iconLabel = new iconLabel_1.$KR(container, { supportHighlights: true, supportIcons: true, hoverDelegate: hoverDelegate });
            const timestampContainer = DOM.$0O(this.iconLabel.element, DOM.$('.timeline-timestamp-container'));
            this.timestamp = DOM.$0O(timestampContainer, DOM.$('span.timeline-timestamp'));
            const actionsContainer = DOM.$0O(this.iconLabel.element, DOM.$('.actions'));
            this.actionBar = new actionbar_1.$1P(actionsContainer, { actionViewItemProvider: actionViewItemProvider });
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
    class $r1b {
        getId(item) {
            return item.handle;
        }
    }
    exports.$r1b = $r1b;
    class TimelineActionRunner extends actions_1.$hi {
        async u(action, { uri, item }) {
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
    class $s1b {
        getKeyboardNavigationLabel(element) {
            return element.label;
        }
    }
    exports.$s1b = $s1b;
    class $t1b {
        getHeight(_element) {
            return ItemHeight;
        }
        getTemplateId(element) {
            return TimelineElementTemplate.id;
        }
    }
    exports.$t1b = $t1b;
    let TimelineTreeRenderer = class TimelineTreeRenderer {
        constructor(g, h, j, k, l) {
            this.g = g;
            this.h = h;
            this.j = j;
            this.k = k;
            this.l = l;
            this.c = new event_1.$fd();
            this.onDidScrollToEnd = this.c.event;
            this.templateId = TimelineElementTemplate.id;
            this.f = menuEntryActionViewItem_1.$F3.bind(undefined, this.h);
            this.d = {
                showHover: (options) => this.k.showHover(options),
                delay: this.l.getValue('workbench.hover.delay')
            };
        }
        setUri(uri) {
            this.m = uri;
        }
        renderTemplate(container) {
            return new TimelineElementTemplate(container, this.f, this.d);
        }
        renderElement(node, index, template, height) {
            template.reset();
            const { element: item } = node;
            const theme = this.j.getColorTheme();
            const icon = theme.type === theme_1.ColorScheme.LIGHT ? item.icon : item.iconDark;
            const iconUrl = icon ? uri_1.URI.revive(icon) : null;
            if (iconUrl) {
                template.icon.className = 'custom-view-tree-node-item-icon';
                template.icon.style.backgroundImage = DOM.$nP(iconUrl);
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
                ? (0, types_1.$jf)(item.tooltip)
                    ? item.tooltip
                    : { markdown: item.tooltip, markdownNotSupportedFallback: (0, markdownRenderer_1.$CQ)(item.tooltip) }
                : undefined;
            template.iconLabel.setLabel(item.label, item.description, {
                title: tooltip,
                matches: (0, filters_1.$Hj)(node.filterData)
            });
            template.timestamp.textContent = item.relativeTime ?? '';
            template.timestamp.ariaLabel = item.relativeTimeFullWord ?? '';
            template.timestamp.parentElement.classList.toggle('timeline-timestamp--duplicate', isTimelineItem(item) && item.hideRelativeTime);
            template.actionBar.context = { uri: this.m, item: item };
            template.actionBar.actionRunner = new TimelineActionRunner();
            template.actionBar.push(this.g.getItemActions(item), { icon: true, label: false });
            // If we are rendering the load more item, we've scrolled to the end, so trigger an event
            if (isLoadMoreCommand(item)) {
                setTimeout(() => this.c.fire(item), 0);
            }
        }
        disposeTemplate(template) {
            template.dispose();
        }
    };
    TimelineTreeRenderer = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, themeService_1.$gv),
        __param(3, hover_1.$zib),
        __param(4, configuration_1.$8h)
    ], TimelineTreeRenderer);
    const timelineRefresh = (0, iconRegistry_1.$9u)('timeline-refresh', codicons_1.$Pj.refresh, (0, nls_1.localize)(9, null));
    const timelinePin = (0, iconRegistry_1.$9u)('timeline-pin', codicons_1.$Pj.pin, (0, nls_1.localize)(10, null));
    const timelineUnpin = (0, iconRegistry_1.$9u)('timeline-unpin', codicons_1.$Pj.pinned, (0, nls_1.localize)(11, null));
    let TimelinePaneCommands = class TimelinePaneCommands extends lifecycle_1.$kc {
        constructor(f, g, h, j, m) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.B(this.c = new lifecycle_1.$jc());
            this.B((0, actions_2.$Xu)(class extends actions_2.$Wu {
                constructor() {
                    super({
                        id: 'timeline.refresh',
                        title: { value: (0, nls_1.localize)(12, null), original: 'Refresh' },
                        icon: timelineRefresh,
                        category: { value: (0, nls_1.localize)(13, null), original: 'Timeline' },
                        menu: {
                            id: actions_2.$Ru.TimelineTitle,
                            group: 'navigation',
                            order: 99,
                        }
                    });
                }
                run(accessor, ...args) {
                    f.reset();
                }
            }));
            this.B(commands_1.$Gr.registerCommand('timeline.toggleFollowActiveEditor', (accessor, ...args) => f.followActiveEditor = !f.followActiveEditor));
            this.B(actions_2.$Tu.appendMenuItem(actions_2.$Ru.TimelineTitle, ({
                command: {
                    id: 'timeline.toggleFollowActiveEditor',
                    title: { value: (0, nls_1.localize)(14, null), original: 'Pin the Current Timeline' },
                    icon: timelinePin,
                    category: { value: (0, nls_1.localize)(15, null), original: 'Timeline' },
                },
                group: 'navigation',
                order: 98,
                when: exports.$o1b
            })));
            this.B(actions_2.$Tu.appendMenuItem(actions_2.$Ru.TimelineTitle, ({
                command: {
                    id: 'timeline.toggleFollowActiveEditor',
                    title: { value: (0, nls_1.localize)(16, null), original: 'Unpin the Current Timeline' },
                    icon: timelineUnpin,
                    category: { value: (0, nls_1.localize)(17, null), original: 'Timeline' },
                },
                group: 'navigation',
                order: 98,
                when: exports.$o1b.toNegated()
            })));
            this.B(g.onDidChangeProviders(() => this.r()));
            this.r();
        }
        getItemActions(element) {
            return this.n(actions_2.$Ru.TimelineItemContext, { key: 'timelineItem', value: element.contextValue }).primary;
        }
        getItemContextActions(element) {
            return this.n(actions_2.$Ru.TimelineItemContext, { key: 'timelineItem', value: element.contextValue }).secondary;
        }
        n(menuId, context) {
            const contextKeyService = this.j.createOverlay([
                ['view', this.f.id],
                [context.key, context.value],
            ]);
            const menu = this.m.createMenu(menuId, contextKeyService);
            const primary = [];
            const secondary = [];
            const result = { primary, secondary };
            (0, menuEntryActionViewItem_1.$A3)(menu, { shouldForwardArgs: true }, result, 'inline');
            menu.dispose();
            return result;
        }
        r() {
            this.c.clear();
            const excluded = new Set(JSON.parse(this.h.get('timeline.excludeSources', 0 /* StorageScope.PROFILE */, '[]')));
            for (const source of this.g.getSources()) {
                this.c.add((0, actions_2.$Xu)(class extends actions_2.$Wu {
                    constructor() {
                        super({
                            id: `timeline.toggleExcludeSource:${source.id}`,
                            title: source.label,
                            menu: {
                                id: actions_2.$Ru.TimelineFilterSubMenu,
                                group: 'navigation',
                            },
                            toggled: contextkey_1.$Ii.regex(`timelineExcludeSources`, new RegExp(`\\b${(0, strings_1.$qe)(source.id)}\\b`)).negate()
                        });
                    }
                    run(accessor, ...args) {
                        if (excluded.has(source.id)) {
                            excluded.delete(source.id);
                        }
                        else {
                            excluded.add(source.id);
                        }
                        const storageService = accessor.get(storage_1.$Vo);
                        storageService.store('timeline.excludeSources', JSON.stringify([...excluded.keys()]), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
                    }
                }));
            }
        }
    };
    TimelinePaneCommands = __decorate([
        __param(1, timeline_1.$ZI),
        __param(2, storage_1.$Vo),
        __param(3, contextkey_1.$3i),
        __param(4, actions_2.$Su)
    ], TimelinePaneCommands);
});
//# sourceMappingURL=timelinePane.js.map