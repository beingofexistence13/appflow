/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/editor/common/languages/modesRegistry", "vs/base/common/event", "vs/platform/registry/common/platform", "vs/base/common/mime", "vs/platform/configuration/common/configurationRegistry"], function (require, exports, nls, event_1, platform_1, mime_1, configurationRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Zt = exports.$Yt = exports.$Xt = exports.$Wt = exports.$Vt = void 0;
    // Define extension point ids
    exports.$Vt = {
        ModesRegistry: 'editor.modesRegistry'
    };
    class $Wt {
        constructor() {
            this.b = new event_1.$fd();
            this.onDidChangeLanguages = this.b.event;
            this.a = [];
        }
        registerLanguage(def) {
            this.a.push(def);
            this.b.fire(undefined);
            return {
                dispose: () => {
                    for (let i = 0, len = this.a.length; i < len; i++) {
                        if (this.a[i] === def) {
                            this.a.splice(i, 1);
                            return;
                        }
                    }
                }
            };
        }
        getLanguages() {
            return this.a;
        }
    }
    exports.$Wt = $Wt;
    exports.$Xt = new $Wt();
    platform_1.$8m.add(exports.$Vt.ModesRegistry, exports.$Xt);
    exports.$Yt = 'plaintext';
    exports.$Zt = '.txt';
    exports.$Xt.registerLanguage({
        id: exports.$Yt,
        extensions: [exports.$Zt],
        aliases: [nls.localize(0, null), 'text'],
        mimetypes: [mime_1.$Hr.text]
    });
    platform_1.$8m.as(configurationRegistry_1.$an.Configuration)
        .registerDefaultConfigurations([{
            overrides: {
                '[plaintext]': {
                    'editor.unicodeHighlight.ambiguousCharacters': false,
                    'editor.unicodeHighlight.invisibleCharacters': false
                }
            }
        }]);
});
//# sourceMappingURL=modesRegistry.js.map