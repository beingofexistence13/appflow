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
define(["require", "exports", "vs/platform/contextkey/common/contextkey"], function (require, exports, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Breakpoints = void 0;
    let Breakpoints = class Breakpoints {
        constructor(breakpointContribution, contextKeyService) {
            this.breakpointContribution = breakpointContribution;
            this.contextKeyService = contextKeyService;
            this.breakpointsWhen = typeof breakpointContribution.when === 'string' ? contextkey_1.ContextKeyExpr.deserialize(breakpointContribution.when) : undefined;
        }
        get language() {
            return this.breakpointContribution.language;
        }
        get enabled() {
            return !this.breakpointsWhen || this.contextKeyService.contextMatchesRules(this.breakpointsWhen);
        }
    };
    exports.Breakpoints = Breakpoints;
    exports.Breakpoints = Breakpoints = __decorate([
        __param(1, contextkey_1.IContextKeyService)
    ], Breakpoints);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJlYWtwb2ludHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9kZWJ1Zy9jb21tb24vYnJlYWtwb2ludHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBS3pGLElBQU0sV0FBVyxHQUFqQixNQUFNLFdBQVc7UUFJdkIsWUFDa0Isc0JBQStDLEVBQzNCLGlCQUFxQztZQUR6RCwyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXlCO1lBQzNCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFFMUUsSUFBSSxDQUFDLGVBQWUsR0FBRyxPQUFPLHNCQUFzQixDQUFDLElBQUksS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLDJCQUFjLENBQUMsV0FBVyxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDOUksQ0FBQztRQUVELElBQUksUUFBUTtZQUNYLE9BQU8sSUFBSSxDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQztRQUM3QyxDQUFDO1FBRUQsSUFBSSxPQUFPO1lBQ1YsT0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNsRyxDQUFDO0tBQ0QsQ0FBQTtJQWxCWSxrQ0FBVzswQkFBWCxXQUFXO1FBTXJCLFdBQUEsK0JBQWtCLENBQUE7T0FOUixXQUFXLENBa0J2QiJ9