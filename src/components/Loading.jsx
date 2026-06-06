import './Loading.css';

export default function Loading({ visible }) {
  return (
    <div className={`loading${visible ? '' : ' hide'}`}>
      cutting the paper
    </div>
  );
}
