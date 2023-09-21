/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/keyCodes", "vs/base/common/uri", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/languages", "vs/editor/common/standalone/standaloneEnums"], function (require, exports, cancellation_1, event_1, keyCodes_1, uri_1, position_1, range_1, selection_1, languages_1, standaloneEnums) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$DY = exports.$CY = void 0;
    class $CY {
        static { this.CtrlCmd = 2048 /* ConstKeyMod.CtrlCmd */; }
        static { this.Shift = 1024 /* ConstKeyMod.Shift */; }
        static { this.Alt = 512 /* ConstKeyMod.Alt */; }
        static { this.WinCtrl = 256 /* ConstKeyMod.WinCtrl */; }
        static chord(firstPart, secondPart) {
            return (0, keyCodes_1.$vq)(firstPart, secondPart);
        }
    }
    exports.$CY = $CY;
    function $DY() {
        return {
            editor: undefined,
            languages: undefined,
            CancellationTokenSource: cancellation_1.$pd,
            Emitter: event_1.$fd,
            KeyCode: standaloneEnums.KeyCode,
            KeyMod: $CY,
            Position: position_1.$js,
            Range: range_1.$ks,
            Selection: selection_1.$ms,
            SelectionDirection: standaloneEnums.SelectionDirection,
            MarkerSeverity: standaloneEnums.MarkerSeverity,
            MarkerTag: standaloneEnums.MarkerTag,
            Uri: uri_1.URI,
            Token: languages_1.$4s
        };
    }
    exports.$DY = $DY;
});
//# sourceMappingURL=editorBaseApi.js.map