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
define(["require", "exports", "vs/base/browser/ui/aria/aria", "vs/base/common/async", "vs/base/common/lifecycle", "vs/platform/audioCues/browser/audioCueService"], function (require, exports, aria_1, async_1, lifecycle_1, audioCueService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ZIb = void 0;
    const CHAT_RESPONSE_PENDING_AUDIO_CUE_LOOP_MS = 5000;
    const CHAT_RESPONSE_PENDING_ALLOWANCE_MS = 4000;
    let $ZIb = class $ZIb extends lifecycle_1.$kc {
        constructor(g) {
            super();
            this.g = g;
            this.b = false;
            this.B(this.c = new async_1.$Sg(() => {
                if (!this.b) {
                    this.a = this.g.playAudioCueLoop(audioCueService_1.$wZ.chatResponsePending, CHAT_RESPONSE_PENDING_AUDIO_CUE_LOOP_MS);
                }
            }, CHAT_RESPONSE_PENDING_ALLOWANCE_MS));
        }
        acceptRequest() {
            this.g.playAudioCue(audioCueService_1.$wZ.chatRequestSent, { allowManyInParallel: true });
            this.c.schedule();
        }
        acceptResponse(response) {
            this.b = true;
            const isPanelChat = typeof response !== 'string';
            this.a?.dispose();
            this.c?.cancel();
            const responseContent = typeof response === 'string' ? response : response?.response.asString();
            if (this.f === responseContent) {
                return;
            }
            this.g.playAudioCue(audioCueService_1.$wZ.chatResponseReceived, { allowManyInParallel: true });
            this.b = false;
            if (!response) {
                return;
            }
            const errorDetails = isPanelChat && response.errorDetails ? ` ${response.errorDetails.message}` : '';
            this.f = responseContent;
            (0, aria_1.$_P)(responseContent + errorDetails);
        }
    };
    exports.$ZIb = $ZIb;
    exports.$ZIb = $ZIb = __decorate([
        __param(0, audioCueService_1.$sZ)
    ], $ZIb);
});
//# sourceMappingURL=chatAccessibilityService.js.map