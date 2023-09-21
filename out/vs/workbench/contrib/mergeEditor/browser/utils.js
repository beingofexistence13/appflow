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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/platform/storage/common/storage"], function (require, exports, arrays_1, errors_1, lifecycle_1, observable_1, storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.observableConfigValue = exports.PersistentStore = exports.deepMerge = exports.setFields = exports.thenIfNotDisposed = exports.elementAtOrUndefined = exports.concatArrays = exports.join = exports.leftJoin = exports.applyObservableDecorations = exports.setStyle = exports.ReentrancyBarrier = void 0;
    class ReentrancyBarrier {
        constructor() {
            this._isActive = false;
        }
        get isActive() {
            return this._isActive;
        }
        makeExclusive(fn) {
            return ((...args) => {
                if (this._isActive) {
                    return;
                }
                this._isActive = true;
                try {
                    return fn(...args);
                }
                finally {
                    this._isActive = false;
                }
            });
        }
        runExclusively(fn) {
            if (this._isActive) {
                return;
            }
            this._isActive = true;
            try {
                fn();
            }
            finally {
                this._isActive = false;
            }
        }
        runExclusivelyOrThrow(fn) {
            if (this._isActive) {
                throw new errors_1.BugIndicatingError();
            }
            this._isActive = true;
            try {
                fn();
            }
            finally {
                this._isActive = false;
            }
        }
    }
    exports.ReentrancyBarrier = ReentrancyBarrier;
    function setStyle(element, style) {
        Object.entries(style).forEach(([key, value]) => {
            element.style.setProperty(key, toSize(value));
        });
    }
    exports.setStyle = setStyle;
    function toSize(value) {
        return typeof value === 'number' ? `${value}px` : value;
    }
    function applyObservableDecorations(editor, decorations) {
        const d = new lifecycle_1.DisposableStore();
        let decorationIds = [];
        d.add((0, observable_1.autorunOpts)({ debugName: () => `Apply decorations from ${decorations.debugName}` }, reader => {
            const d = decorations.read(reader);
            editor.changeDecorations(a => {
                decorationIds = a.deltaDecorations(decorationIds, d);
            });
        }));
        d.add({
            dispose: () => {
                editor.changeDecorations(a => {
                    decorationIds = a.deltaDecorations(decorationIds, []);
                });
            }
        });
        return d;
    }
    exports.applyObservableDecorations = applyObservableDecorations;
    function* leftJoin(left, right, compare) {
        const rightQueue = new arrays_1.ArrayQueue(right);
        for (const leftElement of left) {
            rightQueue.takeWhile(rightElement => arrays_1.CompareResult.isGreaterThan(compare(leftElement, rightElement)));
            const equals = rightQueue.takeWhile(rightElement => arrays_1.CompareResult.isNeitherLessOrGreaterThan(compare(leftElement, rightElement)));
            yield { left: leftElement, rights: equals || [] };
        }
    }
    exports.leftJoin = leftJoin;
    function* join(left, right, compare) {
        const rightQueue = new arrays_1.ArrayQueue(right);
        for (const leftElement of left) {
            const skipped = rightQueue.takeWhile(rightElement => arrays_1.CompareResult.isGreaterThan(compare(leftElement, rightElement)));
            if (skipped) {
                yield { rights: skipped };
            }
            const equals = rightQueue.takeWhile(rightElement => arrays_1.CompareResult.isNeitherLessOrGreaterThan(compare(leftElement, rightElement)));
            yield { left: leftElement, rights: equals || [] };
        }
    }
    exports.join = join;
    function concatArrays(...arrays) {
        return [].concat(...arrays);
    }
    exports.concatArrays = concatArrays;
    function elementAtOrUndefined(arr, index) {
        return arr[index];
    }
    exports.elementAtOrUndefined = elementAtOrUndefined;
    function thenIfNotDisposed(promise, then) {
        let disposed = false;
        promise.then(() => {
            if (disposed) {
                return;
            }
            then();
        });
        return (0, lifecycle_1.toDisposable)(() => {
            disposed = true;
        });
    }
    exports.thenIfNotDisposed = thenIfNotDisposed;
    function setFields(obj, fields) {
        return Object.assign(obj, fields);
    }
    exports.setFields = setFields;
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
    let PersistentStore = class PersistentStore {
        constructor(key, storageService) {
            this.key = key;
            this.storageService = storageService;
            this.hasValue = false;
            this.value = undefined;
        }
        get() {
            if (!this.hasValue) {
                const value = this.storageService.get(this.key, 0 /* StorageScope.PROFILE */);
                if (value !== undefined) {
                    try {
                        this.value = JSON.parse(value);
                    }
                    catch (e) {
                        (0, errors_1.onUnexpectedError)(e);
                    }
                }
                this.hasValue = true;
            }
            return this.value;
        }
        set(newValue) {
            this.value = newValue;
            this.storageService.store(this.key, JSON.stringify(this.value), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
    };
    exports.PersistentStore = PersistentStore;
    exports.PersistentStore = PersistentStore = __decorate([
        __param(1, storage_1.IStorageService)
    ], PersistentStore);
    function observableConfigValue(key, defaultValue, configurationService) {
        return (0, observable_1.observableFromEvent)((handleChange) => configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(key)) {
                handleChange(e);
            }
        }), () => configurationService.getValue(key) ?? defaultValue);
    }
    exports.observableConfigValue = observableConfigValue;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9tZXJnZUVkaXRvci9icm93c2VyL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVdoRyxNQUFhLGlCQUFpQjtRQUE5QjtZQUNTLGNBQVMsR0FBRyxLQUFLLENBQUM7UUEyQzNCLENBQUM7UUF6Q0EsSUFBVyxRQUFRO1lBQ2xCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUN2QixDQUFDO1FBRU0sYUFBYSxDQUE2QixFQUFhO1lBQzdELE9BQU8sQ0FBQyxDQUFDLEdBQUcsSUFBVyxFQUFFLEVBQUU7Z0JBQzFCLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtvQkFDbkIsT0FBTztpQkFDUDtnQkFDRCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztnQkFDdEIsSUFBSTtvQkFDSCxPQUFPLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO2lCQUNuQjt3QkFBUztvQkFDVCxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztpQkFDdkI7WUFDRixDQUFDLENBQVEsQ0FBQztRQUNYLENBQUM7UUFFTSxjQUFjLENBQUMsRUFBYztZQUNuQyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ25CLE9BQU87YUFDUDtZQUNELElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1lBQ3RCLElBQUk7Z0JBQ0gsRUFBRSxFQUFFLENBQUM7YUFDTDtvQkFBUztnQkFDVCxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQzthQUN2QjtRQUNGLENBQUM7UUFFTSxxQkFBcUIsQ0FBQyxFQUFjO1lBQzFDLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDbkIsTUFBTSxJQUFJLDJCQUFrQixFQUFFLENBQUM7YUFDL0I7WUFDRCxJQUFJLENB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