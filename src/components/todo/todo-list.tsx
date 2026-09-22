import "./todo.css";

export interface ITodoItem {
  id: number;
  name: string;
  isComplete?: boolean;
  completed?: boolean;
  description?: string;
}

interface IProps {
  todos: ITodoItem[];
  name?: string;
  age?: number;
}

const TodoList = (props: IProps) => {
  const { todos } = props;

  // Đếm số việc chưa hoàn thành (UI mockup, logic tự động theo props)
  const uncompletedCount = todos.filter(
    (item) => !(item.isComplete || item.completed)
  ).length;

  return (
    <div className="todo-page-wrapper">
      <div className="todo-card-container">
        {/* Header: Tiêu đề & Phụ đề */}
        <div className="todo-header">
          <h1 className="todo-title">Todo List</h1>
          <p className="todo-subtitle">Quản lý công việc của bạn mỗi ngày</p>
        </div>

        {/* Khung nhập công việc mới */}
        <form onSubmit={(e) => e.preventDefault()} className="todo-input-row">
          <input
            type="text"
            className="todo-input"
            placeholder="Thêm công việc mới..."
            /* 👉 Gắn value={name} và onChange={(e) => setName(e.target.value)} ở đây */
          />
          <button
            type="button"
            className="todo-add-btn"
            /* 👉 Gắn onClick={handleAddNewTodo} ở đây */
          >
            Thêm
          </button>
        </form>

        {/* Danh sách công việc */}
        <div className="todo-items-list">
          {todos.map((item, index) => {
            const isDone = item.isComplete || item.completed || false;

            return (
              <div
                key={item.id}
                className={`todo-item ${isDone ? "completed" : ""}`}
              >
                {/* Checkbox & Tên việc */}
                <div className="todo-item-left">
                  <button
                    type="button"
                    className="todo-checkbox"
                    title={isDone ? "Đánh dấu chưa xong" : "Đánh dấu đã xong"}
                    /* 👉 Gắn onClick={() => handleToggle(item.id)} ở đây */
                  >
                    {isDone && (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                  <span className="todo-item-text">{item.name}</span>
                </div>

                {/* Thứ tự & Nút xóa */}
                <div className="todo-item-right">
                  <span className="todo-item-badge">#{index + 1}</span>
                  <button
                    type="button"
                    className="todo-item-delete"
                    title="Xóa công việc"
                    /* 👉 Gắn onClick={() => handleDelete(item.id)} ở đây */
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

        {/* Footer của Card: Đếm việc chưa xong & Nút Xóa đã hoàn thành */}
        <div className="todo-footer">
          <span className="todo-uncompleted-count">
            {uncompletedCount} việc chưa hoàn thành
          </span>
          <button
            type="button"
            className="todo-clear-completed-btn"
            /* 👉 Gắn onClick={handleClearCompleted} ở đây */
          >
            Xóa đã hoàn thành
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodoList;
