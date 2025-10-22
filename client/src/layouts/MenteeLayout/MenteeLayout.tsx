import { Outlet } from "react-router-dom";

export default function MenteeLayout() {
  return (
    <>
      <header>
        <h1>This is Mentee header</h1>
      </header>

      <main>
        <Outlet />
      </main>

      <footer>
        <h1>This is Mentee footer</h1>
      </footer>
    </>
  );
}
