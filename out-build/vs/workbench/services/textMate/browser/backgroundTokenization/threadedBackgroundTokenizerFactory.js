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
    var $FBb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$FBb = void 0;
    let $FBb = class $FBb {
        static { $FBb_1 = this; }
        static { this.a = false; }
        constructor(i, j, k, l, m, n, o, p, q, r) {
            this.i = i;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.n = n;
            this.o = o;
            this.p = p;
            this.q = q;
            this.r = r;
            this.b = null;
            this.c = null;
            this.d = null;
            this.e = new Map();
            this.f = null;
            this.g = null;
            this.h = [];
        }
        dispose() {
            this.u();
        }
        // Will be recreated after worker is disposed (because tokenizer is re-registered when languages change)
        createBackgroundTokenizer(textModel, tokenStore, maxTokenizationLineLength) {
            // fallback to default sync background tokenizer
            if (!this.j() || textModel.isTooLargeForSyncing()) {
                return undefined;
            }
            const store = new lifecycle_1.$jc();
            const controllerContainer = this.s().then((workerProxy) => {
                if (store.isDisposed || !workerProxy) {
                    return undefined;
                }
                const controllerContainer = { controller: undefined, worker: this.c };
                store.add(keepAliveWhenAttached(textModel, () => {
                    const controller = new textMateWorkerTokenizerController_1.$EBb(textModel, workerProxy, this.o.languageIdCodec, tokenStore, this.n, maxTokenizationLineLength);
                    controllerContainer.controller = controller;
                    this.e.set(controller.controllerId, controller);
                    return (0, lifecycle_1.$ic)(() => {
                        controllerContainer.controller = undefined;
                        this.e.delete(controller.controllerId);
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
                    if (container?.controller && container.worker === this.c) {
                        container.controller.requestTokens(startLineNumber, endLineNumberExclusive);
                    }
                },
                reportMismatchingTokens: (lineNumber) => {
                    if ($FBb_1.a) {
                        return;
                    }
                    $FBb_1.a = true;
                    this.q.error({
                        message: 'Async Tokenization Token Mismatch in line ' + lineNumber,
                        name: 'Async Tokenization Token Mismatch',
                    });
                    this.r.publicLog2('asyncTokenizationMismatchingTokens', {});
                },
            };
        }
        setGrammarDefinitions(grammarDefinitions) {
            this.h = grammarDefinitions;
            this.u();
        }
        acceptTheme(theme, colorMap) {
            this.f = theme;
            this.g = colorMap;
            if (this.f && this.g && this.d) {
                this.d.acceptTheme(this.f, this.g);
            }
        }
        s() {
            if (!this.b) {
                this.b = this.t();
            }
            return this.b;
        }
        async t() {
            const textmateModuleLocation = `${network_1.$Yf}/vscode-textmate`;
            const textmateModuleLocationAsar = `${network_1.$Zf}/vscode-textmate`;
            const onigurumaModuleLocation = `${network_1.$Yf}/vscode-oniguruma`;
            const onigurumaModuleLocationAsar = `${network_1.$Zf}/vscode-oniguruma`;
            const useAsar = this.p.isBuilt && !platform_1.$o;
            const textmateLocation = useAsar ? textmateModuleLocationAsar : textmateModuleLocation;
            const onigurumaLocation = useAsar ? onigurumaModuleLocationAsar : onigurumaModuleLocation;
            const textmateMain = `${textmateLocation}/release/main.js`;
            const onigurumaMain = `${onigurumaLocation}/release/main.js`;
            const onigurumaWASM = `${onigurumaLocation}/release/onig.wasm`;
            const uri = network_1.$2f.asBrowserUri(textmateMain).toString(true);
            const createData = {
                grammarDefinitions: this.h,
                textmateMainUri: uri,
                onigurumaMainUri: network_1.$2f.asBrowserUri(onigurumaMain).toString(true),
                onigurumaWASMUri: network_1.$2f.asBrowserUri(onigurumaWASM).toString(true),
            };
            const host = {
                readFile: async (_resource) => {
                    const resource = uri_1.URI.revive(_resource);
                    return this.k.readExtensionResource(resource);
                },
                setTokensAndStates: async (controllerId, versionId, tokens, lineEndStateDeltas) => {
                    const controller = this.e.get(controllerId);
                    // When a model detaches, it is removed synchronously from the map.
                    // However, the worker might still be sending tokens for that model,
                    // so we ignore the event when there is no controller.
                    if (controller) {
                        controller.setTokensAndStates(controllerId, versionId, tokens, lineEndStateDeltas);
                    }
                },
                reportTokenizationTime: (timeMs, languageId, sourceExtensionId, lineLength, isRandomSample) => {
                    this.i(timeMs, languageId, sourceExtensionId, lineLength, isRandomSample);
                }
            };
            const worker = this.c = (0, webWorker_1.$tBb)(this.l, this.m, {
                createData,
                label: 'textMateWorker',
                moduleId: 'vs/workbench/services/textMate/browser/backgroundTokenization/worker/textMateTokenizationWorker.worker',
                host,
            });
            const proxy = await worker.getProxy();
            if (this.c !== worker) {
                // disposed in the meantime
                return null;
            }
            this.d = proxy;
            if (this.f && this.g) {
                this.d.acceptTheme(this.f, this.g);
            }
            return proxy;
        }
        u() {
            for (const controller of this.e.values()) {
                controller.dispose();
            }
            this.e.clear();
            if (this.c) {
                this.c.dispose();
                this.c = null;
            }
            this.d = null;
            this.b = null;
        }
    };
    exports.$FBb = $FBb;
    exports.$FBb = $FBb = $FBb_1 = __decorate([
        __param(2, extensionResourceLoader_1.$2$),
        __param(3, model_1.$yA),
        __param(4, languageConfigurationRegistry_1.$2t),
        __param(5, configuration_1.$8h),
        __param(6, language_1.$ct),
        __param(7, environment_1.$Ih),
        __param(8, notification_1.$Yu),
        __param(9, telemetry_1.$9k)
    ], $FBb);
    function keepAliveWhenAttached(textModel, factory) {
        const disposableStore = new lifecycle_1.$jc();
        const subStore = disposableStore.add(new lifecycle_1.$jc());
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
//# sourceMappingURL=threadedBackgroundTokenizerFactory.js.map