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
define(["require", "exports", "vs/base/browser/browser", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/platform", "vs/editor/browser/config/elementSizeObserver", "vs/editor/browser/config/fontMeasurements", "vs/editor/browser/config/migrateOptions", "vs/editor/browser/config/tabFocus", "vs/editor/common/config/editorOptions", "vs/editor/common/config/editorZoom", "vs/editor/common/config/fontInfo", "vs/platform/accessibility/common/accessibility"], function (require, exports, browser, arrays, event_1, lifecycle_1, objects, platform, elementSizeObserver_1, fontMeasurements_1, migrateOptions_1, tabFocus_1, editorOptions_1, editorZoom_1, fontInfo_1, accessibility_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$EU = exports.$DU = void 0;
    let $DU = class $DU extends lifecycle_1.$kc {
        constructor(isSimpleWidget, options, container, z) {
            super();
            this.z = z;
            this.c = this.B(new event_1.$fd());
            this.onDidChange = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onDidChangeFast = this.f.event;
            this.h = false;
            this.j = 1;
            this.m = 1;
            this.s = 0;
            this.t = 1;
            this.u = new editorOptions_1.ComputeOptionsMemory();
            this.isSimpleWidget = isSimpleWidget;
            this.g = this.B(new elementSizeObserver_1.$uU(container, options.dimension));
            this.w = deepCloneAndMigrateOptions(options);
            this.y = EditorOptionsUtil.validateOptions(this.w);
            this.options = this.D();
            if (this.options.get(13 /* EditorOption.automaticLayout */)) {
                this.g.startObserving();
            }
            this.B(editorZoom_1.EditorZoom.onDidChangeZoomLevel(() => this.C()));
            this.B(tabFocus_1.$CU.onDidChangeTabFocus(() => this.C()));
            this.B(this.g.onDidChange(() => this.C()));
            this.B(fontMeasurements_1.$zU.onDidChange(() => this.C()));
            this.B(browser.$WN.onDidChange(() => this.C()));
            this.B(this.z.onDidChangeScreenReaderOptimized(() => this.C()));
        }
        C() {
            const newOptions = this.D();
            const changeEvent = EditorOptionsUtil.checkEquals(this.options, newOptions);
            if (changeEvent === null) {
                // nothing changed!
                return;
            }
            this.options = newOptions;
            this.f.fire(changeEvent);
            this.c.fire(changeEvent);
        }
        D() {
            const partialEnv = this.F();
            const bareFontInfo = fontInfo_1.$Rr.createFromValidatedSettings(this.y, partialEnv.pixelRatio, this.isSimpleWidget);
            const fontInfo = this.G(bareFontInfo);
            const env = {
                memory: this.u,
                outerWidth: partialEnv.outerWidth,
                outerHeight: partialEnv.outerHeight - this.s,
                fontInfo: fontInfo,
                extraEditorClassName: partialEnv.extraEditorClassName,
                isDominatedByLongLines: this.h,
                viewLineCount: this.j,
                lineNumbersDigitCount: this.m,
                emptySelectionClipboard: partialEnv.emptySelectionClipboard,
                pixelRatio: partialEnv.pixelRatio,
                tabFocusMode: tabFocus_1.$CU.getTabFocusMode(),
                accessibilitySupport: partialEnv.accessibilitySupport,
                glyphMarginDecorationLaneCount: this.t
            };
            return EditorOptionsUtil.computeOptions(this.y, env);
        }
        F() {
            return {
                extraEditorClassName: getExtraEditorClassName(),
                outerWidth: this.g.getWidth(),
                outerHeight: this.g.getHeight(),
                emptySelectionClipboard: browser.$6N || browser.$5N,
                pixelRatio: browser.$WN.value,
                accessibilitySupport: (this.z.isScreenReaderOptimized()
                    ? 2 /* AccessibilitySupport.Enabled */
                    : this.z.getAccessibilitySupport())
            };
        }
        G(bareFontInfo) {
            return fontMeasurements_1.$zU.readFontInfo(bareFontInfo);
        }
        getRawOptions() {
            return this.w;
        }
        updateOptions(_newOptions) {
            const newOptions = deepCloneAndMigrateOptions(_newOptions);
            const didChange = EditorOptionsUtil.applyUpdate(this.w, newOptions);
            if (!didChange) {
                return;
            }
            this.y = EditorOptionsUtil.validateOptions(this.w);
            this.C();
        }
        observeContainer(dimension) {
            this.g.observe(dimension);
        }
        setIsDominatedByLongLines(isDominatedByLongLines) {
            if (this.h === isDominatedByLongLines) {
                return;
            }
            this.h = isDominatedByLongLines;
            this.C();
        }
        setModelLineCount(modelLineCount) {
            const lineNumbersDigitCount = digitCount(modelLineCount);
            if (this.m === lineNumbersDigitCount) {
                return;
            }
            this.m = lineNumbersDigitCount;
            this.C();
        }
        setViewLineCount(viewLineCount) {
            if (this.j === viewLineCount) {
                return;
            }
            this.j = viewLineCount;
            this.C();
        }
        setReservedHeight(reservedHeight) {
            if (this.s === reservedHeight) {
                return;
            }
            this.s = reservedHeight;
            this.C();
        }
        setGlyphMarginDecorationLaneCount(decorationLaneCount) {
            if (this.t === decorationLaneCount) {
                return;
            }
            this.t = decorationLaneCount;
            this.C();
        }
    };
    exports.$DU = $DU;
    exports.$DU = $DU = __decorate([
        __param(3, accessibility_1.$1r)
    ], $DU);
    function digitCount(n) {
        let r = 0;
        while (n) {
            n = Math.floor(n / 10);
            r++;
        }
        return r ? r : 1;
    }
    function getExtraEditorClassName() {
        let extra = '';
        if (!browser.$8N && !browser.$9N) {
            // Use user-select: none in all browsers except Safari and native macOS WebView
            extra += 'no-user-select ';
        }
        if (browser.$8N) {
            // See https://github.com/microsoft/vscode/issues/108822
            extra += 'no-minimap-shadow ';
            extra += 'enable-user-select ';
        }
        if (platform.$j) {
            extra += 'mac ';
        }
        return extra;
    }
    class ValidatedEditorOptions {
        constructor() {
            this.c = [];
        }
        _read(option) {
            return this.c[option];
        }
        get(id) {
            return this.c[id];
        }
        _write(option, value) {
            this.c[option] = value;
        }
    }
    class $EU {
        constructor() {
            this.c = [];
        }
        _read(id) {
            if (id >= this.c.length) {
                throw new Error('Cannot read uninitialized value');
            }
            return this.c[id];
        }
        get(id) {
            return this._read(id);
        }
        _write(id, value) {
            this.c[id] = value;
        }
    }
    exports.$EU = $EU;
    class EditorOptionsUtil {
        static validateOptions(options) {
            const result = new ValidatedEditorOptions();
            for (const editorOption of editorOptions_1.editorOptionsRegistry) {
                const value = (editorOption.name === '_never_' ? undefined : options[editorOption.name]);
                result._write(editorOption.id, editorOption.validate(value));
            }
            return result;
        }
        static computeOptions(options, env) {
            const result = new $EU();
            for (const editorOption of editorOptions_1.editorOptionsRegistry) {
                result._write(editorOption.id, editorOption.compute(env, result, options._read(editorOption.id)));
            }
            return result;
        }
        static c(a, b) {
            if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) {
                return a === b;
            }
            if (Array.isArray(a) || Array.isArray(b)) {
                return (Array.isArray(a) && Array.isArray(b) ? arrays.$sb(a, b) : false);
            }
            if (Object.keys(a).length !== Object.keys(b).length) {
                return false;
            }
            for (const key in a) {
                if (!EditorOptionsUtil.c(a[key], b[key])) {
                    return false;
                }
            }
            return true;
        }
        static checkEquals(a, b) {
            const result = [];
            let somethingChanged = false;
            for (const editorOption of editorOptions_1.editorOptionsRegistry) {
                const changed = !EditorOptionsUtil.c(a._read(editorOption.id), b._read(editorOption.id));
                result[editorOption.id] = changed;
                if (changed) {
                    somethingChanged = true;
                }
            }
            return (somethingChanged ? new editorOptions_1.ConfigurationChangedEvent(result) : null);
        }
        /**
         * Returns true if something changed.
         * Modifies `options`.
        */
        static applyUpdate(options, update) {
            let changed = false;
            for (const editorOption of editorOptions_1.editorOptionsRegistry) {
                if (update.hasOwnProperty(editorOption.name)) {
                    const result = editorOption.applyUpdate(options[editorOption.name], update[editorOption.name]);
                    options[editorOption.name] = result.newValue;
                    changed = changed || result.didChange;
                }
            }
            return changed;
        }
    }
    function deepCloneAndMigrateOptions(_options) {
        const options = objects.$Vm(_options);
        (0, migrateOptions_1.$BU)(options);
        return options;
    }
});
//# sourceMappingURL=editorConfiguration.js.map