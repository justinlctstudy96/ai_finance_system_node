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


	let rOQueue = ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
	    lOQueue = ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"];
	let rDQueue = ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
	    lDQueue = ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"];

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
	        if (results.multiFaceLandmarks.length == 0) {
	            document.getElementsByClassName("eyerecord-container")[0].classList.add("detecting")
	            document.getElementsByClassName("eyerecord-container")[1].classList.add("detecting")
	            document.getElementById("eyeleft").innerHTML = `<div style="color:rgb(120, 223, 255);">Detecting...</div>`
	            document.getElementById("eyeright").innerHTML = `<div style="color:rgb(120, 223, 255);">Detecting...</div>`
	        } else {
	            document.getElementsByClassName("eyerecord-container")[0].classList.remove("detecting")
	            document.getElementsByClassName("eyerecord-container")[1].classList.remove("detecting")
	            document.getElementById("eyeleft").innerHTML = ("Left")
	            document.getElementById("eyeright").innerHTML = ("Right")
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

	                    updateEyeTable((answerMilliSecond / 10).toFixed(1), lOQueue, lDQueue, rOQueue, rDQueue)

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
	    if (queue.length < 10) {
	        queue.push(value);
	    } else if (queue.length == 10) {
	        queue.shift();
	        queue.push(value);
	    }
	}

	function updateEyeTable(second, lOQueue, lDQueue, rOQueue, rDQueue) {
	    document.getElementById("left-eye-table").innerHTML = `
	        <table>
            <tr>
                <td>${(second-1)<0?"-":(second-1).toFixed(1)}</td>
	            <td>${(second-0.9)<0?"-":(second-0.9).toFixed(1)}</td>
	            <td>${(second-0.8)<0?"-":(second-0.8).toFixed(1)}</td>
	            <td>${(second-0.7)<0?"-":(second-0.7).toFixed(1)}</td>
	            <td>${(second-0.6)<0?"-":(second-0.6).toFixed(1)}</td>
	            <td>${(second-0.5)<0?"-":(second-0.5).toFixed(1)}</td>
	            <td>${(second-0.4)<0?"-":(second-0.4).toFixed(1)}</td>
	            <td>${(second-0.3)<0?"-":(second-0.3).toFixed(1)}</td>
	            <td>${(second-0.2)<0?"-":(second-0.2).toFixed(1)}</td>
	            <td>${(second-0.1)<0?"-":(second-0.1).toFixed(1)}</td>
	        </tr>
	        <tr>
	            <td>${lOQueue[0]=="O"?lDQueue[0]:"X"}</td>
	            <td>${lOQueue[1]=="O"?lDQueue[1]:"X"}</td>
	            <td>${lOQueue[2]=="O"?lDQueue[2]:"X"}</td>
	            <td>${lOQueue[3]=="O"?lDQueue[3]:"X"}</td>
	            <td>${lOQueue[4]=="O"?lDQueue[4]:"X"}</td>
	            <td>${lOQueue[5]=="O"?lDQueue[5]:"X"}</td>
	            <td>${lOQueue[6]=="O"?lDQueue[6]:"X"}</td>
	            <td>${lOQueue[7]=="O"?lDQueue[7]:"X"}</td>
	            <td>${lOQueue[8]=="O"?lDQueue[8]:"X"}</td>
	            <td>${lOQueue[9]=="O"?lDQueue[9]:"X"}</td>
	        </tr>
	    </table>
	        `
	    document.getElementById("right-eye-table").innerHTML = `
	        <table>
            <tr>
                <td>${(second-1)<0?"-":(second-1).toFixed(1)}</td>
	            <td>${(second-0.9)<0?"-":(second-0.9).toFixed(1)}</td>
	            <td>${(second-0.8)<0?"-":(second-0.8).toFixed(1)}</td>
	            <td>${(second-0.7)<0?"-":(second-0.7).toFixed(1)}</td>
	            <td>${(second-0.6)<0?"-":(second-0.6).toFixed(1)}</td>
	            <td>${(second-0.5)<0?"-":(second-0.5).toFixed(1)}</td>
	            <td>${(second-0.4)<0?"-":(second-0.4).toFixed(1)}</td>
	            <td>${(second-0.3)<0?"-":(second-0.3).toFixed(1)}</td>
	            <td>${(second-0.2)<0?"-":(second-0.2).toFixed(1)}</td>
	            <td>${(second-0.1)<0?"-":(second-0.1).toFixed(1)}</td>
	        </tr>
	        <tr>
	            <td>${rOQueue[0]=="O"?rDQueue[0]:"X"}</td>
	            <td>${rOQueue[1]=="O"?rDQueue[1]:"X"}</td>
	            <td>${rOQueue[2]=="O"?rDQueue[2]:"X"}</td>
	            <td>${rOQueue[3]=="O"?rDQueue[3]:"X"}</td>
	            <td>${rOQueue[4]=="O"?rDQueue[4]:"X"}</td>
	            <td>${rOQueue[5]=="O"?rDQueue[5]:"X"}</td>
	            <td>${rOQueue[6]=="O"?rDQueue[6]:"X"}</td>
	            <td>${rOQueue[7]=="O"?rDQueue[7]:"X"}</td>
	            <td>${rOQueue[8]=="O"?rDQueue[8]:"X"}</td>
	            <td>${rOQueue[9]=="O"?rDQueue[9]:"X"}</td>
	        </tr>
	    </table>
	        `
	}

	let toggle_interval

	function startSurveying() {
	    isSurveying = true;
	    isAnswering = true;
	    currentQuestionID += 1
	    questionNumberDOM.innerHTML = `Question ${currentQuestionID}`
	    questionButtonDOM.innerHTML = `<button type="button" id="stop-answering" class="button-33 answering"">Stop</button>`;
	    document.getElementById("stop-answering").addEventListener("click", stopAnswering)
	    surveyRecord[currentQuestionID.toString()] = {}
	    toggle_interval = setInterval(() => {
	        document.getElementById('toggle-circle').classList.toggle("answering-toggle");
	    }, 500)
	    document.getElementById("circle-container").classList.remove("hidden")

	}

	function startAnswering() {
	    isAnswering = true;
	    currentQuestionID += 1
	    questionNumberDOM.innerHTML = `Question ${currentQuestionID}`
	    questionButtonDOM.innerHTML = `<button type="button" id="stop-answering" class="button-33 answering"">Stop</button>`;
	    document.getElementById("stop-answering").addEventListener("click", stopAnswering)
	    surveyRecord[currentQuestionID.toString()] = {}
	    toggle_interval = setInterval(() => { document.getElementById('eyerecordpanel-container').classList.toggle("answering-container") }, 1000)

	}

	function stopAnswering() {
	    isAnswering = false;
	    answerMilliSecond = 0
	    console.log("stopAnswering")
	    questionButtonDOM.innerHTML = `
        <button type="button" id="start-answering" class="button-33">Start</button>
        <button type="button" id="finish-survey" class="button-33">Records</button>
        `
	    document.getElementById("start-answering").addEventListener("click", startSurveying)
	    questionNumberDOM.innerHTML = `Question ${currentQuestionID+1}`
	    answerStatusDOM.innerHTML = `Waiting`
	    questionListDOM.innerHTML += `<div id="question-${currentQuestionID+1}" class="question-id answering-question-id" sty>${currentQuestionID+1}</div>`
	    document.getElementById(`question-${currentQuestionID}`).classList.remove("answering-question-id")
	    document.getElementById("finish-survey").addEventListener("click", finishSurvey)
	    clearInterval(toggle_interval)
	    document.getElementById('toggle-circle').classList.remove("answering-toggle");
	    document.getElementById("circle-container").classList.add("hidden");
	}



	function finishSurvey() {
	    isSurveying = false;
	    document.getElementById("question-eye-record").innerHTML = ''
	    for (const questionID in surveyRecord) {
	        if (surveyRecord.hasOwnProperty(questionID)) {
	            document.getElementById("question-eye-record").innerHTML += `<div id="question-${questionID}-result" class="question-result-container"></div>`
	            let resultInnerHTML = `
                    <div class="question-number">Q${questionID}</div>
                    <div class="question-table-container">
                        <table id="question-${questionID}-table">
                            <tr><th>Second</th><th>Status(L)</th><th>Status(R)</th></tr>
                        `
	            let duration = 0
	            let accumulate_blink = 0
	            let accumulate_move = 0
	            for (const second in surveyRecord[questionID]) {
	                if (surveyRecord[questionID].hasOwnProperty(second)) {
	                    let info = surveyRecord[questionID][second]
	                    if (info[0] != "O" || info[1] != "O") {
	                        accumulate_blink += 1
	                    }
	                    if (info[2] != "C" || info[3] != "C") {
	                        accumulate_move += 1
	                    }
	                    resultInnerHTML += `<tr><td>${second}</td><td>${info[0]=="O"?info[2]:"X"}</td><td>${info[1]=="O"?info[3]:"X"}</td></tr>`
	                    duration = second
	                }
	            }
	            resultInnerHTML += `</table></div>`
	            let average_blink = (accumulate_blink / duration).toFixed(1)
	            let average_move = (accumulate_move / duration).toFixed(1)
	            resultInnerHTML += `
                    <div class="question-cal-container">
                        <div class="cal-result"><b>Duration</b>: ${duration} sec</div>
                        <div class="cal-result"><b>Blinking</b>: ${average_blink}/sec</div>
                        <div class="cal-result"><b>Moving</b>: ${average_move}/sec</div>
                    </div>
                `
	            document.getElementById(`question-${questionID}-result`).innerHTML = resultInnerHTML
	        }
	    }
	    document.getElementById("blur-div").classList = "show-blur"
	}

	function updateEyeRecord(answerMilliSecond, lOpen, rOpen, lEyeStatus, rEyeStatus) {
	    let second = (answerMilliSecond / 10).toString()
	    surveyRecord[currentQuestionID.toString()][second] = [lOpen, rOpen, lEyeStatus, rEyeStatus]
	}

	document.getElementById("start-answering").addEventListener("click", startSurveying)
	document.getElementById("return").addEventListener("click", () => {
	    document.getElementById("blur-div").classList = "blur"
	})





	//////////////////////////////////audio/////////////////////////////////




	const audioTest = async() => {
	    if (navigator.mediaDevices.getUserMedia !== null) {
	        const options = {
	            video: false,
	            audio: true,
	        };
	        try {
	            const stream = await navigator.mediaDevices.getUserMedia(options);
	            const audioCtx = new AudioContext();
	            const analyser = audioCtx.createAnalyser();
	            analyser.fftSize = 2048;
	            const audioSrc = audioCtx.createMediaStreamSource(stream);
	            audioSrc.connect(analyser);
	            const data = new Uint8Array(analyser.frequencyBinCount);
	        } catch (err) {
	            // error handling
	        }
	    }
	}

	const analyserCanvas = document.getElementById("canvas-audio")

	const ctx_audio = analyserCanvas.getContext('2d');
	const draw = (dataParm) => {
	    dataParm = [...dataParm];
	    ctx_audio.fillStyle = 'white'; //white background          
	    ctx_audio.lineWidth = 2; //width of candle/bar
	    ctx_audio.strokeStyle = '#d5d4d5'; //color of candle/bar
	    const space = analyserCanvas.current.width / dataParm.length;
	    dataParm.forEach((value, i) => {
	        ctx_audio.beginPath();
	        ctx_audio.moveTo(space * i, analyserCanvas.current.height); //x,y
	        ctx_audio.lineTo(space * i, analyserCanvas.current.height - value); //x,y
	        ctx_audio.stroke();
	    });
	};
	const loopingFunction = () => {
	    requestAnimationFrame(loopingFunction);
	    analyser.getByteFrequencyData(data);
	    draw(data);
	}