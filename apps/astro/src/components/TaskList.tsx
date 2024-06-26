import { createMemo } from "solid-js";

import TaskItem from "./TaskItem";

// component import
// import TaskItem from "./TaskItem";

// styles
// import styles from "./TaskList.module.css";

interface Task {
  id: number;
  name: string;
  checked: boolean;
}

interface TaskListProps {
  tasks: () => Task[];
  deleteTask: (id: number) => void;
  toggleTask: (id: number) => void;
  updateTask: (task: Task) => void;
}

const TaskList = (props: TaskListProps) => {
  // const sortedTasks = createMemo(() =>
  //   [...props.tasks()].sort((a, b) => b.id - a.id),
  // );

  return (
    <ul>
      {props.tasks().map((task) => (
        <TaskItem
          task={task}
          deleteTask={props.deleteTask}
          toggleTask={props.toggleTask}
          updateTask={props.updateTask}
        />
      ))}
    </ul>
  );
};

export default TaskList;
