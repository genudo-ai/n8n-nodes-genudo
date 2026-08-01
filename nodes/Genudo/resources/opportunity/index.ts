import type { INodeProperties } from 'n8n-workflow';
import { opportunityCreateDescription } from './create';
import { opportunityUpdateDescription } from './update';

const showOnlyForOpportunities = {
	resource: ['opportunity'],
};

const showOnlyForLookupByIdentifier = {
	operation: ['get', 'update'],
	resource: ['opportunity'],
};

const unwrapData = {
	postReceive: [
		{
			type: 'rootProperty' as const,
			properties: {
				property: 'data',
			},
		},
	],
};

export const opportunityDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForOpportunities,
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create an opportunity',
				description: 'Create a new opportunity in a pipeline',
				routing: {
					request: {
						method: 'POST',
						url: '/api/user/opportunities',
					},
					output: unwrapData,
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get an opportunity',
				description: 'Retrieve an opportunity with its contact, stage, tags and conversations',
				routing: {
					request: {
						method: 'GET',
						url: '=/api/user/opportunities/{{$parameter.identifier}}',
					},
					output: unwrapData,
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update an opportunity',
				description: 'Update an opportunity, leaving omitted fields unchanged',
				routing: {
					request: {
						method: 'PUT',
						url: '=/api/user/opportunities/{{$parameter.identifier}}',
					},
					output: unwrapData,
				},
			},
		],
		default: 'create',
	},
	{
		displayName: 'Opportunity ID or Phone',
		name: 'identifier',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForLookupByIdentifier,
		},
		description:
			'Numeric opportunity ID, or a contact phone number in digits-only form with country code prefix and no "+" (for example 201062691152)',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: showOnlyForLookupByIdentifier,
		},
		options: [
			{
				displayName: 'Pipeline ID',
				name: 'pipelineId',
				type: 'number',
				default: 0,
				description:
					'Restrict a phone lookup to a single pipeline. Ignored when the identifier is a numeric ID.',
				routing: {
					send: {
						type: 'query',
						property: 'pipeline_id',
					},
				},
			},
		],
	},
	...opportunityCreateDescription,
	...opportunityUpdateDescription,
];
