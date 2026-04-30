"use client";
import React, { useEffect, useRef, useState } from "react";

interface CharacterDef {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  eyes: Array<{ cx: number; cy: number; rx: number; ry: number }>;
}

export default function PasswordCharacters({
  inputId,
  isPasswordHidden,
}: {
  inputId: string;
  isPasswordHidden: boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const lidRef = useRef<number>(isPasswordHidden ? 0 : 1); // 1 = fully closed (password shown), 0 = fully open
  const requestRef = useRef<number>(0);

  const [chars] = useState<CharacterDef[]>(() => {
    // Exact cluster placement based on user's hand-drawn blueprint
    const themeColors = ["#C8102E", "#001E62", "#FFFFFF", "#B8C2CC"];
    const characters: CharacterDef[] = [];

    const fixedDefs = [
      // Exact 7-character layout: SCALED UP (1.3x) & TALL BOSS MOVED LEFT
      // BACK ROW
      { x: 210, y: 180, w: 60, h: 145 }, // back VERY TALL (moved left)
      { x: 260, y: 180, w: 50, h: 100 }, // back medium 
      { x: 310, y: 180, w: 45, h: 115 }, // back tall 
      
      // FRONT ROW
      { x: 190, y: 180, w: 40, h: 60 },  // front far-left
      { x: 245, y: 180, w: 36, h: 46 },  // front mid-left (noticeably shorter)
      { x: 290, y: 180, w: 42, h: 74 },  // front mid-right (noticeably taller)
      { x: 340, y: 180, w: 40, h: 65 },  // front far-right
    ];

    fixedDefs.forEach(def => {
      const charColor = "#C8102E";
      
      const isGiant = def.h > 120;
      const eyeRy = isGiant ? (9 + Math.random() * 2.5) : (6 + Math.random() * 3);
      const eyeRx = eyeRy * 0.8;
      const eyeCy = def.y - def.h + eyeRy + (isGiant ? 18 : 12); // place eyes comfortably below the top curve
      const eyeCx1 = def.x + def.w * 0.3;
      const eyeCx2 = def.x + def.w * 0.7;

      characters.push({
        x: def.x,
        y: def.y,
        w: def.w,
        h: def.h,
        color: charColor,
        eyes: [
          { cx: eyeCx1, cy: eyeCy, rx: eyeRx, ry: eyeRy },
          { cx: eyeCx2, cy: eyeCy, rx: eyeRx, ry: eyeRy },
        ]
      });
    });

    // Sort by Y so front ones are drawn last
    characters.sort((a, b) => a.y - b.y);
    return characters;
  });

  useEffect(() => {
    const inputs = document.querySelectorAll("input");
    const pupils = document.querySelectorAll(".pupil-group");
    const lids = document.querySelectorAll(".eyelid") as NodeListOf<SVGEllipseElement>;

    let activeInput: HTMLInputElement | null = null;
    let isTyping = false;
    let caretPos = { x: 0, y: 0 };
    let mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const updatePupils = (targetX: number, targetY: number) => {
      if (!svgRef.current) return;
      const pt = svgRef.current.createSVGPoint();
      pt.x = targetX;
      pt.y = targetY;
      const cursorPoint = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());

      pupils.forEach((p, idx) => {
        const cx = parseFloat(p.getAttribute("data-cx") || "0");
        const cy = parseFloat(p.getAttribute("data-cy") || "0");
        const rx = parseFloat(p.getAttribute("data-rx") || "0");
        const ry = parseFloat(p.getAttribute("data-ry") || "0");

        const dx = cursorPoint.x - cx;
        const dy = cursorPoint.y - cy;
        const angle = Math.atan2(dy, dx);
        
        // limit pupil distance inside the eye
        const maxDistX = rx - 3; 
        const maxDistY = ry - 3;
        
        // approximate ellipse boundary limit
        const dist = Math.sqrt(dx*dx + dy*dy);
        const limit = Math.abs((maxDistX*maxDistY) / 
          Math.sqrt(maxDistY*maxDistY*Math.pow(Math.cos(angle), 2) + maxDistX*maxDistX*Math.pow(Math.sin(angle), 2)));
        
        const moveDist = Math.min(dist * 0.1, limit);
        const tx = Math.cos(angle) * moveDist;
        const ty = Math.sin(angle) * moveDist;

        (p as SVGGraphicsElement).setAttribute("transform", `translate(${tx}, ${ty})`);
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePos = { x: e.clientX, y: e.clientY };
      if (!isTyping) updatePupils(mousePos.x, mousePos.y);
    };

    const handleFocus = (e: Event) => { 
      isTyping = true; 
      activeInput = e.target as HTMLInputElement; 
    };
    
    const handleBlur = (e: Event) => {
      if (activeInput === e.target) {
        isTyping = false; 
        activeInput = null;
        updatePupils(mousePos.x, mousePos.y); 
      }
    };
    
    const handleInputEvent = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      caretPos = {
        x: rect.left + 10 + (target.selectionStart || 0) * 8, // rough approximation
        y: rect.top + rect.height / 2
      };
      updatePupils(caretPos.x, caretPos.y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    inputs.forEach(input => {
      input.addEventListener("focus", handleFocus);
      input.addEventListener("blur", handleBlur);
      input.addEventListener("input", handleInputEvent);
      input.addEventListener("keyup", handleInputEvent);
      input.addEventListener("click", handleInputEvent);
    });

    let targetLid = isPasswordHidden ? 0 : 1;
    const animateLids = () => {
      targetLid = isPasswordHidden ? 0 : 1;
      
      lidRef.current += (targetLid - lidRef.current) * 0.15;
      
      lids.forEach(lid => {
        const baseRy = parseFloat(lid.getAttribute("data-basery") || "0");
        const eyeCy  = parseFloat(lid.getAttribute("data-cy") || "0");
        const currentRy = baseRy * lidRef.current;
        
        lid.setAttribute("ry", currentRy.toString());
        lid.setAttribute("cy", (eyeCy - baseRy + currentRy).toString());
        lid.setAttribute("fill-opacity", lidRef.current > 0.05 ? "1" : "0");
      });

      requestRef.current = requestAnimationFrame(animateLids);
    };
    
    requestRef.current = requestAnimationFrame(animateLids);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      inputs.forEach(input => {
        input.removeEventListener("focus", handleFocus);
        input.removeEventListener("blur", handleBlur);
        input.removeEventListener("input", handleInputEvent);
        input.removeEventListener("keyup", handleInputEvent);
        input.removeEventListener("click", handleInputEvent);
      });
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [inputId, isPasswordHidden]);

  return (
    <div className="w-full flex justify-center mb-[-2px] z-0 overflow-hidden" style={{ height: "150px" }}>
      <svg
        ref={svgRef}
        viewBox="0 0 400 180"
        className="w-full h-full max-w-[400px]"
        preserveAspectRatio="xMidYMax meet"
      >
        {chars.map((c, i) => {
          const r = c.w / 2;
          const path = `M ${c.x} ${c.y} L ${c.x} ${c.y - c.h + r} A ${r} ${r} 0 0 1 ${c.x + c.w} ${c.y - c.h + r} L ${c.x + c.w} ${c.y} Z`;

          return (
            <g key={i}>
              <path
                d={path}
                fill={c.color}
              />
              {c.eyes.map((eye, eIdx) => (
                <g key={eIdx}>
                  <ellipse
                    cx={eye.cx}
                    cy={eye.cy}
                    rx={eye.rx}
                    ry={eye.ry}
                    fill="#FFF"
                    stroke="#111"
                    strokeWidth="1.5"
                  />
                  <g className="pupil-group" data-cx={eye.cx} data-cy={eye.cy} data-rx={eye.rx} data-ry={eye.ry}>
                    <ellipse
                      cx={eye.cx}
                      cy={eye.cy}
                      rx={Math.max(3, eye.rx * 0.35)}
                      ry={Math.max(3, eye.ry * 0.35)}
                      fill="#111"
                    />
                  </g>
                  {/* Eyelid (animated) */}
                  <ellipse
                    className="eyelid"
                    cx={eye.cx}
                    cy={eye.cy - eye.ry} 
                    rx={eye.rx + 0.5}
                    ry={0} // will be overwritten by JS
                    data-cy={eye.cy}
                    data-basery={eye.ry}
                    fill={c.color}
                  />
                </g>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
