import { useEffect, useState } from "react";

export const isWebGLAvailable = () => {
  try {
    const canvas = document.createElement("canvas");

    // Check if WebGL context is available
    if (!window.WebGLRenderingContext) {
      return false;
    }

    // Try different context attributes
    const attributes = {
      failIfMajorPerformanceCaveat: false,
      antialias: false,
      preserveDrawingBuffer: false,
      powerPreference: "low-power",
    };

    // Try WebGL 1.0
    let ctx = canvas.getContext("webgl", attributes);
    if (ctx) {
      return true;
    }

    // Try experimental WebGL
    ctx = canvas.getContext("experimental-webgl", attributes);
    if (ctx) {
      return true;
    }

    // Try WebGL 2.0
    ctx = canvas.getContext("webgl2", attributes);
    if (ctx) {
      return true;
    }

    return false;
  } catch (e) {
    console.log("WebGL: Error creating WebGL context:", e);
    return false;
  }
};

export default function WebGLChecker() {
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    const supported = isWebGLAvailable();
    console.log("webgl output : ", supported);
    setWebGLSupported(supported);
  }, []);

  if (webGLSupported) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-4">
          WebGL Not Supported
        </h2>
        <p className="text-gray-700 mb-4">
          Your browser does not support WebGL or it is currently disabled. Some
          features of this app may not work correctly.
        </p>
        <a
          href="https://superuser.com/questions/836832/how-can-i-enable-webgl-in-my-browser"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          How to Enable WebGL
        </a>
        <p className="text-xs text-gray-500 mt-4">
          Make sure hardware acceleration is enabled in your browser settings.
        </p>
      </div>
    </div>
  );
}
