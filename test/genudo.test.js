// Self-check for the parts of the node that are not plain declarative data:
// the multipart assembly for message attachments, and the {{$parameter.x}}
// references inside routing URLs. Run with `npm test` (builds first).
const assert = require('node:assert/strict');

const { Genudo } = require('../dist/nodes/Genudo/Genudo.node.js');
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
}

main().then(
	() => console.log('ok - all checks passed'),
	(error) => {
		console.error(error);
		process.exit(1);
	},
);
