import type { INodeProperties } from 'n8n-workflow';

/** `json` parameters arrive as a string when typed by hand and as an object when set by an expression */
export const parseJsonValue = '={{ typeof $value === "string" ? JSON.parse($value) : $value }}';

const showOnlyForOpportunityCreate = {
	operation: ['create'],
	resource: ['opportunity'],
};

export const opportunityCreateDescription: INodeProperties[] = [
	{
		displayName: 'Pipeline ID',
		name: 'pipelineId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: {
			show: showOnlyForOpportunityCreate,
		},
		description: 'ID of the pipeline to create the opportunity in',
		routing: {
			send: {
				type: 'body',
				property: 'pipeline_id',
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: showOnlyForOpportunityCreate,
		},
		options: [
			{
				displayName: 'Contact Email',
				name: 'contactEmail',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				description: 'Email of the contact. Required when no contact phone is given.',
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
				description: 'Display name of the contact',
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
					'Phone of the contact, digits only with country code prefix and no "+". Required when no contact email is given.',
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
				description: 'Arbitrary key-value metadata passed to the AI agent alongside the conversation',
				routing: {
					send: {
						type: 'body',
						property: 'context',
						value: parseJsonValue,
					},
				},
			},
			{
				displayName: 'Is Test',
				name: 'isTest',
				type: 'boolean',
				default: false,
				description:
					'Whether this is a test opportunity. When enabled, the contact email and phone must be unique across all contacts.',
				routing: {
					send: {
						type: 'body',
						property: 'is_test',
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
					'ID of the stage to place the opportunity in, which must belong to the pipeline. Defaults to the first stage of the pipeline.',
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
				description: 'Tag names to attach, created if they do not exist yet',
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
