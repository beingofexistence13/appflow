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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/types", "vs/base/common/uri", "vs/editor/browser/editorDom", "vs/editor/browser/stableEditorScroll", "vs/editor/common/config/editorOptions", "vs/editor/common/core/editOperation", "vs/editor/common/core/range", "vs/editor/common/languages", "vs/editor/common/model", "vs/editor/common/model/textModel", "vs/editor/common/services/languageFeatureDebounce", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/resolverService", "vs/editor/contrib/gotoSymbol/browser/link/clickLinkGesture", "vs/editor/contrib/inlayHints/browser/inlayHints", "vs/editor/contrib/inlayHints/browser/inlayHintsLocations", "vs/platform/commands/common/commands", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService"], function (require, exports, dom_1, arrays_1, async_1, cancellation_1, errors_1, lifecycle_1, map_1, types_1, uri_1, editorDom_1, stableEditorScroll_1, editorOptions_1, editOperation_1, range_1, languages, model_1, textModel_1, languageFeatureDebounce_1, languageFeatures_1, resolverService_1, clickLinkGesture_1, inlayHints_1, inlayHintsLocations_1, commands_1, extensions_1, instantiation_1, notification_1, colors, themeService_1) {
    "use strict";
    var $r9_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$r9 = exports.$q9 = void 0;
    // --- hint caching service (per session)
    class InlayHintsCache {
        constructor() {
            this.a = new map_1.$Ci(50);
        }
        get(model) {
            const key = InlayHintsCache.b(model);
            return this.a.get(key);
        }
        set(model, value) {
            const key = InlayHintsCache.b(model);
            this.a.set(key, value);
        }
        static b(model) {
            return `${model.uri.toString()}/${model.getVersionId()}`;
        }
    }
    const IInlayHintsCache = (0, instantiation_1.$Bh)('IInlayHintsCache');
    (0, extensions_1.$mr)(IInlayHintsCache, InlayHintsCache, 1 /* InstantiationType.Delayed */);
    // --- rendered label
    class $q9 {
        constructor(item, index) {
            this.item = item;
            this.index = index;
        }
        get part() {
            const label = this.item.hint.label;
            if (typeof label === 'string') {
                return { label };
            }
            else {
                return label[this.index];
            }
        }
    }
    exports.$q9 = $q9;
    class ActiveInlayHintInfo {
        constructor(part, hasTriggerModifier) {
            this.part = part;
            this.hasTriggerModifier = hasTriggerModifier;
        }
    }
    var RenderMode;
    (function (RenderMode) {
        RenderMode[RenderMode["Normal"] = 0] = "Normal";
        RenderMode[RenderMode["Invisible"] = 1] = "Invisible";
    })(RenderMode || (RenderMode = {}));
    // --- controller
    let $r9 = class $r9 {
        static { $r9_1 = this; }
        static { this.ID = 'editor.contrib.InlayHints'; }
        static { this.a = 1500; }
        static get(editor) {
            return editor.getContribution($r9_1.ID) ?? undefined;
        }
        constructor(l, m, _featureDebounce, n, o, p, q) {
            this.l = l;
            this.m = m;
            this.n = n;
            this.o = o;
            this.p = p;
            this.q = q;
            this.b = new lifecycle_1.$jc();
            this.c = new lifecycle_1.$jc();
            this.g = new Map();
            this.h = new editorDom_1.$vW(this.l);
            this.j = 0 /* RenderMode.Normal */;
            this.f = _featureDebounce.for(m.inlayHintsProvider, 'InlayHint', { min: 25 });
            this.b.add(m.inlayHintsProvider.onDidChange(() => this.r()));
            this.b.add(l.onDidChangeModel(() => this.r()));
            this.b.add(l.onDidChangeModelLanguage(() => this.r()));
            this.b.add(l.onDidChangeConfiguration(e => {
                if (e.hasChanged(139 /* EditorOption.inlayHints */)) {
                    this.r();
                }
            }));
            this.r();
        }
        dispose() {
            this.c.dispose();
            this.E();
            this.b.dispose();
        }
        r() {
            this.c.clear();
            this.E();
            const options = this.l.getOption(139 /* EditorOption.inlayHints */);
            if (options.enabled === 'off') {
                return;
            }
            const model = this.l.getModel();
            if (!model || !this.m.inlayHintsProvider.has(model)) {
                return;
            }
            // iff possible, quickly update from cache
            const cached = this.n.get(model);
            if (cached) {
                this.B([model.getFullModelRange()], cached);
            }
            this.c.add((0, lifecycle_1.$ic)(() => {
                // cache items when switching files etc
                if (!model.isDisposed()) {
                    this.y(model);
                }
            }));
            let cts;
            const watchedProviders = new Set();
            const scheduler = new async_1.$Sg(async () => {
                const t1 = Date.now();
                cts?.dispose(true);
                cts = new cancellation_1.$pd();
                const listener = model.onWillDispose(() => cts?.cancel());
                try {
                    const myToken = cts.token;
                    const inlayHints = await inlayHints_1.$m9.create(this.m.inlayHintsProvider, model, this.A(), myToken);
                    scheduler.delay = this.f.update(model, Date.now() - t1);
                    if (myToken.isCancellationRequested) {
                        inlayHints.dispose();
                        return;
                    }
                    // listen to provider changes
                    for (const provider of inlayHints.provider) {
                        if (typeof provider.onDidChangeInlayHints === 'function' && !watchedProviders.has(provider)) {
                            watchedProviders.add(provider);
                            this.c.add(provider.onDidChangeInlayHints(() => {
                                if (!scheduler.isScheduled()) { // ignore event when request is already scheduled
                                    scheduler.schedule();
                                }
                            }));
                        }
                    }
                    this.c.add(inlayHints);
                    this.B(inlayHints.ranges, inlayHints.items);
                    this.y(model);
                }
                catch (err) {
                    (0, errors_1.$Y)(err);
                }
                finally {
                    cts.dispose();
                    listener.dispose();
                }
            }, this.f.get(model));
            this.c.add(scheduler);
            this.c.add((0, lifecycle_1.$ic)(() => cts?.dispose(true)));
            scheduler.schedule(0);
            this.c.add(this.l.onDidScrollChange((e) => {
                // update when scroll position changes
                // uses scrollTopChanged has weak heuristic to differenatiate between scrolling due to
                // typing or due to "actual" scrolling
                if (e.scrollTopChanged || !scheduler.isScheduled()) {
                    scheduler.schedule();
                }
            }));
            this.c.add(this.l.onDidChangeModelContent((e) => {
                // update less aggressive when typing
                const delay = Math.max(scheduler.delay, 1250);
                scheduler.schedule(delay);
            }));
            if (options.enabled === 'on') {
                // different "on" modes: always
                this.j = 0 /* RenderMode.Normal */;
            }
            else {
                // different "on" modes: offUnlessPressed, or onUnlessPressed
                let defaultMode;
                let altMode;
                if (options.enabled === 'onUnlessPressed') {
                    defaultMode = 0 /* RenderMode.Normal */;
                    altMode = 1 /* RenderMode.Invisible */;
                }
                else {
                    defaultMode = 1 /* RenderMode.Invisible */;
                    altMode = 0 /* RenderMode.Normal */;
                }
                this.j = defaultMode;
                this.c.add(dom_1.$xP.getInstance().event(e => {
                    if (!this.l.hasModel()) {
                        return;
                    }
                    const newRenderMode = e.altKey && e.ctrlKey && !(e.shiftKey || e.metaKey) ? altMode : defaultMode;
                    if (newRenderMode !== this.j) {
                        this.j = newRenderMode;
                        const model = this.l.getModel();
                        const copies = this.z(model);
                        this.B([model.getFullModelRange()], copies);
                        scheduler.schedule(0);
                    }
                }));
            }
            // mouse gestures
            this.c.add(this.u(() => scheduler.schedule(0)));
            this.c.add(this.s());
            this.c.add(this.v());
        }
        s() {
            const store = new lifecycle_1.$jc();
            const gesture = store.add(new clickLinkGesture_1.$v3(this.l));
            // let removeHighlight = () => { };
            const sessionStore = new lifecycle_1.$jc();
            store.add(sessionStore);
            store.add(gesture.onMouseMoveOrRelevantKeyDown(e => {
                const [mouseEvent] = e;
                const labelPart = this.w(mouseEvent);
                const model = this.l.getModel();
                if (!labelPart || !model) {
                    sessionStore.clear();
                    return;
                }
                // resolve the item
                const cts = new cancellation_1.$pd();
                sessionStore.add((0, lifecycle_1.$ic)(() => cts.dispose(true)));
                labelPart.item.resolve(cts.token);
                // render link => when the modifier is pressed and when there is a command or location
                this.k = labelPart.part.command || labelPart.part.location
                    ? new ActiveInlayHintInfo(labelPart, mouseEvent.hasTriggerModifier)
                    : undefined;
                const lineNumber = model.validatePosition(labelPart.item.hint.position).lineNumber;
                const range = new range_1.$ks(lineNumber, 1, lineNumber, model.getLineMaxColumn(lineNumber));
                const lineHints = this.t(range);
                this.B([range], lineHints);
                sessionStore.add((0, lifecycle_1.$ic)(() => {
                    this.k = undefined;
                    this.B([range], lineHints);
                }));
            }));
            store.add(gesture.onCancel(() => sessionStore.clear()));
            store.add(gesture.onExecute(async (e) => {
                const label = this.w(e);
                if (label) {
                    const part = label.part;
                    if (part.location) {
                        // location -> execute go to def
                        this.q.invokeFunction(inlayHintsLocations_1.$p9, e, this.l, part.location);
                    }
                    else if (languages.Command.is(part.command)) {
                        // command -> execute it
                        await this.x(part.command, label.item);
                    }
                }
            }));
            return store;
        }
        t(range) {
            const lineHints = new Set();
            for (const data of this.g.values()) {
                if (range.containsRange(data.item.anchor.range)) {
                    lineHints.add(data.item);
                }
            }
            return Array.from(lineHints);
        }
        u(updateInlayHints) {
            return this.l.onMouseUp(async (e) => {
                if (e.event.detail !== 2) {
                    return;
                }
                const part = this.w(e);
                if (!part) {
                    return;
                }
                e.event.preventDefault();
                await part.item.resolve(cancellation_1.CancellationToken.None);
                if ((0, arrays_1.$Jb)(part.item.hint.textEdits)) {
                    const edits = part.item.hint.textEdits.map(edit => editOperation_1.$ls.replace(range_1.$ks.lift(edit.range), edit.text));
                    this.l.executeEdits('inlayHint.default', edits);
                    updateInlayHints();
                }
            });
        }
        v() {
            return this.l.onContextMenu(async (e) => {
                if (!(e.event.target instanceof HTMLElement)) {
                    return;
                }
                const part = this.w(e);
                if (part) {
                    await this.q.invokeFunction(inlayHintsLocations_1.$o9, this.l, e.event.target, part);
                }
            });
        }
        w(e) {
            if (e.target.type !== 6 /* MouseTargetType.CONTENT_TEXT */) {
                return undefined;
            }
            const options = e.target.detail.injectedText?.options;
            if (options instanceof textModel_1.$QC && options?.attachedData instanceof $q9) {
                return options.attachedData;
            }
            return undefined;
        }
        async x(command, item) {
            try {
                await this.o.executeCommand(command.id, ...(command.arguments ?? []));
            }
            catch (err) {
                this.p.notify({
                    severity: notification_1.Severity.Error,
                    source: item.provider.displayName,
                    message: err
                });
            }
        }
        y(model) {
            const hints = this.z(model);
            this.n.set(model, hints);
        }
        // return inlay hints but with an anchor that reflects "updates"
        // that happened after receiving them, e.g adding new lines before a hint
        z(model) {
            const items = new Map();
            for (const [id, obj] of this.g) {
                if (items.has(obj.item)) {
                    // an inlay item can be rendered as multiple decorations
                    // but they will all uses the same range
                    continue;
                }
                const range = model.getDecorationRange(id);
                if (range) {
                    // update range with whatever the editor has tweaked it to
                    const anchor = new inlayHints_1.$k9(range, obj.item.anchor.direction);
                    const copy = obj.item.with({ anchor });
                    items.set(obj.item, copy);
                }
            }
            return Array.from(items.values());
        }
        A() {
            const extra = 30;
            const model = this.l.getModel();
            const visibleRanges = this.l.getVisibleRangesPlusViewportAboveBelow();
            const result = [];
            for (const range of visibleRanges.sort(range_1.$ks.compareRangesUsingStarts)) {
                const extendedRange = model.validateRange(new range_1.$ks(range.startLineNumber - extra, range.startColumn, range.endLineNumber + extra, range.endColumn));
                if (result.length === 0 || !range_1.$ks.areIntersectingOrTouching(result[result.length - 1], extendedRange)) {
                    result.push(extendedRange);
                }
                else {
                    result[result.length - 1] = range_1.$ks.plusRange(result[result.length - 1], extendedRange);
                }
            }
            return result;
        }
        B(ranges, items) {
            // utils to collect/create injected text decorations
            const newDecorationsData = [];
            const addInjectedText = (item, ref, content, cursorStops, attachedData) => {
                const opts = {
                    content,
                    inlineClassNameAffectsLetterSpacing: true,
                    inlineClassName: ref.className,
                    cursorStops,
                    attachedData
                };
                newDecorationsData.push({
                    item,
                    classNameRef: ref,
                    decoration: {
                        range: item.anchor.range,
                        options: {
                            // className: "rangeHighlight", // DEBUG highlight to see to what range a hint is attached
                            description: 'InlayHint',
                            showIfCollapsed: item.anchor.range.isEmpty(),
                            collapseOnReplaceEdit: !item.anchor.range.isEmpty(),
                            stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
                            [item.anchor.direction]: this.j === 0 /* RenderMode.Normal */ ? opts : undefined
                        }
                    }
                });
            };
            const addInjectedWhitespace = (item, isLast) => {
                const marginRule = this.h.createClassNameRef({
                    width: `${(fontSize / 3) | 0}px`,
                    display: 'inline-block'
                });
                addInjectedText(item, marginRule, '\u200a', isLast ? model_1.InjectedTextCursorStops.Right : model_1.InjectedTextCursorStops.None);
            };
            //
            const { fontSize, fontFamily, padding, isUniform } = this.D();
            const fontFamilyVar = '--code-editorInlayHintsFontFamily';
            this.l.getContainerDomNode().style.setProperty(fontFamilyVar, fontFamily);
            for (const item of items) {
                // whitespace leading the actual label
                if (item.hint.paddingLeft) {
                    addInjectedWhitespace(item, false);
                }
                // the label with its parts
                const parts = typeof item.hint.label === 'string'
                    ? [{ label: item.hint.label }]
                    : item.hint.label;
                for (let i = 0; i < parts.length; i++) {
                    const part = parts[i];
                    const isFirst = i === 0;
                    const isLast = i === parts.length - 1;
                    const cssProperties = {
                        fontSize: `${fontSize}px`,
                        fontFamily: `var(${fontFamilyVar}), ${editorOptions_1.EDITOR_FONT_DEFAULTS.fontFamily}`,
                        verticalAlign: isUniform ? 'baseline' : 'middle',
                        unicodeBidi: 'isolate'
                    };
                    if ((0, arrays_1.$Jb)(item.hint.textEdits)) {
                        cssProperties.cursor = 'default';
                    }
                    this.C(cssProperties, item.hint);
                    if ((part.command || part.location) && this.k?.part.item === item && this.k.part.index === i) {
                        // active link!
                        cssProperties.textDecoration = 'underline';
                        if (this.k.hasTriggerModifier) {
                            cssProperties.color = (0, themeService_1.$hv)(colors.$7w);
                            cssProperties.cursor = 'pointer';
                        }
                    }
                    if (padding) {
                        if (isFirst && isLast) {
                            // only element
                            cssProperties.padding = `1px ${Math.max(1, fontSize / 4) | 0}px`;
                            cssProperties.borderRadius = `${(fontSize / 4) | 0}px`;
                        }
                        else if (isFirst) {
                            // first element
                            cssProperties.padding = `1px 0 1px ${Math.max(1, fontSize / 4) | 0}px`;
                            cssProperties.borderRadius = `${(fontSize / 4) | 0}px 0 0 ${(fontSize / 4) | 0}px`;
                        }
                        else if (isLast) {
                            // last element
                            cssProperties.padding = `1px ${Math.max(1, fontSize / 4) | 0}px 1px 0`;
                            cssProperties.borderRadius = `0 ${(fontSize / 4) | 0}px ${(fontSize / 4) | 0}px 0`;
                        }
                        else {
                            cssProperties.padding = `1px 0 1px 0`;
                        }
                    }
                    addInjectedText(item, this.h.createClassNameRef(cssProperties), fixSpace(part.label), isLast && !item.hint.paddingRight ? model_1.InjectedTextCursorStops.Right : model_1.InjectedTextCursorStops.None, new $q9(item, i));
                }
                // whitespace trailing the actual label
                if (item.hint.paddingRight) {
                    addInjectedWhitespace(item, true);
                }
                if (newDecorationsData.length > $r9_1.a) {
                    break;
                }
            }
            // collect all decoration ids that are affected by the ranges
            // and only update those decorations
            const decorationIdsToReplace = [];
            for (const range of ranges) {
                for (const { id } of this.l.getDecorationsInRange(range) ?? []) {
                    const metadata = this.g.get(id);
                    if (metadata) {
                        decorationIdsToReplace.push(id);
                        metadata.classNameRef.dispose();
                        this.g.delete(id);
                    }
                }
            }
            const scrollState = stableEditorScroll_1.$TZ.capture(this.l);
            this.l.changeDecorations(accessor => {
                const newDecorationIds = accessor.deltaDecorations(decorationIdsToReplace, newDecorationsData.map(d => d.decoration));
                for (let i = 0; i < newDecorationIds.length; i++) {
                    const data = newDecorationsData[i];
                    this.g.set(newDecorationIds[i], data);
                }
            });
            scrollState.restore(this.l);
        }
        C(props, hint) {
            if (hint.kind === languages.InlayHintKind.Parameter) {
                props.backgroundColor = (0, themeService_1.$hv)(colors.$ax);
                props.color = (0, themeService_1.$hv)(colors.$_w);
            }
            else if (hint.kind === languages.InlayHintKind.Type) {
                props.backgroundColor = (0, themeService_1.$hv)(colors.$$w);
                props.color = (0, themeService_1.$hv)(colors.$0w);
            }
            else {
                props.backgroundColor = (0, themeService_1.$hv)(colors.$9w);
                props.color = (0, themeService_1.$hv)(colors.$8w);
            }
        }
        D() {
            const options = this.l.getOption(139 /* EditorOption.inlayHints */);
            const padding = options.padding;
            const editorFontSize = this.l.getOption(52 /* EditorOption.fontSize */);
            const editorFontFamily = this.l.getOption(49 /* EditorOption.fontFamily */);
            let fontSize = options.fontSize;
            if (!fontSize || fontSize < 5 || fontSize > editorFontSize) {
                fontSize = editorFontSize;
            }
            const fontFamily = options.fontFamily || editorFontFamily;
            const isUniform = !padding
                && fontFamily === editorFontFamily
                && fontSize === editorFontSize;
            return { fontSize, fontFamily, padding, isUniform };
        }
        E() {
            this.l.removeDecorations(Array.from(this.g.keys()));
            for (const obj of this.g.values()) {
                obj.classNameRef.dispose();
            }
            this.g.clear();
        }
        // --- accessibility
        getInlayHintsForLine(line) {
            if (!this.l.hasModel()) {
                return [];
            }
            const set = new Set();
            const result = [];
            for (const deco of this.l.getLineDecorations(line)) {
                const data = this.g.get(deco.id);
                if (data && !set.has(data.item.hint)) {
                    set.add(data.item.hint);
                    result.push(data.item);
                }
            }
            return result;
        }
    };
    exports.$r9 = $r9;
    exports.$r9 = $r9 = $r9_1 = __decorate([
        __param(1, languageFeatures_1.$hF),
        __param(2, languageFeatureDebounce_1.$52),
        __param(3, IInlayHintsCache),
        __param(4, commands_1.$Fr),
        __param(5, notification_1.$Yu),
        __param(6, instantiation_1.$Ah)
    ], $r9);
    // Prevents the view from potentially visible whitespace
    function fixSpace(str) {
        const noBreakWhitespace = '\xa0';
        return str.replace(/[ \t]/g, noBreakWhitespace);
    }
    commands_1.$Gr.registerCommand('_executeInlayHintProvider', async (accessor, ...args) => {
        const [uri, range] = args;
        (0, types_1.$tf)(uri_1.URI.isUri(uri));
        (0, types_1.$tf)(range_1.$ks.isIRange(range));
        const { inlayHintsProvider } = accessor.get(languageFeatures_1.$hF);
        const ref = await accessor.get(resolverService_1.$uA).createModelReference(uri);
        try {
            const model = await inlayHints_1.$m9.create(inlayHintsProvider, ref.object.textEditorModel, [range_1.$ks.lift(range)], cancellation_1.CancellationToken.None);
            const result = model.items.map(i => i.hint);
            setTimeout(() => model.dispose(), 0); // dispose after sending to ext host
            return result;
        }
        finally {
            ref.dispose();
        }
    });
});
//# sourceMappingURL=inlayHintsController.js.map