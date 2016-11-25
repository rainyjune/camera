document.addEventListener('DOMContentLoaded', function() {
  var appOptions = {
    player: '#camera', // The <video> element selector
    recordingBtn: '#video-button', // The video recording button selector
    burstBtn: '#burst-button', // The burst button selector
    snapshotBtn: '#photo-button', // The screenshot button selector
    snapshotpreview: '#screenshot-previewer', 
    recordingduration: '#recording-duration'
  };
  YuanCameraApp.setup(appOptions);
}, false);