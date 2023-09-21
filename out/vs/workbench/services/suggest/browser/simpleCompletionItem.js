/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/filters"], function (require, exports, filters_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SimpleCompletionItem = void 0;
    class SimpleCompletionItem {
        constructor(completion) {
            this.completion = completion;
            // sorting, filtering
            this.score = filters_1.FuzzyScore.Default;
            this.distance = 0;
            // ensure lower-variants (perf)
            this.labelLow = this.completion.label.toLowerCase();
        }
    }
    exports.SimpleCompletionItem = SimpleCompletionItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltcGxlQ29tcGxldGlvbkl0ZW0uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvc3VnZ2VzdC9icm93c2VyL3NpbXBsZUNvbXBsZXRpb25JdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQW9CaEcsTUFBYSxvQkFBb0I7UUFVaEMsWUFDVSxVQUE2QjtZQUE3QixlQUFVLEdBQVYsVUFBVSxDQUFtQjtZQVB2QyxxQkFBcUI7WUFDckIsVUFBSyxHQUFlLG9CQUFVLENBQUMsT0FBTyxDQUFDO1lBQ3ZDLGFBQVEsR0FBVyxDQUFDLENBQUM7WUFPcEIsK0JBQStCO1lBQy9CLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDckQsQ0FBQztLQUNEO0lBaEJELG9EQWdCQyJ9