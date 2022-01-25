	const eyeThresh = 0.65;
	const eyeOpenThresh = 0.35;
	const sWidth = 900;
	const sHeight = 720;
	const videoElement = document.getElementsByClassName('input_video')[0];
	const canvasElement = document.getElementsByClassName('output_canvas')[0];
	const canvasCtx = canvasElement.getContext('2d');
	const rCtx = document.getElementsByClassName('reye_canvas')[0].getContext('2d');
	const lCtx = document.getElementsByClassName('leye_canvas')[0].getContext('2d');

	let startTime = new Date().getTime();
	let endTime;

	let isSurveying = false;
	let isAnswering = false;
	let surveyRecord = {};
	let currentQuestionID = 0;
	let answerStartTime = new Date().getTime();
	let answerMilliSecond = 0


	let rOQueue = ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
	    lOQueue = ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"];
	let rDQueue = ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
	    lDQueue = ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"];

	let questionNumberDOM = document.getElementById("current-question")
	let questionButtonDOM = document.getElementById("question-button")
	let answerStatusDOM = document.getElementById("answer-status")
	let questionListDOM = document.getElementById("question-list")
	let surveyResultDOM = document.getElementById("survey-result-container")

	function onResults(results) {
	    canvasCtx.save();
	    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
	    canvasCtx.drawImage(
	        results.image, 0, 0, canvasElement.width, canvasElement.height);
	    if (results.multiFaceLandmarks) {
	        for (const landmarks of results.multiFaceLandmarks) {
	            let rEye = landmarks && FACEMESH_RIGHT_EYE;
	            let lEye = landmarks && FACEMESH_LEFT_EYE;
	            let rIris = landmarks && FACEMESH_RIGHT_IRIS;
	            let lIris = landmarks && FACEMESH_LEFT_IRIS;
	            let rCenter, lCenter;
	            let rP, lP;
	            let rT, lT;
	            let rOpen, lOpen;
	            let rEyeStatus, lEyeStatus;

	            // console.log("rEye", rEye);
	            // console.log("lEye", lEye);
	            //eye
	            // for(let i = 0; i < rEye.length; ++i){
	            // 	drawPoint(landmarks[rEye[i][0]], 0);
	            // 	drawPoint(landmarks[lEye[i][0]], 0);
	            // }
	            //right eye point
	            // drawPoint(landmarks[155], 0);
	            // drawPoint(landmarks[246], 0);
	            // //left eye point
	            // drawPoint(landmarks[362], 0);
	            // drawPoint(landmarks[466], 0);
	            // //right bottom top point
	            // drawPoint(landmarks[145], 0);
	            // drawPoint(landmarks[159], 0);
	            // //left bottom top point
	            // drawPoint(landmarks[374], 0);
	            // drawPoint(landmarks[386], 0);

	            //iris
	            // for(let i = 0; i < rIris.length; ++i){
	            // 	drawPoint(landmarks[rIris[i][0]], 1);
	            // 	drawPoint(landmarks[lIris[i][0]], 1);
	            // }

	            //iris center
	            rCenter = drawCenter([landmarks[rIris[0][0]], landmarks[rIris[2][0]]]);
	            lCenter = drawCenter([landmarks[lIris[0][0]], landmarks[lIris[2][0]]]);

	            //cul distance & draw	P center = 0.6 ~ 1.4
	            rP = pointDistance(landmarks[155], rCenter) / pointDistance(landmarks[246], rCenter);
	            lP = pointDistance(landmarks[466], lCenter) / pointDistance(landmarks[362], lCenter);

	            //eye is open/close   T center = 0.35
	            rT = pointDistance(landmarks[145], landmarks[159]) / pointDistance(landmarks[145], landmarks[155]);
	            lT = pointDistance(landmarks[374], landmarks[386]) / pointDistance(landmarks[374], landmarks[362]);
	            console.log();

	            //logic
	            //--eye open/close
	            (rT > eyeOpenThresh) ? rOpen = "O": rOpen = "C";
	            (lT > eyeOpenThresh) ? lOpen = "O": lOpen = "C";
	            //--eye to left/right
	            if (rP < eyeThresh) {
	                rEyeStatus = "L";
	            } else if (rP > (2 - eyeThresh)) {
	                rEyeStatus = "R";
	            } else {
	                rEyeStatus = "C";
	            }
	            if (lP < eyeThresh) {
	                lEyeStatus = "L";
	            } else if (lP > (2 - eyeThresh)) {
	                lEyeStatus = "R";
	            } else {
	                lEyeStatus = "C";
	            }

	            //draw canvas
	            canvasCtx.font = "30px Arial";
	            // canvasCtx.fillText(rP.toFixed(3), 300, 100);
	            // canvasCtx.fillText(lP.toFixed(3), 600, 100);
	            // canvasCtx.fillText(rT.toFixed(3), 300, 200);
	            // canvasCtx.fillText(lT.toFixed(3), 600, 200);
	            // canvasCtx.fillText(rEyeStatus, 300, 100);
	            // canvasCtx.fillText(lEyeStatus, 600, 100);
	            // canvasCtx.fillText(rOpen, 300, 200);
	            // canvasCtx.fillText(lOpen, 600, 200);

	            //cut eye canvas
	            let rD = pointDistance(landmarks[155], landmarks[246]);
	            let lD = pointDistance(landmarks[466], landmarks[362]);

	            //timer
	            endTime = new Date().getTime();
	            if (endTime - startTime >= 100) {
	                //right canvas
	                rCtx.drawImage(results.image,
	                    landmarks[246].x * sWidth - rD * 0.5,
	                    landmarks[246].y * sHeight - rD * 0.5,
	                    100,
	                    60,
	                    0,
	                    0,
	                    100,
	                    60);
	                //left canvas
	                lCtx.drawImage(results.image,
	                    landmarks[362].x * sWidth - lD * 0.5,
	                    landmarks[362].y * sHeight - lD * 0.5,
	                    100,
	                    60,
	                    0,
	                    0,
	                    100,
	                    60);

	                //queue
	                //--right eye
	                queueOperation(rOQueue, rOpen);
	                queueOperation(rDQueue, rEyeStatus);
	                //--left eye
	                queueOperation(lOQueue, lOpen);
	                queueOperation(lDQueue, lEyeStatus);

	                updateEyeTable(lOQueue, lDQueue, rOQueue, rDQueue)

	                // console.log("rP : ", rP.toFixed(3));
	                // console.log("lP : ", lP.toFixed(3));
	                // console.log("rT : ", rT.toFixed(3));
	                // console.log("lT : ", lT.toFixed(3));
	                // console.log("rEye : ", rEyeStatus);
	                // console.log("lEye : ", lEyeStatus);
	                // console.log("eyeOpen : ", rOpen & lOpen);
	                // console.log("--------------------");
	                startTime = endTime;

	                if (isSurveying) {
	                    if (isAnswering) {
	                        // console.log("isAnswering")
	                        answerMilliSecond += 1
	                        updateEyeRecord(answerMilliSecond, lOpen, rOpen, lEyeStatus, rEyeStatus);
	                        answerStatusDOM.innerHTML = `${answerMilliSecond/10} sec`
	                        console.log(surveyRecord)
	                    } else {

	                    }
	                }
	            }


	            // drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION,
	            // 				{color: '#C0C0C070', lineWidth: 1});
	            // drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, {color: '#000000'});
	            // drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, {color: '#FF3030'});
	            // drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_IRIS, {color: '#FF3030'});
	            // drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, {color: '#000000'});
	            // drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, {color: '#30FF30'});
	            // drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_IRIS, {color: '#FF3030'});
	            // drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {color: '#E0E0E0'});
	            // drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, {color: '#E0E0E0'});
	        }
	    }
	    canvasCtx.restore();
	}

	//face mesh
	const faceMesh = new FaceMesh({
	    locateFile: (file) => {
	        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
	    }
	});
	faceMesh.setOptions({
	    maxNumFaces: 1,
	    refineLandmarks: true,
	    minDetectionConfidence: 0.5,
	    minTrackingConfidence: 0.5
	});
	faceMesh.onResults(onResults);

	//camera
	const camera = new Camera(videoElement, {
	    onFrame: async() => {
	        await faceMesh.send({ image: videoElement });
	    },
	    width: sWidth,
	    height: sHeight
	});
	camera.start();

	//draw
	function drawPoint(point, type) {
	    if (type == 0) { //eye
	        canvasCtx.fillStyle = "#00BFFF";
	        canvasCtx.fillRect(point.x * sWidth, point.y * sHeight, 2, 2);
	    } else { //iris
	        canvasCtx.fillStyle = "#FF0000";
	        canvasCtx.fillRect(point.x * sWidth, point.y * sHeight, 2, 2);
	    }
	}

	function drawCenter(points) {
	    let pointX, pointY;
	    let tempX, tempY;
	    let rX, rY;

	    (points[0].x > points[1].x) ? tempX = points[1].x: tempX = points[0].x;
	    (points[0].y > points[1].y) ? tempY = points[1].y: tempY = points[0].y;

	    rX = Math.abs(points[0].x - points[1].x) * sWidth / 2;
	    rY = Math.abs(points[0].y - points[1].y) * sHeight / 2;
	    pointX = rX + tempX * sWidth;
	    pointY = rY + tempY * sHeight;

	    //draw circle
	    let pointXY;
	    pointXY = Math.sqrt(rX * rX + rY * rY);

	    //1.0
	    canvasCtx.fillStyle = "#CD0000";
	    canvasCtx.fillRect(pointX, pointY, 2, 2);

	    canvasCtx.beginPath();
	    canvasCtx.arc(pointX, pointY, pointXY, 0, 2 * Math.PI);
	    canvasCtx.strokeStyle = "#CD0000";
	    canvasCtx.stroke();

	    canvasCtx.beginPath();
	    canvasCtx.arc(pointX, pointY, pointXY / 5, 0, 2 * Math.PI);
	    canvasCtx.fillStyle = "#CD0000";
	    canvasCtx.fill();

	    return { x: (Math.abs(points[0].x - points[1].x) / 2) + tempX, y: (Math.abs(points[0].y - points[1].y) / 2) + tempY };
	}

	//point distance
	function pointDistance(point1, point2) {
	    let x, y, r;
	    x = Math.abs(point1.x - point2.x) * sWidth;
	    y = Math.abs(point1.y - point2.y) * sHeight;
	    r = Math.sqrt(x * x + y * y);
	    return r;
	}

	function queueOperation(queue, value) {
	    if (queue.length < 20) {
	        queue.push(value);
	    } else if (queue.length == 20) {
	        queue.shift();
	        queue.push(value);
	    }
	    // console.log(queue);
	}

	function updateEyeTable(lOQueue, lDQueue, rOQueue, rDQueue) {
	    document.getElementById("left-eye-table").innerHTML = `
	        <table>
	        <tr>
	            <td>${lOQueue[0]}</td>
	            <td>${lOQueue[1]}</td>
	            <td>${lOQueue[2]}</td>
	            <td>${lOQueue[3]}</td>
	            <td>${lOQueue[4]}</td>
	            <td>${lOQueue[5]}</td>
	            <td>${lOQueue[6]}</td>
	            <td>${lOQueue[7]}</td>
	            <td>${lOQueue[8]}</td>
	            <td>${lOQueue[9]}</td>
                <td>${lOQueue[10]}</td>
	            <td>${lOQueue[11]}</td>
	            <td>${lOQueue[12]}</td>
	            <td>${lOQueue[13]}</td>
	            <td>${lOQueue[14]}</td>
	            <td>${lOQueue[15]}</td>
	            <td>${lOQueue[16]}</td>
	            <td>${lOQueue[17]}</td>
	            <td>${lOQueue[18]}</td>
	            <td>${lOQueue[19]}</td>
	        </tr>
	        <tr>
	            <td>${lDQueue[0]}</td>
	            <td>${lDQueue[1]}</td>
	            <td>${lDQueue[2]}</td>
	            <td>${lDQueue[3]}</td>
	            <td>${lDQueue[4]}</td>
	            <td>${lDQueue[5]}</td>
	            <td>${lDQueue[6]}</td>
	            <td>${lDQueue[7]}</td>
	            <td>${lDQueue[8]}</td>
	            <td>${lDQueue[9]}</td>
                <td>${lDQueue[10]}</td>
	            <td>${lDQueue[11]}</td>
	            <td>${lDQueue[12]}</td>
	            <td>${lDQueue[13]}</td>
	            <td>${lDQueue[14]}</td>
	            <td>${lDQueue[15]}</td>
	            <td>${lDQueue[16]}</td>
	            <td>${lDQueue[17]}</td>
	            <td>${lDQueue[18]}</td>
	            <td>${lDQueue[19]}</td>
	        </tr>
	    </table>
	        `
	    document.getElementById("right-eye-table").innerHTML = `
	        <table>
	        <tr>
	            <td>${rOQueue[0]}</td>
	            <td>${rOQueue[1]}</td>
	            <td>${rOQueue[2]}</td>
	            <td>${rOQueue[3]}</td>
	            <td>${rOQueue[4]}</td>
	            <td>${rOQueue[5]}</td>
	            <td>${rOQueue[6]}</td>
	            <td>${rOQueue[7]}</td>
	            <td>${rOQueue[8]}</td>
	            <td>${rOQueue[9]}</td>
                <td>${rOQueue[10]}</td>
	            <td>${rOQueue[11]}</td>
	            <td>${rOQueue[12]}</td>
	            <td>${rOQueue[13]}</td>
	            <td>${rOQueue[14]}</td>
	            <td>${rOQueue[15]}</td>
	            <td>${rOQueue[16]}</td>
	            <td>${rOQueue[17]}</td>
	            <td>${rOQueue[18]}</td>
	            <td>${rOQueue[19]}</td>
	        </tr>
	        <tr>
	            <td>${rDQueue[0]}</td>
	            <td>${rDQueue[1]}</td>
	            <td>${rDQueue[2]}</td>
	            <td>${rDQueue[3]}</td>
	            <td>${rDQueue[4]}</td>
	            <td>${rDQueue[5]}</td>
	            <td>${rDQueue[6]}</td>
	            <td>${rDQueue[7]}</td>
	            <td>${rDQueue[8]}</td>
	            <td>${rDQueue[9]}</td>
                <td>${rDQueue[10]}</td>
	            <td>${rDQueue[11]}</td>
	            <td>${rDQueue[12]}</td>
	            <td>${rDQueue[13]}</td>
	            <td>${rDQueue[14]}</td>
	            <td>${rDQueue[15]}</td>
	            <td>${rDQueue[16]}</td>
	            <td>${rDQueue[17]}</td>
	            <td>${rDQueue[18]}</td>
	            <td>${rDQueue[19]}</td>
	        </tr>
	    </table>
	        `
	}


	function startSurveying() {
	    isSurveying = true;
	    isAnswering = true;
	    currentQuestionID += 1
	    questionNumberDOM.innerHTML = `Question ${currentQuestionID}`
	    questionButtonDOM.innerHTML = `<button type="button" id="stop-answering" class="button-33 answering"">Stop</button>`;
	    document.getElementById("stop-answering").addEventListener("click", stopAnswering)
	    surveyRecord[currentQuestionID.toString()] = {}


	}

	function startAnswering() {
	    isAnswering = true;
	    currentQuestionID += 1
	    questionNumberDOM.innerHTML = `Question ${currentQuestionID}`
	    questionButtonDOM.innerHTML = `<button type="button" id="stop-answering" class="button-33 answering"">Stop</button>`;
	    document.getElementById("stop-answering").addEventListener("click", stopAnswering)
	    surveyRecord[currentQuestionID.toString()] = {}

	}

	function stopAnswering() {
	    isAnswering = false;
	    answerMilliSecond = 0
	    console.log("stopAnswering")
	    questionButtonDOM.innerHTML = `
        <button type="button" id="start-answering" class="button-33">Start</button>
        <button type="button" id="finish-survey" class="button-33">Finish</button>
        `
	    document.getElementById("start-answering").addEventListener("click", startSurveying)
	    questionNumberDOM.innerHTML = `Question ${currentQuestionID+1}`
	    answerStatusDOM.innerHTML = `Waiting`
	    questionListDOM.innerHTML += `<div id="question-${currentQuestionID+1}" class="question-id answering-question-id" sty>${currentQuestionID+1}</div>`
	    document.getElementById(`question-${currentQuestionID}`).classList.remove("answering-question-id")
	    document.getElementById("finish-survey").addEventListener("click", finishSurvey)

	}

	function finishSurvey() {
	    isSurveying = false;
	    document.getElementById("blur-div").classList = "show-blur"
	    for (const questionID in surveyRecord) {
	        if (surveyRecord.hasOwnProperty(questionID)) {
	            for (const second in surveyRecord[questionID]) {
	                if (surveyRecord[questionID].hasOwnProperty(second)) {
	                    console.log(surveyRecord[questionID][second])
	                }
	            }
	        }
	    }
	    surveyResultDOM = `

        `
	}

	function updateEyeRecord(answerMilliSecond, lOpen, rOpen, lEyeStatus, rEyeStatus) {
	    let second = (answerMilliSecond / 10).toString()
	    surveyRecord[currentQuestionID.toString()][second] = [lOpen, rOpen, lEyeStatus, rEyeStatus]
	}

	document.getElementById("start-answering").addEventListener("click", startSurveying)