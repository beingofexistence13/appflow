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
define(["require", "exports", "vs/base/browser/dom", "vs/nls", "vs/base/browser/markdownRenderer", "vs/base/common/lifecycle", "vs/platform/opener/common/opener", "vs/workbench/contrib/comments/common/commentModel", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/list/browser/listService", "vs/platform/theme/common/themeService", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/comments/browser/timestamp", "vs/base/common/codicons", "vs/base/common/themables", "vs/workbench/contrib/comments/browser/commentColors", "vs/editor/common/languages", "vs/workbench/contrib/comments/browser/commentsFilterOptions", "vs/base/common/resources", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer"], function (require, exports, dom, nls, markdownRenderer_1, lifecycle_1, opener_1, commentModel_1, configuration_1, contextkey_1, listService_1, themeService_1, instantiation_1, timestamp_1, codicons_1, themables_1, commentColors_1, languages_1, commentsFilterOptions_1, resources_1, markdownRenderer_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CommentsList = exports.Filter = exports.CommentNodeRenderer = exports.ResourceWithCommentsRenderer = exports.COMMENTS_VIEW_TITLE = exports.COMMENTS_VIEW_ORIGINAL_TITLE = exports.COMMENTS_VIEW_STORAGE_ID = exports.COMMENTS_VIEW_ID = void 0;
    exports.COMMENTS_VIEW_ID = 'workbench.panel.comments';
    exports.COMMENTS_VIEW_STORAGE_ID = 'Comments';
    exports.COMMENTS_VIEW_ORIGINAL_TITLE = 'Comments';
    exports.COMMENTS_VIEW_TITLE = nls.localize('comments.view.title', "Comments");
    class CommentsModelVirualDelegate {
        static { this.RESOURCE_ID = 'resource-with-comments'; }
        static { this.COMMENT_ID = 'comment-node'; }
        getHeight(element) {
            if ((element instanceof commentModel_1.CommentNode) && element.hasReply()) {
                return 44;
            }
            return 22;
        }
        getTemplateId(element) {
            if (element instanceof commentModel_1.ResourceWithCommentThreads) {
                return CommentsModelVirualDelegate.RESOURCE_ID;
            }
            if (element instanceof commentModel_1.CommentNode) {
                return CommentsModelVirualDelegate.COMMENT_ID;
            }
            return '';
        }
    }
    class ResourceWithCommentsRenderer {
        constructor(labels) {
            this.labels = labels;
            this.templateId = 'resource-with-comments';
        }
        renderTemplate(container) {
            const labelContainer = dom.append(container, dom.$('.resource-container'));
            const resourceLabel = this.labels.create(labelContainer);
            return { resourceLabel };
        }
        renderElement(node, index, templateData, height) {
            templateData.resourceLabel.setFile(node.element.resource);
        }
        disposeTemplate(templateData) {
            templateData.resourceLabel.dispose();
        }
    }
    exports.ResourceWithCommentsRenderer = ResourceWithCommentsRenderer;
    let CommentNodeRenderer = class CommentNodeRenderer {
        constructor(openerService, configurationService, themeService) {
            this.openerService = openerService;
            this.configurationService = configurationService;
            this.themeService = themeService;
            this.templateId = 'comment-node';
        }
        renderTemplate(container) {
            const threadContainer = dom.append(container, dom.$('.comment-thread-container'));
            const metadataContainer = dom.append(threadContainer, dom.$('.comment-metadata-container'));
            const threadMetadata = {
                icon: dom.append(metadataContainer, dom.$('.icon')),
                userNames: dom.append(metadataContainer, dom.$('.user')),
                timestamp: new timestamp_1.TimestampWidget(this.configurationService, dom.append(metadataContainer, dom.$('.timestamp-container'))),
                separator: dom.append(metadataContainer, dom.$('.separator')),
                commentPreview: dom.append(metadataContainer, dom.$('.text')),
                range: dom.append(metadataContainer, dom.$('.range'))
            };
            threadMetadata.separator.innerText = '\u00b7';
            const snippetContainer = dom.append(threadContainer, dom.$('.comment-snippet-container'));
            const repliesMetadata = {
                container: snippetContainer,
                icon: dom.append(snippetContainer, dom.$('.icon')),
                count: dom.append(snippetContainer, dom.$('.count')),
                lastReplyDetail: dom.append(snippetContainer, dom.$('.reply-detail')),
                separator: dom.append(snippetContainer, dom.$('.separator')),
                timestamp: new timestamp_1.TimestampWidget(this.configurationService, dom.append(snippetContainer, dom.$('.timestamp-container'))),
            };
            repliesMetadata.separator.innerText = '\u00b7';
            repliesMetadata.icon.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.indent));
            const disposables = [threadMetadata.timestamp, repliesMetadata.timestamp];
            return { threadMetadata, repliesMetadata, disposables };
        }
        getCountString(commentCount) {
            if (commentCount > 1) {
                return nls.localize('commentsCount', "{0} comments", commentCount);
            }
            else {
                return nls.localize('commentCount', "1 comment");
            }
        }
        getRenderedComment(commentBody, disposables) {
            const renderedComment = (0, markdownRenderer_1.renderMarkdown)(commentBody, {
                inline: true,
                actionHandler: {
                    callback: (link) => (0, markdownRenderer_2.openLinkFromMarkdown)(this.openerService, link, commentBody.isTrusted),
                    disposables: disposables
                }
            });
            const images = renderedComment.element.getElementsByTagName('img');
            for (let i = 0; i < images.length; i++) {
                const image = images[i];
                const textDescription = dom.$('');
                textDescription.textContent = image.alt ? nls.localize('imageWithLabel', "Image: {0}", image.alt) : nls.localize('image', "Image");
                image.parentNode.replaceChild(textDescription, image);
            }
            return renderedComment;
        }
        getIcon(threadState) {
            if (threadState === languages_1.CommentThreadState.Unresolved) {
                return codicons_1.Codicon.commentUnresolved;
            }
            else {
                return codicons_1.Codicon.comment;
            }
        }
        renderElement(node, index, templateData, height) {
            const commentCount = node.element.replies.length + 1;
            templateData.threadMetadata.icon.classList.remove(...Array.from(templateData.threadMetadata.icon.classList.values())
                .filter(value => value.startsWith('codicon')));
            templateData.threadMetadata.icon.classList.add(...themables_1.ThemeIcon.asClassNameArray(this.getIcon(node.element.threadState)));
            if (node.element.threadState !== undefined) {
                const color = this.getCommentThreadWidgetStateColor(node.element.threadState, this.themeService.getColorTheme());
                templateData.threadMetadata.icon.style.setProperty(commentColors_1.commentViewThreadStateColorVar, `${color}`);
                templateData.threadMetadata.icon.style.color = `var(${commentColors_1.commentViewThreadStateColorVar})`;
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
                const disposables = new lifecycle_1.DisposableStore();
                templateData.disposables.push(disposables);
                const renderedComment = this.getRenderedComment(originalComment.comment.body, disposables);
                templateData.disposables.push(renderedComment);
                templateData.threadMetadata.commentPreview.appendChild(renderedComment.element.firstElementChild ?? renderedComment.element);
                templateData.threadMetadata.commentPreview.title = renderedComment.element.textContent ?? '';
            }
            if (node.element.range) {
                if (node.element.range.startLineNumber === node.element.range.endLineNumber) {
                    templateData.threadMetadata.range.textContent = nls.localize('commentLine', "[Ln {0}]", node.element.range.startLineNumber);
                }
                else {
                    templateData.threadMetadata.range.textContent = nls.localize('commentRange', "[Ln {0}-{1}]", node.element.range.startLineNumber, node.element.range.endLineNumber);
                }
            }
            if (!node.element.hasReply()) {
                templateData.repliesMetadata.container.style.display = 'none';
                return;
            }
            templateData.repliesMetadata.container.style.display = '';
            templateData.repliesMetadata.count.textContent = this.getCountString(commentCount);
            const lastComment = node.element.replies[node.element.replies.length - 1].comment;
            templateData.repliesMetadata.lastReplyDetail.textContent = nls.localize('lastReplyFrom', "Last reply from {0}", lastComment.userName);
            templateData.repliesMetadata.timestamp.setTimestamp(lastComment.timestamp ? new Date(lastComment.timestamp) : undefined);
        }
        getCommentThreadWidgetStateColor(state, theme) {
            return (state !== undefined) ? (0, commentColors_1.getCommentThreadStateIconColor)(state, theme) : undefined;
        }
        disposeTemplate(templateData) {
            templateData.disposables.forEach(disposeable => disposeable.dispose());
        }
    };
    exports.CommentNodeRenderer = CommentNodeRenderer;
    exports.CommentNodeRenderer = CommentNodeRenderer = __decorate([
        __param(0, opener_1.IOpenerService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, themeService_1.IThemeService)
    ], CommentNodeRenderer);
    var FilterDataType;
    (function (FilterDataType) {
        FilterDataType[FilterDataType["Resource"] = 0] = "Resource";
        FilterDataType[FilterDataType["Comment"] = 1] = "Comment";
    })(FilterDataType || (FilterDataType = {}));
    class Filter {
        constructor(options) {
            this.options = options;
        }
        filter(element, parentVisibility) {
            if (this.options.filter === '' && this.options.showResolved && this.options.showUnresolved) {
                return 1 /* TreeVisibility.Visible */;
            }
            if (element instanceof commentModel_1.ResourceWithCommentThreads) {
                return this.filterResourceMarkers(element);
            }
            else {
                return this.filterCommentNode(element, parentVisibility);
            }
        }
        filterResourceMarkers(resourceMarkers) {
            // Filter by text. Do not apply negated filters on resources instead use exclude patterns
            if (this.options.textFilter.text && !this.options.textFilter.negate) {
                const uriMatches = commentsFilterOptions_1.FilterOptions._filter(this.options.textFilter.text, (0, resources_1.basename)(resourceMarkers.resource));
                if (uriMatches) {
                    return { visibility: true, data: { type: 0 /* FilterDataType.Resource */, uriMatches: uriMatches || [] } };
                }
            }
            return 2 /* TreeVisibility.Recurse */;
        }
        filterCommentNode(comment, parentVisibility) {
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
            commentsFilterOptions_1.FilterOptions._messageFilter(this.options.textFilter.text, typeof comment.comment.body === 'string' ? comment.comment.body : comment.comment.body.value)
                // Check first user for value
                || commentsFilterOptions_1.FilterOptions._messageFilter(this.options.textFilter.text, comment.comment.userName)
                // Check all replies for value
                || comment.replies.map(reply => {
                    // Check user for value
                    return commentsFilterOptions_1.FilterOptions._messageFilter(this.options.textFilter.text, reply.comment.userName)
                        // Check body of reply for value
                        || commentsFilterOptions_1.FilterOptions._messageFilter(this.options.textFilter.text, typeof reply.comment.body === 'string' ? reply.comment.body : reply.comment.body.value);
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
    exports.Filter = Filter;
    let CommentsList = class CommentsList extends listService_1.WorkbenchObjectTree {
        constructor(labels, container, options, contextKeyService, listService, themeService, instantiationService, configurationService) {
            const delegate = new CommentsModelVirualDelegate();
            const renderers = [
                instantiationService.createInstance(ResourceWithCommentsRenderer, labels),
                instantiationService.createInstance(CommentNodeRenderer)
            ];
            super('CommentsTree', container, delegate, renderers, {
                accessibilityProvider: options.accessibilityProvider,
                identityProvider: {
                    getId: (element) => {
                        if (element instanceof commentModel_1.CommentsModel) {
                            return 'root';
                        }
                        if (element instanceof commentModel_1.ResourceWithCommentThreads) {
                            return `${element.owner}-${element.id}`;
                        }
                        if (element instanceof commentModel_1.CommentNode) {
                            return `${element.owner}-${element.resource.toString()}-${element.threadId}-${element.comment.uniqueIdInThread}` + (element.isRoot ? '-root' : '');
                        }
                        return '';
                    }
                },
                expandOnlyOnTwistieClick: (element) => {
                    if (element instanceof commentModel_1.CommentsModel || element instanceof commentModel_1.ResourceWithCommentThreads) {
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
    exports.CommentsList = CommentsList;
    exports.CommentsList = CommentsList = __decorate([
        __param(3, contextkey_1.IContextKeyService),
        __param(4, listService_1.IListService),
        __param(5, themeService_1.IThemeService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, configuration_1.IConfigurationService)
    ], CommentsList);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudHNUcmVlVmlld2VyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY29tbWVudHMvYnJvd3Nlci9jb21tZW50c1RyZWVWaWV3ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBOEJuRixRQUFBLGdCQUFnQixHQUFHLDBCQUEwQixDQUFDO0lBQzlDLFFBQUEsd0JBQXdCLEdBQUcsVUFBVSxDQUFDO0lBQ3RDLFFBQUEsNEJBQTRCLEdBQUcsVUFBVSxDQUFDO0lBQzFDLFFBQUEsbUJBQW1CLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxVQUFVLENBQUMsQ0FBQztJQTBCbkYsTUFBTSwyQkFBMkI7aUJBQ1IsZ0JBQVcsR0FBRyx3QkFBd0IsQ0FBQztpQkFDdkMsZUFBVSxHQUFHLGNBQWMsQ0FBQztRQUdwRCxTQUFTLENBQUMsT0FBWTtZQUNyQixJQUFJLENBQUMsT0FBTyxZQUFZLDBCQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUU7Z0JBQzNELE9BQU8sRUFBRSxDQUFDO2FBQ1Y7WUFDRCxPQUFPLEVBQUUsQ0FBQztRQUNYLENBQUM7UUFFTSxhQUFhLENBQUMsT0FBWTtZQUNoQyxJQUFJLE9BQU8sWUFBWSx5Q0FBMEIsRUFBRTtnQkFDbEQsT0FBTywyQkFBMkIsQ0FBQyxXQUFXLENBQUM7YUFDL0M7WUFDRCxJQUFJLE9BQU8sWUFBWSwwQkFBVyxFQUFFO2dCQUNuQyxPQUFPLDJCQUEyQixDQUFDLFVBQVUsQ0FBQzthQUM5QztZQUVELE9BQU8sRUFBRSxDQUFDO1FBQ1gsQ0FBQzs7SUFHRixNQUFhLDRCQUE0QjtRQUd4QyxZQUNTLE1BQXNCO1lBQXRCLFdBQU0sR0FBTixNQUFNLENBQWdCO1lBSC9CLGVBQVUsR0FBVyx3QkFBd0IsQ0FBQztRQUs5QyxDQUFD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