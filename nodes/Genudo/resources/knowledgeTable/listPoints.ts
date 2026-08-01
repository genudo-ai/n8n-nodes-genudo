import type { INodeProperties } from 'n8n-workflow';

const showOnlyForListPoints = {
	operation: ['listPoints'],
	resource: ['knowledgeTable'],
};

export const knowledgeTableListPointsDescription: INodeProperties[] = [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: showOnlyForListPoints,
		},
		description: 'Whether to return all results or only up to a given limit',
		routing: {
			send: {
				paginate: '={{$value}}',
			},
			operations: {
				pagination: {
					type: 'generic',
					properties: {
						continue: '={{ $response?.body?.data?.next_page_offset != null }}',
						request: {
							qs: {
								per_page: 100,
								next_page_offset: '={{ $response?.body?.data?.next_page_offset }}',
							},
						},
					},
				},
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				...showOnlyForListPoints,
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
		routing: {
			send: {
				type: 'query',
				property: 'per_page',
			},
			output: {
				maxResults: '={{$value}}',
			},
		},
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				...showOnlyForListPoints,
				returnAll: [false],
			},
		},
		options: [
			{
				displayName: 'Next Page Offset',
				name: 'nextPageOffset',
				type: 'string',
				default: '',
				description:
					'Cursor taken from the next_page_offset of a previous response. Omit to start from the first page.',
				routing: {
					send: {
						type: 'query',
						property: 'next_page_offset',
					},
				},
			},
		],
	},
];
