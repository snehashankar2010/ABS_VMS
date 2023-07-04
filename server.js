const express = require('express'); // Express framework for building the API
const onvif = require('onvif'); // Library for handling ONVIF devices
const cors = require('cors'); // Middleware for enabling CORS
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path; // Path to FFmpeg binary
const ffmpeg = require('fluent-ffmpeg'); // Library for interacting with FFmpeg
ffmpeg.setFfmpegPath(ffmpegPath);
const fs = require('fs-extra'); // File system module for handling file operations

// Create Express application
const app = express();

// Set the port for the server
const lport = 7000;

// Enable CORS for all routes
app.use(cors());

// Parse JSON request body
app.use(express.json());

// Define the default route
app.get('/', (req, res) => {
  res.send('ONVIF Device API.');
});

// Serve static files from the 'stream-segments' directory
app.use('/stream-segments', express.static('stream-segments'));

// Function to connect to an ONVIF device
function connectToDevice(ip, port, username, password, callback) {
  // Create a new ONVIF camera object
  const cam = new onvif.Cam({
    hostname: ip,
    port: port,
    username: username,
    password: password
  });
  // Connect to the ONVIF device
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

// Function to create the output directory if it doesn't exist
async function createOutputDirectory(outputDirectory) {
  if (await fs.pathExists(outputDirectory)) {
    await fs.remove(outputDirectory);
  }
  await fs.mkdirp(outputDirectory);
}

// Function to transcode an RTSP stream to HLS format using FFmpeg
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

// Function to retrieve PTZ (Pan-Tilt-Zoom) service capabilities
function getPTZService(cam, callback) {
  cam.getCapabilities((err, capabilities) => {
    if (err) {
      console.error('Error retrieving capabilities:', err);
      if (callback) {
        callback(err, null);
      }
      return;
    }
    const ptzCapabilities = capabilities?.PTZ;
    if (ptzCapabilities) {
      if (callback) {
        callback(null, ptzCapabilities);
      }
    } else {
      console.warn('PTZ capabilities not found.');
      if (callback) {
        callback(null, null);
      }
    }
  });
}

// Handle initial setup for any camera using its ip,port,username and password
const initialSetup = async (req, res) => {
  const { ip, username, password, port } = req.body;
  console.log(ip,port, username, password);
  try {
    // Connect to the ONVIF device
    connectToDevice(ip, port, username, password, async (err, cam, camera, stream, xml) => {
      if (err) {
        console.error('Error connecting to the device:', err);
        res.status(500).send('Error connecting to the device');
        return;
      }
      // Retrieve the RTSP stream URI
      cam.getStreamUri({ protocol: 'RTSP' }, async (err, stream) => {
        if (err) {
          console.error('Error retrieving stream URI:', err);
          res.status(500).send('Error retrieving stream URI');
          return;
        }
        // Modify the stream URI with username and password if provided
        if (username || password) {
          const modifiedStreamUri = `rtsp://${username}:${password}@${stream.uri.split('://')[1]}`;
          stream.uri = modifiedStreamUri;
        }
        console.log('Stream URI:', stream.uri);

        const ipFolder = `${ip}_${port}`;        
        const outputDirectory = `stream-segments/${ipFolder}`;

        // Create the output directory
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

        // Transcode the stream to HLS format using FFmpeg
        transcodeStream(stream.uri, outputPath, outputOptions);
        console.log('Stream URI:', streamUrl);
        res.json({
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

// Function to retrieve the range of image options supported by the camera
function getImageRange(cam, callback) {
  cam.getVideoSourceOptions((err, options) => {
    if (err) {
      console.error('Error retrieving options:', err);
      if (callback) {
        callback(err, null);
      }
      return;
    }

    if (!options) {
      console.warn('Image Options not found or incomplete.');
      if (callback) {
        callback(null, null);
      }
      return;
    }
    // Extract the minimum and maximum values for various image options
    const imageOptions = {
      brightness: {
        min: options.brightness?.min,
        max: options.brightness?.max
      },
      contrast: {
        min: options.contrast?.min,
        max: options.contrast?.max
      },
      saturation: {
        min: options.colorSaturation?.min,
        max: options.colorSaturation?.max
      },
      sharpness: {
        min: options.sharpness?.min,
        max: options.sharpness?.max
      }
    };
    console.log(imageOptions)

    if (callback) {
      callback(null, imageOptions);
    }
  });
}

// Handle POST request for retrieving initial imaging settings
app.post("/initial-imaging-settings", function(req, res) {
  const { devices } = req.body;
  // Connect to the ONVIF device
  connectToDevice(devices.ip, devices.port, devices.username, devices.password, (err, cam) => {
    if (err) {
      return res.status(500).send('Error connecting to the device');
    }
    // Get the range of image options supported by the camera
    getImageRange(cam, (err, imageOptions) => {
      if (err) {
        console.error('Error retrieving Image Options:', err);
        return res.status(500).send('Error retrieving Image Options');
      }
      if (!imageOptions) {
        console.error('The camera does not have the Image max min Ranges');
        return res.status(500).send('Error retrieving Image Options');
      }
      // Get the current imaging settings
      cam.getImagingSettings(function(err, settings) {
        if (err) {
          return res.status(500).json({ error: "Failed to retrieve initial imaging settings" });
        }
        console.log("Setting Initial Image Settings")

        const response = {
          imageOptions: imageOptions,
          settings: settings
        };
        res.json(response);
      });
    });
  });
});

// Handle snapshot request
function handleSnapshot(req, res) {
  const { devices } = req.body;
  // Connect to the ONVIF device
  connectToDevice(devices.ip, devices.port, devices.username, devices.password, (err, cam) => {
    if (err) {
      return res.status(500).send('Error connecting to the device');
    }
    console.log('Taking Snapshot');
    // Retrieve the snapshot URI
    cam.getSnapshotUri({}, (err, result) => {
      if (err) {
        return res.status(500).send('Error obtaining snapshot URI');
      }
      res.send({ snapshotUri: result.uri });
    });
  });
}

// Handle continuous movement
function handleContinuousMove(req, res, directions) {
  const { devices } = req.body;
  // Connect to the ONVIF device
  connectToDevice(devices.ip, devices.port, devices.username, devices.password, (err, cam) => {
    if (err) {
      return res.status(500).send('Error connecting to the device');
    }
    const [val1, val2, val3] = directions;
    // Set the continuous movement of the camera
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
      }, 500); // Adjust the timeout value as needed
    });
  });
}

// Handle pan-tilt movement request
function handlePanTilt(req, res) {
  const { direction } = req.body;
  let val1 = 0;
  let val2 = 0;
  console.log('Move', direction);
  if (direction.includes('top')) {
    val2 = 0.2;
    if (direction.includes('left')) {
      val1 = -0.2;
    } else if (direction.includes('right')) {
      val1 = 0.2;
    }
  } else if (direction.includes('down')) {
    val2 = -0.2;
    if (direction.includes('left')) {
      val1 = -0.2;
    } else if (direction.includes('right')) {
      val1 = 0.2;
    }
  } else if (direction.includes('right')) {
    val1 = 0.2;
  } else if (direction.includes('left')) {
    val1 = -0.2;
  }
  handleContinuousMove(req, res, [val1, val2, 0]);
}

// Handle zoom request
function handleZoom(req, res, value) {
  const val = (value === '+') ? 0.01 : -0.01;
  console.log("Zoom", value);
  // Set continuous movement for zooming
  handleContinuousMove(req, res, [0, 0, val]);
}

// Handle Image setting change request
function handleSetting(req, res, setting, message) {
  const { devices, value } = req.body;
  // Connect to the ONVIF device
  connectToDevice(devices.ip, devices.port, devices.username, devices.password, (err, cam) => {
    if (err) {
      return res.status(500).send('Error connecting to the device');
    }
    console.log(setting, value);
    let adjustedValue;
    if (['iris', 'gain', 'focus'].includes(setting) && value === '+') {
      adjustedValue = 1;
    } else if (['iris', 'gain', 'focus'].includes(setting) && value === '-') {
      adjustedValue = -1;
    } else {
      adjustedValue = value;
    }
    const options = {
      [setting]: adjustedValue
    };    
    // Set the imaging settings
    cam.setImagingSettings(options, (err) => {
      if (err) {
        console.error(`Error setting ${setting}:`, err.message);
        return res.status(500).send(`Error setting ${setting}`);
      }
      res.json({ value: `${message} set successfully` });
    });
  });
}


// Handle Zoom, Iris, Gain, and Focus requests
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

// Handle Image Settings requests (Brightness, Saturation, Contrast, Sharpness)
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

// Handle home position request
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

// Handle Preset requests (Add, Delete, Goto)
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
        const presetName = `PRESET${preset}      `; // Use the preset name instead of preset token
        const options = { presetName }; // Pass the preset name in the options
      
        if (presetAction === 'gotoPreset') {
          options.speed = '1.0'; // Speed value for Goto Preset
        }        
        cam.getPresets((err, presets) => {
          if (err) {
            console.error('Error retrieving presets');
            return res.status(500).send('Error retrieving presets');
          }
          console.log(presetName);
          const presetToken = presets[presetName]; // Retrieve the preset token using the preset name
          if (!presetToken) {
            console.error(`Preset '${presetName}' does not exist`);
            return res.status(500).send(`Preset '${presetName}' does not exist`);
          }
          console.log(presetToken);
          options.presetToken = presetToken; // Assign the preset token to options      
          cam[presetAction](options, (err) => {
            if (err) {
              console.error(`Error in setting preset`);
             }      
            // Retrieve the presets after performing the preset action
            cam.getPresets((err, presets) => {
              if (err) {
                console.error('Error retrieving presets');
                return res.status(500).send('Error retrieving presets');
              } 
              const presetNames = Object.keys(presets);
              console.log(presetNames);
              res.json({ presets: presetNames, value: `${message} successfully` });
            });
          });
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

// Route handlers
app.post('/initial-setup', initialSetup);
app.post('/snapshot', handleSnapshot);
app.post('/home', handleHome);
app.post('/pan-tilt', handlePanTilt);
app.post('/ZIGF', handleZIGF);
app.post('/image-settings', handleImageSettings);
app.post('/preset', handlePreset);

app.listen(lport, () => {
  console.log(`Server running on port ${lport}`);
});
