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
    exports.$Rmb = void 0;
    let $Rmb = class $Rmb {
        constructor(extHostContext, e, f, g) {
            this.e = e;
            this.f = f;
            this.g = g;
            this.a = new lifecycle_1.$jc();
            this.c = new Map();
            this.d = new Map();
            this.b = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostNotebook);
        }
        dispose() {
            this.a.dispose();
            (0, lifecycle_1.$fc)(this.c.values());
        }
        $registerNotebookSerializer(handle, extension, viewType, options, data) {
            const disposables = new lifecycle_1.$jc();
            disposables.add(this.e.registerNotebookSerializer(viewType, extension, {
                options,
                dataToNotebook: async (data) => {
                    const sw = new stopwatch_1.$bd();
                    let result;
                    if (data.byteLength === 0 && viewType === 'interactive') {
                        // we don't want any starting cells for an empty interactive window.
                        result = mainThreadNotebookDto_1.NotebookDto.fromNotebookDataDto({ cells: [], metadata: {} });
                    }
                    else {
                        const dto = await this.b.$dataToNotebook(handle, data, cancellation_1.CancellationToken.None);
                        result = mainThreadNotebookDto_1.NotebookDto.fromNotebookDataDto(dto.value);
                    }
                    this.g.trace(`[NotebookSerializer] dataToNotebook DONE after ${sw.elapsed()}ms`, {
                        viewType,
                        extensionId: extension.id.value,
                    });
                    return result;
                },
                notebookToData: (data) => {
                    const sw = new stopwatch_1.$bd();
                    const result = this.b.$notebookToData(handle, new proxyIdentifier_1.$dA(mainThreadNotebookDto_1.NotebookDto.toNotebookDataDto(data)), cancellation_1.CancellationToken.None);
                    this.g.trace(`[NotebookSerializer] notebookToData DONE after ${sw.elapsed()}`, {
                        viewType,
                        extensionId: extension.id.value,
                    });
                    return result;
                },
                save: async (uri, versionId, options, token) => {
                    const stat = await this.b.$saveNotebook(handle, uri, versionId, options, token);
                    return {
                        ...stat,
                        children: undefined,
                        resource: uri
                    };
                },
            }));
            if (data) {
                disposables.add(this.e.registerContributedNotebookType(viewType, data));
            }
            this.c.set(handle, disposables);
            this.g.trace('[NotebookSerializer] registered notebook serializer', {
                viewType,
                extensionId: extension.id.value,
            });
        }
        $unregisterNotebookSerializer(handle) {
            this.c.get(handle)?.dispose();
            this.c.delete(handle);
        }
        $emitCellStatusBarEvent(eventHandle) {
            const emitter = this.d.get(eventHandle);
            if (emitter instanceof event_1.$fd) {
                emitter.fire(undefined);
            }
        }
        async $registerNotebookCellStatusBarItemProvider(handle, eventHandle, viewType) {
            const that = this;
            const provider = {
                async provideCellStatusBarItems(uri, index, token) {
                    const result = await that.b.$provideNotebookCellStatusBarItems(handle, uri, index, token);
                    return {
                        items: result?.items ?? [],
                        dispose() {
                            if (result) {
                                that.b.$releaseNotebookCellStatusBarItems(result.cacheId);
                            }
                        }
                    };
                },
                viewType
            };
            if (typeof eventHandle === 'number') {
                const emitter = new event_1.$fd();
                this.d.set(eventHandle, emitter);
                provider.onDidChangeStatusBarItems = emitter.event;
            }
            const disposable = this.f.registerCellStatusBarItemProvider(provider);
            this.d.set(handle, disposable);
        }
        async $unregisterNotebookCellStatusBarItemProvider(handle, eventHandle) {
            const unregisterThing = (handle) => {
                const entry = this.d.get(handle);
                if (entry) {
                    this.d.get(handle)?.dispose();
                    this.d.delete(handle);
                }
            };
            unregisterThing(handle);
            if (typeof eventHandle === 'number') {
                unregisterThing(eventHandle);
            }
        }
    };
    exports.$Rmb = $Rmb;
    exports.$Rmb = $Rmb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadNotebook),
        __param(1, notebookService_1.$ubb),
        __param(2, notebookCellStatusBarService_1.$Qmb),
        __param(3, log_1.$5i)
    ], $Rmb);
    commands_1.$Gr.registerCommand('_executeDataToNotebook', async (accessor, ...args) => {
        const [notebookType, bytes] = args;
        (0, types_1.$tf)(typeof notebookType === 'string', 'string');
        (0, types_1.$tf)(bytes instanceof buffer_1.$Fd, 'VSBuffer');
        const notebookService = accessor.get(notebookService_1.$ubb);
        const info = await notebookService.withNotebookDataProvider(notebookType);
        if (!(info instanceof notebookService_1.$vbb)) {
            return;
        }
        const dto = await info.serializer.dataToNotebook(bytes);
        return new proxyIdentifier_1.$dA(mainThreadNotebookDto_1.NotebookDto.toNotebookDataDto(dto));
    });
    commands_1.$Gr.registerCommand('_executeNotebookToData', async (accessor, ...args) => {
        const [notebookType, dto] = args;
        (0, types_1.$tf)(typeof notebookType === 'string', 'string');
        (0, types_1.$tf)(typeof dto === 'object');
        const notebookService = accessor.get(notebookService_1.$ubb);
        const info = await notebookService.withNotebookDataProvider(notebookType);
        if (!(info instanceof notebookService_1.$vbb)) {
            return;
        }
        const data = mainThreadNotebookDto_1.NotebookDto.fromNotebookDataDto(dto.value);
        const bytes = await info.serializer.notebookToData(data);
        return bytes;
    });
});
//# sourceMappingURL=mainThreadNotebook.js.map