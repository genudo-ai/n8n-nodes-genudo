import type {
	IDataObject,
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { buildMultipart, type MultipartFile } from '../../multipart';

const MAX_FILES = 10;

const showOnlyForSendMessage = {
	operation: ['sendMessage'],
	resource: ['conversation'],
};

/**
 * Genudo only accepts attachments as multipart/form-data with a repeated `files[]` field.
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

	const message = (requestOptions.body as IDataObject | undefined)?.message;
	const files: MultipartFile[] = [];
	for (const field of fields) {
		const binaryData = this.helpers.assertBinaryData(field);
		files.push({
			fileName: binaryData.fileName ?? field,
			mimeType: binaryData.mimeType ?? 'application/octet-stream',
			buffer: await this.helpers.getBinaryDataBuffer(field),
		});
	}

	const { body, contentType } = buildMultipart(
		typeof message === 'string' && message !== '' ? { message } : {},
		'files[]',
		files,
	);
	requestOptions.body = body;
	requestOptions.headers = {
		...requestOptions.headers,
		'Content-Type': contentType,
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
