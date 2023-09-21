/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls"], function (require, exports, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.viewsWelcomeExtensionPointDescriptor = exports.ViewIdentifierMap = exports.ViewsWelcomeExtensionPointFields = void 0;
    var ViewsWelcomeExtensionPointFields;
    (function (ViewsWelcomeExtensionPointFields) {
        ViewsWelcomeExtensionPointFields["view"] = "view";
        ViewsWelcomeExtensionPointFields["contents"] = "contents";
        ViewsWelcomeExtensionPointFields["when"] = "when";
        ViewsWelcomeExtensionPointFields["group"] = "group";
        ViewsWelcomeExtensionPointFields["enablement"] = "enablement";
    })(ViewsWelcomeExtensionPointFields || (exports.ViewsWelcomeExtensionPointFields = ViewsWelcomeExtensionPointFields = {}));
    exports.ViewIdentifierMap = {
        'explorer': 'workbench.explorer.emptyView',
        'debug': 'workbench.debug.welcome',
        'scm': 'workbench.scm',
        'testing': 'workbench.view.testing'
    };
    const viewsWelcomeExtensionPointSchema = Object.freeze({
        type: 'array',
        description: nls.localize('contributes.viewsWelcome', "Contributed views welcome content. Welcome content will be rendered in tree based views whenever they have no meaningful content to display, ie. the File Explorer when no folder is open. Such content is useful as in-product documentation to drive users to use certain features before they are available. A good example would be a `Clone Repository` button in the File Explorer welcome view."),
        items: {
            type: 'object',
            description: nls.localize('contributes.viewsWelcome.view', "Contributed welcome content for a specific view."),
            required: [
                ViewsWelcomeExtensionPointFields.view,
                ViewsWelcomeExtensionPointFields.contents
            ],
            properties: {
                [ViewsWelcomeExtensionPointFields.view]: {
                    anyOf: [
                        {
                            type: 'string',
                            description: nls.localize('contributes.viewsWelcome.view.view', "Target view identifier for this welcome content. Only tree based views are supported.")
                        },
                        {
                            type: 'string',
                            description: nls.localize('contributes.viewsWelcome.view.view', "Target view identifier for this welcome content. Only tree based views are supported."),
                            enum: Object.keys(exports.ViewIdentifierMap)
                        }
                    ]
                },
                [ViewsWelcomeExtensionPointFields.contents]: {
                    type: 'string',
                    description: nls.localize('contributes.viewsWelcome.view.contents', "Welcome content to be displayed. The format of the contents is a subset of Markdown, with support for links only."),
                },
                [ViewsWelcomeExtensionPointFields.when]: {
                    type: 'string',
                    description: nls.localize('contributes.viewsWelcome.view.when', "Condition when the welcome content should be displayed."),
                },
                [ViewsWelcomeExtensionPointFields.group]: {
                    type: 'string',
                    description: nls.localize('contributes.viewsWelcome.view.group', "Group to which this welcome content belongs. Proposed API."),
                },
                [ViewsWelcomeExtensionPointFields.enablement]: {
                    type: 'string',
                    description: nls.localize('contributes.viewsWelcome.view.enablement', "Condition when the welcome content buttons and command links should be enabled."),
                },
            }
        }
    });
    exports.viewsWelcomeExtensionPointDescriptor = {
        extensionPoint: 'viewsWelcome',
        jsonSchema: viewsWelcomeExtensionPointSchema
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld3NXZWxjb21lRXh0ZW5zaW9uUG9pbnQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi93ZWxjb21lVmlld3MvY29tbW9uL3ZpZXdzV2VsY29tZUV4dGVuc2lvblBvaW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUtoRyxJQUFZLGdDQU1YO0lBTkQsV0FBWSxnQ0FBZ0M7UUFDM0MsaURBQWEsQ0FBQTtRQUNiLHlEQUFxQixDQUFBO1FBQ3JCLGlEQUFhLENBQUE7UUFDYixtREFBZSxDQUFBO1FBQ2YsNkRBQXlCLENBQUE7SUFDMUIsQ0FBQyxFQU5XLGdDQUFnQyxnREFBaEMsZ0NBQWdDLFFBTTNDO0lBWVksUUFBQSxpQkFBaUIsR0FBOEI7UUFDM0QsVUFBVSxFQUFFLDhCQUE4QjtRQUMxQyxPQUFPLEVBQUUseUJBQXlCO1FBQ2xDLEtBQUssRUFBRSxlQUFlO1FBQ3RCLFNBQVMsRUFBRSx3QkFBd0I7S0FDbkMsQ0FBQztJQUVGLE1BQU0sZ0NBQWdDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBK0I7UUFDcEYsSUFBSSxFQUFFLE9BQU87UUFDYixXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQywwQkFBMEIsRUFBRSx3WUFBd1ksQ0FBQztRQUMvYixLQUFLLEVBQUU7WUFDTixJQUFJLEVBQUUsUUFBUTtZQUNkLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLCtCQUErQixFQUFFLGtEQUFrRCxDQUFDO1lBQzlHLFFBQVEsRUFBRTtnQkFDVCxnQ0FBZ0MsQ0FBQyxJQUFJO2dCQUNyQyxnQ0FBZ0MsQ0FBQyxRQUFRO2FBQ3pDO1lBQ0QsVUFBVSxFQUFFO2dCQUNYLENBQUMsZ0NBQWdDLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ3hDLEtBQUssRUFBRTt3QkFDTjs0QkFDQyxJQUFJLEVBQUUsUUFBUTs0QkFDZCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxvQ0FBb0MsRUFBRSx1RkFBdUYsQ0FBQzt5QkFDeEo7d0JBQ0Q7NEJBQ0MsSUFBSSxFQUFFLFFBQVE7NEJBQ2QsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsb0NBQW9DLEVBQUUsdUZBQXVGLENBQUM7NEJBQ3hKLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLHlCQUFpQixDQUFDO3lCQUNwQztxQkFDRDtpQkFDRDtnQkFDRCxDQUFDLGdDQUFnQyxDQUFDLFFBQVEsQ0FBQyxFQUFFO29CQUM1QyxJQUFJLEVBQUUsUUFBUTtvQkFDZCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx3Q0FBd0MsRUFBRSxtSEFBbUgsQ0FBQztpQkFDeEw7Z0JBQ0QsQ0FBQyxnQ0FBZ0MsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDeEMsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsb0NBQW9DLEVBQUUseURBQXlELENBQUM7aUJBQzFIO2dCQUNELENBQUMsZ0NBQWdDLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQ3pDLElBQUksRUFBRSxRQUFRO29CQUNkLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHFDQUFxQyxFQUFFLDREQUE0RCxDQUFDO2lCQUM5SDtnQkFDRCxDQUFDLGdDQUFnQyxDQUFDLFVBQVUsQ0FBQyxFQUFFO29CQUM5QyxJQUFJLEVBQUUsUUFBUTtvQkFDZCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQywwQ0FBMEMsRUFBRSxpRkFBaUYsQ0FBQztpQkFDeEo7YUFDRDtTQUNEO0tBQ0QsQ0FBQyxDQUFDO0lBRVUsUUFBQSxvQ0FBb0MsR0FBRztRQUNuRCxjQUFjLEVBQUUsY0FBYztRQUM5QixVQUFVLEVBQUUsZ0NBQWdDO0tBQzVDLENBQUMifQ==