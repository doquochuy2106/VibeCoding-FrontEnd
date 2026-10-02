import { useEffect, useState } from "react";
import TodoList from "./todo/todo.list";
import { toast } from 'react-toastify';

interface ITodo {
  id: number | string;
  title: string;
  completed: boolean;
}


const Home = () => {
  //hook
  const [todos, setTodos] = useState<ITodo[]>([]);

  useEffect(() => {
    fetchTodo();
  }, []);


  const fetchTodo = async () => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/todos`);
    const data = await res.json();

    setTodos(data)
  }

  const deleteTodoById = (inputId: string | number) => {
    const newTodos = todos.filter(todo => todo.id !== inputId);
    setTodos(newTodos);
    toast.success("Xóa todo thành công.")
  }

  //update
  const handleCheckedTodo = async (id: string | number, isChecked: boolean) => {
    // const newTodos = todos.map(todo =>
    //   todo.id === id ? { ...todo, completed: isChecked } : todo
    // );
    // setTodos(newTodos);

    await fetch(`${import.meta.env.VITE_BACKEND_URL}/todos/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          completed: isChecked
        })
      }
    );

    await fetchTodo();
  }

  const deleteCompleted = async () => {
    const completedTodos = todos.filter(todo => todo.completed === true);

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
    toast.success("Đã xóa tất cả todos hoàn thành.")
  }

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
      // completed={false}
      //key=value
      />
    </div>


  )
}

export default Home;
