import { useState } from "react";
import "./todo.css";

import { toast } from "react-toastify";

interface ITodos {
  id: number | string;
  title: string;
  completed: boolean;
}

interface IProps {
  todos: ITodos[];
  name?: string;
  age?: number;
  setTodos: (v: ITodos[]) => void;
  deleteAll: () => void;
  getAlltodos: () => Promise<void>;
}

const TodoList = (props: IProps) => {
  const { todos, setTodos, deleteAll, getAlltodos } = props;

  const [inputTodo, setInputTodo] = useState<string>("");

  const handleAdd = async () => {
    if (!inputTodo) {
      toast.error("Todo không được để trống.");
      return;
    }

    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/todos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: inputTodo,
        completed: false,
      }),
    });
    const data = await res.json();
    console.log("check data: ", data);

    setInputTodo("");
    await getAlltodos();

    toast.success("thêm mới todo thành công.");
  };

  const handleDelete = async (id: string | number) => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/todos/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    console.log("check data: ", data);
    await getAlltodos();
    toast.success("Xoa todo thanh cong");
  };

  const handleCheckbox = async (id: string | number, checked: boolean) => {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/todos/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        completed: checked,
      }),
    });
    await getAlltodos();
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
            const isDone = item.completed || false;

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
                  <span className="todo-item-text">{item.title}</span>
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
