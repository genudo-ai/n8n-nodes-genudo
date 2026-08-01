import type { INodeProperties } from 'n8n-workflow';
import { parseJsonValue } from './create';

const showOnlyForOpportunityUpdate = {
	operation: ['update'],
	resource: ['opportunity'],
};

export const opportunityUpdateDescription: INodeProperties[] = [
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: showOnlyForOpportunityUpdate,
		},
		options: [
			{
				displayName: 'Contact Email',
				name: 'contactEmail',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				description: 'Email override for the contact',
				routing: {
					send: {
						type: 'body',
						property: 'contact.email',
					},
				},
			},
			{
				displayName: 'Contact Name',
				name: 'contactName',
				type: 'string',
				default: '',
				description: 'Display name override for the contact',
				routing: {
					send: {
						type: 'body',
						property: 'contact.name',
					},
				},
			},
			{
				displayName: 'Contact Phone',
				name: 'contactPhone',
				type: 'string',
				placeholder: '201062691152',
				default: '',
				description:
					'Phone override for the contact, digits only with country code prefix and no "+"',
				routing: {
					send: {
						type: 'body',
						property: 'contact.phone',
					},
				},
			},
			{
				displayName: 'Contact Priority',
				name: 'contactPriority',
				type: 'options',
				options: [
					{
						name: 'High',
						value: 'high',
					},
					{
						name: 'Low',
						value: 'low',
					},
					{
						name: 'Medium',
						value: 'medium',
					},
				],
				default: 'medium',
				description: 'Priority of the contact',
				routing: {
					send: {
						type: 'body',
						property: 'contact.priority',
					},
				},
			},
			{
				displayName: 'Context',
				name: 'context',
				type: 'json',
				default: '{}',
				description: 'Arbitrary key-value metadata attached to the opportunity',
				routing: {
					send: {
						type: 'body',
						property: 'context',
						value: parseJsonValue,
					},
				},
			},
			{
				displayName: 'Deleted Tags',
				name: 'deletedTags',
				type: 'string',
				typeOptions: {
					multipleValues: true,
					multipleValueButtonText: 'Add Tag ID',
				},
				default: [],
				description: 'IDs of the tags to remove from this opportunity',
				routing: {
					send: {
						type: 'body',
						property: 'deleted_tags',
						value: '={{ $value.map(Number) }}',
					},
				},
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Display name of the opportunity, max 255 characters',
				routing: {
					send: {
						type: 'body',
						property: 'name',
					},
				},
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '',
				description: 'Free-form notes on the opportunity',
				routing: {
					send: {
						type: 'body',
						property: 'notes',
					},
				},
			},
			{
				displayName: 'Stage ID',
				name: 'stageId',
				type: 'number',
				default: 0,
				description:
					'ID of the stage to move the opportunity to, which must belong to the same pipeline',
				routing: {
					send: {
						type: 'body',
						property: 'stage_id',
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
						name: 'Lost',
						value: 'lost',
					},
					{
						name: 'Won',
						value: 'won',
					},
				],
				default: 'active',
				// The reference docs also list "paused", but the live API rejects it with
				// "The selected status is invalid." — that value belongs to conversations.
				description: 'Status of the opportunity. Won and Lost require the pipeline to have a stage of that nature.',
				routing: {
					send: {
						type: 'body',
						property: 'status',
					},
				},
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				typeOptions: {
					multipleValues: true,
					multipleValueButtonText: 'Add Tag',
				},
				default: [],
				description: 'Tag names to add, created if they do not exist yet',
				routing: {
					send: {
						type: 'body',
						property: 'tags',
					},
				},
			},
		],
	},
];
