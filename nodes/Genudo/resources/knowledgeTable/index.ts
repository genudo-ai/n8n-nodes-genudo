import type { INodeProperties } from 'n8n-workflow';
import { knowledgeTableDeletePointsDescription } from './deletePoints';
import { knowledgeTableListPointsDescription } from './listPoints';
import { knowledgeTableUpsertPointsDescription } from './upsertPoints';

const showOnlyForKnowledgeTables = {
	resource: ['knowledgeTable'],
};

const pointsUrl = '=/api/user/knowledge-tables/{{$parameter.knowledgeTableId}}/points';

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

export const knowledgeTableDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForKnowledgeTables,
		},
		options: [
			{
				name: 'Delete Points',
				value: 'deletePoints',
				action: 'Delete points from a knowledge table',
				description: 'Delete rows from a knowledge table by their default ID',
				routing: {
					request: {
						method: 'DELETE',
						url: pointsUrl,
					},
					output: unwrapData,
				},
			},
			{
				name: 'List Columns',
				value: 'listColumns',
				action: 'List columns of a knowledge table',
				description: 'Get the schema of a knowledge table: columns, data types and flags',
				routing: {
					request: {
						method: 'GET',
						url: '=/api/user/knowledge-tables/{{$parameter.knowledgeTableId}}/columns',
					},
					output: unwrapData,
				},
			},
			{
				name: 'List Points',
				value: 'listPoints',
				action: 'List points in a knowledge table',
				description: 'Get the rows of a knowledge table with their field values',
				routing: {
					request: {
						method: 'GET',
						url: pointsUrl,
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data.records',
								},
							},
						],
					},
				},
			},
			{
				name: 'List Tables',
				value: 'listTables',
				action: 'List knowledge tables',
				description: 'Get every knowledge table in your workspace',
				routing: {
					request: {
						method: 'GET',
						url: '/api/user/knowledge-tables',
					},
					output: unwrapData,
				},
			},
			{
				name: 'Upsert Points',
				value: 'upsertPoints',
				action: 'Upsert points into a knowledge table',
				description: 'Create or update rows in a knowledge table in bulk',
				routing: {
					request: {
						method: 'PUT',
						url: pointsUrl,
					},
					output: unwrapData,
				},
			},
		],
		default: 'listTables',
	},
	{
		displayName: 'Knowledge Table ID',
		name: 'knowledgeTableId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				...showOnlyForKnowledgeTables,
				operation: ['deletePoints', 'listColumns', 'listPoints', 'upsertPoints'],
			},
		},
		description: 'ID of the knowledge table, as returned by List Tables',
	},
	...knowledgeTableListPointsDescription,
	...knowledgeTableUpsertPointsDescription,
	...knowledgeTableDeletePointsDescription,
];
