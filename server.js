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
  res.send('ONVIF Device API.');
});
app.use('/stream-segments', express.static('stream-segments'));

function connectToDevice(ip, port, username, password, callback) {
  const cam = new onvif.Cam({
    hostname: ip,
    port: port,
    username: username,
    password: password
  });

  cam.connect((err, camera, stream, xml) => {
    if (err) {
      console.error('Error connecting to the device:', err);
      callback(err);
      return;
    }

    console.log('Connected to the device');
    callback(null, cam, camera, stream, xml);
  });
}

function getPTZService(cam, callback) {
  cam.getCapabilities((err, capabilities) => {
    if (err) {
      console.error('Error retrieving capabilities:', err);
      callback(err, null);
      return;
    }
    const ptzCapabilities = capabilities.PTZ;    
    if (ptzCapabilities) {
      callback(null, ptzCapabilities);
    } else {
      callback(new Error('PTZ capabilities not found.'), null);
    }
  });
}

function setHomePosition(cam) {
  cam.setHomePosition({}, (error, result, xml) => {
    if (error) {
      console.error('Failed to set the home position.');
    } else {
      console.log('Home position set successfully!');
    }
  });
}


// Function to create output directory if it doesn't exist
function createOutputDirectory(outputDirectory) {
  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true });
  }
}

// Function to transcode RTSP stream to HLS format using FFmpeg
function transcodeStream(streamUri, outputPath, outputOptions) {
  const ffmpegCommand = ffmpeg(streamUri)
    .inputOptions('-rtsp_transport', 'tcp')
    .outputOptions('-c:v copy')
    .outputOptions(...outputOptions)
    .output(outputPath);

  ffmpegCommand.on('start', () => {
    console.log('Transcoding stream...');
  });

  ffmpegCommand.on('error', (err) => {
    console.error('Error transcoding stream:', err);
  });

  ffmpegCommand.run();
}

app.post("/initial-imaging-settings", function(req, res) {
    const { devices } = req.body;
    connectToDevice(devices.ip, devices.port, devices.username, devices.password, (err, cam) => {
      if (err) {
        return res.status(500).send('Error connecting to the device');
      }
      console.log('Initial Image Settings Set');
    cam.getImagingSettings(function(err, settings) {
      if (err) {
        res.status(500).json({ error: "Failed to retrieve initial imaging settings" });
      } else {
        res.json(settings);
      }
    });
  });
});

const initialSetup = async (req, res) => {
  const { ip, username, password, port } = req.body;
  console.log(ip,port, username, password);
  try {
    connectToDevice(ip, port, username, password, async (err, cam, camera, stream, xml) => {
      if (err) {
        console.error('Error connecting to the device:', err);
        res.status(500).send('Error connecting to the device');
        return;
      }

      getPTZService(cam, async (err, ptzService) => {
        if (err) {
          console.error('Error retrieving PTZ service:', err);
          res.status(500).send('Error retrieving PTZ service');
          return;
        }

        if (ptzService) {
          setHomePosition(cam);
        } else {
          console.error('The camera does not have the PTZ service');
        }
      });

      cam.getStreamUri({ protocol: 'RTSP' }, async (err, stream) => {
        if (err) {
          console.error('Error retrieving stream URI:', err);
          res.status(500).send('Error retrieving stream URI');
          return;
        }

        if (username || password) {
          const modifiedStreamUri = `rtsp://${username}:${password}@${stream.uri.split('://')[1]}`;
          stream.uri = modifiedStreamUri;
        }

        console.log('Stream URI:', stream.uri);

        const ipFolder = `${ip}_${port}`;
        const outputDirectory = `stream-segments/${ipFolder}`;

        createOutputDirectory(outputDirectory);

        const outputFilename = 'stream.m3u8';
        const outputPath = `${outputDirectory}/${outputFilename}`;
        const streamUrl = `http://localhost:${lport}/${outputPath}`;

        const outputOptions = [
          '-preset', 'ultrafast',
          '-hls_time', '0.5',
          '-hls_list_size', '2',
          '-hls_flags', 'delete_segments'
        ];

        transcodeStream(stream.uri, outputPath, outputOptions);
        console.log('Stream URI:', streamUrl);

        res.json({
          name: cam.name,
          ip: cam.hostname,
          username: cam.username,
          password: cam.password,
          port: cam.port,
          stream: streamUrl,
        });
      });
    });
  } catch (error) {
    console.error('Error connecting to the device:', error);
    res.status(500).send('Error connecting to the device');
  }
};

function handleSnapshot(req, res) {
  const { devices } = req.body;
  connectToDevice(devices.ip, devices.port, devices.username, devices.password, (err, cam) => {
    if (err) {
      return res.status(500).send('Error connecting to the device');
    }
    console.log('Taking Snapshot');
    cam.getSnapshotUri({}, (err, result) => {
      if (err) {
        return res.status(500).send('Error obtaining snapshot URI');
      }
      res.send({ snapshotUri: result.uri });
    });
  });
}

function handleContinuousMove(req, res, directions) {
  const { devices } = req.body;
  connectToDevice(devices.ip, devices.port, devices.username, devices.password, (err, cam) => {
    if (err) {
      return res.status(500).send('Error connecting to the device');
    }
  
    const [val1, val2, val3] = directions;

    cam.continuousMove({ x: val1, y: val2, zoom: val3 }, (err) => {
      if (err) {
        console.error('Error setting movement:', err.message);
        return res.status(500).send('Error setting movement');
      }

      // Wait for a brief period to allow the camera to move
      setTimeout(() => {
        cam.stop((err) => {
          if (err) {
            console.error('Error stopping movement:', err.message);
            return res.status(500).send('Error stopping movement');
          }
          res.json({ value: 'Movement set successfully' });
        });
      }, 1000); // Adjust the timeout value as needed
    });
  });
}

function handleZoom(req, res, value) {
  const val = (value === '+') ? 0.1 : -0.1;
  console.log("Zoom", value);
  handleContinuousMove(req, res, [0,0, val]);
}

function handleSetting(req, res, setting, message) {
  const { devices, value } = req.body;
  connectToDevice(devices.ip, devices.port, devices.username, devices.password, (err, cam) => {
    if (err) {
      return res.status(500).send('Error connecting to the device');
    }
    console.log(setting,value);
    const options = {
      [setting]: value
    };

    cam.setImagingSettings(options, (err) => {
      if (err) {
        console.error(`Error setting ${setting}:`, err.message);
        return res.status(500).send(`Error setting ${setting}`);
      }
      res.json({ value: `${message} set successfully` });
    });
  });
}

function handlePanTilt(req, res) {
  const { direction } = req.body;
  let val1 = 0;
  let val2 = 0;
  console.log('Move',direction);
  if (direction.includes('up')) {
    val2 = 0.1;
    if (direction.includes('left')) {
      val1 = -0.1;
    } else if (direction.includes('right')) {
      val1 = 0.1;
    }
  } else if (direction.includes('down')) {
    val2 = -0.1;
    if (direction.includes('left')) {
      val1 = -0.1;
    } else if (direction.includes('right')) {
      val1 = 0.1;
    }
  } else if (direction.includes('right')) {
    val1 = 0.1;
  } else if (direction.includes('left')) {
    val1 = -0.1;
  }
  handleContinuousMove(req, res, [val1, val2,0]);
}

function handleHome(req, res) {
  const { devices } = req.body;
  connectToDevice(devices.ip, devices.port, devices.username, devices.password, (err, cam) => {
    if (err) {
      return res.status(500).send('Error connecting to the device');
    }
    console.log('Moving to Home Position');

    getPTZService(cam, (err, ptzService) => {
      if (err) {
        return res.status(500).send('Error retrieving PTZ service');
      }

      if (ptzService) {
        cam.gotoHomePosition({}, (error) => {
          if (error) {
            console.error('Failed to go to the home position:', error);
            return res.status(500).send('Failed to go to the home position');
          }
          res.json({ value: 'Home position set successfully' });
        });
      } else {
        console.error('The camera does not have the PTZ service');
        res.json({ value: 'The camera does not have the PTZ service' });
      }
    });
  });
}

function handleZIGF(req, res) {
  const { action, value } = req.body;
  switch (action) {
    case 'zoom':
      handleZoom(req, res, value);
      break;
    case 'iris':
      handleSetting(req, res, 'iris', 'Iris');
      break;
    case 'gain':
      handleSetting(req, res, 'gain', 'Gain');
      break;
    case 'focus':
      handleSetting(req, res, 'focus', 'Focus');
      break;
    default:
      res.status(400).send('Invalid action');
  }
}

function handleImageSettings(req, res) {
  const { action } = req.body;
  switch (action) {
    case 'brightness':
      handleSetting(req, res, 'brightness', 'Brightness');
      break;
    case 'saturation':
      handleSetting(req, res, 'colorSaturation', 'Saturation');
      break;
    case 'contrast':
      handleSetting(req, res, 'contrast', 'Contrast');
      break;
    case 'sharpness':
      handleSetting(req, res, 'sharpness', 'Sharpness');
      break;
    default:
      res.status(400).send('Invalid action');
  }
}

function handlePreset(req, res) {
  const { action, devices, preset } = req.body;
  connectToDevice(devices.ip, devices.port, devices.username, devices.password, (err, cam) => {
    if (err) {
      return res.status(500).send('Error connecting to the device');
    }

    console.log(action, 'Preset', preset);
    getPTZService(cam, (err, ptzService) => {
      if (err) {
        return res.status(500).send('Error retrieving PTZ service');
      }

      if (!ptzService) {
        console.error('The camera does not have the PTZ service');
        return res.status(500).send('The camera does not have the PTZ service');
      }

      const handlePresetAction = (presetAction, message) => {
        const presetToken = `Preset${preset}`;
        cam[presetAction]({ presetToken }, (err) => {
          if (err) {
            console.error(`Error in setting preset`);
            return res.status(500).send(`Error in setting preset`);
          }
          res.json({ value: `${message} successfully` });
        });
      };

      if (action.includes('Add')) {
        handlePresetAction('setPreset', 'Preset added');
      } else if (action.includes('Delete')) {
        handlePresetAction('removePreset', 'Preset deleted');
      } else if (action.includes('Goto')) {
        handlePresetAction('gotoPreset', 'Went to preset');
      }
    });
  });
}


app.post('/initial-setup',initialSetup);
app.post('/snapshot', handleSnapshot);
app.post('/home', handleHome);
app.post('/pan-tilt', handlePanTilt);
app.post('/ZIGF', handleZIGF);
app.post('/image-settings', handleImageSettings);
app.post('/preset', handlePreset);

app.listen(lport, () => {
  console.log(`Server running on port ${lport}`);
});

