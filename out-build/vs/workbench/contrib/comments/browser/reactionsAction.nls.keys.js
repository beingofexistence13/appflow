/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'pickReactions',
	'comment.toggleableReaction',
	{
				key: 'comment.reactionLabelNone', comment: [
					'This is a tooltip for an emoji button so that the current user can toggle their reaction to a comment.',
					'The first arg is localized message "Toggle reaction" or empty if the user doesn\'t have permission to toggle the reaction, the second is the name of the reaction.']
			},
	{
				key: 'comment.reactionLabelOne', comment: [
					'This is a tooltip for an emoji that is a "reaction" to a comment where the count of the reactions is 1.',
					'The emoji is also a button so that the current user can also toggle their own emoji reaction.',
					'The first arg is localized message "Toggle reaction" or empty if the user doesn\'t have permission to toggle the reaction, the second is the name of the reaction.']
			},
	{
				key: 'comment.reactionLabelMany', comment: [
					'This is a tooltip for an emoji that is a "reaction" to a comment where the count of the reactions is greater than 1.',
					'The emoji is also a button so that the current user can also toggle their own emoji reaction.',
					'The first arg is localized message "Toggle reaction" or empty if the user doesn\'t have permission to toggle the reaction, the second is number of users who have reacted with that reaction, and the third is the name of the reaction.']
			}
]);