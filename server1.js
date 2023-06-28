const express = require('express');
const onvif = require('onvif');
const cors = require('cors');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const fs = require('fs');

const app = express();
const lport = 7000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request body

app.get('/', (req, res) => {
  const cam = new onvif.Cam({
    hostname: '192.168.0.104',
    port: 8080,
    username: 's',
    password: 's',
  });

  cam.connect((err, camera, stream, xml) => {
    if (err) {
      console.error('Error connecting to the device:', err);
      res.status(500).send('Error connecting to the device');
      return;
    }
    console.log('Connected to the device:', camera);

    if (typeof cam.getImagingSettings === 'function') {
      console.log('getImagingSettings operation is supported by the device');

      // Call the getImagingSettingsOptions operation here
     cam.getVideoSourceOptions((err, options) => {
        if (err) {
          console.error('Error retrieving imaging settings options:', err);
          res.status(500).send('Error retrieving imaging settings options');
          return;
        }

        console.log('Imaging settings options:', options);

        const focusModes = options.focus.autoFocusModes;

        console.log('Supported focus modes:', focusModes);
        res.status(200).json(focusModes);
      });
    } else {
      console.log('getImagingSettings operation is not supported by the device');
      res.status(500).send('getImagingSettings operation is not supported by the device');
    }
  });
});

app.listen(lport, () => {
  console.log(`Server listening on port ${lport}`);
});
