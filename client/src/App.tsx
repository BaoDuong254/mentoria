import useRoutesConfig from "@/hooks/useRoutesConfig";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
function App() {
  const routes = useRoutesConfig();
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const loading = useAuthStore((state) => state.loading);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  if (loading) return <div>Loading...</div>;
  return routes;
}

export default App;
