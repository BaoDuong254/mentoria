import { Outlet } from "react-router-dom";

export default function MentorLayout() {
  return (
    <>
      <header>
        <h1>This is Mentor header</h1>
      </header>

      <main>
        <Outlet />
      </main>

      <footer>
        <h1>This is Mentor footer</h1>
      </footer>
    </>
  );
}
