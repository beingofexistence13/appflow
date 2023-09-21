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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/uri", "vs/editor/browser/services/webWorker", "vs/editor/common/languages/language", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/model", "vs/platform/configuration/common/configuration", "vs/platform/environment/common/environment", "vs/platform/extensionResourceLoader/common/extensionResourceLoader", "vs/platform/notification/common/notification", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/textMate/browser/backgroundTokenization/textMateWorkerTokenizerController"], function (require, exports, lifecycle_1, network_1, platform_1, uri_1, webWorker_1, language_1, languageConfigurationRegistry_1, model_1, configuration_1, environment_1, extensionResourceLoader_1, notification_1, telemetry_1, textMateWorkerTokenizerController_1) {
    "use strict";
    var ThreadedBackgroundTokenizerFactory_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ThreadedBackgroundTokenizerFactory = void 0;
    let ThreadedBackgroundTokenizerFactory = class ThreadedBackgroundTokenizerFactory {
        static { ThreadedBackgroundTokenizerFactory_1 = this; }
        static { this._reportedMismatchingTokens = false; }
        constructor(_reportTokenizationTime, _shouldTokenizeAsync, _extensionResourceLoaderService, _modelService, _languageConfigurationService, _configurationService, _languageService, _environmentService, _notificationService, _telemetryService) {
            this._reportTokenizationTime = _reportTokenizationTime;
            this._shouldTokenizeAsync = _shouldTokenizeAsync;
            this._extensionResourceLoaderService = _extensionResourceLoaderService;
            this._modelService = _modelService;
            this._languageConfigurationService = _languageConfigurationService;
            this._configurationService = _configurationService;
            this._languageService = _languageService;
            this._environmentService = _environmentService;
            this._notificationService = _notificationService;
            this._telemetryService = _telemetryService;
            this._workerProxyPromise = null;
            this._worker = null;
            this._workerProxy = null;
            this._workerTokenizerControllers = new Map();
            this._currentTheme = null;
            this._currentTokenColorMap = null;
            this._grammarDefinitions = [];
        }
        dispose() {
            this._disposeWorker();
        }
        // Will be recreated after worker is disposed (because tokenizer is re-registered when languages change)
        createBackgroundTokenizer(textModel, tokenStore, maxTokenizationLineLength) {
            // fallback to default sync background tokenizer
            if (!this._shouldTokenizeAsync() || textModel.isTooLargeForSyncing()) {
                return undefined;
            }
            const store = new lifecycle_1.DisposableStore();
            const controllerContainer = this._getWorkerProxy().then((workerProxy) => {
                if (store.isDisposed || !workerProxy) {
                    return undefined;
                }
                const controllerContainer = { controller: undefined, worker: this._worker };
                store.add(keepAliveWhenAttached(textModel, () => {
                    const controller = new textMateWorkerTokenizerController_1.TextMateWorkerTokenizerController(textModel, workerProxy, this._languageService.languageIdCodec, tokenStore, this._configurationService, maxTokenizationLineLength);
                    controllerContainer.controller = controller;
                    this._workerTokenizerControllers.set(controller.controllerId, controller);
                    return (0, lifecycle_1.toDisposable)(() => {
                        controllerContainer.controller = undefined;
                        this._workerTokenizerControllers.delete(controller.controllerId);
                        controller.dispose();
                    });
                }));
                return controllerContainer;
            });
            return {
                dispose() {
                    store.dispose();
                },
                requestTokens: async (startLineNumber, endLineNumberExclusive) => {
                    const container = await controllerContainer;
                    // If there is no controller, the model has been detached in the meantime.
                    // Only request the proxy object if the worker is the same!
                    if (container?.controller && container.worker === this._worker) {
                        container.controller.requestTokens(startLineNumber, endLineNumberExclusive);
                    }
                },
                reportMismatchingTokens: (lineNumber) => {
                    if (ThreadedBackgroundTokenizerFactory_1._reportedMismatchingTokens) {
                        return;
                    }
                    ThreadedBackgroundTokenizerFactory_1._reportedMismatchingTokens = true;
                    this._notificationService.error({
                        message: 'Async Tokenization Token Mismatch in line ' + lineNumber,
                        name: 'Async Tokenization Token Mismatch',
                    });
                    this._telemetryService.publicLog2('asyncTokenizationMismatchingTokens', {});
                },
            };
        }
        setGrammarDefinitions(grammarDefinitions) {
            this._grammarDefinitions = grammarDefinitions;
            this._disposeWorker();
        }
        acceptTheme(theme, colorMap) {
            this._currentTheme = theme;
            this._currentTokenColorMap = colorMap;
            if (this._currentTheme && this._currentTokenColorMap && this._workerProxy) {
                this._workerProxy.acceptTheme(this._currentTheme, this._currentTokenColorMap);
            }
        }
        _getWorkerProxy() {
            if (!this._workerProxyPromise) {
                this._workerProxyPromise = this._createWorkerProxy();
            }
            return this._workerProxyPromise;
        }
        async _createWorkerProxy() {
            const textmateModuleLocation = `${network_1.nodeModulesPath}/vscode-textmate`;
            const textmateModuleLocationAsar = `${network_1.nodeModulesAsarPath}/vscode-textmate`;
            const onigurumaModuleLocation = `${network_1.nodeModulesPath}/vscode-oniguruma`;
            const onigurumaModuleLocationAsar = `${network_1.nodeModulesAsarPath}/vscode-oniguruma`;
            const useAsar = this._environmentService.isBuilt && !platform_1.isWeb;
            const textmateLocation = useAsar ? textmateModuleLocationAsar : textmateModuleLocation;
            const onigurumaLocation = useAsar ? onigurumaModuleLocationAsar : onigurumaModuleLocation;
            const textmateMain = `${textmateLocation}/release/main.js`;
            const onigurumaMain = `${onigurumaLocation}/release/main.js`;
            const onigurumaWASM = `${onigurumaLocation}/release/onig.wasm`;
            const uri = network_1.FileAccess.asBrowserUri(textmateMain).toString(true);
            const createData = {
                grammarDefinitions: this._grammarDefinitions,
                textmateMainUri: uri,
                onigurumaMainUri: network_1.FileAccess.asBrowserUri(onigurumaMain).toString(true),
                onigurumaWASMUri: network_1.FileAccess.asBrowserUri(onigurumaWASM).toString(true),
            };
            const host = {
                readFile: async (_resource) => {
                    const resource = uri_1.URI.revive(_resource);
                    return this._extensionResourceLoaderService.readExtensionResource(resource);
                },
                setTokensAndStates: async (controllerId, versionId, tokens, lineEndStateDeltas) => {
                    const controller = this._workerTokenizerControllers.get(controllerId);
                    // When a model detaches, it is removed synchronously from the map.
                    // However, the worker might still be sending tokens for that model,
                    // so we ignore the event when there is no controller.
                    if (controller) {
                        controller.setTokensAndStates(controllerId, versionId, tokens, lineEndStateDeltas);
                    }
                },
                reportTokenizationTime: (timeMs, languageId, sourceExtensionId, lineLength, isRandomSample) => {
                    this._reportTokenizationTime(timeMs, languageId, sourceExtensionId, lineLength, isRandomSample);
                }
            };
            const worker = this._worker = (0, webWorker_1.createWebWorker)(this._modelService, this._languageConfigurationService, {
                createData,
                label: 'textMateWorker',
                moduleId: 'vs/workbench/services/textMate/browser/backgroundTokenization/worker/textMateTokenizationWorker.worker',
                host,
            });
            const proxy = await worker.getProxy();
            if (this._worker !== worker) {
                // disposed in the meantime
                return null;
            }
            this._workerProxy = proxy;
            if (this._currentTheme && this._currentTokenColorMap) {
                this._workerProxy.acceptTheme(this._currentTheme, this._currentTokenColorMap);
            }
            return proxy;
        }
        _disposeWorker() {
            for (const controller of this._workerTokenizerControllers.values()) {
                controller.dispose();
            }
            this._workerTokenizerControllers.clear();
            if (this._worker) {
                this._worker.dispose();
                this._worker = null;
            }
            this._workerProxy = null;
            this._workerProxyPromise = null;
        }
    };
    exports.ThreadedBackgroundTokenizerFactory = ThreadedBackgroundTokenizerFactory;
    exports.ThreadedBackgroundTokenizerFactory = ThreadedBackgroundTokenizerFactory = ThreadedBackgroundTokenizerFactory_1 = __decorate([
        __param(2, extensionResourceLoader_1.IExtensionResourceLoaderService),
        __param(3, model_1.IModelService),
        __param(4, languageConfigurationRegistry_1.ILanguageConfigurationService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, language_1.ILanguageService),
        __param(7, environment_1.IEnvironmentService),
        __param(8, notification_1.INotificationService),
        __param(9, telemetry_1.ITelemetryService)
    ], ThreadedBackgroundTokenizerFactory);
    function keepAliveWhenAttached(textModel, factory) {
        const disposableStore = new lifecycle_1.DisposableStore();
        const subStore = disposableStore.add(new lifecycle_1.DisposableStore());
        function checkAttached() {
            if (textModel.isAttachedToEditor()) {
                subStore.add(factory());
            }
            else {
                subStore.clear();
            }
        }
        checkAttached();
        disposableStore.add(textModel.onDidChangeAttached(() => {
            checkAttached();
        }));
        return disposableStore;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhyZWFkZWRCYWNrZ3JvdW5kVG9rZW5pemVyRmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy90ZXh0TWF0ZS9icm93c2VyL2JhY2tncm91bmRUb2tlbml6YXRpb24vdGhyZWFkZWRCYWNrZ3JvdW5kVG9rZW5pemVyRmFjdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBdUJ6RixJQUFNLGtDQUFrQyxHQUF4QyxNQUFNLGtDQUFrQzs7aUJBQy9CLCtCQUEwQixHQUFHLEtBQUssQUFBUixDQUFTO1FBV2xELFlBQ2tCLHVCQUF5SixFQUN6SixvQkFBbUMsRUFDbkIsK0JBQWlGLEVBQ25HLGFBQTZDLEVBQzdCLDZCQUE2RSxFQUNyRixxQkFBNkQsRUFDbEUsZ0JBQW1ELEVBQ2hELG1CQUF5RCxFQUN4RCxvQkFBMkQsRUFDOUQsaUJBQXFEO1lBVHZELDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBa0k7WUFDekoseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFlO1lBQ0Ysb0NBQStCLEdBQS9CLCtCQUErQixDQUFpQztZQUNsRixrQkFBYSxHQUFiLGFBQWEsQ0FBZTtZQUNaLGtDQUE2QixHQUE3Qiw2QkFBNkIsQ0FBK0I7WUFDcEUsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUNqRCxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1lBQy9CLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7WUFDdkMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtZQUM3QyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1lBbkJqRSx3QkFBbUIsR0FBc0QsSUFBSSxDQUFDO1lBQzlFLFlBQU8sR0FBdUQsSUFBSSxDQUFDO1lBQ25FLGlCQUFZLEdBQXNDLElBQUksQ0FBQztZQUM5QyxnQ0FBMkIsR0FBRyxJQUFJLEdBQUcsRUFBd0UsQ0FBQztZQUV2SCxrQkFBYSxHQUFxQixJQUFJLENBQUM7WUFDdkMsMEJBQXFCLEdBQW9CLElBQUksQ0FBQztZQUM5Qyx3QkFBbUIsR0FBOEIsRUFBRSxDQUFDO1FBYzVELENBQUM7UUFFTSxPQUFPO1lBQ2IsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3ZCLENBQUM7UUFFRCx3R0FBd0c7UUFDakcseUJBQXlCLENBQUMsU0FBcUIsRUFBRSxVQUF3QyxFQUFFLHlCQUE4QztZQUMvSSxnREFBZ0Q7WUFDaEQsSUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLFNBQVMsQ0FBQyxvQkFBb0IsRUFBRSxFQUFFO2dCQUFFLE9BQU8sU0FBUyxDQUFDO2FBQUU7WUFFM0YsTUFBTSxLQUFLLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFDcEMsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUU7Z0JBQ3ZFLElBQUksS0FBSyxDQUFDLFVBQVUsSUFBSSxDQUFDLFdBQVcsRUFBRTtvQkFBRSxPQUFPLFNBQVMsQ0FBQztpQkFBRTtnQkFFM0QsTUFBTSxtQkFBbUIsR0FBRyxFQUFFLFVBQVUsRUFBRSxTQUEwRCxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQzdILEtBQUssQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRTtvQkFDL0MsTUFBTSxVQUFVLEdBQUcsSUFBSSxxRUFBaUMsQ0FBQyxTQUFTLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxxQkFBcUIsRUFBRSx5QkFBeUIsQ0FBQyxDQUFDO29CQUMzTCxtQkFBbUIsQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO29CQUM1QyxJQUFJLENBQUMsMkJBQTJCLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7b0JBQzFFLE9BQU8sSUFBQSx3QkFBWSxFQUFDLEdBQUcsRUFBRTt3QkFDeEIsbUJBQW1CLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQzt3QkFDM0MsSUFBSSxDQUFDLDJCQUEyQixDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7d0JBQ2pFLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDdEIsQ0FBQyxDQUFDLENBQUM7Z0JBQ0osQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDSixPQUFPLG1CQUFtQixDQUFDO1lBQzVCLENBQUMsQ0FBQyxDQUFDO1lBRUgsT0FBTztnQkFDTixPQUFPO29CQUNOLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDakIsQ0FBQztnQkFDRCxhQUFhLEVBQUUsS0FBSyxFQUFFLGVBQWUsRUFBRSxzQkFBc0IsRUFBRSxFQUFFO29CQUNoRSxNQUFNLFNBQVMsR0FBRyxNQUFNLG1CQUFtQixDQUFDO29CQUU1QywwRUFBMEU7b0JBQzFFLDJEQUEyRDtvQkFDM0QsSUFBSSxTQUFTLEVBQUUsVUFBVSxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLE9BQU8sRUFBRTt3QkFDL0QsU0FBUyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsZUFBZSxFQUFFLHNCQUFzQixDQUFDLENBQUM7cUJBQzVFO2dCQUNGLENBQUM7Z0JBQ0QsdUJBQXVCLEVBQUUsQ0FBQyxVQUFVLEVBQUUsRUFBRTtvQkFDdkMsSUFBSSxvQ0FBa0MsQ0FBQywwQkFBMEIsRUFBRTt3QkFDbEUsT0FBTztxQkFDUDtvQkFDRCxvQ0FBa0MsQ0FBQywwQkFBMEIsR0FBRyxJQUFJLENBQUM7b0JBRXJFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUM7d0JBQy9CLE9BQU8sRUFBRSw0Q0FBNEMsR0FBRyxVQUFVO3dCQUNsRSxJQUFJLEVBQUUsbUNBQW1DO3FCQUN6QyxDQUFDLENBQUM7b0JBRUgsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBb0Ysb0NBQW9DLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQ2hLLENBQUM7YUFDRCxDQUFDO1FBQ0gsQ0FBQztRQUVNLHFCQUFxQixDQUFDLGtCQUE2QztZQUN6RSxJQUFJLENBQUMsbUJBQW1CLEdBQUcsa0JBQWtCLENBQUM7WUFDOUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3ZCLENBQUM7UUFFTSxXQUFXLENBQUMsS0FBZ0IsRUFBRSxRQUFrQjtZQUN0RCxJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztZQUMzQixJQUFJLENBQUMscUJBQXFCLEdBQUcsUUFBUSxDQUFDO1lBQ3RDLElBQUksSUFBSSxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMscUJBQXFCLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDMUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQzthQUM5RTtRQUNGLENBQUM7UUFFTyxlQUFlO1lBQ3RCLElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUU7Z0JBQzlCLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQzthQUNyRDtZQUNELE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDO1FBQ2pDLENBQUM7UUFFTyxLQUFLLENBQUMsa0JBQWtCO1lBQy9CLE1BQU0sc0JBQXNCLEdBQW9CLEdBQUcseUJBQWUsa0JBQWtCLENBQUM7WUFDckYsTUFBTSwwQkFBMEIsR0FBb0IsR0FBRyw2QkFBbUIsa0JBQWtCLENBQUM7WUFDN0YsTUFBTSx1QkFBdUIsR0FBb0IsR0FBRyx5QkFBZSxtQkFBbUIsQ0FBQztZQUN2RixNQUFNLDJCQUEyQixHQUFvQixHQUFHLDZCQUFtQixtQkFBbUIsQ0FBQztZQUUvRixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxJQUFJLENBQUMsZ0JBQUssQ0FBQztZQUMzRCxNQUFNLGdCQUFnQixHQUFvQixPQUFPLENBQUMsQ0FBQyxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQztZQUN4RyxNQUFNLGlCQUFpQixHQUFvQixPQUFPLENBQUMsQ0FBQyxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQztZQUMzRyxNQUFNLFlBQVksR0FBb0IsR0FBRyxnQkFBZ0Isa0JBQWtCLENBQUM7WUFDNUUsTUFBTSxhQUFhLEdBQW9CLEdBQUcsaUJBQWlCLGtCQUFrQixDQUFDO1lBQzlFLE1BQU0sYUFBYSxHQUFvQixHQUFHLGlCQUFpQixvQkFBb0IsQ0FBQztZQUNoRixNQUFNLEdBQUcsR0FBRyxvQkFBVSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFakUsTUFBTSxVQUFVLEdBQWdCO2dCQUMvQixrQkFBa0IsRUFBRSxJQUFJLENBQUMsbUJBQW1CO2dCQUM1QyxlQUFlLEVBQUUsR0FBRztnQkFDcEIsZ0JBQWdCLEVBQUUsb0JBQVUsQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztnQkFDdkUsZ0JBQWdCLEVBQUUsb0JBQVUsQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQzthQUN2RSxDQUFDO1lBQ0YsTUFBTSxJQUFJLEdBQXdCO2dCQUNqQyxRQUFRLEVBQUUsS0FBSyxFQUFFLFNBQXdCLEVBQW1CLEVBQUU7b0JBQzdELE1BQU0sUUFBUSxHQUFHLFNBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQ3ZDLE9BQU8sSUFBSSxDQUFDLCtCQUErQixDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUM3RSxDQUFDO2dCQUNELGtCQUFrQixFQUFFLEtBQUssRUFBRSxZQUFvQixFQUFFLFNBQWlCLEVBQUUsTUFBa0IsRUFBRSxrQkFBaUMsRUFBaUIsRUFBRTtvQkFDM0ksTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLDJCQUEyQixDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDdEUsbUVBQW1FO29CQUNuRSxvRUFBb0U7b0JBQ3BFLHNEQUFzRDtvQkFDdEQsSUFBSSxVQUFVLEVBQUU7d0JBQ2YsVUFBVSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLGtCQUFrQixDQUFDLENBQUM7cUJBQ25GO2dCQUNGLENBQUM7Z0JBQ0Qsc0JBQXNCLEVBQUUsQ0FBQyxNQUFjLEVBQUUsVUFBa0IsRUFBRSxpQkFBcUMsRUFBRSxVQUFrQixFQUFFLGNBQXVCLEVBQVEsRUFBRTtvQkFDeEosSUFBSSxDQUFDLHVCQUF1QixDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsaUJBQWlCLEVBQUUsVUFBVSxFQUFFLGNBQWMsQ0FBQyxDQUFDO2dCQUNqRyxDQUFDO2FBQ0QsQ0FBQztZQUNGLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBQSwyQkFBZSxFQUE2QixJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyw2QkFBNkIsRUFBRTtnQkFDakksVUFBVTtnQkFDVixLQUFLLEVBQUUsZ0JBQWdCO2dCQUN2QixRQUFRLEVBQUUsd0dBQXdHO2dCQUNsSCxJQUFJO2FBQ0osQ0FBQyxDQUFDO1lBQ0gsTUFBTSxLQUFLLEdBQUcsTUFBTSxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7WUFFdEMsSUFBSSxJQUFJLENBQUMsT0FBTyxLQUFLLE1BQU0sRUFBRTtnQkFDNUIsMkJBQTJCO2dCQUMzQixPQUFPLElBQUksQ0FBQzthQUNaO1lBQ0QsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7WUFDMUIsSUFBSSxJQUFJLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQyxxQkFBcUIsRUFBRTtnQkFDckQsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQzthQUM5RTtZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVPLGNBQWM7WUFDckIsS0FBSyxNQUFNLFVBQVUsSUFBSSxJQUFJLENBQUMsMkJBQTJCLENBQUMsTUFBTSxFQUFFLEVBQUU7Z0JBQ25FLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUNyQjtZQUNELElBQUksQ0FBQywyQkFBMkIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUV6QyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2pCLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ3ZCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO2FBQ3BCO1lBQ0QsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7WUFDekIsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQztRQUNqQyxDQUFDOztJQTNLVyxnRkFBa0M7aURBQWxDLGtDQUFrQztRQWU1QyxXQUFBLHlEQUErQixDQUFBO1FBQy9CLFdBQUEscUJBQWEsQ0FBQTtRQUNiLFdBQUEsNkRBQTZCLENBQUE7UUFDN0IsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLDJCQUFnQixDQUFBO1FBQ2hCLFdBQUEsaUNBQW1CLENBQUE7UUFDbkIsV0FBQSxtQ0FBb0IsQ0FBQTtRQUNwQixXQUFBLDZCQUFpQixDQUFBO09BdEJQLGtDQUFrQyxDQTRLOUM7SUFFRCxTQUFTLHFCQUFxQixDQUFDLFNBQXFCLEVBQUUsT0FBMEI7UUFDL0UsTUFBTSxlQUFlLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7UUFDOUMsTUFBTSxRQUFRLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLDJCQUFlLEVBQUUsQ0FBQyxDQUFDO1FBRTVELFNBQVMsYUFBYTtZQUNyQixJQUFJLFNBQVMsQ0FBQyxrQkFBa0IsRUFBRSxFQUFFO2dCQUNuQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7YUFDeEI7aUJBQU07Z0JBQ04sUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQ2pCO1FBQ0YsQ0FBQztRQUVELGFBQWEsRUFBRSxDQUFDO1FBQ2hCLGVBQWUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLG1CQUFtQixDQUFDLEdBQUcsRUFBRTtZQUN0RCxhQUFhLEVBQUUsQ0FBQztRQUNqQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0osT0FBTyxlQUFlLENBQUM7SUFDeEIsQ0FBQyJ9