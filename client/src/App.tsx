import useRoutesConfig from "@/hooks/useRoutesConfig";
import { AuthProvider } from "./contexts/Auth/AuthProvider";
function App() {
  const routes = useRoutesConfig();
  return <AuthProvider>{routes}</AuthProvider>;
}

export default App;
