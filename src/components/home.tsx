import TodoList, { type ITodoItem } from "./todo/todo-list";

const Home = () => {
  // Dữ liệu mẫu khớp 100% với giao diện trong hình bạn gửi
  const todos: ITodoItem[] = [
    { id: 1, name: "Learn React", isComplete: false },
    { id: 2, name: "Learn TypeScript", isComplete: true },
    { id: 3, name: "Build a Todo App", isComplete: false },
    { id: 4, name: "Vibe coding with hoidanit", isComplete: false },
  ];

  return (
    <div>
      <TodoList todos={todos} name={"Quốc Huy"} age={22} />
    </div>
  );
};

export default Home;
