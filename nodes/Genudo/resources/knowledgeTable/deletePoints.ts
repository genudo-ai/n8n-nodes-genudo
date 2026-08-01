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
				// The reference docs name this field default_ids, but the live API rejects that
				// with "The ids field is required." and accepts `ids` holding default_id values.
				property: 'ids',
			},
		},
	},
];
