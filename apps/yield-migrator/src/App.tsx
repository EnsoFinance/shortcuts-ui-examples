import Home from "@/components/Home";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect } from "react";
import { setApiKey } from "@/service/enso";
import Providers from "@/Providers";

function App() {
  useEffect(() => {
    setApiKey(import.meta.env.VITE_ENSO_API_KEY);
  }, []);
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Providers>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            margin: "5px",
          }}
        >
          <div />
          <ConnectButton />
        </div>
        <Home />
      </Providers>
    </div>
  );
}

export default App;
