"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
class VoiceTranscriptionWorklet extends AudioWorkletProcessor {
    constructor(e) {
        super();
        this.e = e;
        this.a = undefined;
        this.b = false;
        this.c = [];
        this.d = undefined;
        this.f();
    }
    f() {
        this.port.onmessage = event => {
            switch (event.data) {
                case 'vscode:startVoiceTranscription': {
                    this.d = event.ports[0];
                    this.d.onmessage = event => {
                        if (this.b) {
                            return;
                        }
                        if (typeof event.data === 'string') {
                            this.port.postMessage(event.data);
                        }
                    };
                    this.d.start();
                    break;
                }
                case 'vscode:stopVoiceTranscription': {
                    this.b = true;
                    this.d?.close();
                    this.d = undefined;
                    break;
                }
            }
        };
    }
    process(inputs) {
        if (this.a === undefined) {
            this.a = Date.now();
        }
        const inputChannelData = inputs[0][0];
        if ((!(inputChannelData instanceof Float32Array))) {
            return !this.b;
        }
        this.c.push(inputChannelData.slice(0));
        if (Date.now() - this.a > this.e.processorOptions.bufferTimespan && this.d) {
            const buffer = this.h(this.c);
            this.c = [];
            // Send buffer to shared process for transcription.
            // Send an empty buffer if it appears to be silence
            // so that we can still trigger the transcription
            // service and let it know about this.
            this.d.postMessage(this.g(buffer) ? new Float32Array(0) : buffer);
            this.a = Date.now();
        }
        return !this.b;
    }
    g(data) {
        // This is the most simple Voice Activity Detection (VAD)
        // and it is based on the Root Mean Square (RMS) of the signal
        // with a certain threshold. Good for testing but probably
        // not suitable for shipping to stable (TODO@bpasero).
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += data[i] * data[i];
        }
        const rms = Math.sqrt(sum / data.length);
        return rms < this.e.processorOptions.vadThreshold;
    }
    h(float32Arrays) {
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
//# sourceMappingURL=voiceTranscriptionWorklet.js.map