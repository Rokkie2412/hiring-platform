import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import type { Camera } from "@mediapipe/camera_utils";

import { Loading } from '../../components/';
import closeIcon from "../../assets/close.png";
import pose1 from "../../assets/pose1.png";
import pose2 from "../../assets/pose2.png";
import pose3 from "../../assets/pose3.png";
import chevron from "../../assets/chevron.png";
import { useJobStore } from "../../store/jobStore";

import type { NormalizedLandmarkList } from './types'

declare global {
  interface Window {
    Hands?: typeof import("@mediapipe/hands").Hands;
    HAND_CONNECTIONS?: unknown;
    Camera?: typeof import("@mediapipe/camera_utils").Camera;
    drawConnectors?: (
      ctx: CanvasRenderingContext2D,
      landmarks: NormalizedLandmarkList,
      connections: unknown,
      style: { color: string; lineWidth: number }
    ) => void;
    drawLandmarks?: (
      ctx: CanvasRenderingContext2D,
      landmarks: NormalizedLandmarkList,
      style: { color: string; lineWidth: number; radius: number }
    ) => void;
  }
}

const CapturePhotoModal = ({ setter }: { setter: (value: boolean) => void }) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<InstanceType<typeof import("@mediapipe/hands").Hands> | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const lastCaptureTimeRef = useRef(0);

  const [fingerCount, setFingerCount] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const { setPhotoTemp } = useJobStore();

  const stopCamera = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
      const stream = webcamRef?.current?.video?.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, []);

  const handleClose = useCallback(() => {
    stopCamera();
    setter(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopCamera, setter, cameraRef]);

  useEffect(() => {
    loadAllScripts();
    return () => {
      stopCamera();
      handsRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopCamera]);

  const loadAllScripts = () => {
    const script1 = document.createElement("script");
    script1.src = "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3/camera_utils.js";
    script1.crossOrigin = "anonymous";
    script1.onload = () => {
      const script2 = document.createElement("script");
      script2.src = "https://cdn.jsdelivr.net/npm/@mediapipe/control_utils@0.6/control_utils.js";
      script2.crossOrigin = "anonymous";
      script2.onload = () => {
        const script3 = document.createElement("script");
        script3.src = "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3/drawing_utils.js";
        script3.crossOrigin = "anonymous";
        script3.onload = () => {
          const script4 = document.createElement("script");
          script4.src = "https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/hands.js";
          script4.crossOrigin = "anonymous";
          script4.onload = () => {
            setTimeout(initHands, 1000);
          };
          document.head.appendChild(script4);
        };
        document.head.appendChild(script3);
      };
      document.head.appendChild(script2);
    };
    document.head.appendChild(script1);
  };

  const initHands = () => {
    if (!window.Hands) {
      setTimeout(initHands, 1000);
      return;
    }

    const hands = new window.Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/${file}`,
      });

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

    hands.onResults((results) => handleResults(results));
    handsRef.current = hands;
    setIsLoading(false);
    setTimeout(startCamera, 500);

  };

  const startCamera = async () => {
    if (!window.Camera || !handsRef.current || !webcamRef.current?.video) {
      setTimeout(startCamera, 500);
      return;
    }

    const videoElement = webcamRef.current.video;
    const camera = new window.Camera(videoElement, {
      onFrame: async () => {
        if (!showPreview && handsRef.current && videoElement.readyState === 4) {
          await handsRef.current.send({ image: videoElement });
        }
      },
      width: 1280,
      height: 720,
    });

    cameraRef.current = camera;
    await camera.start();
  };

  const drawPoseLabel = (
    ctx: CanvasRenderingContext2D,
    poseNumber: number = 0,
    boxX: number,
    boxY: number,
  ) => {
    console.log(poseNumber);
    const labelText = poseNumber < 1 ? "Undetected" : `Pose ${poseNumber}`;
    const paddingX = 12;
    const paddingY = 6;
    const fontSize = 20;

    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    const textMetrics = ctx.measureText(labelText);
    const labelWidth = textMetrics.width + paddingX * 2;
    const labelHeight = fontSize + paddingY * 2;

    // posisi label: sedikit di atas kiri bounding box
    const labelX = boxX;
    const labelY = boxY - labelHeight;

    // background label
    ctx.fillStyle = poseNumber < 1 ? "#E11428" : "#008343";
    ctx.fillRect(labelX, labelY, labelWidth, labelHeight);

    // border putih di luar
    ctx.strokeStyle = poseNumber < 1 ? "#E11428" : "#008343";
    ctx.lineWidth = 2;
    ctx.strokeRect(labelX, labelY, labelWidth, labelHeight);

    // teks putih di tengah
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(labelText, labelX + paddingX, labelY + labelHeight / 2);
  };


  const handleResults = (results: { multiHandLandmarks?: NormalizedLandmarkList[] }) => {
    if (showPreview || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const video = webcamRef.current?.video;
    if (!ctx || !video) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.multiHandLandmarks?.length) {
      const count = countFingers(results.multiHandLandmarks[0]);
      setFingerCount(count);

      for (const landmarks of results.multiHandLandmarks) {
        let minX = 1,
          minY = 1,
          maxX = 0,
          maxY = 0;
        for (const landmark of landmarks) {
          minX = Math.min(minX, landmark.x);
          minY = Math.min(minY, landmark.y);
          maxX = Math.max(maxX, landmark.x);
          maxY = Math.max(maxY, landmark.y);
        }

        const padding = 0.025;
        const boxX = (minX - padding) * canvas.width;
        const boxY = (minY - padding) * canvas.height;
        const boxW = (maxX - minX + 2 * padding) * canvas.width;
        const boxH = (maxY - minY + 2 * padding) * canvas.height;

        ctx.strokeStyle = count < 1 ? "#E11428" : "#008343";
        ctx.lineWidth = 4;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        if (count < 4) {
          ctx.save();
          ctx.scale(-1, 1);
          drawPoseLabel(ctx, count, -boxX - boxW, boxY);
          ctx.restore();
        }
      }

      const now = Date.now();
      if (count === 3 && !countdown && now - lastCaptureTimeRef.current > 4000) {
        startCountdown();
        lastCaptureTimeRef.current = now;
      }
    } else {
      setFingerCount(0);
    }

    ctx.restore();
  };

  const countFingers = (landmarks: NormalizedLandmarkList) => {
    let count = 0;
    if (landmarks[4].x < landmarks[3].x - 0.05) count++;
    if (landmarks[8].y < landmarks[6].y) count++;
    if (landmarks[12].y < landmarks[10].y) count++;
    if (landmarks[16].y < landmarks[14].y) count++;
    if (landmarks[20].y < landmarks[18].y) count++;
    return count;
  };

  const startCountdown = () => {
    let count = 3;
    setCountdown(count);
    const interval = setInterval(() => {
      count--;
      if (count > 0) setCountdown(count);
      else {
        setCountdown(null);
        clearInterval(interval);
        capture();
      }
    }, 1000);
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setShowPreview(true);
    }
  }, []);

  const handleRetake = useCallback(() => {
    setCapturedImage(null);
    setShowPreview(false);
    setCountdown(null);
    setFingerCount(0);
    stopCamera();
    setTimeout(() => {
      startCamera();
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopCamera]);

  const handleSubmit = useCallback(() => {
    if (capturedImage) {
      setPhotoTemp(capturedImage);
      setter(false);
    }
  }, [capturedImage, setter, setPhotoTemp]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-auto max-w-4xl h-[90vh] flex flex-col relative rounded-xl bg-white">
        <header className="flex flex-row justify-between items-center p-6 border-b flex-shrink-0">
          <div className="flex flex-col items-start text-black">
            <p className="font-bold text-lg">Raise Your Hand to Capture</p>
            <p className="text-xs">We'll take the photo once your hand pose is detected.</p>
          </div>
          <img
            className="cursor-pointer w-6 h-6"
            src={closeIcon}
            alt="Close"
            onClick={handleClose}
          />
        </header>

        <div className="w-full px-6 py-4 relative overflow-auto flex-1">
          {isLoading && (
            <Loading text="Initializing Camera Detection..." />
          )}

          <div className="relative bg-black rounded-lg overflow-hidden">
            {!showPreview ? (
              <>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/png"
                  className="w-full"
                  mirrored
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                  style={{ transform: "scaleX(-1)" }}
                />
              </>
            ) : (
                <img
                  src={capturedImage || ""}
                  alt="Captured"
                  className="w-full h-full object-contain"
                />
            )}

            {countdown && !showPreview && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 z-10">
                <p className="text-white font-bold text-sm">Capturing photo in</p>
                <div className="text-5xl font-bold text-white animate-pulse">{countdown}</div>
              </div>
            )}

            {fingerCount === 3 && !countdown && !showPreview && (
              <div className="absolute top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-full text-lg font-bold animate-pulse shadow-lg">
                ✓ READY!
              </div>
            )}
          </div>

          {showPreview && (
            <div className="flex justify-center mt-6 mb-6 space-x-4">
              <button
                onClick={handleRetake}
                className="
                py-2 px-5 text-sm font-semibold rounded-lg border border-gray-300 text-gray-800 
                bg-white shadow-md hover:shadow-lg transition-all duration-200 
                hover:bg-gray-50 active:scale-[0.98] cursor-pointer
              "
              >
                Retake photo
              </button>
              <button
                onClick={handleSubmit}
                className="
                py-2 px-5 text-sm font-semibold rounded-lg text-white bg-teal-600 
                shadow-md hover:shadow-lg transition-all duration-200 
                hover:bg-teal-700 active:scale-[0.98] cursor-pointer
              "
              >
                Submit
              </button>
            </div>
          )}

          {!showPreview && (
            <div className="flex flex-col w-full text-black">
              <p className="text-xs py-4">
                To take a picture, follow the hand poses in the order shown below. The system will
                automatically capture the image once the final pose is detected.
              </p>
              <div className="flex flex-row justify-center items-center">
                <img className="w-14 h-14" src={pose1} alt="pose1" />
                <img className="w-6 h-6" src={chevron} alt="arrow" />
                <img className="w-14 h-14" src={pose2} alt="pose2" />
                <img className="w-6 h-6" src={chevron} alt="arrow" />
                <img className="w-14 h-14" src={pose3} alt="pose3" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CapturePhotoModal;
