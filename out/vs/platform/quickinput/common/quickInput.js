/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/base/common/network"], function (require, exports, instantiation_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IQuickInputService = exports.quickPickItemScorerAccessor = exports.QuickPickItemScorerAccessor = exports.ItemActivation = exports.QuickInputHideReason = exports.NO_KEY_MODS = void 0;
    exports.NO_KEY_MODS = { ctrlCmd: false, alt: false };
    var QuickInputHideReason;
    (function (QuickInputHideReason) {
        /**
         * Focus moved away from the quick input.
         */
        QuickInputHideReason[QuickInputHideReason["Blur"] = 1] = "Blur";
        /**
         * An explicit user gesture, e.g. pressing Escape key.
         */
        QuickInputHideReason[QuickInputHideReason["Gesture"] = 2] = "Gesture";
        /**
         * Anything else.
         */
        QuickInputHideReason[QuickInputHideReason["Other"] = 3] = "Other";
    })(QuickInputHideReason || (exports.QuickInputHideReason = QuickInputHideReason = {}));
    var ItemActivation;
    (function (ItemActivation) {
        ItemActivation[ItemActivation["NONE"] = 0] = "NONE";
        ItemActivation[ItemActivation["FIRST"] = 1] = "FIRST";
        ItemActivation[ItemActivation["SECOND"] = 2] = "SECOND";
        ItemActivation[ItemActivation["LAST"] = 3] = "LAST";
    })(ItemActivation || (exports.ItemActivation = ItemActivation = {}));
    class QuickPickItemScorerAccessor {
        constructor(options) {
            this.options = options;
        }
        getItemLabel(entry) {
            return entry.label;
        }
        getItemDescription(entry) {
            if (this.options?.skipDescription) {
                return undefined;
            }
            return entry.description;
        }
        getItemPath(entry) {
            if (this.options?.skipPath) {
                return undefined;
            }
            if (entry.resource?.scheme === network_1.Schemas.file) {
                return entry.resource.fsPath;
            }
            return entry.resource?.path;
        }
    }
    exports.QuickPickItemScorerAccessor = QuickPickItemScorerAccessor;
    exports.quickPickItemScorerAccessor = new QuickPickItemScorerAccessor();
    //#endregion
    exports.IQuickInputService = (0, instantiation_1.createDecorator)('quickInputService');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpY2tJbnB1dC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3F1aWNraW5wdXQvY29tbW9uL3F1aWNrSW5wdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBOERuRixRQUFBLFdBQVcsR0FBYSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDO0lBdUhwRSxJQUFZLG9CQWdCWDtJQWhCRCxXQUFZLG9CQUFvQjtRQUUvQjs7V0FFRztRQUNILCtEQUFRLENBQUE7UUFFUjs7V0FFRztRQUNILHFFQUFPLENBQUE7UUFFUDs7V0FFRztRQUNILGlFQUFLLENBQUE7SUFDTixDQUFDLEVBaEJXLG9CQUFvQixvQ0FBcEIsb0JBQW9CLFFBZ0IvQjtJQXNFRCxJQUFZLGNBS1g7SUFMRCxXQUFZLGNBQWM7UUFDekIsbURBQUksQ0FBQTtRQUNKLHFEQUFLLENBQUE7UUFDTCx1REFBTSxDQUFBO1FBQ04sbURBQUksQ0FBQTtJQUNMLENBQUMsRUFMVyxjQUFjLDhCQUFkLGNBQWMsUUFLekI7SUF5TUQsTUFBYSwyQkFBMkI7UUFFdkMsWUFBb0IsT0FBMkQ7WUFBM0QsWUFBTyxHQUFQLE9BQU8sQ0FBb0Q7UUFBSSxDQUFDO1FBRXBGLFlBQVksQ0FBQyxLQUFpQztZQUM3QyxPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUM7UUFDcEIsQ0FBQztRQUVELGtCQUFrQixDQUFDLEtBQWlDO1lBQ25ELElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxlQUFlLEVBQUU7Z0JBQ2xDLE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1lBRUQsT0FBTyxLQUFLLENBQUMsV0FBVyxDQUFDO1FBQzFCLENBQUM7UUFFRCxXQUFXLENBQUMsS0FBaUM7WUFDNUMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRTtnQkFDM0IsT0FBTyxTQUFTLENBQUM7YUFDakI7WUFFRCxJQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUUsTUFBTSxLQUFLLGlCQUFPLENBQUMsSUFBSSxFQUFFO2dCQUM1QyxPQUFPLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO2FBQzdCO1lBRUQsT0FBTyxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQztRQUM3QixDQUFDO0tBQ0Q7SUEzQkQsa0VBMkJDO0lBRVksUUFBQSwyQkFBMkIsR0FBRyxJQUFJLDJCQUEyQixFQUFFLENBQUM7SUFFN0UsWUFBWTtJQUVDLFFBQUEsa0JBQWtCLEdBQUcsSUFBQSwrQkFBZSxFQUFxQixtQkFBbUIsQ0FBQyxDQUFDIn0=