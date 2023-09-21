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
    var $p8b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$p8b = void 0;
    let $p8b = class $p8b extends lifecycle_1.$kc {
        static { $p8b_1 = this; }
        static { this.a = !!process.env.VSCODE_VOICE_USE_SLIDING_WINDOW; }
        constructor(b, c, f) {
            super();
            this.b = b;
            this.c = c;
            this.f = f;
            this.g();
        }
        g() {
            this.B(this.b(port => {
                this.f.info(`[voice] transcriber: new connection (sliding window: ${$p8b_1.a})`);
                if ($p8b_1.a) {
                    this.B(new SlidingWindowVoiceTranscriber(port, this.c, this.f));
                }
                else {
                    this.B(new FullWindowVoiceTranscriber(port, this.c, this.f));
                }
            }));
        }
    };
    exports.$p8b = $p8b;
    exports.$p8b = $p8b = $p8b_1 = __decorate([
        __param(1, voiceRecognitionService_1.$n8b),
        __param(2, log_1.$5i)
    ], $p8b);
    class VoiceTranscriber extends lifecycle_1.$kc {
        static { this.a = 30 /* seconds */ * 16000 /* sampling rate */ * 16 /* bith depth */ * 1 /* channels */ / 8; }
        constructor(b, c, f) {
            super();
            this.b = b;
            this.c = c;
            this.f = f;
            this.g();
        }
        g() {
            const cts = new cancellation_1.$pd();
            this.B((0, lifecycle_1.$ic)(() => cts.dispose(true)));
            const requestHandler = (e) => {
                if (!(e.data instanceof Float32Array)) {
                    return;
                }
                this.h(e.data, cts.token);
            };
            this.b.on('message', requestHandler);
            this.B((0, lifecycle_1.$ic)(() => this.b.off('message', requestHandler)));
            this.b.start();
            let closed = false;
            this.b.on('close', () => {
                this.f.info(`[voice] transcriber: closed connection`);
                closed = true;
                this.dispose();
            });
            this.B((0, lifecycle_1.$ic)(() => {
                if (!closed) {
                    this.b.close();
                }
            }));
        }
        j(float32Arrays) {
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
            this.m = this.B(new async_1.$Ng());
            this.n = [];
            this.r = new Float32Array(0);
        }
        async h(data, cancellation) {
            if (data.length > 0) {
                this.f.info(`[voice] transcriber: voice detected, storing in buffer`);
                this.r = this.r ? this.j([this.r, data]) : data;
            }
            else {
                this.f.info(`[voice] transcriber: silence detected, transcribing window...`);
                const data = this.r.slice(0);
                this.r = new Float32Array(0);
                this.m.queue(() => this.t(data, cancellation));
            }
        }
        async t(data, cancellation) {
            if (cancellation.isCancellationRequested) {
                return;
            }
            if (data.length > VoiceTranscriber.a) {
                this.f.warn(`[voice] transcriber: refusing to accept more than 30s of audio data`);
                return;
            }
            if (data.length !== 0) {
                const result = await this.c.transcribe(data, cancellation);
                if (result) {
                    this.n.push(result);
                }
            }
            if (cancellation.isCancellationRequested) {
                return;
            }
            this.b.postMessage(this.n.join(' '));
        }
        dispose() {
            super.dispose();
            this.r = new Float32Array(0);
        }
    }
    class FullWindowVoiceTranscriber extends VoiceTranscriber {
        constructor() {
            super(...arguments);
            this.m = new async_1.$Og();
            this.n = undefined;
            this.r = 0;
            this.s = '';
        }
        async h(data, cancellation) {
            const dataCandidate = this.n ? this.j([this.n, data]) : data;
            if (dataCandidate.length > VoiceTranscriber.a) {
                this.f.warn(`[voice] transcriber: refusing to accept more than 30s of audio data`);
                return;
            }
            this.n = dataCandidate;
            this.m.queue(() => this.u(cancellation));
        }
        async u(cancellation) {
            if (cancellation.isCancellationRequested) {
                return;
            }
            const data = this.n?.slice(0);
            if (!data) {
                return;
            }
            let result;
            if (data.length === this.r) {
                // Optimization: if the data is the same as the last time
                // we transcribed, don't transcribe again, just return the
                // same result as we had last time.
                this.f.info(`[voice] transcriber: silence detected, reusing previous transcription result`);
                result = this.s;
            }
            else {
                this.f.info(`[voice] transcriber: voice detected, transcribing everything...`);
                result = await this.c.transcribe(data, cancellation);
            }
            this.s = result;
            this.r = data.length;
            if (cancellation.isCancellationRequested) {
                return;
            }
            this.b.postMessage(result);
        }
        dispose() {
            super.dispose();
            this.n = undefined;
        }
    }
});
//# sourceMappingURL=voiceTranscriber.js.map