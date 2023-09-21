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
    exports.ComputedEditorOptions = exports.EditorConfiguration = void 0;
    let EditorConfiguration = class EditorConfiguration extends lifecycle_1.Disposable {
        constructor(isSimpleWidget, options, container, _accessibilityService) {
            super();
            this._accessibilityService = _accessibilityService;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._onDidChangeFast = this._register(new event_1.Emitter());
            this.onDidChangeFast = this._onDidChangeFast.event;
            this._isDominatedByLongLines = false;
            this._viewLineCount = 1;
            this._lineNumbersDigitCount = 1;
            this._reservedHeight = 0;
            this._glyphMarginDecorationLaneCount = 1;
            this._computeOptionsMemory = new editorOptions_1.ComputeOptionsMemory();
            this.isSimpleWidget = isSimpleWidget;
            this._containerObserver = this._register(new elementSizeObserver_1.ElementSizeObserver(container, options.dimension));
            this._rawOptions = deepCloneAndMigrateOptions(options);
            this._validatedOptions = EditorOptionsUtil.validateOptions(this._rawOptions);
            this.options = this._computeOptions();
            if (this.options.get(13 /* EditorOption.automaticLayout */)) {
                this._containerObserver.startObserving();
            }
            this._register(editorZoom_1.EditorZoom.onDidChangeZoomLevel(() => this._recomputeOptions()));
            this._register(tabFocus_1.TabFocus.onDidChangeTabFocus(() => this._recomputeOptions()));
            this._register(this._containerObserver.onDidChange(() => this._recomputeOptions()));
            this._register(fontMeasurements_1.FontMeasurements.onDidChange(() => this._recomputeOptions()));
            this._register(browser.PixelRatio.onDidChange(() => this._recomputeOptions()));
            this._register(this._accessibilityService.onDidChangeScreenReaderOptimized(() => this._recomputeOptions()));
        }
        _recomputeOptions() {
            const newOptions = this._computeOptions();
            const changeEvent = EditorOptionsUtil.checkEquals(this.options, newOptions);
            if (changeEvent === null) {
                // nothing changed!
                return;
            }
            this.options = newOptions;
            this._onDidChangeFast.fire(changeEvent);
            this._onDidChange.fire(changeEvent);
        }
        _computeOptions() {
            const partialEnv = this._readEnvConfiguration();
            const bareFontInfo = fontInfo_1.BareFontInfo.createFromValidatedSettings(this._validatedOptions, partialEnv.pixelRatio, this.isSimpleWidget);
            const fontInfo = this._readFontInfo(bareFontInfo);
            const env = {
                memory: this._computeOptionsMemory,
                outerWidth: partialEnv.outerWidth,
                outerHeight: partialEnv.outerHeight - this._reservedHeight,
                fontInfo: fontInfo,
                extraEditorClassName: partialEnv.extraEditorClassName,
                isDominatedByLongLines: this._isDominatedByLongLines,
                viewLineCount: this._viewLineCount,
                lineNumbersDigitCount: this._lineNumbersDigitCount,
                emptySelectionClipboard: partialEnv.emptySelectionClipboard,
                pixelRatio: partialEnv.pixelRatio,
                tabFocusMode: tabFocus_1.TabFocus.getTabFocusMode(),
                accessibilitySupport: partialEnv.accessibilitySupport,
                glyphMarginDecorationLaneCount: this._glyphMarginDecorationLaneCount
            };
            return EditorOptionsUtil.computeOptions(this._validatedOptions, env);
        }
        _readEnvConfiguration() {
            return {
                extraEditorClassName: getExtraEditorClassName(),
                outerWidth: this._containerObserver.getWidth(),
                outerHeight: this._containerObserver.getHeight(),
                emptySelectionClipboard: browser.isWebKit || browser.isFirefox,
                pixelRatio: browser.PixelRatio.value,
                accessibilitySupport: (this._accessibilityService.isScreenReaderOptimized()
                    ? 2 /* AccessibilitySupport.Enabled */
                    : this._accessibilityService.getAccessibilitySupport())
            };
        }
        _readFontInfo(bareFontInfo) {
            return fontMeasurements_1.FontMeasurements.readFontInfo(bareFontInfo);
        }
        getRawOptions() {
            return this._rawOptions;
        }
        updateOptions(_newOptions) {
            const newOptions = deepCloneAndMigrateOptions(_newOptions);
            const didChange = EditorOptionsUtil.applyUpdate(this._rawOptions, newOptions);
            if (!didChange) {
                return;
            }
            this._validatedOptions = EditorOptionsUtil.validateOptions(this._rawOptions);
            this._recomputeOptions();
        }
        observeContainer(dimension) {
            this._containerObserver.observe(dimension);
        }
        setIsDominatedByLongLines(isDominatedByLongLines) {
            if (this._isDominatedByLongLines === isDominatedByLongLines) {
                return;
            }
            this._isDominatedByLongLines = isDominatedByLongLines;
            this._recomputeOptions();
        }
        setModelLineCount(modelLineCount) {
            const lineNumbersDigitCount = digitCount(modelLineCount);
            if (this._lineNumbersDigitCount === lineNumbersDigitCount) {
                return;
            }
            this._lineNumbersDigitCount = lineNumbersDigitCount;
            this._recomputeOptions();
        }
        setViewLineCount(viewLineCount) {
            if (this._viewLineCount === viewLineCount) {
                return;
            }
            this._viewLineCount = viewLineCount;
            this._recomputeOptions();
        }
        setReservedHeight(reservedHeight) {
            if (this._reservedHeight === reservedHeight) {
                return;
            }
            this._reservedHeight = reservedHeight;
            this._recomputeOptions();
        }
        setGlyphMarginDecorationLaneCount(decorationLaneCount) {
            if (this._glyphMarginDecorationLaneCount === decorationLaneCount) {
                return;
            }
            this._glyphMarginDecorationLaneCount = decorationLaneCount;
            this._recomputeOptions();
        }
    };
    exports.EditorConfiguration = EditorConfiguration;
    exports.EditorConfiguration = EditorConfiguration = __decorate([
        __param(3, accessibility_1.IAccessibilityService)
    ], EditorConfiguration);
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
        if (!browser.isSafari && !browser.isWebkitWebView) {
            // Use user-select: none in all browsers except Safari and native macOS WebView
            extra += 'no-user-select ';
        }
        if (browser.isSafari) {
            // See https://github.com/microsoft/vscode/issues/108822
            extra += 'no-minimap-shadow ';
            extra += 'enable-user-select ';
        }
        if (platform.isMacintosh) {
            extra += 'mac ';
        }
        return extra;
    }
    class ValidatedEditorOptions {
        constructor() {
            this._values = [];
        }
        _read(option) {
            return this._values[option];
        }
        get(id) {
            return this._values[id];
        }
        _write(option, value) {
            this._values[option] = value;
        }
    }
    class ComputedEditorOptions {
        constructor() {
            this._values = [];
        }
        _read(id) {
            if (id >= this._values.length) {
                throw new Error('Cannot read uninitialized value');
            }
            return this._values[id];
        }
        get(id) {
            return this._read(id);
        }
        _write(id, value) {
            this._values[id] = value;
        }
    }
    exports.ComputedEditorOptions = ComputedEditorOptions;
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
            const result = new ComputedEditorOptions();
            for (const editorOption of editorOptions_1.editorOptionsRegistry) {
                result._write(editorOption.id, editorOption.compute(env, result, options._read(editorOption.id)));
            }
            return result;
        }
        static _deepEquals(a, b) {
            if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) {
                return a === b;
            }
            if (Array.isArray(a) || Array.isArray(b)) {
                return (Array.isArray(a) && Array.isArray(b) ? arrays.equals(a, b) : false);
            }
            if (Object.keys(a).length !== Object.keys(b).length) {
                return false;
            }
            for (const key in a) {
                if (!EditorOptionsUtil._deepEquals(a[key], b[key])) {
                    return false;
                }
            }
            return true;
        }
        static checkEquals(a, b) {
            const result = [];
            let somethingChanged = false;
            for (const editorOption of editorOptions_1.editorOptionsRegistry) {
                const changed = !EditorOptionsUtil._deepEquals(a._read(editorOption.id), b._read(editorOption.id));
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
        const options = objects.deepClone(_options);
        (0, migrateOptions_1.migrateOptions)(options);
        return options;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yQ29uZmlndXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL2NvbmZpZy9lZGl0b3JDb25maWd1cmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQStCekYsSUFBTSxtQkFBbUIsR0FBekIsTUFBTSxtQkFBb0IsU0FBUSxzQkFBVTtRQStCbEQsWUFDQyxjQUF1QixFQUN2QixPQUE2QyxFQUM3QyxTQUE2QixFQUNOLHFCQUE2RDtZQUVwRixLQUFLLEVBQUUsQ0FBQztZQUZnQywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBakM3RSxpQkFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQTZCLENBQUMsQ0FBQztZQUNoRSxnQkFBVyxHQUFxQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQztZQUVoRixxQkFBZ0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUE2QixDQUFDLENBQUM7WUFDcEUsb0JBQWUsR0FBcUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQztZQUt4Riw0QkFBdUIsR0FBWSxLQUFLLENBQUM7WUFDekMsbUJBQWMsR0FBVyxDQUFDLENBQUM7WUFDM0IsMkJBQXNCLEdBQVcsQ0FBQyxDQUFDO1lBQ25DLG9CQUFlLEdBQVcsQ0FBQyxDQUFDO1lBQzVCLG9DQUErQixHQUFXLENBQUMsQ0FBQztZQUVuQywwQkFBcUIsR0FBeUIsSUFBSSxvQ0FBb0IsRUFBRSxDQUFDO1lBcUJ6RixJQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztZQUNyQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLHlDQUFtQixDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUVoRyxJQUFJLENBQUMsV0FBVyxHQUFHLDBCQUEwQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzdFLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBRXRDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLHVDQUE4QixFQUFFO2dCQUNuRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsY0FBYyxFQUFFLENBQUM7YUFDekM7WUFFRCxJQUFJLENBQUMsU0FBUyxDQUFDLHVCQUFVLENBQUMsb0JBQW9CLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2hGLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0UsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNwRixJQUFJLENBQUMsU0FBUyxDQUFDLG1DQUFnQixDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0UsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDL0UsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsZ0NBQWdDLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzdHLENBQUM7UUFFTyxpQkFBaUI7WUFDeEIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQzFDLE1BQU0sV0FBVyxHQUFHLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzVFLElBQUksV0FBVyxLQUFLLElBQUksRUFBRTtnQkFDekIsbUJBQW1CO2dCQUNuQixPQUFPO2FBQ1A7WUFFRCxJQUFJLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQztZQUMxQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFFTyxlQUFlO1lBQ3RCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQ2hELE1BQU0sWUFBWSxHQUFHLHVCQUFZLENBQUMsMkJBQTJCLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLFVBQVUsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ2xJLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDbEQsTUFBTSxHQUFHLEdBQTBCO2dCQUNsQyxNQUFNLEVBQUUsSUFBSSxDQUFDLHFCQUFxQjtnQkFDbEMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxVQUFVO2dCQUNqQyxXQUFXLEVBQUUsVUFBVSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsZUFBZTtnQkFDMUQsUUFBUSxFQUFFLFFBQVE7Z0JBQ2xCLG9CQUFvQixFQUFFLFVBQVUsQ0FBQyxvQkFBb0I7Z0JBQ3JELHNCQUFzQixFQUFFLElBQUksQ0FBQyx1QkFBdUI7Z0JBQ3BELGFBQWEsRUFBRSxJQUFJLENBQUMsY0FBYztnQkFDbEMscUJBQXFCLEVBQUUsSUFBSSxDQUFDLHNCQUFzQjtnQkFDbEQsdUJBQXVCLEVBQUUsVUFBVSxDQUFDLHVCQUF1QjtnQkFDM0QsVUFBVSxFQUFFLFVBQVUsQ0FBQyxVQUFVO2dCQUNqQyxZQUFZLEVBQUUsbUJBQVEsQ0FBQyxlQUFlLEVBQUU7Z0JBQ3hDLG9CQUFvQixFQUFFLFVBQVUsQ0FBQyxvQkFBb0I7Z0JBQ3JELDhCQUE4QixFQUFFLElBQUksQ0FBQywrQkFBK0I7YUFDcEUsQ0FBQztZQUNGLE9BQU8saUJBQWlCLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN0RSxDQUFDO1FBRVMscUJBQXFCO1lBQzlCLE9BQU87Z0JBQ04sb0JBQW9CLEVBQUUsdUJBQXVCLEVBQUU7Z0JBQy9DLFVBQVUsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFO2dCQUM5QyxXQUFXLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsRUFBRTtnQkFDaEQsdUJBQXVCLEVBQUUsT0FBTyxDQUFDLFFBQVEsSUFBSSxPQUFPLENBQUMsU0FBUztnQkFDOUQsVUFBVSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSztnQkFDcEMsb0JBQW9CLEVBQUUsQ0FDckIsSUFBSSxDQUFDLHFCQUFxQixDQUFDLHVCQUF1QixFQUFFO29CQUNuRCxDQUFDO29CQUNELENBQUMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsdUJBQXVCLEVBQUUsQ0FDdkQ7YUFDRCxDQUFDO1FBQ0gsQ0FBQztRQUVTLGFBQWEsQ0FBQyxZQUEwQjtZQUNqRCxPQUFPLG1DQUFnQixDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNwRCxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDekIsQ0FBQztRQUVNLGFBQWEsQ0FBQyxXQUFxQztZQUN6RCxNQUFNLFVBQVUsR0FBRywwQkFBMEIsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUUzRCxNQUFNLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUM5RSxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNmLE9BQU87YUFDUDtZQUVELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzdFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFFTSxnQkFBZ0IsQ0FBQyxTQUFzQjtZQUM3QyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFFTSx5QkFBeUIsQ0FBQyxzQkFBK0I7WUFDL0QsSUFBSSxJQUFJLENBQUMsdUJBQXVCLEtBQUssc0JBQXNCLEVBQUU7Z0JBQzVELE9BQU87YUFDUDtZQUNELElBQUksQ0FBQyx1QkFBdUIsR0FBRyxzQkFBc0IsQ0FBQztZQUN0RCxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBRU0saUJBQWlCLENBQUMsY0FBc0I7WUFDOUMsTUFBTSxxQkFBcUIsR0FBRyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDekQsSUFBSSxJQUFJLENBQUMsc0JBQXNCLEtBQUsscUJBQXFCLEVBQUU7Z0JBQzFELE9BQU87YUFDUDtZQUNELElBQUksQ0FBQyxzQkFBc0IsR0FBRyxxQkFBcUIsQ0FBQztZQUNwRCxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBRU0sZ0JBQWdCLENBQUMsYUFBcUI7WUFDNUMsSUFBSSxJQUFJLENBQUMsY0FBYyxLQUFLLGFBQWEsRUFBRTtnQkFDMUMsT0FBTzthQUNQO1lBQ0QsSUFBSSxDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUM7WUFDcEMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUVNLGlCQUFpQixDQUFDLGNBQXNCO1lBQzlDLElBQUksSUFBSSxDQUFDLGVBQWUsS0FBSyxjQUFjLEVBQUU7Z0JBQzVDLE9BQU87YUFDUDtZQUNELElBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFFTSxpQ0FBaUMsQ0FBQyxtQkFBMkI7WUFDbkUsSUFBSSxJQUFJLENBQUMsK0JBQStCLEtBQUssbUJBQW1CLEVBQUU7Z0JBQ2pFLE9BQU87YUFDUDtZQUNELElBQUksQ0FBQywrQkFBK0IsR0FBRyxtQkFBbUIsQ0FBQztZQUMzRCxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUMxQixDQUFDO0tBQ0QsQ0FBQTtJQTNLWSxrREFBbUI7a0NBQW5CLG1CQUFtQjtRQW1DN0IsV0FBQSxxQ0FBcUIsQ0FBQTtPQW5DWCxtQkFBbUIsQ0EySy9CO0lBRUQsU0FBUyxVQUFVLENBQUMsQ0FBUztRQUM1QixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDVixPQUFPLENBQUMsRUFBRTtZQUNULENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUN2QixDQUFDLEVBQUUsQ0FBQztTQUNKO1FBQ0QsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFFRCxTQUFTLHVCQUF1QjtRQUMvQixJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDZixJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUU7WUFDbEQsK0VBQStFO1lBQy9FLEtBQUssSUFBSSxpQkFBaUIsQ0FBQztTQUMzQjtRQUNELElBQUksT0FBTyxDQUFDLFFBQVEsRUFBRTtZQUNyQix3REFBd0Q7WUFDeEQsS0FBSyxJQUFJLG9CQUFvQixDQUFDO1lBQzlCLEtBQUssSUFBSSxxQkFBcUIsQ0FBQztTQUMvQjtRQUNELElBQUksUUFBUSxDQUFDLFdBQVcsRUFBRTtZQUN6QixLQUFLLElBQUksTUFBTSxDQUFDO1NBQ2hCO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDO0lBV0QsTUFBTSxzQkFBc0I7UUFBNUI7WUFDa0IsWUFBTyxHQUFVLEVBQUUsQ0FBQztRQVV0QyxDQUFDO1FBVE8sS0FBSyxDQUFJLE1BQW9CO1lBQ25DLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM3QixDQUFDO1FBQ00sR0FBRyxDQUF5QixFQUFLO1lBQ3ZDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN6QixDQUFDO1FBQ00sTUFBTSxDQUFJLE1BQW9CLEVBQUUsS0FBUTtZQUM5QyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUM5QixDQUFDO0tBQ0Q7SUFFRCxNQUFhLHFCQUFxQjtRQUFsQztZQUNrQixZQUFPLEdBQVUsRUFBRSxDQUFDO1FBYXRDLENBQUM7UUFaTyxLQUFLLENBQUksRUFBZ0I7WUFDL0IsSUFBSSxFQUFFLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7Z0JBQzlCLE1BQU0sSUFBSSxLQUFLLENBQUMsaUNBQWlDLENBQUMsQ0FBQzthQUNuRDtZQUNELE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN6QixDQUFDO1FBQ00sR0FBRyxDQUF5QixFQUFLO1lBQ3ZDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN2QixDQUFDO1FBQ00sTUFBTSxDQUFJLEVBQWdCLEVBQUUsS0FBUTtZQUMxQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUMxQixDQUFDO0tBQ0Q7SUFkRCxzREFjQztJQUVELE1BQU0saUJBQWlCO1FBRWYsTUFBTSxDQUFDLGVBQWUsQ0FBQyxPQUF1QjtZQUNwRCxNQUFNLE1BQU0sR0FBRyxJQUFJLHNCQUFzQixFQUFFLENBQUM7WUFDNUMsS0FBSyxNQUFNLFlBQVksSUFBSSxxQ0FBcUIsRUFBRTtnQkFDakQsTUFBTSxLQUFLLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBRSxPQUFlLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ2xHLE1BQU0sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxZQUFZLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7YUFDN0Q7WUFDRCxPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFFTSxNQUFNLENBQUMsY0FBYyxDQUFDLE9BQStCLEVBQUUsR0FBMEI7WUFDdkYsTUFBTSxNQUFNLEdBQUcsSUFBSSxxQkFBcUIsRUFBRSxDQUFDO1lBQzNDLEtBQUssTUFBTSxZQUFZLElBQUkscUNBQXFCLEVBQUU7Z0JBQ2pELE1BQU0sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2xHO1lBQ0QsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRU8sTUFBTSxDQUFDLFdBQVcsQ0FBSSxDQUFJLEVBQUUsQ0FBSTtZQUN2QyxJQUFJLE9BQU8sQ0FBQyxLQUFLLFFBQVEsSUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7Z0JBQy9ELE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNmO1lBQ0QsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3pDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUM1RTtZQUNELElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFzQixDQUFDLENBQUMsTUFBTSxLQUFLLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBc0IsQ0FBQyxDQUFDLE1BQU0sRUFBRTtnQkFDOUYsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUNELEtBQUssTUFBTSxHQUFHLElBQUksQ0FBQyxFQUFFO2dCQUNwQixJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtvQkFDbkQsT0FBTyxLQUFLLENBQUM7aUJBQ2I7YUFDRDtZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBd0IsRUFBRSxDQUF3QjtZQUMzRSxNQUFNLE1BQU0sR0FBYyxFQUFFLENBQUM7WUFDN0IsSUFBSSxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7WUFDN0IsS0FBSyxNQUFNLFlBQVksSUFBSSxxQ0FBcUIsRUFBRTtnQkFDakQsTUFBTSxPQUFPLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDbkcsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUM7Z0JBQ2xDLElBQUksT0FBTyxFQUFFO29CQUNaLGdCQUFnQixHQUFHLElBQUksQ0FBQztpQkFDeEI7YUFDRDtZQUNELE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsSUFBSSx5Q0FBeUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUUsQ0FBQztRQUVEOzs7VUFHRTtRQUNLLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBdUIsRUFBRSxNQUFnQztZQUNsRixJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7WUFDcEIsS0FBSyxNQUFNLFlBQVksSUFBSSxxQ0FBcUIsRUFBRTtnQkFDakQsSUFBSSxNQUFNLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDN0MsTUFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDLFdBQVcsQ0FBRSxPQUFlLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFHLE1BQWMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDaEgsT0FBZSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO29CQUN0RCxPQUFPLEdBQUcsT0FBTyxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUM7aUJBQ3RDO2FBQ0Q7WUFDRCxPQUFPLE9BQU8sQ0FBQztRQUNoQixDQUFDO0tBQ0Q7SUFFRCxTQUFTLDBCQUEwQixDQUFDLFFBQWtDO1FBQ3JFLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDNUMsSUFBQSwrQkFBYyxFQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3hCLE9BQU8sT0FBTyxDQUFDO0lBQ2hCLENBQUMifQ==