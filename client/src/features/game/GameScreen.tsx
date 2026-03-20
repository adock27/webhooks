import { useGuessGame } from "./hooks/useGuessGame";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { GameBanner } from "./components/GameBanner";
import { HistoryTable } from "./components/HistoryTable";
import { JoinPanel } from "./components/JoinPanel";
import { PlayPanel } from "./components/PlayPanel";
import { StandingsTable } from "./components/StandingsTable";
import { ThemeSwitcher } from "./components/ThemeSwitcher";

export default function GameScreen() {
  const g = useGuessGame();

  const bannerVariant = g.serverError
    ? "error"
    : g.game?.won && g.game.winName
      ? "success"
      : "info";

  return (
    <>
      <a
        href="#contenido-juego"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-xl focus:bg-accent focus:px-4 focus:py-3 focus:text-app focus:shadow-lg focus:ring-2 focus:ring-fg/30"
      >
        Saltar al juego
      </a>
      <div className="min-h-dvh bg-gradient-to-b from-app via-app to-surface pb-12 pt-6 sm:pt-10">
        <main
          id="contenido-juego"
          className="mx-auto max-w-xl px-4 sm:px-5"
          tabIndex={-1}
        >
          <header className="text-center sm:text-left">
            <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted">
                  Multijugador en tiempo real
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-fg sm:text-3xl">
                  Adivina el número
                </h1>
                <p className="mx-auto mt-3 max-w-prose text-pretty text-base leading-relaxed text-muted sm:mx-0">
                  {g.rangeSummary}
                </p>
                <p className="mx-auto mt-2 max-w-prose text-pretty text-sm leading-relaxed text-muted/90 sm:mx-0">
                  {g.rangeDetail}
                </p>
              </div>
              <div className="flex shrink-0 justify-center sm:justify-end sm:pt-1">
                <ThemeSwitcher />
              </div>
            </div>
          </header>

          <ConnectionStatus wsOpen={g.wsOpen} joined={g.joined} message={g.connStatus} />

          <GameBanner
            text={g.bannerText}
            show={g.bannerShow}
            winFlash={g.winFlash}
            variant={bannerVariant}
          />

          {!g.joined && (
            <JoinPanel nick={g.nick} onNickChange={g.setNick} onJoin={g.join} wsOpen={g.wsOpen} />
          )}

          {g.joined && <StandingsTable rows={g.standings} />}

          {g.joined && (
            <PlayPanel
              joined={g.joined}
              ready={g.ready}
              game={g.game}
              canPlay={g.canPlay}
              guessValue={g.guessValue}
              onGuessChange={g.setGuessValue}
              onGuessSubmit={g.sendGuess}
              soundOn={g.soundOn}
              onSoundChange={g.setSoundOn}
              onUnlockAudio={g.unlockAudio}
              minN={g.minN}
              maxN={g.maxN}
              guessValid={g.guessValid}
              guessInRange={g.guessInRange}
            />
          )}

          <HistoryTable
            rows={g.hist}
            lastRowNew={g.lastRowNew}
            wonRound={g.game?.won}
          />
        </main>
      </div>
    </>
  );
}
