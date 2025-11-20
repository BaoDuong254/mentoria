import useRoutesConfig from "@/hooks/useRoutesConfig";
import { useMenteeStore } from "@/store/useMenteeStore";
import { useEffect } from "react";
function App() {
  const routes = useRoutesConfig();
  const fetchUser = useMenteeStore((state) => state.fetchUser);
  const loading = useMenteeStore((state) => state.loading);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  if (loading) return <div>Loading...</div>;
  return routes;
}

export default App;
