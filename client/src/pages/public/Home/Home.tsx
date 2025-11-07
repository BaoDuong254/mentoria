import { useAuthStore } from "@/store/useAuthStore";
function Home() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  if (loading) return <p>Loading...</p>;
  return <>{user ? <h2>Hello, {user.last_name}</h2> : <h2>Hello, World</h2>}</>;
}
