/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/glob", "vs/base/common/path"], function (require, exports, glob_1, path_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.score = void 0;
    function score(selector, candidateUri, candidateLanguage, candidateIsSynchronized, candidateNotebookUri, candidateNotebookType) {
        if (Array.isArray(selector)) {
            // array -> take max individual value
            let ret = 0;
            for (const filter of selector) {
                const value = score(filter, candidateUri, candidateLanguage, candidateIsSynchronized, candidateNotebookUri, candidateNotebookType);
                if (value === 10) {
                    return value; // already at the highest
                }
                if (value > ret) {
                    ret = value;
                }
            }
            return ret;
        }
        else if (typeof selector === 'string') {
            if (!candidateIsSynchronized) {
                return 0;
            }
            // short-hand notion, desugars to
            // 'fooLang' -> { language: 'fooLang'}
            // '*' -> { language: '*' }
            if (selector === '*') {
                return 5;
            }
            else if (selector === candidateLanguage) {
                return 10;
            }
            else {
                return 0;
            }
        }
        else if (selector) {
            // filter -> select accordingly, use defaults for scheme
            const { language, pattern, scheme, hasAccessToAllModels, notebookType } = selector; // TODO: microsoft/TypeScript#42768
            if (!candidateIsSynchronized && !hasAccessToAllModels) {
                return 0;
            }
            // selector targets a notebook -> use the notebook uri instead
            // of the "normal" document uri.
            if (notebookType && candidateNotebookUri) {
                candidateUri = candidateNotebookUri;
            }
            let ret = 0;
            if (scheme) {
                if (scheme === candidateUri.scheme) {
                    ret = 10;
                }
                else if (scheme === '*') {
                    ret = 5;
                }
                else {
                    return 0;
                }
            }
            if (language) {
                if (language === candidateLanguage) {
                    ret = 10;
                }
                else if (language === '*') {
                    ret = Math.max(ret, 5);
                }
                else {
                    return 0;
                }
            }
            if (notebookType) {
                if (notebookType === candidateNotebookType) {
                    ret = 10;
                }
                else if (notebookType === '*' && candidateNotebookType !== undefined) {
                    ret = Math.max(ret, 5);
                }
                else {
                    return 0;
                }
            }
            if (pattern) {
                let normalizedPattern;
                if (typeof pattern === 'string') {
                    normalizedPattern = pattern;
                }
                else {
                    // Since this pattern has a `base` property, we need
                    // to normalize this path first before passing it on
                    // because we will compare it against `Uri.fsPath`
                    // which uses platform specific separators.
                    // Refs: https://github.com/microsoft/vscode/issues/99938
                    normalizedPattern = { ...pattern, base: (0, path_1.normalize)(pattern.base) };
                }
                if (normalizedPattern === candidateUri.fsPath || (0, glob_1.match)(normalizedPattern, candidateUri.fsPath)) {
                    ret = 10;
                }
                else {
                    return 0;
                }
            }
            return ret;
        }
        else {
            return 0;
        }
    }
    exports.score = score;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VTZWxlY3Rvci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vbGFuZ3VhZ2VTZWxlY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUF5QmhHLFNBQWdCLEtBQUssQ0FBQyxRQUFzQyxFQUFFLFlBQWlCLEVBQUUsaUJBQXlCLEVBQUUsdUJBQWdDLEVBQUUsb0JBQXFDLEVBQUUscUJBQXlDO1FBRTdOLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUM1QixxQ0FBcUM7WUFDckMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQ1osS0FBSyxNQUFNLE1BQU0sSUFBSSxRQUFRLEVBQUU7Z0JBQzlCLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsWUFBWSxFQUFFLGlCQUFpQixFQUFFLHVCQUF1QixFQUFFLG9CQUFvQixFQUFFLHFCQUFxQixDQUFDLENBQUM7Z0JBQ25JLElBQUksS0FBSyxLQUFLLEVBQUUsRUFBRTtvQkFDakIsT0FBTyxLQUFLLENBQUMsQ0FBQyx5QkFBeUI7aUJBQ3ZDO2dCQUNELElBQUksS0FBSyxHQUFHLEdBQUcsRUFBRTtvQkFDaEIsR0FBRyxHQUFHLEtBQUssQ0FBQztpQkFDWjthQUNEO1lBQ0QsT0FBTyxHQUFHLENBQUM7U0FFWDthQUFNLElBQUksT0FBTyxRQUFRLEtBQUssUUFBUSxFQUFFO1lBRXhDLElBQUksQ0FBQyx1QkFBdUIsRUFBRTtnQkFDN0IsT0FBTyxDQUFDLENBQUM7YUFDVDtZQUVELGlDQUFpQztZQUNqQyxzQ0FBc0M7WUFDdEMsMkJBQTJCO1lBQzNCLElBQUksUUFBUSxLQUFLLEdBQUcsRUFBRTtnQkFDckIsT0FBTyxDQUFDLENBQUM7YUFDVDtpQkFBTSxJQUFJLFFBQVEsS0FBSyxpQkFBaUIsRUFBRTtnQkFDMUMsT0FBTyxFQUFFLENBQUM7YUFDVjtpQkFBTTtnQkFDTixPQUFPLENBQUMsQ0FBQzthQUNUO1NBRUQ7YUFBTSxJQUFJLFFBQVEsRUFBRTtZQUNwQix3REFBd0Q7WUFDeEQsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLG9CQUFvQixFQUFFLFlBQVksRUFBRSxHQUFHLFFBQTBCLENBQUMsQ0FBQyxtQ0FBbUM7WUFFekksSUFBSSxDQUFDLHVCQUF1QixJQUFJLENBQUMsb0JBQW9CLEVBQUU7Z0JBQ3RELE9BQU8sQ0FBQyxDQUFDO2FBQ1Q7WUFFRCw4REFBOEQ7WUFDOUQsZ0NBQWdDO1lBQ2hDLElBQUksWUFBWSxJQUFJLG9CQUFvQixFQUFFO2dCQUN6QyxZQUFZLEdBQUcsb0JBQW9CLENBQUM7YUFDcEM7WUFFRCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFFWixJQUFJLE1BQU0sRUFBRTtnQkFDWCxJQUFJLE1BQU0sS0FBSyxZQUFZLENBQUMsTUFBTSxFQUFFO29CQUNuQyxHQUFHLEdBQUcsRUFBRSxDQUFDO2lCQUNUO3FCQUFNLElBQUksTUFBTSxLQUFLLEdBQUcsRUFBRTtvQkFDMUIsR0FBRyxHQUFHLENBQUMsQ0FBQztpQkFDUjtxQkFBTTtvQkFDTixPQUFPLENBQUMsQ0FBQztpQkFDVDthQUNEO1lBRUQsSUFBSSxRQUFRLEVBQUU7Z0JBQ2IsSUFBSSxRQUFRLEtBQUssaUJBQWlCLEVBQUU7b0JBQ25DLEdBQUcsR0FBRyxFQUFFLENBQUM7aUJBQ1Q7cUJBQU0sSUFBSSxRQUFRLEtBQUssR0FBRyxFQUFFO29CQUM1QixHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQ3ZCO3FCQUFNO29CQUNOLE9BQU8sQ0FBQyxDQUFDO2lCQUNUO2FBQ0Q7WUFFRCxJQUFJLFlBQVksRUFBRTtnQkFDakIsSUFBSSxZQUFZLEtBQUsscUJBQXFCLEVBQUU7b0JBQzNDLEdBQUcsR0FBRyxFQUFFLENBQUM7aUJBQ1Q7cUJBQU0sSUFBSSxZQUFZLEtBQUssR0FBRyxJQUFJLHFCQUFxQixLQUFLLFNBQVMsRUFBRTtvQkFDdkUsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUN2QjtxQkFBTTtvQkFDTixPQUFPLENBQUMsQ0FBQztpQkFDVDthQUNEO1lBRUQsSUFBSSxPQUFPLEVBQUU7Z0JBQ1osSUFBSSxpQkFBNEMsQ0FBQztnQkFDakQsSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLEVBQUU7b0JBQ2hDLGlCQUFpQixHQUFHLE9BQU8sQ0FBQztpQkFDNUI7cUJBQU07b0JBQ04sb0RBQW9EO29CQUNwRCxvREFBb0Q7b0JBQ3BELGtEQUFrRDtvQkFDbEQsMkNBQTJDO29CQUMzQyx5REFBeUQ7b0JBQ3pELGlCQUFpQixHQUFHLEVBQUUsR0FBRyxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUEsZ0JBQVMsRUFBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztpQkFDbEU7Z0JBRUQsSUFBSSxpQkFBaUIsS0FBSyxZQUFZLENBQUMsTUFBTSxJQUFJLElBQUEsWUFBZ0IsRUFBQyxpQkFBaUIsRUFBRSxZQUFZLENBQUMsTUFBTSxDQUFDLEVBQUU7b0JBQzFHLEdBQUcsR0FBRyxFQUFFLENBQUM7aUJBQ1Q7cUJBQU07b0JBQ04sT0FBTyxDQUFDLENBQUM7aUJBQ1Q7YUFDRDtZQUVELE9BQU8sR0FBRyxDQUFDO1NBRVg7YUFBTTtZQUNOLE9BQU8sQ0FBQyxDQUFDO1NBQ1Q7SUFDRixDQUFDO0lBeEdELHNCQXdHQyJ9