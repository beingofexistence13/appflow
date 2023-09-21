/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/core/rgba", "vs/editor/common/languages"], function (require, exports, event_1, lifecycle_1, rgba_1, languages_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MinimapTokensColorTracker = void 0;
    class MinimapTokensColorTracker extends lifecycle_1.Disposable {
        static { this._INSTANCE = null; }
        static getInstance() {
            if (!this._INSTANCE) {
                this._INSTANCE = (0, lifecycle_1.markAsSingleton)(new MinimapTokensColorTracker());
            }
            return this._INSTANCE;
        }
        constructor() {
            super();
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._updateColorMap();
            this._register(languages_1.TokenizationRegistry.onDidChange(e => {
                if (e.changedColorMap) {
                    this._updateColorMap();
                }
            }));
        }
        _updateColorMap() {
            const colorMap = languages_1.TokenizationRegistry.getColorMap();
            if (!colorMap) {
                this._colors = [rgba_1.RGBA8.Empty];
                this._backgroundIsLight = true;
                return;
            }
            this._colors = [rgba_1.RGBA8.Empty];
            for (let colorId = 1; colorId < colorMap.length; colorId++) {
                const source = colorMap[colorId].rgba;
                // Use a VM friendly data-type
                this._colors[colorId] = new rgba_1.RGBA8(source.r, source.g, source.b, Math.round(source.a * 255));
            }
            const backgroundLuminosity = colorMap[2 /* ColorId.DefaultBackground */].getRelativeLuminance();
            this._backgroundIsLight = backgroundLuminosity >= 0.5;
            this._onDidChange.fire(undefined);
        }
        getColor(colorId) {
            if (colorId < 1 || colorId >= this._colors.length) {
                // background color (basically invisible)
                colorId = 2 /* ColorId.DefaultBackground */;
            }
            return this._colors[colorId];
        }
        backgroundIsLight() {
            return this._backgroundIsLight;
        }
    }
    exports.MinimapTokensColorTracker = MinimapTokensColorTracker;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWluaW1hcFRva2Vuc0NvbG9yVHJhY2tlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vdmlld01vZGVsL21pbmltYXBUb2tlbnNDb2xvclRyYWNrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLE1BQWEseUJBQTBCLFNBQVEsc0JBQVU7aUJBQ3pDLGNBQVMsR0FBcUMsSUFBSSxBQUF6QyxDQUEwQztRQUMzRCxNQUFNLENBQUMsV0FBVztZQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDcEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFBLDJCQUFlLEVBQUMsSUFBSSx5QkFBeUIsRUFBRSxDQUFDLENBQUM7YUFDbEU7WUFDRCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDdkIsQ0FBQztRQVFEO1lBQ0MsS0FBSyxFQUFFLENBQUM7WUFKUSxpQkFBWSxHQUFHLElBQUksZUFBTyxFQUFRLENBQUM7WUFDcEMsZ0JBQVcsR0FBZ0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7WUFJbEUsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxTQUFTLENBQUMsZ0NBQW9CLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNuRCxJQUFJLENBQUMsQ0FBQyxlQUFlLEVBQUU7b0JBQ3RCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztpQkFDdkI7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVPLGVBQWU7WUFDdEIsTUFBTSxRQUFRLEdBQUcsZ0NBQW9CLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDcEQsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDZCxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsWUFBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM3QixJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO2dCQUMvQixPQUFPO2FBQ1A7WUFDRCxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsWUFBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzdCLEtBQUssSUFBSSxPQUFPLEdBQUcsQ0FBQyxFQUFFLE9BQU8sR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxFQUFFO2dCQUMzRCxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUN0Qyw4QkFBOEI7Z0JBQzlCLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxZQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDNUY7WUFDRCxNQUFNLG9CQUFvQixHQUFHLFFBQVEsbUNBQTJCLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUN4RixJQUFJLENBQUMsa0JBQWtCLEdBQUcsb0JBQW9CLElBQUksR0FBRyxDQUFDO1lBQ3RELElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFFTSxRQUFRLENBQUMsT0FBZ0I7WUFDL0IsSUFBSSxPQUFPLEdBQUcsQ0FBQyxJQUFJLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtnQkFDbEQseUNBQXlDO2dCQUN6QyxPQUFPLG9DQUE0QixDQUFDO2FBQ3BDO1lBQ0QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzlCLENBQUM7UUFFTSxpQkFBaUI7WUFDdkIsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUM7UUFDaEMsQ0FBQzs7SUFyREYsOERBc0RDIn0=