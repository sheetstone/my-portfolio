import './HUD.css';

export default function HUD({ hintVisible }) {
  return (
    <>
      <div className="hud title">
        <h1>Hong<br />Zhang</h1>
        <span>Selected Work · MMXXVI</span>
      </div>
      <div className="hud sig">— Hong Zhang</div>
      <div className={`hud hint${hintVisible ? '' : ' hidden'}`}>
        move · look<br />drag · pan<br />click · enter
      </div>
    </>
  );
}
