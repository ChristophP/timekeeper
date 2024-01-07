import { type ParentComponent, type JSX } from "solid-js";

const Box: ParentComponent<
  JSX.HTMLAttributes<HTMLDivElement> & { level: "info" | "warn" | "danger" }
> = (props) => {
  const extraClasses: string = props.class ?? "";
  const level = () => props.level ?? "info";
  return (
    <div
      classList={{
        box: true,
        "box-info": level() === "info",
        "box-warning": level() === "warn",
        "box-danger": level() === "danger",
        [extraClasses]: !!extraClasses,
      }}
      {...props}
    >
      {props.children}
    </div>
  );
};

export { Box };
