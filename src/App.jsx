import { useRef, useState, useEffect, useCallback } from 'react';
import { SceneManager } from './three/SceneManager.js';
import { PROJECTS } from './data/projects.js';
import HUD from './components/HUD.jsx';
import InfoCard from './components/InfoCard.jsx';
import Loading from './components/Loading.jsx';
import ShapeControls from './components/ShapeControls.jsx';
import './App.css';

export default function App() {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const [focused, setFocused] = useState(-1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mgr = new SceneManager(canvasRef.current);
    sceneRef.current = mgr;
    mgr.onFocusChange = setFocused;

    const timer = setTimeout(() => setLoading(false), 650);
    const onResize = () => mgr.resize();
    window.addEventListener('resize', onResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
      mgr.destroy();
    };
  }, []);

  const handleBack = useCallback(() => {
    sceneRef.current?.unfocus();
  }, []);

  return (
    <>
      <canvas ref={canvasRef} id="app" />
      <HUD hintVisible={focused < 0} />
      <InfoCard
        project={focused >= 0 ? PROJECTS[focused] : null}
        index={focused}
        total={PROJECTS.length}
        onBack={handleBack}
      />
      <Loading visible={loading} />
      <ShapeControls
        onConfigChange={cfg => sceneRef.current?.recreateShapes(cfg)}
        onCardBackChange={style => sceneRef.current?.setCardBackStyle(style)}
      />
    </>
  );
}
