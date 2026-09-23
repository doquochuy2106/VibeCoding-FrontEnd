import { useState } from "react";
import "./todo.css";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";

interface ITodos {
  id: number | string;
  name: string;
  isComplete: boolean;
}

interface IProps {
  todos: ITodos[];
  name?: string;
  age?: number;
  setTodos: (v: ITodos[]) => void;
  deleteTodo: (v: string | number) => void;
  checkedTodo: (id: string | number, checked: boolean) => void;
  deleteAll: () => void;
}

const TodoList = (props: IProps) => {
  const { todos, setTodos, deleteTodo, checkedTodo, deleteAll } = props;

  const [inputTodo, setInputTodo] = useState<string>("");

  const handleAdd = () => {
    if (!inputTodo) {
      toast.error("Todo không được để trống.");
      return;
    }
    setTodos([...todos, { id: uuidv4(), name: inputTodo, isComplete: false }]);
    setInputTodo("");
    toast.success("thêm mới todo thành công.");
  };

  const handleDelete = (id: string | number) => {
    deleteTodo(id);
    toast.success("xóa todo thành công");
  };

  const handleCheckbox = (id: string | number, checked: boolean) => {
    checkedTodo(id, checked);
  };

  return (
    <div className="todo-page-wrapper">
      <div className="todo-card-container">
        <div className="todo-header">
          <h1 className="todo-title">Todo List</h1>
          <p className="todo-subtitle">Quản lý công việc của bạn mỗi ngày</p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="todo-input-row">
          <input
            type="text"
            className="todo-input"
            placeholder="Thêm công việc mới..."
            value={inputTodo}
            onChange={(event) => {
              setInputTodo(event.target.value);
            }}
          />
          <button
            type="button"
            className="todo-add-btn"
            onClick={() => {
              handleAdd();
            }}
          >
            Thêm
          </button>
        </form>

        <div className="todo-items-list">
          {todos.map((item, index) => {
            const isDone = item.isComplete || false;

            return (
              <div
                key={item.id}
                className={`todo-item ${isDone ? "completed" : ""}`}
              >
                <div className="todo-item-left">
                  <input
                    type="checkbox"
                    className="todo-checkbox"
                    checked={isDone}
                    onChange={(e) => {
                      handleCheckbox(item.id, e.target.checked);
                    }}
                  />
                  <span className="todo-item-text">{item.name}</span>
                </div>

                <div className="todo-item-right">
                  <span className="todo-item-badge">#{index + 1}</span>
                  <button
                    type="button"
                    className="todo-item-delete"
                    title="Xóa công việc"
                    onClick={() => {
                      handleDelete(item.id);
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="todo-footer">
          <button
            type="button"
            className="todo-clear-completed-btn"
            onClick={() => {
              deleteAll();
            }}
          >
            Xóa đã hoàn thành
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodoList;
