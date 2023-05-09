const Ffmpeg = require('fluent-ffmpeg');
const mqtt = require('mqtt')
const client  = mqtt.connect('mqtt://' + process.env.MQTT_HOST);

// const STREAM_URL = 'http://icecast.radio24.ch/radio24-rc-96-aac';
const STREAM_URL = process.env.STREAM_URL;
let lastSent = 0;

getMeanVolume(STREAM_URL, function callback(meanVolume){
  console.log('volume', meanVolume)
  if(Math.abs(lastSent - meanVolume) > 5){
    console.log('Sending volume to MQTT');
    client.publish('audio-detector/' + process.env.NAME, '' + meanVolume);
    lastSent = meanVolume;
  }
  getMeanVolume(STREAM_URL, callback);
});

function getMeanVolume(streamUrl, callback){
 new Ffmpeg({ source: streamUrl })
  .withAudioFilter('volumedetect')
  .addOption('-f', 'null')
  .addOption('-t', '3') // duration
  .noVideo()
  .on('start', function(ffmpegCommand){
    // console.log('Output the ffmpeg command', ffmpegCommand);
  })
  .on('end', function(stdout, stderr){
   
   // find the mean_volume in the output
    let meanVolumeRegex = stderr.match(/mean_volume:\s(-?\d*(\.\d+)?)/);

    console.log(stderr, meanVolumeRegex);
   
    // return the mean volume
    if(meanVolumeRegex){
      let meanVolume = parseFloat(meanVolumeRegex[1]);
      return callback(meanVolume);
    }
   
    // if the stream is not available
    if(stderr.match(/Server returned 404 Not Found/)){
      return callback(false);
    }
 })
 .saveToFile('/dev/null');
}
