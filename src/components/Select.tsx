import { type ParentComponent, type JSX } from "solid-js";

const Select: ParentComponent<JSX.SelectHTMLAttributes<HTMLSelectElement>> = (
  props,
) => {
  const extraClasses: string = props.class ?? "";
  return (
    <select
      classList={{ select: true, [extraClasses]: !!extraClasses }}
      {...props}
    >
      {props.children}
    </select>
  );
};

export { Select };
