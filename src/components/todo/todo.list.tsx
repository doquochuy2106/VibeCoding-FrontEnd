import { useState } from "react";
import "./todo.list.css";
import { toast } from 'react-toastify';

interface ITodo {
  id: number | string;
  title: string;
  completed: boolean;
}

interface IProps {
  todos: ITodo[];
  name: string;
  age: number;
  setTodos: (v: ITodo[]) => void;
  deleteTodoById: (v: string | number) => void;
  handleCheckedTodo: (id: string | number, isChecked: boolean) => void;
  deleteCompleted: () => void;
  fetchTodo: () => Promise<void>;
}

const TodoList = (props: IProps) => {
  const { todos, fetchTodo, handleCheckedTodo, deleteCompleted } = props;

  const [inputTodo, setInputTodo] = useState<string>("");

  const handleAddNew = async () => {
    if (!inputTodo) {
      toast.error("Todo không được để trống.")
      return;
    }

    //add a new todo
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/todos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: inputTodo, completed: false
      })
    });
    await fetchTodo();

    setInputTodo("");
    toast.success("Thêm mới todo thành công.")
  }

  const handleDelete = async (id: string | number) => {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/todos/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
    });
    toast.success("Xóa todo thành công.")

    await fetchTodo();
  }

  return (
    <div className="todo-container">
      <div className="todo-header">
        <h1>Todo List</h1>
        <p>Quản lý công việc của bạn mỗi ngày</p>
      </div>

      <div className="todo-add">
        <input
          value={inputTodo}
          onChange={(event) => setInputTodo(event.target.value)}
          type="text" className="todo-input" placeholder="Thêm công việc mới..."
        />
        <button className="todo-add-btn" onClick={handleAddNew}>Thêm</button>
      </div>

      {todos.length > 0 ? (
        <ul className="todo-list">
          {todos.map((todo, index) => {
            return (
              <li key={index} className={`todo-item${todo.completed ? " completed" : ""}`}>
                <input type="checkbox"
                  className="todo-checkbox"
                  checked={todo.completed} readOnly
                  onChange={(e) => handleCheckedTodo(todo.id, e.target.checked)}
                />
                <span className="todo-title">{todo.title}</span>
                <span className="todo-id-badge">#{todo.id}</span>
                <button className="todo-delete-btn"
                  onClick={() => handleDelete(todo.id)}
                >✕</button>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="todo-empty">Chưa có công việc nào</div>
      )}

      <div className="todo-footer">
        <span>{todos.filter((t) => !t.completed).length} việc chưa hoàn thành</span>
        <button className="todo-clear-btn"
          onClick={() => deleteCompleted()}
        >Xóa đã hoàn thành</button>
      </div>
    </div>
  );

}

export default TodoList;
