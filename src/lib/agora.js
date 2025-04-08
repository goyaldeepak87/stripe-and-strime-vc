import AgoraRTC from 'agora-rtc-sdk-ng';

export const createAgoraClient = () =>
  AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

export const createTracks = async () => {
  return await AgoraRTC.createMicrophoneAndCameraTracks();
};