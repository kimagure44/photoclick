let imageCapture = null;
const containerPhoto =  document.querySelector('.container-photo');
const timeRange =  document.querySelector('#timeRange');
const iconPhoto =  document.querySelector('.icon-photo');
const startAutomatic =  document.querySelector('#startAutomatic');
const stopAutomatic =  document.querySelector('#stopAutomatic');
const video =  document.querySelector('video');
const time =  document.querySelector('#time');
const notice = document.querySelector('.notice');
const sessionName = document.querySelector('#sessionName');
const downloadPhoto = document.querySelector('#downloadPhoto');

const photosToDownload = [];
let photosArray = new Proxy(photosToDownload, {
  set(target, property, value) {
    target[property] = value;
    downloadPhoto.classList[target.length > 0 ? 'remove' : 'add']('disabled');
    return true;
  }
});

let interval = null;

time.innerHTML = `${timeRange.value} ms`;

const DOMContentLoaded = async () => {
  try {
    const media = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = media;
    imageCapture = new ImageCapture(media.getVideoTracks()[0]);
  } catch (err) {
    console.error(err);
  }
};

const controlsAutomaticPhoto = (status) => {
  const action = (st) => st  ? 'add' : 'remove';
  timeRange.classList[action(status)]('disabled');
  startAutomatic.classList[action(status)]('disabled');
  stopAutomatic.classList[action(!status)]('disabled');
  iconPhoto.classList[action(status)]('disabled');
  sessionName.classList[action(status)]('disabled');
};

const addPhoto = function() {
  const isSelected = !JSON.parse(this.dataset.selected);
  this.dataset.selected = isSelected;
  this.children[0].classList[isSelected ? 'add' : 'remove']('selected');
  isSelected ? photosArray.push(this) : Object.values(photosArray).forEach((item, index) => item.dataset.id === this.dataset.id && photosArray.splice(index, 1));
};

const drawCanvas = (img) => {
  const photo =  document.createElement('div');
  const canvas =  document.createElement('canvas');
  const qty = document.querySelectorAll('.photo').length;
  const name = `${sessionName.value || 'default'}-${qty}`;
  photo.classList.add('photo');
  photo.dataset.id = name;
  photo.dataset.selected = false;
  photo.setAttribute('title', name);
  canvas.addEventListener('click', addPhoto.bind(photo));
  canvas.width = 320;
  canvas.height = 240;
  const ratio  = Math.min(canvas.width / img.width, canvas.height / img.height);
  const x = (canvas.width - img.width * ratio) / 2;
  const y = (canvas.height - img.height * ratio) / 2;
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height, x, y, img.width * ratio, img.height * ratio);
  photo.appendChild(canvas);
  containerPhoto.appendChild(photo); 
};

const takePhoto = async () => {
  try {
    const blob = await imageCapture.takePhoto();
    const imageBitmap = await createImageBitmap(blob);
    drawCanvas(imageBitmap);
  } catch (err) {
    console.error(err);
  }
};

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

window.addEventListener('DOMContentLoaded', DOMContentLoaded);
iconPhoto.addEventListener('click', takePhoto);
timeRange.addEventListener('input', function () {
  time.innerHTML = `${this.value} ms`;
});
startAutomatic.addEventListener('click', () => {
  controlsAutomaticPhoto(true);
  interval = setInterval(async () => {
    video.classList.add('get-photo');
    notice.classList.add('show');
    await sleep(500);
    takePhoto();
    setTimeout(() => {
      video.classList.remove('get-photo');
      notice.classList.remove('show');
    }, 500);
  }, timeRange.value);
});
stopAutomatic.addEventListener('click', () => {
  clearInterval(interval);
  controlsAutomaticPhoto(false);
});
downloadPhoto.addEventListener('click', () => {
  photosToDownload.forEach((photo) => {
    const link = document.createElement('a');
    link.download = `${photo.dataset.id}.jpg`;
    link.href = photo.children[0].toDataURL('image/jpeg');
    link.click();
    link.remove();
  });
});
