/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/hotReload", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/browser/config/elementSizeObserver"], function (require, exports, cancellation_1, hotReload_1, lifecycle_1, observable_1, elementSizeObserver_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DisposableCancellationTokenSource = exports.applyViewZones = exports.observeHotReloadableExports = exports.readHotReloadableExport = exports.applyStyle = exports.ManagedOverlayWidget = exports.PlaceholderViewZone = exports.ViewZoneOverlayWidget = exports.deepMerge = exports.animatedObservable = exports.ObservableElementSizeObserver = exports.observableConfigValue = exports.appendRemoveOnDispose = exports.applyObservableDecorations = exports.joinCombine = void 0;
    function joinCombine(arr1, arr2, keySelector, combine) {
        if (arr1.length === 0) {
            return arr2;
        }
        if (arr2.length === 0) {
            return arr1;
        }
        const result = [];
        let i = 0;
        let j = 0;
        while (i < arr1.length && j < arr2.length) {
            const val1 = arr1[i];
            const val2 = arr2[j];
            const key1 = keySelector(val1);
            const key2 = keySelector(val2);
            if (key1 < key2) {
                result.push(val1);
                i++;
            }
            else if (key1 > key2) {
                result.push(val2);
                j++;
            }
            else {
                result.push(combine(val1, val2));
                i++;
                j++;
            }
        }
        while (i < arr1.length) {
            result.push(arr1[i]);
            i++;
        }
        while (j < arr2.length) {
            result.push(arr2[j]);
            j++;
        }
        return result;
    }
    exports.joinCombine = joinCombine;
    // TODO make utility
    function applyObservableDecorations(editor, decorations) {
        const d = new lifecycle_1.DisposableStore();
        const decorationsCollection = editor.createDecorationsCollection();
        d.add((0, observable_1.autorunOpts)({ debugName: () => `Apply decorations from ${decorations.debugName}` }, reader => {
            const d = decorations.read(reader);
            decorationsCollection.set(d);
        }));
        d.add({
            dispose: () => {
                decorationsCollection.clear();
            }
        });
        return d;
    }
    exports.applyObservableDecorations = applyObservableDecorations;
    function appendRemoveOnDispose(parent, child) {
        parent.appendChild(child);
        return (0, lifecycle_1.toDisposable)(() => {
            parent.removeChild(child);
        });
    }
    exports.appendRemoveOnDispose = appendRemoveOnDispose;
    function observableConfigValue(key, defaultValue, configurationService) {
        return (0, observable_1.observableFromEvent)((handleChange) => configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(key)) {
                handleChange(e);
            }
        }), () => configurationService.getValue(key) ?? defaultValue);
    }
    exports.observableConfigValue = observableConfigValue;
    class ObservableElementSizeObserver extends lifecycle_1.Disposable {
        get width() { return this._width; }
        get height() { return this._height; }
        constructor(element, dimension) {
            super();
            this.elementSizeObserver = this._register(new elementSizeObserver_1.ElementSizeObserver(element, dimension));
            this._width = (0, observable_1.observableValue)(this, this.elementSizeObserver.getWidth());
            this._height = (0, observable_1.observableValue)(this, this.elementSizeObserver.getHeight());
            this._register(this.elementSizeObserver.onDidChange(e => (0, observable_1.transaction)(tx => {
                /** @description Set width/height from elementSizeObserver */
                this._width.set(this.elementSizeObserver.getWidth(), tx);
                this._height.set(this.elementSizeObserver.getHeight(), tx);
            })));
        }
        observe(dimension) {
            this.elementSizeObserver.observe(dimension);
        }
        setAutomaticLayout(automaticLayout) {
            if (automaticLayout) {
                this.elementSizeObserver.startObserving();
            }
            else {
                this.elementSizeObserver.stopObserving();
            }
        }
    }
    exports.ObservableElementSizeObserver = ObservableElementSizeObserver;
    function animatedObservable(base, store) {
        let targetVal = base.get();
        let startVal = targetVal;
        let curVal = targetVal;
        const result = (0, observable_1.observableValue)('animatedValue', targetVal);
        let animationStartMs = -1;
        const durationMs = 300;
        let animationFrame = undefined;
        store.add((0, observable_1.autorunHandleChanges)({
            createEmptyChangeSummary: () => ({ animate: false }),
            handleChange: (ctx, s) => {
                if (ctx.didChange(base)) {
                    s.animate = s.animate || ctx.change;
                }
                return true;
            }
        }, (reader, s) => {
            /** @description update value */
            if (animationFrame !== undefined) {
                cancelAnimationFrame(animationFrame);
                animationFrame = undefined;
            }
            startVal = curVal;
            targetVal = base.read(reader);
            animationStartMs = Date.now() - (s.animate ? 0 : durationMs);
            update();
        }));
        function update() {
            const passedMs = Date.now() - animationStartMs;
            curVal = Math.floor(easeOutExpo(passedMs, startVal, targetVal - startVal, durationMs));
            if (passedMs < durationMs) {
                animationFrame = requestAnimationFrame(update);
            }
            else {
                curVal = targetVal;
            }
            result.set(curVal, undefined);
        }
        return result;
    }
    exports.animatedObservable = animatedObservable;
    function easeOutExpo(t, b, c, d) {
        return t === d ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
    }
    function deepMerge(source1, source2) {
        const result = {};
        for (const key in source1) {
            result[key] = source1[key];
        }
        for (const key in source2) {
            const source2Value = source2[key];
            if (typeof result[key] === 'object' && source2Value && typeof source2Value === 'object') {
                result[key] = deepMerge(result[key], source2Value);
            }
            else {
                result[key] = source2Value;
            }
        }
        return result;
    }
    exports.deepMerge = deepMerge;
    class ViewZoneOverlayWidget extends lifecycle_1.Disposable {
        constructor(editor, viewZone, htmlElement) {
            super();
            this._register(new ManagedOverlayWidget(editor, htmlElement));
            this._register(applyStyle(htmlElement, {
                height: viewZone.actualHeight,
                top: viewZone.actualTop,
            }));
        }
    }
    exports.ViewZoneOverlayWidget = ViewZoneOverlayWidget;
    class PlaceholderViewZone {
        get afterLineNumber() { return this._afterLineNumber.get(); }
        constructor(_afterLineNumber, heightInPx) {
            this._afterLineNumber = _afterLineNumber;
            this.heightInPx = heightInPx;
            this.domNode = document.createElement('div');
            this._actualTop = (0, observable_1.observableValue)(this, undefined);
            this._actualHeight = (0, observable_1.observableValue)(this, undefined);
            this.actualTop = this._actualTop;
            this.actualHeight = this._actualHeight;
            this.showInHiddenAreas = true;
            this.onChange = this._afterLineNumber;
            this.onDomNodeTop = (top) => {
                this._actualTop.set(top, undefined);
            };
            this.onComputedHeight = (height) => {
                this._actualHeight.set(height, undefined);
            };
        }
    }
    exports.PlaceholderViewZone = PlaceholderViewZone;
    class ManagedOverlayWidget {
        static { this._counter = 0; }
        constructor(_editor, _domElement) {
            this._editor = _editor;
            this._domElement = _domElement;
            this._overlayWidgetId = `managedOverlayWidget-${ManagedOverlayWidget._counter++}`;
            this._overlayWidget = {
                getId: () => this._overlayWidgetId,
                getDomNode: () => this._domElement,
                getPosition: () => null
            };
            this._editor.addOverlayWidget(this._overlayWidget);
        }
        dispose() {
            this._editor.removeOverlayWidget(this._overlayWidget);
        }
    }
    exports.ManagedOverlayWidget = ManagedOverlayWidget;
    function applyStyle(domNode, style) {
        return (0, observable_1.autorun)(reader => {
            /** @description applyStyle */
            for (let [key, val] of Object.entries(style)) {
                if (val && typeof val === 'object' && 'read' in val) {
                    val = val.read(reader);
                }
                if (typeof val === 'number') {
                    val = `${val}px`;
                }
                key = key.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
                domNode.style[key] = val;
            }
        });
    }
    exports.applyStyle = applyStyle;
    function readHotReloadableExport(value, reader) {
        observeHotReloadableExports([value], reader);
        return value;
    }
    exports.readHotReloadableExport = readHotReloadableExport;
    function observeHotReloadableExports(values, reader) {
        if ((0, hotReload_1.isHotReloadEnabled)()) {
            const o = (0, observable_1.observableSignalFromEvent)('reload', event => (0, hotReload_1.registerHotReloadHandler)(oldExports => {
                if (![...Object.values(oldExports)].some(v => values.includes(v))) {
                    return undefined;
                }
                return (_newExports) => {
                    event(undefined);
                    return true;
                };
            }));
            o.read(reader);
        }
    }
    exports.observeHotReloadableExports = observeHotReloadableExports;
    function applyViewZones(editor, viewZones, setIsUpdating) {
        const store = new lifecycle_1.DisposableStore();
        const lastViewZoneIds = [];
        store.add((0, observable_1.autorun)(reader => {
            /** @description applyViewZones */
            const curViewZones = viewZones.read(reader);
            const viewZonIdsPerViewZone = new Map();
            const viewZoneIdPerOnChangeObservable = new Map();
            if (setIsUpdating) {
                setIsUpdating(true);
            }
            editor.changeViewZones(a => {
                for (const id of lastViewZoneIds) {
                    a.removeZone(id);
                }
                lastViewZoneIds.length = 0;
                for (const z of curViewZones) {
                    const id = a.addZone(z);
                    lastViewZoneIds.push(id);
                    viewZonIdsPerViewZone.set(z, id);
                }
            });
            if (setIsUpdating) {
                setIsUpdating(false);
            }
            store.add((0, observable_1.autorunHandleChanges)({
                createEmptyChangeSummary() {
                    return [];
                },
                handleChange(context, changeSummary) {
                    const id = viewZoneIdPerOnChangeObservable.get(context.changedObservable);
                    if (id !== undefined) {
                        changeSummary.push(id);
                    }
                    return true;
                },
            }, (reader, changeSummary) => {
                /** @description layoutZone on change */
                for (const vz of curViewZones) {
                    if (vz.onChange) {
                        viewZoneIdPerOnChangeObservable.set(vz.onChange, viewZonIdsPerViewZone.get(vz));
                        vz.onChange.read(reader);
                    }
                }
                if (setIsUpdating) {
                    setIsUpdating(true);
                }
                editor.changeViewZones(a => { for (const id of changeSummary) {
                    a.layoutZone(id);
                } });
                if (setIsUpdating) {
                    setIsUpdating(false);
                }
            }));
        }));
        store.add({
            dispose() {
                if (setIsUpdating) {
                    setIsUpdating(true);
                }
                editor.changeViewZones(a => { for (const id of lastViewZoneIds) {
                    a.removeZone(id);
                } });
                if (setIsUpdating) {
                    setIsUpdating(false);
                }
            }
        });
        return store;
    }
    exports.applyViewZones = applyViewZones;
    class DisposableCancellationTokenSource extends cancellation_1.CancellationTokenSource {
        dispose() {
            super.dispose(true);
        }
    }
    exports.DisposableCancellationTokenSource = DisposableCancellationTokenSource;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci93aWRnZXQvZGlmZkVkaXRvci91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFZaEcsU0FBZ0IsV0FBVyxDQUFJLElBQWtCLEVBQUUsSUFBa0IsRUFBRSxXQUErQixFQUFFLE9BQTRCO1FBQ25JLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDdEIsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUNELElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDdEIsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUVELE1BQU0sTUFBTSxHQUFRLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDVixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDVixPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQzFDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsTUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQy9CLE1BQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUUvQixJQUFJLElBQUksR0FBRyxJQUFJLEVBQUU7Z0JBQ2hCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2xCLENBQUMsRUFBRSxDQUFDO2FBQ0o7aUJBQU0sSUFBSSxJQUFJLEdBQUcsSUFBSSxFQUFFO2dCQUN2QixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNsQixDQUFD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