import { TypedEventTarget } from 'typescript-event-target';
import PointerTracker from 'pointer-tracker';

/**
 * @typedef {CustomEvent<{ x: number, y: number, scale: number, matrix : DOMMatrix }>} TransformChangeEvent
 */

/**
 * @typedef {{ 'panzoom:change': TransformChangeEvent }} PanzoomEventMap
 */

/**
 * @typedef {{ clientX : number; clientY: number }} Point
 */

/**
 * @typedef {{
 *  panX?: number;
 *   panY?: number;
 *   scaleDiff?: number;
 *   originX?: number;
 *   originY?: number;
 * }} ApplyChangeOpts
 */

/**
 * @param {Point} a
 * @param {Point | undefined} b
 * @returns {number}
 */
function getDistance(a, b = undefined) {
	if (!b) return 0;
	return Math.sqrt((b.clientX - a.clientX) ** 2 + (b.clientY - a.clientY) ** 2);
}

/**
 * @param {Point} a
 * @param {Point | undefined} b
 * @returns {Point}
 */
function getMidpoint(a, b = undefined) {
	if (!b) return a;

	return {
		clientX: (a.clientX + b.clientX) / 2,
		clientY: (a.clientY + b.clientY) / 2
	};
}

/**
 * @class Panzoom
 * @extends {TypedEventTarget<PanzoomEventMap>}
 */
export class Panzoom extends TypedEventTarget {
	static MIN_SCALE = 0.01;
	static MAX_SCALE = 100_000;

	/**
	 * @type {HTMLElement}
	 */
	#element;

	/**
	 * @type {DOMMatrix}
	 */
	#transform = new DOMMatrix();

	/**
	 * @type {PointerTracker}
	 */
	#pointerTracker;

	get x() {
		return this.#transform.e;
	}

	get y() {
		return this.#transform.f;
	}

	get scale() {
		return this.#transform.a;
	}

	/**
	 * @param {number} x
	 */
	set x(x) {
		this.#transform.e = x;
	}

	/**
	 * @param {number} y
	 */
	set y(y) {
		this.#transform.f = y;
	}

	/**
	 * @param {number} scale
	 */
	set scale(scale) {
		this.#transform.a = scale;
		this.#transform.d = scale;
	}

	/**
	 * @param {HTMLElement} element
	 */
	constructor(element) {
		super();
		this.#element = element;

		this.#element.addEventListener('wheel', this.#onWheel.bind(this));

		// Watch for pointers
		this.#pointerTracker = new PointerTracker(this.#element, {
			start: (pointer, event) => {
				// We only want to track 2 pointers at most
				if (this.#pointerTracker.currentPointers.length === 2) {
					return false;
				}

				event.preventDefault();
				return true;
			},
			move: (previousPointers) => {
				this.#onPointerMove(previousPointers, this.#pointerTracker.currentPointers);
			},

			avoidPointerEvents: this.#isSafari()
		});

		this.#element.addEventListener('wheel', this.#onWheel.bind(this));
	}

	/**
	 *
	 * @param {WheelEvent} event
	 */
	#onWheel(event) {
		event.preventDefault();

		const currentBoundingBox = this.#element.getBoundingClientRect();

		let { deltaY } = event;
		const { ctrlKey, deltaMode } = event;

		if (deltaMode === 1) {
			// 1 is "lines", 0 is "pixels"
			// Firefox uses "lines" for some types of mouse
			deltaY *= 15;
		}

		const zoomingOut = deltaY > 0;

		// ctrlKey is true when pinch-zooming on a trackpad.
		const divisor = ctrlKey ? 100 : 300;
		// when zooming out, invert the delta and the ratio to keep zoom stable
		const ratio = 1 - (zoomingOut ? -deltaY : deltaY) / divisor;
		const scaleDiff = zoomingOut ? 1 / ratio : ratio;

		const originX = event.clientX - currentBoundingBox.left;
		const originY = event.clientY - currentBoundingBox.top;

		this.#applyTransformation({
			scaleDiff,
			originX,
			originY
		});
	}

	/**
	 * @param {ApplyChangeOpts} opts
	 */
	#applyTransformation(opts = {}) {
		const { panX = 0, panY = 0, originX = 0, originY = 0, scaleDiff: scaleFactor = 1 } = opts;

		// Create a new matrix with the desired scale & translation.
		const scaleTransform = new DOMMatrix()
			// Translate according to panning.
			//.translate(panX, panY)
			// Scale about the origin.
			.translate(originX, originY)
			.scale(scaleFactor)
			.translate(-originX, -originY);

		const panTransform = new DOMMatrix().translate(panX, panY);

		scaleTransform.multiplySelf(panTransform);
		scaleTransform.multiplySelf(this.#transform);

		const scale = scaleTransform.a;
		const x = scaleTransform.e;
		const y = scaleTransform.f;

		// Convert the transform into basic translate & scale.
		this.#updateTransform(scale, x, y);
	}

	/**
	 *
	 * @param {import("pointer-tracker/dist/index.d.ts").Pointer[]} previousPointers
	 * @param {import("pointer-tracker/dist/index.d.ts").Pointer[]} currentPointers
	 */
	#onPointerMove(previousPointers, currentPointers) {
		// Combine next points with previous points
		const currentRect = this.#element.getBoundingClientRect();

		// For calculating panning movement
		const prevMidpoint = getMidpoint(previousPointers[0], previousPointers[1]);
		const newMidpoint = getMidpoint(currentPointers[0], currentPointers[1]);

		// Midpoint within the element
		const originX = prevMidpoint.clientX - currentRect.left;
		const originY = prevMidpoint.clientY - currentRect.top;

		// Calculate the desired change in scale
		const prevDistance = getDistance(previousPointers[0], previousPointers[1]);
		const newDistance = getDistance(currentPointers[0], currentPointers[1]);
		const scaleDiff = prevDistance ? newDistance / prevDistance : 1;

		this.#applyTransformation({
			originX,
			originY,
			scaleDiff,
			panX: newMidpoint.clientX - prevMidpoint.clientX,
			panY: newMidpoint.clientY - prevMidpoint.clientY
		});
	}

	/**
	 *
	 * @param {number} scale
	 * @param {number} x
	 * @param {number} y
	 */
	#updateTransform(scale, x, y) {
		if (scale < Panzoom.MIN_SCALE || scale > Panzoom.MAX_SCALE) return;

		// Return if there's no change
		if (scale === this.scale && x === this.x && y === this.y) return;

		this.x = x;
		this.y = y;
		this.scale = scale;

		//Dispatch change event
		/**
		 * @type {TransformChangeEvent}
		 */
		const event = new CustomEvent('panzoom:change', {
			bubbles: true,
			detail: {
				x: this.x,
				y: this.y,
				scale: this.scale,
				matrix: this.#transform
			}
		});
		this.dispatchTypedEvent('panzoom:change', event);
	}

	/**
	 * @returns {boolean}
	 */
	#isSafari() {
		const isSafari =
			/Safari\//.test(navigator.userAgent) && !/Chrom(e|ium)\//.test(navigator.userAgent);
		return isSafari;
	}

	reset() {
		this.#updateTransform(1, 0, 0);
	}

	/**
	 * Remove all _internal_ event listeners and cleanup.
	 *
	 * You still have to remove your own event listeners from the panzoom instance.
	 */
	destroy() {
		this.#pointerTracker.stop();
	}
}
