import { randomBytes } from 'crypto';

/** CR/LF would let a value end its header line and inject new headers or parts */
const headerSafe = (value: string) => value.replace(/[\r\n"]/g, '');

export interface MultipartFile {
	fileName: string;
	mimeType: string;
	buffer: Buffer;
}

/**
 * Builds a multipart/form-data body by hand so the package keeps zero runtime dependencies.
 * Text fields come first, then one part per file under `fileField`.
 */
export function buildMultipart(
	fields: Record<string, string>,
	fileField: string,
	files: MultipartFile[],
): { body: Buffer; contentType: string } {
	const boundary = `----n8nGenudoBoundary${randomBytes(16).toString('hex')}`;
	const parts: Buffer[] = [];

	for (const [name, value] of Object.entries(fields)) {
		parts.push(
			Buffer.from(
				`--${boundary}\r\nContent-Disposition: form-data; name="${headerSafe(name)}"\r\n\r\n${value}\r\n`,
			),
		);
	}

	for (const file of files) {
		parts.push(
			Buffer.from(
				`--${boundary}\r\nContent-Disposition: form-data; name="${fileField}"; filename="${headerSafe(file.fileName)}"\r\n` +
					`Content-Type: ${headerSafe(file.mimeType)}\r\n\r\n`,
			),
		);
		parts.push(file.buffer);
		parts.push(Buffer.from('\r\n'));
	}
	parts.push(Buffer.from(`--${boundary}--\r\n`));

	return { body: Buffer.concat(parts), contentType: `multipart/form-data; boundary=${boundary}` };
}
