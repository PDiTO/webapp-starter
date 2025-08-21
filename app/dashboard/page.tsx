"use client";
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

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
  // The `useUser()` hook is used to ensure that Clerk has loaded data about the signed in user
  const { user } = useUser();
  // The `useAuth()` hook is used to get authentication state and getToken method
  const { getToken } = useAuth();

  // Create a custom Supabase client that injects the Clerk session token into the request headers
  function createClerkSupabaseClient() {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        async accessToken() {
          return await getToken() ?? null;
        },
      }
    );
  }

  // Create a `client` object for accessing Supabase data using the Clerk token
  const client = createClerkSupabaseClient();

  // This `useEffect` will wait for the User object to be loaded before requesting
  // the tasks for the signed in user
  useEffect(() => {
    if (!user) return;

    async function loadTasks() {
      setLoading(true);
      const { data, error } = await client
        .from("tasks")
        .select()
        .order('created_at', { ascending: false });
      if (!error && data) {
        setTasks(data as Task[]);
      }
      setLoading(false);
    }

    loadTasks();
  }, [user]);

  async function createTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;
    
    // Insert task into the "tasks" database
    const { data, error } = await client
      .from("tasks")
      .insert({
        name: name.trim(),
        completed: false,
      })
      .select()
      .single();
    
    if (!error && data) {
      setTasks([data as Task, ...tasks]);
      setName("");
    }
  }

  async function toggleTask(taskId: string, completed: boolean) {
    const { error } = await client
      .from("tasks")
      .update({ completed: !completed })
      .eq('id', taskId);
    
    if (!error) {
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, completed: !completed } : task
      ));
    }
  }

  async function deleteTask(taskId: string) {
    const { error } = await client
      .from("tasks")
      .delete()
      .eq('id', taskId);
    
    if (!error) {
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  }

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <Card>
        <CardHeader>
          <CardTitle>My Tasks</CardTitle>
          <CardDescription>
            Welcome back, {user?.firstName || 'there'}! Manage your tasks below.
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
                      onCheckedChange={() => toggleTask(task.id, task.completed)}
                    />
                    <span
                      className={`flex-1 ${
                        task.completed ? 'line-through text-muted-foreground' : ''
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