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
define(["require", "exports", "vs/platform/log/common/log", "vs/platform/instantiation/common/instantiation", "vs/platform/product/common/productService"], function (require, exports, log_1, instantiation_1, productService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$o8b = exports.$n8b = void 0;
    exports.$n8b = (0, instantiation_1.$Bh)('voiceRecognitionService');
    let $o8b = class $o8b {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        async transcribe(channelData, cancellation) {
            const modulePath = process.env.VSCODE_VOICE_MODULE_PATH; // TODO@bpasero package
            if (!modulePath || this.b.quality === 'stable') {
                this.a.error(`[voice] transcribe(${channelData.length}): Voice recognition not yet supported`);
                throw new Error('Voice recognition not yet supported!');
            }
            const now = Date.now();
            try {
                const voiceModule = require.__$__nodeRequire(modulePath);
                const abortController = new AbortController();
                cancellation.onCancellationRequested(() => abortController.abort());
                const text = await voiceModule.transcribe({
                    samplingRate: 16000,
                    bitDepth: 16,
                    channelCount: 1,
                    channelData
                }, {
                    language: 'en',
                    signal: abortController.signal
                });
                this.a.info(`[voice] transcribe(${channelData.length}): Text "${text}", took ${Date.now() - now}ms)`);
                return text;
            }
            catch (error) {
                this.a.error(`[voice] transcribe(${channelData.length}): Failed width "${error}", took ${Date.now() - now}ms)`);
                throw error;
            }
        }
    };
    exports.$o8b = $o8b;
    exports.$o8b = $o8b = __decorate([
        __param(0, log_1.$5i),
        __param(1, productService_1.$kj)
    ], $o8b);
});
//# sourceMappingURL=voiceRecognitionService.js.map