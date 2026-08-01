import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class GenudoApi implements ICredentialType {
	name = 'genudoApi';

	displayName = 'Genudo API';

	// Link to your community node's README
	documentationUrl = 'https://github.com/loopx/n8n-nodes-genudo?tab=readme-ov-file#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
		},
	];

	// TODO: confirm auth header name against https://api.genudo.ai/docs/guide/authentication
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'x-api-key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.genudo.ai',
			// TODO: point at a cheap authenticated GET once endpoint mapping is done
			url: '/api/v1/knowledge-tables',
		},
	};
}
