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
define(["require", "exports", "vs/platform/clipboard/common/clipboardService", "vs/base/common/uri", "vs/base/common/platform", "vs/platform/instantiation/common/extensions", "vs/platform/native/common/native", "vs/base/common/buffer"], function (require, exports, clipboardService_1, uri_1, platform_1, extensions_1, native_1, buffer_1) {
    "use strict";
    var NativeClipboardService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeClipboardService = void 0;
    let NativeClipboardService = class NativeClipboardService {
        static { NativeClipboardService_1 = this; }
        static { this.FILE_FORMAT = 'code/file-list'; } // Clipboard format for files
        constructor(nativeHostService) {
            this.nativeHostService = nativeHostService;
        }
        async writeText(text, type) {
            return this.nativeHostService.writeClipboardText(text, type);
        }
        async readText(type) {
            return this.nativeHostService.readClipboardText(type);
        }
        async readFindText() {
            if (platform_1.isMacintosh) {
                return this.nativeHostService.readClipboardFindText();
            }
            return '';
        }
        async writeFindText(text) {
            if (platform_1.isMacintosh) {
                return this.nativeHostService.writeClipboardFindText(text);
            }
        }
        async writeResources(resources) {
            if (resources.length) {
                return this.nativeHostService.writeClipboardBuffer(NativeClipboardService_1.FILE_FORMAT, this.resourcesToBuffer(resources));
            }
        }
        async readResources() {
            return this.bufferToResources(await this.nativeHostService.readClipboardBuffer(NativeClipboardService_1.FILE_FORMAT));
        }
        async hasResources() {
            return this.nativeHostService.hasClipboard(NativeClipboardService_1.FILE_FORMAT);
        }
        resourcesToBuffer(resources) {
            return buffer_1.VSBuffer.fromString(resources.map(r => r.toString()).join('\n'));
        }
        bufferToResources(buffer) {
            if (!buffer) {
                return [];
            }
            const bufferValue = buffer.toString();
            if (!bufferValue) {
                return [];
            }
            try {
                return bufferValue.split('\n').map(f => uri_1.URI.parse(f));
            }
            catch (error) {
                return []; // do not trust clipboard data
            }
        }
    };
    exports.NativeClipboardService = NativeClipboardService;
    exports.NativeClipboardService = NativeClipboardService = NativeClipboardService_1 = __decorate([
        __param(0, native_1.INativeHostService)
    ], NativeClipboardService);
    (0, extensions_1.registerSingleton)(clipboardService_1.IClipboardService, NativeClipboardService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpcGJvYXJkU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9jbGlwYm9hcmQvZWxlY3Ryb24tc2FuZGJveC9jbGlwYm9hcmRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFTekYsSUFBTSxzQkFBc0IsR0FBNUIsTUFBTSxzQkFBc0I7O2lCQUVWLGdCQUFXLEdBQUcsZ0JBQWdCLEFBQW5CLENBQW9CLEdBQUMsNkJBQTZCO1FBSXJGLFlBQ3NDLGlCQUFxQztZQUFyQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1FBQ3ZFLENBQUM7UUFFTCxLQUFLLENBQUMsU0FBUyxDQUFDLElBQVksRUFBRSxJQUFnQztZQUM3RCxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDOUQsQ0FBQztRQUVELEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBZ0M7WUFDOUMsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUVELEtBQUssQ0FBQyxZQUFZO1lBQ2pCLElBQUksc0JBQVcsRUFBRTtnQkFDaEIsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMscUJBQXFCLEVBQUUsQ0FBQzthQUN0RDtZQUVELE9BQU8sRUFBRSxDQUFDO1FBQ1gsQ0FBQztRQUVELEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBWTtZQUMvQixJQUFJLHNCQUFXLEVBQUU7Z0JBQ2hCLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxDQUFDO2FBQzNEO1FBQ0YsQ0FBQztRQUVELEtBQUssQ0FBQyxjQUFjLENBQUMsU0FBZ0I7WUFDcEMsSUFBSSxTQUFTLENBQUMsTUFBTSxFQUFFO2dCQUNyQixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxvQkFBb0IsQ0FBQyx3QkFBc0IsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7YUFDMUg7UUFDRixDQUFDO1FBRUQsS0FBSyxDQUFDLGFBQWE7WUFDbEIsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsbUJBQW1CLENBQUMsd0JBQXNCLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNySCxDQUFDO1FBRUQsS0FBSyxDQUFDLFlBQVk7WUFDakIsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsWUFBWSxDQUFDLHdCQUFzQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2hGLENBQUM7UUFFTyxpQkFBaUIsQ0FBQyxTQUFnQjtZQUN6QyxPQUFPLGlCQUFRLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN6RSxDQUFDO1FBRU8saUJBQWlCLENBQUMsTUFBZ0I7WUFDekMsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDWixPQUFPLEVBQUUsQ0FBQzthQUNWO1lBRUQsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3RDLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ2pCLE9BQU8sRUFBRSxDQUFDO2FBQ1Y7WUFFRCxJQUFJO2dCQUNILE9BQU8sV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDdEQ7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDZixPQUFPLEVBQUUsQ0FBQyxDQUFDLDhCQUE4QjthQUN6QztRQUNGLENBQUM7O0lBakVXLHdEQUFzQjtxQ0FBdEIsc0JBQXNCO1FBT2hDLFdBQUEsMkJBQWtCLENBQUE7T0FQUixzQkFBc0IsQ0FrRWxDO0lBRUQsSUFBQSw4QkFBaUIsRUFBQyxvQ0FBaUIsRUFBRSxzQkFBc0Isb0NBQTRCLENBQUMifQ==