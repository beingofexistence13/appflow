/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/hotReload", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/browser/config/elementSizeObserver"], function (require, exports, cancellation_1, hotReload_1, lifecycle_1, observable_1, elementSizeObserver_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$jZ = exports.$iZ = exports.$hZ = exports.$gZ = exports.$fZ = exports.$eZ = exports.$dZ = exports.$cZ = exports.$bZ = exports.$aZ = exports.$_Y = exports.$$Y = exports.$0Y = exports.$9Y = exports.$8Y = void 0;
    function $8Y(arr1, arr2, keySelector, combine) {
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
    exports.$8Y = $8Y;
    // TODO make utility
    function $9Y(editor, decorations) {
        const d = new lifecycle_1.$jc();
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
    exports.$9Y = $9Y;
    function $0Y(parent, child) {
        parent.appendChild(child);
        return (0, lifecycle_1.$ic)(() => {
            parent.removeChild(child);
        });
    }
    exports.$0Y = $0Y;
    function $$Y(key, defaultValue, configurationService) {
        return (0, observable_1.observableFromEvent)((handleChange) => configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(key)) {
                handleChange(e);
            }
        }), () => configurationService.getValue(key) ?? defaultValue);
    }
    exports.$$Y = $$Y;
    class $_Y extends lifecycle_1.$kc {
        get width() { return this.g; }
        get height() { return this.h; }
        constructor(element, dimension) {
            super();
            this.f = this.B(new elementSizeObserver_1.$uU(element, dimension));
            this.g = (0, observable_1.observableValue)(this, this.f.getWidth());
            this.h = (0, observable_1.observableValue)(this, this.f.getHeight());
            this.B(this.f.onDidChange(e => (0, observable_1.transaction)(tx => {
                /** @description Set width/height from elementSizeObserver */
                this.g.set(this.f.getWidth(), tx);
                this.h.set(this.f.getHeight(), tx);
            })));
        }
        observe(dimension) {
            this.f.observe(dimension);
        }
        setAutomaticLayout(automaticLayout) {
            if (automaticLayout) {
                this.f.startObserving();
            }
            else {
                this.f.stopObserving();
            }
        }
    }
    exports.$_Y = $_Y;
    function $aZ(base, store) {
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
    exports.$aZ = $aZ;
    function easeOutExpo(t, b, c, d) {
        return t === d ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
    }
    function $bZ(source1, source2) {
        const result = {};
        for (const key in source1) {
            result[key] = source1[key];
        }
        for (const key in source2) {
            const source2Value = source2[key];
            if (typeof result[key] === 'object' && source2Value && typeof source2Value === 'object') {
                result[key] = $bZ(result[key], source2Value);
            }
            else {
                result[key] = source2Value;
            }
        }
        return result;
    }
    exports.$bZ = $bZ;
    class $cZ extends lifecycle_1.$kc {
        constructor(editor, viewZone, htmlElement) {
            super();
            this.B(new $eZ(editor, htmlElement));
            this.B($fZ(htmlElement, {
                height: viewZone.actualHeight,
                top: viewZone.actualTop,
            }));
        }
    }
    exports.$cZ = $cZ;
    class $dZ {
        get afterLineNumber() { return this.h.get(); }
        constructor(h, heightInPx) {
            this.h = h;
            this.heightInPx = heightInPx;
            this.domNode = document.createElement('div');
            this.f = (0, observable_1.observableValue)(this, undefined);
            this.g = (0, observable_1.observableValue)(this, undefined);
            this.actualTop = this.f;
            this.actualHeight = this.g;
            this.showInHiddenAreas = true;
            this.onChange = this.h;
            this.onDomNodeTop = (top) => {
                this.f.set(top, undefined);
            };
            this.onComputedHeight = (height) => {
                this.g.set(height, undefined);
            };
        }
    }
    exports.$dZ = $dZ;
    class $eZ {
        static { this.f = 0; }
        constructor(k, l) {
            this.k = k;
            this.l = l;
            this.g = `managedOverlayWidget-${$eZ.f++}`;
            this.h = {
                getId: () => this.g,
                getDomNode: () => this.l,
                getPosition: () => null
            };
            this.k.addOverlayWidget(this.h);
        }
        dispose() {
            this.k.removeOverlayWidget(this.h);
        }
    }
    exports.$eZ = $eZ;
    function $fZ(domNode, style) {
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
    exports.$fZ = $fZ;
    function $gZ(value, reader) {
        $hZ([value], reader);
        return value;
    }
    exports.$gZ = $gZ;
    function $hZ(values, reader) {
        if ((0, hotReload_1.$tS)()) {
            const o = (0, observable_1.observableSignalFromEvent)('reload', event => (0, hotReload_1.$uS)(oldExports => {
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
    exports.$hZ = $hZ;
    function $iZ(editor, viewZones, setIsUpdating) {
        const store = new lifecycle_1.$jc();
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
    exports.$iZ = $iZ;
    class $jZ extends cancellation_1.$pd {
        dispose() {
            super.dispose(true);
        }
    }
    exports.$jZ = $jZ;
});
//# sourceMappingURL=utils.js.map