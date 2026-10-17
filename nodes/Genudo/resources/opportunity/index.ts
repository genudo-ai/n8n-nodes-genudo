import type { INodeProperties } from 'n8n-workflow';
import { opportunityCreateDescription } from './create';
import { opportunityUpdateDescription } from './update';
import { splitLists } from '../../lists';


const showOnlyForOpportunities = {
	resource: ['opportunity'],
};

const showOnlyForLookupByIdentifier = {
	operation: ['get', 'update'],
	resource: ['opportunity'],
};

const showOnlyForGetByContact = {
	operation: ['getByContact'],
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
					send: {
						preSend: [splitLists(['tags'])],
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
				name: 'Get by Contact',
				value: 'getByContact',
				action: 'Get the opportunities of a contact',
				description:
					'List every opportunity of a contact across all pipelines, newest first. Returns one item per opportunity.',
				routing: {
					request: {
						method: 'GET',
						url: '=/api/user/contacts/{{$parameter.contactIdentifier}}/opportunities',
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
					send: {
						preSend: [splitLists(['tags'], ['deleted_tags'])],
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
		displayName: 'Contact ID or Phone',
		name: 'contactIdentifier',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForGetByContact,
		},
		description:
			'Numeric contact ID, or a contact phone number in digits-only form with country code prefix and no "+" (for example 201062691152). A numeric value is tried as a contact ID first, then as a phone number. Returns no items when nothing matches.',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				operation: ['get', 'update', 'getByContact'],
				resource: ['opportunity'],
			},
		},
		options: [
			{
				displayName: 'Pipeline ID',
				name: 'pipelineId',
				type: 'number',
				default: 0,
				description:
					'Restrict the lookup to a single pipeline. Ignored when the identifier is a numeric opportunity ID.',
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
