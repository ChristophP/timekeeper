import { type ParentComponent, type JSX, createEffect } from "solid-js";

const Dialog: ParentComponent<
  JSX.DialogHtmlAttributes<HTMLDialogElement> & {
    extraClasses?: string;
    isOpen: boolean;
  }
> = (props) => {
  // const extraClasses: string = props.class ?? "";

  let dialog: HTMLDialogElement;

  const onClose = () => dialog.close();

  createEffect(() => {
    if (props.isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  });

  const extraClasses = props.extraClasses ?? "";
  return (
    <dialog
      // @ts-expect-error: Use before assignment is ok
      ref={dialog}
      classList={{
        dialog: true,
        [extraClasses]: true,
      }}
      {...props}
    >
      <button
        class="text-3xl absolute right-0 top-0 mt-2 mr-2"
        onClick={onClose}
      >
        ×
      </button>
      {props.children}
    </dialog>
  );
};

export { Dialog };
