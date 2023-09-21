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
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/stopwatch", "vs/base/common/types", "vs/platform/commands/common/commands", "vs/platform/log/common/log", "vs/workbench/api/browser/mainThreadNotebookDto", "vs/workbench/contrib/notebook/common/notebookCellStatusBarService", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/services/extensions/common/proxyIdentifier", "../common/extHost.protocol"], function (require, exports, buffer_1, cancellation_1, event_1, lifecycle_1, stopwatch_1, types_1, commands_1, log_1, mainThreadNotebookDto_1, notebookCellStatusBarService_1, notebookService_1, extHostCustomers_1, proxyIdentifier_1, extHost_protocol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadNotebooks = void 0;
    let MainThreadNotebooks = class MainThreadNotebooks {
        constructor(extHostContext, _notebookService, _cellStatusBarService, _logService) {
            this._notebookService = _notebookService;
            this._cellStatusBarService = _cellStatusBarService;
            this._logService = _logService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._notebookSerializer = new Map();
            this._notebookCellStatusBarRegistrations = new Map();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostNotebook);
        }
        dispose() {
            this._disposables.dispose();
            (0, lifecycle_1.dispose)(this._notebookSerializer.values());
        }
        $registerNotebookSerializer(handle, extension, viewType, options, data) {
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add(this._notebookService.registerNotebookSerializer(viewType, extension, {
                options,
                dataToNotebook: async (data) => {
                    const sw = new stopwatch_1.StopWatch();
                    let result;
                    if (data.byteLength === 0 && viewType === 'interactive') {
                        // we don't want any starting cells for an empty interactive window.
                        result = mainThreadNotebookDto_1.NotebookDto.fromNotebookDataDto({ cells: [], metadata: {} });
                    }
                    else {
                        const dto = await this._proxy.$dataToNotebook(handle, data, cancellation_1.CancellationToken.None);
                        result = mainThreadNotebookDto_1.NotebookDto.fromNotebookDataDto(dto.value);
                    }
                    this._logService.trace(`[NotebookSerializer] dataToNotebook DONE after ${sw.elapsed()}ms`, {
                        viewType,
                        extensionId: extension.id.value,
                    });
                    return result;
                },
                notebookToData: (data) => {
                    const sw = new stopwatch_1.StopWatch();
                    const result = this._proxy.$notebookToData(handle, new proxyIdentifier_1.SerializableObjectWithBuffers(mainThreadNotebookDto_1.NotebookDto.toNotebookDataDto(data)), cancellation_1.CancellationToken.None);
                    this._logService.trace(`[NotebookSerializer] notebookToData DONE after ${sw.elapsed()}`, {
                        viewType,
                        extensionId: extension.id.value,
                    });
                    return result;
                },
                save: async (uri, versionId, options, token) => {
                    const stat = await this._proxy.$saveNotebook(handle, uri, versionId, options, token);
                    return {
                        ...stat,
                        children: undefined,
                        resource: uri
                    };
                },
            }));
            if (data) {
                disposables.add(this._notebookService.registerContributedNotebookType(viewType, data));
            }
            this._notebookSerializer.set(handle, disposables);
            this._logService.trace('[NotebookSerializer] registered notebook serializer', {
                viewType,
                extensionId: extension.id.value,
            });
        }
        $unregisterNotebookSerializer(handle) {
            this._notebookSerializer.get(handle)?.dispose();
            this._notebookSerializer.delete(handle);
        }
        $emitCellStatusBarEvent(eventHandle) {
            const emitter = this._notebookCellStatusBarRegistrations.get(eventHandle);
            if (emitter instanceof event_1.Emitter) {
                emitter.fire(undefined);
            }
        }
        async $registerNotebookCellStatusBarItemProvider(handle, eventHandle, viewType) {
            const that = this;
            const provider = {
                async provideCellStatusBarItems(uri, index, token) {
                    const result = await that._proxy.$provideNotebookCellStatusBarItems(handle, uri, index, token);
                    return {
                        items: result?.items ?? [],
                        dispose() {
                            if (result) {
                                that._proxy.$releaseNotebookCellStatusBarItems(result.cacheId);
                            }
                        }
                    };
                },
                viewType
            };
            if (typeof eventHandle === 'number') {
                const emitter = new event_1.Emitter();
                this._notebookCellStatusBarRegistrations.set(eventHandle, emitter);
                provider.onDidChangeStatusBarItems = emitter.event;
            }
            const disposable = this._cellStatusBarService.registerCellStatusBarItemProvider(provider);
            this._notebookCellStatusBarRegistrations.set(handle, disposable);
        }
        async $unregisterNotebookCellStatusBarItemProvider(handle, eventHandle) {
            const unregisterThing = (handle) => {
                const entry = this._notebookCellStatusBarRegistrations.get(handle);
                if (entry) {
                    this._notebookCellStatusBarRegistrations.get(handle)?.dispose();
                    this._notebookCellStatusBarRegistrations.delete(handle);
                }
            };
            unregisterThing(handle);
            if (typeof eventHandle === 'number') {
                unregisterThing(eventHandle);
            }
        }
    };
    exports.MainThreadNotebooks = MainThreadNotebooks;
    exports.MainThreadNotebooks = MainThreadNotebooks = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadNotebook),
        __param(1, notebookService_1.INotebookService),
        __param(2, notebookCellStatusBarService_1.INotebookCellStatusBarService),
        __param(3, log_1.ILogService)
    ], MainThreadNotebooks);
    commands_1.CommandsRegistry.registerCommand('_executeDataToNotebook', async (accessor, ...args) => {
        const [notebookType, bytes] = args;
        (0, types_1.assertType)(typeof notebookType === 'string', 'string');
        (0, types_1.assertType)(bytes instanceof buffer_1.VSBuffer, 'VSBuffer');
        const notebookService = accessor.get(notebookService_1.INotebookService);
        const info = await notebookService.withNotebookDataProvider(notebookType);
        if (!(info instanceof notebookService_1.SimpleNotebookProviderInfo)) {
            return;
        }
        const dto = await info.serializer.dataToNotebook(bytes);
        return new proxyIdentifier_1.SerializableObjectWithBuffers(mainThreadNotebookDto_1.NotebookDto.toNotebookDataDto(dto));
    });
    commands_1.CommandsRegistry.registerCommand('_executeNotebookToData', async (accessor, ...args) => {
        const [notebookType, dto] = args;
        (0, types_1.assertType)(typeof notebookType === 'string', 'string');
        (0, types_1.assertType)(typeof dto === 'object');
        const notebookService = accessor.get(notebookService_1.INotebookService);
        const info = await notebookService.withNotebookDataProvider(notebookType);
        if (!(info instanceof notebookService_1.SimpleNotebookProviderInfo)) {
            return;
        }
        const data = mainThreadNotebookDto_1.NotebookDto.fromNotebookDataDto(dto.value);
        const bytes = await info.serializer.notebookToData(data);
        return bytes;
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZE5vdGVib29rLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9icm93c2VyL21haW5UaHJlYWROb3RlYm9vay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFvQnpGLElBQU0sbUJBQW1CLEdBQXpCLE1BQU0sbUJBQW1CO1FBUS9CLFlBQ0MsY0FBK0IsRUFDYixnQkFBbUQsRUFDdEMscUJBQXFFLEVBQ3ZGLFdBQXlDO1lBRm5CLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7WUFDckIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUErQjtZQUN0RSxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQVZ0QyxpQkFBWSxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBR3JDLHdCQUFtQixHQUFHLElBQUksR0FBRyxFQUF1QixDQUFDO1lBQ3JELHdDQUFtQyxHQUFHLElBQUksR0FBRyxFQUF1QixDQUFDO1lBUXJGLElBQUksQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxpQ0FBYyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3ZFLENBQUM7UUFFRCxPQUFPO1lBQ04sSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUM1QixJQUFBLG1CQUFPLEVBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUVELDJCQUEyQixDQUFDLE1BQWMsRUFBRSxTQUF1QyxFQUFFLFFBQWdCLEVBQUUsT0FBeUIsRUFBRSxJQUEyQztZQUM1SyxNQUFNLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUUxQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQywwQkFBMEIsQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFO2dCQUNy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