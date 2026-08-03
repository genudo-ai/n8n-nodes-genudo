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
		default: '',
		required: true,
		placeholder: 'q-001,q-003',
		displayOptions: {
			show: showOnlyForDeletePoints,
		},
		description:
			'The default_id of every point to remove. Comma-separated, or an expression returning an array.',
		routing: {
			send: {
				type: 'body',
				// The reference docs name this field default_ids, but the live API rejects that
				// with "The ids field is required." and accepts `ids` holding default_id values.
				property: 'ids',
				value: '={{ typeof $value === "string" ? $value.split(",").map(s => s.trim()).filter(s => s !== "") : $value }}',
			},
		},
	},
];
