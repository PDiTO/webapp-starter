"use client";

// app/tasks/page.tsx - Live task list for the signed-in user.
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ErrorToast } from "@/components/ui/error-toast";
import { Input } from "@/components/ui/input";

export default function TasksPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<Id<"tasks"> | null>(
    null
  );
  const [pendingToggleId, setPendingToggleId] = useState<Id<"tasks"> | null>(
    null
  );

  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const createTask = useMutation(api.tasks.create);
  const deleteTask = useMutation(api.tasks.remove);
  const currentUser = useQuery(api.auth.currentUser, isAuthenticated ? {} : "skip");
  const tasks = useQuery(api.tasks.list, isAuthenticated ? {} : "skip");
  const updateTask = useMutation(api.tasks.update);
  const taskList = tasks ?? [];
  const isLoading = isAuthLoading || (isAuthenticated ? tasks === undefined : false);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  async function handleCreateTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) return;

    setError(null);
    setIsCreating(true);

    try {
      await createTask({ name });
      setName("");
    } catch {
      setError("Failed to create task. Please try again.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleToggleTask(taskId: Id<"tasks">, completed: boolean) {
    setError(null);
    setPendingToggleId(taskId);

    try {
      await updateTask({ completed: !completed, taskId });
    } catch {
      setError("Failed to update task. Please try again.");
    } finally {
      setPendingToggleId(null);
    }
  }

  async function handleDeleteTask(taskId: Id<"tasks">) {
    setError(null);
    setPendingDeleteId(taskId);

    try {
      await deleteTask({ taskId });
    } catch {
      setError("Failed to delete task. Please try again.");
    } finally {
      setPendingDeleteId(null);
    }
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-start px-4 py-8">
      {error && <ErrorToast message={error} onClose={() => setError(null)} />}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>My Tasks</CardTitle>
          <CardDescription>
            {currentUser?.name || currentUser?.email || "You"} can create,
            complete, and delete tasks with live updates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="flex gap-2" onSubmit={handleCreateTask}>
            <Input
              autoFocus
              className="flex-1"
              name="name"
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a task"
              type="text"
              value={name}
            />
            <Button disabled={isCreating || !name.trim()} type="submit">
              Add Task
            </Button>
          </form>

          <div className="space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Loading tasks...</p>
              </div>
            ) : taskList.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  No tasks yet. Add your first one above.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {taskList.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50"
                  >
                    <Checkbox
                      checked={task.completed}
                      disabled={pendingToggleId === task._id}
                      onCheckedChange={() =>
                        handleToggleTask(task._id, task.completed)
                      }
                    />
                    <span
                      className={`flex-1 ${
                        task.completed
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      {task.name}
                    </span>
                    <Button
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      disabled={pendingDeleteId === task._id}
                      onClick={() => handleDeleteTask(task._id)}
                      size="icon"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
