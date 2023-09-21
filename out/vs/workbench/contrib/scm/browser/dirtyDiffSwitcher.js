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
define(["require", "exports", "vs/nls", "vs/base/common/actions", "vs/platform/contextview/browser/contextView", "vs/base/browser/ui/actionbar/actionViewItems", "vs/platform/theme/browser/defaultStyles", "vs/platform/theme/common/themeService", "vs/editor/contrib/peekView/browser/peekView", "vs/platform/theme/common/colorRegistry"], function (require, exports, nls, actions_1, contextView_1, actionViewItems_1, defaultStyles_1, themeService_1, peekView_1, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SwitchQuickDiffBaseAction = exports.SwitchQuickDiffViewItem = void 0;
    let SwitchQuickDiffViewItem = class SwitchQuickDiffViewItem extends actionViewItems_1.SelectActionViewItem {
        constructor(action, providers, selected, contextViewService, themeService) {
            const items = providers.map(provider => ({ provider, text: provider }));
            let startingSelection = providers.indexOf(selected);
            if (startingSelection === -1) {
                startingSelection = 0;
            }
            const styles = { ...defaultStyles_1.defaultSelectBoxStyles };
            const theme = themeService.getColorTheme();
            const editorBackgroundColor = theme.getColor(colorRegistry_1.editorBackground);
            const peekTitleColor = theme.getColor(peekView_1.peekViewTitleBackground);
            const opaqueTitleColor = peekTitleColor?.makeOpaque(editorBackgroundColor) ?? editorBackgroundColor;
            styles.selectBackground = opaqueTitleColor.lighten(.6).toString();
            super(null, action, items, startingSelection, contextViewService, styles, { ariaLabel: nls.localize('remotes', 'Switch quick diff base') });
            this.optionsItems = items;
        }
        setSelection(provider) {
            const index = this.optionsItems.findIndex(item => item.provider === provider);
            this.select(index);
        }
        getActionContext(_, index) {
            return this.optionsItems[index];
        }
        render(container) {
            super.render(container);
            this.setFocusable(true);
        }
    };
    exports.SwitchQuickDiffViewItem = SwitchQuickDiffViewItem;
    exports.SwitchQuickDiffViewItem = SwitchQuickDiffViewItem = __decorate([
        __param(3, contextView_1.IContextViewService),
        __param(4, themeService_1.IThemeService)
    ], SwitchQuickDiffViewItem);
    class SwitchQuickDiffBaseAction extends actions_1.Action {
        static { this.ID = 'quickDiff.base.switch'; }
        static { this.LABEL = nls.localize('quickDiff.base.switch', "Switch Quick Diff Base"); }
        constructor(callback) {
            super(SwitchQuickDiffBaseAction.ID, SwitchQuickDiffBaseAction.LABEL, undefined, undefined);
            this.callback = callback;
        }
        async run(event) {
            return this.callback(event);
        }
    }
    exports.SwitchQuickDiffBaseAction = SwitchQuickDiffBaseAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlydHlEaWZmU3dpdGNoZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zY20vYnJvd3Nlci9kaXJ0eURpZmZTd2l0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFnQnpGLElBQU0sdUJBQXVCLEdBQTdCLE1BQU0sdUJBQXdCLFNBQVEsc0NBQTBDO1FBR3RGLFlBQ0MsTUFBZSxFQUNmLFNBQW1CLEVBQ25CLFFBQWdCLEVBQ0ssa0JBQXVDLEVBQzdDLFlBQTJCO1lBRTFDLE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEUsSUFBSSxpQkFBaUIsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3BELElBQUksaUJBQWlCLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQzdCLGlCQUFpQixHQUFHLENBQUMsQ0FBQzthQUN0QjtZQUNELE1BQU0sTUFBTSxHQUFHLEVBQUUsR0FBRyxzQ0FBc0IsRUFBRSxDQUFDO1lBQzdDLE1BQU0sS0FBSyxHQUFHLFlBQVksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUMzQyxNQUFNLHFCQUFxQixHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsZ0NBQWdCLENBQUMsQ0FBQztZQUMvRCxNQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLGtDQUF1QixDQUFDLENBQUM7WUFDL0QsTUFBTSxnQkFBZ0IsR0FBRyxjQUFjLEVBQUUsVUFBVSxDQUFDLHFCQUFzQixDQUFDLElBQUkscUJBQXNCLENBQUM7WUFDdEcsTUFBTSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNsRSxLQUFLLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsaUJBQWlCLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLHdCQUF3QixDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzVJLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1FBQzNCLENBQUM7UUFFTSxZQUFZLENBQUMsUUFBZ0I7WUFDbkMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FBQyxDQUFDO1lBQzlFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEIsQ0FBQztRQUVrQixnQkFBZ0IsQ0FBQyxDQUFTLEVBQUUsS0FBYTtZQUMzRCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakMsQ0FBQztRQUVRLE1BQU0sQ0FBQyxTQUFzQjtZQUNyQyxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekIsQ0FBQztLQUNELENBQUE7SUF0Q1ksMERBQXVCO3NDQUF2Qix1QkFBdUI7UUFPakMsV0FBQSxpQ0FBbUIsQ0FBQTtRQUNuQixXQUFBLDRCQUFhLENBQUE7T0FSSCx1QkFBdUIsQ0FzQ25DO0lBRUQsTUFBYSx5QkFBMEIsU0FBUSxnQkFBTTtpQkFFN0IsT0FBRSxHQUFHLHVCQUF1QixDQUFDO2lCQUM3QixVQUFLLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO1FBRS9GLFlBQTZCLFFBQWdEO1lBQzVFLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxFQUFFLEVBQUUseUJBQXlCLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUQvRCxhQUFRLEdBQVIsUUFBUSxDQUF3QztRQUU3RSxDQUFDO1FBRVEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUE0QjtZQUM5QyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDN0IsQ0FBQzs7SUFYRiw4REFZQyJ9