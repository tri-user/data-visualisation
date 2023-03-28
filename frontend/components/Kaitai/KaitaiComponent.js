import dynamic from "next/dynamic";
import React, { useEffect, useState, number, useRef } from "react";
import {
  API_KAITAI,
  API_TABLE,
  COLOR_PALLETTE,
  END_POINT,
  ERROR_CODE_400,
} from "../../keys";
import style from "../../styles/dashboard.module.css";
import TemplateChooserComponent from "./TemplateChooserComponent";
import axios from "axios";
import HighlightComponent from "./HighlightComponent";
import { decimalToHex, getRandomId, showErrorToast, showInfoToast } from "../../utils";
import TabHeadingComponent from "./TabHeadingComponent";
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import AnnotationsComponent from "./AnnotationsComponent";

let DynamicReactJson = dynamic(import("react-json-view"), { ssr: false });

function KaitaiComponent(props) {
  const [kaitaiData, setKaitaiData] = useState({});
  const [highlights, setHighlights] = useState([]);
  const [selectedTab, setSelectedTab] = useState(`Highlights`);
  const [colorPalletteIndex, setColorPalletteIndex] = useState(0);
  const [occurenceIndex, setOccurenceIndex] = useState({});
  const [showExportToTable, setShowExportToTable] = useState(false);
  const lastMatchedIndex = useRef([]);
  const hexSubstr = useRef(0);

  let cpi = 0;
  
  useEffect(() => {
    Array.from(document.querySelectorAll(".highlighted")).forEach((el) => {
      el.classList.remove("highlighted");
      el.style.backgroundColor = null;
    });
    if (highlights.length > 0) {
      highlights.map((highlight) => {
        highlight.metadata.list.map((item) => {
          let element = document.getElementById(
              `hex-cell-${Math.round(item[0])}-${item[1]}`
            );
            if(element){
              element.style.backgroundColor = highlight.color;
              element.classList.add("highlighted");
              element.title = highlight.name
            }
          });
      });
    }
  }, [highlights]);

  useEffect(() => {
    paintHighlights();
  }, [props.scrollOccured]); 

  const paintHighlights = () => {
    if (highlights.length > 0) {
      highlights.map((highlight) => {
        highlight.metadata.list.map((item) => {
         let element = document.getElementById(
            `hex-cell-${Math.round(item[0])}-${item[1]}`
          );
          if(element){
            element.style.backgroundColor = highlight.color;
            element.classList.add("highlighted");
          }
        });
      });
    }
  }
  const isEmptyObject = (value) => {
    if (value === null || value === undefined) return true;
    return Object.keys(value).length === 0 && value.constructor === Object;
  };

  const onItemSelected = (e) => {
    let hexString = e.value;
    
    const pattern = /^[A-Fa-f0-9]+$/;
    const name = e.name? e.name: null;  
    if (
      pattern.test(hexString.substr(1)) &&
      typeof hexString == "string" &&
      hexString.length >= 2
    )
    addToHighlights(hexString, name);
  };

  const isHex = (value) => {
    if(!isNaN(value)){
        return false;
    }
    if (value == "ff") {
      return true;
    }
    // const hexRegex = /^0x[A-Fa-f0-9]+$/;
    const hexRegex = /[0-9A-Fa-f]{6}/g;
    return hexRegex.test(value);
  }

  const convertHex = (hex) => {
    if(!isNaN(hex)){
      let hexV = hex.toString(16);
      if (hex < 100){
        hex = hexV;
        
        if (hex == 0) {
          return "00";
        }
        if (hex.substring(0, 2) === "0x") {
          hex = hex.substring(2); 
        }
        
        // Check the length of hex value
        if (hex.length === 1) {
            return "000" + hex;
        }else if (hex.length === 2) {
          return "00" + hex;
        }
      }
      return hexV;
    }
    if (hex) {
      let hexV = new Buffer.from(hex).toString('hex'); 
      hex = hexV;  
    }
    return hex;
  }

  const addToHighlights = (bytes, name=null) => {
    const found = highlights.find((element) => {
      element.value === bytes
    });
    if (found) {
      return
    };
    setOccurenceIndex({ ...occurenceIndex, bytes: 'value' });

    let id = getRandomId();
    const highlightData = {
      id: id,
      name: name ? name : `Highlight-${id}`,
      value: bytes,
      color: getHighlightColor(),
      metadata: highlightAlgorithm(bytes),
    };
    setHighlights((prev) => [...prev, highlightData]);
    hexSubstr.current = hexSubstr.current + bytes.length;
  };

  const getHighlightColor = () => {
    const nextValue = COLOR_PALLETTE[cpi % COLOR_PALLETTE.length];
    setColorPalletteIndex(colorPalletteIndex + 1);
    cpi = cpi + 1;
    return nextValue;
  }

  const getNthIndexOf = (str, subStr, n) => {
    return str.indexOf(subStr, n + subStr.length);
    // const regex = new RegExp(subStr, 'g');
    // let match;
    // let count = 0;

    // while (count < n && (match = regex.exec(str))) {
    //   count++;
    // }
    // return match ? match.index : -1;
  };

  function findBytePosition(hexString, byteToFind, startIndex = 0) {
    let position = -1;
    let len = byteToFind.length
    for (let i = startIndex; i < hexString.length; i += 2) {
      const byte = hexString.substr(i, 2);
      if (byte === byteToFind) {
        position = i;
        break;
      } else if (byte === byteToFind.substr(0, 2) && hexString.substr(i + 2, 2) === byteToFind.substr(2, 2)) {
        position = i;
        break;
      }
    }
  
    return position;
  }
  const highlightAlgorithm = (bytes) => {
    let foundIndex = lastMatchedIndex.current.findIndex(item => item.value === bytes);
    let occurence = foundIndex !== -1 ? lastMatchedIndex.current[foundIndex].index :-bytes.length;
    let startFrom = foundIndex !== -1 ? lastMatchedIndex.current[foundIndex].index+bytes.length:0;
    
    const index = hexSubstr.current + findBytePosition(props.hexData.substring(hexSubstr.current), bytes)//props.hexData.indexOf(bytes); //
    if (foundIndex !== -1) {
      lastMatchedIndex.current[foundIndex].index = index;
    } else {
      let matchedIndex ={
        value: bytes,
        index: index
      }
      lastMatchedIndex.current = [...lastMatchedIndex.current, matchedIndex]
    }
    
    let startCol, col, startRow, row, totalLen, len;
    startCol = col = (index % 32) / 2;
    startRow = row = parseInt(index / 32);
    totalLen = len = bytes.length / 2;
    // let len;
    let list = [];
    while (len > 0) {
      list.push([row, col]);
      col += 1;
      if (col === 16) {
        col = 0;
        row += 1;
      }
      len--;
    }
    const address = decimalToHex(startRow * 16 + startCol);
    return {
      col: startCol,
      row: startRow,
      len: totalLen,
      list: list,
      address: address,
      index: index,
    };
  };

  const removeHighlights = (bytes) => {
    setHighlights((prev) => prev.filter((item) => item.value !== bytes));
  };

  const handleTemplateSelection = (template) => {
    const formData = new FormData();
    formData.append("file", props.fileData);  
    formData.append("ext", template);
    const config = {
      headers: {  
        "content-type": "multipart/form-data",
      },
    };
    getKaitaiData(formData, config);
    setHighlights([]);
  };

  const getKaitaiData = (formData, config) => {
    setKaitaiData(null)
    setHighlights([])
    lastMatchedIndex.current = []
    formData.append("isHdfs", props.isHdfs);
    formData.append("tempHdfsFile", props.hdfsPath);
    props.setLoading(true);
    hexSubstr.current = 0;
    axios
      .post(END_POINT + API_KAITAI, formData, config)
      .then((res) => {
        if (res.data["status"] === ERROR_CODE_400)
          throw JSON.stringify(res.data);
        setKaitaiData(res.data["body"]);
        props.setLoading(false);
        setShowExportToTable(true);
      })
      .catch((err) => {
        props.setLoading(false);
        showErrorToast("The file is not valid for this format");
        setShowExportToTable(false);
      });
  };
  const exportTableData = (template) => {
    const formData = new FormData();
    formData.append("file", props.fileData);  
    formData.append("ext", template);
    const config = {
      headers: {  
        "content-type": "multipart/form-data",
      },
    };
    // setKaitaiData(null)
    formData.append("isHdfs", props.isHdfs);
    formData.append("tempHdfsFile", props.hdfsPath);
    props.setLoading(true);
    axios
      .post(END_POINT + API_TABLE, formData, config)
      .then((res) => {
        if (res.data["status"] === ERROR_CODE_400)
          throw JSON.stringify(res.data);

        props.setLoading(false);
        showInfoToast("Table uploaded to the hdfs path");
      })
      .catch((err) => {
        props.setLoading(false);
        showErrorToast("There was some error");
      });
  };

  function parseHexString(hexString) {
    if (!hexString) {
      return null; // return null if hexString is null or undefined
    }
    const hexPairs = hexString.match(/.{1,2}/g); // split into pairs of characters
    if (!hexPairs) {
      return null; // return null if hexPairs is null or undefined
    }
    const charCodes = hexPairs.map((hex) => parseInt(hex, 16)); // convert each pair to its corresponding character code
    const allZeroes = hexPairs.every((hex) => hex === "00"); // check if all pairs are "00"
  
    if (allZeroes) {
      return null; // return null if all pairs are "00"
    } else if (charCodes.every((code) => code >= 48 && code <= 57)) {
      return parseInt(hexString, 16); // return a number if all character codes are in the range of ASCII digits (48-57)
    } else if (hexString.endsWith("00") && charCodes.slice(0, -1).every((code) => code >= 32 && code <= 126)) {
      return String.fromCharCode(...charCodes.slice(0, -1)); // return a string if all character codes (except the trailing "00") are printable ASCII characters (32-126)
    } else {
      return charCodes; // return a list of character codes otherwise
    }
  }

  const autoHighlight = (data) => {
    const v = (getValues(data));
    v.map(val => {
      const nameValue = JSON.stringify(parseHexString(val.value));
      const name = val.key + (nameValue.length > 70 ? nameValue.slice(0, 70) + "..." : nameValue)
      onItemSelected({'value':val.value, 'name': name})
    })
  }
  function getValues(obj, prefix = '') {
    let values = [];
    for (let key in obj) {
        if (typeof obj[key] === 'object') {
            values = values.concat(getValues(obj[key], prefix + ' [' + key + ']'));
        } else {
            let k = key;
            values.push({'key':prefix + ' ' + k + ': ', 'value':obj[key]});
        }
    }
    return values;
  }
  const handleTabClick = (tab) => {
    setSelectedTab(tab);
  };
  useEffect(() => {
    if (!isEmptyObject(kaitaiData)) {
      autoHighlight(kaitaiData);
    }
  }, [kaitaiData]);

  return (
    <div className="w-full h-full">
      <div className="w-full h-2/3">
        <div className="w-full h-16">
          <TemplateChooserComponent
            handleTemplateSelection={handleTemplateSelection}
            exportTableData={exportTableData}
            showExportToTable={showExportToTable}
          />
        </div>
        <div
          className={`w-full ${style.kaitaiContent} overflow-y-auto mt-0.5 pl-1`}
        >
          {!isEmptyObject(kaitaiData) && (
            <DynamicReactJson
              // onSelect={onItemSelected}
              src={kaitaiData}
              // onEdit={(e) => {
              //   if (e.new_value == "error") {
              //     return false;
              //   }
              // }}
            />
          )}
        </div>
      </div>
      <div className="w-full h-1/3">
      {/* <CloudSyncIcon fontSize="small" /> */}
        <TabHeadingComponent
          tabs={[`Highlights`, `Annotations`]}
          selectedTab={selectedTab}
          handleTabClick={handleTabClick}
        />
        {selectedTab === `Highlights` ? (
          <HighlightComponent
            highlights={highlights}
            setHighlights={setHighlights}
            removeHighlights={removeHighlights}
          />
        ) : (
          <AnnotationsComponent></AnnotationsComponent>
        )}
      </div>
    </div>
  );
}

export default KaitaiComponent;
