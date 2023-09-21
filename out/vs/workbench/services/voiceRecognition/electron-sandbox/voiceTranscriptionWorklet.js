"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
class VoiceTranscriptionWorklet extends AudioWorkletProcessor {
    constructor(options) {
        super();
        this.options = options;
        this.startTime = undefined;
        this.stopped = false;
        this.buffer = [];
        this.sharedProcessConnection = undefined;
        this.registerListeners();
    }
    registerListeners() {
        this.port.onmessage = event => {
            switch (event.data) {
                case 'vscode:startVoiceTranscription': {
                    this.sharedProcessConnection = event.ports[0];
                    this.sharedProcessConnection.onmessage = event => {
                        if (this.stopped) {
                            return;
                        }
                        if (typeof event.data === 'string') {
                            this.port.postMessage(event.data);
                        }
                    };
                    this.sharedProcessConnection.start();
                    break;
                }
                case 'vscode:stopVoiceTranscription': {
                    this.stopped = true;
                    this.sharedProcessConnection?.close();
                    this.sharedProcessConnection = undefined;
                    break;
                }
            }
        };
    }
    process(inputs) {
        if (this.startTime === undefined) {
            this.startTime = Date.now();
        }
        const inputChannelData = inputs[0][0];
        if ((!(inputChannelData instanceof Float32Array))) {
            return !this.stopped;
        }
        this.buffer.push(inputChannelData.slice(0));
        if (Date.now() - this.startTime > this.options.processorOptions.bufferTimespan && this.sharedProcessConnection) {
            const buffer = this.joinFloat32Arrays(this.buffer);
            this.buffer = [];
            // Send buffer to shared process for transcription.
            // Send an empty buffer if it appears to be silence
            // so that we can still trigger the transcription
            // service and let it know about this.
            this.sharedProcessConnection.postMessage(this.appearsToBeSilence(buffer) ? new Float32Array(0) : buffer);
            this.startTime = Date.now();
        }
        return !this.stopped;
    }
    appearsToBeSilence(data) {
        // This is the most simple Voice Activity Detection (VAD)
        // and it is based on the Root Mean Square (RMS) of the signal
        // with a certain threshold. Good for testing but probably
        // not suitable for shipping to stable (TODO@bpasero).
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += data[i] * data[i];
        }
        const rms = Math.sqrt(sum / data.length);
        return rms < this.options.processorOptions.vadThreshold;
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
// @ts-ignore
registerProcessor('voice-transcription-worklet', VoiceTranscriptionWorklet);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidm9pY2VUcmFuc2NyaXB0aW9uV29ya2xldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy92b2ljZVJlY29nbml0aW9uL2VsZWN0cm9uLXNhbmRib3gvdm9pY2VUcmFuc2NyaXB0aW9uV29ya2xldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7QUFnQmhHLE1BQU0seUJBQTBCLFNBQVEscUJBQXFCO0lBUzVELFlBQTZCLE9BQTBDO1FBQ3RFLEtBQUssRUFBRSxDQUFDO1FBRG9CLFlBQU8sR0FBUCxPQUFPLENBQW1DO1FBUC9ELGNBQVMsR0FBdUIsU0FBUyxDQUFDO1FBQzFDLFlBQU8sR0FBWSxLQUFLLENBQUM7UUFFekIsV0FBTSxHQUFtQixFQUFFLENBQUM7UUFFNUIsNEJBQXVCLEdBQTRCLFNBQVMsQ0FBQztRQUtwRSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUMxQixDQUFDO0lBRU8saUJBQWlCO1FBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxFQUFFO1lBQzdCLFFBQVEsS0FBSyxDQUFDLElBQUksRUFBRTtnQkFDbkIsS0FBSyxnQ0FBZ0MsQ0FBQyxDQUFDO29CQUN0QyxJQUFJLENBQUMsdUJBQXVCLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFFOUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsRUFBRTt3QkFDaEQsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFOzRCQUNqQixPQUFPO3lCQUNQO3dCQUVELElBQUksT0FBTyxLQUFLLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRTs0QkFDbkMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO3lCQUNsQztvQkFDRixDQUFD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