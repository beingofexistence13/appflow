/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/keyCodes", "vs/base/common/uri", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/languages", "vs/editor/common/standalone/standaloneEnums"], function (require, exports, cancellation_1, event_1, keyCodes_1, uri_1, position_1, range_1, selection_1, languages_1, standaloneEnums) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createMonacoBaseAPI = exports.KeyMod = void 0;
    class KeyMod {
        static { this.CtrlCmd = 2048 /* ConstKeyMod.CtrlCmd */; }
        static { this.Shift = 1024 /* ConstKeyMod.Shift */; }
        static { this.Alt = 512 /* ConstKeyMod.Alt */; }
        static { this.WinCtrl = 256 /* ConstKeyMod.WinCtrl */; }
        static chord(firstPart, secondPart) {
            return (0, keyCodes_1.KeyChord)(firstPart, secondPart);
        }
    }
    exports.KeyMod = KeyMod;
    function createMonacoBaseAPI() {
        return {
            editor: undefined,
            languages: undefined,
            CancellationTokenSource: cancellation_1.CancellationTokenSource,
            Emitter: event_1.Emitter,
            KeyCode: standaloneEnums.KeyCode,
            KeyMod: KeyMod,
            Position: position_1.Position,
            Range: range_1.Range,
            Selection: selection_1.Selection,
            SelectionDirection: standaloneEnums.SelectionDirection,
            MarkerSeverity: standaloneEnums.MarkerSeverity,
            MarkerTag: standaloneEnums.MarkerTag,
            Uri: uri_1.URI,
            Token: languages_1.Token
        };
    }
    exports.createMonacoBaseAPI = createMonacoBaseAPI;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yQmFzZUFwaS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vc2VydmljZXMvZWRpdG9yQmFzZUFwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFZaEcsTUFBYSxNQUFNO2lCQUNLLFlBQU8sa0NBQStCO2lCQUN0QyxVQUFLLGdDQUE2QjtpQkFDbEMsUUFBRyw2QkFBMkI7aUJBQzlCLFlBQU8saUNBQStCO1FBRXRELE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBaUIsRUFBRSxVQUFrQjtZQUN4RCxPQUFPLElBQUEsbUJBQVEsRUFBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDeEMsQ0FBQzs7SUFSRix3QkFTQztJQUVELFNBQWdCLG1CQUFtQjtRQUNsQyxPQUFPO1lBQ04sTUFBTSxFQUFFLFNBQVU7WUFDbEIsU0FBUyxFQUFFLFNBQVU7WUFDckIsdUJBQXVCLEVBQUUsc0NBQXVCO1lBQ2hELE9BQU8sRUFBRSxlQUFPO1lBQ2hCLE9BQU8sRUFBRSxlQUFlLENBQUMsT0FBTztZQUNoQyxNQUFNLEVBQUUsTUFBTTtZQUNkLFFBQVEsRUFBRSxtQkFBUTtZQUNsQixLQUFLLEVBQUUsYUFBSztZQUNaLFNBQVMsRUFBTyxxQkFBUztZQUN6QixrQkFBa0IsRUFBRSxlQUFlLENBQUMsa0JBQWtCO1lBQ3RELGNBQWMsRUFBRSxlQUFlLENBQUMsY0FBYztZQUM5QyxTQUFTLEVBQUUsZUFBZSxDQUFDLFNBQVM7WUFDcEMsR0FBRyxFQUFPLFNBQUc7WUFDYixLQUFLLEVBQUUsaUJBQUs7U0FDWixDQUFDO0lBQ0gsQ0FBQztJQWpCRCxrREFpQkMifQ==