/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/event", "vs/platform/registry/common/platform", "vs/base/common/mime", "vs/platform/configuration/common/configurationRegistry"], function (require, exports, nls, event_1, platform_1, mime_1, configurationRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PLAINTEXT_EXTENSION = exports.PLAINTEXT_LANGUAGE_ID = exports.ModesRegistry = exports.EditorModesRegistry = exports.Extensions = void 0;
    // Define extension point ids
    exports.Extensions = {
        ModesRegistry: 'editor.modesRegistry'
    };
    class EditorModesRegistry {
        constructor() {
            this._onDidChangeLanguages = new event_1.Emitter();
            this.onDidChangeLanguages = this._onDidChangeLanguages.event;
            this._languages = [];
        }
        registerLanguage(def) {
            this._languages.push(def);
            this._onDidChangeLanguages.fire(undefined);
            return {
                dispose: () => {
                    for (let i = 0, len = this._languages.length; i < len; i++) {
                        if (this._languages[i] === def) {
                            this._languages.splice(i, 1);
                            return;
                        }
                    }
                }
            };
        }
        getLanguages() {
            return this._languages;
        }
    }
    exports.EditorModesRegistry = EditorModesRegistry;
    exports.ModesRegistry = new EditorModesRegistry();
    platform_1.Registry.add(exports.Extensions.ModesRegistry, exports.ModesRegistry);
    exports.PLAINTEXT_LANGUAGE_ID = 'plaintext';
    exports.PLAINTEXT_EXTENSION = '.txt';
    exports.ModesRegistry.registerLanguage({
        id: exports.PLAINTEXT_LANGUAGE_ID,
        extensions: [exports.PLAINTEXT_EXTENSION],
        aliases: [nls.localize('plainText.alias', "Plain Text"), 'text'],
        mimetypes: [mime_1.Mimes.text]
    });
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration)
        .registerDefaultConfigurations([{
            overrides: {
                '[plaintext]': {
                    'editor.unicodeHighlight.ambiguousCharacters': false,
                    'editor.unicodeHighlight.invisibleCharacters': false
                }
            }
        }]);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZXNSZWdpc3RyeS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vbGFuZ3VhZ2VzL21vZGVzUmVnaXN0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVWhHLDZCQUE2QjtJQUNoQixRQUFBLFVBQVUsR0FBRztRQUN6QixhQUFhLEVBQUUsc0JBQXNCO0tBQ3JDLENBQUM7SUFFRixNQUFhLG1CQUFtQjtRQU8vQjtZQUhpQiwwQkFBcUIsR0FBRyxJQUFJLGVBQU8sRUFBUSxDQUFDO1lBQzdDLHlCQUFvQixHQUFnQixJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDO1lBR3BGLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLENBQUM7UUFFTSxnQkFBZ0IsQ0FBQyxHQUE0QjtZQUNuRCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzNDLE9BQU87Z0JBQ04sT0FBTyxFQUFFLEdBQUcsRUFBRTtvQkFDYixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTt3QkFDM0QsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRTs0QkFDL0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDOzRCQUM3QixPQUFPO3lCQUNQO3FCQUNEO2dCQUNGLENBQUM7YUFDRCxDQUFDO1FBQ0gsQ0FBQztRQUVNLFlBQVk7WUFDbEIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ3hCLENBQUM7S0FDRDtJQTdCRCxrREE2QkM7SUFFWSxRQUFBLGFBQWEsR0FBRyxJQUFJLG1CQUFtQixFQUFFLENBQUM7SUFDdkQsbUJBQVEsQ0FBQyxHQUFHLENBQUMsa0JBQVUsQ0FBQyxhQUFhLEVBQUUscUJBQWEsQ0FBQyxDQUFDO0lBRXpDLFFBQUEscUJBQXFCLEdBQUcsV0FBVyxDQUFDO0lBQ3BDLFFBQUEsbUJBQW1CLEdBQUcsTUFBTSxDQUFDO0lBRTFDLHFCQUFhLENBQUMsZ0JBQWdCLENBQUM7UUFDOUIsRUFBRSxFQUFFLDZCQUFxQjtRQUN6QixVQUFVLEVBQUUsQ0FBQywyQkFBbUIsQ0FBQztRQUNqQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLFlBQVksQ0FBQyxFQUFFLE1BQU0sQ0FBQztRQUNoRSxTQUFTLEVBQUUsQ0FBQyxZQUFLLENBQUMsSUFBSSxDQUFDO0tBQ3ZCLENBQUMsQ0FBQztJQUVILG1CQUFRLENBQUMsRUFBRSxDQUF5QixrQ0FBdUIsQ0FBQyxhQUFhLENBQUM7U0FDeEUsNkJBQTZCLENBQUMsQ0FBQztZQUMvQixTQUFTLEVBQUU7Z0JBQ1YsYUFBYSxFQUFFO29CQUNkLDZDQUE2QyxFQUFFLEtBQUs7b0JBQ3BELDZDQUE2QyxFQUFFLEtBQUs7aUJBQ3BEO2FBQ0Q7U0FDRCxDQUFDLENBQUMsQ0FBQyJ9