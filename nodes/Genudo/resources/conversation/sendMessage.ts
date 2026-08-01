import type {
	IDataObject,
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

const MAX_FILES = 10;

const showOnlyForSendMessage = {
	operation: ['sendMessage'],
	resource: ['conversation'],
};

/**
 * Genudo only accepts attachments as multipart/form-data with a repeated `files[]` field.
 * ponytail: the body is assembled by hand instead of pulling in form-data / relying on a
 * global FormData, so the package keeps zero runtime dependencies.
 */
export async function attachFiles(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const sendAttachments = this.getNodeParameter('sendAttachments', false) as boolean;
	if (!sendAttachments) return requestOptions;

	const fields = (this.getNodeParameter('binaryPropertyNames', '') as string)
		.split(',')
		.map((name) => name.trim())
		.filter((name) => name !== '');

	if (fields.length === 0) {
		throw new NodeOperationError(
			this.getNode(),
			'No input binary field given for the attachments to send',
		);
	}
	if (fields.length > MAX_FILES) {
		throw new NodeOperationError(
			this.getNode(),
			`Genudo accepts at most ${MAX_FILES} files per message, but ${fields.length} were given`,
		);
	}

	const boundary = `----n8nGenudoBoundary${Date.now().toString(16)}`;
	const parts: Buffer[] = [];

	const message = (requestOptions.body as IDataObject | undefined)?.message;
	if (typeof message === 'string' && message !== '') {
		parts.push(
			Buffer.from(
				`--${boundary}\r\nContent-Disposition: form-data; name="message"\r\n\r\n${message}\r\n`,
			),
		);
	}

	for (const field of fields) {
		const binaryData = this.helpers.assertBinaryData(field);
		const buffer = await this.helpers.getBinaryDataBuffer(field);
		const fileName = (binaryData.fileName ?? field).replace(/"/g, '');
		parts.push(
			Buffer.from(
				`--${boundary}\r\nContent-Disposition: form-data; name="files[]"; filename="${fileName}"\r\n` +
					`Content-Type: ${binaryData.mimeType ?? 'application/octet-stream'}\r\n\r\n`,
			),
		);
		parts.push(buffer);
		parts.push(Buffer.from('\r\n'));
	}
	parts.push(Buffer.from(`--${boundary}--\r\n`));

	requestOptions.body = Buffer.concat(parts);
	requestOptions.headers = {
		...requestOptions.headers,
		'Content-Type': `multipart/form-data; boundary=${boundary}`,
	};

	return requestOptions;
}

export const conversationSendMessageDescription: INodeProperties[] = [
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		default: '',
		displayOptions: {
			show: showOnlyForSendMessage,
		},
		description:
			'Message text, max 10,000 characters. Optional only when at least one attachment is sent.',
		routing: {
			send: {
				type: 'body',
				property: 'message',
			},
		},
	},
	{
		displayName: 'Send Attachments',
		name: 'sendAttachments',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: showOnlyForSendMessage,
		},
		description: 'Whether to attach binary files from the input item to the message',
	},
	{
		displayName: 'Input Binary Fields',
		name: 'binaryPropertyNames',
		type: 'string',
		default: 'data',
		required: true,
		placeholder: 'data, data2',
		displayOptions: {
			show: {
				...showOnlyForSendMessage,
				sendAttachments: [true],
			},
		},
		description:
			'Comma-separated names of the binary fields on the input item holding the files to send. Up to 10 files, 25 MB each.',
	},
];
