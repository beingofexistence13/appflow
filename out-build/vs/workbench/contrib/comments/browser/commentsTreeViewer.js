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
define(["require", "exports", "vs/base/browser/dom", "vs/nls!vs/workbench/contrib/comments/browser/commentsTreeViewer", "vs/base/browser/markdownRenderer", "vs/base/common/lifecycle", "vs/platform/opener/common/opener", "vs/workbench/contrib/comments/common/commentModel", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/list/browser/listService", "vs/platform/theme/common/themeService", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/comments/browser/timestamp", "vs/base/common/codicons", "vs/base/common/themables", "vs/workbench/contrib/comments/browser/commentColors", "vs/editor/common/languages", "vs/workbench/contrib/comments/browser/commentsFilterOptions", "vs/base/common/resources", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer"], function (require, exports, dom, nls, markdownRenderer_1, lifecycle_1, opener_1, commentModel_1, configuration_1, contextkey_1, listService_1, themeService_1, instantiation_1, timestamp_1, codicons_1, themables_1, commentColors_1, languages_1, commentsFilterOptions_1, resources_1, markdownRenderer_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$4lb = exports.$3lb = exports.$2lb = exports.$1lb = exports.$Zlb = exports.$Ylb = exports.$Xlb = exports.$Wlb = void 0;
    exports.$Wlb = 'workbench.panel.comments';
    exports.$Xlb = 'Comments';
    exports.$Ylb = 'Comments';
    exports.$Zlb = nls.localize(0, null);
    class CommentsModelVirualDelegate {
        static { this.a = 'resource-with-comments'; }
        static { this.b = 'comment-node'; }
        getHeight(element) {
            if ((element instanceof commentModel_1.$Dlb) && element.hasReply()) {
                return 44;
            }
            return 22;
        }
        getTemplateId(element) {
            if (element instanceof commentModel_1.$Elb) {
                return CommentsModelVirualDelegate.a;
            }
            if (element instanceof commentModel_1.$Dlb) {
                return CommentsModelVirualDelegate.b;
            }
            return '';
        }
    }
    class $1lb {
        constructor(a) {
            this.a = a;
            this.templateId = 'resource-with-comments';
        }
        renderTemplate(container) {
            const labelContainer = dom.$0O(container, dom.$('.resource-container'));
            const resourceLabel = this.a.create(labelContainer);
            return { resourceLabel };
        }
        renderElement(node, index, templateData, height) {
            templateData.resourceLabel.setFile(node.element.resource);
        }
        disposeTemplate(templateData) {
            templateData.resourceLabel.dispose();
        }
    }
    exports.$1lb = $1lb;
    let $2lb = class $2lb {
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.templateId = 'comment-node';
        }
        renderTemplate(container) {
            const threadContainer = dom.$0O(container, dom.$('.comment-thread-container'));
            const metadataContainer = dom.$0O(threadContainer, dom.$('.comment-metadata-container'));
            const threadMetadata = {
                icon: dom.$0O(metadataContainer, dom.$('.icon')),
                userNames: dom.$0O(metadataContainer, dom.$('.user')),
                timestamp: new timestamp_1.$Nlb(this.b, dom.$0O(metadataContainer, dom.$('.timestamp-container'))),
                separator: dom.$0O(metadataContainer, dom.$('.separator')),
                commentPreview: dom.$0O(metadataContainer, dom.$('.text')),
                range: dom.$0O(metadataContainer, dom.$('.range'))
            };
            threadMetadata.separator.innerText = '\u00b7';
            const snippetContainer = dom.$0O(threadContainer, dom.$('.comment-snippet-container'));
            const repliesMetadata = {
                container: snippetContainer,
                icon: dom.$0O(snippetContainer, dom.$('.icon')),
                count: dom.$0O(snippetContainer, dom.$('.count')),
                lastReplyDetail: dom.$0O(snippetContainer, dom.$('.reply-detail')),
                separator: dom.$0O(snippetContainer, dom.$('.separator')),
                timestamp: new timestamp_1.$Nlb(this.b, dom.$0O(snippetContainer, dom.$('.timestamp-container'))),
            };
            repliesMetadata.separator.innerText = '\u00b7';
            repliesMetadata.icon.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.indent));
            const disposables = [threadMetadata.timestamp, repliesMetadata.timestamp];
            return { threadMetadata, repliesMetadata, disposables };
        }
        d(commentCount) {
            if (commentCount > 1) {
                return nls.localize(1, null, commentCount);
            }
            else {
                return nls.localize(2, null);
            }
        }
        e(commentBody, disposables) {
            const renderedComment = (0, markdownRenderer_1.$zQ)(commentBody, {
                inline: true,
                actionHandler: {
                    callback: (link) => (0, markdownRenderer_2.$L2)(this.a, link, commentBody.isTrusted),
                    disposables: disposables
                }
            });
            const images = renderedComment.element.getElementsByTagName('img');
            for (let i = 0; i < images.length; i++) {
                const image = images[i];
                const textDescription = dom.$('');
                textDescription.textContent = image.alt ? nls.localize(3, null, image.alt) : nls.localize(4, null);
                image.parentNode.replaceChild(textDescription, image);
            }
            return renderedComment;
        }
        f(threadState) {
            if (threadState === languages_1.CommentThreadState.Unresolved) {
                return codicons_1.$Pj.commentUnresolved;
            }
            else {
                return codicons_1.$Pj.comment;
            }
        }
        renderElement(node, index, templateData, height) {
            const commentCount = node.element.replies.length + 1;
            templateData.threadMetadata.icon.classList.remove(...Array.from(templateData.threadMetadata.icon.classList.values())
                .filter(value => value.startsWith('codicon')));
            templateData.threadMetadata.icon.classList.add(...themables_1.ThemeIcon.asClassNameArray(this.f(node.element.threadState)));
            if (node.element.threadState !== undefined) {
                const color = this.g(node.element.threadState, this.c.getColorTheme());
                templateData.threadMetadata.icon.style.setProperty(commentColors_1.$Rlb, `${color}`);
                templateData.threadMetadata.icon.style.color = `var(${commentColors_1.$Rlb})`;
            }
            templateData.threadMetadata.userNames.textContent = node.element.comment.userName;
            templateData.threadMetadata.timestamp.setTimestamp(node.element.comment.timestamp ? new Date(node.element.comment.timestamp) : undefined);
            const originalComment = node.element;
            templateData.threadMetadata.commentPreview.innerText = '';
            templateData.threadMetadata.commentPreview.style.height = '22px';
            if (typeof originalComment.comment.body === 'string') {
                templateData.threadMetadata.commentPreview.innerText = originalComment.comment.body;
            }
            else {
                const disposables = new lifecycle_1.$jc();
                templateData.disposables.push(disposables);
                const renderedComment = this.e(originalComment.comment.body, disposables);
                templateData.disposables.push(renderedComment);
                templateData.threadMetadata.commentPreview.appendChild(renderedComment.element.firstElementChild ?? renderedComment.element);
                templateData.threadMetadata.commentPreview.title = renderedComment.element.textContent ?? '';
            }
            if (node.element.range) {
                if (node.element.range.startLineNumber === node.element.range.endLineNumber) {
                    templateData.threadMetadata.range.textContent = nls.localize(5, null, node.element.range.startLineNumber);
                }
                else {
                    templateData.threadMetadata.range.textContent = nls.localize(6, null, node.element.range.startLineNumber, node.element.range.endLineNumber);
                }
            }
            if (!node.element.hasReply()) {
                templateData.repliesMetadata.container.style.display = 'none';
                return;
            }
            templateData.repliesMetadata.container.style.display = '';
            templateData.repliesMetadata.count.textContent = this.d(commentCount);
            const lastComment = node.element.replies[node.element.replies.length - 1].comment;
            templateData.repliesMetadata.lastReplyDetail.textContent = nls.localize(7, null, lastComment.userName);
            templateData.repliesMetadata.timestamp.setTimestamp(lastComment.timestamp ? new Date(lastComment.timestamp) : undefined);
        }
        g(state, theme) {
            return (state !== undefined) ? (0, commentColors_1.$Ulb)(state, theme) : undefined;
        }
        disposeTemplate(templateData) {
            templateData.disposables.forEach(disposeable => disposeable.dispose());
        }
    };
    exports.$2lb = $2lb;
    exports.$2lb = $2lb = __decorate([
        __param(0, opener_1.$NT),
        __param(1, configuration_1.$8h),
        __param(2, themeService_1.$gv)
    ], $2lb);
    var FilterDataType;
    (function (FilterDataType) {
        FilterDataType[FilterDataType["Resource"] = 0] = "Resource";
        FilterDataType[FilterDataType["Comment"] = 1] = "Comment";
    })(FilterDataType || (FilterDataType = {}));
    class $3lb {
        constructor(options) {
            this.options = options;
        }
        filter(element, parentVisibility) {
            if (this.options.filter === '' && this.options.showResolved && this.options.showUnresolved) {
                return 1 /* TreeVisibility.Visible */;
            }
            if (element instanceof commentModel_1.$Elb) {
                return this.a(element);
            }
            else {
                return this.b(element, parentVisibility);
            }
        }
        a(resourceMarkers) {
            // Filter by text. Do not apply negated filters on resources instead use exclude patterns
            if (this.options.textFilter.text && !this.options.textFilter.negate) {
                const uriMatches = commentsFilterOptions_1.$Vlb._filter(this.options.textFilter.text, (0, resources_1.$fg)(resourceMarkers.resource));
                if (uriMatches) {
                    return { visibility: true, data: { type: 0 /* FilterDataType.Resource */, uriMatches: uriMatches || [] } };
                }
            }
            return 2 /* TreeVisibility.Recurse */;
        }
        b(comment, parentVisibility) {
            const matchesResolvedState = (comment.threadState === undefined) || (this.options.showResolved && languages_1.CommentThreadState.Resolved === comment.threadState) ||
                (this.options.showUnresolved && languages_1.CommentThreadState.Unresolved === comment.threadState);
            if (!matchesResolvedState) {
                return false;
            }
            if (!this.options.textFilter.text) {
                return true;
            }
            const textMatches = 
            // Check body of comment for value
            commentsFilterOptions_1.$Vlb._messageFilter(this.options.textFilter.text, typeof comment.comment.body === 'string' ? comment.comment.body : comment.comment.body.value)
                // Check first user for value
                || commentsFilterOptions_1.$Vlb._messageFilter(this.options.textFilter.text, comment.comment.userName)
                // Check all replies for value
                || comment.replies.map(reply => {
                    // Check user for value
                    return commentsFilterOptions_1.$Vlb._messageFilter(this.options.textFilter.text, reply.comment.userName)
                        // Check body of reply for value
                        || commentsFilterOptions_1.$Vlb._messageFilter(this.options.textFilter.text, typeof reply.comment.body === 'string' ? reply.comment.body : reply.comment.body.value);
                }).filter(value => !!value).flat();
            // Matched and not negated
            if (textMatches.length && !this.options.textFilter.negate) {
                return { visibility: true, data: { type: 1 /* FilterDataType.Comment */, textMatches } };
            }
            // Matched and negated - exclude it only if parent visibility is not set
            if (textMatches.length && this.options.textFilter.negate && parentVisibility === 2 /* TreeVisibility.Recurse */) {
                return false;
            }
            // Not matched and negated - include it only if parent visibility is not set
            if ((textMatches.length === 0) && this.options.textFilter.negate && parentVisibility === 2 /* TreeVisibility.Recurse */) {
                return true;
            }
            return parentVisibility;
        }
    }
    exports.$3lb = $3lb;
    let $4lb = class $4lb extends listService_1.$t4 {
        constructor(labels, container, options, contextKeyService, listService, themeService, instantiationService, configurationService) {
            const delegate = new CommentsModelVirualDelegate();
            const renderers = [
                instantiationService.createInstance($1lb, labels),
                instantiationService.createInstance($2lb)
            ];
            super('CommentsTree', container, delegate, renderers, {
                accessibilityProvider: options.accessibilityProvider,
                identityProvider: {
                    getId: (element) => {
                        if (element instanceof commentModel_1.$Flb) {
                            return 'root';
                        }
                        if (element instanceof commentModel_1.$Elb) {
                            return `${element.owner}-${element.id}`;
                        }
                        if (element instanceof commentModel_1.$Dlb) {
                            return `${element.owner}-${element.resource.toString()}-${element.threadId}-${element.comment.uniqueIdInThread}` + (element.isRoot ? '-root' : '');
                        }
                        return '';
                    }
                },
                expandOnlyOnTwistieClick: (element) => {
                    if (element instanceof commentModel_1.$Flb || element instanceof commentModel_1.$Elb) {
                        return false;
                    }
                    return true;
                },
                collapseByDefault: false,
                overrideStyles: options.overrideStyles,
                filter: options.filter,
                findWidgetEnabled: false
            }, instantiationService, contextKeyService, listService, configurationService);
        }
        filterComments() {
            this.refilter();
        }
        getVisibleItemCount() {
            let filtered = 0;
            const root = this.getNode();
            for (const resourceNode of root.children) {
                for (const commentNode of resourceNode.children) {
                    if (commentNode.visible && resourceNode.visible) {
                        filtered++;
                    }
                }
            }
            return filtered;
        }
    };
    exports.$4lb = $4lb;
    exports.$4lb = $4lb = __decorate([
        __param(3, contextkey_1.$3i),
        __param(4, listService_1.$03),
        __param(5, themeService_1.$gv),
        __param(6, instantiation_1.$Ah),
        __param(7, configuration_1.$8h)
    ], $4lb);
});
//# sourceMappingURL=commentsTreeViewer.js.map