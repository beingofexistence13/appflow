/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/resources"], function (require, exports, resources) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TMScopeRegistry = void 0;
    class TMScopeRegistry {
        constructor() {
            this._scopeNameToLanguageRegistration = Object.create(null);
        }
        reset() {
            this._scopeNameToLanguageRegistration = Object.create(null);
        }
        register(def) {
            if (this._scopeNameToLanguageRegistration[def.scopeName]) {
                const existingRegistration = this._scopeNameToLanguageRegistration[def.scopeName];
                if (!resources.isEqual(existingRegistration.location, def.location)) {
                    console.warn(`Overwriting grammar scope name to file mapping for scope ${def.scopeName}.\n` +
                        `Old grammar file: ${existingRegistration.location.toString()}.\n` +
                        `New grammar file: ${def.location.toString()}`);
                }
            }
            this._scopeNameToLanguageRegistration[def.scopeName] = def;
        }
        getGrammarDefinition(scopeName) {
            return this._scopeNameToLanguageRegistration[scopeName] || null;
        }
    }
    exports.TMScopeRegistry = TMScopeRegistry;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVE1TY29wZVJlZ2lzdHJ5LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3RleHRNYXRlL2NvbW1vbi9UTVNjb3BlUmVnaXN0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBMEJoRyxNQUFhLGVBQWU7UUFJM0I7WUFDQyxJQUFJLENBQUMsZ0NBQWdDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBRU0sS0FBSztZQUNYLElBQUksQ0FBQyxnQ0FBZ0MsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdELENBQUM7UUFFTSxRQUFRLENBQUMsR0FBNEI7WUFDM0MsSUFBSSxJQUFJLENBQUMsZ0NBQWdDLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUN6RCxNQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ2xGLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUU7b0JBQ3BFLE9BQU8sQ0FBQyxJQUFJLENBQ1gsNERBQTRELEdBQUcsQ0FBQyxTQUFTLEtBQUs7d0JBQzlFLHFCQUFxQixvQkFBb0IsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLEtBQUs7d0JBQ2xFLHFCQUFxQixHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQzlDLENBQUM7aUJBQ0Y7YUFDRDtZQUNELElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRyxDQUFDO1FBQzVELENBQUM7UUFFTSxvQkFBb0IsQ0FBQyxTQUFpQjtZQUM1QyxPQUFPLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxTQUFTLENBQUMsSUFBSSxJQUFJLENBQUM7UUFDakUsQ0FBQztLQUNEO0lBN0JELDBDQTZCQyJ9