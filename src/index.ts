import { initialRTTPoints } from "./constants";

const minRTTinput = document.getElementById("minRTTinput") as HTMLInputElement;
const maxRTTinput = document.getElementById("maxRTTinput") as HTMLInputElement;
const baselineInput = document.getElementById(
  "baselineInput"
) as HTMLInputElement;
const pointsInput = document.getElementById("pointsInput") as HTMLInputElement;
const deviationInput = document.getElementById(
  "deviationInput"
) as HTMLInputElement;
const alphaERTTInput = document.getElementById(
  "alphaInput"
) as HTMLInputElement;
const betaDevRTTInput = document.getElementById(
  "betaInput"
) as HTMLInputElement;
const randomGenerationButton = document.getElementById(
  "rdmGenButton"
) as HTMLButtonElement;
const showERTTCheckbox = document.getElementById(
  "erttCheckbox"
) as HTMLInputElement;
const showDevRTTCheckbox = document.getElementById(
  "devrttCheckbox"
) as HTMLInputElement;
const showTimeoutCheckbox = document.getElementById(
  "timeoutCheckbox"
) as HTMLInputElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const canvasContext = canvas.getContext("2d");

function clearCanvas() {
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);
}

function diagram() {
  const state = {
    initialState: () => {},
    randomGeneration: () => {},
    calcTimeoutInterval: () => {},
    draw: () => {},
    rttPoints: [] as Array<number>,
    erttPoints: [] as Array<number>,
    devRTTPoints: [] as Array<number>,
    timeoutIntervalPoints: [] as Array<number>,
  };
  function drawRTTDeviation() {
    const minRTT = parseInt(minRTTinput.value);
    const maxRTT = parseInt(maxRTTinput.value);
    canvasContext.strokeStyle = "#0008";
    canvasContext.lineWidth = 7;
    canvasContext.beginPath();
    for (let i = 0; i < state.rttPoints.length; i++) {
      const canvasX = canvas.width * (i / (state.rttPoints.length - 1));
      const canvasY =
        canvas.height -
        canvas.height * ((state.rttPoints[i] - minRTT) / (maxRTT - minRTT));
      const yDeviation = canvasY * (state.devRTTPoints[i] / (maxRTT - minRTT));
      canvasContext.moveTo(canvasX, canvasY + yDeviation);
      canvasContext.lineTo(canvasX, canvasY - yDeviation);
    }
    canvasContext.stroke();
  }

  function drawPoints(points: Array<number>, color: string) {
    const minRTT = parseInt(minRTTinput.value);
    const maxRTT = parseInt(maxRTTinput.value);
    canvasContext.fillStyle = color;
    canvasContext.strokeStyle = color;
    canvasContext.lineWidth = 2;
    canvasContext.beginPath();
    let previousCanvasX = 0;
    let previousCanvasY = 0;

    for (let i = 0; i < points.length; i++) {
      const canvasX = canvas.width * (i / (points.length - 1));
      const canvasY =
        canvas.height -
        canvas.height * ((points[i] - minRTT) / (maxRTT - minRTT));
      canvasContext.fillRect(canvasX - 3, canvasY - 3, 7, 7);
      if (i > 0) {
        canvasContext.moveTo(previousCanvasX, previousCanvasY);
        canvasContext.lineTo(canvasX, canvasY);
      }
      previousCanvasX = canvasX;
      previousCanvasY = canvasY;
    }
    canvasContext.stroke();
  }

  function initialState() {
    showERTTCheckbox.checked = true;
    showDevRTTCheckbox.checked = true;
    showTimeoutCheckbox.checked = true;
    clearCanvas();
    minRTTinput.value = "100";
    maxRTTinput.value = "350";
    baselineInput.value = "200";
    pointsInput.value = "20";
    deviationInput.value = "35";
    alphaERTTInput.value = "12.5";
    betaDevRTTInput.value = "25";
    state.rttPoints = initialRTTPoints;
    state.erttPoints = [];
    state.devRTTPoints = [];
    state.timeoutIntervalPoints = [];
    state.calcTimeoutInterval();
  }
  function draw() {
    clearCanvas();
    const drawERTT = showERTTCheckbox.checked;
    const drawDevRTT = showDevRTTCheckbox.checked;
    const drawTimeout = showTimeoutCheckbox.checked;

    const minRTT = parseInt(minRTTinput.value);
    const maxRTT = parseInt(maxRTTinput.value);

    canvasContext.strokeStyle = "#808080";
    canvasContext.fillStyle = "#000";
    canvasContext.lineWidth = 2;
    canvasContext.font = "1rem Consolas";

    canvasContext.beginPath();
    canvasContext.moveTo(0, 0);
    canvasContext.lineTo(0, canvas.height);
    for (let i = 0; i <= maxRTT - minRTT; i += 50) {
      const value = canvas.height - (i / (maxRTT - minRTT)) * canvas.height;

      canvasContext.moveTo(0, value);
      canvasContext.lineTo(canvas.width, value);
      canvasContext.fillText(`${minRTT + i}`, 0, value - 2);
    }
    let count = 1;
    let previousI = 0;

    for (
      let i = 0;
      i <= canvas.width;
      i += canvas.width / state.rttPoints.length
    ) {
      if (i - previousI > 40) {
        canvasContext.moveTo(i, canvas.height);
        canvasContext.lineTo(i, canvas.height - 10);
        canvasContext.fillText(`${count}`, i, canvas.height - 2);
        previousI = i;
      }
      count++;
    }
    canvasContext.stroke();
    drawPoints(state.rttPoints, "#00f");

    if (drawERTT) drawPoints(state.erttPoints, "magenta");
    if (drawDevRTT) drawRTTDeviation();
    if (drawTimeout) drawPoints(state.timeoutIntervalPoints, "red");
  }

  function randomGeneration() {
    const baseline = parseInt(baselineInput.value);
    const minRTT = parseInt(minRTTinput.value);
    const maxRTT = parseInt(maxRTTinput.value);
    const deviationPercentage = parseInt(deviationInput.value) / 100;
    const baselineAddLimit = maxRTT - baseline;
    const baselineSubLimit = baseline - minRTT;

    const pointCount = parseInt(pointsInput.value);
    state.rttPoints = [];
    for (let i = 0; i < pointCount; i++) {
      const percentage = Math.random();
      let value = baseline;
      if (Math.random() >= 0.5) {
        //Add
        value += percentage * baselineAddLimit * deviationPercentage;
      } else {
        //Subtract
        value -= percentage * baselineSubLimit * deviationPercentage;
      }

      state.rttPoints.push(value);
    }
    calcTimeoutInterval();
    draw();
  }
  function calcTimeoutInterval() {
    if (state.rttPoints.length <= 0) return;
    const alphaERTT = parseInt(alphaERTTInput.value) / 100;
    const betaDevRTT = parseInt(betaDevRTTInput.value) / 100;
    state.erttPoints = [state.rttPoints[0]];
    state.devRTTPoints = [];
    state.timeoutIntervalPoints = [parseInt(maxRTTinput.value)];

    for (let i = 0; i < state.rttPoints.length - 1; i++) {
      if (i <= 0) {
        state.erttPoints.push(state.rttPoints[i]);
        state.devRTTPoints.push(
          Math.abs(state.rttPoints[i] - state.erttPoints[i])
        );
      } else {
        state.erttPoints.push(
          (1 - alphaERTT) * state.erttPoints[i - 1] +
            alphaERTT * state.rttPoints[i]
        );
        state.devRTTPoints.push(
          (1 - betaDevRTT) * state.devRTTPoints[i - 1] +
            betaDevRTT * Math.abs(state.rttPoints[i] - state.erttPoints[i])
        );
      }
      state.timeoutIntervalPoints.push(
        state.erttPoints[i] + 4 * state.devRTTPoints[i]
      );
    }
  }

  state.initialState = initialState;
  state.draw = draw;
  state.randomGeneration = randomGeneration;
  state.calcTimeoutInterval = calcTimeoutInterval;
  state.initialState();
  return state;
}
const rttDiagram = diagram();
rttDiagram.draw();

randomGenerationButton.onclick = rttDiagram.randomGeneration;

showERTTCheckbox.onchange = () => {
  rttDiagram.draw();
};

showDevRTTCheckbox.onchange = () => {
  rttDiagram.draw();
};

showTimeoutCheckbox.onchange = () => {
  rttDiagram.draw();
};

minRTTinput.onchange = () => {
  const value = parseInt(minRTTinput.value);
  if (value < 0) {
    minRTTinput.value = "0";
  }
  const maxValue = parseInt(maxRTTinput.value);
  if (value > maxValue) {
    minRTTinput.value = maxRTTinput.value;
  }
  if (parseInt(baselineInput.value) < value) {
    baselineInput.value = minRTTinput.value;
  }
};
maxRTTinput.onchange = () => {
  const value = parseInt(maxRTTinput.value);
  if (value < 0) {
    maxRTTinput.value = "0";
  }
  const minValue = parseInt(minRTTinput.value);
  if (value < minValue) {
    maxRTTinput.value = minRTTinput.value;
  }
  if (parseInt(baselineInput.value) > value) {
    baselineInput.value = maxRTTinput.value;
  }
};
baselineInput.onchange = () => {
  const value = parseInt(baselineInput.value);
  if (value < parseInt(minRTTinput.value)) {
    baselineInput.value = minRTTinput.value;
  }
  if (value > parseInt(maxRTTinput.value)) {
    baselineInput.value = maxRTTinput.value;
  }
};

function setRemRootOnResize() {
  const pixelAmount = document.body.clientWidth / 65;
  document.documentElement.style.fontSize = `${pixelAmount}px`;
}
setRemRootOnResize();
window.onresize = setRemRootOnResize;
