"use client";

import ReactDOM from "react-dom";
import { useEffect, useState, ReactNode } from "react";

interface ModalProps {
  children: ReactNode;
}

export default function Modal({ children }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) return null;

  return ReactDOM.createPortal(
    <>
      <div className="modal--backdrop"></div>
      <div className="modal--container">{children}</div>
    </>,
    portalRoot
  );
}
