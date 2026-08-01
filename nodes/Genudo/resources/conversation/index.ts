import type { INodeProperties } from 'n8n-workflow';
import { attachFiles, conversationSendMessageDescription } from './sendMessage';
import { conversationUpdateDescription } from './update';

const showOnlyForConversations = {
	resource: ['conversation'],
};

export const conversationDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForConversations,
		},
		options: [
			{
				name: 'Send Message',
				value: 'sendMessage',
				action: 'Send a message to a conversation',
				description: 'Send a manual message through the conversation’s connected channel',
				routing: {
					request: {
						method: 'POST',
						url: '=/api/user/{{$parameter.conversationId}}/messages',
					},
					send: {
						preSend: [attachFiles],
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a conversation',
				description: 'Change a conversation’s status and/or notes',
				routing: {
					request: {
						method: 'PUT',
						url: '=/api/user/conversations/{{$parameter.conversationId}}',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
		],
		default: 'sendMessage',
	},
	{
		displayName: 'Conversation ID',
		name: 'conversationId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForConversations,
		},
		description: 'ID of the conversation, which must belong to your workspace',
	},
	...conversationSendMessageDescription,
	...conversationUpdateDescription,
];
