import React, { createContext, useContext, useState } from "react";

const AnnotationProvider = createContext();
const AnnotationAddProvider = createContext();
const AnnotationRemoveProvider = createContext();

export function useAnnotation() {
  return useContext(AnnotationProvider);
}

export function useAddAnnotation() {
  return useContext(AnnotationAddProvider);
}

export function useRemoveAnnotation() {
  return useContext(AnnotationRemoveProvider);
}

function AnnotationContext({ children }) {
  const [annotations, setAnnotations] = useState([]);

  const addAnnotation = (value) => {
    if (!annotations.find((e) => e.content.data === value.content.data))
      setAnnotations((prev) => [...prev, value]);
  };

  const removeAnnotation = (id) => {
    setAnnotations(annotations.filter((e) => e.id !== id));
  };

  return (
    <AnnotationProvider.Provider value={annotations}>
      <AnnotationAddProvider.Provider value={addAnnotation}>
        <AnnotationRemoveProvider.Provider value={removeAnnotation}>
          {children}
        </AnnotationRemoveProvider.Provider>
      </AnnotationAddProvider.Provider>
    </AnnotationProvider.Provider>
  );
}

export default AnnotationContext;
