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
define(["require", "exports", "./extHostTypeConverters", "vs/platform/progress/common/progress", "vs/nls", "vs/base/common/cancellation", "vs/base/common/decorators", "vs/base/common/errors"], function (require, exports, extHostTypeConverters_1, progress_1, nls_1, cancellation_1, decorators_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostProgress = void 0;
    class ExtHostProgress {
        constructor(proxy) {
            this._handles = 0;
            this._mapHandleToCancellationSource = new Map();
            this._proxy = proxy;
        }
        async withProgress(extension, options, task) {
            const handle = this._handles++;
            const { title, location, cancellable } = options;
            const source = { label: (0, nls_1.localize)('extensionSource', "{0} (Extension)", extension.displayName || extension.name), id: extension.identifier.value };
            this._proxy.$startProgress(handle, { location: extHostTypeConverters_1.ProgressLocation.from(location), title, source, cancellable }, !extension.isUnderDevelopment ? extension.identifier.value : undefined).catch(errors_1.onUnexpectedExternalError);
            return this._withProgress(handle, task, !!cancellable);
        }
        _withProgress(handle, task, cancellable) {
            let source;
            if (cancellable) {
                source = new cancellation_1.CancellationTokenSource();
                this._mapHandleToCancellationSource.set(handle, source);
            }
            const progressEnd = (handle) => {
                this._proxy.$progressEnd(handle);
                this._mapHandleToCancellationSource.delete(handle);
                source?.dispose();
            };
            let p;
            try {
                p = task(new ProgressCallback(this._proxy, handle), cancellable && source ? source.token : cancellation_1.CancellationToken.None);
            }
            catch (err) {
                progressEnd(handle);
                throw err;
            }
            p.then(result => progressEnd(handle), err => progressEnd(handle));
            return p;
        }
        $acceptProgressCanceled(handle) {
            const source = this._mapHandleToCancellationSource.get(handle);
            if (source) {
                source.cancel();
                this._mapHandleToCancellationSource.delete(handle);
            }
        }
    }
    exports.ExtHostProgress = ExtHostProgress;
    function mergeProgress(result, currentValue) {
        result.message = currentValue.message;
        if (typeof currentValue.increment === 'number') {
            if (typeof result.increment === 'number') {
                result.increment += currentValue.increment;
            }
            else {
                result.increment = currentValue.increment;
            }
        }
        return result;
    }
    class ProgressCallback extends progress_1.Progress {
        constructor(_proxy, _handle) {
            super(p => this.throttledReport(p));
            this._proxy = _proxy;
            this._handle = _handle;
        }
        throttledReport(p) {
            this._proxy.$progressReport(this._handle, p);
        }
    }
    __decorate([
        (0, decorators_1.throttle)(100, (result, currentValue) => mergeProgress(result, currentValue), () => Object.create(null))
    ], ProgressCallback.prototype, "throttledReport", null);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFByb2dyZXNzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdFByb2dyZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7OztJQVloRyxNQUFhLGVBQWU7UUFNM0IsWUFBWSxLQUE4QjtZQUhsQyxhQUFRLEdBQVcsQ0FBQyxDQUFDO1lBQ3JCLG1DQUE4QixHQUF5QyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBR3hGLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLENBQUM7UUFFRCxLQUFLLENBQUMsWUFBWSxDQUFJLFNBQWdDLEVBQUUsT0FBd0IsRUFBRSxJQUFrRjtZQUNuSyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDL0IsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLEdBQUcsT0FBTyxDQUFDO1lBQ2pELE1BQU0sTUFBTSxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGlCQUFpQixFQUFFLGlCQUFpQixFQUFFLFNBQVMsQ0FBQyxXQUFXLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxTQUFTLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBRWxKLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxFQUFFLFFBQVEsRUFBRSx3Q0FBZ0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxrQ0FB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