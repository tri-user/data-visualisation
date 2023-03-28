import { toast } from "react-toastify";
import { v4 as uuid } from 'uuid';

export const getRandomId = (len=8) => {
  const unique_id = uuid();
  return unique_id.slice(0,len);
};

export const decimalToHex = (d) => {
  let hex = Number(d).toString(16);
  hex = "00000000".substring(0, 8 - hex.length) + hex;
  return hex;
};

export const hexToDecimal = (d) => {
  const decimalNumber = parseInt(d, 16);
  const value = decimalNumber === 0 ? 0 : decimalNumber;
  return value/16;
}

export const showErrorToast = (message) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};

export const showInfoToast = (message) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};

export const showWarningToast = (message) => {
  toast.warning(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};
