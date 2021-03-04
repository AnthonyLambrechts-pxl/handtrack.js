
const video = document.getElementById("myvideo");
// video.style.visibility = "hidden";
const handimg = document.getElementById("handimage");
const canvas = document.getElementById("canvas");
// canvas.style.visibility = "hidden";
const context = canvas.getContext("2d");
let trackButton = document.getElementById("trackbutton");
let nextImageButton = document.getElementById("nextimagebutton");
let updateNote = document.getElementById("updatenote");



let imgindex = 1
let isVideo = false;
let model = null;

var cursor = document.getElementById("cursor");
var mutex = false;
var x, y;
var px, py;
px = py = 0;
var hoverButton = document.getElementById("hoverButton");
var buttonValues = hoverButton.getBoundingClientRect();
var buttonX,  buttonY;
buttonX = hoverButton.getBoundingClientRect().x;
buttonY = hoverButton.getBoundingClientRect().y;


// var tmp = document.elementFromPoint(x + px, y + py);
// mutex = true;
// tmp.click();
// cursor.style.left = (px + x) + "px";
// cursor.style.top = (py + y) + "px";


// video.width = 500
// video.height = 400

const modelParams = {
    flipHorizontal: true,   // flip e.g for video  
    maxNumBoxes: 2,        // maximum number of boxes to detect
    iouThreshold: 0.5,      // ioU threshold for non-max suppression
    scoreThreshold: 0.6,    // confidence threshold for predictions.
}

function startVideo() {
    handTrack.startVideo(video).then(function (status) {
        console.log("video started", status);
        if (status) {
            navigator.getUserMedia({video:{}},
                stream => {
                video.srcObject = stream;
                // updateNote.innerText = "Video started. Now tracking"
                // isVideo = true
                setInterval(runDetection, 10);
                },
                err => console.log(err)
            );

            // runDetection()
        } else {
            updateNote.innerText = "Please enable video"
        }
    });
}

function toggleVideo() {
    if (!isVideo) {
        updateNote.innerText = "Starting video"
        startVideo()
    } else {
        updateNote.innerText = "Stopping video"
        handTrack.stopVideo(video)
        isVideo = false;
        updateNote.innerText = "Video stopped"
    }
}



nextImageButton.addEventListener("click", function(){
    nextImage();
});

trackButton.addEventListener("click", function(){
    toggleVideo();
});

function nextImage() {

    imgindex++;
    handimg.src = "images/" + imgindex % 15 + ".jpg"
    // alert(handimg.src)
    runDetectionImage(handimg)
}

var cursorX, cursorY = 0;
var count = 0;

function runDetection() {
    model.detect(video).then(predictions => {
        // console.log("Predictions: ", predictions);
        if(predictions[0] !== undefined) {
            cursor.style.display = "block";
            cursorX = predictions[0].bbox[0]*3;
            cursorY = predictions[0].bbox[1]*3;
            // if ((cursorX < buttonX + 30 && cursorX > buttonX - 30) && (cursorY < buttonY + 30 && cursorY > buttonX - 30)) {
            //     console.log("wow button interactie");
            // }

            dateAsyncCall(hoverButton, cursor, timeNow);


            cursor.style.left = (px + cursorX) + "px";
            cursor.style.top = (py + cursorY) + "px";
        } else {
            cursor.style.display = "none";
        }

        model.renderPredictions(predictions, canvas, context, video);
        if (isVideo) {
            // console.log("dit is een model" + model);

            requestAnimationFrame(runDetection);
        }
    });
}

doElsCollide = function(hoverButton, cursor) {
    hoverButton.offsetBottom = hoverButton.offsetTop + hoverButton.offsetHeight;
    hoverButton.offsetRight = hoverButton.offsetLeft + hoverButton.offsetWidth;
    cursor.offsetBottom = cursor.offsetTop + cursor.offsetHeight;
    cursor.offsetRight = cursor.offsetLeft + cursor.offsetWidth;
    return !((hoverButton.offsetBottom < cursor.offsetTop) ||
        (hoverButton.offsetTop > cursor.offsetBottom) ||
        (hoverButton.offsetRight < cursor.offsetLeft) ||
        (hoverButton.offsetLeft > cursor.offsetRight))
};

// function counter(number) {
//     return new Promise(resolve => {
//         setTimeout(() => {
//             number++;
//             console.log(number);
//             resolve(number);
//             }
//         , 2000);
//     });
// }
// var executed = false;
//
// async function asyncCall() {
//     while(doElsCollide(hoverButton, cursor)){
//         if (count === 1 && executed === false){
//             console.log("wow dat was lang");
//             changeColor();
//         } else {
//             count = await counter(count);
//         }
//     }
//     executed = false;
//     count = 0;
// }
//
// function changeColor(){
//     if (!executed) {
//         var colors = ["blue", "pink", "red"];
//         document.body.style.backgroundColor = colors[Math.floor(Math.random()*3)];
//         executed = true;
//     }
// }

function counter(timeNow) {
    return new Promise(resolve => {
        console.log(Math.abs(Date.now() - timeNow))
    });
}
var executed = false;

async function dateAsyncCall(hoverButton, cursor, timeNow) {
    while(doElsCollide(hoverButton, cursor)){
        let timeNow = Date.now();
        await counter(timeNow);
        console.log("colliding");
    }
}

function runDetectionImage(img) {
    model.detect(img).then(predictions => {
        console.log("Predictions: ", predictions);
        model.renderPredictions(predictions, canvas, context, img);
    });
}

// Load the model.
handTrack.load(modelParams).then(lmodel => {
    // detect objects in the image.
    model = lmodel
    updateNote.innerText = "Loaded Model!"
    runDetectionImage(handimg)
    trackButton.disabled = false
    nextImageButton.disabled = false
});
