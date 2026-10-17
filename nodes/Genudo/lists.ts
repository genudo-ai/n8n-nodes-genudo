import type { IDataObject, IExecuteSingleFunctions, IHttpRequestOptions } from 'n8n-workflow';

const toList = (value: unknown): unknown[] =>
	typeof value === 'string'
		? value
				.split(',')
				.map((item) => item.trim())
				.filter((item) => item !== '')
		: (value as unknown[]);

/**
 * List fields are plain string parameters so an expression can feed them an array. Typed by hand
 * they are comma-separated, so split those here. Done in code rather than in a routing
 * expression: the expression form failed on a real n8n with "The tags field must be an array".
 */
export const splitLists =
	(strings: string[], numbers: string[] = []) =>
	async function (
		this: IExecuteSingleFunctions,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		const body = requestOptions.body as IDataObject | undefined;
		if (!body) return requestOptions;
		for (const key of strings) {
			if (key in body) body[key] = toList(body[key]);
		}
		for (const key of numbers) {
			if (key in body) body[key] = toList(body[key]).map(Number).filter((n) => !isNaN(n));
		}
		return requestOptions;
	};
