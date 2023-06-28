import cameraList from './cameraList.json';
import dummyData from './dummyData.json';

// Simulate an API call to fetch camera list
export function fetchCameraList() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(cameraList);
    }, 500);
  });
}

// Simulate an API call to fetch dummy data based on the selected camera ID
export function fetchDummyData(cameraId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = dummyData.filter((item) => item.cameraId === parseInt(cameraId));
      resolve(data);
    }, 500);
  });
}
