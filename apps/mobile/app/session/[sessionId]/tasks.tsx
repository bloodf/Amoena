import { useLocalSearchParams } from "expo-router";

import { TasksScreen } from "@/screens/tasks-screen";

export default function TasksRoute() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  return <TasksScreen sessionId={sessionId} />;
}
