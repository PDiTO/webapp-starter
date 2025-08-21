"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ErrorToast } from "@/components/ui/error-toast";

interface Task {
  id: string;
  name: string;
  completed: boolean;
  created_at: string;
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { user } = useUser();
  const { getToken } = useAuth();

  // Keep the latest getToken in a ref so the client doesn't need to change
  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  // Create ONE stable Supabase client. It asks Clerk for a fresh token per request.
  const client = useMemo(() => {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        // If your supabase-js version supports this:
        accessToken: async () => (await getTokenRef.current?.()) ?? null,

        // If not, alternative approach:
        // global: {
        //   fetch: async (url, options) => {
        //     const token = await getTokenRef.current?.();
        //     const headers = new Headers(options?.headers);
        //     if (token) headers.set("Authorization", `Bearer ${token}`);
        //     return fetch(url, { ...options, headers });
        //   },
        // },
      }
    );
  }, []); // <-- stable forever

  // Fetch tasks when the signed-in user changes
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      const { data, error } = await client
        .from("tasks")
        .select()
        .order("created_at", { ascending: false });

      if (!cancelled) {
        if (!error && data) setTasks(data as Task[]);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, client]); // client is stable; re-run only when user id changes

  async function createTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const newTask: Task = {
      id: tempId,
      name: name.trim(),
      completed: false,
      created_at: new Date().toISOString(),
    };

    // Optimistic update
    setTasks((prev) => [newTask, ...prev]);
    setName("");

    // Make API call
    const { data, error } = await client
      .from("tasks")
      .insert({ name: newTask.name, completed: false })
      .select()
      .single();

    if (error) {
      // Rollback on error
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
      setName(newTask.name);
      setError("Failed to create task. Please try again.");
    } else if (data) {
      // Replace temp task with real one
      setTasks((prev) =>
        prev.map((t) => (t.id === tempId ? (data as Task) : t))
      );
    }
  }

  async function toggleTask(taskId: string, completed: boolean) {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !completed } : t))
    );

    // Make API call
    const { error } = await client
      .from("tasks")
      .update({ completed: !completed })
      .eq("id", taskId);

    if (error) {
      // Rollback on error
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed } : t))
      );
      setError("Failed to update task. Please try again.");
    }
  }

  async function deleteTask(taskId: string) {
    // Store task for potential rollback
    const taskToDelete = tasks.find((t) => t.id === taskId);
    if (!taskToDelete) return;

    // Optimistic update
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    // Make API call
    const { error } = await client.from("tasks").delete().eq("id", taskId);

    if (error) {
      // Rollback on error
      setTasks((prev) => {
        const newTasks = [...prev];
        const originalIndex = tasks.findIndex((t) => t.id === taskId);
        newTasks.splice(originalIndex, 0, taskToDelete);
        return newTasks;
      });
      setError("Failed to delete task. Please try again.");
    }
  }

  return (
    <div className="container mx-auto max-w-2xl p-4">
      {error && <ErrorToast message={error} onClose={() => setError(null)} />}
      <Card>
        <CardHeader>
          <CardTitle>My Tasks</CardTitle>
          <CardDescription>
            Welcome back, {user?.firstName || "there"}! Manage your tasks below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={createTask} className="flex gap-2">
            <Input
              autoFocus
              type="text"
              name="name"
              placeholder="Enter new task"
              onChange={(e) => setName(e.target.value)}
              value={name}
              className="flex-1"
            />
            <Button type="submit" disabled={!name.trim()}>
              Add Task
            </Button>
          </form>

          <div className="space-y-2">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Loading tasks...</p>
              </div>
            )}

            {!loading && tasks.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No tasks yet. Create your first task above!
                </p>
              </div>
            )}

            {!loading && tasks.length > 0 && (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() =>
                        toggleTask(task.id, task.completed)
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
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTask(task.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
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
