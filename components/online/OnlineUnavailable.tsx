export function OnlineUnavailable({ message }: { message: string }) {
  return (
    <div className="card error">
      <b>En red no se puede</b>
      <p>{message}</p>
    </div>
  );
}
