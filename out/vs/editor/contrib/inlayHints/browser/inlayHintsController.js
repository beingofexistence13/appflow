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
    var InlayHintsController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlayHintsController = exports.RenderedInlayHintLabelPart = void 0;
    // --- hint caching service (per session)
    class InlayHintsCache {
        constructor() {
            this._entries = new map_1.LRUCache(50);
        }
        get(model) {
            const key = InlayHintsCache._key(model);
            return this._entries.get(key);
        }
        set(model, value) {
            const key = InlayHintsCache._key(model);
            this._entries.set(key, value);
        }
        static _key(model) {
            return `${model.uri.toString()}/${model.getVersionId()}`;
        }
    }
    const IInlayHintsCache = (0, instantiation_1.createDecorator)('IInlayHintsCache');
    (0, extensions_1.registerSingleton)(IInlayHintsCache, InlayHintsCache, 1 /* InstantiationType.Delayed */);
    // --- rendered label
    class RenderedInlayHintLabelPart {
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
    exports.RenderedInlayHintLabelPart = RenderedInlayHintLabelPart;
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
    let InlayHintsController = class InlayHintsController {
        static { InlayHintsController_1 = this; }
        static { this.ID = 'editor.contrib.InlayHints'; }
        static { this._MAX_DECORATORS = 1500; }
        static get(editor) {
            return editor.getContribution(InlayHintsController_1.ID) ?? undefined;
        }
        constructor(_editor, _languageFeaturesService, _featureDebounce, _inlayHintsCache, _commandService, _notificationService, _instaService) {
            this._editor = _editor;
            this._languageFeaturesService = _languageFeaturesService;
            this._inlayHintsCache = _inlayHintsCache;
            this._commandService = _commandService;
            this._notificationService = _notificationService;
            this._instaService = _instaService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._sessionDisposables = new lifecycle_1.DisposableStore();
            this._decorationsMetadata = new Map();
            this._ruleFactory = new editorDom_1.DynamicCssRules(this._editor);
            this._activeRenderMode = 0 /* RenderMode.Normal */;
            this._debounceInfo = _featureDebounce.for(_languageFeaturesService.inlayHintsProvider, 'InlayHint', { min: 25 });
            this._disposables.add(_languageFeaturesService.inlayHintsProvider.onDidChange(() => this._update()));
            this._disposables.add(_editor.onDidChangeModel(() => this._update()));
            this._disposables.add(_editor.onDidChangeModelLanguage(() => this._update()));
            this._disposables.add(_editor.onDidChangeConfiguration(e => {
                if (e.hasChanged(139 /* EditorOption.inlayHints */)) {
                    this._update();
                }
            }));
            this._update();
        }
        dispose() {
            this._sessionDisposables.dispose();
            this._removeAllDecorations();
            this._disposables.dispose();
        }
        _update() {
            this._sessionDisposables.clear();
            this._removeAllDecorations();
            const options = this._editor.getOption(139 /* EditorOption.inlayHints */);
            if (options.enabled === 'off') {
                return;
            }
            const model = this._editor.getModel();
            if (!model || !this._languageFeaturesService.inlayHintsProvider.has(model)) {
                return;
            }
            // iff possible, quickly update from cache
            const cached = this._inlayHintsCache.get(model);
            if (cached) {
                this._updateHintsDecorators([model.getFullModelRange()], cached);
            }
            this._sessionDisposables.add((0, lifecycle_1.toDisposable)(() => {
                // cache items when switching files etc
                if (!model.isDisposed()) {
                    this._cacheHintsForFastRestore(model);
                }
            }));
            let cts;
            const watchedProviders = new Set();
            const scheduler = new async_1.RunOnceScheduler(async () => {
                const t1 = Date.now();
                cts?.dispose(true);
                cts = new cancellation_1.CancellationTokenSource();
                const listener = model.onWillDispose(() => cts?.cancel());
                try {
                    const myToken = cts.token;
                    const inlayHints = await inlayHints_1.InlayHintsFragments.create(this._languageFeaturesService.inlayHintsProvider, model, this._getHintsRanges(), myToken);
                    scheduler.delay = this._debounceInfo.update(model, Date.now() - t1);
                    if (myToken.isCancellationRequested) {
                        inlayHints.dispose();
                        return;
                    }
                    // listen to provider changes
                    for (const provider of inlayHints.provider) {
                        if (typeof provider.onDidChangeInlayHints === 'function' && !watchedProviders.has(provider)) {
                            watchedProviders.add(provider);
                            this._sessionDisposables.add(provider.onDidChangeInlayHints(() => {
                                if (!scheduler.isScheduled()) { // ignore event when request is already scheduled
                                    scheduler.schedule();
                                }
                            }));
                        }
                    }
                    this._sessionDisposables.add(inlayHints);
                    this._updateHintsDecorators(inlayHints.ranges, inlayHints.items);
                    this._cacheHintsForFastRestore(model);
                }
                catch (err) {
                    (0, errors_1.onUnexpectedError)(err);
                }
                finally {
                    cts.dispose();
                    listener.dispose();
                }
            }, this._debounceInfo.get(model));
            this._sessionDisposables.add(scheduler);
            this._sessionDisposables.add((0, lifecycle_1.toDisposable)(() => cts?.dispose(true)));
            scheduler.schedule(0);
            this._sessionDisposables.add(this._editor.onDidScrollChange((e) => {
                // update when scroll position changes
                // uses scrollTopChanged has weak heuristic to differenatiate between scrolling due to
                // typing or due to "actual" scrolling
                if (e.scrollTopChanged || !scheduler.isScheduled()) {
                    scheduler.schedule();
                }
            }));
            this._sessionDisposables.add(this._editor.onDidChangeModelContent((e) => {
                // update less aggressive when typing
                const delay = Math.max(scheduler.delay, 1250);
                scheduler.schedule(delay);
            }));
            if (options.enabled === 'on') {
                // different "on" modes: always
                this._activeRenderMode = 0 /* RenderMode.Normal */;
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
                this._activeRenderMode = defaultMode;
                this._sessionDisposables.add(dom_1.ModifierKeyEmitter.getInstance().event(e => {
                    if (!this._editor.hasModel()) {
                        return;
                    }
                    const newRenderMode = e.altKey && e.ctrlKey && !(e.shiftKey || e.metaKey) ? altMode : defaultMode;
                    if (newRenderMode !== this._activeRenderMode) {
                        this._activeRenderMode = newRenderMode;
                        const model = this._editor.getModel();
                        const copies = this._copyInlayHintsWithCurrentAnchor(model);
                        this._updateHintsDecorators([model.getFullModelRange()], copies);
                        scheduler.schedule(0);
                    }
                }));
            }
            // mouse gestures
            this._sessionDisposables.add(this._installDblClickGesture(() => scheduler.schedule(0)));
            this._sessionDisposables.add(this._installLinkGesture());
            this._sessionDisposables.add(this._installContextMenu());
        }
        _installLinkGesture() {
            const store = new lifecycle_1.DisposableStore();
            const gesture = store.add(new clickLinkGesture_1.ClickLinkGesture(this._editor));
            // let removeHighlight = () => { };
            const sessionStore = new lifecycle_1.DisposableStore();
            store.add(sessionStore);
            store.add(gesture.onMouseMoveOrRelevantKeyDown(e => {
                const [mouseEvent] = e;
                const labelPart = this._getInlayHintLabelPart(mouseEvent);
                const model = this._editor.getModel();
                if (!labelPart || !model) {
                    sessionStore.clear();
                    return;
                }
                // resolve the item
                const cts = new cancellation_1.CancellationTokenSource();
                sessionStore.add((0, lifecycle_1.toDisposable)(() => cts.dispose(true)));
                labelPart.item.resolve(cts.token);
                // render link => when the modifier is pressed and when there is a command or location
                this._activeInlayHintPart = labelPart.part.command || labelPart.part.location
                    ? new ActiveInlayHintInfo(labelPart, mouseEvent.hasTriggerModifier)
                    : undefined;
                const lineNumber = model.validatePosition(labelPart.item.hint.position).lineNumber;
                const range = new range_1.Range(lineNumber, 1, lineNumber, model.getLineMaxColumn(lineNumber));
                const lineHints = this._getInlineHintsForRange(range);
                this._updateHintsDecorators([range], lineHints);
                sessionStore.add((0, lifecycle_1.toDisposable)(() => {
                    this._activeInlayHintPart = undefined;
                    this._updateHintsDecorators([range], lineHints);
                }));
            }));
            store.add(gesture.onCancel(() => sessionStore.clear()));
            store.add(gesture.onExecute(async (e) => {
                const label = this._getInlayHintLabelPart(e);
                if (label) {
                    const part = label.part;
                    if (part.location) {
                        // location -> execute go to def
                        this._instaService.invokeFunction(inlayHintsLocations_1.goToDefinitionWithLocation, e, this._editor, part.location);
                    }
                    else if (languages.Command.is(part.command)) {
                        // command -> execute it
                        await this._invokeCommand(part.command, label.item);
                    }
                }
            }));
            return store;
        }
        _getInlineHintsForRange(range) {
            const lineHints = new Set();
            for (const data of this._decorationsMetadata.values()) {
                if (range.containsRange(data.item.anchor.range)) {
                    lineHints.add(data.item);
                }
            }
            return Array.from(lineHints);
        }
        _installDblClickGesture(updateInlayHints) {
            return this._editor.onMouseUp(async (e) => {
                if (e.event.detail !== 2) {
                    return;
                }
                const part = this._getInlayHintLabelPart(e);
                if (!part) {
                    return;
                }
                e.event.preventDefault();
                await part.item.resolve(cancellation_1.CancellationToken.None);
                if ((0, arrays_1.isNonEmptyArray)(part.item.hint.textEdits)) {
                    const edits = part.item.hint.textEdits.map(edit => editOperation_1.EditOperation.replace(range_1.Range.lift(edit.range), edit.text));
                    this._editor.executeEdits('inlayHint.default', edits);
                    updateInlayHints();
                }
            });
        }
        _installContextMenu() {
            return this._editor.onContextMenu(async (e) => {
                if (!(e.event.target instanceof HTMLElement)) {
                    return;
                }
                const part = this._getInlayHintLabelPart(e);
                if (part) {
                    await this._instaService.invokeFunction(inlayHintsLocations_1.showGoToContextMenu, this._editor, e.event.target, part);
                }
            });
        }
        _getInlayHintLabelPart(e) {
            if (e.target.type !== 6 /* MouseTargetType.CONTENT_TEXT */) {
                return undefined;
            }
            const options = e.target.detail.injectedText?.options;
            if (options instanceof textModel_1.ModelDecorationInjectedTextOptions && options?.attachedData instanceof RenderedInlayHintLabelPart) {
                return options.attachedData;
            }
            return undefined;
        }
        async _invokeCommand(command, item) {
            try {
                await this._commandService.executeCommand(command.id, ...(command.arguments ?? []));
            }
            catch (err) {
                this._notificationService.notify({
                    severity: notification_1.Severity.Error,
                    source: item.provider.displayName,
                    message: err
                });
            }
        }
        _cacheHintsForFastRestore(model) {
            const hints = this._copyInlayHintsWithCurrentAnchor(model);
            this._inlayHintsCache.set(model, hints);
        }
        // return inlay hints but with an anchor that reflects "updates"
        // that happened after receiving them, e.g adding new lines before a hint
        _copyInlayHintsWithCurrentAnchor(model) {
            const items = new Map();
            for (const [id, obj] of this._decorationsMetadata) {
                if (items.has(obj.item)) {
                    // an inlay item can be rendered as multiple decorations
                    // but they will all uses the same range
                    continue;
                }
                const range = model.getDecorationRange(id);
                if (range) {
                    // update range with whatever the editor has tweaked it to
                    const anchor = new inlayHints_1.InlayHintAnchor(range, obj.item.anchor.direction);
                    const copy = obj.item.with({ anchor });
                    items.set(obj.item, copy);
                }
            }
            return Array.from(items.values());
        }
        _getHintsRanges() {
            const extra = 30;
            const model = this._editor.getModel();
            const visibleRanges = this._editor.getVisibleRangesPlusViewportAboveBelow();
            const result = [];
            for (const range of visibleRanges.sort(range_1.Range.compareRangesUsingStarts)) {
                const extendedRange = model.validateRange(new range_1.Range(range.startLineNumber - extra, range.startColumn, range.endLineNumber + extra, range.endColumn));
                if (result.length === 0 || !range_1.Range.areIntersectingOrTouching(result[result.length - 1], extendedRange)) {
                    result.push(extendedRange);
                }
                else {
                    result[result.length - 1] = range_1.Range.plusRange(result[result.length - 1], extendedRange);
                }
            }
            return result;
        }
        _updateHintsDecorators(ranges, items) {
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
                            [item.anchor.direction]: this._activeRenderMode === 0 /* RenderMode.Normal */ ? opts : undefined
                        }
                    }
                });
            };
            const addInjectedWhitespace = (item, isLast) => {
                const marginRule = this._ruleFactory.createClassNameRef({
                    width: `${(fontSize / 3) | 0}px`,
                    display: 'inline-block'
                });
                addInjectedText(item, marginRule, '\u200a', isLast ? model_1.InjectedTextCursorStops.Right : model_1.InjectedTextCursorStops.None);
            };
            //
            const { fontSize, fontFamily, padding, isUniform } = this._getLayoutInfo();
            const fontFamilyVar = '--code-editorInlayHintsFontFamily';
            this._editor.getContainerDomNode().style.setProperty(fontFamilyVar, fontFamily);
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
                    if ((0, arrays_1.isNonEmptyArray)(item.hint.textEdits)) {
                        cssProperties.cursor = 'default';
                    }
                    this._fillInColors(cssProperties, item.hint);
                    if ((part.command || part.location) && this._activeInlayHintPart?.part.item === item && this._activeInlayHintPart.part.index === i) {
                        // active link!
                        cssProperties.textDecoration = 'underline';
                        if (this._activeInlayHintPart.hasTriggerModifier) {
                            cssProperties.color = (0, themeService_1.themeColorFromId)(colors.editorActiveLinkForeground);
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
                    addInjectedText(item, this._ruleFactory.createClassNameRef(cssProperties), fixSpace(part.label), isLast && !item.hint.paddingRight ? model_1.InjectedTextCursorStops.Right : model_1.InjectedTextCursorStops.None, new RenderedInlayHintLabelPart(item, i));
                }
                // whitespace trailing the actual label
                if (item.hint.paddingRight) {
                    addInjectedWhitespace(item, true);
                }
                if (newDecorationsData.length > InlayHintsController_1._MAX_DECORATORS) {
                    break;
                }
            }
            // collect all decoration ids that are affected by the ranges
            // and only update those decorations
            const decorationIdsToReplace = [];
            for (const range of ranges) {
                for (const { id } of this._editor.getDecorationsInRange(range) ?? []) {
                    const metadata = this._decorationsMetadata.get(id);
                    if (metadata) {
                        decorationIdsToReplace.push(id);
                        metadata.classNameRef.dispose();
                        this._decorationsMetadata.delete(id);
                    }
                }
            }
            const scrollState = stableEditorScroll_1.StableEditorScrollState.capture(this._editor);
            this._editor.changeDecorations(accessor => {
                const newDecorationIds = accessor.deltaDecorations(decorationIdsToReplace, newDecorationsData.map(d => d.decoration));
                for (let i = 0; i < newDecorationIds.length; i++) {
                    const data = newDecorationsData[i];
                    this._decorationsMetadata.set(newDecorationIds[i], data);
                }
            });
            scrollState.restore(this._editor);
        }
        _fillInColors(props, hint) {
            if (hint.kind === languages.InlayHintKind.Parameter) {
                props.backgroundColor = (0, themeService_1.themeColorFromId)(colors.editorInlayHintParameterBackground);
                props.color = (0, themeService_1.themeColorFromId)(colors.editorInlayHintParameterForeground);
            }
            else if (hint.kind === languages.InlayHintKind.Type) {
                props.backgroundColor = (0, themeService_1.themeColorFromId)(colors.editorInlayHintTypeBackground);
                props.color = (0, themeService_1.themeColorFromId)(colors.editorInlayHintTypeForeground);
            }
            else {
                props.backgroundColor = (0, themeService_1.themeColorFromId)(colors.editorInlayHintBackground);
                props.color = (0, themeService_1.themeColorFromId)(colors.editorInlayHintForeground);
            }
        }
        _getLayoutInfo() {
            const options = this._editor.getOption(139 /* EditorOption.inlayHints */);
            const padding = options.padding;
            const editorFontSize = this._editor.getOption(52 /* EditorOption.fontSize */);
            const editorFontFamily = this._editor.getOption(49 /* EditorOption.fontFamily */);
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
        _removeAllDecorations() {
            this._editor.removeDecorations(Array.from(this._decorationsMetadata.keys()));
            for (const obj of this._decorationsMetadata.values()) {
                obj.classNameRef.dispose();
            }
            this._decorationsMetadata.clear();
        }
        // --- accessibility
        getInlayHintsForLine(line) {
            if (!this._editor.hasModel()) {
                return [];
            }
            const set = new Set();
            const result = [];
            for (const deco of this._editor.getLineDecorations(line)) {
                const data = this._decorationsMetadata.get(deco.id);
                if (data && !set.has(data.item.hint)) {
                    set.add(data.item.hint);
                    result.push(data.item);
                }
            }
            return result;
        }
    };
    exports.InlayHintsController = InlayHintsController;
    exports.InlayHintsController = InlayHintsController = InlayHintsController_1 = __decorate([
        __param(1, languageFeatures_1.ILanguageFeaturesService),
        __param(2, languageFeatureDebounce_1.ILanguageFeatureDebounceService),
        __param(3, IInlayHintsCache),
        __param(4, commands_1.ICommandService),
        __param(5, notification_1.INotificationService),
        __param(6, instantiation_1.IInstantiationService)
    ], InlayHintsController);
    // Prevents the view from potentially visible whitespace
    function fixSpace(str) {
        const noBreakWhitespace = '\xa0';
        return str.replace(/[ \t]/g, noBreakWhitespace);
    }
    commands_1.CommandsRegistry.registerCommand('_executeInlayHintProvider', async (accessor, ...args) => {
        const [uri, range] = args;
        (0, types_1.assertType)(uri_1.URI.isUri(uri));
        (0, types_1.assertType)(range_1.Range.isIRange(range));
        const { inlayHintsProvider } = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        const ref = await accessor.get(resolverService_1.ITextModelService).createModelReference(uri);
        try {
            const model = await inlayHints_1.InlayHintsFragments.create(inlayHintsProvider, ref.object.textEditorModel, [range_1.Range.lift(range)], cancellation_1.CancellationToken.None);
            const result = model.items.map(i => i.hint);
            setTimeout(() => model.dispose(), 0); // dispose after sending to ext host
            return result;
        }
        finally {
            ref.dispose();
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5sYXlIaW50c0NvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9pbmxheUhpbnRzL2Jyb3dzZXIvaW5sYXlIaW50c0NvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQW1DaEcseUNBQXlDO0lBRXpDLE1BQU0sZUFBZTtRQUFyQjtZQUlrQixhQUFRLEdBQUcsSUFBSSxjQUFRLENBQTBCLEVBQUUsQ0FBQyxDQUFDO1FBZXZFLENBQUM7UUFiQSxHQUFHLENBQUMsS0FBaUI7WUFDcEIsTUFBTSxHQUFHLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN4QyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFRCxHQUFHLENBQUMsS0FBaUIsRUFBRSxLQUFzQjtZQUM1QyxNQUFNLEdBQUcsR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBRU8sTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFpQjtZQUNwQyxPQUFPLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxLQUFLLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQztRQUMxRCxDQUFDO0tBQ0Q7SUFHRCxNQUFNLGdCQUFnQixHQUFHLElBQUEsK0JBQWUsRUFBbUIsa0JBQWtCLENBQUMsQ0FBQztJQUMvRSxJQUFBLDhCQUFpQixFQUFDLGdCQUFnQixFQUFFLGVBQWUsb0NBQTRCLENBQUM7SUFFaEYscUJBQXFCO0lBRXJCLE1BQWEsMEJBQTBCO1FBQ3RDLFlBQXFCLElBQW1C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