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
define(["require", "exports", "crypto", "vs/base/common/stream", "vs/platform/files/common/files"], function (require, exports, crypto_1, stream_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChecksumService = void 0;
    let ChecksumService = class ChecksumService {
        constructor(fileService) {
            this.fileService = fileService;
        }
        async checksum(resource) {
            const stream = (await this.fileService.readFileStream(resource)).value;
            return new Promise((resolve, reject) => {
                const hash = (0, crypto_1.createHash)('md5');
                (0, stream_1.listenStream)(stream, {
                    onData: data => hash.update(data.buffer),
                    onError: error => reject(error),
                    onEnd: () => resolve(hash.digest('base64').replace(/=+$/, ''))
                });
            });
        }
    };
    exports.ChecksumService = ChecksumService;
    exports.ChecksumService = ChecksumService = __decorate([
        __param(0, files_1.IFileService)
    ], ChecksumService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tzdW1TZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vY2hlY2tzdW0vbm9kZS9jaGVja3N1bVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBUXpGLElBQU0sZUFBZSxHQUFyQixNQUFNLGVBQWU7UUFJM0IsWUFBMkMsV0FBeUI7WUFBekIsZ0JBQVcsR0FBWCxXQUFXLENBQWM7UUFBSSxDQUFDO1FBRXpFLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBYTtZQUMzQixNQUFNLE1BQU0sR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFDdkUsT0FBTyxJQUFJLE9BQU8sQ0FBUyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtnQkFDOUMsTUFBTSxJQUFJLEdBQUcsSUFBQSxtQkFBVSxFQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUUvQixJQUFBLHFCQUFZLEVBQUMsTUFBTSxFQUFFO29CQUNwQixNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7b0JBQ3hDLE9BQU8sRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7b0JBQy9CLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2lCQUM5RCxDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRCxDQUFBO0lBbEJZLDBDQUFlOzhCQUFmLGVBQWU7UUFJZCxXQUFBLG9CQUFZLENBQUE7T0FKYixlQUFlLENBa0IzQiJ9