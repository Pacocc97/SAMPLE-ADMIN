import { createSignal, type Component } from "solid-js";

interface Task {
  id: number;
  name: string;
  checked: boolean;
}

interface EditFormProps {
  task: Task;
  updateTask: (task: Task) => void;
}

const EditForm: Component<EditFormProps> = (props) => {
  const [updatedTaskName, setUpdatedTaskName] = createSignal("");
  let dialogRef: HTMLDialogElement;

  return (
    <>
      <button onClick={() => dialogRef.showModal()}>
        {/* <HiOutlinePencilAlt
          stroke-width={2}
          class="h-14 w-14 rounded-md bg-violet-700 p-2 transition-all hover:bg-violet-900"
          width={24}
          height={24}
        /> */}
      </button>
      <dialog
        ref={dialogRef}
        onClose={() => dialogRef.close()}
        class="bg-[hsl(245,15%,10%)]rounded-md relative top-0 mx-auto  my-auto h-full w-full rounded-xl shadow-xl"
      >
        <form
          method="dialog"
          class="flex h-full w-full flex-col items-center justify-center"
          onSubmit={(e) => {
            e.preventDefault();
            props.updateTask({ ...props.task, name: updatedTaskName() });
            dialogRef.close();
          }}
        >
          <del class="text-3xl text-zinc-300/60">
            <h2 class="mb-12 text-center text-5xl text-fuchsia-700">
              {props.task.name}
            </h2>
          </del>
          <div class="relative">
            <div class="flex gap-4">
              <input
                type="text"
                value={updatedTaskName()}
                placeholder="update task"
                class="input peer placeholder-transparent"
                id="updateText"
                onInput={(e) => {
                  setUpdatedTaskName(e.currentTarget.value);
                }}
              ></input>
              <label
                for="updateText"
                class="peer-focus:text-1xl absolute -top-12 my-2 rounded-lg p-1 text-zinc-300 transition-all placeholder-shown:my-3 peer-placeholder-shown:-top-0 peer-focus:-top-12 peer-focus:mt-4 peer-focus:bg-stone-900"
              >
                Update me
              </label>
              <button>
                {/* <FaSolidSquareCheck
                  stroke-width={2}
                  height={24}
                  width={24}
                  class="h-16 w-16 text-violet-700"
                /> */}
                HOLA
              </button>
            </div>
          </div>
        </form>
      </dialog>
    </>
  );
};
export default EditForm;
