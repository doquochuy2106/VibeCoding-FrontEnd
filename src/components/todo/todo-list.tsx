import { useState } from "react";
import { toast } from "react-toastify";
import { Plus, Trash2, ListTodo, CheckCircle2, CircleDashed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

interface ITodos {
  id: number | string;
  title: string;
  completed: boolean;
}

interface IProps {
  todos: ITodos[];
  name?: string;
  age?: number;
  setTodos?: (v: ITodos[]) => void;
  deleteAll: () => void;
  getAlltodos: () => Promise<void>;
}

const TodoList = (props: IProps) => {
  const { todos, deleteAll, getAlltodos } = props;
  const [inputTodo, setInputTodo] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const completedCount = todos.filter((t) => t.completed).length;

  const handleAdd = async () => {
    const trimmed = inputTodo.trim();
    if (!trimmed) {
      toast.error("Todo không được để trống.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: trimmed,
          completed: false,
        }),
      });

      if (!res.ok) throw new Error("Thêm thất bại");

      setInputTodo("");
      await getAlltodos();
      toast.success("Thêm mới todo thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra khi thêm todo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/todos/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Xóa thất bại");
      await getAlltodos();
      toast.success("Xóa todo thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra khi xóa todo.");
    }
  };

  const handleCheckbox = async (id: string | number, checked: boolean) => {
    try {
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
    } catch (err) {
      console.error(err);
      toast.error("Không thể cập nhật trạng thái todo.");
    }
  };

  return (
    <Card className="w-full shadow-lg border-border/80 bg-card/90 backdrop-blur-sm transition-all duration-200">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ListTodo className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">
                Danh sách công việc
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Theo dõi và hoàn thành các nhiệm vụ hằng ngày
              </CardDescription>
            </div>
          </div>

          <Badge variant="secondary" className="px-2.5 py-1 text-xs font-semibold">
            {completedCount}/{todos.length} Đã xong
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Form Add Todo */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAdd();
          }}
          className="flex gap-2"
        >
          <Input
            type="text"
            placeholder="Thêm công việc mới..."
            value={inputTodo}
            onChange={(e) => setInputTodo(e.target.value)}
            disabled={isSubmitting}
            className="flex-1 focus-visible:ring-primary"
          />
          <Button
            type="submit"
            disabled={isSubmitting || !inputTodo.trim()}
            className="gap-1.5 shadow-xs font-medium cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm</span>
          </Button>
        </form>

        {/* Todo Items List */}
        <div className="divide-y divide-border/50 rounded-lg border border-border/70 overflow-hidden bg-background/50">
          {todos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <CircleDashed className="h-10 w-10 text-muted-foreground/50 mb-3 animate-spin duration-3000" />
              <p className="text-sm font-medium text-foreground">
                Chưa có công việc nào
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Hãy nhập công việc của bạn vào ô trên để bắt đầu
              </p>
            </div>
          ) : (
            todos.map((item, index) => {
              const isDone = item.completed || false;

              return (
                <div
                  key={item.id}
                  className={`group flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40 ${
                    isDone ? "bg-muted/20" : ""
                  }`}
                >
                  <label className="flex flex-1 items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={(e) => handleCheckbox(item.id, e.target.checked)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary"
                    />
                    <span
                      className={`text-sm font-medium transition-all ${
                        isDone
                          ? "line-through text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {item.title}
                    </span>
                  </label>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-[11px] px-2 py-0.5 text-muted-foreground font-mono"
                    >
                      #{index + 1}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                      title="Xóa công việc"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Xóa</span>
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-border/50 pt-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
          {completedCount > 0
            ? `${completedCount} công việc đã hoàn thành`
            : "Chưa hoàn thành công việc nào"}
        </span>

        {completedCount > 0 && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={deleteAll}
            className="text-xs h-8 cursor-pointer"
          >
            Xóa đã hoàn thành
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TodoList;
