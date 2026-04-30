"use client";
import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";

export default function RedBullVision() {
  const URL = "https://teachablemachine.withgoogle.com/models/HTLz9ftH0/";
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [model, setModel] = useState<any>(null);
  const [classesCount, setClassesCount] = useState<number>(0);
  const [predictions, setPredictions] = useState<{name: string, score: number}[]>([]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Натисніть 'Старт', щоб увімкнути камеру");
  const [showDiscount, setShowDiscount] = useState(false);
  
  const reqId = useRef<number | null>(null);

  const stopCamera = () => {
    setIsRunning(false);
    if (reqId.current) cancelAnimationFrame(reqId.current);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setStatusMsg("Камеру вимкнено.");
  };

  const triggerSuccess = () => {
    stopCamera();
    setShowDiscount(true);
  };

  const startCamera = async () => {
    setShowDiscount(false);
    setPredictions([]);
    
    let loadedModel = model;
    try {
      if (!loadedModel) {
        setStatusMsg("Завантаження штучного інтелекту...");
        const tmImage = (window as any).tmImage;
        if (!tmImage) {
            setStatusMsg("Очікування бібліотек AI...");
            setTimeout(startCamera, 500);
            return;
        }

        // Add random query params so the browser never caches the old model.json
        const ts = Date.now();
        const modelURL = URL + "model.json?nocache=" + ts;
        const metadataURL = URL + "metadata.json?nocache=" + ts;

        loadedModel = await tmImage.load(modelURL, metadataURL);
        setModel(loadedModel);
        
        const count = loadedModel.getTotalClasses();
        setClassesCount(count);
        // Pre-fill predictions array
        setPredictions(Array(count).fill({name: "Завантаження...", score: 0}));
      }

      setStatusMsg("Доступ до камери...");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise<void>((resolve) => {
          videoRef.current!.onloadedmetadata = () => resolve();
        });
        videoRef.current.play();
        setStatusMsg("");
        setIsRunning(true);
      }
    } catch (e: any) {
      console.error(e);
      setStatusMsg("Помилка: " + e.message);
    }
  };

  useEffect(() => {
    if (isRunning) {
      const loop = async () => {
        if (!videoRef.current || !model || !isRunning) return;
        
        const preds = await model.predict(videoRef.current);
        const newPredictions = [];
        
        for (let i = 0; i < classesCount; i++) {
            const rawProb = preds[i].probability;
            newPredictions.push({
                name: preds[i].className,
                score: Math.round(rawProb * 100)
            });
            
            // Trigger overlay when First Class hits 99-100%
            if (i === 0 && rawProb >= 0.99) {
                triggerSuccess();
                return; // Stop processing this frame
            }
        }
        
        setPredictions([...newPredictions]);
        reqId.current = requestAnimationFrame(loop);
      };
      
      reqId.current = requestAnimationFrame(loop);
    }
    
    return () => {
      if (reqId.current) cancelAnimationFrame(reqId.current);
    };
  }, [isRunning, model, classesCount]);

  // Clean up entirely on unmount
  useEffect(() => {
      return () => {
          stopCamera();
      }
  }, []);

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
      {/* Load external TM scripts */}
      <Script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8/dist/teachablemachine-image.min.js" strategy="beforeInteractive" />

      <div className="w-full max-w-xl bg-[#161b22] rounded-2xl p-6 shadow-2xl relative">
        <h1 className="text-white text-2xl font-bold text-center mb-6">Штучний інтелект Red Bull</h1>

        {/* Video Area */}
        <div className="relative w-full aspect-[4/3] bg-black rounded-xl overflow-hidden flex items-center justify-center mb-6">
          {statusMsg && (
            <div className="absolute z-10 text-white/50 text-center px-4">{statusMsg}</div>
          )}
          
          <video 
            ref={videoRef} 
            className={`w-full h-full object-cover transition-opacity duration-300 ${isRunning && !showDiscount ? "opacity-100" : "opacity-0"}`} 
            style={{ transform: "scaleX(-1)" }} 
            playsInline 
            muted 
          />

          {/* Discount Overlay */}
          <div className={`absolute inset-0 bg-[#C8102E]/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center transition-all duration-500 z-20 ${showDiscount ? "opacity-100 pointer-events-auto scale-100" : "opacity-0 pointer-events-none scale-105"}`}>
            <h2 className="text-white text-3xl font-black leading-tight mb-4">Продовжуй свій шлях<br/>разом з Red Bull</h2>
            <p className="text-white/90 text-lg">Вам нарахована знижка 10% на перше бронювання!</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 justify-center mb-6">
          <button 
            onClick={startCamera} 
            disabled={isRunning}
            className="bg-[#f72585] text-white px-8 py-3 rounded-xl font-bold disabled:opacity-50 disabled:bg-[#30363d] transition-all hover:scale-105 active:scale-95"
          >
            Старт
          </button>
          <button 
            onClick={stopCamera} 
            disabled={!isRunning}
            className="bg-[#30363d] text-white px-8 py-3 rounded-xl font-bold disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
          >
            Стоп
          </button>
        </div>

        {/* Prediction Results */}
        <div className="space-y-4">
          <div className="text-white/60 text-sm font-medium mb-2">
            Кількість розпізнаних класів: {classesCount || "-"}
          </div>
          {predictions.map((p, idx) => (
            <div key={idx} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-sm font-bold text-white">
                <span>{p.name} {idx === 0 && <span className="text-[#f72585] ml-2">(Знижка!)</span>}</span>
                <span>{p.score}%</span>
              </div>
              <div className="w-full h-3.5 bg-[#30363d] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#7209b7] to-[#f72585] transition-all duration-100 ease-linear"
                  style={{ width: `${p.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
