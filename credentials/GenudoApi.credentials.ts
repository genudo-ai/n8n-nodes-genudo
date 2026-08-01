import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class GenudoApi implements ICredentialType {
	name = 'genudoApi';

	displayName = 'Genudo API';

	icon: Icon = {
		light: 'file:../nodes/Genudo/genudo.svg',
		dark: 'file:../nodes/Genudo/genudo.dark.svg',
	};

	documentationUrl = 'https://github.com/genudo-ai/n8n-nodes-genudo?tab=readme-ov-file#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description:
				'Token created at https://app.genudo.ai/tokens (Developer → API Keys &amp; Tokens → Create token). Give it the scopes for the operations you plan to use, plus knowledge:read so the connection test can run.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.accessToken}}',
			},
		},
	};

	// ponytail: knowledge-tables is the only scope-cheap authenticated GET Genudo documents;
	// a token without knowledge:read will fail the test with 403 but still work for its own scopes.
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.genudo.ai',
			url: '/api/user/knowledge-tables',
		},
	};
}
