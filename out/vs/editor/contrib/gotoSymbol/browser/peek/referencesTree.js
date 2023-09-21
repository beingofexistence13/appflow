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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/countBadge/countBadge", "vs/base/browser/ui/highlightedlabel/highlightedLabel", "vs/base/browser/ui/iconLabel/iconLabel", "vs/base/common/filters", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/editor/common/services/resolverService", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/label/common/label", "vs/platform/theme/browser/defaultStyles", "../referencesModel"], function (require, exports, dom, countBadge_1, highlightedLabel_1, iconLabel_1, filters_1, lifecycle_1, resources_1, resolverService_1, nls_1, instantiation_1, keybinding_1, label_1, defaultStyles_1, referencesModel_1) {
    "use strict";
    var FileReferencesRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AccessibilityProvider = exports.OneReferenceRenderer = exports.FileReferencesRenderer = exports.IdentityProvider = exports.StringRepresentationProvider = exports.Delegate = exports.DataSource = void 0;
    let DataSource = class DataSource {
        constructor(_resolverService) {
            this._resolverService = _resolverService;
        }
        hasChildren(element) {
            if (element instanceof referencesModel_1.ReferencesModel) {
                return true;
            }
            if (element instanceof referencesModel_1.FileReferences) {
                return true;
            }
            return false;
        }
        getChildren(element) {
            if (element instanceof referencesModel_1.ReferencesModel) {
                return element.groups;
            }
            if (element instanceof referencesModel_1.FileReferences) {
                return element.resolve(this._resolverService).then(val => {
                    // if (element.failure) {
                    // 	// refresh the element on failure so that
                    // 	// we can update its rendering
                    // 	return tree.refresh(element).then(() => val.children);
                    // }
                    return val.children;
                });
            }
            throw new Error('bad tree');
        }
    };
    exports.DataSource = DataSource;
    exports.DataSource = DataSource = __decorate([
        __param(0, resolverService_1.ITextModelService)
    ], DataSource);
    //#endregion
    class Delegate {
        getHeight() {
            return 23;
        }
        getTemplateId(element) {
            if (element instanceof referencesModel_1.FileReferences) {
                return FileReferencesRenderer.id;
            }
            else {
                return OneReferenceRenderer.id;
            }
        }
    }
    exports.Delegate = Delegate;
    let StringRepresentationProvider = class StringRepresentationProvider {
        constructor(_keybindingService) {
            this._keybindingService = _keybindingService;
        }
        getKeyboardNavigationLabel(element) {
            if (element instanceof referencesModel_1.OneReference) {
                const parts = element.parent.getPreview(element)?.preview(element.range);
                if (parts) {
                    return parts.value;
                }
            }
            // FileReferences or unresolved OneReference
            return (0, resources_1.basename)(element.uri);
        }
        mightProducePrintableCharacter(event) {
            return this._keybindingService.mightProducePrintableCharacter(event);
        }
    };
    exports.StringRepresentationProvider = StringRepresentationProvider;
    exports.StringRepresentationProvider = StringRepresentationProvider = __decorate([
        __param(0, keybinding_1.IKeybindingService)
    ], StringRepresentationProvider);
    class IdentityProvider {
        getId(element) {
            return element instanceof referencesModel_1.OneReference ? element.id : element.uri;
        }
    }
    exports.IdentityProvider = IdentityProvider;
    //#region render: File
    let FileReferencesTemplate = class FileReferencesTemplate extends lifecycle_1.Disposable {
        constructor(container, _labelService) {
            super();
            this._labelService = _labelService;
            const parent = document.createElement('div');
            parent.classList.add('reference-file');
            this.file = this._register(new iconLabel_1.IconLabel(parent, { supportHighlights: true }));
            this.badge = new countBadge_1.CountBadge(dom.append(parent, dom.$('.count')), {}, defaultStyles_1.defaultCountBadgeStyles);
            container.appendChild(parent);
        }
        set(element, matches) {
            const parent = (0, resources_1.dirname)(element.uri);
            this.file.setLabel(this._labelService.getUriBasenameLabel(element.uri), this._labelService.getUriLabel(parent, { relative: true }), { title: this._labelService.getUriLabel(element.uri), matches });
            const len = element.children.length;
            this.badge.setCount(len);
            if (len > 1) {
                this.badge.setTitleFormat((0, nls_1.localize)('referencesCount', "{0} references", len));
            }
            else {
                this.badge.setTitleFormat((0, nls_1.localize)('referenceCount', "{0} reference", len));
            }
        }
    };
    FileReferencesTemplate = __decorate([
        __param(1, label_1.ILabelService)
    ], FileReferencesTemplate);
    let FileReferencesRenderer = class FileReferencesRenderer {
        static { FileReferencesRenderer_1 = this; }
        static { this.id = 'FileReferencesRenderer'; }
        constructor(_instantiationService) {
            this._instantiationService = _instantiationService;
            this.templateId = FileReferencesRenderer_1.id;
        }
        renderTemplate(container) {
            return this._instantiationService.createInstance(FileReferencesTemplate, container);
        }
        renderElement(node, index, template) {
            template.set(node.element, (0, filters_1.createMatches)(node.filterData));
        }
        disposeTemplate(templateData) {
            templateData.dispose();
        }
    };
    exports.FileReferencesRenderer = FileReferencesRenderer;
    exports.FileReferencesRenderer = FileReferencesRenderer = FileReferencesRenderer_1 = __decorate([
        __param(0, instantiation_1.IInstantiationService)
    ], FileReferencesRenderer);
    //#endregion
    //#region render: Reference
    class OneReferenceTemplate {
        constructor(container) {
            this.label = new highlightedLabel_1.HighlightedLabel(container);
        }
        set(element, score) {
            const preview = element.parent.getPreview(element)?.preview(element.range);
            if (!preview || !preview.value) {
                // this means we FAILED to resolve the document or the value is the empty string
                this.label.set(`${(0, resources_1.basename)(element.uri)}:${element.range.startLineNumber + 1}:${element.range.startColumn + 1}`);
            }
            else {
                // render search match as highlight unless
                // we have score, then render the score
                const { value, highlight } = preview;
                if (score && !filters_1.FuzzyScore.isDefault(score)) {
                    this.label.element.classList.toggle('referenceMatch', false);
                    this.label.set(value, (0, filters_1.createMatches)(score));
                }
                else {
                    this.label.element.classList.toggle('referenceMatch', true);
                    this.label.set(value, [highlight]);
                }
            }
        }
    }
    class OneReferenceRenderer {
        constructor() {
            this.templateId = OneReferenceRenderer.id;
        }
        static { this.id = 'OneReferenceRenderer'; }
        renderTemplate(container) {
            return new OneReferenceTemplate(container);
        }
        renderElement(node, index, templateData) {
            templateData.set(node.element, node.filterData);
        }
        disposeTemplate() {
        }
    }
    exports.OneReferenceRenderer = OneReferenceRenderer;
    //#endregion
    class AccessibilityProvider {
        getWidgetAriaLabel() {
            return (0, nls_1.localize)('treeAriaLabel', "References");
        }
        getAriaLabel(element) {
            return element.ariaMessage;
        }
    }
    exports.AccessibilityProvider = AccessibilityProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmZXJlbmNlc1RyZWUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9nb3RvU3ltYm9sL2Jyb3dzZXIvcGVlay9yZWZlcmVuY2VzVHJlZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBeUJ6RixJQUFNLFVBQVUsR0FBaEIsTUFBTSxVQUFVO1FBRXRCLFlBQWdELGdCQUFtQztZQUFuQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1FBQUksQ0FBQztRQUV4RixXQUFXLENBQUMsT0FBdUQ7WUFDbEUsSUFBSSxPQUFPLFlBQVksaUNBQWUsRUFBRTtnQkFDdkMsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUNELElBQUksT0FBTyxZQUFZLGdDQUFjLEVBQUU7Z0JBQ3RDLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFDRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFRCxXQUFXLENBQUMsT0FBdUQ7WUFDbEUsSUFBSSxPQUFPLFlBQVksaUNBQWUsRUFBRTtnQkFDdkMsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDO2FBQ3RCO1lBRUQsSUFBSSxPQUFPLFlBQVksZ0NBQWMsRUFBRTtnQkFDdEMsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDeEQseUJBQXlCO29CQUN6Qiw2Q0FBNkM7b0JBQzdDLGtDQUFrQztvQkFDbEMsMERBQTBEO29CQUMxRCxJQUFJO29CQUNKLE9BQU8sR0FBRyxDQUFDLFFBQVEsQ0FBQztnQkFDckIsQ0FBQyxDQUFDLENBQUM7YUFDSDtZQUVELE1BQU0sSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDN0IsQ0FBQztLQUNELENBQUE7SUFoQ1ksZ0NBQVU7eUJBQVYsVUFBVTtRQUVULFdBQUEsbUNBQWlCLENBQUE7T0FGbEIsVUFBVSxDQWdDdEI7SUFFRCxZQUFZO0lBRVosTUFBYSxRQUFRO1FBQ3BCLFNBQVM7WUFDUixPQUFPLEVBQUUsQ0FBQztRQUNYLENBQUM7UUFDRCxhQUFhLENBQUMsT0FBc0M7WUFDbkQsSUFBSSxPQUFPLFlBQVksZ0NBQWMsRUFBRTtnQkFDdEMsT0FBTyxzQkFBc0IsQ0FBQyxFQUFFLENBQUM7YUFDakM7aUJBQU07Z0JBQ04sT0FBTyxvQkFBb0IsQ0FBQyxFQUFFLENBQUM7YUFDL0I7UUFDRixDQUFDO0tBQ0Q7SUFYRCw0QkFXQztJQUVNLElBQU0sNEJBQTRCLEdBQWxDLE1BQU0sNEJBQTRCO1FBRXhDLFlBQWlELGtCQUFzQztZQUF0Qyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1FBQUksQ0FBQztRQUU1RiwwQkFBMEIsQ0FBQyxPQUFvQjtZQUM5QyxJQUFJLE9BQU8sWUFBWSw4QkFBWSxFQUFFO2dCQUNwQyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN6RSxJQUFJLEtBQUssRUFBRTtvQkFDVixPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUM7aUJBQ25CO2FBQ0Q7WUFDRCw0Q0FBNEM7WUFDNUMsT0FBTyxJQUFBLG9CQUFRLEVBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzlCLENBQUM7UUFFRCw4QkFBOEIsQ0FBQyxLQUFxQjtZQUNuRCxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyw4QkFBOEIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN0RSxDQUFDO0tBQ0QsQ0FBQTtJQWxCWSxvRUFBNEI7MkNBQTVCLDRCQUE0QjtRQUUzQixXQUFBLCtCQUFrQixDQUFBO09BRm5CLDRCQUE0QixDQWtCeEM7SUFFRCxNQUFhLGdCQUFnQjtRQUU1QixLQUFLLENBQUMsT0FBb0I7WUFDekIsT0FBTyxPQUFPLFlBQVksOEJBQVksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztRQUNuRSxDQUFDO0tBQ0Q7SUFMRCw0Q0FLQztJQUVELHNCQUFzQjtJQUV0QixJQUFNLHNCQUFzQixHQUE1QixNQUFNLHNCQUF1QixTQUFRLHNCQUFVO1FBSzlDLFlBQ0MsU0FBc0IsRUFDVSxhQUE0QjtZQUU1RCxLQUFLLEVBQUUsQ0FBQztZQUZ3QixrQkFBYSxHQUFiLGFBQWEsQ0FBZTtZQUc1RCxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzdDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDdkMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUkscUJBQVMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFL0UsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLHVCQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSx1Q0FBdUIsQ0FBQyxDQUFDO1lBRTlGLFNBQVMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUVELEdBQUcsQ0FBQyxPQUF1QixFQUFFLE9BQWlCO1lBQzdDLE1BQU0sTUFBTSxHQUFHLElBQUEsbUJBQU8sRUFBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDcEMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQ2pCLElBQUksQ0FBQyxhQUFhLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUNuRCxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFDMUQsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUMvRCxDQUFDO1lBQ0YsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFDcEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFO2dCQUNaLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLElBQUEsY0FBUSxFQUFDLGlCQUFpQixFQUFFLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDOUU7aUJBQU07Z0JBQ04sSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsSUFBQSxjQUFRLEVBQUMsZ0JBQWdCLEVBQUUsZUFBZSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDNUU7UUFDRixDQUFDO0tBQ0QsQ0FBQTtJQWxDSyxzQkFBc0I7UUFPekIsV0FBQSxxQkFBYSxDQUFBO09BUFYsc0JBQXNCLENBa0MzQjtJQUVNLElBQU0sc0JBQXNCLEdBQTVCLE1BQU0sc0JBQXNCOztpQkFFbEIsT0FBRSxHQUFHLHdCQUF3QixBQUEzQixDQUE0QjtRQUk5QyxZQUFtQyxxQkFBNkQ7WUFBNUMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUZ2RixlQUFVLEdBQVcsd0JBQXNCLENBQUMsRUFBRSxDQUFDO1FBRTRDLENBQUM7UUFFckcsY0FBYyxDQUFDLFNBQXNCO1lBQ3BDLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDLGNBQWMsQ0FBQyxzQkFBc0IsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNyRixDQUFDO1FBQ0QsYUFBYSxDQUFDLElBQTJDLEVBQUUsS0FBYSxFQUFFLFFBQWdDO1lBQ3pHLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFBLHVCQUFhLEVBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDNUQsQ0FBQztRQUNELGVBQWUsQ0FBQyxZQUFvQztZQUNuRCxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDeEIsQ0FBQzs7SUFoQlcsd0RBQXNCO3FDQUF0QixzQkFBc0I7UUFNckIsV0FBQSxxQ0FBcUIsQ0FBQTtPQU50QixzQkFBc0IsQ0FpQmxDO0lBRUQsWUFBWTtJQUVaLDJCQUEyQjtJQUMzQixNQUFNLG9CQUFvQjtRQUl6QixZQUFZLFNBQXNCO1lBQ2pDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxtQ0FBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM5QyxDQUFDO1FBRUQsR0FBRyxDQUFDLE9BQXFCLEVBQUUsS0FBa0I7WUFDNUMsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMzRSxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRTtnQkFDL0IsZ0ZBQWdGO2dCQUNoRixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUEsb0JBQVEsRUFBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDakg7aUJBQU07Z0JBQ04sMENBQTBDO2dCQUMxQyx1Q0FBdUM7Z0JBQ3ZDLE1BQU0sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLEdBQUcsT0FBTyxDQUFDO2dCQUNyQyxJQUFJLEtBQUssSUFBSSxDQUFDLG9CQUFVLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUMxQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUM3RCxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsSUFBQSx1QkFBYSxFQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7aUJBQzVDO3FCQUFNO29CQUNOLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQzVELElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7aUJBQ25DO2FBQ0Q7UUFDRixDQUFDO0tBQ0Q7SUFFRCxNQUFhLG9CQUFvQjtRQUFqQztZQUlVLGVBQVUsR0FBVyxvQkFBb0IsQ0FBQyxFQUFFLENBQUM7UUFVdkQsQ0FBQztpQkFaZ0IsT0FBRSxHQUFHLHNCQUFzQixBQUF6QixDQUEwQjtRQUk1QyxjQUFjLENBQUMsU0FBc0I7WUFDcEMsT0FBTyxJQUFJLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFDRCxhQUFhLENBQUMsSUFBeUMsRUFBRSxLQUFhLEVBQUUsWUFBa0M7WUFDekcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNqRCxDQUFDO1FBQ0QsZUFBZTtRQUNmLENBQUM7O0lBYkYsb0RBY0M7SUFFRCxZQUFZO0lBR1osTUFBYSxxQkFBcUI7UUFFakMsa0JBQWtCO1lBQ2pCLE9BQU8sSUFBQSxjQUFRLEVBQUMsZUFBZSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFFRCxZQUFZLENBQUMsT0FBc0M7WUFDbEQsT0FBTyxPQUFPLENBQUMsV0FBVyxDQUFDO1FBQzVCLENBQUM7S0FDRDtJQVRELHNEQVNDIn0=