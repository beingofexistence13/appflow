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
define(["require", "exports", "vs/nls!vs/workbench/services/voiceRecognition/electron-sandbox/workbenchVoiceRecognitionService", "vs/base/common/cancellation", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/base/common/event", "vs/platform/progress/common/progress", "vs/base/common/async", "vs/base/common/network", "vs/platform/ipc/electron-sandbox/services", "vs/platform/notification/common/notification"], function (require, exports, nls_1, cancellation_1, extensions_1, instantiation_1, event_1, progress_1, async_1, network_1, services_1, notification_1) {
    "use strict";
    var $7_b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$7_b = exports.$6_b = void 0;
    exports.$6_b = (0, instantiation_1.$Bh)('workbenchVoiceRecognitionService');
    class VoiceTranscriptionWorkletNode extends AudioWorkletNode {
        constructor(context, options, a, b) {
            super(context, 'voice-transcription-worklet', options);
            this.a = a;
            this.b = b;
            this.c();
        }
        c() {
            this.port.onmessage = e => {
                if (typeof e.data === 'string') {
                    this.a.fire(e.data);
                }
            };
        }
        async start(token) {
            token.onCancellationRequested(() => this.d());
            const sharedProcessConnection = await this.b.createRawConnection();
            if (token.isCancellationRequested) {
                this.d();
                return;
            }
            this.port.postMessage('vscode:startVoiceTranscription', [sharedProcessConnection]);
        }
        d() {
            this.port.postMessage('vscode:stopVoiceTranscription');
            this.disconnect();
        }
    }
    let $7_b = class $7_b {
        static { $7_b_1 = this; }
        static { this.a = 16000; }
        static { this.b = 16; }
        static { this.c = 1; }
        static { this.d = 1000; }
        static { this.f = 0.02; }
        constructor(g, h, i) {
            this.g = g;
            this.h = h;
            this.i = i;
        }
        async transcribe(cancellation, options) {
            const cts = new cancellation_1.$pd(cancellation);
            const onDidTranscribe = new event_1.$fd();
            cts.token.onCancellationRequested(() => {
                onDidTranscribe.dispose();
                options?.onDidCancel?.();
            });
            await this.j(onDidTranscribe, cts);
            return onDidTranscribe.event;
        }
        j(onDidTranscribe, cts) {
            const recordingReady = new async_1.$2g();
            cts.token.onCancellationRequested(() => recordingReady.complete());
            this.g.withProgress({
                location: 10 /* ProgressLocation.Window */,
                title: (0, nls_1.localize)(0, null),
                cancellable: true
            }, async (progress) => {
                const recordingDone = new async_1.$2g();
                try {
                    progress.report({ message: (0, nls_1.localize)(1, null) });
                    const microphoneDevice = await navigator.mediaDevices.getUserMedia({
                        audio: {
                            sampleRate: $7_b_1.a,
                            sampleSize: $7_b_1.b,
                            channelCount: $7_b_1.c,
                            autoGainControl: true,
                            noiseSuppression: true,
                            echoCancellation: false
                        }
                    });
                    if (cts.token.isCancellationRequested) {
                        return;
                    }
                    const audioContext = new AudioContext({
                        sampleRate: $7_b_1.a,
                        latencyHint: 'interactive'
                    });
                    const microphoneSource = audioContext.createMediaStreamSource(microphoneDevice);
                    cts.token.onCancellationRequested(() => {
                        try {
                            for (const track of microphoneDevice.getTracks()) {
                                track.stop();
                            }
                            microphoneSource.disconnect();
                            audioContext.close();
                        }
                        finally {
                            recordingDone.complete();
                        }
                    });
                    await audioContext.audioWorklet.addModule(network_1.$2f.asBrowserUri('vs/workbench/services/voiceRecognition/electron-sandbox/voiceTranscriptionWorklet.js').toString(true));
                    if (cts.token.isCancellationRequested) {
                        return;
                    }
                    const voiceTranscriptionTarget = new VoiceTranscriptionWorkletNode(audioContext, {
                        channelCount: $7_b_1.c,
                        channelCountMode: 'explicit',
                        processorOptions: {
                            bufferTimespan: $7_b_1.d,
                            vadThreshold: $7_b_1.f
                        }
                    }, onDidTranscribe, this.h);
                    await voiceTranscriptionTarget.start(cts.token);
                    if (cts.token.isCancellationRequested) {
                        return;
                    }
                    microphoneSource.connect(voiceTranscriptionTarget);
                    progress.report({ message: (0, nls_1.localize)(2, null) });
                    recordingReady.complete();
                    return recordingDone.p;
                }
                catch (error) {
                    this.i.error((0, nls_1.localize)(3, null, error.message));
                    recordingReady.error(error);
                    recordingDone.error(error);
                }
            }, () => {
                cts.cancel();
            });
            return recordingReady.p;
        }
    };
    exports.$7_b = $7_b;
    exports.$7_b = $7_b = $7_b_1 = __decorate([
        __param(0, progress_1.$2u),
        __param(1, services_1.$A7b),
        __param(2, notification_1.$Yu)
    ], $7_b);
    // Register Service
    (0, extensions_1.$mr)(exports.$6_b, $7_b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=workbenchVoiceRecognitionService.js.map