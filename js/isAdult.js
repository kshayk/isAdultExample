const NO_RISK_STATUS = 1;
const LOW_RISK_STATUS = 2;
const HIGH_RISK_STATUS = 3;

const STATUS_MESSAGES = {
    1: "No risk",
    2: "Medium risk. It is recommended to manually check this image",
    3: "High risk. This image is being flagged to most likely be an adult image"
};

const LOW_RISK_KEYWORDS = [
    'tank suit','bathing trunks','swimming trunks','sarong','sunscreen','sunblock','sun blocker','diaper',
    'nappy','napkin','miniskirt','dumbbell','plunger','plumber\'s helper'
];

const HIGH_RISK_KEYWORDS = [
    'bikini','two-piece','maillot','brassiere','bandeau','balance beam','beam','punching bag','punch bag',
    'punching ball', 'punchball'
];

var loadScript = new Promise(function(resolve, reject) {
    var script = document.createElement("script");
    script.src = "https://unpkg.com/ml5@0.1.1/dist/ml5.min.js";
    script.id = makeid(7);
    document.body.appendChild(script);
    resolve(script.id);
});

function makeid(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

checkAdultImage = async function(imgElement) {
    var scriptId = await loadScript;
    var scriptElement = document.getElementById(scriptId);

    if( ! scriptElement) {
        throw new Error("Could not load dynamic script into the HTML");
    }

    await ml5Ready();

    var classifier = await ml5.imageClassifier('MobileNet');

    try {
        var results = await classifier.predict(imgElement);
    } catch (e) {
        throw new Error('This image could not be parsed.');
    }

    var highest_risk = NO_RISK_STATUS;
    for(var i = 0; i < results.length; i++) {
        var categoryArr = results[i].className.split(', ');
        for(var k = 0; k < categoryArr.length; k++) {
            if(HIGH_RISK_KEYWORDS.includes(categoryArr[k])) {
                return {status: HIGH_RISK_STATUS, msg: STATUS_MESSAGES[HIGH_RISK_STATUS]};
            } else if(LOW_RISK_KEYWORDS.includes(categoryArr[k])) {
                highest_risk = LOW_RISK_STATUS;
            }
        }
    }

    return {status: highest_risk, msg: STATUS_MESSAGES[highest_risk]};
};

function ml5Ready() {
    return new Promise(function (resolve, reject) {
        var mlLoaded = setInterval(checkMl5, 1000);

        function checkMl5() {
            if (ml5) {
                clearInterval(mlLoaded);
                resolve();
            }
        }
    });
}

