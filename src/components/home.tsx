import { useEffect, useState } from "react";
import TodoList from "./todo/todo-list";
import { toast } from "react-toastify";

interface ITodos {
  id: number | string;
  title: string;
  completed: boolean;
}

const Home = () => {
  const [todos, setTodos] = useState<ITodos[]>([]);

  useEffect(() => {
    getAlltodos();
  }, []);

  const getAlltodos = async () => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/todos`);
    const data = await res.json();
    console.log("check data: ", data);
    setTodos(data);
  };

  const deleteAll = async () => {
    const completedTodos = todos.filter((todo) => todo.completed === true);

    if (completedTodos.length === 0) {
      toast.info("Không có todo nào đã hoàn thành để xóa.");
      return;
    }

    try {
      await Promise.all(
        completedTodos.map((todo) =>
          fetch(`${import.meta.env.VITE_BACKEND_URL}/todos/${todo.id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }),
        ),
      );

      await getAlltodos();
      toast.success("Xóa các todo đã hoàn thành thành công.");
    } catch (error) {
      console.error("Lỗi khi xóa todo: ", error);
      toast.error("Có lỗi xảy ra khi xóa todo.");
    }
  };

  return (
    <div>
      <TodoList
        todos={todos}
        setTodos={setTodos}
        name={"Quốc Huy"}
        age={22}
        deleteAll={deleteAll}
        getAlltodos={getAlltodos}
      />
    </div>
  );
};

export default Home;
