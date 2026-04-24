import { useState } from "react";
import { Button } from "./components/ui/button";
import { Calendar } from "./components/ui/calendar";
import { getProductLink } from "./utils/get-product-link";

const App = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="flex min-h-dvh flex-col gap-y-6 p-5 md:p-8">
      <h1 className="font-bold text-lg">Welcome to library playground!</h1>
      <p>This is the core library package for "হবে নাকি Coffee?" projects.</p>

      <div>
        <Button>Click me</Button>

        <Calendar
          captionLayout="dropdown"
          className="rounded-lg border"
          mode="single"
          onSelect={setDate}
          selected={date}
        />
        {getProductLink("leo", "example-product-slug")}
      </div>
    </div>
  );
};

export default App;
