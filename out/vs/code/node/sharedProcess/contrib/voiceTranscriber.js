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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/voiceRecognition/node/voiceRecognitionService", "vs/platform/log/common/log", "vs/base/common/cancellation", "vs/base/common/async"], function (require, exports, lifecycle_1, voiceRecognitionService_1, log_1, cancellation_1, async_1) {
    "use strict";
    var VoiceTranscriptionManager_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VoiceTranscriptionManager = void 0;
    let VoiceTranscriptionManager = class VoiceTranscriptionManager extends lifecycle_1.Disposable {
        static { VoiceTranscriptionManager_1 = this; }
        static { this.USE_SLIDING_WINDOW = !!process.env.VSCODE_VOICE_USE_SLIDING_WINDOW; }
        constructor(onDidWindowConnectRaw, voiceRecognitionService, logService) {
            super();
            this.onDidWindowConnectRaw = onDidWindowConnectRaw;
            this.voiceRecognitionService = voiceRecognitionService;
            this.logService = logService;
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.onDidWindowConnectRaw(port => {
                this.logService.info(`[voice] transcriber: new connection (sliding window: ${VoiceTranscriptionManager_1.USE_SLIDING_WINDOW})`);
                if (VoiceTranscriptionManager_1.USE_SLIDING_WINDOW) {
                    this._register(new SlidingWindowVoiceTranscriber(port, this.voiceRecognitionService, this.logService));
                }
                else {
                    this._register(new FullWindowVoiceTranscriber(port, this.voiceRecognitionService, this.logService));
                }
            }));
        }
    };
    exports.VoiceTranscriptionManager = VoiceTranscriptionManager;
    exports.VoiceTranscriptionManager = VoiceTranscriptionManager = VoiceTranscriptionManager_1 = __decorate([
        __param(1, voiceRecognitionService_1.IVoiceRecognitionService),
        __param(2, log_1.ILogService)
    ], VoiceTranscriptionManager);
    class VoiceTranscriber extends lifecycle_1.Disposable {
        static { this.MAX_DATA_LENGTH = 30 /* seconds */ * 16000 /* sampling rate */ * 16 /* bith depth */ * 1 /* channels */ / 8; }
        constructor(port, voiceRecognitionService, logService) {
            super();
            this.port = port;
            this.voiceRecognitionService = voiceRecognitionService;
            this.logService = logService;
            this.registerListeners();
        }
        registerListeners() {
            const cts = new cancellation_1.CancellationTokenSource();
            this._register((0, lifecycle_1.toDisposable)(() => cts.dispose(true)));
            const requestHandler = (e) => {
                if (!(e.data instanceof Float32Array)) {
                    return;
                }
                this.handleRequest(e.data, cts.token);
            };
            this.port.on('message', requestHandler);
            this._register((0, lifecycle_1.toDisposable)(() => this.port.off('message', requestHandler)));
            this.port.start();
            let closed = false;
            this.port.on('close', () => {
                this.logService.info(`[voice] transcriber: closed connection`);
                closed = true;
                this.dispose();
            });
            this._register((0, lifecycle_1.toDisposable)(() => {
                if (!closed) {
                    this.port.close();
                }
            }));
        }
        joinFloat32Arrays(float32Arrays) {
            const result = new Float32Array(float32Arrays.reduce((prev, curr) => prev + curr.length, 0));
            let offset = 0;
            for (const float32Array of float32Arrays) {
                result.set(float32Array, offset);
                offset += float32Array.length;
            }
            return result;
        }
    }
    class SlidingWindowVoiceTranscriber extends VoiceTranscriber {
        constructor() {
            super(...arguments);
            this.transcriptionQueue = this._register(new async_1.Queue());
            this.transcribedResults = [];
            this.data = new Float32Array(0);
        }
        async handleRequest(data, cancellation) {
            if (data.length > 0) {
                this.logService.info(`[voice] transcriber: voice detected, storing in buffer`);
                this.data = this.data ? this.joinFloat32Arrays([this.data, data]) : data;
            }
            else {
                this.logService.info(`[voice] transcriber: silence detected, transcribing window...`);
                const data = this.data.slice(0);
                this.data = new Float32Array(0);
                this.transcriptionQueue.queue(() => this.transcribe(data, cancellation));
            }
        }
        async transcribe(data, cancellation) {
            if (cancellation.isCancellationRequested) {
                return;
            }
            if (data.length > VoiceTranscriber.MAX_DATA_LENGTH) {
                this.logService.warn(`[voice] transcriber: refusing to accept more than 30s of audio data`);
                return;
            }
            if (data.length !== 0) {
                const result = await this.voiceRecognitionService.transcribe(data, cancellation);
                if (result) {
                    this.transcribedResults.push(result);
                }
            }
            if (cancellation.isCancellationRequested) {
                return;
            }
            this.port.postMessage(this.transcribedResults.join(' '));
        }
        dispose() {
            super.dispose();
            this.data = new Float32Array(0);
        }
    }
    class FullWindowVoiceTranscriber extends VoiceTranscriber {
        constructor() {
            super(...arguments);
            this.transcriptionQueue = new async_1.LimitedQueue();
            this.data = undefined;
            this.transcribedDataLength = 0;
            this.transcribedResult = '';
        }
        async handleRequest(data, cancellation) {
            const dataCandidate = this.data ? this.joinFloat32Arrays([this.data, data]) : data;
            if (dataCandidate.length > VoiceTranscriber.MAX_DATA_LENGTH) {
                this.logService.warn(`[voice] transcriber: refusing to accept more than 30s of audio data`);
                return;
            }
            this.data = dataCandidate;
            this.transcriptionQueue.queue(() => this.transcribe(cancellation));
        }
        async transcribe(cancellation) {
            if (cancellation.isCancellationRequested) {
                return;
            }
            const data = this.data?.slice(0);
            if (!data) {
                return;
            }
            let result;
            if (data.length === this.transcribedDataLength) {
                // Optimization: if the data is the same as the last time
                // we transcribed, don't transcribe again, just return the
                // same result as we had last time.
                this.logService.info(`[voice] transcriber: silence detected, reusing previous transcription result`);
                result = this.transcribedResult;
            }
            else {
                this.logService.info(`[voice] transcriber: voice detected, transcribing everything...`);
                result = await this.voiceRecognitionService.transcribe(data, cancellation);
            }
            this.transcribedResult = result;
            this.transcribedDataLength = data.length;
            if (cancellation.isCancellationRequested) {
                return;
            }
            this.port.postMessage(result);
        }
        dispose() {
            super.dispose();
            this.data = undefined;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidm9pY2VUcmFuc2NyaWJlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2NvZGUvbm9kZS9zaGFyZWRQcm9jZXNzL2NvbnRyaWIvdm9pY2VUcmFuc2NyaWJlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBVXpGLElBQU0seUJBQXlCLEdBQS9CLE1BQU0seUJBQTBCLFNBQVEsc0JBQVU7O2lCQUV6Qyx1QkFBa0IsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsQUFBaEQsQ0FBaUQ7UUFFbEYsWUFDa0IscUJBQTZDLEVBQ25CLHVCQUFpRCxFQUM5RCxVQUF1QjtZQUVyRCxLQUFLLEVBQUUsQ0FBQztZQUpTLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBd0I7WUFDbkIsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUEwQjtZQUM5RCxlQUFVLEdBQVYsVUFBVSxDQUFhO1lBSXJELElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFFTyxpQkFBaUI7WUFDeEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ2hELElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLHdEQUF3RCwyQkFBeUIsQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUM7Z0JBRTlILElBQUksMkJBQXlCLENBQUMsa0JBQWtCLEVBQUU7b0JBQ2pELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSw2QkFBNkIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2lCQUN2RztxQkFBTTtvQkFDTixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMEJBQTBCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyx1QkFBdUIs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