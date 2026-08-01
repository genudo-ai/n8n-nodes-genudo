import type { INodeProperties } from 'n8n-workflow';

const showOnlyForConversationUpdate = {
	operation: ['update'],
	resource: ['conversation'],
};

export const conversationUpdateDescription: INodeProperties[] = [
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: showOnlyForConversationUpdate,
		},
		options: [
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					multipleValues: true,
					multipleValueButtonText: 'Add Note',
				},
				default: [],
				description: 'Freeform notes. Replaces the conversation’s existing notes list.',
				routing: {
					send: {
						type: 'body',
						property: 'notes',
					},
				},
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{
						name: 'Active',
						value: 'active',
					},
					{
						name: 'Paused',
						value: 'paused',
					},
				],
				default: 'active',
				description: 'Whether the AI agent keeps replying in this conversation',
				routing: {
					send: {
						type: 'body',
						property: 'status',
					},
				},
			},
		],
	},
];
