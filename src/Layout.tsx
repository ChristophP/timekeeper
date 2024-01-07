import { type ParentComponent } from "solid-js";
import { A } from "@solidjs/router";

const linkProps = {
  class: "px-2 py-2 transition-colors",
  activeClass: "bg-white rounded text-blue-500",
  end: true,
};

const Layout: ParentComponent = (props) => {
  return (
    <>
      <header class="sticky z-40 top-0 bg-gradient-to-r from-cyan-500 to-blue-500  text-white px-6 py-4 flex items-center">
        <div class="font-serif uppercase italic text-2xl">
          <span class="text-4xl">🕒</span>
          <span class="text-4xl inline-block ml-4">T</span>imekeeper
        </div>
        <nav class="ml-auto space-x-4">
          <A href="/" {...linkProps}>
            Booking
          </A>
          <A href="/settings" {...linkProps}>
            Settings
          </A>
        </nav>
      </header>
      <main class="flex items-center justify-center">{props.children}</main>
      <footer></footer>
    </>
  );
};

export default Layout;
