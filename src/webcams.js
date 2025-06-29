
class Webcams {

	#video_element
	#devices

	constructor() {

		this.#video_element = null
		this.#devices = []
	}

	init() {

		this.#video_element = document.createElement("video")
		this.#video_element.setAttribute("autoplay", true)
		this.#video_element.setAttribute("id", "webcam")
		this.#video_element.setAttribute("hidden", true)
		document.getElementsByTagName("body")[0].appendChild(this.#video_element)

		this.#devices = []
		return this
	}

    deinit() {
        // todo: should stop streaming and remove video_elem
    }

	enumerate_devices() {

		return new Promise((resolve, reject) => {
			navigator.mediaDevices.enumerateDevices()
				.then(devices => {
					this.#devices = devices
					resolve(devices)
				})
				.catch(err => reject(err))
		})
	}

	stream() {

		const constraints = {
			// audio: { deviceId: {exact: this._devices[1].deviceId} },
			// video: { deviceId: {exact: device_id} }
			video: true
		};

		return new Promise((resolve, reject) => {
			navigator.mediaDevices.getUserMedia(constraints)
				.then(stream => {
					this.#video_element.srcObject = stream
					this.#video_element.onloadedmetadata = function(e) { resolve(stream) }
				})
				.catch(err => reject(err))
		})
	}
}