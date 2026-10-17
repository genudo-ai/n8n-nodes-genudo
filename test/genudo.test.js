// Self-check for the parts of the node that are not plain declarative data:
// the multipart assembly for message attachments, and the {{$parameter.x}}
// references inside routing URLs. Run with `npm test` (builds first).
const assert = require('node:assert/strict');

const { Genudo } = require('../dist/nodes/Genudo/Genudo.node.js');
const { GenudoWebChannel } = require('../dist/nodes/GenudoWebChannel/GenudoWebChannel.node.js');
const {
	GenudoWebChannelTrigger,
} = require('../dist/nodes/GenudoWebChannel/GenudoWebChannelTrigger.node.js');
const { splitLists } = require('../dist/nodes/Genudo/lists.js');
const { createHmac } = require('node:crypto');
const { attachFiles } = require('../dist/nodes/Genudo/resources/conversation/sendMessage.js');

const properties = new Genudo().description.properties;

// --- node shape -------------------------------------------------------------

const resources = properties.find((p) => p.name === 'resource').options.map((o) => o.value);
assert.deepEqual(resources, ['conversation', 'knowledgeTable', 'opportunity']);

const operations = properties.filter((p) => p.name === 'operation').flatMap((p) => p.options);
assert.deepEqual(
	operations.map((o) => o.value).sort(),
	[
		'create',
		'deletePoints',
		'get',
		'getByContact',
		'listColumns',
		'listPoints',
		'listTables',
		'sendMessage',
		'update',
		'update',
		'upsertPoints',
	].sort(),
);

for (const operation of operations) {
	assert.ok(operation.routing?.request?.method, `${operation.value}: no request method`);
	assert.ok(operation.routing?.request?.url, `${operation.value}: no request url`);
	assert.ok(operation.action, `${operation.value}: no action`);
}

// --- every {{$parameter.x}} in a routing URL resolves to a real parameter ----

const parameterNames = new Set();
const collect = (props) => {
	for (const prop of props) {
		parameterNames.add(prop.name);
		if (Array.isArray(prop.options)) collect(prop.options.filter((o) => o.name && o.type));
	}
};
collect(properties);

for (const operation of operations) {
	for (const [, referenced] of operation.routing.request.url.matchAll(/\$parameter\.(\w+)/g)) {
		assert.ok(
			parameterNames.has(referenced),
			`${operation.value}: url references unknown parameter "${referenced}"`,
		);
	}
}

async function main() {
	// --- multipart attachments --------------------------------------------------

	const context = (params) => ({
		getNodeParameter: (name, fallback) => (name in params ? params[name] : fallback),
		getNode: () => ({ name: 'Genudo', type: 'n8n-nodes-genudo.genudo', typeVersion: 1 }),
		helpers: {
			assertBinaryData: (property) => ({ fileName: `${property}.txt`, mimeType: 'text/plain' }),
			getBinaryDataBuffer: async (property) => Buffer.from(`contents of ${property}`),
		},
	});

	// Attachments off: request is passed through untouched.
	const jsonRequest = { body: { message: 'hi' }, headers: { 'Content-Type': 'application/json' } };
	assert.deepEqual(
		await attachFiles.call(context({ sendAttachments: false }), { ...jsonRequest }),
		jsonRequest,
	);

	// Attachments on: body becomes a multipart payload with one part per binary field.
	const multipart = await attachFiles.call(
		context({ sendAttachments: true, binaryPropertyNames: 'data, extra' }),
		{ body: { message: 'hi' }, headers: { 'Content-Type': 'application/json' } },
	);
	const contentType = multipart.headers['Content-Type'];
	assert.match(contentType, /^multipart\/form-data; boundary=----n8nGenudoBoundary[0-9a-f]+$/);

	const boundary = contentType.split('boundary=')[1];
	const body = multipart.body.toString();
	assert.ok(Buffer.isBuffer(multipart.body));
	assert.ok(
		body.startsWith(`--${boundary}\r\nContent-Disposition: form-data; name="message"\r\n\r\nhi\r\n`),
	);
	assert.equal(body.match(/name="files\[\]"/g).length, 2);
	assert.ok(body.includes('filename="data.txt"'));
	assert.ok(body.includes('contents of extra'));
	assert.ok(body.endsWith(`--${boundary}--\r\n`));

	// Genudo caps a message at 10 files.
	await assert.rejects(
		attachFiles.call(
			context({ sendAttachments: true, binaryPropertyNames: 'a,b,c,d,e,f,g,h,i,j,k' }),
			{ body: {}, headers: {} },
		),
		/at most 10 files/,
	);

	await assert.rejects(
		attachFiles.call(context({ sendAttachments: true, binaryPropertyNames: ' , ' }), {
			body: {},
			headers: {},
		}),
		/No input binary field/,
	);
	// --- web channel node ---------------------------------------------------------

	const calls = [];
	const channelContext = (params, respond) => ({
		getInputData: () => [{ json: {} }],
		getNodeParameter: (name, _i, fallback) => (name in params ? params[name] : fallback),
		getCredentials: async () => ({ messagesWebhook: 'https://receiver.test/web-chat/message' }),
		getNode: () => ({ name: 'Genudo Web Channel' }),
		continueOnFail: () => false,
		helpers: {
			httpRequestWithAuthentication: async (credential, options) => {
				assert.equal(credential, 'genudoWebChannelApi');
				calls.push(options);
				return respond(options);
			},
			assertBinaryData: (_i, property) => ({ fileName: `${property}.txt`, mimeType: 'text/plain' }),
			getBinaryDataBuffer: async (_i, property) => Buffer.from(`contents of ${property}`),
		},
	});
	const run = (params, respond) =>
		new GenudoWebChannel().execute.call(channelContext(params, respond));

	// Initiate sends only the fields that were set and unwraps the envelope.
	let [[initiated]] = await run(
		{ operation: 'initiate', initiateFields: { contactId: 'abc', name: 'Ali' } },
		() => ({ data: { contact_id: 'abc', conversation_id: 7 } }),
	);
	assert.deepEqual(calls.at(-1).body, { contact_id: 'abc', name: 'Ali' });
	assert.equal(calls.at(-1).url, 'https://api.genudo.ai/api/user/web-chat/initiate');
	assert.equal(initiated.json.conversation_id, 7);

	// Send Message goes to the credential's receiver host as JSON when there are no files.
	let [[sent]] = await run(
		{ operation: 'sendMessage', contactId: 'abc', message: 'hi', sendAttachments: false },
		() => ({ status: true, data: { message_id: 'm1' } }),
	);
	assert.equal(calls.at(-1).url, 'https://receiver.test/web-chat/message');
	assert.deepEqual(calls.at(-1).body, { contact_id: 'abc', message: 'hi' });
	assert.deepEqual(sent.json, { contact_id: 'abc', message_id: 'm1' });

	// ...and as multipart with a `files` field (not `files[]`) when attachments are on.
	await run(
		{
			operation: 'sendMessage',
			contactId: 'abc',
			message: '',
			sendAttachments: true,
			binaryPropertyNames: 'data',
		},
		() => '{"status":true,"data":{"message_id":"m2"}}',
	);
	const multipartBody = calls.at(-1).body.toString();
	assert.match(calls.at(-1).headers['Content-Type'], /^multipart\/form-data; boundary=/);
	assert.ok(multipartBody.includes('name="contact_id"\r\n\r\nabc'));
	assert.ok(multipartBody.includes('name="files"; filename="data.txt"'));

	// Get Messages follows pages until last_page.
	const pages = { 1: ['a', 'b'], 2: ['c'] };
	const history = await run(
		{ operation: 'getMessages', lookupBy: 'contactId', lookupContactId: 'abc', returnAll: true },
		(options) => ({
			data: {
				data: pages[options.qs.page].map((id) => ({ id })),
				last_page: 2,
			},
		}),
	);
	assert.deepEqual(
		history[0].map((item) => item.json.id),
		['a', 'b', 'c'],
	);
	assert.equal(calls.at(-1).qs.contact_id, 'abc');

	// --- web channel reply trigger ------------------------------------------------

	const secret = 'shh';
	const rawBody = Buffer.from('{"event":"message","text":"hello"}');
	const webhook = async (timestamp, signature) => {
		let status;
		const result = await new GenudoWebChannelTrigger().webhook.call({
			getRequestObject: () => ({
				headers: { 'x-genudo-timestamp': timestamp, 'x-genudo-signature': signature },
				rawBody,
				body: JSON.parse(rawBody),
			}),
			getResponseObject: () => ({ status: (code) => ({ json: () => (status = code) }) }),
			getCredentials: async () => ({ clientSecret: secret }),
			helpers: { returnJsonArray: (body) => [{ json: body }] },
		});
		return { status, result };
	};
	const now = String(Math.floor(Date.now() / 1000));
	const sign = (timestamp) =>
		'sha256=' + createHmac('sha256', secret).update(`${timestamp}.`).update(rawBody).digest('hex');

	const good = await webhook(now, sign(now));
	assert.equal(good.status, undefined);
	assert.equal(good.result.workflowData[0][0].json.text, 'hello');

	assert.equal((await webhook(now, sign(now).replace(/.$/, '0'))).status, 403); // forged
	assert.equal((await webhook(now, 'sha256=short')).status, 403); // wrong length, must not throw
	const old = String(Number(now) - 3600);
	assert.equal((await webhook(old, sign(old))).status, 403); // replay

	// --- list fields: comma string or array, in code (not a routing expression) ----

	const split = splitLists(['tags'], ['deleted_tags']);
	const out = await split.call({}, { body: { tags: ' a, b ,,c', deleted_tags: '1, 2,x', other: 'x,y' } });
	assert.deepEqual(out.body, { tags: ['a', 'b', 'c'], deleted_tags: [1, 2], other: 'x,y' });
	const fromArray = await split.call({}, { body: { tags: ['a', 'b'], deleted_tags: ['3'] } });
	assert.deepEqual(fromArray.body, { tags: ['a', 'b'], deleted_tags: [3] });
	assert.deepEqual((await split.call({}, { body: {} })).body, {});
}

main().then(
	() => console.log('ok - all checks passed'),
	(error) => {
		console.error(error);
		process.exit(1);
	},
);
