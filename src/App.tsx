import { Button } from "./components/ui/button";

const App = () => {
  return (
    <div className="flex min-h-dvh flex-col gap-y-6 p-5 md:p-8">
      <h1 className="font-bold text-lg">Welcome to library playground!</h1>
      <p>This is the core library package for "হবে নাকি Coffee?" projects.</p>

      <div>
        <Button>Click me</Button>
      </div>
    </div>
  );
};

export default App;
