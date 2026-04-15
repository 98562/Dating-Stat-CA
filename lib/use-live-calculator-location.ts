"use client";

import { useEffect, useState } from "react";

function readLocationState() {
  if (typeof window === "undefined") {
    return {
      pathname: "",
      query: ""
    };
  }

  return {
    pathname: window.location.pathname,
    query: window.location.search.replace(/^\?/, "")
  };
}

export function useLiveCalculatorLocation() {
  const [state, setState] = useState(readLocationState);

  useEffect(() => {
    const update = () => setState(readLocationState());

    update();
    window.addEventListener("popstate", update);
    window.addEventListener("calculator:filters-sync", update as EventListener);

    return () => {
      window.removeEventListener("popstate", update);
      window.removeEventListener("calculator:filters-sync", update as EventListener);
    };
  }, []);

  return state;
}
