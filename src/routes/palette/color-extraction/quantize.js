//median cut algorithm

/*
    WE USE A REDUCED BIT REPRESENTATION FOR COLORS (5bits instead of 8bits)
    This increases the chance of a collision in the histogram, reducing the number of samples needed
 */
const BITS_PER_CHANNEL = 8;
const REDUCED_BITS_PER_CHANNEL = 5;
const MAX_ITERATIONS = 1000;

const significant_bits = REDUCED_BITS_PER_CHANNEL;
const right_shift = BITS_PER_CHANNEL - REDUCED_BITS_PER_CHANNEL;
const fractByPopulations = 0.75;

/**
 * Convenience function for comparing two numbers
 * @param {number} a
 * @param {number} b
 * @returns {-1 | 0 | 1}
 */
function naturalOrder(a, b) {
	if (a < b) return -1;
	if (a > b) return 1;
	return 0;
}

/**
 * Simple PriorityQueue
 *
 * @template T - The type of the elements in the queue
 */
class PriorityQueue {
	/** @type {T[]} */
	#contents = [];

	/** @type {boolean} */
	#isSorted = false;

	/** @type {(a: T, b: T) => number} */
	#compareFn;

	/**
	 * @param {(a: T, b: T) => number} compareFn - The function to use for comparing elements
	 */
	constructor(compareFn) {
		this.#compareFn = compareFn;
	}

	/**
	 * Make sure the contents are sorted. If they are already sorted, this is a no-op.
	 */
	#sort() {
		if (this.#isSorted) return;
		this.#contents.sort(this.#compareFn);
		this.#isSorted = true;
	}

	/**
	 * @param {T} o
	 */
	push(o) {
		this.#contents.push(o);
		this.#isSorted = false;
	}

	/**
	 * @param {number | undefined} index
	 * @returns
	 */
	peek(index) {
		this.#sort();
		if (index === undefined) index = this.#contents.length - 1; //Default to last element
		return this.#contents[index];
	}

	/**
	 */
	pop() {
		this.#sort();
		return this.#contents.pop();
	}

	/**
	 *
	 * @returns {number}
	 */
	size() {
		return this.#contents.length;
	}

	/**
	 * @template X
	 * @param {(value: T, index: number, array: T[]) => X} mapFn
	 * @returns {X[]}
	 */
	map(mapFn) {
		return this.#contents.map(mapFn);
	}

	[Symbol.iterator]() {
		this.#sort();
		return this.#contents[Symbol.iterator]();
	}
}

/**
 * Represents a cube-subset of the color space, with a distribution of colors inside it
 */
class VBox {
	/** @type {number | undefined} */
	#count = undefined;

	/** @type {import("../../utils").RGB | undefined} */
	#avg = undefined;

	/** @type {number} */
	r1;
	/** @type {number} */
	r2;

	/** @type {number} */
	g1;

	/** @type {number} */
	g2;

	/** @type {number} */
	b1;

	/** @type {number} */
	b2;

	/** @type {Histogram} */
	histogram;

	/**
	 * All Color-Values already use the reduced bit resolution
	 * @param {number} r1 - The minimum red value
	 * @param {number} r2 - The maximum red value
	 * @param {number} g1 - The minimum green value
	 * @param {number} g2 - The maximum green value
	 * @param {number} b1 - The minimum blue value
	 * @param {number} b2 - The maximum blue value
	 * @param {Histogram} histogram - The histogram to use for sampling
	 */
	constructor(r1, r2, g1, g2, b1, b2, histogram) {
		this.r1 = r1;
		this.r2 = r2;
		this.g1 = g1;
		this.g2 = g2;
		this.b1 = b1;
		this.b2 = b2;
		this.histogram = histogram;
	}

	/**
	 * Gets the volume of the vbox
	 */
	volume() {
		return (this.r2 - this.r1 + 1) * (this.g2 - this.g1 + 1) * (this.b2 - this.b1 + 1);
	}

	/**
	 * Gets the number of pixels in the vbox
	 * @param {boolean} force - If true, recalculate the volume even if a cached value exists
	 * @returns {number}
	 */
	count(force = false) {
		if (this.#count === undefined || force) {
			/** @type {number} */
			let num_pixels = 0;

			for (const [r, g, b] of this.#colors()) {
				num_pixels += this.histogram.sampleWithReducedColor(r, g, b);
			}

			this.#count = num_pixels;
		}
		return this.#count;
	}

	/**
	 * Creates a new VBox copy with the same dimensions and histogram
	 */
	copy() {
		return new VBox(this.r1, this.r2, this.g1, this.g2, this.b1, this.b2, this.histogram);
	}

	/**
	 * Gets the average color of the vbox
	 * @param {boolean} force
	 * @returns {import("../../utils").RGB}
	 */
	avg(force = false) {
		if (!this.#avg || force) {
			let num_total_colors = 0; //The total number of colors encountered inside the vbox
			const MULTIPLIER = 1 << right_shift; //number to multiply by to go from reduced to full bits

			let r_sum = 0;
			let g_sum = 0;
			let b_sum = 0;

			for (const [r, g, b] of this.#colors()) {
				let hval = this.histogram.sampleWithReducedColor(r, g, b);
				num_total_colors += hval;
				r_sum += hval * (r + 0.5) * MULTIPLIER;
				g_sum += hval * (g + 0.5) * MULTIPLIER;
				b_sum += hval * (b + 0.5) * MULTIPLIER;
			}

			if (num_total_colors > 0) {
				this.#avg = [
					Math.floor(r_sum / num_total_colors),
					Math.floor(g_sum / num_total_colors),
					Math.floor(b_sum / num_total_colors)
				];
			} else {
				//Empty Box
				this.#avg = [
					Math.floor((MULTIPLIER * (this.r1 + this.r2 + 1)) / 2),
					Math.floor((MULTIPLIER * (this.g1 + this.g2 + 1)) / 2),
					Math.floor((MULTIPLIER * (this.b1 + this.b2 + 1)) / 2)
				];
			}
		}
		return this.#avg;
	}

	/**
	 * @param {import("../../utils.js").RGB} pixel
	 */
	contains(pixel) {
		// Reduce the number of significant bits for each color channel.
		const r_val = pixel[0] >> right_shift;
		const g_val = pixel[1] >> right_shift;
		const b_val = pixel[2] >> right_shift;

		//See if the pixel is within the vbox
		return (
			r_val >= this.r1 &&
			r_val <= this.r2 &&
			g_val >= this.g1 &&
			g_val <= this.g2 &&
			b_val >= this.b1 &&
			b_val <= this.b2
		);
	}

	/**
	 * Iterates over all the colors in the vbox
	 * @returns {Generator<import("../../utils").RGB>}
	 */
	*#colors() {
		for (let r = this.r1; r <= this.r2; r++) {
			for (let g = this.g1; g <= this.g2; g++) {
				for (let b = this.b1; b <= this.b2; b++) {
					yield [r, g, b];
				}
			}
		}
	}
}

class ColorMap {
	/**
	 * @type {PriorityQueue<{ vbox: VBox, color: import("../../utils.js").RGB }>}
	 */
	#boxes;

	constructor() {
		this.#boxes = new PriorityQueue((a, b) => {
			return naturalOrder(a.vbox.count() * a.vbox.volume(), b.vbox.count() * b.vbox.volume());
		});
	}

	/**
	 * @param {VBox} vbox
	 */
	push(vbox) {
		this.#boxes.push({
			vbox: vbox,
			color: vbox.avg()
		});
	}

	palette() {
		return this.#boxes.map((vb) => vb.color);
	}

	size() {
		return this.#boxes.size();
	}

	/**
	 * @param {import("../../utils").RGB} color
	 */
	map(color) {
		for (const box of this.#boxes) {
			if (box.vbox.contains(color)) {
				return box.color;
			}
		}

		return this.nearest(color);
	}

	/**
	 * Iterate over all VBoxes in the color map, and find the one whose average color is closest to the given color
	 * @param {import("../../utils").RGB} color
	 */
	nearest(color) {
		let d1, d2, pColor;

		for (const vbox of this.#boxes) {
			d2 = Math.sqrt(
				Math.pow(color[0] - vbox.color[0], 2) +
					Math.pow(color[1] - vbox.color[1], 2) +
					Math.pow(color[2] - vbox.color[2], 2)
			);
			if (d1 === undefined || d2 < d1) {
				d1 = d2;
				pColor = vbox.color;
			}
		}

		return pColor;
	}
}

class Histogram {
	/** @type {number[]} */
	#histogram = new Array(1 << (3 * significant_bits));

	/**
	 * @param {Uint8ClampedArray} pixelData
	 */
	constructor(pixelData) {
		for (let i = 0; i < pixelData.length; i += 4) {
			let r_val = pixelData[i] >> right_shift;
			let g_val = pixelData[i + 1] >> right_shift;
			let b_val = pixelData[i + 2] >> right_shift;

			let index = Histogram.getColorIndex(r_val, g_val, b_val);
			this.#histogram[index] = (this.#histogram[index] ?? 0) + 1;
		}
	}

	/**
	 * @param {number} r
	 * @param {number} g
	 * @param {number} b
	 * @returns {number}
	 */
	sample(r, g, b) {
		const r_val = r >> right_shift;
		const g_val = g >> right_shift;
		const b_val = b >> right_shift;

		return this.sampleWithReducedColor(r_val, g_val, b_val);
	}

	/**
	 *
	 * @param {number} r_val
	 * @param {number} g_val
	 * @param {number} b_val
	 * @returns {number}
	 */
	sampleWithReducedColor(r_val, g_val, b_val) {
		const index = Histogram.getColorIndex(r_val, g_val, b_val);
		return this.#histogram[index] ?? 0;
	}

	/**
	 * Maps a reduced color to an index in the histogram
	 * @param {number} r_val
	 * @param {number} g_val
	 * @param {number} b_val
	 */
	static getColorIndex(r_val, g_val, b_val) {
		return (r_val << (2 * significant_bits)) + (g_val << significant_bits) + b_val;
	}
}

/**
 * Return the smallest VBox that contains all the pixels
 * @param {Uint8ClampedArray} pixelData
 * @param {Histogram} histogram
 * @returns {VBox}
 */
function vboxFromPixelData(pixelData, histogram) {
	let r_min = 1000000;
	let r_max = 0;
	let g_min = 1000000;
	let g_max = 0;
	let b_min = 1000000;
	let b_max = 0;

	for (let i = 0; i < pixelData.length; i += 4) {
		const r_val = pixelData[i] >> right_shift;
		const g_val = pixelData[i + 1] >> right_shift;
		const b_val = pixelData[i + 2] >> right_shift;

		if (r_val < r_min) r_min = r_val;
		else if (r_val > r_max) r_max = r_val;
		if (g_val < g_min) g_min = g_val;
		else if (g_val > g_max) g_max = g_val;
		if (b_val < b_min) b_min = b_val;
		else if (b_val > b_max) b_max = b_val;
	}

	return new VBox(r_min, r_max, g_min, g_max, b_min, b_max, histogram);
}

/**
 * @param {VBox} vbox
 * @param {number[]} partial_sum
 * @param {number[]} lookahead_sum
 * @param {number} total
 * @param {"r" | "g" | "b"} channel
 * @returns {[VBox, VBox]}
 */
function doCut(vbox, partial_sum, lookahead_sum, total, channel) {
	/**
	 * @typedef {`${typeof channel}1` | `${typeof channel}2`} ColorDim
	 */

	const dim1 = /** @type {ColorDim}*/ (channel + '1');
	const dim2 = /** @type {ColorDim}*/ (channel + '2');

	for (let r = vbox[dim1]; r <= vbox[dim2]; r++) {
		if (partial_sum[r] > total / 2) {
			let vbox1 = vbox.copy();
			let vbox2 = vbox.copy();
			let left = r - vbox[dim1];
			let right = vbox[dim2] - r;

			let d2,
				count2 = 0;

			if (left <= right) d2 = Math.min(vbox[dim2] - 1, ~~(r + right / 2));
			else d2 = Math.max(vbox[dim1], ~~(r - 1 - left / 2));

			// avoid 0-count boxes
			while (!partial_sum[d2]) d2++;
			count2 = lookahead_sum[d2];

			while (!count2 && partial_sum[d2 - 1]) count2 = lookahead_sum[--d2];

			// set dimensions
			vbox1[dim2] = d2;
			vbox2[dim1] = vbox1[dim2] + 1;

			return [vbox1, vbox2];
		}
	}

	throw new Error("VBox can't be cut");
}

/**
 *
 * @param {Histogram} histogram
 * @param {VBox} vbox
 * @returns { [VBox, VBox | undefined]}
 */
function medianCutApply(histogram, vbox) {
	if (!vbox.count()) return [vbox.copy(), undefined]; //Shouldn't happen

	const rw = vbox.r2 - vbox.r1 + 1;
	const gw = vbox.g2 - vbox.g1 + 1;
	const bw = vbox.b2 - vbox.b1 + 1;
	const max_channel_w = Math.max(rw, gw, bw);

	// only one pixel, no split
	if (vbox.count() == 1) {
		return [vbox.copy(), undefined];
	}

	/* Find the partial sum arrays along the selected axis. */
	let total = 0;

	/** @type {number[]} */
	const partial_sum = [];
	/** @type {number[]} */
	const lookahead_sum = [];

	if (max_channel_w == rw) {
		for (let r = vbox.r1; r <= vbox.r2; r++) {
			let sum = 0;
			for (let g = vbox.g1; g <= vbox.g2; g++) {
				for (let b = vbox.b1; b <= vbox.b2; b++) {
					sum += histogram.sampleWithReducedColor(r, g, b);
				}
			}
			total += sum;
			partial_sum[r] = total;
		}
	} else if (max_channel_w == gw) {
		for (let g = vbox.g1; g <= vbox.g2; g++) {
			let sum = 0;
			for (let r = vbox.r1; r <= vbox.r2; r++) {
				for (let b = vbox.b1; b <= vbox.b2; b++) {
					sum += histogram.sampleWithReducedColor(r, g, b);
				}
			}
			total += sum;
			partial_sum[g] = total;
		}
	} else if (max_channel_w == bw) {
		for (let b = vbox.b1; b <= vbox.b2; b++) {
			let sum = 0;
			for (let r = vbox.r1; r <= vbox.r2; r++) {
				for (let g = vbox.g1; g <= vbox.g2; g++) {
					sum += histogram.sampleWithReducedColor(r, g, b);
				}
			}
			total += sum;
			partial_sum[b] = total;
		}
	} else {
		throw new Error('Not Reached');
	}

	partial_sum.forEach(function (d, i) {
		lookahead_sum[i] = total - d;
	});

	const channel = max_channel_w == rw ? 'r' : max_channel_w == gw ? 'g' : 'b';
	return doCut(vbox, partial_sum, lookahead_sum, total, channel);
}

/**
 * @param {Uint8ClampedArray} pixelData
 * @param {number} max_colors
 * @returns {ColorMap}
 */
export default function quantize(pixelData, max_colors) {
	// Validate Inputs
	if (pixelData.length < 4 || max_colors < 2 || max_colors > 256) {
		throw new Error(
			'Invalid Arguments. There must be at least one pixel, and the max color must be between 2 and 256'
		);
	}

	const histogram = new Histogram(pixelData);

	// get the beginning vbox from the colors
	const vbox = vboxFromPixelData(pixelData, histogram);

	/**
	 * @type {PriorityQueue<VBox>}
	 */
	const pq = new PriorityQueue((a, b) => {
		return naturalOrder(a.count(), b.count());
	});

	pq.push(vbox); //Initial vbox covering all colors

	/**
	 *
	 * @param {PriorityQueue<VBox>} lh
	 * @param {number} target
	 */
	const iter = (lh, target) => {
		let num_colors = lh.size();
		let iterations = 0;

		/** @type {VBox | undefined} */
		let vbox;

		while (iterations < MAX_ITERATIONS) {
			if (num_colors >= target) return;
			if (iterations++ > MAX_ITERATIONS) {
				// console.log("infinite loop; perhaps too few pixels!");
				return;
			}
			vbox = lh.pop();
			if (!vbox || vbox.count() === 0) {
				if (vbox) lh.push(vbox);
				iterations++;
				continue;
			}
			// do the cut
			const [vbox1, vbox2] = medianCutApply(histogram, vbox);
			lh.push(vbox1);

			/* vbox2 may be null */
			if (vbox2) {
				lh.push(vbox2);
				num_colors++;
			}
		}
	};

	// first set of colors, sorted by population
	iter(pq, fractByPopulations * max_colors);

	// Re-sort by the product of pixel occupancy times the size in color space.

	/**
	 * @type {PriorityQueue<VBox>}
	 */
	const pq2 = new PriorityQueue(function (a, b) {
		return naturalOrder(a.count() * a.volume(), b.count() * b.volume());
	});

	//Transfer all the elements from pq to pq2
	while (pq.size()) {
		const vbox = pq.pop();
		if (!vbox) throw new Error('VBox is null');
		pq2.push(vbox);
	}

	// next set - generate the median cuts using the (npix * vol) sorting.
	iter(pq2, max_colors);

	const colorMap = new ColorMap();
	while (pq2.size()) {
		const vbox = pq2.pop();
		if (!vbox) throw new Error('VBox is null');
		colorMap.push(vbox);
	}
	return colorMap;
}
