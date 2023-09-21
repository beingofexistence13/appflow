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
    exports.VoiceRecognitionService = exports.IVoiceRecognitionService = void 0;
    exports.IVoiceRecognitionService = (0, instantiation_1.createDecorator)('voiceRecognitionService');
    let VoiceRecognitionService = class VoiceRecognitionService {
        constructor(logService, productService) {
            this.logService = logService;
            this.productService = productService;
        }
        async transcribe(channelData, cancellation) {
            const modulePath = process.env.VSCODE_VOICE_MODULE_PATH; // TODO@bpasero package
            if (!modulePath || this.productService.quality === 'stable') {
                this.logService.error(`[voice] transcribe(${channelData.length}): Voice recognition not yet supported`);
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
                this.logService.info(`[voice] transcribe(${channelData.length}): Text "${text}", took ${Date.now() - now}ms)`);
                return text;
            }
            catch (error) {
                this.logService.error(`[voice] transcribe(${channelData.length}): Failed width "${error}", took ${Date.now() - now}ms)`);
                throw error;
            }
        }
    };
    exports.VoiceRecognitionService = VoiceRecognitionService;
    exports.VoiceRecognitionService = VoiceRecognitionService = __decorate([
        __param(0, log_1.ILogService),
        __param(1, productService_1.IProductService)
    ], VoiceRecognitionService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidm9pY2VSZWNvZ25pdGlvblNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS92b2ljZVJlY29nbml0aW9uL25vZGUvdm9pY2VSZWNvZ25pdGlvblNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBT25GLFFBQUEsd0JBQXdCLEdBQUcsSUFBQSwrQkFBZSxFQUEyQix5QkFBeUIsQ0FBQyxDQUFDO0lBbUJ0RyxJQUFNLHVCQUF1QixHQUE3QixNQUFNLHVCQUF1QjtRQUluQyxZQUMrQixVQUF1QixFQUNuQixjQUErQjtZQURuQyxlQUFVLEdBQVYsVUFBVSxDQUFhO1lBQ25CLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtRQUM5RCxDQUFDO1FBRUwsS0FBSyxDQUFDLFVBQVUsQ0FBQyxXQUF5QixFQUFFLFlBQStCO1lBQzFFLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQyx1QkFBdUI7WUFDaEYsSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sS0FBSyxRQUFRLEVBQUU7Z0JBQzVELElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLHNCQUFzQixXQUFXLENBQUMsTUFBTSx3Q0FBd0MsQ0FBQyxDQUFDO2dCQUN4RyxNQUFNLElBQUksS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7YUFDeEQ7WUFFRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFFdkIsSUFBSTtnQkFDSCxNQUFNLFdBQVcsR0FRYixPQUFPLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBRXpDLE1BQU0sZUFBZSxHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7Z0JBQzlDLFlBQVksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztnQkFFcEUsTUFBTSxJQUFJLEdBQUcsTUFBTSxXQUFXLENBQUMsVUFBVSxDQUFDO29CQUN6QyxZQUFZLEVBQUUsS0FBSztvQkFDbkIsUUFBUSxFQUFFLEVBQUU7b0JBQ1osWUFBWSxFQUFFLENBQUM7b0JBQ2YsV0FBVztpQkFDWCxFQUFFO29CQUNGLFFBQVEsRUFBRSxJQUFJO29CQUNkLE1BQU0sRUFBRSxlQUFlLENBQUMsTUFBTTtpQkFDOUIsQ0FBQyxDQUFDO2dCQUVILElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLHNCQUFzQixXQUFXLENBQUMsTUFBTSxZQUFZLElBQUksV0FBVyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQztnQkFFL0csT0FBTyxJQUFJLENBQUM7YUFDWjtZQUFDLE9BQU8sS0FBSyxFQUFFO2dCQUNmLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLHNCQUFzQixXQUFXLENBQUMsTUFBTSxvQkFBb0IsS0FBSyxXQUFXLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDO2dCQUV6SCxNQUFNLEtBQUssQ0FBQzthQUNaO1FBQ0YsQ0FBQztLQUNELENBQUE7SUFuRFksMERBQXVCO3NDQUF2Qix1QkFBdUI7UUFLakMsV0FBQSxpQkFBVyxDQUFBO1FBQ1gsV0FBQSxnQ0FBZSxDQUFBO09BTkwsdUJBQXVCLENBbURuQyJ9