import { Terminal } from "./components/terminal/Terminal";
import { AppLayout } from "./components/layout/AppLayout";
import "./App.css";

function App() {
  return (
    <AppLayout projectName="Offers">
      <Terminal />
    </AppLayout>
  );
}

export default App;
