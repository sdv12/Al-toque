"use client";

import App from "./App";
import { StoreProvider } from "./lib/store";

export default function Raiz() {
  return (
    <StoreProvider>
      <App />
    </StoreProvider>
  );
}
