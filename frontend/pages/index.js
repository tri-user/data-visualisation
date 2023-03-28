import DashboardComponent from "../components/Dashboard/DashboardComponent";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  return (
    <div className="w-full h-screen">
      <DashboardComponent />
      <ToastContainer />
    </div>
  );
}
