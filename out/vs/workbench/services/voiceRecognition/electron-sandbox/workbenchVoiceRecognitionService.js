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
define(["require", "exports", "vs/nls", "vs/base/common/cancellation", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/base/common/event", "vs/platform/progress/common/progress", "vs/base/common/async", "vs/base/common/network", "vs/platform/ipc/electron-sandbox/services", "vs/platform/notification/common/notification"], function (require, exports, nls_1, cancellation_1, extensions_1, instantiation_1, event_1, progress_1, async_1, network_1, services_1, notification_1) {
    "use strict";
    var WorkbenchVoiceRecognitionService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkbenchVoiceRecognitionService = exports.IWorkbenchVoiceRecognitionService = void 0;
    exports.IWorkbenchVoiceRecognitionService = (0, instantiation_1.createDecorator)('workbenchVoiceRecognitionService');
    class VoiceTranscriptionWorkletNode extends AudioWorkletNode {
        constructor(context, options, onDidTranscribe, sharedProcessService) {
            super(context, 'voice-transcription-worklet', options);
            this.onDidTranscribe = onDidTranscribe;
            this.sharedProcessService = sharedProcessService;
            this.registerListeners();
        }
        registerListeners() {
            this.port.onmessage = e => {
                if (typeof e.data === 'string') {
                    this.onDidTranscribe.fire(e.data);
                }
            };
        }
        async start(token) {
            token.onCancellationRequested(() => this.stop());
            const sharedProcessConnection = await this.sharedProcessService.createRawConnection();
            if (token.isCancellationRequested) {
                this.stop();
                return;
            }
            this.port.postMessage('vscode:startVoiceTranscription', [sharedProcessConnection]);
        }
        stop() {
            this.port.postMessage('vscode:stopVoiceTranscription');
            this.disconnect();
        }
    }
    let WorkbenchVoiceRecognitionService = class WorkbenchVoiceRecognitionService {
        static { WorkbenchVoiceRecognitionService_1 = this; }
        static { this.AUDIO_SAMPLING_RATE = 16000; }
        static { this.AUDIO_BIT_DEPTH = 16; }
        static { this.AUDIO_CHANNELS = 1; }
        static { this.BUFFER_TIMESPAN = 1000; }
        static { this.VAD_THRESHOLD = 0.02; }
        constructor(progressService, sharedProcessService, notificationService) {
            this.progressService = progressService;
            this.sharedProcessService = sharedProcessService;
            this.notificationService = notificationService;
        }
        async transcribe(cancellation, options) {
            const cts = new cancellation_1.CancellationTokenSource(cancellation);
            const onDidTranscribe = new event_1.Emitter();
            cts.token.onCancellationRequested(() => {
                onDidTranscribe.dispose();
                options?.onDidCancel?.();
            });
            await this.doTranscribe(onDidTranscribe, cts);
            return onDidTranscribe.event;
        }
        doTranscribe(onDidTranscribe, cts) {
            const recordingReady = new async_1.DeferredPromise();
            cts.token.onCancellationRequested(() => recordingReady.complete());
            this.progressService.withProgress({
                location: 10 /* ProgressLocation.Window */,
                title: (0, nls_1.localize)('voiceTranscription', "Voice Transcription"),
                cancellable: true
            }, async (progress) => {
                const recordingDone = new async_1.DeferredPromise();
                try {
                    progress.report({ message: (0, nls_1.localize)('voiceTranscriptionGettingReady', "Getting microphone ready...") });
                    const microphoneDevice = await navigator.mediaDevices.getUserMedia({
                        audio: {
                            sampleRate: WorkbenchVoiceRecognitionService_1.AUDIO_SAMPLING_RATE,
                            sampleSize: WorkbenchVoiceRecognitionService_1.AUDIO_BIT_DEPTH,
                            channelCount: WorkbenchVoiceRecognitionService_1.AUDIO_CHANNELS,
                            autoGainControl: true,
                            noiseSuppression: true,
                            echoCancellation: false
                        }
                    });
                    if (cts.token.isCancellationRequested) {
                        return;
                    }
                    const audioContext = new AudioContext({
                        sampleRate: WorkbenchVoiceRecognitionService_1.AUDIO_SAMPLING_RATE,
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
                    await audioContext.audioWorklet.addModule(network_1.FileAccess.asBrowserUri('vs/workbench/services/voiceRecognition/electron-sandbox/voiceTranscriptionWorklet.js').toString(true));
                    if (cts.token.isCancellationRequested) {
                        return;
                    }
                    const voiceTranscriptionTarget = new VoiceTranscriptionWorkletNode(audioContext, {
                        channelCount: WorkbenchVoiceRecognitionService_1.AUDIO_CHANNELS,
                        channelCountMode: 'explicit',
                        processorOptions: {
                            bufferTimespan: WorkbenchVoiceRecognitionService_1.BUFFER_TIMESPAN,
                            vadThreshold: WorkbenchVoiceRecognitionService_1.VAD_THRESHOLD
                        }
                    }, onDidTranscribe, this.sharedProcessService);
                    await voiceTranscriptionTarget.start(cts.token);
                    if (cts.token.isCancellationRequested) {
                        return;
                    }
                    microphoneSource.connect(voiceTranscriptionTarget);
                    progress.report({ message: (0, nls_1.localize)('voiceTranscriptionRecording', "Recording from microphone...") });
                    recordingReady.complete();
                    return recordingDone.p;
                }
                catch (error) {
                    this.notificationService.error((0, nls_1.localize)('voiceTranscriptionError', "Voice transcription failed: {0}", error.message));
                    recordingReady.error(error);
                    recordingDone.error(error);
                }
            }, () => {
                cts.cancel();
            });
            return recordingReady.p;
        }
    };
    exports.WorkbenchVoiceRecognitionService = WorkbenchVoiceRecognitionService;
    exports.WorkbenchVoiceRecognitionService = WorkbenchVoiceRecognitionService = WorkbenchVoiceRecognitionService_1 = __decorate([
        __param(0, progress_1.IProgressService),
        __param(1, services_1.ISharedProcessService),
        __param(2, notification_1.INotificationService)
    ], WorkbenchVoiceRecognitionService);
    // Register Service
    (0, extensions_1.registerSingleton)(exports.IWorkbenchVoiceRecognitionService, WorkbenchVoiceRecognitionService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2JlbmNoVm9pY2VSZWNvZ25pdGlvblNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdm9pY2VSZWNvZ25pdGlvbi9lbGVjdHJvbi1zYW5kYm94L3dvcmtiZW5jaFZvaWNlUmVjb2duaXRpb25TZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFhbkYsUUFBQSxpQ0FBaUMsR0FBRyxJQUFBLCtCQUFlLEVBQW9DLGtDQUFrQyxDQUFDLENBQUM7SUErQnhJLE1BQU0sNkJBQThCLFNBQVEsZ0JBQWdCO1FBRTNELFlBQ0MsT0FBeUIsRUFDekIsT0FBMEMsRUFDekIsZUFBZ0MsRUFDaEMsb0JBQTJDO1lBRTVELEtBQUssQ0FBQyxPQUFPLEVBQUUsNkJBQTZCLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFIdEMsb0JBQWUsR0FBZixlQUFlLENBQWlCO1lBQ2hDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFJNUQsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUVPLGlCQUFpQjtZQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsRUFBRTtnQkFDekIsSUFBSSxPQUFPLENBQUMsQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO29CQUMvQixJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ2xDO1lBQ0YsQ0FBQyxDQUFDO1FBQ0gsQ0FBQztRQUVELEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBd0I7WUFDbkMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBRWpELE1BQU0sdUJBQXVCLEdBQUcsTUFBTSxJQUFJ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