"use client";



import {

  useEffect,

  useRef,

  useState,

  type RefObject,

} from "react";

import { io, type Socket } from "socket.io-client";

import Link from "next/link";



type RemoteParticipant = {

  stream: MediaStream;

};



export default function CallPage() {

 const videoRef = useRef<HTMLVideoElement | null>(null);



const streamRef = useRef<MediaStream | null>(null);



const screenStreamRef =

  useRef<MediaStream | null>(null);



const socketRef =

  useRef<Socket | null>(null);



const peersRef =

  useRef<Record<string, RTCPeerConnection>>({});



const pendingCandidatesRef =

  useRef<Record<string, RTCIceCandidateInit[]>>({});



const dataChannelsRef =

  useRef<Record<string, RTCDataChannel>>({});

const audioContextRef =

  useRef<AudioContext | null>(null);
const mediaRecorderRef =
  useRef<MediaRecorder | null>(null);

const recordedChunksRef =
  useRef<Blob[]>([]);

const [recording, setRecording] =
  useState(false);


const analyserRef =

  useRef<AnalyserNode | null>(null);



const speakingFrameRef =

  useRef<number | null>(null);

  const [micOn, setMicOn] = useState(true);

  const [cameraOn, setCameraOn] = useState(true);

  const [screenSharing, setScreenSharing] = useState(false);

  const [callDuration, setCallDuration] = useState(0);

  const [chatOpen, setChatOpen] = useState(false);

  const [peopleOpen, setPeopleOpen] = useState(false);

  const [isSpeaking, setIsSpeaking] = useState(false);

  const [roomCode, setRoomCode] = useState("");

  const [roomReady, setRoomReady] = useState(false);

  const [isHost, setIsHost] = useState(false);

  const [hostSocketId, setHostSocketId] = useState("");

  const [handRaised, setHandRaised] = useState(false);

  const [mediaReady, setMediaReady] = useState(false);

  const [mediaError, setMediaError] = useState("");



  const [connectionStatus, setConnectionStatus] =

    useState("Starting camera...");



  const [remoteParticipants, setRemoteParticipants] =

    useState<Record<string, RemoteParticipant>>({});



  const [messages, setMessages] = useState<

    { sender: string; text: string }[]

  >([]);



  const [message, setMessage] = useState("");



  /*

   * ---------------------------------------------------------

   * ROOM SETUP

   * ---------------------------------------------------------

   */



  useEffect(() => {

    const params = new URLSearchParams(window.location.search);



    const roomFromUrl = params.get("room");

    const newRoom = params.get("new");



    if (roomFromUrl) {

      setRoomCode(roomFromUrl);

    } else if (newRoom === "true") {

      const generatedRoom = `irl-${Math.floor(

        1000 + Math.random() * 9000

      )}`;



      setRoomCode(generatedRoom);



      window.history.replaceState(

        {},

        "",

        `/call?room=${generatedRoom}`

      );

    } else {

      const generatedRoom = `irl-${Math.floor(

        1000 + Math.random() * 9000

      )}`;



      setRoomCode(generatedRoom);



      window.history.replaceState(

        {},

        "",

        `/call?room=${generatedRoom}`

      );

    }



    setRoomReady(true);

  }, []);





/*

 * ---------------------------------------------------------

 * CALL TIMER

 * ---------------------------------------------------------

 */



useEffect(() => {

  if (!roomReady || !mediaReady) return;



  const timer = window.setInterval(() => {

    setCallDuration((previous) => previous + 1);

  }, 1000);



  return () => {

    window.clearInterval(timer);

  };

}, [roomReady, mediaReady]);





function formatCallDuration(seconds: number) {

  const hours = Math.floor(seconds / 3600);

  const minutes = Math.floor((seconds % 3600) / 60);

  const remainingSeconds = seconds % 60;



  if (hours > 0) {

    return `${hours}:${String(minutes).padStart(2, "0")}:${String(

      remainingSeconds

    ).padStart(2, "0")}`;

  }



  return `${String(minutes).padStart(2, "0")}:${String(

    remainingSeconds

  ).padStart(2, "0")}`;

}



  /*

   * ---------------------------------------------------------

   * LOCAL CAMERA + MICROPHONE

   * ---------------------------------------------------------

   */



  useEffect(() => {

    let mounted = true;



    async function startMedia() {

      try {

        if (

          typeof navigator === "undefined" ||

          !navigator.mediaDevices ||

          typeof navigator.mediaDevices.getUserMedia !== "function"

        ) {

          setMediaError(

            "Your browser does not support camera and microphone access."

          );

          setConnectionStatus("Media unavailable");

          return;

        }



        const stream =

          await navigator.mediaDevices.getUserMedia({

            video: true,

            audio: true,

          });



        if (!mounted) {

          stream.getTracks().forEach((track) => track.stop());

          return;

        }



        streamRef.current = stream;



        const audioTrack = stream.getAudioTracks()[0];

        const videoTrack = stream.getVideoTracks()[0];



        if (audioTrack) {

          audioTrack.enabled = true;

        }



        if (videoTrack) {

          videoTrack.enabled = true;

        }



        setMicOn(Boolean(audioTrack));

        setCameraOn(Boolean(videoTrack));



        setMediaReady(true);

        setConnectionStatus("Connecting...");



        if (videoRef.current) {

          videoRef.current.srcObject = stream;

        }

      } catch (error) {

        console.error("Media error:", error);



        if (!mounted) return;



        setMediaError(

          "Camera or microphone permission was denied. Please allow access and refresh the page."

        );



        setConnectionStatus("Media permission required");

      }

    }



    startMedia();



    return () => {

      mounted = false;

    };

  }, []);

  /*

 * ---------------------------------------------------------

 * SPEAKING DETECTION

 * ---------------------------------------------------------

 */



useEffect(() => {

  if (!mediaReady || !streamRef.current) {

    return;

  }



  const audioTracks =

    streamRef.current.getAudioTracks();



  if (audioTracks.length === 0) {

    return;

  }



  const audioContext = new AudioContext();



  const analyser =

    audioContext.createAnalyser();



  analyser.fftSize = 512;

  analyser.smoothingTimeConstant = 0.7;



  const source =

    audioContext.createMediaStreamSource(

      streamRef.current

    );



  source.connect(analyser);



  audioContextRef.current =

    audioContext;



  analyserRef.current =

    analyser;



  const dataArray =

    new Uint8Array(

      analyser.frequencyBinCount

    );



  function detectSpeaking() {

    if (!analyserRef.current) {

      return;

    }



    analyserRef.current.getByteFrequencyData(

      dataArray

    );



    let total = 0;



    for (let i = 0; i < dataArray.length; i++) {

      total += dataArray[i];

    }



    const average =

      total / dataArray.length;



    const microphoneOn =

      streamRef.current

        ?.getAudioTracks()

        .some((track) => track.enabled);



    setIsSpeaking(

      Boolean(

        microphoneOn &&

        average > 18

      )

    );



    speakingFrameRef.current =

      window.requestAnimationFrame(

        detectSpeaking

      );

  }



  if (audioContext.state === "suspended") {

    audioContext.resume().catch(() => {});

  }



  detectSpeaking();



  return () => {

    if (speakingFrameRef.current !== null) {

      window.cancelAnimationFrame(

        speakingFrameRef.current

      );



      speakingFrameRef.current = null;

    }



    source.disconnect();



    analyser.disconnect();



    audioContext.close().catch(() => {});



    audioContextRef.current = null;

    analyserRef.current = null;



    setIsSpeaking(false);

  };

}, [mediaReady]);





  /*

   * ---------------------------------------------------------

   * KEEP LOCAL VIDEO CONNECTED TO VIDEO ELEMENT

   * ---------------------------------------------------------

   */



  useEffect(() => {

    if (!mediaReady) return;



    if (videoRef.current && streamRef.current) {

      videoRef.current.srcObject = streamRef.current;

    }

  }, [mediaReady]);



  /*

   * ---------------------------------------------------------

   * REMOTE PARTICIPANT

   * ---------------------------------------------------------

   */
  


  function addRemoteParticipant(

    socketId: string,

    stream: MediaStream

  ) {

    setRemoteParticipants((previous) => ({

      ...previous,

      [socketId]: {

        stream,

      },

    }));



    setConnectionStatus("Connected");

  }



  function removeRemoteParticipant(socketId: string) {

    setRemoteParticipants((previous) => {

      const updated = { ...previous };



      delete updated[socketId];



      return updated;

    });

    

  }




  /*

   * ---------------------------------------------------------

   * PEER CONNECTION

   * ---------------------------------------------------------

   */



  function createPeerConnection(

  targetSocketId: string,

  createChatChannel = false

): RTCPeerConnection {

  const existingPeer =

    peersRef.current[targetSocketId];



  if (existingPeer) {

    return existingPeer;

  }



  const peer = new RTCPeerConnection({

    iceServers: [

      {

        urls: "stun:stun.l.google.com:19302",

      },

      {

        urls: "stun:stun1.l.google.com:19302",

      },

    ],

  });



  peersRef.current[targetSocketId] = peer;



  pendingCandidatesRef.current[targetSocketId] =

    pendingCandidatesRef.current[targetSocketId] || [];



  /*

   * Add local tracks.

   */



  const localStream =

    streamRef.current;



  if (localStream) {

    localStream.getTracks().forEach((track) => {

      peer.addTrack(track, localStream);

    });

  }



  /*

   * CHAT DATA CHANNEL

   *

   * Only the person creating the offer

   * creates the DataChannel.

   */



  const setupChatChannel = (

    channel: RTCDataChannel

  ) => {

    dataChannelsRef.current[targetSocketId] =

      channel;



    channel.onopen = () => {

      console.log(

        "Chat connected:",

        targetSocketId

      );

    };



    channel.onmessage = (event) => {

      try {

        const data = JSON.parse(

          event.data

        );



        if (

          data.type === "chat-message" &&

          typeof data.text === "string"

        ) {

          setMessages((previous) => [

            ...previous,

            {

              sender: "Other",

              text: data.text,

            },

          ]);

        }

      } catch (error) {

        console.error(

          "Failed to read chat message:",

          error

        );

      }

    };



    channel.onclose = () => {

      delete dataChannelsRef.current[

        targetSocketId

      ];



      console.log(

        "Chat disconnected:",

        targetSocketId

      );

    };



    channel.onerror = (error) => {

      console.error(

        "Chat channel error:",

        error

      );

    };

  };



  /*

   * Create the DataChannel only on the

   * offer-creating side.

   */



  if (createChatChannel) {

    const channel =

      peer.createDataChannel(

        "chat"

      );



    setupChatChannel(channel);

  }



  /*

   * Receive the DataChannel on the

   * answer-creating side.

   */



  peer.ondatachannel = (event) => {

    console.log(

      "Received chat channel:",

      targetSocketId

    );



    setupChatChannel(

      event.channel

    );

  };



  /*

   * ICE candidates.

   */



  peer.onicecandidate = (event) => {

    if (!event.candidate) return;



    socketRef.current?.emit(

      "ice-candidate",

      {

        target: targetSocketId,

        candidate:

          event.candidate.toJSON(),

      }

    );

  };



  /*

   * Remote tracks.

   */



  peer.ontrack = (event) => {

    const remoteStream =

      event.streams[0];



    if (!remoteStream) return;



    addRemoteParticipant(

      targetSocketId,

      remoteStream

    );

  };



  /*

   * Connection state.

   */



  peer.onconnectionstatechange = () => {

    const state =

      peer.connectionState;



    console.log(

      `Peer ${targetSocketId}:`,

      state

    );



    if (

      state === "failed" ||

      state === "closed"

    ) {

      delete dataChannelsRef.current[

        targetSocketId

      ];



      cleanupPeer(

        targetSocketId

      );

    }

  };



  return peer;

}

  /*

   * ---------------------------------------------------------

   * CLEANUP PEER

   * ---------------------------------------------------------

   */



  function cleanupPeer(socketId: string) {

    const peer =

      peersRef.current[socketId];



    if (peer) {

      peer.ontrack = null;

      peer.onicecandidate = null;

      peer.close();



      delete peersRef.current[socketId];

    }



    delete pendingCandidatesRef.current[

      socketId

    ];



    removeRemoteParticipant(socketId);



    setRemoteParticipants((current) => {

      if (Object.keys(current).length === 0) {

        setConnectionStatus(

          "Waiting for another person"

        );

      }



      return current;

    });

  }
  function removeParticipant(socketId: string) {
  if (!isHost) return;

  socketRef.current?.emit("moderation-remove", {
    target: socketId,
  });

  cleanupPeer(socketId);
}

function muteParticipant(socketId: string) {
  if (!isHost) return;

  socketRef.current?.emit("moderation-mute", {
    target: socketId,
  });
}




  /*

   * ---------------------------------------------------------

   * ICE CANDIDATE QUEUE

   * ---------------------------------------------------------

   */



  async function addIceCandidate(

    socketId: string,

    candidate: RTCIceCandidateInit

  ) {

    const peer =

      peersRef.current[socketId];



    if (!peer) return;



    if (peer.remoteDescription) {

      try {

        await peer.addIceCandidate(candidate);

      } catch (error) {

        console.error(

          "Failed to add ICE candidate:",

          error

        );

      }



      return;

    }



    if (

      !pendingCandidatesRef.current[socketId]

    ) {

      pendingCandidatesRef.current[socketId] =

        [];

    }



    pendingCandidatesRef.current[

      socketId

    ].push(candidate);

  }



  async function flushIceCandidates(

    socketId: string

  ) {

    const peer =

      peersRef.current[socketId];



    const candidates =

      pendingCandidatesRef.current[

        socketId

      ];



    if (!peer || !candidates) return;



    for (const candidate of candidates) {

      try {

        await peer.addIceCandidate(

          candidate

        );

      } catch (error) {

        console.error(

          "Queued ICE candidate failed:",

          error

        );

      }

    }



    pendingCandidatesRef.current[

      socketId

    ] = [];

  }



  /*

   * ---------------------------------------------------------

   * SOCKET.IO + WEBRTC SIGNALING

   * ---------------------------------------------------------

   */



  useEffect(() => {

  if (!roomReady || !mediaReady || !roomCode) {
    return;
  }

  const socket = io(
    window.location.origin,
    {
      autoConnect: false,
    }
  );

  socketRef.current = socket;

  /*
   * Socket connected.
   */

  socket.on("connect", () => {
  console.log("Socket connected:", socket.id);

  setConnectionStatus("Waiting for another person");

  socket.emit("join-room", roomCode);
});

  /*
   * Someone joined the room.
   *
   * Existing participant creates
   * the WebRTC offer.
   */

  socket.on(
    "user-joined",
    async ({
      socketId,
    }: {
      socketId: string;
    }) => {

      console.log(
        "User joined:",
        socketId
      );

      try {

        setConnectionStatus(
          "Connecting..."
        );

        const peer =
          createPeerConnection(
            socketId,
            true
          );

        const offer =
          await peer.createOffer();

        await peer.setLocalDescription(
          offer
        );

        socket.emit("offer", {
          target: socketId,
          offer,
        });

      } catch (error) {

        console.error(
          "Offer error:",
          error
        );

      }

    }
  );

  /*
   * Receive WebRTC offer.
   */

  socket.on(
    "offer",
    async ({
      sender,
      offer,
    }: {
      sender: string;
      offer: RTCSessionDescriptionInit;
    }) => {

      console.log(
        "Offer received from:",
        sender
      );

      try {

        setConnectionStatus(
          "Connecting..."
        );

        const peer =
          createPeerConnection(
            sender
          );

        await peer.setRemoteDescription(
          new RTCSessionDescription(
            offer
          )
        );

        await flushIceCandidates(
          sender
        );

        const answer =
          await peer.createAnswer();

        await peer.setLocalDescription(
          answer
        );

        socket.emit("answer", {
          target: sender,
          answer,
        });

      } catch (error) {

        console.error(
          "Answer error:",
          error
        );

      }

    }
  );

  /*
   * Receive WebRTC answer.
   */

  socket.on(
    "answer",
    async ({
      sender,
      answer,
    }: {
      sender: string;
      answer: RTCSessionDescriptionInit;
    }) => {

      console.log(
        "Answer received from:",
        sender
      );

      try {

        const peer =
          peersRef.current[sender];

        if (!peer) return;

        await peer.setRemoteDescription(
          new RTCSessionDescription(
            answer
          )
        );

        await flushIceCandidates(
          sender
        );

      } catch (error) {

        console.error(
          "Answer handling error:",
          error
        );

      }

    }
  );

  /*
   * Receive ICE candidate.
   */

  socket.on(
    "ice-candidate",
    async ({
      sender,
      candidate,
    }: {
      sender: string;
      candidate: RTCIceCandidateInit;
    }) => {

      await addIceCandidate(
        sender,
        candidate
      );

    }
  );

  /*
   * Someone intentionally left.
   */

  socket.on(
    "user-left",
    ({
      socketId,
    }: {
      socketId: string;
    }) => {

      console.log(
        "User left:",
        socketId
      );

      cleanupPeer(socketId);

    }
  );

  /*
   * Handle browser/tab disconnect.
   */
  socket.on(
  "moderation-remove",
  ({
    sender,
  }: {
    sender: string;
  }) => {
    if (sender === socket.id) {
      setConnectionStatus(
        "You were removed by the host."
      );

      Object.values(
        peersRef.current
      ).forEach((peer) => {
        peer.close();
      });

      peersRef.current = {};
      setRemoteParticipants({});
    }
  }
);

socket.on(
  "moderation-mute",
  ({
    sender,
  }: {
    sender: string;
  }) => {
    if (sender === socket.id) {
      const stream =
        streamRef.current;

      if (!stream) return;

      stream
        .getAudioTracks()
        .forEach((track) => {
          track.enabled = false;
        });

      setMicOn(false);

      setConnectionStatus(
        "You were muted by the host."
      );
    }
  }
);
  socket.on(
    "user-disconnected",

    ({
      socketId,
    }: {
      socketId: string;
    }) => {

      if (
        peersRef.current[socketId]
      ) {
        cleanupPeer(socketId);
      }

    }
  );

  /*
   * Socket disconnected.
   */

  socket.on("disconnect", () => {

    console.log(
      "Socket disconnected"
    );

    setConnectionStatus(
      "Disconnected"
    );

  });

  socket.on(
    "connect_error",
    (error) => {

      console.error(
        "Socket connection error:",
        error
      );

      setConnectionStatus(
        "Connection failed"
      );

    }
  );

  socket.connect();

  /*
   * Cleanup.
   */

  return () => {

    socket.emit(
      "leave-room",
      roomCode
    );

    Object.keys(
      peersRef.current
    ).forEach((socketId) => {

      const peer =
        peersRef.current[
          socketId
        ];

      peer.close();

    });

    peersRef.current = {};
    pendingCandidatesRef.current = {};

    socket.disconnect();

    socketRef.current = null;

  };

}, [
  roomReady,
  mediaReady,
  roomCode,
]);

  /*

   * ---------------------------------------------------------

   * MICROPHONE

   * ---------------------------------------------------------

   */



  function toggleMic() {

    const stream =

      streamRef.current;



    if (!stream) return;



    const audioTracks =

      stream.getAudioTracks();



    if (audioTracks.length === 0) {

      return;

    }



    const nextState = !micOn;



    audioTracks.forEach(

      (track) => {

        track.enabled = nextState;

      }

    );



    setMicOn(nextState);

  }



  /*

   * ---------------------------------------------------------

   * CAMERA

   * ---------------------------------------------------------

   */



  function toggleCamera() {

    const stream =

      streamRef.current;



    if (!stream) return;



    const videoTracks =

      stream.getVideoTracks();



    if (videoTracks.length === 0) {

      return;

    }



    const nextState = !cameraOn;



    videoTracks.forEach(

      (track) => {

        track.enabled = nextState;

      }

    );



    setCameraOn(nextState);

  }



  /*

   * ---------------------------------------------------------

   * SCREEN SHARING

   * ---------------------------------------------------------

   */
  function startRecording() {
  const stream = streamRef.current;

  if (!stream) {
    alert("Camera/microphone stream is not ready.");
    return;
  }

  if (!window.MediaRecorder) {
    alert("Recording is not supported by this browser.");
    return;
  }

  try {
    recordedChunksRef.current = [];

    // Use a supported recording format.
    const mimeType = [
      "video/webm;codecs=vp8,opus",
      "video/webm",
    ].find((type) => MediaRecorder.isTypeSupported(type));

    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);

    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(
        recordedChunksRef.current,
        { 
          type: recorder.mimeType || "video/webm" }
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `IRL-recording-${Date.now()}.webm`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
      recordedChunksRef.current = [];
    };

    recorder.start(1000);
    setRecording(true);
  } catch (error) {
    console.error("Recording start error:", error);
    alert("Could not start recording.");
  }
}

function stopRecording() {
  const recorder = mediaRecorderRef.current;

  if (!recorder || recorder.state === "inactive") {
    setRecording(false);
    return;
  }

  recorder.stop();
  mediaRecorderRef.current = null;
  setRecording(false);
}

function toggleRecording() {
  if (recording) {
    stopRecording();
  } else {
    startRecording();
  }
}


  async function startScreenShare() {

    try {

      if (

        !navigator.mediaDevices ||

        !navigator.mediaDevices.getDisplayMedia

      ) {

        alert(

          "Screen sharing is not supported by this browser."

        );

        return;

      }



      const screenStream =

        await navigator.mediaDevices.getDisplayMedia(

          {

            video: true,

            audio: false,

          }

        );



      const screenTrack =

        screenStream.getVideoTracks()[0];



      if (!screenTrack) {

        return;

      }



      screenStreamRef.current =

        screenStream;



      /*

       * Replace camera track in every

       * active WebRTC connection.

       */



      Object.values(

        peersRef.current

      ).forEach((peer) => {

        const sender =

          peer

            .getSenders()

            .find(

              (item) =>

                item.track?.kind ===

                "video"

            );



        if (sender) {

          sender

            .replaceTrack(

              screenTrack

            )

            .catch((error) => {

              console.error(

                "Failed to replace video track:",

                error

              );

            });

        }

      });



      /*

       * Show screen locally.

       */



      if (videoRef.current) {

        videoRef.current.srcObject =

          screenStream;

      }



      setScreenSharing(true);



      /*

       * User can stop sharing using

       * browser's native controls.

       */



      screenTrack.onended = () => {

        stopScreenShare();

      };

    } catch (error) {

      console.error(

        "Screen share error:",

        error

      );

    }

  }



  function stopScreenShare() {

    const screenStream =

      screenStreamRef.current;



    if (screenStream) {

      screenStream

        .getTracks()

        .forEach((track) => {

          track.stop();

        });

    }



    screenStreamRef.current =

      null;



    /*

     * Restore camera track.

     */



    const cameraTrack =

      streamRef.current?.getVideoTracks()[0];



    if (cameraTrack) {

      cameraTrack.enabled =

        cameraOn;



      Object.values(

        peersRef.current

      ).forEach((peer) => {

        const sender =

          peer

            .getSenders()

            .find(

              (item) =>

                item.track?.kind ===

                "video"

            );



        if (sender) {

          sender

            .replaceTrack(

              cameraTrack

            )

            .catch((error) => {

              console.error(

                "Failed to restore camera:",

                error

              );

            });

        }

      });

    }



    if (

      videoRef.current &&

      streamRef.current

    ) {

      videoRef.current.srcObject =

        streamRef.current;

    }



    setScreenSharing(false);

  }



  function toggleScreenShare() {

    if (screenSharing) {

      stopScreenShare();

    } else {

      startScreenShare();

    }

  }

  function toggleRaiseHand() {

  setHandRaised((previous) => !previous);

}



  /*

   * ---------------------------------------------------------

   * CHAT

   * ---------------------------------------------------------

   */



 function sendMessage() {

  const trimmed = message.trim();



  if (!trimmed) return;



  // Show message on your own screen

  setMessages((previous) => [

    ...previous,

    {

      sender: "You",

      text: trimmed,

    },

  ]);



  // Send message to connected participants

  Object.entries(dataChannelsRef.current).forEach(

    ([socketId, channel]) => {

      if (channel.readyState === "open") {

        channel.send(
                    JSON.stringify({

            type: "chat-message",

            text: trimmed,

          })

        );

      }

    }

  );



  setMessage("");

}



/*

 * ---------------------------------------------------------

 * END CALL

 * ---------------------------------------------------------

 */



function endCall() {

  Object.values(peersRef.current).forEach(

    (peer) => {

      peer.close();

    }

  );



  peersRef.current = {};

  pendingCandidatesRef.current = {};



  if (screenStreamRef.current) {

    screenStreamRef.current

      .getTracks()

      .forEach((track) => {

        track.stop();

      });

  }



  if (streamRef.current) {

    streamRef.current

      .getTracks()

      .forEach((track) => {

        track.stop();

      });

  }



  if (socketRef.current) {

    socketRef.current.emit(

      "leave-room",

      roomCode

    );



    socketRef.current.disconnect();

    socketRef.current = null;

  }



  window.location.href = "/dashboard";

}



/*

 * ---------------------------------------------------------

 * COPY ROOM CODE

 * ---------------------------------------------------------

 */



async function copyRoomCode() {

  try {

    await navigator.clipboard.writeText(

      roomCode

    );



    alert("Room code copied!");

  } catch (error) {

    console.error(

      "Failed to copy room code:",

      error

    );

  }

}



/*

 * ---------------------------------------------------------

 * REMOTE VIDEO

 * ---------------------------------------------------------

 */



function RemoteVideo({

  stream,

}: {

  stream: MediaStream;

}) {

  const remoteVideoRef =

    useRef<HTMLVideoElement | null>(null);



  useEffect(() => {

    if (

      remoteVideoRef.current

    ) {

      remoteVideoRef.current.srcObject =

        stream;

    }

  }, [stream]);



  return (

    <video

      ref={remoteVideoRef}

      autoPlay

      playsInline

      style={{

        width: "100%",

        height: "100%",

        objectFit: "cover",

        background: "#111",

      }}

    />

  );

}



/*

 * ---------------------------------------------------------

 * CONTROL BUTTON

 * ---------------------------------------------------------

 */



function ControlButton({

  active,

  danger,

  onClick,

  label,

  title,

}: {

  active: boolean;

  danger?: boolean;

  onClick: () => void;

  label: string;

  title: string;

}) {

  return (

    <button

      onClick={onClick}

      title={title}

      style={{

        width: 54,

        height: 46,

        border: "1px solid rgba(255,255,255,0.08)",

        borderRadius: 14,

        background: danger

          ? "#ef4444"

          : active

          ? "rgba(139,92,246,0.2)"

          : "rgba(255,255,255,0.06)",

        color: "white",

        cursor: "pointer",

        fontSize: 17,

        transition:

          "transform 0.15s ease",

      }}

    >

      {label}

    </button>

  );

}



/*

 * ---------------------------------------------------------

 * PAGE

 * ---------------------------------------------------------

 */



return (

  <main

    style={{

      minHeight: "100vh",

      background:

        "radial-gradient(circle at top, #17111f 0%, #080808 45%, #050505 100%)",

      color: "white",

      fontFamily:

        "Inter, system-ui, sans-serif",

      overflow: "hidden",

    }}

  >

    <nav

      style={{

        height: 68,

        borderBottom:

          "1px solid rgba(255,255,255,0.08)",

        display: "flex",

        alignItems: "center",

        justifyContent: "space-between",

        padding: "0 28px",

        background:

          "rgba(5,5,5,0.75)",

        backdropFilter:

          "blur(18px)",

      }}

    >

      <Link

        href="/dashboard"

        style={{

          textDecoration: "none",

          color: "white",

          fontSize: 22,

          fontWeight: 800,

          letterSpacing: "-0.03em",

        }}

      >

        IRL

      </Link>



      <div

        style={{

          display: "flex",

          alignItems: "center",

          gap: 18,

        }}

      >

        <div

          style={{

            padding:

              "7px 12px",

            borderRadius: 10,

            background:

              "rgba(255,255,255,0.05)",

            border:

              "1px solid rgba(255,255,255,0.08)",

            color:

              "rgba(255,255,255,0.75)",

            fontSize: 12,

            fontWeight: 600,

          }}

        >

          {connectionStatus}

        </div>



        <div

          style={{

            color:

              "rgba(255,255,255,0.55)",

            fontSize: 13,

          }}

        >

          {formatCallDuration(

            callDuration

          )}

        </div>

      </div>

    </nav>



    <section

      style={{

        height:

          "calc(100vh - 68px)",

        display: "flex",

        flexDirection: "column",

        position: "relative",

      }}

    >

      <div

        style={{

          display: "flex",

          alignItems: "center",

          justifyContent: "space-between",

          padding:

            "18px 28px",

          borderBottom:

            "1px solid rgba(255,255,255,0.06)",

          background:

            "rgba(0,0,0,0.2)",

        }}

      >

        <div>

          <div

            style={{

              fontSize: 11,

              color:

                "rgba(255,255,255,0.45)",

              textTransform:

                "uppercase",

              letterSpacing:

                "0.12em",

              marginBottom: 5,

            }}

          >

            Room

          </div>



          <div

            style={{

              display: "flex",

              alignItems: "center",

              gap: 10,

            }}

          >

            <span

              style={{

                fontSize: 18,

                fontWeight: 700,

              }}

            >

              {roomCode}

            </span>



            <button

              onClick={copyRoomCode}

              style={{

                border:

                  "1px solid rgba(255,255,255,0.1)",

                background:

                  "rgba(255,255,255,0.05)",

                color:

                  "rgba(255,255,255,0.75)",

                borderRadius: 8,

                padding:

                  "5px 9px",

                cursor: "pointer",

                fontSize: 11,

              }}

            >

              Copy

            </button>

          </div>

        </div>



        <div

          style={{

            display: "flex",

            gap: 8,

          }}

        >

          {Object.keys(remoteParticipants).map((socketId) => (
            <div
              key={socketId}
              style={{
                  padding: 12,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.05)",
                   marginBottom: 8,
           }}
  >
            <div
               style={{
           fontSize: 13,
         fontWeight: 600,
      }}
    >
      Participant
    </div>

    <div
      style={{
        fontSize: 11,
        color: "rgba(255,255,255,0.45)",
        marginTop: 3,
      }}
    >
      Connected
    </div>

    {isHost && (
      <div
        style={{
          display: "flex",
          gap: 6,
          marginTop: 10,
        }}
      >
        <button
          onClick={() => muteParticipant(socketId)}
          style={{
            padding: "6px 9px",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            background: "#222",
            color: "white",
            cursor: "pointer",
            fontSize: 11,
          }}
        >
          🔇 Mute
        </button>

        <button
          onClick={() => removeParticipant(socketId)}
          style={{
            padding: "6px 9px",
            border: "none",
            borderRadius: 8,
            background: "#ef4444",
            color: "white",
            cursor: "pointer",
            fontSize: 11,
          }}
        >
          ✕ Remove
        </button>
      </div>
    )}
  </div>
))}



          

        </div>

      </div>



      <div

        style={{

          flex: 1,

          minHeight: 0,

          display: "flex",

          position: "relative",

        }}

      >

        <div

          style={{

            flex: 1,

            minWidth: 0,

            padding: 20,

            display: "grid",

            gridTemplateColumns:

              Object.keys(

                remoteParticipants

              ).length > 0

                ? "repeat(auto-fit, minmax(280px, 1fr))"

                : "1fr",

            gap: 14,

          }}

        >

          <div

            style={{

              position: "relative",

              minHeight: 320,

              borderRadius: 20,

              overflow: "hidden",

              background: "#111",

              border:

                isSpeaking

                  ? "2px solid #a855f7"

                  : "1px solid rgba(255,255,255,0.08)",

              boxShadow:

                isSpeaking

                  ? "0 0 30px rgba(168,85,247,0.2)"

                  : "none",

            }}

          >

            <video

              ref={videoRef}

              autoPlay

              muted

              playsInline

              style={{

                width: "100%",

                height: "100%",

                objectFit: "cover",

                transform:

                  "scaleX(-1)",

                background: "#111",

              }}

            />



            {!cameraOn && (

              <div

                style={{

                  position:

                    "absolute",

                  inset: 0,

                  display: "flex",

                  alignItems:

                    "center",

                  justifyContent:

                    "center",

                  background:

                    "linear-gradient(135deg,#151515,#202020)",

                  fontSize: 48,

                  fontWeight: 700,

                }}

              >

                IRL

              </div>

            )}



            <div

              style={{

                position:

                  "absolute",

                left: 14,

                bottom: 14,

                padding:

                  "7px 10px",

                borderRadius: 9,

                background:

                  "rgba(0,0,0,0.65)",

                backdropFilter:

                  "blur(10px)",

                fontSize: 12,

                fontWeight: 600,

              }}

            >

              You

              {handRaised && (

                <span

                  style={{

                    marginLeft: 7,

                  }}

                >

                  ✋

                </span>

              )}

            </div>

          </div>



          {Object.entries(

            remoteParticipants

          ).map(

            ([socketId, participant]) => (

              <div

                key={socketId}

                style={{

                  position:

                    "relative",

                  minHeight: 320,

                  borderRadius: 20,

                  overflow:

                    "hidden",

                  background: "#111",

                  border:

                    "1px solid rgba(255,255,255,0.08)",

                }}

              >

                <RemoteVideo

                  stream={

                    participant.stream

                  }

                />



                <div

                  style={{

                    position:

                      "absolute",

                    left: 14,

                    bottom: 14,

                    padding:

                      "7px 10px",

                    borderRadius: 9,

                    background:

                      "rgba(0,0,0,0.65)",

                    backdropFilter:

                      "blur(10px)",

                    fontSize: 12,

                    fontWeight: 600,

                  }}

                >

                  Participant

                </div>

              </div>

            )

          )}

        </div>



        {peopleOpen && (

          <aside

            style={{

              width: 280,

              borderLeft:

                "1px solid rgba(255,255,255,0.07)",

              background:

                "rgba(10,10,10,0.96)",

              padding: 18,

              overflowY: "auto",

            }}

          >

            <h3

              style={{

                margin:

                  "0 0 18px",

                fontSize: 15,

              }}

            >

              Participants

            </h3>



            <div

              style={{

                padding: 12,

                borderRadius: 12,

                background:

                  "rgba(255,255,255,0.05)",

                marginBottom: 8,

              }}

            >

              <div

                style={{

                  fontSize: 13,

                  fontWeight: 600,

                }}

              >

                You

              </div>

              <div

                style={{

                  fontSize: 11,

                  color:

                    "rgba(255,255,255,0.45)",

                  marginTop: 3,

                }}

              >

                {micOn

                  ? "Microphone on"

                  : "Muted"}

              </div>

            </div>



            {Object.keys(

              remoteParticipants

            ).map((socketId) => (

              <div

                key={socketId}

                style={{

                  padding: 12,

                  borderRadius: 12,

                  background:

                    "rgba(255,255,255,0.05)",

                  marginBottom: 8,

                }}

              >

                <div

                  style={{

                    fontSize: 13,

                    fontWeight: 600,

                  }}

                >

                  Participant

                </div>

                <div

                  style={{

                    fontSize: 11,

                    color:

                      "rgba(255,255,255,0.45)",

                    marginTop: 3,

                  }}

                >

                  Connected

                </div>

              </div>

            ))}

          </aside>

        )}



        {chatOpen && (

          <aside

            style={{

              width: 320,

              borderLeft:

                "1px solid rgba(255,255,255,0.07)",

              background:

                "rgba(10,10,10,0.96)",

              display: "flex",

              flexDirection: "column",

            }}

          >

            <div

              style={{

                padding:

                  "18px 18px 14px",

                borderBottom:

                  "1px solid rgba(255,255,255,0.07)",

              }}

            >

              <h3

                style={{

                  margin: 0,

                  fontSize: 15,

                }}

              >

                Chat

              </h3>

            </div>



            <div

              style={{

                flex: 1,

                overflowY: "auto",

                padding: 14,

              }}

            >

              {messages.length === 0 ? (

                <div

                  style={{

                    color:

                      "rgba(255,255,255,0.4)",

                    fontSize: 12,

                    textAlign:

                      "center",

                    paddingTop: 30,

                  }}

                >

                  No messages yet.

                </div>

              ) : (

                messages.map(

                  (item, index) => (

                    <div

                      key={index}

                      style={{

                        marginBottom: 12,

                      }}

                    >

                      <div

                        style={{

                          fontSize: 10,

                          color:

                            "rgba(255,255,255,0.4)",

                          marginBottom: 3,

                        }}

                      >

                        {item.sender}

                      </div>

                      <div

                        style={{

                          padding:

                            "9px 11px",

                          borderRadius: 10,

                          background:

                            item.sender ===

                            "You"

                              ? "rgba(139,92,246,0.2)"

                              : "rgba(255,255,255,0.06)",

                          fontSize: 12,

                          lineHeight: 1.5,

                          wordBreak:

                            "break-word",

                        }}

                      >

                        {item.text}

                      </div>

                    </div>

                  )

                )

              )}

            </div>



            <div

              style={{

                padding: 12,

                borderTop:

                  "1px solid rgba(255,255,255,0.07)",

                display: "flex",

                gap: 8,

              }}

            >

              <input

                value={message}

                onChange={(event) =>

                  setMessage(

                    event.target.value

                  )

                }

                onKeyDown={(event) => {

                  if (

                    event.key ===

                    "Enter"

                  ) {

                    sendMessage();

                  }

                }}

                placeholder="Type a message..."

                style={{

                  flex: 1,

                  minWidth: 0,

                  background:

                    "rgba(255,255,255,0.06)",

                  border:

                    "1px solid rgba(255,255,255,0.08)",

                  borderRadius: 10,

                  color: "white",

                  padding:

                    "10px 11px",

                  outline: "none",

                  fontSize: 12,

                }}

              />



              <button

                onClick={sendMessage}

                style={{

                  border: "none",

                  borderRadius: 10,

                  padding:

                    "0 13px",

                  background:

                    "#8b5cf6",

                  color: "white",

                  cursor: "pointer",

                  fontWeight: 700,

                }}

              >

                Send

              </button>

            </div>

          </aside>

        )}

      </div>



      <div

        style={{

          minHeight: 82,

          borderTop:

            "1px solid rgba(255,255,255,0.07)",

          background:

            "rgba(5,5,5,0.92)",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          padding: "14px 20px",

        }}

      >

        <div

          style={{

            display: "flex",

            alignItems: "center",

            gap: 10,

          }}

        >

          <ControlButton

            active={micOn}

            onClick={toggleMic}

            label={

              micOn

                ? "🎙"

                : "🔇"

            }

            title={

              micOn

                ? "Mute microphone"

                : "Unmute microphone"

            }

          />



          <ControlButton

            active={cameraOn}

            onClick={toggleCamera}

            label="📹"

            title={

              cameraOn

                ? "Turn camera off"

                : "Turn camera on"

            }

          />



          <ControlButton

            active={screenSharing}

            onClick={toggleScreenShare}

            label="🖥"

            title={

              screenSharing

                ? "Stop screen sharing"

                : "Share screen"

            }

          />



          <ControlButton

            active={handRaised}

            onClick={toggleRaiseHand}

            label="✋"

            title={

              handRaised

                ? "Lower hand"

                : "Raise hand"

            }

          />



          <ControlButton

            active={chatOpen}

            onClick={() =>

              setChatOpen(

                (previous) =>

                  !previous

              )

            }

            label="💬"

            title="Chat"

          />



          <ControlButton

            active={peopleOpen}

            onClick={() =>

              setPeopleOpen(

                (previous) =>

                  !previous

              )

            }

            label="👥"

            title="Participants"

          />



          <ControlButton

            active={false}

            danger

            onClick={endCall}

            label="🛑"

            title="Leave call"

          />

          <ControlButton
                active={recording}

                onClick={toggleRecording}

                label={recording ? "⏹" : "⏺"}

                title={recording ? "Stop recording" : "Start recording"}
          />

        </div>

      </div>



      {mediaError && (

        <div

          style={{

            position:

              "absolute",

            left: "50%",

            bottom: 100,

            transform:

              "translateX(-50%)",

            maxWidth: 500,

            padding:

              "12px 16px",

            borderRadius: 12,

            background:

              "rgba(239,68,68,0.12)",

            border:

              "1px solid rgba(239,68,68,0.25)",

            color: "#fca5a5",

            fontSize: 12,

            textAlign: "center",

          }}

        >

          {mediaError}

        </div>

      )}

    </section>

  </main>

);
}