/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/toggle/toggle", "vs/base/common/codicons", "vs/nls"], function (require, exports, toggle_1, codicons_1, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RegexToggle = exports.WholeWordsToggle = exports.CaseSensitiveToggle = void 0;
    const NLS_CASE_SENSITIVE_TOGGLE_LABEL = nls.localize('caseDescription', "Match Case");
    const NLS_WHOLE_WORD_TOGGLE_LABEL = nls.localize('wordsDescription', "Match Whole Word");
    const NLS_REGEX_TOGGLE_LABEL = nls.localize('regexDescription', "Use Regular Expression");
    class CaseSensitiveToggle extends toggle_1.Toggle {
        constructor(opts) {
            super({
                icon: codicons_1.Codicon.caseSensitive,
                title: NLS_CASE_SENSITIVE_TOGGLE_LABEL + opts.appendTitle,
                isChecked: opts.isChecked,
                inputActiveOptionBorder: opts.inputActiveOptionBorder,
                inputActiveOptionForeground: opts.inputActiveOptionForeground,
                inputActiveOptionBackground: opts.inputActiveOptionBackground
            });
        }
    }
    exports.CaseSensitiveToggle = CaseSensitiveToggle;
    class WholeWordsToggle extends toggle_1.Toggle {
        constructor(opts) {
            super({
                icon: codicons_1.Codicon.wholeWord,
                title: NLS_WHOLE_WORD_TOGGLE_LABEL + opts.appendTitle,
                isChecked: opts.isChecked,
                inputActiveOptionBorder: opts.inputActiveOptionBorder,
                inputActiveOptionForeground: opts.inputActiveOptionForeground,
                inputActiveOptionBackground: opts.inputActiveOptionBackground
            });
        }
    }
    exports.WholeWordsToggle = WholeWordsToggle;
    class RegexToggle extends toggle_1.Toggle {
        constructor(opts) {
            super({
                icon: codicons_1.Codicon.regex,
                title: NLS_REGEX_TOGGLE_LABEL + opts.appendTitle,
                isChecked: opts.isChecked,
                inputActiveOptionBorder: opts.inputActiveOptionBorder,
                inputActiveOptionForeground: opts.inputActiveOptionForeground,
                inputActiveOptionBackground: opts.inputActiveOptionBackground
            });
        }
    }
    exports.RegexToggle = RegexToggle;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZElucHV0VG9nZ2xlcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvYnJvd3Nlci91aS9maW5kaW5wdXQvZmluZElucHV0VG9nZ2xlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFjaEcsTUFBTSwrQkFBK0IsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQ3RGLE1BQU0sMkJBQTJCLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0lBQ3pGLE1BQU0sc0JBQXNCLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO0lBRTFGLE1BQWEsbUJBQW9CLFNBQVEsZUFBTTtRQUM5QyxZQUFZLElBQTBCO1lBQ3JDLEtBQUssQ0FBQztnQkFDTCxJQUFJLEVBQUUsa0JBQU8sQ0FBQyxhQUFhO2dCQUMzQixLQUFLLEVBQUUsK0JBQStCLEdBQUcsSUFBSSxDQUFDLFdBQVc7Z0JBQ3pELFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUztnQkFDekIsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLHVCQUF1QjtnQkFDckQsMkJBQTJCLEVBQUUsSUFBSSxDQUFDLDJCQUEyQjtnQkFDN0QsMkJBQTJCLEVBQUUsSUFBSSxDQUFDLDJCQUEyQjthQUM3RCxDQUFDLENBQUM7UUFDSixDQUFDO0tBQ0Q7SUFYRCxrREFXQztJQUVELE1BQWEsZ0JBQWlCLFNBQVEsZUFBTTtRQUMzQyxZQUFZLElBQTBCO1lBQ3JDLEtBQUssQ0FBQztnQkFDTCxJQUFJLEVBQUUsa0JBQU8sQ0FBQyxTQUFTO2dCQUN2QixLQUFLLEVBQUUsMkJBQTJCLEdBQUcsSUFBSSxDQUFDLFdBQVc7Z0JBQ3JELFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUztnQkFDekIsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLHVCQUF1QjtnQkFDckQsMkJBQTJCLEVBQUUsSUFBSSxDQUFDLDJCQUEyQjtnQkFDN0QsMkJBQTJCLEVBQUUsSUFBSSxDQUFDLDJCQUEyQjthQUM3RCxDQUFDLENBQUM7UUFDSixDQUFDO0tBQ0Q7SUFYRCw0Q0FXQztJQUVELE1BQWEsV0FBWSxTQUFRLGVBQU07UUFDdEMsWUFBWSxJQUEwQjtZQUNyQyxLQUFLLENBQUM7Z0JBQ0wsSUFBSSxFQUFFLGtCQUFPLENBQUMsS0FBSztnQkFDbkIsS0FBSyxFQUFFLHNCQUFzQixHQUFHLElBQUksQ0FBQyxXQUFXO2dCQUNoRCxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVM7Z0JBQ3pCLHVCQUF1QixFQUFFLElBQUksQ0FBQyx1QkFBdUI7Z0JBQ3JELDJCQUEyQixFQUFFLElBQUksQ0FBQywyQkFBMkI7Z0JBQzdELDJCQUEyQixFQUFFLElBQUksQ0FBQywyQkFBMkI7YUFDN0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztLQUNEO0lBWEQsa0NBV0MifQ==