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
    exports.ChatAccessibilityService = void 0;
    const CHAT_RESPONSE_PENDING_AUDIO_CUE_LOOP_MS = 5000;
    const CHAT_RESPONSE_PENDING_ALLOWANCE_MS = 4000;
    let ChatAccessibilityService = class ChatAccessibilityService extends lifecycle_1.Disposable {
        constructor(_audioCueService) {
            super();
            this._audioCueService = _audioCueService;
            this._hasReceivedRequest = false;
            this._register(this._runOnceScheduler = new async_1.RunOnceScheduler(() => {
                if (!this._hasReceivedRequest) {
                    this._responsePendingAudioCue = this._audioCueService.playAudioCueLoop(audioCueService_1.AudioCue.chatResponsePending, CHAT_RESPONSE_PENDING_AUDIO_CUE_LOOP_MS);
                }
            }, CHAT_RESPONSE_PENDING_ALLOWANCE_MS));
        }
        acceptRequest() {
            this._audioCueService.playAudioCue(audioCueService_1.AudioCue.chatRequestSent, { allowManyInParallel: true });
            this._runOnceScheduler.schedule();
        }
        acceptResponse(response) {
            this._hasReceivedRequest = true;
            const isPanelChat = typeof response !== 'string';
            this._responsePendingAudioCue?.dispose();
            this._runOnceScheduler?.cancel();
            const responseContent = typeof response === 'string' ? response : response?.response.asString();
            if (this._lastResponse === responseContent) {
                return;
            }
            this._audioCueService.playAudioCue(audioCueService_1.AudioCue.chatResponseReceived, { allowManyInParallel: true });
            this._hasReceivedRequest = false;
            if (!response) {
                return;
            }
            const errorDetails = isPanelChat && response.errorDetails ? ` ${response.errorDetails.message}` : '';
            this._lastResponse = responseContent;
            (0, aria_1.status)(responseContent + errorDetails);
        }
    };
    exports.ChatAccessibilityService = ChatAccessibilityService;
    exports.ChatAccessibilityService = ChatAccessibilityService = __decorate([
        __param(0, audioCueService_1.IAudioCueService)
    ], ChatAccessibilityService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdEFjY2Vzc2liaWxpdHlTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY2hhdC9icm93c2VyL2NoYXRBY2Nlc3NpYmlsaXR5U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFTaEcsTUFBTSx1Q0FBdUMsR0FBRyxJQUFJLENBQUM7SUFDckQsTUFBTSxrQ0FBa0MsR0FBRyxJQUFJLENBQUM7SUFDekMsSUFBTSx3QkFBd0IsR0FBOUIsTUFBTSx3QkFBeUIsU0FBUSxzQkFBVTtRQVN2RCxZQUE4QixnQkFBbUQ7WUFDaEYsS0FBSyxFQUFFLENBQUM7WUFEc0MscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtZQUp6RSx3QkFBbUIsR0FBWSxLQUFLLENBQUM7WUFNNUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSx3QkFBZ0IsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2pFLElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUU7b0JBQzlCLElBQUksQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsMEJBQVEsQ0FBQyxtQkFBbUIsRUFBRSx1Q0FBdUMsQ0FBQyxDQUFDO2lCQUM5STtZQUNGLENBQUMsRUFBRSxrQ0FBa0MsQ0FBQyxDQUFDLENBQUM7UUFDekMsQ0FBQztRQUNELGFBQWE7WUFDWixJQUFJLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLDBCQUFRLENBQUMsZUFBZSxFQUFFLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUM1RixJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDbkMsQ0FBQztRQUNELGNBQWMsQ0FBQyxRQUEwQztZQUN4RCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO1lBQ2hDLE1BQU0sV0FBVyxHQUFHLE9BQU8sUUFBUSxLQUFLLFFBQVEsQ0FBQztZQUNqRCxJQUFJLENBQUMsd0JBQXdCLEVBQUUsT0FBTyxFQUFFLENBQUM7WUFDekMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxDQUFDO1lBQ2pDLE1BQU0sZUFBZSxHQUFHLE9BQU8sUUFBUSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2hHLElBQUksSUFBSSxDQUFDLGFBQWEsS0FBSyxlQUFlLEVBQUU7Z0JBQzNDLE9BQU87YUFDUDtZQUNELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsMEJBQVEsQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLG1CQUFtQixFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFDakcsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEtBQUssQ0FBQztZQUNqQyxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNkLE9BQU87YUFDUDtZQUNELE1BQU0sWUFBWSxHQUFHLFdBQVcsSUFBSSxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNyRyxJQUFJLENBQUMsYUFBYSxHQUFHLGVBQWUsQ0FBQztZQUNyQyxJQUFBLGFBQU0sRUFBQyxlQUFlLEdBQUcsWUFBWSxDQUFDLENBQUM7UUFDeEMsQ0FBQztLQUNELENBQUE7SUF2Q1ksNERBQXdCO3VDQUF4Qix3QkFBd0I7UUFTdkIsV0FBQSxrQ0FBZ0IsQ0FBQTtPQVRqQix3QkFBd0IsQ0F1Q3BDIn0=