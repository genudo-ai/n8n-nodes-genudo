import { createHmac, timingSafeEqual } from 'crypto';
import {
	NodeConnectionTypes,
	type IDataObject,
	type INodeType,
	type INodeTypeDescription,
	type IWebhookFunctions,
	type IWebhookResponseData,
} from 'n8n-workflow';

const TOLERANCE_SECONDS = 300;

// eslint-disable-next-line @n8n/community-nodes/node-usable-as-tool -- a webhook trigger has no tool form
export class GenudoWebChannelTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Genudo Web Channel Trigger',
		name: 'genudoWebChannelTrigger',
		icon: { light: 'file:genudo.svg', dark: 'file:genudo.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: 'on AI reply',
		description: 'Starts the workflow when the Genudo AI replies on a web channel',
		defaults: {
			name: 'Genudo Web Channel Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'genudoWebChannelApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'genudo-web-channel',
			},
		],
		properties: [
			{
				displayName:
					'Copy this node’s Production URL into the web channel’s Callback URL in the Genudo Console. Every request is checked against its HMAC-SHA256 signature using the Client Secret; anything unsigned, stale or forged is rejected with 403.',
				name: 'notice',
				type: 'notice',
				default: '',
			},
		],
	};

	// The callback URL is set by hand on the channel in the Genudo Console — there is no API to
	// register it, so there is nothing to create, check or clean up.
	webhookMethods = {
		default: {
			checkExists: async () => true,
			create: async () => true,
			delete: async () => true,
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const res = this.getResponseObject();
		const { clientSecret } = await this.getCredentials('genudoWebChannelApi');

		const timestamp = String(req.headers['x-genudo-timestamp'] ?? '');
		const received = String(req.headers['x-genudo-signature'] ?? '').replace(/^sha256=/, '');
		// the signature covers the exact bytes Genudo sent, so it must be checked against the raw body
		const rawBody = (req as unknown as { rawBody?: Buffer }).rawBody;

		const expected = rawBody
			? createHmac('sha256', clientSecret as string)
					.update(`${timestamp}.`)
					.update(rawBody)
					.digest('hex')
			: '';
		const fresh = Math.abs(Date.now() / 1000 - Number(timestamp)) <= TOLERANCE_SECONDS;
		const valid =
			fresh &&
			expected !== '' &&
			expected.length === received.length &&
			timingSafeEqual(Buffer.from(expected), Buffer.from(received));

		if (!valid) {
			res.status(403).json({ error: 'Invalid signature' });
			return { noWebhookResponse: true };
		}

		return { workflowData: [this.helpers.returnJsonArray(req.body as IDataObject)] };
	}
}
