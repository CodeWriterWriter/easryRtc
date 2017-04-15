(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var selfEasyrtcid = "";
window.my_init = function(){
  easyrtc.enableDataChannels(true);
  easyrtc.enableVideo(false);
  easyrtc.enableAudio(false);
  easyrtc.setAcceptChecker(function(easyrtcid, responsefn) {
      responsefn(true);
      document.getElementById("connectbutton_" + easyrtcid).style.visibility = "hidden";
  });
  easyrtc.setDataChannelOpenListener(function(easyrtcid, usesPeer) {
      console.log("dataOpen");
  });

  easyrtc.setDataChannelCloseListener(function(easyrtcid) {
      console.log("dataClosed");
  });

  easyrtc.connect("synchro-film", loginSuccess, loginFailure);
  test();
  if (!window.MediaSource) {
      console.log('No Media Source API available');
  }
  else {
    console.log("we g");
  }
 }

function test() {
  /*try {
  	new ffmpeg('../test.mp4', function (err, video) {
  		if (!err) {
  			console.log('The video is ready to be processed');
  		} else {
  			console.log('Error: ' + err);
  		}
  	});
  } catch (e) {
  	console.log(e);
  }*/

}

function performCall(easyrtcid) {
    easyrtc.call(
       easyrtcid,
       function(easyrtcid) { console.log("completed call to " + easyrtcid);},
       function(errorMessage) { console.log("err:" + errorMessage);},
       function(accepted, bywho) {
          console.log((accepted?"accepted":"rejected")+ " by " + bywho);
       }
   );
}

window.connectPeer = function(peerID) {
  performCall(peerID)
}
function loginSuccess(easyrtcid) {
    selfEasyrtcid = easyrtcid;
    document.getElementById("iam").innerHTML = "I am " + easyrtcid;
    //easyrtc_ft.buildFileReceiver(acceptRejectCB, blobAcceptor, receiveStatusCB);
}


function loginFailure(errorCode, message) {
    easyrtc.showError(errorCode, message);
}

//reading chunks
var temp=0;
function readBlob(time) {
  var files = document.getElementById('filePicker').files;
  if (!files.length) {
    console.log('Please select a file!');
    return;
  }
  var file = files[0];
  var start = time;
  var stop = file.size - 1;
  if (time>file.size) {
    return;
  }
  var reader = new FileReader();

  reader.onloadend = function(evt) {

    if (evt.target.readyState == FileReader.DONE) { // DONE == 2
      //handleChunk(evt.target.result);
    }
   };

  reader.onload = function(e) {
    feedIt();
    //console.log('appending chunk:' + temp);
  };

  var blob;
  blob = file.slice(start, start + 1024)
  reader.readAsArrayBuffer(blob);
  }



window.feedIt = function(){
  readBlob(temp);
  temp+=1024;
}

//PLAYING CHUNKS
var queue=[];
var sourceBuffer;
var current=0;

var video = document.querySelector(".vidya");
var mediaSource = new MediaSource();
mediaSource.addEventListener('sourceopen', onSourceOpen.bind(this, video));
video.src = window.URL.createObjectURL(mediaSource);

function handleChunk(chunk){
	queue.push(chunk);
	current++;
	if (current==1){
		video.src = window.URL.createObjectURL(mediaSource);
		video.pause();
	}

	if (current>=2){ //Size to start feeding Media Source
		appendNextMediaSegment(mediaSource);
	}

	if (current==128){//Buffer size to play
		video.play();
	}
}
function onSourceOpen(videoTag, e) {
    var mediaSource = e.target;

    if (mediaSource.sourceBuffers.length > 0){
  		console.log("SourceBuffer.length > 0");
        return;
  	}

    var sourceBuffer = mediaSource.addSourceBuffer('video/mp4');

    var initSegment = new Uint8Array(queue.shift());

    if (initSegment.length==0) {
      // Error fetching the initialization segment. Signal end of stream with an error.
	     console.log("initSegment is null");
      mediaSource.endOfStream("network");
      return;
    }

    // Append the initialization segment.
    var firstAppendHandler = function(e) {
	  console.log("First Append Handler");
      var sourceBuffer = e.target;
      sourceBuffer.removeEventListener('updateend', firstAppendHandler);

      // Append some initial media data.
      appendNextMediaSegment(mediaSource);
    };

    sourceBuffer.addEventListener('updateend', firstAppendHandler);
    sourceBuffer.addEventListener('update', onProgress.bind(videoTag, mediaSource));
	   console.log("Send init block");
    sourceBuffer.appendBuffer(initSegment);
	   console.log('mediaSource readyState: ' + mediaSource.readyState);
  }
function appendNextMediaSegment(mediaSource) {
  if (mediaSource.readyState == "closed"){
  console.log("readyState is closed");
  return;
}

  // If we have run out of stream data, then signal end of stream.
  if (!HaveMoreMediaSegments()) {
    mediaSource.endOfStream();
    return;
  }

  // Make sure the previous append is not still pending.
  if (mediaSource.sourceBuffers[0].updating){
    console.log("SourceBuffer is updating");
    return;
  }


  if (queue.length==0) {
    // Error fetching the next media segment.
    console.log("mediaSegment is null need buffering");
    mediaSource.endOfStream("network");
    return;
  }

  var mediaSegment = new Uint8Array(queue.shift());

  // NOTE: If mediaSource.readyState == “ended”, this appendBuffer() call will
  // cause mediaSource.readyState to transition to "open". The web application
  // should be prepared to handle multiple “sourceopen” events.
  //console.log("Send next block");
  mediaSource.sourceBuffers[0].appendBuffer(mediaSegment);
}
function onProgress(mediaSource,e) {
     //console.log("on Progress");
     appendNextMediaSegment(mediaSource);
}


/*window.makeMPD = function() {
  //console.log(document.getElementById("filePicker").files[0]);
  mp4box.onReady = function() {
    mp4box.onSegment = function (id, user, buffer) {}
    mp4box.setSegmentOptions(info.tracks[0].id, sb, options);
    var initSegs = mp4box.initializeSegmentation();
    mp4box.start();
  }
}*/
/*function(myId) {
   document.getElementById("iam").innerHTML = "I am " + myId;
}*/

},{}]},{},[1]);