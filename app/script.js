const websocket_server_address = '172.17.15.152'

const ctx = document.getElementById('myChart');
var testMode = true;
var time = 0;
var lastRawData = 0;
var rawData = 0;
var volume = 0;
var delta = 0;
var fakeRawData = 0;



document.addEventListener("keypress", function onEvent(event) {

    if (event.key === "r") {
        recordBase();
    }
    if (event.key === "Enter") {
        playBase();
    }

    if (event.key === "1") {
        playBase(exercice_1);
    }
    if (event.key === "2") {
        playBase(exercice_2);
    }
    if (event.key === "3") {
        playBase(exercice_3);
    }

});










// ANALYSE INPUT DATA

Array.prototype.max = function () {
    return Math.max.apply(null, this);
};

Array.prototype.min = function () {
    return Math.min.apply(null, this);
};
function getPeakPosition(data, peakValue) {

    for (let index = 0; index < data.length; index++) {
        if (data[index] == peakValue) {
            return index;
        }

    }
    return 0;

}
function analyseBreathingData(data) {
    lowThreshold = ((data.max() - data.min()) / 3) + data.min();
    highThreshold = ((data.max() - data.min()) * 2 / 3) + data.min();
    peaksPositions = [];
    currentPhaseList = [];
    currentPhasePosition = 0;
    previousPhaseList = [];


    isHigh = false;
    for (let index = 0; index < data.length; index++) {
        const element = data[index];
        if (element > highThreshold && !isHigh) {
            isHigh = true;
            currentPhasePosition = index;
            previousPhaseList = currentPhaseList;
            currentPhaseList = [];
        }
        if (element < lowThreshold && isHigh) {
            peakValue = currentPhaseList.max();
            peaksPositions.push(getPeakPosition(currentPhaseList, peakValue) + currentPhasePosition);

            isHigh = false;
            currentPhasePosition = index;
            previousPhaseList = currentPhaseList;
            currentPhaseList = [];

        }
        currentPhaseList.push(data[index]);



    }

    LastN = 3
    avg = ((peaksPositions[peaksPositions.length - 1] - peaksPositions[peaksPositions.length - (LastN + 1)]) / LastN) / 10;
    avgPerMinute = 60 / avg;

    return {
        frequency: avgPerMinute,
        lastAmplitude: (!isHigh ? previousPhaseList.max() : previousPhaseList.min()),
        lastLength: previousPhaseList.length / 10,
        currentAmplitude: (isHigh ? currentPhaseList.max() : currentPhaseList.min()),
        currentLength: currentPhaseList.length / 10,

    };
}










//GETTING DATA FROM MOUSE

function mousemove(event) {
    fakeRawData = Math.round(0 - ((event.clientY * 200 / window.innerHeight) - 100));
}

window.addEventListener('mousemove', mousemove);









//GETTING DATA FROM SERVER

let socket = new WebSocket("ws://" + websocket_server_address);

socket.onopen = function (e) {
    socket.send("Hello");
    document.getElementById("startGameBtn").classList.remove("waiting");
};

socket.addEventListener('message', function (event) {
    rawData = event.data;
});

socket.onclose = function (event) {
    socket = new WebSocket("ws://" + websocket_server_address);
    if (event.wasClean) {
        console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
        console.log('[close] Connection died');
    }
};

socket.onerror = function (error) {
    console.log(`[error]`);
};






//DISPLAY CHART

var GraphData = {
    labels: [],
    datasets: [{
        label: 'Raw Data',
        data: [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
    }]
};

const myLineChart = new Chart(ctx, {
    type: 'line',
    data: GraphData,
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

ctx.setAttribute('width', '100%');

function updateData() {
    maxDataLength = 500;
    if (GraphData.datasets[0].data.length > maxDataLength) {
        GraphData.datasets[0].data.splice(0, GraphData.datasets[0].data.length - maxDataLength);
        GraphData.labels.splice(0, GraphData.labels.length - maxDataLength);
    }

    GraphData.datasets[0].data.push(rawData);
    GraphData.labels.push(time);

    stats = analyseBreathingData(GraphData.datasets[0].data);
    frequency = parseInt(stats.frequency);
    if (!frequency) {
        frequency = "Not yet determined";
    } else {
        frequency += "/min"
    }
    document.getElementById("frequency").innerHTML = "frequency:" + frequency;
    document.getElementById("lastAmplitude").innerHTML = "lastAmplitude:" + stats.lastAmplitude;
    document.getElementById("currentAmplitude").innerHTML = "currentAmplitude:" + stats.currentAmplitude;

    document.getElementById("lastLength").innerHTML = "lastLength:" + stats.lastLength;
    document.getElementById("currentLength").innerHTML = "currentLength:" + stats.currentLength;

    movePlayer(rawData);

    time++;
}

var lastResponse = 0;
var fetchingInProgress = false;
var lastRawData = 0;
var getDataInterval;
var UpdateChartInterval;







//GAME PLAY ELEMENTS

function startGame() {
    document.body.classList.add("game-started");


    setTimeout(function () {



        document.getElementById('track1').play();
        document.getElementById('track2').play();
        document.getElementById('track3').play();

        document.getElementById('track1').volume = 0;
        document.getElementById('track2').volume = 0;
        document.getElementById('track3').volume = 0;

        setGoto(document.getElementById("track1"), "track1", "volume", 1, 0.05, true);
    }, 1000);
    getDataInterval = setInterval(function () {
        rawData = parseInt(rawData * 100) / 100;

        if (lastRawData != rawData || testMode) {
            lastRawData = rawData;
            if (testMode) {

                rawData = fakeRawData;

            } else {

                rawData -= 1.11;

                if (rawData > 0) {
                    rawData *= 7.7;
                } else {
                    rawData *= 24.3;
                }

            }
            if (rawData > 100) {
                rawData = 100;
            }
            if (rawData < -100) {
                rawData = -100;
            }
            rawData = rawData * -1;
            rawData = rawData * 1.5;
            updateData();
        }

    }, 100);


    UpdateChartInterval = setInterval(function () {
        myLineChart.update();
    }, 1000);

}

var timeoutPlayer;
p = document.getElementById('player');
p2 = document.getElementById('player2');



var goto = [];

function setGoto(obj, id, v, g, speed, linear) {

    for (let index = 0; index < goto.length; index++) {
        if (id == goto[index].id) {
            goto.splice(index, index);
            break;
        }
    }
    goto.push({
        id: id,
        obj: obj,
        var: v,
        goto: g,
        speed: speed,
        linear: linear

    });
}


setInterval(function () {
    for (let index = 0; index < goto.length; index++) {
        const element = goto[index];
        val = element.obj[element.var];
        valBefore = val;
        if (!element.linear) {
            val =
                val
                + ((val - element.goto) / element.speed);

            if (Math.abs(val - element.goto) < 1) {
                val = element.goto;
                goto.splice(index, index);
            }
        } else {

            if (val > element.goto) {
                val = val - element.speed;
            } else {
                val = val + element.speed;
            }
            if (Math.abs(val - element.goto) <= element.speed) {

                val = element.goto;
                goto.splice(index, index);
            }
        }

        element.obj[element.var] = val;
    }
}, 100);

function movePlayer(value) {
    const minValue = 20;

    if (!p2.style.marginTop) {
        p2.style.marginTop = '0vh';
    }

    topValue = parseInt(p2.style.marginTop) + (value / 30);

    if (Math.abs(value) > minValue) {

        p.classList.add('active');
        if (value > 0) {
            p.classList.add('activepositive');

            setGoto(document.getElementById("track2"), "track2", "volume", 0, 0.1, true);
            setGoto(document.getElementById("track3"), "track3", "volume", 1, 0.1, true);

        } else {
            p.classList.remove('activepositive');

            setGoto(document.getElementById("track2"), "track2", "volume", 0.5, 0.1, true);
            setGoto(document.getElementById("track3"), "track3", "volume", 0, 0.1, true);

        }
        if (timeoutPlayer) {
            clearTimeout(timeoutPlayer);
        }

    } else {

        setGoto(document.getElementById("track2"), "track2", "volume", 0, 0.1, true);
        setGoto(document.getElementById("track3"), "track3", "volume", 0, 0.1, true);

        timeoutPlayer = setTimeout(function () {

            p.classList.remove('active');

        }, 100);
    }

    if (topValue < -30) {
        topValue = -30;
    }
    if (topValue > 30) {
        topValue = 30;
    }
    topValue = topValue - (topValue / 10);
    p2.style.marginTop = topValue + 'vh';

}

var recordInterval = 500;

var recordBaseInterval;
recordedValues = [];
function recordBase() {
    clearTimeout(recordBaseInterval);
    clearTimeout(playBaseInterval);
    recordBaseInterval = setInterval(function () {
        recordedValues.push(p2.style.marginTop);
    }, recordInterval);
}



var collectibleIndex = 0;

var playBaseInterval;


const exercice_1 = [
    "-5.28vh", "-5.76vh", "-9.09vh", "-10.29vh", "-6.6vh", "-1.32vh", "0.6vh", "0.45vh", "-0.51vh", "-3.12vh", "-8.04vh", "-8.94vh", "-8.07vh", "-3.24vh", "0.87vh", "0.69vh", "-0.03vh", "-1.23vh", "-6.3vh", "-9.96vh", "-9.27vh", "-6.63vh", "-1.17vh", "0.87vh", "0.54vh", "-0.45vh", "-3.21vh", "-8.07vh", "-8.97vh", "-6.54vh", "-0.06vh", "1.92vh", "1.92vh", "-0.21vh", "-2.13vh", "-7.08vh", "-8.94vh", "-6.75vh", "-1.29vh", "2.07vh", "3.87vh", "1.56vh", "-3.33vh", "-7.95vh", "-7.83vh"
];
const exercice_2 = [
    "-1.14vh", "0.48vh", "-0.99vh", "-8.34vh", "-14.64vh", "-19.14vh", "-20.97vh", "-20.13vh", "-18.99vh", "-18vh", "-17.04vh", "-17.01vh", "-15.99vh", "-14.07vh", "-14.01vh", "-13.05vh", "-12.06vh", "-11.97vh", "-11.01vh", "-10.05vh", "-9.06vh", "-9.03vh", "-7.98vh", "-6vh", "-4.05vh", "-2.01vh", "-1.02vh", "-0.09vh", "-0.09vh", "-0.06vh", "-0.03vh"
];
const exercice_3 = [
    "-3.18vh", "-10.08vh", "-15.48vh", "-19.98vh", "-19.98vh", "-20.91vh", "-20.91vh", "-20.49vh", "-20.34vh", "-19.08vh", "-18.06vh", "-18.06vh", "-17.04vh", "-17.01vh", "-16.02vh", "-15.06vh", "-15vh", "-14.01vh", "-13.02vh", "-12.03vh", "-11.07vh", "-11.01vh", "-10.05vh", "-9.09vh", "-9.03vh", "-8.01vh", "-6.99vh", "-5.04vh", "-5.04vh", "-5.04vh", "-5.04vh", "-5.04vh"
]

function playBase(exercice) {

    if (!exercice) {
        exercice = recordedValues;
    }
    document.getElementById('collectibles').innerHTML = "";
    clearTimeout(recordBaseInterval);
    clearTimeout(playBaseInterval);

    console.log(exercice.join('","'));

    for (let index = 0; index < exercice.length; index++) {

        document.getElementById('collectibles').innerHTML += ' <div class="collectible" id="collectible' + index + '"></div>';

    }


    playBaseInterval = setInterval(function () {



        c = document.getElementById('collectible' + collectibleIndex);
        c.style.marginTop = 'calc(' + exercice[collectibleIndex] + ' + 40px)';

        c.style.marginLeft = '60vw';
        c.style.opacity = '1';

        setTimeout(function () {
            console.log("init2 " + collectibleIndex);

            c.style.marginLeft = '0vw';
            c.style.opacity = '0';

        }, 10);



        collectibleIndex++;
        if (!exercice[collectibleIndex]) {
            clearTimeout(playBaseInterval);
        }

    }, recordInterval);

}

