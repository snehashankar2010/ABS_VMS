import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/imgs/logo.png';
import './Playback.css';
import { fetchCameraList, fetchDummyData } from '../../data/json-lists';
import video from '../../data/Video2.mp4';

const Playback = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [cameraId, setCameraId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showTable, setShowTable] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedPlaybackRow, setSelectedPlaybackRow] = useState(null); // New state for selected playback row
  const [currentPage, setCurrentPage] = useState(1);
  const [cameraList, setCameraList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('authenticated');
    setAuthenticated(loggedInUser === 'true');
    fetchCameraList().then((data) => {
      setCameraList(data);
    });
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.setItem('authenticated', false);
    setAuthenticated(false);
    navigate('/login');
  };

  if (!authenticated) {
    navigate('/login', { replace: true });
    return null;
  }

  const handleCameraChange = (event) => {
    setCameraId(event.target.value);
  };

  const handleStartDateChange = (event) => {
    const selectedStartDate = new Date(event.target.value).getTime();
    setStartDate(event.target.value);

    // Disable previous dates in the end date dropdown
    const updatedCameraList = cameraList.map((camera) => {
      if (camera.id === cameraId) {
        const updatedCamera = { ...camera };
        updatedCamera.availableDates = updatedCamera.availableDates.filter((date) => {
          const timestamp = new Date(date).getTime();
          return timestamp >= selectedStartDate;
        });
        return updatedCamera;
      }
      return camera;
    });

    setCameraList(updatedCameraList);

    // Reset end date if it's before the selected start date
    const selectedEndDate = new Date(endDate).getTime();
    if (selectedEndDate < selectedStartDate) {
      setEndDate('');
    }
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const handleClearAll = () => {
    setCameraId('');
    setStartDate('');
    setEndDate('');
    setSelectedRows([]);
    setSelectedPlaybackRow(null); // Reset selected playback row
    setCurrentPage(1);
    setShowTable(false);
    setSelectedVideo(null);
  };

  const handleSubmit = () => {
    if (cameraId && startDate && endDate) {
      fetchDummyData(cameraId).then((data) => {
        setTableData(data);
        setShowTable(true);
        setCurrentPage(1);
      });
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= 30) {
      setCurrentPage(page);
    }
  };

  const handleRefresh = () => {
    setSelectedRows([]);
    setSelectedPlaybackRow(null); // Reset selected playback row
    setSelectedVideo(null);
  };

  const handleRowDownload = (event, row) => {
    if (event.target.checked) {
      setSelectedRows([...selectedRows, row]);
    } else {
      setSelectedRows(selectedRows.filter((selectedRow) => selectedRow !== row));
    }
  };

  const handlePlaybackRowSelect = (event, row) => {
    if (selectedPlaybackRow === row) {
      setSelectedPlaybackRow(null);
      setSelectedRows([]);
      setSelectedVideo(null);
    } else {
      setSelectedPlaybackRow(row);
      setSelectedRows([]);
      setSelectedVideo(row);
    }
  };  

  const handleDownload = () => {
    const selectedVideos = tableData.filter((item) => selectedRows.includes(item.id));
    selectedVideos.forEach((video) => {
      const url = `/api/download/${video.videoName}`;
      window.open(url, '_blank');
    });
  };

  return (
    <div>
      <div className="sidebar">
        <img src={logo} alt="Logo" />
        <button onClick={() => handleNavigation('/dashboard')}>Dashboard</button>
        <button onClick={() => handleNavigation('/playback')}>Playback</button>
        <button onClick={() => handleNavigation('/add-stream')}>Add Stream</button>
        <button onClick={() => handleNavigation('/video-analytics')}>Video Analytics</button>
        <button onClick={() => handleNavigation('/stream-settings')}>ONVIF Settings</button>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div className="body-text">
        <div className="header">
          <h1>Playback</h1>
          <br />
        </div>
        <div className="video-monitoring-system">
          {showTable && (
            <div className="video-playback-shell">
              {selectedVideo ? (
                <video controls>
                  <source src={video} type="video/mp4" />
                </video>
              ) : (
                <div className="empty-shell"></div>
              )}
            </div>
          )}

          {showTable && (
            <div className="database-table">
              <table>
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Size</th>
                    <th>Time Stamps</th>
                    <th>Stream Length</th>
                    <th>Video Name</th>
                    <th>Download</th>
                  </tr>
                </thead>
                <tbody>
                {tableData.slice((currentPage - 1) * 5, currentPage * 5).map((item) => (
                   <tr
                      key={item.id}
                      className={selectedPlaybackRow === item ? 'highlighted-row' : ''}
                      onClick={(event) => handlePlaybackRowSelect(event, item)}
                   >
                  <td>{item.id}</td>
                  <td>{item.size}</td>
                  <td>{item.timestamps}</td>
                  <td>{item.streamLength}</td>
                  <td>{item.videoName}</td>
                  <td>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(item.id)}
                        onChange={(event) => handleRowDownload(event, item.id)}
                      />
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
              <div className="navigation-footer">
                <div className="page-count">
                  Page Count <span className="page-count-box">30</span>
                </div>
                <div className="page-navigation-arrows">
                  <button onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
                    |&lt;
                  </button>
                  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                    &lt;&lt;
                  </button>
                  <div className="current-page">{`${currentPage}/30`}</div>
                  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === 30}>
                    &gt;&gt;
                  </button>
                  <button onClick={() => handlePageChange(30)} disabled={currentPage === 30}>
                    &gt;|
                  </button>
                </div>
                <div className="refresh-button">
                  <button onClick={handleRefresh} disabled={selectedRows.length === 0 && !selectedPlaybackRow}>
                    Refresh
                  </button>
                  <button onClick={handleDownload} disabled={selectedRows.length === 0}>
                    Download
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="menu-bar">
            <div className="selection-section">
              <select value={cameraId} onChange={handleCameraChange}>
                <option value="" disabled selected>
                  Select a camera
                </option>
                {cameraList.map((camera) => (
                  <option key={camera.id} value={camera.id}>
                    {camera.name}
                  </option>
                ))}
              </select>
              <span style={{ textDecoration: 'underline', fontWeight: '700' }}>
                Choose Playback Date & Time:
              </span>
              <div>
                <span>Start:</span>
                <input type="datetime-local" value={startDate} onChange={handleStartDateChange} />
              </div>
              <div>
                <span>End:</span>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={handleEndDateChange}
                  min={startDate}
                  disabled={!startDate}
                />
              </div>
            </div>
            <div className="button-section">
              <button onClick={handleClearAll}>Clear All</button>
              <button onClick={handleSubmit} disabled={!cameraId || !startDate || !endDate}>
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="footer">
        <div className="copyright">
          &copy; 2023 Arcturus Business Solutions
        </div>
      </div>
    </div>
  );
};

export default Playback;