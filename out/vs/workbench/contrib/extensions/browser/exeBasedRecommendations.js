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
define(["require", "exports", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/contrib/extensions/browser/extensionRecommendations", "vs/nls"], function (require, exports, extensionManagement_1, extensionRecommendations_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExeBasedRecommendations = void 0;
    let ExeBasedRecommendations = class ExeBasedRecommendations extends extensionRecommendations_1.ExtensionRecommendations {
        get otherRecommendations() { return this._otherTips.map(tip => this.toExtensionRecommendation(tip)); }
        get importantRecommendations() { return this._importantTips.map(tip => this.toExtensionRecommendation(tip)); }
        get recommendations() { return [...this.importantRecommendations, ...this.otherRecommendations]; }
        constructor(extensionTipsService) {
            super();
            this.extensionTipsService = extensionTipsService;
            this._otherTips = [];
            this._importantTips = [];
        }
        getRecommendations(exe) {
            const important = this._importantTips
                .filter(tip => tip.exeName.toLowerCase() === exe.toLowerCase())
                .map(tip => this.toExtensionRecommendation(tip));
            const others = this._otherTips
                .filter(tip => tip.exeName.toLowerCase() === exe.toLowerCase())
                .map(tip => this.toExtensionRecommendation(tip));
            return { important, others };
        }
        async doActivate() {
            this._otherTips = await this.extensionTipsService.getOtherExecutableBasedTips();
            await this.fetchImportantExeBasedRecommendations();
        }
        async fetchImportantExeBasedRecommendations() {
            if (!this._importantExeBasedRecommendations) {
                this._importantExeBasedRecommendations = this.doFetchImportantExeBasedRecommendations();
            }
            return this._importantExeBasedRecommendations;
        }
        async doFetchImportantExeBasedRecommendations() {
            const importantExeBasedRecommendations = new Map();
            this._importantTips = await this.extensionTipsService.getImportantExecutableBasedTips();
            this._importantTips.forEach(tip => importantExeBasedRecommendations.set(tip.extensionId.toLowerCase(), tip));
            return importantExeBasedRecommendations;
        }
        toExtensionRecommendation(tip) {
            return {
                extensionId: tip.extensionId.toLowerCase(),
                reason: {
                    reasonId: 2 /* ExtensionRecommendationReason.Executable */,
                    reasonText: (0, nls_1.localize)('exeBasedRecommendation', "This extension is recommended because you have {0} installed.", tip.exeFriendlyName)
                }
            };
        }
    };
    exports.ExeBasedRecommendations = ExeBasedRecommendations;
    exports.ExeBasedRecommendations = ExeBasedRecommendations = __decorate([
        __param(0, extensionManagement_1.IExtensionTipsService)
    ], ExeBasedRecommendations);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhlQmFzZWRSZWNvbW1lbmRhdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9leHRlbnNpb25zL2Jyb3dzZXIvZXhlQmFzZWRSZWNvbW1lbmRhdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBT3pGLElBQU0sdUJBQXVCLEdBQTdCLE1BQU0sdUJBQXdCLFNBQVEsbURBQXdCO1FBS3BFLElBQUksb0JBQW9CLEtBQTZDLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDOUksSUFBSSx3QkFBd0IsS0FBNkMsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUV0SixJQUFJLGVBQWUsS0FBNkMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixFQUFFLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTFJLFlBQ3dCLG9CQUE0RDtZQUVuRixLQUFLLEVBQUUsQ0FBQztZQUZnQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBVDVFLGVBQVUsR0FBbUMsRUFBRSxDQUFDO1lBQ2hELG1CQUFjLEdBQW1DLEVBQUUsQ0FBQztRQVc1RCxDQUFDO1FBRUQsa0JBQWtCLENBQUMsR0FBVztZQUM3QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsY0FBYztpQkFDbkMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsS0FBSyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7aUJBQzlELEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRWxELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVO2lCQUM1QixNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxLQUFLLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztpQkFDOUQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFFbEQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsQ0FBQztRQUM5QixDQUFDO1FBRVMsS0FBSyxDQUFDLFVBQVU7WUFDekIsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQywyQkFBMkIsRUFBRSxDQUFDO1lBQ2hGLE1BQU0sSUFBSSxDQUFDLHFDQUFxQyxFQUFFLENBQUM7UUFDcEQsQ0FBQztRQUdPLEtBQUssQ0FBQyxxQ0FBcUM7WUFDbEQsSUFBSSxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsRUFBRTtnQkFDNUMsSUFBSSxDQUFDLGlDQUFpQyxHQUFHLElBQUksQ0FBQyx1Q0FBdUMsRUFBRSxDQUFDO2FBQ3hGO1lBQ0QsT0FBTyxJQUFJLENBQUMsaUNBQWlDLENBQUM7UUFDL0MsQ0FBQztRQUVPLEtBQUssQ0FBQyx1Q0FBdUM7WUFDcEQsTUFBTSxnQ0FBZ0MsR0FBRyxJQUFJLEdBQUcsRUFBd0MsQ0FBQztZQUN6RixJQUFJLENBQUMsY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLCtCQUErQixFQUFFLENBQUM7WUFDeEYsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxnQ0FBZ0MsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzdHLE9BQU8sZ0NBQWdDLENBQUM7UUFDekMsQ0FBQztRQUVPLHlCQUF5QixDQUFDLEdBQWlDO1lBQ2xFLE9BQU87Z0JBQ04sV0FBVyxFQUFFLEdBQUcsQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFO2dCQUMxQyxNQUFNLEVBQUU7b0JBQ1AsUUFBUSxrREFBMEM7b0JBQ2xELFVBQVUsRUFBRSxJQUFBLGNBQVEsRUFBQyx3QkFBd0IsRUFBRSwrREFBK0QsRUFBRSxHQUFHLENBQUMsZUFBZSxDQUFDO2lCQUNwSTthQUNELENBQUM7UUFDSCxDQUFDO0tBRUQsQ0FBQTtJQTFEWSwwREFBdUI7c0NBQXZCLHVCQUF1QjtRQVdqQyxXQUFBLDJDQUFxQixDQUFBO09BWFgsdUJBQXVCLENBMERuQyJ9