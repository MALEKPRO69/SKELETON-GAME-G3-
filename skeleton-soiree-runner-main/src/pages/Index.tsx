import { Helmet } from 'react-helmet';
import Game from '@/components/game/Game';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Calavera Run - Day of the Dead Runner Game</title>
        <meta name="description" content="Play Calavera Run, a Day of the Dead themed skeleton runner game. Jump on enemies, collect green souls, and survive as long as you can!" />
      </Helmet>
      <main className="min-h-screen bg-background">
        <Game />
      </main>
    </>
  );
};

export default Index;
