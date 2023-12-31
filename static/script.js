const lightbulb = document.querySelector('.lightbulb');
const http = '{{HTTP}}';
const ws = '{{WSS}}';
const rootUrl = '{{ROOT_URL}}';

function setBrightness(value) {
  console.log('setting brightness', value);
  let normalizedValue = Math.min(value / 188, 1);
  let brightness = 0.1 + 0.9 * normalizedValue;
  lightbulb.style.setProperty('--brightness', brightness);
}

function transformLuxToBrightness(lux) {
  if (lux > 10) {
    setBrightness(188);
  } else {
    setBrightness(0);
  }
}

function setEmoji(emojiCode) {
  lightbulb.innerHTML = `&#${emojiCode};`;
}

setBrightness(0);

var xhr = new XMLHttpRequest();

xhr.open('GET', `${http}://${rootUrl}/api/lux`, true);

xhr.onreadystatechange = function () {
  if (xhr.readyState === 4 && xhr.status === 200) {
    var response = JSON.parse(xhr.responseText);
    console.log(response.luxValue);

    transformLuxToBrightness(response.luxValue);

    document.getElementById('light').style.display = 'block';
  } else if (xhr.readyState === 4) {
    console.log('Error: ', xhr.status, xhr.statusText);
  }
};

xhr.onerror = function () {
  console.log('Init Get Lux Failed');
};

//send the request
xhr.send();

const socket = new WebSocket(`${ws}://${rootUrl}/status`);

socket.onopen = () => {
  console.log('Connected to the server');

  setInterval(() => {
    console.log('sending');
    socket.send('get_lux');
  }, 2000);
};

socket.onmessage = (event) => {
  console.log('Received lux data: ', event.data);
  transformLuxToBrightness(event.data);
};

socket.onclose = () => {
  console.log('Connection closed');
};

const emojiSocket = new WebSocket(`${ws}://${rootUrl}/api/emoji/status`);

emojiSocket.onmessage = (event) => {
  console.log(`Received emoji data: `, event.data);
  setEmoji(event.data);
};

emojiSocket.onclose = () => {
  console.log('Emoji connection closed');
};
