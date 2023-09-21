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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/network", "vs/platform/files/common/files", "vs/platform/request/common/request"], function (require, exports, cancellation_1, network_1, files_1, request_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DownloadService = void 0;
    let DownloadService = class DownloadService {
        constructor(requestService, fileService) {
            this.requestService = requestService;
            this.fileService = fileService;
        }
        async download(resource, target, cancellationToken = cancellation_1.CancellationToken.None) {
            if (resource.scheme === network_1.Schemas.file || resource.scheme === network_1.Schemas.vscodeRemote) {
                // Intentionally only support this for file|remote<->file|remote scenarios
                await this.fileService.copy(resource, target);
                return;
            }
            const options = { type: 'GET', url: resource.toString(true) };
            const context = await this.requestService.request(options, cancellationToken);
            if (context.res.statusCode === 200) {
                await this.fileService.writeFile(target, context.stream);
            }
            else {
                const message = await (0, request_1.asTextOrError)(context);
                throw new Error(`Expected 200, got back ${context.res.statusCode} instead.\n\n${message}`);
            }
        }
    };
    exports.DownloadService = DownloadService;
    exports.DownloadService = DownloadService = __decorate([
        __param(0, request_1.IRequestService),
        __param(1, files_1.IFileService)
    ], DownloadService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmxvYWRTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZG93bmxvYWQvY29tbW9uL2Rvd25sb2FkU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFTekYsSUFBTSxlQUFlLEdBQXJCLE1BQU0sZUFBZTtRQUkzQixZQUNtQyxjQUErQixFQUNsQyxXQUF5QjtZQUR0QixtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDbEMsZ0JBQVcsR0FBWCxXQUFXLENBQWM7UUFDckQsQ0FBQztRQUVMLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBYSxFQUFFLE1BQVcsRUFBRSxvQkFBdUMsZ0NBQWlCLENBQUMsSUFBSTtZQUN2RyxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssaUJBQU8sQ0FBQyxJQUFJLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxpQkFBTyxDQUFDLFlBQVksRUFBRTtnQkFDakYsMEVBQTBFO2dCQUMxRSxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDOUMsT0FBTzthQUNQO1lBQ0QsTUFBTSxPQUFPLEdBQUcsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDOUQsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztZQUM5RSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxLQUFLLEdBQUcsRUFBRTtnQkFDbkMsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ3pEO2lCQUFNO2dCQUNOLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBQSx1QkFBYSxFQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUM3QyxNQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsZ0JBQWdCLE9BQU8sRUFBRSxDQUFDLENBQUM7YUFDM0Y7UUFDRixDQUFDO0tBQ0QsQ0FBQTtJQXhCWSwwQ0FBZTs4QkFBZixlQUFlO1FBS3pCLFdBQUEseUJBQWUsQ0FBQTtRQUNmLFdBQUEsb0JBQVksQ0FBQTtPQU5GLGVBQWUsQ0F3QjNCIn0=