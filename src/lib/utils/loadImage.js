/**
 * Reads & Loads an image file into an HTMLImageElement that has been fully loaded
 * @param {File} file The image file to load
 * @returns {Promise<HTMLImageElement>} A promise that resolves to the loaded image
 */
export function loadImageFile(file) {
	return new Promise((resolve, reject) => {
		if (!file.type.startsWith('image/')) {
			reject(new Error('Not an image file'));
		}

		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result !== 'string') return;

			const new_image = new Image();
			new_image.onload = () => {
				resolve(new_image);
			};

			new_image.onerror = (e) => {
				reject(e);
			};

			new_image.src = reader.result;
		};
		reader.onerror = (e) => {
			reject(e);
		};

		reader.readAsDataURL(file);
	});
}

/**
 * @param {HTMLImageElement} image
 * @returns {ImageData}
 */
export function getImageData(image) {
	const canvas = new OffscreenCanvas(image.width, image.height);
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Could not get canvas context');

	ctx.drawImage(image, 0, 0);
	return ctx.getImageData(0, 0, image.width, image.height);
}
