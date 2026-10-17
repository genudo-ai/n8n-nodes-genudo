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
	const boundary = `----n8nGenudoBoundary${Date.now().toString(16)}`;
	const parts: Buffer[] = [];

	for (const [name, value] of Object.entries(fields)) {
		parts.push(
			Buffer.from(
				`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`,
			),
		);
	}

	for (const file of files) {
		parts.push(
			Buffer.from(
				`--${boundary}\r\nContent-Disposition: form-data; name="${fileField}"; filename="${file.fileName.replace(/"/g, '')}"\r\n` +
					`Content-Type: ${file.mimeType}\r\n\r\n`,
			),
		);
		parts.push(file.buffer);
		parts.push(Buffer.from('\r\n'));
	}
	parts.push(Buffer.from(`--${boundary}--\r\n`));

	return { body: Buffer.concat(parts), contentType: `multipart/form-data; boundary=${boundary}` };
}
