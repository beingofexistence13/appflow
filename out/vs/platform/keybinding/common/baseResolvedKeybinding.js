/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/keybindingLabels", "vs/base/common/keybindings"], function (require, exports, errors_1, keybindingLabels_1, keybindings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BaseResolvedKeybinding = void 0;
    class BaseResolvedKeybinding extends keybindings_1.ResolvedKeybinding {
        constructor(os, chords) {
            super();
            if (chords.length === 0) {
                throw (0, errors_1.illegalArgument)(`chords`);
            }
            this._os = os;
            this._chords = chords;
        }
        getLabel() {
            return keybindingLabels_1.UILabelProvider.toLabel(this._os, this._chords, (keybinding) => this._getLabel(keybinding));
        }
        getAriaLabel() {
            return keybindingLabels_1.AriaLabelProvider.toLabel(this._os, this._chords, (keybinding) => this._getAriaLabel(keybinding));
        }
        getElectronAccelerator() {
            if (this._chords.length > 1) {
                // [Electron Accelerators] Electron cannot handle chords
                return null;
            }
            if (this._chords[0].isDuplicateModifierCase()) {
                // [Electron Accelerators] Electron cannot handle modifier only keybindings
                // e.g. "shift shift"
                return null;
            }
            return keybindingLabels_1.ElectronAcceleratorLabelProvider.toLabel(this._os, this._chords, (keybinding) => this._getElectronAccelerator(keybinding));
        }
        getUserSettingsLabel() {
            return keybindingLabels_1.UserSettingsLabelProvider.toLabel(this._os, this._chords, (keybinding) => this._getUserSettingsLabel(keybinding));
        }
        isWYSIWYG() {
            return this._chords.every((keybinding) => this._isWYSIWYG(keybinding));
        }
        hasMultipleChords() {
            return (this._chords.length > 1);
        }
        getChords() {
            return this._chords.map((keybinding) => this._getChord(keybinding));
        }
        _getChord(keybinding) {
            return new keybindings_1.ResolvedChord(keybinding.ctrlKey, keybinding.shiftKey, keybinding.altKey, keybinding.metaKey, this._getLabel(keybinding), this._getAriaLabel(keybinding));
        }
        getDispatchChords() {
            return this._chords.map((keybinding) => this._getChordDispatch(keybinding));
        }
        getSingleModifierDispatchChords() {
            return this._chords.map((keybinding) => this._getSingleModifierChordDispatch(keybinding));
        }
    }
    exports.BaseResolvedKeybinding = BaseResolvedKeybinding;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZVJlc29sdmVkS2V5YmluZGluZy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2tleWJpbmRpbmcvY29tbW9uL2Jhc2VSZXNvbHZlZEtleWJpbmRpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT2hHLE1BQXNCLHNCQUF3QyxTQUFRLGdDQUFrQjtRQUt2RixZQUFZLEVBQW1CLEVBQUUsTUFBb0I7WUFDcEQsS0FBSyxFQUFFLENBQUM7WUFDUixJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN4QixNQUFNLElBQUEsd0JBQWUsRUFBQyxRQUFRLENBQUMsQ0FBQzthQUNoQztZQUNELElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO1lBQ2QsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDdkIsQ0FBQztRQUVNLFFBQVE7WUFDZCxPQUFPLGtDQUFlLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ3BHLENBQUM7UUFFTSxZQUFZO1lBQ2xCLE9BQU8sb0NBQWlCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQzFHLENBQUM7UUFFTSxzQkFBc0I7WUFDNUIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQzVCLHdEQUF3RDtnQkFDeEQsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUNELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsRUFBRSxFQUFFO2dCQUM5QywyRUFBMkU7Z0JBQzNFLHFCQUFxQjtnQkFDckIsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUNELE9BQU8sbURBQWdDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDbkksQ0FBQztRQUVNLG9CQUFvQjtZQUMxQixPQUFPLDRDQUF5QixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQzFILENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ3hFLENBQUM7UUFFTSxpQkFBaUI7WUFDdkIsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ3JFLENBQUM7UUFFTyxTQUFTLENBQUMsVUFBYTtZQUM5QixPQUFPLElBQUksMkJBQWEsQ0FDdkIsVUFBVSxDQUFDLE9BQU8sRUFDbEIsVUFBVSxDQUFDLFFBQVEsRUFDbkIsVUFBVSxDQUFDLE1BQU0sRUFDakIsVUFBVSxDQUFDLE9BQU8sRUFDbEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFDMUIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FDOUIsQ0FBQztRQUNILENBQUM7UUFFTSxpQkFBaUI7WUFDdkIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDN0UsQ0FBQztRQUVNLCtCQUErQjtZQUNyQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsK0JBQStCLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUMzRixDQUFDO0tBU0Q7SUE3RUQsd0RBNkVDIn0=