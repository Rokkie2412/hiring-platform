import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import closeIcon from '../../assets/close.png';
import pose1 from '../../assets/pose1.png';
import pose2 from '../../assets/pose2.png';
import chevron from '../../assets/chevron.png'
import pose3 from '../../assets/pose3.png';
import { useJobStore } from "../../store/jobStore"; // Import Zustand store

const CapturePhotoModal = ({ setter }: { setter: (value: boolean) => void }) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fingerCount, setFingerCount] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const lastCaptureTimeRef = useRef(0);
  const [isHandsReady, setIsHandsReady] = useState(false);

  // Mengambil fungsi setPhotoTemp dari Zustand store
  const { setPhotoTemp } = useJobStore();

  // 新增状态来存储捕获的图片和预览状态
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const addDebug = (msg: string) => {
    setDebugInfo(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  useEffect(() => {
    addDebug("Component mounted");
    loadAllScripts();

    return () => {
      // Cleanup function to stop camera and hands when component unmounts
      stopCamera();
      if (handsRef.current) {
        handsRef.current.close();
      }
    };
  }, []);

  // New function to stop the camera
  const stopCamera = useCallback(() => {
    if (cameraRef.current) {
      addDebug("Stopping camera...");
      try {
        cameraRef.current.stop();
        cameraRef.current = null;
        addDebug("✓ Camera stopped successfully!");
      } catch (error) {
        addDebug(`ERROR stopping camera: ${error}`);
      }
    }
  }, []);

  // Function to handle modal close
  const handleClose = useCallback(() => {
    stopCamera();
    setter(false);
  }, [setter, stopCamera]);

  const loadAllScripts = () => {
    addDebug("Starting script load...");
    const script1 = document.createElement('script');
    script1.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3/camera_utils.js';
    script1.crossOrigin = 'anonymous';
    script1.onload = () => {
      addDebug("Camera utils loaded");
      const script2 = document.createElement('script');
      script2.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/control_utils@0.6/control_utils.js';
      script2.crossOrigin = 'anonymous';
      script2.onload = () => {
        addDebug("Control utils loaded");
        const script3 = document.createElement('script');
        script3.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3/drawing_utils.js';
        script3.crossOrigin = 'anonymous';
        script3.onload = () => {
          addDebug("Drawing utils loaded");
          const script4 = document.createElement('script');
          script4.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/hands.js';
          script4.crossOrigin = 'anonymous';
          script4.onload = () => {
            addDebug("Hands loaded, waiting 1 second...");
            setTimeout(() => { initHands(); }, 1000);
          };
          script4.onerror = () => addDebug("ERROR loading hands.js");
          document.head.appendChild(script4);
        };
        script3.onerror = () => addDebug("ERROR loading drawing_utils.js");
        document.head.appendChild(script3);
      };
      script2.onerror = () => addDebug("ERROR loading control_utils.js");
      document.head.appendChild(script2);
    };
    script1.onerror = () => addDebug("ERROR loading camera_utils.js");
    document.head.appendChild(script1);
  };

  const initHands = () => {
    const w = window as any;
    addDebug(`Checking window.Hands: ${typeof w.Hands}`);
    if (typeof w.Hands === 'undefined') {
      addDebug("Hands not found, retrying in 1s...");
      setTimeout(initHands, 1000);
      return;
    }

    try {
      addDebug("Creating Hands instance...");
      const hands = new w.Hands({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/${file}`
      });

      addDebug("Setting options...");
      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      addDebug("Setting onResults callback...");
      hands.onResults((results: any) => { handleResults(results); });

      handsRef.current = hands;
      setIsHandsReady(true);
      setIsLoading(false);
      addDebug("✓ Hands initialized successfully!");

      setTimeout(() => { startCamera(); }, 500);
    } catch (error) {
      addDebug(`ERROR initializing: ${error}`);
    }
  };

  const startCamera = async () => {
    addDebug("Starting camera...");
    const w = window as any;

    if (!w.Camera || !handsRef.current || !webcamRef.current?.video) {
      addDebug("Camera utils not ready, retrying...");
      setTimeout(startCamera, 500);
      return;
    }

    try {
      const videoElement = webcamRef.current.video;
      addDebug(`Video element ready: ${videoElement.readyState}`);

      const camera = new w.Camera(videoElement, {
        onFrame: async () => {
          // 只有在不显示预览时才处理手部识别
          if (!showPreview && handsRef.current && videoElement.readyState === 4) {
            await handsRef.current.send({ image: videoElement });
          }
        },
        width: 1280,
        height: 720
      });

      cameraRef.current = camera;
      addDebug("Starting camera stream...");
      await camera.start();
      addDebug("✓ Camera started!");
    } catch (error) {
      addDebug(`ERROR starting camera: ${error}`);
    }
  };

  // --- FUNGSI BARU UNTUK MENGGAMBAR LABEL POSE ---
  const drawPoseLabel = (ctx: CanvasRenderingContext2D, poseNumber: number, boxX: number, boxY: number) => {
    const labelText = `Pose ${poseNumber}`;
    const padding = 12;
    const fontSize = 30;
    const offsetFromBox = 10;

    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textMetrics = ctx.measureText(labelText);
    const labelWidth = textMetrics.width + padding * 2;
    const labelHeight = fontSize + padding;

    const labelX = boxX;
    const labelY = boxY - offsetFromBox - labelHeight;

    ctx.fillStyle = '#00A651';
    ctx.fillRect(labelX, labelY, labelWidth, labelHeight);

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.strokeRect(labelX, labelY, labelWidth, labelHeight);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(labelText, labelX + labelWidth / 2, labelY + labelHeight / 2);
  };

  const handleResults = (results: any) => {
    // 如果正在显示预览，不处理结果
    if (showPreview) return;

    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const video = webcamRef.current?.video;
    if (!video) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const count = countFingers(results.multiHandLandmarks[0]);
      setFingerCount(count);

      const w = window as any;
      for (const landmarks of results.multiHandLandmarks) {
        let minX = 1, minY = 1, maxX = 0, maxY = 0;
        for (const landmark of landmarks) {
          minX = Math.min(minX, landmark.x);
          minY = Math.min(minY, landmark.y);
          maxX = Math.max(maxX, landmark.x);
          maxY = Math.max(maxY, landmark.y);
        }

        const width = maxX - minX;
        const height = maxY - minY;
        const padding = 0.025;
        const boxX = (minX - padding) * canvas.width;
        const boxY = (minY - padding) * canvas.height;
        const boxW = (width + 2 * padding) * canvas.width;
        const boxH = (height + 2 * padding) * canvas.height;

        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 5;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        if (count > 0 && count < 4) {
          drawPoseLabel(ctx, count, boxX, boxY);
        }

        if (w.drawConnectors && w.HAND_CONNECTIONS) {
          w.drawConnectors(ctx, landmarks, w.HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 5 });
        }
        if (w.drawLandmarks) {
          w.drawLandmarks(ctx, landmarks, { color: '#FF0000', lineWidth: 2, radius: 6 });
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

  const countFingers = (landmarks: any) => {
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
      if (count > 0) {
        setCountdown(count);
      } else {
        setCountdown(null);
        clearInterval(interval);
        capture();
      }
    }, 1000);
  };

  // 修改capture函数，捕获图片并显示预览
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setShowPreview(true);
      addDebug("📸 Photo captured!");
    }
  }, []);

  // 处理重新拍照 - 修复问题
  const handleRetake = useCallback(() => {
    addDebug("Retaking photo...");
    setCapturedImage(null);
    setShowPreview(false);
    setCountdown(null);
    setFingerCount(0);

    // 先停止相机
    stopCamera();

    // 等待一小段时间后重新启动相机
    setTimeout(() => {
      addDebug("Restarting camera after retake...");
      startCamera();
    }, 500);
  }, [stopCamera]);

  const handleSubmit = useCallback(() => {
    if (capturedImage) {
      setPhotoTemp(capturedImage);
      addDebug("✓ Photo saved to store!");

      // Tutup modal
      setter(false);
    }
  }, [capturedImage, setter, setPhotoTemp]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-auto max-w-4xl h-[90vh] flex flex-col relative border-none rounded-xl bg-white">
        <header className="flex flex-row justify-between p-6 border-b flex-shrink-0">
          <div className="flex flex-col items-start text-black">
            <p className="font-bold text-lg">Raise Your Hand to Capture</p>
            <p className="text-xs">We'll take the photo once your hand pose is detected.</p>
          </div>
          <img className='cursor-pointer w-6 h-6' src={closeIcon} alt="Close" onClick={handleClose} />
        </header>

        <div className="w-full px-6 py-4 relative overflow-auto flex-1">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/95 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-700 font-medium text-lg mb-2">Initializing Hand Detection...</p>
                <div className="text-xs text-left bg-gray-100 p-3 rounded max-w-md">{debugInfo.map((info, i) => (<div key={i} className="text-gray-600">{info}</div>))}</div>
              </div>
            </div>
          )}

          {/* 显示摄像头或预览图片 */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            {!showPreview ? (
              <>
                <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="w-full" mirrored={true} />
                <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ transform: 'scaleX(-1)' }} />
              </>
            ) : (
              <img src={capturedImage || ''} alt="Captured" className="w-full h-full object-contain" />
            )}

            {countdown && !showPreview && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                <div className="text-[200px] font-bold text-white animate-pulse">{countdown}</div>
              </div>
            )}
            {fingerCount === 3 && !countdown && !showPreview && (
              <div className="absolute top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-full text-lg font-bold animate-pulse shadow-lg">✓ READY!</div>
            )}
          </div>

          {/* 显示预览界面时的按钮 */}
          {showPreview && (
            <div className="flex justify-center mt-6 space-x-4">
              <button
                onClick={handleRetake}
                className="py-1 px-4 border border-gray-300 text-black rounded-lg font-bold cursor-pointer"
              >
                Retake photo
              </button>
              <button
                onClick={handleSubmit}
                className="py-1 px-4 bg-teal-600 text-white rounded-lg font-bold cursor-pointer"
              >
                Submit
              </button>
            </div>
          )}

          {/* 显示拍照指导 */}
          {!showPreview && (
            <div className="flex flex-col w-full text-black">
              <p className="text-xs py-4">To take a picture, follow the hand poses in the order shown below. The system will automatically capture the image once the final pose is detected.</p>
              <div className="flex flex-row justify-center items-center">
                <img className="w-14 h-14" src={pose1} />
                <img className="w-6 h-6" src={chevron} />
                <img className="w-14 h-14" src={pose2} />
                <img className="w-6 h-6" src={chevron} />
                <img className="w-14 h-14" src={pose3} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CapturePhotoModal;