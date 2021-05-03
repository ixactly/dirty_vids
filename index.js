const cameraSize = { w: 360, h: 240 };
const canvasSize = { w: 360, h: 240 };
const resolution = { w: 1080, h: 720 };
let video;
let media;
let canvas;
let ctx;
const VIDEO_WIDTH = 720;
const VIDEO_HEIGHT = 480;
function isMobile() {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    return isAndroid || isiOS;
};
const mobile = isMobile();

// video要素にWebカメラの映像を表示させる
let videoWidth, videoHeight;

async function setupCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
            'Browser API navigator.mediaDevices.getUserMedia not available');
    }

    const video = document.getElementById('video');
    const stream = await navigator.mediaDevices.getUserMedia({
        'audio': false,
        'video': {
            facingMode: 'user',
            // Only setting the video to a specified size in order to accommodate a
            // point cloud, so on mobile devices accept the default size.
            width: mobile ? undefined : VIDEO_WIDTH,
            height: mobile ? undefined : VIDEO_HEIGHT
        },
    });
    video.srcObject = stream;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

async function loadVideo() {
    const video = await setupCamera();
    video.play();
    return video;
}

let model;
async function main() {
    console.log('run main');
    let video;
    try {
        video = await loadVideo();
    } catch (e) {
        let info = document.getElementById('info');
        info.textContent = e.message;
        info.style.display = 'block';
        throw e;
    }
    canvas = document.getElementById('canvas');
    videoWidth = video.videoWidth;
    videoHeight = video.videoHeight;

    canvas.width = videoWidth;
    canvas.height = videoHeight;
    video.width = videoWidth;
    video.height = videoHeight;

    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, videoWidth, videoHeight);
    ctx.strokeStyle = 'red';
    ctx.fillStyle = 'red';

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    // Load the MediaPipe handpose model.
    model = await handpose.load();

    // Pass in a video stream (or an image, canvas, or 3D tensor) to obtain a
    // hand prediction from the MediaPipe graph.
    Landmarker(video);
}

const Landmarker = async (video) => {
    async function frameLandmarks() {
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight, 0, 0, canvas.width, canvas.height);
        const predictions = await model.estimateHands(video);
        if (predictions.length > 0) {
            const keypoints = predictions[0].landmarks; // No.8 is index_finger_tip

            // Log hand keypoints.
            const [x, y, z] = keypoints[8];
            console.log(`index_finger_tip: [${x}, ${y}, ${z}]`);

        }
        requestAnimationFrame(frameLandmarks);
    };
    frameLandmarks();
};

// video要素の映像をcanvasに描画する
/*
_canvasUpdate();

function _canvasUpdate() {
    canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
    requestAnimationFrame(_canvasUpdate);
};
*/

main();