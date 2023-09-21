/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "./strings"], function (require, exports, strings) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildReplaceStringWithCasePreserved = void 0;
    function buildReplaceStringWithCasePreserved(matches, pattern) {
        if (matches && (matches[0] !== '')) {
            const containsHyphens = validateSpecificSpecialCharacter(matches, pattern, '-');
            const containsUnderscores = validateSpecificSpecialCharacter(matches, pattern, '_');
            if (containsHyphens && !containsUnderscores) {
                return buildReplaceStringForSpecificSpecialCharacter(matches, pattern, '-');
            }
            else if (!containsHyphens && containsUnderscores) {
                return buildReplaceStringForSpecificSpecialCharacter(matches, pattern, '_');
            }
            if (matches[0].toUpperCase() === matches[0]) {
                return pattern.toUpperCase();
            }
            else if (matches[0].toLowerCase() === matches[0]) {
                return pattern.toLowerCase();
            }
            else if (strings.containsUppercaseCharacter(matches[0][0]) && pattern.length > 0) {
                return pattern[0].toUpperCase() + pattern.substr(1);
            }
            else if (matches[0][0].toUpperCase() !== matches[0][0] && pattern.length > 0) {
                return pattern[0].toLowerCase() + pattern.substr(1);
            }
            else {
                // we don't understand its pattern yet.
                return pattern;
            }
        }
        else {
            return pattern;
        }
    }
    exports.buildReplaceStringWithCasePreserved = buildReplaceStringWithCasePreserved;
    function validateSpecificSpecialCharacter(matches, pattern, specialCharacter) {
        const doesContainSpecialCharacter = matches[0].indexOf(specialCharacter) !== -1 && pattern.indexOf(specialCharacter) !== -1;
        return doesContainSpecialCharacter && matches[0].split(specialCharacter).length === pattern.split(specialCharacter).length;
    }
    function buildReplaceStringForSpecificSpecialCharacter(matches, pattern, specialCharacter) {
        const splitPatternAtSpecialCharacter = pattern.split(specialCharacter);
        const splitMatchAtSpecialCharacter = matches[0].split(specialCharacter);
        let replaceString = '';
        splitPatternAtSpecialCharacter.forEach((splitValue, index) => {
            replaceString += buildReplaceStringWithCasePreserved([splitMatchAtSpecialCharacter[index]], splitValue) + specialCharacter;
        });
        return replaceString.slice(0, -1);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9jb21tb24vc2VhcmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUloRyxTQUFnQixtQ0FBbUMsQ0FBQyxPQUF3QixFQUFFLE9BQWU7UUFDNUYsSUFBSSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUU7WUFDbkMsTUFBTSxlQUFlLEdBQUcsZ0NBQWdDLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNoRixNQUFNLG1CQUFtQixHQUFHLGdDQUFnQyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDcEYsSUFBSSxlQUFlLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtnQkFDNUMsT0FBTyw2Q0FBNkMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQzVFO2lCQUFNLElBQUksQ0FBQyxlQUFlLElBQUksbUJBQW1CLEVBQUU7Z0JBQ25ELE9BQU8sNkNBQTZDLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQzthQUM1RTtZQUNELElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDNUMsT0FBTyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUM7YUFDN0I7aUJBQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNuRCxPQUFPLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQzthQUM3QjtpQkFBTSxJQUFJLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDbkYsT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNwRDtpQkFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQy9FLE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDcEQ7aUJBQU07Z0JBQ04sdUNBQXVDO2dCQUN2QyxPQUFPLE9BQU8sQ0FBQzthQUNmO1NBQ0Q7YUFBTTtZQUNOLE9BQU8sT0FBTyxDQUFDO1NBQ2Y7SUFDRixDQUFDO0lBeEJELGtGQXdCQztJQUVELFNBQVMsZ0NBQWdDLENBQUMsT0FBaUIsRUFBRSxPQUFlLEVBQUUsZ0JBQXdCO1FBQ3JHLE1BQU0sMkJBQTJCLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUM1SCxPQUFPLDJCQUEyQixJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxNQUFNLEtBQUssT0FBTyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUM1SCxDQUFDO0lBRUQsU0FBUyw2Q0FBNkMsQ0FBQyxPQUFpQixFQUFFLE9BQWUsRUFBRSxnQkFBd0I7UUFDbEgsTUFBTSw4QkFBOEIsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDdkUsTUFBTSw0QkFBNEIsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDeEUsSUFBSSxhQUFhLEdBQVcsRUFBRSxDQUFDO1FBQy9CLDhCQUE4QixDQUFDLE9BQU8sQ0FBQyxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUM1RCxhQUFhLElBQUksbUNBQW1DLENBQUMsQ0FBQyw0QkFBNEIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxHQUFHLGdCQUFnQixDQUFDO1FBQzVILENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ25DLENBQUMifQ==