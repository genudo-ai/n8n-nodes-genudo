import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class GenudoWebChannelApi implements ICredentialType {
	name = 'genudoWebChannelApi';

	displayName = 'Genudo Web Channel API';

	icon: Icon = {
		light: 'file:../nodes/GenudoWebChannel/genudo.svg',
		dark: 'file:../nodes/GenudoWebChannel/genudo.dark.svg',
	};

	documentationUrl =
		'https://github.com/genudo-ai/n8n-nodes-genudo?tab=readme-ov-file#web-channel-credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'wc_...',
			description: 'Shown on the web channel in the Genudo Console. Also the Basic auth username.',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description:
				'Basic auth password, and the key used to verify the signature of reply webhooks. Reconnecting the channel in the Console regenerates it.',
		},
		{
			displayName: 'Messages Webhook URL',
			name: 'messagesWebhook',
			type: 'string',
			required: true,
			default: 'https://receiver.genudo.ai/web-chat/message',
			description:
				'The receiver URL inbound messages are posted to. Copy the messages_webhook value shown on the channel in the Genudo Console.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			auth: {
				username: '={{$credentials.clientId}}',
				password: '={{$credentials.clientSecret}}',
			},
		},
	};

	// Initiate is the only endpoint that proves both the Basic auth and the channel setup. It is
	// idempotent per contact_id, so testing repeatedly reuses the same "n8n-credential-test" contact.
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.genudo.ai',
			url: '/api/user/web-chat/initiate',
			method: 'POST',
			body: { contact_id: 'n8n-credential-test' },
		},
	};
}
