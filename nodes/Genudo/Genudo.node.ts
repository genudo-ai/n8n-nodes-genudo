import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { conversationDescription } from './resources/conversation';
import { knowledgeTableDescription } from './resources/knowledgeTable';
import { opportunityDescription } from './resources/opportunity';

export class Genudo implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Genudo',
		name: 'genudo',
		icon: { light: 'file:genudo.svg', dark: 'file:genudo.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the Genudo API',
		defaults: {
			name: 'Genudo',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'genudoApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.genudo.ai',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Conversation',
						value: 'conversation',
					},
					{
						name: 'Knowledge Table',
						value: 'knowledgeTable',
					},
					{
						name: 'Opportunity',
						value: 'opportunity',
					},
				],
				default: 'conversation',
			},
			...conversationDescription,
			...knowledgeTableDescription,
			...opportunityDescription,
		],
	};
}
