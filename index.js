document.addEventListener('DOMContentLoaded', onDOMContentLoaded, false);
function onDOMContentLoaded() {
  var video = document.querySelector('#camera');
  var videoBtn = document.querySelector('#video-button'),
      burstBtn = document.querySelector('#burst-button'),
      photoBtn = document.querySelector('#photo-button');
  
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert('Sorry, your browser does not support getUserMedia()');
    return false;
  }
  var constraints = { 
    audio: true, 
    video: true
  };
  navigator.mediaDevices.getUserMedia(constraints).then(function(mediaStream) {
    /* use the stream */  
    video.srcObject = mediaStream;
    video.onloadedmetadata = function() {
      video.play();
    };
    // Defaults to Single Photo mode
    photoBtn.classList.add('active');
    
  }).catch(handleGetUserMediaError);
}

function handleGetUserMediaError(err){
  /* handle the error */
  switch (err.name) {
    case 'PermissionDeniedError':
      alert('Permission Denied');
      break;
    case 'AbortError':
      alert('Aborted, some problem occurred which prevented the device from being used');
      break;
    case 'NotAllowedError':
      alert('Operation not allowed');
      break;
    case 'NotFoundError':
      alert('No media tracks of the type specified were found that satisfy the given constraints.');
      break;
    case 'NotReadableError':
      alert('An error occurred which prevented access to the device');
      break;
    case 'OverConstrainedError':
      alert('The specified constraints resulted in no candidate devices which met the criteria requested');
      break;
    case 'SecurityError':
      alert('User media support is disabled');
      break;
    case 'TypeError':
      alert('The list of constraints specified is empty, or has all constraints set to false.');
      break;
    default:
      alert('Unknown Error');
  }
}