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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/countBadge/countBadge", "vs/base/browser/ui/highlightedlabel/highlightedLabel", "vs/base/browser/ui/iconLabel/iconLabel", "vs/base/common/filters", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/editor/common/services/resolverService", "vs/nls!vs/editor/contrib/gotoSymbol/browser/peek/referencesTree", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/label/common/label", "vs/platform/theme/browser/defaultStyles", "../referencesModel"], function (require, exports, dom, countBadge_1, highlightedLabel_1, iconLabel_1, filters_1, lifecycle_1, resources_1, resolverService_1, nls_1, instantiation_1, keybinding_1, label_1, defaultStyles_1, referencesModel_1) {
    "use strict";
    var $G4_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$I4 = exports.$H4 = exports.$G4 = exports.$F4 = exports.$E4 = exports.$D4 = exports.$C4 = void 0;
    let $C4 = class $C4 {
        constructor(a) {
            this.a = a;
        }
        hasChildren(element) {
            if (element instanceof referencesModel_1.$B4) {
                return true;
            }
            if (element instanceof referencesModel_1.$A4) {
                return true;
            }
            return false;
        }
        getChildren(element) {
            if (element instanceof referencesModel_1.$B4) {
                return element.groups;
            }
            if (element instanceof referencesModel_1.$A4) {
                return element.resolve(this.a).then(val => {
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
    exports.$C4 = $C4;
    exports.$C4 = $C4 = __decorate([
        __param(0, resolverService_1.$uA)
    ], $C4);
    //#endregion
    class $D4 {
        getHeight() {
            return 23;
        }
        getTemplateId(element) {
            if (element instanceof referencesModel_1.$A4) {
                return $G4.id;
            }
            else {
                return $H4.id;
            }
        }
    }
    exports.$D4 = $D4;
    let $E4 = class $E4 {
        constructor(a) {
            this.a = a;
        }
        getKeyboardNavigationLabel(element) {
            if (element instanceof referencesModel_1.$y4) {
                const parts = element.parent.getPreview(element)?.preview(element.range);
                if (parts) {
                    return parts.value;
                }
            }
            // FileReferences or unresolved OneReference
            return (0, resources_1.$fg)(element.uri);
        }
        mightProducePrintableCharacter(event) {
            return this.a.mightProducePrintableCharacter(event);
        }
    };
    exports.$E4 = $E4;
    exports.$E4 = $E4 = __decorate([
        __param(0, keybinding_1.$2D)
    ], $E4);
    class $F4 {
        getId(element) {
            return element instanceof referencesModel_1.$y4 ? element.id : element.uri;
        }
    }
    exports.$F4 = $F4;
    //#region render: File
    let FileReferencesTemplate = class FileReferencesTemplate extends lifecycle_1.$kc {
        constructor(container, a) {
            super();
            this.a = a;
            const parent = document.createElement('div');
            parent.classList.add('reference-file');
            this.file = this.B(new iconLabel_1.$KR(parent, { supportHighlights: true }));
            this.badge = new countBadge_1.$nR(dom.$0O(parent, dom.$('.count')), {}, defaultStyles_1.$v2);
            container.appendChild(parent);
        }
        set(element, matches) {
            const parent = (0, resources_1.$hg)(element.uri);
            this.file.setLabel(this.a.getUriBasenameLabel(element.uri), this.a.getUriLabel(parent, { relative: true }), { title: this.a.getUriLabel(element.uri), matches });
            const len = element.children.length;
            this.badge.setCount(len);
            if (len > 1) {
                this.badge.setTitleFormat((0, nls_1.localize)(0, null, len));
            }
            else {
                this.badge.setTitleFormat((0, nls_1.localize)(1, null, len));
            }
        }
    };
    FileReferencesTemplate = __decorate([
        __param(1, label_1.$Vz)
    ], FileReferencesTemplate);
    let $G4 = class $G4 {
        static { $G4_1 = this; }
        static { this.id = 'FileReferencesRenderer'; }
        constructor(a) {
            this.a = a;
            this.templateId = $G4_1.id;
        }
        renderTemplate(container) {
            return this.a.createInstance(FileReferencesTemplate, container);
        }
        renderElement(node, index, template) {
            template.set(node.element, (0, filters_1.$Hj)(node.filterData));
        }
        disposeTemplate(templateData) {
            templateData.dispose();
        }
    };
    exports.$G4 = $G4;
    exports.$G4 = $G4 = $G4_1 = __decorate([
        __param(0, instantiation_1.$Ah)
    ], $G4);
    //#endregion
    //#region render: Reference
    class OneReferenceTemplate {
        constructor(container) {
            this.label = new highlightedLabel_1.$JR(container);
        }
        set(element, score) {
            const preview = element.parent.getPreview(element)?.preview(element.range);
            if (!preview || !preview.value) {
                // this means we FAILED to resolve the document or the value is the empty string
                this.label.set(`${(0, resources_1.$fg)(element.uri)}:${element.range.startLineNumber + 1}:${element.range.startColumn + 1}`);
            }
            else {
                // render search match as highlight unless
                // we have score, then render the score
                const { value, highlight } = preview;
                if (score && !filters_1.FuzzyScore.isDefault(score)) {
                    this.label.element.classList.toggle('referenceMatch', false);
                    this.label.set(value, (0, filters_1.$Hj)(score));
                }
                else {
                    this.label.element.classList.toggle('referenceMatch', true);
                    this.label.set(value, [highlight]);
                }
            }
        }
    }
    class $H4 {
        constructor() {
            this.templateId = $H4.id;
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
    exports.$H4 = $H4;
    //#endregion
    class $I4 {
        getWidgetAriaLabel() {
            return (0, nls_1.localize)(2, null);
        }
        getAriaLabel(element) {
            return element.ariaMessage;
        }
    }
    exports.$I4 = $I4;
});
//# sourceMappingURL=referencesTree.js.map