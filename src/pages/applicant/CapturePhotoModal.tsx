import React, { useRef, useCallback, useEffect, useState } from "react";
import Webcam from "react-webcam";
import closeIcon from '../../assets/close.png'

const CapturePhotoModal = ({ setter }: { setter: (value: boolean) => void }) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fingerCount, setFingerCount] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isHandsReady, setIsHandsReady] = useState(false);
  const handsRef = useRef<any>(null);
  const lastCaptureTimeRef = useRef(0);

  const addDebug = (msg: string) => {
    console.log(msg);
    setDebugInfo(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  useEffect(() => {
    addDebug("Component mounted");
    loadAllScripts();

    return () => {
      if (handsRef.current) {
        handsRef.current.close();
      }
    };
  }, []);

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
    if (typeof w.Hands === 'undefined') { addDebug("Hands not found, retrying in 1s..."); setTimeout(initHands, 1000); return; }
    try {
      addDebug("Creating Hands instance...");
      const hands = new w.Hands({ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/${file}` });
      addDebug("Setting options...");
      hands.setOptions({ maxNumHands: 2, modelComplexity: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
      addDebug("Setting onResults callback...");
      hands.onResults((results: any) => { handleResults(results); });
      handsRef.current = hands;
      setIsHandsReady(true);
      setIsLoading(false);
      addDebug("✓ Hands initialized successfully!");
      setTimeout(() => { startCamera(); }, 500);
    } catch (error) { addDebug(`ERROR initializing: ${error}`); }
  };

  const startCamera = async () => {
    addDebug("Starting camera...");
    const w = window as any;
    if (!w.Camera || !handsRef.current || !webcamRef.current?.video) { addDebug("Camera utils not ready, retrying..."); setTimeout(startCamera, 500); return; }
    try {
      const videoElement = webcamRef.current.video;
      addDebug(`Video element ready: ${videoElement.readyState}`);
      const camera = new w.Camera(videoElement, { onFrame: async () => { if (handsRef.current && videoElement.readyState === 4) { await handsRef.current.send({ image: videoElement }); } }, width: 1280, height: 720 });
      addDebug("Starting camera stream...");
      await camera.start();
      addDebug("✓ Camera started!");
    } catch (error) { addDebug(`ERROR starting camera: ${error}`); }
  };

  // --- FUNGSI BARU UNTUK MENGGAMBAR LABEL POSE ---
  const drawPoseLabel = (ctx: CanvasRenderingContext2D, poseNumber: number, boxX: number, boxY: number) => {
    const labelText = `Pose ${poseNumber}`;
    const padding = 12; // Padding dalam label
    const fontSize = 30;
    const offsetFromBox = 10; // Jarak dari kotak ke label

    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Ukur teks untuk mendapatkan lebar
    const textMetrics = ctx.measureText(labelText);
    const labelWidth = textMetrics.width + padding * 2;
    const labelHeight = fontSize + padding;

    // Hitung posisi label
    const labelX = boxX; // Sejajarkan dengan tepi kiri kotak
    const labelY = boxY - offsetFromBox - labelHeight;

    // Gambar latar belakang label
    ctx.fillStyle = '#00A651'; // Warna hijau yang mirip dengan gambar
    ctx.fillRect(labelX, labelY, labelWidth, labelHeight);

    // Gambar border label
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.strokeRect(labelX, labelY, labelWidth, labelHeight);

    // Gambar teks
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(labelText, labelX + labelWidth / 2, labelY + labelHeight / 2);
  };

  const handleResults = (results: any) => {
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
        // --- MODIFIKASI: Hitung koordinat kotak di sini ---
        let minX = 1, minY = 1, maxX = 0, maxY = 0;
        for (const landmark of landmarks) { minX = Math.min(minX, landmark.x); minY = Math.min(minY, landmark.y); maxX = Math.max(maxX, landmark.x); maxY = Math.max(maxY, landmark.y); }
        const width = maxX - minX; const height = maxY - minY;
        const padding = 0.025;
        const boxX = (minX - padding) * canvas.width;
        const boxY = (minY - padding) * canvas.height;
        const boxW = (width + 2 * padding) * canvas.width;
        const boxH = (height + 2 * padding) * canvas.height;

        // Gambar kotak pembatas
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 5;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        // --- GAMBAR LABEL POSE DI SINI ---
        if (count > 0 && count < 4) {
          drawPoseLabel(ctx, count, boxX, boxY);
        }

        // Gambar landmark dan koneksi
        if (w.drawConnectors && w.HAND_CONNECTIONS) { w.drawConnectors(ctx, landmarks, w.HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 5 }); }
        if (w.drawLandmarks) { w.drawLandmarks(ctx, landmarks, { color: '#FF0000', lineWidth: 2, radius: 6 }); }
      }

      const now = Date.now();
      if (count === 3 && !countdown && now - lastCaptureTimeRef.current > 4000) { startCountdown(); lastCaptureTimeRef.current = now; }
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

  const startCountdown = () => { let count = 3; setCountdown(count); const interval = setInterval(() => { count--; if (count > 0) { setCountdown(count); } else { setCountdown(null); clearInterval(interval); capture(); } }, 1000); };
  const capture = useCallback(() => { const imageSrc = webcamRef.current?.getScreenshot(); console.log("Captured image:", imageSrc); addDebug("📸 Photo captured!"); }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-auto max-w-4xl h-[90vh] flex flex-col relative border-none rounded-xl bg-white">
        <header className="flex flex-row justify-between p-6 border-b flex-shrink-0">
          <div className="flex flex-col items-start text-black">
            <p className="font-bold text-lg">Raise Your Hand to Capture</p>
            <p className="text-xs">Show 3 fingers to trigger auto-capture</p>
            {isHandsReady && <span className="text-green-600 text-xs mt-1">✓ Hand detection ready</span>}
          </div>
          <img className='cursor-pointer w-6 h-6' src={closeIcon} alt="Close" onClick={() => setter(false)} />
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

          <div className="relative bg-black rounded-lg overflow-hidden">
            <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="w-full" mirrored={true} />
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ transform: 'scaleX(-1)' }} />

            {/* LABEL POSE LAMA SUDAH DIHAPUS KARENA SEKARANG DIGAMBAR DI KANVAS */}

            {countdown && (<div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10"><div className="text-[200px] font-bold text-white animate-pulse">{countdown}</div></div>)}
            <div className="absolute top-4 left-4 bg-black/90 backdrop-blur-sm rounded-lg px-5 py-3 border-2 border-yellow-400"><p className="text-white text-lg font-bold">Fingers: <span className="text-4xl text-yellow-300 ml-2">{fingerCount}</span></p></div>
            {fingerCount === 3 && !countdown && (<div className="absolute top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-full text-lg font-bold animate-pulse shadow-lg">✓ READY!</div>)}
          </div>

          <button onClick={capture} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all text-lg">📸 Manual Capture</button>
          <div className="mt-4 bg-blue-50 rounded-lg p-4 border-2 border-blue-300"><h3 className="font-bold mb-2 text-blue-900">💡 Tips:</h3><ul className="text-blue-700 text-sm space-y-1"><li>✋ Show your palm clearly to the camera</li><li>🖐️ Make sure lighting is good</li><li>3️⃣ Raise index, middle, and ring fingers</li><li>⏱️ Hold steady for 3 seconds</li></ul></div>
          <div className="mt-3 bg-gray-100 rounded p-3 text-xs font-mono max-h-32 overflow-auto"><div className="font-bold mb-1">Debug Log:</div>{debugInfo.map((info, i) => (<div key={i} className="text-gray-700">{info}</div>))}</div>
        </div>
      </div>
    </div>
  );
};

export default CapturePhotoModal;