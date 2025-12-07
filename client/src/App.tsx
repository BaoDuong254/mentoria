import useRoutesConfig from "@/hooks/useRoutesConfig";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const routes = useRoutesConfig();
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const loading = useAuthStore((state) => state.loading);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  if (loading) return <div>Loading...</div>;
  return (
    <>
      {routes}
      <ToastContainer
        position='top-right'
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='dark'
      />
    </>
  );
}

export default App;
