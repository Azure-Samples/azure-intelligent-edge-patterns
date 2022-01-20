/**
 * Only show the first section of rtsp address
 * @param rtsp Camera RTSP
 */
export const maskRtsp = (rtsp) => rtsp.replace(/(rtsp:\/\/[\w]+)\.([\s\S])+/, '$1.**********');
