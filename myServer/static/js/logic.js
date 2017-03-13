var selfEasyrtcid = "";
function my_init(){
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

function connectPeer(peerID) {
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
/*function(myId) {
   document.getElementById("iam").innerHTML = "I am " + myId;
}*/
