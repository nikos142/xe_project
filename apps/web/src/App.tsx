import { RouterProvider } from "react-router-dom";
import router from "./app/Router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./styles/styles.css";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
