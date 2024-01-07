import { type ParentComponent, type JSX } from "solid-js";

const Button: ParentComponent<
  JSX.ButtonHTMLAttributes<HTMLButtonElement> & { level?: string }
> = (props) => {
  const extraClasses: string = props.class ?? "";
  const level = () => props.level ?? "primary";
  return (
    <button
      classList={{
        btn: true,
        "btn-primary": level() === "primary",
        "btn-secondary": level() === "secondary",
        "btn-danger": level() === "danger",
        [extraClasses]: !!extraClasses,
      }}
      {...props}
    >
      {props.children}
    </button>
  );
};

export { Button };
