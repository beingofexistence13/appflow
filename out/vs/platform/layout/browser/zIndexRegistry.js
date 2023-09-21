/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/async"], function (require, exports, dom_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerZIndex = exports.ZIndex = void 0;
    var ZIndex;
    (function (ZIndex) {
        ZIndex[ZIndex["Base"] = 0] = "Base";
        ZIndex[ZIndex["Sash"] = 35] = "Sash";
        ZIndex[ZIndex["SuggestWidget"] = 40] = "SuggestWidget";
        ZIndex[ZIndex["Hover"] = 50] = "Hover";
        ZIndex[ZIndex["DragImage"] = 1000] = "DragImage";
        ZIndex[ZIndex["MenubarMenuItemsHolder"] = 2000] = "MenubarMenuItemsHolder";
        ZIndex[ZIndex["ContextView"] = 2500] = "ContextView";
        ZIndex[ZIndex["ModalDialog"] = 2600] = "ModalDialog";
        ZIndex[ZIndex["PaneDropOverlay"] = 10000] = "PaneDropOverlay";
    })(ZIndex || (exports.ZIndex = ZIndex = {}));
    const ZIndexValues = Object.keys(ZIndex).filter(key => !isNaN(Number(key))).map(key => Number(key)).sort((a, b) => b - a);
    function findBase(z) {
        for (const zi of ZIndexValues) {
            if (z >= zi) {
                return zi;
            }
        }
        return -1;
    }
    class ZIndexRegistry {
        constructor() {
            this.styleSheet = (0, dom_1.createStyleSheet)();
            this.zIndexMap = new Map();
            this.scheduler = new async_1.RunOnceScheduler(() => this.updateStyleElement(), 200);
        }
        registerZIndex(relativeLayer, z, name) {
            if (this.zIndexMap.get(name)) {
                throw new Error(`z-index with name ${name} has already been registered.`);
            }
            const proposedZValue = relativeLayer + z;
            if (findBase(proposedZValue) !== relativeLayer) {
                throw new Error(`Relative layer: ${relativeLayer} + z-index: ${z} exceeds next layer ${proposedZValue}.`);
            }
            this.zIndexMap.set(name, proposedZValue);
            this.scheduler.schedule();
            return this.getVarName(name);
        }
        getVarName(name) {
            return `--z-index-${name}`;
        }
        updateStyleElement() {
            (0, dom_1.clearNode)(this.styleSheet);
            let ruleBuilder = '';
            this.zIndexMap.forEach((zIndex, name) => {
                ruleBuilder += `${this.getVarName(name)}: ${zIndex};\n`;
            });
            (0, dom_1.createCSSRule)(':root', ruleBuilder, this.styleSheet);
        }
    }
    const zIndexRegistry = new ZIndexRegistry();
    function registerZIndex(relativeLayer, z, name) {
        return zIndexRegistry.registerZIndex(relativeLayer, z, name);
    }
    exports.registerZIndex = registerZIndex;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiekluZGV4UmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9sYXlvdXQvYnJvd3Nlci96SW5kZXhSZWdpc3RyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFLaEcsSUFBWSxNQVVYO0lBVkQsV0FBWSxNQUFNO1FBQ2pCLG1DQUFRLENBQUE7UUFDUixvQ0FBUyxDQUFBO1FBQ1Qsc0RBQWtCLENBQUE7UUFDbEIsc0NBQVUsQ0FBQTtRQUNWLGdEQUFnQixDQUFBO1FBQ2hCLDBFQUE2QixDQUFBO1FBQzdCLG9EQUFrQixDQUFBO1FBQ2xCLG9EQUFrQixDQUFBO1FBQ2xCLDZEQUF1QixDQUFBO0lBQ3hCLENBQUMsRUFWVyxNQUFNLHNCQUFOLE1BQU0sUUFVakI7SUFFRCxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzFILFNBQVMsUUFBUSxDQUFDLENBQVM7UUFDMUIsS0FBSyxNQUFNLEVBQUUsSUFBSSxZQUFZLEVBQUU7WUFDOUIsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFO2dCQUNaLE9BQU8sRUFBRSxDQUFDO2FBQ1Y7U0FDRDtRQUVELE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBRUQsTUFBTSxjQUFjO1FBSW5CO1lBQ0MsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFBLHNCQUFnQixHQUFFLENBQUM7WUFDckMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztZQUMzQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksd0JBQWdCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDN0UsQ0FBQztRQUVELGNBQWMsQ0FBQyxhQUFxQixFQUFFLENBQVMsRUFBRSxJQUFZO1lBQzVELElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzdCLE1BQU0sSUFBSSxLQUFLLENBQUMscUJBQXFCLElBQUksK0JBQStCLENBQUMsQ0FBQzthQUMxRTtZQUVELE1BQU0sY0FBYyxHQUFHLGFBQWEsR0FBRyxDQUFDLENBQUM7WUFDekMsSUFBSSxRQUFRLENBQUMsY0FBYyxDQUFDLEtBQUssYUFBYSxFQUFFO2dCQUMvQyxNQUFNLElBQUksS0FBSyxDQUFDLG1CQUFtQixhQUFhLGVBQWUsQ0FBQyx1QkFBdUIsY0FBYyxHQUFHLENBQUMsQ0FBQzthQUMxRztZQUVELElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzFCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5QixDQUFDO1FBRU8sVUFBVSxDQUFDLElBQVk7WUFDOUIsT0FBTyxhQUFhLElBQUksRUFBRSxDQUFDO1FBQzVCLENBQUM7UUFFTyxrQkFBa0I7WUFDekIsSUFBQSxlQUFTLEVBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzNCLElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQztZQUNyQixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRTtnQkFDdkMsV0FBVyxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxNQUFNLEtBQUssQ0FBQztZQUN6RCxDQUFDLENBQUMsQ0FBQztZQUNILElBQUEsbUJBQWEsRUFBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN0RCxDQUFDO0tBQ0Q7SUFFRCxNQUFNLGNBQWMsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO0lBRTVDLFNBQWdCLGNBQWMsQ0FBQyxhQUFxQixFQUFFLENBQVMsRUFBRSxJQUFZO1FBQzVFLE9BQU8sY0FBYyxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFGRCx3Q0FFQyJ9