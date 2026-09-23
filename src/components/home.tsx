import { useState } from "react";
import TodoList from "./todo/todo-list";
import { toast } from "react-toastify";

interface ITodos {
  id: number | string;
  name: string;
  isComplete: boolean;
}

const Home = () => {
  const [todos, setTodos] = useState<ITodos[]>([]);

  const deleteTodo = (id: string | number) => {
    let newTodos = todos.filter((todo) => todo.id !== id);
    setTodos(newTodos);
  };

  const checkedTodo = (id: string | number, checked: boolean) => {
    let newTodosChecked = todos.map((todo) =>
      todo.id == id ? { ...todo, isComplete: checked } : todo,
    );
    setTodos(newTodosChecked);
  };

  const deleteAll = () => {
    let newTodos = todos.filter((todo) => todo.isComplete == false);
    setTodos(newTodos);
    toast.success("Xóa toàn bộ Todo thành công ");
  };

  return (
    <div>
      <TodoList
        todos={todos}
        setTodos={setTodos}
        name={"Quốc Huy"}
        age={22}
        deleteTodo={deleteTodo}
        checkedTodo={checkedTodo}
        deleteAll={deleteAll}
      />
    </div>
  );
};

export default Home;
