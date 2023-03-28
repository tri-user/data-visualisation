import React, { useRef, useState, useEffect } from "react";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import CircularProgress from "@mui/material/CircularProgress";
import { API_HEX, END_POINT, ERROR_CODE_400, API_HDFS } from "../../keys";
import axios from "axios";
import HexviewerComponent from "../Hexviewer/HexviewerComponent";
import style from "../../styles/dashboard.module.css";
import KaitaiComponent from "../Kaitai/KaitaiComponent";
import LoadingComponent from "../Loading/LoadingComponent";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import { useScreenshot, createFileName } from "use-react-screenshot";
import AnnotationContext from "../../contexts/AnnotationContext";
import { useRouter } from 'next/router'
import { showErrorToast, showInfoToast } from "../../utils";
import * as htmlToImage from 'html-to-image';
// import gzip from 'gzip-js';
// import { toPng } from 'html-to-image';

function DashboardComponent() {
  
  const screenshotRef = useRef();
  const screenshotLoadingRef = useRef();

  // const screenshotLoading = useRef();

  const [hexData, setHexData] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileData, setFileData] = useState(null);
  const [kaitaiData, setKaitaiData] = useState(null);
  const [isHdfs, setIsHdfs] = useState(false);
  const [hdfsPath, setHdfsPath] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [jumpAddress, setJumpAddress] = useState("");
  const [scrollOccured, setScrollOccured] = useState(false);
  // const [image, takeScreenShot] = useScreenshot({
  //   type: "image/jpeg",
  //   quality: 1.0,
  // });
  const dataUploadRef = useRef();
  const hexViewComponentRef = useRef();
  const onUploadButtonClicked = () => {
    dataUploadRef.current.value = null;
    dataUploadRef.current.click();
  };

  const saveScreenshot = () => {
    screenshotLoadingRef.current.style.display = 'inline-block';
    setTimeout(() => {
      // screenshotLoadingRef.current.removeAttribute('class');
      screenshotLoadingRef.current.removeAttribute('style');
      htmlToImage.toPng(screenshotRef.current)
      .then(function (dataUrl) {
        download(dataUrl);
      });
    }, 400);
  };

  const uploadToHdfs = () => {
    // setLoading(true);
    screenshotLoadingRef.current.style.display = 'inline-block';
    setTimeout(() => {
      // screenshotLoadingRef.current.removeAttribute('class');
      screenshotLoadingRef.current.removeAttribute('style');
      htmlToImage.toPng(screenshotRef.current)
      .then(uploadToApi);
    }, 400);
    // htmlToImage.toPng(screenshotRef.current).then(uploadToApi);
  };

  const uploadToApi = (
    image,
    { name = `screenshot-${new Date().getTime()}`, extension = "jpg" } = {}
  ) => {

    setLoading(true);
    // generate file from base64 string
    const file = dataURLtoFile(image);
    // put file into form data
    const data = new FormData();
    data.append('file', file, name + '.jpg');
    // data.append("temp_filename", tempHdfsFile);
    data.append('path', hdfsPath);
    // now upload
    const config = {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
    axios.post(END_POINT + API_HDFS, data, config)
    .then((res) => {
      setLoading(false);
      screenshotLoadingRef.current.style.display = 'none';
      if (res.data["status"] === ERROR_CODE_400) {
        throw JSON.stringify(res.data);
        return;
      }
      showInfoToast('Screenshot uploaded to INSPECTr storage');
    })
    .catch((err) => {
      console.log(err);
      setLoading(false);
      screenshotLoadingRef.current.style.display = 'none';
    });
  };
  const onFilesAdded = (e) => {
    handleUpload(e.target.files[0]);
    setFileData(e.target.files[0]);
  };

  const handleUpload = (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const config = {
      api: {
        bodyParser: {
            sizeLimit: '3gb' // Set desired value here
        }
    },
      headers: {
        "content-type": "multipart/form-data",
      },
    };
    getHexData(formData, config);
  };

  const getHexData = (formData, config) => {
    setLoading(true);
    axios
      .post(END_POINT + API_HEX, formData, config)
      .then((res) => {
        if (res.data["status"] === ERROR_CODE_400)
          throw JSON.stringify(res.data);

        setLoading(false);
        setHexData(res.data["body"]);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };
  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n) {
      u8arr[n - 1] = bstr.charCodeAt(n - 1)
      n -= 1 // to make eslint happy
    }
    return new File([u8arr], filename, { type: mime })
  }

  const download = (
    image,
    { name = `screenshot-${new Date().getTime()}`, extension = "png" } = {}
  ) => {
    const a = document.createElement("a");
    a.href = image;
    a.download = createFileName(extension, name);
    a.click();
    setIsLoading(false);
    setLoading(false);
    screenshotLoadingRef.current.style.display = 'none';
  };
  
  const scrollToAddress = (address) => {
    screenshotLoadingRef.current.style.display = 'inline-block';
    setTimeout(() => {
      (hexViewComponentRef.current.scrollToAddress(address))
    }, 300);
  }

  const getHexDataFromPath = async (path) => {
    setIsHdfs(true);
    setLoading(true);
    
    let chunkNumber = 0;
    let chunks = [];
    let shouldContinue = true;
    let chunkRequestLimit = 10
    let chunkLimitReached = false;
    
    try {
        while (shouldContinue && chunkNumber < chunkRequestLimit) {
            if ((chunkRequestLimit-1) == chunkNumber) {
              chunkLimitReached = true;
            }
            const res = await axios.get(END_POINT + API_HDFS, {
                headers: {
                    'Accept-Encoding': 'gzip, deflate',
                },
                params: {'path': path, 'chunk_number': chunkNumber, 'chunk_limit_reached': chunkLimitReached}
            });
            
            if (res.headers['content-encoding'] === 'gzip') {
                let data = new Uint8Array(res.data);
                let gz = new pako.Inflate({to: 'string'});
                gz.push(data, true);
                // let decodedData = gz.result;
                res = gz.result;
            }

            if (res.data["status"] === ERROR_CODE_400) {
                throw new Error(JSON.stringify(res.data.error));
            }
            
            chunks.push(res.data["body"]['hex']);
            chunkNumber++;

            if (!res.data['has_more']) {
              shouldContinue = false;
              break;
            }
        }
        
        setHexData(chunks.join(''));
        showInfoToast('Data loaded from HDFS');
    } catch (error) {
        console.error(error);
        showErrorToast('Error loading data from HDFS');
    } finally {
        setLoading(false);
    }
};


  const searchAddress = (event) => {
      event.preventDefault();
      scrollToAddress(jumpAddress);
      // setResult(newResult);
  }
  
  const trimString = (str) => {
    if (str.length <= 95) return str;
    let start = str.slice(0, 47);
    let end = str.slice(str.length - 47);
    return `${start}.....${end}`;
  };

  const scrollHappened = () => {
    setScrollOccured(!scrollOccured);
  }

  const router = useRouter();
  const hdfs_path = router.query.path;
  useEffect(() => {
    if (hdfs_path) {
      setHdfsPath(hdfs_path);
      getHexDataFromPath(hdfs_path); 
    }
  }, [hdfs_path]) 
  return (
    <div className="w-full h-full" ref={screenshotRef}>
      <div className="w-full h-12 bg-white flex justify-between items-center shadow px-2 border-b border-gray-100">
        <div className="font-semibold text-lg text-gray-500">
          Electronic Evidence Visualizer {hdfs_path ? ' - ' + trimString(hdfs_path) : ''}
        </div>
        <div className="flex flex-row">
          {hexData != "" && (
            <form onSubmit={searchAddress} style={{"float": "right", marginTop: '2px'}}>
                <span>Jump to: </span>
                <input
                    type="text"
                    value={jumpAddress}
                    onChange={(e) => setJumpAddress(e.target.value)}
                    placeholder={'00000000'}
                    style={{"padding": "2px",
                      "border": "1px solid",
                      "borderRadius": "5px",
                      "width": "96px",
                    }}
                    maxLength={8}
                />
                <button type="submit" style={{"background": "grey","padding": "2px 5px","color": "white","borderRadius": "5px", "marginLeft": "2px"}}>Go</button>
            </form> 
          )}
          <div>
            <span style={{'width':'24px', height:'19px', 'display': 'inline-block'}}>
              <span id="screenshotLoading" ref={screenshotLoadingRef} className={'hidden'}><CircularProgress size={'16px'} className="mr-2 mb-[-3px] ml-[8px]"/></span>
            </span>
            <button
              onClick={saveScreenshot}
              className="p-1 text-gray-400 hover:text-blue-400"
              title="Download screenshot"
            >
              <AddPhotoAlternateIcon fontSize="small" />
            </button>
          </div>
          {hdfs_path ? 
            <div>
              <button
                onClick={uploadToHdfs}
                className="p-1 text-gray-400 hover:text-blue-400"
                title="Upload screenshot to INSPECTr storage"
              >
                <CloudSyncIcon fontSize="small" />
              </button>
            </div> : ''
          }
          <div>
            <button
              onClick={onUploadButtonClicked}
              className="p-1 text-gray-400 hover:text-blue-400"
              title="Upload a file"
            >
              <DriveFolderUploadIcon fontSize="small" />
            </button>
            <input
              type="file"
              ref={dataUploadRef}
              onChange={onFilesAdded}
              hidden
            ></input>
          </div>
        </div>
      </div>
      <div className={`w-full flex flex-row mt-2 pb-2 ${style.dashboardContent}`}>
        <AnnotationContext> 
          <div className="w-2/3 h-full bg-white">
            <HexviewerComponent hexData={hexData} ref={hexViewComponentRef} screenshotLoadingRef={screenshotLoadingRef} scrollHappened={scrollHappened}/>
          </div>
          <div className="w-1/3 h-full">
            {hexData != "" && (
              <KaitaiComponent
                fileData={fileData}
                hexData={hexData}
                kaitaiData={kaitaiData}
                setLoading={setLoading}
                isHdfs={isHdfs}
                hdfsPath={hdfsPath}
                // tempHdfsFile={tempHdfsFile}
                scrollOccured={scrollOccured}
              />
            )}
          </div>
        </AnnotationContext>
      </div>

    <LoadingComponent show={loading}></LoadingComponent>
    </div>
  );
}

export default DashboardComponent;
