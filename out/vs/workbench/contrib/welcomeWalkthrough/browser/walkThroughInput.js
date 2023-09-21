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
    var WalkThroughInput_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WalkThroughInput = void 0;
    class WalkThroughModel extends editorModel_1.EditorModel {
        constructor(mainRef, snippetRefs) {
            super();
            this.mainRef = mainRef;
            this.snippetRefs = snippetRefs;
        }
        get main() {
            return this.mainRef;
        }
        get snippets() {
            return this.snippetRefs.map(snippet => snippet.object);
        }
        dispose() {
            this.snippetRefs.forEach(ref => ref.dispose());
            super.dispose();
        }
    }
    let WalkThroughInput = WalkThroughInput_1 = class WalkThroughInput extends editorInput_1.EditorInput {
        get capabilities() {
            return 8 /* EditorInputCapabilities.Singleton */ | super.capabilities;
        }
        get resource() { return this.options.resource; }
        constructor(options, instantiationService, textModelResolverService) {
            super();
            this.options = options;
            this.instantiationService = instantiationService;
            this.textModelResolverService = textModelResolverService;
            this.promise = null;
            this.maxTopScroll = 0;
            this.maxBottomScroll = 0;
        }
        get typeId() {
            return this.options.typeId;
        }
        getName() {
            return this.options.name;
        }
        getDescription() {
            return this.options.description || '';
        }
        getTelemetryFrom() {
            return this.options.telemetryFrom;
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
            return this.options.onReady;
        }
        get layout() {
            return this.options.layout;
        }
        resolve() {
            if (!this.promise) {
                this.promise = (0, walkThroughContentProvider_1.requireToContent)(this.instantiationService, this.options.resource)
                    .then(content => {
                    if (this.resource.path.endsWith('.html')) {
                        return new WalkThroughModel(content, []);
                    }
                    const snippets = [];
                    let i = 0;
                    const renderer = new marked_1.marked.Renderer();
                    renderer.code = (code, lang) => {
                        i++;
                        const resource = this.options.resource.with({ scheme: network_1.Schemas.walkThroughSnippet, fragment: `${i}.${lang}` });
                        snippets.push(this.textModelResolverService.createModelReference(resource));
                        return `<div id="snippet-${resource.fragment}" class="walkThroughEditorContainer" ></div>`;
                    };
                    content = (0, marked_1.marked)(content, { renderer });
                    return Promise.all(snippets)
                        .then(refs => new WalkThroughModel(content, refs));
                });
            }
            return this.promise;
        }
        matches(otherInput) {
            if (super.matches(otherInput)) {
                return true;
            }
            if (otherInput instanceof WalkThroughInput_1) {
                return (0, resources_1.isEqual)(otherInput.options.resource, this.options.resource);
            }
            return false;
        }
        dispose() {
            if (this.promise) {
                this.promise.then(model => model.dispose());
                this.promise = null;
            }
            super.dispose();
        }
        relativeScrollPosition(topScroll, bottomScroll) {
            this.maxTopScroll = Math.max(this.maxTopScroll, topScroll);
            this.maxBottomScroll = Math.max(this.maxBottomScroll, bottomScroll);
        }
    };
    exports.WalkThroughInput = WalkThroughInput;
    exports.WalkThroughInput = WalkThroughInput = WalkThroughInput_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, resolverService_1.ITextModelService)
    ], WalkThroughInput);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Fsa1Rocm91Z2hJbnB1dC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3dlbGNvbWVXYWxrdGhyb3VnaC9icm93c2VyL3dhbGtUaHJvdWdoSW5wdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQWVoRyxNQUFNLGdCQUFpQixTQUFRLHlCQUFXO1FBRXpDLFlBQ1MsT0FBZSxFQUNmLFdBQTJDO1lBRW5ELEtBQUssRUFBRSxDQUFDO1lBSEEsWUFBTyxHQUFQLE9BQU8sQ0FBUTtZQUNmLGdCQUFXLEdBQVgsV0FBVyxDQUFnQztRQUdwRCxDQUFDO1FBRUQsSUFBSSxJQUFJO1lBQ1AsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3JCLENBQUM7UUFFRCxJQUFJLFFBQVE7WUFDWCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hELENBQUM7UUFFUSxPQUFPO1lBQ2YsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUMvQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDakIsQ0FBQztLQUNEO0lBWU0sSUFBTSxnQkFBZ0Isd0JBQXRCLE1BQU0sZ0JBQWlCLFNBQVEseUJBQVc7UUFFaEQsSUFBYSxZQUFZO1lBQ3hCLE9BQU8sNENBQW9DLEtBQUssQ0FBQyxZQUFZLENBQUM7UUFDL0QsQ0FBQztRQU9ELElBQUksUUFBUSxLQUFLLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBRWhELFlBQ2tCLE9BQWdDLEVBQzFCLG9CQUE0RCxFQUNoRSx3QkFBNEQ7WUFFL0UsS0FB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