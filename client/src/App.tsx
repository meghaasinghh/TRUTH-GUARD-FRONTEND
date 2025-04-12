import { Switch, Route } from "wouter";
import Home from "@/pages/Home";
import Analysis from "@/pages/Analysis";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/analysis/:id?" component={Analysis} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <div className="bg-gray-50 text-gray-800 w-[360px] h-[500px] overflow-y-auto">
      <Router />
    </div>
  );
}

export default App;
