;(function(window){
  "use strict";
  
  var video, videoBtn, burstBtn, photoBtn;

  var screenshotPreviewer;
  var chunks = [];
  var mediaRecorder;
  var recordingTimer;
  var recordingDurationViewer;

  var localMediaStream = null;
  var videoTracks;
  
  var burstTimer;

  function initialize() {
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
      setupMediaRecorder(mediaStream);
      videoTracks = mediaStream.getVideoTracks();
      
      localMediaStream = mediaStream;
      video.srcObject = mediaStream;
      video.onloadedmetadata = function() {
        video.play();
      };
      // Defaults to Single Photo mode
      photoBtn.classList.add('active');
      addEventListeners();
    }).catch(handleGetUserMediaError);
  }
  
  function setupMediaRecorder(mediaStream) {
    mediaRecorder = new MediaRecorder(mediaStream);
    mediaRecorder.ondataavailable = function(e) {
      chunks.push(e.data);
    };
    mediaRecorder.onstop = function(e) {
      var blob = new Blob(chunks, { type: 'video/webm' });
      chunks = [];
      downloadFile('yuanvideo-'+(Date.now())+'.webm', URL.createObjectURL(blob));
    };
  }

  function addEventListeners() {
    videoBtn.addEventListener('click', onVideoButtonClick);
    burstBtn.addEventListener('click', onBurstButtonClick);
    photoBtn.addEventListener('click', onPhotoButtonClick);
    screenshotPreviewer.addEventListener('transitionend', onPreviewerTransitionend);
  }
  
  function onPreviewerTransitionend() {
    // Resume video playback
    video.play();
    // Restore screenshot previewer
    screenshotPreviewer.style.removeProperty('visibility');
    screenshotPreviewer.style.removeProperty('background-image');
    screenshotPreviewer.classList.remove('slideLeft');
  }
  
  function removeEventListeners() {
    videoBtn.removeEventListener('click', onVideoButtonClick);
    burstBtn.removeEventListener('click', onBurstButtonClick);
    photoBtn.removeEventListener('click', onPhotoButtonClick);
    screenshotPreviewer.removeEventListener('transitionend', onPreviewerTransitionend);
    
    video.onloadedmetadata = null;
    mediaRecorder.ondataavailable = null;
    mediaRecorder.onstop = null;
  }

  function onVideoButtonClick(e) {
    let targetClassList = videoBtn.classList;
    
    videoBtn.classList.add('active');
    burstBtn.classList.remove('active');
    photoBtn.classList.remove('active');
    
    if (targetClassList.contains('ready')) {
      mediaRecorder.start();
      
      targetClassList.remove('ready');
      targetClassList.add('recording');
      
      showRecordingDuration();
      
      // Hide the other two buttons
      burstBtn.classList.add('hidden');
      photoBtn.classList.add('hidden');
      
    } else {
      if ( mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
      
      targetClassList.remove('recording');
      targetClassList.add('ready');
      
      // Show the other two buttons
      burstBtn.classList.remove('hidden');
      photoBtn.classList.remove('hidden');
      
      hideRecordingDuration();
    }
  }

  function onBurstButtonClick(e) {
    var burstBtnClassList = burstBtn.classList;
    if (burstBtnClassList.contains('active')) {
      // Burst it
      var count = 0;
      var burstImages = [];
      var burstFunc = function() {
        if (count > 9) {
          clearInterval(burstTimer);
          recordingDurationViewer.innerText = 1;
          recordingDurationViewer.classList.add('hidden');
          // show burst image list
          showBurstImages(burstImages);
          return false;
        }
        count++;
        recordingDurationViewer.innerText = count;
        var url = getSnapshotURL();
        burstImages.push(url);
        //console.log('count #' + count);
      };
      setTimeout(function(){
        burstFunc();
        recordingDurationViewer.classList.remove('hidden');
      }, 0);
      burstTimer = window.setInterval(burstFunc, 100);
    } else {
      // Ready to burst
      videoBtn.classList.remove('active', 'ready', 'recording');
      burstBtnClassList.add('active');
      photoBtn.classList.remove('active');
    }    
  }
  
  function showBurstImages(burstImages) {
    var burstPreviwer = document.querySelector('#burst-previewer');
    burstImages.forEach(function(image){
      var img = document.createElement('img');
      img.src = image;
      img.alt = '';
      burstPreviwer.appendChild(img);
    });
    
    burstPreviwer.classList.remove('hidden');
  }
  
  function getSnapshotURL() {
    var canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    var url = canvas.toDataURL();
    return url;
  }

  function onPhotoButtonClick(e) {
    video.pause();
    videoBtn.classList.remove('active', 'ready', 'recording');
    burstBtn.classList.remove('active');
    photoBtn.classList.add('active');
    
    if (!localMediaStream) return false;
    
    var url = getSnapshotURL();

    screenshotPreviewer.style.visibility = 'visible';
    screenshotPreviewer.style.backgroundImage = 'url(' + url + ')';
    screenshotPreviewer.classList.add('slideLeft');
    
    var photoName = 'yuancamera-' + (Date.now()) + '.png';
    downloadFile(photoName, url);
  }

  function downloadFile(fileName, fileUrl) {
    var downloadLink = document.createElement('a');
    downloadLink.href = fileUrl;
    downloadLink.download = fileName;
    downloadLink.click();
  }

  function showRecordingDuration() {
    var startTime = Date.now();
    recordingDurationViewer.classList.remove('hidden');
    recordingTimer = setInterval(function(){    
      var duration = Date.now() - startTime;
      recordingDurationViewer.innerText = formatDuration(duration);
    }, 1000);
  }

  function hideRecordingDuration() {
    recordingDurationViewer.classList.add('hidden');
    clearInterval(recordingTimer);
    recordingDurationViewer.innerText = '00:00';
  }

  /**
   * @param {Number} duration In milliseconds
   */
  function formatDuration(duration) {
    duration = parseInt(duration / 1000);
    var seconds = duration % 60;
    var minutes = (duration - seconds) / 60;
    
    seconds = seconds > 9 ? String(seconds) : '0' + seconds;
    minutes = minutes > 9 ? String(minutes) : '0' + minutes;
    return minutes + ':' + seconds;
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
  
  var YuanCameraApp = {
    setup: function(options) {
      video = document.querySelector(options.player);
      videoBtn = document.querySelector(options.recordingBtn),
      burstBtn = document.querySelector(options.burstBtn),
      photoBtn = document.querySelector(options.snapshotBtn);
      screenshotPreviewer = document.querySelector(options.snapshotpreview);
      recordingDurationViewer = document.querySelector(options.recordingduration);
      initialize();
    },
    dispose: function() {
      if ( mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
      // Stop all video streams.
      if (videoTracks) {
        videoTracks.forEach(function(track) {track.stop()});
      }
      removeEventListeners();
      
      localMediaStream = null;
      chunks = [];
      videoTracks = null;
    }
  };
  
  window.YuanCameraApp = YuanCameraApp;
})(window);