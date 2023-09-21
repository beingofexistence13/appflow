/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isSemanticColoringEnabled = exports.SEMANTIC_HIGHLIGHTING_SETTING_ID = void 0;
    exports.SEMANTIC_HIGHLIGHTING_SETTING_ID = 'editor.semanticHighlighting';
    function isSemanticColoringEnabled(model, themeService, configurationService) {
        const setting = configurationService.getValue(exports.SEMANTIC_HIGHLIGHTING_SETTING_ID, { overrideIdentifier: model.getLanguageId(), resource: model.uri })?.enabled;
        if (typeof setting === 'boolean') {
            return setting;
        }
        return themeService.getColorTheme().semanticHighlighting;
    }
    exports.isSemanticColoringEnabled = isSemanticColoringEnabled;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VtYW50aWNUb2tlbnNDb25maWcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9zZW1hbnRpY1Rva2Vucy9jb21tb24vc2VtYW50aWNUb2tlbnNDb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTW5GLFFBQUEsZ0NBQWdDLEdBQUcsNkJBQTZCLENBQUM7SUFNOUUsU0FBZ0IseUJBQXlCLENBQUMsS0FBaUIsRUFBRSxZQUEyQixFQUFFLG9CQUEyQztRQUNwSSxNQUFNLE9BQU8sR0FBRyxvQkFBb0IsQ0FBQyxRQUFRLENBQXFDLHdDQUFnQyxFQUFFLEVBQUUsa0JBQWtCLEVBQUUsS0FBSyxDQUFDLGFBQWEsRUFBRSxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxPQUFPLENBQUM7UUFDak0sSUFBSSxPQUFPLE9BQU8sS0FBSyxTQUFTLEVBQUU7WUFDakMsT0FBTyxPQUFPLENBQUM7U0FDZjtRQUNELE9BQU8sWUFBWSxDQUFDLGFBQWEsRUFBRSxDQUFDLG9CQUFvQixDQUFDO0lBQzFELENBQUM7SUFORCw4REFNQyJ9