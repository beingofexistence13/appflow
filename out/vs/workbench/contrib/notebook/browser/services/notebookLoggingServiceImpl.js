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
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/platform/log/common/log"], function (require, exports, nls, lifecycle_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookLoggingService = void 0;
    const logChannelId = 'notebook.rendering';
    let NotebookLoggingService = class NotebookLoggingService extends lifecycle_1.Disposable {
        static { this.ID = 'notebook'; }
        constructor(loggerService) {
            super();
            this._logger = this._register(loggerService.createLogger(logChannelId, { name: nls.localize('renderChannelName', "Notebook rendering") }));
        }
        debug(category, output) {
            this._logger.debug(`[${category}] ${output}`);
        }
        info(category, output) {
            this._logger.info(`[${category}] ${output}`);
        }
    };
    exports.NotebookLoggingService = NotebookLoggingService;
    exports.NotebookLoggingService = NotebookLoggingService = __decorate([
        __param(0, log_1.ILoggerService)
    ], NotebookLoggingService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tMb2dnaW5nU2VydmljZUltcGwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL3NlcnZpY2VzL25vdGVib29rTG9nZ2luZ1NlcnZpY2VJbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQU9oRyxNQUFNLFlBQVksR0FBRyxvQkFBb0IsQ0FBQztJQUVuQyxJQUFNLHNCQUFzQixHQUE1QixNQUFNLHNCQUF1QixTQUFRLHNCQUFVO2lCQUc5QyxPQUFFLEdBQVcsVUFBVSxBQUFyQixDQUFzQjtRQUcvQixZQUNpQixhQUE2QjtZQUU3QyxLQUFLLEVBQUUsQ0FBQztZQUNSLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLG1CQUFtQixFQUFFLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDNUksQ0FBQztRQUVELEtBQUssQ0FBQyxRQUFnQixFQUFFLE1BQWM7WUFDckMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxRQUFRLEtBQUssTUFBTSxFQUFFLENBQUMsQ0FBQztRQUMvQyxDQUFDO1FBRUQsSUFBSSxDQUFDLFFBQWdCLEVBQUUsTUFBYztZQUNwQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLFFBQVEsS0FBSyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLENBQUM7O0lBbkJXLHdEQUFzQjtxQ0FBdEIsc0JBQXNCO1FBT2hDLFdBQUEsb0JBQWMsQ0FBQTtPQVBKLHNCQUFzQixDQW9CbEMifQ==