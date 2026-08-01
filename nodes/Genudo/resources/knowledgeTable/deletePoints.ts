import type { INodeProperties } from 'n8n-workflow';

const showOnlyForDeletePoints = {
	operation: ['deletePoints'],
	resource: ['knowledgeTable'],
};

export const knowledgeTableDeletePointsDescription: INodeProperties[] = [
	{
		displayName: 'Default IDs',
		name: 'defaultIds',
		type: 'string',
		typeOptions: {
			multipleValues: true,
			multipleValueButtonText: 'Add Default ID',
		},
		default: [],
		required: true,
		displayOptions: {
			show: showOnlyForDeletePoints,
		},
		description: 'The default_id of every point to remove from the table',
		routing: {
			send: {
				type: 'body',
				property: 'default_ids',
			},
		},
	},
];
