import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import HexRowComponent from "./HexRowComponent";
import HexRowHeaderComponent from "./HexRowHeaderComponent";
import InfiniteScroll from "react-infinite-scroller";
import HexContextMenu from "./HexContextMenu";
import AnnotationDialogComponent from "./AnnotationDialogComponent";
import { getRandomId } from "../../utils";
import { useAddAnnotation } from "../../contexts/AnnotationContext";
import { hexToDecimal } from "../../utils";

const STEP = 100;
const HexviewerComponent = forwardRef((props, ref) =>  {
  const [hexDataArray, setHexDataArray] = useState([]);
  const [limitedHexDataArray, setLimitedHexDataArray] = useState([]);
  const [open, setOpen] = useState(false);
  const [annotateContent, setAnnotateContent] = useState({});
  const addAnnotation = useAddAnnotation();
  const [hexDataView, setHexDataView] = useState()
  const rowLength = 16
  const [goToAddress, setGoToAddress] = useState('')

  useImperativeHandle(ref, () => ({
    scrollToAddress(address) {
      const addressKey = hexToDecimal(address);
      // check if an address exists
      if (!limitedHexDataArray[addressKey]) {
        const addMoreRowNo = (addressKey - limitedHexDataArray.length) + 100;
        setGoToAddress(address);
        addMoreHexRows(addMoreRowNo);
      } else {
        doActualScroll(address)
      }
    }
  }));
  const doActualScroll = (address) => {
    const element = document.getElementsByClassName(address.toLowerCase())[0];
    if (!element){
      return;
    }
    const parts = element.id.split("-");
    // Decrement the number by 3 for adjusting top padding
    let newNum = (parseInt(parts[1]) - 3);
    newNum = (newNum > -1) ? newNum: 0;
    // Return the new string in the format "row-x"
    const scrollToId = `${parts[0]}-${newNum}`;
    let element1 = document.getElementById(scrollToId);
    if (element1) {
      // Will scroll smoothly to the top of the next section
      setTimeout(() => {
        props.screenshotLoadingRef.current.style.display = 'none';
        props.scrollHappened();
        element1.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start', 
          inline: 'nearest',
        });
      }, 400);
    }
  }
  useEffect(() => {
    if (props.hexData !== "") {
      const hexRows = props.hexData.match(/.{1,32}/g);
      setHexDataArray(Array.from({length: hexRows.length}, (_, i) => i));
      let slicedArray = hexDataArray.slice(0, STEP);
      setLimitedHexDataArray(slicedArray);
      const buffer = new ArrayBuffer(hexRows.length * rowLength);
      const dataView = new DataView(buffer);
      setHexDataView(dataView);
      hexRows.forEach((row, index) => {
        for (let i = 0; i < rowLength; i++) {
          dataView.setUint8(index * rowLength + i, parseInt(row.substring(i * 2, i * 2 + 2), 16));
        }
      });
    }
  }, [props.hexData]);

  const getRowFromHexDataView = (index) => {
    const hexRow = [];
    for (let j = 0; j < rowLength; j++) {
      const hexValue = hexDataView.getUint8(index * rowLength + j).toString(16).padStart(2, '0');
      hexRow.push(hexValue);
    }
    return hexRow.join('');
  }
  const fetchMoreListItems = () => {
    addMoreHexRows(STEP);
    props.scrollHappened();
  };

  const addMoreHexRows = (step, address = null) => {
    let slicedArray = hexDataArray.slice(
      limitedHexDataArray.length,
      limitedHexDataArray.length + step
    );
    if (slicedArray.length > 0)
      setLimitedHexDataArray((prevState) => [...prevState, ...slicedArray]);
  }
  useEffect(() => {
    if (goToAddress) {
      doActualScroll(goToAddress);
      setGoToAddress('');
    }
  }, [limitedHexDataArray]); 

  const openContextMenu = (e) => {
    e.preventDefault();
  };

  const handleContainerClick = (e) => {
    e.stopPropagation();
    document.getElementById("context-menu").classList.add("context-hidden");
  };

  const handleAnnotationClick = (content) => {
    setOpen(true);
    setAnnotateContent(content);
  };

  const handleCloseButton = () => {
    setOpen(false);
  };

  const handleDoneButton = (name, desc) => {
    setOpen(false);
    const annotateItem = {
      name: name,
      description: desc,
      id: getRandomId(),
      content: annotateContent,
    };
    addAnnotation(annotateItem);
    Array.from(document.querySelectorAll(".cell-down")).forEach((el) => {
      el.classList.remove("cell-down");
    });
  };

  return (
    <div
      className={`w-full h-full overflow-y-auto relative`}
      onContextMenu={(e) => openContextMenu(e)}
      onClick={(e) => handleContainerClick(e)}
      id={`main-container`}
    >
      {props.hexData !== "" && <HexRowHeaderComponent />}
      {props.hexData !== "" && (
        <InfiniteScroll
          pageStart={0}
          loadMore={fetchMoreListItems}
          hasMore={true || false}
          loader={
            <span key={'hex-row-loading'}></span>
          }
          useWindow={false}
        >
          {limitedHexDataArray.map((item, index) => {
            return (
              <HexRowComponent
                key={`hex-row-${index}`}
                rowData={getRowFromHexDataView(index)}
                index={index}
              />
            );
          })}
        </InfiniteScroll>
      )}
      {props.hexData !== "" && (
        <HexContextMenu onAnnotationClicked={handleAnnotationClick} />
      )}
      <AnnotationDialogComponent
        onClose={handleCloseButton}
        open={open}
        onDone={handleDoneButton}
      />
    </div>
  );
});

export default HexviewerComponent;
