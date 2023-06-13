import { createContext, useState, useEffect } from 'react';
import excelpath from "../../data/CCTVIP.xlsx"
import * as XLSX from 'xlsx';

const VideoSourcesContext = createContext();

export const VideoSourcesProvider = ({ children }) => {
  const [videoSources, setVideoSources] = useState([]);

  useEffect(() => {
    const parseExcelSheet = async () => {
      try {
        // Load the Excel file
        const workbook = XLSX.readFile(excelpath);

        // Assuming the video sources are in the first column (A)
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Extract the video source paths, excluding the first row (heading)
        const parsedVideoSources = sheetData.slice(1).map((row) => row[0]);
        setVideoSources(parsedVideoSources);
        window.prompt('Parsed Video Sources:', JSON.stringify(parsedVideoSources));
        console.log('Parsed Video Sources:', parsedVideoSources);

      } catch (error) {
        console.error('Error parsing Excel sheet:', error);
      }
    };

    parseExcelSheet();
  }, []);

  const addVideoSource = (source) => {
    setVideoSources((prevSources) => [...prevSources, source]);
  };

  const deleteVideoSource = (index) => {
    setVideoSources((prevSources) => {
      const updatedSources = [...prevSources];
      updatedSources.splice(index, 1);
      return updatedSources;
    });
  };

  return (
    <VideoSourcesContext.Provider value={{ videoSources, addVideoSource, deleteVideoSource }}>
      {children}
    </VideoSourcesContext.Provider>
  );
};

export default VideoSourcesContext;

