import type { INodeProperties } from 'n8n-workflow';

const showOnlyForUpsertPoints = {
	operation: ['upsertPoints'],
	resource: ['knowledgeTable'],
};

export const knowledgeTableUpsertPointsDescription: INodeProperties[] = [
	{
		displayName: 'Points',
		name: 'points',
		type: 'json',
		default:
			'[\n  {\n    "default_id": "q-001",\n    "question": "How do I reset my password?",\n    "answer": "Settings → Security → Reset password."\n  }\n]',
		required: true,
		displayOptions: {
			show: showOnlyForUpsertPoints,
		},
		description:
			'Array of points to create or update. Each point needs a default_id plus one entry per column of the table — run List Columns to discover them. Rows with an existing default_id are updated in place.',
		routing: {
			send: {
				type: 'body',
				property: 'points',
				value: '={{ typeof $value === "string" ? JSON.parse($value) : $value }}',
			},
		},
	},
];
