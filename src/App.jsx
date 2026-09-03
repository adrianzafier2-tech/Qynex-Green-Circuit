import Game from './game/Game';

/**
 * QYNEX: Green Circuit standalone entry point.
 *
 * This build does not require Base44 authentication, routing, or backend services.
 * Game progress is stored locally in the browser by GameContext.
 */
export default function App() {
  return <Game />;
}
