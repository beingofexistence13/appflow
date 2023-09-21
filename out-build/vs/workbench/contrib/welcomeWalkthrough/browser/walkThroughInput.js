/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/workbench/common/editor/editorInput", "vs/workbench/common/editor/editorModel", "vs/editor/common/services/resolverService", "vs/base/common/marked/marked", "vs/base/common/network", "vs/base/common/resources", "vs/workbench/contrib/welcomeWalkthrough/common/walkThroughContentProvider", "vs/platform/instantiation/common/instantiation"], function (require, exports, editorInput_1, editorModel_1, resolverService_1, marked_1, network_1, resources_1, walkThroughContentProvider_1, instantiation_1) {
    "use strict";
    var $1Yb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$1Yb = void 0;
    class WalkThroughModel extends editorModel_1.$xA {
        constructor(a, b) {
            super();
            this.a = a;
            this.b = b;
        }
        get main() {
            return this.a;
        }
        get snippets() {
            return this.b.map(snippet => snippet.object);
        }
        dispose() {
            this.b.forEach(ref => ref.dispose());
            super.dispose();
        }
    }
    let $1Yb = $1Yb_1 = class $1Yb extends editorInput_1.$tA {
        get capabilities() {
            return 8 /* EditorInputCapabilities.Singleton */ | super.capabilities;
        }
        get resource() { return this.n.resource; }
        constructor(n, r, s) {
            super();
            this.n = n;
            this.r = r;
            this.s = s;
            this.c = null;
            this.j = 0;
            this.m = 0;
        }
        get typeId() {
            return this.n.typeId;
        }
        getName() {
            return this.n.name;
        }
        getDescription() {
            return this.n.description || '';
        }
        getTelemetryFrom() {
            return this.n.telemetryFrom;
        }
        getTelemetryDescriptor() {
            const descriptor = super.getTelemetryDescriptor();
            descriptor['target'] = this.getTelemetryFrom();
            /* __GDPR__FRAGMENT__
                "EditorTelemetryDescriptor" : {
                    "target" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                }
            */
            return descriptor;
        }
        get onReady() {
            return this.n.onReady;
        }
        get layout() {
            return this.n.layout;
        }
        resolve() {
            if (!this.c) {
                this.c = (0, walkThroughContentProvider_1.$YYb)(this.r, this.n.resource)
                    .then(content => {
                    if (this.resource.path.endsWith('.html')) {
                        return new WalkThroughModel(content, []);
                    }
                    const snippets = [];
                    let i = 0;
                    const renderer = new marked_1.marked.Renderer();
                    renderer.code = (code, lang) => {
                        i++;
                        const resource = this.n.resource.with({ scheme: network_1.Schemas.walkThroughSnippet, fragment: `${i}.${lang}` });
                        snippets.push(this.s.createModelReference(resource));
                        return `<div id="snippet-${resource.fragment}" class="walkThroughEditorContainer" ></div>`;
                    };
                    content = (0, marked_1.marked)(content, { renderer });
                    return Promise.all(snippets)
                        .then(refs => new WalkThroughModel(content, refs));
                });
            }
            return this.c;
        }
        matches(otherInput) {
            if (super.matches(otherInput)) {
                return true;
            }
            if (otherInput instanceof $1Yb_1) {
                return (0, resources_1.$bg)(otherInput.n.resource, this.n.resource);
            }
            return false;
        }
        dispose() {
            if (this.c) {
                this.c.then(model => model.dispose());
                this.c = null;
            }
            super.dispose();
        }
        relativeScrollPosition(topScroll, bottomScroll) {
            this.j = Math.max(this.j, topScroll);
            this.m = Math.max(this.m, bottomScroll);
        }
    };
    exports.$1Yb = $1Yb;
    exports.$1Yb = $1Yb = $1Yb_1 = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, resolverService_1.$uA)
    ], $1Yb);
});
//# sourceMappingURL=walkThroughInput.js.map