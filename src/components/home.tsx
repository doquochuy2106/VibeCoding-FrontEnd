import { useEffect, useState, useCallback } from "react";
import TodoList from "./todo/todo.list";
import { toast } from 'react-toastify';

interface ITodo {
  id: number | string;
  title: string;
  completed: boolean;
}

const Home = () => {
  const [todos, setTodos] = useState<ITodo[]>([]);

  const fetchTodo = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/todos`);
      if (res.ok) {
        const data = await res.json();
        setTodos(data);
      }
    } catch (e) {
      console.error("fetchTodo error:", e);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/todos`);
        if (res.ok) {
          const data = await res.json();
          if (active) setTodos(data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    init();
    return () => {
      active = false;
    };
  }, []);

  const deleteTodoById = (inputId: string | number) => {
    const newTodos = todos.filter(todo => todo.id !== inputId);
    setTodos(newTodos);
    toast.success("Xóa todo thành công.");
  };

  const handleCheckedTodo = async (id: string | number, isChecked: boolean) => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/todos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          completed: isChecked
        })
      });
      await fetchTodo();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteCompleted = async () => {
    const completedTodos = todos.filter(todo => todo.completed === true);

    try {
      await Promise.all(
        completedTodos.map(todo =>
          fetch(`${import.meta.env.VITE_BACKEND_URL}/todos/${todo.id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json"
            },
          })
        )
      );
      await fetchTodo();
      toast.success("Đã xóa tất cả todos hoàn thành.");
    } catch (e) {
      console.error(e);
      toast.error("Có lỗi xảy ra khi xóa.");
    }
  };

  return (
    <div>
      <TodoList
        todos={todos}
        name={"eric"}
        age={30}
        deleteTodoById={deleteTodoById}
        setTodos={setTodos}
        handleCheckedTodo={handleCheckedTodo}
        deleteCompleted={deleteCompleted}
        fetchTodo={fetchTodo}
      />
    </div>
  );
};

export default Home;
