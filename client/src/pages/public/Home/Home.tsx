import { useAuth } from "@/contexts/Auth/useAuth";
function Home() {
  const { user, loading } = useAuth();
  if (loading) return <p>Loading...</p>;
  return <>{user ? <h2>Hello, {user.user.last_name}</h2> : <h2>Hello, World</h2>}</>;
}
export default Home;
